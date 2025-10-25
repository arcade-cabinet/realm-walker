/**
 * QuestLogUI - Visual quest tracker UI component
 * Displays active and completed quests
 */

export interface QuestInfo {
  id: string;
  title: string;
  description: string;
  objectives?: string[];
  completed?: boolean;
  progress?: {
    current: number;
    total: number;
  };
}

export interface QuestLogUIOptions {
  container: HTMLElement;
  onQuestSelect?: (questId: string) => void;
  theme?: 'default' | 'dark' | 'fantasy';
}

export class QuestLogUI {
  private container: HTMLElement;
  private questLogPanel: HTMLDivElement;
  private activeQuestsContainer: HTMLDivElement;
  private completedQuestsContainer: HTMLDivElement;
  private onQuestSelectCallback?: (questId: string) => void;
  private isVisible: boolean = false;

  constructor(options: QuestLogUIOptions) {
    this.container = options.container;
    this.onQuestSelectCallback = options.onQuestSelect;

    this.questLogPanel = this.createQuestLog(options.theme || 'default');
    this.activeQuestsContainer = this.questLogPanel.querySelector('.quest-log-active') as HTMLDivElement;
    this.completedQuestsContainer = this.questLogPanel.querySelector('.quest-log-completed') as HTMLDivElement;

    this.injectStyles();
    this.hide();
  }

  /**
   * Create quest log HTML structure
   */
  private createQuestLog(theme: string): HTMLDivElement {
    const panel = document.createElement('div');
    panel.className = `quest-log-panel quest-log-theme-${theme}`;
    panel.innerHTML = `
      <div class="quest-log-header">
        <h2 class="quest-log-title">Quest Log</h2>
        <button class="quest-log-close">✕</button>
      </div>
      <div class="quest-log-content">
        <div class="quest-log-section">
          <h3 class="quest-log-section-title">Active Quests</h3>
          <div class="quest-log-active"></div>
        </div>
        <div class="quest-log-section">
          <h3 class="quest-log-section-title">Completed Quests</h3>
          <div class="quest-log-completed"></div>
        </div>
      </div>
    `;

    // Add close button handler
    const closeBtn = panel.querySelector('.quest-log-close') as HTMLButtonElement;
    closeBtn.onclick = () => this.hide();

    this.container.appendChild(panel);
    return panel;
  }

  /**
   * Inject CSS styles
   */
  private injectStyles(): void {
    if (document.getElementById('quest-log-ui-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'quest-log-ui-styles';
    style.textContent = `
      .quest-log-panel {
        position: fixed;
        top: 50%;
        right: 20px;
        transform: translateY(-50%);
        width: 400px;
        max-height: 80vh;
        background: rgba(0, 0, 0, 0.9);
        border: 2px solid #555;
        border-radius: 10px;
        padding: 20px;
        color: white;
        font-family: 'Georgia', serif;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.7);
        z-index: 900;
        display: none;
        overflow-y: auto;
      }

      .quest-log-panel.visible {
        display: block;
        animation: slideInRight 0.3s ease-out;
      }

      @keyframes slideInRight {
        from {
          transform: translateY(-50%) translateX(50px);
          opacity: 0;
        }
        to {
          transform: translateY(-50%) translateX(0);
          opacity: 1;
        }
      }

      .quest-log-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 2px solid #ffd700;
      }

      .quest-log-title {
        margin: 0;
        font-size: 1.5em;
        color: #ffd700;
        text-transform: uppercase;
        letter-spacing: 2px;
      }

      .quest-log-close {
        background: none;
        border: none;
        color: #fff;
        font-size: 1.5em;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 5px;
        transition: background 0.2s;
      }

      .quest-log-close:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .quest-log-content {
        display: flex;
        flex-direction: column;
        gap: 25px;
      }

      .quest-log-section {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .quest-log-section-title {
        font-size: 1.2em;
        color: #ccc;
        margin: 0;
        padding-bottom: 8px;
        border-bottom: 1px solid #444;
      }

      .quest-item {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid #444;
        border-left: 4px solid #ffd700;
        border-radius: 5px;
        padding: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .quest-item:hover {
        background: rgba(255, 255, 255, 0.1);
        border-left-color: #ffed4e;
        transform: translateX(5px);
      }

      .quest-item.completed {
        border-left-color: #4caf50;
        opacity: 0.7;
      }

      .quest-item-title {
        font-size: 1.1em;
        font-weight: bold;
        color: #fff;
        margin: 0 0 5px 0;
      }

      .quest-item.completed .quest-item-title::after {
        content: ' ✓';
        color: #4caf50;
      }

      .quest-item-description {
        font-size: 0.9em;
        color: #ccc;
        margin: 0 0 8px 0;
        line-height: 1.4;
      }

      .quest-item-objectives {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .quest-item-objective {
        font-size: 0.85em;
        color: #aaa;
        padding: 3px 0;
        padding-left: 15px;
        position: relative;
      }

      .quest-item-objective::before {
        content: '▪';
        position: absolute;
        left: 0;
        color: #ffd700;
      }

      .quest-item-progress {
        font-size: 0.85em;
        color: #ffd700;
        margin-top: 5px;
        font-weight: bold;
      }

      .quest-log-empty {
        text-align: center;
        padding: 20px;
        color: #666;
        font-style: italic;
      }

      /* Dark theme */
      .quest-log-theme-dark {
        background: rgba(20, 20, 30, 0.95);
        border-color: #2a2a3a;
      }

      /* Fantasy theme */
      .quest-log-theme-fantasy {
        background: linear-gradient(135deg, rgba(101, 67, 33, 0.95), rgba(139, 69, 19, 0.95));
        border: 3px solid #d4af37;
      }

      .quest-log-theme-fantasy .quest-log-title {
        color: #d4af37;
      }

      .quest-log-theme-fantasy .quest-item {
        border-left-color: #d4af37;
      }

      /* Mobile responsive */
      @media (max-width: 768px) {
        .quest-log-panel {
          width: calc(100% - 40px);
          right: 20px;
          left: 20px;
          max-height: 70vh;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Update quest log with active and completed quests
   */
  update(activeQuests: QuestInfo[], completedQuests: QuestInfo[]): void {
    // Update active quests
    this.activeQuestsContainer.innerHTML = '';
    if (activeQuests.length === 0) {
      this.activeQuestsContainer.innerHTML = '<div class="quest-log-empty">No active quests</div>';
    } else {
      activeQuests.forEach(quest => {
        this.activeQuestsContainer.appendChild(this.createQuestItem(quest, false));
      });
    }

    // Update completed quests
    this.completedQuestsContainer.innerHTML = '';
    if (completedQuests.length === 0) {
      this.completedQuestsContainer.innerHTML = '<div class="quest-log-empty">No completed quests</div>';
    } else {
      completedQuests.forEach(quest => {
        this.completedQuestsContainer.appendChild(this.createQuestItem(quest, true));
      });
    }
  }

  /**
   * Create a quest item element
   */
  private createQuestItem(quest: QuestInfo, completed: boolean): HTMLDivElement {
    const item = document.createElement('div');
    item.className = `quest-item${completed ? ' completed' : ''}`;
    item.onclick = () => this.handleQuestClick(quest.id);

    let html = `
      <h4 class="quest-item-title">${quest.title}</h4>
      <p class="quest-item-description">${quest.description}</p>
    `;

    if (quest.objectives && quest.objectives.length > 0) {
      html += '<ul class="quest-item-objectives">';
      quest.objectives.forEach(obj => {
        html += `<li class="quest-item-objective">${obj}</li>`;
      });
      html += '</ul>';
    }

    if (quest.progress) {
      html += `<div class="quest-item-progress">${quest.progress.current}/${quest.progress.total}</div>`;
    }

    item.innerHTML = html;
    return item;
  }

  /**
   * Handle quest item click
   */
  private handleQuestClick(questId: string): void {
    if (this.onQuestSelectCallback) {
      this.onQuestSelectCallback(questId);
    }
  }

  /**
   * Show quest log
   */
  show(): void {
    this.questLogPanel.classList.add('visible');
    this.isVisible = true;
  }

  /**
   * Hide quest log
   */
  hide(): void {
    this.questLogPanel.classList.remove('visible');
    this.isVisible = false;
  }

  /**
   * Toggle quest log visibility
   */
  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Check if quest log is visible
   */
  getIsVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Destroy quest log UI
   */
  destroy(): void {
    this.questLogPanel.remove();
  }
}
