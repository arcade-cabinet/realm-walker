/**
 * KeyboardManager - Handles keyboard shortcuts and input
 * Provides centralized keyboard event management
 */

export type KeyBinding = {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  callback: () => void;
  description?: string;
};

export class KeyboardManager {
  private bindings: Map<string, KeyBinding[]> = new Map();
  private enabled: boolean = true;
  private pressedKeys: Set<string> = new Set();

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Setup keyboard event listeners
   */
  private setupEventListeners(): void {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    window.addEventListener('blur', this.handleBlur.bind(this));
  }

  /**
   * Handle keydown event
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.enabled) return;

    const key = event.key.toLowerCase();
    this.pressedKeys.add(key);

    const bindingKey = this.createBindingKey(key, event.ctrlKey, event.altKey, event.shiftKey);
    const bindings = this.bindings.get(bindingKey);

    if (bindings) {
      for (const binding of bindings) {
        event.preventDefault();
        binding.callback();
      }
    }
  }

  /**
   * Handle keyup event
   */
  private handleKeyUp(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    this.pressedKeys.delete(key);
  }

  /**
   * Handle window blur (release all keys)
   */
  private handleBlur(): void {
    this.pressedKeys.clear();
  }

  /**
   * Create a binding key from modifiers
   */
  private createBindingKey(key: string, ctrl: boolean, alt: boolean, shift: boolean): string {
    const parts: string[] = [];
    if (ctrl) parts.push('ctrl');
    if (alt) parts.push('alt');
    if (shift) parts.push('shift');
    parts.push(key);
    return parts.join('+');
  }

  /**
   * Bind a key combination to a callback
   */
  bind(binding: KeyBinding): void {
    const key = this.createBindingKey(
      binding.key.toLowerCase(),
      binding.ctrl || false,
      binding.alt || false,
      binding.shift || false
    );

    if (!this.bindings.has(key)) {
      this.bindings.set(key, []);
    }

    this.bindings.get(key)!.push(binding);
  }

  /**
   * Unbind a key combination
   */
  unbind(key: string, ctrl?: boolean, alt?: boolean, shift?: boolean): void {
    const bindingKey = this.createBindingKey(
      key.toLowerCase(),
      ctrl || false,
      alt || false,
      shift || false
    );

    this.bindings.delete(bindingKey);
  }

  /**
   * Unbind all keys
   */
  unbindAll(): void {
    this.bindings.clear();
  }

  /**
   * Check if a key is currently pressed
   */
  isKeyPressed(key: string): boolean {
    return this.pressedKeys.has(key.toLowerCase());
  }

  /**
   * Enable keyboard input
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disable keyboard input
   */
  disable(): void {
    this.enabled = false;
    this.pressedKeys.clear();
  }

  /**
   * Check if keyboard is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get all bindings
   */
  getBindings(): Map<string, KeyBinding[]> {
    return new Map(this.bindings);
  }

  /**
   * Get help text for all bindings
   */
  getHelpText(): string[] {
    const help: string[] = [];

    for (const [key, bindings] of this.bindings) {
      for (const binding of bindings) {
        if (binding.description) {
          help.push(`${key}: ${binding.description}`);
        }
      }
    }

    return help;
  }

  /**
   * Cleanup event listeners
   */
  destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    window.removeEventListener('blur', this.handleBlur.bind(this));
    this.bindings.clear();
    this.pressedKeys.clear();
  }
}

/**
 * Default game keyboard bindings
 */
export function createDefaultBindings(manager: KeyboardManager, callbacks: {
  onQuestLog?: () => void;
  onInventory?: () => void;
  onMenu?: () => void;
  onQuickSave?: () => void;
  onQuickLoad?: () => void;
  onHelp?: () => void;
}): void {
  // Quest Log (Q)
  if (callbacks.onQuestLog) {
    manager.bind({
      key: 'q',
      callback: callbacks.onQuestLog,
      description: 'Toggle Quest Log'
    });
  }

  // Inventory (I)
  if (callbacks.onInventory) {
    manager.bind({
      key: 'i',
      callback: callbacks.onInventory,
      description: 'Toggle Inventory'
    });
  }

  // Menu (Escape)
  if (callbacks.onMenu) {
    manager.bind({
      key: 'escape',
      callback: callbacks.onMenu,
      description: 'Open Menu'
    });
  }

  // Quick Save (F5 or Ctrl+S)
  if (callbacks.onQuickSave) {
    manager.bind({
      key: 'f5',
      callback: callbacks.onQuickSave,
      description: 'Quick Save'
    });
    manager.bind({
      key: 's',
      ctrl: true,
      callback: callbacks.onQuickSave,
      description: 'Quick Save (Ctrl+S)'
    });
  }

  // Quick Load (F9 or Ctrl+L)
  if (callbacks.onQuickLoad) {
    manager.bind({
      key: 'f9',
      callback: callbacks.onQuickLoad,
      description: 'Quick Load'
    });
    manager.bind({
      key: 'l',
      ctrl: true,
      callback: callbacks.onQuickLoad,
      description: 'Quick Load (Ctrl+L)'
    });
  }

  // Help (F1 or ?)
  if (callbacks.onHelp) {
    manager.bind({
      key: 'f1',
      callback: callbacks.onHelp,
      description: 'Show Help'
    });
    manager.bind({
      key: '?',
      callback: callbacks.onHelp,
      description: 'Show Help'
    });
  }
}
