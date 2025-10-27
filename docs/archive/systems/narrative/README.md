# Narrative System

**Version**: 1.0  
**Status**: Content Ready, Integration Pending  
**Last Updated**: 2025-10-22

## Overview

450,000 words of narrative content organized across 4 acts, with branching dialogue, cutscenes, and player choices.

## Content Structure

### Narrative Acts

**Location**: `narrative/acts/`

```
narrative/acts/
├── act1_dying_world/          # 1968 modern setting
├── act2_guardians_burden/     # 8 Guardian encounters
├── act3_time_walking/         # 8 ages × 12 realms
└── act4_convergence/          # Final choice sequence
```

### Story Progression

**Location**: `autoload/StoryProgression.gd`

Tracks player progress:

- Current act/chapter
- Completed quests
- Dialogue choices made
- Relationships (faction reputation)
- Guardian reveals discovered

### Cutscene System

**Location**: `scenes/cutscenes/`

FMV-style cutscenes for major story moments:

- Guardian mythology reveals (8 cutscenes needed)
- Act transitions
- Ending sequences

Uses FMVCutscene.gd as base class.

## Narrative Integration

### Markdown Content

**Format**: RWMD (Realm-Walker Markdown)

Narrative stored as .md files with YAML frontmatter:

```markdown
---
anchor: "@dialogue:guardian_river_sage_truth"
speaker: "River Sage"
mood: "sorrowful"
---

The Compact has a flaw. The guardians... we were never meant to be eternal.
```

**Display**: MarkdownLabel addon renders formatted narrative

### Dialogue System

**Location**: `dialogue/DialogueController.gd`

Uses Dialogue Manager addon:

- Branching choices
- Conditional responses (based on reputation)
- Variable substitution
- Save/load dialogue state

### Character Definitions

**Location**: `narrative/characters/`

Character profiles with:

- Personality traits
- Motivations
- Relationships
- Dialogue voice guidelines

## Content Inventory

### Completed

- 450k words of narrative across all acts
- Character personality profiles
- Guardian mythology framework
- Faction lore documents

### Needed

- 8 Guardian revelation cutscenes
- Dialogue tree integration with StoryProgression
- Field map placement of story triggers
- Voice direction notes for actors (future)

## Integration Pattern

### Story Trigger System

```gdscript
# In field maps
extends Node3D

@export var story_trigger_id: String = "guardian_river_sage_encounter"

func _on_player_entered() -> void:
    if not StoryProgression.is_completed(story_trigger_id):
        StoryProgression.trigger_event(story_trigger_id)
        # Load cutscene or dialogue
```

### Dialogue Flow

```gdscript
# DialogueController pattern
func start_dialogue(dialogue_id: String) -> void:
    var dialogue_data = load("res://narrative/dialogue/%s.dialogue" % dialogue_id)
    DialogueManager.show_dialogue_balloon(dialogue_data)
```

## Documentation Index

Related documentation:

- **Content Templates**: `docs/FIELD_MAP_TEMPLATES.md`
- **Integration Guide**: `docs/NARRATIVE_INTEGRATION_GUIDE.md`
- **Cutscenes**: `docs/GUARDIAN_CUTSCENES_INTEGRATION.md`
- **Story Files**: See `narrative/acts/` for complete content
- **Lore**: See `docs/lore/` and `docs/story/` for worldbuilding

## Research References

Narrative patterns from Godot projects:

- **Godot Open RPG**: Uses dialogue balloon system
- **Dialogue Manager Addon**: Industry-standard branching dialogue
- **MarkdownLabel Addon**: For formatted narrative display

Key finding: **Separate content from code.** Narrative in .md/.dialogue files, not hardcoded strings.
