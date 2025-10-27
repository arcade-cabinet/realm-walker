# Asset System

**Version**: 2.0  
**Status**: Active  
**Last Updated**: 2025-10-22

## Overview

The asset system manages all 3D models, textures, and visual content for Realm-Walker. It follows Godot-native patterns researched from real open-source Godot projects.

## Core Principles (from Research)

Based on analysis of Godot Open RPG, 3D Platformer, Survivors Starter Kit, and Tactical RPG:

1. **Simple Loading**: Use `load()` and `preload()` directly, no complex path resolution
2. **Resources for Data**: .tres files contain stats/config, not logic
3. **Scenes for Logic**: Game behavior lives in .tscn files and scripts
4. **No Registry Pattern**: Directory structure IS the organization
5. **Editor Tools**: Asset generation uses @tool EditorPlugin, not runtime systems

## Asset Types

### Character Assets

- **Purpose**: Faction leaders, named NPCs
- **Location**: `assets/characters/{character_id}/`
- **Resource**: `CharacterDef.tres` (extends AssetManifest)
- **Models**: `models/{animation}.glb`

### Guardian Assets

- **Purpose**: 8 sacred guardians with progression
- **Location**: `assets/guardians/{guardian_id}/`
- **Resource**: `GuardianDef.tres` (extends AssetManifest)
- **Models**: `models/{animation}.glb`

### Neutral Assets

- **Purpose**: Compact animals (otters, ravens, badgers, foxes)
- **Location**: `assets/neutrals/{species}/`
- **Resource**: `{variant}.tres` (extends AssetManifest via NeutralDef)
- **Models**: Referenced by path in resource

## Resource Structure

### AssetManifest (Base Class)

**Location**: `addons/realmwalker/asset_management/AssetManifest.gd`

```gdscript
class_name AssetManifest
extends Resource

#region Meshy Generation Parameters
@export var meshy_prompt: String = ""
@export var meshy_model_id: String = ""
@export var meshy_rigged_id: String = ""
@export var retexture_variants: Array[Dictionary] = []
@export var generation_status: String = "pending"
#endregion

#region Worldbuilding & Lore
@export_multiline var lore_description: String = ""
@export var narrative_role: String = ""
@export var narrative_connections: Array[String] = []
@export var mythology_reveals: Array[String] = []
#endregion
```

**Purpose**: All game resources extend this to support:

- Meshy AI asset generation (text-to-3D, rigging, animation, retexture)
- Worldbuilding and narrative integration
- Consistent metadata across all asset types

### CharacterDef (extends AssetManifest)

**Location**: `resources/CharacterDef.gd`

Adds character-specific data:

- Stats (power, influence, etc.)
- Faction alignment
- Relationships
- Dialogue references

### GuardianDef (extends AssetManifest)

**Location**: `resources/GuardianDef.gd`

Adds guardian-specific data:

- Sacred truth
- Compact flaw
- Progression states
- Mythology connections

### NeutralDef (extends AssetManifest)

**Location**: `resources/NeutralDef.gd`

Adds neutral species data:

- Personality traits
- Age variant info
- Species behavior
- Factional relationships

## Asset Generation Pipeline

### 1. Meshy API Integration

**Location**: `addons/realmwalker/asset_management/MeshyClient.gd`

Four API endpoints:

- **text-to-3d/v2**: Generate base model from prompt
- **rigging/v1**: Rig T-pose model for animation
- **animation/v1**: Apply animations from 696-animation library
- **retexture/v2**: Create variants (age, seasonal, etc.)

### 2. Animation Library

**Location**: `addons/realmwalker/asset_management/MeshyAnimations.gd`

696 pre-defined animations organized by category:

- Neutral species (idle, walk, run, emotes)
- Combat (attack, defend, hit, death)
- Social (talk, gesture, celebrate)
- Work (craft, gather, build)

Uses **integer IDs** (not UUIDs):

```gdscript
const ANIMATION_SETS := {
    "neutral_otter": {
        "idle": 0,
        "walk": 1,
        "run": 14,
    }
}
```

### 3. Batch Generation

**Location**: `addons/realmwalker/asset_management/BatchGenerator.gd`

Workflow:

1. Read .tres files from target directory
2. For each with meshy_prompt:
   - Generate base model (text-to-3D)
   - Wait for completion
   - Rig model
   - Apply animations
   - Generate retexture variants
3. Download GLB files to appropriate paths
4. Update generation_status in .tres

**Cost Optimization**: Retexture variants are 65.6% cheaper than generating new models:

- Base model: $0.20
- Retexture variant: $0.07
- Strategy: 1 base + 7 retextured variants = $0.69 vs $1.60

## Asset Loading Pattern

### How Other Godot Games Do It

**Simple and Direct**:

```gdscript
# Godot Open RPG pattern
const PARTY_MEMBERS := {
    "rowan": preload("res://data/characters/rowan.tres"),
    "godette": preload("res://data/characters/godette.tres")
}

# 3D Platformer pattern
@export var character_mesh: PackedScene
@export var walk_speed: float = 5.0

# Tactical RPG pattern
var stats: Stats = load("res://data/models/world/stats/hero/archer.tres")
```

**NOT** complex registry systems, path resolution, or anchor mapping.

### Realm-Walker Current Pattern

**Uses registries** (CharacterRegistry, GuardianRegistry, NeutralRegistry):

```gdscript
func load_all_neutrals() -> void:
    var otter_variants := ["elder_ottermere", "little_ottermere_industrial"]
    for variant in otter_variants:
        var path := "res://assets/neutrals/otter_traders/%s.tres" % variant
        var neutral := load(path) as NeutralDef
        _neutrals[variant] = neutral
```

**Analysis**: This works, but registries are redundant. Each does the same thing - load .tres files from known paths. Could be simplified to direct loading in scenes that need the assets.

### Recommendation

**Migrate to simple pattern**:

```gdscript
# In scenes that need assets, just load directly
var elder_otter := load("res://assets/neutrals/otter_traders/elder_ottermere.tres") as NeutralDef

# Or export for designer control
@export var neutral_character: NeutralDef
```

No registry needed - directory structure provides organization.

## Current Asset Inventory

### Generated (77 total)

- 12 faction leaders (complete with models)
- 8 guardians (need Meshy params added to .tres)
- 32 neutral variants (need Meshy params added to .tres)
- 25 recovered from git history

### Needed

- 8 raven corsairs (prompts ready, need generation)
- Retexture variants for age-spanning (8 ages × species)
- Guardian progression state models

## Known Issues

### 1. Registry Redundancy

**Problem**: 3 separate registries doing identical work  
**Solution**: Migrate to direct loading pattern from research

### 2. Asset Inheritance Incomplete

**Problem**: Some .tres files missing Meshy generation parameters  
**Impact**: Can't regenerate or create variants  
**Solution**: Add meshy_prompt and retexture_variants to all assets

### 3. Path Complexity

**Problem**: AssetPathResolver computing paths that could be simple strings  
**Solution**: Delete resolver, use direct paths in resources

### 4. Obsolete RegistryLoader

**Status**: DELETED (was using JSON when .tres files exist)  
**Impact**: None - registries already load .tres directly

## Migration Tasks

### High Priority

1. Add Meshy parameters to guardian .tres files
2. Add Meshy parameters to neutral .tres files
3. Generate raven corsair models
4. Test asset loading without registries

### Medium Priority

1. Simplify asset loading (remove registries)
2. Delete AssetPathResolver (use direct paths)
3. Create editor plugin for Meshy generation
4. Document simple loading patterns for team

### Low Priority

1. Reorganize directory structure (if needed)
2. Add missing animation variants
3. Create texture atlas for UI performance

## Documentation Index

Related documentation:

- **Generation**: See MeshyClient.gd for API integration
- **Animation Library**: See MeshyAnimations.gd for 696 animations
- **Resource Classes**: See resources/\*.gd for inheritance hierarchy
- **Batch Processing**: See BatchGenerator.gd for automated generation

## Research References

Patterns analyzed from:

- **Godot Open RPG** (github.com/gdquest-demos/godot-open-rpg)
- **3D Platformer** (Starter-Kit-3D-Platformer)
- **Survivors Starter Kit** (C# patterns)
- **Tactical RPG** (godot-tactical-rpg)

Key finding: **Simple is better.** No project uses complex asset management systems - they use Godot's built-in loading, directory organization, and export variables.
