# Character Creation System

**Version**: 1.0  
**Status**: Design Specification (PARTIALLY IMPLEMENTED)  
**Last Updated**: 2025-10-15

---

## Status

⚠️ **PARTIALLY IMPLEMENTED**:
- OLD has faction-selection.tsx UI
- NEW has nothing
- No species selection UI
- No class selection
- No customization

**Most of this needs to be built.**

---

## Creation Flow

### Step 1: Tutorial Intro (Unskippable)

**Storyboard Cutscene** (1-2 minutes):
```
Year 2,048 - 80 years after the Sundering

[Fade in: Riverwatch village in eternal twilight]

NARRATOR:
"Eighty years ago, the sun shattered. The world fell into darkness.
Ninety percent of all life died. But you... you survived."

[Show village life - otters trading, foxes training, humans farming fungi]

NARRATOR:
"Now the 8 shards call. Those who can walk between realms...
they are the only hope."

[River Sage appears, ethereal and glowing]

RIVER SAGE:
"Realm Walker. Your journey begins."
```

**No character creation yet** - Story first

---

### Step 2: Species Selection

**After intro, choose species**:

```
┌──────────────────────────────────────────────┐
│  CHOOSE YOUR FORM                            │
├──────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  🦦 OTTER│  │  🦊 FOX  │  │ 👤 HUMAN │  │
│  │  Merchant│  │ Assassin │  │ Warrior  │  │
│  │          │  │          │  │          │  │
│  │  Balanced│  │  Fast    │  │ Strong   │  │
│  │  +Trade  │  │  +Stealth│  │ +Combat  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ 🐺 WOLF  │  │ 🦅 HAWK  │  │ 🐍 SNAKE │  │
│  │  Warrior │  │  Scout   │  │  Mage    │  │
│  │          │  │          │  │          │  │
│  │  Pack    │  │  Aerial  │  │  Cunning │  │
│  │  Tactics │  │  Vision  │  │  +Magic  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                                              │
│  (6 more species...)                         │
│                                              │
│  Selected: OTTER                             │
│  "Merchants of the River Sage's people.      │
│   Balanced stats, bonus to trading."         │
│                                              │
│  [Confirm Selection]                         │
└──────────────────────────────────────────────┘
```

**12 Species** (see `../lore/taxonomy.md`):
- Otter, Fox, Wolf, Bear, Raven, Cat
- Badger, Deer, Owl, Hawk, Snake, Crow

**Species Stats**:
```typescript
interface SpeciesStats {
  id: string;
  name: string;
  baseStats: {
    hp: number;
    atk: number;
    def: number;
    spd: number;
    rng: number;
  };
  special: string;  // Unique passive
  assetIds: string[];  // Multiple model variants
}

const SPECIES: Record<string, SpeciesStats> = {
  otter: {
    id: 'otter',
    name: 'Otter',
    baseStats: { hp: 120, atk: 12, def: 10, spd: 10, rng: 2 },
    special: 'River Sage\'s Blessing: +10% gold from merchants',
    assetIds: ['otter_male_01', 'otter_female_01', 'otter_elder']
  },
  
  fox: {
    id: 'fox',
    name: 'Fox',
    baseStats: { hp: 100, atk: 14, def: 8, spd: 14, rng: 3 },
    special: 'Shadow Step: +20% dodge chance',
    assetIds: ['fox_rogue', 'fox_assassin']
  },
  
  human: {
    id: 'human',
    name: 'Human',
    baseStats: { hp: 130, atk: 13, def: 11, spd: 11, rng: 2 },
    special: 'Adaptable: +10% XP gain',
    assetIds: ['human_male_warrior', 'human_female_warrior', 'human_mage']
  },
  
  // ... 9 more species
};
```

**Stats Balanced**:
- All species have same total stat points (155)
- Different distributions (otter balanced, fox fast, etc.)
- Special abilities are sidegrades (no strictly better)

---

### Step 3: Appearance Customization

**Simple Customization** (not overwhelming):

```
┌──────────────────────────────────────────────┐
│  CUSTOMIZE APPEARANCE                        │
├──────────────────────────────────────────────┤
│  ┌────────────────────┐                      │
│  │                    │  Model Preview       │
│  │     🦦  3D         │                      │
│  │    /|\ Model       │                      │
│  │    / \ Rotates     │                      │
│  └────────────────────┘                      │
│                                              │
│  Color Scheme:                               │
│  [ Brown ] [ Grey ] [ Black ] [ White ]      │
│                                              │
│  Accessories:                                │
│  [ None ] [ Merchant Hat ] [ Cloak ]         │
│                                              │
│  [Randomize] [Confirm]                       │
└──────────────────────────────────────────────┘
```

**Customization Options**:
- **Color**: 4-6 color variations
- **Accessories**: 2-4 optional accessories  
- **No facial features** - Keep models simple
- **Randomize button** - For indecisive players

---

### Step 4: Name Entry

**Simple Text Input**:

```
┌──────────────────────────────────────────────┐
│  WHAT IS YOUR NAME?                          │
├──────────────────────────────────────────────┤
│  ┌────────────────────────┐                  │
│  │  [____________]        │                  │
│  └────────────────────────┘                  │
│                                              │
│  Or choose from suggested:                   │
│  [Riverwatch] [Ottermere] [Streamwhisker]    │
│                                              │
│  [Confirm]                                   │
└──────────────────────────────────────────────┘
```

**Validation**:
- 2-20 characters
- Letters, numbers, spaces, hyphens
- No profanity check (single-player)

**Suggested Names**:
- Generate 3 species-appropriate names
- Based on faction lore

---

### Step 5: Scenario 1 (Tutorial)

**NO class selection yet** - Learn basics first

**Tutorial teaches**:
- Movement (click hex to move)
- Combat (click enemy to attack)
- Abilities (1, 2, 3, 4 hotkeys)
- Terrain (cover, special zones)
- Objectives (defend shrine)

**Duration**: 15-30 minutes

**Reward**: First combat experience

---

### Step 6: Class Selection (Post-Tutorial)

**After Scenario 1 victory**:

```
ELDER OTTERMERE:
"You've proven yourself in battle, Realm Walker. Now choose your path."

┌──────────────────────────────────────────────┐
│  CHOOSE YOUR CLASS                           │
├──────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐         │
│  │  ⚔️ WARRIOR  │  │  🏹 RANGER   │         │
│  │              │  │              │         │
│  │  Frontline   │  │  Backline    │         │
│  │  Tank/DPS    │  │  DPS/Control │         │
│  │              │  │              │         │
│  │ +HP, +DEF    │  │ +RNG, +ACC   │         │
│  └──────────────┘  └──────────────┘         │
│                                              │
│  ┌──────────────┐  ┌──────────────┐         │
│  │  🔮 MAGE     │  │  ⚕️ CLERIC   │         │
│  │              │  │              │         │
│  │  Backline    │  │  Support     │         │
│  │  Burst/AOE   │  │  Heal/Buff   │         │
│  │              │  │              │         │
│  │ +Spell Power │  │ +Healing     │         │
│  └──────────────┘  └──────────────┘         │
│                                              │
│  Selected: WARRIOR                           │
│  "Frontline combatants who excel at         │
│   absorbing damage and protecting allies."   │
│                                              │
│  Starting Abilities:                         │
│  - Shield Bash (stun)                        │
│  - Defensive Stance (+50% DEF)               │
│  - Rally Cry (party +ATK)                    │
│  - Provoke (force enemies to attack you)     │
│                                              │
│  [Confirm Class]                             │
└──────────────────────────────────────────────┘
```

**4 Classes**:

**Warrior** - Tank/Frontline:
- Base: +30 HP, +5 DEF
- Abilities: Shield Bash, Defensive Stance, Rally Cry, Provoke
- Playstyle: Protect allies, absorb damage

**Ranger** - DPS/Control:
- Base: +2 RNG, +10% accuracy
- Abilities: Piercing Shot, Snare Trap, Multi-Shot, Hunter's Mark
- Playstyle: Ranged DPS, crowd control

**Mage** - Burst/AOE:
- Base: +20% spell power, +1 spell range
- Abilities: Fireball, Ice Storm, Arcane Missile, Mana Shield
- Playstyle: High damage, AOE, fragile

**Cleric** - Support/Healer:
- Base: +15% healing, +10 DEF
- Abilities: Heal, Mass Heal, Bless, Resurrect
- Playstyle: Keep party alive, buff allies

**All classes unlock more abilities** as shards collected

---

## Ability Unlocking

### Progression Tree

**Each class has 12 abilities total**:
- 4 starter (given at class selection)
- 8 unlockable (1 per shard collected)

**Example: Warrior**:

```
Starter (4):
1. Shield Bash
2. Defensive Stance  
3. Rally Cry
4. Provoke

Shard Unlocks (8):
5. Cleave (Shard 1: Tactical Dominion)
6. Whirlwind (Shard 2: Arcane Mastery)
7. Berserker Rage (Shard 3: Primal Forces)
8. Iron Will (Shard 4: Creation/Destruction)
9. Shadow Strike (Shard 5: Hidden Truths)
10. Divine Protection (Shard 6: Blood and Light)
11. Time Reversal (Shard 7: Forbidden Knowledge)
12. Ultimate: Harmonic Fortress (Shard 8: Harmonic Resonance)
```

**Shard powers augment class abilities** - not replace them

---

## Character Persistence

### Database

```sql
CREATE TABLE player_character (
  save_id INTEGER PRIMARY KEY REFERENCES saves(id),
  species TEXT NOT NULL,
  class TEXT NOT NULL,
  name TEXT NOT NULL,
  appearance_json TEXT,  -- {color: 'brown', accessory: 'merchant_hat'}
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Load Character

**On game load**:
1. Read player_character table
2. Load species base stats
3. Apply class modifiers
4. Load equipment (from equipment table)
5. Load abilities (starter + unlocked from shards)
6. Calculate final stats
7. Spawn character model with appearance

---

## Visual Character Model

### Model Variations

**Per Species**:
- Male variant
- Female variant
- Elder variant (optional)

**Color Variations** (texture swaps):
- 4-6 colors per species
- Fur/feather/scale colors

**Accessories** (additional meshes):
- Hats, cloaks, scarves
- Faction-themed (if aligned)

**Total Assets Needed**:
- 12 species x 2 genders x 4 colors = 96 base models
- 12 species x 4 accessories = 48 accessory models
- Total: ~144 character creation assets

**Current Status**: Need to generate these

---

## Integration with Factions

### Faction Alignment

**Character starts neutral**:
- No faction alignment at creation
- Alignment happens through gameplay
- First major choice in Scenario 1

**Faction affects**:
- Available equipment (faction armorsmiths)
- Dialogue options (faction NPCs)
- Scenario variants (some scenarios change)
- Ending options (who helps you in finale)

**NOT locked**:
- Can switch factions (reputation penalty)
- Can be neutral (harder but possible)
- Can ally with unlikely factions (Dawnshield + Crimson Pact)

---

## Class Balance

### Stat Totals

**All classes same total** (but distributed differently):

```typescript
const CLASS_STATS = {
  warrior: { hp: 180, atk: 15, def: 20, spd: 8, rng: 1 },  // Total: 224
  ranger:  { hp: 120, atk: 18, def: 12, spd: 12, rng: 4 }, // Total: 224  
  mage:    { hp: 100, atk: 10, def: 8, spd: 10, rng: 6 },  // Total: 224
  cleric:  { hp: 140, atk: 12, def: 15, spd: 9, rng: 2 }   // Total: 224
};
```

**Balance Principle**: Different playstyles, same power level

### Role Distribution

**Party Composition** (for 3-unit party):

**Balanced**:
- Warrior (tank)
- Ranger (DPS)
- Cleric (healer)

**Aggressive**:
- Warrior (off-tank)
- Ranger (DPS)
- Mage (burst)

**Defensive**:
- Warrior (tank)
- Cleric (healer)
- Cleric (second healer)

**All viable** - no forced composition

---

## Tutorial Integration

### Tutorial Scenario

**Scenario 1 is class-agnostic**:
- Teaches universal mechanics
- Works for all 4 classes
- No class-specific abilities yet (just basic attack)

**Class selection AFTER** tutorial:
- Player knows how combat works
- Can make informed choice
- Not locked into unknowing decision

---

## Respec System

### Can You Change Class?

**Design Decision Needed**:

**Option A: No Respec** (Permanent choice)
- Pro: Meaningful decision
- Pro: Replay value (try other classes)
- Con: Player regret if wrong choice

**Option B: Limited Respec** (Once per playthrough)
- Pro: Forgiving for new players
- Con: Less meaningful

**Option C: Full Respec** (Anytime for fee)
- Pro: Player-friendly
- Con: Choice doesn't matter

**RECOMMENDATION**: **Option A (No Respec)** - Respect player choice

**Mitigation**: Tutorial is class-agnostic, so informed decision

---

## Pre-Made Characters

### Quick Start Option

**For players who don't want to customize**:

```
[Create Character] [Quick Start]

Quick Start Characters:
1. River (Otter Merchant - Balanced)
2. Shadow (Fox Assassin - Fast)
3. Iron (Human Warrior - Tank)
4. Sage (Owl Mage - Magic)

[Select] [Customize Instead]
```

**Pre-made have**:
- Default name
- Default appearance
- Balanced starting class
- Skip straight to tutorial

---

## Accessibility

### Character Creation Accessibility

**Visual**:
- Large preview models
- High contrast UI
- Text scaling support
- Screen reader descriptions

**Motor**:
- Keyboard navigation (Tab, Enter)
- Gamepad support (D-pad, A button)
- No time pressure
- Can back out and change

**Cognitive**:
- Clear tooltips
- Simple choices (12 species, 4 classes)
- Suggestions for confused players
- Undo/back buttons

---

## Database Schema

```sql
CREATE TABLE player_character (
  save_id INTEGER PRIMARY KEY REFERENCES saves(id),
  
  -- Identity
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  class TEXT NOT NULL,
  
  -- Appearance
  color_variant TEXT DEFAULT 'default',
  accessories_json TEXT,  -- ["merchant_hat", "cloak"]
  
  -- Creation
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Progression (computed from other tables)
  -- level, shards_collected, etc. in player_state table
);
```

---

## UI Components Needed

### Create Character Screen

**React Components**:

```typescript
// components/character-creation/
├── CharacterCreationFlow.tsx (main orchestrator)
├── SpeciesSelector.tsx (12 species grid)
├── AppearanceCustomizer.tsx (color + accessories)
├── NameInput.tsx (text input + suggestions)
├── ClassSelector.tsx (4 classes, post-tutorial)
└── CharacterPreview.tsx (3D model display)
```

### Integration

```typescript
// Flow:
<CharacterCreationFlow>
  <StoryboardIntro />  {/* Cutscene */}
  ↓
  <SpeciesSelector onChange={setSpecies} />
  ↓
  <AppearanceCustomizer species={species} onChange={setAppearance} />
  ↓
  <NameInput onChange={setName} />
  ↓
  <CharacterPreview species={species} appearance={appearance} name={name} />
  ↓
  <TutorialScenario character={character} />  {/* Scenario 1 */}
  ↓
  <ClassSelector character={character} onSelect={setClass} />
  ↓
  <StartAdventure />  {/* Begin Scenario 2 */}
</CharacterCreationFlow>
```

---

## Implementation Priority

### Must Have (v1.0)

1. ✅ Species selection (12 species)
2. ✅ Class selection (4 classes)
3. ✅ Name input
4. ✅ Basic appearance (color variants)
5. ✅ Database persistence
6. ✅ 3D model preview

### Nice to Have (v1.1)

7. ⏳ Accessories customization
8. ⏳ Quick start pre-made characters
9. ⏳ Randomize button
10. ⏳ Species lore tooltips

### Future (v2.0)

11. 🔮 More appearance options
12. 🔮 Voice selection (if voice acting)
13. 🔮 Background story choice
14. 🔮 Starting faction choice (skip neutral)

---

## Asset Requirements

**Character Models**:
- 12 species x 6 color variants = 72 base models
- 12 species x 4 accessories = 48 accessory models
- Total: 120 character creation assets

**UI Assets**:
- Species icons (12)
- Class icons (4)
- Preview background

**Current Status**: Need to generate these via Meshy

---

## See Also

- `../lore/taxonomy.md` - All 12 species detailed
- `../lore/01_FACTIONS.md` - Faction context
- `ability-progression.md` - How class abilities unlock
- `inventory-equipment.md` - Starting equipment
- `SYSTEMS_OVERVIEW.md` - Where character creation fits

---

**Remember**: First impression matters. Character creation should be smooth, clear, and exciting - not overwhelming.
