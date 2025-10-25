/**
 * QuestManager - Boolean flag-based quest progression system
 * No numerical stats, everything is quest state
 */

import { QuestState } from '../../types/GameState';

export class QuestManager {
  private state: QuestState;

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
  startQuest(questId: string): void {
    if (!this.state.activeQuests.includes(questId)) {
      this.state.activeQuests.push(questId);
    }
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
    }
  }

  /**
   * Check if quest is active
   */
  isQuestActive(questId: string): boolean {
    return this.state.activeQuests.includes(questId);
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
}
