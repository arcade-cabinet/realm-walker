/**
 * QuestManager - Boolean flag-based quest progression system
 * No numerical stats, everything is quest state
 */

import { QuestState } from '../../types/GameState';
import { EventEmitter } from 'events';

export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  requiredFlags: string[];
  completedFlags: string[];
  thread: 'A' | 'B' | 'C';
  completed: boolean;
}

export interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
  requiredFlags: string[];
}

export class QuestManager extends EventEmitter {
  private state: QuestState;
  private quests: Map<string, Quest> = new Map();

  constructor(initialState?: Partial<QuestState>) {
    super();
    this.state = {
      storyFlags: initialState?.storyFlags || {},
      activeQuests: initialState?.activeQuests || [],
      completedQuests: initialState?.completedQuests || [],
      aStoryProgress: initialState?.aStoryProgress || 0,
      bStoryProgress: initialState?.bStoryProgress || 0,
      cStoryProgress: initialState?.cStoryProgress || 0
    };
  }

  /**
   * Register a quest definition
   */
  addQuest(quest: Quest): void {
    this.quests.set(quest.id, quest);
  }

  /**
   * Get all active quests as objects
   */
  getActiveQuests(): Quest[] {
    return this.state.activeQuests
      .map(id => this.quests.get(id))
      .filter((q): q is Quest => q !== undefined);
  }

  /**
   * Update quest state based on current flags
   */
  updateQuest(questId: string): void {
    const quest = this.quests.get(questId);
    if (!quest || quest.completed) return;

    // Update objectives
    let allObjectivesComplete = true;
    for (const obj of quest.objectives) {
      if (!obj.completed) {
        const met = obj.requiredFlags.every(f => this.hasFlag(f));
        if (met) {
          obj.completed = true;
          this.emit('quest-objective-completed', obj);
        } else {
          allObjectivesComplete = false;
        }
      }
    }

    // Check if quest complete
    if (allObjectivesComplete && quest.completedFlags.every(f => this.hasFlag(f))) {
      this.completeQuest(questId);
    }
  }

  /**
   * Set a story flag (defaults to true)
   */
  setFlag(flag: string, value: boolean = true): void {
    this.state.storyFlags[flag] = value;
    this.emit('flag-changed', { flag, value });
    
    // Auto-update quests when flags change
    this.state.activeQuests.forEach(id => this.updateQuest(id));
  }

  /**
   * Check if a flag is set
   */
  hasFlag(flag: string): boolean {
    return this.state.storyFlags[flag] === true;
  }

  /**
   * Start a new quest
   */
  startQuest(questId: string): boolean {
    if (!this.state.activeQuests.includes(questId)) {
      this.state.activeQuests.push(questId);
      return true;
    }
    return false;
  }

  /**
   * Complete a quest
   */
  completeQuest(questId: string): boolean {
    const index = this.state.activeQuests.indexOf(questId);
    if (index !== -1) {
      this.state.activeQuests.splice(index, 1);
    }
    if (!this.state.completedQuests.includes(questId)) {
      this.state.completedQuests.push(questId);
      return true;
    }
    return false;
  }

  /**
   * Check if quest is active
   */
  isQuestActive(questId: string): boolean {
    return this.state.activeQuests.includes(questId);
  }

  /**
   * Check if quest is completed
   */
  isQuestCompleted(questId: string): boolean {
    return this.state.completedQuests.includes(questId);
  }

  /**
   * Complete a quest objective
   */
  completeObjective(questId: string, objectiveKey: string): boolean {
    const flag = `${questId}_obj_${objectiveKey}`;
    if (!this.hasFlag(flag)) {
      this.setFlag(flag, true);
      return true;
    }
    return false;
  }

  /**
   * Check if objective is complete
   */
  isObjectiveComplete(questId: string, objectiveKey: string): boolean {
    return this.hasFlag(`${questId}_obj_${objectiveKey}`);
  }

  /**
   * Get quest by ID (mock for now as there's no quest database)
   */
  getQuest(questId: string): any {
    return null;
  }

  /**
   * Check if scene can be accessed based on required flags
   */
  canAccessScene(sceneId: string, requiredFlags?: string[]): boolean {
    if (!requiredFlags || requiredFlags.length === 0) {
      return true;
    }
    return requiredFlags.every(flag => this.hasFlag(flag));
  }

  /**
   * Get current quest state
   */
  getState(): QuestState {
    return {
      storyFlags: { ...this.state.storyFlags },
      activeQuests: [...this.state.activeQuests],
      completedQuests: [...this.state.completedQuests],
      aStoryProgress: this.state.aStoryProgress,
      bStoryProgress: this.state.bStoryProgress,
      cStoryProgress: this.state.cStoryProgress
    };
  }

  /**
   * Load quest state
   */
  loadState(state: QuestState): void {
    this.state = {
      storyFlags: { ...state.storyFlags },
      activeQuests: [...state.activeQuests],
      completedQuests: [...state.completedQuests],
      aStoryProgress: state.aStoryProgress,
      bStoryProgress: state.bStoryProgress,
      cStoryProgress: state.cStoryProgress
    };
  }

  /**
   * Increment A story progress (Guardian boons)
   */
  incrementAStory(): void {
    this.state.aStoryProgress++;
  }

  /**
   * Increment B story progress (Faction allies)
   */
  incrementBStory(): void {
    this.state.bStoryProgress++;
  }

  /**
   * Increment C story progress (Ravens encounters)
   */
  incrementCStory(): void {
    this.state.cStoryProgress++;
  }

  /**
   * Export state as JSON
   */
  exportToJSON(): string {
    return JSON.stringify(this.state, null, 2);
  }

  /**
   * Import state from JSON
   */
  importFromJSON(json: string): void {
    const parsed = JSON.parse(json);
    this.loadState(parsed);
  }

  /**
   * Reset all quest state to initial values
   */
  reset(): void {
    this.state = {
      storyFlags: {},
      activeQuests: [],
      completedQuests: [],
      aStoryProgress: 0,
      bStoryProgress: 0,
      cStoryProgress: 0
    };
  }
}
