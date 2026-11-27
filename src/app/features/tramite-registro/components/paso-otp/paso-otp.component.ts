import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { IniciarRegistroData } from '@core/models/tramite-registro.model';
import { OtpRegistroActionResult } from '../../services/tramite-registro.facade';

@Component({
  selector: 'app-paso-otp',
  templateUrl: './paso-otp.component.html',
  styleUrls: ['./paso-otp.component.scss']
})
export class PasoOtpComponent implements OnInit, OnDestroy {
  @Input() cargando = false;
  @Input() errorMensaje: string | null = null;

  @Input() iniciarOtpFn!: (
    cedula: string,
    placa: string,
    celular: string
  ) => Promise<OtpRegistroActionResult<IniciarRegistroData>>;

  @Input() verificarOtpFn!: (
    cedula: string,
    placa: string,
    celular: string,
    codigo: string
  ) => Promise<OtpRegistroActionResult<void>>;

  @Output() limpiarError = new EventEmitter<void>();

  datosForm!: FormGroup;
  codigoControl = new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]);

  subpaso: 'SOLICITUD' | 'VERIFICACION' = 'SOLICITUD';
  celularMask = '••••';
  tiempoRestanteReenvio = 0;
  intentosRestantes: number | null = null;
  errorLocal = '';

  private reenvioTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly alert: AlertService
  ) {}

  ngOnInit(): void {
    this.datosForm = this.fb.group({
      cedula: ['', [Validators.required, Validators.pattern(/^[0-9]{5,15}$/)]],
      placa: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\s\-]{5,8}$/)]],
      celular: ['', [Validators.required, Validators.pattern(/^3[0-9]{9}$/)]]
    });
  }

  ngOnDestroy(): void {
    this.limpiarTemporizador();
  }

  get tiempoFormateado(): string {
    const mins = Math.floor(this.tiempoRestanteReenvio / 60);
    const secs = this.tiempoRestanteReenvio % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  async enviarSolicitud(): Promise<void> {
    if (this.datosForm.invalid || this.cargando || !this.iniciarOtpFn) {
      this.datosForm.markAllAsTouched();
      return;
    }

    this.errorLocal = '';
    this.limpiarError.emit();

    const { cedula, placa, celular } = this.datosForm.value;
    const res = await this.iniciarOtpFn(String(cedula), String(placa), String(celular));

    if (res.ok) {
      this.subpaso = 'VERIFICACION';
      this.celularMask = res.data.celular || String(celular).slice(-4);
      this.codigoControl.reset('');
      this.iniciarTemporizador(res.data.reenviar_en_segundos || 60);
      return;
    }

    this.errorLocal = res.message;

    if (res.code === 'YA_REGISTRADO') {
      await this.alert.presentAlertButtons(
        'Conductor Ya Registrado',
        '',
        res.message,
        '',
        [
          { text: 'Ir a Iniciar Sesión', handler: () => this.irALogin() },
          { text: 'Cerrar', handler: () => {} }
        ]
      );
      return;
    }

    if (res.code === 'ESPERA_REENVIO' && res.reenviarEnSegundos && res.reenviarEnSegundos > 0) {
      this.subpaso = 'VERIFICACION';
      this.iniciarTemporizador(res.reenviarEnSegundos);
    }
  }

  async validarCodigo(): Promise<void> {
    if (this.codigoControl.invalid || this.cargando || !this.verificarOtpFn) {
      return;
    }

    this.errorLocal = '';
    this.limpiarError.emit();

    const { cedula, placa, celular } = this.datosForm.value;
    const codigo = String(this.codigoControl.value || '');
    const res = await this.verificarOtpFn(String(cedula), String(placa), String(celular), codigo);

    if (!res.ok) {
      this.errorLocal = res.message;
      this.intentosRestantes = res.intentosRestantes ?? null;
      if (res.code === 'CODIGO_BLOQUEADO') {
        this.volverASolicitud();
      }
    } else {
      this.limpiarTemporizador();
    }
  }

  async reenviarCodigo(): Promise<void> {
    if (this.tiempoRestanteReenvio > 0 || this.cargando) {
      return;
    }
    await this.enviarSolicitud();
  }

  volverASolicitud(): void {
    this.limpiarTemporizador();
    this.subpaso = 'SOLICITUD';
    this.codigoControl.reset('');
    this.errorLocal = '';
    this.intentosRestantes = null;
    this.limpiarError.emit();
  }

  onOtpInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const clean = (input.value || '').replace(/\D/g, '').slice(0, 6);
    if (clean !== input.value) {
      input.value = clean;
    }
    this.codigoControl.setValue(clean);
  }

  irALogin(): void {
    void this.router.navigate(['/login'], { replaceUrl: true });
  }

  private iniciarTemporizador(segundos: number): void {
    this.limpiarTemporizador();
    this.tiempoRestanteReenvio = Math.max(0, Math.floor(segundos));
    if (this.tiempoRestanteReenvio <= 0) {
      return;
    }
    this.reenvioTimer = setInterval(() => {
      if (this.tiempoRestanteReenvio > 0) {
        this.tiempoRestanteReenvio--;
      } else {
        this.limpiarTemporizador();
      }
    }, 1000);
  }

  private limpiarTemporizador(): void {
    if (this.reenvioTimer) {
      clearInterval(this.reenvioTimer);
      this.reenvioTimer = null;
    }
  }
}
