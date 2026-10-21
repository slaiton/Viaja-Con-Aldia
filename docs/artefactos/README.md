# Artefactos

Carpeta única para la documentación que producen los agentes (Claude Code, Cursor, Codex u otros): análisis, planes, decisiones de arquitectura, diseños de pantalla y la bitácora de cambios.

Los agentes **no hacen commits**. Documentan aquí y la persona responsable revisa, versiona y publica.

## Convenciones

- **Nombre:** `AAAA-MM-DD-tema-en-kebab.html` (o `.md` para notas cortas). La fecha es la de creación; si el artefacto se actualiza, se conserva el nombre y se anota la revisión en la tabla.
- **Formato:** HTML autocontenido (sin dependencias locales; solo fuentes de Google Fonts) o Markdown. En español.
- **Sin secretos:** nunca valores de credenciales, tokens, cédulas o placas reales de conductores. Usar datos de ejemplo.
- **Publicación:** si el artefacto se publica en claude.ai, se publica desde este mismo archivo y el enlace se anota en la tabla. Para actualizarlo desde otra sesión se usa ese enlace, no se crea uno nuevo.
- **Índice:** todo artefacto nuevo agrega una fila a la tabla de abajo en el mismo cambio.

## Tipos

| Tipo | Uso |
|---|---|
| Análisis | Diagnóstico de código, seguridad, dependencias o rendimiento |
| Plan | Fases, tareas y criterios de "listo cuando" |
| ADR | Decisión de arquitectura: contexto, opciones, decisión, consecuencias |
| Diseño | Maquetas y especificación de pantallas o componentes |
| Bitácora | Registro de lo que hizo cada sesión de agente ([BITACORA.md](BITACORA.md)) |

## Índice

| Fecha | Artefacto | Tipo | Estado | Publicado | Resumen |
|---|---|---|---|---|---|
| 2026-10-21 | [Plan de refactor Viaja con Aldia](2026-10-21-plan-refactor.html) | Análisis · Plan · Diseño | Vigente | [claude.ai](https://claude.ai/artifact/HxUEDuphEj56A14bWsFpj2) (privado) | Diagnóstico de la app, patrón de arquitectura objetivo, plan en 5 fases y maquetas de 10 pantallas |
