/**
 * Auto Navigator
 * Automatically navigates through app and captures key screens
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs-extra';
import { ScreenshotInfo, ProjectContext } from './types';
import { Logger, ensureDir } from './utils';

const execAsync = promisify(exec);

export interface NavigationPlan {
  screens: string[];
  actions: NavigationAction[];
}

export interface NavigationAction {
  type: 'tap' | 'swipe' | 'wait' | 'scroll';
  description: string;
  coordinates?: { x: number; y: number };
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
}

export class AutoNavigator {
  private screenshotsDir: string;
  private platform: 'ios' | 'android';

  constructor(screenshotsDir: string, platform: 'ios' | 'android' = 'ios') {
    this.screenshotsDir = screenshotsDir;
    this.platform = platform;
  }

  /**
   * Navigate through app and capture screenshots
   */
  async navigateAndCapture(context: ProjectContext): Promise<ScreenshotInfo[]> {
    Logger.step('Auto-navigating through app...');

    await ensureDir(this.screenshotsDir);

    const screenshots: ScreenshotInfo[] = [];
    const plan = this.createNavigationPlan(context);

    Logger.info(`Navigation plan: ${plan.screens.length} screens to capture`);

    // Capture home screen
    Logger.info('Capturing home screen...');
    await this.wait(2000);
    const homeScreenshot = await this.captureScreen('home', 0);
    if (homeScreenshot) screenshots.push(homeScreenshot);

    // Execute navigation actions
    for (let i = 0; i < plan.actions.length && screenshots.length < 5; i++) {
      const action = plan.actions[i];

      try {
        Logger.info(`Action ${i + 1}: ${action.description}`);
        await this.executeAction(action);

        // Wait for animation
        await this.wait(1500);

        // Capture screenshot
        const screenshot = await this.captureScreen(action.description, i + 1);
        if (screenshot) {
          screenshots.push(screenshot);
        }
      } catch (error) {
        Logger.warning(`Action failed: ${error}`);
      }
    }

    Logger.success(`Captured ${screenshots.length} screenshots`);
    return screenshots;
  }

  /**
   * Create navigation plan based on context
   */
  private createNavigationPlan(context: ProjectContext): NavigationPlan {
    const screens: string[] = [];
    const actions: NavigationAction[] = [];

    // Based on app type, create relevant navigation flow
    const mainScreens = context.mainScreens || [];

    // Common patterns
    if (this.hasFeature(context, 'authentication')) {
      // Skip login for now (complex)
      Logger.info('Detected authentication - skipping login screens');
    }

    if (this.hasFeature(context, 'navigation')) {
      // Try to open menu/tabs
      actions.push({
        type: 'tap',
        description: 'Open navigation menu',
        coordinates: { x: 50, y: 100 }, // Top-left menu icon
      });

      // Tap through tabs
      for (let i = 0; i < Math.min(3, mainScreens.length); i++) {
        actions.push({
          type: 'tap',
          description: `Navigate to ${mainScreens[i] || `screen ${i + 1}`}`,
          coordinates: { x: 100 + i * 100, y: 800 }, // Bottom tabs
        });
      }
    }

    // Scroll to see more content
    actions.push({
      type: 'scroll',
      description: 'Scroll to view content',
      direction: 'down',
    });

    // Try a few exploratory taps
    actions.push({
      type: 'tap',
      description: 'Tap on main content',
      coordinates: { x: 200, y: 400 },
    });

    return { screens, actions };
  }

  /**
   * Execute a navigation action
   */
  private async executeAction(action: NavigationAction): Promise<void> {
    if (this.platform === 'ios') {
      await this.executeIOSAction(action);
    } else {
      await this.executeAndroidAction(action);
    }
  }

  /**
   * Execute action on iOS simulator
   */
  private async executeIOSAction(action: NavigationAction): Promise<void> {
    try {
      // Get booted device ID
      const { stdout } = await execAsync(
        "xcrun simctl list devices | grep Booted | grep -o -E '[A-F0-9-]{36}'"
      );
      const deviceId = stdout.trim().split('\n')[0];

      if (!deviceId) {
        throw new Error('No booted simulator found');
      }

      switch (action.type) {
        case 'tap':
          if (action.coordinates) {
            await execAsync(
              `xcrun simctl io ${deviceId} tap ${action.coordinates.x} ${action.coordinates.y}`
            );
          }
          break;

        case 'swipe':
          if (action.coordinates && action.direction) {
            const { x, y } = action.coordinates;
            let endX = x;
            let endY = y;

            switch (action.direction) {
              case 'up':
                endY -= 200;
                break;
              case 'down':
                endY += 200;
                break;
              case 'left':
                endX -= 200;
                break;
              case 'right':
                endX += 200;
                break;
            }

            await execAsync(`xcrun simctl io ${deviceId} swipe ${x} ${y} ${endX} ${endY}`);
          }
          break;

        case 'scroll':
          // Simulate scroll with swipe
          const scrollY = action.direction === 'down' ? 600 : 200;
          const scrollEndY = action.direction === 'down' ? 200 : 600;
          await execAsync(`xcrun simctl io ${deviceId} swipe 200 ${scrollY} 200 ${scrollEndY}`);
          break;

        case 'wait':
          await this.wait(action.duration || 1000);
          break;
      }
    } catch (error) {
      Logger.warning(`iOS action failed: ${error}`);
    }
  }

  /**
   * Execute action on Android emulator
   */
  private async executeAndroidAction(action: NavigationAction): Promise<void> {
    try {
      switch (action.type) {
        case 'tap':
          if (action.coordinates) {
            await execAsync(
              `adb shell input tap ${action.coordinates.x} ${action.coordinates.y}`
            );
          }
          break;

        case 'swipe':
          if (action.coordinates && action.direction) {
            const { x, y } = action.coordinates;
            let endX = x;
            let endY = y;

            switch (action.direction) {
              case 'up':
                endY -= 300;
                break;
              case 'down':
                endY += 300;
                break;
              case 'left':
                endX -= 300;
                break;
              case 'right':
                endX += 300;
                break;
            }

            await execAsync(`adb shell input swipe ${x} ${y} ${endX} ${endY} 300`);
          }
          break;

        case 'scroll':
          const scrollY = action.direction === 'down' ? 800 : 200;
          const scrollEndY = action.direction === 'down' ? 200 : 800;
          await execAsync(`adb shell input swipe 200 ${scrollY} 200 ${scrollEndY} 300`);
          break;

        case 'wait':
          await this.wait(action.duration || 1000);
          break;
      }
    } catch (error) {
      Logger.warning(`Android action failed: ${error}`);
    }
  }

  /**
   * Capture screen
   */
  private async captureScreen(
    description: string,
    index: number
  ): Promise<ScreenshotInfo | null> {
    try {
      const filename = `${this.platform}_${index}_${this.sanitizeFilename(description)}.png`;
      const filepath = path.join(this.screenshotsDir, filename);

      if (this.platform === 'ios') {
        await execAsync(`xcrun simctl io booted screenshot "${filepath}"`);
      } else {
        await execAsync(`adb exec-out screencap -p > "${filepath}"`);
      }

      const stats = await fs.stat(filepath);
      if (stats.size === 0) {
        return null;
      }

      Logger.success(`Captured: ${description}`);

      return {
        platform: this.platform,
        path: filepath,
        size: {
          width: this.platform === 'ios' ? 1179 : 1080,
          height: this.platform === 'ios' ? 2556 : 2340,
        },
      };
    } catch (error) {
      Logger.warning(`Failed to capture screen: ${error}`);
      return null;
    }
  }

  /**
   * Wait for a duration
   */
  private async wait(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if context has a feature
   */
  private hasFeature(context: ProjectContext, feature: string): boolean {
    return (
      context.detectedFeatures?.includes(feature) || context.keyFeatures?.includes(feature)
    );
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
   * Check if simulator is running
   */
  async isSimulatorRunning(): Promise<boolean> {
    try {
      if (this.platform === 'ios') {
        const { stdout } = await execAsync('xcrun simctl list devices | grep Booted');
        return stdout.trim().length > 0;
      } else {
        const { stdout } = await execAsync('adb devices');
        return stdout.includes('emulator');
      }
    } catch {
      return false;
    }
  }

  /**
   * Get smart navigation tips
   */
  getNavigationTips(context: ProjectContext): string {
    return `
🤖 Smart Navigation Tips:

Based on your app (${context.appType}), here's what will be captured:

1. Home/Welcome Screen
   - Initial app state

2. Main Features
   ${context.mainScreens.slice(0, 3).map((s, i) => `- ${s}`).join('\n   ')}

3. Content Views
   - Scrolled content
   - Detail screens

The system will automatically:
- Navigate through ${context.mainScreens.length} detected screens
- Capture key user flows
- Highlight main features

Ensure:
- ✓ App is fully loaded
- ✓ Simulator is in portrait mode
- ✓ No onboarding/login blockers
- ✓ Sample data is visible

The navigation will take approximately ${Math.ceil(context.mainScreens.length * 3)} seconds.
`;
  }
}
