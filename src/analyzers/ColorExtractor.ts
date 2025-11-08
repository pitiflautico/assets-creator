import sharp from 'sharp';
import * as fs from 'fs';

/**
 * Extractor de paleta de colores
 * Analiza imágenes existentes (logo, iconos) y extrae la paleta de colores
 */
export class ColorExtractor {
  /**
   * Extrae paleta de colores de una imagen
   */
  async extractPalette(imagePath: string): Promise<{
    primary: string;
    secondary: string[];
    dominant: string;
    palette: Array<{ color: string; percentage: number }>;
  } | null> {
    try {
      if (!fs.existsSync(imagePath)) {
        return null;
      }

      // Leer imagen y obtener datos
      const image = sharp(imagePath);
      const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

      // Contar colores
      const colorCounts = new Map<string, number>();
      const totalPixels = info.width * info.height;

      // Muestrear cada 10 píxeles para mejor performance
      for (let i = 0; i < data.length; i += info.channels * 10) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = info.channels === 4 ? data[i + 3] : 255;

        // Ignorar píxeles transparentes
        if (a < 128) continue;

        // Redondear colores para agrupar similares
        const rRound = Math.round(r / 25) * 25;
        const gRound = Math.round(g / 25) * 25;
        const bRound = Math.round(b / 25) * 25;

        const colorKey = `${rRound},${gRound},${bRound}`;
        colorCounts.set(colorKey, (colorCounts.get(colorKey) || 0) + 1);
      }

      // Convertir a array y ordenar por frecuencia
      const sortedColors = Array.from(colorCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      if (sortedColors.length === 0) {
        return null;
      }

      // Convertir a formato hex y calcular porcentajes
      const palette = sortedColors.map(([color, count]) => {
        const [r, g, b] = color.split(',').map(Number);
        const hex = this.rgbToHex(r, g, b);
        const percentage = (count / totalPixels) * 100;
        return { color: hex, percentage };
      });

      // Filtrar colores muy oscuros/claros (probablemente fondo)
      const filteredPalette = palette.filter(({ color }) => {
        const { r, g, b } = this.hexToRgb(color);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 20 && brightness < 240;
      });

      const finalPalette = filteredPalette.length > 0 ? filteredPalette : palette;

      return {
        primary: finalPalette[0]?.color || '#000000',
        secondary: finalPalette.slice(1, 4).map(p => p.color),
        dominant: finalPalette[0]?.color || '#000000',
        palette: finalPalette,
      };
    } catch (error) {
      console.warn(`Error extrayendo colores de ${imagePath}:`, error);
      return null;
    }
  }

  /**
   * Extrae paleta de múltiples imágenes y las combina
   */
  async extractFromMultipleImages(imagePaths: string[]): Promise<{
    primary: string;
    secondary: string[];
    accent: string;
    background: string;
    allColors: string[];
  }> {
    const allPalettes: Array<{ color: string; percentage: number }> = [];

    for (const imagePath of imagePaths) {
      const palette = await this.extractPalette(imagePath);
      if (palette) {
        allPalettes.push(...palette.palette);
      }
    }

    // Agrupar colores similares
    const groupedColors = this.groupSimilarColors(allPalettes);

    // Ordenar por frecuencia total
    const sortedColors = groupedColors.sort((a, b) => b.percentage - a.percentage);

    return {
      primary: sortedColors[0]?.color || '#007AFF',
      secondary: sortedColors.slice(1, 3).map(c => c.color),
      accent: sortedColors[3]?.color || '#FF9500',
      background: '#FFFFFF',
      allColors: sortedColors.map(c => c.color),
    };
  }

  /**
   * Agrupa colores similares
   */
  private groupSimilarColors(
    colors: Array<{ color: string; percentage: number }>
  ): Array<{ color: string; percentage: number }> {
    const grouped = new Map<string, number>();

    for (const { color, percentage } of colors) {
      let found = false;

      for (const [existingColor] of grouped) {
        if (this.areSimilarColors(color, existingColor)) {
          grouped.set(existingColor, grouped.get(existingColor)! + percentage);
          found = true;
          break;
        }
      }

      if (!found) {
        grouped.set(color, percentage);
      }
    }

    return Array.from(grouped.entries()).map(([color, percentage]) => ({ color, percentage }));
  }

  /**
   * Compara si dos colores son similares
   */
  private areSimilarColors(color1: string, color2: string, threshold: number = 30): boolean {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    const distance = Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
        Math.pow(rgb1.g - rgb2.g, 2) +
        Math.pow(rgb1.b - rgb2.b, 2)
    );

    return distance < threshold;
  }

  /**
   * Convierte RGB a HEX
   */
  private rgbToHex(r: number, g: number, b: number): string {
    return (
      '#' +
      [r, g, b]
        .map(x => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
    );
  }

  /**
   * Convierte HEX a RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  /**
   * Genera paleta complementaria
   */
  generateComplementaryColors(primaryColor: string): {
    complementary: string;
    analogous: string[];
    triadic: string[];
  } {
    const rgb = this.hexToRgb(primaryColor);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);

    // Color complementario (opuesto en el círculo cromático)
    const compHsl = { h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l };

    // Colores análogos (30° a cada lado)
    const analog1Hsl = { h: (hsl.h + 30) % 360, s: hsl.s, l: hsl.l };
    const analog2Hsl = { h: (hsl.h - 30 + 360) % 360, s: hsl.s, l: hsl.l };

    // Colores triádicos (120° de separación)
    const triad1Hsl = { h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l };
    const triad2Hsl = { h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l };

    return {
      complementary: this.hslToHex(compHsl.h, compHsl.s, compHsl.l),
      analogous: [
        this.hslToHex(analog1Hsl.h, analog1Hsl.s, analog1Hsl.l),
        this.hslToHex(analog2Hsl.h, analog2Hsl.s, analog2Hsl.l),
      ],
      triadic: [
        this.hslToHex(triad1Hsl.h, triad1Hsl.s, triad1Hsl.l),
        this.hslToHex(triad2Hsl.h, triad2Hsl.s, triad2Hsl.l),
      ],
    };
  }

  /**
   * Convierte RGB a HSL
   */
  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  /**
   * Convierte HSL a HEX
   */
  private hslToHex(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0;
    let g = 0;
    let b = 0;

    if (h >= 0 && h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (h >= 60 && h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (h >= 180 && h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (h >= 240 && h < 300) {
      r = x;
      g = 0;
      b = c;
    } else if (h >= 300 && h < 360) {
      r = c;
      g = 0;
      b = x;
    }

    const rHex = Math.round((r + m) * 255);
    const gHex = Math.round((g + m) * 255);
    const bHex = Math.round((b + m) * 255);

    return this.rgbToHex(rHex, gHex, bHex);
  }
}
