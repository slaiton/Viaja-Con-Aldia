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
import { AlertController } from '@ionic/angular';
import { HomePage } from '../home/home.page';
import { MenuController } from '@ionic/angular';
import { AuthService } from '../api/auth.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: any = FormGroup;

  constructor(
    private app: AppComponent,
    private menu: MenuController,
    private alertController: AlertController,
    private formBuilder: FormBuilder,
    private userService: AuthService,
    private cookies: CookieService,
    private router: Router
  ) {}
  get f() {
    return this.loginForm.controls;
  }

  onLogin() {
    const user = {
      username: this.loginForm.value.password.toUpperCase(),
      password: this.loginForm.value.username,
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
        localStorage.setItem('conductor', this.loginForm.value.username);
        this.userService.setToken(data.token);
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
    if (localStorage.getItem('placa') != null) {
      this.router.navigate(['/home']);
    }

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
