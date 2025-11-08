/**
 * Color Palette Extractor
 * Extracts color palette from project source code
 */

import path from 'path';
import fs from 'fs-extra';
import { Glob } from 'glob';
import { Logger, fileExists } from './utils';

export interface ColorPalette {
  primary: string[];
  secondary: string[];
  accent: string[];
  neutral: string[];
  all: string[];
}

export class ColorExtractor {
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  /**
   * Extract color palette from project
   */
  async extractPalette(): Promise<ColorPalette> {
    Logger.step('Extracting color palette from project...');

    const colors: string[] = [];

    // Extract from Tailwind config
    const tailwindColors = await this.extractFromTailwind();
    colors.push(...tailwindColors);

    // Extract from theme files
    const themeColors = await this.extractFromTheme();
    colors.push(...themeColors);

    // Extract from style files
    const styleColors = await this.extractFromStyles();
    colors.push(...styleColors);

    // Extract from code
    const codeColors = await this.extractFromCode();
    colors.push(...codeColors);

    // Deduplicate and normalize
    const uniqueColors = this.deduplicateColors(colors);

    // Categorize colors
    const palette = this.categorizeColors(uniqueColors);

    Logger.success(`Found ${palette.all.length} unique colors`);
    Logger.info(`Primary: ${palette.primary.slice(0, 3).join(', ')}`);

    return palette;
  }

  /**
   * Extract colors from Tailwind config
   */
  private async extractFromTailwind(): Promise<string[]> {
    const colors: string[] = [];

    const configPaths = [
      'tailwind.config.js',
      'tailwind.config.ts',
      'tailwind.config.cjs',
    ];

    for (const configPath of configPaths) {
      const filepath = path.join(this.projectPath, configPath);
      if (await fileExists(filepath)) {
        try {
          const content = await fs.readFile(filepath, 'utf-8');
          colors.push(...this.extractColorsFromText(content));
          Logger.info('Colors extracted from Tailwind config');
        } catch (error) {
          // Ignore
        }
      }
    }

    return colors;
  }

  /**
   * Extract colors from theme files
   */
  private async extractFromTheme(): Promise<string[]> {
    const colors: string[] = [];

    try {
      const glob = new Glob('**/{theme,themes,constants/Colors,config/colors}.{ts,tsx,js,jsx}', {
        cwd: this.projectPath,
        ignore: ['node_modules/**', '**/node_modules/**'],
      });

      const themeFiles = Array.from(await glob);

      for (const file of themeFiles) {
        const filepath = path.join(this.projectPath, file);
        const content = await fs.readFile(filepath, 'utf-8');
        colors.push(...this.extractColorsFromText(content));
      }

      if (themeFiles.length > 0) {
        Logger.info(`Colors extracted from ${themeFiles.length} theme files`);
      }
    } catch (error) {
      // Ignore
    }

    return colors;
  }

  /**
   * Extract colors from style files
   */
  private async extractFromStyles(): Promise<string[]> {
    const colors: string[] = [];

    try {
      const glob = new Glob('**/*.{css,scss,sass,less}', {
        cwd: this.projectPath,
        ignore: ['node_modules/**', '**/node_modules/**'],
      });

      const styleFiles = (Array.from(await glob)).slice(0, 20);

      for (const file of styleFiles) {
        const filepath = path.join(this.projectPath, file);
        const content = await fs.readFile(filepath, 'utf-8');
        colors.push(...this.extractColorsFromText(content));
      }

      if (styleFiles.length > 0) {
        Logger.info(`Colors extracted from ${styleFiles.length} style files`);
      }
    } catch (error) {
      // Ignore
    }

    return colors;
  }

  /**
   * Extract colors from code files
   */
  private async extractFromCode(): Promise<string[]> {
    const colors: string[] = [];

    try {
      const glob = new Glob('**/*.{ts,tsx,js,jsx}', {
        cwd: this.projectPath,
        ignore: ['node_modules/**', '**/node_modules/**'],
      });

      const codeFiles = (Array.from(await glob)).slice(0, 30);

      for (const file of codeFiles) {
        const filepath = path.join(this.projectPath, file);
        const content = await fs.readFile(filepath, 'utf-8');

        // Only extract colors from style-related code
        if (
          content.includes('backgroundColor') ||
          content.includes('color:') ||
          content.includes('StyleSheet')
        ) {
          colors.push(...this.extractColorsFromText(content));
        }
      }
    } catch (error) {
      // Ignore
    }

    return colors;
  }

  /**
   * Extract color values from text
   */
  private extractColorsFromText(text: string): string[] {
    const colors: string[] = [];

    // Hex colors (#RGB, #RRGGBB, #RRGGBBAA)
    const hexRegex = /#([0-9A-Fa-f]{3}){1,2}([0-9A-Fa-f]{2})?/g;
    const hexMatches = text.match(hexRegex);
    if (hexMatches) {
      colors.push(...hexMatches.map(this.normalizeHexColor));
    }

    // RGB/RGBA colors
    const rgbRegex = /rgba?\([\d\s,]+\)/g;
    const rgbMatches = text.match(rgbRegex);
    if (rgbMatches) {
      colors.push(...rgbMatches.map(this.rgbToHex));
    }

    return colors;
  }

  /**
   * Normalize hex color
   */
  private normalizeHexColor(color: string): string {
    color = color.toUpperCase();

    // Convert 3-digit hex to 6-digit
    if (color.length === 4) {
      const r = color[1];
      const g = color[2];
      const b = color[3];
      color = `#${r}${r}${g}${g}${b}${b}`;
    }

    // Remove alpha if present
    if (color.length === 9) {
      color = color.slice(0, 7);
    }

    return color;
  }

  /**
   * Convert RGB to hex
   */
  private rgbToHex(rgb: string): string {
    const matches = rgb.match(/\d+/g);
    if (!matches || matches.length < 3) return '#000000';

    const r = parseInt(matches[0]);
    const g = parseInt(matches[1]);
    const b = parseInt(matches[2]);

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
  }

  /**
   * Deduplicate colors
   */
  private deduplicateColors(colors: string[]): string[] {
    const unique = new Set<string>();

    for (const color of colors) {
      if (this.isValidColor(color)) {
        unique.add(color);
      }
    }

    return Array.from(unique);
  }

  /**
   * Check if color is valid
   */
  private isValidColor(color: string): boolean {
    // Must be a hex color
    if (!/^#[0-9A-F]{6}$/i.test(color)) return false;

    // Exclude pure black and white
    if (color === '#000000' || color === '#FFFFFF') return false;

    // Exclude very dark or very light colors
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const brightness = (r + g + b) / 3;

    if (brightness < 20 || brightness > 235) return false;

    return true;
  }

  /**
   * Categorize colors into groups
   */
  private categorizeColors(colors: string[]): ColorPalette {
    const primary: string[] = [];
    const secondary: string[] = [];
    const accent: string[] = [];
    const neutral: string[] = [];

    // Sort by saturation and brightness
    const sorted = colors.sort((a, b) => {
      const satA = this.getSaturation(a);
      const satB = this.getSaturation(b);
      return satB - satA;
    });

    for (let i = 0; i < sorted.length; i++) {
      const color = sorted[i];
      const sat = this.getSaturation(color);

      if (sat > 40 && primary.length < 3) {
        primary.push(color);
      } else if (sat > 25 && secondary.length < 3) {
        secondary.push(color);
      } else if (sat > 15 && accent.length < 3) {
        accent.push(color);
      } else if (neutral.length < 3) {
        neutral.push(color);
      }
    }

    return {
      primary: primary.length > 0 ? primary : ['#007AFF'],
      secondary: secondary.length > 0 ? secondary : ['#5856D6'],
      accent: accent.length > 0 ? accent : ['#FF9500'],
      neutral: neutral.length > 0 ? neutral : ['#8E8E93'],
      all: sorted,
    };
  }

  /**
   * Get color saturation
   */
  private getSaturation(hex: string): number {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    if (max === 0) return 0;

    return (delta / max) * 100;
  }
}
