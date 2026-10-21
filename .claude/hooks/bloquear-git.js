// Hook PreToolUse (Bash y PowerShell): bloquea los comandos que escriben historial
// de git o publican cambios. Regla del proyecto: los agentes no hacen commits;
// documentan en docs/artefactos y la persona responsable versiona.
//
// Recibe por stdin el JSON del hook. Sale con código 2 para bloquear; el texto de
// stderr le llega al agente como motivo.

const SUBCOMANDOS_GIT = [
  'commit', 'push', 'merge', 'rebase', 'cherry-pick', 'revert', 'am', 'tag',
  'reset', 'clean', 'filter-branch', 'filter-repo', 'update-ref', 'commit-tree',
];

// git, opciones globales opcionales (-C ruta, -c clave=valor, --no-pager…) y el subcomando.
const gitBloqueado = new RegExp(
  String.raw`(^|[\s;&|(])git(\.exe)?` +
  String.raw`((\s+(-C|-c|--git-dir|--work-tree|--namespace)(\s+|=)\S+)|(\s+--?[A-Za-z][\w-]*(=\S+)?))*` +
  String.raw`\s+(` + SUBCOMANDOS_GIT.join('|') + String.raw`)(?![\w-])`,
  'i',
);

const ghBloqueado = /(^|[\s;&|(])gh\s+(pr\s+(create|merge)|release\s+create)(?![\w-])/i;

let entrada = '';
process.stdin.on('data', (parte) => (entrada += parte));
process.stdin.on('end', () => {
  let comando = '';
  try {
    comando = (JSON.parse(entrada).tool_input || {}).command || '';
  } catch {
    process.exit(0);
  }

  if (gitBloqueado.test(comando) || ghBloqueado.test(comando)) {
    process.stderr.write(
      'Bloqueado por la regla del proyecto: los agentes no hacen commits, push, merge, ' +
      'rebase, reset ni PRs. Documenta el cambio en docs/artefactos/BITACORA.md con un ' +
      'commit sugerido y deja que la persona responsable lo versione.\n',
    );
    process.exit(2);
  }
  process.exit(0);
});
