# Combat & Guardian Systems Architecture

**Version**: 2.0  
**Date**: 2025-10-27  
**Status**: DESIGN - Awaiting Approval

---

## Critical Distinction

**There are TWO completely different systems:**

1. **Guardian Unmakings** - Ritual sacrifice sequences (cutscenes with moral choices)
2. **Combat Battles** - Strategic warfare with Yuka AI execution

**DO NOT CONFUSE THESE.** They use different systems entirely.

---

## Part 1: Guardian Unmakings (Ritual Sequences)

### What Guardian Encounters Actually Are

**NOT**: Boss battles  
**IS**: Tragic ritual sacrifice sequences

From `GUARDIAN_UNMAKING_SYSTEM.md`:

> Guardians don't "fight" you. Guardians don't "grant" boons willingly. Guardians are UNWAKING (no dialogue, no consciousness). You UNMAKE them (sacrifice) to absorb their power. This is TRAGIC, not triumphant.

### Guardian Unmaking Flow

```
1. Arrival (exploration scene)
   ↓
   Navigate Guardian's realm
   Environmental storytelling
   Find clues about Guardian's nature
   
2. Discovery (cutscene + dialogue)
   ↓
   Realize what the Guardian actually is
   Compact guide explains necessity
   Player grapples with moral weight
   
3. Preparation (optional mini-quest)
   ↓
   Gather ritual components
   Learn Unmaking technique
   Last chance to reflect
   
4. The Unmaking (interactive cutscene)
   ↓
   Approach Guardian's core (shard location)
   Guardian manifests (in confusion, not hostility)
   Perform ritual (series of prompted actions)
   Guardian dissolves/transforms
   
5. Absorption (cutscene)
   ↓
   Player absorbs shard essence
   Boon manifests
   Visual transformation
   Unlocks new Realm Walking depth
   
6. Reflection (dialogue/examination)
   ↓
   Stand in ruins of what was
   Compact guide acknowledges weight
   Story flag set for progression
```

**NO COMBAT**. Just narrative sequence with exploration, puzzle, and moral weight.

### Systems Needed

```typescript
class GuardianUnmakingManager {
  private currentPhase: UnmakingPhase;
  private questManager: QuestManager;
  private dialogueManager: DialogueManager;
  
  async startUnmakingSequence(guardian: GuardianDefinition): Promise<void> {
    // 1. Play arrival cutscene
    await this.playArrivalCutscene(guardian);
    
    // 2. Enable exploration (player can examine environment)
    await this.enableExploration(guardian.realmId);
    
    // 3. Trigger discovery dialogue when ready
    await this.showDiscoveryDialogue(guardian);
    
    // 4. Optional preparation quest
    if (guardian.hasPreparationQuest) {
      await this.startPreparationQuest(guardian);
    }
    
    // 5. Ritual sequence (interactive cutscene)
    await this.performRitual(guardian);
    
    // 6. Absorption and boon grant
    await this.absorbGuardianEssence(guardian);
    
    // 7. Reflection moment
    await this.reflectionDialogue(guardian);
    
    // 8. Set completion flags
    this.questManager.setFlag(`${guardian.id}_unmade`, true);
    this.questManager.setFlag(`boon_${guardian.boonId}_obtained`, true);
  }
  
  private async performRitual(guardian: GuardianDefinition): Promise<void> {
    // Present moral choice
    const choice = await this.dialogueManager.presentChoice({
      text: "The Guardian awaits. What will you do?",
      choices: [
        {
          text: "Perform the Unmaking",
          action: () => this.executeUnmaking(guardian)
        },
        {
          text: "Seek another way",
          action: () => this.seekAlternative(guardian)
        }
      ]
    });
    
    // No alternative exists
    if (choice === 'alternative') {
      await this.showNoAlternativeDialogue();
      return this.performRitual(guardian); // Loop back
    }
    
    // Execute the tragic sequence
    await this.showUnmakingCutscene(guardian);
  }
}
```

**Integration Points**:
- QuestManager (flags)
- DialogueManager (moral choices)
- CutsceneManager (ritual sequences)
- BoonSystem (power grants)
- SceneTransitionManager (realm navigation)

---

## Part 2: Combat System (Strategic Warfare)

### Player Role: General Observer

**You are a GENERAL observing the battlefield**, NOT an individual combatant.

**Combat Flow**:
```
1. SETUP PHASE
   ↓
   Scene with faction armies positioned
   Story flags determine who's present
   Camera shows diorama battlefield view
   
2. OBSERVATION PHASE
   ↓
   Yuka AI controls ALL units (your faction + enemies)
   NPCs use personas (faction leader behavioral traits)
   Watch units move and engage automatically
   
3. CHOICE PHASE (BINARY DECISIONS)
   ↓
   Strategic choices float up to player
   "Charge the center" OR "Flank left"
   "Hold position" OR "Advance"
   "Coordinate with ally" OR "Solo assault"
   
4. EXECUTION PHASE
   ↓
   Player choice sets quest flags
   NPCController.updateBehavior() reads flags
   Yuka steering behaviors execute tactics
   Units move/attack via AI personas
   
5. RESULT EVALUATION
   ↓
   Check outcomes based on positioning + flags
   Boolean results: victory/defeat, survived/died
   No HP/damage numbers, just outcomes
   
6. OUTCOME PHASE
   ↓
   Show battle results dialogue
   Update quest state
   Potentially recruit defeated faction leader
   Transition to next scene
```

### Combat Types

**1. Faction Battles** (B Story - optional):
- Recruit faction heroes through time travel
- Join their armies in historical conflicts
- Strategic choices affect recruitment success

**2. Cult Leader Confrontations** (Chapters 13-14):
- Face 6 dark faction leaders
- Try to prevent Destroyer's release
- You FAIL - Destroyer awakens anyway

**3. THE DESTROYER Final Battle** (Chapters 17-18):
- Celestial realm, reality-warping
- You + ALL recruited allies vs THE DESTROYER
- Difficulty scales based on who you brought
- Uses same strategic choice system

### Persona System

NPCs have **behavioral personas** that determine their tactics:

```typescript
interface FactionPersona {
  id: string;
  name: string;
  
  // Threat evaluation weights (how AI picks targets)
  threatWeights: {
    lowestHealth: number;      // Protects weak allies
    highestThreat: number;      // Faces strongest enemy
    nearestEnemy: number;       // Attacks closest
    supportAlly: number;        // Stays near friendlies
  };
  
  // Movement preferences
  formationTendency: 'tight' | 'loose' | 'none';
  aggressionLevel: number;     // 0-1 (defensive to aggressive)
  retreatThreshold: number;    // 0-1 health (when to flee)
  
  // Special behaviors
  abilityPreferences: string[]; // Preferred abilities
  positioningStyle: 'frontline' | 'backline' | 'skirmisher';
}

// Example: Aurelius (Dawnshield commander)
const aureliusPersona: FactionPersona = {
  id: 'aurelius_persona',
  name: 'Dawnshield Commander',
  
  threatWeights: {
    lowestHealth: 0.3,  // Protects wounded
    highestThreat: 0.5, // Challenges strong foes
    nearestEnemy: 0.1,
    supportAlly: 0.1
  },
  
  formationTendency: 'tight',  // Maintains formation
  aggressionLevel: 0.7,         // Aggressive but not reckless
  retreatThreshold: 0.2,        // Retreats at 20% health
  
  abilityPreferences: ['shield_bash', 'rally_troops', 'divine_ward'],
  positioningStyle: 'frontline'
};
```

### Strategic Choices

**Binary decisions that set quest flags:**

```typescript
interface StrategyChoice {
  text: string;                           // Choice text
  setFlags: Record<string, boolean>;      // Flags set when chosen
  requiredFlags?: string[];               // Can only choose if have these
  description?: string;                   // Tactical explanation
}

// Example battle choices
const stoneWardenBattleChoices: StrategyChoice[] = [
  {
    text: "Charge directly at the Stone Warden",
    description: "Bold frontal assault. High risk, high reward.",
    setFlags: {
      strategy_charge: true,
      player_faction_aggressive: true,
      formation_broken: true
    }
  },
  {
    text: "Coordinate a flanking maneuver with Elder Ottermere",
    description: "Divide enemy attention. Requires coordination.",
    requiredFlags: ['elder_ottermere_present', 'trust_level_high'],
    setFlags: {
      strategy_flank_coordinated: true,
      ottermere_distracts: true,
      player_faction_flanking: true
    }
  },
  {
    text: "Hold defensive formation and wear it down",
    description: "Patient attrition. Safer but slower.",
    setFlags: {
      strategy_defensive: true,
      player_faction_defensive: true,
      formation_tight: true
    }
  }
];
```

### Combat Systems Architecture

```typescript
class CombatOrchestrator {
  private npcManager: NPCManager;
  private questManager: QuestManager;
  private phase: CombatPhase;
  private participants: CombatParticipant[];
  
  /**
   * Setup battlefield from story binding
   */
  setupBattle(combat: CombatDefinition): void {
    // Spawn faction units from story bindings
    for (const faction of combat.factions) {
      this.spawnFactionArmy(faction);
    }
    
    // Position armies based on formation
    this.positionArmies(combat.formations);
    
    // Initialize Yuka steering behaviors with personas
    for (const unit of this.participants) {
      this.initializeUnitAI(unit, unit.persona);
    }
    
    // Set camera to diorama view
    this.setupBattlefieldCamera(combat.cameraPosition);
    
    this.phase = 'observation';
  }
  
  /**
   * Present strategic choice to player
   */
  async presentStrategicChoice(choices: StrategyChoice[]): Promise<void> {
    this.phase = 'choice';
    
    // Filter choices by required flags
    const availableChoices = choices.filter(choice => 
      this.questManager.hasFlags(choice.requiredFlags)
    );
    
    // Show UI with choices
    const selected = await this.ui.showStrategicChoices(availableChoices);
    
    // Apply flag changes
    for (const [flag, value] of Object.entries(selected.setFlags)) {
      this.questManager.setFlag(flag, value);
    }
    
    this.phase = 'execution';
  }
  
  /**
   * Execute tactics based on flags
   */
  update(delta: number): void {
    if (this.phase !== 'execution') return;
    
    const flags = this.questManager.getState().storyFlags;
    
    // Update all NPC behaviors based on strategy flags
    for (const unit of this.participants) {
      this.updateUnitTactics(unit, flags);
    }
    
    // Yuka AI handles actual movement/combat
    this.npcManager.update(delta, this.questManager.getState());
    
    // Check for battle conclusion
    if (this.isBattleOver()) {
      this.phase = 'evaluation';
      this.evaluateOutcome();
    }
  }
  
  /**
   * Update unit tactics based on strategy flags
   */
  private updateUnitTactics(unit: CombatParticipant, flags: Record<string, boolean>): void {
    const controller = unit.npcController;
    
    // Read strategy flags and adjust behavior
    if (flags.strategy_charge) {
      controller.setBehavior({
        type: 'seek',
        target: this.findEnemyPosition()
      });
    } else if (flags.strategy_flank_coordinated) {
      if (unit.faction === 'player') {
        controller.setBehavior({
          type: 'seek',
          target: this.calculateFlankPosition('left')
        });
      } else if (unit.id === 'elder_ottermere' && flags.ottermere_distracts) {
        controller.setBehavior({
          type: 'seek',
          target: this.findEnemyCenter()
        });
      }
    } else if (flags.strategy_defensive) {
      controller.setBehavior({
        type: 'defend',
        formationTight: true
      });
    }
    
    // Persona modulates behavior
    this.applyPersonaModulation(controller, unit.persona);
  }
  
  /**
   * Evaluate combat outcome (boolean logic only)
   */
  private evaluateOutcome(): CombatResult {
    const flags = this.questManager.getState().storyFlags;
    
    // Count survivors (boolean: alive or dead)
    const playerUnitsAlive = this.participants.filter(u => 
      u.faction === 'player' && u.isAlive
    ).length;
    
    const enemyUnitsAlive = this.participants.filter(u => 
      u.faction === 'enemy' && u.isAlive
    ).length;
    
    // Determine victory based on flags + survivors
    let victory = false;
    
    if (flags.strategy_flank_coordinated && flags.ottermere_distracts) {
      // Coordinated strategy: check positioning
      victory = this.checkFlankSuccess() && playerUnitsAlive > 0;
    } else if (flags.strategy_charge) {
      // Charge: risky, need overwhelming force
      victory = playerUnitsAlive > enemyUnitsAlive * 1.5;
    } else if (flags.strategy_defensive) {
      // Defense: need to survive
      victory = playerUnitsAlive >= enemyUnitsAlive;
    }
    
    // Set outcome flags
    this.questManager.setFlag('battle_victory', victory);
    this.questManager.setFlag('battle_defeat', !victory);
    
    // Set survivor flags (for narrative consequences)
    for (const unit of this.participants) {
      this.questManager.setFlag(`${unit.id}_survived`, unit.isAlive);
    }
    
    return {
      victory,
      survivorCount: playerUnitsAlive,
      casualties: this.participants.filter(u => !u.isAlive)
    };
  }
}
```

### Strategic Choice UI

```typescript
class StrategicChoiceUI {
  /**
   * Float choices above battlefield
   */
  showStrategicChoices(choices: StrategyChoice[]): Promise<StrategyChoice> {
    // Create floating choice bubbles
    const bubbles = choices.map(choice => 
      this.createChoiceBubble(choice)
    );
    
    // Position above battlefield center
    const battlefieldCenter = this.getBattlefieldCenter();
    this.positionChoices(bubbles, battlefieldCenter);
    
    // Wait for player selection
    return new Promise(resolve => {
      bubbles.forEach(bubble => {
        bubble.onClick(() => {
          this.hideAllChoices();
          resolve(bubble.choice);
        });
      });
    });
  }
  
  private createChoiceBubble(choice: StrategyChoice): ChoiceBubble {
    // Create 3D floating dialogue bubble
    const bubble = new THREE.Group();
    
    // Add text
    const text = this.createText(choice.text);
    bubble.add(text);
    
    // Add description tooltip
    if (choice.description) {
      const tooltip = this.createTooltip(choice.description);
      bubble.add(tooltip);
    }
    
    // Make interactive
    this.makeInteractive(bubble, choice);
    
    return { bubble, choice };
  }
}
```

---

## Part 3: Monkey Island Dialogue Combat (Ravens Only)

### When Used

**ONLY for Raven pirate encounters** (C Story, optional).

When fighting pirates **alone** (no allies available), battle becomes **dialogue combat** (Monkey Island insult sword-fighting tribute).

### Dialogue Combat Flow

```
1. Pirate Encounter
   ↓
   Raven pirate blocks your path
   Challenges you to "wit combat"
   
2. Insult Phase
   ↓
   Pirate delivers insult
   Float 3-4 response options to player
   
3. Response Phase
   ↓
   Player selects comeback
   AI evaluates quality/appropriateness
   
4. Scoring
   ↓
   Good response: Score point, pirate flustered
   Bad response: Pirate scores, you take "damage"
   
5. Victory/Defeat
   ↓
   SUCCESS: Pirate impressed, leaves, shares Raven knowledge
   FAILURE: Forced into physical combat anyway
```

### Implementation

```typescript
class DialogueCombatManager {
  private insultLibrary: InsultResponsePair[];
  private score: { player: number; pirate: number };
  
  async startDialogueCombat(pirate: NPC): Promise<DialogueCombatResult> {
    this.score = { player: 0, pirate: 0 };
    
    while (this.score.player < 3 && this.score.pirate < 3) {
      // Pirate delivers insult
      const insult = this.pickRandomInsult();
      await this.showDialogue(pirate.name, insult.text);
      
      // Player chooses response
      const responses = this.getValidResponses(insult);
      const chosen = await this.presentResponseChoices(responses);
      
      // Evaluate response quality
      const success = this.evaluateResponse(insult, chosen);
      
      if (success) {
        this.score.player++;
        await this.showDialogue('System', 'The pirate is taken aback!');
      } else {
        this.score.pirate++;
        await this.showDialogue(pirate.name, 'Ha! Pathetic comeback!');
      }
    }
    
    // Determine outcome
    if (this.score.player >= 3) {
      // Victory
      this.questManager.setFlag('defeated_pirate_wit', true);
      this.questManager.setFlag('raven_knowledge_gained', true);
      return { victory: true, physicalCombat: false };
    } else {
      // Defeat - forced into physical combat
      return { victory: false, physicalCombat: true };
    }
  }
  
  private evaluateResponse(insult: Insult, response: Response): boolean {
    // Pattern matching for clever comebacks
    // Thematic appropriateness
    // Wit level
    return response.matches(insult) && response.witLevel > 0.7;
  }
}
```

---

## System Separation Summary

| System | Type | Use Case | AI System | Player Role |
|--------|------|----------|-----------|-------------|
| **Guardian Unmaking** | Cutscene | A Story (required) | None | Ritual performer |
| **Strategic Combat** | Turn-based | Cult leaders, Destroyer, faction battles | Yuka personas | General observer |
| **Dialogue Combat** | Pattern matching | Raven pirates (C Story) | Insult evaluation | Wit combatant |

**CRITICAL**: These are THREE separate systems. Do NOT mix them.

---

## Implementation Checklist

### Guardian Unmakings
- [ ] GuardianUnmakingManager.ts
- [ ] Ritual sequence system
- [ ] Moral choice dialogue patterns
- [ ] Boon granting system
- [ ] Stone Warden unmaking scene
- [ ] Integration with QuestManager

### Strategic Combat
- [ ] CombatOrchestrator.ts
- [ ] PersonaSystem.ts
- [ ] StrategicChoiceUI.ts
- [ ] Flag-based tactic execution
- [ ] Outcome evaluation (boolean logic)
- [ ] Test battle scene
- [ ] Integration with NPCManager

### Dialogue Combat
- [ ] DialogueCombatManager.ts
- [ ] Insult/response library
- [ ] Response evaluation logic
- [ ] Raven pirate encounters
- [ ] C Story integration

---

## Open Questions

1. **Combat Pacing**: How many strategic choices per battle? 3-5?
2. **Failure Consequences**: Death = restart or narrative consequence?
3. **Ally Coordination**: How complex can coordinated tactics get?
4. **Visual Feedback**: How to show battle state clearly in diorama view?
5. **Guardian Ritual Length**: How long should each unmaking take? 5-10 minutes?

---

## Next Steps

1. User reviews and approves this architecture
2. Implement GuardianUnmakingManager (Priority 1)
3. Integrate NPCManager with Yuka AI (Priority 1)
4. Create test Guardian unmaking (Stone Warden)
5. Prototype strategic combat with simple 2v2 battle
6. Iterate based on feel

---

**Status**: Awaiting your feedback before implementation begins.
