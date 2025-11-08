/**
 * Metadata Module
 * Generates app store descriptions, keywords, and promotional text using AI
 */

import OpenAI from 'openai';
import { MetadataInfo, GenerateTextOptions } from './types';
import { Logger } from './utils';
import { ConfigManager } from './config';

export class MetadataGenerator {
  private config = ConfigManager.getInstance().getConfig();
  private openai?: OpenAI;

  constructor() {
    if (this.config.openai_api_key) {
      this.openai = new OpenAI({
        apiKey: this.config.openai_api_key,
      });
    }
  }

  /**
   * Generate complete metadata for an app
   */
  async generateMetadata(options: GenerateTextOptions): Promise<MetadataInfo> {
    Logger.step('Generating app metadata...');

    if (!this.openai) {
      Logger.info('Using smart fallback metadata (OpenAI not configured)');
      return this.generateFallbackMetadata(options);
    }

    try {
      const prompt = this.createMetadataPrompt(options);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert App Store Optimization (ASO) specialist.
Generate compelling, SEO-optimized app store metadata that will help apps rank well and convert users.
Always respond in valid JSON format.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      const metadata = JSON.parse(content);

      Logger.success('Metadata generated with GPT-4');
      return this.normalizeMetadata(metadata);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Don't show scary error for auth issues - just use fallback
      if (errorMessage.includes('401') || errorMessage.includes('organization')) {
        Logger.info('OpenAI authentication issue - using smart fallback metadata');
      } else {
        Logger.warning(`OpenAI unavailable - using smart fallback metadata`);
      }

      return this.generateFallbackMetadata(options);
    }
  }

  /**
   * Create prompt for metadata generation
   */
  private createMetadataPrompt(options: GenerateTextOptions): string {
    const {
      appName = 'MyApp',
      appType = 'mobile application',
      features = [],
      targetAudience = 'general users',
      language = 'en',
    } = options;

    const featureList = features.length > 0 ? features.join(', ') : 'various features';

    return `Generate app store metadata for the following mobile application:

App Name: ${appName}
App Type: ${appType}
Key Features: ${featureList}
Target Audience: ${targetAudience}
Language: ${language}

Please generate:
1. An optimized app name (if the current one isn't great, suggest a better one, otherwise keep it)
2. A short description (80 characters max) - catchy tagline
3. A long description (4000 characters max) - detailed, compelling, SEO-optimized
4. Keywords array (at least 10 relevant keywords for app store search)
5. Category suggestion (Games, Productivity, Health & Fitness, etc.)
6. A promotional text (170 characters max) - highlight what's new or special

Return the response as a JSON object with these fields:
{
  "name": "App Name",
  "shortDescription": "Brief tagline",
  "longDescription": "Full description...",
  "keywords": ["keyword1", "keyword2", ...],
  "category": "Category Name",
  "tagline": "Memorable tagline",
  "promotionalText": "What makes this special"
}`;
  }

  /**
   * Generate fallback metadata when AI is not available
   */
  private generateFallbackMetadata(options: GenerateTextOptions): MetadataInfo {
    const { appName = 'MyApp', appType = 'application', features = [], targetAudience = 'users' } = options;

    // Create a more intelligent fallback using the provided context
    const featureList = features.length > 0
      ? features.slice(0, 5).join(', ')
      : 'various features';

    const longDescription = this.createSmartDescription(appName, appType, features, targetAudience);

    return {
      name: appName,
      shortDescription: `${appName} - ${this.createTagline(appType, features)}`,
      longDescription,
      keywords: this.generateSmartKeywords(appType, features, appName),
      category: this.suggestCategory(appType, features),
      tagline: this.createTagline(appType, features),
      promotionalText: `Experience ${appName} - ${featureList}. Download today!`,
    };
  }

  /**
   * Create a smart description based on context
   */
  private createSmartDescription(
    appName: string,
    appType: string,
    features: string[],
    targetAudience: string
  ): string {
    const featureDescriptions = features.slice(0, 5).map(f => `• ${this.capitalizeFirst(f)}`).join('\n');

    return `${appName} is a powerful ${appType} designed for ${targetAudience}.

${features.length > 0 ? `KEY FEATURES:\n${featureDescriptions}\n\n` : ''}Built with the latest technology to provide the best user experience. ${appName} offers a seamless interface, robust performance, and regular updates to keep you ahead.

Whether you're ${this.getAudienceAction(appType)}, ${appName} has everything you need. Join thousands of satisfied users and discover why ${appName} is the ${appType} of choice.

Download ${appName} today and transform the way you ${this.getAppPurpose(appType)}!`;
  }

  /**
   * Create a compelling tagline
   */
  private createTagline(appType: string, features: string[]): string {
    const taglines: Record<string, string> = {
      'productivity': 'Get More Done',
      'health': 'Your Wellness Companion',
      'finance': 'Smart Money Management',
      'social': 'Connect & Share',
      'education': 'Learn Better, Faster',
      'entertainment': 'Endless Entertainment',
      'shopping': 'Shop Smarter',
      'travel': 'Explore the World',
    };

    for (const [key, tagline] of Object.entries(taglines)) {
      if (appType.toLowerCase().includes(key) || features.some(f => f.includes(key))) {
        return tagline;
      }
    }

    return 'Your Mobile Companion';
  }

  /**
   * Generate smart keywords
   */
  private generateSmartKeywords(appType: string, features: string[], appName: string): string[] {
    const keywords = new Set<string>();

    // Base keywords
    keywords.add('mobile app');
    keywords.add('ios');
    keywords.add('android');

    // App type keywords
    appType.toLowerCase().split(' ').forEach(word => {
      if (word.length > 3) keywords.add(word);
    });

    // Feature keywords
    features.forEach(feature => {
      feature.toLowerCase().split(' ').forEach(word => {
        if (word.length > 3) keywords.add(word);
      });
    });

    // Category-specific keywords
    const categoryKeywords = this.getCategoryKeywords(appType, features);
    categoryKeywords.forEach(k => keywords.add(k));

    return Array.from(keywords).slice(0, 20);
  }

  /**
   * Get category-specific keywords
   */
  private getCategoryKeywords(appType: string, features: string[]): string[] {
    const combined = `${appType} ${features.join(' ')}`.toLowerCase();

    if (combined.includes('product') || combined.includes('task')) {
      return ['productivity', 'tasks', 'todo', 'planner', 'organizer', 'efficiency'];
    }
    if (combined.includes('health') || combined.includes('fitness')) {
      return ['health', 'fitness', 'wellness', 'workout', 'tracking'];
    }
    if (combined.includes('social') || combined.includes('chat')) {
      return ['social', 'network', 'connect', 'share', 'community'];
    }
    if (combined.includes('finance') || combined.includes('money')) {
      return ['finance', 'money', 'budget', 'expense', 'tracking'];
    }

    return ['app', 'mobile', 'utility'];
  }

  /**
   * Helper methods
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private getAudienceAction(appType: string): string {
    if (appType.includes('productivity')) return 'managing tasks or projects';
    if (appType.includes('health')) return 'tracking your health';
    if (appType.includes('social')) return 'connecting with others';
    if (appType.includes('finance')) return 'managing your finances';
    return 'using mobile apps';
  }

  private getAppPurpose(appType: string): string {
    if (appType.includes('productivity')) return 'work';
    if (appType.includes('health')) return 'stay healthy';
    if (appType.includes('social')) return 'connect';
    if (appType.includes('finance')) return 'manage money';
    return 'live';
  }

  /**
   * Suggest a category based on app type and features
   */
  private suggestCategory(appType: string, features: string[]): string {
    const categoryMap: Record<string, string> = {
      game: 'Games',
      health: 'Health & Fitness',
      fitness: 'Health & Fitness',
      finance: 'Finance',
      social: 'Social Networking',
      productivity: 'Productivity',
      education: 'Education',
      entertainment: 'Entertainment',
      photo: 'Photo & Video',
      music: 'Music',
      shopping: 'Shopping',
      travel: 'Travel',
      news: 'News',
      weather: 'Weather',
      business: 'Business',
    };

    const combined = `${appType} ${features.join(' ')}`.toLowerCase();

    for (const [key, category] of Object.entries(categoryMap)) {
      if (combined.includes(key)) {
        return category;
      }
    }

    return 'Lifestyle';
  }

  /**
   * Normalize metadata to ensure consistent structure
   */
  private normalizeMetadata(metadata: any): MetadataInfo {
    return {
      name: metadata.name || metadata.appName || 'MyApp',
      shortDescription: metadata.shortDescription || metadata.tagline || '',
      longDescription: metadata.longDescription || metadata.description || '',
      keywords: Array.isArray(metadata.keywords) ? metadata.keywords : [],
      category: metadata.category || 'Lifestyle',
      tagline: metadata.tagline || metadata.shortDescription || '',
      promotionalText: metadata.promotionalText || metadata.promotional || '',
    };
  }

  /**
   * Generate App Store specific description
   */
  async generateAppStoreDescription(metadata: MetadataInfo): Promise<string> {
    return `${metadata.shortDescription}

${metadata.longDescription}

KEYWORDS: ${metadata.keywords.join(', ')}`;
  }

  /**
   * Generate Play Store specific description
   */
  async generatePlayStoreDescription(metadata: MetadataInfo): Promise<string> {
    return `${metadata.shortDescription}

${metadata.longDescription}

Keywords: ${metadata.keywords.join(', ')}`;
  }

  /**
   * Optimize description for ASO
   */
  optimizeForASO(description: string, keywords: string[]): string {
    // Simple keyword integration
    let optimized = description;

    // Ensure top keywords appear in the first paragraph
    const firstParagraph = optimized.split('\n\n')[0];
    const missingKeywords = keywords
      .slice(0, 5)
      .filter((keyword) => !firstParagraph.toLowerCase().includes(keyword.toLowerCase()));

    if (missingKeywords.length > 0) {
      Logger.info(`ASO: Adding missing keywords: ${missingKeywords.join(', ')}`);
    }

    return optimized;
  }
}
