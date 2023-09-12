import { NgModule } from '@angular/core';
import { CommonModule} from '@angular/common';
import {HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PreformPageRoutingModule } from './preform-routing.module';

import { PreformPage } from './preform.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PreformPageRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
  ],
  declarations: [PreformPage]
})
export class PreformPageModule {}
