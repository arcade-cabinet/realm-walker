# GitHub Copilot Bootstrap Prompt: ScummVM-Style 3D Adventure Game

## Project Overview

Bootstrap a **TypeScript/Node.js** repository for a 3D adventure game that combines **Monkey Island's point-and-click design** with **Chrono Trigger's visual presentation**. This is a ScummVM-style adventure game using modern GLB 3D models rendered in diorama viewports with Three.js.

**Game Type**: Authored adventure game with 18 scripted chapters, scene-by-scene progression, quest-driven narrative, and strategic combat presented as dialogue choices.

**NOT**: Traditional RPG, procedural generation, inventory management, grinding systems, or numerical stats.

---

## Core Architecture: Three-Tier Compositor Pattern

The system enforces **strict separation of concerns** across three layers:

### Layer 1: SceneCompositor (`src/runtime/loaders/SceneCompositor.ts`)

**Responsibility**: Build ONLY room structure—geometry, walkable grid, and slot definitions.

**Input**: SceneTemplate (grid dimensions, floor/wall textures, slot positions)

**Output**: ComposedScene with THREE.Scene geometry + empty slots Map

**Does NOT**: Place NPCs, know about story, handle quests, or fill slots

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
```

### Layer 2: StoryCompositor (`src/runtime/loaders/StoryCompositor.ts`)

**Responsibility**: Fill scene slots with story-appropriate content based on quest state.

**Input**: StoryState (flags, active quests) + SceneTemplate

**Output**: ComposedStory with populated NPCs, props, and doors

**Process**:
1. Call SceneCompositor to get room structure + slots
2. Read story bindings for current quest state
3. Fill NPC slots with appropriate characters + dialogue IDs
4. Fill prop slots with quest items if flags require them
5. Activate/lock doors based on progression flags
6. Return complete scene with all content

```typescript
interface StoryBinding {
  scene_id: string;
  npc_placements: Record<string, {
    npc_id: string;
    dialogue?: string;
    quest?: string;
  }>;
  prop_placements: Record<string, {
    prop_id: string;
    interactive?: boolean;
  }>;
  door_states: Record<string, {
    target: string;
    locked: boolean;
    requires_flags?: string[];
  }>;
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

### Layer 3: GameCompositor (`src/runtime/loaders/GameCompositor.ts`)

**Responsibility**: Frame the diorama viewport and manage presentation layer.

**Input**: ComposedStory + viewport dimensions + UI state

**Output**: Rendered Three.js scene with camera, UI overlays, and interaction handlers

**Does**:
1. Take ComposedStory from StoryCompositor
2. Frame current room in diorama viewport
3. Position camera for optimal room visibility
4. Render UI chrome (HUD, dialogue boxes, modals)
5. Route player click events to interaction handlers
6. Handle responsive layout adjustments

```typescript
interface GameViewState {
  story: ComposedStory;  // From StoryCompositor
  viewport: { width: number; height: number };
  uiState: {
    dialogueOpen: boolean;
    inventoryOpen: boolean;
    questLogOpen: boolean;
  };
}
```

---

## RWMD Parser System

**RWMD (Room With a Million Doors)**: Declarative format for defining 3D adventure game scenes.

### Parser Requirements (`src/runtime/parsers/RWMDParser.ts`)

The parser must extract:

1. **Scene Metadata**: ID, grid dimensions (width × height), atmosphere tags
2. **Environment Definition**: Floor/wall/ceiling textures, GLB model references
3. **Prop Placements**: 3D positions (x, y, z), rotation, scale, GLB asset paths
4. **NPC Spawn Points**: Positions with dialogue IDs
5. **Interaction Hotspots**: Click zones for examine/use/talk actions
6. **Portal Zones**: Exit areas with target scene IDs and required quest flags
7. **Camera Hints**: Suggested angles/positions for diorama framing
8. **Lighting Setup**: Ambient, directional, point lights

**Anchor Resolution**: Convert RWMD anchors like `@architecture/victorian_palace` to actual GLB paths like `assets/models/architecture/victorian_palace.glb`

**Output Format**: JSON scene definitions consumable by SceneCompositor

Example RWMD snippet:
```
scene: crimson_gothic_arrival
grid: 24x16
atmosphere: eerie, blood-red

props:
  - lantern @props/lanterns/blood_red pos:(4, 2, 0)
  - architecture @architecture/victorian_facade pos:(12, 8, 0)

npcs:
  - carmilla pos:(12, 8) dialogue:carmilla_intro

portals:
  - exit_palace pos:(12, 0) target:palace_interior requires:met_carmilla
```

---

## Quest System: Boolean Flags Only

**Core Philosophy**: No numerical systems. Everything is boolean quest progression.

### QuestManager (`src/runtime/systems/QuestManager.ts`)

```typescript
interface QuestManager {
  // Story progression flags
  storyFlags: Record<string, boolean>;  // "met_elder", "defeated_guardian_1", "has_palace_key"
  
  // Active quests
  activeQuests: string[];  // ["find_the_guardian", "explore_palace"]
  
  // Completed quests
  completedQuests: string[];  // ["character_selection", "city_exploration"]
  
  // Story thread progress (A/B/C stories)
  aStoryProgress: number;  // Guardian boons collected (0-9)
  bStoryProgress: number;  // Faction allies recruited (0-12)
  cStoryProgress: number;  // Ravens encounters handled (0-N)
}

// API
interface QuestManagerAPI {
  setFlag(flag: string, value?: boolean): void;
  hasFlag(flag: string): boolean;
  startQuest(questId: string): void;
  completeQuest(questId: string): void;
  isQuestActive(questId: string): boolean;
  canAccessScene(sceneId: string): boolean;  // Check required flags
}
```

**No Inventory Management**: Quest items are just flags. "Has key" is `hasFlag("palace_key")`, not an inventory slot.

**Door Unlocking**: Doors check `requires_flags` before allowing passage.

**NPC Spawning**: NPCs appear/disappear based on quest state, not random encounters.

---

## Scene Structure

Each scene has these components:

### Environment
- Pre-composed 3D room geometry (floors, walls, ceiling)
- Placed GLB models (furniture, architecture, props)
- Lighting setup (ambient + directional + point lights)

### Navigation
- **GridSystem**: 2D walkable grid (boolean array)
- Grid dimensions (e.g., 24×16 tiles)
- Pathfinding uses A* on walkable tiles

### Interactive Elements
- **Props**: Examinable objects with descriptive text
- **NPCs**: Characters with dialogue trigger volumes
- **Doors/Portals**: Scene transitions with flag requirements
- **Hotspots**: Click zones for "examine", "use", "talk" actions

### Camera
- Isometric or diorama angle for room overview
- Camera positioned to frame entire room
- Smooth transitions when changing scenes

---

## Repository Structure

Generate the following directory structure:

```
project-root/
├── src/
│   ├── runtime/
│   │   ├── loaders/
│   │   │   ├── SceneCompositor.ts       # Layer 1: Room geometry
│   │   │   ├── StoryCompositor.ts       # Layer 2: Story content
│   │   │   └── GameCompositor.ts        # Layer 3: Presentation
│   │   ├── parsers/
│   │   │   └── RWMDParser.ts            # Parse scene files
│   │   ├── systems/
│   │   │   ├── QuestManager.ts          # Flag management
│   │   │   ├── DialogueManager.ts       # Conversation system
│   │   │   └── InteractionSystem.ts     # Click handling
│   │   └── rendering/
│   │       ├── SceneRenderer.ts         # Three.js rendering
│   │       └── CameraController.ts      # Camera management
│   ├── types/
│   │   ├── SceneDefinition.ts           # Scene data structures
│   │   ├── StoryBinding.ts              # Story→Scene mapping
│   │   ├── GameState.ts                 # Player progress
│   │   └── GridSystem.ts                # Navigation types
│   ├── assets/
│   │   ├── models/                      # GLB files (1,145 models)
│   │   ├── textures/                    # Image textures
│   │   └── audio/                       # Sound effects
│   └── scenes/
│       ├── definitions/                 # JSON scene data
│       ├── bindings/                    # Story bindings
│       └── rwmd/                        # Source RWMD files
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

---

## Required Dependencies

### Core Dependencies
```json
{
  "dependencies": {
    "three": "^0.160.0",
    "typescript": "^5.3.0"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@types/three": "^0.160.0",
    "vite": "^5.0.0"
  }
}
```

### TypeScript Configuration
- Target: ES2022
- Module: ESNext
- Strict mode enabled
- Path aliases for clean imports: `@runtime/*`, `@types/*`, `@scenes/*`

---

## Key Type Definitions

### GridPosition
```typescript
type GridPosition = [x: number, y: number];  // 2D tile coordinates
type WorldPosition = [x: number, y: number, z: number];  // 3D world space
```

### GridSystem
```typescript
interface GridSystem {
  width: number;
  height: number;
  walkable: boolean[][];  // 2D grid of walkable tiles
  tileSize: number;       // World units per tile
  
  // Pathfinding
  findPath(start: GridPosition, end: GridPosition): GridPosition[] | null;
  isWalkable(pos: GridPosition): boolean;
  worldToGrid(world: WorldPosition): GridPosition;
  gridToWorld(grid: GridPosition): WorldPosition;
}
```

### InteractionPoint
```typescript
interface InteractionPoint {
  id: string;
  type: 'dialogue' | 'examine' | 'use' | 'portal';
  position: WorldPosition;
  radius: number;  // Click detection radius
  
  // Gating
  requiresFlags?: string[];
  
  // Metadata
  dialogueId?: string;
  targetScene?: string;
  description?: string;
}
```

---

## Data Flow

The complete flow from scene file to rendered game:

```
1. RWMD Files (authored content)
   ↓
2. RWMDParser (extract scene data)
   ↓
3. JSON SceneDefinitions (saved to scenes/definitions/)
   ↓
4. SceneCompositor (build geometry + slots)
   ↓
5. StoryCompositor (fill slots based on QuestManager state)
   ↓
6. GameCompositor (frame viewport, add UI)
   ↓
7. Three.js Renderer (display to player)
   ↓
8. InteractionSystem (handle clicks)
   ↓
9. QuestManager (update flags)
   ↓
10. Loop back to step 5 on scene transition
```

---

## Testing Strategy

### Unit Tests (Vitest)

**SceneCompositor Tests**:
```typescript
describe('SceneCompositor', () => {
  it('builds room geometry from template', () => {
    const template = loadTemplate('test_room');
    const scene = SceneCompositor.build(template);
    
    expect(scene.scene).toBeInstanceOf(THREE.Scene);
    expect(scene.gridSystem.width).toBe(24);
    expect(scene.slots.npcs.size).toBe(3);
  });
  
  it('does NOT place NPCs or props', () => {
    const scene = SceneCompositor.build(template);
    const meshes = scene.scene.children.filter(c => c.type === 'Group');
    expect(meshes).toHaveLength(0);  // Only geometry, no content
  });
});
```

**StoryCompositor Tests**:
```typescript
describe('StoryCompositor', () => {
  it('fills slots based on quest state', () => {
    QuestManager.setFlag('met_elder', true);
    const story = StoryCompositor.compose('village', template);
    
    expect(story.npcs.has('elder')).toBe(true);
    expect(story.npcs.get('elder')?.dialogueId).toBe('elder_greeting');
  });
  
  it('locks doors when flags missing', () => {
    QuestManager.setFlag('has_key', false);
    const story = StoryCompositor.compose('palace', template);
    
    expect(story.doors.get('main_gate')?.locked).toBe(true);
  });
});
```

**QuestManager Tests**:
```typescript
describe('QuestManager', () => {
  it('tracks quest flags correctly', () => {
    QuestManager.setFlag('defeated_guardian_1');
    expect(QuestManager.hasFlag('defeated_guardian_1')).toBe(true);
    expect(QuestManager.aStoryProgress).toBe(1);
  });
  
  it('gates scene access by required flags', () => {
    expect(QuestManager.canAccessScene('palace_interior')).toBe(false);
    QuestManager.setFlag('met_carmilla');
    expect(QuestManager.canAccessScene('palace_interior')).toBe(true);
  });
});
```

### Integration Tests

**Full Scene Flow**:
```typescript
describe('Scene Transition Flow', () => {
  it('completes village → palace transition', async () => {
    // Start in village
    let currentScene = await loadScene('village_square');
    expect(currentScene.id).toBe('village_square');
    
    // Talk to NPC, get quest
    InteractionSystem.click(getNPC('elder'));
    await DialogueManager.complete();
    expect(QuestManager.hasFlag('seek_guardian')).toBe(true);
    
    // Portal unlocks
    const portal = currentScene.doors.get('forest_exit');
    expect(portal?.locked).toBe(false);
    
    // Transition to next scene
    InteractionSystem.click(portal);
    currentScene = await loadScene('crimson_palace');
    expect(currentScene.id).toBe('crimson_palace');
  });
});
```

---

## Critical Constraints

### Layer Boundaries (Enforce Strictly)
- **SceneCompositor**: NEVER imports QuestManager or story types
- **StoryCompositor**: NEVER imports GameCompositor or UI types
- **GameCompositor**: NEVER imports scene building logic

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

---

## Bootstrap Checklist

Generate the following in order:

1. ✅ `package.json` with dependencies
2. ✅ `tsconfig.json` with strict config
3. ✅ `vitest.config.ts` for testing
4. ✅ Directory structure as specified
5. ✅ Core type definitions:
   - `SceneDefinition.ts`
   - `StoryBinding.ts`
   - `GameState.ts`
   - `GridSystem.ts`
6. ✅ Skeleton implementations:
   - `SceneCompositor.ts` (Layer 1)
   - `StoryCompositor.ts` (Layer 2)
   - `GameCompositor.ts` (Layer 3)
   - `RWMDParser.ts`
   - `QuestManager.ts`
7. ✅ Example test files for each layer
8. ✅ README.md with architecture overview
9. ✅ Example RWMD scene file
10. ✅ Example JSON scene definition

---

## Example Files to Generate

### Example SceneTemplate (JSON)
```json
{
  "id": "village_square",
  "grid": { "width": 24, "height": 16 },
  "floor": { "texture": "cobblestone" },
  "walls": [
    { "side": "north", "height": 3.0, "texture": "stone_brick" }
  ],
  "slots": {
    "npcs": [
      { "id": "elder", "position": [12, 8] },
      { "id": "merchant", "position": [6, 4] }
    ],
    "props": [
      { "id": "fountain", "position": [12, 12] },
      { "id": "market_stall", "position": [6, 6] }
    ],
    "doors": [
      { "id": "forest_exit", "position": [12, 0], "wall": "south" }
    ]
  }
}
```

### Example StoryBinding (JSON)
```json
{
  "scene_id": "village_square",
  "npc_placements": {
    "elder": {
      "npc_id": "village_elder",
      "dialogue": "elder_greeting",
      "quest": "seek_guardian"
    },
    "merchant": {
      "npc_id": "traveling_merchant",
      "dialogue": "merchant_wares"
    }
  },
  "prop_placements": {
    "fountain": {
      "prop_id": "decorative_fountain",
      "interactive": false
    }
  },
  "door_states": {
    "forest_exit": {
      "target": "crimson_palace",
      "locked": false,
      "requires_flags": ["seek_guardian"]
    }
  }
}
```

---

## Success Criteria

After bootstrap, the project should have:

✅ Clean three-tier architecture with zero mixing  
✅ Type-safe interfaces for all data structures  
✅ Skeleton implementations ready for logic  
✅ Test framework configured and working  
✅ Example scene and binding files  
✅ Clear README explaining architecture  
✅ All dependencies installed and configured  
✅ TypeScript compiling without errors  
✅ Vitest running (even if tests are stubs)  

---

## Next Steps After Bootstrap

Once the scaffold is complete:

1. Implement RWMDParser to read scene files
2. Implement SceneCompositor geometry building
3. Implement StoryCompositor slot filling
4. Implement GameCompositor viewport framing
5. Integrate Three.js rendering
6. Port existing 24 RWMD scene files
7. Create story bindings for Chapter 1
8. Build interaction system for click handling
9. Integrate dialogue system
10. Test complete flow from RWMD → playable scene

---

## Reference Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│ RWMD Scene Files (authored content)            │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│ RWMDParser.ts                                   │
│ ├─ Parse declarative syntax                    │
│ ├─ Resolve anchors to GLB paths                │
│ └─ Output JSON SceneDefinitions                │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│ SceneCompositor.ts (Layer 1)                   │
│ ├─ Build room geometry                         │
│ ├─ Define empty slots                          │
│ ├─ Create walkable grid                        │
│ └─ Return ComposedScene                        │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│ StoryCompositor.ts (Layer 2)                   │
│ ├─ Read QuestManager flags                     │
│ ├─ Load StoryBinding for scene                 │
│ ├─ Fill NPC slots with characters              │
│ ├─ Fill prop slots with quest items            │
│ ├─ Lock/unlock doors by flags                  │
│ └─ Return ComposedStory                        │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│ GameCompositor.ts (Layer 3)                    │
│ ├─ Frame diorama viewport                      │
│ ├─ Position camera                             │
│ ├─ Add UI chrome (HUD, modals)                 │
│ ├─ Route click events                          │
│ └─ Render to Three.js canvas                   │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│ Player sees and interacts with scene           │
└─────────────────────────────────────────────────┘
```

---

**This prompt provides everything needed to bootstrap a clean, well-architected TypeScript/Node.js adventure game following the three-tier compositor pattern with strict separation of concerns.**
