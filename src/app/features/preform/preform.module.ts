import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { PreformPageRoutingModule } from './preform-routing.module';
import { PreformPage } from './preform.page';
import { UserService } from '../../core/services/user.service';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PreformPageRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [PreformPage],
  providers: [UserService]
})
export class PreformPageModule {}
