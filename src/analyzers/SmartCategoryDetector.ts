import Replicate from 'replicate';
import { AppData, GeneratorConfig } from '../types';

/**
 * Detector Inteligente de Categoría
 * Usa IA para detectar la categoría real basándose en análisis profundo
 * NO usa listas fijas, es completamente dinámico
 */
export class SmartCategoryDetector {
  private replicate: Replicate;
  private config: GeneratorConfig;

  constructor(config: GeneratorConfig) {
    this.config = config;
    this.replicate = new Replicate({
      auth: config.replicateApiKey,
    });
  }

  /**
   * Detecta categoría usando IA (análisis profundo)
   */
  async detectCategory(appData: AppData, readmeContent?: string): Promise<{
    category: string;
    subcategory?: string;
    confidence: number;
    reasoning: string;
    suggestedKeywords: string[];
    targetAudience: string;
    appType: string;
  }> {
    console.log('🧠 Detectando categoría con IA...');

    try {
      const prompt = this.buildCategoryDetectionPrompt(appData, readmeContent);
      const response = await this.runLLM(prompt, 800);

      return this.parseCategoryResponse(response);
    } catch (error) {
      console.warn('⚠️  IA no disponible, usando detección básica');
      return this.detectCategoryBasic(appData);
    }
  }

  /**
   * Construye prompt para detección de categoría
   */
  private buildCategoryDetectionPrompt(appData: AppData, readmeContent?: string): string {
    const context = this.gatherContext(appData, readmeContent);

    return `You are an expert app categorization system. Analyze this app deeply and determine its category.

APP INFORMATION:
${context}

TASK:
1. Analyze ALL the information provided
2. Determine the PRIMARY category (be specific, not generic)
3. Identify subcategory if applicable
4. Determine app type (utility, entertainment, tool, service, etc.)
5. Identify target audience
6. Suggest relevant keywords based on actual content
7. Explain your reasoning

APP STORE CATEGORIES TO CONSIDER:
- Health & Fitness (workout, exercise, meditation, nutrition, wellness)
- Music (player, streaming, creation, production, DJ, instruments)
- Productivity (tasks, notes, calendar, organization, time management)
- Entertainment (games, media, fun, leisure)
- Social (chat, networking, community, dating)
- Photo & Video (editing, camera, filters, creation)
- Education (learning, courses, training, languages)
- Business (enterprise, sales, CRM, analytics)
- Utilities (tools, calculators, converters, helpers)
- Finance (banking, budget, crypto, payments, invoicing)
- Food & Drink (recipes, restaurants, delivery, nutrition)
- Travel (maps, booking, guides, navigation)
- Lifestyle (fashion, home, shopping, hobbies)
- Sports (scores, news, fantasy, training)
- News (media, magazines, RSS)
- Developer Tools (coding, API, debugging, libraries)
- Books (reading, audiobooks, libraries)
- Medical (health records, symptoms, doctor)
- Shopping (e-commerce, marketplace, deals)
- Weather (forecast, radar, alerts)
- Reference (dictionaries, encyclopedias, guides)
- Navigation (GPS, maps, directions)

But DON'T limit yourself to these - if the app fits a different or more specific category, suggest it.

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
CATEGORY: [primary category]
SUBCATEGORY: [subcategory or "none"]
APP_TYPE: [type of app]
TARGET_AUDIENCE: [who is this for]
CONFIDENCE: [0-100]
KEYWORDS: [keyword1, keyword2, keyword3, ...]
REASONING: [explain why this category fits]

Be specific and accurate. Analyze deeply.`;
  }

  /**
   * Reúne todo el contexto disponible
   */
  private gatherContext(appData: AppData, readmeContent?: string): string {
    const parts: string[] = [];

    parts.push(`Name: ${appData.name}`);

    if (appData.description) {
      parts.push(`Description: ${appData.description}`);
    }

    if (appData.keywords && appData.keywords.length > 0) {
      parts.push(`Keywords: ${appData.keywords.join(', ')}`);
    }

    if (appData.features && appData.features.length > 0) {
      parts.push(`Features:\n${appData.features.map(f => `- ${f}`).join('\n')}`);
    }

    if (appData.sourceCode?.technologies) {
      parts.push(`Technologies: ${appData.sourceCode.technologies.join(', ')}`);
    }

    if (appData.sourceCode?.frameworks) {
      parts.push(`Frameworks: ${appData.sourceCode.frameworks.join(', ')}`);
    }

    parts.push(`Platform: ${appData.platform}`);

    if (readmeContent && readmeContent.length > 100) {
      // Incluir primeros 1000 caracteres del README
      const readmeSnippet = readmeContent.substring(0, 1000);
      parts.push(`\nREADME Content:\n${readmeSnippet}`);
    }

    // Analizar dependencias para pistas adicionales
    if (appData.packageJson?.dependencies) {
      const deps = Object.keys(appData.packageJson.dependencies);
      const relevantDeps = deps.filter(dep =>
        !dep.startsWith('@types') &&
        !['react', 'vue', 'angular'].includes(dep)
      ).slice(0, 10);

      if (relevantDeps.length > 0) {
        parts.push(`\nKey Dependencies: ${relevantDeps.join(', ')}`);
      }
    }

    return parts.join('\n');
  }

  /**
   * Parsea respuesta de IA
   */
  private parseCategoryResponse(response: string): {
    category: string;
    subcategory?: string;
    confidence: number;
    reasoning: string;
    suggestedKeywords: string[];
    targetAudience: string;
    appType: string;
  } {
    const categoryMatch = response.match(/CATEGORY:\s*(.+?)(?=\n|$)/i);
    const subcategoryMatch = response.match(/SUBCATEGORY:\s*(.+?)(?=\n|$)/i);
    const appTypeMatch = response.match(/APP_TYPE:\s*(.+?)(?=\n|$)/i);
    const audienceMatch = response.match(/TARGET_AUDIENCE:\s*(.+?)(?=\n|$)/i);
    const confidenceMatch = response.match(/CONFIDENCE:\s*(\d+)/i);
    const keywordsMatch = response.match(/KEYWORDS:\s*(.+?)(?=\n[A-Z_]+:|$)/is);
    const reasoningMatch = response.match(/REASONING:\s*(.+?)(?=\n[A-Z_]+:|$)/is);

    const category = categoryMatch?.[1].trim() || 'Utilities';
    const subcategory = subcategoryMatch?.[1].trim();
    const appType = appTypeMatch?.[1].trim() || 'app';
    const targetAudience = audienceMatch?.[1].trim() || 'General users';
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 50;
    const reasoning = reasoningMatch?.[1].trim() || 'Based on app analysis';

    const keywords = keywordsMatch
      ? keywordsMatch[1]
          .split(/[,\n]/)
          .map(k => k.trim())
          .filter(k => k.length > 0 && k.toLowerCase() !== 'none')
      : [];

    return {
      category,
      subcategory: subcategory && subcategory.toLowerCase() !== 'none' ? subcategory : undefined,
      confidence,
      reasoning,
      suggestedKeywords: keywords,
      targetAudience,
      appType,
    };
  }

  /**
   * Detección básica sin IA (fallback)
   */
  private detectCategoryBasic(appData: AppData): {
    category: string;
    subcategory?: string;
    confidence: number;
    reasoning: string;
    suggestedKeywords: string[];
    targetAudience: string;
    appType: string;
  } {
    // Analizar todas las palabras disponibles
    const allText = [
      appData.name,
      appData.description,
      ...(appData.keywords || []),
      ...(appData.features || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    // Detectores más específicos
    const detectors = [
      {
        category: 'Music',
        keywords: ['music', 'audio', 'song', 'player', 'spotify', 'sound', 'track', 'album', 'artist', 'playlist', 'mp3', 'streaming', 'radio', 'podcast', 'beat', 'tempo', 'melody'],
        subcategory: null,
      },
      {
        category: 'Health & Fitness',
        keywords: ['health', 'fitness', 'workout', 'exercise', 'tabata', 'hiit', 'gym', 'cardio', 'yoga', 'running', 'training', 'meditation', 'wellness', 'diet', 'nutrition'],
        subcategory: null,
      },
      {
        category: 'Photo & Video',
        keywords: ['photo', 'video', 'camera', 'image', 'picture', 'filter', 'editing', 'gallery', 'instagram', 'tiktok', 'snap'],
        subcategory: null,
      },
      {
        category: 'Games',
        keywords: ['game', 'play', 'player', 'score', 'level', 'arcade', 'puzzle', 'adventure', 'multiplayer'],
        subcategory: null,
      },
      {
        category: 'Productivity',
        keywords: ['productivity', 'task', 'todo', 'note', 'calendar', 'reminder', 'organize', 'planner', 'workflow'],
        subcategory: null,
      },
      {
        category: 'Social',
        keywords: ['social', 'chat', 'message', 'friend', 'community', 'network', 'dating', 'conversation'],
        subcategory: null,
      },
      {
        category: 'Developer Tools',
        keywords: ['developer', 'code', 'programming', 'api', 'sdk', 'debug', 'terminal', 'git', 'compiler'],
        subcategory: null,
      },
      {
        category: 'Food & Drink',
        keywords: ['food', 'recipe', 'cooking', 'restaurant', 'delivery', 'meal', 'diet', 'cuisine'],
        subcategory: null,
      },
      {
        category: 'Travel',
        keywords: ['travel', 'trip', 'hotel', 'flight', 'booking', 'tourism', 'vacation', 'destination'],
        subcategory: null,
      },
      {
        category: 'Finance',
        keywords: ['finance', 'money', 'bank', 'payment', 'crypto', 'bitcoin', 'invoice', 'budget', 'expense'],
        subcategory: null,
      },
    ];

    // Encontrar mejor match
    let bestMatch = { category: 'Utilities', score: 0, keywords: [] as string[] };

    for (const detector of detectors) {
      const matches = detector.keywords.filter(kw => allText.includes(kw));
      const score = matches.length;

      if (score > bestMatch.score) {
        bestMatch = {
          category: detector.category,
          score: score,
          keywords: matches,
        };
      }
    }

    return {
      category: bestMatch.category,
      confidence: Math.min(bestMatch.score * 20, 85),
      reasoning: `Detected based on keywords: ${bestMatch.keywords.join(', ')}`,
      suggestedKeywords: bestMatch.keywords,
      targetAudience: 'General users',
      appType: 'mobile app',
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
          temperature: 0.3, // Más determinístico para categorización
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
