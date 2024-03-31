import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DatosPageRoutingModule } from './datos-routing.module';

import { DatosPage } from './datos.page';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { Documentos2Component } from './documentos/documentos.component';





@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DatosPageRoutingModule,
    ReactiveFormsModule,
    AutocompleteLibModule
  ],
  declarations: [DatosPage, Documentos2Component]
})
export class DatosPageModule {}
