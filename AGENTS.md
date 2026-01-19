# The Agentic Bible: Guidelines for Empirical Verification

> "You need to be able to tell me deterministically that fifty or a hundred moves down the line... that a player won't be stuck head first in a wall."

## 1. The Prime Directive: Headless First

**Do not conflate Logic with Graphics.**
-   **Verification must be blind.** The engine must be provably correct in a text-only, headless environment before a single pixel is rendered.
-   **Graphics are just semantic mapping.** A "flower pot" is just an ID at a coordinate. Whether it looks like a rose or a simple box is irrelevant to the **correctness** of the simulation.
-   **Empirical > Qualitative.** We do not need to "feel" the pace in code. We need to mathematically prove that the state machine transitions correctly under stress.

## 2. The Secondary Directive: Mobile First (v1.0+)

**Design for the smallest viable screen.**
-   **React Native + Babylon.js (Reactylon)** is the visual target, not web-first frameworks.
-   **The Diorama abstraction** bridges headless ECS state to visual rendering without leaking logic.
-   **No Capacitor/Cordova** - native performance requires native bridges (Expo + Babylon Native).
-   **Reference**: See `wheres-ball-though` for React Native patterns, `neo-tokyo-rival-academies` for Babylon.js diorama techniques.

## 3. Algorithmic Projection

**Project the player in 2D space algorithmically.**
-   Simulate N turns.
-   Simulate M decisions.
-   Verify state after every tick.
-   Fuzz test the "Loom" (The Engine) with the "Driver" (The AI) until confident.

## 4. The "Noun-Verb-Adjective" Test Loop

Every verification must follow this structure:
1.  **The Noun (Fixture)**: Load a static, known world state (from JSON).
2.  **The Verb (Action)**: The AI (or Mock) decides an action based *only* on the serialized data.
3.  **The Adjective (Assertion)**: Did the state verify? (e.g., `Inventory.contains('sword') == true`).

## 5. Interaction Guidelines

-   **Precision over Politeness.** If a tool fails, fix it. Do not apologize.
-   **Architectural Integrity.** Do not band-aid. If an export is missing, fix the export, don't bypass the architecture.
-   **Continuous Roadmap.** Work on the next logical piece while waiting for non-blocking reviews.

## 6. The Diorama Abstraction Layer

When rendering visuals:
1.  **One-Way Binding.** The Diorama observes ECS state. It NEVER modifies game logic.
2.  **Platform Agnostic Core.** `packages/core`, `packages/ai`, `packages/looms` have ZERO visual dependencies.
3.  **Rendering Packages.** Visual implementations live in `packages/diorama` (Babylon.js Native) or `apps/game` (web fallback).
4.  **Procedural Assets.** Use GenAI for descriptions, convert to visual via procedural sprite/mesh generation.

## 7. Branch Strategy

| Branch Pattern | Purpose |
|----------------|---------|
| `main` | Protected, production-ready code |
| `release/v0.x-*` | Feature stabilization branches |
| `release/v1.0-mobile-first` | Mobile architecture development |
| `feat/*` | Active feature development |

## 8. The Worktree Protocol (Deprecated for v1.0)

As of v1.0, prefer standard branch-based workflows over worktrees:
1.  Use `git switch` for context changes
2.  Keep PRs focused and small
3.  Use draft PRs for WIP visibility
4.  Reference related issues in commits

---

*Last Updated: 2026-01-16 (v1.0 Mobile-First Update)*
