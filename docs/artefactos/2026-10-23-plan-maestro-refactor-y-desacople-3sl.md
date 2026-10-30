# Plan Maestro de Refactorización, Desacople de 3SL y Arquitectura Operativa RNDC
**Ecosistema Viaja con Aldia (App Móvil Ionic/Angular) & Aldia-Backend (Laravel Gateway / BFF)**

> **Documento de Consenso Técnico y Estratégico · 23 de octubre de 2026**  
> **Artefacto:** [plan_maestro_refactor_y_desacople_3sl.md](file:///c:/Users/Andres.Espinosa/proyectos_Aldia/Viaja-Con-Aldia/docs/artefactos/2026-10-23-plan-maestro-refactor-y-desacople-3sl.md)  
> **Estado:** Aprobado para Ejecución · Vigente  
> **Ámbito:** Frontend Móvil (`Viaja-Con-Aldia`) y Backend Gateway (`Aldia-Backend`)  
> **Pila Tecnológica Objetivo:** Angular 18 LTS · Ionic 8 · Capacitor 7 · Dexie.js (IndexedDB) · Laravel 11 (PHP 8.3) · Redis

---

## 1. Síntesis Comparativa y Consolidación de Diagnósticos

El presente plan unifica el **Documento 1 (Plan de Refactor PM / UX)** y el **Documento 2 (Diagnóstico Técnico Profundo de Arquitectura Antigravity)**, reconciliando sus discrepancias y capitalizando los hallazgos exclusivos de cada uno para construir una hoja de ruta única, ejecutable y alineada a los objetivos de negocio de Aldia Logística.

### 1.1 ¿En qué coinciden plenamente ambos diagnósticos?

1. **Vulnerabilidad crítica por secretos en el cliente:**  
   Ambos confirman que compilar credenciales estáticas de servicios internos (`USUSEGINT` / `12249`, `client_secret` OAuth, y API Keys) dentro del bundle de Angular (`main.js`) permite que cualquiera descomprima el archivo APK y comprometa la infraestructura de SIAT y Aldia. La migración parcial a `environment.ts` las sacó de Git, pero siguen empaquetándose en el binario distribuido a los conductores.
2. **Necesidad urgente del patrón BFF e Interceptores HTTP:**  
   Ambos coinciden en que la app móvil no puede continuar realizando 51 llamadas directas escritas a mano hacia 4 orígenes heterogéneos sin una capa centralizada (`core/http`) con interceptores que gestionen el token JWT, renueven credenciales, atrapen errores 401 (sesión expirada) y apliquen reintentos controlados.
3. **Colapso de mantenibilidad por componentes monolíticos y ausencia de tipado:**  
   Ambos señalan el altísimo riesgo operativo de concentrar más del 54% del código en dos archivos mastodónticos: `registro.page.ts` (3.444 líneas) y `datos.page.ts` (2.968 líneas), junto con `vehiculo.component.ts` (1.293 líneas). Esto se agrava con 838 usos de `any` que anulan el compilador estricto de TypeScript, 62 invocaciones de `toPromise()` (deprecado en RxJS 7 y eliminado en RxJS 8), y fugas de memoria por suscripciones de RxJS que nunca se cancelan (`unsubscribe`).
4. **Poda obligatoria de dependencias pesadas y código muerto:**  
   Ambos exigen la desinstalación inmediata de `face-api.js` y `@tensorflow/tfjs` (que inflan el APK entre 15 MB y 22 MB con modelos de redes neuronales comentados sin uso), `rxjs-compat`, `cors` (librería de servidor instalada en frontend), `bootstrap` / `ng-bootstrap` / `@syncfusion/ej2-angular-dropdowns`, y plugins duplicados de geolocalización de Cordova.

---

### 1.2 Divergencias y Resoluciones Arquitectónicas Definitivas

| Eje de Análisis | Documento 1 (Plan PM / UX) | Documento 2 (Diagnóstico Antigravity) | Decisión Arquitectónica Definitiva |
|---|---|---|---|
| **Ubicación del BFF (Backend for Frontend)** | Proponía crear el BFF en el backend de 3SL para que este reenviara a Aldia y SIAT. | Proponía que `Aldia-Backend` (Laravel) fuera el único Gateway/BFF, ocultando a 3SL y SIAT. | **Se adopta Documento 2:** El BFF residirá 100% en `Aldia-Backend` (Laravel). Esto cumple el imperativo estratégico de independizarse comercial y tecnológicamente de 3SL. |
| **Momento de migración Angular (15 → 18+)** | Lo ubicaba al final (Fase 4), manteniendo Angular 15 con `BehaviorSubject` durante las Fases 0 a 3. | Lo ubicaba en Fase 1 como urgente ante la incompatibilidad teórica entre Angular 15 y Capacitor 7. | **Enfoque Híbrido Pragmático:** Dado que el CI en Codemagic compila hoy exitosamente, no bloquearemos la Fase 0 (Seguridad) con un cambio mayor de framework. Fijaremos dependencias con `--legacy-peer-deps` controlado en Fase 1, y ejecutaremos el `ng update` secuencial al inicio de la Fase 4 cuando el código ya esté limpio y modularizado. |
| **Estado real de `LoginGuard` y `login.page`** | Detectó que en la rama `main` reciente `login.page` ya usa `AuthFacadeService` (70 líneas) y `LoginGuard` ya valida expiración de JWT. | Analizó una versión anterior donde `LoginGuard` solo comprobaba `token !== null`. | **Se adopta Documento 1:** Se toma el patrón de `AuthFacadeService` y `LoginGuard` actual como la plantilla de arquitectura estándar (Facade + Store) para replicar en el resto de la app. |
| **Estrategia Offline e Imágenes (POD)** | Planteaba un `OutboxService` conceptual, un `OfflineBanner` no bloqueante y utilidades genéricas en `image.ts`. | Especificaba la ingeniería técnica: Dexie.js (IndexedDB), y conversión de Base64 JSON (2–3 MB) a WebP binario + `FormData` (<150 KB). | **Fusión Total:** Se adopta la interfaz de usuario de cabina del Documento 1 (`OfflineBanner` y vista paso a paso) respaldada por el motor transaccional Dexie.js y el pipeline de compresión WebP/`FormData` del Documento 2. |

---

### 1.3 Cruce de Hallazgos Exclusivos

#### A. Aportes exclusivos del Documento 1 (Plan PM / UX):
* **Fuga de llaves en el repositorio Git:** La llave de firma privada de producción de Android (`mikey.keystore`), el archivo de configuración `google-services.json` y el build web completo compilado `www/` (1.450 archivos, 22 MB) están versionados en el historial de Git.
* **Autenticación débil sin 2FA:** El acceso actual con Cédula y Placa solo *identifica*, no *autentica*, ya que la placa es pública (va pintada en el camión). Cualquiera con la cédula del conductor puede usurpar su sesión, modificar su turno y acceder a su información.
* **Fugas de sesión por URL y logs en producción:** El JWT viaja como parámetro query (`?token=`) hacia el sitio externo de capacitaciones, las credenciales completas se imprimen en consola mediante `console.log` (`auth-facade.service.ts:28`) y se detectó uso inseguro de `innerHTML` para renderizar datos provenientes del servidor.
* **Matriz de duplicación de código:** Identificación milimétrica de 10 bloques de lógica repetidos entre 2 y 7 veces a lo largo de 7 páginas.
* **Diseño ergonómico para cabina:** Reemplazo del menú lateral hamburguesa por una barra inferior de 4 pestañas, objetivos táctiles mínimos de 48–52 px y adopción de la tipografía de alta legibilidad *Atkinson Hyperlegible*.

#### B. Aportes exclusivos del Documento 2 (Diagnóstico Antigravity):
* **La gran brecha funcional del RNDC:** `Aldia-Backend` ya dispone de controladores y modelos listos para el ciclo de vida del transporte de carga (`/api/manifiestos`, `/api/remesas`, `/api/actualizaentrega`, `/api/solicitudServicio/cambioEstado`, generación de PDF con DomPDF y QR con SimpleSoftwareIO), pero la app móvil ignora esta infraestructura y abandona al conductor en cuanto sale enturnado de la agencia.
* **Impacto financiero del cumplido en Base64 (POD):** Las fotos de pruebas de entrega (POD) enviadas como cadenas Base64 dentro de payloads JSON sufren un overhead del +33%, generando cargas de 2 a 3 MB que provocan timeouts en conexiones móviles 2G/EDGE en carretera. Esto retrasa la radicación del cumplido y retiene el cobro del 30%–40% restante del flete.
* **GPS por lotes (Batching) para auditoría logística:** La app actual únicamente captura la coordenada una vez (`getCurrentPosition()`) al enturnarse. Se requiere recolección periódica por lotes en ruta sin agotar la batería del teléfono, sincronizando con `/api/logs/gps/batch` para auditar tiempos en cargue/descargue y dar soporte normativo ante el Ministerio de Transporte (RNDC / SICETAC).

#### C. Complemento del Análisis de Código (Arquitecto Antigravity):
* **Capacidad instalada en `Aldia-Backend`:** Inspeccionando los repositorios del backend (`FirmaRepository.php`, `TerceroRepository.php`, controladores de manifiestos y conductores), se verifica que Laravel ya maneja la lógica de negocio de clientes, terceros y manifiestos. El backend cuenta con `tymon/jwt-auth` y conexión a Redis, lo que permite implementar el servidor OTP y el proxy BFF sin añadir dependencias externas complejas.
* **Riesgo de la triple base de datos:** Actualmente coexisten lecturas entre la base de datos de 3SL, el ERP SIAT (Oracle/MySQL vía puerto 8000) y la base de datos propia de `Aldia-Backend`. El nuevo BFF debe unificar estos accesos en una sola API pública para el móvil (`https://api.aldialogistica.com/api/v2/`), asumiendo la orquestación interna.

---

## 2. Evaluación de la Meta de Negocio: "No depender más de 3SL"

Actualmente, la aplicación móvil realiza llamadas directas a **23 endpoints** alojados bajo el dominio `https://api.3slogistica.com/api/`. Para lograr la autonomía tecnológica e independencia operativa de Aldia Logística, `Aldia-Backend` (Laravel) absorberá gradualmente estas responsabilidades bajo el patrón **Strangler Fig (Higo Estrangulador)**.

### 2.1 Mapa de Dependencias Actuales hacia 3SL y su Destino en Aldia-Backend

| Dominio Funcional | Endpoints actuales en `api.3slogistica.com` | Servicio Angular Actual | Nuevo Destino en `Aldia-Backend` (Laravel BFF) | Estrategia de Desacople y Persistencia |
|---|---|---|---|---|
| **1. Autenticación y Sesión** | `POST /auth/driver`<br>`POST /auth/token`<br>`DELETE /auth/token` | `AuthService` | `POST /api/v2/auth/login-otp`<br>`POST /api/v2/auth/verify-otp`<br>`POST /api/v2/auth/refresh`<br>`DELETE /api/v2/auth/logout` | **Reemplazo Nativo:** `Aldia-Backend` asume el 100% de la emisión y validación de tokens JWT mediante `tymon/jwt-auth`. Se desactiva la autenticación contra 3SL. |
| **2. Validación SMS (OTP)** | `GET /vehiculo/validation`<br>`POST /vehiculo/validation`<br>`PUT /vehiculo/validation` | `RegistroService` | `POST /api/v2/otp/send`<br>`PUT /api/v2/otp/validate` | **Absorción en Laravel:** Integración directa con el proveedor de mensajería SMS de Aldia. Códigos temporales almacenados en Redis con expiración de 5 minutos. |
| **3. Catálogos Maestros** | `GET /satelital`<br>`GET /clasevehiculo`<br>`GET /marcavehiculo`<br>`GET /carroceriavehiculo`<br>`GET /claselinea`<br>`GET /color`<br>`GET /parentesco` | `RegistroService` | `GET /api/v2/catalogos/{tipo}`<br>*(o endpoint unificado `/api/v2/catalogos`)* | **Proxy con Caché → Migración:** En Fase 0/1, Laravel consulta a 3SL y cachea en Redis por 24 horas. En Fase 2, se importan las tablas maestras a la BD de Aldia/SIAT y se corta el enlace con 3SL. |
| **4. Geocodificación y Zonas** | `GET /zonas/gps`<br>`GET /zonas` | `GeodataService` | `GET /api/v2/geodata/regional-by-gps`<br>`GET /api/v2/geodata/regionales` | **Reemplazo en Laravel:** `Aldia-Backend` ya dispone de `LogCiudadesGpsController`. Se migran los polígonos de zonificación de las agencias a la base de datos de Aldia. |
| **5. Perfil, Terceros y Vehículos** | `GET /ingresos`<br>`POST /ingresos`<br>`GET /tercero`<br>`POST /tercero`<br>`GET /vehiculo`<br>`POST /vehiculo`<br>`POST /mis-vehiculos` | `AuthService`<br>`UserService`<br>`RegistroService` | `GET/POST /api/v2/conductor/perfil`<br>`GET/POST /api/v2/terceros`<br>`GET/POST /api/v2/vehiculos` | **Patrón Strangler (Proxy → Nativo):** `Aldia-Backend` ya cuenta con repositorios de datos (`TerceroRepository`, `FirmaRepository`). Laravel unifica las lecturas y escrituras sincronizando en segundo plano con SIAT. |
| **6. Cumplimiento, Firma y Push** | `GET /document/validate`<br>`GET /firma`<br>`POST /firma`<br>`GET /capacitaciones`<br>`POST /load/token` | `UserService` | `GET /api/v2/documentos/vencimientos`<br>`GET/POST /api/v2/contratos/firma`<br>`GET /api/v2/capacitaciones`<br>`POST /api/v2/push/token` | **Reemplazo Progresivo:** Registro de tokens FCM y firmas electrónicas de contratos (con generación de PDF mediante DomPDF) directamente en `Aldia-Backend`. |

---

### 2.2 Estrategia de Migración Progresiva (Patrón Strangler Fig)

1. **Etapa 1 — Enmascaramiento Total (Fase 0 y Fase 1):**  
   La app móvil cambia de inmediato todas sus URLs base para apuntar exclusivamente a `https://api.aldialogistica.com/api/v2/`. Si una funcionalidad específica aún reside temporalmente en 3SL o en SIAT (puerto 8000), `Aldia-Backend` actúa como proxy seguro de servidor a servidor (utilizando `Http::withToken()` de Laravel).  
   *Resultado:* Para el binario APK distribuido, 3SL deja de existir desde la Fase 1.
2. **Etapa 2 — Absorción de Lecturas y Caché en Redis (Fase 2):**  
   `Aldia-Backend` sincroniza y almacena en su propio Redis los catálogos de vehículos, zonificación regional, tokens FCM y códigos OTP. Si la API de 3SL experimenta lentitud o caídas, la aplicación de los conductores continúa operando con normalidad desde la caché y base de datos local de Aldia.
3. **Etapa 3 — Desconexión Definitiva de 3SL (Fase 3 y Fase 4):**  
   Los controladores de `Aldia-Backend` desactivan todas las llamadas HTTP hacia `api.3slogistica.com`, ejecutando lecturas y escrituras transaccionales directas contra las tablas de `Aldia-Backend` y el ERP SIAT. Se revocan formalmente las credenciales compartidas con 3SL.

---

## 3. Matriz Consolidada de Riesgos de Seguridad (Prioridad #1)

| ID | Severidad | Vulnerabilidad Detectada | Fuente y Ubicación | Impacto Operativo y Normativo | Solución Inmediata en Fase 0 |
|:---:|:---:|---|---|---|---|
| **SEC-01** | 🔴 **Crítico** | Llave privada `mikey.keystore` y carpeta `www/` en Git | Raíz del repo móvil y carpeta `www/` (1.450 archivos, 22 MB) | Cualquier persona con acceso de lectura al repositorio puede firmar un APK malicioso que Android aceptará e instalará como actualización oficial legítima. | Ejecutar `git rm --cached`, reescribir historial con `git filter-repo`, agregar a `.gitignore` y migrar la firma a las variables secretas del CI (Codemagic). |
| **SEC-02** | 🔴 **Crítico** | Credenciales estáticas SIAT (`USUSEGINT` / `12249`) en el bundle del APK | `UserService`, `PhotoService`, `RegistroService`, `GeodataService` | Descompilar el APK toma 2 minutos con herramientas públicas (JADX). Permite inyectar o alterar terceros, turnos y documentos en SIAT/Aldia (No conformidad mayor BASC/OEA). | Trasladar las 12 llamadas al BFF en `Aldia-Backend`, eliminar cabeceras del cliente, inyectarlas desde el `.env` del servidor y rotar la contraseña en SIAT. |
| **SEC-03** | 🔴 **Crítico** | `client_secret` OAuth y Google Maps API Key expuestos | `environment.ts`, `home.page.ts`, `preform.page.ts` | Aunque salgan de Git, Angular las compila dentro de `main.js`. Expone cuotas de facturación de Maps y permite invocar endpoints autenticados de cliente. | Validar autorizaciones mediante JWT en el BFF; restringir la API Key de Maps por huella digital SHA-1 del APK y rotar el `client_secret`. |
| **SEC-04** | 🔴 **Crítico** | Login solo identificatorio (Cédula + Placa sin segundo factor) | `auth-facade.service.ts`, `login.page.html` | La placa es información pública pintada en los camiones. Con la cédula de un conductor se puede suplantar su identidad, cambiar su vehículo o manipular sus turnos. | Implementar 2FA con código OTP de 6 dígitos enviado por SMS al celular registrado del conductor antes de emitir el JWT de sesión. |
| **SEC-05** | 🟠 **Alto** | Tráfico HTTP en texto plano sin TLS (Puerto 8000) | `geodata.service.ts` (`http://siat...:8000`) | Susceptible a interceptación y manipulación Man-in-the-Middle (MitM); bloqueado por defecto en Android 9+ (`cleartextTrafficPermitted="false"`). | Enrutar todas las consultas a través de `Aldia-Backend` bajo HTTPS seguro; la comunicación con SIAT :8000 ocurre por red privada interna de servidores. |
| **SEC-06** | 🟠 **Alto** | Exposición de credenciales en `console.log` y JWT en URL | `auth-facade.service.ts:28`, `user.service.ts:779` (`?token=`) | Las credenciales quedan almacenadas en los logs del sistema operativo (Logcat) y el token JWT queda grabado en historiales de navegación y proxies corporativos. | Eliminar los 227 `console.*` de producción y sustituir el paso de token por URL hacia capacitaciones por un token efímero de intercambio de un solo uso. |
| **SEC-07** | 🟡 **Medio** | Inyección HTML (`innerHTML`) y claves de GPS satelital en texto plano | `home.page.ts`, `turnos.page.ts`, `registro.page.ts` | Vectores potenciales de Cross-Site Scripting (XSS) al pintar la ciudad y exposición de contraseñas de acceso a proveedores satelitales (Satrack, etc.). | Reemplazar `innerHTML` por interpolación nativa `{{ }}` y transmitir las credenciales de GPS satelital cifradas hacia el BFF sin guardarlas localmente. |

---

## 4. Alineación Estratégica del Plan de Fases

1. **Inversión del BFF en Fase 0:**  
   Ninguna credencial sensible (`USUSEGINT`, `X-Client-Secret`) puede ser retirada del cliente móvil hasta que `Aldia-Backend` exponga las rutas puente en `/api/v2/driver/*`. La Fase 0 inicia simultáneamente en backend y frontend.
2. **Desacople pragmático de Angular 15 + Capacitor 7:**  
   Aunque teóricamente Capacitor 7 recomienda Angular 17+, la aplicación en la rama `main` compila y se despliega correctamente a través de Codemagic. Forzar la migración mayor de framework en la Fase 0 detendría la corrección urgente de seguridad y colisionaría con los 838 `any` y librerías rotas. La actualización de framework se ejecutará limpiamente en la Fase 4, una vez modularizada la aplicación.
3. **Adelanto del motor Offline (Dexie.js) y WebP:**  
   No se postergará la solución de las dos grandes bombas operativas (pérdida de señal en carretera y subida de imágenes Base64 de 3 MB). El motor IndexedDB (Dexie.js) se instala en la Fase 1 junto al `SessionStore`, y el pipeline de compresión WebP binario se entrega en la Fase 2 con el piloto de vehículos.
4. **Incorporación del Módulo RNDC ("Mi Viaje Activo") en Fase 3:**  
   El rediseño de la pantalla de Inicio no se limita al enturnamiento; integra los endpoints ya construidos en `Aldia-Backend` (`/api/manifiestos`, `/api/remesas`, `/api/actualizaentrega`) y el GPS Batching, acompañando al transportador durante todo el trayecto nacional.

---

## 5. Plan de Ejecución Detallado (Fase 0 a Fase 4)

**Composición del equipo estimado:**  
* 2 Desarrolladores Frontend (Angular / Ionic / TypeScript)
* 1 Desarrollador Backend (Laravel / PHP / Redis)
* 1 Tech Lead / DevOps (Soporte en CI/CD y despliegue)

---

### 🛡️ FASE 0 · Seguridad Inmediata y Puente BFF en Aldia
* **Duración estimada:** 2 semanas (Esfuerzo M)
* **Objetivo principal:** Erradicar credenciales expuestas y llaves del código; implementar 2FA por SMS en login; y levantar el proxy BFF en `Aldia-Backend`.
* **Reducción de dependencia de 3SL:** Alta en Autenticación (100% migrado a Aldia).

#### Matriz de Tareas de Fase 0
| ID | Tarea | Responsable | Dependencias y Coordinación |
|---|---|---|---|
| **F0-01** | **Saneamiento del Repositorio Git:** Extraer del árbol de Git `mikey.keystore`, `google-services.json` y la carpeta `www/` (`git rm --cached`). Añadirlos a `.gitignore`. Respaldar el keystore en las variables secretas de Codemagic y reescribir el historial con `git filter-repo`. | DevOps / Tech Lead | Coordinar ventana de mantenimiento para que los desarrolladores reclonen el repo limpio. |
| **F0-02** | **Construcción del Gateway BFF en Aldia-Backend:** Crear grupo de rutas `/api/v2/driver/*` bajo middleware `auth:jwt`. El backend inyectará internamente las credenciales `USUSEGINT`/`12249` hacia SIAT y el `client_secret`, resolviendo también las consultas al puerto :8000 por red local. | Backend (Aldia) | Requiere que Infraestructura habilite el enlace interno entre el servidor Laravel y SIAT. |
| **F0-03** | **Servicio de Autenticación 2FA (SMS OTP) en Laravel:** Crear `POST /api/v2/auth/request-otp` (valida cédula y placa, despacha SMS y guarda código de 6 dígitos en Redis con TTL de 5 min) y `POST /api/v2/auth/verify-otp` (valida código y emite el JWT de Aldia). | Backend (Aldia) | Conectar con el gateway SMS corporativo de Aldia. |
| **F0-04** | **Implementación de `authInterceptor` y Migración de Llamadas:** Crear el interceptor HTTP funcional en Angular 15. Redirigir las 12 llamadas que usaban `USUSEGINT`, `X-Client-Id` y puerto 8000 hacia el nuevo BFF en `Aldia-Backend` usando cabecera estándar `Authorization: Bearer <token>`. | Frontend | Requiere que F0-02 esté desplegado en entorno de pruebas (Staging). |
| **F0-05** | **Interfaz de Login Seguro con OTP:** Ajustar `/login` para que el campo de placa sea texto regular con máscara `AAA 000` (eliminando `type="password"`), cédula con `inputmode="numeric"` y añadir el componente de ingreso del código SMS de 6 dígitos. | Frontend | Depende de F0-03. |
| **F0-06** | **Erradicación de Fugas Locales:** Eliminar el `console.log` de credenciales en `auth-facade.service.ts:28`, remover `?token=` en la URL hacia capacitaciones (`user.service.ts:779`) y sustituir `innerHTML` por interpolación en Inicio y Turnos. | Frontend | Tarea autónoma inmediata. |
| **F0-07** | **Rotación de Claves en Servidores:** Publicar la actualización en tiendas exigiendo actualización obligatoria. Inmediatamente después, rotar en SIAT la contraseña de `USUSEGINT`, renovar el `client_secret` y restringir la API Key de Maps por SHA-1. | Backend / DevOps | Coordinar con Operaciones para activar la bandera de versión mínima en la BD. |

* **Criterios de Éxito ("Lista cuando..."):**
  1. Al compilar el APK de producción y ejecutar `grep -rnE "USUSEGINT|12249|691e1dd6|AIzaSy" www/ android/` el resultado es **0 coincidencias**.
  2. Ningún archivo `.keystore`, `google-services.json` ni carpeta `www/` existe en la rama `main`.
  3. El inicio de sesión exige obligatoriamente el código OTP recibido por SMS en el teléfono del conductor.
* **Riesgos y Mitigaciones:**
  * *Riesgo:* Teléfonos desactualizados en base de datos no reciben el SMS.  
    *Mitigación:* Mostrar en pantalla los últimos 2 dígitos del celular registrado (ej. `••21`) y proveer un botón directo de contacto con Tráfico vía WhatsApp para actualización asistida.

---

### 🧱 FASE 1 · Cimientos, Capa de Datos Única y Base Offline
* **Duración estimada:** 3 semanas (Esfuerzo M–L)
* **Objetivo principal:** Centralizar las 51 URLs en `domain/*/*.api.ts` apuntando exclusivamente a `Aldia-Backend`; integrar Dexie.js (IndexedDB); y purgar dependencias muertas (+15 MB).
* **Reducción de dependencia de 3SL:** 100% en Frontend (`api.3slogistica.com` desaparece por completo del código de Angular).

#### Matriz de Tareas de Fase 1
| ID | Tarea | Responsable | Dependencias y Coordinación |
|---|---|---|---|
| **F1-01** | **Endpoints BFF de Catálogos y Caché en Redis:** Exponer en Laravel los endpoints para Catálogos (`/api/v2/catalogos/*` con caché en Redis por 24h), Regionales GPS (`/api/v2/geodata/*`), Perfil y Documentos, encapsulando internamente cualquier consulta residual a 3SL. | Backend (Aldia) | Estandarizar contratos JSON unificados para las respuestas. |
| **F1-02** | **Capa HTTP Centralizada y `SessionStore`:** Implementar `API_CONFIG` (host único de Aldia), `apiBaseInterceptor`, `errorInterceptor` y `SessionStore` reactivo (reemplazando lecturas directas de `localStorage` y los 8 usos de `window.location.reload()`). | Frontend | Tarea base para las APIs de dominio. |
| **F1-03** | **APIs de Dominio (`*.api.ts`) y Mappers Tipados:** Crear modelos e interfaces estrictas en `domain/` (conductor, vehículo, tercero, documento, turno) para transformar nombres crudos (`nombreTercerox`, `numeroPlacaxxx`) a camelCase limpio y migrar los 62 `toPromise()` a `firstValueFrom()`. | Frontend | Basado en los contratos de F1-01. |
| **F1-04** | **Motor de Persistencia Offline (Dexie.js):** Instalar `dexie` y configurar dos almacenes locales en IndexedDB: `cache_store` (guarda perfil, turno y documentos con timestamp) y `outbox_queue` (cola transaccional de peticiones pendientes). Crear el componente `OfflineBanner`. | Frontend | Reemplaza el modal bloqueante `EmptyScreen`. |
| **F1-05** | **Poda de Dependencias y Optimización de Bundle:** Desinstalar `face-api.js`, `@tensorflow/tfjs` (borrando modelos en assets), `cors`, `rxjs-compat`, `rxjs-observable`, Syncfusion, Bootstrap, ng-bootstrap, `lodash`, `ngx-cookie-service` y Cordova geolocation. Retirar Bootstrap de `angular.json` y adoptar `theme/tokens.scss`. | Frontend | Validar visualmente que las pantallas no sufran regresión de estilos al retirar Bootstrap. |
| **F1-06** | **Higiene de Código y Linter:** Activar reglas ESLint con `no-explicit-any` (warning) y `no-console` (error); eliminar imports de Node (`console`, `cors`) y las 712 líneas de código comentado. | Frontend | Tarea de saneamiento transversal. |

* **Criterios de Éxito ("Lista cuando..."):**
  1. Ninguna URL ni cabecera HTTP se instancia fuera de la carpeta `domain/*/*.api.ts`.
  2. La cadena `api.3slogistica.com` no existe en ningún archivo del frontend.
  3. El peso del APK se reduce en más de 15 MB y al activar Modo Avión la app no se bloquea, mostrando los datos cacheados con el `OfflineBanner`.

---

### 🧩 FASE 2 · Piezas Compartidas, Pipeline WebP y Piloto ("Mis Vehículos")
* **Duración estimada:** 2.5 semanas (Esfuerzo M)
* **Objetivo principal:** Construir componentes reutilizables (`CatalogPicker`, `VehiculoForm`); implementar el pipeline WebP (<150 KB); y refactorizar la pantalla de Mis Vehículos como piloto de la nueva arquitectura.
* **Reducción de dependencia de 3SL:** Migración de Catálogos y Vehículos a base de datos de Aldia/SIAT.

#### Matriz de Tareas de Fase 2
| ID | Tarea | Responsable | Dependencias y Coordinación |
|---|---|---|---|
| **F2-01** | **Endpoint Multipart de Documentos en Laravel:** Habilitar en `Aldia-Backend` la recepción de archivos binarios vía `multipart/form-data` en `POST /api/v2/documentos`, validando JWT, tipos MIME autorizados y almacenando en el storage seguro de Aldia. | Backend (Aldia) | Mantener compatibilidad temporal con Base64 para clientes antiguos. |
| **F2-02** | **Pipeline de Imágenes WebP y Componente `DocCapture`:** Implementar en `shared/utils/image.ts` la compresión en Canvas a formato `image/webp` (calidad 0.75, ancho máx. 1280px, peso <150 KB) con fallback automático a JPEG. Construir `DocCapture` parametrizado por `document-catalog.ts` con soporte offline en `OutboxService`. | Frontend | Pruebas de integración directa con F2-01. |
| **F2-03** | **Librería de Componentes Compartidos:** Construir `PlateBadge` (placa colombiana), `PlateInput`, `StatusChip`, `CatalogPicker` (selector modal con buscador y caché que elimina 24 handlers repetidos), `VehiculoForm` y `TerceroForm`. | Frontend | Reutilizables en Registro, Perfil y Vehículos. |
| **F2-04** | **Piloto Arquitectónico: Mis Vehículos (`/perfil/vehiculos`):** Desacoplar `vehiculo.component.ts` (1.293 líneas) de `AppModule` y migrarlo a módulo Lazy Loaded con `VehiculosFacade`. Integrar `PlateBadge`, `VehiculoForm`, `CatalogPicker` y validación OTP para cambio de vehículo activo. | Frontend | Requiere F2-02 y F2-03 completados. |

* **Criterios de Éxito ("Lista cuando..."):**
  1. `vehiculos.page.ts` tiene menos de 300 líneas de código y carga bajo demanda.
  2. Subir una foto de SOAT o documento envía un payload binario menor a 150 KB (reducción superior al 90% frente al Base64) y se encola correctamente si se corta la red.
* **Hito de Validación Real:** Prueba con 5 conductores en agencia cambiando su vehículo con OTP y actualizando documentos bajo limitación simulada de red (2G/EDGE).

---

### 🚛 FASE 3 · Pantallas Principales, UX de Cabina y Módulo Operativo RNDC
* **Duración estimada:** 4 semanas (Esfuerzo L)
* **Objetivo principal:** Descomponer `registro.page.ts` (3.444 líneas) y `datos.page.ts` (2.968 líneas); implantar la navegación por 4 pestañas; y activar el ciclo de vida del viaje RNDC (Manifiesto, Remesas, POD y GPS por lotes).
* **Reducción de dependencia de 3SL:** Desconexión total (100% de operaciones de transporte atendidas por Aldia-Backend).

#### Matriz de Tareas de Fase 3
| ID | Tarea | Responsable | Dependencias y Coordinación |
|---|---|---|---|
| **F3-01** | **Activación de Servicios RNDC y GPS Batch en Laravel:** Exponer para la app los endpoints de viaje activo (`/api/manifiestos`, `/api/remesas`, `/api/actualizaentrega`) con descarga de PDF/QR del Manifiesto Electrónico de Carga (MEC). Crear `POST /api/v2/gps/batch` para recepción periódica de coordenadas. | Backend (Aldia) | Alinear con Operaciones/Tráfico los estados del webhook de entrega. |
| **F3-02** | **Navegación de Cabina (Tabs) y Nuevo Inicio:** Reemplazar el menú lateral por la barra inferior de 4 pestañas (`Inicio`, `Preoperacional`, `Documentos`, `Perfil`) con tipografía Atkinson Hyperlegible. Unificar `home` y `turnos` en `/inicio` con `StatusHero` (4 estados claros) y la hoja deslizable `TurnoSheet`. Eliminar la ruta `/turnos`. | Frontend | Tarea estructural de navegación. |
| **F3-03** | **Módulo "Mi Viaje Activo" (MEC, Remesas, POD y GPS):** Al despachar el camión, `/inicio` presenta el Manifiesto RNDC (almacenable offline para retenes viales con QR), lista de remesas, reporte de hitos y captura de cumplido con `DocCapture`. El GPS recolecta coordenadas en IndexedDB cada 5 min/2 km y envía en lote cada 15 min al backend. | Frontend | Consume los servicios de F3-01. |
| **F3-04** | **Preoperacional Paso a Paso Offline (`/preoperacional`):** Rediseñar `preform.page` mostrando una pregunta a la vez (`PreguntaCard`) con botones táctiles grandes (Cumple / No cumple), autoguardado de borrador en IndexedDB y sincronización diferida ante pérdida de señal. Proteger la ruta con guard. | Frontend | Conecta con el catálogo de preguntas de Laravel. |
| **F3-05** | **División Modular de `datos.page.ts` (2.968 líneas):** Separar en dos pestañas independientes: `/documentos` (con `DocumentosFacade`, semáforo de vigencias y badge de alertas) y `/perfil` (índice limpio hacia `DatosPersonalesPage`, `TercerosPage` y `Capacitaciones`). Iconografía local SVG sin enlaces a 3SL. | Frontend | Tarea paralela en frontend. |
| **F3-06** | **Asistente de Registro en 6 Pasos (`/registro`):** Desmantelar el monolito de 3.444 líneas convirtiéndolo en un wizard modular de 6 etapas: *1. Identidad, 2. Conductor, 3. Vehículo, 4. Propietario/Tenedor, 5. Documentos, 6. Términos y firma*. Estado centralizado en `RegistroFacade` con borrador persistente. | Frontend | Reutiliza los componentes construidos en Fase 2. |

* **Criterios de Éxito ("Lista cuando..."):**
  1. Ningún archivo `.ts` ni `.html` del proyecto supera las 400 líneas.
  2. Un conductor puede realizar su Preoperacional, consultar su Manifiesto RNDC con QR ante una autoridad vial y fotografiar su Cumplido (POD) en zonas sin señal, sincronizándose en segundo plano al reconectar.
* **Hito de Validación en Ruta:** Acompañamiento en ruta nacional con zonas de sombra (ej. Bogotá – Buenaventura cruzando La Línea) evaluando legibilidad solar, persistencia offline y subida de cumplidos.

---

### 🚀 FASE 4 · Actualización de Stack (Angular 18 + Ionic 8 + Laravel 11), Pruebas y CI/CD
* **Duración estimada:** 2.5 semanas (Esfuerzo M)
* **Objetivo principal:** Actualizar Angular 15 a 18 LTS oficial e Ionic 8; migrar Laravel 9 a 11 (PHP 8.3); automatizar CI/CD con firma en la nube; e implantar suite de pruebas.
* **Reducción de dependencia de 3SL:** Auditoría de Cierre (0% de tráfico hacia 3SL).

#### Matriz de Tareas de Fase 4
| ID | Tarea | Responsable | Dependencias y Coordinación |
|---|---|---|---|
| **F4-01** | **Migración Secuencial a Angular 18 LTS e Ionic 8:** Ejecutar `ng update` secuencialmente (15 → 16 → 17 → 18) y TypeScript 5.x, logrando compatibilidad nativa plena con Capacitor 7. Migrar componentes a Standalone, adoptar Signals en los Facades y aplicar el nuevo control flow sintáctico (`@if`, `@for`). | Frontend | Congelar desarrollo de nuevas features durante la migración de versión. |
| **F4-02** | **Actualización de `Aldia-Backend` a Laravel 11 y PHP 8.3:** Actualizar el framework backend que alcanzó fin de ciclo de vida (EOL) para optimizar rendimiento de workers de Redis y aplicar parches de seguridad. | Backend (Aldia) | Ejecutar pruebas de regresión en endpoints administrativos existentes. |
| **F4-03** | **Suite de Pruebas Unitarias y E2E:** Reemplazar los 24 specs vacíos por pruebas unitarias automatizadas sobre Mappers, Facades, `OutboxService` e `image.ts`. Crear prueba End-to-End automatizada del flujo crítico: *Login OTP → Preoperacional → Enturnamiento → Subida de Cumplido*. | Frontend | Cobertura mínima del 75% en lógica de negocio. |
| **F4-04** | **Pipeline CI/CD Automatizado (Android + iOS):** Eliminar el script manual `deploy.sh`. Configurar en Codemagic / GitHub Actions la compilación y firma automatizada del APK/AAB desde secretos de CI para Google Play, a la par del pipeline existente de iOS hacia TestFlight. | DevOps / Tech Lead | Pruebas de compilación limpia en ramas protegidas. |

* **Criterios de Éxito ("Lista cuando..."):**
  1. `package.json` corre Angular 18 e Ionic 8 sin advertencias de dependencias (`0 peer dependency warnings`).
  2. Cada Pull Request ejecuta automáticamente linter, pruebas unitarias y build de producción en verde.
  3. Auditoría de red confirma cero peticiones hacia `api.3slogistica.com`.

---

## 6. Hoja de Ruta Táctica: Próximos 7 Días

Plan de arranque inmediato para iniciar la ejecución técnica sin demoras:

```
┌─────────────┬────────────────────────────────────────────────────────────────────────┐
│ DÍA         │ ACCIONES INMEDIATAS POR ROL                                            │
├─────────────┼────────────────────────────────────────────────────────────────────────┤
│ DÍA 1       │ DevOps / Tech Lead:                                                    │
│             │ • Ejecutar git rm --cached sobre mikey.keystore, google-services.json   │
│             │   y carpeta www/. Añadirlos a .gitignore y subir llave a Codemagic.    │
│             │ Frontend:                                                              │
│             │ • Eliminar console.log de credenciales (auth-facade.service.ts:28).     │
│             │ • Eliminar ?token= en URL de capacitaciones (user.service.ts:779).      │
│             │ • Reemplazar innerHTML por {{ }} en home.page.ts y turnos.page.ts.     │
├─────────────┼────────────────────────────────────────────────────────────────────────┤
│ DÍAS 1 a 3  │ Backend (Laravel):                                                     │
│             │ • Crear grupo de rutas /api/v2/driver/* con middleware auth:jwt.       │
│             │ • Implementar proxy para inyectar credenciales USUSEGINT/12249 a SIAT  │
│             │   y resolver peticiones al puerto 8000 por red privada.                │
├─────────────┼────────────────────────────────────────────────────────────────────────┤
│ DÍAS 2 y 3  │ Frontend:                                                              │
│             │ • Purgar 15 MB de dependencias: desinstalar face-api.js, @tensorflow,  │
│             │   cors, rxjs-compat, rxjs-observable, lodash y ngx-cookie-service.     │
│             │ • Borrar modelos de face-api en assets y limpiar imports de Node.      │
├─────────────┼────────────────────────────────────────────────────────────────────────┤
│ DÍAS 3 a 5  │ Backend + Frontend (Integración 2FA):                                  │
│             │ • Backend: Habilitar endpoints /api/v2/auth/request-otp y verify-otp   │
│             │   con persistencia temporal en Redis (5 min TTL).                      │
│             │ • Frontend: Integrar vista de código OTP en AuthFacadeService,         │
│             │   máscara AAA 000 en placa y campo numérico en cédula.                 │
├─────────────┼────────────────────────────────────────────────────────────────────────┤
│ DÍAS 5 y 6  │ Frontend:                                                              │
│             │ • Activar authInterceptor centralizado.                                │
│             │ • Enrutar llamadas críticas hacia /api/v2/* de Aldia-Backend.          │
│             │ • Compilar APK y verificar con grep que no existan credenciales.       │
├─────────────┼────────────────────────────────────────────────────────────────────────┤
│ DÍA 7       │ Equipo Completo (Cierre de Seguridad):                                 │
│             │ • Publicar versión de seguridad con bandera de actualización forzada. │
│             │ • Rotar en servidores clave de USUSEGINT, client_secret y Maps API Key.│
└─────────────┴────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Anexo Técnico: Especificación de Schemas y Protocolos

### 7.1 Esquema de Base de Datos Local IndexedDB (Dexie.js)
```typescript
// core/offline/database.ts
import Dexie, { Table } from 'dexie';

export interface CacheEntry {
  key: string;            // 'perfil' | 'turno' | 'documentos' | 'manifiesto'
  data: any;
  updatedAt: number;      // timestamp Unix
}

export interface OutboxItem {
  id?: number;
  url: string;            // ej: '/api/v2/documentos'
  method: 'POST' | 'PUT';
  headers: Record<string, string>;
  payload: any;           // JSON serializado o FormData estructurado
  coords?: { lat: number; lng: number };
  createdAt: number;
  attempts: number;
}

export interface GpsLogPoint {
  id?: number;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  timestamp: number;
  accuracy: number;
  batteryLevel: number;
  synced: number;         // 0 = pendiente, 1 = sincronizado
}

export class AldiaDatabase extends Dexie {
  cache_store!: Table<CacheEntry, string>;
  outbox_queue!: Table<OutboxItem, number>;
  gps_logs!: Table<GpsLogPoint, number>;

  constructor() {
    super('ViajaConAldiaDB');
    this.version(1).stores({
      cache_store: 'key, updatedAt',
      outbox_queue: '++id, createdAt, attempts',
      gps_logs: '++id, timestamp, synced'
    });
  }
}

export const db = new AldiaDatabase();
```

---

### 7.2 Esquema de Carga de GPS por Lotes (`POST /api/v2/gps/batch`)
```json
{
  "conductor_id": 1023456789,
  "placa": "SXT482",
  "manifiesto_id": "MEC-2026-98124",
  "puntos": [
    {
      "lat": 4.60971,
      "lng": -74.08175,
      "speed": 62.5,
      "heading": 180.2,
      "accuracy": 12.0,
      "battery": 88,
      "recorded_at": "2026-10-23T14:32:00Z"
    },
    {
      "lat": 4.59821,
      "lng": -74.09210,
      "speed": 58.0,
      "heading": 182.0,
      "accuracy": 10.5,
      "battery": 87,
      "recorded_at": "2026-10-23T14:37:00Z"
    }
  ]
}
```

---

### 7.3 Pipeline de Compresión WebP en Cliente (`shared/utils/image.ts`)
```typescript
// shared/utils/image.ts
export async function compressToWebP(blob: Blob, maxWidth = 1280, quality = 0.75): Promise<File> {
  const bitmap = await createImageBitmap(blob);
  let { width, height } = bitmap;

  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo inicializar contexto 2D');

  ctx.drawImage(bitmap, 0, 0, width, height);

  // Verificación de compatibilidad WebP con fallback a JPEG
  const format = canvas.toDataURL('image/webp').startsWith('data:image/webp')
    ? 'image/webp'
    : 'image/jpeg';

  const compressedBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      b => (b ? resolve(b) : reject(new Error('Fallo al comprimir imagen'))),
      format,
      quality
    );
  });

  const extension = format === 'image/webp' ? 'webp' : 'jpg';
  return new File([compressedBlob], `pod_${Date.now()}.${extension}`, { type: format });
}
```

---

### 7.4 Formato Estándar de Respuesta API (`ApiResponse<T>`)
```typescript
// core/models/api-response.model.ts
export interface ApiResponse<T> {
  status: 'success' | 'error';
  code: string;           // '200', '201', '400', '401', '404', '500'
  message: string;
  data: T;
  timestamp: string;
}
```
