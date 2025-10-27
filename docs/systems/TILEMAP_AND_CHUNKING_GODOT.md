# Chunked Tile System - ECS-Based Map Generation

**Version**: 1.0  
**Status**: Current Architecture (NEW - Better than old)  
**Last Updated**: 2025-10-15

---

## Philosophy

**Hierarchy**: Primitives → Biomes → Packages → Scenarios

**NOT** the old CC0 hex tile painting system. This is the **NEW** ECS-based approach using:

- Primitive hex tiles (individual tiles with rules)
- Biome prefabs (collections of compatible tiles)
- Map packages (assembly instructions)
- Adjacency rules (coherent generation)

---

## Architecture Overview

```
┌──────────────────────────────────────┐
│   PRIMITIVES (Individual Tiles)     │
│   - hex_grassland_a                  │
│   - hex_forest_oak                   │
│   - hex_mountain_peak                │
│   - Each has: adjacency rules,       │
│     spawn rules, movement cost       │
└─────────────┬────────────────────────┘
              ↓
┌──────────────────────────────────────┐
│   BIOMES (Tile Collections)         │
│   - grassland_biome                  │
│     ├─> hex_grassland_a              │
│     ├─> hex_grassland_flowers        │
│     └─> hex_grassland_rocks          │
│   - Defines: compatible tiles,       │
│     transition rules, faction        │
│     affinity                          │
└─────────────┬────────────────────────┘
              ↓
┌──────────────────────────────────────┐
│   PACKAGES (Assembly Instructions)  │
│   - ironpeak_fortress_map            │
│     ├─> 60% mountain_biome           │
│     ├─> 30% grassland_biome          │
│     └─> 10% road_network             │
│   - Defines: biome placement,        │
│     special zones, prop density      │
└─────────────┬────────────────────────┘
              ↓
┌──────────────────────────────────────┐
│   SCENARIOS (Complete Maps)          │
│   - scenario_02_tactical_assault.json│
│     Uses: ironpeak_fortress_map      │
│     Adds: spawn points, objectives   │
└──────────────────────────────────────┘
```

---

## Primitive Hex Tiles

### Tile Primitive Definition

```typescript
// client/src/lib/ecs/primitives/tiles/hex-grassland-a.ts
export const HEX_GRASSLAND_A: TilePrimitive = {
  id: "hex_grassland_a",
  category: "base_terrain",
  biomeType: "grassland",

  // Visual
  assetId: "hex_grass_01", // → asset-registry
  variants: ["hex_grass_01", "hex_grass_02", "hex_grass_03"],

  // Movement
  movementCost: 1.0, // Baseline
  passable: true,

  // Combat
  defenseBonus: 0,
  coverLevel: "none",

  // Spawning
  canSpawn: {
    creatures: ["beast", "humanoid"],
    buildings: ["civilian", "military"],
    props: ["flora", "rocks"],
  },

  // Adjacency Rules (CRITICAL - this makes maps coherent)
  adjacencyRules: {
    favored: ["hex_grassland_b", "hex_grassland_flowers", "hex_road_dirt"],
    allowed: ["hex_forest_edge", "hex_mountain_base"],
    forbidden: ["hex_water_deep", "hex_void_corruption"],
  },

  // Faction Affinity
  factionAffinity: ["neutral", "dawnshield_order", "ironbound_covenant"],

  // Procedural Props (auto-scatter)
  propScatter: [
    { propId: "grass_clump_small", density: 0.4, randomRotation: true },
    { propId: "small_rock", density: 0.1, randomRotation: true },
  ],
};
```

### Why This Is Better

**OLD System** (simple painting):

- Just paint biome type
- No rules about what can neighbor
- Manual prop placement
- No faction integration

**NEW System** (ECS primitives):

- ✅ **Adjacency rules** - Maps look coherent, not random
- ✅ **Faction affinity** - Factions get appropriate terrain
- ✅ **Auto-scattering** - Props place themselves naturally
- ✅ **Spawn rules** - Creatures/buildings know what tiles they like
- ✅ **Extensible** - Add new tiles without breaking existing

---

## Biome Prefabs

### Biome Definition

**Biome** = Collection of compatible tiles + transition rules

```typescript
// client/src/lib/ecs/prefabs/biomes/grassland-biome.ts
export const GRASSLAND_BIOME: BiomePrefab = {
  id: "grassland_biome",
  name: "Grassland",

  // Tile Pool (what tiles can appear)
  tiles: [
    { id: "hex_grassland_a", weight: 40 }, // Most common
    { id: "hex_grassland_flowers", weight: 30 },
    { id: "hex_grassland_rocks", weight: 20 },
    { id: "hex_grassland_sparse", weight: 10 }, // Rare
  ],

  // Edges (transition to other biomes)
  transitions: {
    to_forest: ["hex_grassland_forest_edge"],
    to_mountain: ["hex_grassland_rocky"],
    to_road: ["hex_grassland_roadside"],
  },

  // Faction Compatibility
  factionAffinity: {
    dawnshield_order: 90, // Loves grassland
    ironbound_covenant: 70,
    verdant_spirits: 60,
    crimson_pact: 40, // Prefers darker terrain
    veilbound_synod: 20, // Prefers void/corrupted
  },

  // Props (biome-wide settings)
  defaultProps: [
    { propId: "oak_tree", density: 0.15, clumping: true },
    { propId: "wildflowers", density: 0.3 },
    { propId: "grass_clumps", density: 0.5 },
  ],

  // Weather/Atmosphere
  atmosphere: {
    fogDensity: 0.1,
    cloudCover: 0.3,
    windSpeed: 1.0,
    ambientLight: "twilight_neutral",
  },
};
```

### Biome Types

**Natural Biomes**:

- Grassland - Open fields
- Forest - Dense trees
- Mountain - Rocky terrain
- Desert - Sandy wastes
- Swamp - Muddy wetlands
- Tundra - Frozen ground

**Faction Biomes**:

- Crimson Courts - Gothic vampire cities
- Ironpeak - Dwarven underground
- Crystal Spires - Floating arcane platforms
- Volcanic Wastes - Fire cult territory
- Bone Cathedral - Medical complex
- Void Nexus - Corrupted reality

**Special Biomes**:

- Sacred Ground - Holy sites
- Corrupted - Void-touched zones
- Arcane - Magic-saturated areas
- Industrial - Factory floors

---

## Map Packages

### Package Definition

**Package** = Assembly instructions for combining biomes into complete maps

```typescript
// client/src/lib/ecs/packages/maps/ironpeak-fortress.ts
export const IRONPEAK_FORTRESS_MAP: MapPackage = {
  id: "ironpeak_fortress",
  name: "Ironpeak Fortress",
  dimensions: { width: 15, height: 12 }, // 180 hexes

  // Biome Distribution
  biomeLayout: [
    { biome: "mountain_biome", percentage: 60, placement: "perimeter" },
    { biome: "grassland_biome", percentage: 30, placement: "center" },
    { biome: "road_network", percentage: 10, placement: "connecting" },
  ],

  // Special Zones (hand-placed)
  specialZones: [
    {
      id: "fortress_courtyard",
      hexes: [
        { q: 7, r: 6 },
        { q: 8, r: 6 },
      ], // Center
      zoneType: "high_ground",
      effects: { defenseBonus: 10, rangeBonus: 2 },
    },
    {
      id: "mountain_pass",
      hexes: [
        /* chokepoint hexes */
      ],
      zoneType: "choke_point",
      effects: { movementCost: 2.0 },
    },
  ],

  // Buildings (faction-specific)
  buildings: [
    {
      buildingId: "ironbound_barracks",
      position: { q: 7, r: 5 },
      required: true,
    },
    {
      buildingId: "guard_tower_large",
      position: { q: 10, r: 8 },
      required: true,
    },
    { buildingId: "forge", position: { q: 5, r: 6 }, required: false },
  ],

  // Generation Rules
  generation: {
    algorithm: "radial_expansion", // From center outward
    seed: "ironpeak_01", // Deterministic
    chunkSize: 16, // 16x16 chunks
    edgeBlending: true, // Smooth biome transitions
    validatePathfinding: true, // Ensure no isolated areas
  },

  // Faction Context
  factionOwner: "ironbound_covenant",
  factionPresence: {
    ironbound_covenant: 0.8, // 80% of NPCs/buildings
    neutral: 0.2, // 20% merchants/civilians
  },
};
```

---

## Adjacency System

### Adjacency Matrix

**Defines which tiles can neighbor which** - prevents visual chaos

```typescript
// Simplified example
const ADJACENCY_MATRIX = {
  hex_grassland: {
    favored: ["hex_grassland", "hex_grassland_flowers"], // Same biome
    allowed: ["hex_forest_edge", "hex_road_dirt"], // Compatible biomes
    forbidden: ["hex_water_deep", "hex_lava"], // Impossible transitions
  },

  hex_forest: {
    favored: ["hex_forest", "hex_forest_dense"],
    allowed: ["hex_grassland_forest_edge", "hex_mountain_forested"],
    forbidden: ["hex_desert", "hex_ice"],
  },

  hex_mountain: {
    favored: ["hex_mountain", "hex_mountain_peak"],
    allowed: ["hex_grassland_rocky", "hex_forest_mountain"],
    forbidden: ["hex_water_deep", "hex_swamp"],
  },
};
```

### Adjacency Validation

**During generation, validate every tile**:

```typescript
function validateAdjacency(
  hex: HexCoord,
  tileId: string,
  grid: HexGrid
): boolean {
  const neighbors = getNeighbors(hex, grid);
  const rules = ADJACENCY_MATRIX[tileId];

  for (const neighbor of neighbors) {
    const neighborTileId = grid[neighbor.q][neighbor.r].tileId;

    // Check forbidden
    if (rules.forbidden.includes(neighborTileId)) {
      return false; // Invalid placement
    }
  }

  return true; // Valid
}
```

### Edge Tiles

**Transition tiles** smooth biome boundaries:

```
Grassland ─┬─ Grassland/Forest Edge ─┬─ Forest
           │                          │
           └─ hex_grassland_forest_edge
```

**Each biome pair needs edge tiles**:

- grassland → forest: `hex_grassland_forest_edge`
- grassland → mountain: `hex_grassland_rocky`
- forest → mountain: `hex_forest_mountain`
- etc.

**Formula**: N biomes = N\*(N-1)/2 edge pairs

**With 10 biomes**: 45 edge pairs needed

---

## Chunking System

### Chunk Structure

**Chunk** = 16x16 hex grid subdivision

```typescript
interface Chunk {
  id: string; // "chunk_0_0"
  position: { x: number; y: number }; // Chunk coordinates
  hexes: HexData[][]; // 16x16 array
  loaded: boolean;
  generatedAt: number; // Timestamp
  biomeDistribution: Record<string, number>; // % per biome
}
```

### Streaming & LOD

**For large maps (30x25 = 750 hexes)**:

```
┌────────────┬────────────┬────────────┐
│  Chunk 0,0 │  Chunk 1,0 │  Chunk 2,0 │
│  (loaded)  │  (loading) │  (unload)  │
├────────────┼────────────┼────────────┤
│  Chunk 0,1 │  Chunk 1,1 │  Chunk 2,1 │
│  (loaded)  │  (loaded)  │  (unload)  │
├────────────┼────────────┼────────────┤
│  Chunk 0,2 │  Chunk 1,2 │  Chunk 2,2 │
│  (unload)  │  (loading) │  (unload)  │
└────────────┴────────────┴────────────┘
         ↑
      Camera position
```

**Load Strategy**:

- Load 3x3 chunks around camera (9 chunks)
- Unload chunks >2 away
- Pre-generate all chunks (deterministic)
- Cache generated chunks in memory

**Benefits**:

- ✅ Consistent performance (only render visible)
- ✅ Large maps possible (750+ hexes)
- ✅ Fast scenario loading (start with 1-2 chunks)
- ✅ Memory efficient (stream in/out)

---

## Biome Generation Algorithm

### Radial Expansion (Primary)

**Start from center, expand outward** in rings:

```typescript
function generateMapRadial(package: MapPackage): HexGrid {
  const grid = initializeEmptyGrid(package.dimensions);
  const center = {
    q: Math.floor(package.dimensions.width / 2),
    r: Math.floor(package.dimensions.height / 2),
  };

  // Ring 0: Center (always special)
  placeBiome(grid, center, "grassland_biome");

  // Rings 1-N: Expand outward
  for (let ring = 1; ring <= maxRing; ring++) {
    const ringHexes = getHexRing(center, ring);

    for (const hex of ringHexes) {
      // Select biome based on:
      // 1. Package distribution percentages
      // 2. Neighbor tiles (adjacency rules)
      // 3. Distance from center
      // 4. Faction affinity

      const biome = selectBiomeForHex(hex, grid, package, ring);
      const tile = selectTileFromBiome(biome, hex, grid);

      if (validateAdjacency(hex, tile, grid)) {
        placeTile(grid, hex, tile);
      } else {
        // Try different tile or biome
        const fallback = findCompatibleTile(hex, grid);
        placeTile(grid, hex, fallback);
      }
    }
  }

  return grid;
}
```

### Zone-Based (Secondary)

**Divide map into zones, fill each**:

```typescript
function generateMapZoned(package: MapPackage): HexGrid {
  const grid = initializeEmptyGrid(package.dimensions);

  // Define zones
  const zones = [
    { name: 'northwest', biome: 'forest_biome', hexes: /* NW quadrant */ },
    { name: 'northeast', biome: 'mountain_biome', hexes: /* NE quadrant */ },
    { name: 'south', biome: 'grassland_biome', hexes: /* S half */ },
    { name: 'road', biome: 'road_network', hexes: /* connecting path */ }
  ];

  // Fill each zone
  for (const zone of zones) {
    fillZoneWithBiome(grid, zone.hexes, zone.biome);
  }

  // Blend edges
  blendZoneBoundaries(grid);

  return grid;
}
```

---

## Adjacency Rules in Detail

### Rule Types

**Favored** - Prefers these neighbors (80% chance):

```typescript
hex_grassland.adjacencyRules.favored = [
  "hex_grassland", // Same tile
  "hex_grassland_flowers", // Variant
  "hex_grassland_rocks", // Another variant
];
```

**Allowed** - Can neighbor these (15% chance):

```typescript
hex_grassland.adjacencyRules.allowed = [
  "hex_forest_edge", // Transition tile
  "hex_road_dirt", // Road overlay
  "hex_river_bank", // River edge
];
```

**Forbidden** - NEVER neighbors these (0% chance):

```typescript
hex_grassland.adjacencyRules.forbidden = [
  "hex_water_deep", // No grass in deep water
  "hex_lava", // No grass on lava
  "hex_void_corruption", // No grass in void
];
```

### Probabilistic Selection

**When generating tile, check neighbors**:

```typescript
function selectTileForHex(
  hex: HexCoord,
  grid: HexGrid,
  biome: BiomePrefab
): string {
  const neighbors = getNeighbors(hex, grid);
  const biasedPool = [];

  // For each tile in biome
  for (const tileDef of biome.tiles) {
    const tile = TILES[tileDef.id];

    // Check how many neighbors are favored
    const favoredCount = neighbors.filter((n) =>
      tile.adjacencyRules.favored.includes(grid[n.q][n.r].tileId)
    ).length;

    // Boost weight if neighbors are favored
    const weight = tileDef.weight * (1 + favoredCount * 0.3);

    // Check forbidden
    const hasForbidden = neighbors.some((n) =>
      tile.adjacencyRules.forbidden.includes(grid[n.q][n.r].tileId)
    );

    if (!hasForbidden) {
      biasedPool.push({ id: tileDef.id, weight });
    }
  }

  // Weighted random selection
  return weightedRandom(biasedPool);
}
```

**Result**: Tiles cluster naturally, transitions are smooth, no visual chaos

---

## Prop Scattering

### Auto-Scatter Algorithm

**Props place themselves** based on tile rules:

```typescript
function scatterProps(grid: HexGrid) {
  for (const hex of allHexes(grid)) {
    const tile = TILES[hex.tileId];

    // For each prop scatter rule
    for (const rule of tile.propScatter) {
      // Roll for placement
      if (Math.random() < rule.density) {
        const prop = {
          propId: rule.propId,
          position: hexToWorld(hex),
          rotation: rule.randomRotation ? Math.random() * 360 : 0,
          scale: rule.randomScale ? 0.8 + Math.random() * 0.4 : 1.0,
        };

        placeProp(hex, prop);
      }
    }
  }
}
```

**Benefits**:

- ✅ Natural-looking distribution
- ✅ No manual placement needed
- ✅ Respects biome aesthetics
- ✅ Varies between playthroughs (if non-deterministic seed)

### Manual Override

**Designer can still hand-place critical props**:

```typescript
// In scenario JSON
{
  "manualProps": [
    { "propId": "shrine_altar", "position": { "q": 8, "r": 6 }, "required": true }
  ]
}
```

**Manual props override auto-scatter** (won't double-place)

---

## Chunking Benefits

### Performance

**Without Chunking**:

- Render 750 hexes every frame
- 750 x 3 triangles/hex = 2,250 draw calls
- 30 FPS on mid-range hardware

**With Chunking**:

- Render only visible chunks (typically 3x3 = 9 chunks = 144 hexes)
- 144 x 3 = 432 draw calls
- 60 FPS on mid-range hardware

### Memory

**Without Chunking**:

- All 750 hex meshes in memory
- All prop models loaded
- ~500MB VRAM usage

**With Chunking**:

- Only 9 chunks in memory (144 hexes)
- Props stream in/out
- ~150MB VRAM usage

### Deterministic Generation

**With seed**:

```typescript
const seed = "ironpeak_fortress_01";
const rng = seededRandom(seed);

// Generate same map every time
const map = generateMapRadial(package, rng);
```

**Benefits**:

- ✅ Same map every playthrough (not random)
- ✅ Reproducible for testing
- ✅ Can store just seed + package (not full map data)
- ✅ Multiplayer sync (same seed = same map)

---

## Integration with Scenarios

### Scenario References Package

```json
{
  "id": "scenario_02_tactical_assault",
  "name": "Tactical Assault",
  "map": {
    "package": "ironpeak_fortress", // ← References map package
    "seed": "tactical_assault_01",
    "customization": {
      "addSpecialZone": [
        { "hexes": [{ "q": 5, "r": 3 }], "type": "sacred_ground" }
      ],
      "forceBuilding": [
        { "buildingId": "shrine_small", "position": { "q": 5, "r": 3 } }
      ]
    }
  },
  "spawns": {
    /* unit spawn points */
  },
  "objectives": {
    /* victory conditions */
  }
}
```

**Flow**:

1. Load scenario JSON
2. Scenario references map package
3. Generate map from package + seed
4. Apply scenario customizations
5. Place units at spawn points
6. Start battle

---

## Advantages Over Old System

### OLD: Simple Painting

```typescript
// Paint every hex manually
painter.paintBiome("grassland", [
  /* 200 hex coordinates */
]);
painter.paintBiome("forest", [
  /* 150 hex coordinates */
]);
// etc...
```

**Problems**:

- ❌ Tedious manual work
- ❌ No adjacency validation
- ❌ Hard to maintain
- ❌ Props placed by hand
- ❌ No reuse across scenarios

### NEW: ECS Package System

```typescript
// Define package once
const package = IRONPEAK_FORTRESS_MAP;

// Generate map
const map = generateFromPackage(package, seed);
```

**Benefits**:

- ✅ Reusable packages (light/dark variants use same package)
- ✅ Automatic adjacency validation
- ✅ Props scatter themselves
- ✅ Deterministic (same every time)
- ✅ Easy to modify (change package, regenerate)
- ✅ Faction-aware (uses faction affinity)

---

## File Structure

```
client/src/lib/ecs/
├── primitives/
│   └── tiles/
│       ├── hex-grassland-a.ts
│       ├── hex-forest-oak.ts
│       ├── hex-mountain-peak.ts
│       └── ... (~101 tiles)
│
├── prefabs/
│   └── biomes/
│       ├── grassland-biome.ts
│       ├── forest-biome.ts
│       ├── mountain-biome.ts
│       └── ... (~20 biomes)
│
└── packages/
    └── maps/
        ├── ironpeak-fortress.ts
        ├── crystal-spires.ts
        ├── verdant-sanctum.ts
        └── ... (~10-20 map packages)
```

---

## See Also

- `ECS_ARCHITECTURE.md` - How primitives/prefabs/packages fit together
- `scenarios.md` - How scenarios use map packages
- `assets.md` - How tiles reference GLB models
- `SYSTEMS_OVERVIEW.md` - Where chunked tiles fit in overall architecture

---

**Remember**: This is the MODERN system. Don't regress to old painting. Use ECS all the way down.

# Chunked Tile System — Godot 4 (Native, Deterministic)

**Version**: 1.0  
**Status**: AUTHORITATIVE (Godot-native)  
**Last Updated**: 2025-10-20

---

## Purpose

Deterministic, streamable hex maps in **Godot 4** using **TileMap**, **Resource data**, and **chunk streaming**, driven by the global seed/orchestrator. Replaces legacy TS/ECS notes with a concrete Godot implementation.

**Design pillars**

- **Deterministic**: same seed + same player state → identical map
- **Modular**: primitives → biomes → packages → scenarios
- **Performant**: chunked streaming (3×3 window), low draw calls
- **Authorable**: data-first via `.tres` Resources and TileSet metadata
- **Godot-native**: GDScript + Nodes + Resources + Signals (no C#, no external ECS)

---

## High-level Flow

```
SeedService (autoload) → VectorService (autoload)
           └─ forks RNG for 'map'
                ↓
MapOrchestrator.gd (scene controller)
  ├─ ChunkStreamer.gd (loads/unloads chunks)
  ├─ BiomeService.gd (tile selection, adjacency)
  └─ MapPackage (Resource) + BiomeDefs (Resources) + TileDefs (Resources)
```

---

## Data Model (Resources)

All authored data lives under `res://procgen/data/`.

### 1) TileDef.gd (Resource)

```gdscript
# res://procgen/data/tiles/TileDef.gd
extends Resource
class_name TileDef

@export var id: String
@export var biome_type: String
@export var tileset_source_id: int        # TileSet source (for TileMap)
@export var atlas_coords: Vector2i        # Atlas coords in TileSet
@export var movement_cost: float = 1.0
@export var passable: bool = true
@export var defense_bonus: int = 0
@export var cover_level: StringName = &"none"

# Adjacency rules (by tile id prefix/group)
@export var favored: PackedStringArray = []
@export var allowed: PackedStringArray = []
@export var forbidden: PackedStringArray = []

# Optional prop scatter rules
@export var props: Array[Dictionary] = [] # [{prop_id, density, random_rotation, random_scale}]
```

### 2) BiomeDef.gd (Resource)

```gdscript
# res://procgen/data/biomes/BiomeDef.gd
extends Resource
class_name BiomeDef

@export var id: String
@export var name: String
@export var tile_pool: Array[Dictionary] = []
# [{ tile: TileDef, weight: int }]

@export var transitions: Dictionary = {}
# { to_biome_id: [TileDef, ...] }

@export var faction_affinity: Dictionary = {}
# { "dawnshield_order": 90, ... }

@export var atmosphere: Dictionary = {
	"fog_density": 0.0, "cloud_cover": 0.0, "wind_speed": 0.0, "ambient_light": "twilight_neutral"
}
```

### 3) MapPackage.gd (Resource)

```gdscript
# res://procgen/data/packages/MapPackage.gd
extends Resource
class_name MapPackage

@export var id: String
@export var name: String
@export var width: int = 30       # axial width
@export var height: int = 25      # axial height
@export var chunk_size: int = 16  # hexes per chunk edge (q/r domain)

# Biome layout percentages + placement hint
@export var biome_layout: Array[Dictionary] = []
# [{ biome: BiomeDef, percentage: 60, placement: "perimeter"|"center"|"connecting" }]

# Optional special zones/buildings/custom placements
@export var special_zones: Array[Dictionary] = []
@export var buildings: Array[Dictionary] = []

@export var algorithm: StringName = &"radial_expansion" # or "zoned"
```

---

## Scene Tree

```
MapRoot (Node2D)
├─ MapOrchestrator.gd             # entrypoint (receives seed + package)
├─ ChunkStreamer (Node2D)
│  ├─ chunks/ (Node2D)            # runtime children: Chunk_#_# (scenes)
│  └─ signals: chunk_loaded/unloaded
└─ DebugOverlay (Control)         # optional
```

Each **Chunk** is a `Node2D` scene:

```
Chunk.tscn (Node2D)
├─ Ground (TileMap)               # ground layer
├─ Overlay (TileMap)              # roads/rivers, etc.
└─ Props (Node2D)                 # instanced props as Scenes
```

---

## Coordinate System

Use **pointy-top axial** coordinates `(q, r)` for generation and a conversion utility for world-space placement.

```gdscript
# res://procgen/hex/Hex.gd
class_name Hex

static func axial_to_world(q: int, r: int, tile_w: float, tile_h: float) -> Vector2:
	var x := tile_w * (sqrt(3.0) * q + sqrt(3.0) / 2.0 * r)
	var y := tile_h * (3.0 / 2.0) * r
	return Vector2(x, y)
```

---

## RNG & Determinism

- `SeedService.fork_rng("map")` returns a deterministic RNG for the map subsystem.
- Fork again per **biome**, **chunk**, and **feature**: e.g. `fork_rng("map/biome/grassland")`, `fork_rng("map/chunk/%d_%d")`.

```gdscript
# res://procgen/autoload/SeedService.gd (simplified)
extends Node
class_name SeedService

var _root_seed_hash: int
var _version := "3.0.0"

func configure_from_phrase(phrase: String) -> void:
	_root_seed_hash = _hash_32(phrase.to_lower() + ":" + _version)

func fork_rng(path: String) -> RandomNumberGenerator:
	var h := _hash_32(str(_root_seed_hash) + ":" + path)
	var rng := RandomNumberGenerator.new()
	rng.seed = h
	return rng

func _hash_32(s: String) -> int:
	var h := 2166136261
	for c in s.to_utf8_buffer():
		h = (h ^ int(c)) * 16777619
	return h & 0x7fffffff
```

---

## Generation Algorithms (Godot)

### Radial Expansion (primary)

```gdscript
# res://procgen/map/MapOrchestrator.gd (core idea)
func _generate_radial(pkg: MapPackage, seed_path: String) -> void:
	var rng := SeedService.fork_rng(seed_path)
	var center := Vector2i(pkg.width / 2, pkg.height / 2)

	for ring in range(0, max(center.x, center.y)):
		var ring_hexes := HexUtil.get_ring(center, ring)
		for h in ring_hexes:
			var biome := _select_biome_for_hex(h, pkg, rng)
			var tile := BiomeService.pick_tile_for_hex(h, biome, pkg, rng)
			_chunk_write_tile(h, tile)
```

### Zoned (secondary)

```gdscript
func _generate_zoned(pkg: MapPackage, seed_path: String) -> void:
	var rng := SeedService.fork_rng(seed_path + "/zoned")
	for zone in _build_zones(pkg, rng):
		_fill_zone(zone, zone.biome, pkg, rng)
	BiomeService.blend_boundaries(pkg, _chunk_write_tile)
```

---

## Adjacency Rules

Handled in **BiomeService.gd** using the TileDef `favored/allowed/forbidden`.

```gdscript
# res://procgen/map/BiomeService.gd
extends Node
class_name BiomeService

static func valid_neighbor(tile: TileDef, neighbor_id: String) -> bool:
	if neighbor_id in tile.forbidden:
		return false
	return true

static func weighted_pick(tile_defs: Array[Dictionary], bias: float) -> TileDef:
	var total := 0.0
	for d in tile_defs: total += d.weight
	var roll := randf() * total
	for d in tile_defs:
		roll -= d.weight
		if roll <= 0.0:
			return d.tile
	return tile_defs.back().tile

static func pick_tile_for_hex(h: Vector2i, biome: BiomeDef, pkg: MapPackage, rng: RandomNumberGenerator) -> TileDef:
	var neighbors := HexUtil.get_neighbors(h)
	var pool: Array[Dictionary] = []
	for d in biome.tile_pool:
		var t: TileDef = d.tile
		var has_forbidden := false
		for n in neighbors:
			var n_id := MapCache.get_tile_id(n) # current assigned id or ""
			if n_id != "" and not valid_neighbor(t, n_id):
				has_forbidden = true
				break
		if not has_forbidden:
			var favored_count := 0
			for n in neighbors:
				var n_id := MapCache.get_tile_id(n)
				if n_id != "" and n_id in t.favored:
					favored_count += 1
			var weight := d.weight * (1.0 + favored_count * 0.3)
			pool.append({ "tile": t, "weight": weight })
	rng.randomize() # with deterministic seed already set
	return weighted_pick(pool, 1.0)
```

---

## Chunking & Streaming

### Chunk math

- **Chunk ID**: `Vector2i(q / chunk_size, r / chunk_size)` (floor)
- **3×3 window** around camera chunk
- Load/unload via `ChunkStreamer.gd`

```gdscript
# res://procgen/map/ChunkStreamer.gd
extends Node2D
class_name ChunkStreamer

@export var chunk_scene: PackedScene
@export var chunk_size: int = 16
@export var active_radius: int = 1  # 3x3

var _loaded := {}

func update_stream(camera_world_pos: Vector2) -> void:
	var cam_cr := HexUtil.world_to_axial(camera_world_pos)
	var cam_chunk := Vector2i(floor(cam_cr.x / chunk_size), floor(cam_cr.y / chunk_size))
	var want := {}
	for dy in range(-active_radius, active_radius + 1):
		for dx in range(-active_radius, active_radius + 1):
			want[Vector2i(cam_chunk.x + dx, cam_chunk.y + dy)] = true

	# unload
	for id in _loaded.keys():
		if not want.has(id):
			_unload_chunk(id)

	# load
	for id in want.keys():
		if not _loaded.has(id):
			_load_chunk(id)

func _load_chunk(id: Vector2i) -> void:
	var inst: Node2D = chunk_scene.instantiate()
	inst.name = "Chunk_%d_%d" % [id.x, id.y]
	$chunks.add_child(inst)
	_loaded[id] = inst
	emit_signal("chunk_loaded", id, inst)

func _unload_chunk(id: Vector2i) -> void:
	var inst: Node2D = _loaded[id]
	inst.queue_free()
	_loaded.erase(id)
	emit_signal("chunk_unloaded", id)
```

---

## Writing Tiles into TileMap

Each **Chunk** holds a `TileMap` that maps local `(q, r)` within chunk to a **TileSet source+coords**.

```gdscript
# res://procgen/map/ChunkWriter.gd (attached to Chunk scene)
extends Node2D
class_name ChunkWriter

@export var ground: TileMap
@export var overlay: TileMap
@export var chunk_origin: Vector2i
@export var chunk_size: int = 16

func set_local_tile(local_qr: Vector2i, t: TileDef) -> void:
	ground.set_cell(
		0,                                   # layer
		Vector2i(local_qr.x, local_qr.y),
		t.tileset_source_id,
		t.atlas_coords
	)
```

The **MapOrchestrator** routes world `(q, r)` to `(chunk_id, local_qr)` and calls `set_local_tile`.

---

## Props (Auto-scatter)

Prop placements are deterministic per tile using a second RNG fork: `fork_rng("map/props/%d_%d")`.

```gdscript
func _scatter_props_on_tile(qr: Vector2i, t: TileDef) -> void:
	for rule in t.props:
		var rng := SeedService.fork_rng("map/props/%d_%d/%s" % [qr.x, qr.y, rule.prop_id])
		if rng.randf() < float(rule.density):
			var p := _instantiate_prop(rule.prop_id)
			p.position = Hex.axial_to_world(qr.x, qr.y, TILE_W, TILE_H)
			if rule.get("random_rotation", false):
				p.rotation_degrees = rng.randf() * 360.0
			if rule.get("random_scale", false):
				var s := 0.8 + rng.randf() * 0.4
				p.scale = Vector2(s, s)
			_props_parent.add_child(p)
```

---

## Performance Notes

- Bake hex atlases in a single **TileSet** to minimize material/state changes.
- Use **Chunk** scenes as **Visibility** boundaries (optionally add `VisibleOnScreenNotifier2D` on chunk root).
- Cap active chunks (3×3 window) and pool chunks if needed.
- Disable physics on non-interactive props; use `StaticBody2D` only when required.
- Consider **YSort** off for hex layers; draw order via layer index.

---

## Determinism Tests (Headless)

```gdscript
# res://tests/test_map_determinism.gd
extends RefCounted

func test_map_same_seed():
	var pkg: MapPackage = load("res://procgen/data/packages/ironpeak_fortress.tres")
	SeedService.configure_from_phrase("crimson-moon-rising")
	var a := MapHasher.hash_map(pkg) # generate → hash tiles
	var b := MapHasher.hash_map(pkg)
	assert(a == b)

func test_map_diff_seed():
	var pkg: MapPackage = load("res://procgen/data/packages/ironpeak_fortress.tres")
	SeedService.configure_from_phrase("crimson-moon-rising")
	var a := MapHasher.hash_map(pkg)
	SeedService.configure_from_phrase("emerald-sky-falls")
	var b := MapHasher.hash_map(pkg)
	assert(a != b)
```

---

## File Layout (Godot)

```
res://procgen/
├── autoload/
│   ├── SeedService.gd
│   └── VectorService.gd
├── data/
│   ├── tiles/          (TileDef.tres + TileDef.gd)
│   ├── biomes/         (BiomeDef.tres + BiomeDef.gd)
│   └── packages/       (MapPackage.tres + MapPackage.gd)
├── hex/
│   ├── Hex.gd
│   └── HexUtil.gd
├── map/
│   ├── MapOrchestrator.gd
│   ├── BiomeService.gd
│   ├── ChunkStreamer.gd
│   ├── ChunkWriter.gd
│   ├── MapCache.gd
│   └── scenes/
│       └── Chunk.tscn
└── tests/
    └── test_map_determinism.gd
```

---

## Integration

- **Inputs**: `SeedService.configure_from_phrase(phrase)`, `MapPackage` reference (from RWMD or scenario glue).
- **Outputs**: A populated scene tree with active chunks, TileMaps filled, props instanced.
- **Upstream**: `ScenarioOrchestrator` provides seed and package id.
- **Downstream**: Encounter placer, pathfinding, weather/VFX read biome and tile tags from `MapCache`.

---

## See Also

- `SEED_AND_VECTORS_GODOT.md` — seed phrase & RNG forking
- `ENCOUNTER_PLACEMENT_GODOT.md` — pressure map & spawn rules
- `FACTION_REPUTATION_GODOT.md` — gating logic
- `ORCHESTRATOR_GODOT.md` — pipeline & scene wiring
- `ASSETS_AND_TILESET_GODOT.md` — TileSet authoring, IDs, atlases

**Do not regress to “paint a map” tools.** Author tiles/biomes/packages once, generate forever—deterministically.
