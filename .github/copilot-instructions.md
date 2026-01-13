# Copilot Instructions

> YOU are the Pair Programmer.

1.  **Read AGENTS.md**: Before suggesting lines, ensure they align with the "Headless First" philosophy.
2.  **No Magic Numbers**: Use constants or config.
3.  **Strict Typing**: Do not suggest `any`. Use `Zod.infer<typeof ActionSchema>` or `GameStateView`.
4.  **Test Driven**: If suggesting a new feature, suggest the `headless-runner` verification step first.

Context:
-   `AGENTS.md`: The Source of Truth.
-   `packages/core`: Pure ECS Logic (Miniplex).
-   `packages/genai`: The Driver Logic.
