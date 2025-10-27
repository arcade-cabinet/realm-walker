# Temporal System Specification - Events, Spans, Ages

**Version**: 1.0  
**Date**: 2025-10-17  
**Status**: DESIGN SPECIFICATION  
**Priority**: CRITICAL

---

## Purpose

Define the temporal structure system for Realm Walker that enables:
- Age-based procedural generation
- Historical context for scenarios
- Event-driven narrative
- Chronological world state

---

## The Three Temporal Layers

### Singular: `::event` (Moment in Time)

**Definition**: A specific moment in world history that changed something.

```yaml
::event @global:event:the_sundering
name: "The Sundering"
year: -80
type: cataclysm

description: |
  The sun shatters into 8 shards of divine power.
  Eternal twilight descends upon the world.

effects:
  world_state:
    sun: shattered
    light_level: eternal_twilight
    temperature: stable
    
  created_artifacts:
    - @shard:tide_shard
    - @shard:forge_shard
    - @shard:dawn_shard
    - @shard:grove_shard
    - @shard:ember_shard
    - @shard:storm_shard
    - @shard:frost_shard
    - @shard:lightning_shard
    
  affected_factions: all
  
  narrative_anchor: @scene:sundering_witnessed
::end
```

**More Examples:**

```yaml
::event @global:event:first_compact
year: -60
type: political
description: "First peace treaty between factions"
effects:
  faction_relations:
    - dawnshield + ironbound: alliance_formed
    - crimson + veilbound: non_aggression_pact
::end

::event @global:event:guardian_river_awakening
year: -79
type: divine
description: "River Sage begins testing Realm Walkers"
effects:
  guardian_status:
    river_sage: active_testing
::end

::event @global:event:shard_wars_begin
year: -75
type: conflict
description: "Major factions begin fighting over shards"
effects:
  world_tension: high
  shard_claims:
    - tide_shard: contested (dawnshield, veilbound)
    - forge_shard: contested (ironbound, crimson)
::end
```

---

### Plural: `::event_span` (Time Period)

**Definition**: A period of time defined by start/end events with shared characteristics.

```yaml
::event_span @global:span:age_of_chaos
name: "The Age of Chaos"
start: @global:event:the_sundering
end: @global:event:first_compact
duration: 20 years
years: [-80, -60]

characteristics:
  - lawlessness
  - shard_wars
  - faction_formation
  - resource_scarcity
  - guardian_testing

world_state:
  stability: very_low
  faction_count: 6-8 (forming)
  shard_ownership: none
  
key_events:
  - @global:event:the_sundering
  - @global:event:shard_wars_begin
  - @global:event:guardian_river_awakening
  - @global:event:first_bloodpact
  - @global:event:first_compact

narrative_themes:
  - survival
  - desperate_alliances
  - power_grabs
  - chaos_vs_order
::end
```

**More Examples:**

```yaml
::event_span @global:span:age_of_compacts
name: "The Age of Compacts"
start: @global:event:first_compact
end: @global:event:commerce_treaty
duration: 40 years
years: [-60, -20]

characteristics:
  - treaty_formation
  - faction_consolidation
  - trade_emergence
  - border_establishment

world_state:
  stability: medium
  faction_count: 12 (established)
  shard_ownership: partial (3 claimed)
::end

::event_span @global:span:current_era
name: "The Current Era"
start: @global:event:commerce_treaty
end: null (ongoing)
years: [-20, 0+]

world_state:
  stability: medium_high
  faction_count: 12 (stable)
  shard_ownership: 3-5 claimed
  
narrative_context: |
  Present day. 60 years after the Sundering.
  Factions are established. Some shards are claimed.
  Tensions simmer. Realm Walkers are legendary.
::end
```

---

### Group: `::age` (Era with Multiple Spans)

**Definition**: Major era containing multiple time spans with cohesive identity.

```yaml
::age @global:age:post_sundering_era
name: "The Shattered Age"
description: "The 80 years following the Sundering of the Sun"

spans:
  - @global:span:age_of_chaos (years -80 to -60)
  - @global:span:age_of_compacts (years -60 to -20)
  - @global:span:current_era (years -20 to 0+)

total_duration: 80 years
year_range: [-80, 0]

world_state:
  sun: shattered_permanently
  light: eternal_twilight
  seasons: muted
  temperature: stable_cool

factions_count:
  start: 0 (none formed)
  peak: 15 (many attempts)
  current: 12 (stable)

factions_active:
  - @faction:dawnshield
  - @faction:ironbound
  - @faction:radiant
  - @faction:verdant
  - @faction:sanctum
  - @faction:crimson
  - @faction:veilbound
  - @faction:ossuary
  - @faction:eclipsed
  - @faction:ashen
  - @faction:corsairs (hidden)
  - @faction:beasts (scattered)

guardians_status:
  - river_sage: active (testing walkers)
  - stone_warden: active (watching shards)
  - luminous_one: active (seeking hope)
  - forest_ancient: active (healing land)
  - divine_smith: active (questioning)
  - mist_walker: active (secretive)
  - twin_gods: active (arguing)
  - silent_keeper: active (burdened)
  - eternal_note: active (judging)
  - void_convergence: dormant (not yet emerged)

shards_initial_state:
  - all: scattered (none claimed)
  
shards_current_state:
  - tide_shard: claimed (river_sage holds)
  - forge_shard: contested (ironbound vs crimson)
  - dawn_shard: claimed (dawnshield holds)
  - grove_shard: unclaimed (verdant seeks)
  - ember_shard: unclaimed (divine_smith tests)
  - storm_shard: unclaimed (corsairs hide)
  - frost_shard: unclaimed (silent_keeper guards)
  - lightning_shard: unclaimed (eternal_note judges)

content_filter:
  # What's available in this age
  primitives: @primitive:* (all primitives available)
  prefabs: @prefab:* (all prefabs available)
  packages: @package:* (all packages available)
  
narrative_themes:
  - desperate_hope
  - faction_conflict
  - guardian_trials
  - shard_seeking
  - survival_vs_thriving

generation_rules:
  difficulty_range: [1, 10]
  faction_combinations:
    - type: 1v1 (common)
    - type: 2v1 (reputation-dependent)
    - type: 3v1 (high reputation)
    - type: 2v2 (rare, balanced rep)
  
  encounter_density: medium_high
  objective_variety: high
  
story_context: |
  The sun shattered 80 years ago. The world persists in eternal twilight.
  Twelve factions vie for power, resources, and the 8 shards of the broken sun.
  Divine spirits test those who would claim the shards.
  You are a Realm Walker - one who can cross faction boundaries and shape the world's fate.
  
  Your choices matter. Your reputation with each faction determines your path.
  Every generation you play adds to your legend.
::end
```

---

## Additional Ages (Examples)

### Age of Pre-Sundering

```yaml
::age @global:age:before_fall
name: "The Golden Age"
year_range: [-1000, -81]

world_state:
  sun: intact
  light: day_night_cycle
  seasons: full
  temperature: variable

factions_active:
  - @faction:seraph_kingdom (ruled all)

guardians_status:
  - all: dormant (no need for testing)

shards: none (sun intact)

content_filter:
  # Very limited - flashback content only
  primitives: @primitive:historical_*
  packages: @package:seraph_*

generation_rules:
  available: false (flashback only, not playable)
  
narrative_context: |
  Before the Sundering. The world thrived under the Seraph's rule.
  Day and night cycled normally. Seasons changed.
  This age exists only in memory and guardian stories.
::end
```

### Age of Convergence (Future)

```yaml
::age @global:age:convergence
name: "The Age of Convergence"
year_range: [10, 50]

requires:
  player_shards: 8 (all shards collected)
  reputation: mixed (relationships with multiple factions)

world_state:
  sun: can_be_restored
  factions: uniting_or_fracturing
  final_conflict: approaching

guardians_status:
  - all: final_judgment

content_filter:
  primitives: @primitive:* + @primitive:endgame_*
  prefabs: @prefab:* + @prefab:convergence_*
  packages: @package:* + @package:final_*

generation_rules:
  difficulty_range: [8, 10] (endgame only)
  faction_combinations:
    - type: all_vs_seraph
    - type: united_front
    - type: chaos_finale
    
narrative_context: |
  All shards gathered. The world stands at a crossroads.
  Will you restore the sun or forge a new world in twilight?
  Guardians pass final judgment. Factions choose sides.
  The convergence is here.
::end
```

---

## How Ages Drive Proc-Gen

### Generation Flow with Ages

```
1. Player selects Age
   ↓
2. Load @global:age:selected
   ↓
3. Age defines context:
   - Available factions
   - Guardian states
   - Shard locations
   - Technology level
   - World state
   ↓
4. Player enters seed phrase (or random)
   ↓
5. Generator uses age + seed:
   - Factions: Select from age.factions_active
   - Map: Use age.world_state for biome selection
   - Encounters: Use age.difficulty_range
   - Narrative: Use age.narrative_themes
   ↓
6. Same seed + same age + same rep = same generation
   But different age = different context!
```

### Example

```
Seed: "blood moon rising"
Age: Age of Chaos (year -75)
  → Crimson Pact just forming
  → Very aggressive, resource-desperate
  → Shard wars active
  → Dialogue: "We MUST have the shard!"
  
Same seed: "blood moon rising"
Age: Current Era (year 0)
  → Crimson Pact established
  → More strategic, calculating
  → Shards partially claimed
  → Dialogue: "Join us. Together we thrive."
```

**Same seed phrase, different narrative because of age context!**

---

## Schema Additions Needed

### Add to RWMD 2.0 Spec

1. **::event** (singular)
   - year: number
   - type: string
   - effects: object
   - narrative_anchor: string

2. **::event_span** (plural)
   - start: @event anchor
   - end: @event anchor or null
   - duration: number (years)
   - years: [start, end]
   - characteristics: string[]
   - world_state: object
   - key_events: @event anchors

3. **::age** (group)
   - name: string
   - spans: @span anchors
   - year_range: [start, end]
   - world_state: object
   - factions_active: @faction anchors
   - guardians_status: object
   - shards_status: object
   - content_filter: object
   - generation_rules: object
   - narrative_context: string

---

## Integration with Generators

### Current Generator (TypeScript)

```typescript
function generateScenario(seedPhrase, playerSave) {
  // Hard-coded logic
}
```

### Future Generator (RWMD-driven)

```typescript
function generateScenario(seedPhrase, playerSave, age) {
  // 1. Load age definition
  const ageDefinition = loadAge(age);
  
  // 2. Filter content by age
  const availableFactions = ageDefinition.factions_active;
  const availableGuardians = ageDefinition.guardians_status;
  const worldState = ageDefinition.world_state;
  
  // 3. Use age's generation rules
  const rules = ageDefinition.generation_rules;
  
  // 4. Generate within age context
  // ... generation using age constraints
}
```

---

## Age Content Plan

### Proposed Ages (10-15)

1. **Before Fall** (years -1000 to -81) - Flashback only
2. **The Sundering** (year -80) - Single moment, not playable
3. **Age of Chaos** (years -80 to -60) - Early desperate times
4. **Age of Compacts** (years -60 to -40) - Treaty formation
5. **Age of Borders** (years -40 to -20) - Territory establishment
6. **Age of Stability** (years -20 to -5) - Peace period
7. **Current Age** (years -5 to 0) - Recent past to present
8. **Age of Change** (years 0 to 10) - Future near-term (if player progresses)
9. **Age of Convergence** (years 10+) - Endgame content (requires all shards)

### Content Per Age

Each age needs:
- Age definition file (`global/ages/{name}.rwmd`)
- Unique dialogue (`narrative/dialogue/{faction}/{age}_*.rwmd`)
- Age-specific encounters (`prefabs/encounters/{age}_*.rwmd`)
- Historical context narrative
- Generation rules and constraints

---

## Usage Examples

### Example 1: Age Selection UI

```typescript
import { listAges, loadAge } from '@/lib/world/loaders/age-loader';

// Get all playable ages
const ages = await listAges();

// Player selects
const selected = ages.find(a => a.anchor === '@global:age:chaos');

// Load full definition
const ageDef = await loadAge(selected.anchor);

// Show to player
console.log(ageDef.name); // "Age of Chaos"
console.log(ageDef.narrative_context); // Story description
console.log(ageDef.year_range); // [-80, -60]
```

### Example 2: Generation with Age Context

```typescript
import { generateScenario } from '@/lib/world/generators/scenario-generator';
import { parseSeedPhrase } from '@/lib/world/generators/scenario-generator';

const seedPhrase = parseSeedPhrase('blood moon rising');
const age = loadAge('@global:age:chaos');

const scenario = generateScenario(seedPhrase, playerSave, {
  age: age,
  use_age_rules: true,
});

// Scenario is constrained by age:
// - Only factions from age.factions_active
// - Only content from age.content_filter
// - Difficulty in age.generation_rules.difficulty_range
// - Narrative uses age.narrative_context
```

---

## Adjacency Rules (Like Map Tiles)

### Temporal Adjacency

**Just like map generation uses adjacency for tile placement**, we can use temporal adjacency for event/story placement.

```yaml
::event @global:event:faction_alliance
year: -55
adjacency_rules:
  must_follow: @global:event:faction_meeting
  must_precede: @global:event:treaty_signing
  can_cluster_with:
    - @global:event:trade_agreement
    - @global:event:border_establishment
::end
```

**This allows:**
- Events cluster naturally
- Narrative coherence
- Historical logic
- Emergent story chains

### Span Clustering

```yaml
::event_span @global:span:diplomatic_era
# Contains events that cluster together
events:
  - @global:event:faction_meeting
  - @global:event:faction_alliance
  - @global:event:trade_agreement
  - @global:event:border_establishment
  - @global:event:treaty_signing

# These events "belong" together temporally
clustering:
  type: diplomatic
  theme: peace_building
::end
```

---

## Guardian Progression in Ages

### Problem: Guardians Need Order

**Old system**: River Sage (tutorial) → Stone Warden (shard 1) → etc.

**Proc-gen needs**: Guardians appear in age-appropriate ways

### Solution: Guardian States Per Age

```yaml
::age @global:age:chaos
guardians_status:
  river_sage:
    state: active_testing
    availability: always (first guardian)
    trial_difficulty: tutorial
    
  stone_warden:
    state: dormant
    availability: never (not yet awakened in this age)
    
  forest_ancient:
    state: retreated
    availability: rare (must find in deep forest)
::end

::age @global:age:current
guardians_status:
  river_sage:
    state: established_tester
    availability: common (known location)
    trial_difficulty: easy
    
  stone_warden:
    state: active_guardian
    availability: common (if forge_shard unclaimed)
    trial_difficulty: medium
    
  eternal_note:
    state: final_judge
    availability: endgame_only (requires 7 shards)
    trial_difficulty: deadly
::end
```

---

## Shard Collection in Proc-Gen

### Problem: No Linear Progression

**Old**: Collect one shard per scenario (guaranteed)  
**Proc-gen**: Shards must be findable across multiple generations

### Solution: Shard States Per Age

```yaml
::age @global:age:current
shards_state:
  tide_shard:
    status: claimed
    holder: @guardian:river_sage
    location: @territory:sacred_vale
    quest: @quest:river_trial
    availability: requires_guardian_trial
    
  forge_shard:
    status: contested
    claimants:
      - @faction:ironbound
      - @faction:crimson
    location: @territory:iron_peaks
    quest: @quest:forge_wars
    availability: faction_quest_chain
    
  storm_shard:
    status: hidden
    holder: @faction:corsairs (secret)
    location: @territory:hidden_coves
    availability: requires_corsair_discovery
::end
```

**Proc-gen rule:**
- Each generation MAY have a shard opportunity
- Based on age, factions, player reputation
- Not guaranteed, but possible
- Player collects shards across multiple generations

---

## Next Steps

1. ✅ Create temporal system spec (this document)
2. ⏳ Add ::event, ::event_span, ::age to RWMD 2.0 spec
3. ⏳ Create Zod schemas for temporal blocks
4. ⏳ Design age content (10-15 ages)
5. ⏳ Integrate ages with proc-gen system

---

**Temporal structure provides the narrative scaffolding that proc-gen needs.**
