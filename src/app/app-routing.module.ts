import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginGuard } from './guard/login.guard';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { VehiculoComponent } from './features/vehiculo/vehiculo.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.module').then( m => m.HomePageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'login',
    loadChildren: () => import('./features/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'registro',
    loadChildren: () => import('./features/registro/registro.module').then( m => m.RegistroPageModule)
  },
  {
    path: 'turnos',
    loadChildren: () => import('./features/turnos/turnos.module').then( m => m.TurnosPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'datos',
    loadChildren: () => import('./features/datos/datos.module').then( m => m.DatosPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'preform',
    loadChildren: () => import('./features/preform/preform.module').then( m => m.PreformPageModule)
  },
  {
    path: 'pruebas',
    component: DashboardComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'vehiculos',
    component: VehiculoComponent,
    canActivate: [LoginGuard]
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
