#!/bin/bash

# Script de prueba para captura guiada
# Este script muestra exactamente qué está haciendo el sistema

echo "🔍 Verificando setup..."
echo ""
echo "📂 Directorio actual: $(pwd)"
echo "📱 Path del proyecto que analizará: /Users/danielperezpinazo/Projects/tabata"
echo ""
echo "Ejecutando comando:"
echo "npm run dev analyze -p /Users/danielperezpinazo/Projects/tabata"
echo ""
echo "Presiona Ctrl+C para cancelar, o Enter para continuar..."
read

npm run dev analyze -p /Users/danielperezpinazo/Projects/tabata
