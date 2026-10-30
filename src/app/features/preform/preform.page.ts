import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ActionSheetController } from '@ionic/angular';
import { CameraSource } from '@capacitor/camera';
import { PreoperacionalFacade } from './preoperacional.facade';

@Component({
  selector: 'app-preform',
  templateUrl: './preform.page.html',
  styleUrls: ['./preform.page.scss'],
})
export class PreformPage implements OnInit {
  public readonly isLoading$ = this.facade.isLoading$;
  public readonly wizardStep$ = this.facade.wizardStep$;
  public readonly preguntaActual$ = this.facade.preguntaActual$;
  public readonly progreso$ = this.facade.progreso$;
  public readonly categoriaPrompt$ = this.facade.categoriaPrompt$;
  public readonly alertasNoCumple$ = this.facade.alertasNoCumple$;
  public readonly fotoVehiculo$ = this.facade.fotoVehiculo$;
  public readonly isSubmitting$ = this.facade.isSubmitting$;
  public readonly placa$ = this.facade.placa$;
  public readonly isOnline$ = this.facade.isOnline$;

  constructor(
    public readonly facade: PreoperacionalFacade,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly alertCtrl: AlertController,
    private readonly actionSheetCtrl: ActionSheetController
  ) {}

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(async (params) => {
      const placa = params && params['placa'] ? params['placa'] : undefined;
      await this.facade.inicializar(placa);
    });
  }

  responder(valor: 'CUMPLE' | 'NO CUMPLE'): void {
    this.facade.responder(valor);
  }

  responderCategoria(nombreCategoria: string, aplica: boolean): void {
    this.facade.responderCategoria(nombreCategoria, aplica);
  }

  anterior(): void {
    this.facade.anterior();
  }

  marcarSolucionado(preguntaId: number): void {
    this.facade.marcarSolucionado(preguntaId);
  }

  continuarAFoto(): void {
    this.facade.continuarAFoto();
  }

  async seleccionarFuenteFoto(): Promise<void> {
    const sheet = await this.actionSheetCtrl.create({
      header: 'Foto del Vehículo',
      subHeader: 'Selecciona una opción',
      buttons: [
        {
          text: 'Tomar Foto (Cámara)',
          icon: 'camera-outline',
          handler: () => {
            this.facade.capturarFoto(CameraSource.Camera);
          }
        },
        {
          text: 'Elegir de Galería',
          icon: 'image-outline',
          handler: () => {
            this.facade.capturarFoto(CameraSource.Photos);
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          icon: 'close-outline'
        }
      ]
    });

    await sheet.present();
  }

  async finalizarInspeccion(): Promise<void> {
    const result = await this.facade.enviarPreoperacional();

    const alert = await this.alertCtrl.create({
      header: result.success ? (result.offline ? 'Inspección Guardada Localmente' : 'Inspección Completada') : 'Atención',
      subHeader: result.offline ? 'Sin conexión a internet' : '',
      message: result.message,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Aceptar',
          handler: () => {
            if (result.success) {
              this.router.navigate(['/home']);
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
