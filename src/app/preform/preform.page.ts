import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../api/user.service';
import { AlertController } from '@ionic/angular';
import { PhotoService } from '../api/photo.service';
import { log } from 'console';
import { Foto } from '../models/photo.interface';
import { GlobalService } from '../api/global.service';
import { environment } from 'src/environments/environment';



@Component({
  selector: 'app-preform',
  templateUrl: './preform.page.html',
  styleUrls: ['./preform.page.scss'],
})
export class PreformPage implements OnInit {
  @ViewChildren('preguntaCard') cards!: QueryList<ElementRef>;

  preformForm: FormGroup;
  apiResponseData: any;
  isSubmitting:boolean = false;
  apiError: any = '';
  placa: any = ''; // Variable para almacenar la placa del vehículo
  car: any = '';
  visiblePreguntas: any[] = [];
  categoriasOpcionales: any[] = [
    { nombre: 'Cisterna', label: '¿ Su vehículo es tipo cisterna ?', aplica: '' },
    { nombre: 'Ninera', label: 'Su vehículo es tipo niñera ?', aplica: '' },
    { nombre: 'Refrigeracion', label: 'Su vehículo es refrigerado ?', aplica: '' },
  ];
  preguntasNoCumplen: any[] = [];
  indexActual: any = 0;
  preguntasCompletas: boolean = false
  preguntas: any = []
  secretsAldia: any = {}


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    public globalService: GlobalService,
    public userService: UserService,
    private alertController: AlertController,
    private route: ActivatedRoute,
    private photo: PhotoService
  ) {
    this.placa = this.userService.getPlaca();
    this.preformForm = this.formBuilder.group({});
    this.secretsAldia = {
      'X-Client-Id': environment.aldia.client_id,
      'X-Client-Secret': environment.aldia.client_secret
    }

    // Crear controles dinámicos según número de preguntas

  }

  async ngOnInit() {

    await this.getPreguntas();

    this.preguntas.forEach((_: any, index: any) => {
      const controlName = 'pregunta' + (index + 1);
      this.preformForm.addControl(controlName, this.formBuilder.control(''));
    });


    this.route.queryParams.subscribe(async params => {

      if (params && params['placa']) {
        this.placa = params['placa'];
        console.log('Placa recibida en preform:', this.placa);
      }
      this.cargarPreguntasVisibles();
    })
  }

  async getPreguntas() {
    try {
      const response: any = await this.globalService.get(
        environment.aldia.uri + 'tercero/preoperacional/preguntas?estado=ACTIVO',
        {},
        undefined,
        this.secretsAldia
      );

      if (!response || !response.data) return [];

      const ordenadas = response.data.sort(
        (a: any, b: any) => a.subpreope_orden - b.subpreope_orden
      );

      // Mapear al formato final
      const preguntasFinal = ordenadas.map((item: any) => ({
        id: item.subpreope_codigo,
        texto: item.subpreope_nombre,
        descripcion: item.subpreope_descripcion,
        categoria: item.subpreope_categoria,
        opcional: item.subpreope_restrictivo === 'SI' ? true : false
      }));

      this.preguntas = preguntasFinal;
      return preguntasFinal;

    } catch (error: any) {
      this.presentAlert('Error al consumir la API:', 'Error', error.data, 'Volver');
      this.apiError = 'Error al cargar los datos desde el servidor.';
    }

  }

  cargarPreguntasVisibles() {
    this.visiblePreguntas = [];

    let p = this.preguntas[this.indexActual];

    if (!p) return;

    console.log(this.categoriasOpcionales);

    if (p.opcional) {
      const categoria = this.categoriasOpcionales.find(c => c.nombre === p.categoria);

      console.log(categoria);


      if (categoria && categoria.aplica === '') {

        this.visiblePreguntas.push({
          tipo: 'categoria',        // <-- tipo especial
          categoria: categoria,
          index: this.indexActual
        });
        return;
      }

      // 3. Si la categoría NO aplica → saltar regunta
      if (categoria && categoria.aplica === false) {
        this.indexActual++;
        this.cargarPreguntasVisibles();
        return;
      }
    }

    this.visiblePreguntas.push({
      id: p.subpreope_codigo,
      tipo: 'pregunta',
      texto: p.texto,
      descripcion: p.descripcion,
      categoria: p.categoria,
      index: this.indexActual
    });

    const controlName = 'pregunta' + (this.indexActual + 1);
    this.preformForm.get(controlName)?.reset();
  }


  responder(index: number, event: any) {
    let valor = event.detail.value
    if (valor === "No Cumple") {
      const pregunta = this.preguntas[index];

      // Evitar duplicados si el usuario vuelve atrás
      const yaExiste = this.preguntasNoCumplen.some(p => p.index === index);

      if (!yaExiste && !pregunta.opcional) {
        this.preguntasNoCumplen.push({
          index,
          texto: pregunta.texto,
          descripcion: pregunta.descripcion
        });
      }
    }

    this.indexActual++;
    this.preformForm.get('pregunta' + (this.indexActual))?.setValue(valor);
    if (this.indexActual >= this.preguntas.length) {
      // Terminó todas las preguntas
      this.visiblePreguntas = [];
      this.preguntasCompletas = true;
      return;
    }

    console.log(this.indexActual);



    const card = this.cards.find(c =>
      c.nativeElement.getAttribute('data-index') == index
    );

    console.log(this.preformForm.value);



    this.cargarPreguntasVisibles();

    // this.preformForm.get('pregunta' + (index+1))?.reset();

  }

  setCategoria(categoria: any, event: any) {

    const index = this.categoriasOpcionales.findIndex(c => c.nombre === categoria);

    if (index !== -1) {
      const response = event.detail.value === 'true' ? true : false
      this.categoriasOpcionales[index].aplica = response;
    }

    console.log(index);


    this.indexActual++;
    this.cargarPreguntasVisibles();
  }

  marcarSolucionado(index: number) {

    const controlName = 'pregunta' + (index + 1);

    // Cambiar valor en el formulario
    this.preformForm.get(controlName)?.setValue("Cumple");

    // Quitar de la lista de no cumple
    this.preguntasNoCumplen = this.preguntasNoCumplen.filter(p => p.index !== index);

    console.log("Pregunta solucionada:", index);
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    console.log('Archivo seleccionado:', file);
  }

  async submitForm() {
    if (this.preformForm.valid) {
      const formData = this.preformForm.value;
      console.log('Datos a enviar al servidor:', formData);

      // Validar que se tome la foto del vehiculo
      if (!this.car) {
        this.presentAlert('Por favor, cargue una foto del vehículo.', 'Click a la camara', '', 'Volver');
        return;
      }


      const respuestas = this.preguntas.map((p: any, index: number) => {
        const controlName = 'pregunta' + (index + 1);

        

        return {
          id: this.preguntas[index].id,
          respuesta: this.preformForm.value[controlName] != '' ? this.preformForm.value[controlName]?.toUpperCase() : 'NO CUMPLE'
        };
      });

      const confirmation = this.preguntasNoCumplen.length == 0 ? 1 : 0;

      const jsonEnvio = {
        vehiculo: this.placa,
        empresa: 1,
        confirmacion: confirmation,
        imagen : this.car.base64,
        respuestas: respuestas
      };

      this.isSubmitting = true;

      try {

        const response: any = await this.globalService.post(environment.aldia.uri + 'tercero/preoperacional', jsonEnvio, undefined, this.secretsAldia);


        this.presentAlert('Mensaje de Aldia:', '', response.data, 'Confirmar', '/home')
        this.apiResponseData = response;

        // Aquí puedes agregar lógica adicional para manejar la respuesta de la API
        // Por ejemplo, mostrar un mensaje al usuario o redirigir a otra página.

        this.resetForm();


      } catch (error: any) {
        this.isSubmitting = false;
        this.presentAlert('Error al consumir la API:', 'Error', error.data, 'Volver');
        this.apiError = 'Error al cargar los datos desde el servidor.';
      }
      
    } else {
      this.presentAlert('Error al enviar', '', 'Complete todos los campos', 'Volver');
    }
  }

  resetForm() {
    this.preformForm.reset();
  }

  validarRespuestas(formData: any): boolean {
    for (const pregunta in formData) {
      if (formData.hasOwnProperty(pregunta) && formData[pregunta] !== 'Cumple') {
        return false; // Si alguna respuesta no es "Cumple", la validación falla.
      }
    }
    return true; // Si todas las respuestas son "Cumple", la validación es exitosa.
  }


  getPhotoCar() {
    this.photo.addNewToAll('car').then(da => {
      console.log(da);
      this.car = da;
    })

  }

  async presentAlert(title: String, subheader: String, desc: String, botton: String, route?: string) {
    const alert = await this.alertController.create({
      header: '' + title,
      subHeader: '' + subheader,
      message: '' + desc,
      buttons: [ {
          text: '' + botton,
          handler: () => {
            if (route) {
          this.router.navigateByUrl(route);
        }
          },
        }],
    });
    await alert.present();
  }
}
