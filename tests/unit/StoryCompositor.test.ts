/**
 * Unit tests for StoryCompositor
 * Tests story content activation based on quest flags
 */

import { StoryCompositor } from '../../src/runtime/systems/StoryCompositor';
import { StoryData, SlotContent } from '../../src/types';

describe('StoryCompositor', () => {
  let compositor: StoryCompositor;

  beforeEach(() => {
    compositor = new StoryCompositor({ initial_flag: true });
  });

  describe('Flag Management', () => {
    test('should set and get flags', () => {
      compositor.setFlag('test_flag', true);
      expect(compositor.getFlag('test_flag')).toBe(true);

      compositor.setFlag('test_flag', false);
      expect(compositor.getFlag('test_flag')).toBe(false);
    });

    test('should return false for undefined flags', () => {
      expect(compositor.getFlag('nonexistent')).toBe(false);
    });

    test('should get all flags', () => {
      compositor.setFlag('flag1', true);
      compositor.setFlag('flag2', false);
      
      const flags = compositor.getFlags();
      expect(flags['initial_flag']).toBe(true);
      expect(flags['flag1']).toBe(true);
      expect(flags['flag2']).toBe(false);
    });

    test('should load flags from object', () => {
      compositor.loadFlags({
        loaded_flag_1: true,
        loaded_flag_2: false,
      });

      expect(compositor.getFlag('loaded_flag_1')).toBe(true);
      expect(compositor.getFlag('loaded_flag_2')).toBe(false);
    });

    test('should reset all flags and content', () => {
      compositor.setFlag('test', true);
      compositor.reset();
      
      expect(compositor.getFlag('test')).toBe(false);
      expect(compositor.getFlag('initial_flag')).toBe(false);
    });
  });

  describe('Content Composition', () => {
    test('should activate content with no required flags', () => {
      const storyData: StoryData = {
        id: 'test',
        sceneId: 'test_scene',
        slotContents: [
          {
            slotId: 'always_visible',
            modelPath: 'models/prop.glb',
            requiredFlags: [],
          },
        ],
      };

      const active = compositor.compose(storyData);
      expect(active).toHaveLength(1);
      expect(active[0].slotId).toBe('always_visible');
    });

    test('should activate content when all required flags are met', () => {
      compositor.setFlag('flag_a', true);
      compositor.setFlag('flag_b', true);

      const storyData: StoryData = {
        id: 'test',
        sceneId: 'test_scene',
        slotContents: [
          {
            slotId: 'gated_content',
            modelPath: 'models/gated.glb',
            requiredFlags: ['flag_a', 'flag_b'],
          },
        ],
      };

      const active = compositor.compose(storyData);
      expect(active).toHaveLength(1);
    });

    test('should not activate content when required flags are not met', () => {
      compositor.setFlag('flag_a', true);
      compositor.setFlag('flag_b', false);

      const storyData: StoryData = {
        id: 'test',
        sceneId: 'test_scene',
        slotContents: [
          {
            slotId: 'gated_content',
            modelPath: 'models/gated.glb',
            requiredFlags: ['flag_a', 'flag_b'],
          },
        ],
      };

      const active = compositor.compose(storyData);
      expect(active).toHaveLength(0);
    });

    test('should filter multiple slot contents based on flags', () => {
      compositor.setFlag('show_item_1', true);
      compositor.setFlag('show_item_2', false);
      compositor.setFlag('show_item_3', true);

      const storyData: StoryData = {
        id: 'test',
        sceneId: 'test_scene',
        slotContents: [
          {
            slotId: 'item_1',
            modelPath: 'models/item1.glb',
            requiredFlags: ['show_item_1'],
          },
          {
            slotId: 'item_2',
            modelPath: 'models/item2.glb',
            requiredFlags: ['show_item_2'],
          },
          {
            slotId: 'item_3',
            modelPath: 'models/item3.glb',
            requiredFlags: ['show_item_3'],
          },
        ],
      };

      const active = compositor.compose(storyData);
      expect(active).toHaveLength(2);
      expect(active.map(c => c.slotId)).toContain('item_1');
      expect(active.map(c => c.slotId)).toContain('item_3');
      expect(active.map(c => c.slotId)).not.toContain('item_2');
    });

    test('should handle empty slot contents', () => {
      const storyData: StoryData = {
        id: 'test',
        sceneId: 'test_scene',
        slotContents: [],
      };

      const active = compositor.compose(storyData);
      expect(active).toHaveLength(0);
    });

    test('should handle content with undefined requiredFlags', () => {
      const storyData: StoryData = {
        id: 'test',
        sceneId: 'test_scene',
        slotContents: [
          {
            slotId: 'no_requirements',
            modelPath: 'models/prop.glb',
            // No requiredFlags property
          },
        ],
      };

      const active = compositor.compose(storyData);
      expect(active).toHaveLength(1);
    });
  });

  describe('State Management', () => {
    test('should return current state', () => {
      compositor.setFlag('test_flag', true);
      
      const storyData: StoryData = {
        id: 'test',
        sceneId: 'test_scene',
        slotContents: [
          {
            slotId: 'content',
            modelPath: 'models/content.glb',
            requiredFlags: ['test_flag'],
          },
        ],
      };

      compositor.compose(storyData);
      
      const state = compositor.getState();
      expect(state.flags['test_flag']).toBe(true);
      expect(state.activeSlotContents).toHaveLength(1);
    });

    test('should not mutate returned state', () => {
      compositor.setFlag('original', true);
      
      const state1 = compositor.getState();
      state1.flags['modified'] = true;
      
      const state2 = compositor.getState();
      expect(state2.flags['modified']).toBeUndefined();
      expect(state2.flags['original']).toBe(true);
    });
  });

  describe('Content Position and Transform', () => {
    test('should preserve content position data', () => {
      const storyData: StoryData = {
        id: 'test',
        sceneId: 'test_scene',
        slotContents: [
          {
            slotId: 'positioned',
            modelPath: 'models/item.glb',
            position: [1, 2, 3],
            rotation: [0, Math.PI / 2, 0],
            scale: [2, 2, 2],
          },
        ],
      };

      const active = compositor.compose(storyData);
      expect(active[0].position).toEqual([1, 2, 3]);
      expect(active[0].rotation).toEqual([0, Math.PI / 2, 0]);
      expect(active[0].scale).toEqual([2, 2, 2]);
    });
  });
});
