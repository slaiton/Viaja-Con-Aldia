import { Component, ElementRef, Input, OnInit, ViewChild, Renderer2, ViewEncapsulation } from '@angular/core';
import {FaceApiService} from '../api/face-api.service';
import {VideoPlayerService} from '../api/video-player.service';
import { PhotoService } from '../api/photo.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Platform } from '@ionic/angular';








@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class DashboardComponent  implements OnInit {


  // @ViewChild('videoElement{ñ') public videoElement!: ElementRef;
  @ViewChild('canvasElement', { static: true }) canvasElement!: ElementRef<HTMLCanvasElement>;
    public context!: CanvasRenderingContext2D|null;

  public videoElement:any;
  @Input() stream:any;
  @Input() width!: number;
  @Input() height!: number;
  modelsReady!: boolean;
  listEvents: Array<any> = [];
  overCanvas: any;
  hubImag:any = []


  constructor(
    private renderer2: Renderer2,
    private elementRef: ElementRef,
    private faceApiService: FaceApiService,
    private videoPlayerService: VideoPlayerService,
    private photo: PhotoService,
  ) 
  {
  }


  ngOnInit():void {
    this.context = this.canvasElement.nativeElement.getContext('2d');
  }


  listenerEvents = () => {
    const observer1$ = this.faceApiService.cbModels.subscribe(res => {
      //: TODO Los modelos estan ready!!
      this.modelsReady = true;
      this.checkFace();
    });

    const observer2$ = this.videoPlayerService.cbAi
      .subscribe(({resizedDetections, displaySize, expressions, eyes}) => {
        resizedDetections = resizedDetections[0] || null;
        // :TODO Aqui pintamos! dibujamos!
        if (resizedDetections) {
          this.drawFace(resizedDetections, displaySize, eyes);
        }
      });

    this.listEvents = [observer1$, observer2$];
  };

  drawFace = (resizedDetections:any, displaySize:any, eyes:any) => {
    const {globalFace} = this.faceApiService;
    this.overCanvas.getContext('2d').clearRect(0, 0, displaySize.width, displaySize.height);
    // globalFace.draw.drawDetections(this.overCanvas, resizedDetections);
    // globalFace.draw.drawFaceLandmarks(this.overCanvas, resizedDetections);

    const scale = this.width / displaySize.width;
    console.log(scale);

    const elementFilterEye = document.querySelector('.filter-eye');
    this.renderer2.setStyle(elementFilterEye, 'left', `${eyes.left[0].x * scale}px`);
    this.renderer2.setStyle(elementFilterEye, 'top', `${eyes.left[0].y * scale}px`);
  };

  checkFace = () => {
    setInterval(async () => {
      await this.videoPlayerService.getLandMark(this.videoElement);
    }, 100);
  };

  loadedMetaData(): void {
    this.videoElement.nativeElement.play();
  }

  listenerPlay(): void {
    const {globalFace} = this.faceApiService;
    this.overCanvas = globalFace.createCanvasFromMedia(this.videoElement.nativeElement);
    this.renderer2.setProperty(this.overCanvas, 'id', 'new-canvas-over');
    this.renderer2.setStyle(this.overCanvas, 'width', `${this.width}px`);
    this.renderer2.setStyle(this.overCanvas, 'height', `${this.height}px`);
    this.renderer2.appendChild(this.elementRef.nativeElement, this.overCanvas);
  }


  addToCamera(name:any){
    const pwaCameraElement = document.querySelector('body');
    
    const shadowRoot: DocumentFragment = this.elementRef.nativeElement.shadowRoot;
    const Button = document.querySelector('html');
    
    console.log(this.elementRef.nativeElement.pwaCameraElement);
    console.log(Button);
    console.log(shadowRoot);

    this.listenerEvents();
    
    
    this.photo.addNewToCameraProfileTest(name).then((da) => {
      

    });


  }

  
  drawLines(): void {
    // Configuraciones de estilo de línea
    this.context!.strokeStyle = 'blue';
    this.context!.lineWidth = 5;

    // Dibujar una línea
    this.context?.beginPath();
    this.context?.moveTo(50, 50); // Punto inicial (x, y)
    this.context?.lineTo(200, 50); // Punto final (x, y)
    this.context?.stroke(); // Dibujar la línea

    // Dibujar otra línea
    this.context?.beginPath();
    this.context?.moveTo(50, 100);
    this.context?.lineTo(200, 100);
    this.context?.stroke();
  }
 

}
