#!/usr/bin/env node

/**
 * Screenshot Capture Tool - SOLO CAPTURAS
 * Herramienta simple para capturar screenshots sin análisis completo
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import { SimulatorManager } from './simulator';
import { Logger } from './utils';

async function main() {
  console.log(chalk.cyan.bold('\n╔═══════════════════════════════════════════════════════╗'));
  console.log(chalk.cyan.bold('║                                                       ║'));
  console.log(chalk.cyan.bold('║        📸  Screenshot Capture Tool  📸                ║'));
  console.log(chalk.cyan.bold('║                                                       ║'));
  console.log(chalk.cyan.bold('║     Captura guiada de screenshots                     ║'));
  console.log(chalk.cyan.bold('║                                                       ║'));
  console.log(chalk.cyan.bold('╚═══════════════════════════════════════════════════════╝\n'));

  console.log(chalk.yellow('⚠️  IMPORTANTE:'));
  console.log(chalk.gray('  1. Asegúrate de que tu app esté corriendo en el simulador'));
  console.log(chalk.gray('  2. Navega manualmente a cada pantalla cuando se te pida'));
  console.log(chalk.gray('  3. El sistema capturará automáticamente al presionar Enter\n'));

  const { platform, screenCount } = await inquirer.prompt([
    {
      type: 'list',
      name: 'platform',
      message: '¿Qué plataforma está corriendo?',
      choices: [
        { name: '📱 iOS Simulator', value: 'ios' },
        { name: '🤖 Android Emulator', value: 'android' },
      ],
      default: 'ios',
    },
    {
      type: 'number',
      name: 'screenCount',
      message: '¿Cuántas pantallas quieres capturar?',
      default: 5,
      validate: (input) => {
        if (input < 1 || input > 10) return 'Ingresa un número entre 1 y 10';
        return true;
      },
    },
  ]);

  const screenshotsDir = path.join(process.cwd(), 'screenshots');

  // Create minimal project info
  const projectInfo = {
    path: process.cwd(),
    type: 'expo' as const,
    name: 'App',
    version: '1.0.0',
    packageJson: {},
    assets: {},
  };

  const manager = new SimulatorManager(projectInfo, screenshotsDir);

  try {
    const screenshots = await manager.guidedScreenshotCapture(platform, screenCount);

    if (screenshots.length > 0) {
      console.log(chalk.green.bold('\n✨ ¡Capturas completadas exitosamente!\n'));
      console.log(chalk.cyan('📁 Screenshots guardados en:'));
      console.log(chalk.gray(`   ${screenshotsDir}\n`));

      console.log(chalk.cyan('📸 Archivos capturados:'));
      screenshots.forEach((s, i) => {
        console.log(chalk.gray(`   ${i + 1}. ${path.basename(s.path)}`));
      });
      console.log('');
    } else {
      console.log(chalk.yellow('\n⚠️  No se capturaron screenshots\n'));
    }
  } catch (error) {
    Logger.error(`Error: ${error}`);
    process.exit(1);
  }
}

main();
