import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from "ngx-cookie-service";
import { Subject } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';
import { AuthService } from './api/auth.service';
import { defineCustomElements } from '@ionic/pwa-elements/loader';




@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  private componentDestroyed = new Subject();
  usserLogged: any;
  
  public appPages = [
    { title: 'Inicio', url: '/home', icon: 'home', hidden: false },
    { title: 'Mis datos', url: '/datos', icon: 'person-circle', hidden: false },
    { title: 'Turnos', url: '/turnos', icon: 'archive', hidden: false },
    { title: 'Pruebas', url: '/pruebas', icon: 'flashlight' },
    // { title: 'Archived', url: '/folder/Archived', icon: 'archive' },
    // { title: 'Trash', url: '/folder/Trash', icon: 'trash' },
    // { title: 'Spam', url: '/folder/Spam', icon: 'warning' },
  ];
  // public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  constructor(private userService: AuthService,private router: Router, private cookies: CookieService) {
    defineCustomElements(window)
  }

  conductor:any;
  nombre:any;
  estado:any;
  placa:any;
  marca:any;
  carroceria:any;  
  clase_vehiculo:any;
  clase_estado:any;
  token:any;
  fotoUser:any = false;
  


  ngOnInit(){
    // console.log(localStorage.getItem("placa"));

     this.userService.onChange.subscribe(
       (data) => {
        this.token = this.userService.getToken();
       }
     );
    
    if (localStorage.getItem("token") != null) {
      
      // this.router.navigate(['/login']);

      this.userService.getUser3sL(this.token).subscribe(data => {
        
        const datos = data.data[0];
        console.log(datos);
      this.conductor = datos.nombreTercerox.toLowerCase();
      this.nombre = this.conductor.split(' ')[0];
      // this.estado = datos.estado;
      this.placa = datos.numeroPlacaxxx;
      // this.carroceria = datos.carroceria;
      // this.marca = datos.marca;
      // this.clase_vehiculo = datos.clase_vehiculo;
      this.estado = datos.estadoSiatxx;
      this.fotoUser = datos.apiFotoConductor;

      this.placa = this.placa.substr(0,3)+" - "+this.placa.substr(3,5);
      

      if (this.estado == 'ACTIVO') {
         this.clase_estado = "badge text-bg-success";
      }else{
         this.clase_estado = "badge text-bg-danger";
         this.appPages[2].hidden = true;
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
