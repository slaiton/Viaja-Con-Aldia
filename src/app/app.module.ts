import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy , RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { DatosPage } from './features/datos/datos.page';
import { AuthService } from '@core/services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { TipoDocumentoDirective } from './directives/tipo-documento.directive';
import { VehiculoComponent } from './features/vehiculo/vehiculo.component';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { EmptyScreenComponent } from './features/empty-screen/empty-screen.component';



@NgModule({
  declarations: [AppComponent,DashboardComponent, TipoDocumentoDirective, VehiculoComponent, EmptyScreenComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    AutocompleteLibModule
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, Geolocation, AuthService, CookieService],
  bootstrap: [AppComponent],
})
export class AppModule {}
