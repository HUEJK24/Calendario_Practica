#!/usr/bin/env bash
# Ejecuta la auditoría de dependencias de producción y guarda la evidencia.
# No modifica dependencias: solo reporta.
# Uso: bash qa/scripts/run-audit.sh
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT="$ROOT/qa/sprint-4/evidencias"
STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUT"

for dir in backend frontend; do
  echo
  echo "== $dir =="
  ( cd "$ROOT/$dir" && npm audit --omit=dev ) 2>&1 | tee "$OUT/auditoria-${dir}-${STAMP}.txt"
done

echo
echo "Reporte guardado en qa/sprint-4/evidencias/"
echo "Los hallazgos se documentan en qa/sprint-4/auditoria-dependencias.md."
echo "No ejecutes npm audit fix --force: cambia versiones mayores y rompe la app."
