# AI System

**Version**: 1.0  
**Status**: Delegated to Cursor Agent (TASK_03)  
**Last Updated**: 2025-10-22

## Overview

AI behavior system for Realm-Walker NPCs and enemies. Uses LimboAI addon for behavior trees. Implementation delegated to Cursor Agent Task 03.

## Core Architecture

### LimboAI Integration

**Addon**: LimboAI behavior tree system
**Purpose**: Visual behavior tree editor for NPC AI

**Why LimboAI**: Research shows Godot projects prefer visual behavior trees over code-heavy AI systems. Allows designers to modify AI without programming.

### Behavior Trees

**Structure**:

```
Root (Selector)
├── Combat Behavior (Sequence)
│   ├── Check Enemy in Range
│   ├── Select Target
│   └── Execute Attack
├── Patrol Behavior (Sequence)
│   ├── Check No Enemies
│   └── Move to Next Waypoint
└── Idle Behavior
    └── Play Idle Animation
```

### AI Behavior Base Class

**Location**: `ai/AIBehavior.gd`

Base class for AI-controlled units:

```gdscript
class_name AIBehavior
extends Node

@export var behavior_tree: BehaviorTree
@export var detection_range: float = 10.0
@export var attack_range: float = 3.0
```

## Navigation System

### Godot NavigationServer3D

Uses built-in Godot navigation:

- NavigationRegion3D for walkable areas
- NavigationAgent3D for pathfinding
- Avoidance for multi-agent coordination

**Why**: Research shows Godot's built-in navigation is sufficient for most games. No need for custom pathfinding.

### Integration with Hex Grid

**Challenge**: Hex grid movement + continuous navigation
**Solution**:

1. NavigationMesh baked to hex centers
2. AIBehavior converts continuous path to hex tiles
3. Movement snaps to hex centers

## AI States

### Combat AI

**Behaviors**:

- Assess threat levels (3-way battle awareness)
- Target selection (weakest, strongest, closest)
- Ability usage (offensive, defensive, support)
- Tactical positioning (flanking, cover)
- Alliance formation (temporary truces)

### Field AI

**Behaviors**:

- Patrol routes
- Random wandering
- Fleeing from player
- Approaching player (friendly)
- Guarding locations

### Dialogue AI

**Behaviors**:

- Initiating conversation
- Responding to player proximity
- Quest offering
- Trading

## Delegation Status

**Cursor Agent Task 03**: AI Integration with LimboAI

- Status: Pending agent execution
- Deliverable: Complete AI system with behavior trees
- Integration: Combat system (Task 02) + Navigation

See `.cursor/tasks/TASK_03_AI_INTEGRATION_LIMBOAI.md` for full spec.

## Architecture Pattern (from Research)

Based on analysis of Godot AI projects:

### Steering Behaviors

```gdscript
# Simple seek behavior
func seek(target_position: Vector3) -> Vector3:
    var desired_velocity = (target_position - global_position).normalized() * max_speed
    return desired_velocity - velocity
```

### State Machine Pattern

```gdscript
enum AIState {
    IDLE,
    PATROL,
    CHASE,
    ATTACK,
    FLEE
}

var current_state: AIState = AIState.IDLE
```

### Signal-Driven Coordination

```gdscript
signal enemy_detected(enemy: Node3D)
signal target_lost
signal damage_taken(amount: int)
signal ally_needs_help(position: Vector3)
```

## Three-Way Battle AI

**Unique Challenge**: AI must handle 3-faction combat

### Alliance System

```gdscript
func evaluate_alliance_opportunity() -> void:
    var player_threat = assess_threat(player_faction)
    var faction_a_threat = assess_threat(faction_a)
    var faction_b_threat = assess_threat(faction_b)

    if player_threat > faction_a_threat + faction_b_threat:
        # Form temporary alliance against player
        propose_truce(weaker_ai_faction)
```

### Target Priority

1. Immediate threats (attacking me now)
2. Weakest faction (opportunistic elimination)
3. Strongest faction (power balance)
4. Player (if mission requires)

## Documentation Index

Related documentation:

- **Implementation Spec**: `.cursor/tasks/TASK_03_AI_INTEGRATION_LIMBOAI.md`
- **Navigation**: `docs/AI_NAV_AND_STEERING_GODOT.md`
- **Behavior Patterns**: `docs/AI_BEHAVIORS_GODOT.md`
- **Combat Integration**: See `docs/systems/combat/README.md`

## Research References

AI patterns from analyzed projects:

- **Godot Open RPG**: Uses state machines for field AI
- **3D Platformer**: Simple chase/flee behaviors
- **General Pattern**: Keep AI simple, use Godot's built-in tools

Key finding: **Don't over-engineer.** Most Godot games use simple state machines or behavior trees, not complex AI architectures.
