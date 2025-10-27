# World Architecture - Layer System & Composition Model

**Version**: 2.0  
**Last Updated**: 2025-10-16  
**Status**: Complete

---

## Purpose

This document defines the **architectural foundation** of the Realm Walker world system: the 4-layer composition model, anchor-based references, and the relationship between RWMD content and TypeScript execution.

---

## Core Principle: RWMD is the Game

```
RWMD Files (Declarative Game Definition)
    ↓ (Runtime import or Node.js loader)
React Renderers (Display RWMD content)
    +
Execution Harnesses (Execute RWMD rules)
    +
Player Database (@capacitor-community/sqlite)
```

**RWMD defines WHAT happens.**  
**TypeScript defines HOW it happens.**

### What RWMD Defines
- ✅ Scenarios (battles, objectives, spawns)
- ✅ Characters (stats, abilities, dialogue)
- ✅ Abilities (damage, effects, cooldowns)
- ✅ Quests (objectives, rewards)
- ✅ AI Behaviors (formation, targeting, decisions)
- ✅ Maps (tiles, biomes, layouts)
- ✅ Dialogue (choices, consequences, reputation)
- ✅ Assets (Meshy prompts, anchors)

### What TypeScript Executes
- ✅ Combat harness (runs RWMD combat rules)
- ✅ Dialogue harness (walks RWMD dialogue trees)
- ✅ AI harness (executes RWMD behaviors with Yuka)
- ✅ Renderer (displays RWMD blocks in React)
- ✅ Anchor resolver (resolves @asset/@character references)
- ✅ Player database (saves progress)

**TypeScript is the ENGINE. RWMD is the CONTENT.**

---

## The 4-Layer Composition Model

### Overview

```
Layer 4: Scenarios (complete game experiences)
    ↓ composes
Layer 3: Packages (themed collections: faction content, realm content)
    ↓ composes
Layer 2: Prefabs (reusable patterns: encounter setups, building patterns)
    ↓ composes
Layer 1: Primitives (atomic elements: tiles, abilities, characters)
```

### Layer 1: Primitives

**Definition**: Atomic, self-contained game elements that don't reference other content.

**Block Types**:
- `::tile` - Individual hex tile (texture, movement cost, cover)
- `::ability` - Ability definition (damage, scaling, effects)
- `::effect` - Status effect (duration, modifiers)
- `::item` - Equipment/consumable definition
- `::asset` - 3D asset reference (Meshy prompt, GLB path)

**Example**:
```yaml
# primitives/tiles/terrain/grassland.rwmd
::tile @tile:grassland_hex
name: "Grassland Hex"
movement_cost: 1
cover: 0
elevation: 0
texture: grass_01
biome_compatible: [meadow, plains, farmland]
::end
```

**Characteristics**:
- No anchor references (self-contained)
- Can be used by any higher layer
- Catalog in `resources/primitives/`

### Layer 2: Prefabs

**Definition**: Reusable patterns that compose multiple primitives into functional units.

**Block Types**:
- `::biome` - Biome composition (tile mix, props)
- `::prefab_structure` - Building pattern (tiles arranged)
- `::prefab_encounter` - Combat setup pattern
- `::behavior` - AI behavior tree/goal
- `::formation` - Squad formation pattern
- `::loot_table` - Loot drop definition

**Example**:
```yaml
# prefabs/biomes/meadow.rwmd
::biome @biome:meadow
name: "Meadow Biome"

# Composes primitives
tiles:
  - @tile:grassland_hex (80%)
  - @tile:grassland_flowers (15%)
  - @tile:grassland_stones (5%)

props:
  - @asset:wildflower_cluster (density: 0.3)
  - @asset:meadow_rock (density: 0.1)
  
movement_modifier: 1.0
visibility_modifier: 1.2
::end
```

**Characteristics**:
- References primitives via anchors
- Reusable across multiple packages
- Catalog in `resources/prefabs/`

### Layer 3: Packages

**Definition**: Themed collections of content that define complete game systems (factions, realms).

**Block Types**:
- `::character` - Complete character (stats, abilities, AI, dialogue)
- `::faction` - Faction definition (doctrine, relationships, content)
- `::realm` - Realm definition (biomes, structures, encounters)
- `::quest` - Quest definition (objectives, rewards, triggers)

**Example**:
```yaml
# packages/factions/dawnshield/01_leaders.rwmd
::character @character:aurelius
name: "Lord Commander Aurelius"
faction: @faction:dawnshield

# Visual assets
model: @asset:aurelius_model
portrait: @asset:aurelius_portrait

# Stats (primitives)
stats:
  hp: 200
  atk: 22
  def: 25
  spd: 8
  rng: 1

# Abilities (references primitives)
abilities:
  - @ability:shield_bash
  - @ability:divine_ward
  - @ability:rally_troops
  - @ability:sundering_strike

# AI behavior (references prefab)
ai_behavior: @behavior:dawnshield_commander

# Dialogue (narrative)
dialogue: @scene:aurelius_intro

role: leader
::end
```

**Characteristics**:
- References prefabs and primitives
- Defines faction/realm identity
- Catalog in `resources/packages/`

### Layer 4: Scenarios

**Definition**: Complete game experiences that compose everything into playable content.

**Block Types**:
- `::scenario` - Complete scenario (map, objectives, encounters, narrative)
- `::campaign` - Multiple scenarios linked

**Example**:
```yaml
# scenarios/00_tutorial.rwmd
::scenario @scenario:tutorial
name: "The Sacred Shrine"
chapter: 0

# Lifecycle hooks (TypeScript executes these)
hooks:
  onStart: @script:tutorial_fade_in
  onCombatStart: @script:tutorial_roll_initiative
  onVictory: @script:tutorial_complete

# Map (references package)
map: @map:sacred_vale_tutorial

# Characters (references package)
characters:
  - id: elder_ottermere
    anchor: @character:elder_ottermere
    position: {q: 0, r: 0}
    
  - id: training_dummy
    anchor: @character:training_dummy
    position: {q: 5, r: 3}

# Encounters (references prefabs)
encounters:
  - @encounter:tutorial_basics
  - @encounter:tutorial_abilities

# Objectives
objectives:
  primary:
    - type: defeat_all_enemies
      
  secondary:
    - type: no_damage_taken
      reward:
        gold: 50
        item: @item:minor_healing_potion

# Initial dialogue
dialogue: @scene:tutorial_intro
::end
```

**Characteristics**:
- Composes all lower layers
- Defines complete gameplay experience
- Catalog in `resources/scenarios/`

---

## Anchor-Based Composition

### Anchor Format

```
@type:identifier
```

**Examples**:
- `@tile:grassland_hex`
- `@ability:shield_bash`
- `@character:aurelius`
- `@asset:aurelius_model`
- `@map:sacred_vale`

### Anchor Resolution

**Runtime resolution** via React Query:

```typescript
// useAnchorResolution.ts
function useAnchorResolution(anchor: string) {
  return useQuery(['anchor', anchor], async () => {
    // Lazy-load RWMD file
    const rwmdFile = await loadRWMDForAnchor(anchor);
    const parsed = parseRWMD(rwmdFile);
    const block = parsed.blocks.find(b => b.anchor === anchor);
    
    return block.content;
  });
}

// Usage in component
const { data: character } = useAnchorResolution('@character:aurelius');
```

**Benefits**:
- **Lazy loading** - Only load what's needed
- **Caching** - React Query handles caching
- **Composition** - Build complex content from simple pieces
- **Moddability** - Users can override any anchor

### Anchor Registry

**Dev-time index** for validation and tooling:

```typescript
// anchor-registry.ts
interface AnchorRegistry {
  version: string;
  last_updated: string;
  anchors: Record<string, AnchorEntry>;
}

interface AnchorEntry {
  file: string;       // RWMD file path
  kind: string;       // Block type
  title: string;      // Human-readable name
}
```

**Tools use this to**:
- Validate all anchor references resolve
- Find unused anchors
- Generate documentation
- Support IDE autocomplete

---

## Hook-Based Lifecycle

### TypeScript Provides Hooks, RWMD Uses Them

**In RWMD**:
```yaml
::scenario @scenario:tutorial
hooks:
  onStart: @script:intro_cutscene
  onCombatStart: @script:roll_initiative
  onTurnStart: @behavior:ai_decision
  onDialogueChoice: @script:update_reputation
  onComplete: @script:open_portal
::end
```

**In TypeScript**:
```typescript
class ScenarioExecutor {
  execute(rwmdScenario) {
    if (rwmdScenario.hooks.onStart) {
      executeHook(rwmdScenario.hooks.onStart);
    }
    
    // ... lifecycle continues
  }
}
```

**RWMD declares when to call. TypeScript calls it.**

### Standard Hooks

**Scenario Hooks**:
- `onStart` - Scenario begins
- `onCombatStart` - First combat encounter
- `onTurnStart` - Each turn starts
- `onDialogueChoice` - Player makes choice
- `onVictory` - Scenario complete
- `onDefeat` - Scenario failed
- `onComplete` - Cleanup

**Character Hooks**:
- `onSpawn` - Character enters scene
- `onDeath` - Character dies
- `onLevelUp` - Character levels up
- `onAbilityUnlock` - New ability available

**Quest Hooks**:
- `onAccept` - Quest accepted
- `onObjectiveComplete` - Objective done
- `onTurnIn` - Quest turned in
- `onFail` - Quest failed

---

## Execution Harnesses

### Pattern: XExecutor Class

**TypeScript classes that execute RWMD rules.**

```typescript
// Pattern
class CombatExecutor {
  execute(rwmdCombat: RWMDCombatBlock): CombatResult {
    // Read RWMD rules
    const {entities, objectives} = rwmdCombat;
    
    // Execute using game systems
    return runCombat(entities, objectives);
  }
}
```

### Core Harnesses

**CombatExecutor**:
```typescript
class CombatExecutor {
  execute(rwmdCombat: RWMDCombatBlock): CombatResult {
    // Read ability from RWMD
    const ability = resolveAnchor(rwmdCombat.ability);
    
    // Execute combat using RWMD stats
    const damage = calculateDamage(
      caster.atk,    // From RWMD
      target.def,    // From RWMD
      ability.scaling // From RWMD
    );
    
    return { damage, effects: applyEffects(ability.effects) };
  }
}
```

**DialogueExecutor**:
```typescript
class DialogueExecutor {
  async execute(rwmdDialogue: RWMDDialogueBlock): Promise<void> {
    for (const line of rwmdDialogue.dialogue) {
      await showDialogue(line.speaker, line.text, line.emotion);
      
      if (line.choices) {
        const choice = await waitForPlayerChoice(line.choices);
        await applyChoiceConsequences(choice);
      }
    }
  }
}
```

**FormationExecutor**:
```typescript
class FormationExecutor {
  execute(rwmdFormation: RWMDFormationBlock): Formation {
    // Read formation from RWMD
    const {type, spacing, roles} = rwmdFormation;
    
    // Calculate positions using formation-system
    return createFormation(leaderId, type, spacing, roles);
  }
}
```

---

## Database Split (Dev vs Player)

### Dev Database (better-sqlite3 + Drizzle)

**Purpose**: Index RWMD, track assets, build-time analysis

**Tables**:
```sql
-- RWMD indexing
rwmd_files
rwmd_anchors
rwmd_refs

-- Asset tracking
asset_prompts
asset_files

-- Build artifacts
compilation_cache
```

**Usage**: Dev-time only, ships read-only with game

### Player Database (@capacitor-community/sqlite)

**Purpose**: Save game state

**Tables**:
```sql
-- Save system
settings
saves
replays

-- World state
regions
chunks
entities

-- AI state
ai_blackboard_actor
ai_blackboard_faction
squads
squad_members

-- Player progress
quest_progress
reputation
inventory
```

**Usage**: Runtime only, starts empty

**Two databases, different purposes, different tech.**

---

## Resource Directory Structure

### Actual Layout

```
client/src/lib/world/resources/
├── primitives/                 # Layer 1
│   ├── tiles/
│   │   ├── terrain/           # Grassland, forest, mountain
│   │   ├── water/             # Rivers, lakes, ocean
│   │   ├── special/           # Volcanic, corrupted, sacred
│   │   └── biomes/            # (deprecated in favor of prefabs/)
│   │
│   ├── abilities/             # All 48+ abilities
│   │   ├── warrior/
│   │   ├── mage/
│   │   ├── rogue/
│   │   └── support/
│   │
│   ├── effects/               # Status effects
│   │   ├── buffs/
│   │   └── debuffs/
│   │
│   └── items/                 # Equipment, consumables
│       ├── weapons/
│       ├── armor/
│       └── consumables/
│
├── prefabs/                    # Layer 2
│   ├── biomes/                # Biome compositions
│   ├── encounters/            # Combat setups
│   │   └── {faction}/
│   │
│   ├── structures/            # Building patterns
│   │   ├── fortifications/
│   │   ├── religious/
│   │   └── residential/
│   │
│   ├── formations/            # Squad formations
│   │
│   └── behaviors/             # AI behaviors
│       ├── defensive/
│       ├── aggressive/
│       └── tactical/
│
├── packages/                   # Layer 3
│   ├── factions/              # 13 factions
│   │   ├── {faction}/
│   │   │   ├── 00_faction.rwmd        # Faction definition
│   │   │   ├── 01_leaders.rwmd        # Leader characters
│   │   │   ├── 02_heroes.rwmd         # Hero units
│   │   │   ├── 03_structures.rwmd     # Buildings
│   │   │   ├── 04_narrative.rwmd      # Dialogue, story beats
│   │   │   └── 05_reputation.rwmd     # Reputation progression
│   │   │
│   │   └── shared/            # Cross-faction content
│   │
│   ├── realms/                # World regions
│   │   ├── sacred_vale/
│   │   ├── crimson_courts/
│   │   ├── volcanic_wastes/
│   │   └── [8 more realms]
│   │
│   └── quests/                # Quest definitions
│       ├── main_story/
│       ├── shard_collection/
│       └── faction_specific/
│
└── scenarios/                  # Layer 4
    ├── 00_tutorial.rwmd
    ├── 01_first_shard.rwmd
    ├── 02_faction_choice.rwmd
    └── [7 more scenarios]
```

---

## Design Patterns

### Pattern 1: Primitive Reuse

**Primitives used across multiple contexts:**

```yaml
# Primitive defined once
::ability @ability:shield_bash
# ... definition
::end

# Used by multiple characters
::character @character:aurelius
abilities:
  - @ability:shield_bash
::end

::character @character:dawnshield_captain
abilities:
  - @ability:shield_bash
::end
```

### Pattern 2: Prefab Variants

**Base prefab with variants:**

```yaml
# Base encounter
::prefab_encounter @encounter:patrol_base
size: small
::end

# Faction-specific variants
::prefab_encounter @encounter:dawnshield_patrol
extends: @encounter:patrol_base
faction: @faction:dawnshield
units:
  - @character:dawnshield_soldier (count: 3)
  - @character:dawnshield_captain (count: 1)
::end
```

### Pattern 3: Package Overrides

**Scenario overrides package defaults:**

```yaml
::scenario @scenario:tutorial
characters:
  - id: aurelius_weakened
    anchor: @character:aurelius
    # Override stats for tutorial
    stats_override:
      hp: 100  # Normal: 200
      atk: 15  # Normal: 22
::end
```

---

## Integration with TypeScript Systems

### System Independence

**Game systems don't know about RWMD:**

```typescript
// combat-system.ts - Pure functions
export function calculateDamage(atk, def, scaling) {
  return (atk * scaling) * (100 / (100 + def));
}

// Works with ANY data source
const damage = calculateDamage(
  rwmdAbility.caster.atk,   // From RWMD
  rwmdAbility.target.def,   // From RWMD
  rwmdAbility.scaling       // From RWMD
);
```

### Integration Points

**Where RWMD connects to systems:**

1. **Combat System** ← reads `::ability`, `::character` stats
2. **AI System** ← reads `::behavior`, `::formation`
3. **Reputation System** ← reads `::dialogue` choice consequences
4. **Quest System** ← reads `::quest`, `::objective`
5. **Map System** ← reads `::map`, `::biome`, `::tile`

---

## File Organization

### RWMD Files

**Package structure:**
```
client/src/lib/world/
├── resources/              # RWMD content (ships with game)
├── schema/                 # Drizzle schemas (dev DB)
├── rwmd-format/            # Parser, validator, anchor registry
├── integration/            # RWMD → system bridges
└── tools/                  # Dev-time tools
```

### TypeScript Files

**Package structure:**
```
client/src/
├── lib/
│   ├── world/              # RWMD package
│   ├── player/             # Player database
│   ├── systems/            # Execution harnesses
│   └── spatial/            # Hex math, pathfinding
│
├── stores/                 # Zustand state (React)
├── components/             # React UI (renders RWMD)
└── dev-tools/              # Dev-time only
```

---

## Acceptance Criteria

### Layer System Works When
- ✅ Primitives have no dependencies
- ✅ Prefabs only reference primitives
- ✅ Packages reference primitives and prefabs
- ✅ Scenarios compose everything
- ✅ No circular dependencies
- ✅ Clear separation of concerns

### Anchor System Works When
- ✅ All anchors resolve at runtime
- ✅ Lazy loading works
- ✅ Caching prevents redundant loads
- ✅ Validation catches broken references
- ✅ Modding can override any anchor

### Execution Works When
- ✅ TypeScript executes RWMD rules correctly
- ✅ Harnesses are pure (no side effects in RWMD reading)
- ✅ Systems are independent (don't know about RWMD)
- ✅ Integration points are clear
- ✅ Same RWMD + same seed = same outcome

---

## Cross-References

**Related Documents**:
- `02_rwmd_format.md` - Complete RWMD 2.0 block type specification
- `infrastructure/simulation.md` - How execution harnesses run
- `content/scenarios.md` - Scenario composition patterns
- `assets/anchor_resolution.md` - Anchor resolution details

**Memory Bank**:
- `memory-bank/projectbrief.md` - RWMD is the game
- `memory-bank/systemPatterns.md` - Anchor composition patterns

---

**This architecture is FROZEN. Changes require version bump and review.**
