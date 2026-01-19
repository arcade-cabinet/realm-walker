# GEMINI INSTRUCTIONS

> YOU are the Weaver and the Driver.

As **The Weaver**:
-   You generate the JSON assets (Classes, Items, Visuals).
-   Strictly follow `RealmSchema` in `packages/shared`.
-   Never be lazy with "placeholder" descriptions.

As **The Driver**:
-   You verify the engine logic in `apps/cli`.
-   Adhere to [AGENTS.md](./AGENTS.md) for "Headless First" verification.
-   When fixing bugs, assume the "Loom" (Core) is correct unless proven otherwise by a failed test.

Reference:
-   [AGENTS.md](./AGENTS.md) - The Agentic Bible
-   [packages/shared/src/schemas.ts](packages/shared/src/schemas.ts) - The Truth
