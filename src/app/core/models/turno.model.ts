export interface Turno {
  placa: string;
  ciudad_origen: string;
  ciudad_destino1: string;
  ciudad_destino2: string;
  ciudad_destino3: string;
  desacorasado: 'SI' | 'NO' | boolean | string;
  estado_trailer: string;
  nuevo: boolean | string;
}

export interface TurnoDetalle {
  id?: number;
  placa: string;
  origen_nombre: string;
  destino1?: string;
  destino2?: string;
  destino3?: string;
  posicionDestino1?: number | string;
  posicionDestino2?: number | string;
  posicionDestino3?: number | string;
  fechaEnturnamiento?: string;
  estado?: string;
  tiemporestante?: string;
  tiporemolque?: string;
  vacio?: string;
}

export interface TurnoResponse {
  code: '200' | '204' | string;
  data: TurnoDetalle | any;
  message?: string;
}

export interface RegionalItem {
  nombre: string;
}

export interface DestinoSlot {
  index: number;
  label: string; // "1° Preferencia", "2° Preferencia", "3° Preferencia"
  prioridad: number; // 1, 2, 3
  regional: string | null;
}

export interface RegionalListItem {
  nombre: string;
  seleccionada: boolean;
  prioridad: number | null; // 1, 2, 3 o null
  bloqueada: boolean; // true si ya hay 3 elegidas y esta no está seleccionada
}

export interface TurnoWizardState {
  origen: string | null;
  isLoadingGps: boolean;
  errorGps: string | null;
  destinos: string[]; // Máximo 3
  viajaVacio: 'SI' | 'NO';
  tipoRemolque: 'CONTENEDOR' | 'PLANCHA' | '';
  esArticulado: boolean;
  filtroBusqueda: string;
  isSubmitting: boolean;
  modalEnturnamientoOpen: boolean;
  modalSelectorDestinosOpen: boolean;
}

export interface TurnoSubmitResult {
  success: boolean;
  message: string;
  data?: any;
}
