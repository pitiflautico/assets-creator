import * as dotenv from 'dotenv';
import * as path from 'path';
import { GeneratorConfig } from '../types';

// Cargar variables de entorno
dotenv.config();

/**
 * Configuración por defecto del generador
 */
export function getDefaultConfig(overrides?: Partial<GeneratorConfig>): GeneratorConfig {
  const config: GeneratorConfig = {
    replicateApiKey: process.env.REPLICATE_API_TOKEN || '',
    openaiApiKey: process.env.OPENAI_API_KEY,
    outputDir: process.env.OUTPUT_DIR || path.join(process.cwd(), 'generated_assets'),
    models: {
      llm:
        process.env.DEFAULT_LLM_MODEL ||
        'meta/meta-llama-3-70b-instruct:fbfb20b472b2f3bdd101412a9f70a0ed4fc0ced78a77ff00970ee7a2383c575d',
      image:
        process.env.DEFAULT_IMAGE_MODEL ||
        'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    },
    preferences: {
      language: 'es',
      tone: 'professional',
      targetMarket: ['global'],
      generateImages: true,
      imageCount: 5,
    },
    ...overrides,
  };

  return config;
}

/**
 * Valida la configuración
 */
export function validateConfig(config: GeneratorConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.replicateApiKey) {
    errors.push('REPLICATE_API_TOKEN es requerido');
  }

  if (!config.models.llm) {
    errors.push('Modelo LLM no configurado');
  }

  if (!config.models.image) {
    errors.push('Modelo de imagen no configurado');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Modelos disponibles en Replicate
 */
export const AVAILABLE_MODELS = {
  llm: {
    'llama-3-70b': 'meta/meta-llama-3-70b-instruct:fbfb20b472b2f3bdd101412a9f70a0ed4fc0ced78a77ff00970ee7a2383c575d',
    'llama-2-70b': 'meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3',
    'mixtral-8x7b': 'mistralai/mixtral-8x7b-instruct-v0.1:2b56576fcfbe32fa0526897d8385dd3fb3d36ba6fd0dbe033c72886b81ade8e8',
  },
  image: {
    'sdxl': 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    'sdxl-lightning': 'bytedance/sdxl-lightning-4step:5f24084160c9089501c1b3545d9be3c27883ae2239b6f412990e82d4a6210f8f',
    'playground-v2.5': 'playgroundai/playground-v2.5-1024px-aesthetic:a45f82a1382bed5c7aeb861dac7c7d191b0fdf74d8d57c4a0e6ed7d4d0bf7d24',
  },
};
