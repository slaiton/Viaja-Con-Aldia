import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TramiteRegistroPage } from './pages/tramite-registro.page';

const routes: Routes = [
  {
    path: '',
    component: TramiteRegistroPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TramiteRegistroRoutingModule {}
