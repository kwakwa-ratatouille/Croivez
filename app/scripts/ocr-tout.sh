#!/bin/sh
# Repère les images où la réponse est écrite (logos avec leur nom, constellations légendées…)
# Usage (depuis app/) : sh scripts/ocr-tout.sh <dossier de travail> pack1 pack2 …
TRAVAIL="$1"; shift
PY=/c/Users/Perri/AppData/Local/Programs/Python/Python311/python.exe
for P in "$@"; do
  mkdir -p "$TRAVAIL/$P"
  "$PY" -I scripts/ocr-prepare.py "$P" "$TRAVAIL/$P"
  powershell -NoProfile -ExecutionPolicy Bypass -File scripts/ocr.ps1 "$(cygpath -w "$TRAVAIL/$P")" "$(cygpath -w "$TRAVAIL")\\$P.json"
  node scripts/ocr-marquer.mjs "$P" "$TRAVAIL/$P.json"
done
