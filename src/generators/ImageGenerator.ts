import Replicate from 'replicate';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import sharp from 'sharp';
import { AppData, GeneratedImage, ImageGenerationRequest, GeneratorConfig } from '../types';

/**
 * Generador inteligente de imágenes usando Replicate AI
 * Genera iconos, screenshots, banners y assets visuales
 */
export class ImageGenerator {
  private replicate: Replicate;
  private config: GeneratorConfig;
  private outputDir: string;

  constructor(config: GeneratorConfig) {
    this.config = config;
    this.replicate = new Replicate({
      auth: config.replicateApiKey,
    });
    this.outputDir = path.join(config.outputDir, 'images');

    // Crear directorio de salida
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Genera todos los assets visuales para la app
   */
  async generateAllAssets(appData: AppData): Promise<GeneratedImage[]> {
    console.log('🎨 Generando assets visuales con IA...');

    const images: GeneratedImage[] = [];

    if (!this.config.preferences.generateImages) {
      console.log('⏭️  Generación de imágenes desactivada');
      return images;
    }

    try {
      // Generar icono de app
      console.log('  📱 Generando icono de app...');
      const icon = await this.generateAppIcon(appData);
      if (icon) images.push(icon);

      // Generar screenshots
      console.log('  📸 Generando screenshots promocionales...');
      const screenshots = await this.generateScreenshots(appData);
      images.push(...screenshots);

      // Generar banners promocionales
      console.log('  🎯 Generando banners promocionales...');
      const banners = await this.generatePromotionalBanners(appData);
      images.push(...banners);

      // Generar feature graphics
      console.log('  ✨ Generando feature graphics...');
      const features = await this.generateFeatureGraphics(appData);
      images.push(...features);

      console.log(`✅ ${images.length} imágenes generadas exitosamente`);
    } catch (error) {
      console.error('Error generando imágenes:', error);
    }

    return images;
  }

  /**
   * Genera icono de app
   */
  private async generateAppIcon(appData: AppData): Promise<GeneratedImage | null> {
    const prompt = this.buildIconPrompt(appData);

    const request: ImageGenerationRequest = {
      prompt: prompt,
      type: 'icon',
      style: 'modern, minimalist, professional',
      dimensions: { width: 1024, height: 1024 },
      platform: appData.platform,
    };

    const image = await this.generateImage(request);

    if (image) {
      // Generar diferentes tamaños de icono
      await this.generateIconVariants(image.localPath!);
    }

    return image;
  }

  /**
   * Genera variantes de icono en diferentes tamaños
   */
  private async generateIconVariants(sourcePath: string): Promise<void> {
    const sizes = [
      { name: '1024x1024', size: 1024 },
      { name: '512x512', size: 512 },
      { name: '256x256', size: 256 },
      { name: '128x128', size: 128 },
      { name: '64x64', size: 64 },
    ];

    const iconsDir = path.join(this.outputDir, 'icons');
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }

    for (const { name, size } of sizes) {
      const outputPath = path.join(iconsDir, `icon-${name}.png`);
      await sharp(sourcePath)
        .resize(size, size, { fit: 'cover' })
        .png()
        .toFile(outputPath);
    }

    console.log(`  ✓ Generadas ${sizes.length} variantes de icono`);
  }

  /**
   * Genera screenshots promocionales
   */
  private async generateScreenshots(appData: AppData): Promise<GeneratedImage[]> {
    const screenshots: GeneratedImage[] = [];
    const count = Math.min(this.config.preferences.imageCount, 5);

    // Diferentes perspectivas/features para screenshots
    const perspectives = [
      'main interface showing primary features',
      'user dashboard with data visualization',
      'settings and customization options',
      'mobile interface with modern UI',
      'key features showcase',
    ];

    for (let i = 0; i < count; i++) {
      const prompt = this.buildScreenshotPrompt(appData, perspectives[i] || perspectives[0]);

      const request: ImageGenerationRequest = {
        prompt: prompt,
        type: 'screenshot',
        style: 'clean, modern UI, professional',
        dimensions: this.getScreenshotDimensions(appData.platform),
        platform: appData.platform,
      };

      try {
        const image = await this.generateImage(request);
        if (image) {
          screenshots.push(image);
        }
      } catch (error) {
        console.warn(`  ⚠️ Error generando screenshot ${i + 1}:`, error);
      }
    }

    return screenshots;
  }

  /**
   * Genera banners promocionales
   */
  private async generatePromotionalBanners(appData: AppData): Promise<GeneratedImage[]> {
    const banners: GeneratedImage[] = [];

    const bannerTypes = [
      {
        name: 'hero',
        dimensions: { width: 1920, height: 1080 },
        focus: 'main value proposition',
      },
      {
        name: 'feature',
        dimensions: { width: 1024, height: 500 },
        focus: 'key feature highlight',
      },
    ];

    for (const bannerType of bannerTypes) {
      const prompt = this.buildBannerPrompt(appData, bannerType.focus);

      const request: ImageGenerationRequest = {
        prompt: prompt,
        type: 'banner',
        style: 'professional, marketing, eye-catching',
        dimensions: bannerType.dimensions,
      };

      try {
        const image = await this.generateImage(request);
        if (image) {
          banners.push(image);
        }
      } catch (error) {
        console.warn(`  ⚠️ Error generando banner ${bannerType.name}:`, error);
      }
    }

    return banners;
  }

  /**
   * Genera gráficos de features
   */
  private async generateFeatureGraphics(appData: AppData): Promise<GeneratedImage[]> {
    const graphics: GeneratedImage[] = [];
    const features = appData.features?.slice(0, 3) || [];

    for (const feature of features) {
      const prompt = `Professional feature illustration for ${feature}, ${appData.name} app, modern design, clean background, icon style, high quality`;

      const request: ImageGenerationRequest = {
        prompt: prompt,
        type: 'feature',
        style: 'illustration, icon, modern',
        dimensions: { width: 512, height: 512 },
      };

      try {
        const image = await this.generateImage(request);
        if (image) {
          graphics.push(image);
        }
      } catch (error) {
        console.warn(`  ⚠️ Error generando feature graphic:`, error);
      }
    }

    return graphics;
  }

  /**
   * Genera una imagen con Replicate
   */
  private async generateImage(request: ImageGenerationRequest): Promise<GeneratedImage | null> {
    try {
      console.log(`    Generando: ${request.type}...`);

      const output = await this.replicate.run(
        this.config.models.image as `${string}/${string}` | `${string}/${string}:${string}`,
        {
          input: {
            prompt: request.prompt,
            width: request.dimensions?.width || 1024,
            height: request.dimensions?.height || 1024,
            num_inference_steps: 50,
            guidance_scale: 7.5,
            negative_prompt:
              'ugly, blurry, low quality, distorted, watermark, text, signature, bad art',
          },
        }
      );

      // El output puede ser una URL o array de URLs
      let imageUrl: string;
      if (Array.isArray(output)) {
        imageUrl = output[0];
      } else if (typeof output === 'string') {
        imageUrl = output;
      } else {
        throw new Error('Formato de output inesperado');
      }

      // Descargar imagen
      const localPath = await this.downloadImage(imageUrl, request.type);

      // Procesar y optimizar imagen
      await this.optimizeImage(localPath);

      const metadata = await this.getImageMetadata(localPath);

      return {
        url: imageUrl,
        localPath: localPath,
        type: request.type,
        prompt: request.prompt,
        model: this.config.models.image,
        metadata: metadata,
      };
    } catch (error) {
      console.error(`Error generando imagen ${request.type}:`, error);
      return null;
    }
  }

  /**
   * Descarga una imagen desde URL
   */
  private async downloadImage(url: string, type: string): Promise<string> {
    const timestamp = Date.now();
    const filename = `${type}-${timestamp}.png`;
    const filepath = path.join(this.outputDir, filename);

    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer',
    });

    fs.writeFileSync(filepath, response.data);

    return filepath;
  }

  /**
   * Optimiza una imagen
   */
  private async optimizeImage(filepath: string): Promise<void> {
    try {
      await sharp(filepath)
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(filepath + '.optimized');

      // Reemplazar original con optimizada
      fs.renameSync(filepath + '.optimized', filepath);
    } catch (error) {
      console.warn('Error optimizando imagen:', error);
    }
  }

  /**
   * Obtiene metadatos de imagen
   */
  private async getImageMetadata(filepath: string): Promise<{
    width: number;
    height: number;
    format: string;
  }> {
    const metadata = await sharp(filepath).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'png',
    };
  }

  /**
   * Construye prompt para icono
   */
  private buildIconPrompt(appData: AppData): string {
    const features = appData.features?.slice(0, 3).join(', ') || 'modern technology';

    return `Professional app icon for "${appData.name}", ${appData.category} category,
${features}, modern design, minimalist, flat design, rounded corners,
vibrant colors, high quality, centered, simple shapes, memorable,
suitable for ${appData.platform} platform, no text`;
  }

  /**
   * Construye prompt para screenshot
   */
  private buildScreenshotPrompt(appData: AppData, perspective: string): string {
    return `Modern mobile app interface screenshot for "${appData.name}",
${appData.category} app, showing ${perspective},
clean UI design, professional, ${appData.platform} style,
high quality, realistic, detailed interface elements,
modern color scheme, user-friendly design`;
  }

  /**
   * Construye prompt para banner
   */
  private buildBannerPrompt(appData: AppData, focus: string): string {
    return `Professional promotional banner for "${appData.name}" app,
highlighting ${focus}, ${appData.category} category,
modern design, eye-catching, marketing material,
professional graphics, clean composition,
vibrant but professional color scheme, high quality`;
  }

  /**
   * Obtiene dimensiones de screenshot según plataforma
   */
  private getScreenshotDimensions(platform?: string): { width: number; height: number } {
    const dimensions = {
      ios: { width: 1242, height: 2688 }, // iPhone 11 Pro Max
      android: { width: 1080, height: 1920 }, // Full HD
      web: { width: 1920, height: 1080 }, // Desktop
      desktop: { width: 1920, height: 1080 },
      multiplatform: { width: 1080, height: 1920 },
    };

    return dimensions[platform as keyof typeof dimensions] || dimensions.multiplatform;
  }
}
