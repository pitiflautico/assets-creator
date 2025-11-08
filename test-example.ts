/**
 * Ejemplo simple de uso programático
 */

import { AssetsCreator } from './src/index';

async function main() {
  // 1. Crear instancia
  const creator = new AssetsCreator({
    replicateApiKey: process.env.REPLICATE_API_TOKEN!,
    outputDir: './output',
    preferences: {
      language: 'es',
      tone: 'professional',
      targetMarket: ['global'],
      generateImages: false, // false = más barato, solo textos
      imageCount: 3,
    },
  });

  console.log('🔍 Analizando proyecto...\n');

  // 2. Primero solo analizar (gratis)
  const appData = await creator.analyzeOnly();

  console.log('📱 App detectada:', appData.name);
  console.log('📂 Categoría:', appData.category);
  console.log('🖥️  Plataforma:', appData.platform);
  console.log('✨ Features:', appData.features?.length || 0);

  console.log('\n¿Proceder a generar assets? (esto usará créditos de Replicate)');
  console.log('Descomenta la siguiente línea para generar:\n');

  // 3. Generar assets (descomenta para ejecutar)
  // const bundle = await creator.generateTextOnly();
  // console.log('\n✅ Assets generados!');
  // console.log('📝 Título:', bundle.metadata.title);
  // console.log('🔑 Keywords:', bundle.metadata.keywords.slice(0, 5).join(', '));
}

// Ejecutar
main().catch(console.error);
