import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PreformPageRoutingModule } from './preform-routing.module';

import { PreformPage } from './preform.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PreformPageRoutingModule
  ],
  declarations: [PreformPage]
})
export class PreformPageModule {}
