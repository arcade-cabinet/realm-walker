/**
 * Demo: Content Import Workflows
 * Demonstrates how to import assets and narrative content
 */

import { AnthropicClient } from './ai/AnthropicClient';
import { AssetLibrary } from './ai/AssetLibrary';
import { ImportOrchestrator } from './ai/workflows/ImportOrchestrator';
import { EnhancedSceneOrchestrator, EnhancedSceneContext } from './ai/EnhancedSceneOrchestrator';
import * as path from 'path';

// Configuration
const config = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  meshyApiKey: process.env.MESHY_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  assetDirectory: './assets',
  storyBiblePath: './docs/design/world-lore.md',
  importSourceDirectory: process.env.IMPORT_SOURCE_DIR || './imports',
  assetLibraryPath: './data/asset-library.db'
};

async function demonstrateAssetImport() {
  console.log('=== Asset Import Demo ===\n');

  // Initialize clients
  const anthropicClient = new AnthropicClient({
    apiKey: config.anthropicApiKey
  });

  const assetLibrary = new AssetLibrary(config.assetLibraryPath);

  // Create import orchestrator
  const importOrchestrator = new ImportOrchestrator({
    assetLibrary,
    anthropicClient,
    assetDirectory: config.assetDirectory,
    storyBiblePath: config.storyBiblePath
  });

  // Execute asset import
  console.log(`Importing assets from: ${config.importSourceDirectory}\n`);

  const result = await importOrchestrator.executeImport(
    {
      type: 'assets',
      sourceDirectory: config.importSourceDirectory
    },
    (stage, message, progress) => {
      console.log(`[${stage}] ${message} - ${progress.toFixed(0)}%`);
    }
  );

  console.log('\n=== Import Results ===');
  console.log(`Success: ${result.success}`);
  console.log(`Assets imported: ${result.assetsImported || 0}`);
  console.log(`Time taken: ${(result.timeTaken / 1000).toFixed(2)}s`);
  
  if (result.errors.length > 0) {
    console.log('\nErrors:');
    result.errors.forEach(err => console.log(`  - ${err}`));
  }

  // Show stats
  const stats = await importOrchestrator.getEmbeddingsStats();
  console.log('\n=== Embeddings Stats ===');
  console.log(`Total items: ${stats.totalItems}`);
  console.log('By type:', stats.byType);

  importOrchestrator.close();
}

async function demonstrateNarrativeImport() {
  console.log('\n\n=== Narrative Import Demo ===\n');

  // Initialize clients
  const anthropicClient = new AnthropicClient({
    apiKey: config.anthropicApiKey
  });

  const assetLibrary = new AssetLibrary(config.assetLibraryPath);

  // Create import orchestrator
  const importOrchestrator = new ImportOrchestrator({
    assetLibrary,
    anthropicClient,
    assetDirectory: config.assetDirectory,
    storyBiblePath: config.storyBiblePath
  });

  // Execute narrative import
  console.log(`Importing narrative from: ${config.importSourceDirectory}\n`);

  const result = await importOrchestrator.executeImport(
    {
      type: 'narrative',
      sourceDirectory: config.importSourceDirectory,
      options: {
        outputDirectory: './extracted-content'
      }
    },
    (stage, message, progress) => {
      console.log(`[${stage}] ${message} - ${progress.toFixed(0)}%`);
    }
  );

  console.log('\n=== Import Results ===');
  console.log(`Success: ${result.success}`);
  console.log(`Narrative items extracted: ${result.narrativeItemsExtracted || 0}`);
  console.log(`Time taken: ${(result.timeTaken / 1000).toFixed(2)}s`);
  
  if (result.errors.length > 0) {
    console.log('\nErrors:');
    result.errors.forEach(err => console.log(`  - ${err}`));
  }

  importOrchestrator.close();
}

async function demonstrateEnhancedSceneGeneration() {
  console.log('\n\n=== Enhanced Scene Generation Demo ===\n');
  console.log('Generating scene with imported content integration...\n');

  // Initialize all clients
  const anthropicClient = new AnthropicClient({
    apiKey: config.anthropicApiKey
  });

  const assetLibrary = new AssetLibrary(config.assetLibraryPath);

  const importOrchestrator = new ImportOrchestrator({
    assetLibrary,
    anthropicClient,
    assetDirectory: config.assetDirectory,
    storyBiblePath: config.storyBiblePath
  });

  // Create enhanced scene orchestrator
  const sceneOrchestrator = new EnhancedSceneOrchestrator({
    meshyApiKey: config.meshyApiKey,
    openaiApiKey: config.openaiApiKey,
    assetLibraryPath: config.assetLibraryPath,
    outputDirectory: './generated/scenes'
  });

  sceneOrchestrator.setImportOrchestrator(importOrchestrator);

  // Define scene context
  const sceneContext: EnhancedSceneContext = {
    thread: {
      type: 'A',
      description: 'Guardian Quest - Ancient powers and legendary encounters',
      chapters: [1]
    },
    chapterIndex: 1,
    previousScenes: [],
    creativeDirection: 'Create a mysterious ancient temple entrance scene with Gothic atmosphere',
    existingAssets: [],
    useImportedContent: true,
    contentPreferences: {
      preferNPCs: true,
      preferLore: true
    }
  };

  const result = await sceneOrchestrator.generateEnhancedScene(
    sceneContext,
    (progress: { stage: string; message: string; progress: number }) => {
      console.log(`[${progress.stage}] ${progress.message} - ${progress.progress}%`);
    }
  );

  console.log('\n=== Scene Generation Results ===');
  console.log(`Scene ID: ${result.sceneData?.id || 'N/A'}`);
  console.log(`Assets generated: ${result.assetsGenerated.length}`);
  
  if (result.importedContent) {
    console.log('\n=== Imported Content Used ===');
    console.log(`NPCs: ${result.importedContent.npcs.length}`);
    console.log(`Quests: ${result.importedContent.quests.length}`);
    console.log(`Lore entries: ${result.importedContent.lore.length}`);
    console.log(`Locations: ${result.importedContent.locations.length}`);
  }

  sceneOrchestrator.close();
  importOrchestrator.close();
}

async function demonstrateBatchImport() {
  console.log('\n\n=== Batch Import Demo ===\n');

  const anthropicClient = new AnthropicClient({
    apiKey: config.anthropicApiKey
  });

  const assetLibrary = new AssetLibrary(config.assetLibraryPath);

  const importOrchestrator = new ImportOrchestrator({
    assetLibrary,
    anthropicClient,
    assetDirectory: config.assetDirectory,
    storyBiblePath: config.storyBiblePath
  });

  // Define multiple import jobs
  const jobs = [
    {
      type: 'assets' as const,
      sourceDirectory: './imports/chapter1'
    },
    {
      type: 'narrative' as const,
      sourceDirectory: './imports/chapter1',
      options: {
        outputDirectory: './extracted-content/chapter1'
      }
    },
    {
      type: 'both' as const,
      sourceDirectory: './imports/chapter2',
      options: {
        outputDirectory: './extracted-content/chapter2'
      }
    }
  ];

  console.log(`Processing ${jobs.length} import jobs...\n`);

  const results = await importOrchestrator.batchImport(
    jobs,
    (jobIndex, result) => {
      console.log(`\n--- Job ${jobIndex + 1} Complete ---`);
      console.log(`Success: ${result.success}`);
      console.log(`Assets: ${result.assetsImported || 0}`);
      console.log(`Narrative items: ${result.narrativeItemsExtracted || 0}`);
      console.log(`Time: ${(result.timeTaken / 1000).toFixed(2)}s`);
    }
  );

  console.log('\n=== Batch Import Summary ===');
  const totalAssets = results.reduce((sum, r) => sum + (r.assetsImported || 0), 0);
  const totalNarrative = results.reduce((sum, r) => sum + (r.narrativeItemsExtracted || 0), 0);
  const totalTime = results.reduce((sum, r) => sum + r.timeTaken, 0);
  const successCount = results.filter(r => r.success).length;

  console.log(`Jobs completed: ${successCount}/${results.length}`);
  console.log(`Total assets imported: ${totalAssets}`);
  console.log(`Total narrative items extracted: ${totalNarrative}`);
  console.log(`Total time: ${(totalTime / 1000).toFixed(2)}s`);

  importOrchestrator.close();
}

async function main() {
  console.log('Realm Walker Story - Content Import Workflows Demo\n');
  console.log('This demo shows how to import both assets and narrative content.\n');

  // Check for API keys
  if (!config.anthropicApiKey) {
    console.error('Error: ANTHROPIC_API_KEY environment variable not set');
    console.log('\nTo run this demo, set your API key:');
    console.log('  export ANTHROPIC_API_KEY="your-key-here"');
    return;
  }

  const demo = process.argv[2] || 'help';

  switch (demo) {
    case 'assets':
      await demonstrateAssetImport();
      break;
    
    case 'narrative':
      await demonstrateNarrativeImport();
      break;
    
    case 'enhanced':
      await demonstrateEnhancedSceneGeneration();
      break;
    
    case 'batch':
      await demonstrateBatchImport();
      break;
    
    case 'all':
      await demonstrateAssetImport();
      await demonstrateNarrativeImport();
      await demonstrateEnhancedSceneGeneration();
      break;
    
    default:
      console.log('Available demos:');
      console.log('  npm run demo:import assets     - Import GLB assets with AI correlation');
      console.log('  npm run demo:import narrative  - Import narrative content extraction');
      console.log('  npm run demo:import enhanced   - Generate scenes with imported content');
      console.log('  npm run demo:import batch      - Batch import multiple directories');
      console.log('  npm run demo:import all        - Run all demos');
      console.log('\nUsage:');
      console.log('  npm run demo:import [demo-name]');
      console.log('\nEnvironment variables:');
      console.log('  ANTHROPIC_API_KEY   - Required for Claude Sonnet 4.5');
      console.log('  MESHY_API_KEY       - Required for 3D model generation');
      console.log('  OPENAI_API_KEY      - Required for GPT-4.5 image generation');
      console.log('  IMPORT_SOURCE_DIR   - Directory to import from (default: ./imports)');
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { demonstrateAssetImport, demonstrateNarrativeImport, demonstrateEnhancedSceneGeneration, demonstrateBatchImport };
