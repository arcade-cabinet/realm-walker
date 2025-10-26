/**
 * AI Scene Generation Orchestrator
 * Master/sub workflow pattern for AI-driven scene generation
 * Coordinates across story threads (A/B/C) with asset reuse
 */

import { openai } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import { RWMDSceneSchema, AssetGenerationRequestSchema } from '../schemas/RWMDSchema';
import { AssetLibrary } from './AssetLibrary';
import { MeshyClient } from './MeshyClient';
import { GPTImageGenerator } from './GPTImageGenerator';
import { LoreLoader, CanonicalLore } from './LoreLoader';
import * as fs from 'fs';
import * as path from 'path';

export interface StoryThread {
  type: 'A' | 'B' | 'C';
  description: string;
  chapters: number[];
  ageRange?: 'child' | 'teen' | 'adult' | 'all';
}

export interface SceneGenerationContext {
  thread: StoryThread;
  chapterIndex: number;
  previousScenes: string[];
  creativeDirection: string;
  existingAssets: string[];
}

export interface GenerationProgress {
  stage: string;
  progress: number;
  message: string;
}

export class AISceneOrchestrator {
  private assetLibrary: AssetLibrary;
  private meshyClient: MeshyClient;
  private imageGenerator: GPTImageGenerator;
  private canonicalLore: CanonicalLore;
  private model = openai('gpt-4o');
  private outputDirectory: string;

  constructor(config: {
    meshyApiKey: string;
    openaiApiKey: string;
    assetLibraryPath?: string;
    outputDirectory?: string;
  }) {
    this.assetLibrary = new AssetLibrary(config.assetLibraryPath);
    this.meshyClient = new MeshyClient({ apiKey: config.meshyApiKey });
    this.imageGenerator = new GPTImageGenerator();
    this.outputDirectory = config.outputDirectory || './generated/scenes';
    // Load canonical lore on initialization
    this.canonicalLore = LoreLoader.loadCanonicalLore();

    this.ensureDirectory();
  }

  /**
   * Ensure output directory exists
   */
  private ensureDirectory(): void {
    if (!fs.existsSync(this.outputDirectory)) {
      fs.mkdirSync(this.outputDirectory, { recursive: true });
    }
  }

  /**
   * Generate a complete scene with AI
   */
  async generateScene(
    context: SceneGenerationContext,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<{ sceneData: any; assetsGenerated: string[] }> {
    onProgress?.({ stage: 'planning', progress: 0, message: 'Planning scene structure...' });

    // Step 1: Generate scene structure with AI
    const sceneStructure = await this.planSceneStructure(context);

    onProgress?.({ stage: 'assets', progress: 20, message: 'Searching for reusable assets...' });

    // Step 2: Check asset library for reusable assets
    const assetsToGenerate: string[] = [];
    const assetsToReuse: Map<string, string> = new Map();

    await this.resolveAssets(sceneStructure, assetsToGenerate, assetsToReuse, onProgress);

    onProgress?.({ stage: 'generation', progress: 40, message: `Generating ${assetsToGenerate.length} new assets...` });

    // Step 3: Generate new assets as needed
    const generatedAssets: string[] = [];
    for (let i = 0; i < assetsToGenerate.length; i++) {
      const assetPrompt = assetsToGenerate[i];
      const progress = 40 + (i / assetsToGenerate.length) * 40;

      onProgress?.({ stage: 'generation', progress, message: `Generating: ${assetPrompt.substring(0, 50)}...` });

      const assetPath = await this.generateAsset(assetPrompt, context);
      generatedAssets.push(assetPath);
    }

    onProgress?.({ stage: 'composition', progress: 80, message: 'Composing final scene...' });

    // Step 4: Compose final scene RWMD
    const finalScene = await this.composeScene(sceneStructure, assetsToReuse, generatedAssets);

    onProgress?.({ stage: 'complete', progress: 100, message: 'Scene generation complete!' });

    return {
      sceneData: finalScene,
      assetsGenerated: generatedAssets
    };
  }

  /**
   * Plan scene structure with AI (master workflow)
   */
  private async planSceneStructure(context: SceneGenerationContext): Promise<any> {
    const systemPrompt = this.buildSystemPrompt(context);

    const { object } = await generateObject({
      model: this.model,
      schema: RWMDSceneSchema,
      prompt: `${systemPrompt}\n\nCreative Direction:\n${context.creativeDirection}`
    });

    return object;
  }

  /**
   * Build system prompt with context
   */
  private buildSystemPrompt(context: SceneGenerationContext): string {
    // Use canonical lore thread descriptions
    const threadInfo = this.canonicalLore.threadDescriptions[context.thread.type];

    let prompt = `You are generating a scene for REALM WALKER using canonical world lore.

## WORLD CONTEXT

${LoreLoader.getCompactSummary(this.canonicalLore)}

## CURRENT THREAD: ${context.thread.type} STORY

${threadInfo}

## SCENE REQUIREMENTS

Chapter: ${context.chapterIndex}
`;

    if (context.thread.ageRange) {
      prompt += `Age Range: ${context.thread.ageRange}-appropriate content\n`;
    }

    if (context.previousScenes.length > 0) {
      prompt += `\nPrevious scenes in this thread:\n`;
      prompt += context.previousScenes.map(s => `- ${s}`).join('\n');
      prompt += '\n\nMaintain narrative continuity with these scenes.\n';
    }

    if (context.existingAssets.length > 0) {
      prompt += `\nAvailable assets for reuse:\n`;
      prompt += context.existingAssets.slice(0, 20).map(a => `- ${a}`).join('\n');
      prompt += '\n\nReuse existing assets when appropriate to maintain visual consistency.\n';
    }

    prompt += `
## CONSTRAINTS

- Boolean flag quest system ONLY (no stats/XP/levels)
- Pure authored content (no procedural generation)
- Must align with canonical mythology (Creator/Destroyer, Guardians, 7 Ages)
- If time period specified, match visual style to Age
- Faction presence must be historically accurate

Generate a complete RWMD scene following the schema constraints.`;

    return prompt;
  }

  /**
   * Resolve which assets to reuse vs generate
   */
  private async resolveAssets(
    scene: any,
    toGenerate: string[],
    toReuse: Map<string, string>,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<void> {
    const allAssetPrompts: string[] = [];

    // Extract all asset requirements from scene
    if (scene.slots?.npcs) {
      for (const npc of scene.slots.npcs) {
        if (npc.appearance?.modelPrompt) {
          allAssetPrompts.push(npc.appearance.modelPrompt);
        }
      }
    }

    if (scene.slots?.props) {
      for (const prop of scene.slots.props) {
        if (prop.modelSpec?.prompt) {
          allAssetPrompts.push(prop.modelSpec.prompt);
        }
      }
    }

    if (scene.slots?.doors) {
      for (const door of scene.slots.doors) {
        if (door.modelSpec?.prompt) {
          allAssetPrompts.push(door.modelSpec.prompt);
        }
      }
    }

    // Search for similar assets
    for (const prompt of allAssetPrompts) {
      const similar = await this.assetLibrary.searchSimilar(prompt, {
        type: 'model',
        threshold: 0.85,
        limit: 1
      });

      if (similar.length > 0) {
        toReuse.set(prompt, similar[0].asset.filePath);
        this.assetLibrary.incrementUsage(similar[0].asset.id);
        console.log(`Reusing asset: ${similar[0].asset.id} (similarity: ${similar[0].similarity.toFixed(2)})`);
      } else {
        toGenerate.push(prompt);
      }
    }
  }

  /**
   * Generate a single asset
   */
  private async generateAsset(prompt: string, context: SceneGenerationContext): Promise<string> {
    // Use Meshy for 3D models
    console.log(`Generating 3D model: ${prompt}`);

    const task = await this.meshyClient.createTextTo3D({
      mode: 'refine',
      prompt,
      art_style: this.selectArtStyle(context),
      ai_model: 'meshy-4',
      topology: 'quad',
      target_polycount: 5000
    });

    const completed = await this.meshyClient.waitForTask(task.id, {
      pollInterval: 10000,
      maxWaitTime: 600000,
      onProgress: (progress) => console.log(`  Progress: ${progress}%`)
    });

    if (!completed.model_urls?.glb) {
      throw new Error('Model generation failed - no GLB URL returned');
    }

    // Download and save model
    const modelPath = await this.downloadAsset(completed.model_urls.glb, 'model');

    // Register in asset library
    await this.assetLibrary.registerAsset({
      id: `model_${Date.now()}`,
      type: 'model',
      prompt,
      description: `Generated for ${context.thread.type} story, chapter ${context.chapterIndex}`,
      filePath: modelPath,
      tags: [context.thread.type, `chapter${context.chapterIndex}`, 'meshy-generated'],
      metadata: {
        meshyTaskId: task.id,
        artStyle: this.selectArtStyle(context),
        polyCount: 5000
      }
    });

    return modelPath;
  }

  /**
   * Select art style based on story context
   */
  private selectArtStyle(context: SceneGenerationContext): 'realistic' | 'cartoon' | 'low-poly' | 'sculpture' | 'pbr' {
    // A story: More mythical/realistic
    if (context.thread.type === 'A') {
      return 'pbr';
    }
    
    // B story: Age-appropriate
    if (context.thread.type === 'B') {
      if (context.thread.ageRange === 'child') return 'cartoon';
      if (context.thread.ageRange === 'teen') return 'low-poly';
      return 'realistic';
    }
    
    // C story: Dark/mysterious
    return 'realistic';
  }

  /**
   * Download asset from URL
   */
  private async downloadAsset(url: string, type: string): Promise<string> {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();

    const ext = type === 'model' ? '.glb' : '.png';
    const filename = `${type}_${Date.now()}${ext}`;
    const filepath = path.join(this.outputDirectory, filename);

    fs.writeFileSync(filepath, Buffer.from(buffer));

    return filepath;
  }

  /**
   * Compose final scene RWMD
   */
  private async composeScene(
    structure: any,
    reusedAssets: Map<string, string>,
    generatedAssets: string[]
  ): Promise<any> {
    // Merge asset references into scene structure
    // This would map prompts to actual file paths

    return structure;
  }

  /**
   * Generate entire story thread (A, B, or C)
   */
  async generateStoryThread(
    thread: StoryThread,
    onProgress?: (scene: number, total: number, progress: GenerationProgress) => void
  ): Promise<string[]> {
    const generatedScenes: string[] = [];

    for (let i = 0; i < thread.chapters.length; i++) {
      const chapterIndex = thread.chapters[i];

      const context: SceneGenerationContext = {
        thread,
        chapterIndex,
        previousScenes: generatedScenes,
        creativeDirection: this.getCreativeDirection(thread, chapterIndex),
        existingAssets: [] // Would load from asset library
      };

      const sceneResult = await this.generateScene(
        context,
        (progress) => onProgress?.(i + 1, thread.chapters.length, progress)
      );

      // Save scene RWMD
      const scenePath = path.join(
        this.outputDirectory,
        `${thread.type}_chapter${chapterIndex}_${sceneResult.sceneData.id}.rwmd`
      );

      // Convert to RWMD format and save
      // (would need RWMD writer)

      generatedScenes.push(scenePath);
    }

    return generatedScenes;
  }

  /**
   * Get creative direction for specific chapter
   */
  private getCreativeDirection(thread: StoryThread, chapterIndex: number): string {
    // This would load from a creative direction database/file
    // For now, return a template
    return `Generate scene ${chapterIndex} for ${thread.type} story thread: ${thread.description}`;
  }

  /**
   * Close all connections
   */
  close(): void {
    this.assetLibrary.close();
  }
}
