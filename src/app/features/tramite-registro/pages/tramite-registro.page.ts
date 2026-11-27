import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import {
  DatosConductorTramite,
  DatosTerceroOpcionalTramite,
  DatosTrailerTramite,
  DatosVehiculoTramite,
  EntidadTramiteSlug,
  EntidadTramiteUpper,
  PasoRegistro,
  TramiteDetalle
} from '@core/models/tramite-registro.model';
import { EntidadOpcionalSlug } from '../components/paso-opcionales/paso-opcionales.component';
import { SolicitudOtpPayload, VerificacionOtpPayload } from '../components/paso-otp/paso-otp.component';
import { EtapaRegistro, puedeAccederAEtapa } from '../services/tramite-registro-error.helper';
import { TramiteRegistroFacade, TramiteRegistroState } from '../services/tramite-registro.facade';

@Component({
  selector: 'app-tramite-registro',
  templateUrl: './tramite-registro.page.html',
  styleUrls: ['./tramite-registro.page.scss'],
  providers: [TramiteRegistroFacade]
})
export class TramiteRegistroPage implements OnInit, OnDestroy {
  @ViewChild(IonContent) content?: IonContent;
  public readonly state$: Observable<TramiteRegistroState>;
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly facade: TramiteRegistroFacade) {
    this.state$ = this.facade.state$;
  }

  ngOnInit(): void {
    this.state$
      .pipe(
        map((s) => s.etapaActual),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        void this.content?.scrollToTop(250);
      });
  }

  ionViewWillEnter(): void {
    void this.facade.inicializarFlujo();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  numeroEtapa(etapa: EtapaRegistro): number {
    const mapa: Record<EtapaRegistro, number> = {
      conductor: 1,
      vehiculo: 2,
      opcionales: 3,
      documentos: 4
    };
    return mapa[etapa];
  }

  tituloEtapa(etapa: EtapaRegistro): string {
    const titulos: Record<EtapaRegistro, string> = {
      conductor: 'Tus datos personales',
      vehiculo: 'Datos del vehículo',
      opcionales: 'Tráiler y terceros (opcional)',
      documentos: 'Fotos de documentos'
    };
    return titulos[etapa];
  }

  puedeAcceder(etapa: EtapaRegistro, tramite: TramiteDetalle | null): boolean {
    return puedeAccederAEtapa(etapa, tramite);
  }

  pasoCompleto(pasos: PasoRegistro[], entidad: EntidadTramiteUpper): boolean {
    return Boolean(pasos.find((p) => p.entidad === entidad)?.conDatos);
  }

  seleccionarEtapa(etapa: EtapaRegistro): void {
    this.facade.seleccionarEtapa(etapa);
  }

  onSolicitarOtp(payload: SolicitudOtpPayload): void {
    void this.facade.iniciarSolicitudOtp(payload);
  }

  onVerificarOtp(payload: VerificacionOtpPayload): void {
    void this.facade.verificarSolicitudOtp(payload);
  }

  onCambiarDatosOtp(): void {
    this.facade.volverASolicitudOtp();
  }

  onLimpiarErrorOtp(): void {
    this.facade.limpiarErrorOtp();
  }

  onIrALogin(): void {
    void this.facade.irALogin();
  }

  onGuardarConductor(datos: DatosConductorTramite): void {
    void this.facade.guardarEntidad('conductor', datos);
  }

  onGuardarVehiculo(datos: DatosVehiculoTramite): void {
    void this.facade.guardarEntidad('vehiculo', datos);
  }

  onMarcaCambio(marcaId: number): void {
    void this.facade.cargarLineasPorMarca(marcaId);
  }

  onFormularioInvalido(mensaje: string): void {
    void this.facade.notificarFormularioInvalido(mensaje);
  }

  onGuardarOpcional(event: {
    entidad: EntidadOpcionalSlug;
    datos: DatosTrailerTramite | DatosTerceroOpcionalTramite;
  }): void {
    void this.facade.guardarEntidad(event.entidad, event.datos);
  }

  onQuitarOpcional(entidad: EntidadOpcionalSlug): void {
    void this.facade.eliminarEntidadOpcional(entidad);
  }

  onContinuarOpcionales(): void {
    this.facade.avanzarADocumentosDesdeOpcionales();
  }

  onSubirSoporte(event: { entidad: EntidadTramiteSlug; tipo: string; etiqueta: string }): void {
    void this.facade.capturarYSubirSoporte(event.entidad, event.tipo, event.etiqueta);
  }

  onSolicitarEliminarSoporte(archivoId: number): void {
    void this.facade.solicitarEliminacionSoporte(archivoId);
  }

  onSolicitarEnviarTramite(): void {
    void this.facade.solicitarEnvioFinal();
  }

  onReabrir(): void {
    void this.facade.reabrirTramiteRechazado();
  }

  onActualizarEstado(): void {
    void this.facade.inicializarFlujo();
  }

  onCerrarSesion(): void {
    void this.facade.cerrarSesionRegistro();
  }
}
