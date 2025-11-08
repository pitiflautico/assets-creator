import { AppAnalyzer } from './AppAnalyzer';
import { ColorExtractor } from './ColorExtractor';
import { ReadmeAnalyzer } from './ReadmeAnalyzer';
import { ScreenshotCapture } from './ScreenshotCapture';
import { AppData, GeneratorConfig } from '../types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Analizador Mejorado que usa:
 * - Análisis inteligente del README con IA
 * - Extracción de paleta de colores de assets existentes
 * - Captura de screenshots del simulador
 * - Todo lo que ya hacía AppAnalyzer
 */
export class EnhancedAnalyzer {
  private baseAnalyzer: AppAnalyzer;
  private colorExtractor: ColorExtractor;
  private readmeAnalyzer: ReadmeAnalyzer;
  private screenshotCapture: ScreenshotCapture;
  private config: GeneratorConfig;

  constructor(projectPath: string, config: GeneratorConfig) {
    this.baseAnalyzer = new AppAnalyzer(projectPath);
    this.colorExtractor = new ColorExtractor();
    this.readmeAnalyzer = new ReadmeAnalyzer(config);
    this.screenshotCapture = new ScreenshotCapture(
      path.join(config.outputDir, 'screenshots')
    );
    this.config = config;
  }

  /**
   * Análisis completo y mejorado
   */
  async analyze(): Promise<AppData & {
    colorPalette?: {
      primary: string;
      secondary: string[];
      accent: string;
      allColors: string[];
    };
    readmeAnalysis?: {
      mainPurpose: string;
      targetAudience: string;
      uniqueSellingPoints: string[];
      tone: string;
    };
    capturedScreenshots?: string[];
  }> {
    console.log('🔍 Análisis Mejorado del Proyecto');
    console.log('═══════════════════════════════════════\n');

    // 1. Análisis base
    console.log('📊 Paso 1: Análisis base...');
    const baseData = await this.baseAnalyzer.analyze();

    // 2. Análisis inteligente del README con IA
    console.log('📝 Paso 2: Analizando README con IA...');
    let readmeAnalysis;
    if (baseData.readme && baseData.readme.length > 50) {
      try {
        const analysis = await this.readmeAnalyzer.analyzeReadme(baseData.readme);

        readmeAnalysis = {
          mainPurpose: analysis.mainPurpose,
          targetAudience: analysis.targetAudience,
          uniqueSellingPoints: analysis.uniqueSellingPoints,
          tone: analysis.tone,
        };

        // Mejorar datos base con info del README
        if (analysis.description && !baseData.description) {
          baseData.description = analysis.description;
        }

        if (analysis.keyFeatures.length > 0) {
          baseData.features = [
            ...(baseData.features || []),
            ...analysis.keyFeatures,
          ].slice(0, 10);
        }

        if (analysis.category && analysis.category !== 'Utilities') {
          baseData.category = analysis.category;
        }

        if (analysis.keywords.length > 0) {
          baseData.keywords = [
            ...(baseData.keywords || []),
            ...analysis.keywords,
          ].slice(0, 30);
        }

        console.log('  ✓ README analizado con IA');
        console.log(`  → Propósito: ${analysis.mainPurpose || 'N/A'}`);
        console.log(`  → Audiencia: ${analysis.targetAudience}`);
        console.log(`  → Features: ${analysis.keyFeatures.length}`);
      } catch (error) {
        console.log('  ⚠️ No se pudo analizar README con IA (continuando sin IA)');
      }
    } else {
      console.log('  ⏭️ README no disponible o muy corto');
    }

    // 3. Extracción de paleta de colores de assets existentes
    console.log('\n🎨 Paso 3: Extrayendo paleta de colores...');
    let colorPalette;
    if (baseData.existingAssets?.icons && baseData.existingAssets.icons.length > 0) {
      try {
        const iconPaths = baseData.existingAssets.icons.map(icon =>
          path.isAbsolute(icon) ? icon : path.join(process.cwd(), icon)
        );

        colorPalette = await this.colorExtractor.extractFromMultipleImages(iconPaths);

        console.log('  ✓ Paleta extraída de assets existentes');
        console.log(`  → Color primario: ${colorPalette.primary}`);
        console.log(`  → Colores secundarios: ${colorPalette.secondary.join(', ')}`);
        console.log(`  → Total colores: ${colorPalette.allColors.length}`);
      } catch (error) {
        console.log('  ⚠️ No se pudo extraer paleta de colores');
      }
    } else {
      console.log('  ⏭️ No hay iconos/logos existentes para extraer colores');
    }

    // 4. Captura de screenshots del simulador (si está configurado)
    console.log('\n📸 Paso 4: Buscando simuladores...');
    let capturedScreenshots;
    const simulators = await this.screenshotCapture.detectSimulators();

    if (simulators.ios || simulators.android) {
      console.log('  ✓ Simulador detectado!');
      console.log(`  → Dispositivos: ${simulators.devices.join(', ')}`);

      if (this.config.preferences.generateImages) {
        console.log('\n💡 ¿Quieres capturar screenshots del simulador ahora?');
        console.log('   (Se capturarán automáticamente en 5 segundos...)');

        // Pequeña pausa para que el usuario vea el mensaje
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
          capturedScreenshots = await this.screenshotCapture.captureMultipleScreenshots(
            Math.min(this.config.preferences.imageCount || 3, 5)
          );

          if (capturedScreenshots.length > 0) {
            console.log(`  ✓ ${capturedScreenshots.length} screenshots capturados`);

            // Agregar a existingAssets
            if (!baseData.existingAssets) {
              baseData.existingAssets = {};
            }
            baseData.existingAssets.screenshots = [
              ...(baseData.existingAssets.screenshots || []),
              ...capturedScreenshots,
            ];
          }
        } catch (error) {
          console.log('  ⚠️ Error capturando screenshots:', error);
        }
      }
    } else {
      console.log('  ℹ️ No hay simuladores en ejecución');
      console.log('  💡 Abre un simulador iOS o emulador Android para capturar screenshots reales');
    }

    console.log('\n✅ Análisis completo\n');

    return {
      ...baseData,
      colorPalette,
      readmeAnalysis,
      capturedScreenshots,
    };
  }

  /**
   * Solo capturar screenshots (modo interactivo)
   */
  async captureScreenshotsInteractive(): Promise<string[]> {
    return await this.screenshotCapture.captureInteractive();
  }

  /**
   * Solo extraer paleta de colores
   */
  async extractColorsOnly(imagePath: string) {
    return await this.colorExtractor.extractPalette(imagePath);
  }
}
