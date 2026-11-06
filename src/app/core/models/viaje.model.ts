export type EstadoOperativoCabina = 'SIN_TURNO' | 'ENTURNADO' | 'EN_VIAJE_RNDC';

export type EstadoRemesa = 'EN_RUTA' | 'EN_DESCARGUE' | 'ENTREGADO' | 'NOVEDAD';

export interface ManifiestoMEC {
  numeroMEC: string;         // Ej: "MEC-2026-98124"
  origen: string;            // Ej: "Buenaventura (Valle)"
  destino: string;           // Ej: "Bogotá D.C."
  fechaDespacho: string;     // Ej: "30 Oct 2026, 06:30 AM"
  placa: string;
  conductor: string;
  cedulaConductor: string;
  poseedor: string;
  polizaSeguro?: string;
  empresaTransporte: string; // Ej: "Aldía Logística S.A."
  valorFlete?: number;
  qrPayload: string;         // Token o URL para validación oficial MinTransporte / DITRA
}

export interface RemesaPOD {
  numeroRemesa: string;      // Ej: "REM-88412-A"
  puntoEntrega: string;      // Ej: "CEDI Éxito Fontibón, Bogotá"
  destinatario: string;
  kilos: number;
  unidades?: number;
  estado: EstadoRemesa;
  cumplidoFotoWebP?: string; // DataUrl / Base64 WebP < 150 KB
  cumplidoSizeKb?: number;
  fechaCumplido?: string;
  observaciones?: string;
}

export interface ViajeActivo {
  idViaje: string;
  estado: EstadoOperativoCabina;
  enRutaNacional: boolean;
  manifiesto: ManifiestoMEC;
  remesas: RemesaPOD[];
  updatedAt: number;
}

export interface PODUploadPayload {
  numeroRemesa: string;
  numeroMEC: string;
  placa: string;
  imagenWebP: string;        // Base64 WebP < 150 KB
  sizeBytes: number;
  latitud?: number;
  longitud?: number;
  timestamp: string;
  observacion?: string;
}

export interface PODSubmitResult {
  success: boolean;
  offline: boolean;
  message: string;
  data?: any;
}

