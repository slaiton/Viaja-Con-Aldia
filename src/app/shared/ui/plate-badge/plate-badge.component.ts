import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-plate-badge',
  templateUrl: './plate-badge.component.html',
  styleUrls: ['./plate-badge.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class PlateBadgeComponent {
  @Input() placa: string = '';
  @Input() municipio: string = 'SERVICIO PÚBLICO';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  /**
   * Formatea la placa al estándar colombiano (ej: "WAA123" -> "WAA-123")
   */
  get placaFormateada(): string {
    if (!this.placa) return '--- - ---';
    const cleaned = this.placa.replace(/[\s\-_]/g, '').toUpperCase();
    if (cleaned.length === 6) {
      return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}`;
    }
    return this.placa.toUpperCase();
  }

  get municipioUpper(): string {
    return (this.municipio || 'SERVICIO PÚBLICO').toUpperCase().trim();
  }
}
