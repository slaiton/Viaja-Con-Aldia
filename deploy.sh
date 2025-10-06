#!/bin/bash
set -e

# ==============================
# CONFIGURACIÓN
# ==============================
BUILD_DIR="www"
TARGET_BRANCH="deploy"

echo "🏗️  Construyendo proyecto desde rama main..."

# 1️⃣ Verificar que estés en main y sin cambios pendientes
git checkout main
if [[ -n $(git status --porcelain) ]]; then
  echo "⚠️  Tienes cambios sin guardar en main. Haz commit antes de desplegar."
  exit 1
fi

# 2️⃣ Generar build de Ionic
ionic build --prod -- --base-href /Viaja-Con-Aldia/

# 3️⃣ Crear una carpeta temporal para guardar el build
TEMP_DIR=$(mktemp -d)
cp -r $BUILD_DIR/* $TEMP_DIR

# 4️⃣ Cambiar a la rama de despliegue
git checkout $TARGET_BRANCH

# 5️⃣ Limpiar solo los archivos antiguos del build
find . -maxdepth 1 ! -name ".git" ! -name "." -exec rm -rf {} \;

# 6️⃣ Copiar el contenido del build
cp -r $TEMP_DIR/* .

# 7️⃣ Eliminar carpeta temporal
rm -rf $TEMP_DIR    

# 8️⃣ Commit y push
git add .
git commit -m "🚀 Actualizo build desde main"
git push origin $TARGET_BRANCH

echo "✅ Despliegue completado con éxito en rama '$TARGET_BRANCH'"