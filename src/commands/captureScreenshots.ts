import chalk from 'chalk';
import ora from 'ora';
import * as path from 'path';
import { ScreenshotCapture } from '../analyzers/ScreenshotCapture';

/**
 * Comando para capturar screenshots del simulador
 */
export async function captureScreenshotsCommand(options: {
  output?: string;
  count?: string;
  interactive?: boolean;
}) {
  const outputDir = options.output || path.join(process.cwd(), 'screenshots');
  const count = parseInt(options.count || '5');

  console.log(chalk.blue.bold('\n📸 Capturador de Screenshots\n'));

  const captureSystem = new ScreenshotCapture(outputDir);

  // Detectar simuladores
  const spinner = ora('Buscando simuladores...').start();
  const simulators = await captureSystem.detectSimulators();
  spinner.stop();

  if (!simulators.ios && !simulators.android) {
    console.log(chalk.yellow('\n⚠️  No se detectaron simuladores en ejecución\n'));
    console.log('Para capturar screenshots:');
    console.log('  • iOS: Abre un simulador con Xcode');
    console.log('  • Android: Inicia un emulador con Android Studio o "emulator -avd <name>"\n');
    process.exit(1);
  }

  console.log(chalk.green('✓ Simuladores detectados:\n'));
  simulators.devices.forEach(device => {
    console.log(chalk.cyan(`  • ${device}`));
  });
  console.log('');

  let screenshots: string[];

  if (options.interactive) {
    console.log(chalk.yellow('Modo Interactivo:'));
    console.log('  Navega a cada pantalla y presiona ENTER para capturar');
    console.log('  Presiona "q" cuando termines\n');

    screenshots = await captureSystem.captureInteractive();
  } else {
    console.log(chalk.yellow(`Capturando ${count} screenshots automáticamente...`));
    console.log(chalk.gray('  (Navega por tu app, se capturará cada 3 segundos)\n'));

    screenshots = await captureSystem.captureMultipleScreenshots(count);
  }

  if (screenshots.length > 0) {
    console.log(chalk.green.bold(`\n✅ ${screenshots.length} screenshots capturados\n`));
    console.log(chalk.white('Screenshots guardados en:'));
    console.log(chalk.cyan(`  ${outputDir}\n`));

    console.log(chalk.white('Archivos:'));
    screenshots.forEach((screenshot, i) => {
      console.log(chalk.gray(`  ${i + 1}.`), chalk.cyan(path.basename(screenshot)));
    });
    console.log('');
  } else {
    console.log(chalk.yellow('\n⚠️  No se capturaron screenshots\n'));
  }
}
