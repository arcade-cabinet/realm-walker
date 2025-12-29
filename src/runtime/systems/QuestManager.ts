/**
 * QuestManager - Boolean flag-based quest progression system
 * No numerical stats, everything is quest state
 */

import { QuestState } from '../../types/GameState';

export class QuestManager {
  private state: QuestState;
  private quests: Record<string, any> = {};
  private listeners: Record<string, ((data: any) => void)[]> = {};

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
   * Register event listener
   */
  on(event: string, listener: (data: any) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  /**
   * Emit event
   */
  private emit(event: string, data: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(l => l(data));
    }
  }

  /**
   * Add a quest definition
   */
  addQuest(quest: any): void {
    this.quests[quest.id] = quest;
    // Auto-start if required flags met
    if (quest.requiredFlags && quest.requiredFlags.every((f: string) => this.hasFlag(f))) {
      this.startQuest(quest.id);
    }
  }

  /**
   * Get all active quests
   */
  getActiveQuests(): any[] {
    return this.state.activeQuests
      .map(id => ({ ...this.quests[id], completed: false }))
      .filter(q => q.id !== undefined);
  }

  /**
   * Update quest progress based on current flags
   */
  updateQuest(questId: string): void {
    const quest = this.quests[questId];
    if (!quest || this.isQuestCompleted(questId)) return;

    let changed = false;
    if (quest.objectives) {
      for (const obj of quest.objectives) {
        if (!obj.completed && obj.requiredFlags && obj.requiredFlags.every((f: string) => this.hasFlag(f))) {
          obj.completed = true;
          changed = true;
          this.emit('quest-objective-completed', obj);
        }
      }

      // Check if all objectives complete
      if (quest.objectives.every((obj: any) => obj.completed)) {
        this.completeQuest(questId);
      }
    }
  }

  /**
   * Set a story flag (defaults to true)
   */
  setFlag(flag: string, value: boolean = true): void {
    this.state.storyFlags[flag] = value;
    // Check all quests for updates
    Object.keys(this.quests).forEach(id => this.updateQuest(id));
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
  completeQuest(questId: string): void {
    const index = this.state.activeQuests.indexOf(questId);
    if (index !== -1) {
      this.state.activeQuests.splice(index, 1);
    }
    if (!this.state.completedQuests.includes(questId)) {
      this.state.completedQuests.push(questId);
      this.emit('quest-completed', this.quests[questId] || { id: questId, title: questId });
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
   * Get quest info (placeholder)
   */
  getQuest(questId: string): any {
    return {
      id: questId,
      title: questId,
      description: ''
    };
  }

  /**
   * Complete an objective (placeholder)
   */
  completeObjective(questId: string, objectiveKey: string): boolean {
    console.log(`Objective ${objectiveKey} for quest ${questId} completed`);
    return true;
  }

  /**
   * Check if objective is complete (placeholder)
   */
  isObjectiveComplete(questId: string, objectiveKey: string): boolean {
    return false;
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
