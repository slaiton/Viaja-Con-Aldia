import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DatosPageRoutingModule } from './datos-routing.module';
import { DatosPage } from './datos.page';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DatosPageRoutingModule,
    ReactiveFormsModule,
    AutocompleteLibModule,
    SharedModule
  ],
  declarations: [DatosPage]
})
export class DatosPageModule {}
