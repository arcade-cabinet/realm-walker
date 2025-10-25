/**
 * Unit tests for QuestManager
 * Tests flag management and quest progression
 */

import { QuestManager } from '../../src/runtime/systems/QuestManager';

describe('QuestManager', () => {
  let questManager: QuestManager;

  beforeEach(() => {
    questManager = new QuestManager();
  });

  describe('Flag Management', () => {
    test('can set and retrieve flags', () => {
      questManager.setFlag('test_flag');
      
      expect(questManager.hasFlag('test_flag')).toBe(true);
    });

    test('flags default to false', () => {
      expect(questManager.hasFlag('nonexistent_flag')).toBe(false);
    });

    test('can set flag to false explicitly', () => {
      questManager.setFlag('test_flag', true);
      questManager.setFlag('test_flag', false);
      
      expect(questManager.hasFlag('test_flag')).toBe(false);
    });

    test('tracks multiple flags independently', () => {
      questManager.setFlag('flag1');
      questManager.setFlag('flag2');
      
      expect(questManager.hasFlag('flag1')).toBe(true);
      expect(questManager.hasFlag('flag2')).toBe(true);
      expect(questManager.hasFlag('flag3')).toBe(false);
    });
  });

  describe('Quest Management', () => {
    test('can start a quest', () => {
      questManager.startQuest('find_guardian');
      
      expect(questManager.isQuestActive('find_guardian')).toBe(true);
    });

    test('can complete a quest', () => {
      questManager.startQuest('find_guardian');
      questManager.completeQuest('find_guardian');
      
      expect(questManager.isQuestActive('find_guardian')).toBe(false);
      expect(questManager.getState().completedQuests).toContain('find_guardian');
    });

    test('cannot start same quest twice', () => {
      questManager.startQuest('test_quest');
      questManager.startQuest('test_quest');
      
      const state = questManager.getState();
      const count = state.activeQuests.filter(q => q === 'test_quest').length;
      expect(count).toBe(1);
    });

    test('tracks multiple active quests', () => {
      questManager.startQuest('quest1');
      questManager.startQuest('quest2');
      questManager.startQuest('quest3');
      
      expect(questManager.getState().activeQuests.length).toBe(3);
    });
  });

  describe('Scene Access', () => {
    test('allows access to scenes with no requirements', () => {
      expect(questManager.canAccessScene('starting_room', [])).toBe(true);
    });

    test('denies access without required flags', () => {
      const result = questManager.canAccessScene('palace', ['met_elder', 'has_key']);
      
      expect(result).toBe(false);
    });

    test('allows access with all required flags', () => {
      questManager.setFlag('met_elder');
      questManager.setFlag('has_key');
      
      const result = questManager.canAccessScene('palace', ['met_elder', 'has_key']);
      
      expect(result).toBe(true);
    });

    test('denies access with only some required flags', () => {
      questManager.setFlag('met_elder');
      
      const result = questManager.canAccessScene('palace', ['met_elder', 'has_key']);
      
      expect(result).toBe(false);
    });
  });

  describe('Story Progress', () => {
    test('tracks A story progress', () => {
      questManager.incrementAStory();
      questManager.incrementAStory();
      
      expect(questManager.getState().aStoryProgress).toBe(2);
    });

    test('tracks B story progress', () => {
      questManager.incrementBStory();
      
      expect(questManager.getState().bStoryProgress).toBe(1);
    });

    test('tracks C story progress', () => {
      questManager.incrementCStory();
      questManager.incrementCStory();
      questManager.incrementCStory();
      
      expect(questManager.getState().cStoryProgress).toBe(3);
    });

    test('tracks all story threads independently', () => {
      questManager.incrementAStory();
      questManager.incrementBStory();
      questManager.incrementBStory();
      questManager.incrementCStory();
      
      const state = questManager.getState();
      expect(state.aStoryProgress).toBe(1);
      expect(state.bStoryProgress).toBe(2);
      expect(state.cStoryProgress).toBe(1);
    });
  });

  describe('State Persistence', () => {
    test('can export state to JSON', () => {
      questManager.setFlag('test_flag');
      questManager.startQuest('test_quest');
      
      const json = questManager.exportToJSON();
      const parsed = JSON.parse(json);
      
      expect(parsed.storyFlags.test_flag).toBe(true);
      expect(parsed.activeQuests).toContain('test_quest');
    });

    test('can import state from JSON', () => {
      const json = JSON.stringify({
        storyFlags: { imported_flag: true },
        activeQuests: ['imported_quest'],
        completedQuests: [],
        aStoryProgress: 5,
        bStoryProgress: 3,
        cStoryProgress: 2
      });
      
      questManager.importFromJSON(json);
      
      expect(questManager.hasFlag('imported_flag')).toBe(true);
      expect(questManager.isQuestActive('imported_quest')).toBe(true);
      expect(questManager.getState().aStoryProgress).toBe(5);
    });

    test('preserves all state through save/load cycle', () => {
      questManager.setFlag('flag1');
      questManager.setFlag('flag2');
      questManager.startQuest('quest1');
      questManager.completeQuest('quest1');
      questManager.incrementAStory();
      
      const json = questManager.exportToJSON();
      const newManager = new QuestManager();
      newManager.importFromJSON(json);
      
      expect(newManager.hasFlag('flag1')).toBe(true);
      expect(newManager.hasFlag('flag2')).toBe(true);
      expect(newManager.getState().completedQuests).toContain('quest1');
      expect(newManager.getState().aStoryProgress).toBe(1);
    });
  });
});
