/**
 * Unit tests for StoryBindingLoader
 * Tests StoryBinding loading and conversion to StoryData
 */

import { StoryBindingLoader } from '../../src/runtime/loaders/StoryBindingLoader';
import { StoryBinding } from '../../src/types/StoryBinding';
import { StoryData } from '../../src/types';
import * as fs from 'fs';

// Mock fs
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('StoryBindingLoader', () => {
  const mockBinding: StoryBinding = {
    scene_id: 'village_square',
    npc_placements: {
      elder: {
        npc_id: 'village_elder',
        dialogue: 'elder_greeting',
        quest: 'seek_guardian'
      },
      merchant: {
        npc_id: 'traveling_merchant',
        dialogue: 'merchant_wares'
      }
    },
    prop_placements: {
      fountain: {
        prop_id: 'decorative_fountain',
        interactive: false
      },
      market_stall: {
        prop_id: 'merchant_stall',
        interactive: true
      }
    },
    door_states: {
      forest_exit: {
        target: 'crimson_palace',
        locked: false,
        requires_flags: ['seek_guardian']
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('load', () => {
    test('loads StoryBinding from valid JSON file', () => {
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockBinding));

      const binding = StoryBindingLoader.load('test.json');

      expect(binding.scene_id).toBe('village_square');
      expect(binding.npc_placements.elder).toBeDefined();
      expect(binding.prop_placements.fountain).toBeDefined();
      expect(binding.door_states.forest_exit).toBeDefined();
    });

    test('throws error on invalid JSON', () => {
      mockedFs.readFileSync.mockReturnValue('invalid json{');

      expect(() => {
        StoryBindingLoader.load('invalid.json');
      }).toThrow();
    });

    test('throws error on file not found', () => {
      mockedFs.readFileSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file');
      });

      expect(() => {
        StoryBindingLoader.load('nonexistent.json');
      }).toThrow();
    });
  });

  describe('bindingToStoryData', () => {
    test('converts StoryBinding to StoryData', () => {
      const storyData = StoryBindingLoader.bindingToStoryData(mockBinding);

      expect(storyData.id).toBe('story_village_square');
      expect(storyData.sceneId).toBe('village_square');
      expect(storyData.slotContents).toBeDefined();
      expect(storyData.slotContents.length).toBeGreaterThan(0);
    });

    test('creates slot content for NPCs', () => {
      const storyData = StoryBindingLoader.bindingToStoryData(mockBinding);

      const elderSlot = storyData.slotContents.find(s => s.slotId === 'elder');
      expect(elderSlot).toBeDefined();
      expect(elderSlot!.modelPath).toContain('village_elder.glb');
      expect(elderSlot!.requiredFlags).toContain('seek_guardian');
    });

    test('creates slot content for props', () => {
      const storyData = StoryBindingLoader.bindingToStoryData(mockBinding);

      const fountainSlot = storyData.slotContents.find(s => s.slotId === 'fountain');
      expect(fountainSlot).toBeDefined();
      expect(fountainSlot!.modelPath).toContain('decorative_fountain.glb');
    });

    test('creates slot content for doors', () => {
      const storyData = StoryBindingLoader.bindingToStoryData(mockBinding);

      const doorSlot = storyData.slotContents.find(s => s.slotId === 'forest_exit');
      expect(doorSlot).toBeDefined();
      expect(doorSlot!.requiredFlags).toContain('seek_guardian');
    });

    test('sets initial flags for unlocked doors', () => {
      const storyData = StoryBindingLoader.bindingToStoryData(mockBinding);

      expect(storyData.initialFlags).toBeDefined();
      expect(storyData.initialFlags!['seek_guardian']).toBe(true);
    });

    test('uses custom asset base path', () => {
      const storyData = StoryBindingLoader.bindingToStoryData(mockBinding, '/custom/assets');

      const elderSlot = storyData.slotContents.find(s => s.slotId === 'elder');
      expect(elderSlot!.modelPath).toContain('/custom/assets');
    });
  });

  describe('loadAsStoryData', () => {
    test('loads and converts in one step', () => {
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(mockBinding));

      const storyData = StoryBindingLoader.loadAsStoryData('test.json');

      expect(storyData.sceneId).toBe('village_square');
      expect(storyData.slotContents.length).toBeGreaterThan(0);
    });
  });

  describe('Helper Methods', () => {
    test('getDialogueForSlot returns correct dialogue ID', () => {
      const dialogue = StoryBindingLoader.getDialogueForSlot(mockBinding, 'elder');
      expect(dialogue).toBe('elder_greeting');
    });

    test('getQuestForSlot returns correct quest ID', () => {
      const quest = StoryBindingLoader.getQuestForSlot(mockBinding, 'elder');
      expect(quest).toBe('seek_guardian');
    });

    test('getDoorTarget returns correct target', () => {
      const target = StoryBindingLoader.getDoorTarget(mockBinding, 'forest_exit');
      expect(target).toBe('crimson_palace');
    });

    test('isDoorLocked returns correct state', () => {
      const locked = StoryBindingLoader.isDoorLocked(mockBinding, 'forest_exit');
      expect(locked).toBe(false);
    });

    test('getDoorRequiredFlags returns correct flags', () => {
      const flags = StoryBindingLoader.getDoorRequiredFlags(mockBinding, 'forest_exit');
      expect(flags).toEqual(['seek_guardian']);
    });

    test('helper methods return undefined for non-existent slots', () => {
      expect(StoryBindingLoader.getDialogueForSlot(mockBinding, 'nonexistent')).toBeUndefined();
      expect(StoryBindingLoader.getQuestForSlot(mockBinding, 'nonexistent')).toBeUndefined();
      expect(StoryBindingLoader.getDoorTarget(mockBinding, 'nonexistent')).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty NPC placements', () => {
      const emptyBinding: StoryBinding = {
        scene_id: 'empty_scene',
        npc_placements: {},
        prop_placements: {},
        door_states: {}
      };

      const storyData = StoryBindingLoader.bindingToStoryData(emptyBinding);
      expect(storyData.slotContents.length).toBe(0);
    });

    test('handles NPC without quest or dialogue', () => {
      const binding: StoryBinding = {
        scene_id: 'test',
        npc_placements: {
          guard: {
            npc_id: 'simple_guard'
          }
        },
        prop_placements: {},
        door_states: {}
      };

      const storyData = StoryBindingLoader.bindingToStoryData(binding);
      const guardSlot = storyData.slotContents.find(s => s.slotId === 'guard');
      
      expect(guardSlot).toBeDefined();
      expect(guardSlot!.requiredFlags).toBeUndefined();
    });

    test('handles locked door', () => {
      const binding: StoryBinding = {
        scene_id: 'test',
        npc_placements: {},
        prop_placements: {},
        door_states: {
          locked_gate: {
            target: 'castle',
            locked: true,
            requires_flags: ['has_key']
          }
        }
      };

      const storyData = StoryBindingLoader.bindingToStoryData(binding);
      const doorSlot = storyData.slotContents.find(s => s.slotId === 'locked_gate');
      
      expect(doorSlot).toBeDefined();
      expect(doorSlot!.modelPath).toContain('locked_door.glb');
      expect(storyData.initialFlags!['has_key']).toBeUndefined(); // Locked doors don't set initial flags
    });
  });
});
