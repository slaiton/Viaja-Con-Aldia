import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { PlatformGeolocationService } from '@core/platform/geolocation-platform.service';
import { TurnoApi } from '@domain/turno.api';
import { TurnoMapper, REGIONALES_ALDIA } from '@domain/turno.mapper';
import { StorageService } from '@core/services/storage.service';
import { AlertService } from '@core/services/alert.service';
import { LocalNotificationService } from '@core/services/local-notification.service';
import { RegistroService } from '@core/services/registro.service';
import {
  DestinoSlot,
  RegionalListItem,
  TurnoSubmitResult,
  TurnoWizardState
} from '@core/models/turno.model';

export { REGIONALES_ALDIA };

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
  private readonly state$ = new BehaviorSubject<TurnoWizardState>(INITIAL_STATE);

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

  readonly slotsDestinos$: Observable<DestinoSlot[]> = this.destinos$.pipe(
    map(destinos => TurnoMapper.calcularSlotsDestinos(destinos))
  );

  readonly regionalesCalculadas$: Observable<RegionalListItem[]> = combineLatest([
    this.destinos$,
    this.filtroBusqueda$
  ]).pipe(
    map(([destinos, query]) => TurnoMapper.filtrarRegionalesCalculadas(destinos, query))
  );

  readonly canSubmit$: Observable<boolean> = this.state$.pipe(
    map(s => {
      const tieneOrigen = !!s.origen && s.origen.trim().length > 0;
      const tiene3Destinos = s.destinos.length === 3;
      const remolqueValido = !s.esArticulado || (s.tipoRemolque === 'CONTENEDOR' || s.tipoRemolque === 'PLANCHA');
      return tieneOrigen && tiene3Destinos && remolqueValido && !s.isSubmitting;
    })
  );

  readonly puedeGuardarDestinos$: Observable<boolean> = this.destinos$.pipe(
    map(destinos => destinos.length === 3)
  );

  constructor(
    private readonly turnoApi: TurnoApi,
    private readonly storage: StorageService,
    private readonly alert: AlertService,
    private readonly localNoti: LocalNotificationService,
    private readonly reg: RegistroService,
    private readonly geoPlatform: PlatformGeolocationService
  ) {}

  private get snapshot(): TurnoWizardState {
    return this.state$.getValue();
  }

  private updateState(partial: Partial<TurnoWizardState>): void {
    this.state$.next({ ...this.snapshot, ...partial });
  }

  private getPlaca(): string {
    const p = this.storage.get<string>('placa') || '';
    return String(p).replace(/^["']|["']$/g, '').trim().toUpperCase();
  }

  async iniciarEnturnamiento(origenPrevio?: string): Promise<void> {
    this.updateState({ modalEnturnamientoOpen: true, errorGps: null });

    if (origenPrevio && !this.snapshot.origen) {
      this.updateState({ origen: origenPrevio });
    }

    try {
      const placa = this.getPlaca();
      if (placa) {
        const vData = await this.reg.getDataVehiculo(placa);
        const tipo = vData?.data?.[0]?.tipoxxVehiculo || '';
        this.updateState({ esArticulado: tipo.toUpperCase() === 'ARTICULADO' });
      }
    } catch {
      // Continuar con tipología por defecto
    }

    if (!this.snapshot.origen) {
      await this.detectarUbicacionGps();
    }
  }

  cerrarEnturnamiento(): void {
    this.updateState({
      modalEnturnamientoOpen: false,
      modalSelectorDestinosOpen: false
    });
  }

  abrirSelectorDestinos(): void {
    this.updateState({ modalSelectorDestinosOpen: true, filtroBusqueda: '' });
  }

  cerrarSelectorDestinos(): void {
    this.updateState({ modalSelectorDestinosOpen: false });
  }

  toggleDestino(nombre: string): void {
    const destinos = [...this.snapshot.destinos];
    const index = destinos.indexOf(nombre);

    if (index !== -1) {
      destinos.splice(index, 1);
      this.updateState({ destinos });
    } else if (destinos.length < 3) {
      destinos.push(nombre);
      this.updateState({ destinos });
    }
  }

  removerDestinoPorIndice(index: number): void {
    const destinos = [...this.snapshot.destinos];
    if (index >= 0 && index < destinos.length) {
      destinos.splice(index, 1);
      this.updateState({ destinos });
    }
  }

  guardarDestinos(): boolean {
    if (this.snapshot.destinos.length === 3) {
      this.cerrarSelectorDestinos();
      return true;
    }
    return false;
  }

  limpiarDestinos(): void {
    this.updateState({ destinos: [] });
  }

  setViajaVacio(val: 'SI' | 'NO'): void {
    this.updateState({ viajaVacio: val });
  }

  setTipoRemolque(val: 'CONTENEDOR' | 'PLANCHA'): void {
    this.updateState({ tipoRemolque: val });
  }

  setFiltro(query: string): void {
    this.updateState({ filtroBusqueda: query });
  }

  async detectarUbicacionGps(): Promise<string | null> {
    this.updateState({ isLoadingGps: true, errorGps: null });

    try {
      const position = await this.geoPlatform.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      const zonaGpsResp = await this.turnoApi.getZonaGps(
        position.coords.latitude,
        position.coords.longitude
      );

      const regional = zonaGpsResp?.status && zonaGpsResp?.data?.ciudad_oigen_final
        ? zonaGpsResp.data.ciudad_oigen_final
        : zonaGpsResp?.data?.nombre || '';

      if (regional) {
        this.updateState({ origen: regional, isLoadingGps: false, errorGps: null });
        return regional;
      }

      throw new Error('No se pudo identificar una regional cercana');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'GPS no disponible o desactivado';
      this.updateState({ isLoadingGps: false, errorGps: msg });
      return null;
    }
  }

  async confirmarTurno(): Promise<TurnoSubmitResult> {
    const state = this.snapshot;
    const placa = this.getPlaca();

    if (!placa) return { success: false, message: 'No hay placa vinculada al conductor' };
    if (!state.origen) return { success: false, message: 'Debes validar tu regional de origen GPS' };
    if (state.destinos.length !== 3) return { success: false, message: 'Debes seleccionar exactamente tus 3 destinos de preferencia' };
    if (state.esArticulado && !state.tipoRemolque) return { success: false, message: 'Selecciona el tipo de remolque (Contenedor o Plancha)' };

    this.updateState({ isSubmitting: true });
    const payload = TurnoMapper.construirTurnoPayload(state, placa);

    try {
      const resp = await this.turnoApi.crearTurno(payload);
      this.updateState({
        isSubmitting: false,
        modalEnturnamientoOpen: false,
        modalSelectorDestinosOpen: false
      });

      const mensajeExito = resp?.data || '¡Enturnamiento generado exitosamente!';
      this.alert.presentAlert('Turno Confirmado', '', mensajeExito, 'Aceptar');
      this.localNoti.executeNotification(1, 'ENTURNAMIENTO ALDIA', 'Turno generado con éxito', mensajeExito, '');
      return { success: true, message: mensajeExito, data: resp };
    } catch (err: any) {
      this.updateState({ isSubmitting: false });
      const errorMsg = err?.error?.data || err?.message || 'Error al procesar el enturnamiento';
      this.alert.presentAlert('Novedad en Enturnamiento', 'No fue posible registrar el turno', errorMsg, 'Entendido');
      return { success: false, message: errorMsg, data: err };
    }
  }

  resetWizard(): void {
    this.updateState(INITIAL_STATE);
  }
}
