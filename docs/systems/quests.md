# Quest System

**Version**: 1.0  
**Status**: Design Specification (PARTIALLY IN OLD)  
**Last Updated**: 2025-10-15

---

## Status

⚠️ **PARTIALLY IN OLD**:
- OLD has quests.ts (basic quest data)
- OLD has quest-system.ts (basic logic)
- OLD has quests-panel.tsx UI

❌ **NEW HAS NOTHING**

**Need to port from OLD + expand significantly.**

---

## Quest Types

### 1. Main Quests (Scenario Objectives)

**These ARE the scenarios** - not separate from combat:

**Example: Scenario 1 (Oath of Dawn)**:
```typescript
mainQuest: {
  id: 'scenario_01_oath_of_dawn',
  name: 'Oath of Dawn',
  description: 'Defend the Sacred Shrine from Veilbound attack',
  
  objectives: [
    {
      id: 'defend_shrine',
      type: 'defend',
      target: 'sacred_shrine',
      description: 'Prevent Veilbound from capturing shrine',
      required: true,
      progress: { current: 0, max: 1 },
      reward: { scenario_completion: true }
    },
    {
      id: 'eliminate_enemies',
      type: 'eliminate',
      targets: ['shadowblade', 'voidcaller', 'silencer'],
      description: 'Defeat all Veilbound forces',
      required: true,
      progress: { current: 0, max: 3 },
      reward: { scenario_completion: true }
    }
  ],
  
  secondaryObjectives: [
    {
      id: 'no_casualties',
      type: 'survival',
      description: 'Complete with all allies alive',
      required: false,
      reward: { gold: 100, item: 'healing_potion_greater' }
    },
    {
      id: 'swift_victory',
      type: 'time_limit',
      description: 'Complete within 12 turns',
      required: false,
      maxTurns: 12,
      reward: { gold: 50, reputation: { dawnshield_order: 5 } }
    }
  ]
}
```

### 2. Side Quests

**Optional quests within scenarios**:

```typescript
sideQuest: {
  id: 'desperate_refugee',
  name: 'A Desperate Plea',
  giver: 'refugee_child',
  location: { scenario: 'scenario_04_natures_wrath', hex: { q: 5, r: 3 } },
  
  steps: [
    {
      id: 'talk_to_refugee',
      type: 'dialogue',
      target: 'refugee_child',
      description: 'Speak to the frightened child',
      completed: false
    },
    {
      id: 'find_mother',
      type: 'search',
      area: 'burning_grove',
      description: 'Search the burning grove for the child\'s mother',
      completed: false
    },
    {
      id: 'rescue_or_mercy',
      type: 'choice',
      description: 'The mother is dying. Save her or grant mercy?',
      choices: [
        {
          text: 'Use healing potion (costs 1 potion)',
          consequence: 'save_mother',
          requirements: { item: 'health_potion' },
          reward: { reputation: { verdant_spirits: 15 } }
        },
        {
          text: 'Grant mercy kill',
          consequence: 'mercy_kill_mother',
          reward: { reputation: { verdant_spirits: 5 }, gold: 50 }
        }
      ]
    }
  ],
  
  rewards: {
    base: { gold: 75, xp: 100 },
    bonus: { item: 'nature_blessing_amulet' }  // If saved mother
  }
}
```

**Side Quest Features**:
- Optional (can skip)
- Found by exploration
- Moral choices
- Reputation impact
- Unique rewards

### 3. Faction Quests

**Reputation-gated quests**:

```typescript
factionQuest: {
  id: 'crimson_pact_blood_oath',
  name: 'The Blood Oath',
  faction: 'crimson_pact',
  
  requirements: {
    reputation: { crimson_pact: 50 },  // Must be Ally+
    scenario: 'scenario_07',           // Available after scenario 7
  },
  
  objectives: [
    {
      type: 'dialogue',
      target: 'carmilla_sanguis',
      description: 'Accept Carmilla\'s proposition'
    },
    {
      type: 'combat',
      targets: ['rebel_thrall_1', 'rebel_thrall_2', 'rebel_thrall_3'],
      description: 'Eliminate the rebel thralls'
    },
    {
      type: 'choice',
      description: 'The rebels beg for mercy. What do you do?',
      choices: [
        {
          text: 'Execute them (Carmilla approves)',
          consequence: 'execute_rebels',
          reputation: { crimson_pact: 25 }
        },
        {
          text: 'Spare them (Carmilla disapproves)',
          consequence: 'spare_rebels',
          reputation: { crimson_pact: -15, neutral: 10 }
        }
      ]
    }
  ],
  
  rewards: {
    execute_path: {
      item: 'carmilla_favor_token',  // Unique faction item
      reputation: { crimson_pact: 25 }
    },
    spare_path: {
      item: 'mercy_pendant',
      reputation: { crimson_pact: -15, neutral: 10 }
    }
  }
}
```

**One per faction** = 12 faction quests

### 4. Companion Quests (Optional)

**If we add companion system**:

```typescript
companionQuest: {
  id: 'umbra_redemption',
  name: 'Shadow's Redemption',
  companion: 'umbra_nightwhisper',
  
  trigger: {
    reputation: { veilwalkers: 75 },
    scenario: 'scenario_08'
  },
  
  objectives: [
    {
      type: 'dialogue',
      description: 'Umbra reveals her past (10,000 assassinations)'
    },
    {
      type: 'choice',
      description: 'Can she be redeemed?',
      choices: [
        { text: 'Everyone deserves redemption', consequence: 'forgive' },
        { text: 'Some sins are unforgivable', consequence: 'condemn' }
      ]
    },
    {
      type: 'combat',
      description: 'Fight Umbra\'s past victims (spectral)',
      condition: { choice: 'forgive' }
    }
  ],
  
  rewards: {
    forgive_path: {
      unlocks: 'umbra_ultimate_ability',
      reputation: { veilwalkers: 50 }
    },
    condemn_path: {
      unlocks: 'umbra_leaves_party',
      reputation: { veilwalkers: -25 }
    }
  }
}
```

---

## Quest States

### State Machine

```typescript
type QuestState = 
  | 'locked'        // Requirements not met
  | 'available'     // Can start
  | 'active'        // In progress
  | 'completed'     // Finished
  | 'failed'        // Failed (optional)
  | 'abandoned';    // Player gave up

interface QuestProgress {
  state: QuestState;
  currentStep: number;
  totalSteps: number;
  objectivesComplete: number;
  objectivesTotal: number;
  startedAt: Date | null;
  completedAt: Date | null;
}
```

### State Transitions

```
LOCKED → (requirements met) → AVAILABLE
AVAILABLE → (accept quest) → ACTIVE
ACTIVE → (complete objectives) → COMPLETED
ACTIVE → (fail condition) → FAILED
ACTIVE → (player abandons) → ABANDONED
```

---

## Quest UI

### Quest Log

```
┌─────────────────────────────────────────┐
│  QUEST LOG                         [X]  │
├─────────────────────────────────────────┤
│  [Active] [Completed] [Available]        │
├─────────────────────────────────────────┤
│  📍 Oath of Dawn (ACTIVE)               │
│     ├─ ✅ Defend Sacred Shrine           │
│     └─ ⏳ Eliminate Veilbound (2/3)      │
│     Reward: Scenario completion          │
│                                         │
│  📍 A Desperate Plea (ACTIVE)           │
│     ├─ ✅ Talk to refugee child          │
│     ├─ ⏳ Find mother in burning grove   │
│     └─ ⬜ Make choice                    │
│     Reward: 75 gold, nature amulet       │
│                                         │
│  📍 The Blood Oath (AVAILABLE)          │
│     Requires: Crimson Pact reputation 50 │
│     [Accept Quest]                       │
│                                         │
│  [Track] [Abandon] [Details]             │
└─────────────────────────────────────────┘
```

### Quest Markers

**In-world indicators**:
- ❗ Quest giver (exclamation)
- ❓ Quest objective (question)
- ✅ Quest complete (check mark)
- 🔒 Locked quest (lock icon)

**Minimap markers**:
- Same icons on minimap
- Click to navigate

---

## Quest Rewards

### Reward Types

**Gold**:
- Small quests: 50-100 gold
- Medium quests: 100-250 gold
- Large quests: 250-500 gold
- Faction quests: 500-1000 gold

**Items**:
- Common: Potions, materials
- Rare: Equipment, accessories
- Epic: Faction-specific gear
- Legendary: Unique quest items

**Reputation**:
- Small impact: ±5
- Medium impact: ±10-15
- Large impact: ±20-25
- Faction quests: ±25-50

**Unlocks**:
- New scenarios
- New abilities
- New areas
- Companion recruitment

**Experience** (if we have levels):
- Based on quest difficulty
- Bonus for optional objectives

---

## Quest Structure (TypeScript)

```typescript
// client/src/data/quests/types.ts
interface Quest {
  id: string;
  name: string;
  description: string;
  type: 'main' | 'side' | 'faction' | 'companion';
  
  // Requirements
  requirements?: {
    scenario?: string;       // Available after scenario X
    reputation?: Record<string, number>;  // Faction rep needed
    shards?: string[];       // Shards needed
    flags?: string[];        // Choice flags needed
  };
  
  // Quest giver
  giver?: {
    npcId: string;
    location: HexCoord;
    dialogue: string;  // RWMD scene ID
  };
  
  // Objectives
  objectives: Objective[];
  
  // Rewards
  rewards: {
    gold?: number;
    items?: string[];
    reputation?: Record<string, number>;
    unlocks?: string[];
    xp?: number;
  };
  
  // Failure conditions (optional)
  failConditions?: {
    timeLimit?: number;  // Turns
    deathAllowed?: boolean;  // Can allies die?
    locations?: string[];  // Can't leave these areas
  };
}

interface Objective {
  id: string;
  type: 'dialogue' | 'combat' | 'search' | 'escort' | 'choice' | 'collect';
  description: string;
  required: boolean;
  
  // Type-specific data
  target?: string | string[];
  location?: HexCoord | string;
  quantity?: number;
  choices?: QuestChoice[];
  
  // Progress
  completed: boolean;
  progress?: { current: number; max: number };
}
```

---

## Quest Triggers

### When Quests Become Available

**Trigger Types**:

**Location-Based**:
```typescript
// Enter specific hex
if (playerPosition === questGiverHex) {
  showQuestGiver('desperate_refugee');
}
```

**Time-Based**:
```typescript
// After completing scenario
onScenarioComplete('scenario_04', () => {
  unlockQuest('faction_quest_crimson_pact');
});
```

**Reputation-Based**:
```typescript
// When reputation reaches threshold
onReputationChange('crimson_pact', (newRep) => {
  if (newRep >= 50 && !hasQuest('blood_oath')) {
    unlockQuest('blood_oath');
    showNotification('New faction quest available!');
  }
});
```

**Flag-Based**:
```typescript
// When specific choice made
onFlagSet('spare_cultist_scenario_01', () => {
  unlockQuest('grateful_cultist_returns');
});
```

---

## Quest Objective Types

### Dialogue Objectives

**Talk to NPC**:
```typescript
{
  type: 'dialogue',
  target: 'elder_ottermere',
  dialogue_scene: '@scene:elder_quest_briefing',
  completed: false
}
```

**Validation**: Dialogue scene completed

### Combat Objectives

**Defeat enemies**:
```typescript
{
  type: 'combat',
  targets: ['dire_wolf_alpha', 'dire_wolf_1', 'dire_wolf_2'],
  description: 'Defeat the wolf pack',
  progress: { current: 0, max: 3 },
  completed: false
}
```

**Validation**: All targets defeated

### Search Objectives

**Find item/location**:
```typescript
{
  type: 'search',
  area: 'burning_grove',
  searchRadius: 5,  // Hexes
  target: 'refugee_mother',
  description: 'Search the burning grove',
  completed: false
}
```

**Validation**: Reached location or found item

### Escort Objectives

**Protect NPC**:
```typescript
{
  type: 'escort',
  npc: 'refugee_child',
  destination: { q: 15, r: 8 },
  allowDeath: false,  // NPC must survive
  description: 'Escort child to safe zone',
  completed: false
}
```

**Validation**: NPC reaches destination alive

### Collection Objectives

**Gather items**:
```typescript
{
  type: 'collect',
  items: [
    { id: 'medicinal_herb', quantity: 5 },
    { id: 'bandages', quantity: 3 }
  ],
  description: 'Gather medical supplies',
  progress: { current: 0, max: 8 },
  completed: false
}
```

**Validation**: All items collected

### Choice Objectives

**Make decision**:
```typescript
{
  type: 'choice',
  description: 'Decide the refugee\'s fate',
  choices: [
    { id: 'save', consequence: 'refugee_saved' },
    { id: 'mercy_kill', consequence: 'refugee_mercy_killed' },
    { id: 'abandon', consequence: 'refugee_abandoned' }
  ],
  completed: false,
  choiceMade: null
}
```

**Validation**: Choice selected

---

## Quest Rewards

### Reward Distribution

**On quest completion**:

```typescript
function distributeRewards(quest: Quest) {
  // Gold
  if (quest.rewards.gold) {
    addGold(quest.rewards.gold);
    showNotification(`+${quest.rewards.gold} gold`);
  }
  
  // Items
  if (quest.rewards.items) {
    for (const itemId of quest.rewards.items) {
      addToInventory(itemId);
      showNotification(`Received: ${getItemName(itemId)}`);
    }
  }
  
  // Reputation
  if (quest.rewards.reputation) {
    for (const [faction, change] of Object.entries(quest.rewards.reputation)) {
      updateReputation(faction, change);
      showReputationChange(faction, change);
    }
  }
  
  // Unlocks
  if (quest.rewards.unlocks) {
    for (const unlock of quest.rewards.unlocks) {
      unlockContent(unlock);
      showNotification(`Unlocked: ${unlock}`);
    }
  }
  
  // XP
  if (quest.rewards.xp) {
    addExperience(quest.rewards.xp);
    checkLevelUp();
  }
}
```

---

## Quest Database

### Schema

```sql
CREATE TABLE quests (
  save_id INTEGER REFERENCES saves(id),
  quest_id TEXT NOT NULL,
  state TEXT CHECK(state IN ('locked', 'available', 'active', 'completed', 'failed', 'abandoned')),
  current_step INTEGER DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  PRIMARY KEY (save_id, quest_id)
);

CREATE TABLE quest_objectives (
  save_id INTEGER,
  quest_id TEXT,
  objective_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  progress_current INTEGER DEFAULT 0,
  progress_max INTEGER,
  FOREIGN KEY (save_id, quest_id) REFERENCES quests(save_id, quest_id),
  PRIMARY KEY (save_id, quest_id, objective_id)
);

CREATE TABLE quest_choices (
  save_id INTEGER,
  quest_id TEXT,
  choice_id TEXT NOT NULL,
  made_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (save_id, quest_id) REFERENCES quests(save_id, quest_id),
  PRIMARY KEY (save_id, quest_id, choice_id)
);
```

---

## Quest Tracking UI

### Active Quest Tracker

**Minimal HUD element**:

```
┌──────────────────────────┐
│  ACTIVE QUEST            │
├──────────────────────────┤
│  📍 Oath of Dawn         │
│  ├─ ✅ Defend shrine      │
│  └─ ⏳ Defeat enemies 2/3 │
│                          │
│  [Details] [Track Other]  │
└──────────────────────────┘
```

**Always visible** (unless minimized)

### Quest Details

**Full information panel**:

```
┌─────────────────────────────────────────┐
│  QUEST: Oath of Dawn              [X]   │
├─────────────────────────────────────────┤
│  Type: Main Quest (Scenario 1)           │
│  Giver: Elder Ottermere                  │
│                                         │
│  Description:                            │
│  Defend the Sacred Shrine from the       │
│  Veilbound Synod's attack.               │
│                                         │
│  PRIMARY OBJECTIVES:                     │
│  ✅ Defend Sacred Shrine                 │
│  ⏳ Eliminate All Veilbound (2/3)        │
│     ├─ ✅ Shadowblade defeated           │
│     ├─ ✅ Voidcaller defeated            │
│     └─ ⏳ Silencer (remaining)           │
│                                         │
│  SECONDARY OBJECTIVES:                   │
│  ⏳ No Casualties (3/3 alive)            │
│  ⏳ Swift Victory (8/12 turns)           │
│                                         │
│  REWARDS:                                │
│  • Scenario completion                   │
│  • +10 Dawnshield reputation             │
│  • (Secondary): +100 gold, greater potion│
│                                         │
│  [Track] [Abandon] [Close]               │
└─────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Data (4-6 hours)

1. Define quest types
2. Create quest catalog
3. Define all main scenario quests (10)
4. Define 10-15 side quests
5. Define 12 faction quests

### Phase 2: Systems (6-8 hours)

1. QuestManager class
2. Objective tracking
3. Progress updates
4. Reward distribution
5. State management

### Phase 3: UI (6-8 hours)

1. Quest log panel
2. Active quest tracker
3. Quest details view
4. Quest marker system
5. Notification system

### Phase 4: Integration (4-6 hours)

1. Integrate with scenarios
2. Integrate with dialogue
3. Integrate with combat
4. Integrate with save system
5. Testing

**Total**: 20-28 hours

**OR**: Use AI to generate quest catalog (6 hours for all quests)

---

## Quest Catalog Organization

### File Structure

```
client/src/data/quests/
├── main/                # Main scenario quests
│   ├── scenario-01.ts
│   ├── scenario-02.ts
│   └── ... (10 files)
│
├── side/                # Side quests
│   ├── desperate-refugee.ts
│   ├── lost-artifact.ts
│   └── ... (10-15 files)
│
├── faction/             # Faction quests
│   ├── crimson-pact-blood-oath.ts
│   ├── ironbound-memorial.ts
│   └── ... (12 files)
│
├── companion/           # Companion quests (if implemented)
│   └── umbra-redemption.ts
│
└── types.ts             # Quest interfaces
```

---

## See Also

- `scenarios.md` - Main quests ARE scenarios
- `dialogue-system.md` - Quest dialogue integration
- `storyboard.md` - Quest progression tracking
- `database.md` - Quest persistence
- `SYSTEMS_OVERVIEW.md` - Where quests fit overall

---

**Remember**: Quests give structure to scenarios. Even in tactical combat game, players need objectives beyond "kill everything."
