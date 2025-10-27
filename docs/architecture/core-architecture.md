# Core Architecture: RWMD Content & Runtime Compositors

**Version**: 2.0 **FROZEN**  
**Date**: 2025-10-27  
**Status**: Consolidated from systems/01_ARCHITECTURE.md + architecture/compositor-pattern.md

---

## Executive Summary

Realm Walker Story architecture has **TWO complementary layers**:

1. **RWMD Content Layers** (4-tier): Primitives → Prefabs → Packages → Scenarios
2. **Runtime Compositors** (3-tier): Scene → Story → Game

**Key Principle**: **RWMD defines WHAT happens. TypeScript defines HOW it happens.**

---

## Part 1: RWMD Content Architecture

### Core Principle

```
RWMD Files (Declarative Content)
    ↓
TypeScript Engine (Execution)
    ↓
Three.js Renderer (Presentation)
```

### The 4-Layer RWMD Composition Model

```
Layer 4: Scenarios (complete game experiences)
    ↓ composes
Layer 3: Packages (themed collections: factions, realms)
    ↓ composes  
Layer 2: Prefabs (reusable patterns: encounters, formations)
    ↓ composes
Layer 1: Primitives (atomic elements: tiles, abilities, NPCs)
```

#### Layer 1: Primitives (Atomic)

**Definition**: Self-contained game elements with NO dependencies.

**Examples**:
- Grid tiles (walkable, blocked, special)
- Abilities (attack patterns, buffs)
- Props (interactive objects)
- Assets (GLB models, textures)

**File Location**: `scenes/primitives/`

**Characteristics**:
- No anchor references
- Pure data definitions
- Reusable everywhere

#### Layer 2: Prefabs (Patterns)

**Definition**: Reusable patterns composing multiple primitives.

**Examples**:
- Encounter setups (enemy formations)
- Room templates (Gothic chamber, forest clearing)
- NPC behavior patterns
- Dialogue branches

**File Location**: `scenes/prefabs/`

**Characteristics**:
- References primitives via anchors
- Defines reusable patterns
- Used across multiple scenes

#### Layer 3: Packages (Systems)

**Definition**: Complete game systems (factions, realms, quests).

**Examples**:
- Faction content (Dawnshield, Crimson Pact)
- Realm definitions (Sacred Vale, Volcanic Wastes)
- Quest chains
- Character rosters

**File Location**: `scenes/packages/`

**Characteristics**:
- References prefabs and primitives
- Defines faction/realm identity
- Complete gameplay systems

#### Layer 4: Scenarios (Experiences)

**Definition**: Complete playable chapters/scenes.

**Examples**:
- Chapter 0: Dead World Opening
- Chapter 1: Crimson Pact
- Guardian Unmakings
- Faction battles

**File Location**: `scenes/scenarios/`

**Characteristics**:
- Composes all lower layers
- Complete gameplay experience
- Story + mechanics + presentation

### Anchor-Based References

**Format**: `@type:identifier`

**Examples**:
- `@npc:elder_ottermere`
- `@prop:ancient_pillar`
- `@door:shrine_entrance`
- `@ability:shield_bash`

**Resolution**: Runtime lazy-loading via anchor registry.

---

## Part 2: Runtime Compositor Architecture

### The 3-Tier Compositor Pattern

**Core Principle**: Strict separation of concerns with one-way data flow.

```
RWMD Content
    ↓
Layer 1: SceneCompositor → ComposedScene (geometry + empty slots)
    ↓
Layer 2: StoryCompositor → ComposedStory (filled with quest content)
    ↓
Layer 3: GameCompositor → GameViewport (rendered + interactive)
    ↓
Player Interaction → QuestManager (updates flags)
    ↓
[Loop back to StoryCompositor on state change]
```

### Layer 1: SceneCompositor

**Location**: `src/runtime/systems/SceneCompositor.ts`

**Responsibility**: Build ONLY room structure—geometry, walkable grid, empty slots.

**Input**: `SceneTemplate` from RWMD

**Output**: `ComposedScene`
```typescript
interface ComposedScene {
  scene: THREE.Scene;      // ONLY geometry (floors, walls, ceiling)
  gridSystem: GridSystem;  // Walkability + pathfinding
  slots: {
    npcs: Map<string, GridPosition>;    // Empty NPC slots
    props: Map<string, GridPosition>;   // Empty prop slots
    doors: Map<string, GridPosition>;   // Empty door slots
  };
}
```

**Does NOT**:
- ❌ Place NPCs or story content
- ❌ Know about quest flags
- ❌ Handle story logic
- ❌ Fill slots with actual models

**Key Principle**: **Scene knows NOTHING about story.**

### Layer 2: StoryCompositor

**Location**: `src/runtime/systems/StoryCompositor.ts`

**Responsibility**: Fill scene slots with story-appropriate content based on quest flags.

**Input**:
- `ComposedScene` (from Layer 1)
- `StoryBinding` (NPC/prop/door definitions from RWMD)
- `QuestState` (current flags)

**Output**: `ComposedStory`
```typescript
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

**Process**:
1. Receives ComposedScene from SceneCompositor
2. Reads story bindings for current scene
3. Evaluates quest flags to determine active content
4. Fills NPC slots with appropriate characters
5. Adds quest items to prop slots if flags require them
6. Sets door states (locked/unlocked) based on progression

**Does NOT**:
- ❌ Create geometry
- ❌ Know about Three.js rendering
- ❌ Handle camera or viewport
- ❌ Manage UI presentation

**Key Principle**: **Story knows about flags, but NOTHING about presentation.**

### Layer 3: GameCompositor

**Location**: `src/runtime/systems/GameCompositor.ts`

**Responsibility**: Frame the diorama viewport and manage ALL presentation.

**Input**:
- `ComposedStory` (from Layer 2)
- Viewport dimensions
- Camera configuration

**Output**: `GameViewport`
```typescript
interface GameViewport {
  renderer: THREE.WebGLRenderer;
  camera: THREE.Camera;
  scene: THREE.Scene;        // Fully rendered with story content
  uiOverlays: UIComponent[]; // HUD, dialogue, quest log
  interactionHandlers: Map<string, InteractionHandler>;
}
```

**Process**:
1. Takes ComposedStory from StoryCompositor
2. Frames scene in diorama viewport
3. Positions camera for optimal room visibility
4. Renders UI chrome and overlays
5. Routes player click events to handlers
6. Handles responsive layout

**Key Principle**: **Game handles ALL presentation, doesn't build scenes.**

---

## Integration: RWMD → Compositors

### Data Flow

```
1. RWMD Files (authored content)
   ↓
2. RWMDParser (extract scene data)
   ↓
3. SceneDefinition (JSON with anchors)
   ↓
4. SceneCompositor (Layer 1)
   Builds: Grid system, empty slots, geometry
   ↓
5. StoryCompositor (Layer 2)
   Fills: NPCs, props, doors based on quest flags
   ↓
6. GameCompositor (Layer 3)
   Renders: Diorama viewport, UI, interactions
   ↓
7. Player Interaction
   ↓
8. InteractionSystem → QuestManager (update flags)
   ↓
9. Loop back to StoryCompositor (re-evaluate with new flags)
```

### Example: Chapter 1 Scene Load

```typescript
// 1. Load RWMD scene
const sceneData = await loadRWMD('village_square.rwmd');

// 2. Layer 1: SceneCompositor
const composedScene = sceneCompositor.compose(sceneData);
// Result: Grid (16x12), empty slots for 3 NPCs, 5 props, 2 doors

// 3. Layer 2: StoryCompositor
const questState = questManager.getState();
const storyBinding = await loadBinding('village_square_story.json');
const composedStory = storyCompositor.compose(
  composedScene, 
  storyBinding, 
  questState
);
// Result: If 'met_carmilla' flag = true, spawn Carmilla NPC
//         If 'shrine_unlocked' = false, lock shrine door

// 4. Layer 3: GameCompositor
const viewport = gameCompositor.render(composedStory);
// Result: Three.js scene with camera, lighting, UI overlays

// 5. Player clicks Carmilla NPC
interactionSystem.handleNPCClick('carmilla');
// → Opens dialogue
// → Player choice sets 'carmilla_quest_accepted' flag
// → Triggers StoryCompositor re-evaluation
```

---

## Critical Constraints

### Layer Boundaries (Strictly Enforced)

1. **SceneCompositor**: NEVER imports QuestManager or story types
2. **StoryCompositor**: NEVER imports GameCompositor or UI types
3. **GameCompositor**: NEVER imports scene building logic

### No Mixing Concerns

- ✅ Geometry builder doesn't know about story
- ✅ Story filler doesn't know about presentation
- ✅ Presentation layer doesn't know about scene construction

### Flag-Based Progression Only

- ✅ No numerical stats (HP, stamina, mana)
- ✅ No inventory arrays (items are flags)
- ✅ No XP or leveling
- ✅ Everything is boolean quest state

### Pure Authored Content

- ✅ No procedural generation (except AI asset creation at build-time)
- ✅ No random encounters
- ✅ Everything is scripted and authored
- ✅ Scene transitions are explicit, not emergent

---

## File Organization

### RWMD Content Structure
```
scenes/
├── primitives/          # Layer 1
│   ├── tiles/
│   ├── props/
│   └── npcs/
│
├── prefabs/             # Layer 2
│   ├── encounters/
│   ├── rooms/
│   └── behaviors/
│
├── packages/            # Layer 3
│   ├── factions/
│   ├── realms/
│   └── quests/
│
└── scenarios/           # Layer 4
    ├── chapter_0/
    ├── chapter_1/
    └── guardians/
```

### TypeScript Runtime Structure
```
src/
├── runtime/
│   ├── systems/
│   │   ├── SceneCompositor.ts       # Layer 1
│   │   ├── StoryCompositor.ts       # Layer 2
│   │   ├── GameCompositor.ts        # Layer 3
│   │   ├── QuestManager.ts
│   │   ├── DialogueManager.ts
│   │   └── InteractionSystem.ts
│   │
│   ├── loaders/
│   │   ├── SceneLoader.ts
│   │   └── StoryBindingLoader.ts
│   │
│   └── parsers/
│       └── RWMDParser.ts
│
└── types/
    ├── Scene.ts
    ├── Story.ts
    └── Compositor.ts
```

---

## Testing Strategy

### Unit Tests

**SceneCompositor Tests**:
- Grid system creation
- Geometry generation
- Empty slot maps
- NO story logic

**StoryCompositor Tests**:
- Flag evaluation
- Slot filling logic
- NPC/prop spawning
- NO geometry creation

**GameCompositor Tests**:
- Rendering pipeline
- Camera positioning
- UI overlay placement
- NO scene building

### Integration Tests

**Complete Flow Tests**:
- RWMD → Parser → Compositors → Viewport
- Flag changes trigger re-composition
- Scene transitions maintain state

### Layer Isolation Tests

**Verify**:
- SceneCompositor has no QuestManager imports
- StoryCompositor has no Three.js imports
- GameCompositor has no scene building imports

---

## Design Principles

1. **Separation of Concerns**: Each layer has ONE job
2. **Dependency Flow**: Data flows one way (Scene → Story → Game)
3. **Type Safety**: Strict TypeScript with comprehensive interfaces
4. **Boolean Logic**: All progression is flag-based
5. **Authored Content**: No procedural generation at runtime
6. **Clean Interfaces**: Minimal surface area between layers
7. **RWMD as Source of Truth**: Content is declarative, execution is imperative

---

## Cross-References

**Related Documents**:
- `rwmd-parser.md` - RWMD syntax and parsing
- `quest-narrative-system.md` - Flag-based progression
- `scene-content-system.md` - Scene loading and transitions
- `type-system.md` - TypeScript interfaces
- `data-flow.md` - Complete data flow diagrams

**Implementation Files**:
- `src/runtime/systems/SceneCompositor.ts`
- `src/runtime/systems/StoryCompositor.ts`
- `src/runtime/systems/GameCompositor.ts`
- `src/runtime/parsers/RWMDParser.ts`

**Test Files**:
- `tests/unit/SceneCompositor.test.ts`
- `tests/unit/StoryCompositor.test.ts`
- `tests/integration/compositor-chain.test.ts`

---

**Status**: FROZEN v2.0  
**Last Updated**: 2025-10-27  
**Supersedes**: `systems/01_ARCHITECTURE.md`, `architecture/compositor-pattern.md`
