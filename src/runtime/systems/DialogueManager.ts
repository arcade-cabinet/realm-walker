/**
 * DialogueManager - Conversation system for NPC interactions
 */

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

export class DialogueManager {
  private currentTree: DialogueTree | null = null;
  private currentNode: string | null = null;
  private dialogues: Map<string, DialogueTree>;
  private onFlagSet?: (flag: string) => void;

  constructor() {
    this.dialogues = new Map();
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
    const node = tree.nodes[tree.startNode];

    // Set any flags
    if (node.setFlags) {
      node.setFlags.forEach(flag => this.onFlagSet?.(flag));
    }

    return node;
  }

  /**
   * Make a choice and advance dialogue
   */
  makeChoice(choiceIndex: number): DialogueNode | null {
    if (!this.currentTree || !this.currentNode) {
      return null;
    }

    const currentNodeData = this.currentTree.nodes[this.currentNode];
    if (!currentNodeData.choices || choiceIndex >= currentNodeData.choices.length) {
      return null;
    }

    const choice = currentNodeData.choices[choiceIndex];
    
    // Set flags from choice
    if (choice.setsFlags) {
      choice.setsFlags.forEach(flag => this.onFlagSet?.(flag));
    }

    // Move to next node
    this.currentNode = choice.next;
    const nextNode = this.currentTree.nodes[choice.next];

    // Set flags from new node
    if (nextNode?.setFlags) {
      nextNode.setFlags.forEach(flag => this.onFlagSet?.(flag));
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
    this.currentTree = null;
    this.currentNode = null;
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
}
