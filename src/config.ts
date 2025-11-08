/**
 * Configuration Management
 * Handles loading and saving configuration
 */

import path from 'path';
import fs from 'fs-extra';
import dotenv from 'dotenv';
import { Config } from './types';
import { Logger, fileExists, readJsonFile, writeJsonFile } from './utils';

dotenv.config();

export class ConfigManager {
  private static instance: ConfigManager;
  private config: Config;
  private configPath: string;

  private constructor() {
    this.configPath = path.join(process.cwd(), 'config.json');
    this.config = this.getDefaultConfig();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): Config {
    return {
      replicate_api_key: process.env.REPLICATE_API_TOKEN || '',
      openai_api_key: process.env.OPENAI_API_KEY || '',
      output_dir: process.env.OUTPUT_DIR || 'export',
      default_language: process.env.DEFAULT_LANGUAGE || 'en',
      image_size: parseInt(process.env.IMAGE_SIZE || '1024', 10),
      auto_launch_simulator: process.env.AUTO_LAUNCH_SIMULATOR === 'true',
      ios_device: process.env.IOS_DEVICE || 'iPhone 15 Pro',
      android_device: process.env.ANDROID_DEVICE || 'Pixel_7_Pro',
    };
  }

  /**
   * Load configuration from file or environment
   */
  async load(): Promise<Config> {
    try {
      // Try to load from config.json
      if (await fileExists(this.configPath)) {
        const fileConfig = await readJsonFile(this.configPath);
        this.config = { ...this.config, ...fileConfig };
        Logger.info('Configuration loaded from config.json');
      } else {
        Logger.info('Using default configuration');
      }

      // Validate required fields
      this.validate();

      return this.config;
    } catch (error) {
      Logger.warning(`Failed to load config: ${error}`);
      return this.config;
    }
  }

  /**
   * Save configuration to file
   */
  async save(config?: Partial<Config>): Promise<void> {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    await writeJsonFile(this.configPath, this.config);
    Logger.success('Configuration saved to config.json');
  }

  /**
   * Get current configuration
   */
  getConfig(): Config {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<Config>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Validate configuration
   */
  private validate(): void {
    if (!this.config.openai_api_key && !this.config.replicate_api_key) {
      Logger.warning('No API keys configured. AI features will not work.');
      Logger.warning('Please set OPENAI_API_KEY or REPLICATE_API_TOKEN in .env file');
    }
  }

  /**
   * Check if OpenAI is configured
   */
  hasOpenAI(): boolean {
    return !!this.config.openai_api_key;
  }

  /**
   * Check if Replicate is configured
   */
  hasReplicate(): boolean {
    return !!this.config.replicate_api_key;
  }
}
