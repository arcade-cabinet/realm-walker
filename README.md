# Realm Walker Story

A ThreeJS TypeScript/Node.js adventure game engine with a three-tier compositor architecture.

## Architecture

The engine uses strict layer separation with three compositors:

### 1. **SceneCompositor** (First Tier)
- Builds room geometry from scene definitions
- Creates empty slots for content placement
- **Knows nothing about story or quest flags**
- Input: `SceneData` (parsed from RWMD files)
- Output: `ComposedScene` (geometry + empty slot markers)

### 2. **StoryCompositor** (Second Tier)
- Evaluates quest flags to determine active content
- Fills slots based on boolean flag requirements
- **Knows nothing about presentation or rendering**
- Input: `StoryData` + `QuestFlags`
- Output: `SlotContent[]` (which slots should have which models)

### 3. **GameCompositor** (Third Tier)
- Combines scene geometry and story content
- Loads and positions GLB 3D models
- Manages camera, lighting, and viewport
- Input: `ComposedScene` + `SlotContent[]`
- Output: `GameViewport` (renderable Three.js scene)

## Features

- **RWMD Parser**: Parse Realm Walker Markup Description files to JSON
- **Quest Flag System**: Boolean flag management (no stats, just true/false)
- **GLB Model Loading**: Three.js-based 3D model loader with caching
- **Strict Separation**: Each layer is independent and testable

## Project Structure

```
realm-walker-story/
├── src/
│   ├── runtime/
│   │   ├── loaders/         # GLB model loader
│   │   ├── parsers/         # RWMD parser
│   │   └── systems/         # Three compositors + quest system
│   ├── types/               # TypeScript type definitions
│   ├── index.ts            # Main API exports
│   └── demo.ts             # Demo showcasing the architecture
├── scenes/                  # Example scene files
│   ├── starting_room.rwmd  # Scene definition
│   └── tutorial_story.json # Story data
└── package.json
```

## Installation

```bash
npm install
```

## Usage

### Run the Demo

```bash
npm run demo
```

The demo showcases all three tiers working together:
1. Parsing RWMD scene files
2. Composing geometry and slots
3. Evaluating quest flags
4. Determining active content

### Basic Example

```typescript
import { RealmWalker } from 'realm-walker-story';

// Initialize with quest flags
const game = new RealmWalker({
  game_started: true,
  chest_opened: false
});

// Parse scene from RWMD
const sceneData = game.parseRWMD(rwmdContent);

// Load story data
const storyData = loadStoryData();

// Compose the complete scene
await game.loadScene(sceneData, storyData);

// Update flags and recompose
game.setFlag('chest_opened', true, storyData);
```

### RWMD Scene Format

RWMD (Realm Walker Markup Description) is a simple text format:

```
@scene starting_room
name: The Beginning

@geometry plane
dimensions: 10, 10
position: 0, 0, 0
color: #8b7355

@slot chest
position: -3, 0.5, -3
scale: 1, 1, 1
```

### Story Data Format

JSON format defining slot contents and flag requirements:

```json
{
  "id": "tutorial_story",
  "sceneId": "starting_room",
  "slotContents": [
    {
      "slotId": "chest",
      "modelPath": "models/chest.glb",
      "requiredFlags": []
    },
    {
      "slotId": "door",
      "modelPath": "models/door.glb",
      "requiredFlags": ["chest_opened"]
    }
  ]
}
```

## API

### Main Classes

- **`RealmWalker`**: Main orchestrator class
- **`SceneCompositor`**: Tier 1 - Scene geometry builder
- **`StoryCompositor`**: Tier 2 - Story logic evaluator
- **`GameCompositor`**: Tier 3 - Rendering compositor
- **`QuestManager`**: Quest progression and boolean flag manager
- **`RWMDParser`**: Scene file parser
- **`GLBLoader`**: 3D model loader

### Types

All TypeScript types are exported from the main module:
- `SceneData`, `SceneSlot`, `SceneGeometry`
- `StoryData`, `SlotContent`, `QuestFlags`
- `ComposedScene`, `ComposedStory`, `GameViewport`

## Build

```bash
npm run build
```

Compiles TypeScript to JavaScript in the `dist/` directory.

## Development

```bash
npm run dev
```

Runs the demo in development mode with ts-node.

## Layer Separation Guarantees

- **SceneCompositor** has no imports from Story or Game types
- **StoryCompositor** has no imports from presentation/Three.js
- **GameCompositor** is the only layer that knows about Three.js rendering
- Data flows one-way: Scene → Story → Game

## License

ISC
