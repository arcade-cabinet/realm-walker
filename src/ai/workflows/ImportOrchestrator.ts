/**
 * Import Orchestrator
 * Coordinates both asset and narrative import workflows
 */

import { AssetImportWorkflow } from './AssetImportWorkflow';
import { NarrativeImportWorkflow } from './NarrativeImportWorkflow';
import { AssetLibrary } from '../AssetLibrary';
import { AnthropicClient } from '../AnthropicClient';

export interface ImportOrchestratorConfig {
  assetLibrary: AssetLibrary;
  anthropicClient: AnthropicClient;
  assetDirectory: string;
  storyBiblePath: string;
}

export interface ImportJob {
  type: 'assets' | 'narrative' | 'both';
  sourceDirectory: string;
  options?: {
    // Asset-specific options
    filePatterns?: {
      glb?: RegExp;
      metadata?: RegExp;
    };
    
    // Narrative-specific options
    outputDirectory?: string;
  };
}

export interface ImportResult {
  success: boolean;
  assetsImported?: number;
  narrativeItemsExtracted?: number;
  errors: string[];
  timeTaken: number;
}

export class ImportOrchestrator {
  private config: ImportOrchestratorConfig;

  constructor(config: ImportOrchestratorConfig) {
    this.config = config;
  }

  /**
   * Execute import job
   */
  async executeImport(
    job: ImportJob,
    onProgress?: (stage: string, message: string, progress: number) => void
  ): Promise<ImportResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let assetsImported = 0;
    let narrativeItemsExtracted = 0;

    try {
      if (job.type === 'assets' || job.type === 'both') {
        onProgress?.('assets', 'Starting asset import...', 0);

        const assetWorkflow = new AssetImportWorkflow({
          sourceDirectory: job.sourceDirectory,
          targetAssetDirectory: this.config.assetDirectory,
          assetLibrary: this.config.assetLibrary,
          anthropicClient: this.config.anthropicClient,
          filePatterns: job.options?.filePatterns
        });

        try {
          const imported = await assetWorkflow.execute((progress) => {
            const percent = progress.total > 0 
              ? (progress.processed / progress.total) * 100 
              : 0;
            onProgress?.(progress.stage, progress.message, percent);
          });

          assetsImported = imported.length;
          console.log(`Asset import complete: ${assetsImported} assets imported`);
        } catch (error) {
          const errorMsg = `Asset import failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      if (job.type === 'narrative' || job.type === 'both') {
        onProgress?.('narrative', 'Starting narrative import...', 0);

        const narrativeWorkflow = new NarrativeImportWorkflow({
          sourceDirectory: job.sourceDirectory,
          storyBiblePath: this.config.storyBiblePath,
          anthropicClient: this.config.anthropicClient,
          assetLibrary: this.config.assetLibrary,
          outputDirectory: job.options?.outputDirectory || `${job.sourceDirectory}/extracted`
        });

        try {
          const extracted = await narrativeWorkflow.execute((progress) => {
            const percent = progress.total > 0 
              ? (progress.processed / progress.total) * 100 
              : 0;
            onProgress?.(progress.stage, progress.message, percent);
          });

          narrativeItemsExtracted = (
            extracted.quests.length +
            extracted.dialogues.length +
            extracted.npcs.length +
            extracted.lore.length +
            extracted.locations.length +
            extracted.storyBeats.length
          );

          console.log(`Narrative import complete: ${narrativeItemsExtracted} items extracted`);
        } catch (error) {
          const errorMsg = `Narrative import failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      const timeTaken = Date.now() - startTime;

      return {
        success: errors.length === 0,
        assetsImported: assetsImported > 0 ? assetsImported : undefined,
        narrativeItemsExtracted: narrativeItemsExtracted > 0 ? narrativeItemsExtracted : undefined,
        errors,
        timeTaken
      };

    } catch (error) {
      const errorMsg = `Import orchestration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      console.error(errorMsg);

      return {
        success: false,
        errors,
        timeTaken: Date.now() - startTime
      };
    }
  }

  /**
   * Batch import multiple directories
   */
  async batchImport(
    jobs: ImportJob[],
    onJobComplete?: (jobIndex: number, result: ImportResult) => void
  ): Promise<ImportResult[]> {
    const results: ImportResult[] = [];

    for (let i = 0; i < jobs.length; i++) {
      console.log(`\n=== Processing job ${i + 1}/${jobs.length} ===`);
      
      const result = await this.executeImport(jobs[i], (stage, message, progress) => {
        console.log(`[Job ${i + 1}] ${stage}: ${message} (${progress.toFixed(0)}%)`);
      });

      results.push(result);
      onJobComplete?.(i, result);
    }

    return results;
  }

  /**
   * Get embeddings statistics
   */
  async getEmbeddingsStats(): Promise<{
    totalItems: number;
    byType: Record<string, number>;
    byThread: Record<string, number>;
  }> {
    const stats = this.config.assetLibrary.getStats();
    
    // This is a simplified version - would need to query embeddings DB
    // for actual content type breakdown
    return {
      totalItems: stats.totalAssets,
      byType: stats.byType,
      byThread: {
        A: 0,
        B: 0,
        C: 0
      }
    };
  }

  /**
   * Query imported content for scene generation
   */
  async queryForScene(
    sceneContext: {
      thread?: 'A' | 'B' | 'C';
      requiredFlags?: string[];
      tags?: string[];
      description: string;
    },
    options: {
      contentTypes?: Array<'quest' | 'dialogue' | 'npc' | 'lore' | 'location'>;
      limit?: number;
    } = {}
  ): Promise<{
    quests: any[];
    dialogues: any[];
    npcs: any[];
    lore: any[];
    locations: any[];
  }> {
    const { contentTypes, limit = 10 } = options;
    
    // Build search query
    let query = sceneContext.description;
    if (sceneContext.thread) {
      query += ` thread ${sceneContext.thread}`;
    }
    if (sceneContext.tags) {
      query += ` ${sceneContext.tags.join(' ')}`;
    }

    // Search asset library for relevant content
    const results = await this.config.assetLibrary.searchSimilar(query, {
      threshold: 0.7,
      limit: limit * 5, // Get more results to filter
      tags: sceneContext.tags
    });

    // Organize by content type
    const organized: {
      quests: any[];
      dialogues: any[];
      npcs: any[];
      lore: any[];
      locations: any[];
    } = {
      quests: [],
      dialogues: [],
      npcs: [],
      lore: [],
      locations: []
    };

    for (const result of results) {
      const contentType = result.asset.metadata?.contentType;
      
      if (!contentType) continue;
      if (contentTypes && !contentTypes.includes(contentType)) continue;

      // Check thread match
      if (sceneContext.thread) {
        const thread = result.asset.metadata[contentType]?.thread;
        if (thread && thread !== sceneContext.thread) continue;
      }

      // Check flag requirements
      if (sceneContext.requiredFlags) {
        const itemFlags = result.asset.metadata[contentType]?.requiredFlags || [];
        const hasRequiredFlags = sceneContext.requiredFlags.every(f => itemFlags.includes(f));
        if (!hasRequiredFlags) continue;
      }

      // Add to appropriate category
      if (contentType === 'quest' && organized.quests.length < limit) {
        organized.quests.push(result.asset.metadata.quest);
      } else if (contentType === 'dialogue' && organized.dialogues.length < limit) {
        organized.dialogues.push(result.asset.metadata.dialogue);
      } else if (contentType === 'npc' && organized.npcs.length < limit) {
        organized.npcs.push(result.asset.metadata.npc);
      } else if (contentType === 'lore' && organized.lore.length < limit) {
        organized.lore.push(result.asset.metadata.lore);
      } else if (contentType === 'location' && organized.locations.length < limit) {
        organized.locations.push(result.asset.metadata.location);
      }
    }

    return organized;
  }

  /**
   * Close all connections
   */
  close(): void {
    this.config.assetLibrary.close();
  }
}
