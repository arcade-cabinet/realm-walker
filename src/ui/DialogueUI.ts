/**
 * DialogueUI - HTML/CSS-based dialogue box component
 * Renders dialogue trees with choices
 */

export interface DialogueUIOptions {
  container: HTMLElement;
  onChoice?: (choiceIndex: number) => void;
  theme?: 'default' | 'dark' | 'fantasy';
}

export class DialogueUI {
  private container: HTMLElement;
  private dialogueBox: HTMLDivElement;
  private speakerName: HTMLDivElement;
  private dialogueText: HTMLParagraphElement;
  private choicesContainer: HTMLDivElement;
  private onChoiceCallback?: (choiceIndex: number) => void;

  constructor(options: DialogueUIOptions) {
    this.container = options.container;
    this.onChoiceCallback = options.onChoice;

    this.dialogueBox = this.createDialogueBox(options.theme || 'default');
    this.speakerName = this.dialogueBox.querySelector('.dialogue-speaker') as HTMLDivElement;
    this.dialogueText = this.dialogueBox.querySelector('.dialogue-text') as HTMLParagraphElement;
    this.choicesContainer = this.dialogueBox.querySelector('.dialogue-choices') as HTMLDivElement;

    this.hide();
  }

  /**
   * Create dialogue box HTML structure
   */
  private createDialogueBox(theme: string): HTMLDivElement {
    const box = document.createElement('div');
    box.className = `dialogue-box dialogue-theme-${theme}`;
    box.innerHTML = `
      <div class="dialogue-header">
        <div class="dialogue-speaker"></div>
      </div>
      <div class="dialogue-body">
        <p class="dialogue-text"></p>
      </div>
      <div class="dialogue-choices"></div>
    `;

    // Add styles
    this.injectStyles();

    this.container.appendChild(box);
    return box;
  }

  /**
   * Inject CSS styles
   */
  private injectStyles(): void {
    if (document.getElementById('dialogue-ui-styles')) {
      return; // Already injected
    }

    const style = document.createElement('style');
    style.id = 'dialogue-ui-styles';
    style.textContent = `
      .dialogue-box {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 80%;
        max-width: 800px;
        background: rgba(0, 0, 0, 0.85);
        border: 2px solid #444;
        border-radius: 10px;
        padding: 20px;
        color: white;
        font-family: 'Georgia', serif;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        z-index: 1000;
        display: none;
      }

      .dialogue-box.visible {
        display: block;
        animation: slideUp 0.3s ease-out;
      }

      @keyframes slideUp {
        from {
          transform: translateX(-50%) translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }

      .dialogue-header {
        margin-bottom: 15px;
      }

      .dialogue-speaker {
        font-size: 1.2em;
        font-weight: bold;
        color: #ffd700;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .dialogue-body {
        margin-bottom: 20px;
      }

      .dialogue-text {
        font-size: 1.1em;
        line-height: 1.6;
        margin: 0;
      }

      .dialogue-choices {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .dialogue-choice {
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid #666;
        border-radius: 5px;
        padding: 12px 20px;
        color: white;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 1em;
        text-align: left;
      }

      .dialogue-choice:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: #ffd700;
        transform: translateX(5px);
      }

      .dialogue-choice:active {
        transform: translateX(5px) scale(0.98);
      }

      /* Dark theme */
      .dialogue-theme-dark {
        background: rgba(20, 20, 30, 0.95);
        border-color: #2a2a3a;
      }

      /* Fantasy theme */
      .dialogue-theme-fantasy {
        background: linear-gradient(135deg, rgba(139, 69, 19, 0.9), rgba(101, 67, 33, 0.9));
        border: 3px solid #d4af37;
        border-radius: 15px;
      }

      .dialogue-theme-fantasy .dialogue-speaker {
        color: #d4af37;
      }

      .dialogue-theme-fantasy .dialogue-choice {
        border-color: #8b4513;
        background: rgba(0, 0, 0, 0.3);
      }

      .dialogue-theme-fantasy .dialogue-choice:hover {
        border-color: #d4af37;
        background: rgba(255, 215, 0, 0.2);
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Show dialogue with speaker and text
   */
  show(speaker: string, text: string, choices: string[] = []): void {
    this.speakerName.textContent = speaker;
    this.dialogueText.textContent = text;

    this.choicesContainer.innerHTML = '';

    if (choices.length > 0) {
      choices.forEach((choiceText, index) => {
        const button = document.createElement('button');
        button.className = 'dialogue-choice';
        button.textContent = choiceText;
        button.onclick = () => this.handleChoice(index);
        this.choicesContainer.appendChild(button);
      });
    }

    this.dialogueBox.classList.add('visible');
  }

  /**
   * Hide dialogue box
   */
  hide(): void {
    this.dialogueBox.classList.remove('visible');
  }

  /**
   * Handle choice selection
   */
  private handleChoice(index: number): void {
    if (this.onChoiceCallback) {
      this.onChoiceCallback(index);
    }
  }

  /**
   * Check if dialogue is visible
   */
  isVisible(): boolean {
    return this.dialogueBox.classList.contains('visible');
  }

  /**
   * Destroy dialogue UI
   */
  destroy(): void {
    this.dialogueBox.remove();
  }
}
