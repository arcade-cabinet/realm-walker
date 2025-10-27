# Dialogue-Based Combat System Architecture

**Version**: 1.0 **DRAFT**  
**Status**: DESIGN PHASE - Awaiting Approval  
**Dependencies**: Yuka.js (NPCController), Quest System, Dialogue System

## Vision

> "Innovative dialogue-based combat with AI steering of raid leader and hero on the combat field based on choices that pop up"

Combat in Realm Walker Story is **narrative-driven** and **tactically deep** without numerical stats. Players make **strategic choices via dialogue** that translate to **battlefield maneuvers** executed by Yuka.js AI steering behaviors.

## Core Principles

### 1. Dialogue IS Combat

Combat doesn't "interrupt" narrative - combat IS narrative.

```
Example:
Player: "Attack the Stone Warden's left flank"
→ Dialogue choice selected
→ Hero AI switches to SeekBehavior toward left flank
→ Stone Warden AI switches to defensive rotation
→ Outcome based on positioning + quest flags, not dice rolls
```

### 2. Boolean Flags, Not Stats

```typescript
// ✅ CORRECT: Boolean combat state
flags: {
  hero_positioned_flanking: true,
  warden_vulnerable_left: true,
  raid_leader_supports_hero: true,
  tactic_flanking_maneuver_succeeded: true
}

// ❌ WRONG: Numerical stats
stats: {
  hero_hp: 80,
  warden_hp: 200,
  damage_dealt: 35
}
```

### 3. AI Steering, Not Scripted Animations

Combat movements use **Yuka steering behaviors** for emergent, realistic movement:
- Seek/Flee for positioning
- Obstacle avoidance for terrain
- Flocking for coordinated attacks
- Follow path for tactical maneuvers

## Architecture

### Combat Flow

```
1. DIALOGUE PHASE
   ↓
   Player presented with tactical choices
   ("Charge directly", "Flank left", "Coordinate with raid leader")
   ↓
2. CHOICE SELECTION
   ↓
   Sets quest flags: 
   - tactic_chosen_flank_left: true
   - hero_action_pending: true
   ↓
3. STEERING BEHAVIOR UPDATE
   ↓
   NPCController.updateBehavior() reads flags
   - Hero switches to SeekBehavior (flank position)
   - Raid Leader switches to SupportBehavior
   - Enemy switches to DefendBehavior
   ↓
4. EXECUTION PHASE
   ↓
   Yuka.js EntityManager updates steering
   - NPCs move smoothly toward goals
   - Collision avoidance automatic
   - Positioning emerges naturally
   ↓
5. OUTCOME EVALUATION
   ↓
   Check positioning flags:
   - hero_in_flanking_position: true
   - warden_facing_away: true
   - raid_leader_provides_distraction: true
   ↓
   Outcome determined by flag combinations:
   if (flanking + distraction + vulnerability) {
     setFlag('tactic_succeeded', true);
     setFlag('warden_staggered', true);
   }
   ↓
6. RESULT DIALOGUE
   ↓
   Show outcome narrative
   ("Your flanking maneuver catches the Warden off-guard!")
   ↓
7. NEXT CHOICE
   ↓
   Present follow-up options based on new flags
```

### Combat State Machine

```typescript
type CombatPhase = 
  | 'dialogue'      // Player making choice
  | 'execution'     // AI steering in progress
  | 'evaluation'    // Checking positioning/flags
  | 'outcome';      // Showing results

interface CombatState {
  phase: CombatPhase;
  round: number;
  
  // Boolean flags for combat state
  flags: {
    combat_active: boolean;
    hero_turn: boolean;
    enemy_turn: boolean;
    
    // Positioning
    hero_positioned_offensive: boolean;
    hero_positioned_defensive: boolean;
    hero_positioned_flanking: boolean;
    
    // Enemy state
    enemy_exposed: boolean;
    enemy_vulnerable: boolean;
    enemy_enraged: boolean;
    enemy_retreating: boolean;
    
    // Coordination
    raid_leader_supporting: boolean;
    raid_leader_distracted: boolean;
    coordinated_attack_ready: boolean;
    
    // Tactics
    tactic_charge_active: boolean;
    tactic_flank_active: boolean;
    tactic_defend_active: boolean;
    tactic_coordinate_active: boolean;
    
    // Outcomes
    attack_succeeded: boolean;
    attack_failed: boolean;
    critical_opening_created: boolean;
    enemy_defeated: boolean;
    combat_won: boolean;
  };
}
```

## Integration with Existing Systems

### 1. Dialogue System Integration

**DialogueManager** already supports choices. Extend with combat choices:

```typescript
interface CombatDialogueChoice extends DialogueChoice {
  combatAction: CombatAction;
  requiredFlags: string[];        // Can only choose if flags met
  setFlags: Record<string, boolean>; // Flags set when chosen
}

type CombatAction = 
  | { type: 'charge'; target: string }
  | { type: 'flank'; direction: 'left' | 'right' }
  | { type: 'defend'; stance: 'aggressive' | 'cautious' }
  | { type: 'coordinate'; ally: string; tactic: string };
```

### 2. NPC AI Integration

**NPCController** already has state machine. Add combat behaviors:

```typescript
// Add to NPCController
class CombatState extends State {
  enter(npc: NPCController): void {
    const combatFlags = this.getCombatFlags(npc.id);
    
    // Read flags to determine behavior
    if (combatFlags.hero_charging) {
      npc.vehicle.steering.add(new SeekBehavior(enemyPosition));
    } else if (combatFlags.hero_flanking_left) {
      const flankPos = this.calculateFlankPosition(enemyPosition, 'left');
      npc.vehicle.steering.add(new SeekBehavior(flankPos));
    } else if (combatFlags.hero_defending) {
      npc.vehicle.steering.add(new WanderBehavior(smallRadius));
    }
  }
  
  execute(npc: NPCController): void {
    // Check if positioning goal achieved
    if (this.isInPosition(npc)) {
      this.setFlag(`${npc.id}_positioned_offensive`, true);
      this.setFlag(`${npc.id}_action_complete`, true);
    }
  }
}
```

### 3. Quest System Integration

**QuestManager** already tracks flags. Combat flags follow same pattern:

```typescript
// Combat as quest objectives
{
  id: 'defeat_stone_warden',
  objectives: [
    {
      id: 'create_opening',
      description: 'Create a tactical opening',
      requiredFlags: [
        'hero_positioned_flanking',
        'raid_leader_supporting',
        'warden_facing_away'
      ],
      completed: false
    },
    {
      id: 'exploit_opening',
      description: 'Exploit the opening',
      requiredFlags: [
        'create_opening_complete',
        'hero_positioned_offensive',
        'critical_strike_ready'
      ],
      completed: false
    }
  ]
}
```

## Combat Mechanics

### Positioning System

Combat revolves around **spatial positioning**, not damage numbers.

```typescript
interface BattlefieldPosition {
  type: 'offensive' | 'defensive' | 'flanking' | 'support';
  location: WorldPosition;
  facing: number; // Rotation in radians
  
  // Tactical advantages (boolean flags)
  advantages: {
    behind_enemy: boolean;
    high_ground: boolean;
    covered: boolean;
    supported_by_ally: boolean;
  };
}

class PositionEvaluator {
  /**
   * Evaluate if position provides tactical advantage
   * Returns flags to set based on positioning
   */
  evaluatePosition(
    heroPos: BattlefieldPosition,
    enemyPos: BattlefieldPosition,
    allyPos?: BattlefieldPosition
  ): Record<string, boolean> {
    const flags: Record<string, boolean> = {};
    
    // Check flanking
    const isBehind = this.isBehindEnemy(heroPos, enemyPos);
    flags.hero_positioned_flanking = isBehind;
    flags.enemy_vulnerable = isBehind;
    
    // Check support
    if (allyPos) {
      const hasSupport = this.isPositionSupported(heroPos, allyPos);
      flags.raid_leader_supporting = hasSupport;
      flags.coordinated_attack_ready = isBehind && hasSupport;
    }
    
    // Check facing
    const enemyFacingAway = this.isFacingAway(enemyPos, heroPos);
    flags.enemy_exposed = enemyFacingAway;
    
    return flags;
  }
}
```

### Raid Leader Coordination

The **Raid Leader** is an AI ally that provides tactical support.

```typescript
class RaidLeaderController extends NPCController {
  /**
   * Raid leader responds to hero's actions
   */
  coordinateWithHero(heroAction: CombatAction, combatState: CombatState): void {
    if (heroAction.type === 'coordinate') {
      // Hero requested coordination
      const tactic = heroAction.tactic;
      
      if (tactic === 'pincer_attack') {
        // Raid leader moves to opposite flank
        this.setBehavior({
          type: 'seek',
          target: this.calculateOppositeFlank(enemyPos, heroPos)
        });
        this.setFlag('raid_leader_executing_pincer', true);
      } else if (tactic === 'distraction') {
        // Raid leader draws enemy attention
        this.setBehavior({
          type: 'seek',
          target: enemyPos
        });
        this.setFlag('raid_leader_distracting', true);
      }
    } else {
      // Auto-coordinate: provide support positioning
      this.setBehavior({
        type: 'support',
        target: heroPos,
        offset: [5, 0, -5] // Stay behind and to the side
      });
    }
  }
  
  /**
   * Evaluate if coordination is effective
   */
  evaluateCoordination(combatState: CombatState): Record<string, boolean> {
    const flags: Record<string, boolean> = {};
    
    // Check if pincer complete
    if (this.isOppositeFlankPosition(this.getPosition(), heroPos, enemyPos)) {
      flags.pincer_attack_ready = true;
    }
    
    // Check if enemy distracted
    const enemyFacing = enemyController.vehicle.rotation;
    const facingRaidLeader = this.isFacingToward(enemyFacing, this.getPosition());
    flags.enemy_distracted = facingRaidLeader;
    
    return flags;
  }
}
```

### Tactical Choices

Example combat dialogue tree:

```typescript
const combatDialogue = {
  id: 'stone_warden_combat_round_1',
  speaker: 'System',
  text: 'The Stone Warden looms before you. Choose your approach:',
  choices: [
    {
      text: 'Charge directly and strike with force',
      combatAction: { type: 'charge', target: 'stone_warden' },
      setFlags: {
        tactic_chosen_charge: true,
        hero_action_pending: true
      },
      outcome: {
        onSuccess: 'warden_charge_success',
        onFailure: 'warden_charge_failed',
        evaluateFlags: ['hero_positioned_offensive', 'warden_braced']
      }
    },
    {
      text: 'Circle left and attack the vulnerable flank',
      combatAction: { type: 'flank', direction: 'left' },
      requiredFlags: ['warden_vulnerability_known'], // Must have learned this
      setFlags: {
        tactic_chosen_flank: true,
        hero_action_pending: true
      },
      outcome: {
        onSuccess: 'warden_flank_success',
        onFailure: 'warden_flank_failed',
        evaluateFlags: ['hero_positioned_flanking', 'warden_vulnerable_left']
      }
    },
    {
      text: 'Signal Ottermere to distract while you position',
      combatAction: { 
        type: 'coordinate', 
        ally: 'elder_ottermere',
        tactic: 'distraction'
      },
      requiredFlags: ['elder_ottermere_present'],
      setFlags: {
        tactic_chosen_coordinate: true,
        coordination_requested: true,
        hero_action_pending: true
      },
      outcome: {
        onSuccess: 'warden_coordinate_success',
        onFailure: 'warden_coordinate_failed',
        evaluateFlags: [
          'raid_leader_distracting',
          'enemy_distracted',
          'hero_positioned_flanking'
        ]
      }
    },
    {
      text: 'Hold defensive stance and observe for weakness',
      combatAction: { type: 'defend', stance: 'cautious' },
      setFlags: {
        tactic_chosen_defend: true,
        hero_stance_defensive: true
      },
      outcome: {
        onSuccess: 'warden_weakness_revealed',
        onFailure: 'warden_attack_incoming',
        evaluateFlags: ['hero_positioned_defensive', 'warden_pattern_observed']
      }
    }
  ]
};
```

## Combat Execution

### Phase 1: Choice Selection

```typescript
class CombatManager {
  onDialogueChoice(choice: CombatDialogueChoice): void {
    // Set flags from choice
    for (const [flag, value] of Object.entries(choice.setFlags)) {
      this.questManager.setFlag(flag, value);
    }
    
    // Transition to execution phase
    this.setCombatPhase('execution');
    
    // Update NPC behaviors based on new flags
    this.updateCombatantBehaviors(choice.combatAction);
  }
}
```

### Phase 2: Steering Execution

```typescript
class CombatManager {
  updateCombatantBehaviors(action: CombatAction): void {
    const questState = this.questManager.getState();
    
    // Update hero behavior
    this.heroController.updateBehavior(questState, enemyPos);
    
    // Update raid leader behavior (if present)
    if (this.raidLeaderController) {
      this.raidLeaderController.coordinateWithHero(action, questState);
    }
    
    // Update enemy behavior (reacts to hero's choice)
    this.enemyController.reactToHeroAction(action, questState);
  }
  
  updateCombat(delta: number): void {
    if (this.combatPhase !== 'execution') return;
    
    // Yuka entities update their steering
    this.npcManager.update(delta, this.questManager.getState());
    
    // Check if actions complete
    const actionsComplete = this.areActionsComplete();
    if (actionsComplete) {
      this.setCombatPhase('evaluation');
      this.evaluateCombatOutcome();
    }
  }
  
  areActionsComplete(): boolean {
    const flags = this.questManager.getState().storyFlags;
    return (
      flags.hero_action_complete &&
      (!this.raidLeaderController || flags.raid_leader_action_complete)
    );
  }
}
```

### Phase 3: Outcome Evaluation

```typescript
class CombatManager {
  evaluateCombatOutcome(): void {
    const questState = this.questManager.getState();
    const flags = questState.storyFlags;
    
    // Evaluate positioning
    const positionFlags = this.positionEvaluator.evaluatePosition(
      this.heroController.getPosition(),
      this.enemyController.getPosition(),
      this.raidLeaderController?.getPosition()
    );
    
    // Set position flags
    for (const [flag, value] of Object.entries(positionFlags)) {
      this.questManager.setFlag(flag, value);
    }
    
    // Determine outcome based on flag combinations
    const outcome = this.determineOutcome(flags);
    
    // Set outcome flags
    this.questManager.setFlag('combat_outcome_determined', true);
    this.questManager.setFlag(outcome.successFlag, outcome.success);
    
    // Transition to outcome phase
    this.setCombatPhase('outcome');
    this.showOutcomeDialogue(outcome);
  }
  
  determineOutcome(flags: Record<string, boolean>): CombatOutcome {
    // Example: Flanking attack outcome
    if (flags.tactic_chosen_flank) {
      const success = (
        flags.hero_positioned_flanking &&
        flags.enemy_vulnerable &&
        (!flags.enemy_detected_flank)
      );
      
      return {
        success,
        successFlag: 'flank_attack_succeeded',
        nextDialogueId: success 
          ? 'warden_flank_success' 
          : 'warden_flank_failed'
      };
    }
    
    // Example: Coordinated attack outcome
    if (flags.tactic_chosen_coordinate) {
      const success = (
        flags.raid_leader_distracting &&
        flags.enemy_distracted &&
        flags.hero_positioned_flanking &&
        flags.coordinated_attack_ready
      );
      
      return {
        success,
        successFlag: 'coordinated_attack_succeeded',
        nextDialogueId: success
          ? 'warden_coordinate_success'
          : 'warden_coordinate_failed'
      };
    }
    
    // ... handle other tactic types
  }
}
```

### Phase 4: Outcome Dialogue

```typescript
const outcomeDialogues = {
  warden_flank_success: {
    speaker: 'System',
    text: 'Your flanking maneuver catches the Stone Warden off-guard! The ancient guardian staggers, its left side exposed.',
    choices: [
      {
        text: 'Press the advantage!',
        setFlags: {
          warden_staggered: true,
          warden_vulnerable_left: true,
          hero_positioned_offensive: true
        },
        nextDialogue: 'combat_round_2'
      }
    ]
  },
  
  warden_flank_failed: {
    speaker: 'System',
    text: 'The Stone Warden anticipated your movement! It pivots with surprising speed, denying you the flanking position.',
    choices: [
      {
        text: 'Reassess and try another approach',
        setFlags: {
          warden_alert: true,
          hero_tactic_revealed: true
        },
        nextDialogue: 'combat_round_2'
      }
    ]
  },
  
  warden_coordinate_success: {
    speaker: 'Elder Ottermere',
    text: 'I have its attention! Now, strike while it faces me!',
    choices: [
      {
        text: 'Execute the coordinated strike',
        setFlags: {
          critical_opening_created: true,
          coordinated_attack_executed: true,
          warden_vulnerable: true
        },
        nextDialogue: 'warden_critical_hit'
      }
    ]
  }
};
```

## Enemy AI Reactions

Enemies react intelligently to player tactics:

```typescript
class EnemyController extends NPCController {
  reactToHeroAction(action: CombatAction, combatState: CombatState): void {
    const flags = combatState.storyFlags;
    
    if (action.type === 'charge') {
      // Brace for impact
      this.setBehavior({ type: 'idle' });
      this.setFlag(`${this.id}_braced`, true);
      
    } else if (action.type === 'flank') {
      // Try to pivot and face hero
      const heroPos = this.getHeroPosition();
      this.setBehavior({ 
        type: 'rotate',
        target: heroPos,
        speed: this.getRotationSpeed(flags)
      });
      
      // May or may not detect flank based on flags
      if (flags[`${this.id}_alert`] || Math.random() > 0.7) {
        this.setFlag(`${this.id}_detected_flank`, true);
      }
      
    } else if (action.type === 'coordinate') {
      // Focus on most threatening target
      if (flags.raid_leader_distracting) {
        // Distracted by raid leader
        const raidLeaderPos = this.getRaidLeaderPosition();
        this.setBehavior({
          type: 'seek',
          target: raidLeaderPos
        });
        this.setFlag(`${this.id}_distracted`, true);
      }
    }
  }
}
```

## Victory Conditions

Combat ends when **victory flags** are achieved:

```typescript
interface CombatVictoryCondition {
  requiredFlags: string[];
  victoryDialogue: string;
  rewardsFlags: string[];
}

const stoneWardenVictory: CombatVictoryCondition = {
  requiredFlags: [
    'warden_staggered',
    'warden_vulnerable',
    'critical_opening_created',
    'coordinated_attack_executed',
    'warden_defeated'
  ],
  victoryDialogue: 'warden_defeated_scene',
  rewardsFlags: [
    'stone_warden_boon_obtained',
    'chapter_1_combat_complete',
    'player_mastered_flanking_tactic'
  ]
};

class CombatManager {
  checkVictoryConditions(): boolean {
    const flags = this.questManager.getState().storyFlags;
    const victory = this.victoryCondition;
    
    const allFlagsSet = victory.requiredFlags.every(flag => flags[flag]);
    
    if (allFlagsSet) {
      // Set victory flags
      victory.rewardsFlags.forEach(flag => {
        this.questManager.setFlag(flag, true);
      });
      
      // Show victory dialogue
      this.showDialogue(victory.victoryDialogue);
      
      // End combat
      this.setCombatPhase('complete');
      this.endCombat();
      
      return true;
    }
    
    return false;
  }
}
```

## Implementation Checklist

### Phase 1: Core Combat Manager ⚠️ NOT STARTED

- [ ] Create `CombatManager.ts` class
- [ ] Implement combat phase state machine
- [ ] Integrate with DialogueManager for combat choices
- [ ] Implement position evaluation system
- [ ] Add combat flag management

### Phase 2: Combat Behaviors 🚧 PARTIALLY DONE

- [x] NPCController with state machine (DONE)
- [ ] Add `CombatState` to NPCController
- [ ] Implement `RaidLeaderController` subclass
- [ ] Implement `EnemyController` subclass with reactive behaviors
- [ ] Add positioning evaluation logic

### Phase 3: Combat Dialogue ⚠️ NOT STARTED

- [ ] Extend `DialogueChoice` with `CombatDialogueChoice`
- [ ] Create combat dialogue trees for Chapter 1
- [ ] Implement outcome evaluation logic
- [ ] Create outcome dialogue branches

### Phase 4: Integration ⚠️ NOT STARTED

- [ ] Wire CombatManager into ProductionGame
- [ ] Add combat trigger conditions (proximity, quest flags)
- [ ] Implement combat-to-narrative transitions
- [ ] Add victory condition checking to game loop

### Phase 5: Testing ⚠️ NOT STARTED

- [ ] Unit tests for position evaluation
- [ ] Unit tests for outcome determination
- [ ] Integration tests for full combat flow
- [ ] E2E tests for sample combat encounters

## Open Questions for User

1. **Combat Pacing**: How many rounds per encounter? 3-5 choices before victory?

2. **Failure State**: What happens if player makes poor choices? 
   - Restart encounter?
   - Narrative consequence + proceed?
   - Progressive difficulty reduction?

3. **Raid Leader Role**: Is raid leader always present or chapter-specific?

4. **Enemy Variety**: Different enemy types need different tactics?
   - Stone Warden (slow, powerful, predictable)
   - Blood Court Vampire (fast, unpredictable, tactical)
   - Technocrat Construct (reactive, learning, adaptive)

5. **Tutorial Combat**: How to teach mechanics in Chapter 0/1?

6. **Camera Control**: Fixed diorama view or dynamic combat camera?

7. **Visual Feedback**: How to show positioning advantages visually?
   - Highlight zones on ground?
   - Character positioning/facing indicators?
   - UI overlay showing tactical state?

## Next Steps

1. **User Review**: Get approval on this architecture
2. **Create Prototype**: Implement Stone Warden encounter
3. **Iterate**: Refine based on gameplay feel
4. **Document**: Create combat encounter design guide
5. **Scale**: Apply pattern to all Guardian encounters

---

**Status**: Awaiting your feedback on this design before implementation begins.
