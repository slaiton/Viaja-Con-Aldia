/**
 * Modelo de Vehículo para Viaja con Aldia
 */

export interface Vehiculo {
  placa: string;
  trailer?: string;
  estadoTrailer?: string;
  desacorasado?: boolean;
  tipoVehiculo?: string;
  capacidadCarga?: number;
  modelo?: string;
  marca?: string;
  linea?: string;
  combustible?: string;
}

export interface ValidacionCapacidadResponse {
  code: string;
  message?: string;
  status: boolean;
  data?: any;
}

/**
 * Representa un ítem de la lista "Mis Vehículos" con datos enriquecidos para la UI.
 * Generado por VehiculosFacade a partir de la respuesta de GET /api/mis-vehiculos.
 */
export interface VehiculoListItem {
  /** Placa del cabezote (numeroPlacaxxx en 3SL) */
  placa: string;
  /** Cédula del conductor vinculado (codigoTercerox) */
  cedula: string;
  /** true si esta placa es la placa activa del conductor en sesión */
  esActivo: boolean;
  /** true si hojaVidaApp == true en 3SL (vehículo en servicio activo) */
  enUso: boolean;
  /** URL de fotovehi1 si existe y es accesible, null si no hay foto */
  foto: string | null;
  /** Clase o tipo del vehículo (nombreClaseVeh) */
  clase?: string;
  /** Marca del vehículo (nombreVehmarca) */
  marca?: string;
  /** Modelo año (numeroModeloxx) */
  modelo?: string;
  /** Cédula del conductor vinculado si la placa ya está en uso por otro */
  cedulaVinculada?: string;
  /** Celular del propietario (enmascarado para mostrar en UI de verificación SMS) */
  celularPropietario?: string;
}

/** Catálogo de opciones para autocomplete (clases, marcas, colores, etc.) */
export interface CatalogoItem {
  id: string;
  name: string;
  /** Opcional: tipo (ej. 'ARTICULADO') para clases de vehículo */
  tipo?: string;
}
