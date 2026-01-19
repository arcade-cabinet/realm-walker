# THE GRAND WEAVE: HANDOFF (v1.0 Mobile-First)

> "Every scrap of lore, every line of logic, every ghost in the machine."

## The Meta-Mission

We are building **RealmWalker**, a procedurally generated, engine-first RPG. We prove playability mathematically (Headless) before rendering any visuals. **v1.0 targets mobile-first deployment** using React Native + Babylon.js (Reactylon).

---

## CURRENT PROJECT STATUS: "v1.0 TRIAGE COMPLETE"

### Summary

| Aspect | Status |
|--------|--------|
| Headless Core | STABLE - ECS, Looms, AI working |
| Visual Layer | NEEDS REARCHITECTURE - move to Babylon.js Native |
| PR #1 | OPEN - pending CodeRabbit approval, merge to main |
| v1.0 Branch | PLANNED - release/v1.0-mobile-first |

### Key Documents

- [TRIAGE_v1.0.md](./TRIAGE_v1.0.md) - Comprehensive triage and roadmap
- [AGENTS.md](./AGENTS.md) - The Agentic Bible (updated for v1.0)
- [.kiro/specs/realm-walker-v0-1/](..kiro/specs/realm-walker-v0-1/) - v0.1 spec (mostly complete)

---

## KEY LOCATIONS

| Package | Purpose | Status |
|---------|---------|--------|
| `packages/core` | ECS Runtime (Miniplex) | STABLE |
| `packages/ai` | Decision Engine (Yuka) | STABLE |
| `packages/looms` | Tapestry/Shuttle API | STABLE |
| `packages/shared` | Zod Schemas | STABLE |
| `apps/cli` | Headless Playtesting | STABLE |
| `apps/game` | Web Diorama (R3F) | DEPRECATE for v1.0 |
| `packages/diorama` | Babylon.js Native | TO CREATE |
| `apps/mobile` | React Native App | TO CREATE |

---

## THE LOOM REGISTRY

### Core Looms (packages/looms)

| Loom | Purpose | Status |
|------|---------|--------|
| WorldLoom | Geographic Narrative Graph | COMPLETE |
| FactionLoom | Socio-Political Entities | COMPLETE |
| HistoryLoom | Timeline & Eras | COMPLETE |
| PantheonLoom | Deities & Domains | COMPLETE |
| ClassLoom | Character Archetypes | COMPLETE |
| AbilityLoom | Combat Moves | COMPLETE |
| ItemLoom | Equipment & Loot | COMPLETE |
| BestiaryLoom | Monsters & Bosses | COMPLETE |
| DungeonLoom | Room Layouts | COMPLETE |
| ShopLoom | Economy | COMPLETE |
| QuestLoom | Narrative Objectives | COMPLETE |
| NpcLoom | Notable Characters | COMPLETE |
| DialogueLoom | Conversations | COMPLETE |
| TalentLoom | Skill Trees | COMPLETE |

### Extended Looms (feat/visual-bridge)

| Loom | Purpose | Status |
|------|---------|--------|
| HeroLoom | 108 Stars of Destiny | COMMITTED |
| CivilizationLoom | Cultural Patterns | COMMITTED |

---

## v1.0 MOBILE-FIRST ARCHITECTURE

### Technology Stack

| Layer | v0.1 (Current) | v1.0 (Target) |
|-------|----------------|---------------|
| Framework | Vite + React | React Native + Expo SDK 54 |
| 3D Engine | React Three Fiber | Babylon.js React Native |
| Navigation | N/A | Expo Router |
| Styling | CSS | NativeWind |
| State | Zustand | Zustand + TanStack Query |
| Build | pnpm | EAS Build |

### Reference Projects

1. **wheres-ball-though**: React Native patterns, EAS builds, CI/CD
2. **neo-tokyo-rival-academies**: Babylon.js diorama, isometric camera, hex grids

### Reactylon Benefits

- Native 3D performance on iOS/Android
- Procedural mesh generation for Loom output
- WebXR support for future AR features
- Shared rendering logic between mobile and web

---

## IMMEDIATE ACTION ITEMS

### For PR #1 Merge

1. Review and resolve critical CodeRabbit comments
2. Verify all headless tests pass
3. Get approval and merge to main
4. Tag as v0.1.0

### For v1.0 Kickoff

1. Create `release/v1.0-mobile-first` branch from main (post-merge)
2. Add React Native + Expo SDK 54 (reference wheres-ball-though)
3. Create `packages/diorama` with Babylon.js Native renderer
4. Create `apps/mobile` with Expo Router navigation
5. Port hex tile system from neo-tokyo patterns

---

## ESSENTIAL TOOLING

| Command | Purpose |
|---------|---------|
| `pnpm build` | Full workspace compile |
| `pnpm generate-realm` | Weave realm.json via CLI |
| `pnpm generate-realm simulate` | Run 5-tick headless simulation |
| `pnpm test` | Run all tests |

### Future v1.0 Commands (TBD)

| Command | Purpose |
|---------|---------|
| `just mobile-dev` | Start Metro bundler |
| `just mobile-android` | Build and run Android |
| `just mobile-ios` | Build and run iOS |
| `just mobile-prebuild` | Regenerate native projects |

---

## OPEN ISSUES

| # | Title | v1.0 Action |
|---|-------|-------------|
| #8 | v0.1 Headless Core | Supersede with v1.0 tracking |
| #7 | Docstring coverage | Keep |
| #6 | Magic numbers | Keep |
| #5 | find-up for .env | Keep |
| #3 | Visual Bridge | Rearchitect for mobile |

---

## 2026 ROADMAP

### Q1 2026

- [x] v0.1 Headless Core stabilization
- [ ] Merge PR #1 to main
- [ ] v1.0 Mobile architecture setup
- [ ] Babylon.js Native integration

### Q2 2026

- [ ] Complete mobile diorama renderer
- [ ] EAS builds for iOS/Android
- [ ] App store submission

### Beyond

- [ ] Decision Graph: Multi-step AI planning
- [ ] Combat Integration: Full mechanics system
- [ ] Interior Mapping: Room-level dioramas
- [ ] Multiplayer: Realm sharing

---

*Last Updated: 2026-01-16*
*Next Agent: Review TRIAGE_v1.0.md for detailed roadmap*
