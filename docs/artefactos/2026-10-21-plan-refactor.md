# 📋 Diagnóstico Técnico Integral: Sistema "Viaja Con Aldia"
> **Versión:** 2.0 — Diagnóstico Código + Contexto Operativo Logístico  
> **Generado por:** Antigravity — Arquitecto de Software Senior  
> **Fecha:** 21 de Octubre de 2026  
> **Fuentes analizadas:** `Viaja-Con-Aldia` (Angular 15 + Ionic + Capacitor), `Aldia-Backend` (Laravel 9), `manual_de_arquitectura_y_contexto_logístico_viaja_con_aldia.md`  
> **Objetivo:** Mapa técnico y operativo para la refactorización del sistema de conductores

---

## Contexto Operativo: Por Qué Este Sistema Es Diferente

Antes de entrar en el código, es fundamental entender que **Viaja Con Aldia no es una app de delivery urbano**. Es una plataforma de misión crítica para conductores de tractocamión en carreteras nacionales colombianas. Su usuario opera bajo:

- **Dispositivos:** Teléfonos Android de gama media/baja con planes de datos prepago.
- **Conectividad:** Zonas de sombra real (La Línea, Cañón del Chicamocha, Magdalena Medio, Loboguerrero) con cobertura 2G intermitente o nula.
- **Marco legal:** Resolución 40595/2022 (PESV), Resolución 20223040045515/2022 (RNDC), normativas BASC/OEA, pisos tarifarios SICETAC.
- **Consecuencias de fallo:** Si la app no funciona durante el viaje, el conductor puede no cobrar su saldo (30-40% del flete) y Aldia no puede facturar al cliente generador de carga.

### El Ciclo de Vida de un Viaje (Cada Pantalla Responde a una Etapa Legal)

```
[1. Habilitación] ➔ [2. Enturnamiento] ➔ [3. Preoperacional] ➔ [4. Despacho RNDC] ➔ [5. Ruta/Tráfico] ➔ [6. Cumplido POD]
  (Hojas de Vida)   (Geocerca Regional)    (Norma PESV)         (Manifiesto/Remesa)   (Puestos Control)   (Cobro y Factura)
```

---

## 1. Arquitectura Frontend

### 1.1 Stack Tecnológico y Versiones

| Tecnología | Versión Declarada | Estado |
|---|---|---|
| **Angular** | `^15.0.0` | 🔴 EOL. La versión LTS activa es Angular 18/19. |
| **Ionic Framework** | `^6.1.9` | 🟡 Funcional pero desactualizado. Ionic 8 requiere Angular 16+. |
| **Capacitor (Core/Android/iOS)** | `^7.4.4` | 🔴 **Incompatibilidad crítica**: Capacitor 7 requiere Angular 17+ y TypeScript 5.x. |
| **TypeScript** | `~4.8.4` | 🟡 Alineado con Angular 15. Angular 18+ usa TS 5.x. |
| **RxJS** | `^7.8.1` | ✅ Versión correcta. |
| `rxjs-compat` | `^6.6.7` | 🔴 Librería de compatibilidad legacy innecesaria. |
| `rxjs-observable` | `^0.0.7` | 🔴 Paquete abandonado, sin mantenimiento. |
| `zone.js` | `~0.11.4` | 🟡 Angular 18+ usa `~0.14.x`. |

> [!WARNING]
> La combinación **Angular 15 + Capacitor 7** es la inconsistencia más grave del proyecto. Capacitor 7 requiere mínimo Angular 17. Las dependencias fueron actualizadas de forma parcial, dejando el sistema en un estado híbrido frágil que puede romper la compilación en Android Studio (Gradle) o Xcode en cualquier momento.

### 1.2 Dependencias de Negocio Relevantes

| Paquete | Propósito | Riesgo |
|---|---|---|
| `@capacitor/geolocation ^7.1.7` | GPS nativo vía Capacitor | Core para validación de enturnamiento |
| `@awesome-cordova-plugins/geolocation ^6.3.0` | GPS vía Cordova (legacy) | 🟡 **Duplicado y obsoleto.** Coexiste con el plugin de Capacitor. |
| `@capacitor/camera ^7.0.3` | Cámara para POD (fotos de cumplidos) | Core para evidencia de entrega |
| `@capacitor/network ^7.0.3` | Detección de conectividad | Usado en `AppComponent`, pero solo para mostrar un mensaje. |
| `@capacitor/preferences ^7.0.3` | Almacenamiento clave-valor | Solo usado para caché de lista de fotos en `PhotoService`. |
| `@capacitor/filesystem ^7.1.6` | Sistema de archivos | Para guardar imágenes temporalmente antes de subir. |
| `@tensorflow/tfjs ^3.9.0` + `face-api.js ^0.22.2` | ML / Reconocimiento facial | 🔴 **+5MB en el bundle.** Con `PreloadAllModules`, el teléfono descarga modelos matemáticos al iniciar. Consume datos y batería del conductor. |
| `@syncfusion/ej2-angular-dropdowns ^23.2.6` | Dropdowns comerciales | 🟡 Dependencia con licenciamiento comercial. |
| `ngx-image-cropper ^7.2.1` | Recorte de imágenes | Para procesamiento de fotos POD. |
| `@capacitor-firebase/messaging ^7.5.0` | Push Notifications (FCM) | Implementado en `home.page.ts`. |

---

### 1.3 Estructura de Módulos y Enrutamiento

```
src/app/
├── api/                     # Servicios HTTP (2ª generación, más modernos)
│   ├── geodata.service.ts   ← GPS + Zonas + Creación de Turnos
│   ├── global.service.ts    ← Wrapper HTTP genérico (GET/POST con timeout 15s)
│   ├── turnos.service.ts    ← Orquestador de flujo de turnos
│   ├── notificaciones.service.ts
│   ├── face-api.service.ts  ← Reconocimiento facial (uso no verificado en flujo activo)
│   └── video-player.service.ts
├── core/
│   ├── models/              # Modelos de datos
│   └── services/            # Servicios core (1ª generación, más antiguos)
│       ├── auth.service.ts  ← Autenticación JWT
│       ├── user.service.ts  ← Datos conductor/vehículo (21KB — el más grande)
│       ├── registro.service.ts ← Registro de terceros/vehículos
│       ├── photo.service.ts ← Cámara + procesamiento + subida de imágenes
│       ├── storage.service.ts ← Wrapper de localStorage
│       ├── alert.service.ts
│       └── local-notification.service.ts
├── features/                # Módulos de funcionalidad
│   ├── home/                ← Dashboard principal (698 líneas)
│   ├── login/               ← Autenticación
│   ├── registro/            ← Vinculación conductor/vehículo (3,445 líneas — MONOLITO)
│   ├── turnos/              ← Enturnamiento + GPS (411 líneas)
│   ├── datos/               ← Datos personales del conductor
│   ├── preform/             ← Formulario preoperacional PESV
│   ├── vehiculo/            ← Gestión de vehículos (sin lazy loading)
│   └── dashboard/           ← Componente de pruebas (sin lazy loading)
├── guard/
│   └── login.guard.ts       ← Guard superficial (solo verifica existencia del token)
└── directives/
    └── tipo-documento.directive.ts
```

**Configuración de enrutamiento (`app-routing.module.ts`):**

| Ruta | Lazy Loading | Guard | Nota |
|---|---|---|---|
| `/home` | ✅ Sí | `LoginGuard` | Dashboard principal |
| `/login` | ✅ Sí | — | — |
| `/registro` | ✅ Sí | — | Acceso sin auth (conductor nuevo) |
| `/turnos` | ✅ Sí | `LoginGuard` | — |
| `/datos` | ✅ Sí | `LoginGuard` | — |
| `/preform` | ✅ Sí | — | Sin guard (¿intencional?) |
| `/pruebas` | ❌ **No** | `LoginGuard` | `DashboardComponent` en bundle inicial |
| `/vehiculos` | ❌ **No** | `LoginGuard` | `VehiculoComponent` en bundle inicial |

**Estrategia de Preload:** `PreloadAllModules` — Precarga **todos** los módulos en background al iniciar. En conexiones móviles lentas o prepago, consume datos del conductor innecesariamente y descarga librerías ML pesadas que quizás no se usen.

---

### 1.4 Patrones de Gestión de Estado

**No se usa NgRx ni ninguna librería de estado formal.** El estado se gestiona mediante tres mecanismos:

1. **`localStorage` como estado global persistente** — Mecanismo principal:
   ```typescript
   localStorage.setItem("token", ...)     // JWT del conductor
   localStorage.setItem("placa", ...)     // Placa del vehículo activo
   localStorage.setItem("conductor", ...) // Cédula del conductor
   ```

2. **`BehaviorSubject` / `Subject` en servicios** (Observable Service Pattern):
   - `AuthService`: `BehaviorSubject<boolean>` para estado de login.
   - `UserService`: `Subject` para notificar cambios de sesión.

3. **Estado local mutable con tipado `any`** en componentes:
   - `RegistroPage`: más de 50 propiedades `any` en un componente de 3,445 líneas.
   - `HomePage`: ~30 propiedades de estado sin modelo de datos centralizado.

> [!NOTE]
> El `StorageService` encapsula `localStorage` correctamente, pero `UserService` y `AuthService` acceden a `localStorage` **directamente** en varios métodos (`localStorage.getItem("conductor")`, `localStorage.setItem("token", ...)`), rompiendo la abstracción.

---

## 2. Integración y Contratos de API

### 2.1 El "Espagueti" de Integraciones (4 Orígenes de Datos)

La app móvil no se comunica con un único backend. Actúa como integrador directo contra cuatro servidores con distintos protocolos y esquemas de seguridad:

```
┌────────────────────────────────────────────────────────────────────────────┐
│                   FRONTEND: Viaja-Con-Aldia (Angular 15)                   │
│             [Sin HttpInterceptor · Estado en localStorage]                 │
└──────┬─────────────────────┬──────────────────────┬────────────────────────┘
       │                     │                      │
       ▼                     ▼                      ▼
┌─────────────────┐  ┌──────────────────┐  ┌─────────────────────────────────┐
│ API 3S Logística│  │ Aldia-Backend    │  │ Sistema Legado SIAT (ERP/TMS)   │
│ api.3slogistica │  │ api.aldialog...  │  │ 1. siat.aldialogistica.net (PHP)│
│      .com       │  │ (Laravel 9/PHP8) │  │ 2. http://siat...:8000 (Sin SSL)│
├─────────────────┤  ├──────────────────┤  ├─────────────────────────────────┤
│ Auth: JWT Bearer│  │ Auth: Mixto      │  │ Auth: Headers en texto plano    │
│ • Login driver  │  │ • JWT / ClientID │  │ • user: 'USUSEGINT'             │
│ • Registro HV   │  │ • Basic Hardcoded│  │ • password: '12249'             │
│ • Zonas GPS     │  │ • Preoperacional │  │ • Enturnamiento PHP directo      │
│ • Firma Contrato│  │ • Subida Fotos   │  └─────────────────────────────────┘
└─────────────────┘  └──────────────────┘
```

### 2.2 Mapa Completo de Servicios Angular → Endpoints

#### 🔐 `AuthService` — Autenticación
| Método | HTTP | Endpoint | Descripción |
|---|---|---|---|
| `login()` | POST | `https://api.3slogistica.com/api/auth/driver` | Login del conductor (app móvil) |
| `tokenValidate()` | POST | `https://api.3slogistica.com/api/auth/token` | Validar token activo |
| `delToken()` | DELETE | `https://api.3slogistica.com/api/auth/token` | Logout / revocar token |
| `getUser3sL()` | GET | `https://api.3slogistica.com/api/ingresos` | Datos del conductor por cédula+placa |

#### 👤 `UserService` — Datos del Conductor/Vehículo
| Método | HTTP | Endpoint | Descripción |
|---|---|---|---|
| `login()` | POST | `https://api.aldialogistica.com/api/auth/login-external` | Login externo (legado) |
| `getUser()` | GET | `https://api.aldialogistica.com/api/datos/vehiculos` | Info vehículo por placa |
| `getConductor()` | GET | `https://api.aldialogistica.com/api/datos/terceros` | Info conductor por documento |
| `getTercero3sL()` | GET | `https://api.3slogistica.com/api/ingresos` | Datos consolidados conductor |
| `getFechas()` | GET | `https://api.3slogistica.com/api/document/validate` | Validar vencimiento documentos |
| `laodTokenMobile()` | POST | `https://api.3slogistica.com/api/load/token` | Registrar token FCM push |
| `nevoTurnoApi()` | POST | `https://siat.aldialogistica.net/aldia/recursos/operacion_enturnamiento/index.php` | ⚠️ Endpoint PHP legacy — script SIAT directo |
| `getTurnoUser()` | GET | `https://api.aldialogistica.com/api/enturnamiento` | Consultar turno activo |
| `registroApiAldia()` | POST | `https://api.3slogistica.com/api/ingresos` | Registro/actualización conductor |
| `cargaDocumentos()` | POST | `https://api.aldialogistica.com/api/documento` | Subir documentos en Base64 |
| `getFirma()` | GET | `https://api.3slogistica.com/api/firma` | Consultar firma de contrato |
| `firmaContrato()` | POST | `https://api.3slogistica.com/api/firma` | Firmar contrato de vinculación |
| `postPreoperacionalData()` | POST | `https://api.aldialogistica.com/api/tercero/preoperacional` | Guardar preoperacional PESV |
| `validateCap()` | GET | `https://api.3slogistica.com/api/capacitaciones` | Verificar capacitaciones del conductor |

#### 📍 `GeodataService` — Geolocalización y Enturnamiento
| Método | HTTP | Endpoint | Descripción |
|---|---|---|---|
| `getCityByLatLon()` | GET | `https://api.3slogistica.com/api/zonas/gps` | Geocodificación inversa (lat/lon → regional) |
| `getGeoZona()` | GET | `https://api.3slogistica.com/api/zonas` | Consultar zonas por nombre |
| `turnoCreacion()` | POST | `https://api.aldialogistica.com/api/enturnamiento` | Crear turno desde geolocalización |
| `tokenAcceso()` | POST | `http://siat.aldialogistica.com:8000/api/auth/login` | ⚠️ HTTP sin SSL (falla en Android 9+) |

#### 📝 `RegistroService` — Habilitación de Terceros y Vehículos
| Método | HTTP | Endpoint | Descripción |
|---|---|---|---|
| `getDataCode()` | GET | `https://api.3slogistica.com/api/vehiculo/validation` | Validar código vehículo |
| `sendCode()` | POST | `https://api.3slogistica.com/api/vehiculo/validation` | Enviar código validación |
| `validateCode()` | PUT | `https://api.3slogistica.com/api/vehiculo/validation` | Confirmar código |
| `sendDataTercero()` | POST | `https://api.3slogistica.com/api/tercero` | Crear nuevo conductor |
| `sendDataVehiculo()` | POST | `https://api.3slogistica.com/api/vehiculo` | Registrar vehículo |
| `getDataTercero()` | GET | `https://api.3slogistica.com/api/tercero` | Consultar datos conductor |
| `getDataVehiculo()` | GET | `https://api.3slogistica.com/api/vehiculo` | Consultar datos vehículo |
| `addVehiclexDriver()` | POST | `https://api.3slogistica.com/api/mis-vehiculos` | Asociar vehículo a conductor |
| `getSatelital()` | GET | `https://api.3slogistica.com/api/satelital` | Catálogo empresas GPS satelital |
| `getClasevehiculo()` | GET | `https://api.3slogistica.com/api/clasevehiculo` | Catálogo clases de vehículo |
| `getMarcas()` | GET | `https://api.3slogistica.com/api/marcavehiculo` | Catálogo marcas |
| `getCarrocerias()` | GET | `https://api.3slogistica.com/api/carroceriavehiculo` | Catálogo carrocerías |
| `getLineas()` | GET | `https://api.3slogistica.com/api/claselinea` | Catálogo líneas |
| `getColores()` | GET | `https://api.3slogistica.com/api/color` | Catálogo colores |
| `getParent()` | GET | `https://api.3slogistica.com/api/parentes` | Catálogo parentescos |

#### 📸 `PhotoService` — Documentos e Imágenes POD
| Método | HTTP | Endpoint | Descripción |
|---|---|---|---|
| `getFotoTercero()` | GET | `https://api.aldialogistica.com/api/documento` | Obtener una foto específica |
| `getFotosTercero()` | GET | `https://api.aldialogistica.com/api/documento` | Obtener múltiples fotos |

---

### 2.3 Autenticación y Autorización

**Mecanismo principal:** JWT gestionado por `tymon/jwt-auth` en el backend.

**Flujo de autenticación del conductor:**
1. El conductor ingresa `cédula` + `placa` del camión.
2. `UserService.loginUser()` → `POST /api/auth/driver` → recibe JWT.
3. Token guardado en `localStorage('token')`.
4. Peticiones subsecuentes incluyen `Authorization: Bearer <token>` construidos **manualmente** en cada servicio, uno por uno.

**Guard de rutas (`login.guard.ts`):**
```typescript
canActivate(...) {
  const token_access = localStorage.getItem('token'); // Solo verifica existencia
  return this.redirect(token_access);                 // No valida expiración ni firma
}
```

> [!WARNING]
> **Fallos críticos de autenticación:**
> 1. **Sin HTTP Interceptor**: No existe `HttpInterceptor` alguno. Los headers se construyen manualmente en cada servicio (~200 líneas de código duplicado). Imposible aplicar lógica global de token refresh o manejo uniforme de errores `401`.
> 2. **Guard superficial**: Solo verifica que el token no sea `null`. Un token expirado permite acceder a vistas protegidas hasta que una llamada API falle.
> 3. **Sin token refresh**: No hay lógica de renovación automática. El usuario simplemente recibe un error `401` en algún momento de su sesión.

---

## 3. Las 5 Bombas de Tiempo

### 💣 Bomba 1 — CERO Estrategia Offline en un País Montañoso

**Diagnóstico en código (`AppComponent`):**
```typescript
chageNetWorkStatus(status: any) {
  this.statusNet = status?.connected;
  if (!this.statusNet) {
    this.model = { title: 'Sin Conexion', ... } // Solo muestra un mensaje
  } else {
    this.getDataUser(); // Recarga datos al reconectar
  }
}
```

**Lo que NO existe:**
- ❌ `ngsw-config.json` — Sin Service Worker de ningún tipo.
- ❌ IndexedDB — Sin persistencia estructurada de datos.
- ❌ Background Sync API — Sin cola de reintento al recuperar señal.
- ❌ Outbox Pattern — Ninguna operación se encola localmente.

**Realidad operativa en Colombia:**
Corredores logísticos vitales como **La Línea** (Cordillera Central), **Alto de Minas**, **Cañón del Chicamocha**, **Vía al Llano**, **Loboguerrero** (vía a Buenaventura) y el **Magdalena Medio** tienen zonas de sombra absoluta o cobertura 2G intermitente. Muchos CEDIs y plantas industriales están en bodegas blindadas donde no entra señal.

**Consecuencia directa:** Si el conductor llena el formulario preoperacional (exigido por ley, Res. 40595/PESV), intenta subir la foto de un cumplido en una bodega sin señal o reporta una novedad en vía, la petición HTTP falla silenciosamente — **sin reintento** — y pierde todo el trabajo realizado.

> [!CAUTION]
> Este es el **Punto #1 de la refactorización**. Sin estrategia offline, la app es completamente inoperativa en la mitad del territorio logístico colombiano.

---

### 💣 Bomba 2 — Imágenes en Base64 que Asfixian la Red y la Facturación

**Flujo actual de carga de imágenes (`PhotoService`):**
1. `Camera.getPhoto()` con `quality: 100` + `CameraResultType.Uri`
2. `fetch(photo.webPath)` → Blob → `FileReader.readAsDataURL()` → **Base64 string**
3. `Filesystem.writeFile()` a `Directory.Data`
4. Envío como string Base64 dentro de un payload **JSON** a `POST /api/documento`

**El problema matemático:**
$$\text{Tamaño}_{\text{Base64}} \approx \frac{4}{3} \times \text{Tamaño}_{\text{Binario}} \implies +33\%\ \text{de overhead}$$

Una foto de 2MB binario se convierte en un JSON de ~2.7MB. Además, serializar y parsear un JSON de esta magnitud bloquea el hilo principal de JavaScript en teléfonos de gama baja.

**Consecuencia operativa:** En una red HSPA+ débil o EDGE en carretera, transmitir un JSON de 2.7-3MB supera fácilmente el timeout de 15 segundos configurado en `GlobalService`. La subida aborta.

**Impacto financiero directo:**
> Sin la foto **legible** del cumplido, el conductor no puede cobrar el saldo de su viaje (30-40% del flete) y Aldia no puede facturar al generador de carga. Una subida fallida bloquea la cadena de cobro.

---

### 💣 Bomba 3 — GPS "One-Shot" vs. Control de Tráfico y Tiempos RNDC

**Diagnóstico en código (`turnos.page.ts` + `geodata.service.ts`):**

```typescript
// TurnosPage.ngOnInit()
await this.getLocation();

// GeodataService.getCityFromCurrentLocation()
const resp = await Geolocation.getCurrentPosition(); // ← UNA sola lectura puntual
const data = await this.getCityByLatLon(lat, lon, token);
// Retorna solo: "REGIONAL BOGOTA" — sin precisión de municipio
```

**Lo que no existe:**
- ❌ `watchPosition()` — Sin seguimiento continuo.
- ❌ WebSockets — Sin canal de streaming de posición.
- ❌ Batching de coordenadas — Sin acumulación y envío por lotes.
- ❌ Geocercas (geofencing) — La resolución máxima es "REGIONAL X", no un municipio.
- ❌ Background Geolocation — Sin tracking cuando la app está minimizada.
- ⚠️ Dos plugins GPS simultáneos: `@capacitor/geolocation` (activo) + `@awesome-cordova-plugins/geolocation` (obsoleto, declarado en `app.module.ts`).

**Consecuencias operativas:**
1. **Seguridad / Piratería terrestre:** Cuando el GPS satelital del camión falla o tarda en integrarse, la app móvil es el respaldo de la Torre de Control. Sin tracking continuo, Aldia no sabe si el conductor se detuvo en una zona roja o se desvió de la ruta autorizada.
2. **Cumplimiento RNDC:** La ley exige registrar la hora exacta en que el camión llega al polígono del cliente para cargar o descargar. Sin geocercas ni timestamps offline, Aldia pierde la trazabilidad de los tiempos de espera en planta (vital para cobrar penalidades por demoras o *lucro cesante*).
3. **Fraude en enturnamiento:** El GPS actual solo valida la ciudad al momento de crear el turno. Un conductor podría manipular la geolocalización del teléfono.

---

### 💣 Bomba 4 — Vulnerabilidades Críticas de Seguridad

**Credenciales hardcodeadas en el código fuente:**
```typescript
// En UserService, PhotoService, RegistroService, GeodataService
'user': 'USUSEGINT',
'password': '12249'
```

**Secretos expuestos en `environment.ts`:**
```typescript
export const environment = {
  maps: { apikey: 'API_KEY_AQUI' }, // ← Google Maps API Key
  aldia: {
    client_id: '6195793E9674880F',
    client_secret: 'CLIENT_SECRET_AQUI' // ← Secret expuesto
  }
};
```

**Comunicación sin cifrado:**
```typescript
// geodata.service.ts
return this.http.post("http://siat.aldialogistica.com:8000/api/auth/login", ...)
// ↑ HTTP sin SSL. Falla en Android 9+ por cleartextTrafficPermitted="false"
```

> [!CAUTION]
> **Consecuencia operativa — Riesgo BASC/OEA:**
> Un archivo `.apk` de Android compilado con Capacitor es simplemente un archivo comprimido que contiene el bundle JavaScript (`main.js`) en `assets/public`. Cualquier persona puede descompilar el APK en menos de 2 minutos, extraer `USUSEGINT / 12249` y el `client_secret`, y consultar o inyectar documentos y terceros directamente en `api.aldialogistica.com` y en el ERP SIAT — comprometiendo la certificación de seguridad **BASC** de la compañía.

---

### 💣 Bomba 5 — Inestabilidad del Core y Consumo Agresivo de Recursos

#### 5a. Incompatibilidad Angular 15 + Capacitor 7

| Requerimiento | Exigido por Capacitor 7 | Estado Actual |
|---|---|---|
| Angular | 17+ | **Angular 15** 🔴 |
| TypeScript | 5.x | **TypeScript 4.8** 🔴 |
| zone.js | ~0.14.x | **~0.11.4** 🟡 |

El proyecto está en un estado híbrido frágil que puede romper la compilación en Android Studio o Xcode en cualquier momento.

#### 5b. Memory Leaks — Cero llamadas a `unsubscribe()`

```bash
# Resultado de búsqueda en todo el código fuente:
grep "unsubscribe" src/  → 0 resultados
```

Cada vez que el conductor entra y sale de `HomePage` o `TurnosPage`, los `Observable` quedan vivos en memoria duplicando ejecuciones. El listener de `@capacitor/network` en `AppComponent` tiene un `remove()` correcto, pero **ninguna** suscripción a servicios Angular se limpia en `ngOnDestroy`.

#### 5c. Librerías Pesadas + PreloadAllModules

Con `PreloadAllModules` activo y `@tensorflow/tfjs` + `face-api.js` (+5MB de modelos matemáticos), el teléfono del conductor descarga y parsea megabytes adicionales al abrir la app por primera vez, devorando su plan de datos prepago y la batería antes de salir de casa.

---

## 4. La Gran Brecha Funcional: El Despacho RNDC Huérfano

> [!IMPORTANT]
> El hallazgo más revelador al cruzar el frontend con `Aldia-Backend` es que **el backend ya posee los endpoints construidos para la operación de transporte, pero la app móvil no consume ninguno**.

**Lo que el backend tiene y la app ignora:**

| Endpoint Backend | Funcionalidad | Impacto para el conductor |
|---|---|---|
| `GET/POST /api/remesas` | Consulta y gestión de remesas de carga | ❌ El conductor no puede ver sus remesas (direcciones de entrega, contacto del destinatario). |
| `GET /api/manifiestos` | Manifiesto Electrónico de Carga (MEC) | ❌ No puede mostrar el código QR reglamentario a la Policía de Carreteras (DITRA) desde la app. |
| `PUT /api/actualizaentrega` | Estados del viaje (Cargado, En tránsito, Cumplido) | ❌ No puede reportar hitos del viaje vinculados a su remesa/manifiesto. |
| `POST /api/solicitudServicio/cambioEstado` | Novedades en vía | ❌ Sin canal estructurado para reportar accidentes, derrumbes o retenciones. |

La app solo sirve **antes del viaje**. Abandona completamente al conductor desde el momento en que sale de la agencia:
- ❌ No puede consultar sus remesas asignadas.
- ❌ No puede ver ni exhibir su Manifiesto Electrónico de Carga.
- ❌ No puede reportar estados de entrega vinculados a documentos reales.
- ❌ No puede gestionar novedades en vía con trazabilidad documental.

---

## 5. Análisis del Backend (Aldia-Backend)

### 5.1 Stack y Versiones

| Tecnología | Versión | Estado |
|---|---|---|
| **PHP** | `^8.0.2` | 🟡 Funcional. PHP 8.3 es el activo actual. |
| **Laravel** | `^9.19` | 🔴 EOL en Agosto 2024. Migrar a Laravel 11. |
| **JWT Auth** | `^2.1` (tymon) | ✅ Estable para Laravel 9. |
| **Redis** | `predis/predis ^2.0` | ✅ Disponible. Clave para implementar colas en la refactorización. |
| **Laravel Telescope** | `^5.2` | 🟡 Deshabilitado por defecto (`dont-discover`). Útil para debugging. |
| **DomPDF + QR/Barcode** | Instalados | ✅ Listo para servir PDFs de Manifiestos y códigos QR al conductor. |

### 5.2 Esquema de Seguridad del Backend

| Mecanismo | Descripción | Rutas protegidas |
|---|---|---|
| `auth.jwt` | JWT de tymon — estándar en la app | Mayoría de rutas de negocio |
| `validate.client` | `client_id` + `client_secret` del `environment.ts` | Webhooks, preoperacional externo |
| `user/password` header | Credenciales hardcodeadas en frontend | Endpoints de datos legacy (SIAT) |
| `whatsapp.signature` | HMAC del body con App Secret | Webhook de Meta/WhatsApp |
| `turnstile` | Cloudflare Turnstile (captcha) | Rastreo público, pagos |
| `permission:` | Sistema de roles/permisos custom | Funciones administrativas |

### 5.3 Endpoints Backend Directamente Relacionados con la App Móvil

**Autenticación (sin `auth.jwt`):**
- `POST /api/auth/driver` → Login del conductor
- `POST /api/auth/refresh` → Refresh de token

**GPS y Logging (con `auth.jwt`):**
- `GET /api/logs/gps` → Historial GPS
- `POST /api/logs/gps` → Registrar evento GPS (subutilizado — solo entrada/salida manual)

**Preoperacional:**
- `POST /api/tercero/preoperacional/nuevo` → Crear (con `auth.jwt`)
- `GET /api/tercero/preoperacional/ultimo` → Último registro (con `validate.client`)
- `GET /api/tercero/preoperacional/preguntas` → Cuestionario dinámico

**Datos del conductor (autenticación legada `user/password`):**
- `GET /api/datos/vehiculos` → Vehículos por placa
- `GET /api/datos/terceros` → Conductores por documento
- `GET /api/enturnamiento` → Turno activo
- `POST /api/enturnamiento` → Crear turno
- `GET /api/documento` → Recuperar imágenes
- `POST /api/documento` → Subir imágenes (Base64, sin JWT)

**Tracking externo (con `validate.client` + `restrict.ip`):**
- `PUT /api/actualizaentrega` → Webhook de estados de entrega desde aliados

---

## 6. Deuda Técnica Catalogada

### 🔴 Crítico — Bloquean Seguridad u Operación

| ID | Problema | Ubicación | Impacto |
|---|---|---|---|
| **DT-01** | Credenciales hardcodeadas: `USUSEGINT / 12249` | `UserService`, `PhotoService`, `RegistroService`, `GeodataService` | Compromiso total de credenciales en el APK compilado. Riesgo certificación BASC. |
| **DT-02** | Google Maps API Key expuesta en `environment.ts` | `environment.ts` | Uso no autorizado y cargos al proyecto. |
| **DT-03** | `client_secret` OAuth expuesto en `environment.ts` | `environment.ts` | Igual que DT-02. Acceso no autorizado a Aldia-Backend. |
| **DT-04** | Sin `HttpInterceptor` — headers manuales en cada servicio | Todos los servicios | ~200 líneas duplicadas. Sin refresh token global ni manejo centralizado de 401. |
| **DT-05** | Incompatibilidad Angular 15 + Capacitor 7 | `package.json` | Build nativo puede fallar. Estado frágil del sistema. |
| **DT-06** | Sin estrategia offline (cero Service Worker, IndexedDB, Outbox) | Toda la app | App inoperativa en zonas de sombra colombianas (La Línea, Magdalena Medio, etc.). |
| **DT-07** | Guard superficial — no valida expiración del JWT | `login.guard.ts` | Token expirado permite navegar hasta que una llamada API falla sin control. |
| **DT-08** | HTTP sin SSL: `http://siat.aldialogistica.com:8000/` | `geodata.service.ts` | Comunicación no cifrada. Falla en Android 9+ por `cleartextTrafficPermitted`. |

### 🟡 Alto — Afectan Performance o Mantenibilidad

| ID | Problema | Ubicación | Impacto |
|---|---|---|---|
| **DT-09** | Imágenes POD enviadas como Base64 en JSON | `UserService.cargaDocumentos()` | +33% de overhead. Timeout en redes lentas. Bloquea facturación. |
| **DT-10** | GPS solo one-shot, sin tracking continuo | `turnos.page.ts`, `geodata.service.ts` | Sin trazabilidad durante el viaje. Riesgo de seguridad y pérdida de tiempos RNDC. |
| **DT-11** | Memory leaks — cero `unsubscribe()` en todo el código | `AppComponent`, `HomePage`, `TurnosPage` | Acumulación de listeners activos en cada navegación. Degrada la app con el tiempo. |
| **DT-12** | `toPromise()` deprecado (RxJS 7) | Todos los servicios | Usar `lastValueFrom()` o `firstValueFrom()`. |
| **DT-13** | Tipado `any` masivo — +50 propiedades en `RegistroPage` | `registro.page.ts`, `home.page.ts` | Elimina beneficios de TypeScript. Hace el código imposible de mantener. |
| **DT-14** | `PreloadAllModules` + librerías ML pesadas (+5MB) | `app-routing.module.ts`, `package.json` | Descarga masiva al inicio. Consume datos y batería del conductor. |
| **DT-15** | Tres dominios de API sin punto centralizado | Todos los servicios | Dificulta mantenimiento, CORS, rotación de credenciales y monitoreo. |
| **DT-16** | `rxjs-compat` + `rxjs-observable` en dependencies | `package.json` | Librerías legacy innecesarias que inflan el bundle. |
| **DT-17** | `location.href` en lugar de `Router.navigate()` | `AuthService`, `TurnosPage`, `TurnosService` | Fuerza recarga completa de la app, destruyendo el estado de la SPA. |

### 🟢 Bajo — Mejoras de Código

| ID | Problema |
|---|---|
| **DT-18** | `RegistroPage` monolítica: 3,445 líneas. Debe dividirse en 5 sub-componentes. |
| **DT-19** | Grandes bloques de código comentado en `registro.page.ts` (líneas 590-660). |
| **DT-20** | `console.log()` en producción en `home.page.ts`, `registro.page.ts`, `turnos.page.ts`. |
| **DT-21** | `import { log } from 'console'` en código Angular (`home.page.ts:4`, `turnos.page.ts:12`). Módulo de Node.js, no del browser. |
| **DT-22** | `import * as e from 'cors'` en `registro.page.ts:12`. Módulo de Node.js/Express sin sentido en el cliente. |
| **DT-23** | Términos y condiciones construidos con `document.createElement()` en `RegistroService`. Debe ser un componente con template. |

---

## 7. Arquitectura Objetivo (To-Be)

### 7.1 Patrón BFF (Backend For Frontend)

La app móvil **jamás** debe comunicarse directamente con SIAT ni usar credenciales estáticas. `Aldia-Backend` (actualizado a Laravel 11 + PHP 8.3) debe actuar como único punto de entrada:

```
┌─────────────────────────────────────────────────────────────────────────┐
│            NUEVO FRONTEND: Viaja-Con-Aldia (Angular 18/19)              │
│   • Standalone Components + Signals     • Motor Offline (IndexedDB)     │
│   • AuthHttpInterceptor (JWT + Refresh) • Compresión WebP + FormData    │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ HTTPS (Único Dominio)
                                    │ Authorization: Bearer <JWT>
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│               GATEWAY / BFF: Aldia-Backend (Laravel 11)                 │
│   • Valida JWT y Roles                  • Encola trabajos en Redis      │
│   • Oculta credenciales legacy en .env  • Sirve Manifiestos/Remesas     │
└─────────────────┬─────────────────────────────────────┬─────────────────┘
                  │ Red Interna Segura                  │ Red Interna Segura
                  ▼                                     ▼
     ┌─────────────────────────┐           ┌─────────────────────────┐
     │  API 3S Logística       │           │  ERP / TMS Legado SIAT  │
     └─────────────────────────┘           └─────────────────────────┘
```

### 7.2 Motor Offline-First (Outbox Pattern)

```
Conductor hace acción
        │
        ▼
¿Hay conexión? ──NO──► Guarda en IndexedDB (sync_queue: PENDING)
        │                    + timestamp real del dispositivo
        │                    + coordenadas GPS actuales
       YES                   + responde "Guardado en el teléfono" al conductor
        │              ◄─────────────────────────────────────────────────────┐
        ▼                                                                     │
POST al backend ──FALLA──► Encola con Exponential Backoff ──────────────────┘
        │
      ÉXITO
        │
        ▼
sync_queue: SENT
```

### 7.3 Pipeline Optimizado de Imágenes POD

| Paso | Actual | Objetivo |
|---|---|---|
| Calidad de captura | `quality: 100` | `quality: 75`, `width: 1280px` |
| Formato de salida | `image/jpeg` (Base64 en JSON) | `image/webp` binario en `FormData` |
| Tamaño promedio | 2-3MB (Base64) | <150KB por imagen |
| Autenticación | Headers `user/password` hardcodeados | JWT Bearer vía `HttpInterceptor` |
| Manejo de fallo | Ninguno | Cola offline + reintentos automáticos |

### 7.4 GPS Inteligente con Batching

| Modo | Frecuencia | Almacenamiento | Envío |
|---|---|---|---|
| **Enturnamiento** | Puntual (one-shot) | Directo al backend | Inmediato |
| **En Viaje Activo** | Cada 5 min o 2 km | IndexedDB local | Cada 15 min en lote |
| **Sin Señal** | Continuo | IndexedDB local | Al recuperar señal |

El endpoint `POST /api/logs/gps/batch` (a crear en el backend) recibe el arreglo completo de puntos GPS con timestamps reales, reduciendo en un 90% las conexiones TCP/TLS abiertas desde el celular.

---

## 8. Hoja de Ruta de Refactorización (4 Fases)

### Fase 1 — Saneamiento de Seguridad y Estabilización (Semanas 1-3)
- [ ] **Backend Proxy SIAT:** Mover credenciales `USUSEGINT/12249` y llamadas a `siat.aldialogistica.net` dentro de controladores de `Aldia-Backend` protegidos por `auth.jwt`. Eliminar tráfico HTTP sin SSL al puerto 8000.
- [ ] **Migración Angular:** Actualizar de Angular 15 → **Angular 18/19** + Ionic 8, alineando con Capacitor 7.4.x.
- [ ] **Limpieza de dependencias:** Desinstalar `rxjs-compat`, `rxjs-observable`, `@awesome-cordova-plugins/geolocation`. Evaluar remoción de `@tensorflow/tfjs` y `face-api.js`.
- [ ] **`AuthInterceptor`:** Crear interceptor HTTP único que inyecte JWT, maneje refresh ante `401` y centralice errores.
- [ ] **`LoginGuard` robusto:** Validar expiración real del token (`exp` del payload JWT) antes de dar acceso.
- [ ] **Estrategia de carga:** Cambiar `PreloadAllModules` → `NoPreloading` y convertir `DashboardComponent` y `VehiculoComponent` a Lazy Loading.

### Fase 2 — Motor Offline-First y Optimización de Archivos (Semanas 4-6)
- [ ] Integrar `Dexie.js` (IndexedDB) para estado local tipado, reemplazando `localStorage`.
- [ ] Implementar `SyncService` con Outbox Pattern para Preoperacional y solicitudes de Turno.
- [ ] Refactorizar `PhotoService`: Base64 → WebP binario + `multipart/form-data` + cola offline con reintentos.

### Fase 3 — Descomposición del Monolito y Deuda RxJS (Semanas 7-9)
- [ ] Dividir `registro.page.ts` (3,445 líneas) en 5 componentes:
  1. `DatosConductorComponent`
  2. `SeguridadSocialContactoComponent`
  3. `DatosVehiculoComponent`
  4. `SatelitalPropietarioComponent`
  5. `DocumentosContratoComponent`
- [ ] Crear interfaces TypeScript estrictas: `Driver`, `Vehicle`, `PreoperationalForm`, `Turn`.
- [ ] Reemplazar `toPromise()` → `firstValueFrom()`. Usar `takeUntilDestroyed()` en todas las suscripciones.

### Fase 4 — Integración Operativa RNDC y Gestión de Viaje (Semanas 10-13)
- [ ] **Módulo "Mi Viaje Activo":** Conectar con `remesas`, `manifiestos`, `solicitudServicio` en Aldia-Backend. Descarga de PDF + QR del Manifiesto para exhibir offline a la DITRA.
- [ ] **Control de Hitos RNDC:** Botones simples para reportar vía `PUT /api/actualizaentrega`: *Llegada a Cargue*, *Inicio Cargue*, *Fin Cargue*, *Salida a Ruta*, *Novedad en Vía*, *Llegada a Descargue*, *Cumplido con foto POD*.
- [ ] **GPS por Lotes:** Activar recolección continua en estado *En Ruta* hacia `POST /api/logs/gps/batch`.

---

## 9. Matriz de Referencia Rápida (Diccionario Técnico-Logístico)

| Término de Negocio | Significado Operativo | Dónde está en el Código | Estado y Acción |
|---|---|---|---|
| **Tercero / Poseedor** | Conductor o dueño del camión contratado por viaje | `RegistroPage`, `UserService.getTerceroByCedula()` | 🔴 Monolito de 3,445 líneas. Dividir en pasos modulares tipados. |
| **Preoperacional (PESV)** | Inspección diaria obligatoria (Res. 40595) | `PreformPage`, `/api/tercero/preoperacional` | 🟡 Funcional, pero falla sin señal. Migrar a Offline-First. |
| **Enturnamiento** | Fila virtual en una regional para recibir carga | `TurnosPage`, `GeodataService`, PHP SIAT | 🔴 Llama directo a PHP legacy con HTTP sin SSL. Encapsular en Laravel BFF. |
| **GPS Satelital** | Proveedor de hardware GPS del camión (Satrack, etc.) | `RegistroService.getSatelital()` | 🟢 Formulario informativo para Torre de Control. Mantener y validar campos. |
| **Manifiesto (MEC/RNDC)** | Contrato legal del viaje exigido por MinTransporte y DITRA | Existe en Aldia-Backend, **ausente en la App** | 🔴 **Brecha crítica.** Construir módulo de consulta, descarga PDF/QR offline. |
| **Remesa de Carga** | Detalle de mercancía y punto de entrega | Existe en Aldia-Backend, **ausente en la App** | 🔴 **Brecha crítica.** Integrar para guiar al conductor en entregas. |
| **Cumplido (POD)** | Remesa firmada por el cliente al recibir la carga | `PhotoService`, `UserService.cargaDocumentos()` | 🔴 Sube en Base64 (~3MB) con credenciales hardcodeadas. Migrar a WebP + FormData + Cola Offline. |
| **SICETAC** | Sistema de información de costos del transporte (piso tarifario) | No existe en la app | 🔴 Debe reflejarse en la liquidación del Manifiesto visible al conductor. |

---

## 10. Resumen Ejecutivo

```
╔══════════════════════════════════════════════════════════════════════════╗
║              ESTADO ACTUAL — VIAJA CON ALDIA                            ║
╠══════════════════════════════════════════════════════════════════════════╣
║  Angular 15 (EOL)          │ ❌ Incompatible con Capacitor 7             ║
║  Estrategia Offline        │ ❌ INEXISTENTE                              ║
║  GPS Tracking              │ ❌ Solo one-shot al abrir turnos            ║
║  HTTP Interceptor          │ ❌ INEXISTENTE                              ║
║  Credenciales en código    │ 🔴 PRESENTES (riesgo BASC/OEA)             ║
║  Imágenes POD              │ 🔴 Base64 en JSON (~3MB, timeout frecuente) ║
║  Manifiesto/Remesa         │ ❌ App no consume estos endpoints           ║
║  Memory Leaks (RxJS)       │ 🔴 Cero unsubscribe() en todo el código    ║
║  Cobertura logística       │ ⚠️  Solo cubre ANTES del viaje             ║
╚══════════════════════════════════════════════════════════════════════════╝
```

**Prioridades absolutas (antes de cualquier feature nueva):**

1. 🔴 Resolver incompatibilidad Angular 15 + Capacitor 7 → Angular 18
2. 🔴 Mover credenciales hardcodeadas al backend (Proxy SIAT en Laravel BFF)
3. 🔴 Implementar `HttpInterceptor` único
4. 🔴 Diseñar motor offline (Service Worker + IndexedDB + Outbox)
5. 🟡 Implementar GPS tracking real con batching
6. 🟡 Optimizar carga de imágenes: WebP + FormData + reintentos
7. 🟡 Conectar módulo "Mi Viaje Activo" (Manifiesto + Remesas + Hitos RNDC)
8. 🟢 Descomponer `registro.page.ts` en 5 componentes
9. 🟢 Migrar `toPromise()` → `firstValueFrom()` + `takeUntilDestroyed()`

---

*Documento generado a partir del análisis exhaustivo del código fuente y el Manual de Arquitectura y Contexto Logístico "Viaja Con Aldia". Listo para validación estratégica con contexto de operaciones logísticas en Colombia.*

