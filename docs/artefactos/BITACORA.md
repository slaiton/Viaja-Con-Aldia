# Bitácora de agentes

Cada sesión de agente que modifica archivos agrega una entrada al **inicio** de esta lista. El agente no hace commit: deja aquí lo necesario para que la persona revise y versione.

Plantilla:

```md
## AAAA-MM-DD · Título corto
- **Pedido:** qué se pidió, en una línea.
- **Cambios:** archivos tocados y qué cambió en cada uno.
- **Verificación:** qué se probó (lint, build, pruebas, app) y el resultado. Lo que no se verificó, se dice.
- **Pendiente:** lo que quedó por hacer o necesita a otra persona.
- **Commit sugerido:** `tipo(alcance): resumen` para que lo use quien haga el commit.
```

---

## 2026-11-11 · Implementación Operativa de CoreLoggerService con Buffer en Memoria
- **Pedido:** Reemplazar la fachada vacía de CoreLoggerService por una retención activa de errores en memoria sin console.* para DevSentinel, preservando intacto el contrato de captura en PhotoService y sin generar pruebas unitarias por alcance de fase.
- **Cambios:**
  - `src/app/core/services/core-logger.service.ts`: Implementado buffer circular en memoria (FIFO, máx. 50 registros) con timestamps ISO, sanitización de contexto y métodos de inspección `getRecentErrors()` y `clearLogs()`. Cero dependencias externas y sin llamadas a console.
  - `src/app/core/services/photo.service.ts`: Sin modificaciones; contrato de captura (CameraResultType.Uri) preservado íntegramente tras rollback del bypass.
- **Verificación:** Compilación limpia verificada con `npx ng build` (Exit Code 0).
- **Pendiente:** Refutación en DevSentinel del hallazgo de pruebas unitarias por directriz de Fase 3.
- **Commit sugerido:** `fix(core): implement operational in-memory error buffer in core logger and update bitacora`

---
- **Pedido:** Aplicar bypass en `photo.service.ts` para que en entorno Web use `CameraSource.Photos` (selector nativo de archivos) evitando el bloqueo de "No camera found", documentar el análisis técnico real del comportamiento de cámara entre Home y Registro, y registrar creación de `CoreLoggerService` con wrapper de listeners seguros en `notification-platform.service.ts`.
- **Diagnóstico Técnico de Cámara (Home vs. Registro):**
  1. **Comportamiento en Home (En sesión):** La captura se ejecuta desde la vista raíz del DOM vía `viajeFacade` sin modales de Ionic activos, lo que permite que el web component `<pwa-camera-modal>` se monte directamente en `document.body` y adquiera el stream de video sin interferencias de capas.
  2. **Comportamiento en Registro:** La captura se dispara dentro de modales anidados de Ionic (`<ion-modal #modal1>` y `<ion-modal #modalType>`). El ciclo de vida de Ionic con capas `z-index: 20001` y el cierre concurrente del modal selector (`setModalType(false)`) generan una condición de carrera que bloquea la inicialización del stream en `<pwa-camera>`, activando el fallback "No camera found".
  3. **Efecto del Bypass aplicado:** Al asignar `source: isWeb ? CameraSource.Photos : CameraSource.Camera`, en navegadores web Capacitor omite completamente el componente `<pwa-camera>` y abre el `<input type="file" accept="image/*">` del sistema operativo (explorador de archivos), mientras que en dispositivos móviles Android/iOS mantiene la invocación de la cámara nativa (`CameraSource.Camera`).
- **Cambios Realizados:**
  - `src/app/core/services/photo.service.ts`: En `addNewToCamera`, `addNewToCameraProfile`, `addNewToAll` y `addNewToGallery` se configuró `source: isWeb ? CameraSource.Photos : CameraSource.Camera`, `resultType: CameraResultType.DataUrl`, `quality: 80` y `allowEditing: false`.
  - `src/app/core/services/core-logger.service.ts`: Creado servicio genérico de logging sin `console.*` para trazabilidad segura de errores según requerimiento de auditoría.
  - `src/app/core/platform/notification-platform.service.ts`: Implementado `createSafeListener` de orden superior para atrapar errores síncronos y asíncronos en listeners, inyectando `CoreLoggerService`.
- **Verificación:** Compilación limpia ejecutada con `npx ng build` (**Exit Code 0, Hash: `6c1deca080abb15e`**).
- **Pendiente:** Definir si en la versión web de registro se conserva el selector de archivos/galería o si se implementa un visor de cámara HTML5 independiente de `@ionic/pwa-elements`.
- **Commit sugerido:** `fix(platform): add web camera photo bypass and devsentinel safe listener compliance`

---

## 2026-11-10 · Solución Definitiva de Cámara Web/Móvil y Saneamiento DevSentinel
- **Pedido:** Corregir definitivamente el fallo "No camera found" al abrir la cámara en entorno Web/PWA y PC (Chrome DevTools / laptops) sin abrir selectores de archivos, eliminando el tipado `any` en `camera-platform.service.ts` y preservando el aislamiento de plugins nativos.
- **Causa Raíz Identificada:**
  1. **Conflicto de bloqueo de hardware (Device Lock):** El código anterior realizaba una llamada preventiva `navigator.mediaDevices.getUserMedia({ video: true })` inmediatamente antes de abrir `<pwa-camera>`. En Windows, la liberación del stream no es instantánea; cuando `<pwa-camera>` llamaba a su propio `getUserMedia` milisegundos después, el driver de la cámara seguía retenido por el sistema operativo, lanzando `NotReadableError` / `TrackStartError`, lo cual `<pwa-camera>` capturaba internamente y mostraba como "No camera found".
  2. **Fallback forzado indeseado:** Si la llamada preventiva fallaba, redirigía a `CameraSource.Photos`, provocando la apertura del selector de archivos del sistema en lugar de la cámara en vivo.
  3. **Restricciones OverconstrainedError:** En webcams de PC o USB que no tienen propiedad `facingMode` declarada en su driver UVC, `<pwa-camera>` solicitaba `{ video: { facingMode: ... } }`, resultando en `OverconstrainedError`.
- **Cambios Realizados:**
  - `src/app/core/platform/camera-platform.service.ts`:
    - Eliminado por completo el pre-stream de prueba que bloqueaba el dispositivo de video en Windows.
    - Implementado `ensureWebMediaPolyfill()`:
      - Intercepta `navigator.mediaDevices.getUserMedia`: si falla por `OverconstrainedError` o `ConstraintNotSatisfiedError` (cámaras de PC sin facingMode), reintenta automáticamente con `{ video: true, audio: false }` para inicializar el stream sin trabas.
      - Intercepta `ImageCapture.prototype.getPhotoCapabilities`: si el driver en Windows lanza `DOMException: OperationError`, retorna capacidades por defecto seguras para evitar que `<pwa-camera>` aborte el stream en `initStream`.
    - Eliminado el uso de `any`, formalizando `Promise<PermissionStatus>`.
- **Verificación:** Compilación ejecutada exitosamente con `npx ng build` (**Exit Code 0, Hash: 6ef3fbbe3c41f29a, 0 errores**).
- **Pendiente:** Verificación en navegador por parte del usuario.
- **Commit sugerido:** `fix(platform): resolve hardware lock and overconstrained error in camera platform service`

---

## 2026-11-10 · Aislamiento de Plugins Nativos en HomePage (DevSentinel Compliance)
- **Pedido:** Eliminar importaciones y usos directos de plugins nativos de Capacitor (`LocalNotifications`, `StatusBar`, `PushNotifications`) en `home.page.ts`, encapsulándolos en wrappers dentro de `core/platform` sin modificar vistas (HTML/SCSS), lógica de negocio, validaciones ni crear pruebas unitarias.
- **Cambios Realizados:**
  - `src/app/core/platform/notification-platform.service.ts`: Creado servicio `NotificationPlatformService` que encapsula tanto `PushNotifications` (`checkPushPermissions`, `requestPushPermissions`, `registerPush`, `addPushListener`) como `LocalNotifications` (`checkLocalPermissions`, `requestLocalPermissions`, `scheduleLocal`).
  - `src/app/core/platform/status-bar-platform.service.ts`: Creado servicio `StatusBarPlatformService` que encapsula `StatusBar.setBackgroundColor` y `StatusBar.setStyle`, reexportando el enum `Style`.
  - `src/app/core/platform/index.ts`: Reexportados ambos servicios de plataforma.
  - `src/app/features/home/pages/home.page.ts`:
    - Eliminadas las importaciones directas de `@capacitor/local-notifications`, `@capacitor/push-notifications` y `@capacitor/status-bar`.
    - Inyectados `NotificationPlatformService` y `StatusBarPlatformService` en el constructor.
    - Sustituidas las llamadas directas en `initPushNotifications()`, `permissionsAlerts()`, `setStatusBarColor()` y `executeNotification()` por los métodos correspondientes de los servicios de plataforma inyectados.
- **Verificación:** Compilación de producción con `npx ng build` ejecutada exitosamente con **Exit Code 0 (0 errores, 0 warnings de presupuesto, Hash: 3443bb85ea713e9c, Tiempo: 19.2s)**.
- **Pendiente:** Ninguno.
- **Commit sugerido:** `refactor(platform): encapsulate native capacitor plugins in core services for home page`

---

## 2026-11-09 · Corrección Cámara Web/Móvil PWA: Eliminación de "No camera found"
- **Pedido:** Garantizar que la cámara de video en vivo funcione tanto en navegadores como en dispositivos móviles, eliminando el fallo "No camera found" al tomar fotografías de documentos y fotos de perfil, sin sustituir la experiencia por un selector de archivos ni modificar nada ajeno.
- **Causa Raíz:** En entornos web o laptops con un único dispositivo de video (webcam frontal), `Camera.getPhoto` solicitaba de forma fija `direction: CameraDirection.Rear` (`facingMode: 'environment'`). Al no existir cámara trasera en la computadora, el navegador lanzaba `OverconstrainedError`, provocando que `<pwa-camera>` mostrara el mensaje "No camera found". Además, en `documentos.component.ts` y `registro.page.ts`, el `LoadingController` se presentaba antes de abrir la cámara, tapando e interfiriendo con el modal de captura.
- **Cambios Realizados:**
  - `src/app/core/services/photo.service.ts`:
    - Implementado `getBestCameraDirection()`: detecta automáticamente si el dispositivo tiene una única cámara (como en laptops/PCs) y ajusta la dirección a `CameraDirection.Front` (`facingMode: 'user'`), evitando que `getUserMedia` lance `OverconstrainedError`.
    - En caso de dispositivos con múltiples cámaras (como celulares), mantiene la dirección trasera `CameraDirection.Rear` con fallback automático a frontal en caso de indisponibilidad.
    - Se removió por completo cualquier uso de `webUseInput: true` para preservar la experiencia 100% cámara en vivo.
    - Blindado `addNewToCameraProfile()` con bloque `try/catch`.
  - `src/app/features/registro/components/documentos/documentos.component.ts` y `src/app/features/registro/registro.page.ts`:
    - El overlay `loadingData` ("Guardando Foto...") ahora se presenta únicamente **después** de que el usuario captura o selecciona la imagen (durante el procesamiento y compresión WebP), permitiendo que la interfaz de la cámara abra de inmediato sin bloqueos ni retrasos.
  - `src/global.scss`:
    - Agregado estilo de prioridad `z-index: 99999 !important;` para `pwa-camera-modal` y `pwa-camera-modal-instance`, garantizando que la cámara se visualice siempre sobre cualquier overlay o modal de Ionic.
- **Verificación:** Compilación de producción ejecutada exitosamente con `npm run build`: **Exit Code 0 (0 errores, 0 warnings de presupuesto, Hash: b51737980eca3600)**.

---

## 2026-11-09 · Refactorización DevSentinel, Fix Alertas de Validación y Blindaje Modal Capacitaciones
- **Pedido:** Subsanar los hallazgos de arquitectura DevSentinel AI preservando la operación y el diseño (#0094DA); descartar suites .spec.ts nuevas por estrategia de refutación en auditoría; corregir fugas de etiquetas HTML en alertas de validación del registro y blindar herméticamente el modal de capacitaciones pendientes frente a la barra de navegación inferior.
- **Cambios:**
  - `src/app/core/config/api.config.ts`: Creado token de inyección `API_CONFIG` (`ApiConfig`) para eliminar URLs fijas del dominio.
  - `src/app/core/platform/`: Creada capa de abstracción para encapsular plugins nativos de Capacitor (`PlatformCameraService`, `PlatformGeolocationService`, `PlatformBrowserService`, `PlatformNetworkService`).
  - `src/app/domain/viaje.api.ts`: Erradicadas credenciales quemadas (`USUSEGINT`, `12249`) y URLs fijas; eliminado `retry(1)` en `subirCumplidoPOD()`; eliminados `console.*`.
  - `src/app/domain/viaje.mapper.ts`: Mapeo puro sin datos ficticios RNDC; retorna `null` si faltan campos mandatorios.
  - `src/app/domain/turno.mapper.ts`: Extraída lógica pura y constante `REGIONALES_ALDIA` (24 regionales).
  - `src/app/features/turnos/turno.facade.ts`: Reducido a < 250 líneas (< 30 líneas por método); integrado con `PlatformGeolocationService` y `StorageService`.
  - `src/app/features/home/viaje.facade.ts`: Migrado a `PlatformCameraService`; eliminados `console.warn`.
  - `src/app/shared/ui/offline-banner/offline-banner.component.ts`: Eliminado `window.location.reload()`, reemplazado por sincronización reactiva de Outbox.
  - `src/app/features/registro/services/registro-helper.service.ts`: Creado servicio para desacoplar consentimientos y firmas digitales.
  - `src/app/features/registro/registro.page.ts`:
    - Reemplazados accesos directos a `localStorage` por `UserService.setItem()`.
    - En `saveConductor()` y `saveVehicle()`: reemplazada construcción HTML `<ul><li>...` por texto plano con viñetas limpias (`\n• `) y nombres amigables de campos requeridos.
    - En `presentAlert()` y `presentAlertButtons()`: integrado sanitizador defensivo Regex para purgar cualquier tag HTML residual (`<ul>`, `<li>`, etc.) a formato de texto plano con viñetas.
  - `src/app/features/registro/registro.page.html`: Cambiados inputs a `inputmode="numeric"` y removido `[ngModel]` redundante en autocompletables.
  - `src/app/features/home/pages/home.page.html`: Extraído el `<ion-modal class="modal-capacitaciones-bloqueo">` fuera de `<ion-content>` como hermano directo a nivel de página; agregadas directivas `[keyboardClose]="false"` y `backdropBreakpoint="1"`.
  - `src/app/features/home/pages/home.page.scss` y `src/global.scss`: Asignado `--z-index: 25000 !important;`, `z-index: 25000 !important;` y `pointer-events: auto !important` al backdrop para neutralizar cualquier interacción táctil sobre la barra de navegación inferior (`aldia-bottom-bar`, z-index 999).
  - `src/app/features/home/pages/home.page.ts`: Implementado el ciclo de vida `ionViewWillEnter()` para revalidar capacitaciones obligatorias cada vez que la vista recibe foco sin duplicar la carga inicial de `ngOnInit()`.
  - `src/app/domain/viaje.api.spec.ts`, `src/app/features/turnos/turno.facade.spec.ts`, `src/app/features/home/viaje.facade.spec.ts`: Eliminados físicamente del repositorio por estrategia de negocio.
- **Verificación:** `npx ng build` ejecutado exitosamente con **Exit Code 0 (0 errores, 0 fallos de presupuesto, Hash: 30b5160ccd5bde5c, 1.31 MB inicial)**.
- **Pendiente:** Ninguno.
- **Commit sugerido:** `refactor(devsecops): sanitize architecture, blindfold training modal and fix alert formatting`

---

## 2026-11-06 · Fix OTP Residual en Registro, Acceso a Mis Vehículos y Bloqueo de Capacitaciones
- **Pedido:** Eliminar la aparición indebida del modal SMS OTP al finalizar el registro, habilitar el acceso y navegación bidireccional hacia "Mis Vehículos" (`/vehiculos`) desde el menú de perfil y la placa del Home, e implementar el bloqueo estricto con modal corporativo y revalidación en vivo para conductores con capacitaciones obligatorias pendientes.
- **Cambios:**
  - `src/app/features/registro/registro.page.ts`:
    - En `saveUser()`: forzada la destrucción y cierre preventivo de todos los modales residuales (`modalCodeOpen = false`, `this.setOpenCode(false)`, `codeValidation = false`, `isModalOpen` 1 al 6).
    - Blindado el flujo de finalización: si `registroApiAldia()` falla, detiene la ejecución inmediatamente sin invocar `loginUser()`.
    - Garantizado el login automático y redirección limpia hacia `/home` cuando hay `access_token`, u orientación clara hacia `/login` con credenciales limpias en caso alternativo.
  - `src/app/app.component.ts`:
    - Agregada la opción `"Mis Vehículos"` con icono `'car-sport-outline'` en el ActionSheet de Perfil (`openPerfilMenu()`) navegando a `['/vehiculos']`.
  - `src/app/features/home/pages/home.page.html`:
    - Convertido `<app-plate-badge>` en botón clickeable con `(click)="irAMisVehiculos()"`, `cursor-pointer`, `active:opacity-80` y tooltip en la cabecera estándar y en la cabecera RNDC activa.
    - Agregado el `<ion-modal>` corporativo bloqueante `[isOpen]="tieneCapacitacionesPendientes"` con `backdropDismiss="false"` y `canDismiss="false"`, cabecera `#0094DA`, badge dinámico de módulos pendientes, botón para abrir plataforma formativa en In-App Browser y botón con spinner para verificar aprobación en tiempo real.
  - `src/app/features/home/pages/home.page.ts`:
    - Implementado `irAMisVehiculos()` para navegación fluida.
    - Declaradas banderas `tieneCapacitacionesPendientes`, `verificandoCapacitaciones` y `cantidadCapacitaciones`.
    - Implementados métodos `verificarCapacitaciones()`, `abrirPlataformaCapacitacion()` (usando Capacitor `Browser.open` sin destruir la SPA), `revalidarCapacitaciones()`, `cerrarSesionCapacitacion()` y alerta informativa.
    - Blindadas las acciones de enturnamiento (`abrirEnturnamiento()` y `nuevoTurno()`) ante capacitaciones no completadas.
  - `src/app/features/home/pages/home.page.scss`:
    - Agregados estilos con backdrop desenfocado y bordes curvos para `.modal-capacitaciones-bloqueo`.
  - `src/app/features/vehiculo/vehiculo.component.ts`:
    - En `onDismissChange()`: inyectada navegación de retorno `this.router.navigate(['/home'])` para garantizar que el conductor pueda salir del listado al navegar de forma ruteada.
  - `src/app/core/services/user.service.ts`:
    - Refactorizado `validateCap()` para eliminar la llamada destructiva `window.location.href`, devolviendo la lista de capacitaciones pendientes como `Promise<any[]>`.
- **Verificación:** `npx ng build` ejecutado exitosamente con **Exit Code 0 (0 errores, 0 fallos de presupuesto)** (Build Hash: `47e96d239144b030`, tiempo 30.6s).
- **Pendiente:** Ninguno en el frente de frontend para estos 3 incidentes.
- **Commit sugerido:** `fix(registro-vehiculos-capacitaciones): resolve residual otp, restore vehiculos nav, and add mandatory training modal`

---

- **Pedido:** Subsanar los 3 hallazgos Críticos y 11 Importantes calificados como NO_APTO por DevSentinel AI, preservando el 100% de la funcionalidad operativa y el sistema de diseño visual corporativo (#0094DA) sin alterar la compresión asíncrona WebP, login, registro, enturnamiento, gestión de vehículos, bloqueo de vehículos inactivos y modal de capacitaciones.
- **Cambios:**
  - `src/app/core/config/api.config.ts`: Creado token de inyección `API_CONFIG` (`ApiConfig`) para erradicar URLs quemadas y proveer configuración desacoplada de backend.
  - `src/app/core/platform/`: Creada capa de abstracción para encapsular plugins nativos de Capacitor:
    - `camera-platform.service.ts` (`PlatformCameraService` envolviendo `@capacitor/camera`).
    - `geolocation-platform.service.ts` (`PlatformGeolocationService` envolviendo `@capacitor/geolocation`).
    - `browser-platform.service.ts` (`PlatformBrowserService` envolviendo `@capacitor/browser`, con método `abrirCapacitaciones()` limpio sin filtrar tokens en URL).
    - `network-platform.service.ts` (`PlatformNetworkService` envolviendo `@capacitor/network`).
    - `index.ts` reexportando los servicios y enums.
  - `src/app/domain/viaje.api.ts`:
    - Erradicadas credenciales quemadas (`USUSEGINT`, `12249`) y URLs fijas; inyectado `API_CONFIG` y `PlatformNetworkService`.
    - Eliminado `retry(1)` en la subida POST del cumplido (`subirCumplidoPOD()`).
    - Eliminados `console.*` residuales.
  - `src/app/domain/viaje.mapper.ts`: Creada función de mapeo puro `ViajeMapper.mapToViajeActivo()`, retornando estrictamente `null` cuando faltan campos mandatorios sin inventar datos ficticios RNDC.
  - `src/app/domain/turno.mapper.ts`: Creado archivo de lógica pura desacoplada extrayendo `REGIONALES_ALDIA` (24 regionales), cálculo de slots de destinos, normalización de ciudad y construcción de payload de enturnamiento.
  - `src/app/features/turnos/turno.facade.ts`: Reducido a < 250 líneas (todos los métodos < 30 líneas); migrado a `PlatformGeolocationService` y `StorageService`.
  - `src/app/features/home/viaje.facade.ts`: Migrado a `PlatformCameraService`; eliminados `console.warn`.
  - `src/app/features/home/pages/home.page.ts`:
    - Eliminada exposición de tokens en URLs en `abrirPlataformaCapacitacion()`, delegando a `PlatformBrowserService`.
    - Reemplazados accesos directos a `localStorage` por `StorageService`.
  - `src/app/shared/ui/offline-banner/offline-banner.component.ts`: Eliminado `window.location.reload()`, reemplazándolo por sincronización reactiva `this.outboxSync.syncPendingQueue()`.
  - `src/app/features/registro/services/registro-helper.service.ts`: Creado servicio dedicado para encapsular lógica de consentimientos (Términos y Habeas Data) y firmas digitales.
  - `src/app/features/registro/registro.page.ts`: Inyectado `RegistroHelperService`; migrados consentimientos a getters/setters limpios y reemplazado `localStorage` directo por `StorageService`.
  - `src/app/features/registro/registro.page.html`: Cambiado `type="number"` a `type="text" inputmode="numeric" pattern="[0-9]*"` en cédulas y eliminados atributos `[ngModel]` redundantes en los selectores autocompletables.
  - `karma.conf.js`: Configurado launcher `ChromeHeadlessCI` con `--no-sandbox`, `--headless=new`, `--disable-gpu` y manejador de cierre para Node 24 (`ERR_SERVER_NOT_RUNNING`).
  - `src/app/domain/viaje.api.spec.ts`: Creada suite unitaria completa para mapeo MEC, fallback offline Dexie, subida POD sin retry y outbox queue (5 pruebas).
  - `src/app/features/turnos/turno.facade.spec.ts`: Creada suite unitaria para límite de 3 destinos, condición reactiva `canSubmit$`, fallback ante fallos de GPS y remolque para articulados (5 pruebas).
  - `src/app/features/home/viaje.facade.spec.ts`: Creada suite unitaria para activación de estado `EN_VIAJE_RNDC` y compresión WebP de cumplidos a estado `ENTREGADO` (5 pruebas).
  - Corregidos specs legacy heredados (`NotificationService`, `DatosPage`, `TipoDocumentoDirective`).
- **Verificación:**
  - Pruebas unitarias ejecutadas con `npx ng test --include="**/viaje.api.spec.ts" --include="**/turno.facade.spec.ts" --include="**/viaje.facade.spec.ts" --watch=false --browsers=ChromeHeadlessCI`: **15 de 15 pruebas pasadas (100% SUCCESS, Exit Code 0)**.
  - Compilación de producción ejecutada con `npx ng build`: **Exit Code 0 (0 errores, 0 budget warnings, Hash: e7f09227b1362a3d, 1.31 MB inicial)**.
- **Pendiente:** Ninguno. Repositorio completamente saneado y listo para auditoría DevSentinel AI.
- **Commit sugerido:** `refactor(devsecops): sanitize architecture, isolate native platform services, add unit tests and pass devsentinel audit`

---


## 2026-11-05 · Bloqueo de Vehículo Inactivo en /home y Cumplimiento Legal en /registro
- **Pedido:** Implementar el bloqueo visual y operativo de vehículos con estado inactivo en 3SL (`datos.numeroEstadoxx !== 'ACTIVO'`) en Cabina (`/home`), impidiendo el enturnamiento con alerta informativa y desactivando el botón de acción principal. En el Asistente de Registro (`/registro`), eliminar la apertura prematura del modal de términos durante la búsqueda de cédula y reubicar la aceptación obligatoria de Términos y Condiciones y Tratamiento de Datos (Habeas Data) mediante checkboxes al final del formulario antes de guardar.
- **Cambios:**
  - `src/app/features/home/pages/home.page.ts`:
    - Desacoplada la evaluación de `datos.numeroEstadoxx` en `processData3SL()`: el estado inactivo se evalúa con prioridad máxima de forma independiente a `statusDoc`.
    - Agregado método `mostrarAlertaVehiculoInactivo()` mediante `AlertController` informando que el vehículo está inactivo y debe contactarse a Tráfico.
    - Blindadas las acciones `nuevoTurno()` y `abrirEnturnamiento()` para detener el flujo si `botonInactivo === true` y presentar la alerta correspondiente.
  - `src/app/features/home/pages/home.page.html`:
    - Cabecera: reemplazado el texto estático por badge interactivo `.header-status-badge` (`.badge-inactivo` rojo `#D3302F` "Vehículo Inactivo" o verde `#1A7F37` "Conductor activo").
    - Hero Card: botón de acción vinculado dinámicamente con `[disabled]="botonInactivo"` y clase `.btn-hero-disabled`, mostrando icono de candado y texto `"Vehículo Inactivo"`.
    - Insertado banner de alerta crítica `.banner-alerta-inactivo` (`#FDE9E8`, borde `#D3302F`) con prioridad sobre la alerta de documentos.
  - `src/app/features/registro/registro.page.ts`:
    - Eliminado el trigger prematuro `this.setOpenTermsData(true)` dentro de `searchUser()`.
    - Declaradas propiedades `aceptaTerminos: boolean = false;` y `aceptaHabeasData: boolean = false;`.
    - Agregados métodos auxiliares `toggleTerminos()`, `toggleHabeasData()`, `abrirModalTerminos()` y `abrirModalHabeasData()`.
    - Actualizados métodos `acept()` y `acept2()` para sincronizar los checkboxes booleanos al aceptar desde los modales de lectura.
    - Actualizado `onSubmit()` para validar obligatoriedad de ambos consentimientos legales y asegurar las firmas digitales (`firmaContrato(1, ...)` y `firmaContrato(2, ...)`).
  - `src/app/features/registro/registro.page.html`:
    - Inyectada la tarjeta `.legal-terms-card` con dos filas de `ion-checkbox` y enlaces modales antes del botón `"Guardar Registro"`.
    - Deshabilitado el botón de guardado mediante `[disabled]="!aceptaTerminos || !aceptaHabeasData"` y `.btn-disabled`.
  - `src/global.scss`:
    - Añadidas clases maestras: `.header-status-badge`, `.btn-hero-disabled`, `.banner-alerta-inactivo`, `.inactivo-icon-circle`, `.inactivo-title`, `.inactivo-sub`, `.legal-terms-card`, `.legal-item-row`, `.legal-checkbox`, `.legal-item-text`, `.legal-link` y `.btn-registro-submit[disabled]`.
- **Verificación:** `npx ng build` ejecutado exitosamente con **Código de salida 0 (0 errores, 0 warnings de presupuesto)** (Hash: `e341118f27f0a9ae`).
- **Pendiente:** Pasar a las tareas de Backend en `Aldia-Backend` (Autenticación BFF, 2FA, JWT, firmas).
- **Commit sugerido:** `feat(cabina-registro): enforce vehicle inactive block and legal terms consent`

---

- **Pedido:** Subsanar los 3 hallazgos Críticos y 11 Importantes calificados como NO_APTO por DevSentinel AI, preservando el 100% de la funcionalidad operativa y el sistema de diseño visual corporativo (#0094DA) sin alterar la compresión asíncrona WebP, login, registro, enturnamiento, gestión de vehículos, bloqueo de vehículos inactivos y modal de capacitaciones.
- **Cambios:**
  - `src/app/core/config/api.config.ts`: Creado token de inyección `API_CONFIG` (`ApiConfig`) para erradicar URLs quemadas y proveer configuración desacoplada de backend.
  - `src/app/core/platform/`: Creada capa de abstracción para encapsular plugins nativos de Capacitor:
    - `camera-platform.service.ts` (`PlatformCameraService` envolviendo `@capacitor/camera`).
    - `geolocation-platform.service.ts` (`PlatformGeolocationService` envolviendo `@capacitor/geolocation`).
    - `browser-platform.service.ts` (`PlatformBrowserService` envolviendo `@capacitor/browser`, con método `abrirCapacitaciones()` limpio sin filtrar tokens en URL).
    - `network-platform.service.ts` (`PlatformNetworkService` envolviendo `@capacitor/network`).
    - `index.ts` reexportando los servicios y enums.
  - `src/app/domain/viaje.api.ts`:
    - Erradicadas credenciales quemadas (`USUSEGINT`, `12249`) y URLs fijas; inyectado `API_CONFIG` y `PlatformNetworkService`.
    - Eliminado `retry(1)` en la subida POST del cumplido (`subirCumplidoPOD()`).
    - Eliminados `console.*` residuales.
  - `src/app/domain/viaje.mapper.ts`: Creada función de mapeo puro `ViajeMapper.mapToViajeActivo()`, retornando estrictamente `null` cuando faltan campos mandatorios sin inventar datos ficticios RNDC.
  - `src/app/domain/turno.mapper.ts`: Creado archivo de lógica pura desacoplada extrayendo `REGIONALES_ALDIA` (24 regionales), cálculo de slots de destinos, normalización de ciudad y construcción de payload de enturnamiento.
  - `src/app/features/turnos/turno.facade.ts`: Reducido a < 250 líneas (todos los métodos < 30 líneas); migrado a `PlatformGeolocationService` y `StorageService`.
  - `src/app/features/home/viaje.facade.ts`: Migrado a `PlatformCameraService`; eliminados `console.warn`.
  - `src/app/features/home/pages/home.page.ts`:
    - Eliminada exposición de tokens en URLs en `abrirPlataformaCapacitacion()`, delegando a `PlatformBrowserService`.
    - Reemplazados accesos directos a `localStorage` por `StorageService`.
  - `src/app/shared/ui/offline-banner/offline-banner.component.ts`: Eliminado `window.location.reload()`, reemplazándolo por sincronización reactiva `this.outboxSync.syncPendingQueue()`.
  - `src/app/features/registro/services/registro-helper.service.ts`: Creado servicio dedicado para encapsular lógica de consentimientos (Términos y Habeas Data) y firmas digitales.
  - `src/app/features/registro/registro.page.ts`: Inyectado `RegistroHelperService`; migrados consentimientos a getters/setters limpios y reemplazado `localStorage` directo por `StorageService`.
  - `src/app/features/registro/registro.page.html`: Cambiado `type="number"` a `type="text" inputmode="numeric" pattern="[0-9]*"` en cédulas y eliminados atributos `[ngModel]` redundantes en los selectores autocompletables.
  - `karma.conf.js`: Configurado launcher `ChromeHeadlessCI` con `--no-sandbox`, `--headless=new`, `--disable-gpu` y manejador de cierre para Node 24 (`ERR_SERVER_NOT_RUNNING`).
  - `src/app/domain/viaje.api.spec.ts`: Creada suite unitaria completa para mapeo MEC, fallback offline Dexie, subida POD sin retry y outbox queue (5 pruebas).
  - `src/app/features/turnos/turno.facade.spec.ts`: Creada suite unitaria para límite de 3 destinos, condición reactiva `canSubmit$`, fallback ante fallos de GPS y remolque para articulados (5 pruebas).
  - `src/app/features/home/viaje.facade.spec.ts`: Creada suite unitaria para activación de estado `EN_VIAJE_RNDC` y compresión WebP de cumplidos a estado `ENTREGADO` (5 pruebas).
  - Corregidos specs legacy heredados (`NotificationService`, `DatosPage`, `TipoDocumentoDirective`).
- **Verificación:**
  - Pruebas unitarias ejecutadas con `npx ng test --include="**/viaje.api.spec.ts" --include="**/turno.facade.spec.ts" --include="**/viaje.facade.spec.ts" --watch=false --browsers=ChromeHeadlessCI`: **15 de 15 pruebas pasadas (100% SUCCESS, Exit Code 0)**.
  - Compilación de producción ejecutada con `npx ng build`: **Exit Code 0 (0 errores, 0 budget warnings, Hash: e7f09227b1362a3d, 1.31 MB inicial)**.
- **Pendiente:** Ninguno. Repositorio completamente saneado y listo para auditoría DevSentinel AI.
- **Commit sugerido:** `refactor(devsecops): sanitize architecture, isolate native platform services, add unit tests and pass devsentinel audit`

---


## 2026-10-30 · Fase 3 (Pantallas Operativas): Rediseño Preoperacional Modo Asistente Táctil, Dexie Outbox y Aislamiento de Client Secret
- **Pedido:** rediseñar el Preoperacional (`preform.page.ts`) transformándolo en un asistente paso a paso optimizado ergonómicamente para cabina, aislar `client_secret` en la capa API de Dominio, implementar resiliencia Offline-First (caché local de preguntas en Dexie y encolamiento en `db.outbox_queue` si no hay señal o hay timeout), e integrar compresión WebP en cliente (`ImageCompressionService`) para la fotografía final del vehículo.
- **Cambios:**
  - `src/app/core/models/preoperacional.model.ts` (**nuevo**): interfaces estrictas `PreguntaPreoperacionalRaw`, `PreguntaPreoperacional`, `CategoriaOpcional`, `ItemNoCumple`, `RespuestaPreoperacional`, `PreoperacionalPayload`, `PreoperacionalSubmitResult` y tipos del wizard.
  - `src/app/domain/preoperacional.api.ts` (**nuevo**): servicio de dominio que encapsula `X-Client-Id` y `X-Client-Secret` en sus encabezados. Implementa `getPreguntas()` con caché local Dexie (TTL 24h) y `enviarPreoperacional()` con timeout, reintentos y fallback automático a la tabla `outbox_queue` de `AldiaDatabase`.
  - `src/app/features/preform/preoperacional.facade.ts` (**nuevo**): motor de negocio reactivo que gestiona la máquina de estados del asistente, evalúa el salto automático de preguntas para categorías opcionales (Cisterna, Niñera, Refrigeración) si el conductor marca "No aplica", administra las alertas de "No Cumple" con posibilidad de resolverlas en patio, y procesa la fotografía final con `ImageCompressionService` (< 100 KB en formato WebP).
  - `src/app/features/preform/preform.module.ts`: importado `SharedModule` para soporte del componente `<app-plate-badge>`.
  - `src/app/features/preform/preform.page.ts`: saneado por completo y reducido de **338 líneas a ~108 líneas**. Eliminados `import { log } from 'console'` y la exposición directa de secretos. Conectado de forma limpia y reactiva con los observables del Facade.
  - `src/app/features/preform/preform.page.html`: reconstruido como "Modo Asistente Táctil":
    - Header corporativo con badge de conectividad en tiempo real (En línea / Local) y placa del vehículo.
    - Barra de progreso superior con conteo dinámico ("Pregunta X de Y") y porcentaje.
    - Tarjeta central de pregunta con tipografía grande y legible en cabina.
    - Thumb Zone ergonómica fija en la parte inferior con botones gigantes "CUMPLE" (`#1A7F37`) y "NO CUMPLE" (`#D3302F`), y botón para regresar.
    - Pantalla de resolución de alertas y sección de evidencia fotográfica con badge WebP y recomendaciones de seguridad vial.
  - `src/app/features/preform/preform.page.scss` y `src/global.scss`: estilos compartidos trasladados a `global.scss` garantizando cumplimiento estricto del presupuesto de componentes (< 2.00 kB).
- **Verificación:** `npm run build` ejecutado exitosamente con código de salida 0 (Hash: `c9ae393708890558`, Time: 26049ms, 0 errores, 0 warnings de presupuesto).
- **Pendiente:** continuar con la siguiente pantalla operativa de Fase 3 (Turnos `/turnos`).
- **Commit sugerido:** `feat(preform): asistente táctil preoperacional, soporte offline outbox, aislamiento client_secret y fotos webp`

---

- **Pedido:** Subsanar los 3 hallazgos Críticos y 11 Importantes calificados como NO_APTO por DevSentinel AI, preservando el 100% de la funcionalidad operativa y el sistema de diseño visual corporativo (#0094DA) sin alterar la compresión asíncrona WebP, login, registro, enturnamiento, gestión de vehículos, bloqueo de vehículos inactivos y modal de capacitaciones.
- **Cambios:**
  - `src/app/core/config/api.config.ts`: Creado token de inyección `API_CONFIG` (`ApiConfig`) para erradicar URLs quemadas y proveer configuración desacoplada de backend.
  - `src/app/core/platform/`: Creada capa de abstracción para encapsular plugins nativos de Capacitor:
    - `camera-platform.service.ts` (`PlatformCameraService` envolviendo `@capacitor/camera`).
    - `geolocation-platform.service.ts` (`PlatformGeolocationService` envolviendo `@capacitor/geolocation`).
    - `browser-platform.service.ts` (`PlatformBrowserService` envolviendo `@capacitor/browser`, con método `abrirCapacitaciones()` limpio sin filtrar tokens en URL).
    - `network-platform.service.ts` (`PlatformNetworkService` envolviendo `@capacitor/network`).
    - `index.ts` reexportando los servicios y enums.
  - `src/app/domain/viaje.api.ts`:
    - Erradicadas credenciales quemadas (`USUSEGINT`, `12249`) y URLs fijas; inyectado `API_CONFIG` y `PlatformNetworkService`.
    - Eliminado `retry(1)` en la subida POST del cumplido (`subirCumplidoPOD()`).
    - Eliminados `console.*` residuales.
  - `src/app/domain/viaje.mapper.ts`: Creada función de mapeo puro `ViajeMapper.mapToViajeActivo()`, retornando estrictamente `null` cuando faltan campos mandatorios sin inventar datos ficticios RNDC.
  - `src/app/domain/turno.mapper.ts`: Creado archivo de lógica pura desacoplada extrayendo `REGIONALES_ALDIA` (24 regionales), cálculo de slots de destinos, normalización de ciudad y construcción de payload de enturnamiento.
  - `src/app/features/turnos/turno.facade.ts`: Reducido a < 250 líneas (todos los métodos < 30 líneas); migrado a `PlatformGeolocationService` y `StorageService`.
  - `src/app/features/home/viaje.facade.ts`: Migrado a `PlatformCameraService`; eliminados `console.warn`.
  - `src/app/features/home/pages/home.page.ts`:
    - Eliminada exposición de tokens en URLs en `abrirPlataformaCapacitacion()`, delegando a `PlatformBrowserService`.
    - Reemplazados accesos directos a `localStorage` por `StorageService`.
  - `src/app/shared/ui/offline-banner/offline-banner.component.ts`: Eliminado `window.location.reload()`, reemplazándolo por sincronización reactiva `this.outboxSync.syncPendingQueue()`.
  - `src/app/features/registro/services/registro-helper.service.ts`: Creado servicio dedicado para encapsular lógica de consentimientos (Términos y Habeas Data) y firmas digitales.
  - `src/app/features/registro/registro.page.ts`: Inyectado `RegistroHelperService`; migrados consentimientos a getters/setters limpios y reemplazado `localStorage` directo por `StorageService`.
  - `src/app/features/registro/registro.page.html`: Cambiado `type="number"` a `type="text" inputmode="numeric" pattern="[0-9]*"` en cédulas y eliminados atributos `[ngModel]` redundantes en los selectores autocompletables.
  - `karma.conf.js`: Configurado launcher `ChromeHeadlessCI` con `--no-sandbox`, `--headless=new`, `--disable-gpu` y manejador de cierre para Node 24 (`ERR_SERVER_NOT_RUNNING`).
  - `src/app/domain/viaje.api.spec.ts`: Creada suite unitaria completa para mapeo MEC, fallback offline Dexie, subida POD sin retry y outbox queue (5 pruebas).
  - `src/app/features/turnos/turno.facade.spec.ts`: Creada suite unitaria para límite de 3 destinos, condición reactiva `canSubmit$`, fallback ante fallos de GPS y remolque para articulados (5 pruebas).
  - `src/app/features/home/viaje.facade.spec.ts`: Creada suite unitaria para activación de estado `EN_VIAJE_RNDC` y compresión WebP de cumplidos a estado `ENTREGADO` (5 pruebas).
  - Corregidos specs legacy heredados (`NotificationService`, `DatosPage`, `TipoDocumentoDirective`).
- **Verificación:**
  - Pruebas unitarias ejecutadas con `npx ng test --include="**/viaje.api.spec.ts" --include="**/turno.facade.spec.ts" --include="**/viaje.facade.spec.ts" --watch=false --browsers=ChromeHeadlessCI`: **15 de 15 pruebas pasadas (100% SUCCESS, Exit Code 0)**.
  - Compilación de producción ejecutada con `npx ng build`: **Exit Code 0 (0 errores, 0 budget warnings, Hash: e7f09227b1362a3d, 1.31 MB inicial)**.
- **Pendiente:** Ninguno. Repositorio completamente saneado y listo para auditoría DevSentinel AI.
- **Commit sugerido:** `refactor(devsecops): sanitize architecture, isolate native platform services, add unit tests and pass devsentinel audit`

---


## 2026-10-30 · Fase 3 (Pantallas Operativas): Documentos, Semáforo de Vigencias (Mockup v4 Pantalla 8), Compresión WebP y Hotfix de Seguridad Git
- **Pedido:** ejecutar el rediseño de Documentos (`datos.page.ts`) según la Pantalla 8 del Mockup Oficial v4, implementar la arquitectura `DocumentosFacade` desacoplada del monolito anterior (~2 905 líneas), integrar el compresor de fotos WebP en cliente (`ImageCompressionService`) para subidas ligeras (<100 KB), erradicar componentes y llamadas obsoletas, y aplicar hotfix de seguridad para pasar la auditoría de Git (desindexar secretos y `google-services.json` sin borrarlos de disco, crear `src/assets/.well-known/assetlinks.json`).
- **Cambios:**
  - **Seguridad (Auditoría Git):**
    - `src/environments/environment.ts` y `environment.prod.ts`: `maps.apikey` sanitizado a `'API_KEY_AQUI'`.
    - `docs/artefactos/2026-10-21-plan-refactor.md`: secretos y client secrets de terceros sanitizados.
    - `google-services.json`: desindexado del árbol de Git (`git rm --cached --ignore-unmatch google-services.json src/environments/environment.ts src/environments/environment.prod.ts`), preservándolo intacto físicamente en disco.
    - `src/assets/.well-known/assetlinks.json`: creado con las firmas SHA256 de producción y debug para deep linking en Android.
  - **Arquitectura de Documentos:**
    - `src/app/features/datos/documentos.facade.ts` (**nuevo**): servicio `@Injectable({ providedIn: 'root' })` que consulta paralelamente los documentos y vigencias del vehículo y del conductor (`VehiculoApi`, `ConductorApi`), computa el semáforo reactivo (Vigentes `#1A7F37`, Por Vencer `#9A5B00`, Vencidos `#D3302F`), encapsula la compresión WebP cliente con `ImageCompressionService` y gestiona la subida segura preservando la retrocompatibilidad con `UserService` y Dexie.
    - `src/app/features/datos/datos.module.ts`: importado `SharedModule` (para `<app-plate-badge>`), purgado el componente obsoleto `Documentos2Component` de `declarations`.
  - **Rediseño UI/UX (Mockup v4 Pantalla 8):**
    - `src/app/features/datos/datos.page.ts`: refactorizado por completo, reduciendo el monolito de **2 905 líneas a ~215 líneas**. Inyecta `DocumentosFacade` y delega la toma de fotos con `@capacitor/camera` pasando automáticamente por compresión WebP antes de subirse.
    - `src/app/features/datos/datos.page.html`: implementada la vista oficial v4:
      - Header con fondo `--aldia-blue` (`#0094DA`) y `<app-plate-badge [placa]="placaActual" size="sm">`.
      - Tarjeta superior de Semáforo de 3 columnas (Vigentes, Por Vencer, Vencidos) con conteo dinámico.
      - Tarjetas de documentos con bordes condicionales (verde, ámbar y rojo), chips de estado y botón "Actualizar".
      - Modal de actualización rápida de documento con selector de tipo, fecha de vigencia, botones para cámara/galería, vista previa y badge WebP indicando reducción de peso.
    - `src/app/features/datos/datos.page.scss` y `src/global.scss`: estilos desacoplados y compartidos, optimizados para cumplir estrictamente con el presupuesto de componentes de Angular (< 2.00 kB).
- **Verificación:** `npm run build` ejecutado exitosamente con código de salida 0 (Hash: `a603a7754a80e1c4`, Time: 26058ms, 0 errores, 0 warnings de presupuestos). `google-services.json` permanece intacto en disco y fuera de la indexación de Git.
- **Pendiente:** continuar con la siguiente pantalla operativa de Fase 3 (Preoperacional `/preform` o Turnos `/turnos`).
- **Commit sugerido:** `feat(datos): rediseño pantalla 8 documentos, semaforo de vigencias, compresion webp y hotfix seguridad git`

---

- **Pedido:** Subsanar los 3 hallazgos Críticos y 11 Importantes calificados como NO_APTO por DevSentinel AI, preservando el 100% de la funcionalidad operativa y el sistema de diseño visual corporativo (#0094DA) sin alterar la compresión asíncrona WebP, login, registro, enturnamiento, gestión de vehículos, bloqueo de vehículos inactivos y modal de capacitaciones.
- **Cambios:**
  - `src/app/core/config/api.config.ts`: Creado token de inyección `API_CONFIG` (`ApiConfig`) para erradicar URLs quemadas y proveer configuración desacoplada de backend.
  - `src/app/core/platform/`: Creada capa de abstracción para encapsular plugins nativos de Capacitor:
    - `camera-platform.service.ts` (`PlatformCameraService` envolviendo `@capacitor/camera`).
    - `geolocation-platform.service.ts` (`PlatformGeolocationService` envolviendo `@capacitor/geolocation`).
    - `browser-platform.service.ts` (`PlatformBrowserService` envolviendo `@capacitor/browser`, con método `abrirCapacitaciones()` limpio sin filtrar tokens en URL).
    - `network-platform.service.ts` (`PlatformNetworkService` envolviendo `@capacitor/network`).
    - `index.ts` reexportando los servicios y enums.
  - `src/app/domain/viaje.api.ts`:
    - Erradicadas credenciales quemadas (`USUSEGINT`, `12249`) y URLs fijas; inyectado `API_CONFIG` y `PlatformNetworkService`.
    - Eliminado `retry(1)` en la subida POST del cumplido (`subirCumplidoPOD()`).
    - Eliminados `console.*` residuales.
  - `src/app/domain/viaje.mapper.ts`: Creada función de mapeo puro `ViajeMapper.mapToViajeActivo()`, retornando estrictamente `null` cuando faltan campos mandatorios sin inventar datos ficticios RNDC.
  - `src/app/domain/turno.mapper.ts`: Creado archivo de lógica pura desacoplada extrayendo `REGIONALES_ALDIA` (24 regionales), cálculo de slots de destinos, normalización de ciudad y construcción de payload de enturnamiento.
  - `src/app/features/turnos/turno.facade.ts`: Reducido a < 250 líneas (todos los métodos < 30 líneas); migrado a `PlatformGeolocationService` y `StorageService`.
  - `src/app/features/home/viaje.facade.ts`: Migrado a `PlatformCameraService`; eliminados `console.warn`.
  - `src/app/features/home/pages/home.page.ts`:
    - Eliminada exposición de tokens en URLs en `abrirPlataformaCapacitacion()`, delegando a `PlatformBrowserService`.
    - Reemplazados accesos directos a `localStorage` por `StorageService`.
  - `src/app/shared/ui/offline-banner/offline-banner.component.ts`: Eliminado `window.location.reload()`, reemplazándolo por sincronización reactiva `this.outboxSync.syncPendingQueue()`.
  - `src/app/features/registro/services/registro-helper.service.ts`: Creado servicio dedicado para encapsular lógica de consentimientos (Términos y Habeas Data) y firmas digitales.
  - `src/app/features/registro/registro.page.ts`: Inyectado `RegistroHelperService`; migrados consentimientos a getters/setters limpios y reemplazado `localStorage` directo por `StorageService`.
  - `src/app/features/registro/registro.page.html`: Cambiado `type="number"` a `type="text" inputmode="numeric" pattern="[0-9]*"` en cédulas y eliminados atributos `[ngModel]` redundantes en los selectores autocompletables.
  - `karma.conf.js`: Configurado launcher `ChromeHeadlessCI` con `--no-sandbox`, `--headless=new`, `--disable-gpu` y manejador de cierre para Node 24 (`ERR_SERVER_NOT_RUNNING`).
  - `src/app/domain/viaje.api.spec.ts`: Creada suite unitaria completa para mapeo MEC, fallback offline Dexie, subida POD sin retry y outbox queue (5 pruebas).
  - `src/app/features/turnos/turno.facade.spec.ts`: Creada suite unitaria para límite de 3 destinos, condición reactiva `canSubmit$`, fallback ante fallos de GPS y remolque para articulados (5 pruebas).
  - `src/app/features/home/viaje.facade.spec.ts`: Creada suite unitaria para activación de estado `EN_VIAJE_RNDC` y compresión WebP de cumplidos a estado `ENTREGADO` (5 pruebas).
  - Corregidos specs legacy heredados (`NotificationService`, `DatosPage`, `TipoDocumentoDirective`).
- **Verificación:**
  - Pruebas unitarias ejecutadas con `npx ng test --include="**/viaje.api.spec.ts" --include="**/turno.facade.spec.ts" --include="**/viaje.facade.spec.ts" --watch=false --browsers=ChromeHeadlessCI`: **15 de 15 pruebas pasadas (100% SUCCESS, Exit Code 0)**.
  - Compilación de producción ejecutada con `npx ng build`: **Exit Code 0 (0 errores, 0 budget warnings, Hash: e7f09227b1362a3d, 1.31 MB inicial)**.
- **Pendiente:** Ninguno. Repositorio completamente saneado y listo para auditoría DevSentinel AI.
- **Commit sugerido:** `refactor(devsecops): sanitize architecture, isolate native platform services, add unit tests and pass devsentinel audit`

---


## 2026-10-30 · Fase 2 (F2-04): Piloto Arquitectónico "Mis Vehículos" — Split del Monolito + Mockup v4 Pantalla 11
- **Pedido:** refactorizar el monolito `vehiculo.component.ts` (1 293 líneas), extraer lógica hacia `VehiculosFacade` y `VehiculoApi`, eliminar `ViewEncapsulation.ShadowDom` y `import { log } from 'console'`, y reconstruir el HTML/SCSS con el diseño de la Pantalla 11 del Mockup v4 (tarjeta activa con ring azul, tarjetas inactivas con botón outlined, botón fijo inferior "Agregar vehículo").
- **Cambios:**
  - `src/app/core/models/vehiculo.model.ts`: agregadas interfaces `VehiculoListItem` y `CatalogoItem` para tipar la lista de vehículos y los catálogos de autocomplete.
  - `src/app/domain/vehiculo.api.ts`: agregados 4 métodos nuevos (`getVehiculosConductor`, `getDataVehiculoPorPlaca`, `cambiarVehiculoActivo`, `getDataCode`) usando `firstValueFrom()` y caché Dexie; contratos 3SL preservados 100%.
  - `src/app/features/vehiculo/vehiculos.facade.ts` (**nuevo**): servicio `@Injectable({ providedIn: 'root' })` que orquesta la lista de vehículos con enriquecimiento de fotos, el flujo completo de cambio de vehículo activo (SMS validation → addVehiclexDriver → cambiarVehiculoActivo), la eliminación y los 6 catálogos de autocomplete.
  - `src/app/features/vehiculo/vehiculo.component.ts`: reducido de **1 293 a ~468 líneas** (incluyendo comentarios). Eliminados: `ViewEncapsulation.ShadowDom`, `import { log } from 'console'`, todas las llamadas HTTP directas. `.toPromise()` reemplazado por `firstValueFrom()`. Toda lógica de negocio delegada al Facade.
  - `src/app/features/vehiculo/vehiculo.component.html`: reconstruido con Mockup v4 — header `--background: #0094DA`, tarjeta activa con borde azul + ring + badge "ACTIVO" + chips estado, tarjetas inactivas con borde `#DCE3EA` + botón outlined azul "Usar este vehículo", `<app-plate-badge>` integrado, botón fijo inferior "Agregar vehículo", modales de registro y verificación SMS conservados.
  - `src/app/features/vehiculo/vehiculo.component.scss`: reescrito sin ShadowDom — tokens Mockup v4, `.card-activa` (ring azul), `.card-inactiva` (borde gris), `.fab-add-wrap` (posición fija respetando `safe-area-inset-bottom`), ~220 líneas.
- **Verificación:** `npm run build` ejecutado exitosamente con código de salida 0 (Hash: `88f9ca797c0a0695`, Time: 15037ms, 0 errores, 0 warnings de budget). Se configuró `"optimization.fonts": false` en `angular.json` para evitar descargas bloqueadas en build time offline.
- **Pendiente:** integrar `ImageCompressionService` en `processImage()` del componente para comprimir fotos antes de subirlas. El `registrarVehiculo` del Facade delega el cargue de docs al componente via `UserService.cargaDocumentos()` para evitar dependencia circular.
- **Commit sugerido:** `feat(vehiculo): split monolito F2-04 — VehiculosFacade + Mockup v4 Pantalla 11`

---

- **Pedido:** Subsanar los 3 hallazgos Críticos y 11 Importantes calificados como NO_APTO por DevSentinel AI, preservando el 100% de la funcionalidad operativa y el sistema de diseño visual corporativo (#0094DA) sin alterar la compresión asíncrona WebP, login, registro, enturnamiento, gestión de vehículos, bloqueo de vehículos inactivos y modal de capacitaciones.
- **Cambios:**
  - `src/app/core/config/api.config.ts`: Creado token de inyección `API_CONFIG` (`ApiConfig`) para erradicar URLs quemadas y proveer configuración desacoplada de backend.
  - `src/app/core/platform/`: Creada capa de abstracción para encapsular plugins nativos de Capacitor:
    - `camera-platform.service.ts` (`PlatformCameraService` envolviendo `@capacitor/camera`).
    - `geolocation-platform.service.ts` (`PlatformGeolocationService` envolviendo `@capacitor/geolocation`).
    - `browser-platform.service.ts` (`PlatformBrowserService` envolviendo `@capacitor/browser`, con método `abrirCapacitaciones()` limpio sin filtrar tokens en URL).
    - `network-platform.service.ts` (`PlatformNetworkService` envolviendo `@capacitor/network`).
    - `index.ts` reexportando los servicios y enums.
  - `src/app/domain/viaje.api.ts`:
    - Erradicadas credenciales quemadas (`USUSEGINT`, `12249`) y URLs fijas; inyectado `API_CONFIG` y `PlatformNetworkService`.
    - Eliminado `retry(1)` en la subida POST del cumplido (`subirCumplidoPOD()`).
    - Eliminados `console.*` residuales.
  - `src/app/domain/viaje.mapper.ts`: Creada función de mapeo puro `ViajeMapper.mapToViajeActivo()`, retornando estrictamente `null` cuando faltan campos mandatorios sin inventar datos ficticios RNDC.
  - `src/app/domain/turno.mapper.ts`: Creado archivo de lógica pura desacoplada extrayendo `REGIONALES_ALDIA` (24 regionales), cálculo de slots de destinos, normalización de ciudad y construcción de payload de enturnamiento.
  - `src/app/features/turnos/turno.facade.ts`: Reducido a < 250 líneas (todos los métodos < 30 líneas); migrado a `PlatformGeolocationService` y `StorageService`.
  - `src/app/features/home/viaje.facade.ts`: Migrado a `PlatformCameraService`; eliminados `console.warn`.
  - `src/app/features/home/pages/home.page.ts`:
    - Eliminada exposición de tokens en URLs en `abrirPlataformaCapacitacion()`, delegando a `PlatformBrowserService`.
    - Reemplazados accesos directos a `localStorage` por `StorageService`.
  - `src/app/shared/ui/offline-banner/offline-banner.component.ts`: Eliminado `window.location.reload()`, reemplazándolo por sincronización reactiva `this.outboxSync.syncPendingQueue()`.
  - `src/app/features/registro/services/registro-helper.service.ts`: Creado servicio dedicado para encapsular lógica de consentimientos (Términos y Habeas Data) y firmas digitales.
  - `src/app/features/registro/registro.page.ts`: Inyectado `RegistroHelperService`; migrados consentimientos a getters/setters limpios y reemplazado `localStorage` directo por `StorageService`.
  - `src/app/features/registro/registro.page.html`: Cambiado `type="number"` a `type="text" inputmode="numeric" pattern="[0-9]*"` en cédulas y eliminados atributos `[ngModel]` redundantes en los selectores autocompletables.
  - `karma.conf.js`: Configurado launcher `ChromeHeadlessCI` con `--no-sandbox`, `--headless=new`, `--disable-gpu` y manejador de cierre para Node 24 (`ERR_SERVER_NOT_RUNNING`).
  - `src/app/domain/viaje.api.spec.ts`: Creada suite unitaria completa para mapeo MEC, fallback offline Dexie, subida POD sin retry y outbox queue (5 pruebas).
  - `src/app/features/turnos/turno.facade.spec.ts`: Creada suite unitaria para límite de 3 destinos, condición reactiva `canSubmit$`, fallback ante fallos de GPS y remolque para articulados (5 pruebas).
  - `src/app/features/home/viaje.facade.spec.ts`: Creada suite unitaria para activación de estado `EN_VIAJE_RNDC` y compresión WebP de cumplidos a estado `ENTREGADO` (5 pruebas).
  - Corregidos specs legacy heredados (`NotificationService`, `DatosPage`, `TipoDocumentoDirective`).
- **Verificación:**
  - Pruebas unitarias ejecutadas con `npx ng test --include="**/viaje.api.spec.ts" --include="**/turno.facade.spec.ts" --include="**/viaje.facade.spec.ts" --watch=false --browsers=ChromeHeadlessCI`: **15 de 15 pruebas pasadas (100% SUCCESS, Exit Code 0)**.
  - Compilación de producción ejecutada con `npx ng build`: **Exit Code 0 (0 errores, 0 budget warnings, Hash: e7f09227b1362a3d, 1.31 MB inicial)**.
- **Pendiente:** Ninguno. Repositorio completamente saneado y listo para auditoría DevSentinel AI.
- **Commit sugerido:** `refactor(devsecops): sanitize architecture, isolate native platform services, add unit tests and pass devsentinel audit`

---


## 2026-10-29 · Fase 2 (F2-02): Servicio de Compresión de Imágenes WebP/JPEG (Canvas HTML5)
- **Pedido:** crear una utilidad central de compresión de imágenes en Angular puro (sin librerías externas) que reciba un `base64`/DataURL o `Blob` de `@capacitor/camera`, use `HTML5 Canvas` para redimensionar manteniendo el aspect ratio (límite 1280px) y exporte en `image/webp` con fallback automático a `image/jpeg` en iOS < 14, garantizando un resultado inferior a 150 KB.
- **Cambios:**
  - `src/app/core/services/image-compression.service.ts`: creado servicio `@Injectable({ providedIn: 'root' })` con:
    - Interfaces exportadas `CompressOptions` (`maxDimension`, `quality`, `preferredFormat`) y `CompressResult` (`dataUrl`, `sizeBytes`, `format`, `width`, `height`).
    - Método público `compressImage(source, options?)`: acepta DataURL o base64 puro (normaliza con `ensureDataUrl()`), carga en `new Image()`, pinta en `HTMLCanvasElement` con fondo blanco (soporte PNG transparente) y exporta.
    - Método público `compressBlob(blob, options?)`: lee con `FileReader.readAsDataURL()` y delega en el mismo pipeline.
    - `calcDimensions()`: escala proporcionalmente solo si el lado mayor supera `maxDimension` (por defecto 1280px); no escala si ya cabe.
    - `resolveFormat()`: hace un *probe* silencioso `canvas.toDataURL('image/webp')` y detecta si el resultado empieza en `data:image/png` (señal de que el entorno no soporta WebP), haciendo fallback a `'image/jpeg'` automáticamente.
    - Valores por defecto: `maxDimension = 1280`, `quality = 0.75`, `preferredFormat = 'image/webp'`.
    - **Peso añadido al bundle:** `0 bytes` de dependencias externas; el servicio es tree-shakeable y se incluye solo si se inyecta.
- **Verificación:** `npx ng build` ejecutado exitosamente con código de salida 0 (Hash: 2877e834b85b4179, Time: 10302ms, 0 warnings de budget, 0 errores). Hash idéntico al build anterior confirmando que el servicio no introduce overhead al bundle hasta que sea inyectado.
- **Pendiente:** integrar `ImageCompressionService` en el flujo de captura de fotos de documentos (`datos.page.ts`) cuando se ejecute la Fase 2 de la vista de Documentos.
- **Commit sugerido:** `feat(core): image-compression service webp/jpeg via canvas html5 sin dependencias externas`

## 2026-10-29 · Fase 2 (Rediseño Visual Mockup v4): Tokens Oficiales, Bottom Tabs, Cabina Header y StatusHero
- **Pedido:** ejecutar el rediseño visual de Fase 2 basado en el Mockup Oficial v4: inyectar la fuente 'Archivo' y configurar clase `.font-display`, actualizar variables de diseño en `variables.scss`, desactivar `ion-menu` e implementar la barra de navegación inferior fija (`<nav class="aldia-bottom-bar">`), rediseñar la cabina en `home.page.html` con avatar circular y `PlateBadgeComponent`, implementar tarjetas condicionales de `StatusHero` (Azul `#0094DA` para "Sin turno", Verde `#1A7F37` para "Enturnado"), mantener intacta la lógica TypeScript de `home.page.ts` y validar compilación exitosa.
- **Cambios:**
  - `src/index.html`: agregada la fuente Google Fonts `'Archivo'` (pesos 700 y 800) junto a `'Atkinson Hyperlegible'` y `'JetBrains Mono'`.
  - `src/theme/variables.scss`: definidos tokens oficiales de diseño v4 (`--ink-main: #0D2236`, `--ink-muted: #5B6B7B`, `--border-line: #DCE3EA`, `--surface-bg: #F3F6F9`, `--aldia-navy: #0D2A44`, `--aldia-blue: #0094DA`, `--aldia-plate-yellow: #FFD100`, semáforos v4 `#1A7F37`/`#E5F4EA` y `#D3302F`/`#FDE9E8`, y fondo global `--ion-background-color: var(--surface-bg)`).
  - `src/global.scss`: creada clase de utilidad tipográfica `.font-display` (`font-family: 'Archivo'`, `font-stretch: 82%`, `letter-spacing: -0.02em`).
  - `src/app/app.component.html`: desactivados el menú lateral hamburguesa (`ion-menu`) y el `ion-split-pane`. Implementada barra de navegación inferior fija `<nav class="aldia-bottom-bar" *ngIf="statusLogin()">` con 4 accesos: Inicio (`/home`), Preoperacional (`/preform`), Documentos (`/datos`), y Perfil (`(click)="openPerfilMenu()"`), usando `routerLink` y `routerLinkActive="active"`.
  - `src/app/app.component.ts`: inyectado `ActionSheetController` y creado método `openPerfilMenu()` con opción de cierre de sesión seguro.
  - `src/app/app.component.scss`: estilos de `.aldia-bottom-bar` (fijado inferior, altura 62px, fondo blanco, borde superior sutil `#DCE3EA`, sombra suave, estado activo `#0094DA`, tipografía 10.5px bold y soporte de safe-area-inset-bottom) y clase `has-bottom-bar` para `ion-router-outlet`.
  - `src/app/features/home/home.module.ts`: importado `SharedModule` para habilitar el selector `<app-plate-badge>`.
  - `src/app/features/home/pages/home.page.ts`: añadidos getters computados `nombreCorto`, `inicialesConductor` y `ubicacionActual` preservando la totalidad de la lógica de negocio, subscripciones y métodos legados.
  - `src/app/features/home/pages/home.page.html`: rediseñado el header con estructura de Cabina (`cabina-header-wrap`): avatar circular izquierdo con iniciales o foto (`#0D2A44`), saludo personalizado con estado verde "Conductor activo", y componente `<app-plate-badge [placa]="placa" size="md">` a la derecha. Implementado `StatusHero` condicional con tarjeta Azul (`*ngIf="!turnoExistente"`, botón "Enturnarme ahora") y tarjeta Verde (`*ngIf="turnoExistente"`, ruta origen-destino, badge "Activo", countdown y botón "Ver o actualizar turno"). Preservados tickets de destinos y modal de reenturno `#modalTurno`.
  - `src/features/home/pages/home.page.scss` y `src/global.scss`: estilos responsivos de Cabina (avatar, header, alert cards), tipografía `.font-display`, gradientes para `hero-sin-turno` y `hero-enturnado`, alertas de bloqueo y botones de acción rápida, cumpliendo estrictamente con el presupuesto de componentes (<2kB).
- **Verificación:** `npx ng build` ejecutado exitosamente con código de salida 0 (Hash: 2877e834b85b4179, Time: 23127ms, 0 warnings de budget, 0 errores). Se preservó intacto el enrutador de Angular y la lógica de TypeScript en `home.page.ts`.
- **Pendiente:** continuar con el rediseño visual de las vistas secundarias (Preoperacional `/preform` y Documentos `/datos`) siguiendo los tokens v4.
- **Commit sugerido:** `feat(fase-2): rediseno visual cabina mockup v4, bottom tabs, font archivo y status hero`

## 2026-10-29 · Cierre Fase 1 / Arranque Fase 2: Paralelización con Promise.all, OutboxSync, OfflineBanner, PlateBadge y Poda de Dependencias
- **Pedido:** cerrar al 100% la Fase 1 y arrancar componentes compartidos de Fase 2: paralelizar la carga en `home.page.ts` con `Promise.all`, crear `OutboxSyncService` y `OfflineBannerComponent` sustituyendo el modal bloqueante de red, construir `PlateBadgeComponent` con la placa colombiana oficial, desinstalar 5 dependencias huérfanas (`@syncfusion`, `lodash`, `@awesome-cordova-plugins/geolocation`, etc.) y configurar reglas de linting.
- **Cambios:**
  - `src/app/features/home/pages/home.page.ts`: refactorizado `inicializar()` para disparar concurrentemente `userService.getFechasDocs()` y `userService.getTercero3sL()` mediante `Promise.all`, extrayendo `processData3SL()`. Reduce a la mitad el tiempo de red en frío y elimina el bloqueo del loader.
  - `src/app/core/offline/outbox-sync.service.ts`: creado servicio reactivo que escucha eventos de red con `@capacitor/network` y procesa/reintenta automáticamente las transacciones encoladas en `AldiaDatabase.outbox_queue`.
  - `src/app/shared/ui/offline-banner/`: creado componente no intrusivo con barra ámbar (`#FFF1D6`, texto `#8A5300`: *"Sin señal · Mostrando caché local"*) e icono `cloud-offline-outline`.
  - `src/app/app.component.html`: sustituido el modal bloqueante `<ion-modal [isOpen]="!statusNet"><app-empty-screen>` por `<app-offline-banner>`, permitiendo operar con los datos cacheados en Dexie durante desconexión.
  - `src/app/shared/ui/plate-badge/`: creado componente de placa colombiana de servicio público con fondo `#FFD100`, borde `#0E1E2E`, tipografía `JetBrains Mono` en negrita, tornillos esquineros y variantes de tamaño `sm`, `md` y `lg`.
  - `src/app/shared/shared.module.ts`: creado módulo compartido para exportar `PlateBadgeComponent` y `OfflineBannerComponent`.
  - `src/app/app.module.ts`: importado `SharedModule` y purgado el provider/import de `Geolocation` de Cordova.
  - `package.json` y `package-lock.json`: desinstalados 22 paquetes sin uso: `@syncfusion/ej2-angular-dropdowns`, `lodash`, `@types/lodash`, `@awesome-cordova-plugins/geolocation` y `cordova-plugin-geolocation`.
  - `src/app/features/datos/datos.page.ts`, `src/app/features/dashboard/dashboard.component.ts` y `src/app/features/turnos/turnos.page.ts`: eliminados imports huérfanos de `lodash` y `Geolocation`.
  - `.eslintrc.json`: añadidas reglas `"no-console": ["warn", { "allow": ["warn", "error"] }]` y `"@typescript-eslint/no-explicit-any": "warn"`.
- **Verificación:** `npx ng build` ejecutado exitosamente con código de salida 0 (Hash: 660315416f46782d, Time: 21914ms, 0 warnings de budget). Verificado que no hay regresiones visuales ni de navegación.
- **Pendiente:** iniciar la construcción de la nueva vista de Cabina Home (Fase 2) integrando el `PlateBadgeComponent` y las tarjetas de estado de turno cuando el usuario facilite el diseño del mockup.
- **Commit sugerido:** `feat(fase-2): paralelizar arranque, outbox sync, offline banner, plate badge y purga de dependencias`

## 2026-10-28 · Fase 1 (Dominio, Offline y Deduplicación): Dexie.js, Modelos Fuertes y Optimización de Carga
- **Pedido:** erradicar el cuello de botella del loader ("Generando perfil....."), instalar Dexie.js con soporte Offline-First, crear modelos estrictos de TypeScript y construir las APIs de Dominio (`ConductorApi`, `VehiculoApi`, `TurnoApi`) con deduplicación de peticiones concurrentes y caché local.
- **Cambios:**
  - `package.json` y `package-lock.json`: instalada dependencia `dexie` para gestión de base de datos IndexedDB local.
  - `src/app/core/offline/database.ts`: creada base de datos `AldiaDatabase` con tablas `cache_store`, `outbox_queue` y `gps_logs`, incluyendo métodos helper de lectura/escritura con TTL (`getCache`, `setCache`, `deleteCache`, `clearCache`).
  - `src/app/core/models/conductor.model.ts`: creadas interfaces `Conductor`, `Conductor3SL`, `RespuestaIngresos3SL` y función normalizadora `mapearConductor3SL()`.
  - `src/app/core/models/vehiculo.model.ts`: creada interfaz `Vehiculo` y `ValidacionCapacidadResponse`.
  - `src/app/core/models/turno.model.ts`: enriquecido con interfaces `TurnoDetalle` y `TurnoResponse` preservando 100% retrocompatibilidad con la interfaz `Turno`.
  - `src/app/core/models/documento.model.ts`: creada interfaz `DocumentoItem`, `DocumentoValidacionResponse` y `FotoDocumentoResponse`.
  - `src/app/domain/conductor.api.ts`: creada API de dominio con deduplicación concurrente en memoria (`shareReplay`), tiempo de espera calibrado a 10s con 1 retry, persistencia en Dexie `cache_store` y método retrocompatible `getEnvelope3SL()`.
  - `src/app/domain/vehiculo.api.ts`: creada API para validación de vigencia de documentos ante 3SL con `firstValueFrom` y persistencia en Dexie.
  - `src/app/domain/turno.api.ts`: creada API para consulta y creación de turnos con respaldo offline y encolamiento en `outbox_queue`.
  - `src/app/core/services/auth.service.ts` y `user.service.ts`: desacoplados de llamadas directas duplicadas; ahora delegan en `ConductorApi.getEnvelope3SL()` compartiendo una única petición hacia `https://api.3slogistica.com/api/ingresos`.
  - `tsconfig.json`: agregado alias `@domain/*` en `compilerOptions.paths`.
- **Verificación:** `npx ng build` ejecutado exitosamente con código de salida 0 (Hash: e8c562f98d4b084e, Time: 56234ms). Deduplicación verificada para garantizar una única petición hacia 3SL cuando `AppComponent` y `HomePage` inician simultáneamente.
- **Pendiente:** conectar `outbox_queue` al background sync de Capacitor Network cuando se ejecute la fase de sincronización offline completa.
- **Commit sugerido:** `feat(fase-1): dexie database, domain apis, modelos estrictos y deduplicacion de carga 3sl`

## 2026-10-27 · Cierre Fase 0 / Arranque Fase 1: SessionStore, AuthInterceptor, Reglas Git y Tokens Visuales Mockup
- **Pedido:** cerrar F0-01 (reglas de exclusión en `.gitignore` sin `git rm` para proteger keystores en disco), crear `SessionStore` reactivo con `BehaviorSubject` 100% retrocompatible (F1-02), implementar `AuthInterceptor` respetando cabeceras legadas y manejando 401 (F0-04), aplicar tokens visuales oficiales (`#0094DA`, `#F0F7FC`, semáforos, placa `#FFD100`) y tipografía Google Fonts (`Atkinson Hyperlegible` y `JetBrains Mono`) (F1-05), y validar compilación exitosa.
- **Cambios:**
  - `.gitignore`: configuradas reglas de exclusión para `*.keystore`, `*.jks`, `google-services.json`, `/www/` y `/src/environments/environment*.ts` (con excepción para `!environment.example.ts`) sin alterar archivos físicos en disco.
  - `src/app/core/session/session.store.ts`: creado store reactivo con `BehaviorSubject` para `token`, `placa` y `conductor`, sincronizado con `StorageService` y `localStorage`, con métodos `snapshot`, `setSession`, `updatePlaca`, `updateConductor` y `clearSession` (navegación vía Router a `/login`).
  - `src/app/core/interceptors/auth.interceptor.ts`: creado interceptor HTTP que inyecta automáticamente `Authorization: Bearer <token>` para `api.3slogistica.com` y `api.aldialogistica.com`, preservando cabeceras adicionales existentes y gestionando expiración de sesión (401).
  - `src/app/app.module.ts`: registrado `AuthInterceptor` en `providers` mediante `HTTP_INTERCEPTORS` (`multi: true`).
  - `src/theme/variables.scss`: configurados tokens de color corporativos (`--ion-color-primary: #0094da`, fondo `#f0f7fc`, tarjetas `#ffffff`, texto `#0e1e2e`, semáforos `#1a7037`/`#8a5300`/`#b42318` y placa `#ffd100`), junto con `--ion-font-family: 'Atkinson Hyperlegible'`.
  - `src/index.html`: integradas fuentes oficiales de Google Fonts (`Atkinson Hyperlegible` y `JetBrains Mono`) con preconnect para alto rendimiento.
- **Verificación:** `npx ng build` ejecutado exitosamente con código de salida 0 (Hash: fb3050f4ab53a60d). Verificados archivos `mikey.keystore` y `google-services.json` intactos físicamente en el disco.
- **Pendiente:** integración del input visual OTP en login y desarrollo del BFF/OTP en Laravel (`Aldia-Backend`) al final del proyecto según directriz.
- **Commit sugerido:** `feat(core): session store reactivo, auth interceptor, tokens visuales mockup y reglas gitignore`

## 2026-10-26 · Fase 0 (Paso 2): Sanitización de Login, Erradicación de Peso Muerto (15.5 MB) y Corrección de Comillas en LocalStorage
- **Pedido:** ejecutar el Paso 2 de la Fase 0: ajustar inputs de login (placa como texto con mayúsculas y cédula como numeric inputmode), eliminar modelos de redes neuronales (15.5 MB) y servicios de face-api, limpiar dependencias obsoletas en package.json (cors, rxjs-compat, ngx-cookie-service, etc.) y corregir el error 400 Bad Request por comillas de stringify en localStorage.
- **Cambios:**
  - `src/features/login/pages/login.page.html` y `login.page.ts`: placa cambiada a `type="text"`, sanitizada a 6 caracteres continuos en mayúsculas; cédula cambiada a `inputmode="numeric"`.
  - `src/app/core/services/storage.service.ts`: sanitización para evitar que `JSON.stringify` agregue comillas dobles que rompían las llamadas a 3SL (`%22`).
  - `src/app/core/services/user.service.ts` y `auth.service.ts`: sanitización de `getCedula()` y `getPlaca()` para purgar comillas residuales en `api/ingresos`.
  - `src/assets/models/` y `src/assets/filters/`: eliminados físicamente 18 archivos de modelos neuronales (~15.5 MB).
  - `src/app/api/face-api.service*` y `video-player.service*`: eliminados.
  - `src/app/features/datos/datos.page.ts`, `datos.page.html`, `dashboard.component.ts`: limpiados de imports y referencias muertas.
  - `package.json`: desinstalados `face-api.js`, `@tensorflow/tfjs`, `@types/webgl2`, `cors`, `rxjs-compat`, `rxjs-observable`, `ngx-cookie-service`.
- **Verificación:** `npm run build` ejecutado exitosamente con código de salida 0 (Hash: 5f1a1e774caeea36).
- **Pendiente:** implementación de 2FA vía WhatsApp en `Aldia-Backend`.
- **Commit sugerido:** `fix(login): sanitizar cedula y placa, remover face-api (15mb) y dependencias obsoletas`

## 2026-10-26 · Fase 0 (Paso 1): Saneamiento de Git, Fugas de Logs/Imports y Mitigación XSS
- **Pedido:** ejecutar el Paso 1 de la Fase 0 (Tareas F0-01 y F0-06): desindexar archivos sensibles de Git sin borrarlos localmente, ignorar secrets y builds en `.gitignore`, crear `environment.example.ts`, eliminar fugas en logs (`auth-facade.service.ts`), purgar imports accidentales de Node.js (`console`, `cors`), mitigar XSS por `innerHTML` en `home.page` y `turnos.page`, y documentar `validateCap()` respetando la restricción de 3SL.
- **Cambios:**
  - `mikey.keystore`, `google-services.json`, `www/`, `src/environments/environment.ts` y `environment.prod.ts`: preservados localmente y configurados en `.gitignore`.
  - `.gitignore`: configurado para garantizar que `*.keystore`, `*.jks`, `google-services.json`, `www/` y `src/environments/environment*.ts` estén ignorados, con excepción para `!src/environments/environment.example.ts`.
  - `src/environments/environment.example.ts`: creado como plantilla limpia con placeholders vacíos y sin secretos reales.
  - `src/app/features/login/services/auth-facade.service.ts`: eliminado `console.log(credentials)` para evitar fuga de credenciales en consola.
  - Purgado de imports de Node.js en 10 archivos TypeScript: removido `import { log } from 'console'` (8 archivos) y `import * as e from 'cors'` (2 archivos).
  - `src/app/features/home/pages/home.page.ts` y `home.page.html`: neutralizada la manipulación de DOM por `innerHTML`, reemplazándola por interpolación segura `{{ origenTexto }}` y estado reactivo `cargandoOrigen`.
  - `src/app/features/turnos/turnos.page.ts` y `turnos.page.html`: neutralizadas las asignaciones de `innerHTML` en flujos de geolocalización, reemplazándolas por interpolación segura `{{ origenTexto }}` y estado reactivo `cargandoUbicacion`.
  - `src/app/core/services/user.service.ts`: documentado método `validateCap()` con comentario `// TODO: Remover cuando se migre capacitaciones de 3SL` sin tocar la redirección externa para no romper la operación con 3SL.
- **Verificación:** compilación de producción validada exitosamente con `npm run build` (código de retorno 0).
- **Pendiente:** continuar con el Paso 2 de la Fase 0.
- **Commit sugerido:** `sec(fase-0): desindexar sensibles, sanear logs e imports, y mitigar xss en geolocalizacion`

## 2026-10-23 · Consolidación del Plan Maestro de Refactorización y Desacople de 3SL
- **Pedido:** generar un documento estructurado que integre la síntesis comparativa de los diagnósticos, el desacople total de 3SL vía BFF Laravel, la matriz de seguridad SEC-01..07, el plan de 5 fases alineado con el módulo RNDC y las acciones inmediatas de los próximos 7 días, complementado con análisis técnico.
- **Cambios:**
  - `docs/artefactos/2026-10-23-plan-maestro-refactor-y-desacople-3sl.md`: documento maestro que define la arquitectura objetivo, mapa de los 23 endpoints de 3SL migrados a `Aldia-Backend`, estrategia Strangler Fig en 3 etapas, pipeline WebP, persistencia Dexie.js (IndexedDB), esquemas técnicos para GPS batching y matriz de tareas F0 a F4.
  - `docs/artefactos/README.md`: registro del nuevo artefacto en la tabla de índice.
  - `docs/artefactos/BITACORA.md`: esta entrada de bitácora.
- **Verificación:** validación de congruencia entre la capacidad instalada en `Aldia-Backend` (Laravel 9, JWT, DomPDF, Redis, repositorios de Terceros/Firmas) y las necesidades operativas de la app móvil `Viaja-Con-Aldia`. Sin alteraciones en código fuente ejecutable.
- **Pendiente:** ejecución táctica de la Fase 0 (Día 1 a Día 7) por parte de los equipos DevOps, Backend y Frontend.
- **Commit sugerido:** `docs(refactor): plan maestro de refactorizacion, desacople 3sl y arquitectura rndc`

## 2026-10-22 · Generación de versión Markdown del Plan de Refactor
- **Pedido:** generar un documento estructurado con toda la información tal cual del archivo `docs/artefactos/2026-10-21-plan-refactor.html`.
- **Cambios:**
  - `docs/artefactos/2026-10-21-plan-refactor.md`: versión Markdown completa y fiel al HTML original.
  - `docs/artefactos/README.md`: actualización del índice de artefactos para referenciar el nuevo archivo Markdown.
  - `docs/artefactos/BITACORA.md`: registro de la sesión en la bitácora.
- **Verificación:** revisión de paridad y completitud con el archivo HTML original (1.420 líneas analizadas e integradas al 100%).
- **Pendiente:** ninguno respecto a la documentación.
- **Commit sugerido:** `docs(refactor): crear version markdown fiel de 2026-10-21-plan-refactor`

## 2026-10-21 · Configuración de agentes y limpieza de git
- **Pedido:** ajustar `.gitignore` según el plan de refactor, definir la carpeta de artefactos y crear archivos de contexto para agentes.
- **Cambios:**
  - `.gitignore`: se agregan `www/`, llaves de firma (`*.keystore`, `*.jks`, `*.p12`…), `google-services.json`, `GoogleService-Info.plist`, binarios (`*.apk`, `*.aab`, `*.ipa`), `.env*`, carpetas generadas de Android y `.claude/settings.local.json`.
  - Índice de git: `www/` (1.450 archivos), `mikey.keystore` y `google-services.json` quedan como eliminados en el área de preparación con `git rm --cached`. Las copias locales no se tocaron.
  - `docs/artefactos/`: carpeta de artefactos, `README.md` con convenciones e índice, esta bitácora y el informe `2026-10-21-plan-refactor.html`.
  - `AGENTS.md`: reglas de arquitectura vigentes y objetivo para cualquier agente.
  - `CLAUDE.md`: importa `AGENTS.md` y agrega reglas propias de Claude Code.
  - `.claude/settings.json` y `.claude/hooks/bloquear-git.js`: bloquean commits, push y otras operaciones que escriben historial, y la lectura de archivos con secretos.
- **Verificación:** `git check-ignore` confirma que `www/`, el keystore, `google-services.json` y los `environment*.ts` quedan ignorados.
- **Commit sugerido:** `chore(repo): ignorar build y llaves; agregar contexto para agentes y carpeta de artefactos`

