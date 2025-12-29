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

export class DialogueManager extends EventEmitter {
  private currentTree: DialogueTree | null = null;
  private currentNode: string | null = null;
  private dialogues: Map<string, DialogueTree>;
  private onFlagSet?: (flag: string) => void;
  private flagsSet: Set<string>;
  private history: string[];

  constructor() {
    super();
    this.dialogues = new Map();
    this.flagsSet = new Set();
    this.history = [];
  }

  /**
   * Load dialogue tree from JSON file
   */
  loadDialogueTree(filePath: string): DialogueTree {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      // Convert array-based format to map-based format
      const tree: DialogueTree = {
        id: data.id,
        startNode: data.nodes?.[0]?.id || 'start',
        nodes: {}
      };

      // Convert nodes array to object map
      if (Array.isArray(data.nodes)) {
        for (const node of data.nodes) {
          // Convert choices format
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
      console.log(`Loaded dialogue tree: ${tree.id} (${Object.keys(tree.nodes).length} nodes)`);
      return tree;
    } catch (error) {
      throw new Error(`Failed to load dialogue tree from ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Load all dialogue trees from a directory
   */
  loadDialogueDirectory(dirPath: string): number {
    try {
      const files = fs.readdirSync(dirPath);
      let loadedCount = 0;

      for (const file of files) {
        if (file.endsWith('.json')) {
          const fullPath = path.join(dirPath, file);
          this.loadDialogueTree(fullPath);
          loadedCount++;
        }
      }

      console.log(`Loaded ${loadedCount} dialogue trees from ${dirPath}`);
      return loadedCount;
    } catch (error) {
      console.error(`Failed to load dialogue directory ${dirPath}:`, error);
      return 0;
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

    this.emit('dialogue-started', tree);

    // Set any flags
    if (node.setFlags) {
      node.setFlags.forEach(flag => {
        this.flagsSet.add(flag);
        this.onFlagSet?.(flag);
      });
    }

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
    
    // Check if choice requires flags (only check passed flags, not internal tracking)
    if (choice.requiresFlags && choice.requiresFlags.length > 0) {
      const hasRequiredFlags = choice.requiresFlags.every(flag => 
        currentFlags[flag] === true
      );
      if (!hasRequiredFlags) {
        return null;
      }
    }
    
    // Set flags from choice
    if (choice.setsFlags) {
      choice.setsFlags.forEach(flag => {
        this.flagsSet.add(flag);
        this.onFlagSet?.(flag);
      });
    }

    // Move to next node
    this.currentNode = choice.next;
    this.history.push(choice.next);
    const nextNode = this.currentTree.nodes[choice.next];

    // Set flags from new node
    if (nextNode?.setFlags) {
      nextNode.setFlags.forEach(flag => {
        this.flagsSet.add(flag);
        this.onFlagSet?.(flag);
      });
    }

    // Auto-end dialogue if we reach a node with no choices
    if (!nextNode || !nextNode.choices || nextNode.choices.length === 0) {
      this.endDialogue();
    }

    return nextNode;
  }

  /**
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
      nextNode.setFlags.forEach(flag => this.onFlagSet?.(flag));
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

  /**
   * Check if dialogue is active
   */
  isActive(): boolean {
    return this.currentTree !== null;
  }

  /**
   * Set callback for flag changes
   */
  setFlagCallback(callback: (flag: string) => void): void {
    this.onFlagSet = callback;
  }

  /**
   * Check if a dialogue tree is loaded
   */
  hasTree(dialogueId: string): boolean {
    return this.dialogues.has(dialogueId);
  }

  /**
   * Get all flags that have been set during dialogue
   */
  getFlagsSet(): string[] {
    return Array.from(this.flagsSet);
  }

  /**
   * Get dialogue history (node IDs visited)
   */
  getHistory(): string[] {
    return [...this.history];
  }

  /**
   * Get all loaded dialogue tree IDs
   */
  getLoadedTrees(): string[] {
    return Array.from(this.dialogues.keys());
  }
}
