# AGENTS.md · Viaja con Aldia

Contexto y reglas para cualquier agente de código que trabaje en este repositorio (Claude Code, Cursor, Codex, Copilot u otros), incluidos los subagentes que lancen. Si una instrucción de una tarea contradice este archivo, pregunta antes de actuar.

El diagnóstico completo y el plan de refactor están en [docs/artefactos/2026-10-21-plan-refactor.html](docs/artefactos/2026-10-21-plan-refactor.html).

---

## 1. El proyecto

- App móvil para conductores terceros de Aldia Logística: login, enturnamiento por regional, preoperacional diario, documentos del conductor y del vehículo, gestión de vehículos y registro de conductores nuevos.
- **Stack:** Angular 15 (NgModules), Ionic 6, Capacitor 7, TypeScript 4.8, RxJS 7. Proyecto iOS en `ios/`; Android todavía no está en el repositorio.
- **Backends:** API 3SL (`api.3slogistica.com`, autenticación Bearer), API Aldia (`api.aldialogistica.com`) y SIAT (`siat.aldialogistica.*`).
- **Usuarios:** conductores en cabina, muchas veces con sol directo, señal intermitente y una sola mano libre.

### Comandos

| Tarea | Comando |
|---|---|
| Instalar | `npm install --legacy-peer-deps` |
| Servidor local | `npm start` (`ionic serve`) |
| Build | `npm run build` (sale en `www/`, ignorado por git) |
| Lint | `npm run lint` |
| Pruebas | `npx ng test --watch=false --browsers=ChromeHeadless` |
| Sincronizar iOS | `npx cap sync ios` (pide permiso antes) |

Para correr la app hace falta `src/environments/environment.ts`, que se crea copiando `environment.example.ts` con los valores que entrega el equipo. Los agentes no crean, leen ni editan ese archivo.

---

## 2. Reglas de trabajo para agentes

1. **Nunca hagas commits.** Tampoco push, merge, rebase, cherry-pick, revert, tag, reset ni `clean`, y no crees ni fusiones PRs. El repositorio lo bloquea con `.claude/settings.json` y `.claude/hooks/bloquear-git.js`; no intentes rodear el bloqueo. Los comandos de solo lectura (`status`, `diff`, `log`, `show`, `blame`, `ls-files`) sí están permitidos.
2. **No cambies de rama ni descartes cambios** (`checkout`, `switch`, `restore`, `stash`, `rm`) salvo que la persona lo pida en la conversación. Puede haber trabajo sin commitear que no es tuyo.
3. **Documenta en `docs/artefactos/`.** Análisis, planes, decisiones de arquitectura y diseños van ahí, con las convenciones de [docs/artefactos/README.md](docs/artefactos/README.md). Si modificaste archivos, agrega una entrada al inicio de [docs/artefactos/BITACORA.md](docs/artefactos/BITACORA.md) con los cambios, lo verificado, lo pendiente y un mensaje de commit sugerido para quien haga el commit.
4. **Idioma:** español en documentación, textos de la interfaz, comentarios y mensajes de commit sugeridos.
5. **Alcance:** haz lo que se pidió. Si encuentras otro problema, anótalo como pendiente en la bitácora en lugar de arreglarlo de paso.
6. **Reporta con honestidad:** si no corriste lint, build o pruebas, dilo. Si algo falló, muestra la salida.
7. **Pregunta antes de:** agregar o quitar dependencias; tocar `ios/`, `capacitor.config.ts`, `angular.json`, `codemagic.yaml` o `deploy.sh`; cambiar contratos con el backend; borrar archivos.
8. **Mantén este archivo al día:** cuando una fase del plan avance, actualiza la sección 11.

---

## 3. Seguridad (no negociable)

- **Ningún secreto en el cliente.** Nada de usuarios o contraseñas de servicio, client secrets, tokens ni API keys en el código, en archivos `environment*.ts` nuevos ni en artefactos. Todo lo que `environment.ts` contiene se compila dentro del APK. Lo que necesite credenciales de servicio pasa por un endpoint BFF del backend 3SL.
  - **Deuda conocida:** hoy la app envía `user`/`password` y `X-Client-Id`/`X-Client-Secret` desde `user.service.ts`, `photo.service.ts`, `geodata.service.ts`, `home.page.ts` y `preform.page.ts`. No agregues usos nuevos; se eliminan en la Fase 0.
- **No leas archivos con secretos:** `src/environments/environment.ts`, `environment.prod.ts`, `.env*`, `*.keystore`, `*.jks`, `*.p12`. Para conocer la forma de la configuración usa `environment.example.ts`.
- **Datos personales:** nunca registres en consola, logs ni artefactos el token, la cédula, la placa, el celular, el correo, las fotos o los documentos de un conductor. Están protegidos por la Ley 1581 de 2012 (habeas data). En ejemplos usa datos inventados.
- **Sin DOM directo:** nada de `innerHTML`, `document.createElement`, `getElementById` ni `querySelector` para mostrar datos; usa plantillas de Angular.
- **Sin datos sensibles en URLs:** ni tokens ni datos personales en rutas o query strings.
- **Solo HTTPS.** El único HTTP existente (`siat.aldialogistica.com:8000`) es deuda conocida; no agregues otro.
- **Nada generado ni firmado en git:** `www/`, `*.apk`, `*.aab`, `*.ipa` y las llaves están en `.gitignore`. La llave de firma va en los secretos del CI.

---

## 4. Arquitectura actual (en transición)

Estado al 21 de octubre de 2026. Esto es lo que vas a encontrar; no es el modelo a copiar.

```
src/app/
├─ api/            servicios HTTP sueltos (geodata, turnos, global, notificaciones) y face-api sin uso
├─ core/models/    3 interfaces
├─ core/services/  auth, user (805 líneas, 3 backends), registro, photo, alert, storage, local-notification
├─ directives/     tipo-documento (sin uso real)
├─ guard/          login.guard (valida la expiración del JWT)
├─ features/       home, login, registro, datos, turnos, preform, vehiculo, dashboard, empty-screen
└─ utils/          runner.js (sin uso)
```

- **Modelo a seguir:** `features/login`. Página de 70 líneas, formulario reactivo y `AuthFacadeService` que orquesta `VersionService` y `AuthService` con RxJS.
- **Archivos congelados.** Solo se aceptan correcciones de errores, nunca funciones nuevas. Si un cambio necesita más, se extrae a la estructura objetivo y el archivo viejo pasa a usar lo extraído:
  - `features/registro/registro.page.ts` (3.444 líneas) y `registro.page.html`
  - `features/datos/datos.page.ts` (2.968) y `datos.page.html`
  - `features/vehiculo/vehiculo.component.ts` (1.293) y su HTML
  - `features/home/pages/home.page.ts` (697)
  - `features/registro/components/documentos` y `features/datos/components/documentos`
  - `core/services/user.service.ts` (805) y `core/services/registro.service.ts`
  - `src/global.scss` (1.010)
- **No copies bloques** de estos archivos a archivos nuevos. Si necesitas su lógica, extráela una sola vez a `domain/` o `shared/`.

---

## 5. Arquitectura objetivo

Capas dentro de cada feature (estilo feature-sliced) con tres patrones: **Facade** por pantalla, **Container / Presentational** para los componentes y **Repository** para los datos (`*.api.ts`). No se usa NgRx: un facade con `BehaviorSubject` mientras siga Angular 15, y signals después de la actualización.

```
src/app/
├─ core/             se instancia una vez
│  ├─ config/        api.config.ts (URLs por entorno, InjectionToken)
│  ├─ http/          interceptores: api-base, auth, error
│  ├─ session/       session.store, auth.guard, guest.guard
│  ├─ platform/      camera, geolocation, network, push, secure-storage, app-version
│  ├─ ui/            alert.service, toast.service
│  └─ layout/        tabs.page, offline-banner
├─ shared/           piezas sin estado
│  ├─ ui/            plate-badge, plate-input, status-chip, catalog-picker, photo-picker, otp-input, step-header, empty-state
│  ├─ utils/         image.ts, fechas.ts, texto.ts
│  └─ validators/    cedula, placa
├─ domain/           una carpeta por entidad: modelo + API + UI reutilizable
│  ├─ conductor/     conductor.model, conductor.api, conductor.mapper, datos-personales-form
│  ├─ vehiculo/      vehiculo.model, vehiculos.api, catalogos.api, vehiculo-form
│  ├─ tercero/       tercero.model, terceros.api, tercero-form (propietario y tenedor)
│  ├─ documento/     documento.model, documentos.api, document-catalog.ts, doc-capture
│  └─ turno/         turno.model, turnos.api, regionales.api
└─ features/         pantallas, cada una con su facade
   ├─ auth/          login.page, codigo.page, auth.facade
   ├─ inicio/        inicio.page, status-hero, destinos-list, turno-sheet, inicio.facade
   ├─ preoperacional/ checklist.page, pregunta-card, preop.facade
   ├─ documentos/    documentos.page, captura.page, documentos.facade
   ├─ perfil/        perfil.page, datos-personales.page, terceros.page, perfil.facade
   ├─ vehiculos/     vehiculos.page, vehiculo-detalle.page, vehiculos.facade
   └─ registro/      registro.page (asistente de 6 pasos), steps/*, registro.facade
```

### Reglas de dependencia

1. Las dependencias van hacia abajo: `features → domain → shared → core`. Una feature no importa de otra feature.
2. Una página solo inyecta su facade y los servicios de `core/ui`. Nunca `HttpClient` ni plugins de Capacitor.
3. Los componentes de presentación solo usan `@Input` y `@Output`, con `ChangeDetectionStrategy.OnPush`, y no inyectan servicios.
4. Los facades exponen un view model (`vm$`, o signals tras la actualización) y métodos con nombre de intención (`cargar()`, `enturnar()`, `guardarDocumento()`). Manejan los estados de carga, error y vacío.
5. Las APIs de dominio son la única capa que conoce URLs y DTOs. Devuelven modelos tipados a través de un mapper (`toConductor(dto)`). Los nombres del backend (`nombreTercerox`, `numeroPlacaxxx`) no salen del mapper.
6. Los plugins nativos se usan solo a través de `core/platform`.
7. La sesión (token, cédula, placa) vive solo en `SessionStore`. Nadie lee `localStorage` directamente.
8. Un componente hijo nunca inyecta a su página padre.

### Archivos y nombres

- Archivos en kebab-case con sufijo de rol: `*.page.ts`, `*.component.ts`, `*.facade.ts`, `*.api.ts`, `*.mapper.ts`, `*.model.ts`, `*.store.ts`, `*.service.ts`, `*.guard.ts`, `*.interceptor.ts`.
- Nombres del dominio en español y completos: `conductor`, `vehiculo`, `tercero`, `documento`, `turno`, `preoperacional`, `regional`. Los sufijos técnicos siguen la convención de Angular en inglés.
- Selectores con prefijo `app-` en kebab-case (lo exige `.eslintrc.json`).
- Imports con alias: `@core/*`, `@shared/*`, `@features/*`, `@models/*`, `@env/*`. Al crear `domain/`, agrega `@domain/*` en `tsconfig.json`. Nada de `../../../`.
- Límites: archivo de 400 líneas, plantilla de 200 y método de 40 como máximo. Si se superan, se divide.

---

## 6. Código

### TypeScript
- Prohibido `any` en código nuevo. Usa tipos, `unknown` con estrechamiento o genéricos. Los DTOs del backend se tipan en `*.model.ts`, aunque sea de forma parcial.
- Sin `console.*` en código nuevo. Si hace falta registrar, se hace con un logger de `core` que se apaga en producción.
- Sin código comentado: se borra, git lo conserva.
- Sin imports de Node (`console`, `cors`, `fs`, `path`).
- Las reglas de negocio usan constantes o enums tipados (`EstadoConductor.Activo`, `CodigoRespuesta.SinContenido`), no literales sueltos como `'ACTIVO'`, `'204'` o `'SI'`.

### RxJS
- Observables de punta a punta. No uses `toPromise()`; si de verdad necesitas una promesa, usa `firstValueFrom` o `lastValueFrom`.
- En plantillas, `async` pipe. Si suscribes dentro de un componente, cancela con `takeUntil(this.destroy$)` (o `takeUntilDestroyed` después de la actualización).
- No uses `rxjs-compat` ni `rxjs-observable`.

### Angular
- Formularios reactivos. Nunca `[ngModel]` junto a `formControlName`.
- `trackBy` con un identificador estable, nunca `Math.random()`.
- Navega con `Router` o `NavController`. Prohibido `window.location.reload()` y `location.href` para navegar o refrescar datos.
- Rutas nuevas con carga bajo demanda y guard cuando requieran sesión.
- Declara componentes nuevos en el módulo de su feature (o standalone), nunca en `AppModule`.
- Alertas, toasts y loaders solo a través de `core/ui` (`AlertService`), no con `AlertController` directo en páginas.
- Los estados normales (sin turno, lista vacía) se muestran en la pantalla, no en alertas modales.

---

## 7. HTTP y datos

- Las URLs salen de `API_CONFIG` (InjectionToken alimentado por `environment`); nunca se escriben en el código.
- Las cabeceras de autenticación solo se agregan en interceptores (`core/http`). El 401 lo maneja el interceptor: cierra la sesión y lleva al login.
- Los reintentos se hacen solo en GET idempotentes y en el interceptor.
- Cada respuesta pasa por un mapper. Las plantillas nunca ven DTOs.
- Los catálogos (clase, marca, línea, carrocería, color, satelital, parentesco, regionales) se cachean con `shareReplay` en su API.
- Compresión, rotación y recorte de imágenes solo con `shared/utils/image.ts`.

---

## 8. Interfaz

- **Solo Ionic.** No agregues clases ni componentes de Bootstrap, ng-bootstrap o Syncfusion. Los existentes se retiran al migrar cada pantalla.
- **Tokens:** colores y tipografía desde las variables de Ionic y `src/theme/`. Sin colores literales ni `!important` en estilos nuevos. Paleta objetivo: primario `#0B72B9`, noche `#0D2A44`, al día `#1A7F37`, atención `#F2A900`, bloquea `#D3302F`; tipografía Atkinson Hyperlegible.
- **Estados:** verde es al día, ámbar pide atención, rojo bloquea. Significan lo mismo en toda la app y siempre van acompañados de texto, nunca solo color.
- **Toque:** objetivos de 48 px como mínimo, acción principal en la parte baja de la pantalla y contraste AA o mejor.
- **Cuatro estados por pantalla con datos remotos:** cargando (skeleton), vacío, error con reintento y sin conexión.
- **Accesibilidad:** `alt` en imágenes; nada de `span` o `div` clicables (usa `ion-button` o `ion-item button`); etiquetas visibles en los campos.
- **Campos:** cédula con `inputmode="numeric"` (no `type="number"`); placa en mayúsculas con formato `AAA 000`.
- **Textos:** español claro, con tildes y sin erratas, en segunda persona ("Actualiza tu SOAT"). Revisa la ortografía antes de terminar.
- **Íconos:** ionicons o assets locales; nada de imágenes remotas para la interfaz.
- **Navegación objetivo:** barra de 4 pestañas (Inicio, Preoperacional, Documentos, Perfil). Las maquetas de cada pantalla están en el plan de refactor.

---

## 9. Plataforma nativa (Capacitor)

- Un plugin por capacidad: `@capacitor/geolocation` para GPS (no Cordova) y `@capacitor/push-notifications` para push.
- Los permisos se piden cuando se necesitan, explicando para qué.
- El token de sesión pasará a almacenamiento seguro en la Fase 1. No agregues más datos sensibles a `localStorage`.
- Los cambios en `ios/` o en plugins nativos requieren permiso y `npx cap sync`.
- `environment.version` se incrementa en cada publicación; el backend lo compara con `api/version/latest` para exigir la actualización.

---

## 10. Pruebas y verificación

- Antes de terminar una tarea con cambios de código, corre `npm run lint` y `npm run build` y confirma que no hay errores nuevos. Si no se pudieron correr, dilo en la bitácora.
- El código nuevo en `domain/`, en los facades y en `shared/utils` lleva pruebas unitarias (mappers, facades, utilidades de imagen y fechas).
- Un spec de "should create" no cuenta como prueba.
- Para cambios visibles, prueba en el navegador (`npm start`) con ancho de teléfono.

---

## 11. Estado de la migración

| Fase | Contenido | Estado |
|---|---|---|
| 0 · Seguridad | Rotar credenciales, BFF en el backend, sacar llaves y build del repo, login con código SMS | En curso. `.gitignore` y desindexado de `www/`, keystore y `google-services.json` listos el 21 oct 2026; faltan rotación, BFF y SMS |
| 1 · Cimientos | `api.config`, interceptores, `SessionStore`, modelos y mappers, limpieza de dependencias, tema | Pendiente |
| 2 · Piezas compartidas | `CatalogPicker`, `VehiculoForm`, `TerceroForm`, `DocCapture`, piloto en Mis vehículos | Pendiente |
| 3 · Pantallas | Inicio, Perfil, Documentos, Registro por pasos y barra de pestañas | Pendiente |
| 4 · Actualización | Angular e Ionic vigentes, standalone, signals, pruebas y CI de Android | Pendiente |

---

## 12. Dependencias

- No agregues dependencias sin aprobación. Antes de proponer una, revisa si Angular, Ionic o Capacitor ya resuelven la necesidad.
- **Sin uso, se eliminan en la Fase 1 (no las uses):** `cors`, `@syncfusion/ej2-angular-dropdowns`, `@ng-bootstrap/ng-bootstrap`, `rxjs-compat`, `rxjs-observable`, `face-api.js`, `@tensorflow/tfjs`, `@awesome-cordova-plugins/geolocation`, `cordova-plugin-geolocation`, `ngx-cookie-service`, `lodash`.
- **En uso, se reemplazan al migrar cada pantalla (no agregues usos nuevos):** `bootstrap`, `@popperjs/core`, `angular-ng-autocomplete` (lo reemplaza `CatalogPicker`).
- Instala siempre con `--legacy-peer-deps` mientras siga Angular 15.

---

## 13. Antes de terminar

- [ ] Sin secretos, datos personales ni `console.*` nuevos.
- [ ] Sin `any` nuevos, URLs escritas a mano ni acceso directo al DOM.
- [ ] Ningún archivo congelado ganó funciones nuevas.
- [ ] Lint y build corridos, o explicado por qué no.
- [ ] Entrada en `docs/artefactos/BITACORA.md` con commit sugerido.
- [ ] Ningún commit, push ni cambio de rama.
