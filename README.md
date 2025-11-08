# 🚀 Assets Creator

**Sistema inteligente de creación de assets para aplicaciones con IA (Replicate)**

Assets Creator es una herramienta completa e inteligente que analiza tu aplicación y genera automáticamente todos los assets necesarios para publicarla en app stores, incluyendo:

- 📝 Textos y descripciones optimizadas (ASO)
- 🎨 Imágenes (iconos, screenshots, banners)
- 🏷️ Keywords y tags
- 📊 Metadatos completos
- 🎯 Optimización para App Store y Google Play
- 📱 Material de marketing

## ✨ Características

- **🤖 Inteligencia Artificial**: Usa modelos de Replicate (Llama 3, SDXL) para generar contenido de alta calidad
- **📊 Análisis Inteligente**: Lee tu código, package.json, README y extrae información automáticamente
- **🎯 ASO (App Store Optimization)**: Optimiza keywords, títulos y descripciones para máxima visibilidad
- **🎨 Generación de Imágenes**: Crea iconos, screenshots y banners con IA
- **📈 Market Insights**: Conocimiento incorporado de qué funciona en app stores
- **🌍 Multi-plataforma**: Soporta iOS, Android, Web y Desktop
- **⚡ Rápido y Fácil**: CLI simple y modo interactivo

## 🎬 Demo Rápida

```bash
# Generar todos los assets
npx assets-creator generate

# Modo interactivo
npx assets-creator interactive

# Solo textos (sin imágenes)
npx assets-creator text-only
```

## 📦 Instalación

### Opción 1: Uso global

```bash
npm install -g @assets-creator/core
```

### Opción 2: Uso en proyecto

```bash
npm install @assets-creator/core --save-dev
```

### Opción 3: Uso directo con npx

```bash
npx @assets-creator/core generate
```

## ⚙️ Configuración

### 1. Obtener API Key de Replicate

1. Ve a [https://replicate.com](https://replicate.com)
2. Crea una cuenta o inicia sesión
3. Ve a [Account > API Tokens](https://replicate.com/account/api-tokens)
4. Copia tu API token

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz de tu proyecto:

```bash
# Obligatorio
REPLICATE_API_TOKEN=r8_tu_token_aqui

# Opcional
OPENAI_API_KEY=sk_tu_key_aqui
DEFAULT_IMAGE_MODEL=stability-ai/sdxl
DEFAULT_LLM_MODEL=meta/meta-llama-3-70b-instruct
OUTPUT_DIR=./generated_assets
```

### 3. Verificar Configuración

```bash
assets-creator config
```

## 🎯 Uso

### CLI (Command Line Interface)

#### Generar Todos los Assets

```bash
# Proyecto actual
assets-creator generate

# Proyecto específico
assets-creator generate -p /path/to/project

# Sin imágenes
assets-creator generate --no-images

# Personalizar número de imágenes
assets-creator generate --image-count 10
```

#### Solo Análisis

```bash
assets-creator analyze
```

#### Solo Textos

```bash
assets-creator text-only
```

#### Solo Imágenes

```bash
assets-creator images-only --count 5
```

#### Modo Interactivo

```bash
assets-creator interactive
```

### Uso Programático

```typescript
import { AssetsCreator } from '@assets-creator/core';

const creator = new AssetsCreator({
  replicateApiKey: 'tu_api_key',
  outputDir: './generated_assets',
  preferences: {
    language: 'es',
    tone: 'professional',
    generateImages: true,
    imageCount: 5,
  },
});

// Generar todo
const bundle = await creator.generateAll('./mi-proyecto');

// Solo textos
const textBundle = await creator.generateTextOnly('./mi-proyecto');

// Solo análisis
const appData = await creator.analyzeOnly('./mi-proyecto');
```

## 📊 ¿Qué Genera?

### Estructura de Salida

```
generated_assets/
├── README.md                      # Resumen de assets generados
├── manifest.yaml                  # Manifest completo
├── metadata.json                  # Metadatos estructurados
├── aso-optimization.json          # Análisis ASO detallado
│
├── texts/
│   ├── app-store-description.txt  # Descripción para App Store
│   ├── play-store-description.txt # Descripción para Play Store
│   ├── website-content.md         # Contenido para sitio web
│   └── social-media-posts.txt     # Posts para redes sociales
│
└── images/
    ├── icons/
    │   ├── icon-1024x1024.png    # Diferentes tamaños
    │   ├── icon-512x512.png
    │   └── ...
    ├── screenshot-*.png           # Screenshots promocionales
    ├── banner-*.png               # Banners de marketing
    └── feature-*.png              # Gráficos de features
```

### Metadatos Generados

- **Título optimizado** (máx 30 caracteres, SEO optimizado)
- **Descripción corta** (160 caracteres, para resumen)
- **Descripción completa** (1000-2000 caracteres, ASO optimizado)
- **Keywords primarios** (10 keywords de alta prioridad)
- **Keywords secundarios** (20 keywords complementarios)
- **Tags** (20 tags relevantes)
- **Subtitle** (para App Store)
- **Promotional text** (para Play Store)
- **What's New** (notas de actualización)

### Optimización ASO

- Análisis de keyword density
- Score de legibilidad (Flesch Reading Ease)
- Sugerencias de títulos (5 variantes)
- Variantes de descripción (3 versiones)
- Hooks de conversión
- Trust signals
- Call-to-actions optimizados
- Análisis competitivo

### Imágenes Generadas

- **App Icon**: Icono principal en múltiples tamaños
- **Screenshots**: 5 screenshots promocionales
- **Banners**: Banners hero y feature
- **Feature Graphics**: Ilustraciones de características

## 🧠 Inteligencia Incorporada

Assets Creator incluye conocimiento incorporado sobre:

### ASO (App Store Optimization)

- Keywords efectivos por categoría
- Power words que aumentan conversión
- Palabras a evitar
- Mejores prácticas de títulos y descripciones
- Trust signals efectivos
- CTAs optimizados

### Categorías Soportadas

- Productivity
- Social
- Entertainment
- Business
- Education
- Developer Tools
- Utilities
- Health & Fitness
- Finance

### Tecnologías Detectadas

- TypeScript, JavaScript, Python, Java, Swift, Kotlin
- React, Vue, Angular, Next.js
- Express, NestJS, Django, Flask
- React Native, Ionic, Electron

## 🔧 Configuración Avanzada

### Modelos Personalizados

```typescript
const creator = new AssetsCreator({
  models: {
    llm: 'meta/meta-llama-3-70b-instruct',
    image: 'stability-ai/sdxl',
  },
});
```

### Ver Modelos Disponibles

```bash
assets-creator models
```

### Preferencias

```typescript
const creator = new AssetsCreator({
  preferences: {
    language: 'es',           // 'en', 'es', 'fr', etc.
    tone: 'professional',     // 'professional', 'casual', 'technical', 'friendly'
    targetMarket: ['global', 'latam', 'us'],
    generateImages: true,
    imageCount: 5,
  },
});
```

## 📚 Ejemplos

### Ejemplo 1: App de Productividad

```bash
cd mi-app-de-tareas
assets-creator generate
```

**Resultado**: Genera descripciones optimizadas para una app de productividad, con keywords como "task management", "organize", "productivity", iconos profesionales y screenshots limpios.

### Ejemplo 2: Game/Entretenimiento

```bash
assets-creator generate --image-count 10
```

**Resultado**: Genera más imágenes promocionales, descripciones emocionantes y keywords de gaming.

### Ejemplo 3: Developer Tool

```bash
assets-creator text-only
```

**Resultado**: Genera documentación técnica, keywords developer-focused, sin imágenes innecesarias.

## 🤝 Integración CI/CD

### GitHub Actions

```yaml
name: Generate Assets
on:
  push:
    branches: [main]

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install -g @assets-creator/core
      - run: assets-creator generate
        env:
          REPLICATE_API_TOKEN: ${{ secrets.REPLICATE_API_TOKEN }}
      - uses: actions/upload-artifact@v2
        with:
          name: generated-assets
          path: generated_assets/
```

## 🎨 Personalización de Prompts

Para personalizar los prompts de generación, puedes extender las clases:

```typescript
import { TextGenerator } from '@assets-creator/core';

class CustomTextGenerator extends TextGenerator {
  protected buildTitlePrompt(appData: AppData): string {
    return `Mi prompt personalizado: ${appData.name}...`;
  }
}
```

## 🐛 Troubleshooting

### "REPLICATE_API_TOKEN no configurado"

**Solución**: Crea archivo `.env` con tu API token de Replicate.

### "Error generando imágenes"

**Solución**:
- Verifica tu API token
- Verifica que tengas créditos en Replicate
- Usa `--no-images` para generar solo textos

### "Rate limit exceeded"

**Solución**: Replicate tiene límites de rate. Espera unos minutos o upgradea tu plan.

## 💰 Costos

Assets Creator usa Replicate, que cobra por uso:

- **Modelos LLM**: ~$0.001-0.01 por request
- **Modelos de Imagen**: ~$0.02-0.10 por imagen

**Estimado**: Generar un set completo de assets (textos + 5 imágenes) cuesta aproximadamente **$0.50 - $1.00 USD**.

Replicate ofrece créditos gratuitos al registrarse.

## 📄 Licencia

MIT

## 🤝 Contribuir

¡Contribuciones son bienvenidas!

1. Fork el proyecto
2. Crea una branch (`git checkout -b feature/amazing`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la branch (`git push origin feature/amazing`)
5. Abre un Pull Request

## 🌟 Roadmap

- [ ] Soporte para más idiomas
- [ ] Integración con APIs de app stores
- [ ] Análisis competitivo real
- [ ] Generación de video trailers
- [ ] A/B testing de metadatos
- [ ] Soporte para más modelos de IA
- [ ] Dashboard web

## 📞 Soporte

- 🐛 Issues: [GitHub Issues](https://github.com/tu-repo/assets-creator/issues)
- 📧 Email: support@assets-creator.com
- 💬 Discord: [Join our community](https://discord.gg/assets-creator)

## 🙏 Agradecimientos

- [Replicate](https://replicate.com) - Por su increíble plataforma de IA
- [Stability AI](https://stability.ai) - SDXL model
- [Meta](https://meta.com) - Llama models

---

**Hecho con ❤️ y 🤖 por la comunidad**
