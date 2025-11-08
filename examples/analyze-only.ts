/**
 * Ejemplo: Solo analizar una app sin generar assets
 */

import { AssetsCreator } from '../src/index';

async function main() {
  console.log('🔍 Ejemplo: Solo Análisis\n');

  const creator = new AssetsCreator({
    replicateApiKey: 'dummy', // No se necesita para análisis
  });

  const appData = await creator.analyzeOnly();

  console.log('📊 Análisis Completo:');
  console.log('═══════════════════════════════════════\n');

  console.log('📱 Información Básica:');
  console.log(`   Nombre: ${appData.name}`);
  console.log(`   Versión: ${appData.version || 'N/A'}`);
  console.log(`   Categoría: ${appData.category}`);
  console.log(`   Plataforma: ${appData.platform}\n`);

  if (appData.description) {
    console.log('📝 Descripción:');
    console.log(`   ${appData.description}\n`);
  }

  if (appData.sourceCode?.technologies) {
    console.log('🔧 Tecnologías:');
    appData.sourceCode.technologies.forEach(tech => {
      console.log(`   • ${tech}`);
    });
    console.log('');
  }

  if (appData.sourceCode?.frameworks) {
    console.log('🚀 Frameworks:');
    appData.sourceCode.frameworks.forEach(fw => {
      console.log(`   • ${fw}`);
    });
    console.log('');
  }

  if (appData.features) {
    console.log('✨ Features Detectados:');
    appData.features.forEach((feature, i) => {
      console.log(`   ${i + 1}. ${feature}`);
    });
    console.log('');
  }

  console.log('📁 Archivos de Código:');
  console.log(`   Total: ${appData.sourceCode?.files.length || 0} archivos\n`);

  console.log('✅ Análisis completado');
}

main();
