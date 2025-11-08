import * as path from 'path';
import { EnhancedAnalyzer } from './analyzers/EnhancedAnalyzer';
import { TextGenerator } from './generators/TextGenerator';
import { ImageGenerator } from './generators/ImageGenerator';
import { ASOOptimizer } from './aso/ASOOptimizer';
import { getDefaultConfig, validateConfig } from './config/config';
import { saveJSON, saveYAML, saveText, ensureDir } from './utils/fileUtils';
import { AppData, AssetBundle, GeneratorConfig } from './types';

/**
 * Motor principal de Assets Creator
 * COMPLETAMENTE INTELIGENTE - usa assets reales, análisis con IA, screenshots del simulador
 */
export class AssetsCreator {
  private config: GeneratorConfig;
  private enhancedAnalyzer: EnhancedAnalyzer;
  private textGenerator: TextGenerator;
  private imageGenerator: ImageGenerator;
  private asoOptimizer: ASOOptimizer;
  private projectPath: string;

  constructor(config?: Partial<GeneratorConfig>) {
    this.config = getDefaultConfig(config);

    // Validar configuración
    const validation = validateConfig(this.config);
    if (!validation.valid) {
      throw new Error(`Configuración inválida:\n${validation.errors.join('\n')}`);
    }

    this.projectPath = process.cwd();

    // Inicializar con EnhancedAnalyzer (NO el básico)
    this.enhancedAnalyzer = new EnhancedAnalyzer(this.projectPath, this.config);
    this.textGenerator = new TextGenerator(this.config);
    this.imageGenerator = new ImageGenerator(this.config);
    this.asoOptimizer = new ASOOptimizer(this.config);
  }

  /**
   * Genera todos los assets de forma INTELIGENTE
   * - Usa screenshots REALES del simulador
   * - Extrae colores REALES de tu logo
   * - Analiza README con IA
   * - Detecta categoría dinámicamente
   * - Genera keywords específicos
   */
  async generateAll(projectPath?: string): Promise<AssetBundle> {
    console.log('🚀 Assets Creator - Sistema Inteligente 100% Real');
    console.log('═══════════════════════════════════════════════════════\n');

    // Actualizar path si se proporciona
    if (projectPath) {
      this.projectPath = projectPath;
      this.enhancedAnalyzer = new EnhancedAnalyzer(projectPath, this.config);
    }

    try {
      // 1. Análisis INTELIGENTE completo
      console.log('🔍 Análisis Inteligente del Proyecto\n');
      const analysisResult = await this.enhancedAnalyzer.analyze();

      // Extraer datos del análisis mejorado
      const appData: AppData = {
        name: analysisResult.name,
        description: analysisResult.description,
        version: analysisResult.version,
        category: analysisResult.category,
        keywords: analysisResult.keywords,
        features: analysisResult.features,
        targetAudience: analysisResult.targetAudience,
        platform: analysisResult.platform,
        packageJson: analysisResult.packageJson,
        readme: analysisResult.readme,
        sourceCode: analysisResult.sourceCode,
        existingAssets: analysisResult.existingAssets,
      };

      // Mostrar resumen del análisis
      this.logAnalysisResults(analysisResult);

      // 2. Generar metadatos y textos
      console.log('\n📝 Generando metadatos y textos optimizados...\n');
      const metadata = await this.textGenerator.generateMetadata(appData);

      // 3. Optimizar ASO
      console.log('\n🎯 Optimizando ASO...\n');
      const aso = await this.asoOptimizer.optimize(appData, metadata);

      // 4. Generar/Usar imágenes
      console.log('\n🎨 Procesando assets visuales...\n');
      let images = [];

      // Si capturamos screenshots del simulador, usarlos
      if (analysisResult.capturedScreenshots && analysisResult.capturedScreenshots.length > 0) {
        console.log(`✓ Usando ${analysisResult.capturedScreenshots.length} screenshots REALES del simulador`);
        images = analysisResult.capturedScreenshots.map((path, i) => ({
          url: '',
          localPath: path,
          type: 'screenshot',
          prompt: 'Real screenshot from simulator',
          model: 'simulator',
          metadata: { width: 0, height: 0, format: 'png' },
        }));
      } else {
        console.log('ℹ️  No hay screenshots del simulador, generando con IA...');
        // Solo generar con IA si no hay screenshots reales
        const generatedImages = await this.imageGenerator.generateAllAssets(appData);
        images = generatedImages;
      }

      // Si tenemos paleta de colores, pasarla al generador de imágenes
      if (analysisResult.colorPalette) {
        console.log(`🎨 Usando paleta de colores REAL de tu app:`);
        console.log(`   Primario: ${analysisResult.colorPalette.primary}`);
        console.log(`   Secundarios: ${analysisResult.colorPalette.secondary.join(', ')}`);
      }

      // 5. Generar textos adicionales
      console.log('\n✍️  Generando contenido adicional...\n');
      const socialMedia = await this.textGenerator.generateSocialMediaContent(appData);
      const websiteContent = await this.textGenerator.generateWebsiteContent(appData);

      // 6. Obtener insights de mercado
      console.log('\n📈 Analizando mercado...\n');
      const marketInsights = await this.asoOptimizer.getMarketInsights(appData);

      // Crear bundle completo
      const bundle: AssetBundle = {
        metadata,
        aso,
        images,
        texts: {
          appStoreDescription: metadata.fullDescription,
          playStoreDescription: metadata.fullDescription,
          websiteContent: websiteContent,
          socialMediaPosts: socialMedia,
        },
        marketingMaterials: {
          adCopy: aso.titleSuggestions,
        },
      };

      // Guardar resultados con info mejorada
      await this.saveResults(bundle, appData, analysisResult);

      console.log('\n✅ ¡GENERACIÓN COMPLETADA EXITOSAMENTE!');
      console.log('═══════════════════════════════════════════════════════');

      return bundle;
    } catch (error) {
      console.error('\n❌ Error durante la generación:', error);
      throw error;
    }
  }

  /**
   * Genera solo metadatos y textos (sin imágenes)
   */
  async generateTextOnly(projectPath?: string): Promise<AssetBundle> {
    const originalPreference = this.config.preferences.generateImages;
    this.config.preferences.generateImages = false;

    const bundle = await this.generateAll(projectPath);

    this.config.preferences.generateImages = originalPreference;
    return bundle;
  }

  /**
   * Solo captura screenshots del simulador
   */
  async captureScreenshots(projectPath?: string): Promise<string[]> {
    if (projectPath) {
      this.projectPath = projectPath;
      this.enhancedAnalyzer = new EnhancedAnalyzer(projectPath, this.config);
    }

    return await this.enhancedAnalyzer.captureScreenshotsInteractive();
  }

  /**
   * Solo analizar (sin generar assets)
   */
  async analyzeOnly(projectPath?: string): Promise<any> {
    if (projectPath) {
      this.projectPath = projectPath;
      this.enhancedAnalyzer = new EnhancedAnalyzer(projectPath, this.config);
    }

    return await this.enhancedAnalyzer.analyze();
  }

  /**
   * Guarda todos los resultados
   */
  private async saveResults(bundle: AssetBundle, appData: AppData, analysisResult: any): Promise<void> {
    console.log('\n💾 Guardando resultados...');

    const outputDir = this.config.outputDir;
    ensureDir(outputDir);

    // Guardar metadatos
    const metadataPath = path.join(outputDir, 'metadata.json');
    saveJSON(metadataPath, bundle.metadata);
    console.log(`  ✓ Metadatos: ${metadataPath}`);

    // Guardar ASO
    const asoPath = path.join(outputDir, 'aso-optimization.json');
    saveJSON(asoPath, bundle.aso);
    console.log(`  ✓ ASO: ${asoPath}`);

    // Guardar análisis completo
    const analysisPath = path.join(outputDir, 'analysis-complete.json');
    saveJSON(analysisPath, {
      appData,
      colorPalette: analysisResult.colorPalette,
      categoryDetection: analysisResult.categoryDetection,
      dynamicKeywords: analysisResult.dynamicKeywords,
      readmeAnalysis: analysisResult.readmeAnalysis,
    });
    console.log(`  ✓ Análisis completo: ${analysisPath}`);

    // Guardar textos
    const textsDir = path.join(outputDir, 'texts');
    ensureDir(textsDir);

    saveText(
      path.join(textsDir, 'app-store-description.txt'),
      bundle.texts.appStoreDescription
    );
    saveText(
      path.join(textsDir, 'play-store-description.txt'),
      bundle.texts.playStoreDescription
    );
    saveText(path.join(textsDir, 'website-content.md'), bundle.texts.websiteContent);
    saveText(
      path.join(textsDir, 'social-media-posts.txt'),
      bundle.texts.socialMediaPosts.join('\n\n---\n\n')
    );
    console.log(`  ✓ Textos: ${textsDir}`);

    // Guardar manifest completo
    const manifestPath = path.join(outputDir, 'manifest.yaml');
    saveYAML(manifestPath, {
      appData,
      metadata: bundle.metadata,
      aso: bundle.aso,
      colorPalette: analysisResult.colorPalette,
      categoryDetection: analysisResult.categoryDetection,
      images: bundle.images.map(img => ({
        type: img.type,
        path: img.localPath,
        url: img.url,
      })),
      generatedAt: new Date().toISOString(),
    });
    console.log(`  ✓ Manifest: ${manifestPath}`);

    // Generar README con resumen
    const readmePath = path.join(outputDir, 'README.md');
    const readmeContent = this.generateReadme(bundle, appData, analysisResult);
    saveText(readmePath, readmeContent);
    console.log(`  ✓ README: ${readmePath}`);

    console.log(`\n📁 Todos los archivos guardados en: ${outputDir}`);
  }

  /**
   * Genera README con resumen mejorado
   */
  private generateReadme(bundle: AssetBundle, appData: AppData, analysisResult: any): string {
    let readme = `# Assets Generados para ${appData.name}

Generado automáticamente por Assets Creator con **análisis inteligente**

## 📊 Información de la App

- **Nombre:** ${appData.name}
- **Versión:** ${appData.version || 'N/A'}
- **Categoría:** ${appData.category}`;

    if (analysisResult.categoryDetection) {
      readme += `
  - **Subcategoría:** ${analysisResult.categoryDetection.subcategory || 'N/A'}
  - **Tipo de app:** ${analysisResult.categoryDetection.appType}
  - **Confianza:** ${analysisResult.categoryDetection.confidence}%`;
    }

    readme += `
- **Plataforma:** ${appData.platform}
- **Descripción:** ${appData.description || 'N/A'}

## 🎨 Análisis Inteligente

### Paleta de Colores Extraída
`;

    if (analysisResult.colorPalette) {
      readme += `
- **Color Primario:** ${analysisResult.colorPalette.primary}
- **Colores Secundarios:** ${analysisResult.colorPalette.secondary.join(', ')}
- **Total de colores:** ${analysisResult.colorPalette.allColors.length}
`;
    } else {
      readme += `
No se encontraron logos/iconos para extraer paleta.
`;
    }

    readme += `
### Keywords Dinámicos Generados
`;

    if (analysisResult.dynamicKeywords) {
      readme += `
- **Primarios:** ${analysisResult.dynamicKeywords.primary.join(', ')}
- **Total:** ${analysisResult.dynamicKeywords.all.length} keywords
`;
    }

    readme += `
## 📝 Metadatos Generados

### Título
${bundle.metadata.title}

### Descripción Corta
${bundle.metadata.shortDescription}

### Keywords Principales
${bundle.aso.primaryKeywords.join(', ')}

## 🎯 Optimización ASO

- **Readability Score:** ${bundle.aso.readabilityScore.toFixed(1)}/100
- **Keywords Primarios:** ${bundle.aso.primaryKeywords.length}
- **Keywords Secundarios:** ${bundle.aso.secondaryKeywords.length}

### Sugerencias de Título
${bundle.aso.titleSuggestions.map((t, i) => `${i + 1}. ${t}`).join('\n')}

## 🎨 Assets Visuales

${bundle.images.length} imágenes generadas/capturadas:
${bundle.images.map(img => `- ${img.type}: ${img.localPath || img.url}`).join('\n')}

${analysisResult.capturedScreenshots && analysisResult.capturedScreenshots.length > 0 ?
`\n✅ **${analysisResult.capturedScreenshots.length} screenshots REALES** capturados del simulador\n` :
`\nℹ️  Screenshots generados con IA (no se detectó simulador)\n`}

## 📱 Uso

Los assets generados están listos para ser usados en:
- App Store (iOS)
- Google Play Store (Android)
- Sitio web
- Redes sociales
- Materiales de marketing

## 📁 Estructura de Archivos

\`\`\`
generated_assets/
├── metadata.json              # Metadatos completos
├── aso-optimization.json      # Análisis ASO
├── analysis-complete.json     # Análisis inteligente completo
├── manifest.yaml              # Manifest completo
├── texts/                     # Todos los textos
│   ├── app-store-description.txt
│   ├── play-store-description.txt
│   ├── website-content.md
│   └── social-media-posts.txt
└── images/                    # Todas las imágenes
    ├── screenshot-*.png       # Screenshots reales o generados
    └── ...
\`\`\`

---

Generado el: ${new Date().toLocaleString()}
Con análisis inteligente: ✅ Colores reales, ✅ Categoría dinámica, ✅ Keywords personalizados
`;

    return readme;
  }

  /**
   * Log de resultados del análisis mejorado
   */
  private logAnalysisResults(result: any): void {
    console.log('\n📊 Resumen del Análisis Inteligente');
    console.log('═══════════════════════════════════════');
    console.log(`📱 App: ${result.name}`);
    console.log(`📂 Categoría: ${result.category}`);

    if (result.categoryDetection) {
      console.log(`   → Subcategoría: ${result.categoryDetection.subcategory || 'N/A'}`);
      console.log(`   → Confianza: ${result.categoryDetection.confidence}%`);
    }

    console.log(`🖥️  Plataforma: ${result.platform}`);

    if (result.colorPalette) {
      console.log(`🎨 Paleta de colores: ${result.colorPalette.primary} + ${result.colorPalette.secondary.length} más`);
    }

    if (result.dynamicKeywords) {
      console.log(`🔑 Keywords generados: ${result.dynamicKeywords.all.length}`);
    }

    if (result.capturedScreenshots) {
      console.log(`📸 Screenshots capturados: ${result.capturedScreenshots.length}`);
    }

    console.log(`✨ Features: ${result.features?.length || 0}`);
  }
}

// Exportar tipos y utilidades
export * from './types';
export { getDefaultConfig, validateConfig, AVAILABLE_MODELS } from './config/config';
export { EnhancedAnalyzer } from './analyzers/EnhancedAnalyzer';
export { ScreenshotCapture } from './analyzers/ScreenshotCapture';
export { ColorExtractor } from './analyzers/ColorExtractor';
