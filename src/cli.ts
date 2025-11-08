#!/usr/bin/env node

import { Command } from 'commander';
import * as inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import * as path from 'path';
import { AssetsCreator } from './index';
import { AVAILABLE_MODELS } from './config/config';

const program = new Command();

program
  .name('assets-creator')
  .description('Sistema inteligente de creación de assets para apps con Replicate AI')
  .version('1.0.0');

/**
 * Comando: generate
 * Genera todos los assets
 */
program
  .command('generate')
  .description('Genera todos los assets (textos, imágenes, metadatos)')
  .option('-p, --project <path>', 'Ruta al proyecto', process.cwd())
  .option('-o, --output <path>', 'Directorio de salida')
  .option('--no-images', 'No generar imágenes')
  .option('--image-count <number>', 'Número de imágenes a generar', '5')
  .action(async (options) => {
    try {
      const spinner = ora('Inicializando Assets Creator...').start();

      const creator = new AssetsCreator({
        outputDir: options.output || path.join(process.cwd(), 'generated_assets'),
        preferences: {
          language: 'es',
          tone: 'professional',
          targetMarket: ['global'],
          generateImages: options.images,
          imageCount: parseInt(options.imageCount),
        },
      });

      spinner.stop();

      console.log(chalk.blue.bold('\n🚀 Assets Creator\n'));

      await creator.generateAll(options.project);

      console.log(chalk.green.bold('\n✅ ¡Generación completada exitosamente!\n'));
    } catch (error: any) {
      console.error(chalk.red.bold('\n❌ Error:'), error.message);
      process.exit(1);
    }
  });

/**
 * Comando: analyze
 * Solo analiza la app sin generar assets
 */
program
  .command('analyze')
  .description('Analiza una app sin generar assets')
  .option('-p, --project <path>', 'Ruta al proyecto', process.cwd())
  .action(async (options) => {
    try {
      const spinner = ora('Analizando aplicación...').start();

      const creator = new AssetsCreator();
      const appData = await creator.analyzeOnly(options.project);

      spinner.stop();

      console.log(chalk.blue.bold('\n📊 Análisis de la Aplicación\n'));
      console.log(chalk.white('Nombre:'), chalk.cyan(appData.name));
      console.log(chalk.white('Versión:'), chalk.cyan(appData.version || 'N/A'));
      console.log(chalk.white('Categoría:'), chalk.cyan(appData.category || 'N/A'));
      console.log(chalk.white('Plataforma:'), chalk.cyan(appData.platform));

      if (appData.sourceCode?.technologies?.length) {
        console.log(
          chalk.white('\nTecnologías:'),
          chalk.cyan(appData.sourceCode.technologies.join(', '))
        );
      }

      if (appData.features?.length) {
        console.log(chalk.white('\nFeatures encontrados:'));
        appData.features.forEach((f: string, i: number) => {
          console.log(chalk.gray(`  ${i + 1}.`), chalk.cyan(f));
        });
      }

      console.log('');
    } catch (error: any) {
      console.error(chalk.red.bold('\n❌ Error:'), error.message);
      process.exit(1);
    }
  });

/**
 * Comando: text-only
 * Genera solo textos y metadatos
 */
program
  .command('text-only')
  .description('Genera solo textos y metadatos (sin imágenes)')
  .option('-p, --project <path>', 'Ruta al proyecto', process.cwd())
  .option('-o, --output <path>', 'Directorio de salida')
  .action(async (options) => {
    try {
      console.log(chalk.blue.bold('\n📝 Generando textos y metadatos...\n'));

      const creator = new AssetsCreator({
        outputDir: options.output || path.join(process.cwd(), 'generated_assets'),
        preferences: {
          language: 'es',
          tone: 'professional',
          targetMarket: ['global'],
          generateImages: false,
          imageCount: 0,
        },
      });

      await creator.generateTextOnly(options.project);

      console.log(chalk.green.bold('\n✅ ¡Textos generados exitosamente!\n'));
    } catch (error: any) {
      console.error(chalk.red.bold('\n❌ Error:'), error.message);
      process.exit(1);
    }
  });

/**
 * Comando: images-only
 * Genera solo imágenes
 */
program
  .command('images-only')
  .description('Genera solo imágenes')
  .option('-p, --project <path>', 'Ruta al proyecto', process.cwd())
  .option('-o, --output <path>', 'Directorio de salida')
  .option('--count <number>', 'Número de imágenes', '5')
  .action(async (options) => {
    try {
      console.log(chalk.blue.bold('\n🎨 Generando imágenes...\n'));

      const creator = new AssetsCreator({
        outputDir: options.output || path.join(process.cwd(), 'generated_assets'),
        preferences: {
          language: 'es',
          tone: 'professional',
          targetMarket: ['global'],
          generateImages: true,
          imageCount: parseInt(options.count),
        },
      });

      const images = await creator.generateImagesOnly(options.project);

      console.log(chalk.green.bold(`\n✅ ${images.length} imágenes generadas!\n`));
    } catch (error: any) {
      console.error(chalk.red.bold('\n❌ Error:'), error.message);
      process.exit(1);
    }
  });

/**
 * Comando: interactive
 * Modo interactivo con preguntas
 */
program
  .command('interactive')
  .alias('i')
  .description('Modo interactivo con preguntas')
  .action(async () => {
    try {
      console.log(chalk.blue.bold('\n🚀 Assets Creator - Modo Interactivo\n'));

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'project',
          message: 'Ruta al proyecto:',
          default: process.cwd(),
        },
        {
          type: 'confirm',
          name: 'generateImages',
          message: '¿Generar imágenes?',
          default: true,
        },
        {
          type: 'number',
          name: 'imageCount',
          message: '¿Cuántas imágenes generar?',
          default: 5,
          when: (answers: any) => answers.generateImages,
        },
        {
          type: 'list',
          name: 'tone',
          message: 'Tono de los textos:',
          choices: ['professional', 'casual', 'technical', 'friendly'],
          default: 'professional',
        },
        {
          type: 'input',
          name: 'output',
          message: 'Directorio de salida:',
          default: './generated_assets',
        },
      ]);

      const spinner = ora('Generando assets...').start();

      const creator = new AssetsCreator({
        outputDir: answers.output,
        preferences: {
          language: 'es',
          tone: answers.tone,
          targetMarket: ['global'],
          generateImages: answers.generateImages,
          imageCount: answers.imageCount || 5,
        },
      });

      spinner.stop();

      await creator.generateAll(answers.project);

      console.log(chalk.green.bold('\n✅ ¡Generación completada!\n'));
    } catch (error: any) {
      if (error.isTtyError) {
        console.error(chalk.red('Modo interactivo no disponible en este terminal'));
      } else {
        console.error(chalk.red.bold('\n❌ Error:'), error.message);
      }
      process.exit(1);
    }
  });

/**
 * Comando: models
 * Lista modelos disponibles
 */
program
  .command('models')
  .description('Lista modelos disponibles en Replicate')
  .action(() => {
    console.log(chalk.blue.bold('\n🤖 Modelos Disponibles\n'));

    console.log(chalk.yellow.bold('Modelos de Lenguaje (LLM):'));
    Object.entries(AVAILABLE_MODELS.llm).forEach(([name, model]) => {
      console.log(chalk.gray('  •'), chalk.cyan(name));
      console.log(chalk.gray('   '), chalk.dim(model));
    });

    console.log(chalk.yellow.bold('\nModelos de Imagen:'));
    Object.entries(AVAILABLE_MODELS.image).forEach(([name, model]) => {
      console.log(chalk.gray('  •'), chalk.cyan(name));
      console.log(chalk.gray('   '), chalk.dim(model));
    });

    console.log('');
  });

/**
 * Comando: config
 * Muestra configuración
 */
program
  .command('config')
  .description('Muestra la configuración actual')
  .action(() => {
    console.log(chalk.blue.bold('\n⚙️  Configuración\n'));

    const hasReplicateKey = !!process.env.REPLICATE_API_TOKEN;
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

    console.log(
      chalk.white('REPLICATE_API_TOKEN:'),
      hasReplicateKey ? chalk.green('✓ Configurado') : chalk.red('✗ No configurado')
    );
    console.log(
      chalk.white('OPENAI_API_KEY:'),
      hasOpenAIKey ? chalk.green('✓ Configurado') : chalk.gray('○ Opcional')
    );

    if (!hasReplicateKey) {
      console.log(
        chalk.yellow(
          '\n⚠️  Necesitas configurar REPLICATE_API_TOKEN en archivo .env'
        )
      );
      console.log(
        chalk.gray('   Obtén tu clave en: https://replicate.com/account/api-tokens')
      );
    }

    console.log('');
  });

/**
 * Comando por defecto (ayuda)
 */
program.addHelpText(
  'after',
  `

${chalk.blue.bold('Ejemplos:')}
  ${chalk.gray('# Generar todos los assets')}
  $ assets-creator generate

  ${chalk.gray('# Generar solo textos')}
  $ assets-creator text-only

  ${chalk.gray('# Modo interactivo')}
  $ assets-creator interactive

  ${chalk.gray('# Analizar una app')}
  $ assets-creator analyze -p /path/to/project

${chalk.blue.bold('Configuración:')}
  ${chalk.gray('Crea un archivo .env con:')}
  REPLICATE_API_TOKEN=tu_clave_aqui

${chalk.blue.bold('Más información:')}
  ${chalk.cyan('https://replicate.com/docs')}
`
);

// Parsear argumentos
program.parse(process.argv);

// Si no hay comandos, mostrar ayuda
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
