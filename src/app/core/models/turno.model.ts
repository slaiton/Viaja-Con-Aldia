export interface Turno {
  placa: string;
  ciudad_origen: string;
  ciudad_destino1: string;
  ciudad_destino2: string;
  ciudad_destino3: string;
  desacorasado: boolean;
  estado_trailer: string;
  nuevo: string;
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
}

export interface TurnoResponse {
  code: '200' | '204' | string;
  data: TurnoDetalle | any;
  message?: string;
}