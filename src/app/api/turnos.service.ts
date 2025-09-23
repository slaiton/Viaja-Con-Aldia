import { Injectable } from '@angular/core';
import { LocalNotificationService } from './local-notification.service';
import { GeodataService } from './geodata.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { AlertService } from './alert.service';
import { HomePage } from '../home/home.page';
import { Router } from '@angular/router';
import { Turno } from '../models/turno.model'; 

@Injectable({
  providedIn: 'root'
})
export class TurnosService {

  public regionales = [
    { nombre: 'REGIONAL ARAUCA' },
    { nombre: 'REGIONAL ARMENIA' },
    { nombre: 'REGIONAL BARRANQUILLA' },
    { nombre: 'REGIONAL BOGOTA' },
    { nombre: 'REGIONAL BUCARAMANGA' },
    { nombre: 'REGIONAL BUENAVENTURA' },
    { nombre: 'REGIONAL CALI' },
    { nombre: 'REGIONAL CARTAGENA' },
    { nombre: 'REGIONAL CUCUTA' },
    { nombre: 'REGIONAL FLORENCIA' },
    { nombre: 'REGIONAL IBAGUE' },
    { nombre: 'REGIONAL IPIALES' },
    { nombre: 'REGIONAL MANIZALES' },
    { nombre: 'REGIONAL MEDELLIN' },
    { nombre: 'REGIONAL MONTERIA' },
    { nombre: 'REGIONAL NEIVA' },
    { nombre: 'REGIONAL PASTO' },
    { nombre: 'REGIONAL PEREIRA' },
    { nombre: 'REGIONAL PERU' },
    { nombre: 'REGIONAL POPAYAN' },
    { nombre: 'REGIONAL RIOHACHA' },
    { nombre: 'REGIONAL TUNJA' },
    { nombre: 'REGIONAL SANTA MARTA' },
    { nombre: 'REGIONAL VALLEDUPAR' },
  ];

  constructor(
    private router: Router,
    private localNoti: LocalNotificationService,
    private geodata: GeodataService,
    private alert: AlertService,
    private loading: LoadingController
  ) { }

  async createTurno(turnoData: Turno) {

    const respuesta = await this.geodata.turnoCreacion(turnoData)

    const buttons = [
      {
        text: 'Continuar',
        handler: async () => {
          this.router.navigate(['/home']).then(() => {
            window.location.reload();
          });
        }
      }
    ]

    // respuesta = JSON.parse(respuesta);
    this.alert.presentAlertButtons(
      'Respuesta enturnamiento',
      '',
      respuesta.data,
      '',
      buttons
    );
    this.localNoti.executeNotification(1, "IMPORTANTE", "TURNO CREADO CON EXITO", respuesta.data, "");

  }
}
