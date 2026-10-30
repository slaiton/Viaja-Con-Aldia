export interface PreguntaPreoperacionalRaw {
  subpreope_codigo: number;
  subpreope_nombre: string;
  subpreope_descripcion?: string;
  subpreope_categoria?: string;
  subpreope_restrictivo?: 'SI' | 'NO' | string;
  subpreope_orden?: number;
  subpreope_estado?: string;
}

export interface PreguntaPreoperacional {
  id: number;
  texto: string;
  descripcion: string;
  categoria: string;
  opcional: boolean;
  orden: number;
}

export interface CategoriaOpcional {
  nombre: string;
  label: string;
  aplica: boolean | '';
}

export interface ItemNoCumple {
  id: number;
  index: number;
  texto: string;
  descripcion: string;
  categoria: string;
  solucionado: boolean;
}

export interface RespuestaPreoperacional {
  id: number;
  respuesta: 'CUMPLE' | 'NO CUMPLE';
}

export interface PreoperacionalPayload {
  vehiculo: string;
  empresa: number;
  confirmacion: number;
  imagen: string;
  respuestas: RespuestaPreoperacional[];
}

export interface PreoperacionalSubmitResult {
  success: boolean;
  offline: boolean;
  message: string;
  data?: any;
}

export interface PreoperacionalProgreso {
  actual: number;
  total: number;
  porcentaje: number;
  categoriaActual: string;
}

export type WizardStep = 'PREGUNTAS' | 'CATEGORIA_PROMPT' | 'ALERTAS_RESOLVER' | 'FOTO_FINAL' | 'COMPLETADO';

