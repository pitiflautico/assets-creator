/**
 * Simulator Module
 * Launches apps in iOS/Android simulators and captures screenshots
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { ScreenshotInfo, ProjectInfo } from './types';
import { Logger, ensureDir } from './utils';
import { ConfigManager } from './config';

const execAsync = promisify(exec);

export class SimulatorManager {
  private config = ConfigManager.getInstance().getConfig();
  private projectInfo: ProjectInfo;
  private screenshotsDir: string;

  constructor(projectInfo: ProjectInfo, screenshotsDir: string) {
    this.projectInfo = projectInfo;
    this.screenshotsDir = screenshotsDir;
  }

  /**
   * Capture screenshots from both iOS and Android simulators
   */
  async captureScreenshots(): Promise<ScreenshotInfo[]> {
    Logger.step('Capturing screenshots...');
    await ensureDir(this.screenshotsDir);

    const screenshots: ScreenshotInfo[] = [];

    try {
      // iOS screenshots
      if (await this.isIOSAvailable()) {
        Logger.info('Capturing iOS screenshots...');
        const iosScreenshots = await this.captureIOSScreenshots();
        screenshots.push(...iosScreenshots);
      } else {
        Logger.warning('iOS simulator not available, skipping iOS screenshots');
      }
    } catch (error) {
      Logger.error(`Failed to capture iOS screenshots: ${error}`);
    }

    try {
      // Android screenshots
      if (await this.isAndroidAvailable()) {
        Logger.info('Capturing Android screenshots...');
        const androidScreenshots = await this.captureAndroidScreenshots();
        screenshots.push(...androidScreenshots);
      } else {
        Logger.warning('Android emulator not available, skipping Android screenshots');
      }
    } catch (error) {
      Logger.error(`Failed to capture Android screenshots: ${error}`);
    }

    if (screenshots.length === 0) {
      Logger.warning('No screenshots captured. Simulators may not be available.');
      Logger.info('Creating placeholder screenshots...');
      screenshots.push(...(await this.createPlaceholderScreenshots()));
    }

    Logger.success(`${screenshots.length} screenshots captured`);
    return screenshots;
  }

  /**
   * Check if iOS simulator is available
   */
  private async isIOSAvailable(): Promise<boolean> {
    try {
      await execAsync('xcrun simctl list devices available');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if Android emulator is available
   */
  private async isAndroidAvailable(): Promise<boolean> {
    try {
      await execAsync('adb devices');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Capture iOS screenshots
   */
  private async captureIOSScreenshots(): Promise<ScreenshotInfo[]> {
    const screenshots: ScreenshotInfo[] = [];
    const device = this.config.ios_device || 'iPhone 15 Pro';

    try {
      // Get booted simulator
      const { stdout } = await execAsync('xcrun simctl list devices | grep Booted');

      if (!stdout) {
        Logger.warning('No iOS simulator currently running');
        Logger.info('You can manually launch the app and take screenshots');
        return screenshots;
      }

      // Take screenshot
      const screenshotPath = path.join(this.screenshotsDir, 'ios_1.png');
      await execAsync(`xcrun simctl io booted screenshot "${screenshotPath}"`);

      const stats = await fs.stat(screenshotPath);

      screenshots.push({
        platform: 'ios',
        path: screenshotPath,
        size: {
          width: 1179, // iPhone 15 Pro default
          height: 2556,
        },
      });

      Logger.success(`iOS screenshot saved: ${screenshotPath}`);
    } catch (error) {
      Logger.error(`iOS screenshot failed: ${error}`);
    }

    return screenshots;
  }

  /**
   * Capture Android screenshots
   */
  private async captureAndroidScreenshots(): Promise<ScreenshotInfo[]> {
    const screenshots: ScreenshotInfo[] = [];

    try {
      // Check for running emulator
      const { stdout } = await execAsync('adb devices');

      if (!stdout.includes('emulator')) {
        Logger.warning('No Android emulator currently running');
        return screenshots;
      }

      // Take screenshot
      const screenshotPath = path.join(this.screenshotsDir, 'android_1.png');
      await execAsync(`adb exec-out screencap -p > "${screenshotPath}"`);

      screenshots.push({
        platform: 'android',
        path: screenshotPath,
        size: {
          width: 1080,
          height: 2340,
        },
      });

      Logger.success(`Android screenshot saved: ${screenshotPath}`);
    } catch (error) {
      Logger.error(`Android screenshot failed: ${error}`);
    }

    return screenshots;
  }

  /**
   * Launch app in iOS simulator
   */
  async launchIOS(): Promise<void> {
    Logger.step('Launching app in iOS simulator...');

    try {
      if (this.projectInfo.type === 'expo') {
        Logger.info('Starting Expo on iOS...');
        Logger.info('Run: npx expo start --ios');
        Logger.warning('Please run the above command in your project directory');
      } else {
        Logger.info('Starting React Native on iOS...');
        Logger.info('Run: npx react-native run-ios');
        Logger.warning('Please run the above command in your project directory');
      }
    } catch (error) {
      Logger.error(`Failed to launch iOS: ${error}`);
    }
  }

  /**
   * Launch app in Android emulator
   */
  async launchAndroid(): Promise<void> {
    Logger.step('Launching app in Android emulator...');

    try {
      if (this.projectInfo.type === 'expo') {
        Logger.info('Starting Expo on Android...');
        Logger.info('Run: npx expo start --android');
        Logger.warning('Please run the above command in your project directory');
      } else {
        Logger.info('Starting React Native on Android...');
        Logger.info('Run: npx react-native run-android');
        Logger.warning('Please run the above command in your project directory');
      }
    } catch (error) {
      Logger.error(`Failed to launch Android: ${error}`);
    }
  }

  /**
   * Create placeholder screenshots when simulators are not available
   */
  private async createPlaceholderScreenshots(): Promise<ScreenshotInfo[]> {
    const screenshots: ScreenshotInfo[] = [];

    // iOS placeholder
    const iosPath = path.join(this.screenshotsDir, 'ios_placeholder.png');
    await fs.writeFile(iosPath, '');
    screenshots.push({
      platform: 'ios',
      path: iosPath,
      size: { width: 1179, height: 2556 },
    });

    // Android placeholder
    const androidPath = path.join(this.screenshotsDir, 'android_placeholder.png');
    await fs.writeFile(androidPath, '');
    screenshots.push({
      platform: 'android',
      path: androidPath,
      size: { width: 1080, height: 2340 },
    });

    Logger.info('Placeholder screenshots created');
    return screenshots;
  }

  /**
   * Wait for user to navigate app for screenshots
   */
  async waitForUserNavigation(seconds: number = 5): Promise<void> {
    Logger.info(`Waiting ${seconds} seconds for app navigation...`);
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  /**
   * Guided screenshot capture - user navigates, system captures
   */
  async guidedScreenshotCapture(
    platform: 'ios' | 'android' = 'ios',
    screenCount: number = 5
  ): Promise<ScreenshotInfo[]> {
    const screenshots: ScreenshotInfo[] = [];

    Logger.step(`📸 Starting guided screenshot capture for ${platform.toUpperCase()}`);

    // Check if simulator/emulator is running
    const isRunning = platform === 'ios'
      ? await this.isIOSAvailable()
      : await this.isAndroidAvailable();

    if (!isRunning) {
      Logger.error(`${platform === 'ios' ? 'iOS Simulator' : 'Android Emulator'} is not running`);
      return screenshots;
    }

    const screenDescriptions = [
      'Pantalla Principal / Home',
      'Funcionalidad Principal',
      'Segunda Funcionalidad',
      'Pantalla de Configuración/Perfil',
      'Pantalla Extra/Característica Especial',
    ];

    for (let i = 0; i < screenCount; i++) {
      const screenNum = i + 1;
      const description = screenDescriptions[i] || `Pantalla ${screenNum}`;

      console.log(chalk.cyan(`\n${'═'.repeat(70)}`));
      console.log(chalk.cyan.bold(`📱 Screenshot ${screenNum}/${screenCount}: ${description}`));
      console.log(chalk.gray(`   La primera pantalla que ve el usuario al abrir la app`));
      console.log(chalk.cyan(`${'═'.repeat(70)}\n`));

      // Wait for user to navigate
      const inquirer = require('inquirer');
      const { ready } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'ready',
          message: `Navega a "${description}" y presiona Enter cuando estés listo para capturar`,
          default: true,
        },
      ]);

      if (!ready) {
        Logger.warning(`Screenshot ${screenNum} omitido`);
        continue;
      }

      // Capture screenshot
      const spinner = require('ora')(`Capturando screenshot ${screenNum}...`).start();

      try {
        const filename = `${platform}_${screenNum}_${this.sanitizeFilename(description)}.png`;
        const filepath = path.join(this.screenshotsDir, filename);

        if (platform === 'ios') {
          await execAsync(`xcrun simctl io booted screenshot "${filepath}"`);
        } else {
          await execAsync(`adb exec-out screencap -p > "${filepath}"`);
        }

        const stats = await fs.stat(filepath);
        if (stats.size > 0) {
          screenshots.push({
            platform,
            path: filepath,
            size: {
              width: platform === 'ios' ? 1179 : 1080,
              height: platform === 'ios' ? 2556 : 2340,
            },
          });
          spinner.succeed(chalk.green(`✓ Screenshot ${screenNum} capturado: ${filename}`));
        } else {
          spinner.fail('Screenshot vacío');
        }
      } catch (error) {
        spinner.fail(`Error capturando screenshot ${screenNum}: ${error}`);
      }
    }

    Logger.success(`\n✨ Captura completada: ${screenshots.length}/${screenCount} screenshots`);
    return screenshots;
  }

  /**
   * Sanitize filename
   */
  private sanitizeFilename(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 30);
  }

  /**
   * Get instructions for manual screenshot capture
   */
  getManualInstructions(): string {
    return `
Manual Screenshot Instructions:
================================

iOS (Simulator):
1. Open your app in the iOS Simulator
2. Navigate to the screens you want to capture
3. Press Cmd+S or File > Save Screen to save screenshots
4. Save screenshots to: ${this.screenshotsDir}

Android (Emulator):
1. Open your app in the Android Emulator
2. Navigate to the screens you want to capture
3. Click the camera icon in the emulator toolbar
4. Save screenshots to: ${this.screenshotsDir}

Recommended screenshots:
- Home/Welcome screen
- Main features (2-3 screens)
- Settings or profile screen
- Any unique selling points

File naming: ios_1.png, ios_2.png, android_1.png, android_2.png, etc.
`;
  }
}
