import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../api/user.service';

@Component({
  selector: 'app-preform',
  templateUrl: './preform.page.html',
  styleUrls: ['./preform.page.scss'],
})
export class PreformPage implements OnInit {
  preformForm: FormGroup;
  pregunta1: string = '';
  pregunta2: string = '';
  pregunta3: string = '';
  pregunta4: string = '';
  pregunta5: string = '';
  pregunta6: string = '';
  pregunta7: string = '';
  pregunta8: string = '';
  pregunta9: string = '';
  pregunta10: string = '';
  pregunta11: string = '';
  pregunta12: string = '';
  pregunta13: string = '';
  pregunta14: string = '';
  pregunta15: string = '';
  pregunta16: string = '';
  pregunta17: string = '';
  pregunta18: string = '';
  pregunta19: string = '';
  pregunta20: string = '';
  apiResponseData: any; // Propiedad para almacenar la respuesta de la API
  apiError: string = ''; // Propiedad para manejar los errores

  constructor(private router: Router, private formBuilder: FormBuilder,private userService: UserService) {
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
      apiResponseData:[''],
      apiError:['']
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

      // Llama al servicio para consumir la API
      this.userService.postPreoperacionalData(formData).subscribe(
        (response) => {
          console.log('Respuesta de la API:', response);
          this.apiResponseData = response;


          // Aquí puedes agregar lógica adicional para manejar la respuesta de la API
          // Por ejemplo, mostrar un mensaje al usuario o redirigir a otra página.

          this.resetForm();
        },
        (error) => {
          console.error('Error al consumir la API:', error);

          // Manejo de errores, por ejemplo, mostrar un mensaje de error al usuario.
          this.apiError = 'Error al cargar los datos desde el servidor.';
        }
      );
    } else {
      console.error('Formulario no válido. Revise los campos.');
    }
  }


  resetForm() {
    this.preformForm.reset();
  }



  ngOnInit() {
    if (localStorage.getItem('token') == null) {
      this.router.navigate(['/login']);
    }


  }



}
