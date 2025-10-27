# Testing System

**Version**: 1.0  
**Status**: Delegated to Cursor Agent (TASK_06)  
**Last Updated**: 2025-10-22

## Overview

Testing infrastructure using GUT (Godot Unit Test) addon. Implementation delegated to Cursor Agent Task 06.

## Testing Framework

### GUT Integration

**Addon**: GUT (Godot Unit Test)
**Purpose**: Unit and integration testing for GDScript

**Why GUT**: Industry standard for Godot testing, supports:

- Unit tests for individual functions
- Integration tests for system interactions
- Test doubles (mocks, stubs, spies)
- Scene testing
- Signal testing

## Test Structure

**Location**: `tests/`

```
tests/
├── unit/
│   ├── test_combat_unit.gd
│   ├── test_hex_coord.gd
│   └── test_ability_system.gd
├── integration/
│   ├── test_asset_loading.gd
│   ├── test_combat_flow.gd
│   └── test_save_system.gd
└── gut_config.tres
```

## Test Categories

### Unit Tests

Test individual classes in isolation:

- Combat calculations
- Hex coordinate math
- Ability effect resolution
- Inventory operations

### Integration Tests

Test system interactions:

- Asset loading + caching
- Combat system + AI
- Save/load cycle
- UI + game state sync

### Scene Tests

Test Godot scenes:

- Character spawning
- Field map loading
- UI instantiation
- Cutscene playback

## Delegation Status

**Cursor Agent Task 06**: GUT Integration Tests

- Status: Pending agent execution
- Deliverable: Complete test suite with coverage
- Integration: All systems (Tasks 01-05)

See `.cursor/tasks/TASK_06_GUT_INTEGRATION_TESTS.md` for full spec.

## Test Patterns

### Basic Unit Test

```gdscript
extends GutTest

func test_hex_distance_calculation():
    var coord_a = HexCoord.new(0, 0)
    var coord_b = HexCoord.new(3, 4)
    assert_eq(coord_a.distance_to(coord_b), 7)
```

### Integration Test with Scene

```gdscript
extends GutTest

func test_combat_unit_spawning():
    var scene = load("res://combat/combat_unit.tscn")
    var unit = scene.instantiate()
    add_child_autofree(unit)
    assert_not_null(unit.get_node("Mesh"))
```

### Signal Testing

```gdscript
extends GutTest

func test_health_changed_signal():
    var unit = CombatUnit.new()
    watch_signals(unit)
    unit.take_damage(10)
    assert_signal_emitted(unit, "health_changed")
```

## Documentation Index

Related documentation:

- **Implementation Spec**: `.cursor/tasks/TASK_06_GUT_INTEGRATION_TESTS.md`
- **GUT Addon**: See GUT documentation for framework details
- **Test Coverage**: Target 80% for core systems

## Key Principle

**Test behavior, not implementation.** Focus on what systems do, not how they do it.
