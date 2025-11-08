import * as fs from 'fs';
import * as path from 'path';
import { AppData } from '../types';
import { glob } from 'glob';

/**
 * Analizador inteligente de aplicaciones
 * Lee y extrae información relevante de proyectos
 */
export class AppAnalyzer {
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  /**
   * Analiza el proyecto completo y extrae toda la información relevante
   */
  async analyze(): Promise<AppData> {
    const appData: AppData = {
      name: '',
      platform: 'multiplatform',
    };

    // Analizar package.json si existe
    const packageData = await this.analyzePackageJson();
    if (packageData) {
      appData.name = packageData.name || '';
      appData.description = packageData.description;
      appData.version = packageData.version;
      appData.keywords = packageData.keywords;
      appData.packageJson = packageData;
    }

    // Analizar README
    const readme = await this.analyzeReadme();
    if (readme) {
      appData.readme = readme;
      if (!appData.description) {
        appData.description = this.extractDescriptionFromReadme(readme);
      }
    }

    // Analizar código fuente
    const sourceCode = await this.analyzeSourceCode();
    appData.sourceCode = sourceCode;

    // Detectar plataforma
    appData.platform = this.detectPlatform(packageData, sourceCode);

    // Detectar features
    appData.features = this.extractFeatures(packageData, readme, sourceCode);

    // Detectar categoría
    appData.category = this.detectCategory(appData);

    // Analizar assets existentes
    appData.existingAssets = await this.analyzeExistingAssets();

    return appData;
  }

  /**
   * Analiza package.json
   */
  private async analyzePackageJson(): Promise<any | null> {
    const packagePath = path.join(this.projectPath, 'package.json');
    try {
      if (fs.existsSync(packagePath)) {
        const content = fs.readFileSync(packagePath, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn('No se pudo leer package.json:', error);
    }
    return null;
  }

  /**
   * Analiza README.md
   */
  private async analyzeReadme(): Promise<string | null> {
    const readmePaths = ['README.md', 'README.MD', 'readme.md', 'Readme.md'];

    for (const readmePath of readmePaths) {
      const fullPath = path.join(this.projectPath, readmePath);
      try {
        if (fs.existsSync(fullPath)) {
          return fs.readFileSync(fullPath, 'utf-8');
        }
      } catch (error) {
        // Continuar con el siguiente
      }
    }
    return null;
  }

  /**
   * Analiza el código fuente
   */
  private async analyzeSourceCode(): Promise<AppData['sourceCode']> {
    const sourceCode: AppData['sourceCode'] = {
      files: [],
      technologies: [],
      frameworks: [],
    };

    try {
      // Buscar archivos de código
      const patterns = [
        '**/*.ts',
        '**/*.tsx',
        '**/*.js',
        '**/*.jsx',
        '**/*.py',
        '**/*.java',
        '**/*.swift',
        '**/*.kt',
      ];

      for (const pattern of patterns) {
        const files = await glob(pattern, {
          cwd: this.projectPath,
          ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**'],
          nodir: true,
        });
        sourceCode.files.push(...files);
      }

      // Detectar tecnologías y frameworks
      sourceCode.technologies = this.detectTechnologies(sourceCode.files);
      sourceCode.frameworks = this.detectFrameworks(sourceCode.files);
    } catch (error) {
      console.warn('Error analizando código fuente:', error);
    }

    return sourceCode;
  }

  /**
   * Detecta tecnologías usadas
   */
  private detectTechnologies(files: string[]): string[] {
    const technologies = new Set<string>();

    if (files.some(f => f.endsWith('.ts') || f.endsWith('.tsx'))) {
      technologies.add('TypeScript');
    }
    if (files.some(f => f.endsWith('.js') || f.endsWith('.jsx'))) {
      technologies.add('JavaScript');
    }
    if (files.some(f => f.endsWith('.py'))) {
      technologies.add('Python');
    }
    if (files.some(f => f.endsWith('.java'))) {
      technologies.add('Java');
    }
    if (files.some(f => f.endsWith('.swift'))) {
      technologies.add('Swift');
    }
    if (files.some(f => f.endsWith('.kt'))) {
      technologies.add('Kotlin');
    }

    return Array.from(technologies);
  }

  /**
   * Detecta frameworks usados
   */
  private detectFrameworks(files: string[]): string[] {
    const frameworks = new Set<string>();

    if (files.some(f => f.includes('react') || f.endsWith('.jsx') || f.endsWith('.tsx'))) {
      frameworks.add('React');
    }
    if (files.some(f => f.includes('vue'))) {
      frameworks.add('Vue');
    }
    if (files.some(f => f.includes('angular'))) {
      frameworks.add('Angular');
    }
    if (files.some(f => f.includes('next'))) {
      frameworks.add('Next.js');
    }
    if (files.some(f => f.includes('express'))) {
      frameworks.add('Express');
    }
    if (files.some(f => f.includes('nest'))) {
      frameworks.add('NestJS');
    }
    if (files.some(f => f.includes('django'))) {
      frameworks.add('Django');
    }
    if (files.some(f => f.includes('flask'))) {
      frameworks.add('Flask');
    }

    return Array.from(frameworks);
  }

  /**
   * Detecta la plataforma objetivo
   */
  private detectPlatform(packageData: any, sourceCode: any): AppData['platform'] {
    if (packageData?.dependencies || packageData?.devDependencies) {
      const deps = {
        ...packageData.dependencies,
        ...packageData.devDependencies,
      };

      if (deps['react-native']) return 'multiplatform';
      if (deps['@ionic/angular'] || deps['@ionic/react']) return 'multiplatform';
      if (deps['electron']) return 'desktop';
      if (deps['react'] || deps['vue'] || deps['angular']) return 'web';
    }

    if (sourceCode?.technologies?.includes('Swift')) return 'ios';
    if (sourceCode?.technologies?.includes('Kotlin') || sourceCode?.technologies?.includes('Java')) {
      return 'android';
    }

    return 'multiplatform';
  }

  /**
   * Extrae características de la app
   */
  private extractFeatures(packageData: any, readme: string | null, sourceCode: any): string[] {
    const features = new Set<string>();

    // Features desde package.json scripts
    if (packageData?.scripts) {
      if (packageData.scripts.test) features.add('Testing automatizado');
      if (packageData.scripts.build) features.add('Build optimizado');
      if (packageData.scripts.lint) features.add('Code quality');
    }

    // Features desde dependencias
    if (packageData?.dependencies) {
      const deps = packageData.dependencies;
      if (deps.axios || deps['node-fetch']) features.add('API integration');
      if (deps['socket.io'] || deps.ws) features.add('Real-time communication');
      if (deps.redux || deps.zustand || deps.mobx) features.add('State management');
      if (deps.express || deps.fastify || deps.koa) features.add('Web server');
      if (deps.mongoose || deps.sequelize || deps.prisma) features.add('Database integration');
      if (deps.passport || deps['next-auth']) features.add('Authentication');
      if (deps.stripe || deps['paypal-rest-sdk']) features.add('Payment processing');
    }

    // Features desde README
    if (readme) {
      const lowerReadme = readme.toLowerCase();
      if (lowerReadme.includes('api')) features.add('API');
      if (lowerReadme.includes('authentication') || lowerReadme.includes('auth')) {
        features.add('User authentication');
      }
      if (lowerReadme.includes('database') || lowerReadme.includes('db')) {
        features.add('Database');
      }
      if (lowerReadme.includes('real-time') || lowerReadme.includes('realtime')) {
        features.add('Real-time features');
      }
      if (lowerReadme.includes('responsive')) features.add('Responsive design');
      if (lowerReadme.includes('mobile')) features.add('Mobile support');
    }

    return Array.from(features);
  }

  /**
   * Extrae descripción del README
   */
  private extractDescriptionFromReadme(readme: string): string {
    // Buscar la primera línea significativa después del título
    const lines = readme.split('\n').filter(line => line.trim());

    for (const line of lines) {
      // Saltar títulos markdown
      if (line.startsWith('#')) continue;
      // Saltar badges
      if (line.includes('![') || line.includes('](')) continue;

      const trimmed = line.trim();
      if (trimmed.length > 20) {
        return trimmed;
      }
    }

    return '';
  }

  /**
   * Detecta la categoría de la app
   */
  private detectCategory(appData: AppData): string {
    const keywords = [
      ...(appData.keywords || []),
      ...(appData.features || []),
      appData.description || '',
      appData.name || '',
    ].join(' ').toLowerCase();

    const categories: Record<string, string[]> = {
      'Productivity': ['productivity', 'task', 'todo', 'note', 'calendar', 'organizer'],
      'Social': ['social', 'chat', 'messaging', 'community', 'network'],
      'Entertainment': ['game', 'entertainment', 'media', 'video', 'music'],
      'Business': ['business', 'enterprise', 'crm', 'erp', 'commerce'],
      'Education': ['education', 'learning', 'course', 'training', 'tutorial'],
      'Developer Tools': ['developer', 'development', 'coding', 'api', 'sdk'],
      'Utilities': ['utility', 'tool', 'helper', 'converter', 'calculator'],
      'Health & Fitness': ['health', 'fitness', 'medical', 'wellness'],
      'Finance': ['finance', 'banking', 'payment', 'crypto', 'invoice'],
    };

    for (const [category, categoryKeywords] of Object.entries(categories)) {
      if (categoryKeywords.some(kw => keywords.includes(kw))) {
        return category;
      }
    }

    return 'Utilities';
  }

  /**
   * Analiza assets existentes
   */
  private async analyzeExistingAssets(): Promise<AppData['existingAssets']> {
    const assets: AppData['existingAssets'] = {
      icons: [],
      screenshots: [],
      images: [],
    };

    try {
      // Buscar iconos
      const iconPatterns = ['**/icon*.png', '**/logo*.png', '**/app-icon*.png'];
      for (const pattern of iconPatterns) {
        const files = await glob(pattern, {
          cwd: this.projectPath,
          ignore: ['node_modules/**'],
          nodir: true,
        });
        assets.icons?.push(...files);
      }

      // Buscar screenshots
      const screenshotPatterns = ['**/screenshot*.png', '**/screen*.png'];
      for (const pattern of screenshotPatterns) {
        const files = await glob(pattern, {
          cwd: this.projectPath,
          ignore: ['node_modules/**'],
          nodir: true,
        });
        assets.screenshots?.push(...files);
      }

      // Buscar otras imágenes
      const imagePatterns = ['**/*.png', '**/*.jpg', '**/*.jpeg'];
      for (const pattern of imagePatterns) {
        const files = await glob(pattern, {
          cwd: this.projectPath,
          ignore: ['node_modules/**', 'dist/**', 'build/**'],
          nodir: true,
        });
        assets.images?.push(...files);
      }
    } catch (error) {
      console.warn('Error analizando assets existentes:', error);
    }

    return assets;
  }
}
