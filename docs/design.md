# Realm Walker Story Design

**Version**: 1.0 **FROZEN**  
**Date**: 2025-10-27  
**Status**: NORTH STAR DOCUMENT - All content must align to this specification

---

## Core Concept

Realm Walker Story is a **ScummVM-style 3D adventure game** combining **Monkey Island's point-and-click design** with **Chrono Trigger's visual presentation**. It uses modern GLB 3D models rendered in diorama viewports with Three.js.

---

## Game Type

### Authored Adventure Game

**What it IS**:
- Scripted chapters and scene-by-scene progression
- Flag-based narrative progression
- Strategic dialogue choices for combat and story advancement
- 18 chapters across 50,000 years of timeline
- Three interwoven story threads (A/B/C)

**What it is NOT**:
- ❌ Traditional RPG with numerical stats
- ❌ Procedural generation or random encounters
- ❌ Inventory management or grinding systems
- ❌ Open world exploration
- ❌ Real-time action combat
- ❌ Moral choice between good/evil (you're always the hero)

---

## Visual Style

### Diorama Presentation

**Camera & Framing**:
- **Isometric/diorama camera angles** for room overview
- **Pre-composed 3D room geometry** (floors, walls, ceiling)
- **Horizon line perspective tricks** for depth
- **Fixed camera positions** per scene (no free camera control)
- **Smooth transitions** between camera angles when changing scenes

**3D Assets**:
- **GLB models** for all props, NPCs, and furniture
- **Placed architecture** (pillars, doors, statues)
- **Interactive objects** (highlighted on hover)
- **High-quality 3D models** with attention to detail

**Lighting Setup**:
- **Ambient lighting** for overall mood
- **Directional lights** for sun/moon effects
- **Point lights** for torches, candles, magical effects
- **Atmospheric lighting** to create tension and mood

### Art Direction

**Visual Themes**:
- **Gothic fantasy aesthetic** with blood-red and crimson themes
- **Victorian architecture** mixed with supernatural elements
- **Atmospheric lighting** to create mood and tension
- **Sacred geometry** in ancient structures
- **Decay and ruin** in modern (post-twilight) scenes
- **Primordial beauty** in ancient era flashbacks

**Color Palette**:
- **Blood-red and crimson** (dominant themes)
- **Deep purples and blacks** (shadows, mystery)
- **Gold and amber** (sacred, divine)
- **Bone white and pale grey** (death, stone)
- **Deep forest greens** (nature, druids)

---

## Core Gameplay

### Point-and-Click Interaction

**Interaction System**:
- **Click detection** with radius checking for 3D objects
- **Hover highlights** on interactive objects
- **Interaction types**:
  - **Dialogue**: Talk to NPCs
  - **Examine**: Inspect objects for mythology echoes
  - **Use**: Interact with props (pull lever, open door)
  - **Portal**: Travel to adjacent scenes

**Flag-Based Gating**:
- All interactions check quest flags
- NPCs appear/disappear based on story state
- Doors lock/unlock based on progression
- Props activate only when relevant to current quest

### Story Progression

**Boolean Flag System** (NO numerical stats):
```typescript
// ✅ CORRECT - Boolean progression
questManager.setFlag('met_carmilla', true);
questManager.setFlag('stone_warden_unmade', true);
questManager.setFlag('chapter_1_complete', true);

// ❌ INCORRECT - No numerical stats
player.hp = 50;      // FORBIDDEN
player.xp += 100;    // FORBIDDEN
player.level = 5;    // FORBIDDEN
```

**Three Parallel Story Threads**:

| Thread | Name | Content | Progression |
|--------|------|---------|-------------|
| **A** | Guardian Boons | Main story, linear, 8 Guardian unmakings | REQUIRED |
| **B** | Faction Alliances | Time travel recruitment, 12 faction questlines | Soft Required |
| **C** | Raven Encounters | Pirate mysteries, random encounters, optional | Optional |

**Scene Access Gating**:
- Scenes unlock based on flag completion
- Required flags block access (show locked door)
- Optional flags provide alternate routes
- Time travel depth gated by boon count

**NPC Spawning**:
- NPCs spawn only when story flags active
- Example: Carmilla spawns if `chapter_1_active` = true
- NPCs despawn when quest complete
- Dynamic NPC placement based on progression

### Dialogue System

**Branching Conversation Trees**:
- **Choice-driven dialogues** with 2-4 options per node
- **Flag-gated dialogue options** (greyed out if requirements not met)
- **Consequences** from choices set/clear flags
- **No time limits** on choices (thoughtful decision-making)

**Dialogue Features**:
- **Character voice markers** (personality traits)
- **Auto-advance mode** for narration
- **Manual choice mode** for decisions
- **Dialogue history** (can review previous conversation)
- **Skip option** for repeated dialogues

**Personality Markers**:
```typescript
interface DialogueNode {
  speaker: string;
  text: string;
  personality: 'wise' | 'playful' | 'stern' | 'cryptic' | 'tragic';
  choices?: DialogueChoice[];
}
```

---

## Narrative Structure

### Chapter Organization

**Total Chapters**: 18

**Chapter Breakdown**:
- **Chapter 0**: Dead World Opening (Year 2100+) - Tutorial
- **Chapters 1-8**: Guardian Unmakings across time
- **Chapter 9**: Raven Corsairs (optional, no Guardian)
- **Chapters 10-12**: Final Guardian unmakings + Primordial revelation
- **Chapters 13-14**: Cult Leader confrontations
- **Chapters 15-16**: Final preparations and ally rallying
- **Chapters 17-18**: THE DESTROYER (final battle, apocalypse)

**Scene-by-Scene Progression**:
- Each chapter contains 3-8 scenes
- **Explicit scene transitions** (not emergent)
- **Flag-driven narrative** advancement
- **Linear A story**, branching B/C stories

### Story Threads

#### A Story: Guardian Boons (REQUIRED - Linear)

**The Core Quest**: Stop THE DESTROYER from consuming reality

**Progression**:
- 8 Guardians must be unmade (ritual sequences)
- Each unmaking grants a boon (power)
- Boons unlock deeper time travel
- All 8 required to reach final battle
- **Moral alignment**: GOOD (no evil path)

**Guardian Boons**:
1. **Stone Warden** (Chapter 1) - Earth, mountains, endurance
2. **Forest Ancient** (Chapter 2) - Nature, growth, extinction
3. **Silent Keeper** (Chapter 3) - Death, inevitability, void
4. **Stone Warden II** (Chapter 4) - Honor, duty, family
5. **Sun Warden** (Chapter 5) - Light, sacrifice, youth
6. **Twin Gods** (Chapter 6) - Judgment vs Mercy, balance
7. **Divine Smith** (Chapter 7) - Creation, consciousness, artifice
8. **Eternal Note** (Chapter 8) - Harmony, beauty, tragedy

**Emotional Weight**:
- Guardians have NO memory (part of their curse)
- Each unmaking is a moral sacrifice
- Player carries weight of necessary evil
- Guardians unknowingly fulfill hidden purpose
- Tragic but required for greater good

#### B Story: Faction Alliances (Soft Required - Time Travel)

**The Alliance Quest**: Recruit faction heroes across time

**Boon-Based Time Access**:
- **2 boons**: Medieval era (1200-1534)
- **4 boons**: Classical + Mythic (412-1047, -2000)
- **6 boons**: Ancient eras (-500)
- **8 boons**: Primordial era (-50,000) + deepest realms

**Mythology Echoes System**:
- Props throughout world contain "echoes"
- Reveal clues about other time periods
- Example: "This rune dates to Year -2000, Sanctum era"
- Guides player where to time travel
- Creates organic exploration loop

**Faction Progression**:
1. Help faction → recruit heroes
2. Complete trust quests → unlock leaders
3. Binary unlocks (they join or don't)
4. More allies = easier final battle

**Optional but Recommended**:
- Technically possible to rush to finale with minimal allies
- Would be HILARIOUSLY difficult
- Game supports it with "Speedrun Masochist" achievement
- Better ending requires full recruitment

#### C Story: Raven Encounters (Optional - Emergent)

**The Pirate Quest**: Uncover Compact betrayal, possibly recruit Raven ally

**Random Encounters**:
- Pirate encounters near coastlines after Chapter 1
- **Monkey Island dialogue combat** (battle of wits)
- Success = pirates leave, gain Raven knowledge
- Failure = forced physical combat

**Dialogue Combat** (Monkey Island tribute):
- Floating insult/response options
- AI judges response quality
- Pattern matching for witty comebacks
- Success builds toward C story completion

**By 2/3 Through Game**:
- Raven ally appears (if participating)
- Offers alliance questline
- If completed: Shows up for final battle
- Symbolically rejoins Creator (narrative closure)

**Without C Story**:
- Can still win final battle (just harder)
- Miss best ending cinematic
- Miss Compact reunification narrative

---

## World Building

### Gothic Fantasy Setting

**Visual Mood**:
- Victorian architecture
- Supernatural elements
- Blood-red color themes
- Atmospheric and eerie
- Sacred geometry in ancient sites

**The Eternal Twilight**:
- World formed from Destroyer's shattered prison
- Has ALWAYS been twilight (not recent event)
- No sun (cosmic irony - prison became world)
- Eternal dusk lighting
- Magic chaotic but stable

### The Primordial Mythology

**The Cosmic Battle** (Foundation lore):

For eons, two divine entities fought:
- **The Creator** - Could create but not destroy
- **The Destroyer** - Could unmake but not create

**The Cosmic Irony**:
- Creator imprisoned Destroyer in frozen time
- Destroyer gathered energy, shattered prison
- Prison fragments became 8 perfect shards
- **Destroyer CREATED** (the world from prison)
- **Creator DESTROYED** (the prison itself)
- The one who destroys... created
- The one who creates... destroyed

**The 8 Guardian Spirits**:
- Creator bound 8 divine spirits to guard shards
- **NO MEMORY** (to prevent bias over time)
- **ONE KNOWN PURPOSE**: Guard shards from ALL
- **ONE HIDDEN PURPOSE**: Become sacrifice to empower champion
- They have NO awareness of sacrifice purpose

**Guardian Manifestation**:
- Where shard landed, environment BECAME guardian
- World Tree grew around shard → Forest Ancient
- Mountain absorbed shard → Stone Warden IS mountain
- River flowed over shard → River Sage flows eternal

**The Divine Compact** (Eternal Witnesses):

Creator gave 3 animal races divine purpose:

1. **Otters** (River Sage's children) - Memory, diplomacy, trade
2. **Badgers** (Stone Warden's children) - Building, mining, endurance
3. **Foxes** (Mist Walker's children) - Scouting, truth, cunning

**Compact Rules**:
- ✅ Perfect memory of all history (50,000+ years)
- ✅ Speech and wisdom across languages
- ✅ Eternal neutrality bound by cosmic law
- ❌ CANNOT interfere in mortal affairs
- ❌ CANNOT aid until shards threatened
- ✅ ONLY when shards in play: Find champion

**Ultimate Burden**:
- Compact animals must choose when to sacrifice Guardians
- Only they know the hidden purpose
- Must unmake Guardian to empower champion
- This is why they seem unhelpful - carrying 50,000 years weight

**The Broken Compact** (Ravens):
- Ravens broke Compact millennia ago
- Now chaos pirates across all ages
- Raid indiscriminately
- Opposed by 3 faithful species
- Represent "what if we refuse destiny"

### The 12 Factions

#### Light Alignment (6 Factions)

**Philosophy**: "Restore order, heal reality, rebuild civilization"

1. **Dawnshield Order** - Lord Commander Aurelius the Undimmed
   - Shield caught sun fragment, granted immortal youth
   - Will die when sun restored, fights anyway
   - 104 years old, tragic hero

2. **Circle of Verdant Spirits** - Archdruid Thalindra Rootsong
   - 1,247 years old, merged with World Tree
   - 47 extinction events carved as scars
   - IS the Forest Ancient (Guardian)

3. **Ironbound Covenant** - General Thrain Ironhelm Stonefist
   - 267-year-old dwarf tactical genius
   - Every soldier adopted family
   - Defended Deepforge Gates for 40 days

4. **Radiant Collegium** - Archmagister Luminara Dawnweaver
   - 312-year-old archmage
   - Proved sun CAN be reassembled mathematically
   - Mathematical certainty as faith

5. **Veilwalkers** - Umbra Nightwhisper, the Veiled Hand
   - Was Destroyer's personal assassin
   - Turned traitor, hunts dark leaders
   - Redemption through assassination

6. **Sanctum of Sacred Invention** - Grand Architect Gearhart
   - 142-year-old master engineer
   - Building 'The Crucible' to re-smelt sun
   - Connected to Cogsworth (Divine Smith)

#### Dark Alignment (6 Factions)

**Philosophy**: "Adapt to twilight, gain power, reshape reality"

1. **Veilbound Synod** - High Oracle Seraph Nyarlathos
   - Discovered Destroyer was summoned
   - Read Codex of Unmaking, mind shattered
   - CULT LEADER trying to free Destroyer
   - NOT "The Sunderer" (that's legacy lore)

2. **Crimson Pact** - Countess Carmilla Sanguis
   - 847-year-old vampire
   - 40,000 happy thralls (disturbing ethics)
   - Former Dawnshield paladin, fell to pride

3. **Ashen Choir** - Maestro Mortis, the Final Symphony
   - World's greatest composer
   - Conducted entire city to death
   - Searching for murdered wife's voice

4. **Cult of the Eclipsed Flame** - Pyrophant Ignatius
   - Child survivor who walked into black flames
   - Emerged as living eclipse
   - Fire theology born from trauma

5. **Children of the Hollow** - Nullifier Cassandra Voidscar
   - Quantum physicist who touched sun fragment
   - Perceived 'true universe' as infinite nothing
   - Accidental cult founder

6. **Ossuary Praxis** - Grand Surgeon Morteus Bonewright
   - Replaced so much of himself questions identity
   - First successful resurrection surgery
   - Ship of Theseus made flesh

#### Neutral Factions (4)

**The 3 Faithful (Compact)**:
1. **Otters** (Dawnstream Conservators) - River traders
2. **Badgers** (Badger Guild) - Master builders
3. **Foxes** (Fox Clans) - Scouts and spies

**The 1 Broken**:
4. **Ravens** (Raven Corsairs) - Chaos pirates who rejected destiny

### Time Periods

Player visits 8 distinct eras across 50,000 years:

| Era | Years | Description |
|-----|-------|-------------|
| **Future** | 2100+ | Dead world, final convergence |
| **Contemporary** | 1968-2048 | Adapted world, 80 years post-twilight |
| **Modern** | 1899-1920 | Pre-twilight, void emergence |
| **Industrial** | 1801-1835 | Steam power, fire industry |
| **Renaissance** | 1680 | Classical arts peak |
| **Medieval** | 1200-1534 | Crusades, wizard academies |
| **Classical** | 412-1047 | Medieval kingdoms forming |
| **Ancient** | -500 | Primordial forests, megafauna |
| **Mythic** | -2000 | First civilizations |
| **Primordial** | -50,000 | Creation mythology |

---

## Gameplay Systems

### Combat System: General-Observer Style

**Player Role**: **General observing battlefield** (NOT individual combatant)

**Two Combat Modes**:

#### 1. Scripted Battles (A Story)

**Used For**:
- Cult leader confrontations (Chapters 13-14)
- THE DESTROYER final battle (Chapters 17-18)
- Major faction battles (optional B story)

**NOT Used For**:
- ❌ Guardian encounters (those are ritual sequences, see Guardian Unmaking System)

**Combat Flow**:
```
1. SETUP PHASE
   → Scene with faction armies positioned
   → Story flags determine who's present

2. OBSERVATION PHASE
   → Camera shows diorama battlefield view
   → AI controls ALL units (player faction + enemies)
   → NPCs use personas (faction leader traits)

3. CHOICE PHASE
   → Binary strategic choices float up
   → ("Charge center" / "Flank left")
   → ("Hold position" / "Advance")

4. EXECUTION PHASE
   → Player choice sets quest flags
   → NPCs read flags, execute tactics
   → Yuka steering behaviors move units
   → AI personas make decisions

5. RESULT EVALUATION
   → Check outcomes based on positioning + flags
   → Set victory/defeat flags

6. OUTCOME PHASE
   → Show battle results dialogue
   → Update quest state
   → Transition to next scene
```

**Persona System**:
- Each faction leader has AI personality
- Threat weights (protect weak, face strong, etc.)
- Formation tendencies (tight, loose, none)
- Aggression levels (0-1)
- Retreat thresholds

**Example Persona**:
```typescript
const aureliusPersona = {
  id: 'dawnshield_commander',
  threatWeights: {
    lowestHealth: 0.3,      // Protects weak
    highestThreat: 0.5,     // Faces strong
    nearestEnemy: 0.1,
    supportAlly: 0.1
  },
  formationTendency: 'tight',
  aggressionLevel: 0.7,     // Aggressive but not reckless
  retreatThreshold: 0.2     // Retreats at 20% health
};
```

**Strategic Choices** (binary, flag-based):
```typescript
const battleChoices = [
  {
    text: "Charge the enemy center directly",
    setFlags: {
      strategy_charge_center: true,
      hero_positioned_offensive: true
    }
  },
  {
    text: "Coordinate flanking with Ottermere",
    setFlags: {
      strategy_flank_coordinated: true,
      hero_requests_coordination: true
    },
    requiredFlags: ['elder_ottermere_present']
  }
];
```

#### 2. Dialogue Combat (C Story - Monkey Island Tribute)

**Used For**:
- Raven pirate encounters (random, optional)
- When fighting pirates alone (no allies)
- Builds toward C story completion

**Dialogue Combat Flow**:
```
1. Pirate challenges player
2. Floating insult options appear
3. Player chooses response
4. AI judges witty comeback quality
5. Success = pirate leaves, gain knowledge
6. Failure = forced physical combat anyway
```

**Insult/Response Matching**:
- Pattern matching for clever comebacks
- Context-aware response validation
- Multiple correct responses possible
- Builds Raven reputation

### Guardian Unmaking System

**CRITICAL**: Guardian Unmakings are NOT combat

**They Are**:
- Ritual sequences (cutscenes with choices)
- Moral choice moments
- Narrative weight and emotional impact
- Dialogue-driven decision points

**They Are NOT**:
- Yuka AI combat sequences
- Strategic battles
- Physical confrontations
- Just cutscenes (player makes choices)

**Unmaking Flow**:
```
1. APPROACH PHASE
   → Guardian appears in environment
   → Compact animal explains necessity
   → Player learns Guardian's nature

2. REVELATION PHASE
   → Guardian's story revealed
   → Why they exist, what they guard
   → Their unknowing sacrifice purpose

3. CHOICE PHASE
   → Moral decision dialogue
   → ("I understand" / "This feels wrong")
   → ("I accept this burden" / "Seek another way")
   → NO evil choice (all lead to unmaking)

4. RITUAL PHASE
   → Cutscene sequence
   → Guardian's essence absorbed
   → Boon granted

5. AFTERMATH
   → Player carries emotional weight
   → Quest flag updated
   → Time travel depth increased
```

**Emotional Pacing**:
- Each unmaking more emotionally heavy
- Guardians increasingly sympathetic
- Player feels weight of necessary sacrifice
- No "good" choice, only "necessary" choice

### Progression System

**NO Leveling / NO XP / NO Stats**

**Only**:
- Guardian Boons (8 total)
- Quest Flags (boolean only)
- Faction Alliances (binary: joined or not)

**Boon System**:
```typescript
interface Boon {
  id: string;
  name: string;
  description: string;
  source: string; // Which Guardian
  timeDepthUnlocked: number; // How far back player can travel
}
```

**Visual Progression**:
- Shard count: 0/8 → 8/8
- Time depth meter (how far back you can travel)
- Faction roster (allied factions displayed)
- Quest log (A/B/C threads tracked)

---

## Success Metrics

### Technical Success
- **Zero TypeScript errors** in production build
- **100% test coverage** for core systems
- **Smooth performance** on target devices (60fps)
- **Clean architecture** with no cross-layer dependencies

### Gameplay Success
- **Engaging narrative** that keeps players interested
- **Intuitive controls** that feel natural
- **Satisfying progression** through quest completion
- **Replay value** through multiple story threads

### Development Success
- **Maintainable codebase** that's easy to extend
- **Clear documentation** that enables team collaboration
- **Efficient development** workflow with good tooling
- **Scalable architecture** for future content additions

---

## Endings (Based on Completion)

**All endings are "good" morally - you always try to save the world. Differences are based on HOW MUCH you accomplished.**

### Minimal Ending: Apocalypse Survived

**Requirements**:
- Complete A story only
- Rush through with minimal allies
- Very hard difficulty final battle

**Cinematic**:
- You barely defeat Destroyer alone
- World survives but broken
- Most factions dead or scattered
- "I saved reality... but at what cost?"

**Achievement**: "Speedrun Masochist"

### Standard Ending: Convergence

**Requirements**:
- Complete A story + most B story
- Recruited faction heroes and leaders
- Normal difficulty final battle

**Cinematic**:
- All recruited allies fight alongside
- Faction leaders use ultimate abilities
- Destroyer defeated with combined strength
- World rebuilds with faction cooperation
- "Together, we saved everything."

**Achievement**: "The Convergence"

### Best Ending: Compact Restored

**Requirements**:
- Complete A story + full B story + C story
- ALL faction allies recruited
- Raven ally joins final battle

**Cinematic**:
- All allies + Raven fight together
- Raven symbolically rejoins Compact
- Compact's ancient wound heals
- Creator/Destroyer duality balanced
- World transforms into twilight paradise
- "The Compact endures. Betrayal forgiven."

**Achievement**: "The Compact Restored"

### Secret Ending: Time Loop

**Requirements**:
- Complete Best Ending
- Find hidden clue in primordial era
- Discover YOU are next cycle

**Cinematic**:
- After defeating Destroyer, cycle continues
- You become new cosmic force
- Time loops back to primordial era
- "And so it begins again..."
- New Game+ unlocked

**Achievement**: "The Eternal Cycle"

---

## Design Principles

1. **Separation of Concerns**: Each system has one clear responsibility
2. **Type Safety**: Strict TypeScript typing throughout with no `any` types
3. **Boolean Logic**: All progression is flag-based with no numerical stats
4. **Authored Content**: Everything scripted, no procedural generation at runtime
5. **Clean Interfaces**: Minimal surface area between systems with clear contracts
6. **Performance First**: Optimize for smooth gameplay and fast loading times
7. **Documentation Driven**: Documentation is the source of truth for all decisions
8. **Test Coverage**: Comprehensive testing ensures reliability and maintainability

---

## Critical Rules for Content Creation

1. **THE DESTROYER is final enemy** - NOT Seraph
2. **Seraph is a cult leader** - One of 6 dark leaders, NOT "The Sunderer"
3. **World formed from prison shards** - NOT recent sun explosion
4. **Guardians have hidden sacrifice purpose** - They don't know
5. **Compact carries 50,000 years burden** - Why they seem unhelpful
6. **Ravens broke Compact** - Chaos pirates, not evil but rejected destiny
7. **Time spans 50,000 years** - NOT just 80 years
8. **18 chapters, A story linear** - B/C stories emergent through clues
9. **Two combat styles** - Scripted battles + Monkey Island dialogue combat
10. **Guardian Unmakings ≠ Combat** - Ritual sequences vs battles
11. **Story-first design** - Systems serve narrative
12. **Single moral path (good)** - Endings based on completion, not alignment
13. **Mythology echoes are clues** - Guide B story time travel
14. **Boon strength unlocks time depth** - More boons = deeper eras
15. **C story is optional** - But provides best narrative closure

---

## Related Documents

- `architecture.md` - Technical architecture and system specifications
- `CANONICAL_STORY_BIBLE.md` - Complete lore bible (reference only)

---

**Status**: FROZEN v1.0  
**Last Updated**: 2025-10-27  
**Authority**: NORTH STAR DOCUMENT - All content must align to this specification
