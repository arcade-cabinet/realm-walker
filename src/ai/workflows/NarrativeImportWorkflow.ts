/**
 * Narrative Import Workflow
 * Loads entire directories of narrative content, uses Claude Sonnet 4.5
 * to extract quests, NPCs, dialogue, lore into structured format
 */

import * as fs from 'fs';
import * as path from 'path';
import { AnthropicClient } from '../AnthropicClient';
import { AssetLibrary } from '../AssetLibrary';
import { LoreLoader, CanonicalLore } from '../LoreLoader';

export interface NarrativeImportConfig {
  sourceDirectory: string;
  storyBiblePath: string;
  anthropicClient: AnthropicClient;
  assetLibrary: AssetLibrary;
  outputDirectory: string;
  embeddingsDatabase?: string;
}

export interface ExtractedContent {
  quests: Quest[];
  dialogues: Dialogue[];
  npcs: NPC[];
  lore: LoreEntry[];
  locations: Location[];
  storyBeats: StoryBeat[];
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  thread: 'A' | 'B' | 'C';
  requiredFlags: string[];
  setsFlags: string[];
  objectives: Array<{
    description: string;
    flagToSet: string;
  }>;
}

export interface Dialogue {
  id: string;
  npcId: string;
  thread?: 'A' | 'B' | 'C';
  requiredFlags?: string[];
  lines: Array<{
    speaker: string;
    text: string;
    options?: Array<{
      text: string;
      nextId?: string;
      flagToSet?: string;
    }>;
  }>;
}

export interface NPC {
  id: string;
  name: string;
  description: string;
  appearance: {
    prompt: string; // For 3D model generation
    tags: string[];
  };
  role: string;
  thread?: 'A' | 'B' | 'C';
}

export interface LoreEntry {
  id: string;
  title: string;
  content: string;
  category: 'history' | 'faction' | 'location' | 'character' | 'item' | 'magic';
  tags: string[];
  relatedQuests?: string[];
}

export interface Location {
  id: string;
  name: string;
  description: string;
  atmosphere: string;
  suggestedAssets: Array<{
    type: 'prop' | 'npc' | 'architecture';
    description: string;
    prompt: string;
  }>;
  connectsTo?: string[];
}

export interface StoryBeat {
  id: string;
  thread: 'A' | 'B' | 'C';
  chapter: number;
  description: string;
  emotionalTone: string;
  keyEvents: string[];
  relatedQuests: string[];
  relatedNPCs: string[];
}

export interface ImportProgress {
  stage: 'loading' | 'analyzing' | 'extracting' | 'embedding' | 'complete';
  processed: number;
  total: number;
  message: string;
  tokensUsed?: number;
}

export class NarrativeImportWorkflow {
  private config: NarrativeImportConfig;
  private storyBible: string = '';
  private canonicalLore: CanonicalLore;

  constructor(config: NarrativeImportConfig) {
    this.config = config;
    // Load canonical lore on initialization
    this.canonicalLore = LoreLoader.loadCanonicalLore();
  }

  /**
   * Execute narrative import workflow
   */
  async execute(
    onProgress?: (progress: ImportProgress) => void
  ): Promise<ExtractedContent> {
    onProgress?.({
      stage: 'loading',
      processed: 0,
      total: 0,
      message: 'Loading story bible and narrative content...'
    });

    // Step 1: Load story bible
    this.storyBible = await this.loadStoryBible();

    // Step 2: Load all narrative files
    const narrativeFiles = await this.loadNarrativeFiles(
      this.config.sourceDirectory
    );

    console.log(`Loaded ${narrativeFiles.length} narrative files`);

    onProgress?.({
      stage: 'loading',
      processed: narrativeFiles.length,
      total: narrativeFiles.length,
      message: `Loaded ${narrativeFiles.length} files (${this.estimateTokens(narrativeFiles)} tokens)`
    });

    // Step 3: Analyze with Claude Sonnet 4.5
    onProgress?.({
      stage: 'analyzing',
      processed: 0,
      total: 1,
      message: 'Analyzing narrative content with Claude Sonnet 4.5...'
    });

    const extracted = await this.analyzeContent(narrativeFiles, onProgress);

    // Step 4: Create embeddings and import to database
    onProgress?.({
      stage: 'embedding',
      processed: 0,
      total: this.countExtractedItems(extracted),
      message: 'Creating embeddings for extracted content...'
    });

    await this.createEmbeddings(extracted, onProgress);

    // Step 5: Save extracted content
    await this.saveExtractedContent(extracted);

    onProgress?.({
      stage: 'complete',
      processed: this.countExtractedItems(extracted),
      total: this.countExtractedItems(extracted),
      message: `Import complete! Extracted ${this.countExtractedItems(extracted)} items.`
    });

    return extracted;
  }

  /**
   * Load story bible
   */
  private async loadStoryBible(): Promise<string> {
    // Use canonical lore loaded in constructor
    console.log(`Using canonical lore: ${this.canonicalLore.worldSummary.length} characters`);
    return this.canonicalLore.worldSummary;
  }

  /**
   * Load all narrative files from directory
   */
  private async loadNarrativeFiles(
    dir: string
  ): Promise<Array<{ path: string; content: string; format: string }>> {
    const files: Array<{ path: string; content: string; format: string }> = [];

    const scan = (currentDir: string) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          scan(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          
          // Match various text formats
          if (['.md', '.txt', '.rwmd', '.json', '.yaml', '.yml'].includes(ext)) {
            try {
              const content = fs.readFileSync(fullPath, 'utf-8');
              files.push({
                path: fullPath,
                content,
                format: ext.substring(1)
              });
            } catch (error) {
              console.error(`Failed to read ${fullPath}:`, error);
            }
          }
        }
      }
    };

    scan(dir);
    return files;
  }

  /**
   * Analyze content with Claude Sonnet 4.5
   */
  private async analyzeContent(
    files: Array<{ path: string; content: string; format: string }>,
    onProgress?: (progress: ImportProgress) => void
  ): Promise<ExtractedContent> {
    // Combine all content
    const combinedContent = files
      .map(f => `## File: ${f.path} (${f.format})\n\n${f.content}`)
      .join('\n\n---\n\n');

    const instructions = `Analyze this narrative content and extract structured game elements following CANONICAL WORLD LORE.

## CRITICAL CONTEXT - REALM WALKER MYTHOLOGY

${LoreLoader.getCompactSummary(this.canonicalLore)}

## EXTRACTION REQUIREMENTS

Focus on:
1. **Quests** using boolean flag system (NO stats/XP/levels)
   - Must align with A/B/C story threads
   - Flag-gated progression only
   - Thread A: Guardian boon collection (0-8 progression)
   - Thread B: Time travel through 7 Ages, faction politics
   - Thread C: Ravens mystery encounters

2. **NPC Dialogue Trees** that support the three story threads
   - Must reference appropriate Age/faction context
   - Dialogue should reflect time period (Age of Gods to Age of Sundering)
   - Include faction-specific vocabulary and concerns

3. **Character Descriptions** detailed enough for 3D model generation
   - Specify age period visual style (elven/dwarven/human eras)
   - Include faction affiliations (6 Cults or 6 Orders)
   - Physical appearance suited to their age period

4. **Lore Entries** that enrich the canonical mythology
   - Must not contradict Creator/Destroyer primordial story
   - Should reference appropriate Age and factions
   - Connect to Guardian lore or time travel mechanics

5. **Location Descriptions** that could become game scenes
   - Specify which Age (Sundering/Invention/Kings/Stone/Song/Gods)
   - Visual atmosphere matching age theme
   - Faction presence (Cults vs Orders)

6. **Story Beats** organized by thread (A/B/C) and chapter
   - Thread A: Guardian encounters and boon collection
   - Thread B: Age exploration and faction interactions  
   - Thread C: Ravens mystery revelations

Be thorough - extract everything useful while maintaining STRICT consistency with canonical world lore.
REJECT any content that contradicts the primordial mythology or established faction lore.`;

    const result = await this.config.anthropicClient.analyzeNarrativeContent(
      combinedContent,
      this.storyBible,
      instructions
    );

    onProgress?.({
      stage: 'analyzing',
      processed: 1,
      total: 1,
      message: 'Analysis complete!',
      tokensUsed: combinedContent.length / 4 // Rough estimate
    });

    // Transform result into proper format
    return {
      quests: this.normalizeQuests(result.quests || []),
      dialogues: this.normalizeDialogues(result.dialogues || []),
      npcs: this.normalizeNPCs(result.npcs || []),
      lore: this.normalizeLore(result.lore || []),
      locations: this.normalizeLocations(result.locations || []),
      storyBeats: this.normalizeStoryBeats(result.metadata?.storyBeats || [])
    };
  }

  /**
   * Create embeddings for all extracted content
   */
  private async createEmbeddings(
    content: ExtractedContent,
    onProgress?: (progress: ImportProgress) => void
  ): Promise<void> {
    let processed = 0;
    const total = this.countExtractedItems(content);

    // Embed quests
    for (const quest of content.quests) {
      await this.config.assetLibrary.registerAsset({
        id: quest.id,
        type: 'model', // Use 'model' type as proxy for now
        prompt: quest.description,
        description: `Quest: ${quest.name} (Thread ${quest.thread})`,
        filePath: '', // No file for quests
        tags: ['quest', `thread_${quest.thread}`, 'imported', ...quest.requiredFlags],
        metadata: {
          contentType: 'quest',
          quest
        }
      });

      processed++;
      onProgress?.({
        stage: 'embedding',
        processed,
        total,
        message: `Embedding quest: ${quest.name}`
      });
    }

    // Embed dialogues
    for (const dialogue of content.dialogues) {
      const dialogueText = dialogue.lines.map(l => l.text).join(' ');
      
      await this.config.assetLibrary.registerAsset({
        id: dialogue.id,
        type: 'model',
        prompt: dialogueText.substring(0, 500),
        description: `Dialogue for NPC: ${dialogue.npcId}`,
        filePath: '',
        tags: ['dialogue', `npc_${dialogue.npcId}`, 'imported', ...(dialogue.thread ? [`thread_${dialogue.thread}`] : [])],
        metadata: {
          contentType: 'dialogue',
          dialogue
        }
      });

      processed++;
      onProgress?.({
        stage: 'embedding',
        processed,
        total,
        message: `Embedding dialogue: ${dialogue.id}`
      });
    }

    // Embed NPCs
    for (const npc of content.npcs) {
      await this.config.assetLibrary.registerAsset({
        id: npc.id,
        type: 'model',
        prompt: npc.appearance.prompt,
        description: `NPC: ${npc.name} - ${npc.description}`,
        filePath: '',
        tags: ['npc', 'character', 'imported', ...npc.appearance.tags, ...(npc.thread ? [`thread_${npc.thread}`] : [])],
        metadata: {
          contentType: 'npc',
          npc
        }
      });

      processed++;
      onProgress?.({
        stage: 'embedding',
        processed,
        total,
        message: `Embedding NPC: ${npc.name}`
      });
    }

    // Embed lore
    for (const lore of content.lore) {
      await this.config.assetLibrary.registerAsset({
        id: lore.id,
        type: 'model',
        prompt: lore.content,
        description: `Lore: ${lore.title} (${lore.category})`,
        filePath: '',
        tags: ['lore', lore.category, 'imported', ...lore.tags],
        metadata: {
          contentType: 'lore',
          lore
        }
      });

      processed++;
      onProgress?.({
        stage: 'embedding',
        processed,
        total,
        message: `Embedding lore: ${lore.title}`
      });
    }

    // Embed locations
    for (const location of content.locations) {
      await this.config.assetLibrary.registerAsset({
        id: location.id,
        type: 'model',
        prompt: location.description,
        description: `Location: ${location.name}`,
        filePath: '',
        tags: ['location', 'scene', 'imported'],
        metadata: {
          contentType: 'location',
          location
        }
      });

      processed++;
      onProgress?.({
        stage: 'embedding',
        processed,
        total,
        message: `Embedding location: ${location.name}`
      });
    }
  }

  /**
   * Save extracted content to files
   */
  private async saveExtractedContent(content: ExtractedContent): Promise<void> {
    fs.mkdirSync(this.config.outputDirectory, { recursive: true });

    // Save each category separately
    fs.writeFileSync(
      path.join(this.config.outputDirectory, 'quests.json'),
      JSON.stringify(content.quests, null, 2)
    );

    fs.writeFileSync(
      path.join(this.config.outputDirectory, 'dialogues.json'),
      JSON.stringify(content.dialogues, null, 2)
    );

    fs.writeFileSync(
      path.join(this.config.outputDirectory, 'npcs.json'),
      JSON.stringify(content.npcs, null, 2)
    );

    fs.writeFileSync(
      path.join(this.config.outputDirectory, 'lore.json'),
      JSON.stringify(content.lore, null, 2)
    );

    fs.writeFileSync(
      path.join(this.config.outputDirectory, 'locations.json'),
      JSON.stringify(content.locations, null, 2)
    );

    fs.writeFileSync(
      path.join(this.config.outputDirectory, 'story_beats.json'),
      JSON.stringify(content.storyBeats, null, 2)
    );

    // Save combined manifest
    const manifest = {
      importedAt: new Date().toISOString(),
      sourceDirectory: this.config.sourceDirectory,
      totals: {
        quests: content.quests.length,
        dialogues: content.dialogues.length,
        npcs: content.npcs.length,
        lore: content.lore.length,
        locations: content.locations.length,
        storyBeats: content.storyBeats.length
      }
    };

    fs.writeFileSync(
      path.join(this.config.outputDirectory, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    console.log(`Extracted content saved to: ${this.config.outputDirectory}`);
  }

  // Normalization functions
  private normalizeQuests(quests: any[]): Quest[] {
    return quests.map((q, i) => ({
      id: q.id || `quest_${i}`,
      name: q.name || `Quest ${i}`,
      description: q.description || '',
      thread: q.thread || 'A',
      requiredFlags: q.requiredFlags || [],
      setsFlags: q.setsFlags || [],
      objectives: q.objectives || []
    }));
  }

  private normalizeDialogues(dialogues: any[]): Dialogue[] {
    return dialogues.map((d, i) => ({
      id: d.id || `dialogue_${i}`,
      npcId: d.npcId || `npc_${i}`,
      thread: d.thread,
      requiredFlags: d.requiredFlags,
      lines: d.lines || []
    }));
  }

  private normalizeNPCs(npcs: any[]): NPC[] {
    return npcs.map((n, i) => ({
      id: n.id || `npc_${i}`,
      name: n.name || `NPC ${i}`,
      description: n.description || '',
      appearance: {
        prompt: n.appearance?.prompt || n.description || '',
        tags: n.appearance?.tags || []
      },
      role: n.role || 'generic',
      thread: n.thread
    }));
  }

  private normalizeLore(lore: any[]): LoreEntry[] {
    return lore.map((l, i) => ({
      id: l.id || `lore_${i}`,
      title: l.title || `Lore ${i}`,
      content: l.content || '',
      category: l.category || 'history',
      tags: l.tags || [],
      relatedQuests: l.relatedQuests
    }));
  }

  private normalizeLocations(locations: any[]): Location[] {
    return locations.map((l, i) => ({
      id: l.id || `location_${i}`,
      name: l.name || `Location ${i}`,
      description: l.description || '',
      atmosphere: l.atmosphere || '',
      suggestedAssets: l.suggestedAssets || [],
      connectsTo: l.connectsTo
    }));
  }

  private normalizeStoryBeats(beats: any[]): StoryBeat[] {
    return beats.map((b, i) => ({
      id: b.id || `beat_${i}`,
      thread: b.thread || 'A',
      chapter: b.chapter || 1,
      description: b.description || '',
      emotionalTone: b.emotionalTone || '',
      keyEvents: b.keyEvents || [],
      relatedQuests: b.relatedQuests || [],
      relatedNPCs: b.relatedNPCs || []
    }));
  }

  private countExtractedItems(content: ExtractedContent): number {
    return (
      content.quests.length +
      content.dialogues.length +
      content.npcs.length +
      content.lore.length +
      content.locations.length +
      content.storyBeats.length
    );
  }

  private estimateTokens(files: Array<{ content: string }>): number {
    const totalChars = files.reduce((sum, f) => sum + f.content.length, 0);
    return Math.round(totalChars / 4); // Rough estimate: 1 token ≈ 4 chars
  }
}
