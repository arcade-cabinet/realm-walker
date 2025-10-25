# Decision Log

**Last Updated**: 2025-10-25
**Version**: 1.1

## Recent Decisions (2025-10-25 Session)

### Decision 1: StoryBinding Format Strategy
**Date**: 2025-10-25
**Context**: StoryBinding type existed but wasn't integrated with loading/composing pipeline
**Decision**: Implement dual-format support with automatic detection
**Rationale**: 
- StoryBinding format is cleaner for content authoring
- Need backward compatibility with existing StoryData JSON files
- Auto-detection avoids breaking existing content
**Implementation**: 
- Created `StoryBindingLoader` class with conversion methods
- Modified `SceneLoader.loadStoryData()` to detect format
- Format detection based on presence of `scene_id`, `npc_placements` fields
**Alternatives Considered**:
- Force migration to new format → Rejected (breaks existing content)
- Separate loading paths → Rejected (redundant code)
**References**: 
- Implementation: `src/runtime/loaders/StoryBindingLoader.ts`
- Types: `src/types/StoryBinding.ts`
- Tests: `tests/unit/StoryBindingLoader.test.ts`

### Decision 2: UI Integration Architecture
**Date**: 2025-10-25
**Context**: DialogueUI and QuestLogUI existed but weren't connected to game systems
**Decision**: Create `GameUIManager` as dedicated integration layer
**Rationale**:
- Maintains separation between UI components and game logic
- Provides single point for keyboard shortcuts
- Enables automatic flag propagation between systems
- Makes testing easier (mock the manager, not individual systems)
**Implementation**:
- Created `GameUIManager` class that owns UI components
- Connects DialogueManager via callbacks
- Connects QuestManager via polling/updates
- Keyboard shortcuts centralized in manager
**Alternatives Considered**:
- Direct connections in game loop → Rejected (tight coupling)
- Event bus system → Rejected (over-engineering for current needs)
**Trade-offs**:
- Pro: Clean separation, easy to test, centralized control
- Con: Extra layer of indirection, manager must be updated for new UI
**References**:
- Implementation: `src/runtime/systems/GameUIManager.ts`
- Related: `src/ui/DialogueUI.ts`, `src/ui/QuestLogUI.ts`

### Decision 3: Flag Propagation Flow
**Date**: 2025-10-25
**Context**: Multiple systems need to react to flag changes (Dialogue, Quest, Story)
**Decision**: DialogueManager callbacks update StoryCompositor, which is source of truth
**Rationale**:
- StoryCompositor already manages flags for scene content
- Avoids duplicate flag storage in multiple systems
- Single source of truth for flag state
- QuestManager uses flags but doesn't own them
**Implementation**:
```typescript
dialogueManager.setFlagCallback((flag) => {
  storyCompositor.setFlag(flag, true);
  // Trigger UI update
  this.updateQuestLog();
});
```
**Flow**: Dialogue Choice → Flag Callback → StoryCompositor → Quest Log UI
**Alternatives Considered**:
- QuestManager owns flags → Rejected (redundant with StoryCompositor)
- Global event system → Rejected (unnecessary complexity)
**References**:
- See: Three-tier compositor pattern in `docs/architecture/compositor-pattern.md`
- Implementation: `src/runtime/systems/GameUIManager.ts` lines 48-54

### Decision 4: PR Review Comment Resolution Strategy
**Date**: 2025-10-25
**Context**: PR #5 had 8 review comments from Gemini and Cursor bots
**Decision**: Address all comments immediately, even "medium priority" ones
**Rationale**:
- Clean merge to main without technical debt
- Good practice to address all feedback
- Prevents accumulation of "we'll fix later" items
**Changes Made**:
1. Division by zero protection (ternary checks)
2. Robust JSON parsing (indexOf/lastIndexOf vs regex)
3. Efficient SQL queries (json_extract vs LIKE)
4. Async I/O (fs.promises vs sync methods)
5. Secure ID generation (crypto.randomUUID vs Math.random)
6. Set-based duplicate removal
7. Documentation typo fixes
**Result**: All tests pass, clean merge, no technical debt
**References**: Commit `6944549`

### Decision 5: YOLO Mode Execution Strategy
**Date**: 2025-10-25
**Context**: User requested "YOLO mode" for rapid feature development
**Decision**: Implement and commit features immediately without planning documents
**Rationale**:
- User explicitly requested rapid execution
- Features were well-defined in memory bank/docs
- Architecture already established in frozen docs
- Risk acceptable for solo development session
**Execution**:
- Implemented 3 major features in sequence
- Committed and pushed after each feature
- Updated memory bank at end of session
- All tests passing before pushing
**Result**: Highly productive session, 3 features merged to main
**Lessons**: 
- YOLO mode works well with clear architecture docs
- Frequent commits reduce risk
- Test-driven development still important
**References**: See progress-tracker.md for completed tasks

## Earlier Decisions (Pre-Session)

### Three-Tier Compositor Pattern
**Date**: 2024-12-19
**Decision**: Enforce strict layer separation in compositor architecture
**Status**: FROZEN - documented in `docs/architecture/compositor-pattern.md`
**Not duplicated here** - see architecture docs

### Boolean Flag Quest System
**Date**: 2024-12-19
**Decision**: No numerical stats, everything is boolean flags
**Status**: FROZEN - documented in `docs/architecture/quest-system.md`
**Not duplicated here** - see architecture docs

### RWMD Format
**Date**: 2024-12-19
**Decision**: Custom scene authoring format
**Status**: FROZEN - documented in `docs/architecture/rwmd-parser.md`
**Not duplicated here** - see architecture docs

## Decision Templates

When adding new decisions, include:
1. **Date**: When decision was made
2. **Context**: What problem/situation led to this decision
3. **Decision**: What was decided
4. **Rationale**: Why this was chosen
5. **Implementation**: How it was implemented (brief)
6. **Alternatives Considered**: What else was considered and why rejected
7. **Trade-offs**: Pros/cons of the chosen approach
8. **References**: Links to docs, code, or commits

## Notes on Documentation

- **FROZEN docs** (in `docs/architecture/`) are authoritative - don't duplicate here
- This log tracks **implementation decisions** not covered in frozen docs
- Reference frozen docs, don't copy them
- Focus on "why" not "what" (what is in the code)
