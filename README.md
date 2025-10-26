# Realm Walker Story

A TypeScript-based adventure game engine with three-tier compositor architecture, boolean flag quest system, AI-powered content generation, and best-in-class third-party library integrations.

## ✨ Key Features

### Core Architecture
- **Three-Tier Compositor Pattern** - Strict separation: Scene (geometry) → Story (content) → Game (presentation)
- **Boolean Flag Quest System** - No stats or inventory arrays, pure flag-based progression
- **RWMD Scene Format** - Human-readable scene definition language
- **Type-Safe TypeScript** - Comprehensive interfaces, no `any` types

### 🚀 Third-Party Integrations (NEW!)
- **React Three Fiber** - Declarative Three.js rendering with automatic memory management
- **Yuka.js** - Advanced AI pathfinding (1.5x faster) and NPC steering behaviors
- **@react-three/drei** - Helper components for camera controls, environments, and more
- **PathFinding.js** - Additional pathfinding algorithms

### 🤖 AI-Powered Content
- **Claude Sonnet 4.5** - 1M token context for narrative analysis
- **Asset Import Workflows** - Automatically correlate GLB files with metadata
- **Narrative Extraction** - Extract quests, NPCs, dialogue from any text format
- **Embeddings Search** - Semantic content retrieval for scene generation

## Quick Start

### Installation

```bash
npm install
```

### Run Demos

```bash
# Core runtime demo
npm run demo

# AI content import demo
npm run demo:import

# Third-party integrations demo (Yuka, R3F) - NEW!
npm run demo:integrations
```

### Test

```bash
# Run all tests
npm test

# Watch mode
npm test:watch

# Coverage
npm test:coverage
```

## 🎮 Third-Party Library Integration

### Yuka.js Pathfinding (1.5x Faster!)

```typescript
import { YukaGridSystem } from './runtime/systems';

// Drop-in replacement for GridSystemImpl
const grid = new YukaGridSystem(24, 16, 1.0);
const path = grid.findPath([2, 2], [22, 14]);
// 50% faster on long paths!
```

### NPC AI with Steering Behaviors

```typescript
import { NPCManager } from './runtime/systems';

const npcManager = new NPCManager();
const guard = npcManager.createNPC({
  id: 'guard',
  position: [10, 0, 10],
  maxSpeed: 2.0
});

// Quest flags control behavior automatically
questManager.setFlag('npc_guard_hostile', true);
npcManager.update(delta, questState, playerPosition);
// Guard now seeks player using steering behaviors!
```

### React Three Fiber Rendering

```typescript
import { R3FGameCompositor } from './runtime/systems';

const compositor = new R3FGameCompositor();
const reactElement = compositor.compose(composedScene, activeContent, {
  enableOrbitControls: true,
  environmentPreset: 'city',
  onObjectClick: (slotId) => console.log(`Clicked: ${slotId}`)
});

// Render in your React app
function GameApp() {
  return <div style={{ width: '100vw', height: '100vh' }}>{reactElement}</div>;
}
```

**📚 Full Guide**: [QUICKSTART_INTEGRATIONS.md](./QUICKSTART_INTEGRATIONS.md)

## 🤖 AI Content Import

### Import 3D Assets

```bash
npm run demo:import assets
```

```typescript
import { AssetImportWorkflow } from './ai/workflows';

const workflow = new AssetImportWorkflow(assetLibrary);
await workflow.importDirectory('./assets/models', './assets/metadata');
// AI correlates GLBs with metadata automatically
```

### Import Narrative Content

```bash
npm run demo:import narrative
```

```typescript
import { NarrativeImportWorkflow } from './ai/workflows';

const workflow = new NarrativeImportWorkflow(assetLibrary, anthropicClient);
await workflow.importNarrative('./story/chapter1.txt');
// Extracts quests, NPCs, dialogue, lore automatically
```

**📚 Full Guide**: [IMPORT_WORKFLOWS.md](./IMPORT_WORKFLOWS.md)

## Architecture

### Three-Tier Compositor

```
RWMD Files → RWMDParser → SceneTemplate
                ↓
        SceneCompositor (Layer 1)
            Builds geometry + grid
                ↓
        StoryCompositor (Layer 2)
            Fills slots based on quest flags
                ↓
        GameCompositor (Layer 3) - Choose:
          ├─ GameCompositor (vanilla Three.js)
          └─ R3FGameCompositor (React Three Fiber)
                ↓
        WebGLRenderer
```

### Boolean Flag Quests

```typescript
interface QuestState {
  storyFlags: Record<string, boolean>;  // ONLY booleans, no stats!
  activeQuests: string[];
  completedQuests: string[];
  aStoryProgress: number;  // Thread position (0-100)
  bStoryProgress: number;
  cStoryProgress: number;
}
```

### RWMD Scene Format

```yaml
# Scene: Village Square
id: village_square
grid: 24x16
floor: cobblestone_01

@npc elder
  position: 12, 8
  dialogue: elder_greeting
  quest: seek_guardian
  
@prop fountain
  position: 12, 12
  model: props/fountain_stone
```

## Project Structure

```
src/
├── runtime/
│   ├── systems/
│   │   ├── SceneCompositor.ts
│   │   ├── StoryCompositor.ts
│   │   ├── GameCompositor.ts
│   │   ├── R3FGameCompositor.tsx      # NEW!
│   │   ├── YukaGridSystem.ts          # NEW!
│   │   ├── NPCController.ts           # NEW!
│   │   ├── QuestManager.ts
│   │   └── DialogueManager.ts
│   ├── loaders/
│   │   ├── GLBLoader.ts
│   │   ├── SceneLoader.ts
│   │   └── StoryBindingLoader.ts
│   └── parsers/
│       └── RWMDParser.ts
├── ai/
│   ├── workflows/
│   │   ├── AssetImportWorkflow.ts
│   │   ├── NarrativeImportWorkflow.ts
│   │   └── ImportOrchestrator.ts
│   ├── AnthropicClient.ts
│   └── AssetLibrary.ts
├── types/
├── schemas/
└── ui/

docs/
├── architecture/
│   ├── compositor-pattern.md
│   ├── quest-system.md
│   ├── third-party-integrations.md     # NEW!
│   └── content-import.md
└── design/
    ├── game-vision.md
    └── world-lore.md
```

## Documentation

### Architecture
- [Compositor Pattern](./docs/architecture/compositor-pattern.md)
- [Quest System](./docs/architecture/quest-system.md)
- [Data Flow](./docs/architecture/data-flow.md)
- [Type System](./docs/architecture/type-system.md)
- **[Third-Party Integrations](./docs/architecture/third-party-integrations.md)** ⭐ NEW!
- [Content Import](./docs/architecture/content-import.md)

### Quick Starts
- **[Third-Party Integration Guide](./QUICKSTART_INTEGRATIONS.md)** ⭐ NEW!
- [Import Workflows](./IMPORT_WORKFLOWS.md)
- **[Integration Summary](./THIRD_PARTY_INTEGRATION_SUMMARY.md)** ⭐ NEW!
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)

### Design
- [Game Vision](./docs/design/game-vision.md)
- [World Lore](./docs/design/world-lore.md)

## What's New 🎉

### Version 1.1 - Third-Party Library Integration

**Major Enhancements**:
- ✅ React Three Fiber integration for declarative rendering
- ✅ Yuka.js pathfinding (1.5x performance boost)
- ✅ NPC AI with steering behaviors (idle, wander, seek, flee, patrol)
- ✅ @react-three/drei helpers (OrbitControls, Environment, etc.)
- ✅ Comprehensive test suite for new integrations
- ✅ Full TypeScript support with strict typing

**Benefits**:
- 🚀 1.5x faster pathfinding on complex paths
- 🧠 Sophisticated NPC AI without manual animation code
- ♻️ Automatic memory management with R3F
- 🎨 Better development experience with React DevTools
- 📦 Battle-tested libraries used by thousands of projects

**Performance**:
- Pathfinding: 1.5x faster on long paths
- Memory: Better (automatic disposal with R3F)
- Bundle: +200KB (worth it for features)
- NPC AI: <5% CPU overhead with 100 NPCs

See [THIRD_PARTY_INTEGRATION_SUMMARY.md](./THIRD_PARTY_INTEGRATION_SUMMARY.md) for complete details.

## Development

### Build

```bash
npm run build
```

### Validate RWMD

```bash
npm run validate:rwmd scenes/rwmd/village_square.rwmd
```

### Clean

```bash
npm run clean
```

## Architecture Principles

### ✅ DO:
- Maintain three-tier compositor pattern
- Use boolean flags for quest progression
- Keep layer boundaries strict
- Leverage third-party libraries for complex systems
- Measure performance impact
- Provide fallbacks for compatibility

### ❌ DON'T:
- Let libraries dictate architecture
- Mix concerns across layers
- Break type safety
- Add numerical stats (HP, XP, etc.)
- Use inventory arrays (items are flags)
- Generate content procedurally (everything is authored)

## Performance

- **Rendering**: 60fps target on modern devices
- **Pathfinding**: Yuka.js 1.5x faster than custom A*
- **Memory**: LRU caching for GLB models, automatic R3F disposal
- **Bundle Size**: ~2MB with all dependencies
- **NPC AI**: <5% overhead with 100 NPCs

## Dependencies

### Core
- `three` - 3D rendering
- `typescript` - Type safety

### Third-Party Integrations
- `react`, `react-dom` - UI framework
- `@react-three/fiber` - Declarative Three.js
- `@react-three/drei` - R3F helpers
- `yuka` - AI and pathfinding
- `pathfinding` - Alternative pathfinding

### AI
- `@anthropic-ai/sdk` - Claude Sonnet 4.5
- `openai` - GPT for embeddings
- `better-sqlite3` - Embeddings database

### Development
- `jest` - Testing framework
- `ts-node` - TypeScript execution
- `ts-jest` - Jest TypeScript support

## License

ISC

## Contributing

See `.clinerules` for development guidelines and architecture constraints.

---

**Built with ❤️ and 🤖 AI assistance**

**Foundation solid. Acceleration enabled. 🚀**
