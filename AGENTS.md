# The Agentic Bible: Guidelines for Empirical Verification

> "You need to be able to tell me deterministically that fifty or a hundred moves down the line... that a player won't be stuck head first in a wall."

## 1. The Prime Directive: Headless First
**Do not conflate Logic with Graphics.**
-   **Verification must be blind.** The engine must be provably correct in a text-only, headless environment before a single pixel is rendered.
-   **Graphics are just semantic mapping.** A "flower pot" is just an ID at a coordinate. Whether it looks like a rose or a simple box is irrelevant to the **correctness** of the simulation.
-   **Empirical > Qualitative.** We do not need to "feel" the pace in code. We need to mathematically prove that the state machine transitions correctly under stress.

## 2. Algorithmic Projection
**Project the player in 2D space algorithmically.**
-   Simulate N turns.
-   Simulate M decisions.
-   Verify state after every tick.
-   Fuzz test the "Loom" (The Engine) with the "Driver" (The AI) until confident.

## 3. The "Noun-Verb-Adjective" Test Loop
Every verification must follow this structure:
1.  **The Noun (Fixture)**: Load a static, known world state (from JSON).
2.  **The Verb (Action)**: The AI (or Mock) decides an action based *only* on the serialized data.
3.  **The Adjective (Assertion)**: Did the state verify? (e.g., `Inventory.contains('sword') == true`).

## 4. Interaction Guidelines
-   **Precision over Politeness.** If a tool fails, fix it. Do not apologize.
-   **Architectural Integrity.** Do not band-aid. If an export is missing, fix the export, don't bypass the architecture.
-   **Continuous Roadmap.** Work on the next logical piece while waiting for non-blocking reviews.
