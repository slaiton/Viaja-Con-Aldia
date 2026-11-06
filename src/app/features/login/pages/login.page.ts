import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthFacadeService } from "../services/auth-facade.service";
import { Router } from "@angular/router";
import { Platform } from "@ionic/angular";
import { environment } from "@env/environment";
import { Component, OnInit } from "@angular/core";
import { App } from "@capacitor/app";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  version = environment.version;
  fechaActual = new Date().getFullYear();
  submitClick = false;

  // Soporte y transicion hacia Pantalla 2 (OTP 2FA)
  mostrarPasoOtp = false;
  codigoOtp = '';
  celularMask = '••21';

  constructor(
    private fb: FormBuilder,
    private authFacade: AuthFacadeService,
    private router: Router,
    private platform: Platform
  ) {
  }

  ngOnInit(): void {
    this.buildForm();
    this.handleAutoLogin();
    this.handleBackButton();
  }

  private buildForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern(/^[0-9]{5,12}$/)]],
      password: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]{3}\s?[0-9]{3}$/)]],
    });
  }

  private handleAutoLogin(): void {
    this.authFacade.validateSession().subscribe({
      next: () => this.router.navigate(['/home']),
    });
  }

  private handleBackButton(): void {
    this.platform.backButton.subscribeWithPriority(10, () => {
      if (this.mostrarPasoOtp) {
        this.mostrarPasoOtp = false;
      } else {
        App.exitApp();
      }
    });
  }

  irARegistro(): void {
    this.router.navigate(['/registro']);
  }

  volverAPaso1(): void {
    this.mostrarPasoOtp = false;
  }

  onLogin(): void {
    if (this.loginForm.invalid || this.submitClick) return;

    this.submitClick = true;
    const raw = this.loginForm.value;
    const credentials = {
      username: (raw.username || '').toString().trim(),
      password: (raw.password || '').toString().trim().replace(/\s+/g, '').toUpperCase(),
    };

    this.authFacade.login(credentials).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/home']);
      },
      error: () => {
        this.loading = false;
        this.submitClick = false;
      },
    });
  }
}