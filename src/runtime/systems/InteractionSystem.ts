/**
 * InteractionSystem - Handle player clicks and interactions with scene elements
 */

import { GridPosition, WorldPosition, InteractionPoint } from '../../types';

export interface ClickEvent {
  worldPosition: WorldPosition;
  gridPosition?: GridPosition;
  timestamp: number;
}

export interface InteractionHandler {
  onDialogue?: (npcId: string, dialogueId?: string) => void;
  onExamine?: (targetId: string, description: string) => void;
  onUse?: (targetId: string) => void;
  onPortal?: (targetScene: string) => void;
}

export class InteractionSystem {
  private interactions: Map<string, InteractionPoint>;
  private handlers: InteractionHandler;

  constructor(handlers: InteractionHandler = {}) {
    this.interactions = new Map();
    this.handlers = handlers;
  }

  /**
   * Register an interaction point
   */
  registerInteraction(point: InteractionPoint): void {
    this.interactions.set(point.id, point);
  }

  /**
   * Remove an interaction point
   */
  removeInteraction(id: string): void {
    this.interactions.delete(id);
  }

  /**
   * Handle a click event
   */
  handleClick(event: ClickEvent, currentFlags: Record<string, boolean>): boolean {
    if (!event.gridPosition) {
      return false;
    }

    // Find interactions within click radius
    for (const [id, point] of this.interactions) {
      const distance = this.gridDistance(event.gridPosition, point.position);
      
      if (distance <= point.radius) {
        // Check if flags are satisfied
        if (point.requiresFlags && !this.checkFlags(point.requiresFlags, currentFlags)) {
          continue;
        }

        // Trigger appropriate handler
        switch (point.type) {
          case 'dialogue':
            if (point.dialogueId) {
              this.handlers.onDialogue?.(id, point.dialogueId);
              return true;
            }
            break;
          
          case 'examine':
            if (point.description) {
              this.handlers.onExamine?.(id, point.description);
              return true;
            }
            break;
          
          case 'use':
            this.handlers.onUse?.(id);
            return true;
          
          case 'portal':
            if (point.targetScene) {
              this.handlers.onPortal?.(point.targetScene);
              return true;
            }
            break;
        }
      }
    }

    return false;
  }

  /**
   * Calculate grid distance between two positions
   */
  private gridDistance(a: GridPosition, b: GridPosition): number {
    const dx = Math.abs(a[0] - b[0]);
    const dy = Math.abs(a[1] - b[1]);
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Check if all required flags are set
   */
  private checkFlags(required: string[], current: Record<string, boolean>): boolean {
    return required.every(flag => current[flag] === true);
  }

  /**
   * Get all interaction points
   */
  getInteractions(): InteractionPoint[] {
    return Array.from(this.interactions.values());
  }

  /**
   * Clear all interactions
   */
  clearInteractions(): void {
    this.interactions.clear();
  }

  /**
   * Update handlers
   */
  setHandlers(handlers: InteractionHandler): void {
    this.handlers = { ...this.handlers, ...handlers };
  }
}
