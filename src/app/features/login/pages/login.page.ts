import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { environment } from '@env/environment';
import { AlertService } from '@core/services/alert.service';
import { DevicePlatformService } from '@core/platform/device-platform.service';
import { SessionStore } from '@core/session/session.store';
import { AuthFacadeService } from '../services/auth-facade.service';
import { OtpErrorResult, SolicitudOtpResult } from '@core/models/auth-conductor.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit, OnDestroy {
  @ViewChild('otpInput') otpInputElement?: ElementRef<HTMLInputElement>;

  loginForm!: FormGroup;
  codigoOtpControl = new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]);

  loadingPaso1 = false;
  loadingPaso2 = false;
  mostrarPasoOtp = false;

  celularMask = '••';
  tiempoRestanteReenvio = 0;
  errorMensajeOtp = '';
  intentosRestantes: number | null = null;

  version = environment.version;
  fechaActual = new Date().getFullYear();

  private reenvioTimer: ReturnType<typeof setInterval> | null = null;
  private backButtonSub?: Subscription;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authFacade: AuthFacadeService,
    private readonly sessionStore: SessionStore,
    private readonly router: Router,
    private readonly platform: Platform,
    private readonly devicePlatform: DevicePlatformService,
    private readonly alert: AlertService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    if (this.sessionStore.isSessionValid()) {
      this.handleAutoLogin();
    }
    this.handleBackButton();
  }

  ionViewWillEnter(): void {
    this.limpiarTemporizador();
    this.mostrarPasoOtp = false;
    this.codigoOtpControl.reset('');
    this.errorMensajeOtp = '';
    this.intentosRestantes = null;
    this.loadingPaso1 = false;
    this.loadingPaso2 = false;

    if (this.sessionStore.isSessionValid()) {
      this.handleAutoLogin();
    }
  }

  ionViewWillLeave(): void {
    this.limpiarTemporizador();
  }

  ngOnDestroy(): void {
    this.limpiarTemporizador();
    this.backButtonSub?.unsubscribe();
  }

  private buildForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern(/^[0-9]{5,12}$/)]],
      password: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]{3}\s?[0-9]{3}$/)]]
    });
  }

  private handleAutoLogin(): void {
    if (!this.sessionStore.isSessionValid()) {
      return;
    }
    this.authFacade.validateSession().subscribe({
      next: () => {
        if (this.sessionStore.isRegistroSession()) {
          void this.router.navigate(['/registro'], { replaceUrl: true });
          return;
        }
        if (this.sessionStore.isActiveConductorSession()) {
          void this.router.navigate(['/home'], { replaceUrl: true });
        }
      }
    });
  }

  private handleBackButton(): void {
    this.backButtonSub = this.platform.backButton.subscribeWithPriority(10, () => {
      if (this.mostrarPasoOtp) {
        this.volverAPaso1();
      } else {
        void this.devicePlatform.exitApp();
      }
    });
  }

  irARegistro(): void {
    this.router.navigate(['/registro']);
  }

  private mostrarAlertaRegistroPendiente(mensaje?: string): void {
    this.alert.presentAlertButtons(
      'Registro en Proceso',
      '',
      mensaje || 'Tienes un trámite de registro pendiente de culminar o en revisión por Aldia.',
      '',
      [
        { text: 'Continuar mi registro', handler: () => this.irARegistro() },
        { text: 'Cerrar', handler: () => {} }
      ]
    );
  }

  volverAPaso1(): void {
    this.limpiarTemporizador();
    this.mostrarPasoOtp = false;
    this.codigoOtpControl.reset('');
    this.errorMensajeOtp = '';
    this.intentosRestantes = null;
  }

  /**
   * Paso 1: Solicita el código OTP por WhatsApp a través de Aldia-Backend.
   */
  solicitarCodigo(): void {
    if (this.loginForm.invalid || this.loadingPaso1) {
      return;
    }

    this.loadingPaso1 = true;
    this.errorMensajeOtp = '';

    const raw = this.loginForm.value;
    const cedula = (raw.username || '').toString().trim();
    const placa = (raw.password || '').toString().trim().replace(/\s+/g, '').toUpperCase();

    this.authFacade.solicitarCodigoOtp(cedula, placa).subscribe({
      next: (res: SolicitudOtpResult) => {
        this.loadingPaso1 = false;
        this.mostrarPasoOtp = true;
        this.celularMask = res.celular || '••';
        this.codigoOtpControl.reset('');
        this.iniciarTemporizadorReenvio(res.reenviarEnSegundos || 60);
        setTimeout(() => this.focusOtpInput(), 300);
      },
      error: (err: OtpErrorResult) => {
        this.loadingPaso1 = false;

        if (err.code === 'REGISTRO_PENDIENTE') {
          this.mostrarAlertaRegistroPendiente(err.message);
        } else if (err.code === 'NO_REGISTRADO') {
          this.alert.presentAlertButtons(
            'Conductor No Registrado',
            '',
            err.message || 'El número de cédula o la placa no están registrados en el sistema.',
            '',
            [
              { text: 'Registrarme', handler: () => this.irARegistro() },
              { text: 'Cerrar', handler: () => {} }
            ]
          );
        } else if (err.code === 'ESPERA_REENVIO') {
          if (err.reenviarEnSegundos && err.reenviarEnSegundos > 0) {
            this.mostrarPasoOtp = true;
            this.iniciarTemporizadorReenvio(err.reenviarEnSegundos);
          }
          this.alert.presentAlert(
            'Espera requerida',
            '',
            err.message || 'Debes esperar antes de solicitar un nuevo código.',
            'Entendido'
          );
        } else {
          this.alert.presentAlert(
            'Error al solicitar código',
            '',
            err.message || 'No fue posible enviar el código por WhatsApp. Intenta nuevamente.',
            'Cerrar'
          );
        }
      }
    });
  }

  /**
   * Paso 2: Valida el código OTP de 6 dígitos e inicia sesión en /home.
   */
  verificarCodigo(): void {
    if (this.codigoOtpControl.invalid || this.loadingPaso2) {
      return;
    }

    this.loadingPaso2 = true;
    this.errorMensajeOtp = '';

    const raw = this.loginForm.value;
    const cedula = (raw.username || '').toString().trim();
    const placa = (raw.password || '').toString().trim().replace(/\s+/g, '').toUpperCase();
    const codigo = (this.codigoOtpControl.value || '').toString().trim();

    this.authFacade.verificarCodigoOtp(cedula, placa, codigo).subscribe({
      next: () => {
        this.loadingPaso2 = false;
        this.limpiarTemporizador();
        if (this.sessionStore.isRegistroSession()) {
          void this.router.navigate(['/registro'], { replaceUrl: true });
          return;
        }
        this.router.navigate(['/home']);
      },
      error: (err: OtpErrorResult) => {
        this.loadingPaso2 = false;
        this.intentosRestantes = err.intentosRestantes ?? null;
        this.errorMensajeOtp = err.message || 'Código incorrecto.';

        if (err.code === 'REGISTRO_PENDIENTE') {
          this.mostrarAlertaRegistroPendiente(err.message);
        } else if (err.code === 'CODIGO_BLOQUEADO') {
          this.alert.presentAlert(
            'Código Bloqueado',
            '',
            err.message || 'Has superado el número de intentos permitidos. Por seguridad solicita un nuevo código.',
            'Aceptar'
          );
          this.volverAPaso1();
        } else if (err.code === 'CODIGO_EXPIRADO') {
          this.alert.presentAlert(
            'Código Expirado',
            '',
            err.message || 'El código de verificación ha expirado. Por favor solicita uno nuevo.',
            'Aceptar'
          );
        } else if (err.code === 'CODIGO_INCORRECTO') {
          const detalle = err.intentosRestantes !== undefined
            ? `${err.message} (Intentos restantes: ${err.intentosRestantes})`
            : err.message;
          this.alert.presentAlert('Código Incorrecto', '', detalle, 'Reintentar');
        } else {
          this.alert.presentAlert(
            'Error de Verificación',
            '',
            err.message || 'Error al validar el código. Verifica la conexión e intenta nuevamente.',
            'Cerrar'
          );
        }
      }
    });
  }

  /**
   * Reenvía un nuevo código OTP por WhatsApp si el temporizador ha finalizado.
   */
  reenviarCodigo(): void {
    if (this.tiempoRestanteReenvio > 0 || this.loadingPaso1) {
      return;
    }
    this.solicitarCodigo();
  }

  /**
   * Procesa la entrada interactiva de los 6 dígitos OTP.
   */
  onOtpInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = (input?.value || '').replace(/\D/g, '').slice(0, 6);
    this.codigoOtpControl.setValue(digits, { emitEvent: false });
    this.errorMensajeOtp = '';

    if (digits.length === 6 && !this.loadingPaso2) {
      this.verificarCodigo();
    }
  }

  focusOtpInput(): void {
    if (this.otpInputElement?.nativeElement) {
      this.otpInputElement.nativeElement.focus();
    }
  }

  get tiempoRestanteFormateado(): string {
    const min = Math.floor(this.tiempoRestanteReenvio / 60);
    const sec = this.tiempoRestanteReenvio % 60;
    const mm = min < 10 ? `0${min}` : `${min}`;
    const ss = sec < 10 ? `0${sec}` : `${sec}`;
    return `${mm}:${ss}`;
  }

  private iniciarTemporizadorReenvio(segundos: number): void {
    this.limpiarTemporizador();
    this.tiempoRestanteReenvio = Math.max(0, Math.floor(segundos));
    if (this.tiempoRestanteReenvio > 0) {
      this.reenvioTimer = setInterval(() => {
        if (this.tiempoRestanteReenvio > 1) {
          this.tiempoRestanteReenvio--;
        } else {
          this.tiempoRestanteReenvio = 0;
          this.limpiarTemporizador();
        }
      }, 1000);
    }
  }

  private limpiarTemporizador(): void {
    if (this.reenvioTimer) {
      clearInterval(this.reenvioTimer);
      this.reenvioTimer = null;
    }
  }

  // Métodos alias para compatibilidad de plantillas y legacy
  onSolicitarCodigo(): void {
    this.solicitarCodigo();
  }

  onLogin(): void {
    this.solicitarCodigo();
  }
}
