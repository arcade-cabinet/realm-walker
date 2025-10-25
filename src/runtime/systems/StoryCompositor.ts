/**
 * StoryCompositor - Second tier of compositor architecture
 * Fills slots based on quest flags
 * Knows about slots and flags, but NOTHING about presentation/rendering
 */

import { SlotContent, QuestFlags, StoryData, StoryState } from '../../types';

export class StoryCompositor {
  private storyState: StoryState;

  constructor(initialFlags: QuestFlags = {}) {
    this.storyState = {
      flags: { ...initialFlags },
      activeSlotContents: []
    };
  }

  /**
   * Evaluate which slot contents should be active based on current flags
   */
  compose(storyData: StoryData): SlotContent[] {
    const activeContents: SlotContent[] = [];

    for (const content of storyData.slotContents) {
      if (this.shouldActivateContent(content)) {
        activeContents.push(content);
      }
    }

    this.storyState.activeSlotContents = activeContents;
    return activeContents;
  }

  /**
   * Check if content should be activated based on required flags
   */
  private shouldActivateContent(content: SlotContent): boolean {
    if (!content.requiredFlags || content.requiredFlags.length === 0) {
      return true; // No requirements, always active
    }

    // All required flags must be true
    return content.requiredFlags.every(flag => this.storyState.flags[flag] === true);
  }

  /**
   * Set a quest flag
   */
  setFlag(flag: string, value: boolean): void {
    this.storyState.flags[flag] = value;
  }

  /**
   * Get a quest flag value
   */
  getFlag(flag: string): boolean {
    return this.storyState.flags[flag] || false;
  }

  /**
   * Get all flags
   */
  getFlags(): QuestFlags {
    return { ...this.storyState.flags };
  }

  /**
   * Get current story state
   */
  getState(): StoryState {
    return {
      flags: { ...this.storyState.flags },
      activeSlotContents: [...this.storyState.activeSlotContents]
    };
  }

  /**
   * Reset all flags
   */
  reset(): void {
    this.storyState.flags = {};
    this.storyState.activeSlotContents = [];
  }

  /**
   * Load flags from state
   */
  loadFlags(flags: QuestFlags): void {
    this.storyState.flags = { ...flags };
  }
}
