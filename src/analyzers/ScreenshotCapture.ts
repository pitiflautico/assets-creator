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

  /**
   * Captura screenshots con guía de navegación
   * Indica al usuario exactamente qué pantallas capturar
   */
  async captureWithGuidance(appType?: string): Promise<string[]> {
    const screenshots: string[] = [];
    const simulators = await this.detectSimulators();

    if (!simulators.ios && !simulators.android) {
      console.log('\n⚠️  No se detectaron simuladores en ejecución.');
      console.log('   Abre el simulador iOS o emulador Android primero.\n');
      return screenshots;
    }

    console.log('\n📸 Captura Guiada de Screenshots');
    console.log('═══════════════════════════════════════════════════════');
    console.log('Te guiaré para capturar las pantallas más importantes');
    console.log('');

    // Definir las pantallas clave según el tipo de app
    const screensToCapture = this.getKeyScreens(appType);

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    let currentScreenIndex = 0;

    return new Promise(resolve => {
      const captureNext = () => {
        if (currentScreenIndex >= screensToCapture.length) {
          rl.close();
          console.log('\n✅ ¡Captura completada!');
          console.log(`   ${screenshots.length} screenshots guardados\n`);
          resolve(screenshots);
          return;
        }

        const screen = screensToCapture[currentScreenIndex];

        console.log(`\n📱 Screenshot ${currentScreenIndex + 1}/${screensToCapture.length}: ${screen.name}`);
        console.log(`   ${screen.description}`);
        console.log('');

        rl.question('Presiona ENTER cuando estés listo para capturar (s para saltar, q para salir): ', async (answer: string) => {
          if (answer.toLowerCase() === 'q') {
            rl.close();
            console.log(`\n✅ ${screenshots.length} screenshots capturados\n`);
            resolve(screenshots);
            return;
          }

          if (answer.toLowerCase() === 's') {
            console.log('   ⏭️  Saltando...');
            currentScreenIndex++;
            captureNext();
            return;
          }

          // Capturar
          let screenshot: string | null = null;
          const filename = `${screen.filename || `screenshot-${currentScreenIndex + 1}`}.png`;

          if (simulators.ios) {
            screenshot = await this.captureIOSScreenshot(filename);
          } else if (simulators.android) {
            screenshot = await this.captureAndroidScreenshot(filename);
          }

          if (screenshot) {
            screenshots.push(screenshot);
            console.log(`   ✅ Capturado: ${filename}`);
          } else {
            console.log('   ❌ Error al capturar');
          }

          currentScreenIndex++;
          captureNext();
        });
      };

      captureNext();
    });
  }

  /**
   * Define las pantallas clave a capturar según el tipo de app
   */
  private getKeyScreens(appType?: string): Array<{
    name: string;
    description: string;
    filename?: string;
  }> {
    // Pantallas genéricas que aplican a todas las apps
    const genericScreens = [
      {
        name: 'Pantalla Principal / Home',
        description: 'La primera pantalla que ve el usuario al abrir la app',
        filename: '01-home',
      },
      {
        name: 'Menú Principal',
        description: 'Menú de navegación, sidebar, o tab bar con las opciones principales',
        filename: '02-menu',
      },
      {
        name: 'Funcionalidad Principal #1',
        description: 'La característica o función más importante de la app',
        filename: '03-main-feature',
      },
      {
        name: 'Funcionalidad Principal #2',
        description: 'Segunda característica más importante (si aplica)',
        filename: '04-secondary-feature',
      },
      {
        name: 'Configuraciones o Perfil',
        description: 'Pantalla de ajustes, perfil de usuario, o personalización',
        filename: '05-settings',
      },
    ];

    // Pantallas específicas según categoría
    const categoryScreens: Record<string, typeof genericScreens> = {
      'fitness': [
        { name: 'Inicio de Entrenamiento', description: 'Pantalla donde se inicia o selecciona el workout', filename: '01-workout-start' },
        { name: 'Entrenamiento en Progreso', description: 'Vista durante el ejercicio con timer/contador', filename: '02-workout-active' },
        { name: 'Estadísticas / Progreso', description: 'Gráficas, historial, o métricas de rendimiento', filename: '03-stats' },
        { name: 'Lista de Ejercicios', description: 'Catálogo de ejercicios disponibles', filename: '04-exercises' },
        { name: 'Perfil / Logros', description: 'Perfil del usuario con logros o objetivos', filename: '05-profile' },
      ],
      'music': [
        { name: 'Reproductor Principal', description: 'Player con controles de reproducción', filename: '01-player' },
        { name: 'Biblioteca / Lista', description: 'Lista de canciones, álbumes, o playlists', filename: '02-library' },
        { name: 'Búsqueda', description: 'Función de búsqueda de música', filename: '03-search' },
        { name: 'Playlist o Colección', description: 'Vista de una playlist o colección específica', filename: '04-playlist' },
        { name: 'Configuración de Audio', description: 'Ecualizador, efectos, o ajustes de sonido', filename: '05-audio-settings' },
      ],
      'productivity': [
        { name: 'Dashboard Principal', description: 'Vista general con resumen de tareas/proyectos', filename: '01-dashboard' },
        { name: 'Lista de Tareas', description: 'Lista principal de items/tareas', filename: '02-task-list' },
        { name: 'Detalle de Tarea', description: 'Vista detallada de un item individual', filename: '03-task-detail' },
        { name: 'Calendario o Timeline', description: 'Vista de calendario o línea de tiempo', filename: '04-calendar' },
        { name: 'Filtros o Categorías', description: 'Organización por categorías o proyectos', filename: '05-categories' },
      ],
    };

    // Detectar categoría del tipo de app
    if (appType) {
      const type = appType.toLowerCase();
      if (type.includes('fitness') || type.includes('workout') || type.includes('health')) {
        return categoryScreens['fitness'];
      }
      if (type.includes('music') || type.includes('audio') || type.includes('player')) {
        return categoryScreens['music'];
      }
      if (type.includes('productivity') || type.includes('task') || type.includes('todo')) {
        return categoryScreens['productivity'];
      }
    }

    return genericScreens;
  }
}
