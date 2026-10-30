import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { DocumentosFacade, DocumentoUI, SemaforoConteo, SubDocumentoItem } from './documentos.facade';

@Component({
  selector: 'app-datos',
  templateUrl: './datos.page.html',
  styleUrls: ['./datos.page.scss'],
})
export class DatosPage implements OnInit {

  placaActual = '';
  cargando = true;
  guardando = false;

  documentos: DocumentoUI[] = [];
  semaforo: SemaforoConteo = {
    vigentes: 0,
    porVencer: 0,
    vencidos: 0,
    total: 0
  };

  // ─── Modal de Actualización de Documento ──────────────────────────────
  isModalOpen = false;
  docSeleccionado: DocumentoUI | null = null;
  subDocSeleccionado: SubDocumentoItem | null = null;
  nuevaFechaVigencia = '';
  previewComprimido: string | null = null;
  tamanoKb = 0;
  formatoImg = '';

  constructor(
    private facade: DocumentosFacade,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit(): Promise<void> {
    if (!this.facade.getToken()) {
      this.router.navigate(['/login']);
      return;
    }
    this.placaActual = this.facade.getPlaca();
    await this.cargarDocumentos();
  }

  async handleRefresh(event: any): Promise<void> {
    await this.cargarDocumentos();
    event.target.complete();
  }

  async cargarDocumentos(): Promise<void> {
    this.cargando = true;
    try {
      const data = await this.facade.getDocumentosYVigencias();
      this.documentos = data.documentos;
      this.semaforo = data.semaforo;
    } catch (err) {
      console.error('[DatosPage] Error cargando documentos:', err);
    } finally {
      this.cargando = false;
    }
  }

  // ─── Flujo de Actualización / Modal ───────────────────────────────────

  abrirActualizar(doc: DocumentoUI, subDoc?: SubDocumentoItem): void {
    this.docSeleccionado = doc;
    this.subDocSeleccionado = subDoc || (doc.subdocumentos && doc.subdocumentos[0]) || null;
    this.nuevaFechaVigencia = doc.fechaVigencia || '';
    this.previewComprimido = null;
    this.tamanoKb = 0;
    this.formatoImg = '';
    this.isModalOpen = true;
  }

  cerrarModal(): void {
    this.isModalOpen = false;
    this.previewComprimido = null;
    this.docSeleccionado = null;
    this.subDocSeleccionado = null;
  }

  seleccionarSubDoc(subDoc: SubDocumentoItem): void {
    this.subDocSeleccionado = subDoc;
    this.previewComprimido = null;
    this.tamanoKb = 0;
  }

  // ─── Captura con Compresión WebP Obligatoria ──────────────────────────

  async tomarFoto(): Promise<void> {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });

      if (photo?.base64String) {
        await this.procesarYComprimir(photo.base64String);
      }
    } catch (err: any) {
      if (err?.message !== 'User cancelled photos app') {
        console.warn('[DatosPage] Error capturando foto:', err);
      }
    }
  }

  async seleccionarGaleria(): Promise<void> {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos
      });

      if (photo?.base64String) {
        await this.procesarYComprimir(photo.base64String);
      }
    } catch (err: any) {
      if (err?.message !== 'User cancelled photos app') {
        console.warn('[DatosPage] Error seleccionando de galería:', err);
      }
    }
  }

  private async procesarYComprimir(base64: string): Promise<void> {
    const loading = await this.loadingCtrl.create({
      message: 'Comprimiendo imagen WebP...'
    });
    await loading.present();

    try {
      const resultado = await this.facade.comprimirFoto(base64);
      this.previewComprimido = resultado.dataUrl;
      this.tamanoKb = Math.round(resultado.sizeBytes / 1024);
      this.formatoImg = resultado.format.replace('image/', '').toUpperCase();
    } catch (err) {
      console.error('[DatosPage] Error en compresión:', err);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo optimizar la imagen. Intenta nuevamente.',
        buttons: ['Aceptar']
      });
      await alert.present();
    } finally {
      await loading.dismiss();
    }
  }

  // ─── Confirmación y Envío al Backend ──────────────────────────────────

  async confirmarSubida(): Promise<void> {
    if (!this.docSeleccionado || !this.subDocSeleccionado) return;

    if (!this.previewComprimido) {
      const alert = await this.alertCtrl.create({
        header: 'Foto requerida',
        message: 'Por favor toma una foto o selecciona una imagen del documento.',
        buttons: ['Entendido']
      });
      await alert.present();
      return;
    }

    this.guardando = true;
    const loading = await this.loadingCtrl.create({
      message: 'Subiendo documento optimizado...'
    });
    await loading.present();

    try {
      await this.facade.subirDocumento(
        this.subDocSeleccionado.codigo,
        this.docSeleccionado.tipoRegistro,
        this.previewComprimido,
        this.docSeleccionado.tagFecha,
        this.nuevaFechaVigencia
      );

      this.cerrarModal();
      await this.cargarDocumentos();

      const successAlert = await this.alertCtrl.create({
        header: 'Documento Actualizado',
        message: `El documento fue subido exitosamente en formato ${this.formatoImg} (${this.tamanoKb} KB).`,
        buttons: ['Continuar']
      });
      await successAlert.present();
    } catch (err) {
      console.error('[DatosPage] Error subiendo documento:', err);
      const errorAlert = await this.alertCtrl.create({
        header: 'Error de Envío',
        message: 'Ocurrió un problema al subir el documento. Verifica tu conexión e intenta de nuevo.',
        buttons: ['Cerrar']
      });
      await errorAlert.present();
    } finally {
      this.guardando = false;
      await loading.dismiss();
    }
  }
}
