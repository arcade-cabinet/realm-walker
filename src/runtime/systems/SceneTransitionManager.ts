/**
 * SceneTransitionManager - Handles smooth scene transitions with loading states
 * Manages fade effects, asset cleanup, and state preservation
 */

import { SceneLoader, LoadedScene } from '../loaders/SceneLoader';
import { QuestFlags } from '../../types';

export interface TransitionConfig {
  effect: 'fade' | 'instant' | 'slide';
  duration: number; // milliseconds
  showLoadingIndicator: boolean;
  preserveAudio: boolean;
  cleanupPreviousScene: boolean;
}

export interface SceneTransitionOptions {
  targetSceneId: string;
  targetScenePath: string;
  targetStoryPath: string;
  requiredFlags?: string[];
  config?: Partial<TransitionConfig>;
  onProgress?: (progress: number, status: string) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export interface TransitionState {
  isTransitioning: boolean;
  progress: number;
  currentPhase: 'idle' | 'fadeOut' | 'loading' | 'fadeIn' | 'complete';
  error?: Error;
}

/**
 * Default transition configuration
 */
const DEFAULT_CONFIG: TransitionConfig = {
  effect: 'fade',
  duration: 800,
  showLoadingIndicator: true,
  preserveAudio: false,
  cleanupPreviousScene: true
};

export class SceneTransitionManager {
  private sceneLoader: SceneLoader;
  private state: TransitionState;
  private currentConfig: TransitionConfig;
  private transitionElement: HTMLElement | null = null;
  private loadingElement: HTMLElement | null = null;

  constructor(sceneLoader: SceneLoader) {
    this.sceneLoader = sceneLoader;
    this.state = {
      isTransitioning: false,
      progress: 0,
      currentPhase: 'idle'
    };
    this.currentConfig = DEFAULT_CONFIG;
    this.createTransitionElements();
  }

  /**
   * Initiate a scene transition
   */
  async transitionToScene(options: SceneTransitionOptions): Promise<void> {
    const {
      targetSceneId,
      targetScenePath,
      targetStoryPath,
      requiredFlags = [],
      config = {},
      onProgress,
      onComplete,
      onError
    } = options;

    // Merge config with defaults
    this.currentConfig = { ...DEFAULT_CONFIG, ...config };

    // Check if already transitioning
    if (this.state.isTransitioning) {
      const error = new Error('Transition already in progress');
      onError?.(error);
      return;
    }

    // Check required flags
    const currentFlags = this.sceneLoader.getCompositors().story.getFlags();
    if (!this.checkRequiredFlags(requiredFlags, currentFlags)) {
      const error = new Error(`Missing required flags: ${requiredFlags.join(', ')}`);
      onError?.(error);
      return;
    }

    try {
      this.state.isTransitioning = true;
      this.state.error = undefined;

      // Phase 1: Fade Out
      this.state.currentPhase = 'fadeOut';
      this.state.progress = 0;
      onProgress?.(0, 'Fading out...');
      await this.fadeOut();

      // Phase 2: Loading
      this.state.currentPhase = 'loading';
      this.state.progress = 30;
      onProgress?.(30, 'Loading scene...');
      
      if (this.currentConfig.showLoadingIndicator) {
        this.showLoadingIndicator();
      }

      // Load the new scene
      await this.loadScene(targetSceneId, targetScenePath, targetStoryPath, onProgress);

      // Phase 3: Cleanup
      if (this.currentConfig.cleanupPreviousScene) {
        this.state.progress = 80;
        onProgress?.(80, 'Cleaning up...');
        await this.cleanup();
      }

      // Phase 4: Fade In
      this.state.currentPhase = 'fadeIn';
      this.state.progress = 90;
      onProgress?.(90, 'Fading in...');
      
      if (this.currentConfig.showLoadingIndicator) {
        this.hideLoadingIndicator();
      }
      
      await this.fadeIn();

      // Complete
      this.state.currentPhase = 'complete';
      this.state.progress = 100;
      this.state.isTransitioning = false;
      onProgress?.(100, 'Complete');
      onComplete?.();

    } catch (error) {
      this.state.error = error as Error;
      this.state.isTransitioning = false;
      this.state.currentPhase = 'idle';
      onError?.(error as Error);
      
      // Clean up UI elements on error
      this.hideLoadingIndicator();
      this.hideFade();
    }
  }

  /**
   * Check if all required flags are present
   */
  private checkRequiredFlags(required: string[], current: QuestFlags): boolean {
    return required.every(flag => current[flag] === true);
  }

  /**
   * Load the new scene
   */
  private async loadScene(
    sceneId: string,
    scenePath: string,
    storyPath: string,
    onProgress?: (progress: number, status: string) => void
  ): Promise<void> {
    // Preload adjacent scenes for faster future transitions
    await this.sceneLoader.loadScene(sceneId, scenePath, storyPath, {
      useCache: true,
      preloadAdjacent: true
    });

    onProgress?.(70, 'Scene loaded');
  }

  /**
   * Cleanup previous scene assets
   */
  private async cleanup(): Promise<void> {
    // The SceneLoader handles LRU caching automatically
    // Additional cleanup can be added here if needed
    return Promise.resolve();
  }

  /**
   * Fade out transition effect
   */
  private async fadeOut(): Promise<void> {
    if (this.currentConfig.effect === 'instant') {
      return Promise.resolve();
    }

    if (!this.transitionElement) {
      return Promise.resolve();
    }

    this.transitionElement.style.display = 'block';
    this.transitionElement.style.opacity = '0';

    // Force reflow to ensure CSS transition triggers
    void this.transitionElement.offsetHeight;

    return new Promise((resolve) => {
      if (!this.transitionElement) {
        resolve();
        return;
      }

      this.transitionElement.style.transition = `opacity ${this.currentConfig.duration}ms ease-in-out`;
      this.transitionElement.style.opacity = '1';

      setTimeout(resolve, this.currentConfig.duration);
    });
  }

  /**
   * Fade in transition effect
   */
  private async fadeIn(): Promise<void> {
    if (this.currentConfig.effect === 'instant') {
      this.hideFade();
      return Promise.resolve();
    }

    if (!this.transitionElement) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      if (!this.transitionElement) {
        resolve();
        return;
      }

      this.transitionElement.style.transition = `opacity ${this.currentConfig.duration}ms ease-in-out`;
      this.transitionElement.style.opacity = '0';

      setTimeout(() => {
        this.hideFade();
        resolve();
      }, this.currentConfig.duration);
    });
  }

  /**
   * Hide the fade overlay
   */
  private hideFade(): void {
    if (this.transitionElement) {
      this.transitionElement.style.display = 'none';
    }
  }

  /**
   * Show loading indicator
   */
  private showLoadingIndicator(): void {
    if (this.loadingElement) {
      this.loadingElement.style.display = 'flex';
    }
  }

  /**
   * Hide loading indicator
   */
  private hideLoadingIndicator(): void {
    if (this.loadingElement) {
      this.loadingElement.style.display = 'none';
    }
  }

  /**
   * Create transition overlay elements
   */
  private createTransitionElements(): void {
    // Create fade overlay
    this.transitionElement = document.createElement('div');
    this.transitionElement.id = 'scene-transition-fade';
    this.transitionElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #000;
      opacity: 0;
      display: none;
      z-index: 9998;
      pointer-events: none;
    `;
    document.body.appendChild(this.transitionElement);

    // Create loading indicator
    this.loadingElement = document.createElement('div');
    this.loadingElement.id = 'scene-transition-loading';
    this.loadingElement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      pointer-events: none;
    `;

    // Loading spinner
    const spinner = document.createElement('div');
    spinner.style.cssText = `
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    `;

    // Loading text
    const loadingText = document.createElement('div');
    loadingText.textContent = 'Loading...';
    loadingText.style.cssText = `
      color: #fff;
      font-family: 'Cinzel', serif;
      font-size: 18px;
      margin-top: 20px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
    `;

    this.loadingElement.appendChild(spinner);
    this.loadingElement.appendChild(loadingText);
    document.body.appendChild(this.loadingElement);

    // Add spinner animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Get current transition state
   */
  getState(): TransitionState {
    return { ...this.state };
  }

  /**
   * Check if transitioning
   */
  isTransitioning(): boolean {
    return this.state.isTransitioning;
  }

  /**
   * Cancel current transition (if possible)
   */
  cancelTransition(): void {
    if (this.state.isTransitioning) {
      this.state.isTransitioning = false;
      this.state.currentPhase = 'idle';
      this.hideLoadingIndicator();
      this.hideFade();
    }
  }

  /**
   * Update transition configuration
   */
  setConfig(config: Partial<TransitionConfig>): void {
    this.currentConfig = { ...this.currentConfig, ...config };
  }

  /**
   * Cleanup transition elements
   */
  dispose(): void {
    if (this.transitionElement && this.transitionElement.parentNode) {
      this.transitionElement.parentNode.removeChild(this.transitionElement);
    }
    if (this.loadingElement && this.loadingElement.parentNode) {
      this.loadingElement.parentNode.removeChild(this.loadingElement);
    }
  }
}
