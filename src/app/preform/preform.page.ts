import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  @ViewChildren('preguntaCard') cards!: QueryList<ElementRef>;

  preformForm: FormGroup;
  apiResponseData: any;
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

  preguntas = [
    {
      texto: "¿Cuenta con los documentos del vehículo y del conductor vigentes?",
      descripcion: "Incluye licencia de tránsito, SOAT, revisión técnico-mecánica, licencia de conducción, cédula, certificado de luz negra (cuando aplique).",
      categoria: "Documentación",
      opcional: false
    },
    {
      texto: "¿Los niveles de fluidos están en su nivel óptimo?",
      descripcion: "Verifique aceite, refrigerante, agua del limpiaparabrisas, líquido de frenos y dirección.",
      categoria: "Fluidos / Mecánica",
      opcional: false
    },
    {
      texto: "¿Los cinturones de seguridad de 3 puntos están instalados y funcionales?",
      descripcion: "Debe tener retracción automática, sin deshilachados, con enganche/desenganche correcto.",
      categoria: "Seguridad Pasiva",
      opcional: false
    },
    {
      texto: "¿Los espejos están instalados, ajustados y en buen estado?",
      descripcion: "Incluye espejo izquierdo, derecho, retrovisor central y convexos sin obstrucciones.",
      categoria: "Espejos / Visibilidad",
      opcional: false
    },
    {
      texto: "¿La alarma auditiva de reversa está instalada y funcional?",
      descripcion: "Debe activarse automáticamente al usar marcha atrás.",
      categoria: "Seguridad Activa",
      opcional: false
    },
    {
      texto: "¿El sistema de frenos está en buen estado y funcional?",
      descripcion: "Sin fugas ni desgaste excesivo, mantenimiento al día según fabricante.",
      categoria: "Fluidos / Mecánica",
      opcional: false
    },
    {
      texto: "¿Los airbags están instalados y funcionales?",
      descripcion: "Aplica si los airbags vienen de fábrica. Si no aplica, seleccionar N/A.",
      categoria: "Seguridad Pasiva",
      opcional: true
    },
    {
      texto: "¿El parabrisas y ventanas están en buen estado?",
      descripcion: "Sin grietas, perforaciones. Ventanas funcionales.",
      categoria: "Espejos / Visibilidad",
      opcional: false
    },
    {
      texto: "¿El sistema de limpiaparabrisas funciona correctamente?",
      descripcion: "Ambas velocidades, aspersor operativo, escobillas en buen estado.",
      categoria: "Espejos / Visibilidad",
      opcional: false
    },
    {
      texto: "¿Cuenta con protección contra impactos laterales (bicicleteros)?",
      descripcion: "Obligatorio para camiones y remolques N2, N3, O3 y O4 con peso bruto > 3500 kg. (Cuando aplique)",
      categoria: "Seguridad Pasiva",
      opcional: true
    },
    {
      texto: "¿La cabina está en buen estado?",
      descripcion: "Limpia, sin objetos distractores, escalones y pasamanos firmes.",
      categoria: "Carrocería / Cabina",
      opcional: false
    },
    {
      texto: "¿Las luces externas e internas están funcionales?",
      descripcion: "Incluye altas, bajas, reversa, direccionales e internas de cabina.",
      categoria: "Eléctrico / Luces",
      opcional: false
    },
    {
      texto: "¿Las luces de freno son funcionales?",
      descripcion: "Debe funcionar las dos traseras y la tercera luz elevada si aplica.",
      categoria: "Eléctrico / Luces",
      opcional: false
    },
    {
      texto: "¿El apoyacabezas del conductor está ajustable y en buen estado?",
      descripcion: "Aplica para vehículos livianos.",
      categoria: "Seguridad Pasiva",
      opcional: true
    },
    {
      texto: "¿La silla del conductor está en buen estado?",
      descripcion: "Debe estar ajustable, sin rupturas, conforme a especificaciones del fabricante.",
      categoria: "Carrocería / Cabina",
      opcional: false
    },
    {
      texto: "¿Las llantas (incluyendo repuesto) están en buen estado?",
      descripcion: "Profundidad ≥ 3 mm, presión adecuada, sin cortes o deformaciones.",
      categoria: "Llantas",
      opcional: false
    },
    {
      texto: "¿Las llantas reencauchadas cumplen con la normatividad?",
      descripcion: "Deben ser curado en frío y ubicarse solo en ejes traseros. Si no aplica, marcar N/A.",
      categoria: "Llantas",
      opcional: true
    },
    {
      texto: "¿El botiquín está completo y en buen estado?",
      descripcion: "Debe incluir todos los elementos requeridos y con fechas vigentes.",
      categoria: "Equipos de Emergencia",
      opcional: false
    },
    {
      texto: "¿El kit de carretera está completo y en buen estado?",
      descripcion: "Incluye señales, cruceta, gato, herramientas, extintores, linterna, tacos, chalecos, repuesto, etc.",
      categoria: "Equipos de Emergencia",
      opcional: false
    },
    {
      texto: "¿El vehículo cuenta con la señalización reglamentaria vigente?",
      descripcion: "Incluye placas, reflectivos, avisos y rotulación según el tipo de carga.",
      categoria: "Señalización / Accesorios",
      opcional: false
    },
    {
      texto: "¿El sistema GPS está instalado y operativo?",
      descripcion: "Debe permitir localización y seguimiento.",
      categoria: "GPS / Tecnología",
      opcional: false
    },
    {
      texto: "Si transporta químicos o mercancías peligrosas, ¿el kit de control de derrames está completo?",
      descripcion: "Incluye barreras, absorbentes, guantes, herramientas, cinta, plástico, jabón, etc. Si no aplica, marcar N/A.",
      categoria: "Materiales Peligrosos",
      opcional: true
    },
    {
      texto: "Para vehículos tipo cisterna: ¿La cisterna está en buen estado general?",
      descripcion: "Sin daños, deformaciones. Si no aplica, marcar N/A.",
      categoria: "Cisterna",
      opcional: true
    },
    {
      texto: "Para vehículos tipo cisterna: ¿Cuenta con tabla de aforo vigente?",
      descripcion: "",
      categoria: "Cisterna",
      opcional: true
    },
    {
      texto: "Para vehículos tipo cisterna: ¿Los certificados de hermeticidad y presión están vigentes?",
      descripcion: "",
      categoria: "Cisterna",
      opcional: true
    },
    {
      texto: "Para vehículos tipo cisterna: ¿Tapas, válvulas y desagües están cerrados y en buen estado?",
      descripcion: "",
      categoria: "Cisterna",
      opcional: true
    },
    {
      texto: "Para vehículos tipo cisterna: ¿No hay fugas en válvulas, mangueras ni conexiones?",
      descripcion: "",
      categoria: "Cisterna",
      opcional: true
    },
    {
      texto: "Para vehículos tipo cisterna: ¿El sistema de corte de emergencia es funcional?",
      descripcion: "",
      categoria: "Cisterna",
      opcional: true
    },
    {
      texto: "Para vehículos tipo cisterna: ¿Las conexiones están en buen estado y seguras?",
      descripcion: "",
      categoria: "Cisterna",
      opcional: true
    },
    {
      texto: "Para vehículos tipo niñera: ¿Las guías de seguridad no están deformadas ni rotas?",
      descripcion: "",
      categoria: "Ninera",
      opcional: true
    },
    {
      texto: "Para vehículos tipo niñera: ¿No hay óxido en la estructura?",
      descripcion: "",
      categoria: "Ninera",
      opcional: true
    },
    {
      texto: "Para vehículos tipo niñera: ¿Las rampas de paso están instaladas correctamente?",
      descripcion: "",
      categoria: "Ninera",
      opcional: true
    },
    {
      texto: "Para vehículos tipo niñera: ¿Las guayas no están deshilachadas ni rozan partes de la estructura?",
      descripcion: "Incluye guardabarro, estructura, etc.",
      categoria: "Ninera",
      opcional: true
    },
    {
      texto: "Para vehículos tipo niñera: ¿No hay fugas en mangueras de aire?",
      descripcion: "",
      categoria: "Ninera",
      opcional: true
    },
    {
      texto: "Para vehículos tipo niñera: ¿Cuenta con aviso de carga larga y reflectivos?",
      descripcion: "",
      categoria: "Ninera",
      opcional: true
    },
    {
      texto: "Para vehículos con refrigeración: ¿El nivel de refrigerante es adecuado?",
      descripcion: "",
      categoria: "Refrigeracion",
      opcional: true
    },
    {
      texto: "Para vehículos con refrigeración: ¿El radiador no presenta fugas ni corrosión?",
      descripcion: "",
      categoria: "Refrigeracion",
      opcional: true
    },
    {
      texto: "Para vehículos con refrigeración: ¿Las mangueras están en buen estado?",
      descripcion: "Sin grietas, burbujas o desgaste.",
      categoria: "Refrigeracion",
      opcional: true
    },
    {
      texto: "Para vehículos con refrigeración: ¿El depósito de expansión está en buen estado y bien cerrado?",
      descripcion: "",
      categoria: "Refrigeracion",
      opcional: true
    },
    {
      texto: "¿Ha dormido al menos 7 horas y se siente alerta?",
      descripcion: "Evalúa signos de fatiga antes de conducir.",
      categoria: "Estado del Conductor",
      opcional: false
    },
    {
      texto: "¿En las últimas horas ha estado expuesto a factores que generen fatiga?",
      descripcion: "Incluye comidas pesadas, medicamentos, turnos extendidos.",
      categoria: "Estado del Conductor",
      opcional: false
    },
    {
      texto: "¿Su estado de salud es óptimo para conducir?",
      descripcion: "Sin fatiga, somnolencia o malestar.",
      categoria: "Estado del Conductor",
      opcional: false
    },
    {
      texto: "¿Ha tenido situaciones personales que puedan afectar su conducción?",
      descripcion: "",
      categoria: "Estado del Conductor",
      opcional: false
    }
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    public userService: UserService,
    private alertController: AlertController,
    private route: ActivatedRoute,
    private photo: PhotoService
  ) {
    this.placa = this.userService.getPlaca();
    this.preformForm = this.formBuilder.group({});

    // Crear controles dinámicos según número de preguntas
    this.preguntas.forEach((_, index) => {
      const controlName = 'pregunta' + (index + 1);
      this.preformForm.addControl(controlName, this.formBuilder.control(''));
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(async params => {

      if (params && params['placa']) {
        this.placa = params['placa'];
        console.log('Placa recibida en preform:', this.placa);
      }
      this.cargarPreguntasVisibles();
    })
  }

  cargarPreguntasVisibles() {
    this.visiblePreguntas = [];

    // for (let i = 0; i < 1; i++) {
    //   if (this.preguntas[this.indexActual + i]) {
    //     this.visiblePreguntas.push({
    //       texto: this.preguntas[this.indexActual + i].texto,
    //       descripcion: this.preguntas[this.indexActual + i].descripcion,
    //       index: this.indexActual + i,
    //       respuesta: null
    //     });
    //   }
    // }

    let p = this.preguntas[this.indexActual];

    if (!p) return;

    console.log(this.categoriasOpcionales);
    

    // 🔍 1. Si la pregunta es opcional, debemos revisar la categoría
    if (p.opcional) {
      const categoria = this.categoriasOpcionales.find(c => c.nombre === p.categoria);

      console.log(categoria);
      

      // ❓ 2. Si la categoría aún no tiene respuesta → mostrar pantalla de selección
      if (categoria && categoria.aplica === '') {

        
        this.visiblePreguntas.push({
          tipo: 'categoria',        // <-- tipo especial
          categoria: categoria,
          index: this.indexActual
        });
        return; // 🚫 No mostrar pregunta todavía
      }

      // ❌ 3. Si la categoría NO aplica → saltar pregunta
      if (categoria && categoria.aplica === false) {
        this.indexActual++;
        this.cargarPreguntasVisibles();
        return;
      }
    }

    this.visiblePreguntas.push({
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
    const response =  event.detail.value === 'true' ? true : false
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

  submitForm() {
    if (this.preformForm.valid) {
      const formData = this.preformForm.value;
      console.log('Datos a enviar al servidor:', formData);

      // Validar que se tome la foto del vehiculo
      if (!this.car) {
        this.presentAlert('Por favor, cargue una foto del vehículo.', 'Click a la camara', 'dddd', 'Volver');
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
            this.presentAlert('¡¡Exito!!', 'Preoperacional cargado con exito', response.data, 'Confirmar')
            console.log('Respuesta de la API:', response);
            this.apiResponseData = response;

            // Aquí puedes agregar lógica adicional para manejar la respuesta de la API
            // Por ejemplo, mostrar un mensaje al usuario o redirigir a otra página.

            this.resetForm();
          },
          (error) => {
            this.presentAlert('Error al consumir la API:', 'Error', error.data, 'Volver');

            // Manejo de errores, por ejemplo, mostrar un mensaje de error al usuario.
            this.apiError = 'Error al cargar los datos desde el servidor.';
          }
        );
      } else {

        this.presentAlert('Formulario no válido', 'Revisar', 'Algunas respuestas son "No Cumple"', 'Volver');
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



  validarRespuestas(formData: any): boolean {
    for (const pregunta in formData) {
      if (formData.hasOwnProperty(pregunta) && formData[pregunta] !== 'Cumple') {
        return false; // Si alguna respuesta no es "Cumple", la validación falla.
      }
    }
    return true; // Si todas las respuestas son "Cumple", la validación es exitosa.
  }


  getPhotoCar() {
    this.photo.addNewToGallery('car').then(da => {
      console.log(da);
      this.car = da;
    })

  }

  async presentAlert(title: String, subheader: String, desc: String, botton: String) {
    const alert = await this.alertController.create({
      header: '' + title,
      subHeader: '' + subheader,
      message: '' + desc,
      buttons: ['' + botton],
    });
    await alert.present();
  }
}
