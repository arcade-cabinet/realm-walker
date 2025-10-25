# RWMD Parser System

**Version**: 1.0 **FROZEN**

## Overview

**RWMD (Room With a Million Doors)**: Declarative format for defining 3D adventure game scenes.

## Parser Requirements

**Location**: `src/runtime/parsers/RWMDParser.ts`

The parser must extract:

1. **Scene Metadata**: ID, grid dimensions (width × height), atmosphere tags
2. **Environment Definition**: Floor/wall/ceiling textures, GLB model references
3. **Prop Placements**: 3D positions (x, y, z), rotation, scale, GLB asset paths
4. **NPC Spawn Points**: Positions with dialogue IDs
5. **Interaction Hotspots**: Click zones for examine/use/talk actions
6. **Portal Zones**: Exit areas with target scene IDs and required quest flags
7. **Camera Hints**: Suggested angles/positions for diorama framing
8. **Lighting Setup**: Ambient, directional, point lights

## Anchor Resolution

Convert RWMD anchors like `@props/fountain` to actual GLB paths like `assets/models/props/fountain.glb`

**Output Format**: JSON scene definitions consumable by SceneCompositor

## RWMD Syntax

### Basic Structure
```
scene: scene_id
grid: widthxheight
atmosphere: tag1, tag2, tag3

props:
  - id @anchor pos:(x, y, z) rot:(rx, ry, rz) scale:(sx, sy, sz)

npcs:
  - id pos:(x, y) dialogue:dialogue_id quest:quest_id

portals:
  - id pos:(x, y) target:target_scene requires:flag1,flag2

lighting:
  ambient: color
  directional: color direction:(x, y, z)
  points:
    - pos:(x, y, z) color:color intensity:number
```

### Example RWMD File
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

lighting:
  ambient: #2a0a0a
  directional: #ff4444 direction:(0.5, -1, 0.3)
  points:
    - pos:(12, 8, 3) color:#ff0000 intensity:2.0
```

## Parser Implementation

### Core Functions

```typescript
class RWMDParser {
  parseSceneFile(content: string): SceneDefinition;
  resolveAnchor(anchor: string): string;
  validateScene(scene: SceneDefinition): boolean;
  extractMetadata(lines: string[]): SceneMetadata;
  parseProps(lines: string[]): PropDefinition[];
  parseNPCs(lines: string[]): NPCDefinition[];
  parsePortals(lines: string[]): PortalDefinition[];
  parseLighting(lines: string[]): LightingDefinition;
}
```

### Anchor Resolution System

```typescript
interface AnchorMap {
  '@props/': 'assets/models/props/';
  '@architecture/': 'assets/models/architecture/';
  '@npcs/': 'assets/models/npcs/';
  '@textures/': 'assets/textures/';
}

function resolveAnchor(anchor: string): string {
  // @props/fountain → assets/models/props/fountain.glb
  // @architecture/victorian_palace → assets/models/architecture/victorian_palace.glb
}
```

### Validation

```typescript
function validateScene(scene: SceneDefinition): boolean {
  // Check required fields
  if (!scene.id || !scene.grid) return false;
  
  // Validate grid dimensions
  if (scene.grid.width <= 0 || scene.grid.height <= 0) return false;
  
  // Check for missing assets
  for (const prop of scene.props) {
    if (!assetExists(prop.modelPath)) {
      throw new Error(`Missing asset: ${prop.modelPath}`);
    }
  }
  
  return true;
}
```

## Output Format

### SceneDefinition Interface

```typescript
interface SceneDefinition {
  id: string;
  grid: { width: number; height: number };
  atmosphere: string[];
  floor: { texture: string };
  walls?: WallDefinition[];
  ceiling?: { texture: string; height: number };
  props: PropDefinition[];
  npcs: NPCDefinition[];
  portals: PortalDefinition[];
  lighting: LightingDefinition;
  cameraHints?: CameraHint[];
}

interface PropDefinition {
  id: string;
  modelPath: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  interactive?: boolean;
}

interface NPCDefinition {
  id: string;
  position: [number, number];
  dialogueId?: string;
  questId?: string;
  modelPath?: string;
}

interface PortalDefinition {
  id: string;
  position: [number, number];
  target: string;
  requiresFlags?: string[];
  locked?: boolean;
  wall?: 'north' | 'south' | 'east' | 'west'; // Optional wall specification
}

interface LightingDefinition {
  ambient: { color: string; intensity: number };
  directional?: { color: string; direction: [number, number, number]; intensity: number };
  points: Array<{
    position: [number, number, number];
    color: string;
    intensity: number;
  }>;
}
```

## Error Handling

### Validation Errors
- Missing required fields
- Invalid grid dimensions
- Malformed position/rotation/scale values
- Missing asset files
- Invalid flag references

### Error Messages
```typescript
throw new Error(`Invalid scene '${sceneId}': missing grid dimensions`);
throw new Error(`Missing asset: ${modelPath}`);
throw new Error(`Invalid position format: ${position}`);
```

## Integration with SceneCompositor

The parser output is consumed by SceneCompositor:

```typescript
// Parse RWMD file
const sceneDef = RWMDParser.parseSceneFile(rwmdContent);

// Convert to SceneTemplate
const template: SceneTemplate = {
  id: sceneDef.id,
  grid: sceneDef.grid,
  floor: sceneDef.floor,
  walls: sceneDef.walls,
  ceiling: sceneDef.ceiling,
  slots: {
    npcs: sceneDef.npcs.map(npc => ({
      id: npc.id,
      position: [npc.position[0], npc.position[1]]
    })),
    props: sceneDef.props.map(prop => ({
      id: prop.id,
      position: [prop.position[0], prop.position[1]]
    })),
    doors: sceneDef.portals.map(portal => ({
      id: portal.id,
      position: [portal.position[0], portal.position[1]],
      wall: portal.wall || 'south' // Default to south wall if not specified
    }))
  }
};

// Build scene
const composedScene = SceneCompositor.build(template);
```

## Testing

Parser is tested with:
- Valid RWMD files
- Invalid syntax handling
- Anchor resolution
- Asset validation
- Error message clarity

## Future Enhancements

- Support for more complex lighting setups
- Animation definitions
- Sound placement
- Particle effects
- Conditional content based on flags