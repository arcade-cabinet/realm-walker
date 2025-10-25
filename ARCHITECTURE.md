# Architecture

## Overview

Realm Walker Story is a ScummVM-style 3D adventure game built with TypeScript, Node.js, and Three.js. The architecture follows a **strict three-tier compositor pattern** with complete separation of concerns.

## Three-Tier Compositor Pattern

The system is divided into three independent layers, each with specific responsibilities and strict boundaries:

### Layer 1: SceneCompositor

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

### Layer 2: StoryCompositor

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

### Layer 3: GameCompositor

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

## Core Systems

### QuestManager

**Location**: `src/runtime/systems/QuestManager.ts`

**Purpose**: Boolean flag-based quest progression (NO numerical stats).

**Features**:
- Story flag management (e.g., "met_elder", "has_palace_key")
- Active/completed quest tracking
- A/B/C story thread progress counters
- Scene access gating based on flags

**Philosophy**: Everything is boolean. No health, mana, XP, or inventory arrays. Items are flags.

### DialogueManager

**Location**: `src/runtime/systems/DialogueManager.ts`

**Purpose**: Conversation system with branching dialogue trees.

**Features**:
- Dialogue node navigation
- Choice-based branching
- Flag setting from dialogue
- Auto-advance and manual choice modes

### InteractionSystem

**Location**: `src/runtime/systems/InteractionSystem.ts`

**Purpose**: Handle player clicks and interactions.

**Features**:
- Click detection with radius checking
- Interaction types: dialogue, examine, use, portal
- Flag-based gating for interactions
- Handler callbacks for game logic

### GridSystemImpl

**Location**: `src/runtime/systems/GridSystemImpl.ts`

**Purpose**: 2D tile-based navigation and pathfinding.

**Features**:
- Walkability grid management
- A* pathfinding
- World ↔ Grid coordinate conversion
- Neighbor and distance calculations

### RWMDParser

**Location**: `src/runtime/parsers/RWMDParser.ts`

**Purpose**: Parse RWMD (Room With a Million Doors) scene files.

**Features**:
- Declarative scene syntax
- Anchor resolution (@props/fountain → assets/models/props/fountain.glb)
- Metadata extraction
- JSON output generation

## Type System

### Core Types

**GridSystem** (`src/types/GridSystem.ts`):
- `GridPosition`: [x, y] 2D tile coordinates
- `WorldPosition`: [x, y, z] 3D world space
- `GridSystem`: Interface for navigation
- `WallDef`: Wall definition structure

**SceneDefinition** (`src/types/SceneDefinition.ts`):
- `SceneTemplate`: Complete scene structure
- `InteractionPoint`: Clickable hotspots

**StoryBinding** (`src/types/StoryBinding.ts`):
- `StoryBinding`: Maps story content to scene slots

**GameState** (`src/types/GameState.ts`):
- `QuestState`: Player quest progression
- `GameViewState`: Current UI/viewport state

**Compositor** (`src/types/Compositor.ts`):
- `ComposedScene`: Layer 1 output
- `ComposedStory`: Layer 2 output
- `GameViewport`: Layer 3 output

## Directory Structure

```
src/
├── runtime/
│   ├── loaders/
│   │   └── GLBLoader.ts          # Three.js model loading
│   ├── parsers/
│   │   └── RWMDParser.ts         # Scene file parser
│   ├── systems/
│   │   ├── SceneCompositor.ts    # Layer 1: Geometry
│   │   ├── StoryCompositor.ts    # Layer 2: Content
│   │   ├── GameCompositor.ts     # Layer 3: Presentation
│   │   ├── QuestManager.ts       # Quest flags
│   │   ├── DialogueManager.ts    # Conversations
│   │   ├── InteractionSystem.ts  # Click handling
│   │   └── GridSystemImpl.ts     # Navigation
│   └── rendering/
│       └── (future: rendering utilities)
├── types/
│   ├── Scene.ts
│   ├── Story.ts
│   ├── Compositor.ts
│   ├── GridSystem.ts
│   ├── SceneDefinition.ts
│   ├── StoryBinding.ts
│   └── GameState.ts
└── scenes/
    ├── definitions/              # JSON scene data
    ├── bindings/                 # Story content mappings
    └── rwmd/                     # Source RWMD files
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

## References

- **BOOTSTRAP.md**: Complete project specification
- **NEXT_STEPS.md**: Implementation roadmap
- **README.md**: Usage and getting started
