#!/usr/bin/env node

/**
 * AI App Publisher System
 * Main CLI interface
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import { Scanner } from './scanner';
import { BrandingGenerator } from './branding';
import { MetadataGenerator } from './metadata';
import { SimulatorManager } from './simulator';
import { ImageOptimizer } from './optimizer';
import { Exporter } from './exporter';
import { ConfigManager } from './config';
import { Logger } from './utils';
import { ProjectInfo, BrandingAssets, MetadataInfo, ScreenshotInfo } from './types';

class AIPublisher {
  private config = ConfigManager.getInstance();
  private projectInfo?: ProjectInfo;
  private brandingAssets?: BrandingAssets;
  private metadata?: MetadataInfo;
  private screenshots: ScreenshotInfo[] = [];

  async run(): Promise<void> {
    this.printBanner();

    // Load configuration
    await this.config.load();

    // Main workflow
    await this.selectProject();
    await this.analyzeBranding();
    await this.generateMetadata();
    await this.handleScreenshots();
    await this.optimizeAssets();
    await this.exportAll();

    this.printSuccess();
  }

  private printBanner(): void {
    console.log(chalk.cyan.bold('\n╔═══════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan.bold('║                                                       ║'));
    console.log(chalk.cyan.bold('║        📱  AI App Publisher System  📱                ║'));
    console.log(chalk.cyan.bold('║                                                       ║'));
    console.log(chalk.cyan.bold('║     Automated app publishing with AI                  ║'));
    console.log(chalk.cyan.bold('║                                                       ║'));
    console.log(chalk.cyan.bold('╚═══════════════════════════════════════════════════════╝\n'));
  }

  private async selectProject(): Promise<void> {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectPath',
        message: 'Enter the path to your React Native/Expo project:',
        default: process.cwd(),
        validate: (input) => {
          if (!input) return 'Project path is required';
          return true;
        },
      },
    ]);

    const spinner = ora('Scanning project...').start();

    try {
      const scanner = new Scanner(answers.projectPath);
      this.projectInfo = await scanner.scan();

      spinner.succeed('Project scanned successfully');

      console.log(chalk.gray('\nProject Information:'));
      console.log(chalk.gray(`  Type: ${this.projectInfo.type}`));
      console.log(chalk.gray(`  Name: ${this.projectInfo.name}`));
      console.log(chalk.gray(`  Version: ${this.projectInfo.version || 'N/A'}`));

      const features = await Scanner.getProjectFeatures(this.projectInfo.packageJson);
      if (features.length > 0) {
        console.log(chalk.gray(`  Features: ${features.join(', ')}\n`));
      }
    } catch (error) {
      spinner.fail('Failed to scan project');
      Logger.error(`${error}`);
      process.exit(1);
    }
  }

  private async analyzeBranding(): Promise<void> {
    if (!this.projectInfo) return;

    const hasExistingAssets = this.projectInfo.assets.icon && this.projectInfo.assets.splash;

    const { brandingChoice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'brandingChoice',
        message: 'What would you like to do with the branding?',
        choices: [
          {
            name: hasExistingAssets
              ? 'Use existing branding assets'
              : 'Generate new branding with AI',
            value: hasExistingAssets ? 'existing' : 'generate',
          },
          { name: 'Generate new branding with AI', value: 'generate' },
          { name: 'Skip branding for now', value: 'skip' },
        ],
      },
    ]);

    if (brandingChoice === 'generate') {
      await this.generateBranding();
    } else if (brandingChoice === 'existing' && hasExistingAssets) {
      this.brandingAssets = {
        icon: path.join(this.projectInfo.path, this.projectInfo.assets.icon!),
        splash: path.join(this.projectInfo.path, this.projectInfo.assets.splash!),
        palette: ['#3A6EA5', '#E9E7E3', '#0A1D37'],
        icons: {},
      };
      Logger.success('Using existing branding assets');
    } else {
      Logger.warning('Branding skipped');
    }
  }

  private async generateBranding(): Promise<void> {
    if (!this.projectInfo) return;

    const spinner = ora('Generating branding assets with AI...').start();

    try {
      const outputDir = path.join(process.cwd(), 'temp_assets', this.projectInfo.name);

      const generator = new BrandingGenerator(outputDir);

      const features = await Scanner.getProjectFeatures(this.projectInfo.packageJson);
      const appType = this.guessAppType(features);

      this.brandingAssets = await generator.generateBranding(
        this.projectInfo.name,
        appType,
        features
      );

      spinner.succeed('Branding assets generated');
    } catch (error) {
      spinner.fail('Failed to generate branding');
      Logger.error(`${error}`);

      const { continueWithout } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueWithout',
          message: 'Continue without branding assets?',
          default: true,
        },
      ]);

      if (!continueWithout) {
        process.exit(1);
      }
    }
  }

  private async generateMetadata(): Promise<void> {
    if (!this.projectInfo) return;

    const { generateMeta } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'generateMeta',
        message: 'Generate app store metadata with AI?',
        default: true,
      },
    ]);

    if (!generateMeta) {
      Logger.warning('Metadata generation skipped');
      return;
    }

    const spinner = ora('Generating metadata with AI...').start();

    try {
      const generator = new MetadataGenerator();
      const features = await Scanner.getProjectFeatures(this.projectInfo.packageJson);

      this.metadata = await generator.generateMetadata({
        appName: this.projectInfo.name,
        appType: this.guessAppType(features),
        features,
        targetAudience: 'mobile users',
        language: this.config.getConfig().default_language,
      });

      spinner.succeed('Metadata generated');

      console.log(chalk.gray('\nGenerated Metadata:'));
      console.log(chalk.gray(`  Name: ${this.metadata.name}`));
      console.log(chalk.gray(`  Tagline: ${this.metadata.shortDescription}`));
      console.log(chalk.gray(`  Category: ${this.metadata.category}`));
      console.log(chalk.gray(`  Keywords: ${this.metadata.keywords.slice(0, 5).join(', ')}...\n`));

      const { editMetadata } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'editMetadata',
          message: 'Would you like to edit the metadata?',
          default: false,
        },
      ]);

      if (editMetadata) {
        await this.editMetadata();
      }
    } catch (error) {
      spinner.fail('Failed to generate metadata');
      Logger.error(`${error}`);
    }
  }

  private async editMetadata(): Promise<void> {
    if (!this.metadata) return;

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'App name:',
        default: this.metadata.name,
      },
      {
        type: 'input',
        name: 'shortDescription',
        message: 'Tagline (short description):',
        default: this.metadata.shortDescription,
      },
      {
        type: 'editor',
        name: 'longDescription',
        message: 'Full description:',
        default: this.metadata.longDescription,
      },
    ]);

    this.metadata = { ...this.metadata, ...answers };
    Logger.success('Metadata updated');
  }

  private async handleScreenshots(): Promise<void> {
    const { screenshotChoice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'screenshotChoice',
        message: 'How would you like to handle screenshots?',
        choices: [
          { name: 'Capture from running simulator', value: 'capture' },
          { name: 'Use existing screenshots', value: 'existing' },
          { name: 'Skip screenshots for now', value: 'skip' },
        ],
      },
    ]);

    if (screenshotChoice === 'capture') {
      await this.captureScreenshots();
    } else if (screenshotChoice === 'skip') {
      Logger.warning('Screenshots skipped');
    }
  }

  private async captureScreenshots(): Promise<void> {
    if (!this.projectInfo) return;

    const screenshotsDir = path.join(process.cwd(), 'temp_assets', 'screenshots');
    const manager = new SimulatorManager(this.projectInfo, screenshotsDir);

    console.log(chalk.yellow('\nScreenshot Capture Instructions:'));
    console.log(manager.getManualInstructions());

    const { ready } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'ready',
        message: 'Is your app running in a simulator and ready for screenshots?',
        default: false,
      },
    ]);

    if (!ready) {
      Logger.info('You can manually add screenshots later to the export directory');
      return;
    }

    const spinner = ora('Capturing screenshots...').start();

    try {
      this.screenshots = await manager.captureScreenshots();
      spinner.succeed(`Captured ${this.screenshots.length} screenshots`);
    } catch (error) {
      spinner.fail('Failed to capture screenshots');
      Logger.error(`${error}`);
    }
  }

  private async optimizeAssets(): Promise<void> {
    if (!this.brandingAssets) {
      Logger.warning('No branding assets to optimize');
      return;
    }

    const spinner = ora('Optimizing images...').start();

    try {
      const outputDir = path.join(process.cwd(), 'temp_assets', 'optimized');
      const optimizer = new ImageOptimizer(outputDir);

      // Generate icon sizes
      if (this.brandingAssets.icon) {
        const icons = await optimizer.generateIconSizes(this.brandingAssets.icon);
        this.brandingAssets.icons = icons;
      }

      // Optimize screenshots
      if (this.screenshots.length > 0) {
        const iosScreenshots = this.screenshots
          .filter((s) => s.platform === 'ios')
          .map((s) => s.path);
        const androidScreenshots = this.screenshots
          .filter((s) => s.platform === 'android')
          .map((s) => s.path);

        if (iosScreenshots.length > 0) {
          await optimizer.optimizeScreenshots(iosScreenshots, 'ios');
        }
        if (androidScreenshots.length > 0) {
          await optimizer.optimizeScreenshots(androidScreenshots, 'android');
        }
      }

      spinner.succeed('Images optimized');
    } catch (error) {
      spinner.fail('Failed to optimize images');
      Logger.error(`${error}`);
    }
  }

  private async exportAll(): Promise<void> {
    if (!this.projectInfo || !this.metadata || !this.brandingAssets) {
      Logger.error('Missing required data for export');
      return;
    }

    const spinner = ora('Exporting all assets...').start();

    try {
      const outputDir = this.config.getConfig().output_dir;
      const exporter = new Exporter(outputDir);

      const exportStructure = await exporter.export(
        this.projectInfo.name,
        this.metadata,
        this.brandingAssets,
        this.screenshots
      );

      spinner.succeed('Export complete');

      console.log(exporter.generateSummary(exportStructure));
    } catch (error) {
      spinner.fail('Export failed');
      Logger.error(`${error}`);
    }
  }

  private printSuccess(): void {
    console.log(chalk.green.bold('\n✨ All done! Your app assets are ready for publishing.\n'));
  }

  private guessAppType(features: string[]): string {
    if (features.some((f) => f.includes('game'))) return 'gaming application';
    if (features.some((f) => f.includes('health') || f.includes('fitness')))
      return 'health & fitness application';
    if (features.some((f) => f.includes('social'))) return 'social networking application';
    if (features.some((f) => f.includes('finance'))) return 'finance application';
    if (features.some((f) => f.includes('productivity'))) return 'productivity application';

    return 'mobile application';
  }
}

// Main execution
async function main() {
  try {
    const publisher = new AIPublisher();
    await publisher.run();
  } catch (error) {
    Logger.error(`Fatal error: ${error}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { AIPublisher };
