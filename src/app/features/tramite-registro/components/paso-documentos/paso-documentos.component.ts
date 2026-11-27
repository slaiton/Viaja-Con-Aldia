import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import {
  CampoFaltanteRegistro,
  EntidadTramiteSlug,
  EntidadTramiteUpper,
  PasoRegistro,
  TramiteArchivo,
  TramiteDetalle
} from '@core/models/tramite-registro.model';
import { EtapaRegistro } from '../../services/tramite-registro-error.helper';

const SOPORTES_EXCLUIDOS: ReadonlySet<string> = new Set([
  'foto_diferencial',
  'recibo_bascula',
  'contrato_autorizacion',
  'foto_conductor_cara',
  'runt_digitalizado',
  'procuraduria_digitalizado',
  'comparendos_digitalizado',
  'risk_digitalizado',
  'defencarga_digitalizado',
  'acuerdo_pago_digitalizado',
  'seguridad_social',
  'rut_transporte_digitalizado',
  'seguro_obligatorio_digitalizado'
]);

type BloqueDocumentosId =
  | 'CONDUCTOR'
  | 'VEHICULO_DOCS'
  | 'VEHICULO_FOTOS'
  | 'TRAILER'
  | 'PROPIETARIO'
  | 'TENEDOR';

interface DocumentoItemView {
  tipo: string;
  etiqueta: string;
  principal: boolean;
  archivo: TramiteArchivo | null;
  tamanoLabel: string;
  subiendo: boolean;
}

interface SeccionDocumentos {
  bloqueId: BloqueDocumentosId;
  entidadUpper: EntidadTramiteUpper;
  entidadSlug: EntidadTramiteSlug;
  titulo: string;
  principales: DocumentoItemView[];
  adicionales: DocumentoItemView[];
}

const ETIQUETAS_DOCUMENTOS: Record<string, { etiqueta: string; principal: boolean }> = {
  cedula1: { etiqueta: 'Cédula de Ciudadanía - Lado Frontal', principal: true },
  cedula2: { etiqueta: 'Cédula de Ciudadanía - Lado Posterior', principal: true },
  licencia1: { etiqueta: 'Licencia de Conducción - Lado Frontal', principal: true },
  licencia2: { etiqueta: 'Licencia de Conducción - Lado Posterior', principal: true },
  mercancia_peligrosa: { etiqueta: 'Certificado de Mercancía Peligrosa', principal: false },
  tarjeta1: { etiqueta: 'Tarjeta de Propiedad - Lado Frontal', principal: true },
  tarjeta2: { etiqueta: 'Tarjeta de Propiedad - Lado Posterior', principal: true },
  soat1: { etiqueta: 'SOAT Vigente', principal: true },
  soat2: { etiqueta: 'SOAT - Lado Posterior', principal: false },
  tecnomecanica1: { etiqueta: 'Revisión Tecnomecánica Vigente', principal: true },
  tecnomecanica2: { etiqueta: 'Revisión Tecnomecánica - Reverso', principal: false },
  vista_frontal: { etiqueta: 'Foto del Vehículo - Vista Frontal', principal: true },
  vista_lateral: { etiqueta: 'Foto del Vehículo - Vista Lateral', principal: true },
  vista_motor: { etiqueta: 'Foto del Motor', principal: false },
  foto_trailer: { etiqueta: 'Foto del Tráiler', principal: true },
  registro_nacional_trailer: { etiqueta: 'Registro Nacional de Remolque', principal: true },
  certificado_habilitado_trailer: { etiqueta: 'Certificado de Habilitación', principal: true },
  anexo_colombiano: { etiqueta: 'Anexo Colombiano', principal: false },
  anexo_venezolano: { etiqueta: 'Anexo Venezolano', principal: false },
  anexo_ecuatoriano: { etiqueta: 'Anexo Ecuatoriano', principal: false },
  rut: { etiqueta: 'RUT Actualizado', principal: true }
};

const ORDEN_DOCS_VEHICULO = new Set([
  'tarjeta1',
  'tarjeta2',
  'soat1',
  'tecnomecanica1',
  'soat2',
  'tecnomecanica2'
]);

const ORDEN_POR_BLOQUE: Record<BloqueDocumentosId, readonly string[]> = {
  CONDUCTOR: ['cedula1', 'cedula2', 'licencia1', 'licencia2', 'mercancia_peligrosa'],
  VEHICULO_DOCS: ['tarjeta1', 'tarjeta2', 'soat1', 'tecnomecanica1', 'soat2', 'tecnomecanica2'],
  VEHICULO_FOTOS: ['vista_frontal', 'vista_lateral', 'vista_motor'],
  TRAILER: [
    'foto_trailer',
    'registro_nacional_trailer',
    'certificado_habilitado_trailer',
    'anexo_colombiano',
    'anexo_venezolano',
    'anexo_ecuatoriano'
  ],
  PROPIETARIO: ['cedula1', 'cedula2', 'rut'],
  TENEDOR: ['cedula1', 'cedula2', 'rut']
};

const TITULOS_BLOQUE: Record<BloqueDocumentosId, string> = {
  CONDUCTOR: 'Documentos del Conductor',
  VEHICULO_DOCS: 'Documentos del Vehículo',
  VEHICULO_FOTOS: 'Fotografías del Vehículo',
  TRAILER: 'Soportes del Tráiler',
  PROPIETARIO: 'Soportes del Propietario',
  TENEDOR: 'Soportes del Tenedor'
};

@Component({
  selector: 'app-paso-documentos',
  templateUrl: './paso-documentos.component.html',
  styleUrls: ['./paso-documentos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PasoDocumentosComponent implements OnInit, OnChanges {
  @Input() tramite: TramiteDetalle | null = null;
  @Input() pasos: PasoRegistro[] = [];
  @Input() guardando = false;
  @Input() subiendoArchivoKey: string | null = null;
  @Input() faltanEnviar: CampoFaltanteRegistro[] = [];

  @Output() subirSoporte = new EventEmitter<{
    entidad: EntidadTramiteSlug;
    tipo: string;
    etiqueta: string;
  }>();
  @Output() solicitarEliminarSoporte = new EventEmitter<number>();
  @Output() solicitarEnviarTramite = new EventEmitter<void>();
  @Output() irAPaso = new EventEmitter<EtapaRegistro>();

  adicionalesVisibles: Record<string, boolean> = {};
  seccionesActivas: SeccionDocumentos[] = [];
  conductorListo = false;
  vehiculoListo = false;
  totalArchivos = 0;

  ngOnInit(): void {
    this.reconstruirVista();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tramite'] || changes['pasos'] || changes['subiendoArchivoKey']) {
      this.reconstruirVista();
    }
  }

  trackBySeccion(_index: number, sec: SeccionDocumentos): string {
    return sec.bloqueId;
  }

  trackByDocumento(_index: number, doc: DocumentoItemView): string {
    return doc.tipo;
  }

  trackByFaltante(index: number, item: CampoFaltanteRegistro): string {
    return `${item.paso}:${item.etiqueta}:${index}`;
  }

  toggleAdicionales(bloqueId: BloqueDocumentosId): void {
    this.adicionalesVisibles[bloqueId] = !this.adicionalesVisibles[bloqueId];
  }

  solicitarSubirSoporte(entidad: EntidadTramiteSlug, tipo: string, etiqueta: string): void {
    if (this.subiendoArchivoKey || this.guardando) {
      return;
    }
    this.subirSoporte.emit({ entidad, tipo, etiqueta });
  }

  emitirIrAPaso(paso: string): void {
    const etapa: EtapaRegistro =
      paso === 'conductor' || paso === 'vehiculo' || paso === 'opcionales' || paso === 'documentos'
        ? paso
        : 'opcionales';
    this.irAPaso.emit(etapa);
  }

  private reconstruirVista(): void {
    const pasos = Array.isArray(this.pasos) ? this.pasos : [];
    const itemsPresentes = new Set(this.tramite?.items?.map((i) => i.entidad) || []);
    const archivos = Array.isArray(this.tramite?.archivos) ? this.tramite.archivos : [];
    const archivoPorClave = new Map<string, TramiteArchivo>();

    for (const arch of archivos) {
      archivoPorClave.set(`${arch.entidad}:${arch.tipo}`, arch);
    }

    this.conductorListo = Boolean(pasos.find((p) => p.entidad === 'CONDUCTOR')?.conDatos);
    this.vehiculoListo = Boolean(pasos.find((p) => p.entidad === 'VEHICULO')?.conDatos);
    this.totalArchivos = archivos.length;

    const pasoPorEntidad = new Map<EntidadTramiteUpper, PasoRegistro>();
    for (const paso of pasos) {
      pasoPorEntidad.set(paso.entidad, paso);
    }

    const secciones: SeccionDocumentos[] = [];

    const pasoConductor = pasoPorEntidad.get('CONDUCTOR');
    if (pasoConductor) {
      secciones.push(
        this.construirBloque('CONDUCTOR', pasoConductor, this.extraerPermitidas(pasoConductor), archivoPorClave)
      );
    }

    const pasoVehiculo = pasoPorEntidad.get('VEHICULO');
    if (pasoVehiculo) {
      const tiposVehiculo = this.extraerPermitidas(pasoVehiculo);
      const tiposDocs = tiposVehiculo.filter((t) => ORDEN_DOCS_VEHICULO.has(t));
      const tiposFotos = tiposVehiculo.filter((t) => !ORDEN_DOCS_VEHICULO.has(t));

      if (tiposDocs.length > 0) {
        secciones.push(this.construirBloque('VEHICULO_DOCS', pasoVehiculo, tiposDocs, archivoPorClave));
      }
      if (tiposFotos.length > 0) {
        secciones.push(this.construirBloque('VEHICULO_FOTOS', pasoVehiculo, tiposFotos, archivoPorClave));
      }
    }

    const entidadesOpcionales: readonly ('TRAILER' | 'PROPIETARIO' | 'TENEDOR')[] = [
      'TRAILER',
      'PROPIETARIO',
      'TENEDOR'
    ];
    for (const entidad of entidadesOpcionales) {
      const paso = pasoPorEntidad.get(entidad);
      if (paso && itemsPresentes.has(entidad)) {
        const tipos = this.extraerPermitidas(paso);
        if (tipos.length > 0) {
          secciones.push(this.construirBloque(entidad, paso, tipos, archivoPorClave));
        }
      }
    }

    this.seccionesActivas = secciones;
  }

  private extraerPermitidas(paso: PasoRegistro): string[] {
    const raw = Array.isArray(paso.imagenesPermitidas) ? paso.imagenesPermitidas : [];
    return raw.filter((tipo) => !SOPORTES_EXCLUIDOS.has(tipo));
  }

  private construirBloque(
    bloqueId: BloqueDocumentosId,
    paso: PasoRegistro,
    tipos: string[],
    archivoPorClave: Map<string, TramiteArchivo>
  ): SeccionDocumentos {
    const orden = ORDEN_POR_BLOQUE[bloqueId] || [];
    const ordenados = [...tipos].sort((a, b) => {
      const idxA = orden.indexOf(a);
      const idxB = orden.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    const items: DocumentoItemView[] = ordenados.map((tipo) => {
      const info = ETIQUETAS_DOCUMENTOS[tipo];
      const key = `${paso.entidad}:${tipo}`;
      const archivo = archivoPorClave.get(key) ?? null;
      return {
        tipo,
        etiqueta: info ? info.etiqueta : this.formatearTipo(tipo),
        principal: info ? info.principal : false,
        archivo,
        tamanoLabel: archivo ? `${Math.max(1, Math.round(archivo.tamano / 1024))} KB` : '',
        subiendo: this.subiendoArchivoKey === key
      };
    });

    return {
      bloqueId,
      entidadUpper: paso.entidad,
      entidadSlug: paso.paso,
      titulo: TITULOS_BLOQUE[bloqueId],
      principales: items.filter((m) => m.principal),
      adicionales: items.filter((m) => !m.principal)
    };
  }

  private formatearTipo(tipo: string): string {
    return tipo
      .replace(/_digitalizado$/i, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
