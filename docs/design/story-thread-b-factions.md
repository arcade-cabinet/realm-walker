# Story Thread B: Faction Politics

**Version**: 1.0 **DRAFT**

## Overview

The Faction Politics thread (B Story) focuses on navigating complex political relationships between supernatural factions in the gothic world. This is the "social intrigue" thread where players build alliances, make political choices, and shape the power structure of the realm.

## Thread Structure

**Progress Range**: 0-12 (13 major milestones)
**Thread Type**: Branching political narrative
**Primary Theme**: Power, diplomacy, and consequences

## Factions

### The Crimson Court
**Leader**: Lady Carmilla
**Power Base**: Crimson Palace and blood magic nobility
**Goals**: Maintain traditional power structures
**Values**: Honor, tradition, hierarchy
**Aesthetic**: Blood-red, Gothic grandeur

### The Shadow Syndicate
**Leader**: The Masked One
**Power Base**: Underground networks and shadow magic
**Goals**: Overthrow existing power structures
**Values**: Freedom, cunning, pragmatism
**Aesthetic**: Dark shadows, mystery

### The Silver Circle
**Leader**: High Priestess Selene
**Power Base**: Temples and spirit magic
**Goals**: Spiritual enlightenment and balance
**Values**: Wisdom, peace, harmony
**Aesthetic**: Silver, moonlight, ethereal

### The Iron Collective
**Leader**: Forge Master Thane
**Power Base**: Industrial districts and technology
**Goals**: Progress through innovation
**Values**: Efficiency, progress, logic
**Aesthetic**: Steampunk, mechanical

### The Verdant Alliance
**Leader**: Archdruid Moss
**Power Base**: Forests and nature magic
**Goals**: Protect natural world from corruption
**Values**: Life, growth, balance
**Aesthetic**: Green, natural, organic

## Story Beats

### Beat 0: Introduction to Politics (bStoryProgress: 0)
**Flag**: `b_story_started`
**Location**: Village Square
**Objective**: Learn about faction tensions
**Diplomatic State**: Neutral with all factions

**Key Moments**:
- Witness faction representatives meeting
- Learn about political landscape
- Choose initial faction interest

**Scene Requirements**:
- Multi-faction meeting area
- Representative NPCs from each faction
- Tension-filled dialogue

### Beat 1: Crimson Invitation (bStoryProgress: 1)
**Flag**: `b_crimson_contacted`
**Location**: Crimson Palace - Reception Hall
**Objective**: Meet with Crimson Court representatives
**Diplomatic Impact**: +Crimson Court favor

**Key Moments**:
- Formal invitation to palace
- Introduction to Lady Carmilla
- First political test

**Scene Requirements**:
- Elegant reception hall
- Carmilla NPC (formal, powerful)
- Etiquette-based challenges

### Beat 2: Shadow Whispers (bStoryProgress: 2)
**Flag**: `b_shadow_approached`
**Location**: Underground Market
**Objective**: Contact made by Shadow Syndicate
**Diplomatic Impact**: +Shadow Syndicate interest

**Key Moments**:
- Secret meeting with Masked One
- Learn about underground resistance
- Offered shadow alliance

**Scene Requirements**:
- Hidden underground location
- Mysterious Masked One NPC
- Stealth and intrigue atmosphere

### Beat 3: Silver Sanctuary (bStoryProgress: 3)
**Flag**: `b_silver_welcomed`
**Location**: Temple of the Moon
**Objective**: Seek audience with Silver Circle
**Diplomatic Impact**: +Silver Circle trust

**Key Moments**:
- Spiritual trials to enter temple
- Meet High Priestess Selene
- Learn about balance philosophy

**Scene Requirements**:
- Ethereal temple interior
- Selene NPC (wise, serene)
- Spiritual puzzles

### Beat 4: Iron Proposition (bStoryProgress: 4)
**Flag**: `b_iron_negotiation`
**Location**: Forge District
**Objective**: Negotiate with Iron Collective
**Diplomatic Impact**: +Iron Collective respect

**Key Moments**:
- Tour of technological marvels
- Meet Forge Master Thane
- Discuss progress vs tradition

**Scene Requirements**:
- Industrial steampunk setting
- Thane NPC (practical, innovative)
- Mechanical demonstrations

### Beat 5: Verdant Call (bStoryProgress: 5)
**Flag**: `b_verdant_summoned`
**Location**: Sacred Grove
**Objective**: Answer the Archdruid's summons
**Diplomatic Impact**: +Verdant Alliance favor

**Key Moments**:
- Journey to ancient forest
- Meet Archdruid Moss
- Learn of nature's concerns

**Scene Requirements**:
- Natural grove setting
- Moss NPC (ancient, connected to nature)
- Living environment

### Beat 6: The First Alliance (bStoryProgress: 6)
**Flag**: `b_first_alliance_formed`
**Location**: Player's Choice of Faction HQ
**Objective**: Form first major alliance
**Diplomatic Impact**: Major faction commitment

**Key Moments**:
- Choose primary faction ally
- Complete faction-specific quest
- Cement relationship

**Scene Requirements**:
- Faction-specific ceremony location
- Alliance ritual or agreement
- Consequences shown

### Beat 7: Rival Tensions (bStoryProgress: 7)
**Flag**: `b_rival_challenged`
**Location**: Neutral Ground (Village Square)
**Objective**: Face opposition from rival faction
**Diplomatic Impact**: -Rival faction, +Allied faction

**Key Moments**:
- Confrontation with rival faction
- Defend alliance choice
- First political conflict

**Scene Requirements**:
- Tense confrontation scene
- Multiple faction NPCs
- Branching resolution options

### Beat 8: Secret Treaties (bStoryProgress: 8)
**Flag**: `b_treaty_negotiated`
**Location**: Hidden Diplomatic Chamber
**Objective**: Negotiate secret alliance
**Diplomatic Impact**: Complex multi-faction effects

**Key Moments**:
- Secret meeting with multiple factions
- Complex negotiation challenges
- Form covert alliance

**Scene Requirements**:
- Secret meeting room
- Multiple faction representatives
- Negotiation mechanics

### Beat 9: The Great Betrayal (bStoryProgress: 9)
**Flag**: `b_betrayal_revealed`
**Location**: Varies by faction choice
**Objective**: Discover faction betrayal
**Diplomatic Impact**: Major shift in alliances

**Key Moments**:
- Betrayal by trusted faction member
- Political crisis moment
- Must choose new path

**Scene Requirements**:
- Dramatic betrayal scene
- Emotional NPC interactions
- Major choice point

### Beat 10: Power Consolidation (bStoryProgress: 10)
**Flag**: `b_power_consolidated`
**Location**: Player's Allied Faction HQ
**Objective**: Help faction gain major advantage
**Diplomatic Impact**: Allied faction dominant

**Key Moments**:
- Execute major political move
- Allied faction gains power
- Opposition weakens

**Scene Requirements**:
- Grand strategic scene
- Multiple faction locations
- Victory celebration

### Beat 11: The Council Convenes (bStoryProgress: 11)
**Flag**: `b_council_called`
**Location**: Grand Council Chamber
**Objective**: Participate in faction council
**Diplomatic Impact**: Player gains political voice

**Key Moments**:
- All faction leaders gather
- Player addresses council
- Major political decisions made

**Scene Requirements**:
- Epic council chamber
- All faction leader NPCs
- Voting/decision mechanics

### Beat 12: New Order (bStoryProgress: 12)
**Flag**: `b_new_order_established`
**Location**: Throne of Balance
**Objective**: Establish new political order
**Diplomatic Impact**: Reshape faction landscape

**Key Moments**:
- Player's choices culminate
- New political system established
- Faction relationships set for endgame

**Scene Requirements**:
- Throne room or equivalent
- Ceremonial political restructuring
- Cinematic outcome sequences

## Diplomatic System

### Faction Favor Tracking
```typescript
interface FactionFavor {
  crimsonCourt: number; // -10 to +10
  shadowSyndicate: number;
  silverCircle: number;
  ironCollective: number;
  verdantAlliance: number;
}
```

### Alliance States
- **Hostile**: Favor < -5 (faction actively opposes player)
- **Neutral**: Favor -5 to +5 (faction neutral)
- **Friendly**: Favor > +5 (faction supports player)
- **Allied**: Special flag + Favor > +7 (formal alliance)

### Political Choices Impact
Each major choice affects multiple factions:
```
Help Crimson Court:
  +2 Crimson, -1 Shadow, +0 Silver, -1 Iron, +0 Verdant

Help Shadow Syndicate:
  -2 Crimson, +2 Shadow, -1 Silver, +0 Iron, +1 Verdant
  
[etc.]
```

## Gameplay Integration

### Quest Structure
- Diplomatic missions (negotiate, persuade)
- Faction-specific challenges
- Political intrigue investigations
- Alliance-building activities

### Branching Outcomes
Player's faction choices affect:
- Available quests and locations
- NPC interactions and dialogue
- Ending scenarios
- Power balance in world

### Integration with A Thread
- Guardian powers can influence diplomacy
- Some factions require specific powers
- Political allies help with guardian quests

### Integration with C Thread
- Ravens observe political machinations
- Faction choices affect raven appearances
- Political stability impacts mysteries

## Content Generation Requirements

### Scenes Per Beat
- 1 primary diplomatic scene (faction HQ)
- 2-3 consequence scenes (showing impact)
- 1 neutral ground scene (village square updates)

### NPCs Per Beat
- 1 faction leader (major character)
- 3-5 faction members (supporting cast)
- 1-2 neutral observers (provide context)

### Dialogue Trees Per Beat
- Faction leader dialogue (20-30 nodes, complex branching)
- Supporting NPC dialogue (10-15 nodes each)
- Political choice dialogues (consequence explanations)

### Asset Requirements
- Faction HQ interiors (unique per faction)
- Faction-specific NPCs (visual identity)
- Political props (documents, seals, symbols)
- Faction banners and decorations

## Atmospheric Guidelines

### Visual Style Per Faction
- **Crimson Court**: Blood-red, Gothic luxury, formal
- **Shadow Syndicate**: Dark, mysterious, underground
- **Silver Circle**: Ethereal, moonlit, spiritual
- **Iron Collective**: Steampunk, industrial, mechanical
- **Verdant Alliance**: Natural, living, organic

### Audio Cues
- Faction-specific musical themes
- Political tension soundscapes
- Diplomatic ceremony sounds
- Crowd reactions to political events

### Narrative Tone
- Machiavellian intrigue
- Moral ambiguity
- Consequence-focused
- Power and responsibility themes

## Generation Priority

**High Priority** (Essential for experience):
- Beats 0-6 (introduction and first alliance)
- All 5 faction leaders
- Core diplomatic mechanics

**Medium Priority** (Important for depth):
- Beats 7-9 (conflict and betrayal)
- Faction HQ locations
- Supporting NPC cast

**Low Priority** (Polish and completion):
- Beats 10-12 (endgame political resolution)
- Minor faction members
- Ambient political details

## Technical Specifications

### Quest Flags
```typescript
interface BStoryFlags {
  b_story_started: boolean;
  b_crimson_contacted: boolean;
  b_shadow_approached: boolean;
  b_silver_welcomed: boolean;
  b_iron_negotiation: boolean;
  b_verdant_summoned: boolean;
  b_first_alliance_formed: boolean;
  b_rival_challenged: boolean;
  b_treaty_negotiated: boolean;
  b_betrayal_revealed: boolean;
  b_power_consolidated: boolean;
  b_council_called: boolean;
  b_new_order_established: boolean;
  
  // Alliance tracking
  b_allied_crimson: boolean;
  b_allied_shadow: boolean;
  b_allied_silver: boolean;
  b_allied_iron: boolean;
  b_allied_verdant: boolean;
}
```

### Faction Favor System
```typescript
interface FactionSystem {
  favor: Record<string, number>;
  alliances: string[];
  hostilities: string[];
  
  modifyFavor(faction: string, amount: number): void;
  formAlliance(faction: string): void;
  checkFavorThreshold(faction: string, threshold: number): boolean;
}
```

## AI Generation Prompts

### Faction Leader Generation
```
Create faction leader NPC:
- Faction: {faction name}
- Theme: {faction theme}
- Visual: {faction aesthetic}
- Personality: {leader traits}
- Goals: {faction goals}
- Dialogue style: {political, manipulative, etc.}
```

### Political Scene Generation
```
Generate diplomatic scene:
- Location: {faction HQ}
- Factions present: {list}
- Tension level: {low/medium/high}
- Objective: {diplomatic goal}
- Branching outcomes: {list of possible results}
```

### Consequence Generation
```
Generate political consequence:
- Player choice: {what player chose}
- Affected factions: {list}
- Favor changes: {+/- per faction}
- World state changes: {description}
- Future impact: {how this affects later beats}
```
