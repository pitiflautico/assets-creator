/**
 * Exporter Module
 * Organizes and exports all generated assets into a structured format
 */

import path from 'path';
import fs from 'fs-extra';
import { ExportStructure, MetadataInfo, BrandingAssets, ScreenshotInfo } from './types';
import { Logger, ensureDir, writeJsonFile, sanitizeFilename, copyFile } from './utils';

export class Exporter {
  private baseOutputDir: string;

  constructor(baseOutputDir: string) {
    this.baseOutputDir = baseOutputDir;
  }

  /**
   * Export all assets and metadata to a structured directory
   */
  async export(
    projectName: string,
    metadata: MetadataInfo,
    branding: BrandingAssets,
    screenshots: ScreenshotInfo[]
  ): Promise<ExportStructure> {
    Logger.step('Exporting assets...');

    const safeName = sanitizeFilename(projectName);
    const exportPath = path.join(this.baseOutputDir, safeName);

    // Create directory structure
    await this.createDirectoryStructure(exportPath);

    // Copy assets
    await this.exportBrandingAssets(exportPath, branding);
    await this.exportScreenshots(exportPath, screenshots);

    // Generate text files
    await this.exportMetadataFiles(exportPath, metadata);

    // Generate metadata.json
    const exportStructure: ExportStructure = {
      projectName,
      exportPath,
      metadata,
      assets: branding,
      screenshots,
    };

    await writeJsonFile(path.join(exportPath, 'metadata.json'), exportStructure);

    // Create README with instructions
    await this.createReadme(exportPath, projectName, metadata);

    Logger.success(`Export complete: ${exportPath}`);
    return exportStructure;
  }

  /**
   * Create the export directory structure
   */
  private async createDirectoryStructure(exportPath: string): Promise<void> {
    const directories = [
      'store/appstore',
      'store/playstore',
      'assets/icons',
      'assets/splash',
      'assets/screenshots/ios',
      'assets/screenshots/android',
    ];

    for (const dir of directories) {
      await ensureDir(path.join(exportPath, dir));
    }

    Logger.info('Directory structure created');
  }

  /**
   * Export branding assets
   */
  private async exportBrandingAssets(
    exportPath: string,
    branding: BrandingAssets
  ): Promise<void> {
    // Copy main icon
    if (branding.icon && (await fs.pathExists(branding.icon))) {
      const iconDest = path.join(exportPath, 'assets/icons', path.basename(branding.icon));
      await copyFile(branding.icon, iconDest);
    }

    // Copy splash screen
    if (branding.splash && (await fs.pathExists(branding.splash))) {
      const splashDest = path.join(
        exportPath,
        'assets/splash',
        path.basename(branding.splash)
      );
      await copyFile(branding.splash, splashDest);
    }

    // Copy all icon sizes
    if (branding.icons) {
      for (const [size, iconPath] of Object.entries(branding.icons)) {
        if (await fs.pathExists(iconPath)) {
          const dest = path.join(exportPath, 'assets/icons', path.basename(iconPath));
          await copyFile(iconPath, dest);
        }
      }
    }

    // Save color palette
    const paletteFile = path.join(exportPath, 'assets', 'colors.json');
    await writeJsonFile(paletteFile, {
      palette: branding.palette,
      font: branding.font,
    });

    Logger.success('Branding assets exported');
  }

  /**
   * Export screenshots
   */
  private async exportScreenshots(
    exportPath: string,
    screenshots: ScreenshotInfo[]
  ): Promise<void> {
    for (const screenshot of screenshots) {
      if (!(await fs.pathExists(screenshot.path))) {
        Logger.warning(`Screenshot not found: ${screenshot.path}`);
        continue;
      }

      const dest = path.join(
        exportPath,
        'assets/screenshots',
        screenshot.platform,
        path.basename(screenshot.path)
      );

      await copyFile(screenshot.path, dest);
    }

    Logger.success(`${screenshots.length} screenshots exported`);
  }

  /**
   * Export metadata text files
   */
  private async exportMetadataFiles(
    exportPath: string,
    metadata: MetadataInfo
  ): Promise<void> {
    // App Store description
    const appStoreDesc = this.formatAppStoreDescription(metadata);
    await fs.writeFile(
      path.join(exportPath, 'store/appstore/description.txt'),
      appStoreDesc,
      'utf-8'
    );

    // Play Store description
    const playStoreDesc = this.formatPlayStoreDescription(metadata);
    await fs.writeFile(
      path.join(exportPath, 'store/playstore/description.txt'),
      playStoreDesc,
      'utf-8'
    );

    // Keywords
    await fs.writeFile(
      path.join(exportPath, 'store/keywords.txt'),
      metadata.keywords.join('\n'),
      'utf-8'
    );

    // App name
    await fs.writeFile(
      path.join(exportPath, 'store/app_name.txt'),
      metadata.name,
      'utf-8'
    );

    // Short description / tagline
    await fs.writeFile(
      path.join(exportPath, 'store/tagline.txt'),
      metadata.shortDescription,
      'utf-8'
    );

    // Promotional text
    if (metadata.promotionalText) {
      await fs.writeFile(
        path.join(exportPath, 'store/promotional_text.txt'),
        metadata.promotionalText,
        'utf-8'
      );
    }

    Logger.success('Metadata files exported');
  }

  /**
   * Format description for App Store
   */
  private formatAppStoreDescription(metadata: MetadataInfo): string {
    return `${metadata.name}

${metadata.shortDescription}

${metadata.longDescription}

FEATURES:
${metadata.keywords.slice(0, 10).map((k) => `• ${k}`).join('\n')}

Category: ${metadata.category || 'Lifestyle'}
`;
  }

  /**
   * Format description for Play Store
   */
  private formatPlayStoreDescription(metadata: MetadataInfo): string {
    return `${metadata.shortDescription}

${metadata.longDescription}

🔥 KEY FEATURES:
${metadata.keywords.slice(0, 10).map((k) => `✓ ${k}`).join('\n')}
`;
  }

  /**
   * Create README with export information
   */
  private async createReadme(
    exportPath: string,
    projectName: string,
    metadata: MetadataInfo
  ): Promise<void> {
    const readme = `# ${projectName} - App Store Assets

This directory contains all the assets and metadata needed to publish your app to the App Store and Play Store.

## Generated on: ${new Date().toISOString()}

## 📁 Directory Structure

- \`/store/appstore/\` - App Store specific files
- \`/store/playstore/\` - Play Store specific files
- \`/assets/icons/\` - App icons in various sizes
- \`/assets/splash/\` - Splash screen images
- \`/assets/screenshots/\` - App screenshots for both platforms
- \`metadata.json\` - Complete metadata in JSON format

## 📱 App Store Submission

### App Name
${metadata.name}

### Tagline
${metadata.shortDescription}

### Category
${metadata.category || 'Lifestyle'}

### Keywords
${metadata.keywords.join(', ')}

## 📋 Checklist

### App Store (iOS)
- [ ] Upload app icon (1024x1024) from \`/assets/icons/icon_1024.png\`
- [ ] Upload screenshots from \`/assets/screenshots/ios/\`
- [ ] Copy description from \`/store/appstore/description.txt\`
- [ ] Add keywords from \`/store/keywords.txt\`
- [ ] Set app category

### Play Store (Android)
- [ ] Upload app icon (512x512) from \`/assets/icons/icon_512.png\`
- [ ] Upload screenshots from \`/assets/screenshots/android/\`
- [ ] Copy description from \`/store/playstore/description.txt\`
- [ ] Add promotional text
- [ ] Set app category

## 🎨 Branding

Color Palette: See \`/assets/colors.json\`

## 📝 Notes

- All images have been optimized for store requirements
- Descriptions are SEO-optimized for better discoverability
- Screenshots may need device frames added using tools like Mockuphone
- Review all content before submission

## 🚀 Next Steps

1. Review all generated content
2. Customize descriptions if needed
3. Add more screenshots showing key features
4. Test on actual devices
5. Submit to stores!

---
Generated by AI App Publisher System
`;

    await fs.writeFile(path.join(exportPath, 'README.md'), readme, 'utf-8');
    Logger.success('README.md created');
  }

  /**
   * Create a zip archive of the export (optional)
   */
  async createArchive(exportPath: string): Promise<string> {
    // This would require an archiving library like archiver
    // For now, just log the instruction
    Logger.info('To create a zip archive, run:');
    Logger.info(`  zip -r ${path.basename(exportPath)}.zip ${exportPath}`);
    return exportPath;
  }

  /**
   * Generate export summary
   */
  generateSummary(exportStructure: ExportStructure): string {
    return `
╔════════════════════════════════════════════════════════════╗
║           EXPORT COMPLETE - ${exportStructure.projectName.toUpperCase()}           ║
╚════════════════════════════════════════════════════════════╝

📦 Export Location: ${exportStructure.exportPath}

📱 App Information:
   Name: ${exportStructure.metadata.name}
   Category: ${exportStructure.metadata.category}
   Tagline: ${exportStructure.metadata.shortDescription}

🎨 Assets Generated:
   ✓ App Icon
   ✓ Splash Screen
   ✓ ${Object.keys(exportStructure.assets.icons || {}).length} Icon Sizes
   ✓ ${exportStructure.screenshots.length} Screenshots

📝 Metadata Files:
   ✓ App Store Description
   ✓ Play Store Description
   ✓ Keywords (${exportStructure.metadata.keywords.length})
   ✓ Promotional Text

🎯 Next Steps:
   1. Review all generated content
   2. Customize as needed
   3. Upload to App Store Connect / Play Console
   4. Submit for review!

════════════════════════════════════════════════════════════
`;
  }
}
