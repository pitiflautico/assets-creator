/**
 * Ejemplo básico de uso de Assets Creator
 */

import { AssetsCreator } from '../src/index';
import * as path from 'path';

async function main() {
  try {
    console.log('🚀 Ejemplo: Generación Básica de Assets\n');

    // 1. Crear instancia con configuración mínima
    const creator = new AssetsCreator({
      replicateApiKey: process.env.REPLICATE_API_TOKEN!,
      outputDir: path.join(__dirname, 'output'),
      preferences: {
        language: 'es',
        tone: 'professional',
        targetMarket: ['global'],
        generateImages: true,
        imageCount: 3,
      },
    });

    // 2. Generar todos los assets
    console.log('Generando assets para el proyecto actual...\n');
    const bundle = await creator.generateAll(process.cwd());

    // 3. Mostrar resultados
    console.log('\n📊 Resultados:');
    console.log('═══════════════════════════════════════\n');

    console.log('📝 Metadatos:');
    console.log(`   Título: ${bundle.metadata.title}`);
    console.log(`   Keywords: ${bundle.metadata.keywords.length}`);
    console.log(`   Tags: ${bundle.metadata.tags.length}\n`);

    console.log('🎯 ASO:');
    console.log(`   Keywords primarios: ${bundle.aso.primaryKeywords.length}`);
    console.log(`   Readability score: ${bundle.aso.readabilityScore.toFixed(1)}/100\n`);

    console.log('🎨 Imágenes:');
    console.log(`   Total generadas: ${bundle.images.length}`);
    bundle.images.forEach((img, i) => {
      console.log(`   ${i + 1}. ${img.type} - ${img.localPath}`);
    });

    console.log('\n✅ ¡Completado!\n');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
