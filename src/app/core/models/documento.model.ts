/**
 * Modelos para gestión y validación de documentos (3SL y Aldia)
 */

export interface DocumentoItem {
  nombre: string;
  fecha: string;
  vencido?: boolean;
}

export interface DocumentosValidacionData {
  vehiculo?: DocumentoItem[];
  conductor?: DocumentoItem[];
}

export interface DocumentoValidacionResponse {
  status: boolean;
  docs: DocumentoItem[];
  data?: DocumentosValidacionData;
  message?: string;
}

export interface FotoDocumentoResponse {
  code: string;
  data: {
    fotoperfil?: string;
    [key: string]: any;
  };
  message?: string;
}
