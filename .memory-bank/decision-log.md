# Decision Log

**Version**: 1.0

## 2024-12-19 - Memory Bank System Design

### Decision: Docs as Single Source of Truth
**Context**: Need to eliminate duplication between temporary files and establish clear information hierarchy.

**Decision**: 
- `/docs/` contains FROZEN authoritative documents
- `.memory-bank/` contains active context and progress tracking
- Memory bank references docs, doesn't duplicate information
- All architectural decisions documented in frozen docs

**Rationale**: 
- Eliminates information duplication (DRY principle)
- Clear separation between authoritative docs and active context
- Prevents drift between documentation and implementation
- Enables proper versioning of architectural decisions

**Impact**: 
- Temporary files (ARCHITECTURE.md, NEXT_STEPS.md, BOOTSTRAP.md) will be removed
- New docs structure will be created
- Memory bank will track current state without repeating doc content

## 2024-12-19 - Documentation Structure

### Decision: Hierarchical Documentation System
**Context**: Need to organize project documentation for maintainability and clarity.

**Decision**:
```
/docs/
├── architecture/          # Technical architecture (FROZEN)
├── design/               # Game design and vision (FROZEN)  
├── content/              # Game content specifications (FROZEN)
├── development/          # Development processes and tools
└── api/                  # API documentation and references
```

**Rationale**:
- Clear separation of concerns
- FROZEN docs for stable decisions
- Development docs for evolving processes
- Easy navigation and maintenance

**Impact**:
- Architecture content moves to `/docs/architecture/`
- Game design content moves to `/docs/design/`
- Development processes documented separately
- API docs generated and maintained

## Previous Decisions (From Project History)

### Three-Tier Compositor Pattern
**Decision**: Strict separation of concerns across three layers
- Layer 1: SceneCompositor (geometry only)
- Layer 2: StoryCompositor (content based on flags)
- Layer 3: GameCompositor (presentation and UI)

### Boolean Flag Quest System
**Decision**: No numerical stats, everything is boolean flags
- No health, mana, XP, or inventory arrays
- Items are flags (e.g., "has_palace_key")
- Quest progression through boolean state

### RWMD Scene Format
**Decision**: Declarative text format for scene authoring
- Human-readable scene definitions
- Anchor resolution system (@props/fountain → path)
- JSON output for runtime consumption