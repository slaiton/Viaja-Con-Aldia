# CLAUDE.md · Viaja con Aldia

Las reglas del proyecto viven en `AGENTS.md`, que comparten todos los agentes. Se importan aquí completas:

@AGENTS.md

---

## Reglas propias de Claude Code

Aplican además de `AGENTS.md`, también a los subagentes y sesiones que lances.

### Git y commits
- Nunca hagas commits ni push, y no ofrezcas hacerlos. Al cerrar una tarea no propongas las acciones de commit o PR de la app: deja el mensaje sugerido en `docs/artefactos/BITACORA.md` y en tu respuesta final.
- `.claude/settings.json` deniega esos comandos y `.claude/hooks/bloquear-git.js` atrapa las variantes (`git -C . commit`, `git --no-pager push`, `gh pr create`). Si un comando se bloquea, no busques otra forma de ejecutarlo: explícale a la persona qué querías hacer.
- `checkout`, `switch`, `restore`, `stash` y `rm` piden confirmación. Úsalos solo si la persona lo pidió en la conversación.

### Artefactos
- Escribe cada artefacto en `docs/artefactos/AAAA-MM-DD-tema.html`, no en el scratchpad, y publícalo con la herramienta Artifact desde esa misma ruta.
- En el mismo turno, agrega o actualiza su fila en `docs/artefactos/README.md` con el enlace publicado.
- Para actualizar un artefacto de otra sesión, usa el enlace que aparece en el índice (`url`); no publiques uno nuevo.
- Los artefactos se publican privados. Si son para otras personas, recuerda que hay que compartirlos desde el menú Compartir de la página.
- Sin secretos ni datos reales de conductores en ningún artefacto.

### Secretos
- La lectura de `environment.ts`, `environment.prod.ts`, `.env*` y las llaves está denegada en `.claude/settings.json`. No la rodees con `cat`, `type`, `Get-Content` ni scripts.
- Para saber qué claves de configuración existen, lee `src/environments/environment.example.ts`.

### Configuración del agente
- No modifiques `.claude/settings.json`, `.claude/hooks/`, `AGENTS.md` ni este archivo salvo que la persona lo pida. La excepción es actualizar el estado de la migración en la sección 11 de `AGENTS.md` cuando una fase avance.
- No copies a la memoria reglas que ya están en estos archivos.

### Forma de trabajar
- Responde en español.
- Antes de editar un archivo congelado (`AGENTS.md`, sección 4), confirma que el cambio es una corrección de error. Si no lo es, propón la extracción a la estructura objetivo.
- Al terminar una tarea con cambios: lint y build, entrada en la bitácora y resumen con lo que no se verificó.
