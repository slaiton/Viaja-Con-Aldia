import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private router: Router, private formBuilder: FormBuilder) {
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
      // Aquí debes agregar la lógica para enviar los datos al servidor.
      // Por ahora, solo se muestran los datos en la consola.

      this.resetForm();
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
