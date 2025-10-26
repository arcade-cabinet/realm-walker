/**
 * Production HUD System for Realm Walker Story
 * Gothic fantasy aesthetic with blood-red/crimson theme
 */

export interface HUDConfig {
  container: HTMLElement;
  theme?: 'gothic-red' | 'twilight-purple' | 'void-black';
  enableAnimations?: boolean;
}

export interface HUDElements {
  questTracker: HTMLElement;
  dialogueBox: HTMLElement;
  sceneTitle: HTMLElement;
  boonCounter: HTMLElement;
  healthBar?: HTMLElement;
  minimap?: HTMLElement;
}

export class ProductionHUD {
  private config: HUDConfig;
  private elements!: HUDElements;
  private isInitialized = false;

  constructor(config: HUDConfig) {
    this.config = {
      theme: 'gothic-red',
      enableAnimations: true,
      ...config
    };
  }

  /**
   * Initialize HUD and inject styles
   */
  initialize(): HUDElements {
    if (this.isInitialized) {
      return this.elements;
    }

    this.injectStyles();
    this.elements = this.createHUDElements();
    this.attachToContainer();
    
    this.isInitialized = true;
    return this.elements;
  }

  /**
   * Inject Gothic Fantasy CSS
   */
  private injectStyles(): void {
    const styleId = 'realm-walker-hud-styles';
    
    // Don't inject twice
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Gothic Fantasy Theme Variables */
      :root {
        --rw-blood-red: #8B0000;
        --rw-crimson: #DC143C;
        --rw-dark-red: #4A0000;
        --rw-gold: #FFD700;
        --rw-silver: #C0C0C0;
        --rw-shadow: rgba(0, 0, 0, 0.85);
        --rw-glow: rgba(220, 20, 60, 0.6);
        --rw-border: 2px solid var(--rw-crimson);
        --rw-font-header: 'Cinzel', 'Times New Roman', serif;
        --rw-font-body: 'Cormorant Garamond', Georgia, serif;
      }

      /* HUD Container */
      .rw-hud-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 1000;
        font-family: var(--rw-font-body);
      }

      .rw-hud-container * {
        pointer-events: auto;
      }

      /* Scene Title Banner */
      .rw-scene-title {
        position: absolute;
        top: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(180deg, var(--rw-shadow) 0%, transparent 100%);
        padding: 20px 60px;
        border-bottom: var(--rw-border);
        text-align: center;
        animation: slideDown 0.6s ease-out;
      }

      .rw-scene-title h1 {
        margin: 0;
        font-family: var(--rw-font-header);
        font-size: 2.5em;
        color: var(--rw-gold);
        text-shadow: 0 0 20px var(--rw-glow),
                     2px 2px 4px rgba(0, 0, 0, 0.8);
        letter-spacing: 3px;
      }

      .rw-scene-subtitle {
        font-size: 1em;
        color: var(--rw-silver);
        margin-top: 5px;
        font-style: italic;
      }

      /* Boon Counter (Top Right) */
      .rw-boon-counter {
        position: absolute;
        top: 30px;
        right: 30px;
        background: var(--rw-shadow);
        border: var(--rw-border);
        border-radius: 12px;
        padding: 20px 30px;
        min-width: 200px;
        box-shadow: 0 0 30px var(--rw-glow);
      }

      .rw-boon-header {
        font-family: var(--rw-font-header);
        font-size: 1.2em;
        color: var(--rw-gold);
        margin-bottom: 10px;
        text-align: center;
        letter-spacing: 2px;
      }

      .rw-boon-display {
        display: flex;
        justify-content: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .rw-boon-shard {
        width: 32px;
        height: 32px;
        background: var(--rw-dark-red);
        border: 2px solid var(--rw-blood-red);
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2em;
        transition: all 0.3s ease;
      }

      .rw-boon-shard.collected {
        background: var(--rw-crimson);
        border-color: var(--rw-gold);
        box-shadow: 0 0 15px var(--rw-glow);
        animation: boonPulse 2s ease-in-out infinite;
      }

      @keyframes boonPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      /* Quest Tracker (Bottom Right) */
      .rw-quest-tracker {
        position: absolute;
        bottom: 30px;
        right: 30px;
        background: var(--rw-shadow);
        border: var(--rw-border);
        border-radius: 12px;
        padding: 20px;
        max-width: 350px;
        max-height: 400px;
        overflow-y: auto;
        box-shadow: 0 0 30px var(--rw-glow);
      }

      .rw-quest-header {
        font-family: var(--rw-font-header);
        font-size: 1.4em;
        color: var(--rw-gold);
        margin-bottom: 15px;
        border-bottom: 1px solid var(--rw-crimson);
        padding-bottom: 10px;
        letter-spacing: 2px;
      }

      .rw-quest-item {
        margin: 12px 0;
        padding: 12px;
        background: rgba(139, 0, 0, 0.2);
        border-left: 3px solid var(--rw-crimson);
        border-radius: 4px;
        transition: all 0.3s ease;
      }

      .rw-quest-item:hover {
        background: rgba(139, 0, 0, 0.4);
        transform: translateX(5px);
      }

      .rw-quest-title {
        font-weight: bold;
        color: var(--rw-gold);
        margin-bottom: 5px;
      }

      .rw-quest-desc {
        font-size: 0.9em;
        color: var(--rw-silver);
        line-height: 1.4;
      }

      .rw-quest-completed {
        opacity: 0.5;
        text-decoration: line-through;
        border-left-color: var(--rw-silver);
      }

      /* Dialogue Box (Bottom Center) */
      .rw-dialogue-box {
        position: absolute;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--rw-shadow);
        border: var(--rw-border);
        border-radius: 12px;
        padding: 25px 35px;
        max-width: 700px;
        width: 85%;
        box-shadow: 0 0 40px var(--rw-glow);
        display: none;
      }

      .rw-dialogue-box.active {
        display: block;
        animation: slideUp 0.4s ease-out;
      }

      .rw-dialogue-speaker {
        font-family: var(--rw-font-header);
        font-size: 1.3em;
        color: var(--rw-gold);
        margin-bottom: 10px;
        letter-spacing: 1px;
      }

      .rw-dialogue-text {
        color: #fff;
        line-height: 1.8;
        font-size: 1.1em;
        margin-bottom: 20px;
      }

      .rw-dialogue-choices {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .rw-dialogue-choice {
        background: rgba(139, 0, 0, 0.3);
        border: 1px solid var(--rw-crimson);
        color: #fff;
        padding: 12px 20px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: left;
        font-family: var(--rw-font-body);
        font-size: 1em;
      }

      .rw-dialogue-choice:hover {
        background: rgba(139, 0, 0, 0.6);
        border-color: var(--rw-gold);
        transform: translateX(10px);
        box-shadow: 0 0 15px var(--rw-glow);
      }

      /* Animations */
      @keyframes slideDown {
        from {
          transform: translate(-50%, -100%);
          opacity: 0;
        }
        to {
          transform: translate(-50%, 0);
          opacity: 1;
        }
      }

      @keyframes slideUp {
        from {
          transform: translate(-50%, 100%);
          opacity: 0;
        }
        to {
          transform: translate(-50%, 0);
          opacity: 1;
        }
      }

      /* Scrollbar styling */
      .rw-quest-tracker::-webkit-scrollbar {
        width: 8px;
      }

      .rw-quest-tracker::-webkit-scrollbar-track {
        background: var(--rw-dark-red);
        border-radius: 4px;
      }

      .rw-quest-tracker::-webkit-scrollbar-thumb {
        background: var(--rw-crimson);
        border-radius: 4px;
      }

      .rw-quest-tracker::-webkit-scrollbar-thumb:hover {
        background: var(--rw-gold);
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Create HUD DOM elements
   */
  private createHUDElements(): HUDElements {
    // Main HUD container
    const hudContainer = document.createElement('div');
    hudContainer.className = 'rw-hud-container';

    // Scene Title
    const sceneTitle = document.createElement('div');
    sceneTitle.className = 'rw-scene-title';
    sceneTitle.innerHTML = `
      <h1>The Dying World</h1>
      <div class="rw-scene-subtitle">Chapter 0: Dead World Opening</div>
    `;

    // Boon Counter
    const boonCounter = document.createElement('div');
    boonCounter.className = 'rw-boon-counter';
    boonCounter.innerHTML = `
      <div class="rw-boon-header">Guardian Boons</div>
      <div class="rw-boon-display">
        ${Array.from({ length: 8 }, (_, i) => `
          <div class="rw-boon-shard" data-shard="${i}">◇</div>
        `).join('')}
      </div>
    `;

    // Quest Tracker
    const questTracker = document.createElement('div');
    questTracker.className = 'rw-quest-tracker';
    questTracker.innerHTML = `
      <div class="rw-quest-header">⚔ Active Quests</div>
      <div class="rw-quest-list" data-quest-list></div>
    `;

    // Dialogue Box
    const dialogueBox = document.createElement('div');
    dialogueBox.className = 'rw-dialogue-box';
    dialogueBox.innerHTML = `
      <div class="rw-dialogue-speaker" data-speaker>Elder Ottermere</div>
      <div class="rw-dialogue-text" data-text>
        Welcome, Realm Walker. You stand at the threshold of destiny...
      </div>
      <div class="rw-dialogue-choices" data-choices></div>
    `;

    // Assemble HUD
    hudContainer.appendChild(sceneTitle);
    hudContainer.appendChild(boonCounter);
    hudContainer.appendChild(questTracker);
    hudContainer.appendChild(dialogueBox);

    return {
      questTracker,
      dialogueBox,
      sceneTitle,
      boonCounter
    };
  }

  /**
   * Attach HUD to container
   */
  private attachToContainer(): void {
    const hudContainer = document.querySelector('.rw-hud-container');
    if (hudContainer) {
      this.config.container.appendChild(hudContainer);
    }
  }

  /**
   * Update scene title
   */
  updateSceneTitle(title: string, subtitle?: string): void {
    const titleElement = this.elements.sceneTitle.querySelector('h1');
    const subtitleElement = this.elements.sceneTitle.querySelector('.rw-scene-subtitle');
    
    if (titleElement) titleElement.textContent = title;
    if (subtitleElement && subtitle) subtitleElement.textContent = subtitle;
  }

  /**
   * Update boon counter
   */
  updateBoons(collectedCount: number): void {
    const shards = this.elements.boonCounter.querySelectorAll('.rw-boon-shard');
    shards.forEach((shard, index) => {
      if (index < collectedCount) {
        shard.classList.add('collected');
        shard.textContent = '◆';
      } else {
        shard.classList.remove('collected');
        shard.textContent = '◇';
      }
    });
  }

  /**
   * Update quest tracker
   */
  updateQuests(quests: Array<{ id: string; title: string; description: string; completed: boolean }>): void {
    const questList = this.elements.questTracker.querySelector('[data-quest-list]');
    if (!questList) return;

    questList.innerHTML = quests.map(quest => `
      <div class="rw-quest-item ${quest.completed ? 'rw-quest-completed' : ''}" data-quest-id="${quest.id}">
        <div class="rw-quest-title">${quest.title}</div>
        <div class="rw-quest-desc">${quest.description}</div>
      </div>
    `).join('');
  }

  /**
   * Show dialogue
   */
  showDialogue(speaker: string, text: string, choices: Array<{ text: string; onClick: () => void }>): void {
    const speakerElement = this.elements.dialogueBox.querySelector('[data-speaker]');
    const textElement = this.elements.dialogueBox.querySelector('[data-text]');
    const choicesElement = this.elements.dialogueBox.querySelector('[data-choices]');

    if (speakerElement) speakerElement.textContent = speaker;
    if (textElement) textElement.textContent = text;
    
    if (choicesElement) {
      choicesElement.innerHTML = choices.map((choice, index) => `
        <button class="rw-dialogue-choice" data-choice="${index}">${choice.text}</button>
      `).join('');

      // Attach click handlers
      choicesElement.querySelectorAll('.rw-dialogue-choice').forEach((button, index) => {
        button.addEventListener('click', () => {
          choices[index].onClick();
          this.hideDialogue();
        });
      });
    }

    this.elements.dialogueBox.classList.add('active');
  }

  /**
   * Hide dialogue
   */
  hideDialogue(): void {
    this.elements.dialogueBox.classList.remove('active');
  }

  /**
   * Destroy HUD
   */
  destroy(): void {
    const hudContainer = document.querySelector('.rw-hud-container');
    if (hudContainer) {
      hudContainer.remove();
    }
    this.isInitialized = false;
  }
}
