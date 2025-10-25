/**
 * Unit tests for DialogueManager
 * Tests dialogue tree loading and navigation
 */

import { DialogueManager } from '../../src/runtime/systems/DialogueManager';
import * as fs from 'fs';
import * as path from 'path';

// Mock dialogue tree data
const mockDialogueTree = {
  id: 'test_dialogue',
  nodes: [
    {
      id: 'start',
      speaker: 'NPC',
      text: 'Hello there!',
      choices: [
        { text: 'Hello', nextNode: 'greeting', setFlags: ['talked_to_npc'] },
        { text: 'Goodbye', nextNode: 'end' }
      ]
    },
    {
      id: 'greeting',
      speaker: 'NPC',
      text: 'How can I help you?',
      choices: [
        { text: 'I need help', nextNode: 'help', requiresFlags: ['talked_to_npc'] },
        { text: 'Never mind', nextNode: 'end' }
      ]
    },
    {
      id: 'help',
      speaker: 'NPC',
      text: 'Here is some help!',
      choices: [
        { text: 'Thanks!', nextNode: 'end' }
      ]
    },
    {
      id: 'end',
      speaker: 'NPC',
      text: 'Farewell!',
      choices: []
    }
  ]
};

describe('DialogueManager', () => {
  let dialogueManager: DialogueManager;
  let tempDir: string;

  beforeEach(() => {
    dialogueManager = new DialogueManager();
    
    // Create temp directory for test files
    tempDir = path.join(__dirname, '../../temp_test_dialogues');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(tempDir, file));
      });
      fs.rmdirSync(tempDir);
    }
  });

  describe('File Loading', () => {
    test('loads dialogue tree from JSON file', () => {
      const filepath = path.join(tempDir, 'test.json');
      fs.writeFileSync(filepath, JSON.stringify(mockDialogueTree), 'utf-8');

      const tree = dialogueManager.loadDialogueTree(filepath);

      expect(tree.id).toBe('test_dialogue');
      expect(Object.keys(tree.nodes).length).toBe(4);
    });

    test('throws error for non-existent file', () => {
      expect(() => {
        dialogueManager.loadDialogueTree('/nonexistent/file.json');
      }).toThrow();
    });

    test('throws error for invalid JSON', () => {
      const filepath = path.join(tempDir, 'invalid.json');
      fs.writeFileSync(filepath, 'not valid json', 'utf-8');

      expect(() => {
        dialogueManager.loadDialogueTree(filepath);
      }).toThrow();
    });

    test('loads multiple files from directory', () => {
      // Create multiple dialogue files
      for (let i = 0; i < 3; i++) {
        const tree = { ...mockDialogueTree, id: `dialogue_${i}` };
        const filepath = path.join(tempDir, `dialogue_${i}.json`);
        fs.writeFileSync(filepath, JSON.stringify(tree), 'utf-8');
      }

      const count = dialogueManager.loadDialogueDirectory(tempDir);

      expect(count).toBe(3);
      expect(dialogueManager.hasTree('dialogue_0')).toBe(true);
      expect(dialogueManager.hasTree('dialogue_1')).toBe(true);
      expect(dialogueManager.hasTree('dialogue_2')).toBe(true);
    });
  });

  describe('Dialogue Navigation', () => {
    beforeEach(() => {
      const filepath = path.join(tempDir, 'test.json');
      fs.writeFileSync(filepath, JSON.stringify(mockDialogueTree), 'utf-8');
      dialogueManager.loadDialogueTree(filepath);
    });

    test('starts dialogue at start node', () => {
      const node = dialogueManager.startDialogue('test_dialogue');

      expect(node).not.toBeNull();
      expect(node!.id).toBe('start');
      expect(node!.text).toBe('Hello there!');
    });

    test('navigates through dialogue choices', () => {
      dialogueManager.startDialogue('test_dialogue');
      
      // Choose first option
      const nextNode = dialogueManager.makeChoice(0);

      expect(nextNode).not.toBeNull();
      expect(nextNode!.id).toBe('greeting');
    });

    test('returns null for invalid choice index', () => {
      dialogueManager.startDialogue('test_dialogue');
      
      const result = dialogueManager.makeChoice(99);

      expect(result).toBeNull();
    });

    test('tracks flags set during dialogue', () => {
      dialogueManager.startDialogue('test_dialogue');
      dialogueManager.makeChoice(0, {});

      const flagsSet = dialogueManager.getFlagsSet();

      expect(flagsSet).toContain('talked_to_npc');
    });

    test('validates flag requirements for choices', () => {
      dialogueManager.startDialogue('test_dialogue');
      dialogueManager.makeChoice(0, {});

      // This choice requires 'talked_to_npc' flag
      const node = dialogueManager.makeChoice(0, { talked_to_npc: true });

      expect(node).not.toBeNull();
      expect(node!.id).toBe('help');
    });

    test('denies choice without required flags', () => {
      dialogueManager.startDialogue('test_dialogue');
      dialogueManager.makeChoice(0, {});

      // Try choice without flag
      const node = dialogueManager.makeChoice(0, {});

      expect(node).toBeNull();
    });
  });

  describe('Dialogue State', () => {
    beforeEach(() => {
      const filepath = path.join(tempDir, 'test.json');
      fs.writeFileSync(filepath, JSON.stringify(mockDialogueTree), 'utf-8');
      dialogueManager.loadDialogueTree(filepath);
    });

    test('tracks dialogue history', () => {
      dialogueManager.startDialogue('test_dialogue');
      dialogueManager.makeChoice(0, {});

      const history = dialogueManager.getHistory();

      expect(history.length).toBe(2);
      expect(history[0]).toBe('start');
      expect(history[1]).toBe('greeting');
    });

    test('reports active state correctly', () => {
      expect(dialogueManager.isActive()).toBe(false);

      dialogueManager.startDialogue('test_dialogue');
      expect(dialogueManager.isActive()).toBe(true);

      dialogueManager.endDialogue();
      expect(dialogueManager.isActive()).toBe(false);
    });

    test('ends dialogue on end node', () => {
      dialogueManager.startDialogue('test_dialogue');
      dialogueManager.makeChoice(1, {}); // Choose "Goodbye"

      expect(dialogueManager.isActive()).toBe(false);
    });

    test('gets current node', () => {
      dialogueManager.startDialogue('test_dialogue');
      const current = dialogueManager.getCurrentNode();

      expect(current).not.toBeNull();
      expect(current!.id).toBe('start');
    });
  });

  describe('Tree Management', () => {
    test('checks if tree is loaded', () => {
      expect(dialogueManager.hasTree('test_dialogue')).toBe(false);

      const filepath = path.join(tempDir, 'test.json');
      fs.writeFileSync(filepath, JSON.stringify(mockDialogueTree), 'utf-8');
      dialogueManager.loadDialogueTree(filepath);

      expect(dialogueManager.hasTree('test_dialogue')).toBe(true);
    });

    test('lists all loaded trees', () => {
      const filepath1 = path.join(tempDir, 'dialogue1.json');
      const filepath2 = path.join(tempDir, 'dialogue2.json');
      
      fs.writeFileSync(filepath1, JSON.stringify({ ...mockDialogueTree, id: 'dialogue1' }), 'utf-8');
      fs.writeFileSync(filepath2, JSON.stringify({ ...mockDialogueTree, id: 'dialogue2' }), 'utf-8');

      dialogueManager.loadDialogueTree(filepath1);
      dialogueManager.loadDialogueTree(filepath2);

      const trees = dialogueManager.getLoadedTrees();

      expect(trees.length).toBe(2);
      expect(trees).toContain('dialogue1');
      expect(trees).toContain('dialogue2');
    });
  });
});
