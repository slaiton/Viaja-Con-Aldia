import {
  DestinoSlot,
  RegionalItem,
  RegionalListItem,
  Turno,
  TurnoWizardState
} from '@core/models/turno.model';

export const REGIONALES_ALDIA: RegionalItem[] = [
  { nombre: 'REGIONAL ARAUCA' },
  { nombre: 'REGIONAL ARMENIA' },
  { nombre: 'REGIONAL BARRANQUILLA' },
  { nombre: 'REGIONAL BOGOTA' },
  { nombre: 'REGIONAL BUCARAMANGA' },
  { nombre: 'REGIONAL BUENAVENTURA' },
  { nombre: 'REGIONAL CALI' },
  { nombre: 'REGIONAL CARTAGENA' },
  { nombre: 'REGIONAL CUCUTA' },
  { nombre: 'REGIONAL FLORENCIA' },
  { nombre: 'REGIONAL IBAGUE' },
  { nombre: 'REGIONAL IPIALES' },
  { nombre: 'REGIONAL MANIZALES' },
  { nombre: 'REGIONAL MEDELLIN' },
  { nombre: 'REGIONAL MONTERIA' },
  { nombre: 'REGIONAL NEIVA' },
  { nombre: 'REGIONAL PASTO' },
  { nombre: 'REGIONAL PEREIRA' },
  { nombre: 'REGIONAL PERU' },
  { nombre: 'REGIONAL POPAYAN' },
  { nombre: 'REGIONAL RIOHACHA' },
  { nombre: 'REGIONAL TUNJA' },
  { nombre: 'REGIONAL SANTA MARTA' },
  { nombre: 'REGIONAL VALLEDUPAR' }
];

export class TurnoMapper {
  static calcularSlotsDestinos(destinos: string[]): DestinoSlot[] {
    return [
      {
        index: 0,
        label: '1° Preferencia',
        prioridad: 1,
        regional: destinos[0] || null
      },
      {
        index: 1,
        label: '2° Preferencia',
        prioridad: 2,
        regional: destinos[1] || null
      },
      {
        index: 2,
        label: '3° Preferencia',
        prioridad: 3,
        regional: destinos[2] || null
      }
    ];
  }

  static filtrarRegionalesCalculadas(destinos: string[], query?: string): RegionalListItem[] {
    const q = (query || '').trim().toUpperCase();
    const cuposLlenos = destinos.length >= 3;

    return REGIONALES_ALDIA
      .filter(r => !q || r.nombre.toUpperCase().includes(q))
      .map(r => {
        const indexEnSeleccion = destinos.indexOf(r.nombre);
        const seleccionada = indexEnSeleccion !== -1;
        const prioridad = seleccionada ? indexEnSeleccion + 1 : null;
        const bloqueada = cuposLlenos && !seleccionada;

        return {
          nombre: r.nombre,
          seleccionada,
          prioridad,
          bloqueada
        };
      });
  }

  static normalizarCiudadOrigen(origen: string): string {
    return origen
      .normalize('NFD')
      .replace(/[\u0300-\u036f|.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .replace(/ +/g, '-')
      .toLowerCase();
  }

  static construirTurnoPayload(state: TurnoWizardState, placa: string): Turno {
    return {
      placa: placa.toUpperCase().trim(),
      ciudad_origen: this.normalizarCiudadOrigen(state.origen || ''),
      ciudad_destino1: state.destinos[0] || '',
      ciudad_destino2: state.destinos[1] || '',
      ciudad_destino3: state.destinos[2] || '',
      desacorasado: state.viajaVacio,
      estado_trailer: state.tipoRemolque || 'null',
      nuevo: false
    };
  }
}

