# Story Thread A: Guardian Powers

**Version**: 1.0 **DRAFT**

## Overview

The Guardian Powers thread (A Story) focuses on the player acquiring supernatural abilities from ancient guardians. This is the "power progression" thread where players unlock new capabilities through completing quests and forming bonds with guardian entities.

## Thread Structure

**Progress Range**: 0-9 (10 major milestones)
**Thread Type**: Linear power acquisition
**Primary Theme**: Ancient magic and supernatural abilities

## Story Beats

### Beat 0: Awakening (aStoryProgress: 0)
**Flag**: `a_story_started`
**Location**: Village Square
**Objective**: Learn about the existence of guardians
**Guardian**: None yet
**Power Unlocked**: None

**Key Moments**:
- Village Elder speaks of ancient guardians
- Player learns of their potential as a "Realm Walker"
- First hints of supernatural sensitivity

**Scene Requirements**:
- Village Square (tutorial area)
- Elder dialogue tree introducing guardian lore
- Ambient supernatural effects (subtle)

### Beat 1: First Contact (aStoryProgress: 1)
**Flag**: `a_guardian_spirit_met`
**Location**: Forest Path
**Objective**: Encounter your first guardian spirit
**Guardian**: Spirit of the Silver Grove
**Power Unlocked**: Spirit Sight (see hidden objects)

**Key Moments**:
- Guardian manifests as ethereal entity
- Player proves worthiness through dialogue choices
- First power transfer ceremony

**Scene Requirements**:
- Forest clearing with mystical atmosphere
- Guardian NPC with ethereal visual effects
- Hidden objects that become visible after power gain

### Beat 2: Blood Compact (aStoryProgress: 2)
**Flag**: `a_blood_guardian_bonded`
**Location**: Crimson Palace - Lower Hall
**Objective**: Form bond with Carmilla, guardian of blood magic
**Guardian**: Carmilla (Blood Guardian)
**Power Unlocked**: Crimson Sense (detect danger/intent)

**Key Moments**:
- Carmilla tests the player with moral choices
- Player accepts the power and its price
- Blood pact ceremony (dramatic cutscene moment)

**Scene Requirements**:
- Gothic hall with blood-red lighting
- Carmilla NPC with imposing presence
- Interactive ritual elements

### Beat 3: Shadow Walker (aStoryProgress: 3)
**Flag**: `a_shadow_power_gained`
**Location**: Forgotten Catacombs
**Objective**: Retrieve shadow essence from ancient tomb
**Guardian**: The Umbral One
**Power Unlocked**: Shadow Step (phase through barriers)

**Key Moments**:
- Navigate dangerous catacombs
- Solve shadow-based puzzles
- Confrontation with guardian of shadows

**Scene Requirements**:
- Dark catacomb system
- Shadow-based puzzles
- Umbral guardian boss encounter

### Beat 4: Elemental Mastery (aStoryProgress: 4)
**Flag**: `a_elements_balanced`
**Location**: Elemental Shrine
**Objective**: Balance the four elemental guardians
**Guardian**: Four Elemental Spirits
**Power Unlocked**: Elemental Attunement (interact with elemental objects)

**Key Moments**:
- Meet each elemental guardian in sequence
- Solve elemental balance puzzle
- Gain attunement to all four elements

**Scene Requirements**:
- Four elemental chambers (fire, water, earth, air)
- Elemental puzzle mechanics
- Multiple guardian NPCs

### Beat 5: Mind's Eye (aStoryProgress: 5)
**Flag**: `a_psychic_awakened`
**Location**: Tower of Whispers
**Objective**: Unlock psychic potential with mental guardian
**Guardian**: The Whispering Mind
**Power Unlocked**: Thought Reading (see NPC hidden intentions)

**Key Moments**:
- Mental trials and psychic challenges
- Guardian tests player's mental fortitude
- Psychic awakening sequence

**Scene Requirements**:
- Surreal tower interior
- Psychic puzzle sequences
- Mind-bending visual effects

### Beat 6: Life and Death (aStoryProgress: 6)
**Flag**: `a_lifedeath_mastered`
**Location**: The Eternal Garden
**Objective**: Balance life and death forces
**Guardian**: Twin Guardians of Life/Death
**Power Unlocked**: Vitality Sense (detect life essence, speak to spirits)

**Key Moments**:
- Meet twin guardians (Life and Death)
- Choose how to balance the powers
- Gain understanding of mortality

**Scene Requirements**:
- Garden split between living/dead sections
- Twin guardian NPCs with contrasting visuals
- Life/death balance mechanic

### Beat 7: Time's Echo (aStoryProgress: 7)
**Flag**: `a_time_guardian_met`
**Location**: Clockwork Cathedral
**Objective**: Navigate temporal anomalies
**Guardian**: The Chronarch
**Power Unlocked**: Echo Sight (see past events)

**Key Moments**:
- Experience temporal distortions
- Witness past events through echo sight
- Guardian grants time-related power

**Scene Requirements**:
- Clockwork-themed cathedral
- Temporal visual effects
- Past event replays

### Beat 8: Void Touched (aStoryProgress: 8)
**Flag**: `a_void_power_accepted`
**Location**: The Empty Place
**Objective**: Confront the void and accept its power
**Guardian**: The Void Entity
**Power Unlocked**: Void Walk (access hidden void spaces)

**Key Moments**:
- Enter the void realm
- Face existential challenges
- Accept or reject void power (major choice)

**Scene Requirements**:
- Void realm with minimal geometry
- Existential horror atmosphere
- Choice-based narrative branch

### Beat 9: Guardian Ascension (aStoryProgress: 9)
**Flag**: `a_guardian_ascended`
**Location**: The Sanctum of Guardians
**Objective**: Complete the guardian trials and ascend
**Guardian**: Council of All Guardians
**Power Unlocked**: Guardian's Authority (master all previous powers)

**Key Moments**:
- Face trials from all previous guardians
- Prove mastery of all acquired powers
- Ascend to guardian status

**Scene Requirements**:
- Epic sanctum location
- All previous guardians present
- Multi-phase challenge sequence
- Cinematic ascension moment

## Gameplay Integration

### Power Progression
Each power unlocks new interactions:
- **Spirit Sight**: See hidden quest items
- **Crimson Sense**: Detect hostile intent before combat
- **Shadow Step**: Access secret areas
- **Elemental Attunement**: Solve environmental puzzles
- **Thought Reading**: Get additional dialogue options
- **Vitality Sense**: Complete spirit-related quests
- **Echo Sight**: Solve mystery-based quests
- **Void Walk**: Access endgame areas
- **Guardian's Authority**: Ultimate power state

### Flag Dependencies
Powers build on each other:
```
a_story_started (0)
  ↓
a_guardian_spirit_met (1)
  ↓
a_blood_guardian_bonded (2)
  ↓
[continues sequentially to 9]
```

### Quest Integration
- A-thread quests focus on proving worthiness
- Each guardian has specific requirements
- Powers are required for B and C thread progression
- Final ascension affects game ending

## Content Generation Requirements

### Scenes Per Beat
- 1 primary quest scene (guardian encounter)
- 1-2 approach scenes (buildup)
- 1 power manifestation scene (post-acquisition)

### NPCs Per Beat
- 1 guardian NPC (unique, powerful)
- 2-3 supporting NPCs (guides, challengers)
- Ambient NPCs for atmosphere

### Dialogue Trees Per Beat
- Guardian dialogue (15-20 nodes)
- Supporting NPC dialogue (5-10 nodes each)
- Power explanation dialogue

### Asset Requirements
- Guardian character models (ethereal, impressive)
- Power effect GLBs (visual manifestations)
- Location-specific architecture
- Mystical props and decorations

## Atmospheric Guidelines

### Visual Style
- Ethereal and mystical
- Supernatural lighting effects
- Gothic architecture with magical elements
- Each guardian has unique visual signature

### Audio Cues
- Mystical ambient sounds
- Guardian-specific audio themes
- Power activation sound effects
- Atmospheric music per location

### Narrative Tone
- Epic and mystical
- Focus on personal growth
- Ancient wisdom and power
- Balance between dark and light

## Generation Priority

**High Priority** (Essential for core experience):
- Beats 0-3 (early game power curve)
- Guardian character designs
- Power visual effects

**Medium Priority** (Important for complete thread):
- Beats 4-6 (mid-game progression)
- Supporting NPC cast
- Location variety

**Low Priority** (Polish and completion):
- Beats 7-9 (endgame content)
- Ambient details
- Optional dialogue branches

## Technical Specifications

### Quest Flags
```typescript
interface AStoryFlags {
  a_story_started: boolean;
  a_guardian_spirit_met: boolean;
  a_blood_guardian_bonded: boolean;
  a_shadow_power_gained: boolean;
  a_elements_balanced: boolean;
  a_psychic_awakened: boolean;
  a_lifedeath_mastered: boolean;
  a_time_guardian_met: boolean;
  a_void_power_accepted: boolean;
  a_guardian_ascended: boolean;
}
```

### Progress Tracking
```typescript
interface AStoryProgress {
  currentBeat: number; // 0-9
  powersUnlocked: string[];
  guardiansmet: string[];
  trialsCompleted: string[];
}
```

## AI Generation Prompts

### Guardian NPC Generation
```
Create a guardian NPC for beat {X}:
- Theme: {guardian theme}
- Power: {power name}
- Visual: Ethereal, {specific visual elements}
- Personality: Ancient, wise, {specific traits}
- Dialogue style: {specific tone}
```

### Scene Generation
```
Generate guardian encounter scene:
- Location: {location name}
- Atmosphere: {atmospheric description}
- Guardian: {guardian name}
- Quest objective: {objective}
- Power reward: {power name}
```

### Dialogue Generation
```
Create guardian dialogue tree:
- Guardian: {name}
- Player state: {progress level}
- Objective: {what player must prove}
- Branches: Worthy path, unworthy path, questioning path
- Tone: {specific tone}
```
