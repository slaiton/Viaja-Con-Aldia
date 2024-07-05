import { Component, ElementRef, Input, OnInit, ViewChild, Renderer2, ViewEncapsulation } from '@angular/core';
import {FaceApiService} from '../api/face-api.service';
import {VideoPlayerService} from '../api/video-player.service';
import { PhotoService } from '../api/photo.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { GeodataService } from '../api/geodata.service';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class DashboardComponent{


  constructor(private geolocation: Geolocation)
  {
  }

  // async init() {
  //   try {
  //     const permissions = await BackgroundRunner.requestPermissions({
  //       apis:['geolocation', 'notifications']
  //     });
  //     console.log('OK' + permissions);

  //   } catch (error) {

  //     console.log('Shit  '  + error);

  //   }

  // }

  // getPosition() {
  //   this.geolocation
  //   .getCurrentPosition()
  //   .then((resp) => {
  //       return { lat: resp.coords.latitude, lon: resp.coords.longitude }
  //   })
  //   .catch((error) => {
  //     console.log('Error getting location', error);
  //   });
  // }

  // async geoSave() {
  //   const geoData:any = this.getPosition();
  //    const result = await BackgroundRunner.dispatchEvent({
  //     label: 'com.viajaconaldia.runner.check',
  //     event: 'geoSave',
  //     details: {}
  //    })

  //    console.log('SAVE' + result);

  //   }

  // async geoLoad() {
  //   const result = await BackgroundRunner.dispatchEvent({
  //     label: 'com.viajaconaldia.runner.check',
  //     event: 'geoLoad',
  //     details: {}
  //    })

  //    console.log('LOAD' + result);

  // }


}
