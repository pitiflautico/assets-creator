# 📖 Guía Completa de Uso

## 🎯 Sistema Inteligente de Assets

Assets Creator ahora incluye **características avanzadas** para hacer el proceso mucho más inteligente y personalizado:

### ✨ Nuevas Características Inteligentes

1. **📸 Captura de Screenshots Reales del Simulador**
   - Captura screenshots directamente de tu simulador iOS/Android
   - Modo automático o interactivo
   - No genera imágenes falsas, usa TU app real

2. **🎨 Extracción de Paleta de Colores**
   - Analiza tu logo/iconos existentes
   - Extrae colores primarios, secundarios y acento
   - Genera assets con TUS colores reales
   - Calcula colores complementarios y análogos

3. **📝 Análisis Inteligente del README con IA**
   - Lee y comprende tu README con IA
   - Extrae propósito, audiencia target, features
   - Genera metadatos basados en INFO REAL
   - Detecta tono y estilo de tu app

4. **🧠 Mejores Metadatos**
   - Usa assets existentes como referencia
   - Paleta de colores real de tu app
   - Screenshots reales vs generados
   - Análisis profundo del README

---

## 📸 Capturar Screenshots del Simulador

### Preparación

#### iOS (Simulador)
```bash
# Abrir simulador con Xcode
open -a Simulator

# O desde línea de comandos
xcrun simctl boot "iPhone 15 Pro"
```

#### Android (Emulador)
```bash
# Listar emuladores disponibles
emulator -list-avds

# Iniciar emulador
emulator -avd Pixel_7_API_34
```

### Captura Automática

Captura múltiples screenshots automáticamente (cada 3 segundos):

```bash
# Capturar 5 screenshots
npm run start capture -- --count 5

# Especificar directorio de salida
npm run start capture -- --output ./my-screenshots --count 10
```

**Flujo:**
1. El sistema detecta el simulador
2. Te da tiempo para navegar
3. Captura cada 3 segundos
4. Guarda en `./screenshots/`

### Captura Interactiva

Captura screenshot cuando TÚ decidas:

```bash
npm run start capture -- --interactive
```

**Flujo:**
1. Navega a la pantalla que quieres
2. Presiona ENTER → captura
3. Navega a otra pantalla
4. Presiona ENTER → captura
5. Presiona "q" → terminar

### Ejemplo Completo

```bash
# 1. Abrir simulador
open -a Simulator

# 2. Abrir tu app en el simulador
# (react-native run-ios o similar)

# 3. Capturar screenshots
npm run start capture -- --interactive

# 4. Usar esos screenshots en la generación
npm run start generate
```

---

## 🎨 Extraer Paleta de Colores

El sistema extrae automáticamente la paleta de colores de:
- Logo de tu app
- Iconos existentes
- Assets visuales

### Análisis de Colores

```bash
# Analizar proyecto (incluye extracción de colores)
npm run start analyze
```

Verás:
```
🎨 Paleta de Colores Detectada:
   → Color primario: #007AFF
   → Secundarios: #5AC8FA, #FF9500
   → Total colores: 12
```

### Usar Colores en Generación

Cuando generas assets, el sistema usa automáticamente la paleta detectada:

```bash
npm run start generate
```

Los assets generados usarán:
- Tus colores reales
- Combinaciones armoniosas
- Paleta complementaria

---

## 📝 Análisis Inteligente del README

El sistema lee tu README con IA y extrae:

- **Descripción** clara de la app
- **Propósito principal** (qué problema resuelve)
- **Audiencia target** (para quién es)
- **Features clave** (lista de características)
- **USPs** (Unique Selling Points)
- **Categoría** correcta
- **Keywords** relevantes
- **Tono** (professional, casual, etc.)

### Ejemplo de README

Crea un buen README para mejores resultados:

```markdown
# Tabata Timer Pro

App de entrenamiento HIIT (High-Intensity Interval Training) con temporizador Tabata personalizable.

## Para Quién

Perfecto para atletas, entusiastas del fitness y personas que buscan entrenamientos efectivos en poco tiempo.

## Características

- ⏱️ Temporizador Tabata completamente personalizable
- 🔊 Alertas de voz y sonido
- 📊 Seguimiento de progreso y estadísticas
- 🎨 Temas y colores personalizables
- 📱 Funciona offline
- 💪 +50 entrenamientos predefinidos

## Tecnología

- React Native (iOS/Android)
- TypeScript
- AsyncStorage para datos locales
```

El sistema extraerá:
```
Categoría: Health & Fitness
Propósito: Entrenamiento HIIT con temporizador
Audiencia: Atletas y fitness enthusiasts
Keywords: tabata, hiit, interval, timer, workout, fitness
Tono: Professional + Friendly
```

---

## 🚀 Flujo Completo Recomendado

### Opción 1: Máxima Calidad (Todo Real)

```bash
# 1. Crear buen README
echo "# Mi App
Descripción detallada...
## Features
- Feature 1
- Feature 2
" > README.md

# 2. Abrir simulador y tu app
open -a Simulator
# Abre tu app (npm run ios o similar)

# 3. Capturar screenshots reales
npm run start capture -- --count 5

# 4. Generar todos los assets (usa screenshots reales + colores)
npm run start generate
```

### Opción 2: Solo Textos (Barato)

```bash
# 1. Asegurar buen README
cat README.md

# 2. Generar solo textos (usa README + código)
npm run start text-only
```

### Opción 3: Paso a Paso

```bash
# Paso 1: Analizar (ver qué detecta)
npm run start analyze

# Paso 2: Revisar lo detectado y ajustar README si es necesario

# Paso 3: Capturar screenshots
npm run start capture -- --interactive

# Paso 4: Generar assets
npm run start generate
```

---

## 🎯 Casos de Uso

### App de Fitness (Tabata)

```bash
# README debe mencionar: tabata, workout, fitness, hiit, etc.
# Logo debe tener colores energéticos

npm run start analyze
# Verás: Categoría: Health & Fitness ✓

npm run start capture -- --count 5
# Captura: pantalla principal, timer, estadísticas, configuración

npm run start generate
# Genera: Textos fitness + Screenshots reales + Colores de tu logo
```

### App de Productividad

```bash
# README debe mencionar: productivity, tasks, organize, etc.

npm run start text-only
# Genera: Descripciones profesionales + Keywords optimizados
```

### Developer Tool

```bash
# README técnico con: api, sdk, developer, code

npm run start generate --no-images
# Genera: Documentación técnica + Keywords developer-focused
```

---

## 💡 Tips para Mejores Resultados

### 1. README de Calidad

```markdown
✅ BUENO:
# Tabata Timer Pro
App de entrenamiento HIIT con temporizador personalizable.
Ideal para atletas que buscan entrenamientos efectivos.

❌ MALO:
# app
esto es una app
```

### 2. Logo/Iconos Claros

- Usa PNG con fondo transparente
- Colores vibrantes y consistentes
- Resolución mínima 512x512

### 3. Screenshots del Simulador

- Captura pantallas clave: home, features principales
- Usa datos de ejemplo (no pantalla vacía)
- Modo claro (evita modo oscuro si la app no lo soporta bien)

### 4. Estructura del Proyecto

```
mi-app/
├── README.md              ← Detallado y claro
├── assets/
│   ├── icon.png          ← Logo/icono principal
│   └── logo.png
├── src/                  ← Código bien organizado
└── package.json          ← Descripción y keywords
```

---

## 🔧 Configuración Avanzada

### Personalizar Extracción de Colores

```typescript
import { ColorExtractor } from '@assets-creator/core';

const extractor = new ColorExtractor();

// Extraer de logo
const palette = await extractor.extractPalette('./assets/logo.png');

console.log('Colores:', palette.primary, palette.secondary);
```

### Captura Programática

```typescript
import { ScreenshotCapture } from '@assets-creator/core';

const capture = new ScreenshotCapture('./output');

// Detectar
const sims = await capture.detectSimulators();

// Capturar
if (sims.ios) {
  const screenshot = await capture.captureIOSScreenshot();
}
```

### Análisis de README Programático

```typescript
import { ReadmeAnalyzer } from '@assets-creator/core';

const analyzer = new ReadmeAnalyzer(config);
const analysis = await analyzer.analyzeReadme(readmeContent);

console.log('Propósito:', analysis.mainPurpose);
console.log('Features:', analysis.keyFeatures);
```

---

## ❓ Troubleshooting

### "No se detectaron simuladores"

**iOS:**
```bash
# Verificar simuladores disponibles
xcrun simctl list devices

# Iniciar simulador
open -a Simulator
```

**Android:**
```bash
# Verificar que adb funcione
adb devices

# Si no aparece nada, reiniciar adb
adb kill-server
adb start-server
```

### "No se pudo extraer paleta de colores"

- Verifica que existan iconos en `./assets/`, `./public/`, etc.
- Usa formato PNG
- Asegura que el icono tenga colores (no solo blanco/negro)

### "README no analizado con IA"

- Verifica que `REPLICATE_API_TOKEN` esté configurado
- Asegura que README tenga al menos 50 caracteres
- Revisa que tengas créditos en Replicate

---

## 📚 Próximos Pasos

Después de generar assets:

1. **Revisar generated_assets/**
   - metadata.json
   - Textos en /texts
   - Screenshots en /images

2. **Ajustar si es necesario**
   - Editar descripciones
   - Cambiar keywords
   - Reordenar screenshots

3. **Usar en tu publicación**
   - App Store: usar textos + screenshots
   - Google Play: usar descripciones + gráficos
   - Website: usar contenido + imágenes

---

¿Preguntas? Abre un issue en GitHub o consulta la documentación completa en el README.md principal.
