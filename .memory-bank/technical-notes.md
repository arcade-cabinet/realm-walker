# Technical Notes

**Version**: 1.0
**Last Updated**: 2024-12-19

## Implementation Patterns

### Three-Tier Compositor Pattern
**Reference**: `/docs/architecture/compositor-pattern.md`

The system enforces strict separation through TypeScript interfaces:
- Each layer has specific input/output types
- No cross-layer imports allowed
- Data flows unidirectionally: Scene → Story → Game

### Flag-Based Quest System
**Reference**: `/docs/architecture/quest-system.md`

All progression is boolean flags:
```typescript
// Items are flags, not inventory objects
QuestManager.setFlag('has_palace_key', true);
QuestManager.hasFlag('has_palace_key'); // true

// No numerical stats
// No inventory arrays
// No XP or leveling
```

### RWMD Parser Architecture
**Reference**: `/docs/architecture/rwmd-parser.md`

Declarative scene format with anchor resolution:
```
scene: village_square
grid: 24x16
props:
  - fountain @props/decorative_fountain pos:(12, 12, 0)
```

## Code Organization

### Layer Boundaries (Strictly Enforced)
```typescript
// SceneCompositor - NEVER imports story types
import { SceneTemplate, ComposedScene } from '@types/Scene';
// ❌ import { QuestManager } from '@systems/QuestManager';

// StoryCompositor - NEVER imports game types  
import { ComposedScene, QuestState } from '@types/Story';
// ❌ import { GameCompositor } from '@systems/GameCompositor';

// GameCompositor - NEVER imports scene types
import { ComposedStory, GameViewState } from '@types/Game';
// ❌ import { SceneCompositor } from '@systems/SceneCompositor';
```

### Type Safety Patterns
All interfaces are strictly typed with no `any`:
```typescript
interface GridPosition extends Array<number> {
  0: number; // x
  1: number; // y
  length: 2;
}
```

### Testing Patterns
Each layer tested in isolation:
```typescript
describe('SceneCompositor', () => {
  it('builds geometry without story content', () => {
    // Test that only geometry is created
    // No NPCs, props, or story elements
  });
});
```

## Performance Considerations

### Asset Loading
- LRU cache for GLB models (configurable size)
- Preloading for adjacent scenes
- Asset cleanup on scene transitions

### Rendering
- Frustum culling for large scenes
- Level-of-detail (LOD) for distant objects
- Object pooling for frequently created/destroyed objects

### Memory Management
- Scene data cached and reused
- Unused assets cleaned up
- Quest state persisted efficiently

## Error Handling Patterns

### Validation
```typescript
// RWMD parser validates structure
if (!sceneData.grid || !sceneData.grid.width) {
  throw new Error('Invalid scene: missing grid dimensions');
}
```

### Graceful Degradation
```typescript
// Missing assets don't crash the game
const model = await loadModel(path).catch(() => createPlaceholder());
```

### Type Safety
```typescript
// Optional properties handled safely
const rotation = content.rotation || [0, 0, 0];
const scale = content.scale || [1, 1, 1];
```

## Development Workflow

### Memory Bank Integration
1. Read relevant docs before making decisions
2. Update memory bank when making changes
3. Reference docs in memory bank entries
4. Keep memory bank current with actual state

### Documentation Updates
- FROZEN docs require explicit approval to change
- Version bump when making architectural changes
- Cross-reference related documents
- Update memory bank when docs change

### Testing Strategy
- Unit tests for each layer in isolation
- Integration tests for complete flows
- Layer isolation tests to prevent cross-dependencies
- Performance tests for asset loading and rendering