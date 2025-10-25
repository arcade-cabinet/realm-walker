# Memory Bank System

**Version**: 1.0 **FROZEN**

This is the active context and progress tracking system for the Realm Walker Story project. The memory bank serves as a living record of current state, decisions, and progress - NOT as a source of truth for architecture or game design.

## Core Principles

- **DRY (Don't Repeat Yourself)**: Memory bank references docs, doesn't duplicate information
- **WET (Write Everything Twice)**: Docs are the single source of truth
- **Active Context**: Tracks current work, decisions, and progress
- **Progress Tracker**: Maintains session state and next steps

## Structure

### `/docs/` - Single Source of Truth
- **FROZEN** documents contain authoritative architecture and design decisions
- **Versioned** documents use semantic versioning
- **Cross-referenced** for consistency

### `/memory-bank/` - Active Context
- **Current State**: What's working, what's broken, what's in progress
- **Session Context**: Current work focus and immediate next steps
- **Decision Log**: Key decisions made during development
- **Progress Tracking**: Completed tasks and blockers

## Usage

1. **Always read docs first** before making architectural decisions
2. **Update memory bank** when making significant changes
3. **Reference docs** in memory bank entries, don't repeat content
4. **Keep memory bank current** with actual project state

## File Organization

```
memory-bank/
├── README.md                 # This file
├── current-state.md         # What's working/broken right now
├── session-context.md       # Current work focus
├── decision-log.md          # Key decisions made
├── progress-tracker.md      # Task completion status
└── technical-notes.md       # Implementation details and patterns
```

## Integration with Cursor Rules

The memory bank system integrates with `.clinerules` and `.cursorrules` to ensure:
- Docs are always consulted before architectural decisions
- Memory bank is updated when making changes
- No duplication of information between docs and memory bank
- Clear separation between authoritative docs and active context