# Auditoría de Base Visual y Tokens de Diseño (UI Design Audit)
**Proyecto: Viaja con Aldia (App Móvil Ionic / Angular)**

> **Documento:** `docs/artefactos/2026-10-27-auditoria-base-visual-design-system.md`  
> **Fecha:** 27 de octubre de 2026  
> **Rol:** UX/UI Engineer & Design System Architect  
> **Destinatarios:** Equipo de Diseño de Producto & UX (Figma / Mockups)  
> **Objetivo:** Radiografía técnica y visual del estado actual de la interfaz para servir como punto de partida en el diseño del nuevo prototipo visual de cabina.

---

## 1. Paleta de Colores (Design Tokens y Conflictos)

### 1.1 Colores de Marca y Fondos Actuales

Actualmente existe una **fuerte fragmentación de azules corporativos**. La variable oficial de Ionic `--ion-color-primary` nunca fue personalizada con el azul de Aldia (mantiene el `#3880ff` genérico de Ionic), mientras que el CSS global y los componentes usan hasta 6 variantes de azul hardcodeadas:

| Token / Rol | Código HEX | Código RGB | Ubicación en Código | Uso / Pantallas |
|---|:---:|:---:|---|---|
| **Azul Aldia Principal (Clase)** | `#0083CB` | `0, 131, 203` | `global.scss:65, 69, 259` | Botones `.btn-primary`, títulos `.title-form`, `--color-checked`. |
| **Azul Cabecera / Paneles** | `#3C8CCD` | `60, 140, 205` | `global.scss:291, 298, 306` | Fondos de cabecera `.panel-user-home`, `.panel-user`, `.panel-turno`. |
| **Azul Botones de Acción** | `#0094DA` | `0, 148, 218` | `global.scss:801, 806` | Botones de envío y confirmación en formularios. |
| **Azul Primario Ionic (Default)** | `#3880FF` | `56, 128, 255` | `variables.scss:7` | Variable base `--ion-color-primary` (sin personalizar). |
| **Azul Enlaces / Tickets** | `#0088FF` | `0, 136, 255` | `global.scss:679` | Texto del ticket de enturnamiento (`.ticket p`). |
| **Azul Botón Secundario** | `#116AEE` | `17, 106, 238` | `global.scss:824, 836` | Botones de formulario (`.btn-primary-2`). |
| **Azul Input Focus** | `#3498DB` | `52, 152, 219` | `global.scss:860` | Borde inferior de inputs al recibir foco. |
| **Fondo Blanco Superficie** | `#FFFFFF` | `255, 255, 255` | `variables.scss:82`, `global.scss` | Fondos de tarjetas, modales y contenido principal. |
| **Fondo Gris Claro App** | `#F4F5F8` | `244, 245, 248` | `variables.scss:71` | `--ion-color-light`, fondos de scroll y contenedores. |

---

### 1.2 Colores de Estado (Feedback y Semáforo)

| Estado | Token / Nombre | Código HEX | Código RGB | Origen / Clases |
|---|---|:---:|:---:|---|
| 🟢 **Éxito (Ionic)** | `--ion-color-success` | `#2DD36F` | `45, 211, 111` | `variables.scss:31`, badges activos (`badge text-bg-success`). |
| 🟢 **Éxito Neón (Custom)** | `.color-green` | `#0EE773` | `14, 231, 115` | `global.scss:653`, semáforos de enturnamiento. |
| 🟡 **Advertencia** | `--ion-color-warning` | `#FFC409` | `255, 196, 9` | `variables.scss:39`, alertas de documentos por vencer. |
| 🔴 **Peligro (Ionic)** | `--ion-color-danger` | `#EB445A` | `235, 68, 90` | `variables.scss:47`, botón "Sin Turno", botones cancelar. |
| 🔴 **Peligro Intenso (Custom)** | `.color-red` / Botones | `#FF3F22` | `255, 63, 34` | `global.scss:649, 812`, icono de rechazo, alertas críticas. |
| ⚪ **Gris Neutro / Deshabilitado** | `--ion-color-medium` | `#92949C` | `146, 148, 156` | `variables.scss:63`, textos secundarios y estados inactivos. |
| ⚪ **Gris Borde Dashed** | Contenedor Foto | `#B7B7B7` | `183, 183, 183` | `global.scss:352`, marcos de subida de fotos (POD/SOAT). |

---

### 1.3 Conflictos Críticos de Color Detectados
1. **Conflicto Ionic vs Bootstrap:** Ionic define `--ion-color-primary: #3880ff`, pero Bootstrap 5 inyecta `.btn-primary` y `.bg-primary` sobreescritos a la fuerza con `#0083cb !important` en `global.scss`. Si se usa un `<ion-button color="primary">` se pinta de un azul (`#3880ff`), pero si se usa `<button class="btn btn-primary">` se pinta de otro (`#0083cb`).
2. **Backdrop Magenta en Menú Lateral:** En `global.scss:236` existe una regla insólita:  
   `ion-menu::part(backdrop) { background-color: rgba(255, 0, 255, 0.5); }`  
   Esto oscurece el fondo con un tinte fucsia/magenta brillante al abrir el menú lateral.
3. **Menta / Turquesa Inesperado en Focos:** `.nav-toggle:focus` y `.btn-toggle-nav a:hover` usan un color menta `#d2f4ea` que desentona con el azul corporativo.

---

## 2. Tipografía y Escala Visual

### 2.1 Familias Tipográficas (Font Families)
* **Fuentes Web Declaradas:**  
  En `src/global.scss` (Líneas 633, 640 y 678) se declara:  
  `font-family: 'Raleway', sans-serif;`  
  **Hallazgo crítico:** La fuente `'Raleway'` **NO está inyectada en `src/index.html`** mediante `<link>` ni `@import` de Google Fonts. Por tanto, el navegador/móvil nunca descarga Raleway y cae silenciosamente en el fallback del sistema (`sans-serif`).
* **Fuentes Nativas del Sistema (Actualmente en Uso Real):**
  * **Android (Material Design):** `Roboto, "Helvetica Neue", sans-serif`.
  * **iOS:** `-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif`.
  * **Bootstrap:** `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.

---

### 2.2 Escala Tipográfica (Jerarquía en Código)

| Elemento / Rol | Tamaño en Código | Peso (Weight) | Color Aplicado | Ubicación / Caso de Uso |
|---|:---:|:---:|:---:|---|
| **Display / Ticket Grande** | `30px` / `2.5vw` | Regular / Bold | `#FFFFFF` | Número de turno en el ticket central. |
| **Título Pantalla (`h1`)** | `24px – 28px` | `700` (Bold) | `#0083CB` / `#FFFFFF` | Títulos de formularios, cabecera de registro. |
| **Nombre de Usuario (`#nameUser`)** | `20px – 22px` | `700` (Bold) | `#FFFFFF` / `#000000` | Header y panel de inicio (con `text-transform: capitalize`). |
| **Botón de Turno Principal** | `20px` | `600` | `#FFFFFF` | `.botontiemporestante` (botón de acción principal). |
| **Encabezado Sección (`h2`, `h3`)** | `15px – 18px` | `600` / `700` | `#41464B` / `#0083CB` | Subtítulos de cards, placas vehiculares. |
| **Texto Base / Cuerpo (`p`, labels)** | `14px – 16px` | `400` (Regular) | `#000000` / `#5260ff` | Texto descriptivo, inputs de formulario. |
| **Reloj y Tiempo Restante** | `15px` | `400` | `#B7B7B7` | Contador de reenturnamiento (`.tiemporestante`). |
| **Microcopia / Badges** | `10px – 12px` | `600` | `#FFFFFF` | Etiquetas de estado, notas pequeñas. |

---

## 3. Frameworks y Componentes Base

### 3.1 Coexistencia Híbrida: Bootstrap 5 + Ionic Framework

El proyecto presenta una **fuerte mezcla arquitectónica**:
* En `angular.json` y `src/global.scss:30` se importa el bundle completo de **Bootstrap 5.2.3** (`node_modules/bootstrap/scss/bootstrap.scss`).
* Las plantillas mezclan el sistema de rejilla y utilidades de Bootstrap con etiquetas web de Ionic:
  ```html
  <!-- Ejemplo real en home.page.html -->
  <div class="container panel-user-home">
    <div class="row p-3">
      <div class="col col-12 d-flex justify-content-center">
        <ion-avatar [style.width]="'130px'">
          <ion-img [src]="fotoUser"></ion-img>
        </ion-avatar>
      </div>
    </div>
  </div>
  ```
* **Clases de Bootstrap más utilizadas:**
  * Layout: `container`, `container-fluid`, `row`, `col`, `col-12`, `col-md-12`.
  * Flexbox: `d-flex`, `justify-content-center`, `justify-content-between`, `align-items-center`.
  * Espaciado: `p-2`, `p-3`, `p-4`, `m-auto`, `mt-2`, `mt-3`, `mb-1`, `mb-4`, `me-2`, `ml-3`.
  * Tipografía y badges: `text-center`, `text-white`, `text-muted`, `badge`, `text-bg-success`, `text-bg-danger`.
  * Formularios: `form-control`, `form-floating`, `form-signin`.

---

### 3.2 Inventario de Componentes Nativos de Ionic

| Componente Ionic | Nivel de Uso | Propósito en la App |
|---|:---:|---|
| `<ion-app>` / `<ion-split-pane>` | Estructural | Contenedor raíz y soporte responsive para menús. |
| `<ion-menu>` / `<ion-menu-button>` | Estructural | Menú lateral deslizable (hamburguesa) en todas las pantallas. |
| `<ion-header>` / `<ion-toolbar>` / `<ion-title>` | Estructural | Barra superior con botón de menú y título de vista. |
| `<ion-content>` | Estructural | Contenedor de scroll principal con soporte de pull-to-refresh. |
| `<ion-refresher>` / `<ion-refresher-content>` | Alto | Gesto de arrastrar para actualizar en Inicio y Turnos. |
| `<ion-card>` / `<ion-card-header>` | Alto | Tarjetas de estado preoperacional y listado de vehículos. |
| `<ion-item>` / `<ion-list>` / `<ion-label>` | Masivo | Filas de datos en perfil, documentos y opciones de navegación. |
| `<ion-avatar>` / `<ion-img>` | Alto | Foto circular del conductor (110px en menú, 130px en inicio). |
| `<ion-button>` | Masivo | Botones principales (Enturnamiento, Login, Guardado). |
| `<ion-select>` / `<ion-select-option>` | Alto | Selectores con interfaz `action-sheet` para destinos de turno. |
| `<ion-modal>` | Medio | Modal de nuevo turno y selección de fotografías. |
| `<ion-spinner>` | Medio | Indicador de carga durante la geolocalización. |
| `<ion-icon>` | Masivo | Iconos vectoriales de Ionicons en menús, botones y alertas. |

---

## 4. Iconografía y Gestión de Assets

### 4.1 Fuentes de Iconografía
* **Ionicons (Nativo Ionic):**  
  Se utilizan de manera masiva con variante dual (iOS outline / Android sharp):
  * `home` (Inicio)
  * `person-circle` (Mis datos)
  * `albums` (Turnos)
  * `clipboard` (Preoperacional)
  * `log-in` / `log-out` (Sesión)
  * `close-circle` / `checkmark-circle` (Aprobación/Rechazo de preoperacional)
  * `alert-circle` (Alertas)

---

### 4.2 Inventario de Archivos Gráficos en `src/assets/`

```
src/assets/
├── icon/
│   ├── aldia.png           (Logo isotipo de Aldia para cabeceras)
│   ├── favicon.png         (Icono de app / launcher de alta resolución)
│   ├── favicon_old.png     (Versión anterior)
│   ├── camara_min.png      (Icono pequeño para disparador de cámara)
│   ├── camara_q.png        (Icono grande central para zona de captura)
│   ├── document.png        (Icono genérico de documento)
│   ├── pdf.png             (Icono distintivo para previsualización de PDF)
│   ├── tiket.png           (Gráfico de fondo para el ticket de turno)
│   └── vehicle.png         (Silueta de camión para selección de vehículo)
├── img/
│   ├── userDefault.png     (Avatar por defecto cuando no hay foto de perfil)
│   └── verification.png    (Ilustración para validación de identidad)
└── imgs/
    └── 12.png              (Ilustración para la pantalla offline "Sin Conexión")
```

---

### 4.3 Fugas de Assets Externos Identificadas en el Código
* **Logo desde WordPress Externo:** En `registro.page.html` (Líneas 868 y 938) el logo corporativo se descarga directamente desde la web pública:  
  `https://aldialogistica.com/wp-content/uploads/2023/01/logo_aldia3.png`  
  *Riesgo:* Si el sitio web experimenta lentitud o el conductor no tiene internet, el logo no carga.
* **Placeholder de Ionic Docs:** En `vehiculo.component.html` (Líneas 32 y 142) se utiliza una imagen de demostración alojada en los servidores de Ionic:  
  `https://ionicframework.com/docs/img/demos/card-media.png`  
  *Riesgo:* Dependencia innecesaria de dominios de terceros.

---

## 5. Patrón de Navegación y Arquitectura Visual Actual

### 5.1 Navegación Principal (Menú Hamburguesa)
* **Mecanismo:** La aplicación utiliza actualmente un **menú lateral desplegable (`<ion-menu>`)** alojado en `src/app/app.component.html`, activado por un `<ion-menu-button>` en la esquina superior izquierda.
* **Problema de Ergonomía para Conductores:**
  * En cabina, con el teléfono en el soporte del parabrisas, alcanzar el botón de hamburguesa en la esquina superior izquierda exige estirar el brazo y genera distracción.
  * Oculta el estado del viaje y obliga a abrir el cajón lateral para saber a qué sección ir.
* **Recomendación para el Prototipo en Figma:** Sustituir el menú hamburguesa por una **barra de navegación inferior fija (Bottom Tabs / `<ion-tabs>`)** con 4 accesos directos de gran tamaño (≥48px): *Inicio, Preoperacional, Documentos, Perfil*.

---

### 5.2 Estructura de Encabezados (`<ion-header>`)
* Todas las pantallas principales (`home`, `datos`, `turnos`, `preform`) replican el mismo encabezado rígido:
  ```html
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-menu-button></ion-menu-button>
      </ion-buttons>
      <ion-title>Viaja Con Aldia</ion-title>
    </ion-toolbar>
  </ion-header>
  ```
* Inmediatamente debajo del toolbar se inserta un panel curvo azul (`.panel-user-home` con `border-bottom-radius: 15%`) de entre 15vh y 30vh de altura, dentro del cual se renderiza el avatar del conductor (`130px`), su nombre y la placa.

---

## 6. Recomendaciones Clave para el Equipo de Mockup / Figma

1. **Unificar la Paleta de Color en Tokens HSL:**
   * Definir un único **Azul Primario de Aldia:** `#0083CB` (`hsl(201, 100%, 40%)`).
   * Unificar los fondos oscuros de cabina para modo noche y un modo claro de alta visibilidad solar (`#F4F7FA`).
   * Corregir el backdrop magenta (`rgba(255, 0, 255, 0.5)`) y el hover menta (`#d2f4ea`).
2. **Definir Tipografía Oficial de Alta Legibilidad:**
   * Sustituir la referencia huérfana de Raleway por una fuente ergonómica diseñada para visibilidad en movimiento (ej. *Atkinson Hyperlegible* o *Inter*).
3. **Placa Vehicular Estandarizada:**
   * Crear el componente visual tipo **"Placa Colombiana"**: Fondo amarillo servicio público (`#FFD100`) o blanco particular, tipografía monoespaciada negra con remaches y nombre de la ciudad en la parte inferior.
4. **Objetivos Táctiles para Conductores:**
   * Todo botón interactivo debe tener una altura mínima de **48px a 54px** con esquinas redondeadas (8px a 12px) para facilitar la pulsación en movimiento.

---
*Documento registrado en:* [docs/artefactos/2026-10-27-auditoria-base-visual-design-system.md](file:///c:/Users/Andres.Espinosa/proyectos_Aldia/Viaja-Con-Aldia/docs/artefactos/2026-10-27-auditoria-base-visual-design-system.md)
