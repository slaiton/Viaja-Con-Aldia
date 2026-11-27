import {
  CampoFaltanteRegistro,
  CatalogoItem,
  EntidadTramiteUpper,
  ErrorTramiteDomain,
  EstadoTramite,
  PasoRegistro,
  TramiteDetalle
} from '@core/models/tramite-registro.model';
import { TramiteRegistroMapper } from '@domain/tramite-registro.mapper';
import { CATALOGOS_VACIOS, CatalogosRegistroSet } from './tramite-registro-recursos.service';

export type EtapaRegistro = 'conductor' | 'vehiculo' | 'opcionales' | 'documentos';

export interface TramiteRegistroState {
  cargando: boolean;
  guardando: boolean;
  subiendoArchivoKey: string | null;
  errorMensaje: string | null;
  erroresCampo: Record<string, string[]>;
  faltanEnviar: CampoFaltanteRegistro[];
  estadoRegistro: EstadoTramite | 'SIN_SESION';
  tramite: TramiteDetalle | null;
  pasos: PasoRegistro[];
  etapaActual: EtapaRegistro;
  placaActiva: string | null;
  cedulaActiva: string | null;
  subpasoOtp: 'SOLICITUD' | 'VERIFICACION';
  celularEnmascarado: string;
  reenviarEnSegundos: number;
  intentosRestantesOtp: number | null;
  catalogos: CatalogosRegistroSet;
  lineasVehiculo: CatalogoItem[];
  cargandoCatalogos: boolean;
  cargandoLineas: boolean;
}

export const INITIAL_TRAMITE_STATE: TramiteRegistroState = {
  cargando: false,
  guardando: false,
  subiendoArchivoKey: null,
  errorMensaje: null,
  erroresCampo: {},
  faltanEnviar: [],
  estadoRegistro: 'SIN_SESION',
  tramite: null,
  pasos: [],
  etapaActual: 'conductor',
  placaActiva: null,
  cedulaActiva: null,
  subpasoOtp: 'SOLICITUD',
  celularEnmascarado: '••••',
  reenviarEnSegundos: 0,
  intentosRestantesOtp: null,
  catalogos: CATALOGOS_VACIOS,
  lineasVehiculo: [],
  cargandoCatalogos: false,
  cargandoLineas: false
};

const LLAVES_PRECARGADAS: ReadonlySet<string> = new Set([
  'documento',
  'celular',
  'placa',
  'cedula_conductor',
  'placa_trailer'
]);

export function normalizarOtpInput(payload: {
  cedula: string;
  placa: string;
  celular: string;
  codigo?: string;
}): { cedula: string; placa: string; celular: string; codigo: string } {
  return {
    cedula: (payload.cedula || '').replace(/\D/g, '').trim(),
    placa: (payload.placa || '').replace(/[\s\-]/g, '').toUpperCase().trim(),
    celular: (payload.celular || '').replace(/\D/g, '').trim(),
    codigo: (payload.codigo || '').replace(/\D/g, '').trim()
  };
}

export function parsearErrorTramite(err: unknown, fallbackMessage: string): ErrorTramiteDomain {
  return TramiteRegistroMapper.mapHttpError(err, fallbackMessage);
}

export function tieneEntidadConDatos(
  tramite: TramiteDetalle | null,
  entidad: EntidadTramiteUpper
): boolean {
  const item = tramite?.items?.find((i) => i.entidad === entidad);
  if (!item?.datos) {
    return false;
  }
  return Object.entries(item.datos).some(
    ([clave, valor]) => !LLAVES_PRECARGADAS.has(clave) && valor !== null && valor !== '' && valor !== undefined
  );
}

export function puedeAccederAEtapa(etapa: EtapaRegistro, tramite: TramiteDetalle | null): boolean {
  if (etapa === 'conductor') {
    return true;
  }
  if (etapa === 'vehiculo') {
    return tieneEntidadConDatos(tramite, 'CONDUCTOR');
  }
  return tieneEntidadConDatos(tramite, 'CONDUCTOR') && tieneEntidadConDatos(tramite, 'VEHICULO');
}

export function recalcularPasosTramite(
  tramite: TramiteDetalle,
  pasosActuales: PasoRegistro[]
): PasoRegistro[] {
  const pasos = Array.isArray(pasosActuales) ? pasosActuales : [];
  const items = Array.isArray(tramite?.items) ? tramite.items : [];
  const archivos = Array.isArray(tramite?.archivos) ? tramite.archivos : [];

  return pasos.map((paso) => {
    const item = items.find((i) => i.entidad === paso.entidad);
    const datos = item?.datos || {};
    const conDatos = Object.entries(datos).some(
      ([clave, valor]) => !LLAVES_PRECARGADAS.has(clave) && valor !== null && valor !== '' && valor !== undefined
    );
    const imagenes = archivos.filter((a) => a.entidad === paso.entidad).length;
    return {
      ...paso,
      conDatos,
      imagenes
    };
  });
}
