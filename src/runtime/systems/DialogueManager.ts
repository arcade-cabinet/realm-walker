/**
 * DialogueManager - Conversation system for NPC interactions
 */

import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';

export interface DialogueNode {
  id: string;
  text: string;
  speaker?: string;
  choices?: DialogueChoice[];
  next?: string;  // Auto-advance to next node
  setFlags?: string[];  // Flags to set when this node is reached
}

export interface DialogueChoice {
  text: string;
  next: string;  // Next dialogue node ID
  requiresFlags?: string[];
  setsFlags?: string[];
}

export interface DialogueTree {
  id: string;
  startNode: string;
  nodes: Record<string, DialogueNode>;
}

<<<<<<< HEAD
export class DialogueManager extends EventEmitter {
=======
type Listener = (...args: any[]) => void;

export class DialogueManager {
>>>>>>> fix/issue-16
  private currentTree: DialogueTree | null = null;
  private currentNode: string | null = null;
  private dialogues: Map<string, DialogueTree>;
  private onFlagSet?: (flag: string) => void;
  private flagsSet: Set<string>;
  private history: string[];
  private listeners: Map<string, Listener[]> = new Map();

  constructor() {
    super();
    this.dialogues = new Map();
    this.flagsSet = new Set();
    this.history = [];
  }

  /**
   * Event listener support
   */
  on(event: string, listener: Listener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  private emit(event: string, ...args: any[]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(l => l(...args));
    }
  }

  /**
   * Load dialogue tree from JSON file
   */
  loadDialogueTree(filePath: string): DialogueTree {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      const tree: DialogueTree = {
        id: data.id,
        startNode: data.nodes?.[0]?.id || 'start',
        nodes: {}
      };

      if (Array.isArray(data.nodes)) {
        for (const node of data.nodes) {
          const choices = node.choices?.map((choice: any) => ({
            text: choice.text,
            next: choice.nextNode || choice.next,
            requiresFlags: choice.requiresFlags,
            setsFlags: choice.setFlags || choice.setsFlags
          }));

          tree.nodes[node.id] = {
            id: node.id,
            text: node.text,
            speaker: node.speaker,
            choices: choices,
            setFlags: node.setFlags
          };
        }
      }

      this.registerDialogue(tree);
      return tree;
    } catch (error) {
      throw new Error(`Failed to load dialogue tree from ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Register a dialogue tree
   */
  registerDialogue(tree: DialogueTree): void {
    this.dialogues.set(tree.id, tree);
  }

  /**
   * Start a dialogue by ID
   */
  startDialogue(dialogueId: string): DialogueNode | null {
    const tree = this.dialogues.get(dialogueId);
    if (!tree) {
      console.warn(`Dialogue ${dialogueId} not found`);
      return null;
    }

    this.currentTree = tree;
    this.currentNode = tree.startNode;
    this.history = [tree.startNode];
    const node = tree.nodes[tree.startNode];

<<<<<<< HEAD
    this.emit('dialogue-started', tree);

    // Set any flags
=======
>>>>>>> fix/issue-16
    if (node.setFlags) {
      node.setFlags.forEach(flag => {
        this.flagsSet.add(flag);
        this.onFlagSet?.(flag);
        this.emit('flag-set', flag);
      });
    }

    this.emit('dialogue-started', tree);
    return node;
  }

  /**
   * Make a choice and advance dialogue
   */
  makeChoice(choiceIndex: number, currentFlags: Record<string, boolean> = {}): DialogueNode | null {
    if (!this.currentTree || !this.currentNode) {
      return null;
    }

    const currentNodeData = this.currentTree.nodes[this.currentNode];
    if (!currentNodeData.choices || choiceIndex >= currentNodeData.choices.length) {
      return null;
    }

    const choice = currentNodeData.choices[choiceIndex];
    
    if (choice.requiresFlags && choice.requiresFlags.length > 0) {
      const hasRequiredFlags = choice.requiresFlags.every(flag => 
        currentFlags[flag] === true
      );
      if (!hasRequiredFlags) {
        return null;
      }
    }
    
    if (choice.setsFlags) {
      choice.setsFlags.forEach(flag => {
        this.flagsSet.add(flag);
        this.onFlagSet?.(flag);
        this.emit('flag-set', flag);
      });
    }

    this.currentNode = choice.next;
    this.history.push(choice.next);
    const nextNode = this.currentTree.nodes[choice.next];

    if (nextNode?.setFlags) {
      nextNode.setFlags.forEach(flag => {
        this.flagsSet.add(flag);
        this.onFlagSet?.(flag);
        this.emit('flag-set', flag);
      });
    }

    if (!nextNode || !nextNode.choices || nextNode.choices.length === 0) {
      this.endDialogue();
    }

    return nextNode;
  }

  /**
<<<<<<< HEAD
   * Advance to next node (for auto-advance dialogues)
   */
  advance(): DialogueNode | null {
    if (!this.currentTree || !this.currentNode) {
      return null;
    }

    const currentNodeData = this.currentTree.nodes[this.currentNode];
    if (!currentNodeData.next) {
      return null;
    }

    this.currentNode = currentNodeData.next;
    const nextNode = this.currentTree.nodes[currentNodeData.next];

    if (nextNode?.setFlags) {
      nextNode.setFlags.forEach(flag => {
        this.onFlagSet?.(flag);
        this.emit('flag-set', flag);
      });
    }

    return nextNode;
  }

  /**
   * Get current dialogue node
   */
  getCurrentNode(): DialogueNode | null {
    if (!this.currentTree || !this.currentNode) {
      return null;
    }
    return this.currentTree.nodes[this.currentNode];
  }

  /**
=======
>>>>>>> fix/issue-16
   * End current dialogue
   */
  endDialogue(): void {
    if (this.currentTree) {
      this.emit('dialogue-completed', this.currentTree);
    }
    this.currentTree = null;
    this.currentNode = null;
    this.history = [];
  }

  isActive(): boolean {
    return this.currentTree !== null;
  }

  setFlagCallback(callback: (flag: string) => void): void {
    this.onFlagSet = callback;
  }

  getCurrentNode(): DialogueNode | null {
    return this.currentTree && this.currentNode ? this.currentTree.nodes[this.currentNode] : null;
  }

  /**
   * Load all dialogue trees from a directory (Required for tests)
   */
  loadDialogueDirectory(dirPath: string): number {
    try {
      const files = fs.readdirSync(dirPath);
      let loadedCount = 0;
      for (const file of files) {
        if (file.endsWith('.json')) {
          this.loadDialogueTree(path.join(dirPath, file));
          loadedCount++;
        }
      }
      return loadedCount;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Check if a dialogue tree is loaded (Required for tests)
   */
  hasTree(dialogueId: string): boolean {
    return this.dialogues.has(dialogueId);
  }

  /**
   * Get all flags that have been set (Required for tests)
   */
  getFlagsSet(): string[] {
    return Array.from(this.flagsSet);
  }

  /**
   * Get dialogue history (Required for tests)
   */
  getHistory(): string[] {
    return [...this.history];
  }

  /**
   * Get all loaded tree IDs (Required for tests)
   */
  getLoadedTrees(): string[] {
    return Array.from(this.dialogues.keys());
  }
}
