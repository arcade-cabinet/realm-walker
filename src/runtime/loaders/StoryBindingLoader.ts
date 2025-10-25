/**
 * StoryBindingLoader - Loads and manages StoryBinding data
 * Bridges the gap between StoryBinding JSON files and StoryCompositor
 */

import * as fs from 'fs';
import * as path from 'path';
import { StoryBinding } from '../../types/StoryBinding';
import { StoryData, SlotContent, QuestFlags } from '../../types';

export class StoryBindingLoader {
  /**
   * Load StoryBinding from JSON file
   */
  static load(bindingPath: string): StoryBinding {
    try {
      const content = fs.readFileSync(bindingPath, 'utf-8');
      return JSON.parse(content) as StoryBinding;
    } catch (error) {
      throw new Error(
        `Failed to load StoryBinding from ${bindingPath}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Convert StoryBinding to StoryData format
   * This creates SlotContent entries from the binding data
   */
  static bindingToStoryData(
    binding: StoryBinding,
    assetBasePath: string = './assets'
  ): StoryData {
    const slotContents: SlotContent[] = [];
    const initialFlags: QuestFlags = {};

    // Process NPC placements
    for (const [slotId, placement] of Object.entries(binding.npc_placements)) {
      const modelPath = path.join(
        assetBasePath,
        'npcs',
        `${placement.npc_id}.glb`
      );

      // NPC placements might have quest prerequisites
      const requiredFlags: string[] = [];
      if (placement.quest) {
        // If this NPC requires a quest, add it as a required flag
        requiredFlags.push(placement.quest);
      }

      slotContents.push({
        slotId,
        modelPath,
        requiredFlags: requiredFlags.length > 0 ? requiredFlags : undefined,
        // Let GameCompositor position based on slot location
      });
    }

    // Process prop placements
    for (const [slotId, placement] of Object.entries(binding.prop_placements)) {
      const modelPath = path.join(
        assetBasePath,
        'props',
        `${placement.prop_id}.glb`
      );

      slotContents.push({
        slotId,
        modelPath,
        // Props typically don't have requirements
      });
    }

    // Process door states
    for (const [slotId, doorState] of Object.entries(binding.door_states)) {
      const modelPath = path.join(
        assetBasePath,
        'doors',
        doorState.locked ? 'locked_door.glb' : 'open_door.glb'
      );

      slotContents.push({
        slotId,
        modelPath,
        requiredFlags: doorState.requires_flags,
        // Door metadata will be handled by InteractionSystem
      });

      // Set initial flags for doors that are unlocked
      if (!doorState.locked && doorState.requires_flags) {
        doorState.requires_flags.forEach(flag => {
          initialFlags[flag] = true;
        });
      }
    }

    return {
      id: `story_${binding.scene_id}`,
      sceneId: binding.scene_id,
      slotContents,
      initialFlags
    };
  }

  /**
   * Load and convert StoryBinding in one step
   */
  static loadAsStoryData(
    bindingPath: string,
    assetBasePath: string = './assets'
  ): StoryData {
    const binding = this.load(bindingPath);
    return this.bindingToStoryData(binding, assetBasePath);
  }

  /**
   * Get dialogue ID for an NPC slot
   */
  static getDialogueForSlot(
    binding: StoryBinding,
    slotId: string
  ): string | undefined {
    return binding.npc_placements[slotId]?.dialogue;
  }

  /**
   * Get quest ID for an NPC slot
   */
  static getQuestForSlot(
    binding: StoryBinding,
    slotId: string
  ): string | undefined {
    return binding.npc_placements[slotId]?.quest;
  }

  /**
   * Get door target for a door slot
   */
  static getDoorTarget(
    binding: StoryBinding,
    slotId: string
  ): string | undefined {
    return binding.door_states[slotId]?.target;
  }

  /**
   * Check if door is locked
   */
  static isDoorLocked(binding: StoryBinding, slotId: string): boolean {
    return binding.door_states[slotId]?.locked ?? false;
  }

  /**
   * Get required flags for a door
   */
  static getDoorRequiredFlags(
    binding: StoryBinding,
    slotId: string
  ): string[] | undefined {
    return binding.door_states[slotId]?.requires_flags;
  }
}
