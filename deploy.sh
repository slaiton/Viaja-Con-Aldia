#!/bin/bash
set -e

echo "🏗️  Construyendo proyecto en rama main..."
git checkout main
git pull origin main
ionic build --prod

echo "🚀 Pasando build a rama deploy..."
git checkout deploy
rm -rf *
git checkout main -- www
mv www/* .
rm -rf www

echo "📦 Subiendo cambios a deploy..."
git add .
git commit -m "Actualizo build desde main"
git push origin deploy

echo "✅ Despliegue completado con éxito."