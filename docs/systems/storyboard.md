# Storyboard - Portal Transitions & Narrative Spine

**Version**: 1.0  
**Status**: Canonical Architecture  
**Last Updated**: 2025-10-15

---

## Overview

**Storyboard** = The narrative system that connects 10 fixed scenarios via portal transitions.

**Purpose**:
- Connect discrete scenarios into cohesive story
- Track player choices and consequences
- Determine which scenarios unlock
- Provide narrative context between battles

**NOT**: Cutscenes, forced story, railroading

---

## Core Concept

```
SCENARIO 1 (Battle)
    ↓
STORYBOARD INTERLUDE (30-60 seconds)
    ├─> Recap consequences
    ├─> Update reputation
    ├─> Guardian commentary
    └─> Set up next scenario
    ↓
PORTAL TRANSITION (2-3 seconds)
    ↓
SCENARIO 2 (Battle)
```

**Snappy, not verbose** - Keep momentum

---

## Storyboard System

### State Tracking

```typescript
interface StoryboardState {
  currentScenario: string;
  completedScenarios: string[];
  availableScenarios: string[];
  
  // Player choices
  pathChoice: 'light' | 'dark' | 'neutral';
  majorChoices: ChoiceFlag[];
  
  // Faction standing
  reputations: Record<string, number>;  // faction → -100 to +100
  
  // Shard collection
  shardsCollected: string[];  // 0-8 shard IDs
  
  // Unlocks
  unlockedAbilities: string[];
  unlockedDialogue: string[];
}
```

### Scenario Unlocking

**Logic**: Which scenarios are available?

```typescript
function getAvailableScenarios(state: StoryboardState): string[] {
  const available: string[] = [];
  
  // Scenario 1 always available (tutorial)
  if (state.completedScenarios.length === 0) {
    return ['scenario_01_oath_of_dawn', 'scenario_01_eclipse_of_dusk'];
  }
  
  // Scenario 2: Unlocked after Scenario 1
  if (state.completedScenarios.includes('scenario_01')) {
    // Light path
    if (state.pathChoice === 'light') {
      available.push('scenario_02_tactical_assault');
    }
    // Dark path
    else if (state.pathChoice === 'dark') {
      available.push('scenario_02_shadow_siege');
    }
  }
  
  // Continue pattern...
  // Each scenario unlocks based on:
  // - Previous scenario completed
  // - Path choice (light/dark)
  // - Reputation thresholds (optional branches)
  
  return available;
}
```

### Adaptive Branching

**Reputation-Based Variants**:

```typescript
// Example: Scenario 5 changes based on Ironbound reputation
function getScenario5Variant(state: StoryboardState): string {
  const ironboundRep = state.reputations['ironbound_covenant'] || 0;
  
  if (ironboundRep >= 75) {
    return 'scenario_05_construct_siege_alliance';  // Ironbound helps
  } else if (ironboundRep <= -50) {
    return 'scenario_05_construct_siege_hostile';  // Ironbound opposes
  } else {
    return 'scenario_05_construct_siege';  // Neutral
  }
}
```

**Choice-Based Variants**:

```typescript
// Example: If player spared cultist in Scenario 1
if (state.majorChoices.includes('spare_cultist_scenario_01')) {
  // That cultist appears later with gratitude
  unlockedDialogue.push('cultist_thanks_dialogue');
}
```

---

## Interlude System

### Storyboard Interlude Content

**After Scenario Completion**:

```
VICTORY ACHIEVED
    ↓
IMMEDIATE REACTION (5-10 seconds)
    "The shrine is safe. Captain Elena nods in respect."
    ↓
CONSEQUENCE REVEAL (10-15 seconds)
    "Word of your mercy spreads. Dawnshield reputation +15."
    "The spared cultist escapes into the night..."
    ↓
GUARDIAN COMMENTARY (10-15 seconds)
    "River Sage: 'Compassion in battle - the first step toward wisdom.'"
    ↓
NEXT DESTINATION (10-15 seconds)
    "The Ironpeak Wardens guard the Shard of Tactical Dominion."
    "Captain Elena can open a portal to their fortress."
    ↓
PORTAL OPENS
    [Player presses button]
    ↓
TRANSITION (2-3 seconds)
    Portal swirl VFX, fade to black, load next
```

**Total Time**: 30-60 seconds max

---

## Portal Transitions

### Visual Effect

**Portal Appearance**:
1. Swirling energy forms (1 second)
2. Destination briefly visible through portal (glimpse)
3. Player approaches portal
4. Screen fades to black (0.5 seconds)
5. Loading happens (invisible)
6. Fade in to new scenario (0.5 seconds)

**Total**: 2-3 seconds

**No loading screens** - seamless transitions

### Technical Implementation

```typescript
async function transitionToScenario(targetId: string) {
  // 1. Show portal VFX
  showPortalEffect(targetId);
  await sleep(1000);
  
  // 2. Fade out
  await fadeToBlack(500);
  
  // 3. Load new scenario (background)
  const scenario = await loadScenario(targetId);
  await preloadAssets(scenario.requiredAssets);
  
  // 4. Initialize new scenario
  initializeScenario(scenario);
  
  // 5. Fade in
  await fadeFromBlack(500);
  
  // 6. Start scenario
  startScenario();
}
```

---

## Narrative Spine Content

### RWMD Format

**Storyboard interludes use RWMD**:

```yaml
---
rwmd: 1.3
kind: storyboard_interlude
id: interlude_01_to_02
---

::interlude @interlude:oath_to_assault
title: "The Mountain Calls"

# Immediate Reaction
victory_text: |
  The Sacred Shrine stands defended. Captain Elena sheathes her sword,
  her expression mixing relief with grim determination.

# Consequence Reveal
consequence_dialogue:
  - speaker: "Captain Elena"
    text: "Your mercy to that cultist... unusual. But perhaps wise."
    emotion: "contemplative"
    condition: { flag: "spare_cultist_scenario_01" }

reputation_changes:
  - faction: "dawnshield_order"
    change: 15
    reason: "Defended Sacred Shrine"
  - faction: "veilbound_synod"
    change: -10
    reason: "Defeated their forces"

# Guardian Commentary
guardian_appearance:
  guardian: "river_sage"
  dialogue:
    - text: "The shrine's safety is but the first ripple. Greater currents await."
      emotion: "wise"

# Next Destination
next_scenario_setup:
  - speaker: "Captain Elena"
    text: "The Ironpeak Wardens guard the Shard of Tactical Dominion in the mountains."
  - speaker: "Captain Elena"
    text: "Thrain Ironhelm leads them - a dwarf of unbreakable will."
  - speaker: "Captain Elena"
    text: "I can open a portal if you're ready to continue."

portal_destination: "scenario_02_tactical_assault"
::end
```

---

## Choice Consequence System

### Tracking Choices

**Flags** = Player choices with lasting effects

```typescript
interface ChoiceFlag {
  id: string;              // "spare_cultist_scenario_01"
  scenario: string;        // Where it was set
  consequence: string;     // What it means
  reputationImpact: Record<string, number>;
}

// Example flags:
const flags = [
  'spare_cultist_scenario_01',      // Spared dying enemy
  'mercy_kill_scenario_01',          // Mercy killed instead
  'execute_cultist_scenario_01',     // Brutal execution
  'light_path_committed',            // Committed to light
  'neutral_stance',                  // Staying neutral
  'mercenary_approach'               // Fighting for payment
];
```

### Consequence Callbacks

**Later scenarios check flags**:

```typescript
// Scenario 3: If you spared cultist in Scenario 1
if (hasFlag('spare_cultist_scenario_01')) {
  // That cultist returns
  showDialogue('@dialogue:grateful_cultist_returns');
  // Offers: "I owe you my life. Let me help you."
  addTemporaryAlly('grateful_cultist');
}

// Scenario 7: If you were mercenary in early game
if (hasFlag('mercenary_approach')) {
  // Factions don't trust you
  reputationPenalty('all', -10);
  showDialogue('@dialogue:mercenary_reputation');
}
```

---

## Reputation System

### Faction Reputation Scale

```
-100 ← ────── 0 ────── → +100
Hatred    Neutral    Beloved
```

**Thresholds**:
- **-100 to -75**: Hostile (attack on sight)
- **-75 to -25**: Opposition (refuse to help)
- **-25 to +25**: Neutral (transactional)
- **+25 to +75**: Alliance (will help)
- **+75 to +100**: Beloved (maximum support)

### Reputation Effects

**Dialogue Changes**:
```typescript
// High reputation
if (reputation >= 75) {
  npc.greeting = "Welcome, honored friend!";
  npc.attitude = "enthusiastic";
}

// Low reputation  
else if (reputation <= -50) {
  npc.greeting = "You're not welcome here.";
  npc.attitude = "hostile";
}
```

**Scenario Variants**:
```typescript
// Some scenarios have reputation-gated variants
if (reputation['crimson_pact'] >= 50) {
  unlockScenario('scenario_07_blood_pact_alliance');
} else {
  unlockScenario('scenario_07_blood_pact_conflict');
}
```

**Prices & Rewards**:
```typescript
// Merchants charge based on reputation
const price = basePrice * (1 - (reputation / 200));  // Max 50% discount

// Quest rewards scale with reputation  
const reward = baseReward * (1 + (reputation / 100));  // Max 2x reward
```

---

## Save Integration

**Storyboard state persists** to database:

```sql
-- Current storyboard position
SELECT current_scenario FROM saves WHERE id = ?;

-- Choice flags
SELECT flag FROM choice_flags WHERE save_id = ?;

-- Reputation
SELECT faction_id, reputation FROM faction_reputation WHERE save_id = ?;

-- Scenario progress
SELECT scenario_id, status FROM scenario_progress WHERE save_id = ?;
```

**On load**: Reconstruct storyboard state from database

---

## UI/UX Integration

### Storyboard UI

**During Interlude**:
- Background: Faded scenario view (not black screen)
- Center panel: Dialogue/consequences
- Portrait: Speaking character
- Reputation bars: Show changes (animated +15, etc.)
- Continue button: Proceed when ready

**No auto-advance** - Player controls pacing

### Portal UI

**When Portal Opens**:
- VFX: Swirling portal effect
- Tooltip: "Ironpeak Fortress" (destination name)
- Button: "Enter Portal" (E key)
- Optional: "Rest Before Continuing" (takes you to camp menu)

---

## Testing Interludes

### Validation

**Check**:
- [ ] All flags referenced actually exist
- [ ] Reputation changes sum correctly
- [ ] Dialogue references valid character IDs
- [ ] Portal destinations exist
- [ ] Conditional content has proper flags

### Edge Cases

**Test**:
- What if player has conflicting flags?
- What if reputation is at threshold boundary?
- What if multiple paths lead to same scenario?
- What if player backtracks (NG+ mode)?

---

## Future Enhancements

### Dynamic Interludes

**Planned**: Interlude content adapts to more factors:
- Faction combo you're using
- Shards collected so far
- Previous scenario performance
- Reputation spread across factions

**Not implemented yet** - All interludes hand-authored for v1.0

### Replay System

**Planned**: View previous interludes:
- Journal/codex system
- Replay story moments
- See alternate paths (if NG+)

**Not implemented yet**

---

## See Also

- `scenarios.md` - What storyboard connects
- `database.md` - How storyboard state persists
- `rwmd.md` - Format for interlude content
- `../lore/world.md` - Context for narrative

---

**Remember**: Storyboard is the spine. Without it, scenarios are disconnected battles. With it, they're a journey.
