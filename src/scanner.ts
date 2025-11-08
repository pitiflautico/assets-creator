/**
 * Scanner Module
 * Detects and analyzes React Native and Expo projects
 */

import path from 'path';
import fs from 'fs-extra';
import { ProjectInfo } from './types';
import { Logger, fileExists, readJsonFile } from './utils';

export class Scanner {
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  /**
   * Scan the project and extract all relevant information
   */
  async scan(): Promise<ProjectInfo> {
    Logger.step('Scanning project...');

    // Check if path exists
    if (!(await fileExists(this.projectPath))) {
      throw new Error(`Project path does not exist: ${this.projectPath}`);
    }

    // Read package.json
    const packageJsonPath = path.join(this.projectPath, 'package.json');
    if (!(await fileExists(packageJsonPath))) {
      throw new Error('package.json not found. This does not appear to be a valid project.');
    }

    const packageJson = await readJsonFile(packageJsonPath);

    // Determine project type
    const projectType = this.detectProjectType(packageJson);
    Logger.info(`Project type detected: ${projectType}`);

    // Read app.json or app.config.js
    const appConfig = await this.readAppConfig();

    // Extract assets information
    const assets = await this.extractAssets(projectType, appConfig);

    const projectInfo: ProjectInfo = {
      type: projectType,
      name: packageJson.name || path.basename(this.projectPath),
      path: this.projectPath,
      version: packageJson.version,
      assets,
      appJson: appConfig,
      packageJson,
    };

    Logger.success('Project scan completed');
    return projectInfo;
  }

  /**
   * Detect if project is Expo or pure React Native
   */
  private detectProjectType(packageJson: any): 'expo' | 'react-native' {
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    if (dependencies.expo || dependencies['expo-cli']) {
      return 'expo';
    }

    if (dependencies['react-native']) {
      return 'react-native';
    }

    throw new Error('Could not detect project type. No expo or react-native dependency found.');
  }

  /**
   * Read app configuration (app.json or app.config.js)
   */
  private async readAppConfig(): Promise<any> {
    // Try app.json first
    const appJsonPath = path.join(this.projectPath, 'app.json');
    if (await fileExists(appJsonPath)) {
      return await readJsonFile(appJsonPath);
    }

    // Try app.config.js (not fully supported, just return empty)
    const appConfigPath = path.join(this.projectPath, 'app.config.js');
    if (await fileExists(appConfigPath)) {
      Logger.warning('app.config.js detected but dynamic config parsing not fully supported');
      return {};
    }

    return {};
  }

  /**
   * Extract asset information from the project
   */
  private async extractAssets(
    projectType: 'expo' | 'react-native',
    appConfig: any
  ): Promise<ProjectInfo['assets']> {
    const assets: ProjectInfo['assets'] = {};

    if (projectType === 'expo' && appConfig.expo) {
      const expo = appConfig.expo;

      // Icon
      if (expo.icon) {
        const iconPath = path.join(this.projectPath, expo.icon);
        if (await fileExists(iconPath)) {
          assets.icon = expo.icon;
        }
      }

      // Splash screen
      if (expo.splash?.image) {
        const splashPath = path.join(this.projectPath, expo.splash.image);
        if (await fileExists(splashPath)) {
          assets.splash = expo.splash.image;
        }
      }

      // Adaptive icon (Android)
      if (expo.android?.adaptiveIcon) {
        assets.adaptiveIcon = {
          foreground: expo.android.adaptiveIcon.foregroundImage,
          background: expo.android.adaptiveIcon.backgroundImage,
        };
      }
    } else {
      // For React Native, check common asset locations
      const commonIconPaths = [
        'assets/icon.png',
        'src/assets/icon.png',
        'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png',
      ];

      for (const iconPath of commonIconPaths) {
        const fullPath = path.join(this.projectPath, iconPath);
        if (await fileExists(fullPath)) {
          assets.icon = iconPath;
          break;
        }
      }

      const commonSplashPaths = [
        'assets/splash.png',
        'src/assets/splash.png',
      ];

      for (const splashPath of commonSplashPaths) {
        const fullPath = path.join(this.projectPath, splashPath);
        if (await fileExists(fullPath)) {
          assets.splash = splashPath;
          break;
        }
      }
    }

    return assets;
  }

  /**
   * Get project features by analyzing dependencies
   */
  static async getProjectFeatures(packageJson: any): Promise<string[]> {
    const features: string[] = [];
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    const featureMap: Record<string, string> = {
      '@react-navigation/native': 'navigation',
      'react-native-maps': 'maps',
      'react-native-camera': 'camera',
      'expo-camera': 'camera',
      '@react-native-firebase/app': 'firebase',
      'react-native-push-notification': 'push notifications',
      'expo-notifications': 'notifications',
      'react-native-video': 'video',
      'expo-av': 'audio/video',
      'react-native-gesture-handler': 'gestures',
      'react-native-reanimated': 'animations',
      'redux': 'state management',
      '@reduxjs/toolkit': 'state management',
      'axios': 'API integration',
      'react-native-async-storage': 'local storage',
      '@react-native-async-storage/async-storage': 'local storage',
    };

    for (const [dep, feature] of Object.entries(featureMap)) {
      if (dependencies[dep]) {
        features.push(feature);
      }
    }

    return [...new Set(features)]; // Remove duplicates
  }
}
