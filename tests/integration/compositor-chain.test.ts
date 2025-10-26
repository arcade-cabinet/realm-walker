/**
 * Integration tests for the three-tier compositor chain
 * Tests: Scene → Story → Game compositor flow
 */

import { SceneCompositor } from '../../src/runtime/systems/SceneCompositor';
import { StoryCompositor } from '../../src/runtime/systems/StoryCompositor';
import { SceneData, StoryData, SlotContent } from '../../src/types';
import * as THREE from 'three';

describe('Compositor Chain Integration', () => {
  let sceneCompositor: SceneCompositor;
  let storyCompositor: StoryCompositor;

  beforeEach(() => {
    sceneCompositor = new SceneCompositor();
    storyCompositor = new StoryCompositor({ game_started: true });
  });

  describe('Full Pipeline: Scene → Story', () => {
    test('processes complete scene through compositors', () => {
      // Create a simple scene data
      const sceneData: SceneData = {
        id: 'test_scene',
        name: 'Test Scene',
        geometry: [],
        slots: [
          {
            id: 'npc_guide',
            position: [5, 0, 5],
          },
        ],
      };

      // Step 1: Scene Compositor - Build geometry
      const composedScene = sceneCompositor.compose(sceneData);

      expect(composedScene).toBeDefined();
      expect(composedScene.scene).toBeInstanceOf(THREE.Scene);
      expect(composedScene.gridSystem).toBeDefined();
      expect(composedScene.slots).toBeDefined();

      // Step 2: Story Compositor - Fill slots based on flags
      const storyData: StoryData = {
        id: 'test_story',
        sceneId: 'test_scene',
        slotContents: [
          {
            slotId: 'npc_guide',
            modelPath: 'models/guide_model.glb',
            requiredFlags: ['game_started'],
          },
        ],
      };

      const activeContent = storyCompositor.compose(storyData);

      expect(activeContent).toBeDefined();
      expect(Array.isArray(activeContent)).toBe(true);
      expect(activeContent.length).toBeGreaterThan(0);
    });

    test('handles empty scene gracefully', () => {
      const sceneData: SceneData = {
        id: 'empty_scene',
        name: 'Empty Scene',
        geometry: [],
        slots: [],
      };

      const composedScene = sceneCompositor.compose(sceneData);
      expect(composedScene).toBeDefined();
      expect(composedScene.scene).toBeInstanceOf(THREE.Scene);
    });
  });

  describe('Quest Flag-Based Content Loading', () => {
    test('only activates content when flags are met', () => {
      const storyData: StoryData = {
        id: 'quest_story',
        sceneId: 'quest_scene',
        slotContents: [
          {
            slotId: 'chest',
            modelPath: 'models/locked_chest.glb',
            requiredFlags: [],
          },
          {
            slotId: 'treasure',
            modelPath: 'models/treasure.glb',
            requiredFlags: ['chest_opened'],
          },
        ],
      };

      // Without chest_opened flag
      storyCompositor.setFlag('chest_opened', false);
      let activeContent = storyCompositor.compose(storyData);
      expect(activeContent.length).toBe(1);
      expect(activeContent[0].slotId).toBe('chest');

      // With chest_opened flag
      storyCompositor.setFlag('chest_opened', true);
      activeContent = storyCompositor.compose(storyData);
      expect(activeContent.length).toBe(2);
    });

    test('supports multiple independent quests', () => {
      storyCompositor.setFlag('main_quest_active', true);
      storyCompositor.setFlag('side_quest_1', true);
      storyCompositor.setFlag('side_quest_2', false);

      expect(storyCompositor.getFlag('main_quest_active')).toBe(true);
      expect(storyCompositor.getFlag('side_quest_1')).toBe(true);
      expect(storyCompositor.getFlag('side_quest_2')).toBe(false);
    });
  });

  describe('Story State Management', () => {
    test('can get and set flags', () => {
      storyCompositor.setFlag('test_flag', true);
      expect(storyCompositor.getFlag('test_flag')).toBe(true);

      storyCompositor.setFlag('test_flag', false);
      expect(storyCompositor.getFlag('test_flag')).toBe(false);
    });

    test('can retrieve all flags', () => {
      storyCompositor.setFlag('flag1', true);
      storyCompositor.setFlag('flag2', false);

      const flags = storyCompositor.getFlags();
      expect(flags['flag1']).toBe(true);
      expect(flags['flag2']).toBe(false);
    });

    test('can reset state', () => {
      storyCompositor.setFlag('test', true);
      expect(storyCompositor.getFlag('test')).toBe(true);

      storyCompositor.reset();
      expect(storyCompositor.getFlag('test')).toBe(false);
    });
  });
});
