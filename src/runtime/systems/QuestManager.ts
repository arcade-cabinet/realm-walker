/**
 * QuestManager - Boolean flag-based quest progression system
 * Supports full quest definitions, objectives, and event emitting
 */

import { QuestState } from '../../types/GameState';
import { EventEmitter } from 'events';
import { Quest, QuestObjective } from '../../types/Quest';

export { Quest, QuestObjective };

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
      }
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
