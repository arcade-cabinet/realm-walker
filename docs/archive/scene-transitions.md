# Scene Transition System

**Version**: 1.0
**Status**: Implemented
**Last Updated**: 2025-10-26

## Overview

The Scene Transition System provides smooth, configurable transitions between game scenes while maintaining the three-tier compositor architecture. It handles fade effects, loading indicators, asset cleanup, and state preservation across scene changes.

## Architecture

### Components

```
SceneTransitionManager
├── Manages transition lifecycle
├── Coordinates with SceneLoader
├── Handles visual effects (fade, loading indicators)
├── Preserves quest state across transitions
└── Reports progress through callbacks
```

### Integration with Three-Tier Compositor

The transition system maintains clean separation:

```
Portal Click → InteractionSystem
    ↓
Check Requirements → QuestManager (flag validation)
    ↓
SceneTransitionManager
    ├── Fade Out (visual effect only)
    ├── SceneLoader → Three Compositors
    │   ├── SceneCompositor (Layer 1)
    │   ├── StoryCompositor (Layer 2)
    │   └── GameCompositor (Layer 3)
    ├── Cleanup (LRU cache management)
    └── Fade In (visual effect only)
```

**Key Principle**: Transition manager only handles presentation of transitions. Scene construction still flows through the three-tier compositor pattern.

## Features

### 1. Visual Effects

**Fade Transitions**
- Smooth fade out before loading
- Smooth fade in after loading complete
- Configurable duration
- CSS-based transitions (no Three.js coupling)

**Instant Transitions**
- Zero-duration for testing
- Immediate scene switch
- No visual interruption

**Future: Slide Transitions**
- Architecture ready for additional effects
- Configurable slide direction
- Smooth animation curves

### 2. Loading States

**Progress Indicators**
- Animated spinner
- Loading text
- Progress percentage (0-100)
- Status messages

**Progress Phases**
1. **Fade Out** (0-10%) - Hide current scene
2. **Loading** (10-70%) - Load new scene through compositors
3. **Cleanup** (70-90%) - Cache management
4. **Fade In** (90-100%) - Show new scene

### 3. Flag-Based Requirements

```typescript
await transitionManager.transitionToScene({
  targetSceneId: 'palace_entrance',
  targetScenePath: './scenes/palace.rwmd',
  targetStoryPath: './scenes/bindings/palace.json',
  requiredFlags: ['has_palace_key', 'completed_quest_1']
});
```

- Validates flags before transitioning
- Prevents transitions if requirements not met
- Maintains boolean flag quest system

### 4. State Preservation

**Quest State**
- All quest flags preserved across transitions
- QuestManager state maintained
- No loss of player progress

**Asset Caching**
- SceneLoader LRU cache automatically managed
- Adjacent scenes preloaded
- Memory-efficient cleanup

### 5. Error Handling

**Graceful Degradation**
- Load errors don't crash game
- Error callbacks for custom handling
- Visual feedback to player
- State rollback on error

**Concurrent Transition Prevention**
- Blocks multiple simultaneous transitions
- Queues or rejects new requests
- Maintains consistency

## Usage

### Basic Transition

```typescript
import { SceneTransitionManager } from './runtime/systems/SceneTransitionManager';

const transitionManager = new SceneTransitionManager(sceneLoader);

await transitionManager.transitionToScene({
  targetSceneId: 'village_square',
  targetScenePath: './scenes/village_square.rwmd',
  targetStoryPath: './scenes/bindings/village_square.json'
});
```

### With Configuration

```typescript
await transitionManager.transitionToScene({
  targetSceneId: 'palace',
  targetScenePath: './scenes/palace.rwmd',
  targetStoryPath: './scenes/bindings/palace.json',
  requiredFlags: ['has_palace_key'],
  config: {
    effect: 'fade',
    duration: 1000,
    showLoadingIndicator: true,
    cleanupPreviousScene: true
  }
});
```

### With Callbacks

```typescript
await transitionManager.transitionToScene({
  targetSceneId: 'temple',
  targetScenePath: './scenes/temple.rwmd',
  targetStoryPath: './scenes/bindings/temple.json',
  onProgress: (progress, status) => {
    console.log(`${progress}% - ${status}`);
  },
  onComplete: () => {
    console.log('Transition complete!');
    gameState.setCurrentScene('temple');
  },
  onError: (error) => {
    console.error('Transition failed:', error);
    showErrorDialog(error.message);
  }
});
```

### Integration with InteractionSystem

```typescript
const interactionSystem = new InteractionSystem({
  onPortal: async (targetScene) => {
    await transitionManager.transitionToScene({
      targetSceneId: targetScene,
      targetScenePath: `./scenes/${targetScene}.rwmd`,
      targetStoryPath: `./scenes/bindings/${targetScene}.json`,
      config: { effect: 'fade', duration: 800 }
    });
  }
});
```

## Configuration Options

### TransitionConfig

```typescript
interface TransitionConfig {
  effect: 'fade' | 'instant' | 'slide';
  duration: number; // milliseconds
  showLoadingIndicator: boolean;
  preserveAudio: boolean;
  cleanupPreviousScene: boolean;
}
```

**Defaults:**
- effect: `'fade'`
- duration: `800`ms
- showLoadingIndicator: `true`
- preserveAudio: `false`
- cleanupPreviousScene: `true`

## State Tracking

### TransitionState

```typescript
interface TransitionState {
  isTransitioning: boolean;
  progress: number; // 0-100
  currentPhase: 'idle' | 'fadeOut' | 'loading' | 'fadeIn' | 'complete';
  error?: Error;
}
```

Access state with:
```typescript
const state = transitionManager.getState();
if (state.isTransitioning) {
  console.log(`Phase: ${state.currentPhase}, Progress: ${state.progress}%`);
}
```

## Performance Considerations

### Asset Loading
- SceneLoader uses LRU cache (5 scenes by default)
- Adjacent scenes preloaded for instant transitions
- Automatic cleanup of old scenes

### Memory Management
- Transition elements created once on init
- Reused across all transitions
- Disposed only when manager destroyed

### Rendering
- Fade effects use CSS transitions (GPU accelerated)
- No Three.js rendering during fade
- Loading indicator is lightweight HTML/CSS

## Testing

Comprehensive test suite with 23 tests covering:

✅ Initialization
✅ Basic transitions
✅ Flag requirement checking
✅ Concurrent transition prevention
✅ Progress tracking
✅ Error handling
✅ Transition effects (fade, instant)
✅ Loading indicator visibility
✅ State management
✅ Configuration merging
✅ Cleanup and disposal
✅ Integration with SceneLoader

All tests use jsdom for DOM manipulation testing.

## Future Enhancements

### Planned Features
1. **Slide Transitions** - Horizontal/vertical slide effects
2. **Custom Transitions** - User-defined transition functions
3. **Audio Crossfade** - Smooth audio transitions between scenes
4. **Transition Queue** - Queue multiple transitions
5. **Preload Hints** - Manual preload control
6. **Transition History** - Back button support

### Architecture Ready
- Plugin system for custom effects
- Async transition composition
- Parallel asset loading
- Scene diff optimization

## Examples

### Chapter Transition in ProductionGame

```typescript
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
      this.gameState.setCurrentScene('village_square');
      this.gameState.setCurrentChapter(1);
    },
    onError: (error) => {
      this.hud.showDialogue(
        'Error',
        `Failed to load Chapter 1: ${error.message}`,
        [{ text: 'OK', onClick: () => {} }]
      );
    }
  });
}
```

### Portal Interaction

```typescript
const portal: InteractionPoint = {
  id: 'palace_entrance',
  type: 'portal',
  position: [12, 15],
  radius: 1,
  targetScene: 'palace',
  requiresFlags: ['has_palace_key']
};

interactionSystem.registerInteraction(portal);
```

## Architecture Compliance

✅ **Three-Tier Compositor Pattern Preserved**
- Transition manager is presentation layer only
- Doesn't interfere with scene/story/game compositors
- Clean separation of concerns

✅ **Boolean Flag Quest System Maintained**
- Flag-based transition requirements
- No numerical stats or complex conditions
- Quest state preserved across transitions

✅ **Type Safety**
- Strict TypeScript interfaces
- Comprehensive type definitions
- No `any` types in public API

✅ **Pure Authored Content**
- All scenes are authored (RWMD files)
- No procedural transitions
- Explicit scene connections via portals

## Integration Points

### With SceneLoader
- Uses SceneLoader for all scene operations
- Respects LRU cache settings
- Triggers adjacent scene preloading

### With QuestManager
- Validates flag requirements
- Reads current quest state
- Preserves flags across transitions

### With InteractionSystem
- Portal interactions trigger transitions
- Flag requirements enforced
- Error handling integrated

### With GameCompositor
- Visual effects layer above game viewport
- No interference with Three.js rendering
- CSS-based fade overlays

## Troubleshooting

### Common Issues

**Transition Blocked**
- Check required flags with `questManager.getState()`
- Verify flag names match exactly
- Ensure flags are set before transition

**Loading Stuck**
- Check scene file paths are correct
- Verify RWMD files are valid
- Check browser console for errors

**No Visual Feedback**
- Ensure `showLoadingIndicator: true`
- Check transition elements in DOM
- Verify CSS transitions working

**Memory Issues**
- Reduce SceneLoader cache size
- Disable adjacent scene preloading
- Enable `cleanupPreviousScene: true`

## Conclusion

The Scene Transition System provides a robust, performant solution for scene changes while maintaining the project's architectural principles. It enhances player experience with smooth visual feedback while preserving quest state and managing resources efficiently.

The system is production-ready, fully tested, and integrated with ProductionGame and InteractionSystem.
