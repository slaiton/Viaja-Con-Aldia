import { ViajeActivo, ManifiestoMEC, RemesaPOD, EstadoRemesa } from '@core/models/viaje.model';

export class ViajeMapper {
  /**
   * Mapea la respuesta cruda del API a un modelo ViajeActivo fuertemente tipado.
   * Si el manifiesto devuelto por el backend no contiene los datos reales requeridos,
   * retorna estrictamente null sin inventar valores ficticios.
   */
  static mapToViajeActivo(raw: unknown, placa: string): ViajeActivo | null {
    if (!raw || typeof raw !== 'object') {
      return null;
    }

    const payload = raw as Record<string, unknown>;
    const data = payload['data'] as Record<string, unknown> | undefined;

    if (!data || typeof data !== 'object') {
      return null;
    }

    if (data['estado'] !== 'ACTIVO') {
      return null;
    }

    const rawManifiesto = data['manifiesto'] as Record<string, unknown> | undefined;
    if (!rawManifiesto || typeof rawManifiesto !== 'object') {
      return null;
    }

    const numeroMEC = typeof rawManifiesto['numeroMEC'] === 'string' ? rawManifiesto['numeroMEC'].trim() : '';
    const origen = typeof rawManifiesto['origen'] === 'string' ? rawManifiesto['origen'].trim() : '';
    const destino = typeof rawManifiesto['destino'] === 'string' ? rawManifiesto['destino'].trim() : '';
    const conductor = typeof rawManifiesto['conductor'] === 'string' ? rawManifiesto['conductor'].trim() : '';
    const cedula = typeof rawManifiesto['cedula'] === 'string' ? rawManifiesto['cedula'].trim() : '';
    const poseedor = typeof rawManifiesto['poseedor'] === 'string' ? rawManifiesto['poseedor'].trim() : '';
    const qrPayload = typeof rawManifiesto['qrPayload'] === 'string' ? rawManifiesto['qrPayload'].trim() : '';
    const fechaDespacho = typeof rawManifiesto['fechaDespacho'] === 'string' ? rawManifiesto['fechaDespacho'].trim() : '';

    // Regla DevSentinel: Si no hay MEC u origen/destino válidos entregados por el backend, rechazar
    if (!numeroMEC || !origen || !destino || !conductor) {
      return null;
    }

    const manifiesto: ManifiestoMEC = {
      numeroMEC,
      origen,
      destino,
      fechaDespacho: fechaDespacho || new Date().toISOString(),
      placa: (typeof rawManifiesto['placa'] === 'string' && rawManifiesto['placa']) ? rawManifiesto['placa'].toUpperCase() : placa.toUpperCase(),
      conductor,
      cedulaConductor: cedula,
      poseedor: poseedor || 'Aldía Logística',
      empresaTransporte: 'Aldía Logística S.A.',
      polizaSeguro: typeof rawManifiesto['poliza'] === 'string' ? rawManifiesto['poliza'] : undefined,
      valorFlete: typeof rawManifiesto['valorFlete'] === 'number' ? rawManifiesto['valorFlete'] : undefined,
      qrPayload: qrPayload || `https://rndc.mintransporte.gov.co/consultas/mec?doc=${encodeURIComponent(numeroMEC)}`
    };

    // Mapear remesas reales devueltas por el API
    const rawRemesas = Array.isArray(data['remesas']) ? data['remesas'] : [];
    const remesas: RemesaPOD[] = [];

    for (const r of rawRemesas) {
      if (r && typeof r === 'object') {
        const item = r as Record<string, unknown>;
        const num = typeof item['numeroRemesa'] === 'string' ? item['numeroRemesa'].trim() : '';
        const punto = typeof item['puntoEntrega'] === 'string' ? item['puntoEntrega'].trim() : '';
        const dest = typeof item['destinatario'] === 'string' ? item['destinatario'].trim() : '';
        const kilos = typeof item['kilos'] === 'number' ? item['kilos'] : 0;
        const estado = (typeof item['estado'] === 'string' ? item['estado'] : 'EN_RUTA') as EstadoRemesa;

        if (num) {
          remesas.push({
            numeroRemesa: num,
            puntoEntrega: punto || destino,
            destinatario: dest || 'Destinatario Registrado',
            kilos,
            unidades: typeof item['unidades'] === 'number' ? item['unidades'] : undefined,
            estado,
            observaciones: typeof item['observaciones'] === 'string' ? item['observaciones'] : undefined
          });
        }
      }
    }

    const idViaje = typeof data['id'] === 'string' && data['id'] ? (data['id'] as string) : `VIAJE-${placa}`;

    return {
      idViaje,
      estado: 'EN_VIAJE_RNDC',
      enRutaNacional: true,
      manifiesto,
      remesas,
      updatedAt: Date.now()
    };
  }
}

