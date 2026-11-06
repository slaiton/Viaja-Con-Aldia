import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TurnoFacade } from './turno.facade';
import { RegionalListItem } from '@core/models/turno.model';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-turnos',
  templateUrl: './turnos.page.html',
  styleUrls: ['./turnos.page.scss'],
})
export class TurnosPage implements OnInit {
  // Observables expuestos desde TurnoFacade
  readonly origenGps$ = this.turnoFacade.origenGps$;
  readonly isLoadingGps$ = this.turnoFacade.isLoadingGps$;
  readonly errorGps$ = this.turnoFacade.errorGps$;
  readonly destinos$ = this.turnoFacade.destinos$;
  readonly viajaVacio$ = this.turnoFacade.viajaVacio$;
  readonly tipoRemolque$ = this.turnoFacade.tipoRemolque$;
  readonly esArticulado$ = this.turnoFacade.esArticulado$;
  readonly slotsDestinos$ = this.turnoFacade.slotsDestinos$;
  readonly regionalesCalculadas$ = this.turnoFacade.regionalesCalculadas$;
  readonly filtroBusqueda$ = this.turnoFacade.filtroBusqueda$;
  readonly canSubmit$ = this.turnoFacade.canSubmit$;
  readonly puedeGuardarDestinos$ = this.turnoFacade.puedeGuardarDestinos$;
  readonly isSubmitting$ = this.turnoFacade.isSubmitting$;
  readonly modalSelectorDestinosOpen$ = this.turnoFacade.modalSelectorDestinosOpen$;

  constructor(
    private router: Router,
    private userService: UserService,
    public turnoFacade: TurnoFacade
  ) {}

  async ngOnInit() {
    if (!this.userService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }

    // Inicializar ubicación y estado en el Facade
    await this.turnoFacade.iniciarEnturnamiento();
  }

  refrescarGps() {
    this.turnoFacade.detectarUbicacionGps();
  }

  abrirSelectorDestinos() {
    this.turnoFacade.abrirSelectorDestinos();
  }

  cerrarSelectorDestinos() {
    this.turnoFacade.cerrarSelectorDestinos();
  }

  onToggleDestino(reg: RegionalListItem) {
    if (!reg.bloqueada) {
      this.turnoFacade.toggleDestino(reg.nombre);
    }
  }

  removerDestinoPorIndice(index: number) {
    this.turnoFacade.removerDestinoPorIndice(index);
  }

  guardarDestinos() {
    this.turnoFacade.guardarDestinos();
  }

  limpiarDestinos() {
    this.turnoFacade.limpiarDestinos();
  }

  setViajaVacio(val: 'SI' | 'NO') {
    this.turnoFacade.setViajaVacio(val);
  }

  setTipoRemolque(val: 'CONTENEDOR' | 'PLANCHA') {
    this.turnoFacade.setTipoRemolque(val);
  }

  onFiltroInput(event: any) {
    this.turnoFacade.setFiltro(event?.target?.value || '');
  }

  limpiarFiltro() {
    this.turnoFacade.setFiltro('');
  }

  async confirmarTurno() {
    const result = await this.turnoFacade.confirmarTurno();
    if (result.success) {
      this.router.navigate(['/home']);
    }
  }
}
