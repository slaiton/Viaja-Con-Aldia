import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from "ngx-cookie-service";
import { Subject } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';
import { AuthService } from './api/auth.service';





@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  private componentDestroyed = new Subject();
  usserLogged: any;
  
  public appPages = [
    { title: 'Inicio', url: '/home', icon: 'home' },
    { title: 'Mis datos', url: '/datos', icon: 'person-circle' },
    { title: 'Turnos', url: '/turnos', icon: 'archive' },
    { title: 'Pre - Operacional', url: '/preform', icon: 'flashlight' },
    // { title: 'Archived', url: '/folder/Archived', icon: 'archive' },
    // { title: 'Trash', url: '/folder/Trash', icon: 'trash' },
    // { title: 'Spam', url: '/folder/Spam', icon: 'warning' },
  ];
  // public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  constructor(private userService: AuthService,private router: Router, private cookies: CookieService) {}

  conductor:any;
  nombre:any;
  estado:any;
  placa:any;
  marca:any;
  carroceria:any;  
  clase_vehiculo:any;
  clase_estado:any;
  token:any;
  fotoUser:any;
  


  ngOnInit(){
    // console.log(localStorage.getItem("placa"));

     this.userService.onChange.subscribe(
       (data) => {
        this.token = this.userService.getToken();
       }
     );
    
    if (localStorage.getItem("token") != null) {
      
      // this.router.navigate(['/login']);

      this.userService.getUser3sL().subscribe(data => {
      data = data.data[0];
      this.conductor = data.nombre_completo.toLowerCase();
      this.nombre = this.conductor.split(' ')[0];
      // this.estado = data.estado;
      this.placa = data.numeroPlacaxxx;
      // this.carroceria = data.carroceria;
      // this.marca = data.marca;
      // this.clase_vehiculo = data.clase_vehiculo;
      this.estado = data.estadoSiatxx;
      this.fotoUser = data.apiFotoConductor;

      this.placa = this.placa.substr(0,3)+" - "+this.placa.substr(3,5);
      

      if (this.estado == 'ACTIVO') {
         this.clase_estado = "badge text-bg-success";
      }else{
         this.clase_estado = "badge text-bg-danger";
      }
      // console.log(data)       

    });
  }
  }

statusLogin(){
  return this.userService.getToken();
}

logout(){
  return this.userService.logout();
}



}
