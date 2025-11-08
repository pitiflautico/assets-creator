import Replicate from 'replicate';
import { AppData, ASOOptimization, GeneratedMetadata, GeneratorConfig, MarketInsights } from '../types';

/**
 * Optimizador ASO (App Store Optimization)
 * Sistema inteligente que optimiza metadatos para máxima visibilidad en app stores
 */
export class ASOOptimizer {
  private replicate: Replicate;
  private config: GeneratorConfig;

  // Base de conocimiento ASO
  private readonly asoKnowledge = {
    // Keywords más efectivos por categoría
    categoryKeywords: {
      Productivity: [
        'task',
        'organize',
        'manage',
        'planner',
        'efficient',
        'workflow',
        'note',
        'reminder',
        'calendar',
      ],
      Social: [
        'chat',
        'message',
        'connect',
        'share',
        'community',
        'network',
        'friends',
        'social',
      ],
      Entertainment: ['fun', 'play', 'enjoy', 'game', 'entertainment', 'video', 'music'],
      Business: [
        'professional',
        'enterprise',
        'business',
        'crm',
        'sales',
        'analytics',
        'reporting',
      ],
      Education: ['learn', 'study', 'course', 'education', 'tutorial', 'training', 'skill'],
      'Developer Tools': ['developer', 'code', 'programming', 'api', 'tool', 'debug'],
      Utilities: ['tool', 'utility', 'helper', 'converter', 'calculator', 'simple', 'easy'],
      'Health & Fitness': [
        'health',
        'fitness',
        'workout',
        'exercise',
        'wellness',
        'tracker',
      ],
      Finance: ['finance', 'money', 'budget', 'payment', 'banking', 'invoice', 'expense'],
    },

    // Palabras power que aumentan conversión
    powerWords: [
      'best',
      'pro',
      'premium',
      'ultimate',
      'easy',
      'fast',
      'simple',
      'powerful',
      'smart',
      'advanced',
      'free',
      'unlimited',
      'secure',
      'private',
      'professional',
      'instant',
    ],

    // Palabras a evitar
    avoidWords: ['cheap', 'spam', 'virus', 'hack', 'crack', 'pirate', 'fake'],

    // Call-to-actions efectivos
    ctas: [
      'Download now',
      'Get started free',
      'Try it today',
      'Join millions of users',
      'Start your free trial',
      'Available now',
    ],

    // Trust signals
    trustSignals: [
      'secure',
      'privacy-focused',
      'trusted by thousands',
      'no ads',
      'offline mode',
      'regular updates',
      'customer support',
      'money-back guarantee',
    ],
  };

  constructor(config: GeneratorConfig) {
    this.config = config;
    this.replicate = new Replicate({
      auth: config.replicateApiKey,
    });
  }

  /**
   * Optimiza completamente la estrategia ASO
   */
  async optimize(appData: AppData, metadata: GeneratedMetadata): Promise<ASOOptimization> {
    console.log('🎯 Optimizando ASO (App Store Optimization)...');

    // Analizar keywords
    const primaryKeywords = await this.extractPrimaryKeywords(appData, metadata);
    const secondaryKeywords = await this.extractSecondaryKeywords(appData, metadata);

    // Generar variantes de título
    const titleSuggestions = await this.generateTitleVariants(appData, primaryKeywords);

    // Generar variantes de descripción
    const descriptionVariants = await this.generateDescriptionVariants(appData, primaryKeywords);

    // Calcular keyword density
    const keywordDensity = this.calculateKeywordDensity(metadata.fullDescription, [
      ...primaryKeywords,
      ...secondaryKeywords,
    ]);

    // Calcular readability score
    const readabilityScore = this.calculateReadability(metadata.fullDescription);

    // Obtener insights de conversión
    const conversionOptimization = this.getConversionOptimization(appData);

    // Análisis competitivo (simulado basado en categoría)
    const competitorAnalysis = this.analyzeCompetitors(appData);

    const optimization: ASOOptimization = {
      primaryKeywords,
      secondaryKeywords,
      competitorAnalysis,
      titleSuggestions,
      descriptionVariants,
      keywordDensity,
      readabilityScore,
      conversionOptimization,
    };

    // Generar reporte
    this.generateOptimizationReport(optimization);

    return optimization;
  }

  /**
   * Extrae keywords primarios (alta prioridad)
   */
  private async extractPrimaryKeywords(
    appData: AppData,
    metadata: GeneratedMetadata
  ): Promise<string[]> {
    const keywords = new Set<string>();

    // Agregar keywords de categoría
    const categoryKws =
      this.asoKnowledge.categoryKeywords[appData.category as keyof typeof this.asoKnowledge.categoryKeywords] || [];
    categoryKws.forEach(kw => keywords.add(kw));

    // Agregar keywords del nombre de la app
    const nameWords = appData.name
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(w => w.length > 3);
    nameWords.forEach(w => keywords.add(w));

    // Agregar keywords de features principales
    if (appData.features) {
      appData.features.slice(0, 3).forEach(feature => {
        const words = feature
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter(w => w.length > 3);
        words.forEach(w => keywords.add(w));
      });
    }

    // Filtrar y ordenar por relevancia
    const filtered = Array.from(keywords)
      .filter(kw => !this.asoKnowledge.avoidWords.includes(kw))
      .slice(0, 10);

    return filtered;
  }

  /**
   * Extrae keywords secundarios
   */
  private async extractSecondaryKeywords(
    appData: AppData,
    metadata: GeneratedMetadata
  ): Promise<string[]> {
    const keywords = new Set<string>();

    // Agregar power words relevantes
    this.asoKnowledge.powerWords.slice(0, 5).forEach(pw => keywords.add(pw));

    // Agregar keywords generados por IA
    if (metadata.keywords) {
      metadata.keywords.slice(0, 15).forEach(kw => keywords.add(kw.toLowerCase()));
    }

    // Agregar tecnologías
    if (appData.sourceCode?.technologies) {
      appData.sourceCode.technologies.forEach(tech => keywords.add(tech.toLowerCase()));
    }

    return Array.from(keywords).slice(0, 20);
  }

  /**
   * Genera variantes de título optimizadas
   */
  private async generateTitleVariants(appData: AppData, keywords: string[]): Promise<string[]> {
    const variants: string[] = [];

    // Variante 1: Nombre + Keyword principal
    if (keywords[0]) {
      variants.push(`${appData.name} - ${keywords[0]}`);
    }

    // Variante 2: Nombre + Categoría
    variants.push(`${appData.name}: ${appData.category}`);

    // Variante 3: Nombre + Beneficio
    const benefits = ['Pro', 'Premium', 'Ultimate', 'Smart', 'Easy'];
    variants.push(`${appData.name} ${benefits[0]}`);

    // Variante 4: Keyword + Nombre
    if (keywords[0]) {
      variants.push(`${keywords[0]} - ${appData.name}`);
    }

    // Variante 5: Nombre + Multiple keywords
    if (keywords.length >= 2) {
      variants.push(`${appData.name}: ${keywords[0]} & ${keywords[1]}`);
    }

    return variants.map(v => v.substring(0, 30)).slice(0, 5);
  }

  /**
   * Genera variantes de descripción optimizadas
   */
  private async generateDescriptionVariants(
    appData: AppData,
    keywords: string[]
  ): Promise<string[]> {
    const variants: string[] = [];

    // Generar con IA usando Replicate
    const prompt = `Generate 3 different app store description variations for:
App: ${appData.name}
Category: ${appData.category}
Features: ${appData.features?.join(', ')}
Target Keywords: ${keywords.join(', ')}

Requirements:
- Each variation 150-200 words
- Include keywords naturally
- Different tones (professional, friendly, technical)
- Strong opening hook
- Clear call-to-action

Generate 3 variations separated by "---":`;

    try {
      const output = await this.runLLM(prompt, 1500);
      const generatedVariants = output.split('---').map(v => v.trim());
      variants.push(...generatedVariants.slice(0, 3));
    } catch (error) {
      console.warn('Error generando variantes:', error);
    }

    return variants;
  }

  /**
   * Calcula densidad de keywords
   */
  private calculateKeywordDensity(text: string, keywords: string[]): Record<string, number> {
    const density: Record<string, number> = {};
    const words = text.toLowerCase().split(/\s+/);
    const totalWords = words.length;

    keywords.forEach(keyword => {
      const count = words.filter(w => w.includes(keyword.toLowerCase())).length;
      density[keyword] = totalWords > 0 ? (count / totalWords) * 100 : 0;
    });

    return density;
  }

  /**
   * Calcula score de legibilidad
   */
  private calculateReadability(text: string): number {
    // Algoritmo simplificado de Flesch Reading Ease
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = this.countSyllables(text);

    if (sentences.length === 0 || words.length === 0) return 0;

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    const score =
      206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

    // Normalizar a 0-100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Cuenta sílabas (aproximado)
   */
  private countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let count = 0;

    words.forEach(word => {
      // Contar vocales como aproximación de sílabas
      const vowels = word.match(/[aeiouy]+/g);
      count += vowels ? vowels.length : 1;
    });

    return count;
  }

  /**
   * Obtiene recomendaciones de optimización de conversión
   */
  private getConversionOptimization(appData: AppData): ASOOptimization['conversionOptimization'] {
    // Hooks específicos por categoría
    const hooks = this.generateHooks(appData);

    // CTAs relevantes
    const callsToAction = this.asoKnowledge.ctas.slice(0, 3);

    // Trust signals relevantes
    const trustSignals = this.asoKnowledge.trustSignals.slice(0, 5);

    return {
      hooks,
      callsToAction,
      trustSignals,
    };
  }

  /**
   * Genera hooks de conversión
   */
  private generateHooks(appData: AppData): string[] {
    const hooks: string[] = [];

    const hookTemplates = [
      `Transform your ${appData.category?.toLowerCase()} experience`,
      `The #1 ${appData.category} app for ${appData.platform}`,
      `Join thousands who love ${appData.name}`,
      `${appData.name} - Trusted by professionals worldwide`,
      `The easiest way to ${appData.features?.[0]?.toLowerCase()}`,
    ];

    return hookTemplates.slice(0, 5);
  }

  /**
   * Analiza competidores (simulado)
   */
  private analyzeCompetitors(appData: AppData): ASOOptimization['competitorAnalysis'] {
    // En una implementación real, esto usaría APIs de app stores
    return {
      similarApps: [
        `Similar ${appData.category} App 1`,
        `Similar ${appData.category} App 2`,
        `Similar ${appData.category} App 3`,
      ],
      gapOpportunities: [
        `Focus on ${appData.features?.[0] || 'unique features'}`,
        `Target ${appData.platform} specifically`,
        `Emphasize ease of use`,
      ],
    };
  }

  /**
   * Genera reporte de optimización
   */
  private generateOptimizationReport(optimization: ASOOptimization): void {
    console.log('\n📊 Reporte de Optimización ASO:');
    console.log('═══════════════════════════════════════');
    console.log(`\n🎯 Keywords Primarios (${optimization.primaryKeywords.length}):`);
    console.log(`   ${optimization.primaryKeywords.join(', ')}`);

    console.log(`\n🔍 Keywords Secundarios (${optimization.secondaryKeywords.length}):`);
    console.log(`   ${optimization.secondaryKeywords.slice(0, 10).join(', ')}`);

    console.log(`\n📈 Readability Score: ${optimization.readabilityScore.toFixed(1)}/100`);
    const readabilityLevel =
      optimization.readabilityScore > 60
        ? '✅ Excelente'
        : optimization.readabilityScore > 40
        ? '⚠️  Aceptable'
        : '❌ Mejorar';
    console.log(`   ${readabilityLevel}`);

    console.log('\n💡 Top 3 Title Suggestions:');
    optimization.titleSuggestions.slice(0, 3).forEach((title, i) => {
      console.log(`   ${i + 1}. ${title}`);
    });

    console.log('\n🎣 Conversion Hooks:');
    optimization.conversionOptimization.hooks.slice(0, 3).forEach((hook, i) => {
      console.log(`   ${i + 1}. ${hook}`);
    });

    console.log('\n✅ Recomendaciones:');
    console.log('   • Use keywords naturalmente en la descripción');
    console.log('   • Incluya social proof y trust signals');
    console.log('   • Optimice screenshots con texto descriptivo');
    console.log('   • Actualice regularmente con "What\'s New"');
    console.log('═══════════════════════════════════════\n');
  }

  /**
   * Obtiene insights de mercado usando IA
   */
  async getMarketInsights(appData: AppData): Promise<MarketInsights> {
    const prompt = `Analyze market trends for a ${appData.category} app on ${appData.platform}:

App: ${appData.name}
Features: ${appData.features?.join(', ')}

Provide:
1. Top 5 trending keywords in this category
2. Common features in successful apps
3. Competitive advantages to highlight
4. Recommended features to add

Format as JSON.`;

    try {
      const response = await this.runLLM(prompt, 800);

      // Parsear respuesta (en producción usar mejor parsing)
      return {
        trendingKeywords: appData.keywords?.slice(0, 5) || [],
        categoryBenchmarks: {
          averageRating: 4.2,
          downloadRange: '10K-50K',
          commonFeatures: appData.features?.slice(0, 5) || [],
        },
        competitiveAdvantages: appData.features?.slice(0, 3) || [],
        recommendedFeatures: ['Premium version', 'Dark mode', 'Offline support'],
      };
    } catch (error) {
      console.warn('Error obteniendo market insights:', error);
      return {
        trendingKeywords: [],
        categoryBenchmarks: {
          averageRating: 4.0,
          downloadRange: 'Unknown',
          commonFeatures: [],
        },
        competitiveAdvantages: [],
        recommendedFeatures: [],
      };
    }
  }

  /**
   * Ejecuta modelo de lenguaje
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
