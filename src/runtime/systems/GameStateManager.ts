/**
 * GameStateManager - Handles game state persistence and save/load
 * Manages quest flags, progress, and scene state
 */

import { QuestState } from '../../types/GameState';
import { QuestManager } from './QuestManager';
import * as fs from 'fs';
import * as path from 'path';

export interface SaveData {
  version: string;
  timestamp: number;
  currentSceneId: string | null;
  questState: QuestState;
  playerData: {
    position?: [number, number];
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

      console.log(`Game loaded from slot ${slot}: ${filepath}`);
      return saveData;
    } catch (error) {
      throw new Error(`Failed to load game: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if a save slot exists
   */
  hasSave(slot: number): boolean {
    const filename = `save_slot_${slot}.json`;
    const filepath = path.join(this.saveDirectory, filename);
    return fs.existsSync(filepath);
  }

  /**
   * Get save file info without loading full state
   */
  getSaveInfo(slot: number): Partial<SaveData> | null {
    const filename = `save_slot_${slot}.json`;
    const filepath = path.join(this.saveDirectory, filename);

    if (!fs.existsSync(filepath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(filepath, 'utf-8');
      const saveData: SaveData = JSON.parse(content);

      return {
        version: saveData.version,
        timestamp: saveData.timestamp,
        currentSceneId: saveData.currentSceneId,
        metadata: saveData.metadata
      };
    } catch (error) {
      console.error(`Failed to read save info for slot ${slot}:`, error);
      return null;
    }
  }

  /**
   * List all available save slots
   */
  listSaves(): number[] {
    const slots: number[] = [];

    try {
      const files = fs.readdirSync(this.saveDirectory);
      
      for (const file of files) {
        const match = file.match(/^save_slot_(\d+)\.json$/);
        if (match) {
          slots.push(parseInt(match[1], 10));
        }
      }

      return slots.sort((a, b) => a - b);
    } catch (error) {
      console.error('Failed to list saves:', error);
      return [];
    }
  }

  /**
   * Delete a save file
   */
  deleteSave(slot: number): boolean {
    const filename = `save_slot_${slot}.json`;
    const filepath = path.join(this.saveDirectory, filename);

    if (!fs.existsSync(filepath)) {
      return false;
    }

    try {
      fs.unlinkSync(filepath);
      console.log(`Deleted save slot ${slot}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete save slot ${slot}:`, error);
      return false;
    }
  }

  /**
   * Create a quick save (uses slot 0)
   */
  quickSave(): string {
    return this.save(0, 'Quick Save');
  }

  /**
   * Load quick save (slot 0)
   */
  quickLoad(): SaveData {
    return this.load(0);
  }

  /**
   * Create an auto-save (uses negative slot numbers)
   */
  autoSave(checkpointName: string): string {
    // Use negative slot numbers for auto-saves to avoid conflicts
    const autoSaveSlot = -Math.abs(Date.now() % 1000);
    return this.save(autoSaveSlot, `Auto-save: ${checkpointName}`);
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
   * Export save to JSON string (for cloud saves, etc.)
   */
  exportSave(slot: number): string {
    const filename = `save_slot_${slot}.json`;
    const filepath = path.join(this.saveDirectory, filename);

    if (!fs.existsSync(filepath)) {
      throw new Error(`Save file not found: ${filepath}`);
    }

    return fs.readFileSync(filepath, 'utf-8');
  }

  /**
   * Import save from JSON string
   */
  importSave(slot: number, jsonData: string): void {
    try {
      // Validate JSON
      const saveData: SaveData = JSON.parse(jsonData);
      
      if (!saveData.version || !saveData.questState) {
        throw new Error('Invalid save data');
      }

      // Write to file
      const filename = `save_slot_${slot}.json`;
      const filepath = path.join(this.saveDirectory, filename);
      fs.writeFileSync(filepath, jsonData, 'utf-8');

      console.log(`Imported save to slot ${slot}`);
    } catch (error) {
      throw new Error(`Failed to import save: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
