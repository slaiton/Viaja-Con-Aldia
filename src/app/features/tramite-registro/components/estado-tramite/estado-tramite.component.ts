import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TramiteDetalle } from '@core/models/tramite-registro.model';

@Component({
  selector: 'app-estado-tramite',
  templateUrl: './estado-tramite.component.html',
  styleUrls: ['./estado-tramite.component.scss']
})
export class EstadoTramiteComponent {
  @Input() tramite!: TramiteDetalle;
  @Input() cargando = false;

  @Output() reabrir = new EventEmitter<void>();
  @Output() actualizarEstado = new EventEmitter<void>();
  @Output() cerrarSesion = new EventEmitter<void>();
}
