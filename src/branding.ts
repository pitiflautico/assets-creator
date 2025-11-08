/**
 * Branding Module
 * Generates logos, icons, splash screens using AI (Replicate, OpenAI DALL-E)
 */

import path from 'path';
import fs from 'fs-extra';
import Replicate from 'replicate';
import OpenAI from 'openai';
import { BrandingAssets, GenerateImageOptions } from './types';
import { Logger, ensureDir } from './utils';
import { ConfigManager } from './config';

export class BrandingGenerator {
  private config = ConfigManager.getInstance().getConfig();
  private replicate?: Replicate;
  private openai?: OpenAI;
  private outputDir: string;

  constructor(outputDir: string) {
    this.outputDir = outputDir;

    // Initialize AI clients based on available API keys
    if (this.config.replicate_api_key) {
      this.replicate = new Replicate({
        auth: this.config.replicate_api_key,
      });
    }

    if (this.config.openai_api_key) {
      this.openai = new OpenAI({
        apiKey: this.config.openai_api_key,
      });
    }
  }

  /**
   * Generate complete branding assets for an app
   */
  async generateBranding(
    appName: string,
    appType: string,
    features: string[] = []
  ): Promise<BrandingAssets> {
    Logger.step('Generating branding assets...');

    await ensureDir(this.outputDir);

    // Generate color palette first
    const palette = await this.generateColorPalette(appName, appType);
    Logger.success(`Color palette generated: ${palette.join(', ')}`);

    // Generate app icon
    const iconPrompt = this.createIconPrompt(appName, appType, features, palette);
    const iconPath = await this.generateImage(iconPrompt, 'icon_1024.png', 1024, 'icon');
    Logger.success('App icon generated');

    // Generate splash screen
    const splashPrompt = this.createSplashPrompt(appName, appType, palette);
    const splashPath = await this.generateImage(splashPrompt, 'splash.png', 2048, 'splash');
    Logger.success('Splash screen generated');

    const brandingAssets: BrandingAssets = {
      icon: iconPath,
      splash: splashPath,
      palette,
      font: 'Inter',
      icons: {
        '1024': iconPath,
      },
    };

    Logger.success('Branding generation complete');
    return brandingAssets;
  }

  /**
   * Generate an image using AI
   */
  private async generateImage(
    prompt: string,
    filename: string,
    size: number = 1024,
    type: 'icon' | 'splash' | 'general' = 'general'
  ): Promise<string> {
    const outputPath = path.join(this.outputDir, filename);

    try {
      // Try Replicate FIRST (more reliable for image generation)
      if (this.replicate) {
        Logger.info(`Generating image with Replicate: ${filename}`);
        await this.generateWithReplicate(prompt, outputPath, size, type);
        return outputPath;
      }

      // Fallback to OpenAI DALL-E
      if (this.openai) {
        Logger.info(`Generating image with OpenAI DALL-E: ${filename}`);
        await this.generateWithOpenAI(prompt, outputPath, size);
        return outputPath;
      }

      throw new Error('No AI image generation service configured');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to generate image: ${errorMessage}`);

      // If OpenAI fails but Replicate is available, try Replicate
      if (errorMessage.includes('401') || errorMessage.includes('organization')) {
        Logger.warning('OpenAI authentication failed. Trying Replicate...');
        if (this.replicate && !errorMessage.includes('Replicate')) {
          try {
            await this.generateWithReplicate(prompt, outputPath, size, type);
            return outputPath;
          } catch (replicateError) {
            Logger.error(`Replicate also failed: ${replicateError}`);
          }
        }
      }

      // Create a placeholder image
      Logger.warning('Creating placeholder image instead');
      await this.createPlaceholderImage(outputPath, size);
      return outputPath;
    }
  }

  /**
   * Generate image using OpenAI DALL-E
   */
  private async generateWithOpenAI(
    prompt: string,
    outputPath: string,
    size: number
  ): Promise<void> {
    if (!this.openai) {
      throw new Error('OpenAI not initialized');
    }

    const sizeParam = size >= 1024 ? '1024x1024' : '512x512';

    const response = await this.openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: sizeParam as any,
      quality: 'standard',
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('No image data returned from OpenAI');
    }

    const imageUrl = response.data[0].url;
    if (!imageUrl) {
      throw new Error('No image URL returned from OpenAI');
    }

    // Download image
    const imageResponse = await fetch(imageUrl);
    const buffer = await imageResponse.arrayBuffer();
    await fs.writeFile(outputPath, Buffer.from(buffer));
  }

  /**
   * Generate image using Replicate (SDXL, Flux, or specialized models)
   */
  private async generateWithReplicate(
    prompt: string,
    outputPath: string,
    size: number,
    type: 'icon' | 'splash' | 'general' = 'general'
  ): Promise<void> {
    if (!this.replicate) {
      throw new Error('Replicate not initialized');
    }

    // Select best model based on image type
    let model: string;
    let input: any;

    if (type === 'icon') {
      // Use Flux for high-quality icons/logos
      model = 'black-forest-labs/flux-schnell';
      input = {
        prompt: prompt,
        num_outputs: 1,
        aspect_ratio: '1:1',
        output_format: 'png',
        output_quality: 100,
      };
      Logger.info('Using Flux Schnell for icon generation');
    } else if (type === 'splash') {
      // Use SDXL for splash screens (supports larger sizes)
      model = 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';
      input = {
        prompt: prompt,
        width: size,
        height: size,
        num_outputs: 1,
        num_inference_steps: 40,
      };
      Logger.info('Using SDXL for splash screen');
    } else {
      // Default: SDXL for general images
      model = 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';
      input = {
        prompt: prompt,
        width: size,
        height: size,
        num_outputs: 1,
      };
    }

    const output = await this.replicate.run(model as any, { input }) as string | string[];

    // Handle different output formats
    let imageUrl: string;
    if (Array.isArray(output)) {
      if (output.length === 0) {
        throw new Error('No output from Replicate');
      }
      imageUrl = output[0];
    } else if (typeof output === 'string') {
      imageUrl = output;
    } else {
      throw new Error('Unexpected output format from Replicate');
    }

    // Download image
    const imageResponse = await fetch(imageUrl);
    const buffer = await imageResponse.arrayBuffer();
    await fs.writeFile(outputPath, Buffer.from(buffer));
  }

  /**
   * Create a placeholder image (for when AI services fail)
   */
  private async createPlaceholderImage(
    outputPath: string,
    size: number
  ): Promise<void> {
    // Create a simple colored square as placeholder
    // In a real implementation, you'd use a library like Sharp or Canvas
    // For now, we'll just create an empty file
    await fs.writeFile(outputPath, Buffer.from(''));
    Logger.warning(`Placeholder created at: ${outputPath}`);
  }

  /**
   * Create prompt for icon generation
   */
  private createIconPrompt(
    appName: string,
    appType: string,
    features: string[],
    palette: string[]
  ): string {
    const featureText = features.length > 0 ? `, featuring ${features.slice(0, 3).join(', ')}` : '';

    return `A modern, minimalist app icon for "${appName}", a ${appType} mobile application${featureText}.
The design should be clean, professional, and suitable for both iOS and Android.
Use colors: ${palette.slice(0, 3).join(', ')}.
The icon should be simple, memorable, and work well at small sizes.
Style: flat design, vector-style, centered composition, no text, no background.`;
  }

  /**
   * Create prompt for splash screen generation
   */
  private createSplashPrompt(
    appName: string,
    appType: string,
    palette: string[]
  ): string {
    return `A beautiful splash screen background for "${appName}", a ${appType} mobile application.
Modern, clean gradient or abstract design using colors: ${palette.join(', ')}.
The design should be elegant, professional, and welcoming.
Style: minimalist, abstract, smooth gradients, suitable for mobile screen.`;
  }

  /**
   * Generate color palette for the app
   */
  private async generateColorPalette(
    appName: string,
    appType: string
  ): Promise<string[]> {
    // In a real implementation, you could use AI to generate a palette
    // For now, we'll use predefined palettes based on app type
    const palettes: Record<string, string[]> = {
      health: ['#4A90E2', '#F5A623', '#7ED321', '#FFFFFF'],
      finance: ['#2C3E50', '#E74C3C', '#ECF0F1', '#3498DB'],
      social: ['#9B59B6', '#E91E63', '#00BCD4', '#FFFFFF'],
      productivity: ['#34495E', '#1ABC9C', '#F39C12', '#ECF0F1'],
      education: ['#3498DB', '#E74C3C', '#F39C12', '#2ECC71'],
      entertainment: ['#E91E63', '#9C27B0', '#FF5722', '#FFC107'],
      default: ['#3A6EA5', '#E9E7E3', '#0A1D37', '#FFFFFF'],
    };

    // Simple type matching
    const typeKey = Object.keys(palettes).find((key) =>
      appType.toLowerCase().includes(key)
    );

    return palettes[typeKey || 'default'];
  }

  /**
   * Generate multiple icon sizes
   */
  async generateIconSizes(
    sourceIcon: string,
    sizes: number[]
  ): Promise<Record<string, string>> {
    // This will be implemented in the optimizer module
    // For now, return the source icon
    const icons: Record<string, string> = {};
    sizes.forEach((size) => {
      icons[size.toString()] = sourceIcon;
    });
    return icons;
  }
}
