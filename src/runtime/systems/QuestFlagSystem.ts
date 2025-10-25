/**
 * QuestFlagSystem - Manages boolean quest flags
 * Simple flag management with persistence support
 */

import { QuestFlags } from '../../types';

export class QuestFlagSystem {
  private flags: QuestFlags;

  constructor(initialFlags: QuestFlags = {}) {
    this.flags = { ...initialFlags };
  }

  /**
   * Set a flag value
   */
  setFlag(name: string, value: boolean): void {
    this.flags[name] = value;
  }

  /**
   * Get a flag value (defaults to false)
   */
  getFlag(name: string): boolean {
    return this.flags[name] || false;
  }

  /**
   * Toggle a flag
   */
  toggleFlag(name: string): void {
    this.flags[name] = !this.getFlag(name);
  }

  /**
   * Check if flag exists
   */
  hasFlag(name: string): boolean {
    return name in this.flags;
  }

  /**
   * Remove a flag
   */
  removeFlag(name: string): void {
    delete this.flags[name];
  }

  /**
   * Get all flags
   */
  getAllFlags(): QuestFlags {
    return { ...this.flags };
  }

  /**
   * Load flags from object
   */
  loadFlags(flags: QuestFlags): void {
    this.flags = { ...flags };
  }

  /**
   * Clear all flags
   */
  clearFlags(): void {
    this.flags = {};
  }

  /**
   * Get flag count
   */
  getFlagCount(): number {
    return Object.keys(this.flags).length;
  }

  /**
   * Export flags as JSON string
   */
  exportToJSON(): string {
    return JSON.stringify(this.flags, null, 2);
  }

  /**
   * Import flags from JSON string
   */
  importFromJSON(json: string): void {
    try {
      const parsed = JSON.parse(json);
      if (typeof parsed === 'object' && parsed !== null) {
        this.flags = parsed;
      }
    } catch (error) {
      throw new Error('Invalid JSON for quest flags');
    }
  }
}
