# System Data Flow

**Version**: 1.0 **FROZEN**

## Overview

The complete data flow from scene file to rendered game, showing how data moves through the three-tier compositor pattern.

## Complete Flow

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

## Detailed Flow

### 1. Content Authoring
```
RWMD Files (scenes/rwmd/*.rwmd)
├── Scene metadata (id, grid, atmosphere)
├── Environment (floor, walls, ceiling)
├── Props (positions, models, interactions)
├── NPCs (positions, dialogue, quests)
├── Portals (exits, requirements, targets)
└── Lighting (ambient, directional, points)
```

### 2. Parsing Phase
```
RWMDParser.parseSceneFile()
├── Extract metadata
├── Parse environment definitions
├── Resolve anchors (@props/fountain → path)
├── Validate scene structure
└── Output SceneDefinition JSON
```

### 3. Scene Building (Layer 1)
```
SceneCompositor.build(SceneTemplate)
├── Create THREE.Scene geometry
├── Build floor/wall/ceiling meshes
├── Generate walkable grid
├── Create empty slot maps
└── Return ComposedScene
```

### 4. Story Filling (Layer 2)
```
StoryCompositor.compose(ComposedScene, QuestState)
├── Read StoryBinding for scene
├── Evaluate quest flags
├── Fill NPC slots with characters
├── Fill prop slots with quest items
├── Set door states (locked/unlocked)
└── Return ComposedStory
```

### 5. Game Presentation (Layer 3)
```
GameCompositor.render(ComposedStory, Viewport)
├── Frame scene in diorama viewport
├── Position camera for optimal view
├── Render UI overlays
├── Setup interaction handlers
└── Return GameViewport
```

### 6. Player Interaction
```
Player Click/Input
├── InteractionSystem.handleClick()
├── Raycast to find clicked object
├── Check interaction requirements
├── Trigger appropriate handler
└── Update QuestManager flags
```

### 7. State Update Loop
```
QuestManager.setFlag() → QuestState change
    ↓
StoryCompositor.recompose() → New ComposedStory
    ↓
GameCompositor.rerender() → Updated GameViewport
    ↓
Player sees updated scene
```

## Data Transformations

### SceneTemplate → ComposedScene
```typescript
// Input: SceneTemplate
{
  id: "village_square",
  grid: { width: 24, height: 16 },
  floor: { texture: "cobblestone" },
  slots: {
    npcs: [{ id: "elder", position: [12, 8] }],
    props: [{ id: "fountain", position: [12, 12] }]
  }
}

// Output: ComposedScene
{
  scene: THREE.Scene, // Geometry only
  gridSystem: GridSystem, // Walkability
  slots: {
    npcs: Map("elder" → [12, 8]),
    props: Map("fountain" → [12, 12]),
    doors: Map()
  }
}
```

### ComposedScene → ComposedStory
```typescript
// Input: ComposedScene + QuestState
{
  room: ComposedScene,
  questState: { storyFlags: { "met_elder": true } }
}

// Output: ComposedStory
{
  room: ComposedScene,
  npcs: Map("elder" → {
    position: [12, 8],
    mesh: THREE.Group, // Loaded model
    dialogueId: "elder_greeting",
    questId: "seek_guardian"
  }),
  props: Map("fountain" → {
    position: [12, 12],
    mesh: THREE.Group,
    interactive: false
  }),
  doors: Map()
}
```

### ComposedStory → GameViewport
```typescript
// Input: ComposedStory + Viewport
{
  story: ComposedStory,
  viewport: { width: 1920, height: 1080 }
}

// Output: GameViewport
{
  scene: THREE.Scene, // Complete scene
  camera: THREE.PerspectiveCamera, // Positioned
  renderer: THREE.WebGLRenderer,
  ui: HTMLElement, // UI overlays
  interactionHandlers: Map() // Click handlers
}
```

## State Management

### Quest State Flow
```
Player Action → InteractionSystem → QuestManager
    ↓
QuestState Change → StoryCompositor → ComposedStory
    ↓
GameCompositor → GameViewport → Player sees change
```

### Scene Transition Flow
```
Player clicks portal → InteractionSystem
    ↓
Check portal requirements → QuestManager
    ↓
Load new scene → SceneLoader
    ↓
Parse RWMD → RWMDParser
    ↓
Build scene → SceneCompositor
    ↓
Fill with story → StoryCompositor
    ↓
Present to player → GameCompositor
```

## Error Handling Flow

### Parse Errors
```
RWMD File → RWMDParser → Validation Error
    ↓
Log error → Return fallback scene
    ↓
Continue with basic scene
```

### Asset Loading Errors
```
SceneCompositor → GLBLoader → Asset Error
    ↓
Log error → Create placeholder mesh
    ↓
Continue with placeholder
```

### Runtime Errors
```
Player Interaction → InteractionSystem → Error
    ↓
Log error → Show user message
    ↓
Continue with safe state
```

## Performance Considerations

### Caching Strategy
```
SceneCompositor → SceneCache (LRU)
StoryCompositor → ContentCache (LRU)
GameCompositor → RenderCache (LRU)
```

### Lazy Loading
```
Scene Load → Load geometry immediately
    ↓
Story Fill → Load models on demand
    ↓
Game Render → Load UI on demand
```

### Memory Management
```
Scene Unload → Clear caches
    ↓
Asset Cleanup → Remove unused models
    ↓
GC → Free memory
```

## Testing Flow

### Unit Test Flow
```
Test Input → System Under Test → Expected Output
    ↓
Assert → Pass/Fail
```

### Integration Test Flow
```
RWMD File → Complete Pipeline → Rendered Scene
    ↓
Assert → Scene properties correct
    ↓
Assert → Interactions work
    ↓
Assert → State updates correctly
```

## Debugging Flow

### Debug Information
```
Scene Load → Log each step
    ↓
State Change → Log before/after
    ↓
Error → Log context and stack
    ↓
Performance → Log timing
```

### Debug Tools
```
Scene Inspector → Show scene structure
    ↓
State Inspector → Show quest flags
    ↓
Performance Monitor → Show FPS/memory
    ↓
Console → Show debug messages
```