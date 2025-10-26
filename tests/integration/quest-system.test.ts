/**
 * Integration tests for Quest System
 * Tests the full quest workflow with flags and progression
 */

import { QuestManager } from '../../src/runtime/systems/QuestManager';
import { DialogueManager, DialogueTree } from '../../src/runtime/systems/DialogueManager';

describe('Quest System Integration', () => {
  let questManager: QuestManager;
  let dialogueManager: DialogueManager;

  beforeEach(() => {
    questManager = new QuestManager();
    dialogueManager = new DialogueManager();
  });

  describe('Quest Lifecycle', () => {
    test('complete quest workflow: start → progress → complete', () => {
      // Start with no flags
      expect(questManager.hasFlag('quest_started')).toBe(false);

      // Set initial quest flag
      questManager.setFlag('quest_started', true);
      expect(questManager.hasFlag('quest_started')).toBe(true);

      // Progress through quest stages
      questManager.setFlag('talked_to_npc', true);
      questManager.setFlag('found_item', true);
      questManager.setFlag('returned_item', true);

      // Complete quest
      questManager.setFlag('quest_completed', true);

      // Verify all flags are set
      expect(questManager.hasFlag('quest_started')).toBe(true);
      expect(questManager.hasFlag('talked_to_npc')).toBe(true);
      expect(questManager.hasFlag('found_item')).toBe(true);
      expect(questManager.hasFlag('returned_item')).toBe(true);
      expect(questManager.hasFlag('quest_completed')).toBe(true);
    });

    test('quest flags affect dialogue options', () => {
      // Setup dialogue with flag-gated content
      const mockDialogue: DialogueTree = {
        id: 'npc_quest',
        startNode: 'start',
        nodes: {
          start: {
            id: 'start',
            text: 'Hello adventurer!',
            choices: [
              { text: 'Tell me about the quest', next: 'quest_info' },
              { 
                text: 'I completed your quest', 
                next: 'quest_complete',
                requiresFlags: ['quest_completed']
              },
            ],
          },
          quest_info: {
            id: 'quest_info',
            text: 'Find the lost artifact!',
            choices: [{ text: 'I will help', next: 'accepted' }],
            setFlags: ['quest_started'],
          },
          accepted: {
            id: 'accepted',
            text: 'Good luck!',
            choices: [],
          },
          quest_complete: {
            id: 'quest_complete',
            text: 'Thank you! Here is your reward.',
            choices: [],
            setFlags: ['reward_received'],
          },
        },
      };

      dialogueManager.registerDialogue(mockDialogue);

      // Start dialogue
      const startNode = dialogueManager.startDialogue('npc_quest');
      expect(startNode).toBeDefined();
      expect(startNode?.text).toBe('Hello adventurer!');

      // Accept quest - this should set quest_started flag
      let flagSet = false;
      dialogueManager.setFlagCallback((flag) => {
        if (flag === 'quest_started') {
          questManager.setFlag(flag, true);
          flagSet = true;
        }
      });

      dialogueManager.makeChoice(0); // Choose quest info
      dialogueManager.makeChoice(0); // Accept quest

      // Verify quest flag was set
      expect(flagSet).toBe(true);
      expect(questManager.hasFlag('quest_started')).toBe(true);
    });

    test('multiple independent quests can coexist', () => {
      // Set flags for multiple quests
      questManager.setFlag('main_quest_active', true);
      questManager.setFlag('side_quest_1_active', true);
      questManager.setFlag('side_quest_2_completed', true);

      // Verify all flags are maintained independently
      expect(questManager.hasFlag('main_quest_active')).toBe(true);
      expect(questManager.hasFlag('side_quest_1_active')).toBe(true);
      expect(questManager.hasFlag('side_quest_2_completed')).toBe(true);
      expect(questManager.hasFlag('nonexistent_quest')).toBe(false);
    });
  });

  describe('Quest State Persistence', () => {
    test('quest state can be retrieved', () => {
      // Set up quest state
      questManager.setFlag('quest_a', true);
      questManager.setFlag('quest_b', false);
      questManager.setFlag('quest_c', true);

      // Get current state
      const state = questManager.getState();
      
      expect(state.storyFlags['quest_a']).toBe(true);
      expect(state.storyFlags['quest_b']).toBe(false);
      expect(state.storyFlags['quest_c']).toBe(true);
    });
  });

  describe('Flag-Based Scene Changes', () => {
    test('scene content changes based on quest flags', () => {
      // Simulate scene with flag-dependent content
      const getSceneContent = (flags: Record<string, boolean>) => {
        if (flags['dragon_defeated']) {
          return 'peaceful_village';
        } else if (flags['dragon_angry']) {
          return 'burning_village';
        } else {
          return 'normal_village';
        }
      };

      // Initial state
      let content = getSceneContent(questManager.getState().storyFlags);
      expect(content).toBe('normal_village');

      // Dragon becomes angry
      questManager.setFlag('dragon_angry', true);
      content = getSceneContent(questManager.getState().storyFlags);
      expect(content).toBe('burning_village');

      // Dragon is defeated
      questManager.setFlag('dragon_defeated', true);
      content = getSceneContent(questManager.getState().storyFlags);
      expect(content).toBe('peaceful_village');
    });
  });

  describe('Story Thread Progression', () => {
    test('story threads progress independently', () => {
      const state = questManager.getState();
      
      // Initial progress is 0
      expect(state.aStoryProgress).toBe(0);
      expect(state.bStoryProgress).toBe(0);
      expect(state.cStoryProgress).toBe(0);

      // Progress story threads independently
      questManager.setFlag('a_story_chapter_1', true);
      questManager.setFlag('b_story_chapter_1', true);

      // Verify flags are set
      expect(questManager.hasFlag('a_story_chapter_1')).toBe(true);
      expect(questManager.hasFlag('b_story_chapter_1')).toBe(true);
      expect(questManager.hasFlag('c_story_chapter_1')).toBe(false);
    });
  });

  describe('Dialogue Integration', () => {
    test('dialogue system can be used to set quest flags', () => {
      const dialogue: DialogueTree = {
        id: 'test',
        startNode: 'start',
        nodes: {
          start: {
            id: 'start',
            text: 'Test',
            choices: [{ text: 'Continue', next: 'next' }],
          },
          next: {
            id: 'next',
            text: 'Done',
            choices: [],
            setFlags: ['dialogue_completed'],
          },
        },
      };

      dialogueManager.registerDialogue(dialogue);

      // Setup callback to set quest flags
      dialogueManager.setFlagCallback((flag) => {
        questManager.setFlag(flag, true);
      });

      // Start dialogue and progress
      dialogueManager.startDialogue('test');
      dialogueManager.makeChoice(0);

      // Verify flag was set via callback
      expect(questManager.hasFlag('dialogue_completed')).toBe(true);
    });
  });
});
