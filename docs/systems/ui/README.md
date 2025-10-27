# UI System

**Version**: 1.0  
**Status**: Delegated to Cursor Agent (TASK_05)  
**Last Updated**: 2025-10-22

## Overview

User interface system using PackedScenes for modular UI components. Implementation delegated to Cursor Agent Task 05.

## Core Architecture

### UIBus (Signal Hub)

**Location**: `autoload/UIBus.gd`

Central event bus for UI communication:

```gdscript
signal inventory_opened
signal dialogue_started(dialogue_id: String)
signal combat_hud_updated(stats: Dictionary)
signal notification_shown(message: String)
```

**Purpose**: Decouple UI from game logic - systems emit to UIBus, UI components subscribe.

### PackedScene Pattern

**Why PackedScenes**: Research shows Godot projects prefer instancing .tscn files over runtime UI generation.

**Structure**:

```
ui/
├── hud/
│   ├── combat_hud.tscn
│   ├── field_hud.tscn
│   └── minimap.tscn
├── menus/
│   ├── main_menu.tscn
│   ├── pause_menu.tscn
│   └── settings_menu.tscn
└── dialogue/
    └── dialogue_balloon.tscn
```

## UI Components

### HUD Elements

- **Combat HUD**: HP, abilities, turn order
- **Field HUD**: Minimap, quest tracker, controls
- **Status Display**: Buffs, debuffs, notifications

### Menus

- **Main Menu**: New game, continue, settings
- **Pause Menu**: Resume, save, quit
- **Inventory Menu**: Items, equipment, stats
- **Quest Journal**: Active quests, completed quests

### Dialogue System UI

Uses Dialogue Manager addon:

- Dialogue balloon (speech bubbles)
- Choice buttons
- Speaker portraits
- Text animations

## Delegation Status

**Cursor Agent Task 05**: UI PackedScenes Refactor

- Status: Pending agent execution
- Deliverable: All UI as reusable PackedScenes
- Integration: UIBus signal architecture

See `.cursor/tasks/TASK_05_UI_PACKEDSCENES_REFACTOR.md` for full spec.

## Architecture Pattern (from Research)

### Signal-Driven UI Updates

```gdscript
# In HUD component
extends Control

func _ready() -> void:
    UIBus.combat_hud_updated.connect(_on_combat_hud_updated)

func _on_combat_hud_updated(stats: Dictionary) -> void:
    health_bar.value = stats.hp
    mana_bar.value = stats.mana
```

### PackedScene Instancing

```gdscript
# In UI manager
const DIALOGUE_BALLOON = preload("res://ui/dialogue/dialogue_balloon.tscn")

func show_dialogue(dialogue_id: String) -> void:
    var balloon = DIALOGUE_BALLOON.instantiate()
    add_child(balloon)
    balloon.start_dialogue(dialogue_id)
```

## Documentation Index

Related documentation:

- **Implementation Spec**: `.cursor/tasks/TASK_05_UI_PACKEDSCENES_REFACTOR.md`
- **UIBus**: `autoload/UIBus.gd`
- **Dialogue Integration**: See `docs/systems/dialogue/README.md`

## Research References

UI patterns from Godot projects:

- **Godot Open RPG**: Signal-based UI updates
- **General Pattern**: PackedScenes for all UI, no runtime generation

Key finding: **Signals + PackedScenes = clean UI architecture.** No manual Control node creation.
