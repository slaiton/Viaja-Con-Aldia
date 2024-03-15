import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RegistroPageRoutingModule } from './registro-routing.module';
import { RegistroPage } from './registro.page';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import { DocumentosComponent } from '../documentos/documentos.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistroPageRoutingModule,
    ReactiveFormsModule,
    AutocompleteLibModule
  ],
  declarations: [RegistroPage, DocumentosComponent]
})
export class RegistroPageModule {}
