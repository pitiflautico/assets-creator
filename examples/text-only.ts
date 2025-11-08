/**
 * Ejemplo: Generar solo textos sin imágenes
 */

import { AssetsCreator } from '../src/index';

async function main() {
  console.log('📝 Ejemplo: Solo Textos\n');

  const creator = new AssetsCreator({
    replicateApiKey: process.env.REPLICATE_API_TOKEN!,
    preferences: {
      language: 'es',
      tone: 'professional',
      targetMarket: ['global'],
      generateImages: false,
      imageCount: 0,
    },
  });

  const bundle = await creator.generateTextOnly();

  console.log('\n📝 Textos Generados:');
  console.log('═══════════════════════════════════════\n');

  console.log('🏷️  Título:');
  console.log(`   ${bundle.metadata.title}\n`);

  console.log('📄 Descripción Corta:');
  console.log(`   ${bundle.metadata.shortDescription}\n`);

  console.log('🔑 Keywords:');
  console.log(`   ${bundle.metadata.keywords.join(', ')}\n`);

  console.log('✅ Textos guardados en:', process.cwd() + '/generated_assets/texts');
}

main();
