import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import {
  CatalogoItem,
  DatosConductorTramite,
  TramiteDetalle
} from '@core/models/tramite-registro.model';
import { CatalogosAppApi } from '@domain/catalogos-app.api';

@Component({
  selector: 'app-paso-conductor',
  templateUrl: './paso-conductor.component.html',
  styleUrls: ['./paso-conductor.component.scss']
})
export class PasoConductorComponent implements OnInit, OnChanges {
  @Input() tramite: TramiteDetalle | null = null;
  @Input() guardando = false;

  @Output() guardar = new EventEmitter<DatosConductorTramite>();

  form!: FormGroup;

  tiposDocumento: CatalogoItem[] = [];
  ciudades: CatalogoItem[] = [];
  ciudadesFiltradas: CatalogoItem[] = [];
  filtroCiudad = '';
  bancos: CatalogoItem[] = [];
  epsList: CatalogoItem[] = [];
  arlList: CatalogoItem[] = [];
  afpList: CatalogoItem[] = [];

  cargandoCatalogos = false;

  readonly gruposSanguineos = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  readonly categoriasLicencia = ['C1', 'C2', 'C3'];

  constructor(
    private readonly fb: FormBuilder,
    private readonly catalogosApi: CatalogosAppApi,
    private readonly toastCtrl: ToastController
  ) {
    this.buildForm();
  }

  ngOnInit(): void {
    this.cargarCatalogos();
    this.hidratarDesdeTramite();
  }

  ngOnChanges(changes: SimpleChanges): void {
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

  private cargarCatalogos(): void {
    this.cargandoCatalogos = true;
    forkJoin({
      tiposDocumento: this.catalogosApi.obtenerCatalogo('tipodocumento'),
      ciudades: this.catalogosApi.obtenerCatalogo('ciudad'),
      bancos: this.catalogosApi.obtenerCatalogo('banco'),
      eps: this.catalogosApi.obtenerCatalogo('eps'),
      arl: this.catalogosApi.obtenerCatalogo('arl'),
      afp: this.catalogosApi.obtenerCatalogo('afp')
    }).subscribe({
      next: (res) => {
        this.tiposDocumento = res.tiposDocumento;
        this.ciudades = res.ciudades;
        this.ciudadesFiltradas = res.ciudades;
        this.bancos = res.bancos;
        this.epsList = res.eps;
        this.arlList = res.arl;
        this.afpList = res.afp;
        this.cargandoCatalogos = false;
      },
      error: () => {
        this.cargandoCatalogos = false;
      }
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
    const q = (query || '').toLowerCase().trim();
    this.ciudadesFiltradas = q
      ? this.ciudades.filter((c) => c.nombre.toLowerCase().includes(q))
      : this.ciudades;
  }

  async submit(): Promise<void> {
    if (this.guardando) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const toast = await this.toastCtrl.create({
        message: 'Completa los campos obligatorios marcados con *',
        duration: 2400,
        position: 'top',
        color: 'warning'
      });
      await toast.present();
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
