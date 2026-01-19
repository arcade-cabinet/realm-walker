# RealmWalker v1.0 Triage & Roadmap

**Date**: 2026-01-16
**Prepared By**: Claude Opus 4.5
**Branch**: release/v0.1-headless-core (5 commits pushed)

---

## Executive Summary

RealmWalker is a procedurally generated, engine-first RPG built on the principle of "Headless First" verification. The v0.1 release focused on stabilizing the core ECS engine and Loom DDL framework. For v1.0, the project needs to pivot to a **mobile-first architecture** using React Native + Babylon.js (Reactylon) instead of the current React Three Fiber web-first approach.

---

## Current State Assessment

### Repository Status

| Item | Status |
|------|--------|
| Main Branch | `main` - minimal initial commit |
| Active Branch | `release/v0.1-headless-core` - 54 commits, 19,449 additions |
| Feature Branch | `feat/visual-bridge` - Loom extensions committed |
| Open PR | #1 (release/v0.1-headless-core -> main), 610 review comments |
| Mergeable | Yes, but blocked (needs approval) |

### Open Issues

| # | Title | Priority | Status for v1.0 |
|---|-------|----------|-----------------|
| #8 | v0.1 Headless Core Stabilization | HIGH | SUPERSEDE - roll into v1.0 |
| #7 | Improve docstring coverage to 80% | MEDIUM | KEEP - applies to v1.0 |
| #6 | Extract time-of-day magic numbers | LOW | KEEP - code hygiene |
| #5 | Use find-up for .env discovery | LOW | KEEP - dev experience |
| #3 | Visual Bridge (Phase 10) | HIGH | REARCHITECT - needs mobile approach |

### PR #1 Analysis

**Current Scope**:
- GenAI to Looms migration (packages/genai -> packages/looms)
- Shuttle/Tapestry orchestration APIs
- CLI headless simulation
- React Three Fiber web diorama
- 131 changed files

**CodeRabbit Review**: 610 comments pending resolution

**Recommendation**: Merge PR #1 as v0.1 foundation, then branch v1.0 for mobile architecture.

---

## What's Working (v0.1)

### Core Engine (packages/core)
- [x] Miniplex ECS runtime
- [x] Deterministic game loop
- [x] Entity ID generation consistency
- [x] Schema validation
- [x] State serialization/deserialization

### Loom Framework (packages/looms)
- [x] Universal Loom DDL pattern
- [x] Shuttle dependency orchestration
- [x] Tapestry weaving API
- [x] Gemini API integration with backoff
- [x] Mock generation mode

### Loom Registry (14 DDLs)
- [x] WorldLoom, FactionLoom, HistoryLoom, PantheonLoom
- [x] ClassLoom, AbilityLoom, ItemLoom, BestiaryLoom
- [x] DungeonLoom, ShopLoom, QuestLoom, NpcLoom
- [x] DialogueLoom, TalentLoom

### Additional Looms (feat/visual-bridge)
- [x] HeroLoom (108 Stars of Destiny)
- [x] CivilizationLoom, FactionLoom extensions

### AI System (packages/ai)
- [x] Yuka agents integration
- [x] Decision purity (serialized state only)
- [x] Deterministic action resolution

### Headless Simulation (apps/cli)
- [x] Realm generation from seed
- [x] 5-tick simulation
- [x] Determinism verification
- [x] State export/import

### Testing Framework
- [x] Property-based tests (fast-check)
- [x] Noun-Verb-Adjective test patterns
- [x] Live API integration tests
- [x] Mock generation tests

---

## What's NOT Working / Incomplete

### Visual Layer (CRITICAL FOR v1.0)
- [ ] React Three Fiber is web-only (NOT mobile viable)
- [ ] No React Native integration
- [ ] No Babylon.js Native support
- [ ] Diorama renderer needs complete rewrite

### Missing v0.1 Components (from tasks.md)
- [ ] Checkpoint 3: Core Systems verification
- [ ] Checkpoint 7: All Core Systems stable
- [ ] Checkpoint 12: Final Release Ready
- [ ] Section 16: GenAI Prompt Engine System
- [ ] Section 17: Enhanced Tapestry Orchestration
- [ ] Sections 18-20: Complete Integration

### Documentation Gaps
- [ ] Docstring coverage at 50% (need 80%)
- [ ] API documentation incomplete
- [ ] Mobile architecture not documented

---

## v1.0 Mobile-First Architecture

### Technology Stack (Proposed)

| Layer | Current (v0.1) | Proposed (v1.0) |
|-------|----------------|-----------------|
| Framework | Vite + React | React Native + Expo SDK 54 |
| 3D Engine | React Three Fiber | Babylon.js React Native |
| Navigation | N/A (web) | Expo Router |
| Styling | CSS | NativeWind (Tailwind) |
| State | Zustand | Zustand + TanStack Query |
| Build | pnpm | EAS Build |

### Reference Projects

1. **wheres-ball-though** (arcade-cabinet)
   - Mature React Native + Expo architecture
   - NativeWind styling
   - EAS build configuration
   - GitHub Actions CI/CD
   - App store submission ready

2. **neo-tokyo-rival-academies** (arcade-cabinet)
   - Babylon.js isometric diorama patterns
   - GLB model loading for hex tiles
   - Orthographic camera setup
   - FF7-style scene composition

### Reactylon Integration

**Babylon.js React Native**: https://www.babylonjs.com/reactnative/

Benefits:
- True cross-platform 3D (iOS/Android)
- Native performance
- WebXR support for future AR features
- Procedural mesh generation for Loom output
- Compatible with existing headless core

### Proposed Package Structure

```
realm-walker/
├── packages/
│   ├── core/           # ECS engine (unchanged)
│   ├── ai/             # AI system (unchanged)
│   ├── looms/          # Procedural generation (unchanged)
│   ├── shared/         # Schemas (unchanged)
│   └── diorama/        # NEW: Babylon.js React Native visuals
├── apps/
│   ├── cli/            # Headless simulation (unchanged)
│   └── mobile/         # NEW: React Native app
│       ├── app/        # Expo Router screens
│       ├── src/
│       │   ├── components/
│       │   ├── hooks/
│       │   └── services/
│       └── android/    # Native projects
│       └── ios/
```

---

## Recommended Action Plan

### Phase 1: Stabilize v0.1 (Merge PR #1)

1. Resolve critical CodeRabbit review comments
2. Ensure all core tests pass
3. Merge PR #1 to main
4. Tag as v0.1.0

### Phase 2: Create v1.0 Branch

```bash
git checkout main
git pull
git checkout -b release/v1.0-mobile-first
```

### Phase 3: Mobile Architecture Setup

1. Add React Native + Expo SDK 54
2. Configure NativeWind
3. Set up Expo Router
4. Integrate Babylon.js React Native
5. Create diorama package with Babylon renderer

### Phase 4: Migrate Visual Layer

1. Port DioramaRenderer from R3F to Babylon
2. Implement hex tile system per neo-tokyo patterns
3. Add isometric camera with proper constraints
4. Connect to existing ECS state

### Phase 5: Mobile Infrastructure

1. EAS Build configuration
2. GitHub Actions CI/CD
3. App store submission materials
4. Debug artifact generation (Android APK via GitHub Releases)

---

## Issue Triage Recommendations

### Close as Superseded
- #8 (v0.1 Headless Core) - roll into v1.0 tracking

### Keep and Assign to v1.0
- #7 (Docstring coverage) - applies to all packages
- #6 (Magic numbers) - code quality
- #5 (find-up .env) - developer experience

### Rearchitect
- #3 (Visual Bridge) - needs mobile-first approach
  - Create new issue for Babylon.js integration
  - Close original as "approach changed"

### New Issues to Create
1. "feat: React Native + Expo SDK 54 setup"
2. "feat: Babylon.js React Native diorama integration"
3. "feat: EAS Build and CI/CD pipeline"
4. "docs: v1.0 mobile-first architecture documentation"

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Babylon.js RN performance | HIGH | Profile early, optimize hex instancing |
| R3F migration effort | MEDIUM | Headless core unchanged, visual layer isolated |
| Mobile testing complexity | MEDIUM | Leverage wheres-ball-though patterns |
| App store approval | LOW | Use EAS Submit with proper metadata |

---

## Success Criteria for v1.0

1. React Native app runs on iOS and Android
2. Babylon.js renders isometric diorama from Loom output
3. Headless simulation verified in mobile environment
4. EAS builds succeed for development and production
5. All existing tests continue passing
6. New mobile-specific tests added
7. Documentation updated for mobile-first approach

---

## Related Cross-Project Work

### wheres-ball-though Learnings
- Expo Router tab/stack navigation patterns
- Zustand + TanStack Query state management
- NativeWind responsive styling
- EAS workflow configuration
- GitHub Actions for mobile CI/CD

### neo-tokyo-rival-academies Learnings
- Babylon.js scene composition
- GLB model loading and instancing
- Orthographic camera for isometric view
- Hex grid generation algorithms
- Edge clipping for bounded scenes

---

*Generated by Claude Opus 4.5 during comprehensive repository triage*
