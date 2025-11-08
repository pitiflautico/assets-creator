/**
 * Intelligent Project Analyzer
 * Analyzes code, README, and project structure to understand the app
 */

import path from 'path';
import fs from 'fs-extra';
import { Glob } from 'glob';
import OpenAI from 'openai';
import { ProjectInfo, ProjectContext } from './types';
import { Logger, fileExists, readJsonFile } from './utils';
import { ConfigManager } from './config';

export class IntelligentAnalyzer {
  private config = ConfigManager.getInstance().getConfig();
  private openai?: OpenAI;
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;

    if (this.config.openai_api_key) {
      this.openai = new OpenAI({
        apiKey: this.config.openai_api_key,
      });
    }
  }

  /**
   * Analyze project deeply to understand its purpose and features
   */
  async analyzeProject(projectInfo: ProjectInfo): Promise<ProjectContext> {
    Logger.step('Analyzing project context with AI...');

    // Gather information from multiple sources
    const readme = await this.readReadme();
    const codeSnippets = await this.extractCodeSnippets();
    const screens = await this.detectScreens();
    const features = await this.detectFeatures();

    // Use AI to understand the context
    const context = await this.generateContext(
      projectInfo,
      readme,
      codeSnippets,
      screens,
      features
    );

    Logger.success('Project context analyzed');
    return context;
  }

  /**
   * Read and parse README file
   */
  private async readReadme(): Promise<string> {
    const possibleReadmes = [
      'README.md',
      'readme.md',
      'Readme.md',
      'README.txt',
      'docs/README.md',
    ];

    for (const filename of possibleReadmes) {
      const filepath = path.join(this.projectPath, filename);
      if (await fileExists(filepath)) {
        const content = await fs.readFile(filepath, 'utf-8');
        Logger.info(`Found README: ${filename}`);
        return content;
      }
    }

    Logger.warning('No README found');
    return '';
  }

  /**
   * Extract relevant code snippets for context
   */
  private async extractCodeSnippets(): Promise<string[]> {
    const snippets: string[] = [];

    try {
      // Find main App file
      const glob = new Glob('**/App.{tsx,jsx,ts,js}', {
        cwd: this.projectPath,
        ignore: ['node_modules/**', '**/node_modules/**'],
      });

      const appFiles = Array.from(await glob);

      for (const file of appFiles.slice(0, 2)) {
        const filepath = path.join(this.projectPath, file);
        const content = await fs.readFile(filepath, 'utf-8');

        // Extract first 50 lines
        const lines = content.split('\n').slice(0, 50).join('\n');
        snippets.push(`// ${file}\n${lines}`);
      }

      Logger.info(`Analyzed ${appFiles.length} main files`);
    } catch (error) {
      Logger.warning(`Could not extract code snippets: ${error}`);
    }

    return snippets;
  }

  /**
   * Detect screens/routes in the app
   */
  private async detectScreens(): Promise<string[]> {
    const screens: string[] = [];

    try {
      // Look for screen files
      const glob = new Glob('**/{screens,views,pages}/**/*.{tsx,jsx}', {
        cwd: this.projectPath,
        ignore: ['node_modules/**', '**/node_modules/**'],
      });

      const screenFiles = Array.from(await glob);

      for (const file of screenFiles) {
        // Extract screen name from filename
        const screenName = path.basename(file, path.extname(file));
        screens.push(screenName);
      }

      Logger.info(`Found ${screens.length} screens`);
    } catch (error) {
      Logger.warning(`Could not detect screens: ${error}`);
    }

    return screens;
  }

  /**
   * Detect features from code
   */
  private async detectFeatures(): Promise<string[]> {
    const features: string[] = [];

    try {
      // Check for navigation
      const hasNavigation = await this.hasPattern(
        '@react-navigation|react-router|expo-router'
      );
      if (hasNavigation) features.push('navigation');

      // Check for authentication
      const hasAuth = await this.hasPattern('auth|login|signup|firebase.*auth');
      if (hasAuth) features.push('authentication');

      // Check for camera
      const hasCamera = await this.hasPattern('camera|expo-camera|react-native-camera');
      if (hasCamera) features.push('camera');

      // Check for maps
      const hasMaps = await this.hasPattern('maps|react-native-maps|mapbox');
      if (hasMaps) features.push('maps');

      // Check for notifications
      const hasNotifications = await this.hasPattern(
        'notification|push.*notification|expo-notifications'
      );
      if (hasNotifications) features.push('notifications');

      // Check for payments
      const hasPayments = await this.hasPattern('stripe|payment|purchase|iap');
      if (hasPayments) features.push('payments');

      // Check for social
      const hasSocial = await this.hasPattern('social|share|facebook|twitter');
      if (hasSocial) features.push('social');

      Logger.info(`Detected features: ${features.join(', ')}`);
    } catch (error) {
      Logger.warning(`Could not detect features: ${error}`);
    }

    return features;
  }

  /**
   * Check if project contains a pattern
   */
  private async hasPattern(pattern: string): Promise<boolean> {
    try {
      const glob = new Glob('**/*.{ts,tsx,js,jsx,json}', {
        cwd: this.projectPath,
        ignore: ['node_modules/**', '**/node_modules/**'],
      });

      const files = (Array.from(await glob)).slice(0, 50); // Limit for performance
      const regex = new RegExp(pattern, 'i');

      for (const file of files) {
        const filepath = path.join(this.projectPath, file);
        const content = await fs.readFile(filepath, 'utf-8');
        if (regex.test(content)) {
          return true;
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return false;
  }

  /**
   * Generate context using AI
   */
  private async generateContext(
    projectInfo: ProjectInfo,
    readme: string,
    codeSnippets: string[],
    screens: string[],
    features: string[]
  ): Promise<ProjectContext> {
    if (!this.openai) {
      Logger.warning('OpenAI not configured, using basic context');
      return this.generateBasicContext(projectInfo, screens, features);
    }

    try {
      const prompt = this.createAnalysisPrompt(
        projectInfo,
        readme,
        codeSnippets,
        screens,
        features
      );

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert mobile app analyst. Analyze the provided project information
and generate a comprehensive understanding of the app's purpose, target audience, and key features.
Always respond in valid JSON format.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      const aiContext = JSON.parse(content);
      return this.normalizeContext(aiContext, screens, features);
    } catch (error) {
      Logger.warning(`AI analysis failed: ${error}, using basic context`);
      return this.generateBasicContext(projectInfo, screens, features);
    }
  }

  /**
   * Create analysis prompt for AI
   */
  private createAnalysisPrompt(
    projectInfo: ProjectInfo,
    readme: string,
    codeSnippets: string[],
    screens: string[],
    features: string[]
  ): string {
    return `Analyze this mobile app project and provide insights:

PROJECT INFO:
- Name: ${projectInfo.name}
- Type: ${projectInfo.type}
- Version: ${projectInfo.version || 'N/A'}

README:
${readme.slice(0, 2000)}

CODE SNIPPETS:
${codeSnippets.join('\n\n').slice(0, 2000)}

DETECTED SCREENS:
${screens.slice(0, 20).join(', ')}

DETECTED FEATURES:
${features.join(', ')}

Please provide a JSON response with:
{
  "description": "Clear 2-3 sentence description of what the app does",
  "purpose": "Main purpose/goal of the app",
  "targetAudience": "Who is this app for?",
  "category": "App category (e.g., Health & Fitness, Productivity, Social)",
  "keyFeatures": ["feature1", "feature2", "feature3"],
  "appType": "Type of app (e.g., social networking app, productivity tool)",
  "valueProposition": "What makes this app unique/valuable",
  "mainScreens": ["screen1", "screen2", "screen3"],
  "userFlow": "Brief description of typical user journey"
}`;
  }

  /**
   * Generate basic context without AI
   */
  private generateBasicContext(
    projectInfo: ProjectInfo,
    screens: string[],
    features: string[]
  ): ProjectContext {
    return {
      description: `${projectInfo.name} is a mobile application`,
      purpose: 'Mobile application',
      targetAudience: 'mobile users',
      category: this.guessCategory(features),
      keyFeatures: features,
      appType: 'mobile application',
      valueProposition: `Experience ${projectInfo.name}`,
      mainScreens: screens.slice(0, 5),
      userFlow: 'Users navigate through various screens',
      detectedScreens: screens,
      detectedFeatures: features,
    };
  }

  /**
   * Normalize AI context
   */
  private normalizeContext(aiContext: any, screens: string[], features: string[]): ProjectContext {
    return {
      description: aiContext.description || '',
      purpose: aiContext.purpose || 'Mobile application',
      targetAudience: aiContext.targetAudience || 'mobile users',
      category: aiContext.category || 'Lifestyle',
      keyFeatures: Array.isArray(aiContext.keyFeatures)
        ? aiContext.keyFeatures
        : features,
      appType: aiContext.appType || 'mobile application',
      valueProposition: aiContext.valueProposition || '',
      mainScreens: Array.isArray(aiContext.mainScreens)
        ? aiContext.mainScreens
        : screens.slice(0, 5),
      userFlow: aiContext.userFlow || '',
      detectedScreens: screens,
      detectedFeatures: features,
    };
  }

  /**
   * Guess category from features
   */
  private guessCategory(features: string[]): string {
    const categoryMap: Record<string, string> = {
      health: 'Health & Fitness',
      fitness: 'Health & Fitness',
      social: 'Social Networking',
      maps: 'Travel',
      camera: 'Photo & Video',
      payments: 'Finance',
      authentication: 'Productivity',
    };

    for (const feature of features) {
      if (categoryMap[feature]) {
        return categoryMap[feature];
      }
    }

    return 'Lifestyle';
  }
}
