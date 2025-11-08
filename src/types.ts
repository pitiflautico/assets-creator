/**
 * Type definitions for the AI App Publisher System
 */

export interface ProjectInfo {
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

export interface BrandingAssets {
  icon: string;
  splash: string;
  palette: string[];
  font?: string;
  icons: {
    [size: string]: string;
  };
}

export interface MetadataInfo {
  name: string;
  shortDescription: string;
  longDescription: string;
  keywords: string[];
  category?: string;
  tagline?: string;
  promotionalText?: string;
}

export interface ScreenshotInfo {
  platform: 'ios' | 'android';
  path: string;
  size: {
    width: number;
    height: number;
  };
}

export interface ExportStructure {
  projectName: string;
  exportPath: string;
  metadata: MetadataInfo;
  assets: BrandingAssets;
  screenshots: ScreenshotInfo[];
}

export interface Config {
  replicate_api_key?: string;
  openai_api_key?: string;
  output_dir: string;
  default_language: string;
  image_size: number;
  auto_launch_simulator: boolean;
  ios_device?: string;
  android_device?: string;
}

export interface GenerateImageOptions {
  prompt: string;
  size?: number;
  style?: string;
  negativePrompt?: string;
}

export interface GenerateTextOptions {
  appName?: string;
  appType?: string;
  features?: string[];
  targetAudience?: string;
  language?: string;
}

export interface ProjectContext {
  description: string;
  purpose: string;
  targetAudience: string;
  category: string;
  keyFeatures: string[];
  appType: string;
  valueProposition: string;
  mainScreens: string[];
  userFlow: string;
  detectedScreens: string[];
  detectedFeatures: string[];
}

export interface ColorPalette {
  primary: string[];
  secondary: string[];
  accent: string[];
  neutral: string[];
  all: string[];
}
