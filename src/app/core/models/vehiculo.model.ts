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
