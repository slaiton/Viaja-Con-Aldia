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
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  private handleAutoLogin(): void {
    this.authFacade.validateSession().subscribe({
      next: () => this.router.navigate(['/home']),
    });
  }

  private handleBackButton(): void {
    this.platform.backButton.subscribeWithPriority(10, () => {
      App.exitApp();
    });
  }

  onLogin(): void {

    if (this.loginForm.invalid || this.submitClick) return;

    this.submitClick = true;

    this.authFacade.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/home']);
      },
      error: () => (this.loading = false),
    });
  }
}