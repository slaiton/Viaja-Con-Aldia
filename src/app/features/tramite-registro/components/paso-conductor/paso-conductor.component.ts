import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  CatalogoItem,
  DatosConductorTramite,
  TramiteDetalle
} from '@core/models/tramite-registro.model';

@Component({
  selector: 'app-paso-conductor',
  templateUrl: './paso-conductor.component.html',
  styleUrls: ['./paso-conductor.component.scss']
})
export class PasoConductorComponent implements OnInit, OnChanges {
  @Input() tramite: TramiteDetalle | null = null;
  @Input() guardando = false;
  @Input() cargandoCatalogos = false;
  @Input() tiposDocumento: CatalogoItem[] = [];
  @Input() ciudades: CatalogoItem[] = [];
  @Input() bancos: CatalogoItem[] = [];
  @Input() epsList: CatalogoItem[] = [];
  @Input() arlList: CatalogoItem[] = [];
  @Input() afpList: CatalogoItem[] = [];

  @Output() guardar = new EventEmitter<DatosConductorTramite>();
  @Output() formularioInvalido = new EventEmitter<string>();

  form!: FormGroup;
  ciudadesFiltradas: CatalogoItem[] = [];
  filtroCiudad = '';

  readonly gruposSanguineos = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  readonly categoriasLicencia = ['C1', 'C2', 'C3'];

  constructor(private readonly fb: FormBuilder) {
    this.buildForm();
  }

  ngOnInit(): void {
    this.filtrarCiudades(this.filtroCiudad);
    this.hidratarDesdeTramite();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ciudades']) {
      this.filtrarCiudades(this.filtroCiudad);
    }
    if (changes['tramite'] && this.form) {
      this.hidratarDesdeTramite();
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      tipo_documento: [''],
      documento: [{ value: '', disabled: true }],
      dv: [''],
      ciudad_expedicion: [''],
      nacionalidad: ['COLOMBIA'],
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      fecha_nacimiento: [''],
      grupo_sanguineo: [''],
      ciudad_residencia: [''],
      direccion: [''],
      barrio: [''],
      telefono_1: [''],
      celular: [''],
      celular_empresarial: [''],
      email: ['', [Validators.email]],
      pase_conduccion: [''],
      categoria_pase: [''],
      vigencia_pase: [''],
      clasificado_operacion: [''],
      eps: [''],
      numero_eps: [''],
      vigencia_eps: [''],
      arl: [''],
      numero_arl: [''],
      vigencia_arl: [''],
      afp: [''],
      numero_afp: [''],
      vigencia_afp: [''],
      banco_afiliado: [''],
      cuenta_banco: [''],
      llamar_a: [''],
      parentesco_contacto: [''],
      ciudad_llamar_a: [''],
      telefono_llamar_a: [''],
      referencia_nombre: [''],
      referencia_telefono: [''],
      observacion_documentacion: ['']
    });
  }

  private hidratarDesdeTramite(): void {
    const item = this.tramite?.items?.find((i) => i.entidad === 'CONDUCTOR');
    if (!item?.datos) {
      return;
    }
    const d = item.datos as Partial<DatosConductorTramite>;
    const ref0 = Array.isArray(d.referencias) && d.referencias.length > 0 ? d.referencias[0] : undefined;
    this.form.patchValue(
      {
        tipo_documento: d.tipo_documento ?? '',
        documento: d.documento ?? item.llave ?? '',
        dv: d.dv ?? '',
        ciudad_expedicion: d.ciudad_expedicion ?? '',
        nacionalidad: d.nacionalidad ?? 'COLOMBIA',
        nombre: d.nombre ?? '',
        apellido: d.apellido ?? '',
        fecha_nacimiento: d.fecha_nacimiento ?? '',
        grupo_sanguineo: d.grupo_sanguineo ?? '',
        ciudad_residencia: d.ciudad_residencia ?? '',
        direccion: d.direccion ?? '',
        barrio: d.barrio ?? '',
        telefono_1: d.telefono_1 ?? '',
        celular: d.celular ?? '',
        celular_empresarial: d.celular_empresarial ?? '',
        email: d.email ?? '',
        pase_conduccion: d.pase_conduccion ?? '',
        categoria_pase: d.categoria_pase ?? '',
        vigencia_pase: d.vigencia_pase ?? '',
        clasificado_operacion: d.clasificado_operacion ?? '',
        eps: d.eps ?? '',
        numero_eps: d.numero_eps !== undefined && d.numero_eps !== null ? String(d.numero_eps) : '',
        vigencia_eps: d.vigencia_eps ?? '',
        arl: d.arl ?? '',
        numero_arl: d.numero_arl !== undefined && d.numero_arl !== null ? String(d.numero_arl) : '',
        vigencia_arl: d.vigencia_arl ?? '',
        afp: d.afp ?? '',
        numero_afp: d.numero_afp !== undefined && d.numero_afp !== null ? String(d.numero_afp) : '',
        vigencia_afp: d.vigencia_afp ?? '',
        banco_afiliado: d.banco_afiliado ?? '',
        cuenta_banco: d.cuenta_banco ?? '',
        llamar_a: d.llamar_a ?? '',
        parentesco_contacto: d.parentesco_contacto ?? '',
        ciudad_llamar_a: d.ciudad_llamar_a ?? '',
        telefono_llamar_a: d.telefono_llamar_a ?? '',
        referencia_nombre: ref0?.nombre ?? '',
        referencia_telefono: ref0?.telefono ?? '',
        observacion_documentacion: d.observacion_documentacion ?? ''
      },
      { emitEvent: false }
    );
  }

  filtrarCiudades(query: string): void {
    this.filtroCiudad = query || '';
    const q = this.filtroCiudad.toLowerCase().trim();
    const lista = Array.isArray(this.ciudades) ? this.ciudades : [];
    this.ciudadesFiltradas = q
      ? lista.filter((c) => c.nombre.toLowerCase().includes(q))
      : lista;
  }

  submit(): void {
    if (this.guardando) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.formularioInvalido.emit('Completa los campos obligatorios marcados con *');
      return;
    }

    const raw = this.form.getRawValue() as Record<string, string>;
    const payload: DatosConductorTramite = {};

    const camposTexto: (keyof DatosConductorTramite)[] = [
      'tipo_documento',
      'dv',
      'ciudad_expedicion',
      'nacionalidad',
      'nombre',
      'apellido',
      'fecha_nacimiento',
      'grupo_sanguineo',
      'ciudad_residencia',
      'direccion',
      'barrio',
      'telefono_1',
      'celular',
      'celular_empresarial',
      'email',
      'pase_conduccion',
      'categoria_pase',
      'vigencia_pase',
      'clasificado_operacion',
      'eps',
      'numero_eps',
      'vigencia_eps',
      'arl',
      'numero_arl',
      'vigencia_arl',
      'afp',
      'numero_afp',
      'vigencia_afp',
      'banco_afiliado',
      'cuenta_banco',
      'llamar_a',
      'parentesco_contacto',
      'ciudad_llamar_a',
      'telefono_llamar_a',
      'observacion_documentacion'
    ];

    for (const campo of camposTexto) {
      const val = (raw[campo as string] || '').toString().trim();
      if (val !== '') {
        (payload as Record<string, string>)[campo as string] = val;
      }
    }

    const refNombre = (raw['referencia_nombre'] || '').toString().trim();
    const refTelefono = (raw['referencia_telefono'] || '').toString().trim();
    if (refNombre !== '' || refTelefono !== '') {
      payload.referencias = [{ nombre: refNombre, telefono: refTelefono }];
    }

    this.guardar.emit(payload);
  }
}
