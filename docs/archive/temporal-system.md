# Temporal & Chronology System

**Version**: 1.0 **FROZEN**  
**Date**: 2025-10-27  
**Status**: Consolidated from systems/TEMPORAL_SYSTEM_SPEC.md + CHRONOLOGY_SYSTEM_GODOT.md

---

## Overview

Realm Walker Story spans **50,000 years** of history. The Temporal System defines how time periods, events, and world state interact with gameplay.

**Core Concept**: **Boon-based time travel** - Guardian boons unlock deeper temporal access.

---

## The 50,000-Year Timeline

### Primordial Era (-50,000)
- Creation mythology witness
- The Compact formed
- 8 Guardians bound

### Mythic Era (-2,000 to -500)
- First civilizations
- Divine Smith creates conscious constructs
- World Tree at full height

### Classical Era (412 to 1,047)
- Medieval kingdoms form
- Forty-Day Siege
- Faction consolidation

### Medieval Era (1,200 to 1,534)
- Crusades and academies
- Sun Warden binding
- Restoration Equations developed

### Renaissance Era (1,680)
- Classical arts peak
- Mortis before Death Symphony

### Industrial Era (1,801 to 1,920)
- Steam power
- Void rifts open (accidental)
- Pre-twilight establishment

### Contemporary Era (1,968 to 2048)
- 80 years post-establishment of current world state
- Factions adapted to twilight
- Shards scattered

### Future Era (2100+)
- Dead World Opening (Chapter 0)
- Final convergence
- THE DESTROYER awakens

---

## Boon-Based Time Travel

### Unlock Progression

**Guardian Boons grant temporal depth:**

```
0 boons  → Can only access Year 2100+ (present)
2 boons  → Medieval era (1200-1534)
4 boons  → Classical + Mythic (412-1047, -2000)
6 boons  → Ancient eras (-500)
8 boons  → Primordial era (-50,000) + void realms
```

### Realm Walking Mechanic

```typescript
interface RealmWalkAbility {
  requiredBoons: number;
  accessibleEras: Era[];
  maxTimeJump: number; // years
}

class TemporalNavigator {
  canTravel(targetYear: number, playerBoons: number): boolean {
    const currentYear = 2100;
    const distance = Math.abs(currentYear - targetYear);
    
    // Calculate required boons for distance
    const requiredBoons = this.calculateRequiredBoons(distance);
    
    return playerBoons >= requiredBoons;
  }
  
  private calculateRequiredBoons(yearDistance: number): number {
    if (yearDistance < 100) return 0;      // Contemporary
    if (yearDistance < 1000) return 2;     // Medieval
    if (yearDistance < 5000) return 4;     // Classical/Mythic
    if (yearDistance < 10000) return 6;    // Ancient
    return 8;                               // Primordial
  }
}
```

---

## World State by Era

### Temporal State Flags

Each era has unique world state:

```typescript
interface WorldState {
  year: number;
  lightLevel: 'eternal_twilight' | 'natural_sun' | 'void_darkness';
  sunState: 'shattered' | 'whole' | 'void';
  factionPresence: Record<FactionId, boolean>;
  guardiansActive: GuardianId[];
  majorEvents: EventId[];
}

// Example: Crimson Pact era (Year 767)
const crimsonPactState: WorldState = {
  year: 767,
  lightLevel: 'eternal_twilight',
  sunState: 'shattered',
  factionPresence: {
    crimson_pact: true,
    dawnshield: false,  // Not yet formed
    verdant_spirits: true
  },
  guardiansActive: ['stone_warden', 'forest_ancient', 'river_sage'],
  majorEvents: ['stone_warden_emerges']
};
```

---

## Event System

### Event Types

**Singular**: `::event` - Specific moment in history

**Attributes**:
- `year`: Timeline position
- `type`: cataclysm | founding | discovery | battle
- `effects`: World state changes
- `triggers`: Quest flags that reference this event

**Example**:
```typescript
interface HistoricalEvent {
  id: string;
  name: string;
  year: number;
  type: 'cataclysm' | 'founding' | 'discovery' | 'battle';
  
  description: string;
  
  effects: {
    worldStateChanges: Record<string, any>;
    factionsCreated?: FactionId[];
    guardiansAffected?: GuardianId[];
  };
  
  mythology_echoes?: string[]; // Clues findable in other eras
}

// Example: The Prison Shattering (Primordial)
const prisonShatteringEvent: HistoricalEvent = {
  id: 'prison_shattering',
  name: 'The Prison Shattering',
  year: -50000,
  type: 'cataclysm',
  
  description: 'THE DESTROYER shatters its prison, creating the world.',
  
  effects: {
    worldStateChanges: {
      world_created: true,
      shards_scattered: true,
      twilight_established: true
    },
    guardiansAffected: [
      'stone_warden', 'forest_ancient', 'river_sage',
      'divine_smith', 'twin_gods', 'mist_walker',
      'silent_keeper', 'eternal_note'
    ]
  },
  
  mythology_echoes: [
    'ancient_inscriptions',
    'compact_memory_fragments',
    'shard_resonance_patterns'
  ]
};
```

---

## Mythology Echoes

### Discovery System

**Mechanism**: Props throughout world contain "echoes" - clues about other time periods.

```typescript
interface MythologyEcho {
  id: string;
  foundIn: {
    sceneId: string;
    propId: string;
  };
  reveals: {
    era: string;
    year: number;
    factionHint?: string;
    locationHint?: string;
    eventHint?: string;
  };
}

// Example: Found in Year 767 scene
const ancientRuneEcho: MythologyEcho = {
  id: 'ancient_rune_tablet',
  foundIn: {
    sceneId: 'crimson_pact_library',
    propId: 'dusty_tablet'
  },
  reveals: {
    era: 'Mythic',
    year: -2000,
    factionHint: 'sanctum_sacred_invention',
    locationHint: 'Divine Smith was forging consciousness here',
    eventHint: 'First construct awakening'
  }
};

class MythologyEchoSystem {
  discoverEcho(echo: MythologyEcho, questManager: QuestManager): void {
    // Set discovery flags
    questManager.setFlag(`discovered_${echo.id}`, true);
    questManager.setFlag(`knows_era_${echo.reveals.era}`, true);
    
    // Unlock time travel if conditions met
    if (questManager.hasFlag('can_realm_walk')) {
      questManager.setFlag(`can_visit_${echo.reveals.era}`, true);
    }
    
    // Show lore entry
    this.showLoreEntry(echo);
  }
}
```

---

## Chapter-Era Mapping

### Story Progression Through Time

**Chapter sequence intentionally non-chronological:**

| Chapter | Year | Era | Guardian | Boons Required |
|---------|------|-----|----------|----------------|
| 0 | 2100+ | Future | None | 0 (tutorial) |
| 1 | 767 | Medieval | Stone Warden | 0 (first) |
| 2 | -500 | Ancient | Forest Ancient | 2 |
| 3 | 412 | Classical | Silent Keeper | 2 |
| 4 | 1,047 | Classical | River Sage | 4 |
| 5 | 1,200 | Medieval | (Sun Warden fragment) | 4 |
| 6 | 1,534 | Medieval | Twin Gods | 6 |
| 7 | -2,000 | Mythic | Divine Smith | 6 |
| 8 | 1,680 | Renaissance | Eternal Note | 6 |
| 9 | 1,835 | Industrial | (Redirected) | 8 |
| 10 | 1,899 | Industrial | Mist Walker | 8 |
| 11 | 1,920 | Industrial | (Void) | 8 |
| 12 | -50,000 | Primordial | (Witness only) | 8 |

**Non-linear by design**: Player experiences history out of sequence, building understanding gradually.

---

## Temporal Paradoxes

### Paradox Prevention

**Rule**: **You cannot change the past, only witness and participate in what always happened.**

```typescript
class TemporalParadoxGuard {
  validateAction(action: PlayerAction, timelineYear: number): boolean {
    // Check if action would create paradox
    const futureState = this.getFutureWorldState(timelineYear);
    
    // Action must be consistent with known future
    if (this.wouldContradict(action, futureState)) {
      this.showParadoxWarning();
      return false; // Block action
    }
    
    return true;
  }
  
  private wouldContradict(action: PlayerAction, futureState: WorldState): boolean {
    // Example: Can't prevent Mortis's Death Symphony
    // because we know it happens in history
    if (action.type === 'prevent_event' && 
        futureState.majorEvents.includes(action.eventId)) {
      return true; // Would create paradox
    }
    
    return false;
  }
}
```

**Special Case**: Playing as faction leaders creates interesting moments:
- "I remember this... I was here as the enemy"
- Temporal echo dialogues acknowledge the loop

---

## Implementation

### Temporal Manager System

```typescript
class TemporalManager {
  private currentEra: Era;
  private playerBoons: number;
  private discoveredEras: Set<string>;
  
  canAccessEra(targetEra: Era): boolean {
    const required = this.getRequiredBoons(targetEra);
    return this.playerBoons >= required && this.discoveredEras.has(targetEra.id);
  }
  
  initiateRealmWalk(targetYear: number): Promise<void> {
    // 1. Validate access
    if (!this.canTravel(targetYear)) {
      throw new Error('Insufficient boons for this time period');
    }
    
    // 2. Load world state for target year
    const worldState = await this.loadWorldState(targetYear);
    
    // 3. Transition with Realm Walk effect
    await this.sceneTransitionManager.transitionWithEffect({
      effect: 'realm_walk',
      from: this.currentEra,
      to: targetYear,
      worldState
    });
    
    // 4. Update current era
    this.currentEra = this.getEraForYear(targetYear);
  }
  
  discoverEchoClue(echo: MythologyEcho): void {
    this.discoveredEras.add(echo.reveals.era);
    this.questManager.setFlag(`discovered_${echo.id}`, true);
  }
}
```

---

## Quest Integration

### Temporal Quests

**A Story (Linear)**: 
- Progress through time collecting Guardian boons
- Each boon unlocks deeper temporal access

**B Story (Emergent)**:
- Mythology echoes guide player to specific eras
- Recruit faction heroes from their historical moments
- Build understanding of faction origins

**C Story (Optional)**:
- Raven encounters span multiple eras
- Reveal how compact broke across timeline

---

## Cross-References

**Related Documents**:
- `quest-narrative-system.md` - Flag-based progression
- `guardian-unmaking-system.md` - Boon granting
- `design/CANONICAL_STORY_BIBLE.md` - Complete timeline
- `design/AGES_AND_FACTIONS_COMPLETE.md` - Era details

**Implementation Files**:
- `src/runtime/systems/TemporalManager.ts` (NEW)
- `src/runtime/systems/QuestManager.ts`
- `src/runtime/systems/SceneTransitionManager.ts`

**Test Files**:
- `tests/unit/TemporalManager.test.ts` (NEW)

---

**Status**: FROZEN v1.0  
**Last Updated**: 2025-10-27  
**Supersedes**: `systems/TEMPORAL_SYSTEM_SPEC.md`, `systems/CHRONOLOGY_SYSTEM_GODOT.md`
