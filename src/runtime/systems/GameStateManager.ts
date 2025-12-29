/**
 * GameStateManager - Handles game state persistence and save/load
 * Manages quest flags, progress, and scene state
 */

import { QuestState } from '../../types/GameState';
import { GridPosition } from '../../types/GridSystem';
import { QuestManager } from './QuestManager';
import * as fs from 'fs';
import * as path from 'path';

export interface SaveData {
  version: string;
  timestamp: number;
  currentSceneId: string | null;
  currentChapter: number;
  questState: QuestState;
  playerData: {
    position?: GridPosition;
    lastCheckpoint?: string;
  };
  metadata: {
    playTime: number;
    saveSlot: number;
    description?: string;
  };
}

export class GameStateManager {
  private questManager: QuestManager;
  private currentSceneId: string | null = null;
  private currentChapter: number = 0;
  private playStartTime: number;
  private saveDirectory: string;

  constructor(questManager: QuestManager, saveDirectory: string = './saves') {
    this.questManager = questManager;
    this.saveDirectory = saveDirectory;
    this.playStartTime = Date.now();

    // Ensure save directory exists
    this.ensureSaveDirectory();
  }

  /**
   * Ensure save directory exists
   */
  private ensureSaveDirectory(): void {
    if (!fs.existsSync(this.saveDirectory)) {
      fs.mkdirSync(this.saveDirectory, { recursive: true });
      console.log(`Created save directory: ${this.saveDirectory}`);
    }
  }

  /**
   * Save game state to file
   */
  save(slot: number, description?: string): string {
    const saveData: SaveData = {
      version: '1.0.0',
      timestamp: Date.now(),
      currentSceneId: this.currentSceneId,
      currentChapter: this.currentChapter,
      questState: this.questManager.getState(),
      playerData: {
        lastCheckpoint: this.currentSceneId || undefined
      },
      metadata: {
        playTime: Date.now() - this.playStartTime,
        saveSlot: slot,
        description
      }
    };

    const filename = `save_slot_${slot}.json`;
    const filepath = path.join(this.saveDirectory, filename);

    try {
      fs.writeFileSync(filepath, JSON.stringify(saveData, null, 2), 'utf-8');
      console.log(`Game saved to slot ${slot}: ${filepath}`);
      return filepath;
    } catch (error) {
      throw new Error(`Failed to save game: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Load game state from file
   */
  load(slot: number): SaveData {
    const filename = `save_slot_${slot}.json`;
    const filepath = path.join(this.saveDirectory, filename);

    if (!fs.existsSync(filepath)) {
      throw new Error(`Save file not found: ${filepath}`);
    }

    try {
      const content = fs.readFileSync(filepath, 'utf-8');
      const saveData: SaveData = JSON.parse(content);

      // Validate save data structure
      if (!saveData.version || !saveData.questState) {
        throw new Error('Invalid save file structure');
      }

      // Restore quest state
      this.questManager.loadState(saveData.questState);
      this.currentSceneId = saveData.currentSceneId;
      this.currentChapter = saveData.currentChapter || 0;

      console.log(`Game loaded from slot ${slot}: ${filepath}`);
      return saveData;
    } catch (error) {
      throw new Error(`Failed to load game: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Set current chapter
   */
  setCurrentChapter(chapter: number): void {
    this.currentChapter = chapter;
    console.log(`Setting current chapter to: ${chapter}`);
  }

  /**
   * Get current chapter
   */
  getCurrentChapter(): number {
    return this.currentChapter;
  }

  /**
   * Set current scene ID
   */
  setCurrentScene(sceneId: string): void {
    this.currentSceneId = sceneId;
  }

  /**
   * Get current scene ID
   */
  getCurrentScene(): string | null {
    return this.currentSceneId;
  }

  /**
   * Other methods...
   */
  hasSave(slot: number): boolean {
    return fs.existsSync(path.join(this.saveDirectory, `save_slot_${slot}.json`));
  }

  quickSave(): string {
    return this.save(0, 'Quick Save');
  }

  quickLoad(): SaveData {
    return this.load(0);
  }
}
