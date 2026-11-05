#!/usr/bin/env bash
# Ejecuta las suites unitarias de backend y frontend y guarda la evidencia.
# Uso: bash qa/scripts/run-unit-tests.sh
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT="$ROOT/qa/sprint-4/evidencias"
STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUT"

status=0

run() {
  local name="$1"
  local dir="$2"
  local log="$OUT/${name}-${STAMP}.txt"
  local code

  echo
  echo "== $name =="
  ( cd "$ROOT/$dir" && npm test -- --coverage --runInBand ) 2>&1 | tee "$log"
  code=${PIPESTATUS[0]}

  if [ "$code" -ne 0 ]; then
    echo "FALLÓ $name (código $code). Log: $log"
    status=1
  else
    echo "OK $name. Log: $log"
  fi
}

run backend backend
run frontend frontend

echo
if [ "$status" -eq 0 ]; then
  echo "Todas las suites pasaron. Evidencia en qa/sprint-4/evidencias/"
else
  echo "Hay suites con fallos. Revisa los logs en qa/sprint-4/evidencias/"
fi

exit "$status"
