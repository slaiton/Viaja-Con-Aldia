import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DatosPageRoutingModule } from './datos-routing.module';

import { DatosPage } from './datos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DatosPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [DatosPage]
})
export class DatosPageModule {}
