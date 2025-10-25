/**
 * GameUIManager - Integration layer between UI components and game systems
 * Connects DialogueUI to DialogueManager and QuestLogUI to QuestManager
 */

import { DialogueUI, DialogueUIOptions } from '../../ui/DialogueUI';
import { QuestLogUI, QuestLogUIOptions, QuestInfo } from '../../ui/QuestLogUI';
import { DialogueManager, DialogueNode } from './DialogueManager';
import { QuestManager } from './QuestManager';
import { StoryCompositor } from './StoryCompositor';

// Define Quest interface inline since it's not exported from QuestManager
interface Quest {
  id: string;
  title: string;
  description: string;
  objectives?: Record<string, QuestObjective>;
  rewards?: string[];
}

interface QuestObjective {
  description: string;
  requiredFlags?: string[];
}

export interface GameUIManagerOptions {
  container: HTMLElement;
  dialogueManager: DialogueManager;
  questManager: QuestManager;
  storyCompositor: StoryCompositor;
  theme?: 'default' | 'dark' | 'fantasy';
}

export class GameUIManager {
  private dialogueUI: DialogueUI;
  private questLogUI: QuestLogUI;
  private dialogueManager: DialogueManager;
  private questManager: QuestManager;
  private storyCompositor: StoryCompositor;

  constructor(options: GameUIManagerOptions) {
    this.dialogueManager = options.dialogueManager;
    this.questManager = options.questManager;
    this.storyCompositor = options.storyCompositor;

    // Initialize DialogueUI
    this.dialogueUI = new DialogueUI({
      container: options.container,
      theme: options.theme,
      onChoice: (index) => this.handleDialogueChoice(index)
    });

    // Initialize QuestLogUI
    this.questLogUI = new QuestLogUI({
      container: options.container,
      theme: options.theme,
      onQuestSelect: (questId) => this.handleQuestSelect(questId)
    });

    // Connect DialogueManager flag callback to StoryCompositor
    this.dialogueManager.setFlagCallback((flag) => {
      console.log(`Dialogue set flag: ${flag}`);
      this.storyCompositor.setFlag(flag, true);
      // Update quest log when flags change
      this.updateQuestLog();
    });

    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  /**
   * Setup keyboard shortcuts for UI
   */
  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // Q key - Toggle Quest Log
      if (e.key === 'q' || e.key === 'Q') {
        if (!this.dialogueUI.isVisible()) {
          this.toggleQuestLog();
        }
      }

      // ESC key - Close dialogs
      if (e.key === 'Escape') {
        if (this.dialogueUI.isVisible()) {
          this.endDialogue();
        } else if (this.questLogUI.getIsVisible()) {
          this.questLogUI.hide();
        }
      }

      // Number keys 1-9 - Quick choice selection in dialogue
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= 9 && this.dialogueUI.isVisible()) {
        const node = this.dialogueManager.getCurrentNode();
        if (node?.choices && num <= node.choices.length) {
          this.handleDialogueChoice(num - 1);
        }
      }
    });
  }

  /**
   * Start a dialogue and show UI
   */
  startDialogue(dialogueId: string): boolean {
    const node = this.dialogueManager.startDialogue(dialogueId);
    if (!node) {
      console.warn(`Failed to start dialogue: ${dialogueId}`);
      return false;
    }

    this.showDialogueNode(node);
    return true;
  }

  /**
   * Show a dialogue node in the UI
   */
  private showDialogueNode(node: DialogueNode): void {
    const speaker = node.speaker || 'Unknown';
    const text = node.text;
    const choices = node.choices?.map(c => c.text) || [];

    this.dialogueUI.show(speaker, text, choices);
  }

  /**
   * Handle dialogue choice selection
   */
  private handleDialogueChoice(choiceIndex: number): void {
    const nextNode = this.dialogueManager.makeChoice(choiceIndex);
    
    if (nextNode) {
      this.showDialogueNode(nextNode);
    } else {
      // Dialogue ended
      this.endDialogue();
    }
  }

  /**
   * End current dialogue
   */
  endDialogue(): void {
    this.dialogueManager.endDialogue();
    this.dialogueUI.hide();
  }

  /**
   * Check if dialogue is active
   */
  isDialogueActive(): boolean {
    return this.dialogueManager.isActive();
  }

  /**
   * Show quest log with current quests
   */
  showQuestLog(): void {
    this.updateQuestLog();
    this.questLogUI.show();
  }

  /**
   * Hide quest log
   */
  hideQuestLog(): void {
    this.questLogUI.hide();
  }

  /**
   * Toggle quest log visibility
   */
  toggleQuestLog(): void {
    if (this.questLogUI.getIsVisible()) {
      this.hideQuestLog();
    } else {
      this.showQuestLog();
    }
  }

  /**
   * Update quest log with current quest data
   */
  private updateQuestLog(): void {
    const allQuests = this.questManager.getAllQuests();
    
    const activeQuests: QuestInfo[] = [];
    const completedQuests: QuestInfo[] = [];

    for (const quest of allQuests) {
      const questInfo: QuestInfo = {
        id: quest.id,
        title: quest.title,
        description: quest.description,
        completed: this.questManager.isQuestCompleted(quest.id)
      };

      // Add objectives if available
      if (quest.objectives) {
        questInfo.objectives = Object.entries(quest.objectives).map(
          ([key, obj]) => `${obj.description} ${this.questManager.isObjectiveComplete(quest.id, key) ? '✓' : ''}`
        );
      }

      if (questInfo.completed) {
        completedQuests.push(questInfo);
      } else if (this.questManager.isQuestActive(quest.id)) {
        activeQuests.push(questInfo);
      }
    }

    this.questLogUI.update(activeQuests, completedQuests);
  }

  /**
   * Handle quest selection in quest log
   */
  private handleQuestSelect(questId: string): void {
    console.log(`Quest selected: ${questId}`);
    const quest = this.questManager.getQuest(questId);
    
    if (quest) {
      // Could show quest details in a separate modal
      // or highlight quest objectives on the map
      console.log('Quest details:', quest);
    }
  }

  /**
   * Start a quest and update UI
   */
  startQuest(questId: string): boolean {
    const success = this.questManager.startQuest(questId);
    if (success) {
      this.updateQuestLog();
      console.log(`Quest started: ${questId}`);
    }
    return success;
  }

  /**
   * Complete an objective and update UI
   */
  completeObjective(questId: string, objectiveKey: string): boolean {
    const success = this.questManager.completeObjective(questId, objectiveKey);
    if (success) {
      this.updateQuestLog();
      
      // Check if quest is now complete
      if (this.questManager.isQuestCompleted(questId)) {
        console.log(`Quest completed: ${questId}`);
        // Could show a completion notification
      }
    }
    return success;
  }

  /**
   * Get dialogue UI instance
   */
  getDialogueUI(): DialogueUI {
    return this.dialogueUI;
  }

  /**
   * Get quest log UI instance
   */
  getQuestLogUI(): QuestLogUI {
    return this.questLogUI;
  }

  /**
   * Destroy all UI components
   */
  destroy(): void {
    this.dialogueUI.destroy();
    this.questLogUI.destroy();
  }
}
