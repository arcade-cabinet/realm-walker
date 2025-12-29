/**
 * QuestManager - Boolean flag-based quest progression system
 * Supports full quest definitions, objectives, and event emitting
 */

import { QuestState } from '../../types/GameState';
import { EventEmitter } from 'events';
import { Quest, QuestObjective } from '../../types/Quest';

<<<<<<< HEAD
export class QuestManager extends EventEmitter {
  private state: QuestState;
  private quests: Map<string, Quest> = new Map();
=======
export interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
  requiredFlags?: string[];
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  requiredFlags?: string[];
  completedFlags?: string[];
  thread?: 'A' | 'B' | 'C';
  completed: boolean;
}

type Listener = (...args: any[]) => void;

export class QuestManager {
  private state: QuestState;
  private quests: Map<string, Quest> = new Map();
  private listeners: Map<string, Listener[]> = new Map();
>>>>>>> fix/issue-16

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
<<<<<<< HEAD
   * Add a quest definition
   */
  addQuest(quest: Quest): void {
    this.quests.set(quest.id, quest);
    // Auto-start if required flags met
    if (quest.requiredFlags && quest.requiredFlags.every((f: string) => this.hasFlag(f))) {
      this.startQuest(quest.id);
    }
  }

  /**
   * Get all registered quests
   */
  getAllQuests(): Quest[] {
    return Array.from(this.quests.values());
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
   * Update quest progress based on current flags
   */
  updateQuest(questId: string): void {
    const quest = this.quests.get(questId);
    if (!quest || quest.completed) return;

    let changed = false;
    if (quest.objectives) {
      for (const obj of quest.objectives) {
        if (!obj.completed) {
          const flag = obj.flagToSet || obj.id;
          // Check if either the specific requirement flags are met OR the target flag is set
          const requirementsMet = obj.requiredFlags ? obj.requiredFlags.every(f => this.hasFlag(f)) : false;
          if (this.hasFlag(flag) || requirementsMet) {
            obj.completed = true;
            changed = true;
            this.emit('quest-objective-completed', obj);
          }
        }
      }

      // Check if all objectives complete
      if (quest.objectives.every((obj: any) => obj.completed)) {
        // Also check if any quest-level completion flags are met
        const completedFlagsMet = quest.completedFlags ? quest.completedFlags.every(f => this.hasFlag(f)) : true;
        if (completedFlagsMet) {
          this.completeQuest(questId);
        }
      }
    }
  }

  /**
   * Set a story flag (defaults to true)
   */
  setFlag(flag: string, value: boolean = true): void {
    this.state.storyFlags[flag] = value;
    this.emit('flag-changed', { flag, value });
    
    // Check all active quests for updates
    this.state.activeQuests.forEach(id => this.updateQuest(id));
=======
   * Event listener support
   */
  on(event: string, listener: Listener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  private emit(event: string, ...args: any[]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(l => l(...args));
    }
>>>>>>> fix/issue-16
  }

  /**
   * Add a quest definition
   */
  addQuest(quest: Quest): void {
    this.quests.set(quest.id, quest);
    // If it should be active based on flags, start it
    if (quest.requiredFlags && quest.requiredFlags.every(f => this.hasFlag(f))) {
      this.startQuest(quest.id);
    }
  }

  /**
   * Start a new quest
   */
  startQuest(questId: string): boolean {
    if (!this.state.activeQuests.includes(questId)) {
      this.state.activeQuests.push(questId);
      const quest = this.quests.get(questId);
      if (quest) {
        this.emit('quest-started', quest);
      }
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
      const quest = this.quests.get(questId);
      if (quest) {
        quest.completed = true;
        this.emit('quest-completed', quest);
<<<<<<< HEAD
      }
      return true;
=======
        
        // Set completion flags if any
        if (quest.completedFlags) {
          quest.completedFlags.forEach(f => this.setFlag(f, true));
        }
      }
>>>>>>> fix/issue-16
    }
    return false;
  }

  /**
   * Update quest progress based on flags
   */
  updateQuest(questId: string): void {
    const quest = this.quests.get(questId);
    if (!quest || quest.completed) return;

    let changed = false;
    for (const obj of quest.objectives) {
      if (!obj.completed && obj.requiredFlags && obj.requiredFlags.every(f => this.hasFlag(f))) {
        obj.completed = true;
        changed = true;
        this.emit('quest-objective-completed', obj);
      }
    }

    if (changed) {
      // Check if all objectives complete
      if (quest.objectives.every(o => o.completed)) {
        this.completeQuest(questId);
      }
    }
  }

  /**
   * Complete an objective directly
   */
  completeObjective(questId: string, objectiveId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest) return false;

    const objective = quest.objectives.find(o => o.id === objectiveId);
    if (objective && !objective.completed) {
      objective.completed = true;
      this.emit('quest-objective-completed', objective);
      
      if (quest.objectives.every(o => o.completed)) {
        this.completeQuest(questId);
      }
      return true;
    }
    return false;
  }

  /**
   * Set a story flag
   */
  setFlag(flag: string, value: boolean = true): void {
    this.state.storyFlags[flag] = value;
    // Check all active quests for progress
    this.state.activeQuests.forEach(id => this.updateQuest(id));
  }

  /**
   * Check if a flag is set
   */
  hasFlag(flag: string): boolean {
    return this.state.storyFlags[flag] === true;
  }

  /**
   * Get quest by ID
   */
  getQuest(questId: string): Quest | undefined {
    return this.quests.get(questId);
  }

  /**
   * Get all active quests
   */
  getActiveQuests(): Quest[] {
    return this.state.activeQuests
      .map(id => this.quests.get(id))
      .filter((q): q is Quest => q !== undefined);
  }

  /**
   * Check if quest is active
   */
  isQuestActive(questId: string): boolean {
    return this.state.activeQuests.includes(questId);
  }

  /**
   * Check if quest is completed
<<<<<<< HEAD
   */
  isQuestCompleted(questId: string): boolean {
    return this.state.completedQuests.includes(questId);
  }

  /**
   * Complete a quest objective manually
   */
  completeObjective(questId: string, objectiveId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest) return false;

    const objective = quest.objectives.find(o => o.id === objectiveId);
    if (objective && !objective.completed) {
      objective.completed = true;
      this.emit('quest-objective-completed', objective);
      
      const flagToSet = objective.flagToSet || objective.id;
      this.setFlag(flagToSet, true);

      if (quest.objectives.every(o => o.completed)) {
        this.completeQuest(questId);
      }
      return true;
    }
    return false;
  }

  /**
   * Check if objective is complete
   */
  isObjectiveComplete(questId: string, objectiveId: string): boolean {
    const quest = this.quests.get(questId);
    const obj = quest?.objectives.find(o => o.id === objectiveId);
    return obj?.completed === true || this.hasFlag(obj?.flagToSet || objectiveId);
  }

  /**
   * Get quest by ID
   */
  getQuest(questId: string): Quest | undefined {
    return this.quests.get(questId);
  }

  /**
   * Check if scene can be accessed based on required flags
=======
>>>>>>> fix/issue-16
   */
  isQuestCompleted(questId: string): boolean {
    return this.state.completedQuests.includes(questId);
  }

  /**
   * Check if objective is complete
   */
  isObjectiveComplete(questId: string, objectiveId: string): boolean {
    const quest = this.quests.get(questId);
    return quest?.objectives.find(o => o.id === objectiveId)?.completed === true;
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
   * Reset all quest state
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

  // Other progression methods
  incrementAStory(): void { this.state.aStoryProgress++; }
  incrementBStory(): void { this.state.bStoryProgress++; }
  incrementCStory(): void { this.state.cStoryProgress++; }

  canAccessScene(sceneId: string, requiredFlags?: string[]): boolean {
    if (!requiredFlags || requiredFlags.length === 0) return true;
    return requiredFlags.every(flag => this.hasFlag(flag));
  }

  /**
   * Export state as JSON (Required for tests)
   */
  exportToJSON(): string {
    return JSON.stringify(this.state, null, 2);
  }

  /**
   * Import state from JSON (Required for tests)
   */
  importFromJSON(json: string): void {
    const parsed = JSON.parse(json);
    this.loadState(parsed);
  }
}
