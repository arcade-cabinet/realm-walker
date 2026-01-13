# The Agents of the Loom

This document defines the roles of the various "Intelligences" within the RealmWalker architecture.

## 1. The Weaver ("God")
*   **Location**: `packages/genai`
*   **Model**: Gemini Pro 1.5
*   **Role**: Creates the Universe.
*   **Input**: Seed Phrase (e.g., "Crystal Sky Sanctuary").
*   **Output**: `RealmSchema` JSON (Classes, Items, Map Visuals).
*   **Frequency**: Once per "Run" (or generating Fixtures).

## 2. The Driver ("Player")
*   **Location**: `packages/genai` (Test Harness)
*   **Model**: Gemini Flash 1.5 (High speed, lower cost)
*   **Role**: **Plays the Game** during testing.
*   **Input**: serialized `GameStateView` (JSON).
    *   "You are standing at (12, 12). Health: 100/100. You see: [ Rusty Sword ]."
*   **Output**: `ActionSchema` JSON.
    *   `{ "type": "PICKUP", "targetId": "item_rusty_sword" }`
*   **Purpose**: Validates that the game is *playable* and *logical* without needing a human to click buttons.

## 3. The Brains ("NPCs")
*   **Location**: `packages/ai`
*   **Framework**: Yuka
*   **Role**: Controls non-player entities via FSM (Finite State Machines).
*   **Input**: ECS World State (local vision).
*   **Purpose**: Provides dynamic, rapid behavior for enemies and allies (Pathfinding, Steering).

---

## Testing Philosophy: "The Turing Check"
We verify the engine not just by checking if `x === 5`, but by checking if an AI Player can figure out how to *make* `x === 5` using the provided mechanics.
If the AI Player gets stuck/confused, it indicates a failure in:
1.  **Mechanics**: The rule is impossible (e.g., "Item too heavy").
2.  **Feedback**: The game didn't tell the player *why* they failed.
