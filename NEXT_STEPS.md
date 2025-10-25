# Next Steps

This document outlines the implementation roadmap for completing the Realm Walker Story game engine.

## Current Status ✅

### Completed

- [x] **Project Structure**: Full directory tree with organized modules
- [x] **Type System**: Complete TypeScript definitions for all layers
- [x] **Core Systems**:
  - [x] QuestManager (boolean flag system)
  - [x] DialogueManager (conversation trees)
  - [x] InteractionSystem (click handling)
  - [x] GridSystemImpl (A* pathfinding)
  - [x] QuestFlagSystem (legacy, still in use)
- [x] **Compositore Skeleton**: Basic implementations of all three layers
- [x] **RWMD Parser**: Scene file parsing foundation
- [x] **GLB Loader**: Three.js model loading with caching
- [x] **Example Files**: Sample scenes and bindings
- [x] **Documentation**: README, ARCHITECTURE, BOOTSTRAP

### Architecture Status

✅ Three-tier compositor pattern established
✅ Layer separation enforced via types
✅ Data flow documented
✅ No cross-layer dependencies

## Phase 1: Complete Core Implementations 🚧

### 1.1 Update SceneCompositor

**Current**: Basic geometry building with simple slots
**Needed**: Full grid-based system with categorized slots

Tasks:
- [ ] Integrate GridSystemImpl into SceneCompositor
- [ ] Build floor/wall/ceiling from SceneTemplate
- [ ] Create categorized slot maps (NPCs, props, doors)
- [ ] Add texture loading for environment
- [ ] Implement walkable grid generation
- [ ] Add wall occlusion and camera hints

Files to modify:
- `src/runtime/systems/SceneCompositor.ts`

### 1.2 Enhance StoryCompositor

**Current**: Flag evaluation with basic slot filling
**Needed**: Full story binding integration

Tasks:
- [ ] Load and apply StoryBinding files
- [ ] Integrate with QuestManager for flag checks
- [ ] Populate NPC slots with dialogue IDs
- [ ] Fill prop slots based on quest state
- [ ] Set door states (locked/unlocked) from flags
- [ ] Handle conditional content spawning

Files to modify:
- `src/runtime/systems/StoryCompositor.ts`

### 1.3 Expand GameCompositor

**Current**: Basic Three.js scene setup
**Needed**: Full viewport management and UI

Tasks:
- [ ] Implement diorama camera framing
- [ ] Add responsive viewport handling
- [ ] Integrate UI overlay system
- [ ] Connect InteractionSystem for clicks
- [ ] Add scene transition effects
- [ ] Implement camera animations

Files to modify:
- `src/runtime/systems/GameCompositor.ts`

## Phase 2: RWMD Parser Enhancement 🔧

### 2.1 Complete RWMD Syntax Support

Tasks:
- [ ] Parse grid dimensions (e.g., "grid: 24x16")
- [ ] Handle anchor resolution (@props/fountain → path)
- [ ] Extract NPC positions with dialogue IDs
- [ ] Parse portal definitions with requirements
- [ ] Support atmosphere and metadata tags
- [ ] Add lighting definitions
- [ ] Implement camera hints

Files to modify:
- `src/runtime/parsers/RWMDParser.ts`

### 2.2 Validation and Error Handling

Tasks:
- [ ] Validate scene structure
- [ ] Check for missing assets
- [ ] Verify slot references
- [ ] Add helpful error messages
- [ ] Create schema validation

## Phase 3: Integration Layer 🔗

### 3.1 Scene Loading Pipeline

Tasks:
- [ ] Create SceneLoader orchestrator
- [ ] Implement scene caching
- [ ] Add preloading for adjacent scenes
- [ ] Handle scene transitions
- [ ] Manage asset lifecycle

New file:
- `src/runtime/loaders/SceneLoader.ts`

### 3.2 Game State Management

Tasks:
- [ ] Integrate QuestManager across all systems
- [ ] Add save/load functionality
- [ ] Implement state persistence
- [ ] Create checkpoint system
- [ ] Add game session management

New file:
- `src/runtime/systems/GameStateManager.ts`

## Phase 4: Dialogue System 💬

### 4.1 Dialogue Integration

Tasks:
- [ ] Connect DialogueManager to StoryCompositor
- [ ] Create dialogue tree loader
- [ ] Implement choice UI rendering
- [ ] Add dialogue history
- [ ] Support branching conversations
- [ ] Handle flag-gated dialogue options

### 4.2 Dialogue Content

Tasks:
- [ ] Create dialogue tree format spec
- [ ] Build example dialogues
- [ ] Add character voice/personality markers
- [ ] Implement dialogue triggers

New directory:
- `scenes/dialogues/`

## Phase 5: Interaction & Input 🖱️

### 5.1 Click Handling

Tasks:
- [ ] Implement raycasting for 3D clicks
- [ ] Add hover effects for interactables
- [ ] Create interaction feedback (highlights, tooltips)
- [ ] Handle keyboard shortcuts
- [ ] Add touch support

### 5.2 UI Components

Tasks:
- [ ] Design HUD layout
- [ ] Create dialogue box component
- [ ] Build quest log UI
- [ ] Add examine text overlay
- [ ] Implement modal dialogs

New directory:
- `src/ui/` (if web-based UI)

## Phase 6: Content Pipeline 📦

### 6.1 Asset Management

Tasks:
- [ ] Define GLB naming conventions
- [ ] Create asset manifest system
- [ ] Build asset validation tools
- [ ] Add placeholder models
- [ ] Implement asset hot-reloading

### 6.2 Scene Authoring Tools

Tasks:
- [ ] Create RWMD syntax guide
- [ ] Build RWMD validator script
- [ ] Add scene preview tool
- [ ] Create binding generator
- [ ] Build quest flag documentation tool

## Phase 7: Testing & Quality 🧪

### 7.1 Unit Tests

Tasks:
- [ ] Test SceneCompositor in isolation
- [ ] Test StoryCompositor with mock flags
- [ ] Test GameCompositor viewport logic
- [ ] Test QuestManager flag operations
- [ ] Test DialogueManager tree navigation
- [ ] Test InteractionSystem click detection
- [ ] Test GridSystemImpl pathfinding

Test files:
- `tests/unit/SceneCompositor.test.ts`
- `tests/unit/StoryCompositor.test.ts`
- `tests/unit/GameCompositor.test.ts`
- (etc.)

### 7.2 Integration Tests

Tasks:
- [ ] Test complete scene load flow
- [ ] Test quest progression end-to-end
- [ ] Test dialogue → flag → content flow
- [ ] Test scene transitions
- [ ] Test save/load cycle

Test files:
- `tests/integration/SceneFlow.test.ts`
- `tests/integration/QuestProgression.test.ts`

### 7.3 Layer Isolation Tests

Tasks:
- [ ] Verify no SceneCompositor → Story imports
- [ ] Verify no StoryCompositor → Game imports
- [ ] Check for circular dependencies
- [ ] Validate type boundaries

## Phase 8: Example Content 🎮

### 8.1 Tutorial Scene

Tasks:
- [ ] Create village_square scene (complete)
- [ ] Build tutorial dialogue tree
- [ ] Add first quest (seek_guardian)
- [ ] Create crimson_palace scene
- [ ] Implement scene transition

Scenes needed:
- `village_square` ✅ (partial)
- `crimson_palace`
- `tutorial_ending`

### 8.2 Chapter 1 Content

Tasks:
- [ ] Convert existing 24 RWMD scenes
- [ ] Create story bindings for all scenes
- [ ] Build dialogue trees for NPCs
- [ ] Define quest flags for Chapter 1
- [ ] Test full chapter playthrough

## Phase 9: Polish & Performance ✨

### 9.1 Rendering Optimization

Tasks:
- [ ] Implement frustum culling
- [ ] Add level-of-detail (LOD)
- [ ] Optimize material sharing
- [ ] Add object pooling
- [ ] Profile and optimize hot paths

### 9.2 User Experience

Tasks:
- [ ] Add loading screens
- [ ] Implement smooth transitions
- [ ] Add ambient animations
- [ ] Create audio system
- [ ] Add visual effects (particles, etc.)

## Phase 10: Documentation & Developer Experience 📚

### 10.1 API Documentation

Tasks:
- [ ] Generate TypeDoc for all modules
- [ ] Create API reference
- [ ] Add inline code examples
- [ ] Document public interfaces

### 10.2 Content Creator Guide

Tasks:
- [ ] Write RWMD authoring guide
- [ ] Document story binding format
- [ ] Create quest design patterns
- [ ] Build dialogue writing guide
- [ ] Add troubleshooting section

## Priority Order

**Immediate (Next 1-2 weeks)**:
1. Complete SceneCompositor grid integration (Phase 1.1)
2. Enhance StoryCompositor binding system (Phase 1.2)
3. RWMD parser enhancements (Phase 2)
4. Basic integration tests (Phase 7.2)

**Short-term (Next month)**:
5. Scene loading pipeline (Phase 3.1)
6. Dialogue integration (Phase 4)
7. Click handling (Phase 5.1)
8. Tutorial scene completion (Phase 8.1)

**Medium-term (Next 2-3 months)**:
9. Full UI components (Phase 5.2)
10. Asset management (Phase 6)
11. Chapter 1 content (Phase 8.2)
12. Performance optimization (Phase 9)

**Long-term (3+ months)**:
13. Documentation completion (Phase 10)
14. Additional chapters (18 total)
15. Polish and release preparation

## Success Metrics

For each phase:
- ✅ All tests passing
- ✅ No TypeScript errors
- ✅ Layer boundaries maintained
- ✅ Documentation updated
- ✅ Example usage provided

## Known Issues / Technical Debt

- [ ] Current SceneCompositor uses position-based slots (needs grid update)
- [ ] StoryBinding not yet integrated with StoryCompositor
- [ ] RWMD parser is basic (missing many syntax features)
- [ ] No UI system yet
- [ ] No save/load functionality
- [ ] Limited error handling
- [ ] No asset validation

## Questions to Resolve

- Should we build a custom UI or use a framework?
- How should we handle audio (Three.js positional audio)?
- What's the mobile/responsive strategy?
- Should we support multiple save slots?
- How do we handle localization?

## Getting Help

If blocked on any task:
1. Check BOOTSTRAP.md for original specification
2. Review ARCHITECTURE.md for layer boundaries
3. Look at existing implementations for patterns
4. Create a minimal reproduction test case
5. Document the issue and seek guidance

---

**Last Updated**: [Current Date]
**Current Phase**: Phase 1 (Core Implementations)
**Next Milestone**: Functional village_square scene with quest progression
