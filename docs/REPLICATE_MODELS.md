# Modelos de Replicate Disponibles

El sistema ahora utiliza diferentes modelos de Replicate según el tipo de imagen a generar, aprovechando el extenso catálogo disponible en https://replicate.com/explore

## Modelos Implementados

### 🎨 Flux Schnell (Iconos y Logos)
- **Modelo:** `black-forest-labs/flux-schnell`
- **Uso:** Generación de iconos de app y logos
- **Ventajas:**
  - Alta calidad para imágenes pequeñas
  - Excelente para diseños simples y vectoriales
  - Rápido y eficiente
  - Perfecto para iconos de app

### 🌅 SDXL (Splash Screens)
- **Modelo:** `stability-ai/sdxl`
- **Uso:** Pantallas splash y fondos
- **Ventajas:**
  - Soporta imágenes grandes (hasta 2048x2048)
  - Excelente para gradientes y backgrounds
  - Gran calidad fotorrealista

## Otros Modelos Recomendados

Puedes explorar y agregar estos modelos especializados:

### Para Logos Profesionales
```typescript
// Logo Diffusion - Especializado en logos
model: 'thefuturejoe/logoai'

// Ideogram - Excelente para texto en logos
model: 'ideogram-ai/ideogram-v2'
```

### Para Ilustraciones
```typescript
// Flux Pro - Máxima calidad
model: 'black-forest-labs/flux-pro'

// Playground v2.5 - Diseño gráfico
model: 'playgroundai/playground-v2.5-1024px-aesthetic'
```

### Para Íconos Minimalistas
```typescript
// Stable Diffusion 3
model: 'stability-ai/stable-diffusion-3'

// Kandinsky 2.2
model: 'ai-forever/kandinsky-2.2'
```

## Cómo Agregar Nuevos Modelos

Para usar un modelo diferente, edita `/src/branding.ts`:

```typescript
private async generateWithReplicate(
  prompt: string,
  outputPath: string,
  size: number,
  type: 'icon' | 'splash' | 'general' = 'general'
): Promise<void> {
  // ...

  if (type === 'icon') {
    // Cambia el modelo aquí
    model = 'tu-modelo-favorito/nombre-modelo';
    input = {
      prompt: prompt,
      // Parámetros específicos del modelo
    };
  }

  // ...
}
```

## Explorar Modelos

Visita https://replicate.com/explore para ver:
- 🎨 Modelos de generación de imágenes
- 🎭 Modelos especializados (logos, íconos, UI)
- ⚡ Velocidad y costos de cada modelo
- 📊 Comparativas de calidad

## Costos Aproximados

| Modelo | Costo por imagen | Tiempo | Calidad |
|--------|------------------|--------|---------|
| Flux Schnell | ~$0.003 | 1-2s | ⭐⭐⭐⭐ |
| SDXL | ~$0.02 | 3-5s | ⭐⭐⭐⭐⭐ |
| Flux Pro | ~$0.055 | 5-8s | ⭐⭐⭐⭐⭐ |

## Consejos

1. **Para logos simples:** Flux Schnell es perfecto y económico
2. **Para alta calidad:** SDXL o Flux Pro
3. **Para experimentar:** Prueba diferentes modelos del catálogo
4. **Para producción:** SDXL es un buen equilibrio calidad/precio

## Ejemplos de Prompts por Modelo

### Flux Schnell (Iconos)
```
A minimalist app icon, [tema], flat design,
simple shapes, bold colors, modern, clean,
professional, centered, no text
```

### SDXL (Splash)
```
Abstract gradient background, [colores],
smooth transitions, modern, professional,
mobile wallpaper, 4k quality
```

## Referencias

- Catálogo completo: https://replicate.com/explore
- Documentación API: https://replicate.com/docs
- Comparador de modelos: https://replicate.com/collections
