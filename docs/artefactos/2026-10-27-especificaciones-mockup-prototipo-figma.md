# Especificaciones de Diseño para Mockup y Prototipo en Figma
**Proyecto: Viaja con Aldia · Nueva Experiencia Móvil de Cabina**

> **Documento:** `docs/artefactos/2026-10-27-especificaciones-mockup-prototipo-figma.md`  
> **Fecha:** 27 de octubre de 2026  
> **Destinatarios:** Equipo de Diseño de Producto, UX/UI Designers (Figma) & Product Managers  
> **Documento Complementario:** [2026-10-27-auditoria-base-visual-design-system.md](./2026-10-27-auditoria-base-visual-design-system.md) *(Auditoría del código actual)*  
> **Objetivo:** Definir con total precisión los lineamientos, flujos, pantallas, componentes y tokens de diseño para construir el nuevo prototipo interactivo en Figma antes de tocar código de backend o frontend.

---

## 1. Principios de Diseño de Cabina (Driver-First UX)

El conductor de camión opera la aplicación en condiciones extremas: **vibración del vehículo, soporte en el parabrisas a 60–80 cm de distancia, deslumbramiento por luz solar directa y cansancio visual nocturno**. Por ello, el prototipo debe regirse por 4 reglas inquebrantables:

1. **Operabilidad a Una Mano (Thumb-Zone Optimization):**  
   Los botones de acción crítica (Enturnarse, Confirmar, Avanzar) deben ubicarse en el tercio inferior de la pantalla, nunca en las esquinas superiores.
2. **Objetivos Táctiles Generosos (Target Size ≥ 48px):**  
   Ningún botón o elemento interactivo puede medir menos de 48px de alto (óptimo 52px–56px) para evitar pulsaciones fallidas en movimiento o con guantes.
3. **Contraste Solar Alto (High-Contrast & Sunlight Legibility):**  
   Evitar grises sutiles sobre fondos blancos. Los textos principales deben tener un ratio de contraste mínimo de **7:1** frente al fondo.
4. **Feedback de Estado Inmediato:**  
   El conductor debe saber su estado operativo (Sin turno, Enturnado, En viaje) en menos de 2 segundos con solo mirar la pantalla de reojo.

---

## 2. Sistema de Tokens Oficial para Figma

### 2.1 Paleta de Colores Curada

Se erradica la dispersión de 6 azules diferentes detectada en el código actual y se define una paleta cromática cohesiva:

| Nombre del Token | Valor HEX | Valor HSL | Uso Específico en Prototipo |
|---|:---:|:---:|---|
| `aldia-primary` | `#0083CB` | `hsl(201, 100%, 40%)` | Color de marca oficial. Botones principales, tabs activas, cabeceras. |
| `aldia-primary-dark` | `#006399` | `hsl(201, 100%, 30%)` | Hover/Pressed de botones primarios y acentos en modo claro. |
| `aldia-primary-soft` | `#E1EEF8` | `hsl(204, 60%, 93%)` | Fondos de selección, badges de baja jerarquía y foco. |
| `surface-bg` | `#F4F7FA` | `hsl(210, 24%, 97%)` | Fondo general de la aplicación en modo claro. |
| `surface-card` | `#FFFFFF` | `hsl(0, 0%, 100%)` | Tarjetas de contenido, hojas modales y barras de navegación. |
| `text-main` | `#0E1E2E` | `hsl(210, 53%, 12%)` | Títulos principales, valores numéricos y texto de máxima jerarquía. |
| `text-muted` | `#526273` | `hsl(211, 17%, 39%)` | Etiquetas secundarias, horas, textos descriptivos y subtítulos. |
| `border-line` | `#D3DCE6` | `hsl(213, 27%, 86%)` | Líneas divisorias, bordes de inputs y contornos de tarjetas. |

#### Colores Semánticos y Operativos:
| Token Semántico | Valor HEX | Fondo Suave (Soft) | Significado en Cabina |
|---|:---:|:---:|---|
| `state-success` | `#1A7037` | `#E4F3E8` | Aprobado, Enturnado, Documento Vigente, En Ruta. |
| `state-warning` | `#8A5300` | `#FFF1D6` | Documento por vencer (<30 días), Reenturnamiento próximo. |
| `state-danger` | `#B42318` | `#FDECEA` | Rechazado, Documento Vencido, Sin Turno, Alerta Crítica. |
| `plate-colombia` | `#FFD100` | — | Fondo de placa física colombiana de servicio público. |

---

### 2.2 Tipografía Oficial

* **Familia Principal:** **`Atkinson Hyperlegible`** (o **`Inter`** como alternativa de sistema).  
  *Justificación:* Diseñada específicamente para máxima distinción de caracteres ambiguos (`0` vs `O`, `1` vs `I`, `8` vs `B`), crítica para placas vehiculares y manifiestos viales.
* **Familia Monoespaciada (Placas y Códigos):** **`JetBrains Mono`** o tipografía vehicular de placas.

#### Escala Tipográfica para Figma:
| Nivel | Tamaño | Altura de Línea | Peso | Aplicación |
|---|:---:|:---:|:---:|---|
| **Display Hero** | `28px – 32px` | `1.1` | Bold (`700`) | Número de turno, estado hero ("Enturnado"). |
| **Heading 1** | `22px – 24px` | `1.2` | Bold (`700`) | Título de pantalla ("Inicio", "Mis Vehículos"). |
| **Heading 2** | `18px – 20px` | `1.3` | SemiBold (`600`) | Subtítulos de sección, nombres de conductor. |
| **Body Large** | `16px` | `1.4` | Regular / Medium | Botones principales, inputs de texto. |
| **Body Default** | `14px – 15px` | `1.4` | Regular (`400`) | Descripciones, preguntas de preoperacional. |
| **Caption / Badge** | `12px` | `1.3` | Bold (`700`) | Chips de estado, fechas de vencimiento, placas. |

---

### 2.3 Espaciados y Radios (Borders)
* **Grilla Base:** 8pt (`8px`, `16px`, `24px`, `32px`, `40px`, `48px`).
* **Márgenes de Pantalla:** `16px` en móvil estándar, `20px` en pantallas grandes.
* **Border Radius:**
  * `8px`: Inputs de texto, badges pequeños.
  * `12px – 16px`: Tarjetas de información (`Card`), contenedores de fotos.
  * `24px – 28px`: Botones principales de acción completa (Pill Shape).
  * `0px`: Barra de navegación inferior fija (`Bottom Tabs`).

---

## 3. Arquitectura de Navegación del Prototipo

### Reemplazo del Menú Hamburguesa por Barra Inferior (Bottom Tabs)

El prototipo debe estructurarse sobre un layout de **4 Pestañas fijas en la parte inferior**, con iconos intuitivos y etiquetas claras (altura mínima de barra: `64px`):

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│                  ÁREA DE CONTENIDO                     │
│               (Scroll vertical fluido)                 │
│                                                        │
├────────────┬──────────────┬──────────────┬─────────────┤
│     🏠     │      📋      │      📑      │     👤      │
│   Inicio   │Preoperacional│  Documentos  │   Perfil    │
└────────────┴──────────────┴──────────────┴─────────────┘
```

1. **Inicio (`/inicio`):** Panel operativo de cabina (Turno, Viaje activo RNDC, botón de enturnamiento).
2. **Preoperacional (`/preoperacional`):** Asistente paso a paso de revisión del camión.
3. **Documentos (`/documentos`):** Semáforo de vigencias (SOAT, RTM, Licencia) y subida de imágenes.
4. **Perfil (`/perfil`):** Datos del conductor, gestión de vehículos (`/perfil/vehiculos`) y soporte vía WhatsApp.

---

## 4. Desglose Pantalla por Pantalla para el Prototipo en Figma

---

### PANTALLA 1: Inicio de Sesión Seguro en 2 Pasos (`/login`)

#### Objetivo de UX:
Acceso rápido, sin campos disfrazados de contraseña y con validación segura de segundo factor (2FA).

#### Elementos Visuales:
1. **Cabecera:** Logo oficial de Aldia Logística en alta definición (SVG) centrado.
2. **Paso 1 — Identificación:**
   * Campo **Cédula de ciudadanía:** Teclado numérico activado por defecto, sin flechas de incremento.
   * Campo **Placa del vehículo:** Campo de texto con diseño de placa colombiana, forzado en mayúsculas (`AAA 000`).
   * Botón de acción principal: *"Recibir código por WhatsApp / SMS"*.
3. **Paso 2 — Verificación OTP (Seguridad 2FA):**
   * Transición fluida a pantalla de código.
   * Texto de ayuda: *"Enviamos un código de 6 dígitos a tu celular terminado en ••21"*.
   * Componente **OtpInput**: 6 casillas cuadradas separadas (`48x54px`), con avance automático al escribir.
   * Contador de reenvío: *"Reenviar código en 00:45"*.
   * Enlace de asistencia: *"¿Cambiaste de número? Habla con Tráfico por WhatsApp"*.

---

### PANTALLA 2: Inicio / Dashboard de Cabina (`/inicio`)

Esta es la pantalla que el conductor verá el 80% del tiempo. Debe prototiparse en sus **4 estados operativos**:

#### Componentes Comunes de la Cabina:
* **Barra Superior Limpia:** Saludo personalizado (*"Hola, Carlos"*), badge de conductor activo y placa activa en formato `PlateBadge`.
* **Botón de Soporte:** Icono flotante discreto de WhatsApp para comunicación directa con la agencia.

#### Variantes de Estado en el Prototipo:

```
┌──────────────────────────────────────────────┐
│ ESTADO 1: DISPONIBLE (SIN TURNO)             │
│ • StatusHero: "Disponible para Enturnar"     │
│ • Ubicación GPS detectada automáticamente    │
│ • Botón Gigante (54px): "Enturnarme Ahora"   │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ ESTADO 2: ENTURNADO (TURNO ACTIVO)           │
│ • StatusHero: "Turno Asignado"               │
│ • Badge Gigante: Número de turno (Ej: #12)   │
│ • Origen detectado: "Regional Bogotá"        │
│ • Destinos seleccionados en tarjetas chip    │
│ • Reloj regresivo: "Reenturnarse en 01:45 h" │
│ • Botón secundario: "Modificar Destinos"     │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ ESTADO 3: EN AGENCIA / EN CARGUE             │
│ • StatusHero: "Llamado a Cargue" (Verde)     │
│ • Muelle asignado: "Muelle 04 - Funza"       │
│ • Hora límite de presentación                │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ ESTADO 4: VIAJE ACTIVO RNDC ("MI VIAJE")     │
│ • Resumen del Manifiesto Electrónico (MEC)   │
│ • Botón ver QR de retén vial (Funciona offline)│
│ • Lista de Remesas pendientes de entrega     │
│ • Botón de Cumplido (POD): "Registrar Entrega"│
└──────────────────────────────────────────────┘
```

---

### PANTALLA 3: Preoperacional Ergonómico (`/preoperacional`)

#### Objetivo de UX:
Reemplazar el formulario largo e interminable por un flujo paso a paso que el conductor pueda responder en menos de 2 minutos caminando alrededor del camión.

#### Elementos Visuales:
1. **Barra de Progreso:** Indicador lineal visual (*"Pregunta 3 de 12"*).
2. **Tarjeta de Pregunta (`PreguntaCard`):**
   * Título grande y claro (ej. *"¿Estado de las llantas y presión de aire?"*).
   * Icono ilustrativo de la parte del camión evaluada.
3. **Botonera Táctil Gigante (60px de alto):**
   * Botón Izquierdo: **"CUMPLE"** (Verde suave con check grande).
   * Botón Derecho: **"NO CUMPLE"** (Rojo suave con cruz grande).
4. **Campo de Evidencia Fotográfica (Condicional):**
   * Si marca "No Cumple", se despliega suavemente el disparador para fotografiar la anomalía.
5. **Autoguardado Offline:** Badge en la parte superior: *"Borrador guardado automáticamente"*.

---

### PANTALLA 4: Documentos y Semáforo de Vigencias (`/documentos`)

#### Elementos Visuales:
1. **Resumen de Estado (Semáforo):**
   * Tarjeta superior con conteo rápido: *"3 Vigentes · 1 Por Vencer · 0 Vencidos"*.
2. **Listado de Tarjetas por Documento:**
   * Cada tarjeta muestra:
     * Nombre: *SOAT, Tecnomecánica, Licencia de Conducción*.
     * Fecha de vencimiento exacta.
     * Chip de estado: `Vigente` (verde), `Vence pronto` (amarillo), `Vencido` (rojo).
     * Miniatura de la foto actual guardada.
     * Botón táctil: *"Actualizar Foto"*.
3. **Modal de Captura (`DocCapture`):**
   * Visor con marco guía punteado para encuadrar la cara frontal y posterior del documento.

---

### PANTALLA 5: Mis Vehículos (`/perfil/vehiculos`)

#### Elementos Visuales:
1. **Tarjeta de Vehículo Activo:**
   * Resaltada con borde azul y etiqueta *"VEHÍCULO ACTIVO"*.
   * Componente `PlateBadge` con la placa en tipografía grande.
   * Datos: Clase de vehículo, marca, modelo y configuración de ejes.
2. **Vehículos Secundarios / Vinculados:**
   * Tarjetas simplificadas con botón *"Activar este vehículo"*.
   * Diálogo de seguridad con código OTP al intentar cambiar de vehículo activo.
3. **Botón Flotante o Inferior:** *"Vincular nuevo vehículo"*.

---

### PANTALLA 6: Componente OfflineBanner (Pérdida de Red)

#### Elementos Visuales:
* Barra sutil fijada en la parte superior del contenido (bajo el header), color ámbar suave:
  * Icono de nube tachada o antena sin señal.
  * Texto: *"Modo sin conexión · Tus datos se sincronizarán al recuperar señal"*.
  * No bloquea la navegación ni muestra modales intrusivos de error.

---

## 5. Biblioteca de Componentes a Diseñar en Figma (Component Set)

El equipo de diseño debe construir estos 6 componentes reutilizables como base del Mockup:

```
┌────────────────────────────────────────────────────────┐
│ 1. PlateBadge (Placa Colombiana)                       │
│    ┌──────────────────┐                                │
│    │  COLOMBIA        │                                │
│    │  SXT·482         │  Fondo Amarillo (#FFD100)     │
│    │  FUNZA           │  Tipografía Monoespaciada      │
│    └──────────────────┘                                │
├────────────────────────────────────────────────────────┤
│ 2. StatusHero (Cabecera Operativa de Cabina)           │
│    Estado actual, tiempo regresivo y badges de turno.  │
├────────────────────────────────────────────────────────┤
│ 3. PreguntaCard (Preoperacional Móvil)                 │
│    Pregunta clara con botones "Cumple" / "No Cumple".  │
├────────────────────────────────────────────────────────┤
│ 4. OtpInput (Verificación 2FA)                         │
│    6 celdas táctiles cuadradas con foco interactivo.   │
├────────────────────────────────────────────────────────┤
│ 5. DocumentCard (Semáforo de Vigencias)                │
│    Tarjeta con semáforo verde/amarillo/rojo y foto.    │
├────────────────────────────────────────────────────────┤
│ 6. BottomNavigationBar (Tabs de Cabina)                │
│    Barra fija inferior de 4 accesos de 64px de alto.   │
└────────────────────────────────────────────────────────┘
```

---

## 6. Checklist de Entregables del Prototipo en Figma

Antes de validar con el equipo de conductores y pasar a desarrollo, el archivo de Figma debe contener:

- [ ] **Frame 1:** Pantalla de Login (Paso 1: Cédula + Placa).
- [ ] **Frame 2:** Pantalla de Login (Paso 2: Verificación OTP WhatsApp).
- [ ] **Frame 3:** Inicio en Estado 1 (Sin Turno / Disponible).
- [ ] **Frame 4:** Inicio en Estado 2 (Enturnado con reloj regresivo).
- [ ] **Frame 5:** Inicio en Estado 4 (En Viaje Activo RNDC con Manifiesto y Remesas).
- [ ] **Frame 6:** Preoperacional Paso a Paso (Tarjeta de pregunta y botones 52px).
- [ ] **Frame 7:** Documentos con Semáforo de Vigencias.
- [ ] **Frame 8:** Mis Vehículos y cambio de camión activo.
- [ ] **Frame 9:** Variación con `OfflineBanner` visible.
- [ ] **Prototipo Interactivo:** Conexión de transiciones de clic para flujo completo: *Login → OTP → Inicio → Preoperacional*.

---
*Documento registrado en:* [docs/artefactos/2026-10-27-especificaciones-mockup-prototipo-figma.md](file:///c:/Users/Andres.Espinosa/proyectos_Aldia/Viaja-Con-Aldia/docs/artefactos/2026-10-27-especificaciones-mockup-prototipo-figma.md)
