/**
 * Modelo de Conductor y mapeo de datos con 3SL
 */

export interface Conductor3SL {
  codigoTercerox: string; // Cédula del conductor
  nombreTercerox: string; // Nombres
  apell1Tercerox: string; // Primer apellido
  apell2Tercerox: string; // Segundo apellido
  emailxTercerox?: string;
  movilxTercerox?: string;
  direccTercerox?: string;
  fechaxNacimien?: string;
  ciudadCreacion?: string;
  numeroPlacaxxx?: string;
  numeroEstadoxx: 'ACTIVO' | 'INACTIVO' | string;
}

export interface RespuestaIngresos3SL {
  status: boolean;
  data: Conductor3SL[];
  message?: string;
}

export interface Conductor {
  cedula: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  correo: string;
  celular: string;
  direccion: string;
  fechaNacimiento: string;
  ciudad: string;
  placa: string;
  estado: 'ACTIVO' | 'INACTIVO' | string;
  fotoUrl?: string;
  raw3sl?: Conductor3SL;
}

/**
 * Función utilitaria para normalizar datos crudos de 3SL en una entidad Conductor limpia
 */
export function mapearConductor3SL(data3sl: Conductor3SL, fotoUrl?: string): Conductor {
  const apell1 = (data3sl.apell1Tercerox || '').trim();
  const apell2 = (data3sl.apell2Tercerox || '').trim();
  const apellidos = `${apell1} ${apell2}`.trim();
  const nombres = (data3sl.nombreTercerox || '').trim();

  return {
    cedula: String(data3sl.codigoTercerox || '').trim(),
    nombres,
    apellidos,
    nombreCompleto: `${nombres} ${apellidos}`.trim(),
    correo: (data3sl.emailxTercerox || '').trim(),
    celular: (data3sl.movilxTercerox || '').trim(),
    direccion: (data3sl.direccTercerox || '').trim(),
    fechaNacimiento: (data3sl.fechaxNacimien || '').trim(),
    ciudad: (data3sl.ciudadCreacion || '').trim(),
    placa: (data3sl.numeroPlacaxxx || '').trim(),
    estado: (data3sl.numeroEstadoxx || '').trim().toUpperCase(),
    fotoUrl,
    raw3sl: data3sl
  };
}
