import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfflineBannerComponent } from './ui/offline-banner/offline-banner.component';
import { PlateBadgeComponent } from './ui/plate-badge/plate-badge.component';

@NgModule({
  imports: [
    CommonModule,
    OfflineBannerComponent,
    PlateBadgeComponent
  ],
  exports: [
    OfflineBannerComponent,
    PlateBadgeComponent
  ]
})
export class SharedModule { }
