import {
  Component, Input, OnInit, Output, EventEmitter
} from '@angular/core';
import { Router } from '@angular/router';
import {
  ActionSheetController, AlertController, LoadingController, Platform
} from '@ionic/angular';
import { PhotoService } from '@core/services/photo.service';
import { UserService } from '@core/services/user.service';
import { RegistroService } from '@core/services/registro.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Photo } from '@capacitor/camera';
import { firstValueFrom } from 'rxjs';
import { VehiculosFacade } from './vehiculos.facade';
import { VehiculoListItem } from '@core/models/vehiculo.model';

@Component({
  selector: 'app-vehiculo',
  templateUrl: './vehiculo.component.html',
  styleUrls: ['./vehiculo.component.scss']
  // ShadowDom eliminado: los tokens globales del Mockup ahora penetran correctamente
})
export class VehiculoComponent implements OnInit {

  @Input() public dataTercero: any;
  @Output() dismissChange = new EventEmitter<boolean>();

  // ─── Estado UI ──────────────────────────────────────────────────────────
  isModalOpen   = false;
  modalCodeOpen = false;
  nuevoVehiculo = true;
  codeValidation = false;

  dataVehiculos: VehiculoListItem[] = [];
  cargando = false;

  // Formularios (conservados para el modal de registro/búsqueda)
  formVehicle!: FormGroup;
  formPlaca!: FormGroup;
  formSendCode!: FormGroup;

  // Datos del vehículo en proceso de cambio/registro
  vehiculo: any = {
    placa: '', claseVehiculo: '', celularPropietario: '',
    celularPropietariox3: '', celularPropietarioLast: '',
    codigoTerce: '', articulado: false, modelo: '',
    marca: '', linea: '', color: '', carroceria: '',
    codigoClase: '', codigoMarca: '', codigoLinea: '',
    codigoColor: '', codigoCarroceria: '', codigoSatelital: '',
    empresaSatelital: '', usuarioSatelital: '', claveSatelital: '',
    cuentaSatelital: '', fechaSoat: '', fechaTecno: '', remolque: '',
    foto: null
  };

  hubImag: any = {
    fotovehi1:  { webviewPath: false },
    fotoremol:  { webviewPath: false },
    tarjePror1: { webviewPath: false },
    tarjePror2: { webviewPath: false },
  };

  searchTerm = '';
  documents_vehiculo: any;
  documents_conductor: any;

  // Catálogos para autocomplete (cargados al abrir modal)
  dataClases: any[] = [];
  dataMarcas: any[] = [];
  dataLineas: any[] = [];
  dataColores: any[] = [];
  dataCarroc: any[] = [];
  dataSatelital: any[] = [];

  keyword = 'name';
  itemTemplate: any;
  notFoundTemplate: any;

  private canDismissOverride = false;
  private loadingData: any;

  constructor(
    private fb: FormBuilder,
    private photo: PhotoService,
    private alertController: AlertController,
    private router: Router,
    private user: UserService,
    private loading: LoadingController,
    private reg: RegistroService,
    private actionSheetCtrl: ActionSheetController,
    private auth: AuthService,
    private platform: Platform,
    private facade: VehiculosFacade
  ) {
    this.platform.ready().then(() => this.setStatusBarColor());

    this.formVehicle = this.fb.group({
      claseVehiculo:    ['', Validators.required],
      carroceria:       ['', Validators.required],
      linea:            ['', Validators.required],
      color:            ['', Validators.required],
      fechaSoat:        [''],
      fechaTecno:       [''],
      marca:            ['', Validators.required],
      modelo:           ['', Validators.required],
      remolque:         [''],
      empresaSatelital: ['', Validators.required],
      usuarioSatelital: ['', Validators.required],
      claveSatelital:   ['', Validators.required],
      cuentaSatelital:  [''],
      codigoPropietario:[''],
      placa:            ['']
    });

    this.formPlaca = this.fb.group({ placa: ['', Validators.required] });
    this.formSendCode = this.fb.group({ codigo: ['', Validators.required] });

    this.documents_vehiculo  = this.user.documents_vehiculo;
    this.documents_conductor = this.user.documents_conductor;
  }

  async ngOnInit(): Promise<void> {
    if (!this.user.getToken()) {
      this.router.navigate(['/login']);
      return;
    }
    await this.cargarVehiculos();
  }

  // ─── Carga de lista ─────────────────────────────────────────────────────

  private async cargarVehiculos(): Promise<void> {
    const loadingData = await this.loading.create({ message: 'Generando datos...' });
    await loadingData.present();
    try {
      this.dataVehiculos = await this.facade.getListaVehiculos();
    } catch {
      await this.presentAlert('Error', 'al cargar datos', '', 'Cerrar');
    } finally {
      await loadingData.dismiss();
    }
  }

  // ─── Selección / cambio de vehículo ────────────────────────────────────

  selectChange(placa: string): void {
    this.vehiculo.placa = placa;
    this.setOpenCode(true);
  }

  async changeVehicleDriver(placa: string, cedulaVH: string): Promise<void> {
    const loadingData = await this.loading.create({ message: 'Validando Datos...' });
    await loadingData.present();
    try {
      await this.facade.cambiarVehiculo(placa, cedulaVH);
      await this.presentAlert('Vehículo Asignado', 'Por favor inicia sesión con el nuevo vehículo.', '', 'Cerrar');
      this.onDismissChange(true);
      this.setOpenVehiculo(false);
      this.auth.logout();
    } catch (err: any) {
      if (err?.message === 'SMS_PENDIENTE') {
        await this.presentAlert('Alerta', 'Proceso pendiente', 'Ingrese el código recibido', 'Cerrar');
        this.setOpenCode(true);
      } else if (err?.message === 'PLACA_OTRO_CONDUCTOR') {
        await this.presentAlert('Alerta', '', 'La placa que intenta registrar está asociada a otro conductor.', 'Cerrar');
        this.setOpenCode(true);
      } else {
        await this.presentAlert('Error', '', 'Ocurrió un evento inesperado', 'Cerrar');
      }
    } finally {
      await loadingData.dismiss();
    }
  }

  async approveCode(): Promise<void> {
    const json = {
      cedula: this.user.getCedula(),
      placa:  this.vehiculo.placa,
      codigo: this.formSendCode.value.codigo
    };
    const data = await this.reg.validateCode(json, this.user.getToken());
    if (data.status) {
      await this.facade.cambiarVehiculoActivo({ placa: this.vehiculo.placa, cedula: this.user.getCedula() });
      this.setOpenCode(false);
    }
  }

  async sendCodeValidation(): Promise<void> {
    const json = {
      cedula:   this.user.getCedula(),
      placa:    this.vehiculo.placa,
      telefono: this.vehiculo.celularPropietario
    };
    const data = await this.reg.sendCode(json, this.user.getToken());
    if (data?.status_sms === 202 || data?.code) {
      this.codeValidation = true;
    }
  }

  async deleteVehicle(placa: string): Promise<void> {
    const loadingData = await this.loading.create({ message: 'Cargando Datos...' });
    await loadingData.present();
    try {
      await this.facade.eliminarVehiculo(placa);
      this.onDismissChange(true);
      this.setOpenVehiculo(false);
      await this.cargarVehiculos();
    } finally {
      await loadingData.dismiss();
    }
  }

  // ─── Búsqueda de nueva placa ────────────────────────────────────────────

  async changeVehicle(): Promise<void> {
    const loadingData = await this.loading.create({ message: 'Validando Datos...' });
    await loadingData.present();
    try {
      this.nuevoVehiculo = true;
      this.formVehicle.reset();
      const placaEl = document.getElementById('placa') as HTMLInputElement | null;
      const placaText = placaEl?.value?.trim() ?? '';
      if (placaText.length > 5) {
        this.vehiculo.placa = placaText;
        const datos = await this.facade.buscarVehiculoPorPlaca(placaText);
        if (datos) {
          this.vehiculo.claseVehiculo = datos.nombreClaseVeh;
          this.vehiculo.celularPropietario = datos.celularPropietario;
          this.vehiculo.codigoTerce = datos.codigoTercerox;
          if (datos.celularPropietario) this.chartsCelular(datos.celularPropietario);
          this.nuevoVehiculo = false;
        }
      }
    } catch (err: any) {
      if (err?.status === 401) this.user.logout();
      this.nuevoVehiculo = true;
    } finally {
      await loadingData.dismiss();
    }
  }

  // ─── Formulario de registro de vehículo nuevo ───────────────────────────

  async editVehicule(placa: string): Promise<void> {
    const loadingData = await this.loading.create({ message: 'Generando datos...' });
    this.vehiculo.placa = placa;
    await loadingData.present();
    try {
      const datos = await this.facade.buscarVehiculoPorPlaca(placa);
      if (datos) this.populateFormFromData(datos);
      const [clases, marcas, colores, satelital] = await Promise.all([
        this.facade.getCatalogoClases(),
        this.facade.getCatalogoMarcas(),
        this.facade.getCatalogoColores(),
        this.facade.getCatalogoSatelital()
      ]);
      this.dataClases = clases;
      this.dataMarcas = marcas;
      this.dataColores = colores;
      this.dataSatelital = satelital;
      if (datos) {
        const obj2 = clases.find(c => c.name === datos.nombreClaseVeh);
        if (obj2) { this.vehiculo.codigoClase = obj2.id; this.dataCarroc = await this.facade.getCarrocerias(obj2.id); }
        const obj1 = marcas.find(m => m.name === datos.nombreVehmarca);
        if (obj1) { this.vehiculo.codigoMarca = obj1.id; this.dataLineas = await this.facade.getLineas(obj1.id); }
      }
    } finally {
      await loadingData.dismiss();
      this.setOpenVehiculo(true);
    }
  }

  async onSubmitVehicle(): Promise<void> {
    this.formVehicle.patchValue({ codigoPropietario: this.user.getCedula() });
    let text = '<ul>';
    let validate = true;
    const jsonApi: any = { placa: this.vehiculo.placa };

    for (const campo in this.formVehicle.controls) {
      if (this.formVehicle.controls[campo].invalid) {
        validate = false;
        text += `<li>${campo.charAt(0).toUpperCase() + campo.slice(1)}</li>`;
      } else {
        this.vehiculo[campo] = this.formVehicle.value[campo];
        jsonApi[campo] = this.formVehicle.value[campo];
      }
    }

    if (this.vehiculo.articulado && !this.formVehicle.value.remolque) {
      validate = false;
      text += '<li>Placa Remolque</li>';
    }
    text += '</ul>';

    const jsonDocs: any = { files: [] };
    if (this.hubImag['fotovehi1']?.base64) {
      jsonDocs.files.push({ codigo: this.vehiculo.placa, tipo: 'fotovehi1', tipoRegistro: 'vehiculo', data64: this.hubImag['fotovehi1'].base64 });
    } else {
      validate = false;
      text += '<li>Foto Vehículo</li>';
    }
    if (this.hubImag?.fotoremol?.base64)  jsonDocs.files.push({ codigo: this.vehiculo.remolque, tipo: 'fotoremol',  tipoRegistro: 'remolque', data64: this.hubImag.fotoremol.base64 });
    if (this.hubImag?.tarjePror1?.base64) jsonDocs.files.push({ codigo: this.vehiculo.remolque, tipo: 'tarjePro1', tipoRegistro: 'remolque', data64: this.hubImag.tarjePror1.base64 });
    if (this.hubImag?.tarjePror2?.base64) jsonDocs.files.push({ codigo: this.vehiculo.remolque, tipo: 'tarjePro2', tipoRegistro: 'remolque', data64: this.hubImag.tarjePror2.base64 });

    if (!validate) {
      await this.presentAlert('Error', 'Es necesario ingresar:', text, 'Cerrar');
      return;
    }

    const loadingData = await this.loading.create({ message: 'Guardando Datos...' });
    await loadingData.present();
    try {
      await firstValueFrom(this.user.cargaDocumentos(jsonDocs));
      await this.changeVehicleDriver(this.vehiculo.placa, '');
      this.onDismissChange(true);
      this.setOpenVehiculo(false);
      await this.cargarVehiculos();
    } catch {
      await this.presentAlert('Error', 'Se ha presentado un error cargando la foto', '', 'Cerrar');
    } finally {
      await loadingData.dismiss();
    }
  }

  // ─── Métodos auxiliares de UI ───────────────────────────────────────────

  async newVehicle(): Promise<void> {
    this.nuevoVehiculo = true;
    this.formVehicle.reset();
    this.resetVehicle();
    this.setOpenVehiculo(true);
    const [clases, marcas, colores, satelital] = await Promise.all([
      this.facade.getCatalogoClases(),
      this.facade.getCatalogoMarcas(),
      this.facade.getCatalogoColores(),
      this.facade.getCatalogoSatelital()
    ]);
    this.dataClases = clases;
    this.dataMarcas = marcas;
    this.dataColores = colores;
    this.dataSatelital = satelital;
  }

  selectEvent(e: any): void {
    this.vehiculo.claseVehiculo = e.name;
    this.vehiculo.codigoClase   = e.id;
    if (e.tipo === 'ARTICULADO') { this.vehiculo.articulado = true; this.formVehicle.get('remolque')?.setValidators(Validators.required); }
    else { this.vehiculo.articulado = false; this.vehiculo.remolque = ''; this.formVehicle.patchValue({ remolque: '' }); }
    this.facade.getCarrocerias(e.id).then(d => { this.dataCarroc = d; });
  }

  selectMarca(e: any):    void { this.vehiculo.marca = e.name; this.vehiculo.codigoMarca = e.id; this.facade.getLineas(e.id).then(d => { this.dataLineas = d; }); }
  selectLinea(e: any):    void { this.vehiculo.linea = e.name; this.vehiculo.codigoLinea = e.id; }
  selectColor(e: any):    void { this.vehiculo.color = e.name; this.vehiculo.codigoColor = e.id; }
  selectCarroceria(e: any): void { this.vehiculo.carroceria = e.name; this.vehiculo.codigoCarroceria = e.id; }
  selectSatelital(e: any):  void { this.vehiculo.empresaSatelital = e.name; this.vehiculo.codigoSatelital = e.id; }

  onChangeSearch(_: any) {}
  onFocused(_: any) {}
  onChangeMarca(_: any) {}
  onFocusedMarca(_: any) {}
  onChangeLinea(_: any) {}
  onFocusedLinea(_: any) {}
  onChangeColor(_: any) {}
  onFocusedColor(_: any) {}
  onChangeCarroceria(_: any) {}
  onFocusedCarroceria(_: any) {}
  onChangeSatelital(_: any) {}
  onFocusedSatelital(_: any) {}

  reseteVehicle(): void { this.nuevoVehiculo = true; this.vehiculo.placa = ''; this.vehiculo.claseVehiculo = ''; }
  resetVehicle():  void {
    this.formVehicle.reset();
    Object.keys(this.vehiculo).forEach(k => this.vehiculo[k] = '');
    this.vehiculo.articulado = false;
    this.hubImag.fotovehi1.webviewPath = '';
  }

  upperPlaca(e: any):   void { this.searchTerm = e.detail.value?.toUpperCase() ?? ''; }
  chartsCelular(cel: string): void {
    this.vehiculo.celularPropietariox3   = cel.slice(0, 3);
    this.vehiculo.celularPropietarioLast = cel.charAt(cel.length - 1);
  }

  setOpenVehiculo(v: boolean): void { this.isModalOpen = v; }
  setOpenCode(v: boolean):     void { this.modalCodeOpen = v; }
  onWillPresent():             void { this.canDismissOverride = false; }
  onDismissChange(v: boolean): void { this.dismissChange.emit(v); this.canDismissOverride = v; }

  handleRefresh(event: any): void {
    this.cargarVehiculos().then(() => event.target.complete());
  }

  cancelNewVehicle = async (): Promise<boolean> => {
    if (this.canDismissOverride) return true;
    const actionSheet = await this.actionSheetCtrl.create({
      header: '¿Seguro desea salir?',
      buttons: [
        { text: 'Sí', role: 'confirm', handler: () => this.resetVehicle() },
        { text: 'No', role: 'cancel' }
      ]
    });
    await actionSheet.present();
    const { role } = await actionSheet.onWillDismiss();
    return role === 'confirm';
  };

  async addToCamera(name: string, rotate: any): Promise<void> {
    this.loadingData = await this.loading.create({ message: 'Guardando Foto..' });
    this.photo.addNewToCamera(name).then(da => { this.loadingData.present(); this.processImage(da, name, rotate); });
  }

  async processImage(da: any, name: string, rotate: any): Promise<void> {
    try {
      const rot = rotate ? 90 : 0;
      const processed: any = await this.photo.processAndRotationImage(da.base64, rot);
      const dataPhoto1: Photo = { webPath: processed, format: 'jpeg', saved: false };
      const data64 = await this.photo.readAsBase64(dataPhoto1);
      const dataUrl  = await this.photo.processImage(data64);
      const dataPhoto2: Photo = { webPath: dataUrl, format: 'jpeg', saved: false };
      da.webviewPath = dataUrl;
      da.base64 = await this.photo.readAsBase64(dataPhoto2);
      this.hubImag[name] = da;
      this.loadingData.dismiss();
    } catch (err) { console.error('Error al procesar imagen:', err); }
  }

  async cambiarVehiculoActivo(json: { placa: string; cedula: string }): Promise<void> {
    await this.facade.cambiarVehiculoActivo(json);
  }

  async presentAlert(title: string, subheader: string, desc: string, botton: string): Promise<void> {
    const alert = await this.alertController.create({ header: title, subHeader: subheader, message: desc, buttons: [botton] });
    await alert.present();
  }

  private setStatusBarColor(): void {
    if (this.platform.is('android')) StatusBar.setBackgroundColor({ color: '#0094DA' });
    else if (this.platform.is('ios')) StatusBar.setStyle({ style: Style.Dark });
  }

  private populateFormFromData(datos: any): void {
    this.vehiculo.codigoTerce        = datos.codigoTercerox;
    this.vehiculo.codigoMarca        = datos.codigoVehmarca;
    this.vehiculo.codigoLinea        = datos.codigoVehlinea;
    this.vehiculo.codigoClase        = datos.codigoVehclase;
    this.vehiculo.codigoColor        = datos.codigoVehcolor;
    this.vehiculo.codigoCarroceria   = datos.codigoVehcarro;
    this.vehiculo.marca              = datos.nombreVehmarca;
    this.vehiculo.carroceria         = datos.nombreVehcarro;
    this.vehiculo.claseVehiculo      = datos.nombreClaseVeh;
    this.vehiculo.linea              = datos.nombreVehlinea;
    this.vehiculo.color              = datos.nombreVehcolor;
    this.vehiculo.modelo             = datos.numeroModeloxx;
    this.vehiculo.usuarioSatelital   = datos.sateliUsuariox;
    this.vehiculo.claveSatelital     = datos.satelContrasen;
    this.vehiculo.codigoSatelital    = datos.sateliEmpresax;
    this.vehiculo.empresaSatelital   = datos.nombreAppempgp;
    this.vehiculo.cuentaSatelital    = datos.satelCuentaxx;
    this.vehiculo.celularPropietario = datos.celularPropietario;
    this.vehiculo.fechaSoat          = datos.fechaxSoatxxxx ?? '';
    this.vehiculo.fechaTecno         = datos.fechaxTecnimec ?? '';
    this.vehiculo.articulado         = datos.tipoxxVehiculo === 'ARTICULADO';
    if (datos.celularPropietario) this.chartsCelular(datos.celularPropietario);
  }
}
