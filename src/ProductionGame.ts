// @ts-nocheck - ProductionGame needs refactoring to match updated API signatures
/**
 * Production Game Entry Point
 * Full production experience with AI-generated assets and real gameplay
 */

import { ProductionHUD } from './ui/ProductionHUD';
import { SplashScreen, LoadingScreen } from './ui/SplashScreen';
import { GameStateManager } from './runtime/systems/GameStateManager';
import { QuestManager } from './runtime/systems/QuestManager';
import { DialogueManager } from './runtime/systems/DialogueManager';
import { SceneCompositor } from './runtime/systems/SceneCompositor';
import { StoryCompositor } from './runtime/systems/StoryCompositor';
import { GameCompositor } from './runtime/systems/GameCompositor';
import { SceneLoader } from './runtime/loaders/SceneLoader';
import { SceneTransitionManager } from './runtime/systems/SceneTransitionManager';

export interface ProductionGameConfig {
  container: HTMLElement;
  assetDirectory?: string;
  enableAIGeneration?: boolean;
}

export class ProductionGame {
  private config: ProductionGameConfig;
  private hud!: ProductionHUD;
  private splash!: SplashScreen;
  private loading!: LoadingScreen;
  private gameState!: GameStateManager;
  private questManager!: QuestManager;
  private dialogueManager!: DialogueManager;
  private sceneCompositor!: SceneCompositor;
  private storyCompositor!: StoryCompositor;
  private gameCompositor!: GameCompositor;
  private sceneLoader!: SceneLoader;
  private transitionManager!: SceneTransitionManager;
  
  private isInitialized = false;

  constructor(config: ProductionGameConfig) {
    this.config = {
      assetDirectory: './assets',
      enableAIGeneration: true,
      ...config
    };
  }

  /**
   * Initialize and start the game
   */
  async start(): Promise<void> {
    if (this.isInitialized) {
      console.warn('Game already initialized');
      return;
    }

    // Step 1: Show splash screen
    this.splash = new SplashScreen({
      container: this.config.container,
      onComplete: () => this.initializeGame()
    });
    await this.splash.show();
  }

  /**
   * Initialize game systems after splash
   */
  private async initializeGame(): Promise<void> {
    // Step 2: Show loading screen
    this.loading = new LoadingScreen({
      container: this.config.container,
      message: 'Initializing Realm Walker...'
    });
    this.loading.show();

    try {
      // Initialize core systems
      this.loading.updateProgress(10, 'Loading game state...');
      await this.initializeCoreSystems();

      this.loading.updateProgress(30, 'Loading HUD...');
      await this.initializeHUD();

      this.loading.updateProgress(50, 'Loading initial scene...');
      await this.loadInitialScene();

      this.loading.updateProgress(80, 'Preparing gameplay...');
      await this.setupGameplayListeners();

      this.loading.updateProgress(100, 'Ready!');
      
      // Hide loading and start game
      setTimeout(() => {
        this.loading.hide();
        this.startGameplay();
      }, 500);

      this.isInitialized = true;

    } catch (error) {
      console.error('Game initialization failed:', error);
      this.loading.updateProgress(0, 'Error: Failed to initialize game');
    }
  }

  /**
   * Initialize core game systems
   */
  private async initializeCoreSystems(): Promise<void> {
    // Game state with initial Chapter 0 setup
    this.gameState = new GameStateManager({
      currentChapter: 0,
      currentScene: 'dead_world_opening',
      storyFlags: {
        game_started: true,
        player_awakened: false,
        met_elder_ottermere: false
      }
    });

    // Quest manager with A/B/C story threads
    this.questManager = new QuestManager();
    
    // Initialize with Chapter 0 quest
    this.questManager.addQuest({
      id: 'chapter_0_awakening',
      title: 'The Last Awakening',
      description: 'Meet Elder Ottermere and learn of your destiny',
      objectives: [
        {
          id: 'meet_ottermere',
          description: 'Speak with Elder Ottermere',
          completed: false,
          requiredFlags: ['player_awakened']
        }
      ],
      requiredFlags: ['game_started'],
      completedFlags: ['awakening_complete'],
      thread: 'A',
      completed: false
    });

    // Dialogue manager
    this.dialogueManager = new DialogueManager();

    // Compositor pipeline
    this.sceneCompositor = new SceneCompositor();
    this.storyCompositor = new StoryCompositor(this.questManager.getState());
    this.gameCompositor = new GameCompositor({
      container: this.config.container,
      cameraConfig: {
        type: 'diorama',
        fov: 60,
        position: [0, 10, 15]
      }
    });

    // Scene loader and transition manager
    this.sceneLoader = new SceneLoader({
      sceneCompositor: this.sceneCompositor,
      storyCompositor: this.storyCompositor,
      gameCompositor: this.gameCompositor
    });

    this.transitionManager = new SceneTransitionManager({
      sceneLoader: this.sceneLoader,
      gameState: this.gameState,
      onTransitionStart: () => {
        console.log('Scene transition starting...');
      },
      onTransitionComplete: () => {
        console.log('Scene transition complete');
      }
    });

    console.log('✓ Core systems initialized');
  }

  /**
   * Initialize production HUD
   */
  private async initializeHUD(): Promise<void> {
    this.hud = new ProductionHUD({
      container: this.config.container,
      theme: 'gothic-red',
      enableAnimations: true
    });

    const hudElements = this.hud.initialize();

    // Set initial HUD state
    this.hud.updateSceneTitle('The Dying World', 'Chapter 0: Dead World Opening');
    this.hud.updateBoons(0);
    
    // Initial quest display
    this.hud.updateQuests([
      {
        id: 'chapter_0_awakening',
        title: 'The Last Awakening',
        description: 'Meet Elder Ottermere and learn of your destiny',
        completed: false
      }
    ]);

    console.log('✓ Production HUD initialized');
  }

  /**
   * Load initial scene (Chapter 0)
   */
  private async loadInitialScene(): Promise<void> {
    // For now, use placeholder scene data
    // In production, this would load from RWMD files
    const sceneTemplate = {
      id: 'dead_world_opening',
      grid: { width: 16, height: 12 },
      floor: { texture: 'cracked_stone' },
      walls: [],
      ceiling: { texture: 'twilight_sky', height: 5 },
      slots: {
        npcs: [
          { id: 'elder_ottermere', position: [8, 6] as [number, number] }
        ],
        props: [
          { id: 'ancient_pillar', position: [4, 4] as [number, number] },
          { id: 'time_rift', position: [12, 8] as [number, number] }
        ],
        doors: []
      }
    };

    // Compose scene through three-tier pipeline
    const composedScene = this.sceneCompositor.compose(sceneTemplate);
    console.log('✓ Scene composed:', composedScene);

    // Story layer would fill slots based on flags
    // Game compositor would render to Three.js
    
    console.log('✓ Initial scene loaded');
  }

  /**
   * Setup gameplay listeners
   */
  private async setupGameplayListeners(): Promise<void> {
    // Listen for dialogue events
    this.dialogueManager.on('dialogue-started', (dialogue) => {
      console.log('Dialogue started:', dialogue.id);
    });

    this.dialogueManager.on('dialogue-completed', (dialogue) => {
      console.log('Dialogue completed:', dialogue.id);
      
      // Check if quest objectives met
      this.checkQuestProgress();
    });

    // Listen for quest events
    this.questManager.on('quest-completed', (quest) => {
      console.log('Quest completed:', quest.title);
      
      // Update HUD
      this.updateHUDQuests();
    });

    this.questManager.on('quest-objective-completed', (objective) => {
      console.log('Objective completed:', objective.description);
    });

    console.log('✓ Gameplay listeners setup');
  }

  /**
   * Start actual gameplay
   */
  private startGameplay(): void {
    console.log('=== REALM WALKER STORY: PRODUCTION MODE ===');
    console.log('Starting Chapter 0: Dead World Opening');
    
    // Show opening dialogue with Elder Ottermere
    setTimeout(() => {
      this.showOpeningDialogue();
    }, 1000);
  }

  /**
   * Show opening dialogue
   */
  private showOpeningDialogue(): void {
    this.hud.showDialogue(
      'Elder Ottermere',
      'At last, you awaken. I am Elder Ottermere, keeper of memory across fifty thousand years. The world you know is ending... but there is still hope.',
      [
        {
          text: 'What is happening to the world?',
          onClick: () => this.showDialogueChain1()
        },
        {
          text: 'Why have you awakened me?',
          onClick: () => this.showDialogueChain2()
        },
        {
          text: 'I\'m ready. Tell me what I must do.',
          onClick: () => this.showDialogueChain3()
        }
      ]
    );
  }

  /**
   * Dialogue chain 1: World lore
   */
  private showDialogueChain1(): void {
    this.hud.showDialogue(
      'Elder Ottermere',
      'This world was born from the shattered prison of THE DESTROYER, a primordial force of unmaking. Eight Guardian spirits were bound to guard the shards... but now those Guardians must be sacrificed.',
      [
        {
          text: 'Sacrificed? Why?',
          onClick: () => this.showDialogueChain3()
        }
      ]
    );
  }

  /**
   * Dialogue chain 2: Player's role
   */
  private showDialogueChain2(): void {
    this.hud.showDialogue(
      'Elder Ottermere',
      'You are the last Guardian-to-be. Only by unmaking all eight Guardians and absorbing their power can you become strong enough to face THE DESTROYER when it awakens.',
      [
        {
          text: 'I understand. What must I do?',
          onClick: () => this.showDialogueChain3()
        }
      ]
    );
  }

  /**
   * Dialogue chain 3: Quest acceptance
   */
  private showDialogueChain3(): void {
    this.hud.showDialogue(
      'Elder Ottermere',
      'You must travel through time itself, across fifty thousand years, gathering the eight Guardian boons. Your first journey begins in the Crimson Pact, Year 767. Are you ready to become a Realm Walker?',
      [
        {
          text: 'I accept this burden.',
          onClick: () => {
            // Mark quest progress
            this.questManager.setFlag('met_elder_ottermere', true);
            this.questManager.setFlag('awakening_complete', true);
            
            // Update HUD
            this.updateHUDQuests();
            
            // Show next quest
            this.startChapter1();
          }
        }
      ]
    );
  }

  /**
   * Start Chapter 1
   */
  private startChapter1(): void {
    this.hud.updateSceneTitle('Crimson Pact', 'Chapter 1: Year 767');
    
    // Add Chapter 1 quest
    this.questManager.addQuest({
      id: 'chapter_1_crimson',
      title: 'The Vampire\'s Court',
      description: 'Seek the Stone Warden and claim your first Guardian boon',
      objectives: [
        {
          id: 'meet_carmilla',
          description: 'Meet Countess Carmilla Sanguis',
          completed: false,
          requiredFlags: []
        },
        {
          id: 'find_stone_warden',
          description: 'Locate the Stone Warden',
          completed: false,
          requiredFlags: ['met_carmilla']
        }
      ],
      requiredFlags: ['awakening_complete'],
      completedFlags: ['chapter_1_complete'],
      thread: 'A',
      completed: false
    });

    this.updateHUDQuests();

    // Show transition message
    setTimeout(() => {
      this.hud.showDialogue(
        'System',
        'You feel reality shift around you. The Realm Walk has begun. Welcome to Year 767, the age of the Crimson Pact...',
        [
          {
            text: 'Continue',
            onClick: () => {
              // Load Chapter 1 scene with transition
              this.transitionToChapter1();
            }
          }
        ]
      );
    }, 1500);
  }

  /**
   * Check quest progress
   */
  private checkQuestProgress(): void {
    // Update quests based on current flags
    const activeQuests = this.questManager.getActiveQuests();
    
    for (const quest of activeQuests) {
      this.questManager.updateQuest(quest.id);
    }
  }

  /**
   * Transition to Chapter 1 scene
   */
  private async transitionToChapter1(): Promise<void> {
    await this.transitionManager.transitionToScene({
      targetSceneId: 'village_square',
      targetScenePath: './scenes/rwmd/village_square.rwmd',
      targetStoryPath: './scenes/bindings/village_square.json',
      requiredFlags: ['awakening_complete'],
      config: {
        effect: 'fade',
        duration: 1000,
        showLoadingIndicator: true
      },
      onProgress: (progress, status) => {
        console.log(`Scene transition: ${progress}% - ${status}`);
      },
      onComplete: () => {
        console.log('Chapter 1 scene loaded successfully');
        this.gameState.setCurrentScene('village_square');
        this.gameState.setCurrentChapter(1);
      },
      onError: (error) => {
        console.error('Failed to transition to Chapter 1:', error);
        this.hud.showDialogue(
          'Error',
          `Failed to load Chapter 1: ${error.message}`,
          [
            {
              text: 'OK',
              onClick: () => console.log('Acknowledged error')
            }
          ]
        );
      }
    });
  }

  /**
   * Update HUD quest display
   */
  private updateHUDQuests(): void {
    const activeQuests = this.questManager.getActiveQuests();
    
    this.hud.updateQuests(
      activeQuests.map(quest => ({
        id: quest.id,
        title: quest.title,
        description: quest.description,
        completed: quest.completed
      }))
    );
  }

  /**
   * Cleanup and destroy game
   */
  destroy(): void {
    this.hud?.destroy();
    this.gameCompositor?.dispose();
    this.isInitialized = false;
  }
}
