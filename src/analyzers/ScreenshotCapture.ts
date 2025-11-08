import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

/**
 * Capturador de screenshots del simulador
 * Captura screenshots reales de simuladores iOS/Android
 */
export class ScreenshotCapture {
  private outputDir: string;

  constructor(outputDir: string) {
    this.outputDir = outputDir;
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  }

  /**
   * Detecta simuladores disponibles
   */
  async detectSimulators(): Promise<{
    ios: boolean;
    android: boolean;
    devices: string[];
  }> {
    const result = {
      ios: false,
      android: false,
      devices: [] as string[],
    };

    // Detectar simulador iOS
    try {
      const { stdout } = await execAsync('xcrun simctl list devices | grep Booted');
      if (stdout.trim()) {
        result.ios = true;
        result.devices.push('iOS Simulator (Running)');
      }
    } catch (error) {
      // No hay simulador iOS o no está en macOS
    }

    // Detectar emulador Android
    try {
      const { stdout } = await execAsync('adb devices');
      const lines = stdout.split('\n').filter(line => line.includes('device') && !line.includes('List'));
      if (lines.length > 0) {
        result.android = true;
        result.devices.push('Android Emulator (Running)');
      }
    } catch (error) {
      // No hay emulador Android
    }

    return result;
  }

  /**
   * Captura screenshot de simulador iOS
   */
  async captureIOSScreenshot(filename?: string): Promise<string | null> {
    try {
      const outputPath = path.join(
        this.outputDir,
        filename || `ios-screenshot-${Date.now()}.png`
      );

      // Usar xcrun simctl para capturar
      await execAsync(`xcrun simctl io booted screenshot "${outputPath}"`);

      if (fs.existsSync(outputPath)) {
        console.log(`  ✓ Screenshot iOS capturado: ${outputPath}`);
        return outputPath;
      }
    } catch (error) {
      console.warn('  ⚠️  No se pudo capturar screenshot de iOS:', error);
    }
    return null;
  }

  /**
   * Captura screenshot de emulador Android
   */
  async captureAndroidScreenshot(filename?: string): Promise<string | null> {
    try {
      const outputPath = path.join(
        this.outputDir,
        filename || `android-screenshot-${Date.now()}.png`
      );

      // Capturar con adb
      const tempPath = '/sdcard/screenshot.png';
      await execAsync(`adb shell screencap -p ${tempPath}`);
      await execAsync(`adb pull ${tempPath} "${outputPath}"`);
      await execAsync(`adb shell rm ${tempPath}`);

      if (fs.existsSync(outputPath)) {
        console.log(`  ✓ Screenshot Android capturado: ${outputPath}`);
        return outputPath;
      }
    } catch (error) {
      console.warn('  ⚠️  No se pudo capturar screenshot de Android:', error);
    }
    return null;
  }

  /**
   * Captura múltiples screenshots
   */
  async captureMultipleScreenshots(count: number = 5): Promise<string[]> {
    const screenshots: string[] = [];
    const simulators = await this.detectSimulators();

    if (!simulators.ios && !simulators.android) {
      console.log('\n⚠️  No se detectaron simuladores en ejecución.');
      console.log('💡 Abre un simulador iOS o emulador Android para capturar screenshots reales.');
      console.log('');
      return screenshots;
    }

    console.log('\n📱 Simuladores detectados:');
    simulators.devices.forEach(device => console.log(`   • ${device}`));
    console.log('');

    console.log(`📸 Capturando ${count} screenshots...`);
    console.log('💡 Navega por tu app en el simulador. Capturando cada 3 segundos...\n');

    for (let i = 0; i < count; i++) {
      console.log(`  Screenshot ${i + 1}/${count}...`);

      // Capturar de iOS si está disponible
      if (simulators.ios) {
        const screenshot = await this.captureIOSScreenshot(`screenshot-${i + 1}.png`);
        if (screenshot) {
          screenshots.push(screenshot);
        }
      }
      // Si no hay iOS, intentar Android
      else if (simulators.android) {
        const screenshot = await this.captureAndroidScreenshot(`screenshot-${i + 1}.png`);
        if (screenshot) {
          screenshots.push(screenshot);
        }
      }

      // Esperar 3 segundos antes del siguiente
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    console.log(`\n✅ ${screenshots.length} screenshots capturados\n`);

    return screenshots;
  }

  /**
   * Captura screenshots interactivo
   */
  async captureInteractive(): Promise<string[]> {
    const screenshots: string[] = [];
    const simulators = await this.detectSimulators();

    if (!simulators.ios && !simulators.android) {
      console.log('\n⚠️  No se detectaron simuladores en ejecución.');
      return screenshots;
    }

    console.log('\n📸 Modo Captura Interactiva');
    console.log('═══════════════════════════════════════');
    console.log('Navega a la pantalla que quieres capturar');
    console.log('Presiona ENTER para capturar (o "q" para terminar)');
    console.log('');

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise(resolve => {
      const capture = () => {
        rl.question('Presiona ENTER para capturar (q para salir): ', async (answer: string) => {
          if (answer.toLowerCase() === 'q') {
            rl.close();
            console.log(`\n✅ ${screenshots.length} screenshots capturados\n`);
            resolve(screenshots);
            return;
          }

          // Capturar
          if (simulators.ios) {
            const screenshot = await this.captureIOSScreenshot(
              `screenshot-${screenshots.length + 1}.png`
            );
            if (screenshot) {
              screenshots.push(screenshot);
            }
          } else if (simulators.android) {
            const screenshot = await this.captureAndroidScreenshot(
              `screenshot-${screenshots.length + 1}.png`
            );
            if (screenshot) {
              screenshots.push(screenshot);
            }
          }

          // Siguiente
          capture();
        });
      };

      capture();
    });
  }
}
