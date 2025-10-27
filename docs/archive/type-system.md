# Type System

**Version**: 1.0 **FROZEN**

## Overview

Strict TypeScript type system with comprehensive interfaces for all data structures. No `any` types allowed.

## Core Types

### GridSystem Types

**Location**: `src/types/GridSystem.ts`

```typescript
type GridPosition = [x: number, y: number];  // 2D tile coordinates
type WorldPosition = [x: number, y: number, z: number];  // 3D world space

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

interface WallDef {
  side: 'north' | 'south' | 'east' | 'west';
  height: number;
  texture: string;
}
```

### Scene Definition Types

**Location**: `src/types/SceneDefinition.ts`

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

### Story Binding Types

**Location**: `src/types/StoryBinding.ts`

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

interface SlotContent {
  slotId: string;
  modelPath: string;
  requiredFlags?: string[];
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}
```

### Game State Types

**Location**: `src/types/GameState.ts`

```typescript
interface QuestState {
  storyFlags: Record<string, boolean>;
  activeQuests: string[];
  completedQuests: string[];
  aStoryProgress: number;
  bStoryProgress: number;
  cStoryProgress: number;
}

interface GameViewState {
  story: ComposedStory;
  viewport: { width: number; height: number };
  uiState: {
    dialogueOpen: boolean;
    inventoryOpen: boolean;
    questLogOpen: boolean;
  };
}
```

### Compositor Types

**Location**: `src/types/Compositor.ts`

```typescript
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

interface GameViewport {
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
  ui: HTMLElement;
  interactionHandlers: Map<string, InteractionHandler>;
}
```

## Type Safety Patterns

### Strict Typing
All interfaces are strictly typed with no `any`:

```typescript

// ❌ Avoid
function processData(data: any): any { }

// ✅ Use
function processData(data: SceneTemplate): ComposedScene { }
```

### Optional Properties
Handle optional properties safely:

```typescript
interface SlotContent {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

// Safe handling
const position = content.position || [0, 0, 0];
const rotation = content.rotation || [0, 0, 0];
const scale = content.scale || [1, 1, 1];
```

### Generic Types
Use generics for reusable patterns:

```typescript
interface Cache<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
  clear(): void;
}

type SceneCache = Cache<ComposedScene>;
type DialogueCache = Cache<DialogueTree>;
```

### Union Types
Use union types for controlled values:

```typescript
type InteractionType = 'dialogue' | 'examine' | 'use' | 'portal';
type WallSide = 'north' | 'south' | 'east' | 'west';
type QuestState = 'inactive' | 'active' | 'completed';
```

## Layer Boundary Types

### Scene Layer Types
```typescript
// SceneCompositor only knows about these
type SceneInput = SceneTemplate;
type SceneOutput = ComposedScene;

// ❌ SceneCompositor should never import these
type StoryInput = ComposedScene;
type StoryOutput = ComposedStory;
type GameInput = ComposedStory;
type GameOutput = GameViewport;
```

### Story Layer Types
```typescript
// StoryCompositor only knows about these
type StoryInput = ComposedScene;
type StoryOutput = ComposedStory;

// ❌ StoryCompositor should never import these
type SceneInput = SceneTemplate;
type GameInput = ComposedStory;
type GameOutput = GameViewport;
```

### Game Layer Types
```typescript
// GameCompositor only knows about these
type GameInput = ComposedStory;
type GameOutput = GameViewport;

// ❌ GameCompositor should never import these
type SceneInput = SceneTemplate;
type StoryInput = ComposedScene;
type StoryOutput = ComposedStory;
```

## Type Guards

Use type guards for runtime type checking:

```typescript
function isSceneTemplate(obj: unknown): obj is SceneTemplate {
  return typeof obj === 'object' && 
         obj !== null && 
         'id' in obj && 
         'grid' in obj;
}

function isGridPosition(obj: unknown): obj is GridPosition {
  return Array.isArray(obj) && 
         obj.length === 2 && 
         typeof obj[0] === 'number' && 
         typeof obj[1] === 'number';
}
```

## Error Types

Define specific error types:

```typescript
class SceneParseError extends Error {
  constructor(
    public sceneId: string,
    public field: string,
    message: string
  ) {
    super(`Scene '${sceneId}' error in '${field}': ${message}`);
  }
}

class AssetLoadError extends Error {
  constructor(
    public assetPath: string,
    public reason: string
  ) {
    super(`Failed to load asset '${assetPath}': ${reason}`);
  }
}
```

## Testing Types

Use test-specific types for mocking:

```typescript
interface MockQuestManager {
  setFlag: jest.MockedFunction<(flag: string, value?: boolean) => void>;
  hasFlag: jest.MockedFunction<(flag: string) => boolean>;
  storyFlags: Record<string, boolean>;
}

interface TestSceneTemplate extends SceneTemplate {
  // Add test-specific properties
  testId: string;
  expectedOutput: ComposedScene;
}
```

## Type Documentation

Document complex types with JSDoc:

```typescript
/**
 * Represents a 3D position in world space
 * @param x - X coordinate in world units
 * @param y - Y coordinate in world units  
 * @param z - Z coordinate in world units
 */
type WorldPosition = [x: number, y: number, z: number];

/**
 * Grid system for 2D navigation and pathfinding
 * @interface GridSystem
 */
interface GridSystem {
  /** Width of the grid in tiles */
  width: number;
  /** Height of the grid in tiles */
  height: number;
  /** 2D array indicating walkable tiles */
  walkable: boolean[][];
  /** World units per tile */
  tileSize: number;
}
```

## Type Exports

Organize type exports by layer:

```typescript
// src/types/index.ts
export * from './GridSystem';
export * from './SceneDefinition';
export * from './StoryBinding';
export * from './GameState';
export * from './Compositor';

// Layer-specific exports
export type { SceneInput, SceneOutput } from './SceneDefinition';
export type { StoryInput, StoryOutput } from './StoryBinding';
export type { GameInput, GameOutput } from './Compositor';
```