import * as path from 'path';
import { AppAnalyzer } from './analyzers/AppAnalyzer';
import { TextGenerator } from './generators/TextGenerator';
import { ImageGenerator } from './generators/ImageGenerator';
import { ASOOptimizer } from './aso/ASOOptimizer';
import { getDefaultConfig, validateConfig } from './config/config';
import { saveJSON, saveYAML, saveText, ensureDir } from './utils/fileUtils';
import { AppData, AssetBundle, GeneratorConfig } from './types';

/**
 * Motor principal de Assets Creator
 * Orquesta todo el proceso de generación inteligente de assets
 */
export class AssetsCreator {
  private config: GeneratorConfig;
  private analyzer: AppAnalyzer;
  private textGenerator: TextGenerator;
  private imageGenerator: ImageGenerator;
  private asoOptimizer: ASOOptimizer;

  constructor(config?: Partial<GeneratorConfig>) {
    this.config = getDefaultConfig(config);

    // Validar configuración
    const validation = validateConfig(this.config);
    if (!validation.valid) {
      throw new Error(`Configuración inválida:\n${validation.errors.join('\n')}`);
    }

    // Inicializar componentes
    this.analyzer = new AppAnalyzer(process.cwd());
    this.textGenerator = new TextGenerator(this.config);
    this.imageGenerator = new ImageGenerator(this.config);
    this.asoOptimizer = new ASOOptimizer(this.config);
  }

  /**
   * Genera todos los assets de forma inteligente
   */
  async generateAll(projectPath?: string): Promise<AssetBundle> {
    console.log('🚀 Assets Creator - Generación Inteligente de Assets');
    console.log('═══════════════════════════════════════════════════════\n');

    // Cambiar al directorio del proyecto si se proporciona
    if (projectPath) {
      this.analyzer = new AppAnalyzer(projectPath);
    }

    try {
      // 1. Analizar la aplicación
      console.log('📊 PASO 1: Analizando aplicación...\n');
      const appData = await this.analyzer.analyze();
      this.logAppData(appData);

      // 2. Generar metadatos y textos
      console.log('\n📝 PASO 2: Generando metadatos y textos...\n');
      const metadata = await this.textGenerator.generateMetadata(appData);

      // 3. Optimizar ASO
      console.log('\n🎯 PASO 3: Optimizando ASO...\n');
      const aso = await this.asoOptimizer.optimize(appData, metadata);

      // 4. Generar imágenes
      console.log('\n🎨 PASO 4: Generando imágenes...\n');
      const images = await this.imageGenerator.generateAllAssets(appData);

      // 5. Generar textos adicionales
      console.log('\n✍️  PASO 5: Generando textos adicionales...\n');
      const socialMedia = await this.textGenerator.generateSocialMediaContent(appData);
      const websiteContent = await this.textGenerator.generateWebsiteContent(appData);

      // 6. Obtener insights de mercado
      console.log('\n📈 PASO 6: Analizando mercado...\n');
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

      // Guardar resultados
      await this.saveResults(bundle, appData);

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
   * Genera solo imágenes
   */
  async generateImagesOnly(projectPath?: string): Promise<AssetBundle['images']> {
    if (projectPath) {
      this.analyzer = new AppAnalyzer(projectPath);
    }

    const appData = await this.analyzer.analyze();
    return await this.imageGenerator.generateAllAssets(appData);
  }

  /**
   * Analiza una app sin generar assets
   */
  async analyzeOnly(projectPath?: string): Promise<AppData> {
    if (projectPath) {
      this.analyzer = new AppAnalyzer(projectPath);
    }

    return await this.analyzer.analyze();
  }

  /**
   * Guarda todos los resultados
   */
  private async saveResults(bundle: AssetBundle, appData: AppData): Promise<void> {
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
    const readmeContent = this.generateReadme(bundle, appData);
    saveText(readmePath, readmeContent);
    console.log(`  ✓ README: ${readmePath}`);

    console.log(`\n📁 Todos los archivos guardados en: ${outputDir}`);
  }

  /**
   * Genera README con resumen
   */
  private generateReadme(bundle: AssetBundle, appData: AppData): string {
    return `# Assets Generados para ${appData.name}

Generado automáticamente por Assets Creator con IA

## 📊 Información de la App

- **Nombre:** ${appData.name}
- **Versión:** ${appData.version || 'N/A'}
- **Categoría:** ${appData.category}
- **Plataforma:** ${appData.platform}
- **Descripción:** ${appData.description || 'N/A'}

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

${bundle.images.length} imágenes generadas:
${bundle.images.map(img => `- ${img.type}: ${img.localPath}`).join('\n')}

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
├── manifest.yaml              # Manifest completo
├── texts/                     # Todos los textos
│   ├── app-store-description.txt
│   ├── play-store-description.txt
│   ├── website-content.md
│   └── social-media-posts.txt
└── images/                    # Todas las imágenes
    ├── icon-*.png
    ├── screenshot-*.png
    ├── banner-*.png
    └── feature-*.png
\`\`\`

---

Generado el: ${new Date().toLocaleString()}
`;
  }

  /**
   * Log de datos de la app
   */
  private logAppData(appData: AppData): void {
    console.log(`📱 App: ${appData.name}`);
    console.log(`📂 Categoría: ${appData.category}`);
    console.log(`🖥️  Plataforma: ${appData.platform}`);
    console.log(`🔧 Tecnologías: ${appData.sourceCode?.technologies?.join(', ') || 'N/A'}`);
    console.log(`✨ Features encontrados: ${appData.features?.length || 0}`);
    if (appData.features && appData.features.length > 0) {
      appData.features.slice(0, 5).forEach((f, i) => {
        console.log(`   ${i + 1}. ${f}`);
      });
    }
  }
}

// Exportar tipos y utilidades
export * from './types';
export { getDefaultConfig, validateConfig, AVAILABLE_MODELS } from './config/config';
