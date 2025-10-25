/**
 * Enhanced Scene Orchestrator with Import Integration
 * Extends base scene generation to query imported content from embeddings
 */

import { SceneGenerationContext, AISceneOrchestrator } from './SceneOrchestrator';
import { ImportOrchestrator } from './workflows/ImportOrchestrator';

export interface EnhancedSceneContext extends SceneGenerationContext {
  useImportedContent?: boolean;
  contentPreferences?: {
    preferQuests?: boolean;
    preferNPCs?: boolean;
    preferLore?: boolean;
  };
}

export class EnhancedSceneOrchestrator extends AISceneOrchestrator {
  private importOrchestrator?: ImportOrchestrator;

  /**
   * Set import orchestrator for querying imported content
   */
  setImportOrchestrator(orchestrator: ImportOrchestrator): void {
    this.importOrchestrator = orchestrator;
  }

  /**
   * Generate scene with imported content integration
   */
  async generateEnhancedScene(
    context: EnhancedSceneContext,
    onProgress?: (progress: any) => void
  ): Promise<{ sceneData: any; assetsGenerated: string[]; importedContent?: any }> {
    // Query imported content if available
    let importedContent;
    
    if (context.useImportedContent && this.importOrchestrator) {
      onProgress?.({ stage: 'querying', progress: 5, message: 'Querying imported content...' });

      try {
        importedContent = await this.importOrchestrator.queryForScene({
          thread: context.thread.type,
          description: context.creativeDirection,
          tags: [`chapter${context.chapterIndex}`]
        }, {
          contentTypes: this.getPreferredContentTypes(context.contentPreferences),
          limit: 5
        });

        console.log('Imported content found:', {
          quests: importedContent.quests.length,
          dialogues: importedContent.dialogues.length,
          npcs: importedContent.npcs.length,
          lore: importedContent.lore.length,
          locations: importedContent.locations.length
        });

        // Enrich creative direction with imported content
        context.creativeDirection = this.enrichCreativeDirection(
          context.creativeDirection,
          importedContent
        );
      } catch (error) {
        console.warn('Failed to query imported content:', error);
      }
    }

    // Generate scene using parent class method
    const result = await this.generateScene(context, onProgress);

    return {
      ...result,
      importedContent
    };
  }

  /**
   * Get preferred content types based on context preferences
   */
  private getPreferredContentTypes(
    preferences?: {
      preferQuests?: boolean;
      preferNPCs?: boolean;
      preferLore?: boolean;
    }
  ): Array<'quest' | 'dialogue' | 'npc' | 'lore' | 'location'> {
    if (!preferences) {
      return ['quest', 'dialogue', 'npc', 'lore', 'location'];
    }

    const types: Array<'quest' | 'dialogue' | 'npc' | 'lore' | 'location'> = [];
    
    if (preferences.preferQuests) {
      types.push('quest', 'dialogue');
    }
    
    if (preferences.preferNPCs) {
      types.push('npc', 'dialogue');
    }
    
    if (preferences.preferLore) {
      types.push('lore', 'location');
    }

    // Always include at least some content types
    if (types.length === 0) {
      return ['quest', 'dialogue', 'npc', 'lore', 'location'];
    }

    // Remove duplicates using Set and Array.from for compatibility
    return Array.from(new Set(types));
  }

  /**
   * Enrich creative direction with imported content
   */
  private enrichCreativeDirection(
    baseDirection: string,
    importedContent: {
      quests: any[];
      dialogues: any[];
      npcs: any[];
      lore: any[];
      locations: any[];
    }
  ): string {
    let enriched = baseDirection + '\n\n## Available Imported Content\n\n';

    if (importedContent.npcs.length > 0) {
      enriched += '### NPCs Available:\n';
      importedContent.npcs.forEach(npc => {
        enriched += `- ${npc.name}: ${npc.description} (Model: ${npc.appearance.prompt.substring(0, 50)}...)\n`;
      });
      enriched += '\n';
    }

    if (importedContent.quests.length > 0) {
      enriched += '### Quests Available:\n';
      importedContent.quests.forEach(quest => {
        enriched += `- ${quest.name}: ${quest.description.substring(0, 100)}...\n`;
      });
      enriched += '\n';
    }

    if (importedContent.lore.length > 0) {
      enriched += '### Lore Context:\n';
      importedContent.lore.forEach(lore => {
        enriched += `- ${lore.title}: ${lore.content.substring(0, 100)}...\n`;
      });
      enriched += '\n';
    }

    if (importedContent.locations.length > 0) {
      enriched += '### Location Ideas:\n';
      importedContent.locations.forEach(loc => {
        enriched += `- ${loc.name}: ${loc.description.substring(0, 100)}...\n`;
      });
      enriched += '\n';
    }

    enriched += '\nConsider incorporating these imported elements into your scene design.';

    return enriched;
  }
}
