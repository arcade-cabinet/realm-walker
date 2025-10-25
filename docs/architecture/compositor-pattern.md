# Three-Tier Compositor Pattern

**Version**: 1.0 **FROZEN**

## Overview

Realm Walker Story uses a strict three-tier compositor pattern with complete separation of concerns. Each layer has specific responsibilities and strict boundaries to prevent mixing of concerns.

## Layer 1: SceneCompositor

**Location**: `src/runtime/systems/SceneCompositor.ts`

**Responsibility**: Build ONLY room structure—geometry, walkable grid, and slot definitions.

**Input**: `SceneTemplate` (grid dimensions, floor/wall textures, slot positions)

**Output**: `ComposedScene` with:
- THREE.Scene geometry (floors, walls, ceiling)
- GridSystem for walkability and pathfinding
- Empty slot Maps (NPCs, props, doors)

**Does NOT**:
- Place NPCs or story content
- Know about quest flags
- Handle story logic
- Fill slots with actual models

**Key Principle**: Scene knows NOTHING about story.

## Layer 2: StoryCompositor

**Location**: `src/runtime/systems/StoryCompositor.ts`

**Responsibility**: Fill scene slots with story-appropriate content based on quest state.

**Input**: 
- `StoryBinding` (NPC/prop/door definitions)
- `QuestState` (current flags and progress)
- `ComposedScene` (from Layer 1)

**Output**: `ComposedStory` with:
- Populated NPC slots with dialogue IDs
- Filled prop slots (interactive items)
- Door states (locked/unlocked based on flags)

**Process**:
1. Receives ComposedScene from SceneCompositor
2. Reads story bindings for current scene
3. Evaluates quest flags to determine active content
4. Fills NPC slots with appropriate characters
5. Adds quest items to prop slots if flags require them
6. Sets door states (locked/unlocked) based on progression

**Does NOT**:
- Create geometry
- Know about Three.js rendering
- Handle camera or viewport
- Manage UI presentation

**Key Principle**: Story knows about flags, but NOTHING about presentation.

## Layer 3: GameCompositor

**Location**: `src/runtime/systems/GameCompositor.ts`

**Responsibility**: Frame the diorama viewport and manage presentation layer.

**Input**: 
- `ComposedStory` (from Layer 2)
- Viewport dimensions
- UI state

**Output**: `GameViewport` with:
- Rendered Three.js scene
- Positioned camera
- UI overlays (HUD, dialogue boxes)
- Interaction handlers

**Process**:
1. Takes ComposedStory from StoryCompositor
2. Frames scene in diorama viewport
3. Positions camera for optimal room visibility
4. Renders UI chrome and overlays
5. Routes player click events to handlers
6. Handles responsive layout

**Key Principle**: Game handles ALL presentation, doesn't build scenes.

## Data Flow

```
RWMD Files (authored content)
    ↓
RWMDParser (extract scene data)
    ↓
JSON SceneDefinitions
    ↓
SceneCompositor (Layer 1) → ComposedScene (geometry + empty slots)
    ↓
StoryCompositor (Layer 2) → ComposedStory (filled with quest content)
    ↓
GameCompositor (Layer 3) → GameViewport (rendered + interactive)
    ↓
Three.js Renderer
    ↓
Player Interaction
    ↓
InteractionSystem → QuestManager (update flags)
    ↓
Loop back to StoryCompositor on state change
```

## Critical Constraints

### Layer Boundaries (Strictly Enforced)

1. **SceneCompositor**: NEVER imports QuestManager or story types
2. **StoryCompositor**: NEVER imports GameCompositor or UI types
3. **GameCompositor**: NEVER imports scene building logic

### No Mixing Concerns

- Geometry builder doesn't know about story
- Story filler doesn't know about presentation
- Presentation layer doesn't know about scene construction

### Flag-Based Progression Only

- No numerical stats (health, stamina, mana)
- No inventory arrays (items are flags)
- No XP or leveling
- Everything is boolean quest state

### Pure Authored Content

- No procedural generation
- No random encounters
- Everything is scripted and authored
- Scene transitions are explicit, not emergent

## Type Definitions

### Core Interfaces

```typescript
interface SceneTemplate {
  id: string;
  grid: { width: number; height: number };
  floor: { texture: string };
  walls?: WallDef[];
  ceiling?: { texture: string; height: number };
  slots: {
    npcs?: { id: string; position: GridPosition }[];
    props?: { id: string; position: GridPosition }[];
    doors?: { id: string; position: GridPosition; wall: string }[];
  };
}

interface ComposedScene {
  scene: THREE.Scene;  // ONLY geometry
  gridSystem: GridSystem;  // Walkability
  slots: {
    npcs: Map<string, GridPosition>;
    props: Map<string, GridPosition>;
    doors: Map<string, GridPosition>;
  };
}

interface ComposedStory {
  room: ComposedScene;  // From SceneCompositor
  npcs: Map<string, {
    position: GridPosition;
    mesh: THREE.Group;
    dialogueId?: string;
    questId?: string;
  }>;
  props: Map<string, {
    position: GridPosition;
    mesh: THREE.Group;
    interactive: boolean;
  }>;
  doors: Map<string, {
    position: GridPosition;
    mesh: THREE.Group;
    target: string;
    locked: boolean;
  }>;
}
```

## Testing Strategy

Tests are organized by layer:

- **Unit Tests**: Individual compositor and system tests
- **Integration Tests**: Complete scene flow tests
- **Layer Isolation Tests**: Verify no cross-layer dependencies

## Design Principles

1. **Separation of Concerns**: Each layer has one job
2. **Dependency Flow**: Data flows one way (Scene → Story → Game)
3. **Type Safety**: Strict TypeScript with comprehensive interfaces
4. **Boolean Logic**: All progression is flag-based
5. **Authored Content**: No procedural generation
6. **Clean Interfaces**: Minimal surface area between layers