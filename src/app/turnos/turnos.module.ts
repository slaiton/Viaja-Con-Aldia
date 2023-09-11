import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TurnosPageRoutingModule } from './turnos-routing.module';

import { TurnosPage } from './turnos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TurnosPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [TurnosPage]
})
export class TurnosPageModule {}
