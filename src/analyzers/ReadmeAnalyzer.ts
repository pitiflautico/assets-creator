import Replicate from 'replicate';
import { GeneratorConfig } from '../types';

/**
 * Analizador inteligente de README
 * Usa IA para extraer información real del README
 */
export class ReadmeAnalyzer {
  private replicate: Replicate;
  private config: GeneratorConfig;

  constructor(config: GeneratorConfig) {
    this.config = config;
    this.replicate = new Replicate({
      auth: config.replicateApiKey,
    });
  }

  /**
   * Analiza README con IA y extrae información estructurada
   */
  async analyzeReadme(readmeContent: string): Promise<{
    description: string;
    mainPurpose: string;
    targetAudience: string;
    keyFeatures: string[];
    uniqueSellingPoints: string[];
    category: string;
    keywords: string[];
    tone: string;
  }> {
    if (!readmeContent || readmeContent.length < 50) {
      return this.getDefaultAnalysis();
    }

    try {
      const prompt = this.buildAnalysisPrompt(readmeContent);
      const response = await this.runLLM(prompt, 1000);

      return this.parseAnalysisResponse(response);
    } catch (error) {
      console.warn('Error analizando README con IA:', error);
      return this.extractBasicInfo(readmeContent);
    }
  }

  /**
   * Construye prompt para análisis de README
   */
  private buildAnalysisPrompt(readme: string): string {
    // Limitar README a primeros 2000 caracteres para no exceder tokens
    const limitedReadme = readme.substring(0, 2000);

    return `Analyze this app README and extract structured information.

README:
${limitedReadme}

Extract and provide:
1. Main description (1-2 sentences)
2. Main purpose (what problem it solves)
3. Target audience (who is it for)
4. Key features (list 5-7 main features)
5. Unique selling points (what makes it special)
6. App category (Productivity, Health & Fitness, Social, Entertainment, Business, Education, Developer Tools, Utilities, Finance)
7. Keywords for app store (10-15 keywords)
8. Tone (professional, casual, technical, friendly)

Format your response as:
DESCRIPTION: [description]
PURPOSE: [purpose]
AUDIENCE: [audience]
FEATURES:
- [feature 1]
- [feature 2]
- [feature 3]
USPs:
- [usp 1]
- [usp 2]
CATEGORY: [category]
KEYWORDS: [keyword1, keyword2, keyword3, ...]
TONE: [tone]`;
  }

  /**
   * Parsea respuesta del LLM
   */
  private parseAnalysisResponse(response: string): {
    description: string;
    mainPurpose: string;
    targetAudience: string;
    keyFeatures: string[];
    uniqueSellingPoints: string[];
    category: string;
    keywords: string[];
    tone: string;
  } {
    const result = this.getDefaultAnalysis();

    // Extraer descripción
    const descMatch = response.match(/DESCRIPTION:\s*(.+?)(?=\n[A-Z]+:|$)/s);
    if (descMatch) {
      result.description = descMatch[1].trim();
    }

    // Extraer propósito
    const purposeMatch = response.match(/PURPOSE:\s*(.+?)(?=\n[A-Z]+:|$)/s);
    if (purposeMatch) {
      result.mainPurpose = purposeMatch[1].trim();
    }

    // Extraer audiencia
    const audienceMatch = response.match(/AUDIENCE:\s*(.+?)(?=\n[A-Z]+:|$)/s);
    if (audienceMatch) {
      result.targetAudience = audienceMatch[1].trim();
    }

    // Extraer features
    const featuresMatch = response.match(/FEATURES:\s*\n((?:[-*]\s*.+\n?)+)/);
    if (featuresMatch) {
      result.keyFeatures = featuresMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
        .map(line => line.replace(/^[-*]\s*/, '').trim())
        .filter(f => f.length > 0);
    }

    // Extraer USPs
    const uspsMatch = response.match(/USPs?:\s*\n((?:[-*]\s*.+\n?)+)/);
    if (uspsMatch) {
      result.uniqueSellingPoints = uspsMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
        .map(line => line.replace(/^[-*]\s*/, '').trim())
        .filter(u => u.length > 0);
    }

    // Extraer categoría
    const categoryMatch = response.match(/CATEGORY:\s*(.+?)(?=\n|$)/);
    if (categoryMatch) {
      result.category = categoryMatch[1].trim();
    }

    // Extraer keywords
    const keywordsMatch = response.match(/KEYWORDS:\s*(.+?)(?=\n[A-Z]+:|$)/s);
    if (keywordsMatch) {
      result.keywords = keywordsMatch[1]
        .split(/[,\n]/)
        .map(k => k.trim())
        .filter(k => k.length > 0);
    }

    // Extraer tone
    const toneMatch = response.match(/TONE:\s*(.+?)(?=\n|$)/);
    if (toneMatch) {
      result.tone = toneMatch[1].trim().toLowerCase();
    }

    return result;
  }

  /**
   * Extrae información básica sin IA (fallback)
   */
  private extractBasicInfo(readme: string): ReturnType<ReadmeAnalyzer['analyzeReadme']> {
    const result = this.getDefaultAnalysis();

    // Extraer primera descripción significativa
    const lines = readme.split('\n').filter(line => line.trim());
    for (const line of lines) {
      if (line.startsWith('#')) continue;
      if (line.includes('![') || line.includes('](')) continue;
      if (line.trim().length > 30) {
        result.description = line.trim();
        break;
      }
    }

    // Buscar sección de features
    const featuresSection = readme.match(/##?\s*Features?\s*\n([\s\S]+?)(?=\n##|$)/i);
    if (featuresSection) {
      result.keyFeatures = featuresSection[1]
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
        .map(line => line.replace(/^[-*]\s*/, '').trim())
        .filter(f => f.length > 0)
        .slice(0, 7);
    }

    return result;
  }

  /**
   * Análisis por defecto
   */
  private getDefaultAnalysis(): {
    description: string;
    mainPurpose: string;
    targetAudience: string;
    keyFeatures: string[];
    uniqueSellingPoints: string[];
    category: string;
    keywords: string[];
    tone: string;
  } {
    return {
      description: '',
      mainPurpose: '',
      targetAudience: 'General users',
      keyFeatures: [],
      uniqueSellingPoints: [],
      category: 'Utilities',
      keywords: [],
      tone: 'professional',
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
