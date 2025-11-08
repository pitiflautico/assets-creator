#!/bin/bash

# Script de ejemplo rápido para probar Assets Creator

echo "🚀 Assets Creator - Ejemplo Rápido"
echo "==================================="
echo ""

# Verificar si existe .env
if [ ! -f .env ]; then
    echo "⚠️  No encontré archivo .env"
    echo ""
    echo "Por favor crea un archivo .env con:"
    echo "REPLICATE_API_TOKEN=tu_token_aqui"
    echo ""
    echo "Obtén tu token en: https://replicate.com/account/api-tokens"
    exit 1
fi

echo "✓ Archivo .env encontrado"
echo ""

# Verificar si están las dependencias
if [ ! -d node_modules ]; then
    echo "📦 Instalando dependencias..."
    npm install
    echo ""
fi

echo "✓ Dependencias instaladas"
echo ""

# Compilar
echo "🔨 Compilando TypeScript..."
npm run build
echo ""

echo "✓ Compilación exitosa"
echo ""

# Preguntar qué hacer
echo "¿Qué quieres hacer?"
echo ""
echo "1) Solo analizar (gratis, no usa Replicate)"
echo "2) Generar solo textos (usa poco crédito)"
echo "3) Generar textos + imágenes (usa más crédito)"
echo "4) Modo interactivo"
echo ""

read -p "Opción [1-4]: " option

case $option in
    1)
        echo ""
        echo "📊 Analizando proyecto..."
        npm run start analyze
        ;;
    2)
        echo ""
        echo "📝 Generando textos..."
        npm run start text-only
        ;;
    3)
        echo ""
        echo "🎨 Generando textos + imágenes..."
        npm run start generate
        ;;
    4)
        echo ""
        npm run start interactive
        ;;
    *)
        echo "Opción inválida"
        exit 1
        ;;
esac

echo ""
echo "✅ ¡Completado!"
echo ""

# Si existen los assets, mostrar ubicación
if [ -d generated_assets ]; then
    echo "📁 Assets generados en: ./generated_assets"
    echo ""
    echo "Archivos creados:"
    ls -lh generated_assets/
fi
