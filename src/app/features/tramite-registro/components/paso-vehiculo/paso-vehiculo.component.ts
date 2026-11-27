import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import {
  CatalogoItem,
  DatosVehiculoTramite,
  TramiteDetalle
} from '@core/models/tramite-registro.model';
import { CatalogosAppApi } from '@domain/catalogos-app.api';

@Component({
  selector: 'app-paso-vehiculo',
  templateUrl: './paso-vehiculo.component.html',
  styleUrls: ['./paso-vehiculo.component.scss']
})
export class PasoVehiculoComponent implements OnInit, OnChanges {
  @Input() tramite: TramiteDetalle | null = null;
  @Input() cedulaConductor: string | null = null;
  @Input() guardando = false;

  @Output() guardar = new EventEmitter<DatosVehiculoTramite>();

  form!: FormGroup;

  clasesVehiculo: CatalogoItem[] = [];
  marcas: CatalogoItem[] = [];
  lineas: CatalogoItem[] = [];
  carrocerias: CatalogoItem[] = [];
  aseguradoras: CatalogoItem[] = [];
  paises: CatalogoItem[] = [];
  colores: CatalogoItem[] = [];
  proveedoresGps: CatalogoItem[] = [];

  cargandoCatalogos = false;
  cargandoLineas = false;

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
    if ((changes['tramite'] || changes['cedulaConductor']) && this.form) {
      this.hidratarDesdeTramite();
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      placa: [{ value: '', disabled: true }],
      pais: ['COLOMBIA'],
      tarjeta_propiedad: [''],
      fecha_matricula: [''],
      tipo_servicio: ['PÚBLICO'],
      cedula_propietario: ['', [Validators.required]],
      cedula_poseedor: [''],
      clase_vehiculo: ['', [Validators.required]],
      marca: ['', [Validators.required]],
      clase_linea: [''],
      carroceria: [''],
      color: [''],
      modelo: [''],
      numero_ejes: [''],
      numero_motor: [''],
      numero_chasis: [''],
      capacidad: [''],
      peso_bruto: [''],
      peso_vacio: [''],
      alto: [''],
      largo: [''],
      ancho: [''],
      aseguradora: [''],
      soat: [''],
      vigencia_soat: [''],
      poliza: [''],
      tecnomecanica: [''],
      vigencia_tecnomecanica: [''],
      posee_gps: [''],
      proveedor_gps: [''],
      usuario_gps: [''],
      clave_gps: [''],
      cuenta_gps: [''],
      vencimiento_gps: [''],
      observacion: ['']
    });
  }

  private cargarCatalogos(): void {
    this.cargandoCatalogos = true;
    forkJoin({
      clasesVehiculo: this.catalogosApi.obtenerCatalogo('clasevehiculo'),
      marcas: this.catalogosApi.obtenerCatalogo('marcavehiculo'),
      carrocerias: this.catalogosApi.obtenerCatalogo('carroceria'),
      aseguradoras: this.catalogosApi.obtenerCatalogo('aseguradora'),
      paises: this.catalogosApi.obtenerCatalogo('pais'),
      colores: this.catalogosApi.obtenerCatalogo('color'),
      proveedoresGps: this.catalogosApi.obtenerCatalogo('proveedorgps')
    }).subscribe({
      next: (res) => {
        this.clasesVehiculo = res.clasesVehiculo;
        this.marcas = res.marcas;
        this.carrocerias = res.carrocerias;
        this.aseguradoras = res.aseguradoras;
        this.paises = res.paises;
        this.colores = res.colores;
        this.proveedoresGps = res.proveedoresGps;
        this.cargandoCatalogos = false;

        const marcaActual = String(this.form.get('marca')?.value || '');
        if (marcaActual) {
          this.cargarLineasPorMarcaNombre(marcaActual);
        }
      },
      error: () => {
        this.cargandoCatalogos = false;
      }
    });
  }

  onMarcaChange(marcaNombre: string): void {
    this.form.patchValue({ clase_linea: '' }, { emitEvent: false });
    this.cargarLineasPorMarcaNombre(marcaNombre);
  }

  private cargarLineasPorMarcaNombre(marcaNombre: string): void {
    const encontrada = this.marcas.find((m) => m.nombre === marcaNombre);
    if (!encontrada) {
      this.lineas = [];
      return;
    }

    this.cargandoLineas = true;
    this.catalogosApi.obtenerCatalogo('claselinea', encontrada.id).subscribe({
      next: (items) => {
        this.lineas = items;
        this.cargandoLineas = false;
      },
      error: () => {
        this.lineas = [];
        this.cargandoLineas = false;
      }
    });
  }

  private hidratarDesdeTramite(): void {
    const item = this.tramite?.items?.find((i) => i.entidad === 'VEHICULO');
    const conductorItem = this.tramite?.items?.find((i) => i.entidad === 'CONDUCTOR');
    const d = (item?.datos || {}) as Partial<DatosVehiculoTramite>;
    const docConductorFallback =
      d.cedula_conductor ||
      (conductorItem?.datos?.['documento'] as string | undefined) ||
      this.cedulaConductor ||
      '';

    this.form.patchValue(
      {
        placa: d.placa ?? item?.llave ?? this.tramite?.placa ?? '',
        pais: d.pais ?? 'COLOMBIA',
        tarjeta_propiedad: d.tarjeta_propiedad ?? '',
        fecha_matricula: d.fecha_matricula ?? '',
        tipo_servicio: d.tipo_servicio ?? 'PÚBLICO',
        cedula_propietario: d.cedula_propietario ?? docConductorFallback,
        cedula_poseedor: d.cedula_poseedor ?? '',
        clase_vehiculo: d.clase_vehiculo ?? '',
        marca: d.marca ?? '',
        clase_linea: d.clase_linea ?? '',
        carroceria: d.carroceria ?? '',
        color: d.color ?? '',
        modelo: d.modelo ?? '',
        numero_ejes: d.numero_ejes !== undefined && d.numero_ejes !== null ? String(d.numero_ejes) : '',
        numero_motor: d.numero_motor ?? '',
        numero_chasis: d.numero_chasis ?? '',
        capacidad: d.capacidad !== undefined && d.capacidad !== null ? String(d.capacidad) : '',
        peso_bruto: d.peso_bruto !== undefined && d.peso_bruto !== null ? String(d.peso_bruto) : '',
        peso_vacio: d.peso_vacio !== undefined && d.peso_vacio !== null ? String(d.peso_vacio) : '',
        alto: d.alto !== undefined && d.alto !== null ? String(d.alto) : '',
        largo: d.largo !== undefined && d.largo !== null ? String(d.largo) : '',
        ancho: d.ancho !== undefined && d.ancho !== null ? String(d.ancho) : '',
        aseguradora: d.aseguradora ?? '',
        soat: d.soat ?? '',
        vigencia_soat: d.vigencia_soat ?? '',
        poliza: d.poliza ?? '',
        tecnomecanica: d.tecnomecanica ?? '',
        vigencia_tecnomecanica: d.vigencia_tecnomecanica ?? '',
        posee_gps: d.posee_gps ?? '',
        proveedor_gps: d.proveedor_gps ?? '',
        usuario_gps: d.usuario_gps ?? '',
        clave_gps: d.clave_gps ?? '',
        cuenta_gps: d.cuenta_gps ?? '',
        vencimiento_gps: d.vencimiento_gps ?? '',
        observacion: d.observacion ?? ''
      },
      { emitEvent: false }
    );

    if (d.marca && this.marcas.length > 0) {
      this.cargarLineasPorMarcaNombre(d.marca);
    }
  }

  async submit(): Promise<void> {
    if (this.guardando) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const toast = await this.toastCtrl.create({
        message: 'Completa Clase, Marca y Propietario antes de continuar',
        duration: 2400,
        position: 'top',
        color: 'warning'
      });
      await toast.present();
      return;
    }

    const raw = this.form.getRawValue() as Record<string, string>;
    const payload: DatosVehiculoTramite = {};

    const camposTexto: (keyof DatosVehiculoTramite)[] = [
      'pais',
      'tarjeta_propiedad',
      'fecha_matricula',
      'tipo_servicio',
      'cedula_propietario',
      'cedula_poseedor',
      'clase_vehiculo',
      'marca',
      'clase_linea',
      'carroceria',
      'color',
      'modelo',
      'numero_ejes',
      'numero_motor',
      'numero_chasis',
      'aseguradora',
      'soat',
      'vigencia_soat',
      'poliza',
      'tecnomecanica',
      'vigencia_tecnomecanica',
      'posee_gps',
      'proveedor_gps',
      'usuario_gps',
      'clave_gps',
      'cuenta_gps',
      'vencimiento_gps',
      'observacion'
    ];

    for (const campo of camposTexto) {
      const val = (raw[campo as string] || '').toString().trim();
      if (val !== '') {
        (payload as Record<string, string>)[campo as string] = val;
      }
    }

    const camposNumericos: (keyof DatosVehiculoTramite)[] = [
      'capacidad',
      'peso_bruto',
      'peso_vacio',
      'alto',
      'largo',
      'ancho'
    ];

    for (const campo of camposNumericos) {
      const val = (raw[campo as string] || '').toString().trim();
      if (val !== '' && !isNaN(Number(val))) {
        (payload as Record<string, number>)[campo as string] = Number(val);
      }
    }

    this.guardar.emit(payload);
  }
}
