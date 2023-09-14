import { NgModule } from '@angular/core';
import { CommonModule} from '@angular/common';
import {HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PreformPageRoutingModule } from './preform-routing.module';

import { PreformPage } from './preform.page';

import { UserService } from '../api/user.service';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PreformPageRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
  ],
  declarations: [PreformPage],
  providers: [
    UserService,
  ],
})
export class PreformPageModule {}
