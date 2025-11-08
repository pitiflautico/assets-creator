import Replicate from 'replicate';
import { AppData, GeneratorConfig } from '../types';
import * as fs from 'fs';

/**
 * Generador de Brief de Diseño Completo
 * Crea un documento detallado con TODA la información necesaria para diseñar assets
 */
export class DesignBriefGenerator {
  private replicate: Replicate;
  private config: GeneratorConfig;

  constructor(config: GeneratorConfig) {
    this.config = config;
    this.replicate = new Replicate({
      auth: config.replicateApiKey,
    });
  }

  /**
   * Genera un brief completo de diseño
   */
  async generateCompleteBrief(
    appData: AppData,
    analysisResult: any
  ): Promise<string> {
    console.log('📋 Generando brief completo de diseño...');

    let brief = `# Brief de Diseño Completo: ${appData.name}

Generado: ${new Date().toLocaleString()}

---

## 📱 INFORMACIÓN DE LA APP

### Nombre y Versión
- **Nombre:** ${appData.name}
- **Versión:** ${appData.version || '1.0.0'}
- **Plataforma:** ${appData.platform}

### Descripción
${appData.description || 'No disponible'}

### README Completo
${this.formatReadme(appData.readme)}

---

## 🎯 ANÁLISIS DE MERCADO

### Categoría
- **Categoría Principal:** ${appData.category}`;

    if (analysisResult.categoryDetection) {
      brief += `
- **Subcategoría:** ${analysisResult.categoryDetection.subcategory || 'N/A'}
- **Tipo de App:** ${analysisResult.categoryDetection.appType}
- **Nivel de Confianza:** ${analysisResult.categoryDetection.confidence}%

**Razonamiento de Categorización:**
${analysisResult.categoryDetection.reasoning}`;
    }

    brief += `

### Audiencia Objetivo
${analysisResult.readmeAnalysis?.targetAudience || appData.targetAudience || 'Usuarios generales'}

### Propósito Principal
${analysisResult.readmeAnalysis?.mainPurpose || 'No especificado'}

---

## ✨ CARACTERÍSTICAS Y FUNCIONALIDADES

### Features Principales
`;

    if (appData.features && appData.features.length > 0) {
      appData.features.forEach((feature, i) => {
        brief += `${i + 1}. ${feature}\n`;
      });
    } else {
      brief += 'No se detectaron features específicos.\n';
    }

    if (analysisResult.readmeAnalysis?.uniqueSellingPoints &&
        analysisResult.readmeAnalysis.uniqueSellingPoints.length > 0) {
      brief += `\n### Puntos de Venta Únicos (USPs)\n`;
      analysisResult.readmeAnalysis.uniqueSellingPoints.forEach((usp: string, i: number) => {
        brief += `${i + 1}. ${usp}\n`;
      });
    }

    brief += `
### Tecnologías Utilizadas
${appData.sourceCode?.technologies?.join(', ') || 'No especificadas'}

### Frameworks
${appData.sourceCode?.frameworks?.join(', ') || 'No especificados'}

---

## 🎨 GUÍA DE DISEÑO VISUAL

### Paleta de Colores
`;

    if (analysisResult.colorPalette) {
      brief += `
**Color Primario:** ${analysisResult.colorPalette.primary}

**Colores Secundarios:**
${analysisResult.colorPalette.secondary.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}

**Colores Adicionales:**
${analysisResult.colorPalette.allColors.slice(0, 10).map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}

**Color de Acento:** ${analysisResult.colorPalette.accent}

> **Nota:** Estos colores fueron extraídos automáticamente de los assets existentes de la aplicación.
`;
    } else {
      brief += `
⚠️ **No se encontraron logos/iconos para extraer paleta de colores.**

**Recomendación:** Definir paleta basándose en:
- La categoría de la app: ${appData.category}
- El público objetivo
- Tendencias de diseño en la categoría

Sugerencias de paleta según la categoría:
${this.suggestColorPalette(appData.category || 'App')}
`;
    }

    brief += `

### Estilo Visual
- **Tono General:** ${analysisResult.readmeAnalysis?.tone || 'Profesional'}
- **Categoría de Diseño:** ${appData.category}
- **Plataforma Target:** ${appData.platform}

### Recomendaciones de Diseño
${this.getDesignRecommendations(appData.category || 'App')}

---

## 📝 CONTENIDO Y MENSAJES

### Keywords y Términos Clave
`;

    if (analysisResult.dynamicKeywords) {
      brief += `
**Keywords Primarios:**
${analysisResult.dynamicKeywords.primary.map((k: string, i: number) => `${i + 1}. ${k}`).join('\n')}

**Keywords Secundarios:**
${analysisResult.dynamicKeywords.secondary.map((k: string, i: number) => `${i + 1}. ${k}`).join('\n')}

**Long-tail Keywords:**
${analysisResult.dynamicKeywords.longTail.map((k: string, i: number) => `${i + 1}. ${k}`).join('\n')}

**Keywords Trending:**
${analysisResult.dynamicKeywords.trending.map((k: string, i: number) => `${i + 1}. ${k}`).join('\n')}
`;
    } else if (appData.keywords && appData.keywords.length > 0) {
      brief += `\n${appData.keywords.map((k, i) => `${i + 1}. ${k}`).join('\n')}\n`;
    }

    brief += `
### Mensajes Clave
- **Propuesta de Valor:** ${this.extractValueProposition(appData, analysisResult)}
- **Tono de Comunicación:** ${analysisResult.readmeAnalysis?.tone || 'Profesional y claro'}

---

## 📸 ASSETS VISUALES NECESARIOS

### Iconos de Aplicación
- **Tamaños Requeridos:**
  - iOS: 1024x1024px (App Store)
  - iOS: 180x180px, 120x120px, 87x87px (dispositivos)
  - Android: 512x512px (Play Store)
  - Android: 192x192px, 144x144px, 96x96px (dispositivos)

**Especificaciones del Icono:**
- Debe ser simple y reconocible
- Usar paleta de colores de la marca
- Representar visualmente el propósito de la app
- Funcionar bien en diferentes tamaños
- Sin texto (solo iconografía)

### Screenshots de la Aplicación
`;

    if (analysisResult.capturedScreenshots && analysisResult.capturedScreenshots.length > 0) {
      brief += `
✅ **${analysisResult.capturedScreenshots.length} Screenshots capturados del simulador:**
${analysisResult.capturedScreenshots.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}

> **Nota:** Usar estos screenshots REALES como base para los assets finales.
`;
    } else {
      brief += `
**Screenshots a Crear (${this.getScreenshotCount(appData.platform)}):**
${this.getScreenshotRequirements(appData)}

⚠️ **No se capturaron screenshots del simulador.**
**Acción:** Abrir simulador y capturar pantallas reales de la app.
`;
    }

    brief += `

### Banners y Graphics
- **Feature Graphic** (Google Play): 1024x500px
- **Banner Promocional**: 1920x1080px
- **Thumbnails para redes sociales**: 1200x628px

---

## 🎯 REQUISITOS ESPECÍFICOS POR PLATAFORMA

### iOS App Store
- **App Icon:** 1024x1024px
- **Screenshots:** ${appData.platform === 'ios' ? '6.5" (1242x2688px) y 5.5" (1242x2208px)' : 'Según dispositivo'}
- **App Preview Video:** Opcional (máx 30 seg)

### Google Play Store
- **App Icon:** 512x512px
- **Feature Graphic:** 1024x500px
- **Screenshots:** Mínimo 2, máximo 8
- **Promo Video:** Opcional (YouTube link)

### Web/Desktop
${this.getWebRequirements(appData.platform)}

---

## 📋 CHECKLIST DE ASSETS

### Esenciales
- [ ] Icono de app (todos los tamaños)
- [ ] Screenshots principales (mín. 5)
- [ ] Descripción corta (160 caracteres)
- [ ] Descripción completa (hasta 4000 caracteres)

### Recomendados
- [ ] Feature graphic / Banner
- [ ] Video preview
- [ ] Assets para redes sociales
- [ ] Promotional images

### Opcional
- [ ] Assets estacionales
- [ ] Variaciones A/B testing
- [ ] Material de prensa

---

## 💡 RECOMENDACIONES FINALES

${await this.generateFinalRecommendations(appData, analysisResult)}

---

## 📚 RECURSOS Y REFERENCIAS

### Assets Existentes
${this.listExistingAssets(appData.existingAssets)}

### Directrices de Diseño
- **iOS Human Interface Guidelines:** https://developer.apple.com/design/
- **Material Design (Android):** https://material.io/design
- **App Store Guidelines:** https://developer.apple.com/app-store/

---

**Fin del Brief de Diseño**

> Este documento fue generado automáticamente mediante análisis inteligente con IA.
> Todos los datos se extrajeron del código fuente, README y assets existentes de la aplicación.
`;

    return brief;
  }

  /**
   * Formatea el README para el brief
   */
  private formatReadme(readme?: string): string {
    if (!readme || readme.trim().length === 0) {
      return '⚠️ README no disponible o vacío.\n\n**Recomendación:** Crear un README detallado con descripción, features y uso de la app.';
    }

    // Limitar a primeros 2000 caracteres si es muy largo
    if (readme.length > 2000) {
      return readme.substring(0, 2000) + '\n\n...(README completo disponible en el proyecto)';
    }

    return readme;
  }

  /**
   * Sugiere paleta de colores según categoría
   */
  private suggestColorPalette(category: string): string {
    const palettes: Record<string, string> = {
      'Health & Fitness': '- Primario: Verde energético (#4CAF50) o Naranja vibrante (#FF5722)\n- Secundarios: Azul salud (#2196F3), Blanco (#FFFFFF)\n- Acento: Amarillo motivacional (#FFC107)',
      'Music': '- Primario: Púrpura (#9C27B0) o Azul oscuro (#1976D2)\n- Secundarios: Rosa (#E91E63), Negro (#212121)\n- Acento: Cyan (#00BCD4)',
      'Productivity': '- Primario: Azul profesional (#2196F3)\n- Secundarios: Gris (#607D8B), Verde (#4CAF50)\n- Acento: Naranja (#FF9800)',
      'Social': '- Primario: Azul social (#1DA1F2) o Rosa (#E91E63)\n- Secundarios: Púrpura (#9C27B0), Blanco\n- Acento: Amarillo (#FFEB3B)',
      'Games': '- Primario: Rojo (#F44336) o Púrpura (#9C27B0)\n- Secundarios: Amarillo (#FFEB3B), Verde (#4CAF50)\n- Acento: Cyan (#00BCD4)',
    };

    return palettes[category] || '- Definir según identidad de marca y público objetivo';
  }

  /**
   * Recomendaciones de diseño por categoría
   */
  private getDesignRecommendations(category: string): string {
    const recommendations: Record<string, string> = {
      'Health & Fitness': `
- Usar imágenes de personas activas y saludables
- Colores energéticos y motivacionales
- Iconografía clara de ejercicios/actividades
- Mostrar datos y progreso de forma visual
- Estilo moderno y limpio`,

      'Music': `
- Visualizadores de audio y ondas sonoras
- Colores vibrantes y dinámicos
- Iconografía musical clara
- Degradados y efectos visuales
- Estilo moderno con toques artísticos`,

      'Productivity': `
- Diseño limpio y minimalista
- Colores profesionales (azules, grises)
- Iconografía clara de funciones
- Enfoque en organización visual
- Estilo corporativo y moderno`,
    };

    return recommendations[category] || `
- Diseño acorde a la función principal de la app
- Paleta de colores consistente
- Iconografía clara y comprensible
- Estilo moderno y atractivo`;
  }

  /**
   * Extrae propuesta de valor
   */
  private extractValueProposition(appData: AppData, analysisResult: any): string {
    if (analysisResult.readmeAnalysis?.mainPurpose) {
      return analysisResult.readmeAnalysis.mainPurpose;
    }

    if (appData.description) {
      return appData.description;
    }

    return `${appData.name} - ${appData.category} app for ${appData.platform}`;
  }

  /**
   * Cuenta de screenshots requeridos
   */
  private getScreenshotCount(platform?: string): number {
    const counts: Record<string, number> = {
      ios: 6,
      android: 8,
      web: 5,
      desktop: 4,
      multiplatform: 8,
    };

    return counts[platform || 'multiplatform'] || 5;
  }

  /**
   * Requisitos de screenshots
   */
  private getScreenshotRequirements(appData: AppData): string {
    const features = appData.features?.slice(0, 5) || [];
    const requirements = [
      '1. Pantalla principal / Home',
      '2. Funcionalidad principal en acción',
      '3. Pantalla de configuración / Ajustes',
      ...features.slice(0, 3).map((f, i) => `${i + 4}. ${f}`),
    ];

    return requirements.join('\n');
  }

  /**
   * Requisitos web
   */
  private getWebRequirements(platform?: string): string {
    if (platform === 'web' || platform === 'multiplatform') {
      return `
- **Favicon:** 16x16px, 32x32px
- **Open Graph Image:** 1200x630px
- **Screenshot desktop:** 1920x1080px
- **Screenshot mobile:** 375x812px
- **Logo para navbar:** SVG o PNG transparente`;
    }

    return 'N/A - App no tiene versión web';
  }

  /**
   * Genera recomendaciones finales
   */
  private async generateFinalRecommendations(
    appData: AppData,
    analysisResult: any
  ): string {
    const recommendations = [];

    // Recomendación de colores
    if (!analysisResult.colorPalette) {
      recommendations.push('1. **Definir paleta de colores:** No se detectaron logos/iconos. Crear una paleta coherente basada en la categoría y público objetivo.');
    } else {
      recommendations.push('1. **Usar paleta existente:** Se detectó paleta de colores. Mantener consistencia con estos colores en todos los assets.');
    }

    // Recomendación de screenshots
    if (!analysisResult.capturedScreenshots || analysisResult.capturedScreenshots.length === 0) {
      recommendations.push('2. **Capturar screenshots reales:** Abrir simulador y capturar pantallas reales de la app para mayor autenticidad.');
    } else {
      recommendations.push('2. **Optimizar screenshots capturados:** Agregar overlays con textos explicativos y highlights de features.');
    }

    // Recomendación de contenido
    if (!appData.readme || appData.readme.length < 200) {
      recommendations.push('3. **Mejorar documentación:** Crear README detallado con descripción clara, features y casos de uso.');
    }

    // Recomendación ASO
    recommendations.push(`4. **Optimización ASO:** Usar los keywords generados dinámicamente en título, descripción y metadatos de la app.`);

    // Recomendación de testing
    recommendations.push(`5. **A/B Testing:** Probar diferentes variantes de iconos y screenshots para optimizar conversión.`);

    // Recomendación de actualización
    recommendations.push(`6. **Mantener actualizado:** Actualizar screenshots cuando se añadan nuevas features importantes.`);

    return recommendations.join('\n\n');
  }

  /**
   * Lista assets existentes
   */
  private listExistingAssets(existingAssets?: any): string {
    if (!existingAssets) {
      return 'No se detectaron assets existentes en el proyecto.';
    }

    let list = '';

    if (existingAssets.icons && existingAssets.icons.length > 0) {
      list += `\n**Iconos encontrados (${existingAssets.icons.length}):**\n`;
      existingAssets.icons.slice(0, 5).forEach((icon: string) => {
        list += `- ${icon}\n`;
      });
    }

    if (existingAssets.screenshots && existingAssets.screenshots.length > 0) {
      list += `\n**Screenshots encontrados (${existingAssets.screenshots.length}):**\n`;
      existingAssets.screenshots.slice(0, 5).forEach((ss: string) => {
        list += `- ${ss}\n`;
      });
    }

    if (existingAssets.images && existingAssets.images.length > 0) {
      list += `\n**Imágenes encontradas (${existingAssets.images.length}):**\n`;
      existingAssets.images.slice(0, 5).forEach((img: string) => {
        list += `- ${img}\n`;
      });
    }

    return list || 'No se encontraron assets existentes.';
  }
}
