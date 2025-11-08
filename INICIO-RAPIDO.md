# 🚀 Inicio Rápido - Assets Creator

## Instalación

```bash
npm install
```

## Configuración

Crea un archivo `.env` con tu API key de Replicate:

```bash
REPLICATE_API_TOKEN=tu_clave_aqui
```

## Comandos

### Analizar una app (sin generar assets)

```bash
# Analizar el proyecto actual
npm run analyze

# Analizar otro proyecto
npm run analyze -- -p /ruta/a/tu/proyecto
```

**IMPORTANTE:** El `--` es necesario para pasar parámetros correctamente a través de npm.

### Generar todos los assets

```bash
# Generar para el proyecto actual
npm run generate

# Generar para otro proyecto
npm run generate -- -p /ruta/a/tu/proyecto
```

### Capturar Screenshots con Guía

**NUEVA FUNCIONALIDAD:** Captura screenshots del simulador con guía paso a paso que te indica exactamente qué pantallas capturar (menú, features principales, etc.)

```bash
# Capturar screenshots con guía automática
npm run dev -- capture

# Especificar tipo de app para guía personalizada
npm run dev -- capture -t fitness
npm run dev -- capture -t music

# Analizar proyecto y capturar con guía específica
npm run dev -- capture -p /ruta/a/tu/proyecto
```

La captura guiada te dirá:
- 📱 Qué pantalla navegar (ej: "Pantalla Principal / Home")
- 📝 Descripción de qué debe mostrar
- ✅ Confirma cuando captures cada una
- 🎯 Pantallas específicas según tu tipo de app (fitness, music, productivity, etc.)

### Otros comandos

```bash
# Ver modelos disponibles
npm run dev -- models

# Ver configuración
npm run dev -- config

# Modo interactivo (con preguntas)
npm run dev -- interactive
```

## Ejemplo con tu proyecto Tabata

```bash
# 1. Analizar primero (para ver qué detecta)
npm run analyze -- -p /Users/danielperezpinazo/Projects/tabata

# 2. Si todo se ve bien, generar assets completos
npm run generate -- -p /Users/danielperezpinazo/Projects/tabata
```

## Qué hace el sistema

1. **Análisis Inteligente:**
   - Lee el README con IA
   - Extrae colores de logos/iconos existentes
   - Detecta la categoría dinámicamente (NO listas hardcodeadas)
   - Genera keywords específicos para TU app

2. **Captura de Screenshots con Guía:**
   - Detecta simulador iOS/Android automáticamente
   - **Te guía paso a paso** indicando qué pantallas capturar
   - Pantallas específicas según tu tipo de app (fitness: workout, stats, exercises, etc.)
   - Navegas manualmente, el sistema captura cuando presionas ENTER
   - Si no hay simulador, genera con IA como fallback

3. **Generación de Assets:**
   - Crea carpeta con el nombre de tu app
   - Genera Brief de Diseño completo (00-BRIEF-DE-DISEÑO.md)
   - Metadatos optimizados para ASO
   - Textos adaptados al mercado
   - Imágenes/screenshots

## Resultados

Los assets se guardan organizados en:
```
projects/
  └── nombre-de-tu-app/
      ├── 00-BRIEF-DE-DISEÑO.md  ← 📋 Lee esto primero!
      ├── metadata.json
      ├── metadata.yaml
      ├── manifest.json
      ├── README.md
      ├── screenshots/
      ├── texts/
      └── images/
```

Cada app tiene su propia carpeta dentro de `projects/` con todos sus assets organizados.

## Solución de problemas

### "Developer Tools" en lugar de la categoría correcta

Asegúrate de:
1. Usar `--` antes de los parámetros: `npm run analyze -- -p /ruta`
2. Que la ruta sea correcta y absoluta
3. Que el README sea descriptivo

### No captura screenshots del simulador

1. Abre el simulador iOS o emulador Android primero
2. Navega a la pantalla que quieres capturar
3. El sistema intentará detectarlo automáticamente

### Error de API

Verifica que tu `REPLICATE_API_TOKEN` sea válido:
```bash
npm run dev -- config
```
