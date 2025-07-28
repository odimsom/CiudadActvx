#!/bin/bash

echo "🔄 Iniciando deployment en Render..."

# Cambiar al directorio del servidor
cd apps/server

# Instalar dependencias específicas del servidor
echo "📦 Instalando dependencias del servidor..."
npm install

# Compilar TypeScript
echo "🔨 Compilando TypeScript..."
npm run build

# Verificar que el archivo compilado existe
if [ -f "dist/index.js" ]; then
    echo "✅ Compilación exitosa"
else
    echo "❌ Error: archivo dist/index.js no encontrado"
    exit 1
fi

# Iniciar el servidor
echo "🚀 Iniciando servidor..."
npm start
