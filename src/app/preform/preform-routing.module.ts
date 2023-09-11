import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PreformPage } from './preform.page';

const routes: Routes = [
  {
    path: '',
    component: PreformPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PreformPageRoutingModule {}
