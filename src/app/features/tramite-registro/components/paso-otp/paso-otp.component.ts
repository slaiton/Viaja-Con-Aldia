import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

export interface SolicitudOtpPayload {
  cedula: string;
  placa: string;
  celular: string;
}

export interface VerificacionOtpPayload extends SolicitudOtpPayload {
  codigo: string;
}

@Component({
  selector: 'app-paso-otp',
  templateUrl: './paso-otp.component.html',
  styleUrls: ['./paso-otp.component.scss']
})
export class PasoOtpComponent implements OnInit, OnChanges, OnDestroy {
  @Input() cargando = false;
  @Input() errorMensaje: string | null = null;
  @Input() subpaso: 'SOLICITUD' | 'VERIFICACION' = 'SOLICITUD';
  @Input() celularMask = '••••';
  @Input() reenviarEnSegundos = 0;
  @Input() intentosRestantes: number | null = null;

  @Output() solicitarOtp = new EventEmitter<SolicitudOtpPayload>();
  @Output() verificarOtp = new EventEmitter<VerificacionOtpPayload>();
  @Output() cambiarDatos = new EventEmitter<void>();
  @Output() irALogin = new EventEmitter<void>();
  @Output() limpiarError = new EventEmitter<void>();

  datosForm!: FormGroup;
  codigoControl = new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]);
  tiempoRestanteReenvio = 0;

  private reenvioTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.datosForm = this.fb.group({
      cedula: ['', [Validators.required, Validators.pattern(/^[0-9]{5,15}$/)]],
      placa: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\s\-]{5,8}$/)]],
      celular: ['', [Validators.required, Validators.pattern(/^3[0-9]{9}$/)]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['subpaso']) {
      if (this.subpaso === 'VERIFICACION') {
        this.codigoControl.reset('');
        this.iniciarTemporizador(this.reenviarEnSegundos || 60);
      } else {
        this.limpiarTemporizador();
        this.codigoControl.reset('');
      }
    } else if (changes['reenviarEnSegundos'] && this.subpaso === 'VERIFICACION' && this.reenviarEnSegundos > 0) {
      this.iniciarTemporizador(this.reenviarEnSegundos);
    }
  }

  ngOnDestroy(): void {
    this.limpiarTemporizador();
  }

  get tiempoFormateado(): string {
    const mins = Math.floor(this.tiempoRestanteReenvio / 60);
    const secs = this.tiempoRestanteReenvio % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  enviarSolicitud(): void {
    if (this.datosForm.invalid || this.cargando) {
      this.datosForm.markAllAsTouched();
      return;
    }

    this.limpiarError.emit();
    const { cedula, placa, celular } = this.datosForm.value as SolicitudOtpPayload;
    this.solicitarOtp.emit({
      cedula: String(cedula || ''),
      placa: String(placa || ''),
      celular: String(celular || '')
    });
  }

  validarCodigo(): void {
    if (this.codigoControl.invalid || this.cargando) {
      return;
    }

    this.limpiarError.emit();
    const { cedula, placa, celular } = this.datosForm.value as SolicitudOtpPayload;
    this.verificarOtp.emit({
      cedula: String(cedula || ''),
      placa: String(placa || ''),
      celular: String(celular || ''),
      codigo: String(this.codigoControl.value || '')
    });
  }

  reenviarCodigo(): void {
    if (this.tiempoRestanteReenvio > 0 || this.cargando) {
      return;
    }
    this.enviarSolicitud();
  }

  volverASolicitud(): void {
    this.limpiarTemporizador();
    this.codigoControl.reset('');
    this.cambiarDatos.emit();
  }

  onOtpInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const clean = (input.value || '').replace(/\D/g, '').slice(0, 6);
    if (clean !== input.value) {
      input.value = clean;
    }
    this.codigoControl.setValue(clean);
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
