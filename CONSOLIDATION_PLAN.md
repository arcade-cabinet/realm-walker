# Architecture Documentation Consolidation Plan

## Current State
- **docs/systems/** - 21 files from old Godot implementation
- **docs/architecture/** - 11 files, mix of new and adapted

## Consolidation Strategy

### Phase 1: Core Architecture (RWMD & Composition)
**Consolidate:**
- `systems/01_ARCHITECTURE.md` (4-layer composition)
- `architecture/compositor-pattern.md` (3-tier Story→Scene→Game)
- `architecture/rwmd-parser.md` (RWMD syntax)

**Into:** `architecture/core-architecture.md` (FROZEN)
- Combines 4-layer RWMD composition with 3-tier runtime compositors
- Anchor-based references
- RWMD as declarative content, TypeScript as execution engine

### Phase 2: Temporal & Chronology System
**Consolidate:**
- `systems/CHRONOLOGY_SYSTEM_GODOT.md`
- `systems/TEMPORAL_SYSTEM_SPEC.md`

**Into:** `architecture/temporal-system.md` (FROZEN)
- Event/Span/Age hierarchy
- 50,000-year timeline
- Boon-based time travel unlocking
- World state progression

### Phase 3: AI & NPC Systems
**Consolidate:**
- `systems/AI_BEHAVIORS_GODOT.md` (LimboAI behavior trees)
- `systems/AI_NAV_AND_STEERING_GODOT.md` (Yuka/LimboAI)
- `systems/ai-behaviors.md`
- `architecture/third-party-integrations.md` (Yuka section)

**Into:** `architecture/ai-npc-system.md` (FROZEN)
- Yuka.js steering behaviors (Node.js/TypeScript)
- Persona system for faction leaders
- NPCController/NPCManager
- GridSystem with pathfinding
- Blackboard pattern for AI state

### Phase 4: Dialogue System
**Consolidate:**
- `systems/DIALOGUE_SYSTEM_GODOT.md`
- `systems/dialogue-system.md`
- Part of `architecture/combat-guardian-systems.md` (dialogue combat)

**Into:** `architecture/dialogue-system.md` (FROZEN)
- Branching dialogue trees
- Flag-gated choices
- Reputation system
- Monkey Island dialogue combat (Ravens)
- Integration with quest system

### Phase 5: Quest & Narrative Systems
**Consolidate:**
- `systems/quest_taxonomy.md`
- `systems/quests.md`
- `architecture/quest-system.md`
- `systems/narrative/README.md`

**Into:** `architecture/quest-narrative-system.md` (FROZEN)
- Boolean flag progression
- A/B/C story threads
- Quest objectives and completion
- Story binding to scenes
- Mythology echoes

### Phase 6: Guardian Unmaking System
**Consolidate:**
- `systems/GUARDIAN_CUTSCENES_INTEGRATION.md`
- `design/GUARDIAN_UNMAKING_SYSTEM.md`
- Part of `architecture/combat-guardian-systems.md`

**Into:** `architecture/guardian-unmaking-system.md` (FROZEN)
- Ritual sequence design
- All 8 Guardian unmakings
- Moral choice patterns
- Boon granting
- Mythology reveals

### Phase 7: Combat System
**Keep & Enhance:**
- `architecture/combat-guardian-systems.md`
- `systems/combat/README.md`

**Into:** `architecture/combat-system.md` (FROZEN)
- Strategic combat (general-observer)
- Persona-based AI
- Binary tactical choices
- Flag-based outcomes
- Separate from Guardian unmakings

### Phase 8: Scene & Content Systems
**Consolidate:**
- `architecture/scene-transitions.md`
- `architecture/content-import.md`
- `systems/TILEMAP_AND_CHUNKING_GODOT.md`

**Into:** `architecture/scene-content-system.md` (FROZEN)
- Scene loading and transitions
- RWMD → parsed scene
- Story binding application
- Asset loading
- Grid-based spatial system (not hex, not tilemap chunks)

### Phase 9: UI & Player Systems
**Consolidate:**
- `systems/ui/README.md`
- `systems/character-creation.md`
- `systems/inventory/README.md`

**Into:** `architecture/ui-player-systems.md` (FROZEN)
- Production HUD
- Dialogue UI
- Quest Log UI
- Character selection (12 playable characters)
- Inventory (minimal, no grinding)

### Phase 10: Testing & Development
**Consolidate:**
- `systems/testing/README.md`
- `systems/storyboard.md`

**Into:** `architecture/testing-development.md` (FROZEN)
- Unit test patterns
- Integration test patterns
- E2E test patterns
- Development workflows

## Cleanup Actions
**Delete after consolidation:**
- All `docs/systems/` files (move to archive or delete)
- `docs/systems/assets/README.md` (covered in content-import)

**Keep in /systems/ (reference only):**
- Move to `docs/reference/godot-patterns/` (for historical context)

## Final Architecture Structure
```
docs/architecture/
├── core-architecture.md (FROZEN v1.0)
├── temporal-system.md (FROZEN v1.0)
├── ai-npc-system.md (FROZEN v1.0)
├── dialogue-system.md (FROZEN v1.0)
├── quest-narrative-system.md (FROZEN v1.0)
├── guardian-unmaking-system.md (FROZEN v1.0)
├── combat-system.md (FROZEN v1.0)
├── scene-content-system.md (FROZEN v1.0)
├── ui-player-systems.md (FROZEN v1.0)
├── testing-development.md (FROZEN v1.0)
├── type-system.md (EXISTING, review)
├── data-flow.md (EXISTING, review)
├── PRODUCTION_CODE_AUDIT.md (KEEP)
└── INTEGRATION_ROADMAP.md (KEEP)
```

## Cross-References
Each architecture doc includes:
- Version + FROZEN status
- Related documents
- Implementation files
- Test files
- Dependencies

## Success Criteria
- ✅ No duplication across docs
- ✅ Clear Godot→Node.js adaptations
- ✅ All systems have frozen specs
- ✅ Integration points documented
- ✅ Test coverage specified
- ✅ Old systems/ directory cleaned up

## Timeline
- **Today**: Execute consolidation
- **Review**: User approval on frozen specs
- **Implement**: Follow INTEGRATION_ROADMAP.md
