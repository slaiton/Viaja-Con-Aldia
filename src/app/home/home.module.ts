import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { HomePage } from './home.page';
import { RouterModule } from '@angular/router';


@NgModule({
  imports: [
    NgbModule,
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    RouterModule,
    ReactiveFormsModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
