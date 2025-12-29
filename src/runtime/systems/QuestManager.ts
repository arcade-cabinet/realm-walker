/**
 * QuestManager - Boolean flag-based quest progression system
 * No numerical stats, everything is quest state
 */

import { QuestState } from '../../types/GameState';
import { Quest } from '../../types/Quest';

export class QuestManager {
  private state: QuestState;
  private quests: Map<string, Quest> = new Map();
  private listeners: Map<string, Array<(data: any) => void>> = new Map();

  constructor(initialState?: Partial<QuestState>) {
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
   * Get all registered quests
   */
  getAllQuests(): Quest[] {
    return Array.from(this.quests.values());
  }

  /**
   * Get all active quest definitions
   */
  getActiveQuests(): Quest[] {
    return this.state.activeQuests
      .map(id => this.quests.get(id))
      .filter((q): q is Quest => q !== undefined);
  }

  /**
   * Simple event listener
   */
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  /**
   * Emit an event
   */
  private emit(event: string, data: any): void {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  /**
   * Set a story flag (defaults to true)
   */
  setFlag(flag: string, value: boolean = true): void {
    this.state.storyFlags[flag] = value;
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
    if (this.isQuestCompleted(questId)) {
      return false;
    }
    if (!this.state.activeQuests.includes(questId)) {
      this.state.activeQuests.push(questId);
      return true;
    }
    return false;
  }

  /**
   * Complete a quest
   */
  completeQuest(questId: string): void {
    const index = this.state.activeQuests.indexOf(questId);
    if (index !== -1) {
      this.state.activeQuests.splice(index, 1);
    }
    if (!this.state.completedQuests.includes(questId)) {
      this.state.completedQuests.push(questId);
      const quest = this.quests.get(questId);
      if (quest) {
        this.emit('quest-completed', quest);
      }
    }
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
   * Check if an objective is complete (based on its flag)
   */
  isObjectiveComplete(questId: string, objectiveFlag: string): boolean {
    return this.hasFlag(objectiveFlag);
  }

  /**
   * Get a quest's current state (simplified)
   */
  getQuest(questId: string): { id: string; active: boolean; completed: boolean } | undefined {
    const active = this.isQuestActive(questId);
    const completed = this.isQuestCompleted(questId);
    
    if (active || completed) {
      return { id: questId, active, completed };
    }
    return undefined;
  }

  /**
   * Update quest state based on flags
   */
  updateQuest(questId: string): void {
    const quest = this.quests.get(questId);
    if (!quest || !this.isQuestActive(questId)) return;

    let changed = false;
    for (const obj of quest.objectives) {
      if (!obj.completed) {
        const flag = obj.flagToSet || obj.id;
        if (this.hasFlag(flag)) {
          obj.completed = true;
          changed = true;
          this.emit('quest-objective-completed', { questId, objectiveId: obj.id });
        }
      }
    }

    if (changed) {
      if (quest.objectives.every(obj => obj.completed)) {
        this.completeQuest(questId);
      }
    }
  }
    if (!this.isQuestActive(questId)) {
      return false;
    }
    
    const quest = this.quests.get(questId);
    if (!quest) return false;

    const objective = quest.objectives.find(o => o.id === objectiveId);
    if (!objective) return false;

    const flagToSet = objective.flagToSet || objectiveId;
    this.setFlag(flagToSet, true);
    objective.completed = true;

    this.emit('quest-objective-completed', { questId, objectiveId });
    
    // Check if all objectives for this quest are complete
    if (quest.objectives.every(obj => obj.completed || (obj.flagToSet && this.hasFlag(obj.flagToSet)))) {
      this.completeQuest(questId);
    }
    
    return true;
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
