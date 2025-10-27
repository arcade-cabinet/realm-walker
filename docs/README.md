# Realm Walker Story Documentation

**Last Updated**: 2025-10-27  
**Status**: Documentation consolidated to north star principles

---

## Authority Documents (READ THESE FIRST)

These TWO documents are the SINGLE SOURCE OF TRUTH for all implementation:

### 1. `/docs/architecture.md` - Technical Specification
**Version**: 1.0 **FROZEN**

Complete technical architecture including:
- Three-tier compositor pattern (Scene → Story → Game)
- All runtime systems specifications
- Data flow and integration patterns
- Production status and critical misalignments
- Integration roadmap

**Read this for**: Technical implementation details, system specifications, architecture patterns

### 2. `/docs/design.md` - Game Design Specification
**Version**: 1.0 **FROZEN**

Complete game design including:
- Core gameplay loops and mechanics
- Narrative structure (A/B/C story threads)
- Combat system design (general-observer + dialogue combat)
- Guardian unmaking system
- World building, factions, and lore summary
- Visual style and art direction

**Read this for**: Game design, narrative structure, gameplay mechanics

---

## Memory Bank (Context for Next Agent)

Located at: `.cursor/projects/workspace/agent-notes/shared/`

**Read ALL of these files in order**:

1. **projectbrief.md** - Project overview and success criteria
2. **productContext.md** - Why it exists, how it works, user experience goals
3. **systemPatterns.md** - Architecture patterns and implementation paths
4. **techContext.md** - Technology stack, build config, development tools
5. **activeContext.md** - Current work focus and next steps
6. **progress.md** - What works, what's left, known issues

**Purpose**: Provides complete context for next agent to continue work without ramp-up time.

---

## Reference Documents (Historical Context Only)

### Canonical Story Bible
**Location**: `/docs/design/CANONICAL_STORY_BIBLE.md`

Complete lore bible with:
- Primordial mythology (Creator/Destroyer)
- 8 Guardian spirits
- 12 factions (6 light, 6 dark, 4 neutral)
- Chapter-by-chapter breakdown
- Endings based on completion

**Status**: FROZEN v3.0 - Reference for narrative content creation

**Use for**: Lore consistency, character details, faction information

### Git History
All previous documentation versions are preserved in git history. The archive directory has been removed since:
- All architectural content is consolidated in `architecture.md`
- All design content is consolidated in `design.md`
- All detailed lore is in `CANONICAL_STORY_BIBLE.md`
- Git provides full historical context when needed

---

## Quick Start for Next Agent

### 1. Understand the Vision (30 minutes)
```bash
# Read the two north star documents
cat docs/architecture.md    # Technical specification
cat docs/design.md          # Game design specification
```

### 2. Get Context (30 minutes)
```bash
# Read memory bank in order (from project root)
cd .cursor/projects/workspace/agent-notes/shared/
cat projectbrief.md         # Overview
cat productContext.md       # Product vision
cat systemPatterns.md       # Architecture patterns
cat techContext.md          # Tech stack
cat activeContext.md        # Current state
cat progress.md             # What's done/left
```

### 3. Review Codebase (1 hour)
```bash
# Core systems (production-ready)
src/runtime/systems/SceneCompositor.ts
src/runtime/systems/StoryCompositor.ts
src/runtime/systems/GameCompositor.ts
src/runtime/systems/QuestManager.ts

# Production game entry point
src/ProductionGame.ts

# Type definitions
src/types/
```

### 4. Identify Next Work (15 minutes)
```bash
# Three critical misalignments to fix:
# 1. Guardian Unmaking System - MISSING (blocks Chapter 1)
# 2. Combat System - MISSING (blocks gameplay)
# 3. NPC AI - DISCONNECTED (needs wiring)

# Choose integration path (see activeContext.md)
```

### 5. Start Building (Begin work)
```bash
# Recommendation: Start with Guardian Unmakings
# - Design complete (see design.md)
# - Blocks MVP (Chapter 1)
# - Clear implementation path (see systemPatterns.md)

# Create GuardianUnmakingManager.ts
# Create BoonSystem.ts
# Integrate with QuestManager
```

---

## Critical Constraints (IMMUTABLE)

1. **Three-tier pattern** - NEVER violate layer boundaries
2. **Boolean flags only** - NO numerical stats (HP/XP/levels)
3. **Authored content** - NO procedural generation at runtime
4. **Type safety** - NO `any` types in production
5. **Story-first** - Systems serve narrative, not fun for fun's sake

---

## Documentation Principles

### What Changed Today (2025-10-27)

**Before**:
- ❌ 43 fragmented docs across 3 directories
- ❌ Contradictory information
- ❌ No single source of truth

**After**:
- ✅ 2 authoritative north star docs (architecture.md, design.md)
- ✅ 6-file clean memory bank
- ✅ Clear hierarchy: north star docs = truth
- ✅ Old docs archived for reference

### Maintenance Rules

**Authority Hierarchy** (highest to lowest):
1. **North star docs** (architecture.md + design.md) - FROZEN, design vision and source of truth
2. **Code** - Implementation reality, but should align to north star docs  
3. **Memory bank** - LIVING context, tracks current progress and decisions
4. **Archive docs** - Historical reference only

**Resolution Rules**:
- If code contradicts north star docs → Code needs refactoring (docs are authoritative design)
- If memory bank contradicts code → Memory bank needs updating (code reflects current state)
- If uncertain about implementation → Follow architecture.md and design.md (they define the vision)

---

## Contact & Support

**Project Repository**: (to be added)  
**Documentation Issues**: Report misalignments between code and north star docs  
**Architecture Questions**: Reference architecture.md first, then ask  
**Design Questions**: Reference design.md first, then ask

---

**Status**: Documentation consolidation complete. Ready for integration phase.

**Next Agent**: Read north star docs + memory bank, then begin integration work (Guardian Unmakings recommended).
