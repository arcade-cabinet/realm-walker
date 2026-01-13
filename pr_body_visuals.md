# 🌉 Phase 10: Visual Bridge

This PR implements the visual layer that sits on top of the Headless Engine (PR #1).

## 🔭 The Monitor (DioramaRenderer)
- Implemented `apps/game/src/components/DioramaRenderer.tsx`.
- Uses `react-three-fiber` to render a fixed isometric view.
- **One-Way Binding**: Observes ECS `position` and `visuals` components. Does NOT affect game logic.

## 🎨 Procedural Assets (SpriteGenerator)
- Implemented `apps/game/src/utils/SpriteGenerator.ts`.
- Generates `THREE.CanvasTexture` on the fly for placeholder visuals.
- Maps Entity Type to Color/Letter (e.g., "E" for Enemy, "H" for Hero).

## 🤖 Context for CodeRabbit
This PR depends on the logic in #1. It focuses purely on **Visualization**.
Please review for:
- React-Three-Fiber best practices (performance).
- Correct usage of `miniplex-react` hooks (`useEntities`).
