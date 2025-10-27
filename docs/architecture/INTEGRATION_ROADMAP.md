# Integration Roadmap: From Current State to Production

**Version**: 1.0  
**Date**: 2025-10-27  
**Status**: Action Plan

---

## Current State Analysis

### ✅ What's Production-Ready NOW

**Core Architecture** (100% complete):
- Three-tier compositor pattern (Story → Scene → Game)
- Boolean flag quest system
- RWMD parser with anchor resolution
- Scene transition system
- Type system fully defined

**Runtime Systems** (90% complete):
- SceneCompositor, StoryCompositor, GameCompositor
- QuestManager, DialogueManager, GameStateManager
- InteractionSystem, GridSystemImpl
- SceneLoader, StoryBindingLoader
- UI systems (ProductionHUD, DialogueUI, QuestLogUI)

**Third-Party Integration** (80% complete):
- YukaGridSystem implemented
- NPCController/NPCManager implemented
- R3FGameCompositor implemented
- NOT YET WIRED INTO PRODUCTION

### 🚧 What Needs Integration

1. **Yuka AI Systems** - Implemented but disconnected
2. **Combat System** - Needs complete design + implementation
3. **Guardian Unmaking Sequences** - Needs implementation
4. **NPC Movement** - Yuka steering not active
5. **React Three Fiber** - Alternative renderer not integrated

---

## Integration Priorities

### Priority 1: CRITICAL (MVP Chapter 0-1)

#### 1.1 Guardian Unmaking System

**Status**: Design complete (`GUARDIAN_UNMAKING_SYSTEM.md`)  
**Implementation**: NEEDED

**Tasks**:
- [ ] Create GuardianUnmakingManager.ts
- [ ] Implement ritual sequence system (cutscene-based)
- [ ] Create moral choice dialogue patterns
- [ ] Integrate with QuestManager flags
- [ ] Add Player.addBoon() system
- [ ] Create Stone Warden unmaking (Chapter 1)
- [ ] Test emotional weight/pacing

**Files**:
```
src/runtime/systems/GuardianUnmakingManager.ts (NEW)
src/runtime/systems/BoonSystem.ts (NEW)
scenes/guardians/stone_warden_unmaking.rwmd (NEW)
```

**Timeline**: 1 week

#### 1.2 NPC Integration (Yuka AI)

**Status**: Systems implemented, need wiring  
**Implementation**: PARTIAL

**Tasks**:
- [ ] Wire NPCManager into ProductionGame.initializeCoreSystems()
- [ ] Add NPCManager.update() to game loop
- [ ] Switch GridSystemImpl to YukaGridSystem as default
- [ ] Test NPC pathfinding in scenes
- [ ] Integrate NPC spawning with StoryCompositor
- [ ] Add NPC steering behavior tests

**Files**:
```
src/ProductionGame.ts (UPDATE)
src/runtime/systems/SceneCompositor.ts (UPDATE to use YukaGridSystem)
tests/unit/NPCController.test.ts (NEW)
```

**Timeline**: 3 days

#### 1.3 Fix @ts-nocheck Files

**Status**: 5 files need type fixing  
**Implementation**: NEEDED

**Tasks**:
- [ ] Fix GameUIManager.ts types (HIGH)
- [ ] Fix AIClient.ts types with Vercel AI SDK v4 patterns (HIGH)
- [ ] Fix GPTImageGenerator.ts types (MEDIUM)
- [ ] Remove @ts-nocheck from ProductionGame.ts (MEDIUM)
- [ ] Update to use proper TypeScript patterns

**Timeline**: 2 days

---

### Priority 2: HIGH (Combat System)

#### 2.1 General-Observer Combat Architecture

**Status**: Design in progress  
**Implementation**: NEEDED

Based on Godot system docs + Yuka integration:

**Player Role**: **General observing battlefield** (NOT individual combatant)

**Combat Flow**:
```
1. SETUP PHASE
   ↓
   Scene with faction armies positioned
   Story flags determine who's present
   ↓
2. OBSERVATION PHASE
   ↓
   Camera shows diorama battlefield view
   Yuka AI controls ALL units (player faction + enemies)
   NPCs use personas (faction leader traits)
   ↓
3. CHOICE PHASE
   ↓
   Binary strategic choices float up to player
   ("Charge the center" / "Flank left")
   ("Hold position" / "Advance")
   ↓
4. EXECUTION PHASE
   ↓
   Player choice sets quest flags
   NPCController.updateBehavior() reads flags
   Yuka steering behaviors execute tactics
   Units move/attack via AI personas
   ↓
5. RESULT EVALUATION
   ↓
   Check outcomes based on positioning + flags
   Set victory/defeat flags
   ↓
6. OUTCOME PHASE
   ↓
   Show battle results dialogue
   Update quest state
   Transition to next scene
```

**Key Systems Needed**:

```typescript
// NEW: CombatOrchestrator
class CombatOrchestrator {
  private npcManager: NPCManager;
  private questManager: QuestManager;
  private phase: CombatPhase;
  
  setupBattle(combatDefinition: CombatDefinition): void {
    // Spawn faction units from story bindings
    // Position armies based on formation
    // Initialize Yuka steering behaviors
  }
  
  presentStrategicChoice(choices: StrategyChoice[]): void {
    // Float binary choices to player
    // Wait for selection
    // Set corresponding flags
  }
  
  executeTactics(delta: number): void {
    // Update Yuka AI for all units
    // NPCs use persona-based decisions
    // Evaluate positioning continuously
  }
  
  evaluateOutcome(): CombatResult {
    // Check positioning flags
    // Determine victory/defeat
    // Calculate casualties (boolean: survived/died)
  }
}
```

**Persona System** (from Godot docs):

```typescript
interface FactionPersona {
  id: string;
  threatWeights: {
    lowestHealth: number;
    highestThreat: number;
    nearestEnemy: number;
    supportAlly: number;
  };
  formationTendency: 'tight' | 'loose' | 'none';
  aggressionLevel: number; // 0-1
  retreatThreshold: number; // 0-1 health
}

// Example: Dawnshield commander persona
const aureliusPersona: FactionPersona = {
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
interface StrategyChoice {
  text: string;
  setFlags: Record<string, boolean>;
  requiredFlags?: string[];
}

// Example battle choices
const battleChoices: StrategyChoice[] = [
  {
    text: "Charge the enemy center directly",
    setFlags: {
      strategy_charge_center: true,
      hero_positioned_offensive: true
    }
  },
  {
    text: "Coordinate a flanking maneuver with Ottermere",
    setFlags: {
      strategy_flank_coordinated: true,
      hero_requests_coordination: true
    },
    requiredFlags: ['elder_ottermere_present']
  },
  {
    text: "Hold defensive formation",
    setFlags: {
      strategy_defend: true,
      hero_positioned_defensive: true
    }
  }
];
```

**Integration with Guardian Unmakings**:

```typescript
// Guardian Unmakings are NOT combat
// They're ritual sequences (cutscenes with choices)
// SEPARATE from actual battles

// Real battles:
// - Cult leaders (Chapters 13-14)
// - THE DESTROYER (Chapters 17-18)
// - Faction conflicts (optional B story encounters)

// Guardian Unmakings:
// - Narrative sequences
// - Moral choice moments
// - No Yuka AI combat
// - Just cutscenes + dialogue
```

**Tasks**:
- [ ] Create CombatOrchestrator.ts
- [ ] Implement persona system for faction leaders
- [ ] Create strategic choice UI system
- [ ] Integrate Yuka AI for battle execution
- [ ] Add combat result evaluation
- [ ] Create test battle scene
- [ ] Separate GuardianUnmaking from Combat clearly

**Files**:
```
src/runtime/systems/CombatOrchestrator.ts (NEW)
src/runtime/systems/PersonaSystem.ts (NEW)
src/ui/StrategicChoiceUI.ts (NEW)
scenes/combat/test_battle.rwmd (NEW)
```

**Timeline**: 2 weeks

#### 2.2 Monkey Island Dialogue Combat (Ravens Only)

**Status**: Design needed  
**Implementation**: NEEDED

For Raven pirate encounters (C Story):

```typescript
class DialogueCombatManager {
  private insultLibrary: InsultResponse[];
  
  startDialogueCombat(pirate: NPC): void {
    // Present floating insult options
    // Player chooses response
    // AI judges quality
    // Success = pirate leaves, gain knowledge
    // Failure = forced physical combat
  }
  
  evaluateResponse(insult: string, response: string): boolean {
    // LimboAI-style evaluation
    // Pattern matching for witty comebacks
    // Return success/failure
  }
}
```

**Timeline**: 1 week (after main combat done)

---

### Priority 3: MEDIUM (Polish & Alternative Systems)

#### 3.1 React Three Fiber Integration

**Status**: R3FGameCompositor implemented but not integrated  
**Implementation**: PARTIAL

**Tasks**:
- [ ] Add R3F render path toggle to ProductionGame
- [ ] Test R3F vs traditional renderer performance
- [ ] Document which is "primary" (recommend: traditional)
- [ ] Keep R3F as experimental/developer option

**Timeline**: 3 days

#### 3.2 AI Asset Generation Clarification

**Status**: Systems implemented but role unclear  
**Implementation**: COMPLETE (just needs docs)

**Clarify**:
- AI tools are **build-time** content generators
- NOT runtime procedural generation
- Workflow: Design → AI Generate → Import → Runtime
- Update content-import.md with clear pipeline

**Timeline**: 1 day (documentation only)

---

### Priority 4: LOW (Future Enhancements)

#### 4.1 Advanced NPC Behaviors

- Formation movement
- Cover system
- Dynamic obstacle avoidance
- Predictive pursuit

#### 4.2 Enhanced Combat Features

- Multi-faction three-way battles
- Dynamic difficulty scaling
- Replay system

#### 4.3 Performance Optimization

- Asset streaming
- Level-of-detail systems
- Bundle size optimization

---

## Implementation Order

### Week 1: Foundation

**Monday-Tuesday**: NPC Integration
- Wire NPCManager into ProductionGame
- Switch to YukaGridSystem
- Test NPC movement

**Wednesday-Thursday**: Type Safety Fixes
- Fix @ts-nocheck files
- Update to Vercel AI SDK v4 patterns
- Clean up type errors

**Friday**: Guardian Unmaking Design
- Review GUARDIAN_UNMAKING_SYSTEM.md
- Plan implementation approach
- Create file structure

### Week 2: Guardian Unmakings

**Monday-Wednesday**: GuardianUnmakingManager
- Implement ritual sequence system
- Create moral choice patterns
- Integrate with QuestManager

**Thursday-Friday**: Stone Warden Unmaking
- Create first Guardian unmaking scene
- Test emotional pacing
- Validate flag progression

### Week 3-4: Combat System

**Week 3**: Combat Architecture
- Create CombatOrchestrator
- Implement persona system
- Build strategic choice UI
- Integrate Yuka AI battle execution

**Week 4**: Combat Testing & Polish
- Create test battle scenes
- Balance AI behaviors
- Test flag-based outcomes
- Document combat patterns

### Week 5: Polish & Documentation

- R3F integration (optional)
- AI pipeline documentation
- Update architecture docs
- Final testing

---

## Acceptance Criteria

### MVP Complete When:

1. ✅ NPC AI integrated and working
2. ✅ YukaGridSystem default for pathfinding
3. ✅ All @ts-nocheck files fixed
4. ✅ GuardianUnmakingManager implemented
5. ✅ Stone Warden unmaking playable
6. ✅ CombatOrchestrator working for one test battle
7. ✅ Strategic choices affect battle outcomes
8. ✅ Clear separation: Unmakings vs Combat
9. ✅ Documentation updated
10. ✅ All tests passing

### Production Ready When:

11. ✅ Chapter 0-1 fully playable
12. ✅ All 8 Guardian unmakings designed
13. ✅ Combat system validated with faction battles
14. ✅ Raven dialogue combat implemented
15. ✅ Performance acceptable (60fps)
16. ✅ No placeholder/demo code in production paths

---

## Risk Mitigation

### Risk 1: Combat Complexity

**Mitigation**: 
- Start with simplest battle (2 factions, 4 units each)
- Use binary choices only (no complex tactics)
- Focus on "feels right" not "perfectly balanced"

### Risk 2: Yuka AI Learning Curve

**Mitigation**:
- Reference Godot LimboAI docs (already adapted from)
- Start with basic steering behaviors only
- Add complexity incrementally

### Risk 3: Guardian Unmaking Emotional Weight

**Mitigation**:
- Playtest early and often
- Focus on pacing and music
- Use dialogue to build weight, not mechanics

---

## Cross-References

**Related Documents**:
- `PRODUCTION_CODE_AUDIT.md` - Current state assessment
- `dialogue-combat-system.md` - Combat architecture (UPDATING)
- `GUARDIAN_UNMAKING_SYSTEM.md` - Unmaking ritual design
- `third-party-integrations.md` - Yuka/R3F integration strategy
- `docs/systems/AI_BEHAVIORS_GODOT.md` - AI implementation patterns
- `docs/systems/combat/README.md` - Combat system overview

---

## Status Tracking

**Last Updated**: 2025-10-27  
**Current Phase**: Week 1 - Foundation  
**Next Milestone**: NPC Integration Complete  
**Blockers**: None

---

This is the definitive integration plan. All work should follow this roadmap unless explicitly revised.
