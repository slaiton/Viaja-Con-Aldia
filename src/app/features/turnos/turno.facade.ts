import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Geolocation } from '@capacitor/geolocation';
import { TurnoApi } from '@domain/turno.api';
import { StorageService } from '@core/services/storage.service';
import { AlertService } from '@core/services/alert.service';
import { LocalNotificationService } from '@core/services/local-notification.service';
import { RegistroService } from '@core/services/registro.service';
import {
  Turno,
  TurnoWizardState,
  DestinoSlot,
  RegionalListItem,
  RegionalItem,
  TurnoSubmitResult
} from '@core/models/turno.model';

export const REGIONALES_ALDIA: RegionalItem[] = [
  { nombre: 'REGIONAL ARAUCA' },
  { nombre: 'REGIONAL ARMENIA' },
  { nombre: 'REGIONAL BARRANQUILLA' },
  { nombre: 'REGIONAL BOGOTA' },
  { nombre: 'REGIONAL BUCARAMANGA' },
  { nombre: 'REGIONAL BUENAVENTURA' },
  { nombre: 'REGIONAL CALI' },
  { nombre: 'REGIONAL CARTAGENA' },
  { nombre: 'REGIONAL CUCUTA' },
  { nombre: 'REGIONAL FLORENCIA' },
  { nombre: 'REGIONAL IBAGUE' },
  { nombre: 'REGIONAL IPIALES' },
  { nombre: 'REGIONAL MANIZALES' },
  { nombre: 'REGIONAL MEDELLIN' },
  { nombre: 'REGIONAL MONTERIA' },
  { nombre: 'REGIONAL NEIVA' },
  { nombre: 'REGIONAL PASTO' },
  { nombre: 'REGIONAL PEREIRA' },
  { nombre: 'REGIONAL PERU' },
  { nombre: 'REGIONAL POPAYAN' },
  { nombre: 'REGIONAL RIOHACHA' },
  { nombre: 'REGIONAL TUNJA' },
  { nombre: 'REGIONAL SANTA MARTA' },
  { nombre: 'REGIONAL VALLEDUPAR' }
];

const INITIAL_STATE: TurnoWizardState = {
  origen: null,
  isLoadingGps: false,
  errorGps: null,
  destinos: [],
  viajaVacio: 'SI',
  tipoRemolque: '',
  esArticulado: false,
  filtroBusqueda: '',
  isSubmitting: false,
  modalEnturnamientoOpen: false,
  modalSelectorDestinosOpen: false
};

@Injectable({
  providedIn: 'root'
})
export class TurnoFacade {
  private state$ = new BehaviorSubject<TurnoWizardState>(INITIAL_STATE);

  // Observables base
  readonly stateView$ = this.state$.asObservable();
  readonly origenGps$ = this.state$.pipe(map(s => s.origen));
  readonly isLoadingGps$ = this.state$.pipe(map(s => s.isLoadingGps));
  readonly errorGps$ = this.state$.pipe(map(s => s.errorGps));
  readonly destinos$ = this.state$.pipe(map(s => s.destinos));
  readonly viajaVacio$ = this.state$.pipe(map(s => s.viajaVacio));
  readonly tipoRemolque$ = this.state$.pipe(map(s => s.tipoRemolque));
  readonly esArticulado$ = this.state$.pipe(map(s => s.esArticulado));
  readonly isSubmitting$ = this.state$.pipe(map(s => s.isSubmitting));
  readonly modalEnturnamientoOpen$ = this.state$.pipe(map(s => s.modalEnturnamientoOpen));
  readonly modalSelectorDestinosOpen$ = this.state$.pipe(map(s => s.modalSelectorDestinosOpen));
  readonly filtroBusqueda$ = this.state$.pipe(map(s => s.filtroBusqueda));

  // 3 Slots de Destino (1° Preferencia, 2° Preferencia, 3° Preferencia)
  readonly slotsDestinos$: Observable<DestinoSlot[]> = this.destinos$.pipe(
    map(destinos => [
      {
        index: 0,
        label: '1° Preferencia',
        prioridad: 1,
        regional: destinos[0] || null
      },
      {
        index: 1,
        label: '2° Preferencia',
        prioridad: 2,
        regional: destinos[1] || null
      },
      {
        index: 2,
        label: '3° Preferencia',
        prioridad: 3,
        regional: destinos[2] || null
      }
    ])
  );

  // Lista calculada de las 24 regionales con filtro, estado de selección y bloqueo
  readonly regionalesCalculadas$: Observable<RegionalListItem[]> = combineLatest([
    this.destinos$,
    this.filtroBusqueda$
  ]).pipe(
    map(([destinos, query]) => {
      const q = (query || '').trim().toUpperCase();
      const cuposLlenos = destinos.length >= 3;

      return REGIONALES_ALDIA
        .filter(r => !q || r.nombre.toUpperCase().includes(q))
        .map(r => {
          const indexEnSeleccion = destinos.indexOf(r.nombre);
          const seleccionada = indexEnSeleccion !== -1;
          const prioridad = seleccionada ? indexEnSeleccion + 1 : null;
          const bloqueada = cuposLlenos && !seleccionada;

          return {
            nombre: r.nombre,
            seleccionada,
            prioridad,
            bloqueada
          };
        });
    })
  );

  // Validación para confirmar turno
  readonly canSubmit$: Observable<boolean> = this.state$.pipe(
    map(s => {
      const tieneOrigen = !!s.origen && s.origen.trim().length > 0;
      const tiene3Destinos = s.destinos.length === 3;
      const remolqueValido = !s.esArticulado || (s.tipoRemolque === 'CONTENEDOR' || s.tipoRemolque === 'PLANCHA');
      return tieneOrigen && tiene3Destinos && remolqueValido && !s.isSubmitting;
    })
  );

  // Validación para guardar destinos en modal secundario
  readonly puedeGuardarDestinos$: Observable<boolean> = this.destinos$.pipe(
    map(destinos => destinos.length === 3)
  );

  constructor(
    private turnoApi: TurnoApi,
    private storage: StorageService,
    private alert: AlertService,
    private localNoti: LocalNotificationService,
    private reg: RegistroService
  ) {}

  private get snapshot(): TurnoWizardState {
    return this.state$.getValue();
  }

  private updateState(partial: Partial<TurnoWizardState>) {
    this.state$.next({ ...this.snapshot, ...partial });
  }

  private getPlaca(): string {
    const p = this.storage.get<string>('placa') || localStorage.getItem('placa') || '';
    return String(p).replace(/^["']|["']$/g, '').trim().toUpperCase();
  }

  /**
   * Abre la Hoja de Enturnamiento (Pantalla 5).
   * Inicializa la detección GPS y verifica la tipología del vehículo.
   */
  async iniciarEnturnamiento(origenPrevio?: string) {
    this.updateState({
      modalEnturnamientoOpen: true,
      errorGps: null
    });

    if (origenPrevio && !this.snapshot.origen) {
      this.updateState({ origen: origenPrevio });
    }

    // Verificar si el vehículo es articulado para pedir tipo de remolque
    try {
      const placa = this.getPlaca();
      if (placa) {
        const vData = await this.reg.getDataVehiculo(placa);
        const tipo = vData?.data?.[0]?.tipoxxVehiculo || '';
        const esArticulado = tipo.toUpperCase() === 'ARTICULADO';
        this.updateState({ esArticulado });
      }
    } catch (e) {
      console.warn('[TurnoFacade] No fue posible verificar clase de vehículo:', e);
    }

    // Si aún no hay origen, detectar por GPS
    if (!this.snapshot.origen) {
      await this.detectarUbicacionGps();
    }
  }

  /**
   * Cierra la Hoja de Enturnamiento.
   */
  cerrarEnturnamiento() {
    this.updateState({
      modalEnturnamientoOpen: false,
      modalSelectorDestinosOpen: false
    });
  }

  /**
   * Abre el Selector de 3 Destinos (Pantalla 6).
   */
  abrirSelectorDestinos() {
    this.updateState({
      modalSelectorDestinosOpen: true,
      filtroBusqueda: ''
    });
  }

  /**
   * Cierra el Selector de 3 Destinos.
   */
  cerrarSelectorDestinos() {
    this.updateState({ modalSelectorDestinosOpen: false });
  }

  /**
   * Alterna la selección de una regional:
   * - Si ya está seleccionada: la remueve y reordena las demás.
   * - Si no está y hay cupo (< 3): la agrega con la siguiente prioridad (1°, 2° o 3°).
   * - Si no hay cupo: no hace nada.
   */
  toggleDestino(nombre: string) {
    const destinosActuales = [...this.snapshot.destinos];
    const index = destinosActuales.indexOf(nombre);

    if (index !== -1) {
      // Remover
      destinosActuales.splice(index, 1);
      this.updateState({ destinos: destinosActuales });
    } else {
      // Agregar si hay cupo
      if (destinosActuales.length < 3) {
        destinosActuales.push(nombre);
        this.updateState({ destinos: destinosActuales });
      }
    }
  }

  /**
   * Remueve un destino por su índice de prioridad (0, 1 o 2).
   */
  removerDestinoPorIndice(index: number) {
    const destinosActuales = [...this.snapshot.destinos];
    if (index >= 0 && index < destinosActuales.length) {
      destinosActuales.splice(index, 1);
      this.updateState({ destinos: destinosActuales });
    }
  }

  /**
   * Guarda los 3 destinos y cierra el modal secundario.
   */
  guardarDestinos(): boolean {
    if (this.snapshot.destinos.length === 3) {
      this.cerrarSelectorDestinos();
      return true;
    }
    return false;
  }

  /**
   * Limpia todos los destinos seleccionados.
   */
  limpiarDestinos() {
    this.updateState({ destinos: [] });
  }

  /**
   * Establece si el camión viaja vacío.
   */
  setViajaVacio(val: 'SI' | 'NO') {
    this.updateState({ viajaVacio: val });
  }

  /**
   * Establece el tipo de remolque para articulados.
   */
  setTipoRemolque(val: 'CONTENEDOR' | 'PLANCHA') {
    this.updateState({ tipoRemolque: val });
  }

  /**
   * Filtra las regionales en el modal selector.
   */
  setFiltro(query: string) {
    this.updateState({ filtroBusqueda: query });
  }

  /**
   * Detecta la ubicación GPS del dispositivo y resuelve la regional oficial vía 3SL.
   */
  async detectarUbicacionGps(): Promise<string | null> {
    this.updateState({ isLoadingGps: true, errorGps: null });

    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const zonaGpsResp = await this.turnoApi.getZonaGps(lat, lon);

      let regionalEncontrada = '';
      if (zonaGpsResp?.status && zonaGpsResp?.data?.ciudad_oigen_final) {
        regionalEncontrada = zonaGpsResp.data.ciudad_oigen_final;
      } else if (zonaGpsResp?.data?.nombre) {
        regionalEncontrada = zonaGpsResp.data.nombre;
      }

      if (regionalEncontrada) {
        this.updateState({
          origen: regionalEncontrada,
          isLoadingGps: false,
          errorGps: null
        });
        return regionalEncontrada;
      } else {
        throw new Error('No se pudo identificar una regional cercana');
      }
    } catch (err: any) {
      console.warn('[TurnoFacade] Error obteniendo GPS:', err);
      const msg = err?.message || 'GPS no disponible o desactivado';
      this.updateState({
        isLoadingGps: false,
        errorGps: msg
      });
      return null;
    }
  }

  /**
   * Envía la solicitud de enturnamiento a Aldia-Backend respetando los contratos de EnturnamientoController.
   */
  async confirmarTurno(): Promise<TurnoSubmitResult> {
    const state = this.snapshot;
    const placa = this.getPlaca();

    if (!placa) {
      return { success: false, message: 'No hay placa vinculada al conductor' };
    }

    if (!state.origen) {
      return { success: false, message: 'Debes validar tu regional de origen GPS' };
    }

    if (state.destinos.length !== 3) {
      return { success: false, message: 'Debes seleccionar exactamente tus 3 destinos de preferencia' };
    }

    if (state.esArticulado && !state.tipoRemolque) {
      return { success: false, message: 'Selecciona el tipo de remolque (Contenedor o Plancha)' };
    }

    this.updateState({ isSubmitting: true });

    // Normalizar ciudad_origen según requerimiento de backend
    const ciudadOrigenNormalizada = state.origen
      .normalize('NFD')
      .replace(/[\u0300-\u036f|.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .replace(/ +/g, '-')
      .toLowerCase();

    const payload: Turno = {
      placa: placa,
      ciudad_origen: ciudadOrigenNormalizada,
      ciudad_destino1: state.destinos[0],
      ciudad_destino2: state.destinos[1],
      ciudad_destino3: state.destinos[2],
      desacorasado: state.viajaVacio,
      estado_trailer: state.tipoRemolque || 'null',
      nuevo: false
    };

    try {
      const resp = await this.turnoApi.crearTurno(payload);
      this.updateState({
        isSubmitting: false,
        modalEnturnamientoOpen: false,
        modalSelectorDestinosOpen: false
      });

      const mensajeExito = resp?.data || '¡Enturnamiento generado exitosamente!';

      this.alert.presentAlert(
        'Turno Confirmado',
        '',
        mensajeExito,
        'Aceptar'
      );

      this.localNoti.executeNotification(
        1,
        'ENTURNAMIENTO ALDIA',
        'Turno generado con éxito',
        mensajeExito,
        ''
      );

      return { success: true, message: mensajeExito, data: resp };
    } catch (err: any) {
      this.updateState({ isSubmitting: false });
      const errorMsg = err?.error?.data || err?.message || 'Error al procesar el enturnamiento';
      
      this.alert.presentAlert(
        'Novedad en Enturnamiento',
        'No fue posible registrar el turno',
        errorMsg,
        'Entendido'
      );

      return { success: false, message: errorMsg, data: err };
    }
  }

  /**
   * Resetea el wizard al estado inicial.
   */
  resetWizard() {
    this.updateState(INITIAL_STATE);
  }
}

