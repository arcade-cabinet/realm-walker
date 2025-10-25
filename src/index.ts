/**
 * Main entry point for Realm Walker Story
 * Exports all public APIs
 */

// Export types
export * from './types';

// Export runtime systems
export * from './runtime';

// Main orchestrator class
import { SceneCompositor, StoryCompositor, GameCompositor, QuestFlagSystem } from './runtime/systems';
import { RWMDParser } from './runtime/parsers';
import { SceneData, StoryData, QuestFlags } from './types';

export class RealmWalker {
  private sceneCompositor: SceneCompositor;
  private storyCompositor: StoryCompositor;
  private gameCompositor: GameCompositor;
  private questFlagSystem: QuestFlagSystem;

  constructor(initialFlags: QuestFlags = {}) {
    this.sceneCompositor = new SceneCompositor();
    this.storyCompositor = new StoryCompositor(initialFlags);
    this.gameCompositor = new GameCompositor();
    this.questFlagSystem = new QuestFlagSystem(initialFlags);
  }

  /**
   * Load and compose a complete game scene
   */
  async loadScene(sceneData: SceneData, storyData: StoryData): Promise<void> {
    // Tier 1: Scene composition - builds geometry and empty slots
    const composedScene = this.sceneCompositor.compose(sceneData);

    // Tier 2: Story composition - determines which slots to fill based on flags
    const activeContent = this.storyCompositor.compose(storyData);

    // Tier 3: Game composition - renders final scene with models
    await this.gameCompositor.compose(composedScene, activeContent);
  }

  /**
   * Parse RWMD scene file
   */
  parseRWMD(content: string): SceneData {
    const parsed = RWMDParser.parseString(content);
    return parsed.scene;
  }

  /**
   * Set a quest flag and recompose story
   */
  setFlag(flag: string, value: boolean, storyData: StoryData): void {
    this.storyCompositor.setFlag(flag, value);
    this.questFlagSystem.setFlag(flag, value);
    
    // Recompose story with new flags
    const composedScene = this.sceneCompositor.compose({ 
      id: storyData.sceneId, 
      name: '', 
      geometry: [], 
      slots: [] 
    } as SceneData);
    const activeContent = this.storyCompositor.compose(storyData);
  }

  /**
   * Get compositore instances for direct access
   */
  getCompositors() {
    return {
      scene: this.sceneCompositor,
      story: this.storyCompositor,
      game: this.gameCompositor,
      questFlags: this.questFlagSystem
    };
  }

  /**
   * Get the Three.js scene
   */
  getScene() {
    return this.gameCompositor.getScene();
  }

  /**
   * Get the camera
   */
  getCamera() {
    return this.gameCompositor.getCamera();
  }
}
