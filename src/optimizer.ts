/**
 * Optimizer Module
 * Optimizes and resizes images using Sharp
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs-extra';
import { Logger, ensureDir, formatFileSize } from './utils';

export interface ImageSize {
  width: number;
  height: number;
  name: string;
}

export class ImageOptimizer {
  private outputDir: string;

  constructor(outputDir: string) {
    this.outputDir = outputDir;
  }

  /**
   * Generate all required icon sizes from a source image
   */
  async generateIconSizes(sourceIcon: string): Promise<Record<string, string>> {
    Logger.step('Generating icon sizes...');

    const iconSizes: ImageSize[] = [
      { width: 1024, height: 1024, name: 'icon_1024.png' },
      { width: 512, height: 512, name: 'icon_512.png' },
      { width: 192, height: 192, name: 'icon_192.png' },
      { width: 180, height: 180, name: 'icon_180.png' }, // iOS
      { width: 167, height: 167, name: 'icon_167.png' }, // iPad Pro
      { width: 152, height: 152, name: 'icon_152.png' }, // iPad
      { width: 120, height: 120, name: 'icon_120.png' }, // iPhone
      { width: 96, height: 96, name: 'icon_96.png' },
      { width: 76, height: 76, name: 'icon_76.png' }, // iPad
      { width: 72, height: 72, name: 'icon_72.png' },
      { width: 48, height: 48, name: 'icon_48.png' },
    ];

    const iconDir = path.join(this.outputDir, 'icons');
    await ensureDir(iconDir);

    const generatedIcons: Record<string, string> = {};

    for (const size of iconSizes) {
      const outputPath = path.join(iconDir, size.name);

      try {
        await sharp(sourceIcon)
          .resize(size.width, size.height, {
            fit: 'cover',
            position: 'center',
          })
          .png({ quality: 100 })
          .toFile(outputPath);

        generatedIcons[size.width.toString()] = outputPath;

        const stats = await fs.stat(outputPath);
        Logger.success(`Generated ${size.name} (${formatFileSize(stats.size)})`);
      } catch (error) {
        Logger.error(`Failed to generate ${size.name}: ${error}`);
      }
    }

    return generatedIcons;
  }

  /**
   * Optimize screenshots for app stores
   */
  async optimizeScreenshots(
    screenshots: string[],
    platform: 'ios' | 'android'
  ): Promise<string[]> {
    Logger.step(`Optimizing ${platform} screenshots...`);

    const screenshotSizes = this.getScreenshotSizes(platform);
    const optimizedScreenshots: string[] = [];

    for (let i = 0; i < screenshots.length; i++) {
      const screenshot = screenshots[i];
      const targetSize = screenshotSizes[0]; // Use first size as default

      const outputPath = path.join(
        this.outputDir,
        'screenshots',
        `${platform}_${i + 1}_optimized.png`
      );

      try {
        await ensureDir(path.dirname(outputPath));

        await sharp(screenshot)
          .resize(targetSize.width, targetSize.height, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 1 },
          })
          .png({ quality: 90, compressionLevel: 9 })
          .toFile(outputPath);

        const stats = await fs.stat(outputPath);
        Logger.success(
          `Optimized ${path.basename(screenshot)} (${formatFileSize(stats.size)})`
        );

        optimizedScreenshots.push(outputPath);
      } catch (error) {
        Logger.error(`Failed to optimize ${screenshot}: ${error}`);
      }
    }

    return optimizedScreenshots;
  }

  /**
   * Get required screenshot sizes for each platform
   */
  private getScreenshotSizes(platform: 'ios' | 'android'): ImageSize[] {
    if (platform === 'ios') {
      return [
        { width: 1290, height: 2796, name: 'iPhone 15 Pro Max' }, // 6.7"
        { width: 1179, height: 2556, name: 'iPhone 15 Pro' }, // 6.1"
        { width: 1284, height: 2778, name: 'iPhone 14 Pro Max' },
        { width: 1170, height: 2532, name: 'iPhone 14 Pro' },
        { width: 2048, height: 2732, name: 'iPad Pro 12.9"' },
      ];
    } else {
      return [
        { width: 1080, height: 2340, name: 'Phone' },
        { width: 1440, height: 3120, name: 'Phone (High DPI)' },
        { width: 1600, height: 2560, name: 'Tablet 10"' },
      ];
    }
  }

  /**
   * Optimize splash screen
   */
  async optimizeSplash(sourceSplash: string): Promise<string> {
    Logger.step('Optimizing splash screen...');

    const outputPath = path.join(this.outputDir, 'splash_optimized.png');

    await sharp(sourceSplash)
      .resize(2048, 2048, {
        fit: 'cover',
        position: 'center',
      })
      .png({ quality: 90 })
      .toFile(outputPath);

    const stats = await fs.stat(outputPath);
    Logger.success(`Splash screen optimized (${formatFileSize(stats.size)})`);

    return outputPath;
  }

  /**
   * Add device frame to screenshot (mockup)
   */
  async addDeviceFrame(
    screenshot: string,
    device: 'iphone' | 'android' = 'iphone'
  ): Promise<string> {
    Logger.step('Adding device frame...');

    // In a real implementation, you would composite the screenshot
    // with a device frame template using Sharp's composite feature
    // For now, we'll just return the original screenshot

    Logger.info('Device frame feature: Use online tools like Mockuphone or AppMockUp');
    return screenshot;
  }

  /**
   * Compress image to reduce file size
   */
  async compressImage(
    imagePath: string,
    quality: number = 80
  ): Promise<string> {
    const outputPath = imagePath.replace(/(\.\w+)$/, '_compressed$1');

    const image = sharp(imagePath);
    const metadata = await image.metadata();

    if (metadata.format === 'png') {
      await image.png({ quality, compressionLevel: 9 }).toFile(outputPath);
    } else if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
      await image.jpeg({ quality }).toFile(outputPath);
    } else {
      await image.toFile(outputPath);
    }

    const originalStats = await fs.stat(imagePath);
    const compressedStats = await fs.stat(outputPath);

    const savings = ((1 - compressedStats.size / originalStats.size) * 100).toFixed(1);
    Logger.success(
      `Compressed ${path.basename(imagePath)} - saved ${savings}% (${formatFileSize(
        originalStats.size - compressedStats.size
      )})`
    );

    return outputPath;
  }

  /**
   * Get image metadata
   */
  async getImageInfo(imagePath: string): Promise<sharp.Metadata> {
    return await sharp(imagePath).metadata();
  }

  /**
   * Validate image meets store requirements
   */
  async validateImage(
    imagePath: string,
    type: 'icon' | 'screenshot' | 'splash'
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      const metadata = await this.getImageInfo(imagePath);
      const stats = await fs.stat(imagePath);

      // Size validations
      if (type === 'icon') {
        if (!metadata.width || metadata.width < 1024 || metadata.height !== metadata.width) {
          errors.push('Icon must be at least 1024x1024 and square');
        }
      }

      // File size validations
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (stats.size > maxSize) {
        errors.push(`File size ${formatFileSize(stats.size)} exceeds 10MB limit`);
      }

      // Format validations
      if (!['png', 'jpeg', 'jpg'].includes(metadata.format || '')) {
        errors.push('Image must be PNG or JPEG format');
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    } catch (error) {
      return {
        valid: false,
        errors: [`Failed to validate image: ${error}`],
      };
    }
  }

  /**
   * Batch process multiple images
   */
  async batchProcess(
    images: string[],
    operation: (img: string) => Promise<string>
  ): Promise<string[]> {
    const processed: string[] = [];

    for (const image of images) {
      try {
        const result = await operation(image);
        processed.push(result);
      } catch (error) {
        Logger.error(`Failed to process ${image}: ${error}`);
      }
    }

    return processed;
  }
}
