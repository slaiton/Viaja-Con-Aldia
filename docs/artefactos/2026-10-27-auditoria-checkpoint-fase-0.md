# Auditoría Técnica y Checkpoint: Avance de la Fase 0 (Seguridad)
**Ecosistema Viaja con Aldia (Frontend Móvil) & Aldia-Backend (Laravel Gateway / BFF)**

> **Fecha:** 27 de octubre de 2026  
> **Rol:** Auditor Técnico y Tech Lead de Ciberseguridad  
> **Ubicación:** `docs/artefactos/2026-10-27-auditoria-checkpoint-fase-0.md`  
> **Estado:** Documento de Control y Seguimiento · Solo Análisis  
> **Restricción Crítica Activa:** NO modificar, reemplazar ni alterar ningún endpoint ni contrato hacia `api.3slogistica.com` (3SL).

---

## 1. Matriz de Control de Tareas (Checklist Oficial)

| ID | Tarea | Componente | Responsable | Estado | Resumen de Situación Real en Código |
|:---:|---|---|---|:---:|---|
| **F0-01** | Saneamiento de Git (`mikey.keystore`, `google-services.json`, `www/`) | Git / Repo | DevOps | 🔴 **PENDIENTE** | Los archivos sensibles siguen en el índice de Git (`git ls-files`). `.gitignore` aún no los tiene excluidos. |
| **F0-06** | Erradicación de fugas locales y poda de 15 MB de dependencias | Frontend | Frontend | 🟢 **COMPLETADO** | Erradicados `face-api.js`, `@tensorflow/tfjs`, `cors`, `rxjs-compat`, `ngx-cookie-service`, y ~15.5 MB en `src/assets/models/`. Limpieza de `console.log`. Build compila en verde. |
| **F0-05** | Interfaz Login Seguro (Placa texto/mayúsculas, Cédula numérico, OTP) | Frontend | Frontend | 🟡 **PARCIAL** | Placa ya es `type="text"` mayúsculas; Cédula ya tiene `inputmode="numeric"`. Falta el paso/input visual del código OTP. |
| **F0-03** | Servicio 2FA WhatsApp en Laravel (`MetaWhatsAppClient.php` + Redis) | Backend | Backend (Aldia) | 🔴 **PENDIENTE** | `MetaWhatsAppClient.php` y Redis están disponibles, pero las rutas `/api/v2/auth/request-otp` y su controlador aún no han sido creados. |
| **F0-02** | Gateway BFF en Aldia-Backend (`/api/v2/driver/*` bajo `auth.jwt`) | Backend | Backend (Aldia) | 🔴 **PENDIENTE** | No existe el grupo de rutas ni el controlador proxy para SIAT y el puerto :8000. |
| **F0-04** | Implementación de `AuthInterceptor` y migración de credenciales | Frontend | Frontend | 🔴 **PENDIENTE** | `USUSEGINT` / `12249` y `client_secret` siguen presentes en los servicios. Pendiente de migración cuando F0-02 esté listo. |
| **F0-07** | Rotación de claves en servidores (SIAT, Maps SHA-1, client_secret) | Infraestructura | DevOps / Backend | 🔴 **PENDIENTE** | Programada para ejecutarse una vez publicada la versión móvil en tiendas. |

---

## 2. Detalle del Escaneo Técnico por Repositorio

### 2.1 Repositorio Frontend: `Viaja-Con-Aldia`

#### A. Dependencias y Modelos (`package.json` y `src/assets/`)
* **Estado:** 🟢 **COMPLETADO**
* **Hallazgos:**
  * En `package.json` se confirmó la desinstalación limpia de:
    * `face-api.js`
    * `@tensorflow/tfjs`
    * `cors`
    * `rxjs-compat`
    * `rxjs-observable`
    * `ngx-cookie-service`
  * La carpeta `src/assets/models/` (18 fragmentos de pesos de modelos que ocupaban ~15.5 MB) y `src/assets/filters/` fueron eliminadas del disco.
  * Se eliminaron los archivos `src/app/api/face-api.service.ts` y `video-player.service.ts`.
  * Se sanearon los componentes `datos.page.ts`, `datos.page.html` y `dashboard.component.ts`.
  * La compilación de Angular (`npx ng build`) finaliza exitosamente con código 0.

#### B. Formulario de Inicio de Sesión (`src/app/features/login/`)
* **Estado:** 🟡 **PARCIAL**
* **Hallazgos:**
  * **Campo Placa:** Cambiado a `type="text"`, forzado a mayúsculas automáticas (`text-transform: uppercase`), `maxlength="7"`, validado mediante expresión regular para estructura vehicular colombiana (`/^[a-zA-Z]{3}\s?[0-9]{3}$/`).
  * **Campo Cédula:** Configurado como `type="text"`, con `inputmode="numeric"`, `pattern="[0-9]*"` y placeholder descriptivo "Cédula de ciudadanía".
  * **Pendiente para Completar:** El formulario aún envía las credenciales directamente mediante `authFacade.login()` hacia 3SL. No existe todavía la pantalla o modal que solicite el código de 6 dígitos (OTP) recibido en el celular.

#### C. Escaneo de Fugas de Secretos en Servicios del Cliente
* **Estado:** 🔴 **PENDIENTE (Esperado)**
* **Hallazgos:**
  * Las credenciales quemadas `USUSEGINT` y `12249` se mantienen en:
    * `src/app/core/services/user.service.ts` (Líneas 276, 315, 332, 348, 463, 555, 569, 787).
    * `src/app/core/services/photo.service.ts` (Líneas 29, 49).
    * `src/app/core/services/auth.service.ts` (Línea 37).
    * `src/app/api/geodata.service.ts` (Línea 114).
  * La clave `client_secret` sigue presente en `src/environments/environment.ts` y se envía manualmente en cabeceras `X-Client-Secret` desde `preform.page.ts` y `home.page.ts`.
  * La petición no cifrada en HTTP plano hacia `http://siat.aldialogistica.com:8000/api/auth/login` continúa en `geodata.service.ts:139`.
  * *Diagnóstico:* Estas credenciales NO se deben remover del cliente hasta que el Gateway BFF de Laravel esté implementado y respondiendo, de lo contrario la aplicación perdería comunicación con SIAT.

#### D. Saneamiento de Git
* **Estado:** 🔴 **PENDIENTE**
* **Hallazgos:**
  * `mikey.keystore` y `google-services.json` siguen registrados en el historial y árbol de Git.
  * El archivo `.gitignore` aún no contiene las reglas para excluir `mikey.keystore`, `google-services.json` ni la carpeta compilada `www/`.

---

### 2.2 Repositorio Backend: `Aldia-Backend`

#### A. Servicio 2FA por WhatsApp
* **Estado:** 🔴 **PENDIENTE**
* **Capacidad Instalada Identificada:**
  * `App\Services\WhatsApp\MetaWhatsAppClient.php` está disponible y cuenta con integración oficial con Meta Cloud API.
  * El modelo/tabla `tercero` contiene los campos `trccelular` y `trctelefono1` asociados a la cédula del conductor (`trcdocumento`).
  * Redis está configurado en `.env` (`REDIS_HOST=127.0.0.1`, `REDIS_PORT=6379`).
  * La librería `tymon/jwt-auth` está disponible para emitir tokens de sesión del lado de Aldia.
* **Pendiente:** No existen las rutas `/api/v2/auth/request-otp` ni `/api/v2/auth/verify-otp` en `routes/api.php`, ni su controlador de negocio.

#### B. Gateway BFF y Proxy SIAT
* **Estado:** 🔴 **PENDIENTE**
* **Hallazgos:**
  * No existe el grupo de rutas `/api/v2/driver/*` en `routes/api.php`.
  * No existe un controlador proxy que reciba las solicitudes de los conductores y reenvíe internamente hacia `http://siat.aldialogistica.com:8000` o hacia los endpoints de SIAT inyectando `USUSEGINT` y `client_secret` a nivel de servidor.

---

## 3. Propuesta de Arquitectura y Diseño Técnico (Para Revisión y Aprobación)

A continuación se detalla la propuesta técnica para las tareas pendientes. **Ninguna de estas piezas será creada ni aplicada en los archivos hasta recibir tu visto bueno.**

### 3.1 Diseño Técnico para F0-02 (Gateway BFF en `Aldia-Backend`)

#### Rutas propuestas en `routes/api.php`:
```php
Route::prefix('v2/driver')->middleware(['auth.jwt'])->group(function () {
    // 1. Proxy para autenticación en SIAT :8000 (resuelve tráfico en texto plano)
    Route::post('/siat-auth', [DriverProxyController::class, 'siatAuth']);

    // 2. Operaciones que requieren USUSEGINT / 12249 (inyectadas en servidor)
    Route::post('/enturnamiento', [DriverProxyController::class, 'enturnamiento']);
    Route::get('/documentos/validar', [DriverProxyController::class, 'validarDocumentos']);
    Route::get('/tipodocumentos', [DriverProxyController::class, 'tipoDocumentos']);
    Route::get('/firma', [DriverProxyController::class, 'getFirma']);
    Route::match(['get', 'post'], '/foto', [DriverProxyController::class, 'foto']);

    // 3. Preoperacional (inyecta X-Client-Secret y X-Client-Id en servidor)
    Route::post('/preoperacional', [DriverProxyController::class, 'preoperacional']);

    // 4. Proxy genérico para consultas REST hacia SIAT
    Route::any('/siat/{endpoint}', [DriverProxyController::class, 'proxySiat'])->where('endpoint', '.*');
});
```

#### Responsabilidades de `DriverProxyController.php`:
1. Leer `SIAT_USER`, `SIAT_PASSWORD` y `CLIENT_SECRET` desde el `.env` del servidor.
2. Atender la petición del móvil autenticado por JWT (`Bearer <token>`).
3. Reenviar la petición mediante `Http::withHeaders(...)` de Laravel hacia SIAT (`https://api.aldialogistica.com` y `http://siat.aldialogistica.com:8000`), ocultando la red interna y las credenciales al usuario móvil.
4. Retornar la respuesta y código HTTP exacto al frontend.

---

### 3.2 Diseño Técnico para F0-04 (Interceptor y Servicios en `Viaja-Con-Aldia`)

#### A. Arquitectura del `AuthInterceptor`:
* Archivo objetivo: `src/app/core/interceptors/auth.interceptor.ts`.
* Inyecta automáticamente `Authorization: Bearer <token>` cuando la petición se dirija a:
  * `api.3slogistica.com` (Garantiza que 3SL siga funcionando sin alteraciones).
  * `api.aldialogistica.com` (Nuevo destino del BFF).
* Atrapa de forma global respuestas `401 Unauthorized` para limpiar sesión y redirigir a `/login`.

#### B. Plan de Modificación en Servicios de Frontend:
1. **`UserService`:**
   * Sustituir las cabeceras manuales `user: 'USUSEGINT', password: '12249'` en `getDataApi`, `postDataApi`, `getDocumentosVencidos`, `getTipoDocumentos`, `getFirma` y `postPreoperacionalData`.
   * Cambiar sus URLs objetivo hacia `https://api.aldialogistica.com/api/v2/driver/*`.
2. **`PhotoService`:**
   * Remover `USUSEGINT` / `12249` de `postFotoTercero` y `getFotoTercero`.
   * Apuntar a `/api/v2/driver/foto`.
3. **`GeodataService`:**
   * En `turnoCreacion`: eliminar `USUSEGINT` / `12249` y apuntar a `/api/v2/driver/enturnamiento`.
   * En `tokenAcceso`: reemplazar `http://siat.aldialogistica.com:8000/api/auth/login` por `https://api.aldialogistica.com/api/v2/driver/siat-auth`.
4. **`PreformPage` y `HomePage`:**
   * Eliminar el envío de `X-Client-Secret` en el cliente. El BFF lo inyectará transparentemente.

---

### 3.3 Diseño Técnico para F0-03 y F0-05 (Autenticación 2FA por WhatsApp)

#### Flujo Operativo Propuesto:
```
[Conductor]
    │  1. Ingresa Cédula y Placa
    ▼
[App Móvil /login]
    │  2. POST /api/v2/auth/request-otp (cédula, placa)
    ▼
[Aldia-Backend]
    │  3. Valida existencia de conductor en tabla 'tercero'
    │  4. Genera código OTP numérico de 6 dígitos
    │  5. Guarda en Redis: key="otp:{cedula}", value=hash(código), TTL=300s
    │  6. Dispara mensaje vía MetaWhatsAppClient al 'trccelular' registrado
    ▼
[Celular Conductor]
    │  7. Recibe mensaje WhatsApp: "Tu código de acceso Aldia es: 492810"
    ▼
[App Móvil /login]
    │  8. Conductor digita los 6 dígitos
    │  9. POST /api/v2/auth/verify-otp (cédula, código)
    ▼
[Aldia-Backend]
    │ 10. Valida contra Redis (máx. 3 intentos permitidos)
    │ 11. Emite JWT firmado por Tymon/JWTAuth
    ▼
[App Móvil /home]
    └─ Acceso concedido y sesión almacenada
```

---

## 4. Próximos Pasos Recomendados (A la Espera de tu Autorización)

Para avanzar con paso firme y ordenado, el plan de trabajo sugerido para cuando des luz verde es:

1. **Paso 1 (Backend):** Construir y probar F0-02 (Rutas `/api/v2/driver/*` y `DriverProxyController` en `Aldia-Backend`).
2. **Paso 2 (Backend):** Construir F0-03 (Servicio de OTP por WhatsApp en `Aldia-Backend`).
3. **Paso 3 (Frontend):** Implementar F0-04 (Crear `AuthInterceptor` en `Viaja-Con-Aldia` y migrar llamadas de servicios hacia `/api/v2/driver/*`).
4. **Paso 4 (Frontend):** Integrar F0-05 (Pantalla de ingreso de código OTP en el login).
5. **Paso 5 (DevOps):** Ejecutar F0-01 (Limpieza de Git y configuración de `.gitignore`).

---
*Documento registrado en:* [docs/artefactos/2026-10-27-auditoria-checkpoint-fase-0.md](file:///c:/Users/Andres.Espinosa/proyectos_Aldia/Viaja-Con-Aldia/docs/artefactos/2026-10-27-auditoria-checkpoint-fase-0.md)
