import { Component, OnInit } from '@angular/core';

import {
  FormControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
// import { UserService } from "../api/user.service";
import { CookieService } from 'ngx-cookie-service';
import { AlertController, Platform } from '@ionic/angular';
import { HomePage } from '../home/home.page';
import { MenuController } from '@ionic/angular';
import { AuthService } from '../api/auth.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { AppComponent } from '../app.component';

import { App } from '@capacitor/app';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: any = FormGroup;
  fechaActual:any;

  constructor(
    private app: AppComponent,
    private menu: MenuController,
    private alertController: AlertController,
    private formBuilder: FormBuilder,
    private userService: AuthService,
    private cookies: CookieService,
    private router: Router,
    private platform: Platform
  ) {}
  get f() {
    return this.loginForm.controls;
  }

  onLogin() {
    const user = {
      numeroPlacaxxx: this.loginForm.value.password.toUpperCase(),
      codigoTercerox: this.loginForm.value.username,
    };

    this.userService.login(user).subscribe(
      (data) => {
        this.presentAlert(
          'Alerta',
          'Bienvenido',
          'App de ChecList',
          'Continuar'
        );

        localStorage.setItem(
          'placa',
          this.loginForm.value.password.toUpperCase()
        );

        this.userService.setToken(data.access_token);

        localStorage.setItem('conductor', this.loginForm.value.username);
        this.menu.enable(true);
        this.userService.onLoginChange.next(data.token);
        this.app.ngOnInit();
        this.router.navigate(['/home']);
      },
      (err) => {
        this.presentAlert(
          'Error',
          'Fallo al ingresar',
          err.error.data,
          'Cerrar'
        );
      }
    );
  }

  ngOnInit() {
    if (localStorage.getItem('placa') != null && localStorage.getItem('token')) {

      const token = this.userService.getToken();

      const json = {
        'token' : token
      }

      this.userService.tokenValidate(json).subscribe(
        data => {
          this.router.navigate(['/home']);
        },
        err => {
          this.userService.logout();
        }
      )


    }


    this.platform.backButton.subscribeWithPriority(10, () => {
      App.exitApp();
    });

    this.fechaActual = new Date().getFullYear();

    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  async presentAlert(
    title: String,
    subheader: String,
    desc: String,
    botton: String
  ) {
    const alert = await this.alertController.create({
      header: '' + title,
      subHeader: '' + subheader,
      message: '' + desc,
      buttons: ['' + botton],
    });

    await alert.present();
  }
}
