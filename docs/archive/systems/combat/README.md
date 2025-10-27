# Combat System

**Version**: 1.0  
**Status**: Delegated to Cursor Agent (TASK_02)  
**Last Updated**: 2025-10-22

## Overview

Turn-based tactical combat system for Realm-Walker. Implementation delegated to Cursor Agent Task 02.

## Core Design

### Three-Way Battles

**Unique Feature**: Combat involves 3 factions simultaneously

- Player faction
- Faction A (AI)
- Faction B (AI)

**Strategy**: Form temporary alliances, exploit enemy conflicts, balance power dynamics

### Army Composition

**Location**: `combat/ArmyComposite.gd`

Uses composite pattern for unit groups:

```gdscript
class_name ArmyComposite
extends CombatUnit

var _units: Array[CombatUnit] = []
```

**Purpose**: Group units into armies while maintaining individual unit control

### Combat Units

**Location**: `combat/CombatUnit.gd`

Base class for all combatants:

- Stats (HP, power, defense, speed)
- Abilities (attacks, buffs, debuffs)
- Status effects
- Faction alignment

## Ability System

**Location**: `combat/AbilitySystem.gd`

Manages ability execution:

- Targeting rules
- Range calculation
- Damage/effect resolution
- Cooldown tracking

**AbilityDef**: Resource defining abilities

- Name, description
- Cost (mana/action points)
- Effects (damage, healing, buffs)
- Target types (single, area, self)

## Combat Flow

### Turn Order

1. **Initiative Phase**: Calculate turn order by speed stat
2. **Action Phase**: Each unit takes action in order
3. **Resolution Phase**: Apply all effects
4. **Victory Check**: Check win/loss conditions

### Actions Available

- **Attack**: Deal damage to enemy
- **Defend**: Reduce incoming damage
- **Ability**: Use special ability
- **Item**: Use consumable
- **Wait**: Skip turn, increase initiative next round

## Test Scene

**Location**: `combat/test_ability_system.gd`

Test harness for combat mechanics:

- Spawn test units
- Execute test abilities
- Verify damage calculation
- Test status effects

**Note**: This is dev-time testing, not runtime gameplay. Cursor Agent Task 06 handles GUT integration tests.

## Delegation Status

**Cursor Agent Task 02**: Combat System Integration

- Status: Pending agent execution
- Deliverable: Complete combat system with test scene
- Integration: Hex movement (Task 01) + AI behaviors (Task 03)

See `.cursor/tasks/TASK_02_COMBAT_SYSTEM_INTEGRATION.md` for full spec.

## Architecture Pattern (from Research)

Based on Godot Open RPG combat system:

**Signal-Driven**:

```gdscript
signal health_changed(new_value)
signal ready_to_act
signal turn_started
signal turn_ended
signal ability_used(ability_name)
```

**State Machine**:

```gdscript
enum CombatState {
    IDLE,
    SELECTING_ACTION,
    ANIMATING,
    RESOLVING_EFFECTS,
    VICTORY,
    DEFEAT
}
```

**Composition over Inheritance**:

- Combat logic in scripts
- Stats in .tres resources
- Animations in PackedScenes

## Documentation Index

Related documentation:

- **Implementation Spec**: `.cursor/tasks/TASK_02_COMBAT_SYSTEM_INTEGRATION.md`
- **Ability Definitions**: `combat/AbilityDef.gd`
- **AI Integration**: See `docs/systems/ai/README.md`
- **Unit Stats**: Character/Guardian/NeutralDef resources

## Research References

Combat patterns from Godot Open RPG:

- **src/combat/battlers/battler.gd**: Signal-driven health/actions
- **src/combat/CombatAction.gd**: Turn-based action resolution
- **src/combat/active_turn_queue.gd**: Initiative queue management

Key finding: **Signals for everything.** Combat state changes emit signals that UI/AI can react to, keeping systems decoupled.
