import Replicate from 'replicate';
import { AppData, GeneratedMetadata, GeneratorConfig } from '../types';

/**
 * Generador inteligente de textos y metadatos usando Replicate AI
 * Crea descripciones, títulos, keywords optimizados para app stores
 */
export class TextGenerator {
  private replicate: Replicate;
  private config: GeneratorConfig;

  constructor(config: GeneratorConfig) {
    this.config = config;
    this.replicate = new Replicate({
      auth: config.replicateApiKey,
    });
  }

  /**
   * Genera todos los metadatos de la app
   */
  async generateMetadata(appData: AppData): Promise<GeneratedMetadata> {
    console.log('🤖 Generando metadatos inteligentes...');

    // Generar título optimizado
    const title = await this.generateTitle(appData);

    // Generar descripciones
    const descriptions = await this.generateDescriptions(appData);

    // Generar keywords
    const keywords = await this.generateKeywords(appData);

    // Generar tags
    const tags = await this.generateTags(appData);

    // Generar textos adicionales
    const additionalTexts = await this.generateAdditionalTexts(appData);

    return {
      title: title,
      shortDescription: descriptions.short,
      fullDescription: descriptions.full,
      keywords: keywords,
      tags: tags,
      category: appData.category || 'Utilities',
      subtitle: additionalTexts.subtitle,
      promotionalText: additionalTexts.promotional,
      whatsNew: additionalTexts.whatsNew,
    };
  }

  /**
   * Genera un título optimizado para app stores
   */
  private async generateTitle(appData: AppData): Promise<string> {
    const prompt = this.buildTitlePrompt(appData);
    const response = await this.runLLM(prompt, 100);

    // Extraer solo el título (primera línea)
    const title = response.split('\n')[0].trim();

    // Limpiar comillas y caracteres extraños
    return title.replace(/^["']|["']$/g, '').substring(0, 50);
  }

  /**
   * Genera descripciones corta y larga
   */
  private async generateDescriptions(appData: AppData): Promise<{
    short: string;
    full: string;
  }> {
    // Descripción corta (para subtítulo/resumen)
    const shortPrompt = this.buildShortDescriptionPrompt(appData);
    const shortResponse = await this.runLLM(shortPrompt, 150);
    const shortDescription = shortResponse.trim().substring(0, 160);

    // Descripción completa (para App Store)
    const fullPrompt = this.buildFullDescriptionPrompt(appData);
    const fullResponse = await this.runLLM(fullPrompt, 2000);

    return {
      short: shortDescription,
      full: fullResponse.trim(),
    };
  }

  /**
   * Genera keywords optimizados para ASO
   */
  private async generateKeywords(appData: AppData): Promise<string[]> {
    const prompt = this.buildKeywordsPrompt(appData);
    const response = await this.runLLM(prompt, 300);

    // Parsear keywords (esperamos una lista separada por comas)
    const keywords = response
      .split(/[,\n]/)
      .map(k => k.trim())
      .filter(k => k.length > 0 && k.length < 30)
      .slice(0, 30);

    return keywords;
  }

  /**
   * Genera tags
   */
  private async generateTags(appData: AppData): Promise<string[]> {
    const prompt = this.buildTagsPrompt(appData);
    const response = await this.runLLM(prompt, 200);

    const tags = response
      .split(/[,\n]/)
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0)
      .slice(0, 20);

    return tags;
  }

  /**
   * Genera textos adicionales
   */
  private async generateAdditionalTexts(appData: AppData): Promise<{
    subtitle: string;
    promotional: string;
    whatsNew: string;
  }> {
    const subtitlePrompt = `Create a compelling subtitle (max 30 chars) for this app:
App: ${appData.name}
Description: ${appData.description}
Features: ${appData.features?.join(', ')}

Subtitle:`;

    const promotionalPrompt = `Write promotional text (max 170 chars) for this app that highlights its unique value:
App: ${appData.name}
Description: ${appData.description}
Features: ${appData.features?.join(', ')}

Promotional text:`;

    const whatsNewPrompt = `Write "What's New" update notes for version ${appData.version || '1.0.0'}:
App: ${appData.name}
Features: ${appData.features?.join(', ')}

What's New:`;

    const [subtitle, promotional, whatsNew] = await Promise.all([
      this.runLLM(subtitlePrompt, 50),
      this.runLLM(promotionalPrompt, 200),
      this.runLLM(whatsNewPrompt, 300),
    ]);

    return {
      subtitle: subtitle.trim().substring(0, 30),
      promotional: promotional.trim().substring(0, 170),
      whatsNew: whatsNew.trim(),
    };
  }

  /**
   * Construye prompt para título
   */
  private buildTitlePrompt(appData: AppData): string {
    return `You are an expert App Store Optimization (ASO) specialist. Generate a compelling, SEO-optimized app title.

App Information:
- Name: ${appData.name}
- Description: ${appData.description || 'Not provided'}
- Features: ${appData.features?.join(', ') || 'Not provided'}
- Category: ${appData.category || 'Not specified'}
- Platform: ${appData.platform}

Requirements:
- Maximum 30 characters
- Include main keyword
- Be memorable and unique
- Follow App Store guidelines
- No special characters or emojis
- Professional and trustworthy

Generate ONLY the title, nothing else:`;
  }

  /**
   * Construye prompt para descripción corta
   */
  private buildShortDescriptionPrompt(appData: AppData): string {
    return `You are an expert App Store Optimization specialist. Write a compelling short description.

App Information:
- Name: ${appData.name}
- Description: ${appData.description || 'Not provided'}
- Features: ${appData.features?.join(', ') || 'Not provided'}
- Category: ${appData.category}

Requirements:
- Maximum 160 characters
- Highlight main benefit
- Include call-to-action
- SEO optimized
- No emojis

Write ONLY the short description:`;
  }

  /**
   * Construye prompt para descripción completa
   */
  private buildFullDescriptionPrompt(appData: AppData): string {
    return `You are an expert App Store Optimization and copywriting specialist. Write a compelling full app description.

App Information:
- Name: ${appData.name}
- Description: ${appData.description || 'Not provided'}
- Features: ${appData.features?.join(', ') || 'Not provided'}
- Category: ${appData.category}
- Platform: ${appData.platform}
- Technologies: ${appData.sourceCode?.technologies?.join(', ') || 'Not specified'}

Requirements:
- 1000-2000 characters
- Start with a hook that grabs attention
- Clearly explain main features and benefits
- Use bullet points for features
- Include social proof if applicable
- SEO optimized with relevant keywords
- Professional tone
- Include call-to-action
- Follow App Store best practices

Structure:
1. Compelling opening paragraph
2. Key features (bullet points)
3. Benefits and use cases
4. Closing with call-to-action

Write the complete description:`;
  }

  /**
   * Construye prompt para keywords
   */
  private buildKeywordsPrompt(appData: AppData): string {
    return `You are an ASO expert specializing in keyword research. Generate high-value keywords.

App Information:
- Name: ${appData.name}
- Description: ${appData.description}
- Features: ${appData.features?.join(', ')}
- Category: ${appData.category}
- Platform: ${appData.platform}

Generate 25-30 keywords that:
- Are highly relevant to the app
- Have good search volume
- Are not too competitive
- Include long-tail keywords
- Cover different user intents
- Follow App Store guidelines

Return ONLY a comma-separated list of keywords:`;
  }

  /**
   * Construye prompt para tags
   */
  private buildTagsPrompt(appData: AppData): string {
    return `Generate relevant tags for this app:

App: ${appData.name}
Description: ${appData.description}
Category: ${appData.category}
Features: ${appData.features?.join(', ')}

Generate 15-20 tags that:
- Are single words or short phrases
- Cover technology, use case, and target audience
- Are SEO friendly
- Are lowercase

Return ONLY a comma-separated list:`;
  }

  /**
   * Ejecuta el modelo de lenguaje
   */
  private async runLLM(prompt: string, maxTokens: number): Promise<string> {
    try {
      const output = await this.replicate.run(
        this.config.models.llm as `${string}/${string}` | `${string}/${string}:${string}`,
        {
          input: {
            prompt: prompt,
            max_tokens: maxTokens,
            temperature: 0.7,
            top_p: 0.9,
            repetition_penalty: 1.1,
          },
        }
      );

      // El output puede ser un array o string dependiendo del modelo
      if (Array.isArray(output)) {
        return output.join('');
      }

      return String(output);
    } catch (error) {
      console.error('Error en Replicate LLM:', error);
      throw new Error(`Failed to generate text: ${error}`);
    }
  }

  /**
   * Genera contenido para redes sociales
   */
  async generateSocialMediaContent(appData: AppData): Promise<string[]> {
    const prompt = `Create 5 social media posts promoting this app:

App: ${appData.name}
Description: ${appData.description}
Features: ${appData.features?.join(', ')}

Requirements:
- Each post max 280 characters
- Engaging and shareable
- Include hashtags
- Different angles (features, benefits, use cases, etc.)

Generate 5 posts, one per line:`;

    const response = await this.runLLM(prompt, 800);
    return response.split('\n').filter(line => line.trim().length > 0).slice(0, 5);
  }

  /**
   * Genera contenido para sitio web
   */
  async generateWebsiteContent(appData: AppData): Promise<string> {
    const prompt = `Create compelling website content for this app:

App: ${appData.name}
Description: ${appData.description}
Features: ${appData.features?.join(', ')}
Category: ${appData.category}

Generate a landing page structure with:
1. Hero section headline and subheadline
2. Features section (3-5 features)
3. Benefits section
4. Call-to-action

Format in Markdown:`;

    return await this.runLLM(prompt, 1500);
  }
}
