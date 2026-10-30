import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { PreoperacionalApi } from '@domain/preoperacional.api';
import { ImageCompressionService } from '@core/services/image-compression.service';
import { OutboxSyncService } from '@core/offline/outbox-sync.service';
import { UserService } from '@core/services/user.service';
import {
  CategoriaOpcional,
  ItemNoCumple,
  PreguntaPreoperacional,
  PreoperacionalPayload,
  PreoperacionalProgreso,
  PreoperacionalSubmitResult,
  RespuestaPreoperacional,
  WizardStep
} from '@core/models/preoperacional.model';

@Injectable({
  providedIn: 'root'
})
export class PreoperacionalFacade {
  private readonly CATEGORIAS_INICIALES: CategoriaOpcional[] = [
    { nombre: 'Cisterna', label: '¿Su vehículo es tipo cisterna?', aplica: '' },
    { nombre: 'Ninera', label: '¿Su vehículo es tipo niñera?', aplica: '' },
    { nombre: 'Refrigeracion', label: '¿Su vehículo es refrigerado?', aplica: '' }
  ];

  // Subjects de Estado
  private preguntasSubject = new BehaviorSubject<PreguntaPreoperacional[]>([]);
  private indiceActualSubject = new BehaviorSubject<number>(0);
  private categoriasSubject = new BehaviorSubject<CategoriaOpcional[]>(this.CATEGORIAS_INICIALES);
  private respuestasSubject = new BehaviorSubject<Record<number, 'CUMPLE' | 'NO CUMPLE'>>({});
  private alertasNoCumpleSubject = new BehaviorSubject<ItemNoCumple[]>([]);
  private wizardStepSubject = new BehaviorSubject<WizardStep>('PREGUNTAS');
  private categoriaPromptSubject = new BehaviorSubject<CategoriaOpcional | null>(null);
  private fotoSubject = new BehaviorSubject<{ base64: string; webviewPath: string; sizeKb: number } | null>(null);
  private isSubmittingSubject = new BehaviorSubject<boolean>(false);
  private isLoadingSubject = new BehaviorSubject<boolean>(true);
  private placaSubject = new BehaviorSubject<string>('');

  // Observables Públicos
  public readonly preguntas$ = this.preguntasSubject.asObservable();
  public readonly indiceActual$ = this.indiceActualSubject.asObservable();
  public readonly wizardStep$ = this.wizardStepSubject.asObservable();
  public readonly categoriaPrompt$ = this.categoriaPromptSubject.asObservable();
  public readonly alertasNoCumple$ = this.alertasNoCumpleSubject.asObservable();
  public readonly fotoVehiculo$ = this.fotoSubject.asObservable();
  public readonly isSubmitting$ = this.isSubmittingSubject.asObservable();
  public readonly isLoading$ = this.isLoadingSubject.asObservable();
  public readonly placa$ = this.placaSubject.asObservable();
  public readonly isOnline$ = this.outboxSync.isOnline$;

  // Pregunta actual dinámica
  public readonly preguntaActual$: Observable<PreguntaPreoperacional | null> = combineLatest([
    this.preguntas$,
    this.indiceActual$
  ]).pipe(
    map(([preguntas, indice]) => {
      if (!preguntas || preguntas.length === 0 || indice >= preguntas.length) {
        return null;
      }
      return preguntas[indice];
    })
  );

  // Progreso del asistente
  public readonly progreso$: Observable<PreoperacionalProgreso> = combineLatest([
    this.preguntas$,
    this.indiceActual$
  ]).pipe(
    map(([preguntas, indice]) => {
      const total = preguntas.length || 1;
      const actual = Math.min(indice + 1, total);
      const porcentaje = Math.round((indice / total) * 100);
      const categoriaActual = preguntas[indice]?.categoria || 'General';
      return { actual, total, porcentaje, categoriaActual };
    })
  );

  constructor(
    private preopApi: PreoperacionalApi,
    private compressionService: ImageCompressionService,
    private outboxSync: OutboxSyncService,
    private userService: UserService
  ) {}

  /**
   * Inicializa el formulario preoperacional cargando preguntas y reseteando estado.
   */
  async inicializar(placaParam?: string): Promise<void> {
    this.isLoadingSubject.next(true);

    const placa = (placaParam || this.userService.getPlaca() || '').trim().toUpperCase();
    this.placaSubject.next(placa);

    this.categoriasSubject.next(JSON.parse(JSON.stringify(this.CATEGORIAS_INICIALES)));
    this.respuestasSubject.next({});
    this.alertasNoCumpleSubject.next([]);
    this.fotoSubject.next(null);
    this.indiceActualSubject.next(0);
    this.isSubmittingSubject.next(false);

    try {
      const preguntas = await this.preopApi.getPreguntas();
      this.preguntasSubject.next(preguntas);
      this.evaluarPasoActual();
    } catch (err) {
      console.error('[PreoperacionalFacade] Error cargando preguntas:', err);
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  /**
   * Evalúa el elemento actual según si es categoría condicional o pregunta directa.
   */
  private evaluarPasoActual(): void {
    const preguntas = this.preguntasSubject.getValue();
    const indice = this.indiceActualSubject.getValue();
    const categorias = this.categoriasSubject.getValue();

    // Si terminó todas las preguntas
    if (indice >= preguntas.length) {
      const alertas = this.alertasNoCumpleSubject.getValue();
      const pendientes = alertas.filter(a => !a.solucionado);

      if (pendientes.length > 0) {
        this.wizardStepSubject.next('ALERTAS_RESOLVER');
      } else {
        this.wizardStepSubject.next('FOTO_FINAL');
      }
      this.categoriaPromptSubject.next(null);
      return;
    }

    const p = preguntas[indice];

    if (p.opcional) {
      const cat = categorias.find(c => c.nombre.toLowerCase() === p.categoria.toLowerCase());

      // Si la categoría aún no se ha respondido
      if (cat && cat.aplica === '') {
        this.categoriaPromptSubject.next(cat);
        this.wizardStepSubject.next('CATEGORIA_PROMPT');
        return;
      }

      // Si la categoría se marcó como "No Aplica", saltar automáticamente
      if (cat && cat.aplica === false) {
        const respuestas = this.respuestasSubject.getValue();
        respuestas[p.id] = 'CUMPLE';
        this.respuestasSubject.next(respuestas);

        this.indiceActualSubject.next(indice + 1);
        this.evaluarPasoActual();
        return;
      }
    }

    // Paso de pregunta normal
    this.categoriaPromptSubject.next(null);
    this.wizardStepSubject.next('PREGUNTAS');
  }

  /**
   * Registra respuesta ('CUMPLE' o 'NO CUMPLE') y avanza el asistente.
   */
  responder(valor: 'CUMPLE' | 'NO CUMPLE'): void {
    const preguntas = this.preguntasSubject.getValue();
    const indice = this.indiceActualSubject.getValue();

    if (indice >= preguntas.length) return;

    const p = preguntas[indice];
    const respuestas = this.respuestasSubject.getValue();
    respuestas[p.id] = valor;
    this.respuestasSubject.next(respuestas);

    if (valor === 'NO CUMPLE') {
      const alertas = this.alertasNoCumpleSubject.getValue();
      const existe = alertas.some(a => a.id === p.id);
      if (!existe && !p.opcional) {
        alertas.push({
          id: p.id,
          index: indice,
          texto: p.texto,
          descripcion: p.descripcion,
          categoria: p.categoria,
          solucionado: false
        });
        this.alertasNoCumpleSubject.next([...alertas]);
      }
    }

    this.indiceActualSubject.next(indice + 1);
    this.evaluarPasoActual();
  }

  /**
   * Responde si aplica o no una categoría especial.
   */
  responderCategoria(nombreCategoria: string, aplica: boolean): void {
    const categorias = this.categoriasSubject.getValue();
    const cat = categorias.find(c => c.nombre.toLowerCase() === nombreCategoria.toLowerCase());

    if (cat) {
      cat.aplica = aplica;
      this.categoriasSubject.next([...categorias]);
    }

    this.evaluarPasoActual();
  }

  /**
   * Regresa al paso o pregunta anterior en el asistente.
   */
  anterior(): void {
    const step = this.wizardStepSubject.getValue();

    if (step === 'FOTO_FINAL' || step === 'ALERTAS_RESOLVER') {
      const total = this.preguntasSubject.getValue().length;
      this.indiceActualSubject.next(Math.max(0, total - 1));
      this.wizardStepSubject.next('PREGUNTAS');
      return;
    }

    const indice = this.indiceActualSubject.getValue();
    if (indice > 0) {
      this.indiceActualSubject.next(indice - 1);
      this.evaluarPasoActual();
    }
  }

  /**
   * Marca como solucionado un hallazgo previo "NO CUMPLE".
   */
  marcarSolucionado(preguntaId: number): void {
    const alertas = this.alertasNoCumpleSubject.getValue();
    const item = alertas.find(a => a.id === preguntaId);
    if (item) {
      item.solucionado = true;
      this.alertasNoCumpleSubject.next([...alertas]);
    }

    const respuestas = this.respuestasSubject.getValue();
    respuestas[preguntaId] = 'CUMPLE';
    this.respuestasSubject.next(respuestas);
  }

  /**
   * Avanza desde la resolución de alertas hacia la captura de foto final.
   */
  continuarAFoto(): void {
    this.wizardStepSubject.next('FOTO_FINAL');
  }

  /**
   * Captura foto del vehículo con la cámara o galería y la comprime a WebP (< 100 KB).
   */
  async capturarFoto(source: CameraSource = CameraSource.Camera): Promise<void> {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source
      });

      if (!image.dataUrl) return;

      const comprimida = await this.compressionService.compressImage(image.dataUrl, {
        quality: 0.72,
        maxDimension: 1280,
        preferredFormat: 'image/webp'
      });

      const sizeKb = Math.round(comprimida.sizeBytes / 1024);

      this.fotoSubject.next({
        base64: comprimida.dataUrl,
        webviewPath: comprimida.dataUrl,
        sizeKb
      });
    } catch (err) {
      console.warn('[PreoperacionalFacade] Captura de foto cancelada o rechazada:', err);
    }
  }

  /**
   * Envía la inspección completa al backend o la encola en Dexie si no hay red.
   */
  async enviarPreoperacional(): Promise<PreoperacionalSubmitResult> {
    const foto = this.fotoSubject.getValue();
    if (!foto || !foto.base64) {
      return {
        success: false,
        offline: false,
        message: 'Por favor toma la foto del vehículo antes de finalizar la inspección.'
      };
    }

    const preguntas = this.preguntasSubject.getValue();
    const respuestasMap = this.respuestasSubject.getValue();
    const alertas = this.alertasNoCumpleSubject.getValue();

    const respuestasList: RespuestaPreoperacional[] = preguntas.map(p => ({
      id: p.id,
      respuesta: respuestasMap[p.id] || 'CUMPLE'
    }));

    const sinSolucionar = alertas.filter(a => !a.solucionado).length;
    const confirmacion = sinSolucionar === 0 ? 1 : 0;

    const payload: PreoperacionalPayload = {
      vehiculo: this.placaSubject.getValue(),
      empresa: 1,
      confirmacion,
      imagen: foto.base64,
      respuestas: respuestasList
    };

    this.isSubmittingSubject.next(true);

    try {
      const result = await this.preopApi.enviarPreoperacional(payload);
      if (result.success) {
        this.wizardStepSubject.next('COMPLETADO');
      }
      return result;
    } finally {
      this.isSubmittingSubject.next(false);
    }
  }
}

