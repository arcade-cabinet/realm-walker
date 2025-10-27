# Quest System: Boolean Flags Only

**Version**: 1.0 **FROZEN**

## Core Philosophy

No numerical systems. Everything is boolean quest progression.

## QuestManager

**Location**: `src/runtime/systems/QuestManager.ts`

### Purpose
Boolean flag-based quest progression with no numerical stats.

### Features
- Story flag management (e.g., "met_elder", "has_palace_key")
- Active/completed quest tracking
- A/B/C story thread progress counters
- Scene access gating based on flags

### Philosophy
Everything is boolean. No health, mana, XP, or inventory arrays. Items are flags.

## API Interface

```typescript
interface QuestManager {
  // Story progression flags
  storyFlags: Record<string, boolean>;  // "met_elder", "defeated_guardian_1", "has_palace_key"
  
  // Active quests
  activeQuests: string[];  // ["find_the_guardian", "explore_palace"]
  
  // Completed quests
  completedQuests: string[];  // ["character_selection", "city_exploration"]
  
  // Story thread progress (A/B/C stories)
  aStoryProgress: number;  // Guardian boons collected (0-9)
  bStoryProgress: number;  // Faction allies recruited (0-12)
  cStoryProgress: number;  // Ravens encounters handled (0-N)
}

interface QuestManagerAPI {
  setFlag(flag: string, value?: boolean): void;
  hasFlag(flag: string): boolean;
  startQuest(questId: string): void;
  completeQuest(questId: string): void;
  isQuestActive(questId: string): boolean;
  canAccessScene(sceneId: string): boolean;  // Check required flags
}
```

## Flag System

### Story Flags
Boolean flags that track story progression:
- `met_elder`: Player has spoken to the village elder
- `has_palace_key`: Player possesses the key to the palace
- `defeated_guardian_1`: Player has defeated the first guardian
- `carmilla_trusts_player`: Player has gained Carmilla's trust

### Quest States
Quests have three states:
- **Inactive**: Not yet started
- **Active**: Currently in progress
- **Completed**: Finished successfully

### Story Threads
Three parallel story threads tracked separately:
- **A Story**: Guardian boons and powers (0-9)
- **B Story**: Faction alliances and politics (0-12)
- **C Story**: Raven encounters and mysteries (0-N)

## Item System

### No Inventory Management
Quest items are just flags. "Has key" is `hasFlag("palace_key")`, not an inventory slot.

### Examples
```typescript
// Instead of inventory array
QuestManager.setFlag('has_palace_key', true);

// Check for item
if (QuestManager.hasFlag('has_palace_key')) {
  // Player has the key
}

// Use item (consumes it)
QuestManager.setFlag('has_palace_key', false);
```

## Door Unlocking

Doors check `requires_flags` before allowing passage:

```typescript
interface DoorState {
  target: string;
  locked: boolean;
  requires_flags?: string[];
}

// Door unlocks when all required flags are set
const canPass = door.requires_flags?.every(flag => QuestManager.hasFlag(flag)) ?? true;
```

## NPC Spawning

NPCs appear/disappear based on quest state, not random encounters:

```typescript
interface NPCPlacement {
  npc_id: string;
  dialogue?: string;
  quest?: string;
  requires_flags?: string[];
}

// NPC only appears if required flags are met
const shouldSpawn = npc.requires_flags?.every(flag => QuestManager.hasFlag(flag)) ?? true;
```

## Scene Access Gating

Scenes can require specific flags for access:

```typescript
interface SceneAccess {
  scene_id: string;
  requires_flags?: string[];
  blocks_flags?: string[];
}

// Check if player can access scene
const canAccess = QuestManager.canAccessScene('crimson_palace');
```

## Save/Load System

Quest state is persisted as JSON:

```typescript
interface QuestSaveData {
  storyFlags: Record<string, boolean>;
  activeQuests: string[];
  completedQuests: string[];
  aStoryProgress: number;
  bStoryProgress: number;
  cStoryProgress: number;
  timestamp: number;
}
```

## Integration with Other Systems

### StoryCompositor
Uses quest flags to determine which content to show:
- NPCs appear based on flag requirements
- Props spawn when quest items are needed
- Doors unlock when progression flags are set

### DialogueManager
Dialogue options can be gated by flags:
- Some dialogue only appears if certain flags are set
- Dialogue can set flags when completed
- Quest progression can trigger dialogue changes

### InteractionSystem
Interactions can be gated by flags:
- Some objects only become interactive with certain flags
- Interaction results can set flags
- Quest progression can unlock new interactions

## Testing

Quest system is thoroughly tested with unit tests covering:
- Flag setting and retrieval
- Quest state transitions
- Scene access gating
- Save/load functionality
- Integration with other systems

## Examples

### Basic Flag Usage
```typescript
// Set a flag
QuestManager.setFlag('met_elder', true);

// Check a flag
if (QuestManager.hasFlag('met_elder')) {
  console.log('Player has met the elder');
}

// Start a quest
QuestManager.startQuest('find_the_guardian');

// Complete a quest
QuestManager.completeQuest('find_the_guardian');
```

### Scene Access
```typescript
// Check if player can access a scene
if (QuestManager.canAccessScene('crimson_palace')) {
  // Load the scene
} else {
  // Show access denied message
}
```

### Quest Progression
```typescript
// A story progression
QuestManager.setFlag('defeated_guardian_1', true);
QuestManager.aStoryProgress++; // Now 1

// B story progression  
QuestManager.setFlag('gained_faction_trust', true);
QuestManager.bStoryProgress++; // Now 1
```