import { Component, OnInit } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
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
import { UserService } from '../api/user.service';
import { environment } from 'src/environments/environment';
import { Browser } from '@capacitor/browser';



@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: any = FormGroup;
  fechaActual: any;
  submitClick: any;
  version: any;

  constructor(
    private app: AppComponent,
    private menu: MenuController,
    private alertController: AlertController,
    private formBuilder: FormBuilder,
    private userService: AuthService,
    private cookies: CookieService,
    private router: Router,
    private platform: Platform,
    private user: UserService
  ) {
    this.version = environment.version
    this.initializeApp();

  }
  get f() {
    return this.loginForm.controls;
  }

  onLogin() {

    if (this.submitClick) {
      return;
    }

    this.submitClick = true;

    const user = {
      numeroPlacaxxx: this.loginForm.value.password.toUpperCase(),
      codigoTercerox: this.loginForm.value.username,
      version: environment.version
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
        this.submitClick = false;

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
        this.submitClick = false;
      }
    );
  }

  async ngOnInit() {

    this.submitClick = false;

    if (localStorage.getItem('placa') != null && localStorage.getItem('token')) {

      const token = this.userService.getToken();

      const json = {
        'token': token
      }

      this.userService.tokenValidate(json).subscribe(
        data => {
          this.router.navigate(['/home']);
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

    await this.validateVersion()

  }


  async validateVersion() {
    await this.user.getDataApi('', '', 'api/version/latest').then(
      data => {
        if (data.version_number > environment.version) {
          const appPackage = 'com.viajaconaldia.app';
          const playStoreUrl = `https://play.google.com/store/apps/details?id=${appPackage}`;
          this.presentAlertFun("Alerta", "", "Se requiere actualizacion para continuar", "Actualizar").then(
            () => {
              Browser.open({ url: playStoreUrl });
            }

          )
        }
      }
    )
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.setStatusBarColor();
    });
  }

  setStatusBarColor() {
    if (this.platform.is('android')) {
      StatusBar.setBackgroundColor({ color: '#5C8CDF' }); // Cambia a tu color deseado en formato hexadecimal
    } else if (this.platform.is('ios')) {
      StatusBar.setStyle({ style: Style.Dark }); // Estilos disponibles: Dark, Light, Default
    }
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

  async presentAlertFun(
    title: string,
    subheader: string,
    desc: string,
    button: string
  ): Promise<void> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: title,
        subHeader: subheader,
        message: desc,
        backdropDismiss: false,
        buttons: [
          {
            text: button,
            handler: () => {
              resolve(); // Resuelve la promesa cuando se presiona el botón
            }
          }
        ]
      });

      await alert.present();
    });
  }
}
