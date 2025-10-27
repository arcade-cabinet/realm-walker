# AI Behaviors - Pathfinding & Enemy Intelligence

**Version**: 1.0  
**Status**: Canonical Architecture  
**Last Updated**: 2025-10-15

---

## Overview

**Engine**: Yuka.js  
**Purpose**: Enemy AI, pathfinding, tactical behaviors  
**NOT**: Player character AI (player-controlled)

---

## Yuka.js Integration

### Why Yuka

**Yuka.js** is a JavaScript library for game AI:
- Steering behaviors (seek, flee, wander)
- Pathfinding (A*, navigation meshes)
- Goal-oriented behavior
- State machines
- Perception systems

**Perfect for**: Tactical hex combat AI

### Core Systems

**Pathfinding**:
```typescript
import { NavMesh, AStar } from 'yuka';

// Create navigation mesh from hex grid
const navMesh = createNavMeshFromHexGrid(hexGrid);

// Find path between hexes
const path = AStar.search(navMesh, startHex, targetHex);
```

**Steering**:
```typescript
import { Vehicle, SeekBehavior, FleeBehavior } from 'yuka';

const enemy = new Vehicle();

// Seek player if aggressive
enemy.steering.add(new SeekBehavior(playerPosition));

// Flee if low HP
if (enemy.hp < enemy.maxHp * 0.3) {
  enemy.steering.clear();
  enemy.steering.add(new FleeBehavior(playerPosition));
}
```

---

## Enemy AI Behaviors

### Behavior Types

**Aggressive**:
- Seeks nearest enemy
- Prioritizes low HP targets
- Uses abilities on cooldown
- Fights until death

**Defensive**:
- Holds position near objective
- Only attacks if approached
- Prioritizes staying near allies
- Retreats if outnumbered

**Tactical**:
- Evaluates threat levels
- Focuses fire on dangerous targets
- Uses terrain for cover
- Coordinates with allies

**Cowardly**:
- Flees if outnumbered
- Attacks from maximum range
- Runs when HP < 50%
- Seeks allies for protection

### Faction-Specific Behaviors

**Crimson Pact**:
- Chess-like positioning
- Sacrifices thralls strategically
- Carmilla stays back, uses abilities
- Protects leader at all costs

**Ironbound Covenant**:
- Shield wall formations
- Protects weakest ally
- Never abandons position
- Thrain leads from front

**Veilbound Synod**:
- Spread out (avoid AOE)
- Focus fire coordination
- Mind control priority targets
- Shadowblade flanks, others support

**Dawnshield Order**:
- Defensive clustering
- Protects healer (Sanctifier)
- Vanguard tanks, others DPS
- Never retreat

---

## Pathfinding System

### Hex Grid Navigation

**A* Algorithm** on hex grid:

```typescript
interface HexNode {
  q: number;  // Hex coordinate
  r: number;  // Hex coordinate
  walkable: boolean;
  movementCost: number;  // Terrain cost
}

function findPath(start: HexNode, goal: HexNode, grid: HexNode[][]): HexNode[] {
  // A* implementation
  const openSet = [start];
  const cameFrom = new Map<HexNode, HexNode>();
  
  const gScore = new Map<HexNode, number>();
  gScore.set(start, 0);
  
  const fScore = new Map<HexNode, number>();
  fScore.set(start, heuristic(start, goal));
  
  while (openSet.length > 0) {
    const current = openSet.reduce((best, node) => 
      fScore.get(node)! < fScore.get(best)! ? node : best
    );
    
    if (current === goal) {
      return reconstructPath(cameFrom, current);
    }
    
    openSet.splice(openSet.indexOf(current), 1);
    
    for (const neighbor of getNeighbors(current, grid)) {
      const tentativeG = gScore.get(current)! + neighbor.movementCost;
      
      if (tentativeG < (gScore.get(neighbor) || Infinity)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeG);
        fScore.set(neighbor, tentativeG + heuristic(neighbor, goal));
        
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }
  
  return []; // No path found
}
```

### Movement Costs

**Terrain modifiers**:
- Grassland: 1.0 (baseline)
- Forest: 1.5 (dense)
- Mountain: 2.0 (steep)
- Road: 0.75 (fast)
- Water: Infinity (impassable for most)
- Sacred Ground: 1.0 (Veilbound fear penalty)

**Unit modifiers**:
- Cavalry: +50% speed on grassland
- Infantry: Normal
- Flyers: Ignore terrain (not implemented yet)

---

## Threat Assessment

### Target Selection

**Enemy AI evaluates**:

```typescript
function selectTarget(enemy: Unit, visibleTargets: Unit[]): Unit | null {
  const threats = visibleTargets.map(target => ({
    unit: target,
    threatScore: calculateThreatScore(enemy, target)
  }));
  
  // Sort by threat (descending)
  threats.sort((a, b) => b.threatScore - a.threatScore);
  
  return threats[0]?.unit || null;
}

function calculateThreatScore(enemy: Unit, target: Unit): number {
  let score = 0;
  
  // Low HP targets (easier kills)
  score += (1 - (target.hp / target.maxHp)) * 30;
  
  // High damage targets (dangerous)
  score += target.atk * 2;
  
  // Healers (priority targets)
  if (target.role === 'healer') score += 40;
  
  // Distance (prefer closer)
  const distance = hexDistance(enemy.hex, target.hex);
  score += (10 - distance) * 5;
  
  // In range (can attack this turn)
  if (distance <= enemy.range) score += 20;
  
  return score;
}
```

### Ability Usage

**When to use abilities**:

```typescript
function shouldUseAbility(enemy: Unit, ability: Ability, target: Unit): boolean {
  // Check cooldown
  if (ability.currentCooldown > 0) return false;
  
  // Check range
  const distance = hexDistance(enemy.hex, target.hex);
  if (distance > ability.range) return false;
  
  // Check effectiveness
  const damage = calculateDamage(enemy, target, ability);
  const killChance = damage / target.hp;
  
  // Use if can kill
  if (killChance >= 1.0) return true;
  
  // Use if high damage
  if (damage > target.hp * 0.5) return true;
  
  // Save for better opportunity
  return false;
}
```

---

## Formation System

### Squad Behaviors

**Formations** = Coordinated positioning

```typescript
interface Formation {
  type: 'line' | 'wedge' | 'circle' | 'scatter';
  leader: Unit;
  members: Unit[];
  spacing: number;  // Hexes between units
}

function maintainFormation(formation: Formation) {
  const targetPositions = calculateFormationPositions(formation);
  
  for (let i = 0; i < formation.members.length; i++) {
    const unit = formation.members[i];
    const target = targetPositions[i];
    
    // Move toward formation position
    if (!unit.isInPosition(target)) {
      unit.moveTo(target);
    }
  }
}
```

**Formation Types**:

- **Line**: Units in horizontal row (defensive)
- **Wedge**: Triangle formation (offensive push)
- **Circle**: Surround objective (defensive)
- **Scatter**: Spread out (avoid AOE)

### Faction Formations

**Dawnshield Order**: Defensive line
- Vanguard front center
- Sanctifier behind Vanguard
- Sentinel flanking left/right

**Veilbound Synod**: Scattered assault
- Shadowblade flanks
- Voidcaller center back
- Silencer far back

**Ironbound Covenant**: Shield wall
- All units in tight line
- Overlapping shields (+defense)
- Advance as unit

---

## Difficulty Scaling

### Easy Mode

**AI Handicaps**:
- 20% reduced stats
- Only uses basic abilities
- Poor target selection (random)
- No formation behaviors
- Delayed reactions (1 turn)

### Normal Mode

**Balanced AI**:
- Full stats
- Uses all abilities
- Smart target selection
- Formation behaviors
- Immediate reactions

### Hard Mode

**Enhanced AI**:
- 20% increased stats
- Perfect ability timing
- Optimal target selection
- Advanced formations
- Predicts player moves (1 turn ahead)

---

## Pathfinding Optimization

### Performance Considerations

**Problem**: A* on every enemy every turn = expensive

**Solutions**:

**1. Path Caching**:
```typescript
const pathCache = new Map<string, HexNode[]>();

function getCachedPath(start: HexNode, goal: HexNode): HexNode[] | null {
  const key = `${start.q},${start.r}->${goal.q},${goal.r}`;
  return pathCache.get(key) || null;
}
```

**2. Incremental Updates**:
```typescript
// Only recalculate if target moved significantly
if (hexDistance(lastTarget, currentTarget) > 3) {
  path = findPath(enemy.hex, currentTarget);
} else {
  // Use cached path
}
```

**3. Grid Chunking**:
```typescript
// Divide grid into chunks, pathfind between chunks first
const chunkPath = findChunkPath(startChunk, goalChunk);
const detailedPath = refinePath(chunkPath);
```

---

## Random Encounters (Removed)

**Old System**: Pressure-based random spawns

**Current**: Fixed scenario enemies only  
**Why**: Scenarios are hand-crafted, no exploration

**If re-implementing**:
- See `_archive_legacy_docs/old_game_implementation/client/src/data/biome-monster-compatibility.ts`
- Decouples monster types from implementation
- Clean design for what spawns where

**But**: NOT needed for scenario-based game

---

## Boss AI

### Multi-Phase Bosses

**Example: Seraph (Final Boss)**

**Phase 1** (100-75% HP):
- Normal attacks
- Basic void magic
- Summons weak adds

**Phase 2** (75-50% HP):
- Enhanced abilities
- Summons stronger adds
- Uses environment hazards

**Phase 3** (50-25% HP):
- Desperate tactics
- AOE spam
- Sacrifices adds for power

**Phase 4** (25-0% HP):
- Ultimate abilities unlocked
- Invulnerability phases
- Reality-warping attacks

**Implementation**:
```typescript
class SeraphBossAI {
  currentPhase = 1;
  
  update() {
    const hpPercent = this.hp / this.maxHp;
    
    // Phase transitions
    if (hpPercent < 0.75 && this.currentPhase === 1) {
      this.transitionToPhase2();
    }
    else if (hpPercent < 0.50 && this.currentPhase === 2) {
      this.transitionToPhase3();
    }
    else if (hpPercent < 0.25 && this.currentPhase === 3) {
      this.transitionToPhase4();
    }
    
    // Execute phase-specific behavior
    this.executePhase(this.currentPhase);
  }
}
```

---

## Debugging AI

### Visualization

**During development**:
- Show pathfinding debug lines
- Display threat scores over units
- Visualize formation target positions
- Show AI decision reasoning

**Debug Commands**:
```typescript
// Toggle AI debug overlay
toggleAIDebug();

// Step through AI decisions
stepAIDecision(enemyId);

// Force AI to use specific ability
forceAbility(enemyId, abilityId);
```

### AI Testing

**Scenarios**:
- Test each faction's behavior
- Verify formation maintenance
- Check target prioritization
- Validate ability usage

**Metrics**:
- AI win rate (should be ~40-50% on normal)
- Average battle duration (10-15 minutes target)
- Ability usage efficiency (no wasted cooldowns)

---

## See Also

- `COMBAT_SYSTEMS.md` - Combat mechanics AI uses
- `scenarios.md` - Where AI operates
- `ECS_ARCHITECTURE.md` - How AI integrates with ECS
- `../lore/01_FACTIONS.md` - Faction behaviors context

---

**Remember**: AI should be challenging but fair. If it's perfect, it's no fun. If it's stupid, it's no challenge. Target: 40-50% AI win rate on normal difficulty.
