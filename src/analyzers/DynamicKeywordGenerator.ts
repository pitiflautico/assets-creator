import Replicate from 'replicate';
import { AppData, GeneratorConfig } from '../types';

/**
 * Generador Dinámico de Keywords
 * NO usa listas predefinidas, genera keywords basándose en análisis real
 */
export class DynamicKeywordGenerator {
  private replicate: Replicate;
  private config: GeneratorConfig;

  constructor(config: GeneratorConfig) {
    this.config = config;
    this.replicate = new Replicate({
      auth: config.replicateApiKey,
    });
  }

  /**
   * Genera keywords completamente dinámicos basados en la app
   */
  async generateKeywords(
    appData: AppData,
    category: string,
    readmeContent?: string
  ): Promise<{
    primary: string[];
    secondary: string[];
    longTail: string[];
    trending: string[];
    all: string[];
  }> {
    console.log('🔑 Generando keywords dinámicos con IA...');

    try {
      const prompt = this.buildKeywordPrompt(appData, category, readmeContent);
      const response = await this.runLLM(prompt, 600);

      return this.parseKeywordResponse(response);
    } catch (error) {
      console.warn('⚠️  IA no disponible, usando generación básica');
      return this.generateKeywordsBasic(appData, category);
    }
  }

  /**
   * Construye prompt para generación de keywords
   */
  private buildKeywordPrompt(
    appData: AppData,
    category: string,
    readmeContent?: string
  ): string {
    const context = this.gatherContext(appData, readmeContent);

    return `You are an expert ASO (App Store Optimization) specialist. Generate highly relevant keywords for this app.

APP INFORMATION:
${context}

CATEGORY: ${category}

TASK:
Generate keywords that will help this app rank well in app stores. Consider:
1. What users would search for
2. Specific features and functionality
3. Problem it solves
4. Target audience needs
5. Alternative apps/competitors
6. Industry-specific terms
7. Action words (verbs)
8. Trending terms in this space

Provide 4 types of keywords:

PRIMARY (5-7 keywords): Most important, high-volume search terms
SECONDARY (10-12 keywords): Supporting keywords, medium volume
LONG_TAIL (8-10 keywords): Specific phrases, lower volume but high intent
TRENDING (5 keywords): Currently popular terms in this category

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
PRIMARY: keyword1, keyword2, keyword3, ...
SECONDARY: keyword1, keyword2, keyword3, ...
LONG_TAIL: keyword phrase 1, keyword phrase 2, ...
TRENDING: keyword1, keyword2, keyword3, ...

Make them SPECIFIC to this app, not generic. Use actual app features and purpose.`;
  }

  /**
   * Reúne contexto
   */
  private gatherContext(appData: AppData, readmeContent?: string): string {
    const parts: string[] = [];

    parts.push(`App Name: ${appData.name}`);

    if (appData.description) {
      parts.push(`Description: ${appData.description}`);
    }

    if (appData.features && appData.features.length > 0) {
      parts.push(`Key Features:\n${appData.features.map(f => `- ${f}`).join('\n')}`);
    }

    parts.push(`Platform: ${appData.platform}`);

    if (readmeContent && readmeContent.length > 100) {
      const snippet = readmeContent.substring(0, 800);
      parts.push(`\nAbout the app:\n${snippet}`);
    }

    return parts.join('\n');
  }

  /**
   * Parsea respuesta de keywords
   */
  private parseKeywordResponse(response: string): {
    primary: string[];
    secondary: string[];
    longTail: string[];
    trending: string[];
    all: string[];
  } {
    const primaryMatch = response.match(/PRIMARY:\s*(.+?)(?=\n[A-Z_]+:|$)/is);
    const secondaryMatch = response.match(/SECONDARY:\s*(.+?)(?=\n[A-Z_]+:|$)/is);
    const longTailMatch = response.match(/LONG[_-]TAIL:\s*(.+?)(?=\n[A-Z_]+:|$)/is);
    const trendingMatch = response.match(/TRENDING:\s*(.+?)(?=\n[A-Z_]+:|$)/is);

    const parseKeywords = (text: string | undefined): string[] => {
      if (!text) return [];
      return text
        .split(/[,\n]/)
        .map(k => k.trim())
        .filter(k => k.length > 0 && k.length < 50)
        .slice(0, 20);
    };

    const primary = parseKeywords(primaryMatch?.[1]);
    const secondary = parseKeywords(secondaryMatch?.[1]);
    const longTail = parseKeywords(longTailMatch?.[1]);
    const trending = parseKeywords(trendingMatch?.[1]);

    const all = [...new Set([...primary, ...secondary, ...longTail, ...trending])];

    return {
      primary: primary.slice(0, 7),
      secondary: secondary.slice(0, 12),
      longTail: longTail.slice(0, 10),
      trending: trending.slice(0, 5),
      all,
    };
  }

  /**
   * Generación básica sin IA
   */
  private generateKeywordsBasic(
    appData: AppData,
    category: string
  ): {
    primary: string[];
    secondary: string[];
    longTail: string[];
    trending: string[];
    all: string[];
  } {
    const keywords = new Set<string>();

    // Extraer de nombre
    const nameWords = appData.name
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(w => w.length > 2);
    nameWords.forEach(w => keywords.add(w));

    // Extraer de descripción
    if (appData.description) {
      const descWords = appData.description
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(w => w.length > 3)
        .slice(0, 10);
      descWords.forEach(w => keywords.add(w));
    }

    // Extraer de features
    if (appData.features) {
      appData.features.forEach(feature => {
        const words = feature
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter(w => w.length > 3);
        words.forEach(w => keywords.add(w));
      });
    }

    // Agregar keywords del package.json
    if (appData.keywords) {
      appData.keywords.forEach(k => keywords.add(k.toLowerCase()));
    }

    // Agregar categoría
    keywords.add(category.toLowerCase());

    const allKeywords = Array.from(keywords).slice(0, 30);

    return {
      primary: allKeywords.slice(0, 7),
      secondary: allKeywords.slice(7, 19),
      longTail: allKeywords.slice(19, 27),
      trending: allKeywords.slice(27, 30),
      all: allKeywords,
    };
  }

  /**
   * Ejecuta LLM
   */
  private async runLLM(prompt: string, maxTokens: number): Promise<string> {
    const output = await this.replicate.run(
      this.config.models.llm as `${string}/${string}` | `${string}/${string}:${string}`,
      {
        input: {
          prompt: prompt,
          max_tokens: maxTokens,
          temperature: 0.7,
          top_p: 0.9,
        },
      }
    );

    if (Array.isArray(output)) {
      return output.join('');
    }
    return String(output);
  }
}
