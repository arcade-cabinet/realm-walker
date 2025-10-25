/**
 * SceneLoader - Orchestrates scene loading, caching, and transitions
 * Manages the complete scene loading pipeline and asset lifecycle
 */

import { SceneCompositor } from '../systems/SceneCompositor';
import { StoryCompositor } from '../systems/StoryCompositor';
import { GameCompositor } from '../systems/GameCompositor';
import { RWMDParser } from '../parsers/RWMDParser';
import { StoryBindingLoader } from './StoryBindingLoader';
import { SceneData, StoryData, ComposedScene, GameViewport, QuestFlags } from '../../types';
import * as fs from 'fs';
import * as path from 'path';

export interface LoadedScene {
  sceneData: SceneData;
  storyData: StoryData;
  composedScene: ComposedScene;
  viewport: GameViewport;
  timestamp: number;
}

export interface SceneLoadOptions {
  preloadAdjacent?: boolean;
  useCache?: boolean;
  transitionEffect?: 'fade' | 'instant';
  transitionDuration?: number;
}

export class SceneLoader {
  private sceneCompositor: SceneCompositor;
  private storyCompositor: StoryCompositor;
  private gameCompositor: GameCompositor;
  
  // Caching
  private sceneCache: Map<string, LoadedScene> = new Map();
  private maxCacheSize: number = 5; // Keep last 5 scenes in memory
  
  // Current state
  private currentSceneId: string | null = null;
  private adjacentScenes: Set<string> = new Set();

  constructor(initialFlags: QuestFlags = {}) {
    this.sceneCompositor = new SceneCompositor();
    this.storyCompositor = new StoryCompositor(initialFlags);
    this.gameCompositor = new GameCompositor();
  }

  /**
   * Load a scene by ID with optional caching and preloading
   */
  async loadScene(
    sceneId: string, 
    scenePath: string,
    storyPath: string,
    options: SceneLoadOptions = {}
  ): Promise<GameViewport> {
    const {
      useCache = true,
      preloadAdjacent = false,
      transitionEffect = 'instant',
      transitionDuration = 300
    } = options;

    // Check cache first
    if (useCache && this.sceneCache.has(sceneId)) {
      console.log(`Loading scene ${sceneId} from cache`);
      const cached = this.sceneCache.get(sceneId)!;
      
      // Recompose with current story state
      const activeContent = this.storyCompositor.compose(cached.storyData);
      const viewport = await this.gameCompositor.compose(cached.composedScene, activeContent);
      
      this.currentSceneId = sceneId;
      return viewport;
    }

    // Load scene from files
    console.log(`Loading scene ${sceneId} from disk`);
    const sceneData = await this.loadSceneData(scenePath);
    const storyData = await this.loadStoryData(storyPath);

    // Compose through all three layers
    const composedScene = this.sceneCompositor.compose(sceneData);
    const activeContent = this.storyCompositor.compose(storyData);
    const viewport = await this.gameCompositor.compose(composedScene, activeContent);

    // Cache the scene
    this.cacheScene(sceneId, {
      sceneData,
      storyData,
      composedScene,
      viewport,
      timestamp: Date.now()
    });

    this.currentSceneId = sceneId;

    // Preload adjacent scenes if requested
    if (preloadAdjacent) {
      this.preloadAdjacentScenes(storyData);
    }

    return viewport;
  }

  /**
   * Load scene data from RWMD file
   */
  private async loadSceneData(scenePath: string): Promise<SceneData> {
    try {
      const content = fs.readFileSync(scenePath, 'utf-8');
      const parsed = RWMDParser.parseString(content);
      return parsed.scene;
    } catch (error) {
      throw new Error(`Failed to load scene from ${scenePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Load story data from JSON file
   * Supports both StoryBinding format and legacy StoryData format
   */
  private async loadStoryData(storyPath: string): Promise<StoryData> {
    try {
      const content = fs.readFileSync(storyPath, 'utf-8');
      const parsed = JSON.parse(content);
      
      // Check if this is a StoryBinding (has scene_id, npc_placements, etc.)
      if ('scene_id' in parsed && ('npc_placements' in parsed || 'prop_placements' in parsed || 'door_states' in parsed)) {
        console.log(`Loading StoryBinding format from ${storyPath}`);
        return StoryBindingLoader.bindingToStoryData(parsed);
      }
      
      // Otherwise treat as legacy StoryData
      console.log(`Loading legacy StoryData format from ${storyPath}`);
      return parsed as StoryData;
    } catch (error) {
      throw new Error(`Failed to load story from ${storyPath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Cache a loaded scene with LRU eviction
   */
  private cacheScene(sceneId: string, scene: LoadedScene): void {
    // If cache is full, remove oldest scene
    if (this.sceneCache.size >= this.maxCacheSize) {
      let oldestId: string | null = null;
      let oldestTime = Infinity;

      for (const [id, cached] of this.sceneCache.entries()) {
        if (cached.timestamp < oldestTime) {
          oldestTime = cached.timestamp;
          oldestId = id;
        }
      }

      if (oldestId) {
        console.log(`Evicting scene ${oldestId} from cache`);
        this.sceneCache.delete(oldestId);
      }
    }

    this.sceneCache.set(sceneId, scene);
  }

  /**
   * Preload adjacent scenes for faster transitions
   */
  private preloadAdjacentScenes(storyData: StoryData): void {
    // Extract target scenes from door slots
    const adjacentIds = new Set<string>();
    
    for (const content of storyData.slotContents) {
      // Look for door/portal slots that might have target scenes
      // This is a simplified version - real implementation would parse door definitions
      if (content.slotId.includes('door') || content.slotId.includes('portal')) {
        // TODO: Extract target scene IDs from door definitions
        // For now, just mark as adjacent for future preloading
      }
    }

    this.adjacentScenes = adjacentIds;
  }

  /**
   * Clear scene cache
   */
  clearCache(): void {
    this.sceneCache.clear();
    console.log('Scene cache cleared');
  }

  /**
   * Get current scene ID
   */
  getCurrentSceneId(): string | null {
    return this.currentSceneId;
  }

  /**
   * Check if scene is cached
   */
  isCached(sceneId: string): boolean {
    return this.sceneCache.has(sceneId);
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.sceneCache.size;
  }

  /**
   * Update quest flags and recompose current scene
   */
  async setFlag(flag: string, value: boolean): Promise<void> {
    this.storyCompositor.setFlag(flag, value);
    
    if (this.currentSceneId && this.sceneCache.has(this.currentSceneId)) {
      const cached = this.sceneCache.get(this.currentSceneId)!;
      const activeContent = this.storyCompositor.compose(cached.storyData);
      await this.gameCompositor.compose(cached.composedScene, activeContent);
    }
  }

  /**
   * Get all compositor instances
   */
  getCompositors() {
    return {
      scene: this.sceneCompositor,
      story: this.storyCompositor,
      game: this.gameCompositor
    };
  }
}
