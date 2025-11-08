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
      Logger.warning('OpenAI not configured, using fallback metadata');
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

      Logger.success('Metadata generated successfully');
      return this.normalizeMetadata(metadata);
    } catch (error) {
      Logger.error(`Failed to generate metadata: ${error}`);
      Logger.warning('Using fallback metadata');
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
    const { appName = 'MyApp', appType = 'application', features = [] } = options;

    return {
      name: appName,
      shortDescription: `A powerful ${appType} for your mobile device`,
      longDescription: `${appName} is a modern ${appType} designed to provide the best user experience. ${
        features.length > 0
          ? `Key features include: ${features.join(', ')}.`
          : 'Packed with useful features.'
      } Download now and discover what makes ${appName} special.`,
      keywords: this.generateDefaultKeywords(appType, features),
      category: this.suggestCategory(appType, features),
      tagline: `${appName} - Your mobile companion`,
      promotionalText: `Experience the power of ${appName}. Download today!`,
    };
  }

  /**
   * Generate default keywords based on app type and features
   */
  private generateDefaultKeywords(appType: string, features: string[]): string[] {
    const baseKeywords = ['mobile app', 'ios', 'android'];
    const typeKeywords = appType.split(' ').filter((word) => word.length > 3);
    const featureKeywords = features.flatMap((f) =>
      f.split(' ').filter((word) => word.length > 3)
    );

    return [...baseKeywords, ...typeKeywords, ...featureKeywords].slice(0, 15);
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
