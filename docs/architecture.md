# Realm Walker Story Architecture

**Version**: 1.0 **FROZEN**  
**Date**: 2025-10-27  
**Status**: NORTH STAR DOCUMENT - All systems must align to this specification

---

## Core Architecture

The game is built on a three-tier system that maintains strict separation of concerns:

### Layer 1: SceneCompositor - Room Structure

**Location**: `src/runtime/systems/SceneCompositor.ts`

**Responsibility**: Build ONLY room structure—geometry, walkable grid, empty slots

**Input**: `SceneTemplate` from RWMD files
```typescript
interface SceneTemplate {
  id: string;
  grid: { width: number; height: number };
  floor: { texture: string };
  walls?: WallDefinition[];
  ceiling?: { texture: string; height: number };
  slots: {
    npcs?: SlotDefinition[];
    props?: SlotDefinition[];
    doors?: SlotDefinition[];
  };
}
```

**Output**: `ComposedScene` with empty slots
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

**Key Principle**: **Scene knows NOTHING about story**

### Layer 2: StoryCompositor - Quest-Driven Content

**Location**: `src/runtime/systems/StoryCompositor.ts`

**Responsibility**: Fill scene slots with story-appropriate content based on quest flags

**Input**:
- `ComposedScene` (from Layer 1)
- `StoryBinding` (NPC/prop/door definitions from RWMD)
- `QuestState` (current boolean flags)

**Output**: `ComposedStory` with filled slots
```typescript
interface ComposedStory {
  room: ComposedScene;  // From SceneCompositor
  npcs: Map<string, NPCInstance>;
  props: Map<string, PropInstance>;
  doors: Map<string, DoorInstance>;
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

**Key Principle**: **Story knows about flags, but NOTHING about presentation**

### Layer 3: GameCompositor - Viewport & Presentation

**Location**: `src/runtime/systems/GameCompositor.ts`

**Responsibility**: Frame the diorama viewport and manage ALL presentation

**Input**:
- `ComposedStory` (from Layer 2)
- Viewport dimensions
- Camera configuration

**Output**: `GameViewport` rendered to screen
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

**Key Principle**: **Game handles ALL presentation, doesn't build scenes**

---

## Key Systems

### SceneTransitionManager

**Location**: `src/runtime/systems/SceneTransitionManager.ts`

**Handles**:
- Transitions between scenes with fade effects
- Preloading adjacent scenes
- Flag-based scene gating
- Callbacks for transition start/completion

### QuestManager

**Location**: `src/runtime/systems/QuestManager.ts`

**Manages**:
- Boolean flag progression (NO numerical stats)
- Three parallel story threads (A/B/C stories)
- Scene access gating based on flag completion
- Quest objectives and completion tracking

**Critical Constraint**: All progression is flag-based
```typescript
// ✅ CORRECT - Boolean flags
questManager.setFlag('met_carmilla', true);
questManager.setFlag('shrine_unlocked', false);

// ❌ INCORRECT - No numerical stats
questManager.setHP(50);  // FORBIDDEN
questManager.addXP(100); // FORBIDDEN
```

### DialogueManager

**Location**: `src/runtime/systems/DialogueManager.ts`

**Manages**:
- Branching dialogue trees
- Flag-gated dialogue options
- Player choices that set/clear flags
- Auto-advance and manual choice modes
- Character voice and personality markers

### InteractionSystem

**Location**: `src/runtime/systems/InteractionSystem.ts`

**Handles**:
- Click detection with radius checking for 3D objects
- Interaction types: dialogue, examine, use, portal
- Flag-based interaction gating
- Event routing to appropriate managers

### GridSystem

**Implementation**: `src/runtime/systems/GridSystemImpl.ts` (production)  
**Alternative**: `src/runtime/systems/YukaGridSystem.ts` (Yuka.js integration)

**Provides**:
- Walkability pathfinding
- A* algorithm for NPC movement
- Grid-based spatial queries
- Obstacle detection

**Integration Status**: 
- ✅ GridSystemImpl fully integrated
- 🚧 YukaGridSystem implemented but NOT YET integrated
- **Recommendation**: Switch to YukaGridSystem (1.5x faster performance)

### RWMDParser

**Location**: `src/runtime/parsers/RWMDParser.ts`

**Parses** RWMD files to extract:
- Scene definitions
- Dialogue trees
- Story bindings
- Quest flags

**Provides** data to SceneCompositor and StoryCompositor

**Status**: ✅ Production-ready, comprehensive parsing

---

## Data Flow

```
RWMD Files (authored content)
    ↓
RWMDParser (extract scene data)
    ↓
SceneTemplate (JSON with slots)
    ↓
SceneCompositor (Layer 1)
    Builds: Grid system, empty slots, geometry
    ↓
StoryCompositor (Layer 2)
    Fills: NPCs, props, doors based on quest flags
    ↓
GameCompositor (Layer 3)
    Renders: Diorama viewport, UI, interactions
    ↓
Player Interaction
    ↓
InteractionSystem → QuestManager (update flags)
    ↓
[Loop back to StoryCompositor on state change]
```

### Example: Scene Load Flow

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

## Technical Vision

### Modern Web Technology
- **TypeScript** for type safety and maintainability
- **Three.js** for 3D rendering and interaction
- **Node.js** for development and build tools
- **Modern ES2022** features and syntax

### Performance Goals
- **Smooth 60fps** rendering on modern devices
- **Fast scene transitions** with preloading
- **Efficient memory usage** with asset caching
- **Responsive design** for different screen sizes

### Development Philosophy
- **Clean architecture** with strict separation of concerns
- **Comprehensive testing** with unit and integration tests
- **Documentation-driven development** with docs as the source of truth
- **Type safety** throughout the entire codebase

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
│   │   ├── InteractionSystem.ts
│   │   ├── GridSystemImpl.ts
│   │   ├── YukaGridSystem.ts        # Not yet integrated
│   │   ├── NPCController.ts         # Not yet integrated
│   │   ├── GameStateManager.ts
│   │   ├── GameUIManager.ts
│   │   └── SceneTransitionManager.ts
│   │
│   ├── loaders/
│   │   ├── SceneLoader.ts
│   │   ├── StoryBindingLoader.ts
│   │   └── GLBLoader.ts
│   │
│   └── parsers/
│       └── RWMDParser.ts
│
├── types/
│   ├── Scene.ts
│   ├── Story.ts
│   ├── Compositor.ts
│   ├── GameState.ts
│   ├── GridSystem.ts
│   └── StoryBinding.ts
│
├── ui/
│   ├── ProductionHUD.ts
│   ├── DialogueUI.ts
│   ├── QuestLogUI.ts
│   ├── SplashScreen.ts
│   └── KeyboardManager.ts
│
└── ProductionGame.ts (main entry point)
```

### RWMD Content Structure
```
scenes/
├── rwmd/              # Scene definitions
│   └── village_square.rwmd
│
├── definitions/       # JSON scene data
│   └── village_square.json
│
├── bindings/          # Story bindings
│   └── village_square.json
│
└── dialogues/         # Dialogue trees
    ├── elder_greeting.json
    └── merchant_wares.json
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

**Test Files**: `tests/unit/*.test.ts`

### Integration Tests

**Complete Flow Tests**:
- RWMD → Parser → Compositors → Viewport
- Flag changes trigger re-composition
- Scene transitions maintain state

**Test Files**: `tests/integration/*.test.ts`

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
7. **Performance First**: Optimize for smooth gameplay and fast loading
8. **Documentation Driven**: Documentation is the source of truth

---

## Production Status & Integration Gaps

### ✅ Production-Ready Systems

These systems are fully implemented, tested, and ready for production:

| System | Status | Tests | Integration |
|--------|--------|-------|-------------|
| SceneCompositor | ✅ PRODUCTION | ✅ | ✅ |
| StoryCompositor | ✅ PRODUCTION | ✅ | ✅ |
| GameCompositor | ✅ PRODUCTION | ✅ | ✅ |
| QuestManager | ✅ PRODUCTION | ✅ | ✅ |
| DialogueManager | ✅ PRODUCTION | ✅ | ✅ |
| GameStateManager | ✅ PRODUCTION | ✅ | ✅ |
| InteractionSystem | ✅ PRODUCTION | ✅ | ✅ |
| GridSystemImpl | ✅ PRODUCTION | ✅ | ✅ |
| SceneTransitionManager | ✅ PRODUCTION | ✅ | ✅ |
| RWMDParser | ✅ PRODUCTION | ✅ | ✅ |
| SceneLoader | ✅ PRODUCTION | ⚠️ | ✅ |
| StoryBindingLoader | ✅ PRODUCTION | ✅ | ✅ |
| ProductionHUD | ✅ PRODUCTION | ⚠️ | ✅ |
| DialogueUI | ✅ PRODUCTION | ⚠️ | ✅ |
| QuestLogUI | ✅ PRODUCTION | ⚠️ | ✅ |
| KeyboardManager | ✅ PRODUCTION | ⚠️ | ✅ |

**Core architecture (Story→Scene→Game) is PRODUCTION-READY**

### 🚧 Advanced Features (Implemented but NOT Integrated)

These are **fully implemented** but not yet wired into ProductionGame:

| System | File | Tests | Integration Status |
|--------|------|-------|-------------------|
| YukaGridSystem | `YukaGridSystem.ts` | ✅ | ❌ NOT INTEGRATED |
| NPCController | `NPCController.ts` | ⚠️ | ❌ NOT INTEGRATED |
| NPCManager | `NPCController.ts` (same file) | ⚠️ | ❌ NOT INTEGRATED |
| R3FGameCompositor | `R3FGameCompositor.tsx` | ❌ | ❌ NOT INTEGRATED |

**Note**: NPCManager and NPCController are both in `NPCController.ts` for cohesion.

**Action Required**:
- Wire NPCManager into ProductionGame.initializeCoreSystems()
- Add YukaGridSystem as alternative to GridSystemImpl
- Integrate R3F rendering path as alternative compositor

### ❌ Missing Systems (Need Design + Implementation)

These systems are referenced in design docs but NOT implemented:

| System | Status | Priority |
|--------|--------|----------|
| GuardianUnmakingManager | ❌ NOT IMPLEMENTED | 🔴 CRITICAL |
| BoonSystem | ❌ NOT IMPLEMENTED | 🔴 CRITICAL |
| CombatOrchestrator | ❌ NOT IMPLEMENTED | 🔴 CRITICAL |
| PersonaSystem | ❌ NOT IMPLEMENTED | 🟡 HIGH |
| DialogueCombatManager | ❌ NOT IMPLEMENTED | 🟡 HIGH |
| StrategicChoiceUI | ❌ NOT IMPLEMENTED | 🟡 HIGH |

**These are the PRIMARY focus for the next integration phase**

### 🤖 AI/Asset Generation (Build-Time Tools)

These systems work but are OFFLINE tools for content creation:

| System | File | Purpose | Usage |
|--------|------|---------|-------|
| SceneOrchestrator | `ai/SceneOrchestrator.ts` | AI scene generation | Build-time |
| EnhancedSceneOrchestrator | `ai/EnhancedSceneOrchestrator.ts` | Advanced scene gen | Build-time |
| GPTImageGenerator | `ai/GPTImageGenerator.ts` | Image generation | Build-time |
| MeshyClient | `ai/MeshyClient.ts` | 3D model generation | Build-time |
| AnthropicClient | `ai/AnthropicClient.ts` | Narrative generation | Build-time |
| AmbientCGProvider | `ai/AmbientCGProvider.ts` | Texture sourcing | Build-time |
| AssetLibrary | `ai/AssetLibrary.ts` | Asset management | Build-time |
| LoreLoader | `ai/LoreLoader.ts` | Lore injection | Build-time |

**Clarification**: These are **build-time** content generators, NOT runtime systems. They should be CLI tools for asset pipeline.

---

## Critical Misalignments (MUST FIX)

### 🚨 Misalignment 1: Combat System Missing

**Problem**: Design docs extensively describe combat (general-observer style, dialogue-based, persona system) but **ZERO implementation exists**

**Impact**: BLOCKING for MVP (Chapters 0-1)

**Solution Required**:
1. Create `CombatOrchestrator.ts`
2. Implement persona-based AI for faction leaders
3. Create strategic choice UI system
4. Integrate Yuka AI for battle execution
5. Separate Guardian Unmakings (ritual sequences) from Combat (battles)

### 🚨 Misalignment 2: Guardian Unmaking System Missing

**Problem**: Design doc (`GUARDIAN_UNMAKING_SYSTEM.md`) exists but **NO implementation**

**Impact**: BLOCKING for MVP (Chapter 1)

**Solution Required**:
1. Create `GuardianUnmakingManager.ts`
2. Implement ritual sequence system (cutscene-based)
3. Create moral choice dialogue patterns
4. Integrate with QuestManager flags
5. Add `Player.addBoon()` system
6. Create Stone Warden unmaking (Chapter 1)

### 🚨 Misalignment 3: NPC AI Disconnected

**Problem**: NPCController and NPCManager are fully implemented but **never instantiated**

**Impact**: Medium - NPC movement doesn't use advanced Yuka steering behaviors

**Solution Required**:
```typescript
// Add to ProductionGame.initializeCoreSystems()
this.npcManager = new NPCManager();

// Add to ProductionGame update loop
gameLoop(delta) {
  this.npcManager.update(delta, this.questManager.getState(), playerPos);
}
```

### ⚠️ Misalignment 4: YukaGridSystem Not Default

**Problem**: YukaGridSystem provides 1.5x faster pathfinding but GridSystemImpl still used

**Impact**: Low - Performance optimization opportunity missed

**Solution Required**:
```typescript
// Use Yuka as default in SceneCompositor
const gridSystem = new YukaGridSystem(width, height, 1.0);
```

### ⚠️ Misalignment 5: Multiple Rendering Paths Unclear

**Problem**: THREE game compositors exist but role unclear

**Options**:
1. `GameCompositor.ts` - Traditional Three.js ✅
2. `R3FGameCompositor.tsx` - React Three Fiber 🚧
3. `GameUIManager.ts` - UI overlay system ⚠️

**Solution Required**: Clarify which is "primary" renderer (recommend: GameCompositor)

### ⚠️ Misalignment 6: Files with @ts-nocheck

**Problem**: 5 files have TypeScript checking disabled

| File | Priority |
|------|----------|
| `GameUIManager.ts` | 🔴 CRITICAL |
| `AIClient.ts` | 🟡 HIGH |
| `GPTImageGenerator.ts` | 🟡 HIGH |
| `ProductionGame.ts` | 🟢 LOW |
| `demo-integrations.ts` | 🟢 LOW (demo only) |

**Solution Required**: Fix type errors, remove @ts-nocheck

---

## Next Steps for Integration

### Immediate Actions (Week 1)

1. **NPC Integration** (3 days)
   - Wire NPCManager into ProductionGame
   - Switch to YukaGridSystem as default
   - Test NPC movement in scenes

2. **Type Safety Fixes** (2 days)
   - Fix @ts-nocheck files
   - Update to proper TypeScript patterns
   - Clean up type errors

### High Priority (Weeks 2-4)

3. **Guardian Unmaking System** (1 week)
   - Create GuardianUnmakingManager
   - Implement ritual sequence system
   - Create Stone Warden unmaking scene

4. **Combat System** (2 weeks)
   - Create CombatOrchestrator
   - Implement persona system
   - Build strategic choice UI
   - Integrate Yuka AI battle execution

### Medium Priority (Week 5)

5. **Polish & Documentation**
   - R3F integration (optional)
   - AI pipeline documentation
   - Update architecture docs
   - Final testing

---

## Related Documents

- `design.md` - Game design, narrative structure, and gameplay systems
- `CANONICAL_STORY_BIBLE.md` - Lore, factions, mythology (reference only)
- `INTEGRATION_ROADMAP.md` - Detailed implementation plan (reference only)
- `PRODUCTION_CODE_AUDIT.md` - Code quality assessment (reference only)

---

**Status**: FROZEN v1.0  
**Last Updated**: 2025-10-27  
**Authority**: NORTH STAR DOCUMENT - All implementation must align to this specification
