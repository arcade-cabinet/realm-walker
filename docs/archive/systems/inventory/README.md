# Inventory & Equipment System

**Version**: 1.0  
**Status**: Delegated to Cursor Agent (TASK_04)  
**Last Updated**: 2025-10-22

## Overview

Item, equipment, and consumable management system. Implementation delegated to Cursor Agent Task 04.

## Core Components

### InventoryManager

**Location**: `inventory/InventoryManager.gd`

Manages player inventory:

- Add/remove items
- Stack management
- Weight/capacity limits
- Item sorting and filtering

### EquipmentManager

**Location**: `inventory/EquipmentManager.gd`

Handles equipped items:

- Equipment slots (weapon, armor, accessories)
- Stat bonuses from equipment
- Equipment restrictions (class, level)
- Visual updates (character appearance)

### Item Types

**ItemDef** (base): Common item properties
**EquipmentDef** (extends ItemDef): Wearable items with stats
**ConsumableDef** (extends ItemDef): Single-use items with effects

## Item Effects System

**Location**: `inventory/ItemEffects.gd`

Defines item behaviors:

- Healing (restore HP)
- Buffs (temporary stat increases)
- Debuffs (cures negative effects)
- Utility (reveal map, teleport)

## Loot System

**Location**: `inventory/LootTableManager.gd`

Generates loot drops:

- Random item selection
- Rarity tiers (common, rare, legendary)
- Context-aware (faction-specific loot)
- Scaling rewards (player level)

## Resource Structure

All item types extend ItemDef:

```gdscript
class_name ItemDef
extends Resource

@export var item_name: String
@export var description: String
@export var icon: Texture2D
@export var max_stack: int = 1
@export var value: int = 0
@export var rarity: Rarity
```

## Delegation Status

**Cursor Agent Task 04**: Inventory & Equipment System

- Status: Pending agent execution
- Deliverable: Complete inventory system
- Integration: UI (Task 05) + Combat stats (Task 02)

See `.cursor/tasks/TASK_04_INVENTORY_EQUIPMENT_SYSTEM.md` for full spec.

## Documentation Index

Related documentation:

- **Implementation Spec**: `.cursor/tasks/TASK_04_INVENTORY_EQUIPMENT_SYSTEM.md`
- **Item Definitions**: `inventory/*.gd` resource classes
- **UI Integration**: See `docs/systems/ui/README.md`
