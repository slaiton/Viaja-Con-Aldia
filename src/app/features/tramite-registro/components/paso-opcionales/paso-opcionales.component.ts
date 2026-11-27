import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CatalogoItem, DatosTerceroOpcionalTramite, DatosTrailerTramite, EntidadTramiteUpper, TramiteDetalle } from '@core/models/tramite-registro.model';
import { CoreLoggerService } from '@core/services/core-logger.service';
import { CatalogosAppApi } from '@domain/catalogos-app.api';

export type EntidadOpcionalSlug = 'trailer' | 'propietario' | 'tenedor';

@Component({
  selector: 'app-paso-opcionales',
  templateUrl: './paso-opcionales.component.html',
  styleUrls: ['./paso-opcionales.component.scss']
})
export class PasoOpcionalesComponent implements OnInit, OnChanges {
  @Input() tramite: TramiteDetalle | null = null;
  @Input() guardando = false;

  @Output() guardarEntidad = new EventEmitter<{
    entidad: EntidadOpcionalSlug;
    datos: DatosTrailerTramite | DatosTerceroOpcionalTramite;
  }>();
  @Output() eliminarEntidad = new EventEmitter<EntidadOpcionalSlug>();
  @Output() continuar = new EventEmitter<void>();

  activo: Record<EntidadOpcionalSlug, boolean> = {
    trailer: false,
    propietario: false,
    tenedor: false
  };

  trailerForm!: FormGroup;
  propietarioForm!: FormGroup;
  tenedorForm!: FormGroup;

  carrocerias: CatalogoItem[] = [];
  marcas: CatalogoItem[] = [];
  tiposDocumento: CatalogoItem[] = [];
  ciudades: CatalogoItem[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly catalogosApi: CatalogosAppApi,
    private readonly coreLogger: CoreLoggerService
  ) {
    this.buildForms();
  }

  ngOnInit(): void {
    this.cargarCatalogos();
    this.hidratarDesdeTramite();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tramite'] && this.trailerForm) {
      this.hidratarDesdeTramite();
    }
  }

  tieneEntidad(entidad: EntidadTramiteUpper): boolean {
    return Boolean(this.tramite?.items?.some((i) => i.entidad === entidad));
  }

  onToggleSeccion(slug: EntidadOpcionalSlug, upper: EntidadTramiteUpper, checked: boolean): void {
    const tieneEntidad = this.tieneEntidad(upper);
    this.coreLogger.info('PASO3_OPCIONALES_TOGGLE', { slug, upper, checked, tieneEntidad, guardando: this.guardando });
    this.activo[slug] = checked;
    if (!checked && tieneEntidad) {
      this.eliminarEntidad.emit(slug);
    }
  }

  private buildForms(): void {
    this.trailerForm = this.fb.group({
      placa_trailer: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\s\-]{5,8}$/)]],
      tipo_carroceria: [''],
      marca_trailer: [''],
      modelo: [''],
      numero_ejes: [''],
      peso_vacio: [''],
      documento_propietario: [''],
      documento_poseedor: ['']
    });

    this.propietarioForm = this.createTerceroForm();
    this.tenedorForm = this.createTerceroForm();
  }

  private createTerceroForm(): FormGroup {
    return this.fb.group({
      tipo_documento: [''],
      documento: ['', [Validators.required, Validators.pattern(/^[0-9A-Za-z\-]{3,30}$/)]],
      dv: [''],
      nombre: ['', [Validators.required]],
      apellido: [''],
      ciudad_residencia: [''],
      direccion: [''],
      celular: [''],
      email: ['', [Validators.email]]
    });
  }

  private cargarCatalogos(): void {
    forkJoin({
      carrocerias: this.catalogosApi.obtenerCatalogo('carroceria'),
      marcas: this.catalogosApi.obtenerCatalogo('marcavehiculo'),
      tiposDocumento: this.catalogosApi.obtenerCatalogo('tipodocumento'),
      ciudades: this.catalogosApi.obtenerCatalogo('ciudad')
    }).subscribe({
      next: (res) => {
        this.carrocerias = res.carrocerias;
        this.marcas = res.marcas;
        this.tiposDocumento = res.tiposDocumento;
        this.ciudades = res.ciudades;
      },
      error: () => { /* catalogs degrade silently — selects replaced by text inputs */ }
    });
  }

  private hidratarDesdeTramite(): void {
    const trailerItem = this.tramite?.items?.find((i) => i.entidad === 'TRAILER');
    if (trailerItem?.datos) {
      this.activo.trailer = true;
      const t = trailerItem.datos as Partial<DatosTrailerTramite>;
      this.trailerForm.patchValue(
        {
          placa_trailer: t.placa_trailer ?? trailerItem.llave ?? '',
          tipo_carroceria: t.tipo_carroceria ?? '',
          marca_trailer: t.marca_trailer ?? '',
          modelo: t.modelo ?? '',
          numero_ejes: t.numero_ejes ?? '',
          peso_vacio: t.peso_vacio !== undefined && t.peso_vacio !== null ? String(t.peso_vacio) : '',
          documento_propietario: t.documento_propietario ?? '',
          documento_poseedor: t.documento_poseedor ?? ''
        },
        { emitEvent: false }
      );
    } else {
      this.trailerForm.reset({}, { emitEvent: false });
    }

    this.hidratarTercero('PROPIETARIO', 'propietario', this.propietarioForm);
    this.hidratarTercero('TENEDOR', 'tenedor', this.tenedorForm);
  }

  private hidratarTercero(
    entidad: 'PROPIETARIO' | 'TENEDOR',
    slug: 'propietario' | 'tenedor',
    form: FormGroup
  ): void {
    const item = this.tramite?.items?.find((i) => i.entidad === entidad);
    if (!item?.datos) {
      form.reset({}, { emitEvent: false });
      return;
    }
    this.activo[slug] = true;
    const d = item.datos as Partial<DatosTerceroOpcionalTramite>;
    form.patchValue(
      {
        tipo_documento: d.tipo_documento ?? '',
        documento: d.documento ?? item.llave ?? '',
        dv: d.dv ?? '',
        nombre: d.nombre ?? '',
        apellido: d.apellido ?? '',
        ciudad_residencia: d.ciudad_residencia ?? '',
        direccion: d.direccion ?? '',
        celular: d.celular ?? '',
        email: d.email ?? ''
      },
      { emitEvent: false }
    );
  }

  submitTrailer(): void {
    if (this.trailerForm.invalid || this.guardando) {
      this.trailerForm.markAllAsTouched();
      return;
    }

    const raw = this.trailerForm.getRawValue() as Record<string, string>;
    const datos: DatosTrailerTramite = {};

    const camposTexto: (keyof DatosTrailerTramite)[] = [
      'placa_trailer',
      'tipo_carroceria',
      'marca_trailer',
      'modelo',
      'numero_ejes',
      'documento_propietario',
      'documento_poseedor'
    ];

    for (const campo of camposTexto) {
      const val = (raw[campo as string] || '').toString().trim();
      if (val !== '') {
        (datos as Record<string, string>)[campo as string] =
          campo === 'placa_trailer' ? val.replace(/[\s\-]/g, '').toUpperCase() : val;
      }
    }

    const peso = (raw['peso_vacio'] || '').toString().trim();
    if (peso !== '' && !isNaN(Number(peso))) {
      datos.peso_vacio = Number(peso);
    }

    this.guardarEntidad.emit({ entidad: 'trailer', datos });
  }

  submitTercero(entidad: 'propietario' | 'tenedor'): void {
    const form = entidad === 'propietario' ? this.propietarioForm : this.tenedorForm;
    if (form.invalid || this.guardando) {
      form.markAllAsTouched();
      return;
    }

    const raw = form.getRawValue() as Record<string, string>;
    const datos: DatosTerceroOpcionalTramite = {};

    const campos: (keyof DatosTerceroOpcionalTramite)[] = [
      'tipo_documento',
      'documento',
      'dv',
      'nombre',
      'apellido',
      'ciudad_residencia',
      'direccion',
      'celular',
      'email'
    ];

    for (const campo of campos) {
      const val = (raw[campo as string] || '').toString().trim();
      if (val !== '') {
        (datos as Record<string, string>)[campo as string] = val;
      }
    }

    this.guardarEntidad.emit({ entidad, datos });
  }

  quitar(entidad: EntidadOpcionalSlug): void {
    this.coreLogger.info('PASO3_OPCIONALES_QUITAR', { entidad, guardando: this.guardando });
    this.activo[entidad] = false;
    this.eliminarEntidad.emit(entidad);
  }

  onContinuar(): void {
    this.coreLogger.info('PASO3_OPCIONALES_BOTON_CONTINUAR', {
      guardando: this.guardando,
      activo: { ...this.activo },
      tieneTrailer: this.tieneEntidad('TRAILER'),
      tienePropietario: this.tieneEntidad('PROPIETARIO'),
      tieneTenedor: this.tieneEntidad('TENEDOR'),
      trailerValido: this.trailerForm.valid,
      propietarioValido: this.propietarioForm.valid,
      tenedorValido: this.tenedorForm.valid
    });
    this.continuar.emit();
  }
}
