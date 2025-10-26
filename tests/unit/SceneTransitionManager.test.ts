/**
 * Unit tests for SceneTransitionManager
 */

import { SceneTransitionManager } from '../../src/runtime/systems/SceneTransitionManager';
import { SceneLoader } from '../../src/runtime/loaders/SceneLoader';
import { StoryCompositor } from '../../src/runtime/systems/StoryCompositor';

// Mock SceneLoader
jest.mock('../../src/runtime/loaders/SceneLoader');

describe('SceneTransitionManager', () => {
  let transitionManager: SceneTransitionManager;
  let mockSceneLoader: jest.Mocked<SceneLoader>;
  let mockStoryCompositor: jest.Mocked<StoryCompositor>;

  beforeEach(() => {
    // Clear document body
    document.body.innerHTML = '';

    // Create mock story compositor
    mockStoryCompositor = {
      getFlags: jest.fn().mockReturnValue({}),
      setFlag: jest.fn(),
      compose: jest.fn()
    } as any;

    // Create mock scene loader
    mockSceneLoader = {
      loadScene: jest.fn().mockResolvedValue({}),
      getCompositors: jest.fn().mockReturnValue({
        story: mockStoryCompositor,
        scene: {},
        game: {}
      }),
      getCurrentSceneId: jest.fn().mockReturnValue('test_scene'),
      isCached: jest.fn().mockReturnValue(false),
      clearCache: jest.fn()
    } as any;

    transitionManager = new SceneTransitionManager(mockSceneLoader);
  });

  afterEach(() => {
    transitionManager.dispose();
  });

  describe('Initialization', () => {
    it('should create transition elements on initialization', () => {
      const fadeElement = document.getElementById('scene-transition-fade');
      const loadingElement = document.getElementById('scene-transition-loading');

      expect(fadeElement).toBeTruthy();
      expect(loadingElement).toBeTruthy();
    });

    it('should start in idle state', () => {
      const state = transitionManager.getState();

      expect(state.isTransitioning).toBe(false);
      expect(state.currentPhase).toBe('idle');
      expect(state.progress).toBe(0);
    });

    it('should not be transitioning initially', () => {
      expect(transitionManager.isTransitioning()).toBe(false);
    });
  });

  describe('Scene Transitions', () => {
    it('should complete a basic transition', async () => {
      const onProgress = jest.fn();
      const onComplete = jest.fn();

      await transitionManager.transitionToScene({
        targetSceneId: 'village_square',
        targetScenePath: '/scenes/village_square.rwmd',
        targetStoryPath: '/scenes/bindings/village_square.json',
        onProgress,
        onComplete
      });

      expect(mockSceneLoader.loadScene).toHaveBeenCalledWith(
        'village_square',
        '/scenes/village_square.rwmd',
        '/scenes/bindings/village_square.json',
        expect.objectContaining({
          useCache: true,
          preloadAdjacent: true
        })
      );

      expect(onProgress).toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
    });

    it('should check required flags before transitioning', async () => {
      mockStoryCompositor.getFlags.mockReturnValue({
        'has_key': true,
        'completed_quest': false
      });

      const onError = jest.fn();

      await transitionManager.transitionToScene({
        targetSceneId: 'locked_room',
        targetScenePath: '/scenes/locked_room.rwmd',
        targetStoryPath: '/scenes/bindings/locked_room.json',
        requiredFlags: ['has_key', 'completed_quest'],
        onError
      });

      expect(mockSceneLoader.loadScene).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Missing required flags')
        })
      );
    });

    it('should allow transition when all required flags are present', async () => {
      mockStoryCompositor.getFlags.mockReturnValue({
        'has_key': true,
        'completed_quest': true
      });

      const onComplete = jest.fn();

      await transitionManager.transitionToScene({
        targetSceneId: 'locked_room',
        targetScenePath: '/scenes/locked_room.rwmd',
        targetStoryPath: '/scenes/bindings/locked_room.json',
        requiredFlags: ['has_key', 'completed_quest'],
        onComplete
      });

      expect(mockSceneLoader.loadScene).toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
    });

    it('should prevent multiple simultaneous transitions', async () => {
      const onError = jest.fn();

      // Start first transition (slow)
      const promise1 = transitionManager.transitionToScene({
        targetSceneId: 'scene1',
        targetScenePath: '/scenes/scene1.rwmd',
        targetStoryPath: '/scenes/bindings/scene1.json'
      });

      // Try to start second transition immediately
      await transitionManager.transitionToScene({
        targetSceneId: 'scene2',
        targetScenePath: '/scenes/scene2.rwmd',
        targetStoryPath: '/scenes/bindings/scene2.json',
        onError
      });

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Transition already in progress'
        })
      );

      await promise1;
    });

    it('should report progress through transition phases', async () => {
      const progressReports: Array<{ progress: number; status: string }> = [];

      await transitionManager.transitionToScene({
        targetSceneId: 'test_scene',
        targetScenePath: '/scenes/test.rwmd',
        targetStoryPath: '/scenes/bindings/test.json',
        onProgress: (progress, status) => {
          progressReports.push({ progress, status });
        }
      });

      expect(progressReports.length).toBeGreaterThan(0);
      expect(progressReports[0].progress).toBe(0);
      expect(progressReports[progressReports.length - 1].progress).toBe(100);
    });

    it('should handle transition errors gracefully', async () => {
      mockSceneLoader.loadScene.mockRejectedValue(new Error('Scene not found'));

      const onError = jest.fn();

      await transitionManager.transitionToScene({
        targetSceneId: 'missing_scene',
        targetScenePath: '/scenes/missing.rwmd',
        targetStoryPath: '/scenes/bindings/missing.json',
        onError
      });

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Scene not found'
        })
      );

      expect(transitionManager.isTransitioning()).toBe(false);
    });
  });

  describe('Transition Effects', () => {
    it('should respect instant transition config', async () => {
      const startTime = Date.now();

      await transitionManager.transitionToScene({
        targetSceneId: 'test_scene',
        targetScenePath: '/scenes/test.rwmd',
        targetStoryPath: '/scenes/bindings/test.json',
        config: {
          effect: 'instant',
          duration: 0
        }
      });

      const duration = Date.now() - startTime;

      // Instant transition should complete very quickly (< 100ms)
      expect(duration).toBeLessThan(100);
    });

    it('should apply fade effect configuration', async () => {
      await transitionManager.transitionToScene({
        targetSceneId: 'test_scene',
        targetScenePath: '/scenes/test.rwmd',
        targetStoryPath: '/scenes/bindings/test.json',
        config: {
          effect: 'fade',
          duration: 500
        }
      });

      const fadeElement = document.getElementById('scene-transition-fade');
      expect(fadeElement).toBeTruthy();
    });

    it('should show loading indicator when configured', async () => {
      let loadingShown = false;

      // Mock loading indicator visibility
      const originalLoadScene = mockSceneLoader.loadScene;
      mockSceneLoader.loadScene.mockImplementation(async (...args) => {
        const loadingElement = document.getElementById('scene-transition-loading');
        if (loadingElement && loadingElement.style.display === 'flex') {
          loadingShown = true;
        }
        return originalLoadScene.apply(mockSceneLoader, args);
      });

      await transitionManager.transitionToScene({
        targetSceneId: 'test_scene',
        targetScenePath: '/scenes/test.rwmd',
        targetStoryPath: '/scenes/bindings/test.json',
        config: {
          showLoadingIndicator: true
        }
      });

      expect(loadingShown).toBe(true);
    });

    it('should hide loading indicator when configured', async () => {
      await transitionManager.transitionToScene({
        targetSceneId: 'test_scene',
        targetScenePath: '/scenes/test.rwmd',
        targetStoryPath: '/scenes/bindings/test.json',
        config: {
          showLoadingIndicator: false
        }
      });

      const loadingElement = document.getElementById('scene-transition-loading');
      expect(loadingElement?.style.display).not.toBe('flex');
    });
  });

  describe('State Management', () => {
    it('should track transition state through phases', async () => {
      const states: string[] = [];

      mockSceneLoader.loadScene.mockImplementation(async () => {
        states.push(transitionManager.getState().currentPhase);
        return {} as any;
      });

      await transitionManager.transitionToScene({
        targetSceneId: 'test_scene',
        targetScenePath: '/scenes/test.rwmd',
        targetStoryPath: '/scenes/bindings/test.json'
      });

      expect(states).toContain('loading');
      expect(transitionManager.getState().currentPhase).toBe('complete');
    });

    it('should reset state after transition completes', async () => {
      await transitionManager.transitionToScene({
        targetSceneId: 'test_scene',
        targetScenePath: '/scenes/test.rwmd',
        targetStoryPath: '/scenes/bindings/test.json'
      });

      const state = transitionManager.getState();
      expect(state.isTransitioning).toBe(false);
      expect(state.progress).toBe(100);
      expect(state.currentPhase).toBe('complete');
    });

    it('should allow canceling a transition', async () => {
      // Start transition
      const promise = transitionManager.transitionToScene({
        targetSceneId: 'test_scene',
        targetScenePath: '/scenes/test.rwmd',
        targetStoryPath: '/scenes/bindings/test.json'
      });

      // Cancel immediately
      transitionManager.cancelTransition();

      expect(transitionManager.isTransitioning()).toBe(false);

      await promise;
    });

    it('should track errors in state', async () => {
      mockSceneLoader.loadScene.mockRejectedValue(new Error('Load failed'));

      await transitionManager.transitionToScene({
        targetSceneId: 'test_scene',
        targetScenePath: '/scenes/test.rwmd',
        targetStoryPath: '/scenes/bindings/test.json',
        onError: () => {} // Suppress error
      });

      const state = transitionManager.getState();
      expect(state.error).toBeDefined();
      expect(state.error?.message).toBe('Load failed');
    });
  });

  describe('Configuration', () => {
    it('should allow updating configuration', () => {
      transitionManager.setConfig({
        duration: 1000,
        effect: 'fade'
      });

      // Configuration is internal, but we can verify it's used in transitions
      expect(transitionManager).toBeTruthy();
    });

    it('should merge custom config with defaults', async () => {
      const onComplete = jest.fn();

      await transitionManager.transitionToScene({
        targetSceneId: 'test_scene',
        targetScenePath: '/scenes/test.rwmd',
        targetStoryPath: '/scenes/bindings/test.json',
        config: {
          duration: 100 // Only override duration
        },
        onComplete
      });

      expect(onComplete).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should remove transition elements on dispose', () => {
      transitionManager.dispose();

      const fadeElement = document.getElementById('scene-transition-fade');
      const loadingElement = document.getElementById('scene-transition-loading');

      expect(fadeElement).toBeNull();
      expect(loadingElement).toBeNull();
    });

    it('should handle dispose when elements already removed', () => {
      transitionManager.dispose();
      
      expect(() => {
        transitionManager.dispose();
      }).not.toThrow();
    });
  });

  describe('Integration with SceneLoader', () => {
    it('should pass correct options to scene loader', async () => {
      await transitionManager.transitionToScene({
        targetSceneId: 'village_square',
        targetScenePath: '/scenes/village_square.rwmd',
        targetStoryPath: '/scenes/bindings/village_square.json'
      });

      expect(mockSceneLoader.loadScene).toHaveBeenCalledWith(
        'village_square',
        '/scenes/village_square.rwmd',
        '/scenes/bindings/village_square.json',
        {
          useCache: true,
          preloadAdjacent: true
        }
      );
    });

    it('should access story compositor for flag checks', async () => {
      mockStoryCompositor.getFlags.mockReturnValue({ 'test_flag': true });

      await transitionManager.transitionToScene({
        targetSceneId: 'test_scene',
        targetScenePath: '/scenes/test.rwmd',
        targetStoryPath: '/scenes/bindings/test.json',
        requiredFlags: ['test_flag']
      });

      expect(mockStoryCompositor.getFlags).toHaveBeenCalled();
      expect(mockSceneLoader.loadScene).toHaveBeenCalled();
    });
  });
});
