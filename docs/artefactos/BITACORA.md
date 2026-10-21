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

## 2026-10-21 · Configuración de agentes y limpieza de git
- **Pedido:** ajustar `.gitignore` según el plan de refactor, definir la carpeta de artefactos y crear archivos de contexto para agentes.
- **Cambios:**
  - `.gitignore`: se agregan `www/`, llaves de firma (`*.keystore`, `*.jks`, `*.p12`…), `google-services.json`, `GoogleService-Info.plist`, binarios (`*.apk`, `*.aab`, `*.ipa`), `.env*`, carpetas generadas de Android y `.claude/settings.local.json`.
  - Índice de git: `www/` (1.450 archivos), `mikey.keystore` y `google-services.json` quedan como eliminados en el área de preparación con `git rm --cached`. Las copias locales no se tocaron.
  - `docs/artefactos/`: carpeta de artefactos, `README.md` con convenciones e índice, esta bitácora y el informe `2026-10-21-plan-refactor.html`.
  - `AGENTS.md`: reglas de arquitectura vigentes y objetivo para cualquier agente.
  - `CLAUDE.md`: importa `AGENTS.md` y agrega reglas propias de Claude Code.
  - `.claude/settings.json` y `.claude/hooks/bloquear-git.js`: bloquean commits, push y otras operaciones que escriben historial, y la lectura de archivos con secretos.
- **Verificación:** `git check-ignore` confirma que `www/`, el keystore, `google-services.json` y los `environment*.ts` quedan ignorados. El hook se probó con 18 comandos simulados: bloquea `git commit`, `git -C . push`, `git --no-pager commit`, `git reset --hard`, `gh pr create` y comandos encadenados; permite `git status`, `git log --grep commit`, `git merge-base` y `git diff | grep push`. También se comprobó en vivo: bloqueó un `git -C . tag --list` en la misma sesión. No se corrieron lint ni build porque no hubo cambios de código de la app.
- **Pendiente:**
  - Guardar `mikey.keystore` en los secretos de Codemagic antes de configurar el CI de Android.
  - Las llaves y el build siguen en el historial de git; si el repositorio se comparte, limpiarlo con `git filter-repo` y rotar las credenciales (Fase 0 del plan).
  - `codemagic.yaml` usa `exportOptions.plist`, que no está en el repositorio.
- **Commit sugerido:** `chore(repo): ignorar build y llaves; agregar contexto para agentes y carpeta de artefactos`
