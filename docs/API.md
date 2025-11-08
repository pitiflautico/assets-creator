# API Documentation

## Module Reference

### Scanner

Detects and analyzes React Native and Expo projects.

```typescript
import { Scanner } from './scanner';

const scanner = new Scanner('/path/to/project');
const projectInfo = await scanner.scan();

// projectInfo contains:
// - type: 'expo' | 'react-native'
// - name: string
// - path: string
// - version: string
// - assets: { icon, splash, adaptiveIcon }
// - appJson: object
// - packageJson: object
```

#### Methods

**`scan(): Promise<ProjectInfo>`**

Scans the project and returns comprehensive information.

**`static getProjectFeatures(packageJson: any): Promise<string[]>`**

Analyzes dependencies to extract app features.

---

### BrandingGenerator

Generates visual assets using AI.

```typescript
import { BrandingGenerator } from './branding';

const generator = new BrandingGenerator('/output/dir');
const branding = await generator.generateBranding(
  'MyApp',
  'productivity application',
  ['calendar', 'reminders', 'sync']
);

// branding contains:
// - icon: string (path)
// - splash: string (path)
// - palette: string[] (hex colors)
// - font: string
// - icons: Record<string, string>
```

#### Methods

**`generateBranding(appName: string, appType: string, features?: string[]): Promise<BrandingAssets>`**

Generates complete branding package.

**`generateIconSizes(sourceIcon: string, sizes: number[]): Promise<Record<string, string>>`**

Creates multiple icon sizes from source.

---

### MetadataGenerator

Generates store metadata using AI.

```typescript
import { MetadataGenerator } from './metadata';

const generator = new MetadataGenerator();
const metadata = await generator.generateMetadata({
  appName: 'MyApp',
  appType: 'productivity',
  features: ['tasks', 'calendar'],
  targetAudience: 'professionals',
  language: 'en'
});

// metadata contains:
// - name: string
// - shortDescription: string
// - longDescription: string
// - keywords: string[]
// - category: string
// - tagline: string
// - promotionalText: string
```

#### Methods

**`generateMetadata(options: GenerateTextOptions): Promise<MetadataInfo>`**

Generates optimized metadata.

**`generateAppStoreDescription(metadata: MetadataInfo): Promise<string>`**

Formats description for App Store.

**`generatePlayStoreDescription(metadata: MetadataInfo): Promise<string>`**

Formats description for Play Store.

**`optimizeForASO(description: string, keywords: string[]): string`**

Optimizes text for App Store Optimization.

---

### SimulatorManager

Manages simulators and captures screenshots.

```typescript
import { SimulatorManager } from './simulator';

const manager = new SimulatorManager(projectInfo, '/screenshots/dir');
const screenshots = await manager.captureScreenshots();

// screenshots is array of:
// - platform: 'ios' | 'android'
// - path: string
// - size: { width: number, height: number }
```

#### Methods

**`captureScreenshots(): Promise<ScreenshotInfo[]>`**

Captures screenshots from running simulators.

**`launchIOS(): Promise<void>`**

Provides instructions for launching iOS app.

**`launchAndroid(): Promise<void>`**

Provides instructions for launching Android app.

**`getManualInstructions(): string`**

Returns manual screenshot capture instructions.

---

### ImageOptimizer

Optimizes and resizes images.

```typescript
import { ImageOptimizer } from './optimizer';

const optimizer = new ImageOptimizer('/output/dir');
const icons = await optimizer.generateIconSizes('/source/icon.png');
const optimized = await optimizer.optimizeScreenshots(
  ['/screenshot1.png'],
  'ios'
);
```

#### Methods

**`generateIconSizes(sourceIcon: string): Promise<Record<string, string>>`**

Generates all required icon sizes.

**`optimizeScreenshots(screenshots: string[], platform: 'ios' | 'android'): Promise<string[]>`**

Optimizes screenshots for stores.

**`optimizeSplash(sourceSplash: string): Promise<string>`**

Optimizes splash screen.

**`compressImage(imagePath: string, quality?: number): Promise<string>`**

Compresses image to reduce file size.

**`validateImage(imagePath: string, type: 'icon' | 'screenshot' | 'splash'): Promise<ValidationResult>`**

Validates image meets store requirements.

**`getImageInfo(imagePath: string): Promise<sharp.Metadata>`**

Returns image metadata.

---

### Exporter

Organizes and exports assets.

```typescript
import { Exporter } from './exporter';

const exporter = new Exporter('/export/dir');
const exportStructure = await exporter.export(
  'MyApp',
  metadata,
  branding,
  screenshots
);

// exportStructure contains:
// - projectName: string
// - exportPath: string
// - metadata: MetadataInfo
// - assets: BrandingAssets
// - screenshots: ScreenshotInfo[]
```

#### Methods

**`export(projectName: string, metadata: MetadataInfo, branding: BrandingAssets, screenshots: ScreenshotInfo[]): Promise<ExportStructure>`**

Exports complete package.

**`generateSummary(exportStructure: ExportStructure): string`**

Generates human-readable summary.

---

### ConfigManager

Manages application configuration.

```typescript
import { ConfigManager } from './config';

const config = ConfigManager.getInstance();
await config.load();
const settings = config.getConfig();
```

#### Methods

**`static getInstance(): ConfigManager`**

Returns singleton instance.

**`load(): Promise<Config>`**

Loads configuration from file/env.

**`save(config?: Partial<Config>): Promise<void>`**

Saves configuration to file.

**`getConfig(): Config`**

Returns current configuration.

**`updateConfig(updates: Partial<Config>): void`**

Updates configuration in memory.

**`hasOpenAI(): boolean`**

Checks if OpenAI is configured.

**`hasReplicate(): boolean`**

Checks if Replicate is configured.

---

## Type Definitions

### ProjectInfo

```typescript
interface ProjectInfo {
  type: 'expo' | 'react-native';
  name: string;
  path: string;
  version?: string;
  assets: {
    icon?: string;
    splash?: string;
    adaptiveIcon?: {
      foreground?: string;
      background?: string;
    };
  };
  appJson?: any;
  packageJson?: any;
}
```

### BrandingAssets

```typescript
interface BrandingAssets {
  icon: string;
  splash: string;
  palette: string[];
  font?: string;
  icons: {
    [size: string]: string;
  };
}
```

### MetadataInfo

```typescript
interface MetadataInfo {
  name: string;
  shortDescription: string;
  longDescription: string;
  keywords: string[];
  category?: string;
  tagline?: string;
  promotionalText?: string;
}
```

### ScreenshotInfo

```typescript
interface ScreenshotInfo {
  platform: 'ios' | 'android';
  path: string;
  size: {
    width: number;
    height: number;
  };
}
```

### Config

```typescript
interface Config {
  replicate_api_key?: string;
  openai_api_key?: string;
  output_dir: string;
  default_language: string;
  image_size: number;
  auto_launch_simulator: boolean;
  ios_device?: string;
  android_device?: string;
}
```

## Usage Examples

### Complete Workflow

```typescript
import {
  Scanner,
  BrandingGenerator,
  MetadataGenerator,
  ImageOptimizer,
  Exporter
} from './src';

async function publishApp(projectPath: string) {
  // 1. Scan project
  const scanner = new Scanner(projectPath);
  const project = await scanner.scan();

  // 2. Generate branding
  const brandingGen = new BrandingGenerator('./temp');
  const branding = await brandingGen.generateBranding(
    project.name,
    'mobile app',
    await Scanner.getProjectFeatures(project.packageJson)
  );

  // 3. Generate metadata
  const metadataGen = new MetadataGenerator();
  const metadata = await metadataGen.generateMetadata({
    appName: project.name,
    appType: 'mobile app'
  });

  // 4. Optimize images
  const optimizer = new ImageOptimizer('./optimized');
  const icons = await optimizer.generateIconSizes(branding.icon);
  branding.icons = icons;

  // 5. Export
  const exporter = new Exporter('./export');
  const result = await exporter.export(
    project.name,
    metadata,
    branding,
    []
  );

  console.log('Export complete:', result.exportPath);
}
```

### Custom Image Generation

```typescript
import { BrandingGenerator } from './branding';

const generator = new BrandingGenerator('./output');

// Generate custom icon
await generator.generateImage(
  'A minimalist productivity app icon with a checkmark',
  'custom-icon.png',
  1024
);
```

### Batch Screenshot Optimization

```typescript
import { ImageOptimizer } from './optimizer';

const optimizer = new ImageOptimizer('./output');
const screenshots = [
  'screen1.png',
  'screen2.png',
  'screen3.png'
];

const optimized = await optimizer.batchProcess(
  screenshots,
  (img) => optimizer.compressImage(img, 85)
);
```
