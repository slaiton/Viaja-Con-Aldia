import { Component, OnInit,ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../api/user.service';
import { AlertController } from '@ionic/angular';
import { PhotoService } from '../api/photo.service';
import { log } from 'console';
import { Foto } from '../models/photo.interface';


@Component({
  selector: 'app-preform',
  templateUrl: './preform.page.html',
  styleUrls: ['./preform.page.scss'],
})
export class PreformPage implements OnInit {
  preformForm: FormGroup;
  apiResponseData: any;
  apiError: any = '';
  placa: any = ''; // Variable para almacenar la placa del vehículo
  car: any = '';

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private alertController: AlertController,
    private photo: PhotoService
  ) {
    this.preformForm = this.formBuilder.group({
      pregunta1: [''],
      pregunta2: [''],
      pregunta3: [''],
      pregunta4: [''],
      pregunta5: [''],
      pregunta6: [''],
      pregunta7: [''],
      pregunta8: [''],
      pregunta9: [''],
      pregunta10: [''],
      pregunta11: [''],
      pregunta12: [''],
      pregunta13: [''],
      pregunta14: [''],
      pregunta15: [''],
      pregunta16: [''],
      pregunta17: [''],
      pregunta18: [''],
      pregunta19: [''],
      pregunta20: [''],
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    console.log('Archivo seleccionado:', file);
  }

  submitForm() {
    if (this.preformForm.valid) {
      const formData = this.preformForm.value;
      console.log('Datos a enviar al servidor:', formData);

      // Validar que se tome la foto del vehiculo
      if (!this.car) {
        this.presentAlert('Por favor, cargue una foto del vehículo.','Click a la camara','dddd','Volver');
        return;
      }

      // Validar que todas las respuestas sean "Cumple" usando la función de validación
      if (this.validarRespuestas(formData)) {
        // Crear el JSON con los datos necesarios
        const jsonEnvio = {
          vehiculo: this.placa, // Utiliza la placa almacenada
          confirmacion: 1,
        };

        // Llama al servicio para consumir la API con el JSON de envío
        this.userService.postPreoperacionalData(jsonEnvio).subscribe(
          (response) => {
            // alert('Respuesta de la API:'+ response.data);
            this.presentAlert('¡¡Perfecto!!','Respuesta de la API:',response.data,'Confirmar')
            console.log('Respuesta de la API:', response);
            this.apiResponseData = response;

            // Aquí puedes agregar lógica adicional para manejar la respuesta de la API
            // Por ejemplo, mostrar un mensaje al usuario o redirigir a otra página.

            this.resetForm();
          },
          (error) => {
            this.presentAlert('Error al consumir la API:','Error',error.data,'Volver');

            // Manejo de errores, por ejemplo, mostrar un mensaje de error al usuario.
            this.apiError = 'Error al cargar los datos desde el servidor.';
          }
        );
      } else {
        this.presentAlert('Formulario no válido','Revisar','Algunas respuestas son "No Cumple"','Volver');
        // alert(
        //   'Formulario no válido. Algunas respuestas no son "Cumple".'
        // );
        // Muestra un mensaje de error al usuario o realiza alguna otra acción de manejo de errores.
      }
    } else {
      alert('Formulario no válido. Revise los campos.');
    }
  }

  resetForm() {
    this.preformForm.reset();
  }

  ngOnInit() {
    if (localStorage.getItem('token') == null) {
      this.router.navigate(['/login']);
    }

    // Obtener la placa del vehículo del usuario logueado
    this.placa = this.userService.getPlaca();
  }

  validarRespuestas(formData: any): boolean {
    for (const pregunta in formData) {
      if (formData.hasOwnProperty(pregunta) && formData[pregunta] !== 'Cumple') {
        return false; // Si alguna respuesta no es "Cumple", la validación falla.
      }
    }
    return true; // Si todas las respuestas son "Cumple", la validación es exitosa.
  }


  getPhotoCar(){
    this.photo.addNewToGallery('car').then(da => {
      console.log(da);
      this.car = da;
    })

   }

  async presentAlert(title: String, subheader: String, desc: String, botton: String ) {
    const alert = await this.alertController.create({
      header: '' + title,
      subHeader: '' + subheader,
      message: '' + desc,
      buttons: ['' + botton],
    });
    await alert.present();
  }
}
