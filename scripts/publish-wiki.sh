#!/usr/bin/env bash
# Publica docs/wiki/*.md en la Wiki de GitHub del repositorio.
# Requisito: crear antes la primera página de la Wiki desde la web
# (pestaña Wiki → "Create the first page" → Save). Eso inicializa el repo .wiki.
#
# Uso: ./scripts/publish-wiki.sh
set -euo pipefail

REMOTE=$(git remote get-url origin)
WIKI_REMOTE="${REMOTE%.git}.wiki.git"
TMP=$(mktemp -d)

echo "Clonando $WIKI_REMOTE ..."
git clone --quiet "$WIKI_REMOTE" "$TMP"
cp docs/wiki/*.md "$TMP"/

cd "$TMP"
git add .
if git diff --cached --quiet; then
  echo "La Wiki ya está actualizada."
else
  git commit --quiet -m "docs: actualizar wiki desde docs/wiki"
  git push --quiet
  echo "✅ Wiki publicada."
fi
rm -rf "$TMP"
