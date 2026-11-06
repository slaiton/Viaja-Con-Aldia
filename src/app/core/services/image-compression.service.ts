import { Injectable } from '@angular/core';

/** Opciones de compresión para `ImageCompressionService.compressImage()` */
export interface CompressOptions {
  /** Longitud máxima (px) del lado mayor de la imagen resultante. Por defecto: 1280. */
  maxDimension?: number;
  /** Calidad de compresión entre 0 y 1. Por defecto: 0.75. */
  quality?: number;
  /**
   * Formato de salida preferido.
   * En entornos que no soporten WebP (iOS < 14) el servicio hace fallback a 'image/jpeg' automáticamente.
   * Por defecto: 'image/webp'.
   */
  preferredFormat?: 'image/webp' | 'image/jpeg';
}

/** Resultado devuelto por `compressImage()` */
export interface CompressResult {
  /** DataURL lista para enviar al servidor o mostrar en <img>. */
  dataUrl: string;
  /** Tamaño aproximado del resultado en bytes. */
  sizeBytes: number;
  /** Formato MIME real usado ('image/webp' | 'image/jpeg'). */
  format: string;
  /** Dimensiones finales de la imagen tras el redimensionamiento. */
  width: number;
  height: number;
}

@Injectable({ providedIn: 'root' })
export class ImageCompressionService {

  private readonly DEFAULT_MAX_DIMENSION = 1280;
  private readonly DEFAULT_QUALITY = 0.75;
  private readonly DEFAULT_FORMAT: 'image/webp' | 'image/jpeg' = 'image/webp';

  /**
   * Comprime una imagen recibida como DataURL o cadena base64 pura.
   *
   * @param source  DataURL (`data:image/...;base64,...`) o base64 puro.
   * @param options Opciones opcionales de compresión.
   * @returns Promesa con el resultado comprimido.
   */
  compressImage(source: string, options: CompressOptions = {}): Promise<CompressResult> {
    const dataUrl = this.ensureDataUrl(source);
    return this.processDataUrl(dataUrl, options);
  }

  /**
   * Comprime una imagen recibida como `Blob` (p. ej., de `@capacitor/camera` con `resultType: 'uri'`
   * luego leída con `fetch`).
   *
   * @param blob    Objeto Blob de la imagen original.
   * @param options Opciones opcionales de compresión.
   * @returns Promesa con el resultado comprimido.
   */
  compressBlob(blob: Blob, options: CompressOptions = {}): Promise<CompressResult> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Error leyendo el Blob de imagen.'));
      reader.readAsDataURL(blob);
    }).then(dataUrl => this.processDataUrl(dataUrl, options));
  }

  // ─── Métodos privados ──────────────────────────────────────────────────────

  private processDataUrl(dataUrl: string, options: CompressOptions): Promise<CompressResult> {
    const maxDimension = options.maxDimension ?? this.DEFAULT_MAX_DIMENSION;
    const quality      = options.quality      ?? this.DEFAULT_QUALITY;
    const preferred    = options.preferredFormat ?? this.DEFAULT_FORMAT;

    return new Promise<CompressResult>((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        try {
          const { width, height } = this.calcDimensions(img.naturalWidth, img.naturalHeight, maxDimension);

          const canvas = document.createElement('canvas');
          canvas.width  = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('No se pudo obtener el contexto 2D del canvas.'));
            return;
          }

          // Fondo blanco para imágenes con transparencia (PNG -> JPEG/WebP)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Intentar el formato preferido; hacer fallback si el resultado es vacío o no se soporta
          const format = this.resolveFormat(canvas, preferred);
          const resultUrl = canvas.toDataURL(format, quality);

          // Calcular tamaño aproximado (base64 representa 3/4 del binario)
          const base64Data = resultUrl.split(',')[1] ?? '';
          const sizeBytes  = Math.round((base64Data.length * 3) / 4);

          resolve({ dataUrl: resultUrl, sizeBytes, format, width, height });
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => reject(new Error('No se pudo cargar la imagen para compresión.'));
      img.src = dataUrl;
    });
  }

  /**
   * Calcula las nuevas dimensiones manteniendo el aspect ratio original.
   * Si la imagen ya cabe dentro del límite, no se escala.
   */
  private calcDimensions(
    srcW: number,
    srcH: number,
    maxDimension: number
  ): { width: number; height: number } {
    if (srcW <= maxDimension && srcH <= maxDimension) {
      return { width: srcW, height: srcH };
    }

    if (srcW >= srcH) {
      return {
        width:  maxDimension,
        height: Math.round((srcH / srcW) * maxDimension),
      };
    } else {
      return {
        width:  Math.round((srcW / srcH) * maxDimension),
        height: maxDimension,
      };
    }
  }

  /**
   * Determina el formato MIME real a usar.
   * Hace fallback a 'image/jpeg' si el entorno no soporta WebP
   * (el canvas devuelve 'image/png' en ese caso).
   */
  private resolveFormat(canvas: HTMLCanvasElement, preferred: string): string {
    if (preferred === 'image/jpeg') {
      return 'image/jpeg';
    }

    // Comprobar soporte de WebP: si el resultado empieza con 'data:image/png', no hay soporte.
    const probe = canvas.toDataURL('image/webp', 0.5);
    if (probe.startsWith('data:image/png')) {
      return 'image/jpeg'; // Fallback para iOS < 14 y Safari antiguo
    }
    return 'image/webp';
  }

  /** Garantiza que la cadena sea un DataURL válido o Blob URL (agrega prefijo si es base64 puro). */
  private ensureDataUrl(source: string): string {
    if (source.startsWith('data:') || source.startsWith('blob:')) {
      return source;
    }
    // Base64 puro sin prefijo MIME -> asumimos JPEG (lo más común de @capacitor/camera)
    return `data:image/jpeg;base64,${source}`;
  }
}
