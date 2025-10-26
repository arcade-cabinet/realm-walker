/**
 * LoreLoader - Loads canonical world lore documentation
 * Single source of truth for all content generation workflows
 */

import * as fs from 'fs';
import * as path from 'path';

export interface CanonicalLore {
  storyBible: string;
  agesAndFactions: string;
  guardianSystem: string;
  creationMythology: string;
  mythologyEchoSystem: string;
  names: string;
  gameVision: string;
  
  // Compiled summaries for AI prompts
  worldSummary: string;
  threadDescriptions: {
    A: string;
    B: string;
    C: string;
  };
}

export class LoreLoader {
  private static DOCS_PATH = path.join(process.cwd(), 'docs', 'design');
  
  /**
   * Load all canonical lore documents
   */
  static loadCanonicalLore(): CanonicalLore {
    try {
      // Load all canonical documents
      const storyBible = this.loadDoc('CANONICAL_STORY_BIBLE.md');
      const agesAndFactions = this.loadDoc('AGES_AND_FACTIONS_COMPLETE.md');
      const guardianSystem = this.loadDoc('GUARDIAN_UNMAKING_SYSTEM.md');
      const creationMythology = this.loadDoc('creation_mythology.md');
      const mythologyEchoSystem = this.loadDoc('mythology_echo_system.md');
      const names = this.loadDoc('names.md');
      const gameVision = this.loadDoc('game-vision.md');

      // Compile world summary
      const worldSummary = this.compileWorldSummary({
        storyBible,
        agesAndFactions,
        guardianSystem,
        creationMythology
      });

      // Extract thread descriptions
      const threadDescriptions = this.extractThreadDescriptions(storyBible, agesAndFactions);

      return {
        storyBible,
        agesAndFactions,
        guardianSystem,
        creationMythology,
        mythologyEchoSystem,
        names,
        gameVision,
        worldSummary,
        threadDescriptions
      };
    } catch (error) {
      console.error('Failed to load canonical lore:', error);
      throw new Error('Cannot generate content without canonical lore documentation');
    }
  }

  /**
   * Load a specific lore document
   */
  private static loadDoc(filename: string): string {
    const filepath = path.join(this.DOCS_PATH, filename);
    
    if (!fs.existsSync(filepath)) {
      throw new Error(`Canonical lore document not found: ${filepath}`);
    }

    const content = fs.readFileSync(filepath, 'utf-8');
    console.log(`Loaded ${filename}: ${content.length} characters`);
    return content;
  }

  /**
   * Compile comprehensive world summary for AI prompts
   */
  private static compileWorldSummary(docs: {
    storyBible: string;
    agesAndFactions: string;
    guardianSystem: string;
    creationMythology: string;
  }): string {
    return `# REALM WALKER - CANONICAL WORLD LORE

## THE PRIMORDIAL MYTHOLOGY (Foundation)

For eons, two divine entities fought:
- **The Creator** - Could create but not destroy
- **The Destroyer** - Could unmake but not create

**The Stalemate**: Neither could win. The Creator imprisoned the Destroyer in a prison of frozen time.

**The Cosmic Irony**: Eons passed. The Destroyer gathered energy and shattered the prison. The 8 prison fragments became perfect glowing shards - THE GUARDIANS.

**The Trap**: Each Guardian contains part of the Destroyer's prison essence. If all 8 are destroyed ("unmaking"), the Destroyer fully awakens and reality ends.

## THE THREE STORY THREADS

**A STORY (Guardian Powers)**: 
- Player must collect Guardian boons (0-8 progression)
- Each boon unlocks time travel to past ages (B Story)
- Guardians appear as animals with glowing eyes
- Goal: Collect all 8 boons WITHOUT unmaking Guardians
- If unmade: Cult wins, Destroyer awakens, world ends

**B STORY (Time Travel & Factions)**:
- Unlocked by collecting Guardian boons in A Story
- Travel through 7 Ages spanning 50,000+ years
- Witness rise and fall of civilizations
- 6 Cults across history trying to "unmake" Guardians
- 6 Order factions trying to protect world
- Each age has distinct visual theme and dominant factions

**C STORY (Ravens - The Mystery)**:
- Mysterious recurring antagonists
- Connected to shadow lore and forgotten history
- Recurring encounters throughout game
- Reveals deeper mysteries about the world

## THE 7 AGES (Boon-Gated Progression)

0 Boons: **Age of Sundering (Present)** - Dead world, frozen apocalypse, 90% extinction
1 Boon: Geographic travel only (present age)
2 Boons: **Age of Invention** - Human-gnome alliance, last magic fades
3 Boons: **Age of Kings (Late)** - Holy crusades, zealous humanity
4 Boons: **Age of Kings (Early)** - Human rise, magical creature conflict
5 Boons: **Age of Stone (Late)** - Dwarven supremacy, early humans
6 Boons: **Age of Stone (Early)** - Elven-dwarven alliance, forests dying
7 Boons: **Age of Song** - Continent-spanning forests, elves at peak
8 Boons: **Age of Gods** - Primordial creation, Creator vs Destroyer

## THE 6 CULTS (Antagonists)

1. **Children of Hollow** - First cult, primordial age, worship the void
2. **Veilbound Synod** - Secretive shadow manipulators
3. **Eclipsed Flame (Pyrophant)** - Fire cultists, destructive purification
4. **Maestro Mortis** - Death obsessed, necromancy
5. **Ossuary Praxis** - Bone collectors, dark rituals
6. **Crimson Pact** - Blood magic, reached peak in Age of Invention

All cults succeeded in the present - Destroyer is awakening.

## THE 6 ORDER FACTIONS (Protectors)

1. **Circle of Verdant Spirits** - Ancient druids, nature guardians
2. **Radiant Collegium** - Elven magical scholars
3. **Ironbound Covenant** - Dwarven defenders
4. **Dawnshield Order** - Human holy warriors
5. **Sanctum of Sacred Invention** - Human-gnome alliance, science + magic
6. **Sanctum Remnants (Present)** - ~200 survivors in frozen wasteland

## BOOLEAN FLAG QUEST SYSTEM

- NO numerical stats, levels, or XP
- Everything is boolean flags (true/false)
- NO inventory arrays - items are flags
- Quest progression only
- Three parallel story thread progressions (A/B/C)

## DESIGN PILLARS

- **Pure Authored Content**: No procedural generation, everything scripted
- **Quest-Driven Narrative**: Story progression through flags only
- **Three-Tier Compositor**: Strict layer separation (Scene/Story/Game)
- **Time Travel Mechanics**: Boon-gated access to past ages
- **Mythological Foundation**: Creator vs Destroyer cosmic battle

---

This is CANONICAL and must be respected in all content generation.`;
  }

  /**
   * Extract detailed thread descriptions from lore
   */
  private static extractThreadDescriptions(storyBible: string, agesAndFactions: string): {
    A: string;
    B: string;
    C: string;
  } {
    return {
      A: `**A STORY - GUARDIAN POWERS (Main Progression)**

You are a lone survivor in a frozen, dead world. 90% of all life is extinct. The sun is dim and distant. You discover you can collect "boons" from mystical Guardians - ancient animals with glowing eyes.

**Mechanics:**
- 8 Guardians total, each grants a boon when approached
- Boons unlock time travel abilities (B Story access)
- Guardians are fragments of the Destroyer's time prison
- WARNING: "Unmaking" a Guardian releases Destroyer energy
- Goal: Collect all 8 boons WITHOUT unmaking any Guardian

**Guardian Examples:**
- Ottermere the Otter (playful, riverbank home)
- Badger Elder (wise, ancient burrow)
- Fox Trickster (clever, forest den)
- Plus 5 more undiscovered Guardians

**Progression:**
- 0 boons: Stuck in present (Age of Sundering)
- 1+ boons: Can time travel to past ages
- 8 boons: Can reach Age of Gods (primordial creation)

**Stakes:**
If you unmake Guardians, the 6 Cults win and the Destroyer awakens. Reality ends.`,

      B: `**B STORY - TIME TRAVEL & FACTION POLITICS (World History)**

Unlocked by collecting Guardian boons in A Story. Travel through 7 Ages spanning 50,000+ years of history. Witness the rise and fall of civilizations, meet faction leaders, and understand how the world fell.

**The 7 Ages (Reverse Chronological):**

1. **Age of Sundering** (Present, Year 2100+) - Dead world, 90% extinct, frozen apocalypse
2. **Age of Invention** (1800-2100) - Human-gnome alliance, steampunk + fading magic, Crimson Pact at peak
3. **Age of Kings Late** (1200-1800) - Holy crusades, Dawnshield Order rising, zealous humanity
4. **Age of Kings Early** (500-1200) - Human expansion, conflict with magical creatures
5. **Age of Stone Late** (Year 0-500) - Dwarven supremacy, Ironbound Covenant, early humans emerging
6. **Age of Stone Early** (-5000 to 0) - Elven-dwarven alliance, forests dying, Radiant Collegium
7. **Age of Song** (-20000 to -5000) - Elven golden age, continent-spanning forests, Circle of Verdant Spirits
8. **Age of Gods** (-50000) - Primordial creation, Creator vs Destroyer cosmic battle

**The 6 Order Factions (Protectors):**
- Circle of Verdant Spirits (druids, nature guardians)
- Radiant Collegium (elven scholars)
- Ironbound Covenant (dwarven defenders)
- Dawnshield Order (human holy warriors)
- Sanctum of Sacred Invention (human-gnome scientists)
- Sanctum Remnants (present survivors)

**The 6 Cults (Antagonists):**
- Children of Hollow (void worshippers, primordial)
- Veilbound Synod (shadow manipulators)
- Eclipsed Flame/Pyrophant (fire purification)
- Maestro Mortis (necromancy, death obsessed)
- Ossuary Praxis (bone rituals)
- Crimson Pact (blood magic, peaked in Age of Invention)

**B Story Theme:** Political intrigue, faction relationships, witness history, understand the fall`,

      C: `**C STORY - THE RAVENS (Shadow Mystery)**

A mysterious recurring antagonist appears throughout your journey. The Ravens are not what they seem. Connected to forgotten history and shadow lore.

**Key Elements:**
- Recurring encounters across different ages
- Shadow manipulation and dark magic
- Connected to deeper mysteries about the world's creation
- May hold keys to understanding the Creator/Destroyer conflict
- NOT straightforward antagonists - complex motivations

**Mystery Focus:**
- Who are the Ravens really?
- What is their connection to the primordial mythology?
- Why do they appear across time periods?
- What do they know that others don't?

**Encounters:**
- Cryptic messages and warnings
- Tests of character and resolve
- Revelations about hidden history
- Choices that affect understanding of the world

**C Story Theme:** Mystery, revelation, hidden truths, moral complexity`
    };
  }

  /**
   * Get compact lore summary for token-constrained prompts
   */
  static getCompactSummary(lore: CanonicalLore): string {
    return `WORLD: Creator imprisoned Destroyer in time prison. Prison shattered into 8 Guardian shards. If all unmaking = Destroyer awakens = reality ends. Player collects Guardian boons (0-8) to unlock time travel through 7 Ages (50,000 years). 6 Cults try to unmake Guardians. 6 Order factions protect world. Present age = 90% extinct, frozen apocalypse. Boolean flag quests only, no stats/levels/XP. Three story threads: A=Guardian collection, B=Time travel/factions, C=Ravens mystery.`;
  }
}
