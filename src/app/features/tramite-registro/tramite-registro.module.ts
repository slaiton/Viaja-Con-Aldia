import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { TramiteRegistroRoutingModule } from './tramite-registro-routing.module';
import { TramiteRegistroPage } from './pages/tramite-registro.page';
import { PasoOtpComponent } from './components/paso-otp/paso-otp.component';
import { EstadoTramiteComponent } from './components/estado-tramite/estado-tramite.component';
import { PasoConductorComponent } from './components/paso-conductor/paso-conductor.component';
import { PasoVehiculoComponent } from './components/paso-vehiculo/paso-vehiculo.component';
import { PasoOpcionalesComponent } from './components/paso-opcionales/paso-opcionales.component';
import { PasoDocumentosComponent } from './components/paso-documentos/paso-documentos.component';
import { TramiteRegistroRecursosService } from './services/tramite-registro-recursos.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TramiteRegistroRoutingModule
  ],
  declarations: [
    TramiteRegistroPage,
    PasoOtpComponent,
    EstadoTramiteComponent,
    PasoConductorComponent,
    PasoVehiculoComponent,
    PasoOpcionalesComponent,
    PasoDocumentosComponent
  ],
  providers: [TramiteRegistroRecursosService]
})
export class TramiteRegistroModule {}
