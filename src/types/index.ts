/**
 * Tipos principales del sistema de creación de assets
 */

export interface AppData {
  name: string;
  description?: string;
  version?: string;
  category?: string;
  keywords?: string[];
  features?: string[];
  targetAudience?: string;
  platform?: 'ios' | 'android' | 'web' | 'desktop' | 'multiplatform';
  packageJson?: any;
  readme?: string;
  sourceCode?: {
    files: string[];
    technologies: string[];
    frameworks: string[];
  };
  existingAssets?: {
    icons?: string[];
    screenshots?: string[];
    images?: string[];
  };
}

export interface GeneratedMetadata {
  title: string;
  shortDescription: string;
  fullDescription: string;
  keywords: string[];
  tags: string[];
  category: string;
  subtitle?: string;
  promotionalText?: string;
  whatsNew?: string;
  marketingUrl?: string;
}

export interface ASOOptimization {
  primaryKeywords: string[];
  secondaryKeywords: string[];
  competitorAnalysis?: {
    similarApps: string[];
    gapOpportunities: string[];
  };
  titleSuggestions: string[];
  descriptionVariants: string[];
  keywordDensity: Record<string, number>;
  readabilityScore: number;
  conversionOptimization: {
    hooks: string[];
    callsToAction: string[];
    trustSignals: string[];
  };
}

export interface ImageGenerationRequest {
  prompt: string;
  type: 'icon' | 'screenshot' | 'feature' | 'banner' | 'promotional';
  style?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  platform?: 'ios' | 'android' | 'web';
}

export interface GeneratedImage {
  url: string;
  localPath?: string;
  type: string;
  prompt: string;
  model: string;
  metadata: {
    width: number;
    height: number;
    format: string;
  };
}

export interface AssetBundle {
  metadata: GeneratedMetadata;
  aso: ASOOptimization;
  images: GeneratedImage[];
  texts: {
    appStoreDescription: string;
    playStoreDescription: string;
    websiteContent: string;
    socialMediaPosts: string[];
    pressRelease?: string;
  };
  marketingMaterials: {
    emailTemplates?: string[];
    adCopy?: string[];
    landingPageContent?: string;
  };
}

export interface GeneratorConfig {
  replicateApiKey: string;
  openaiApiKey?: string;
  outputDir: string;
  models: {
    llm: string;
    image: string;
    upscaler?: string;
  };
  preferences: {
    language: string;
    tone: 'professional' | 'casual' | 'technical' | 'friendly';
    targetMarket: string[];
    generateImages: boolean;
    imageCount: number;
  };
}

export interface MarketInsights {
  trendingKeywords: string[];
  categoryBenchmarks: {
    averageRating: number;
    downloadRange: string;
    commonFeatures: string[];
  };
  competitiveAdvantages: string[];
  recommendedFeatures: string[];
  pricingStrategy?: string;
}
