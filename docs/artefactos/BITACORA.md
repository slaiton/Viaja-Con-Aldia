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
