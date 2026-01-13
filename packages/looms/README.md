# @realm-walker/looms 🧵

The "Soul" of the realm. This package handles all AI-driven orchestration, content generation (The Weaver), and agent-based decision making (The Driver).

## Core Concepts

### 1. GeminiAdapter
A resilient wrapper around the Google Gemini API. It handles:
- **Structured Output**: Validates LLM responses against Zod schemas.
- **Automated Retries**: Robustness against transient network or API failures.
- **Instruction Mapping**: Translates high-level prompts into actionable weaver jobs.

### 2. Tapestry
The context container for a weaving session. It holds the "Memory" of what has been generated so far (e.g., world graph, faction list, hero details), allowing subsequent weaves to build upon previous ones.

### 3. Shuttle
The orchestrator for complex dependency-bound generation. You define "Jobs" (Looms) and their dependencies, and the Shuttle handles the sequence.
```typescript
const shuttle = new Shuttle(apiKey)
  .addJob(WorldLoomDef)
  .addJob(FactionLoomDef) // Automatically consumes 'world' produced by WorldLoomDef
  .addJob(HeroLoomDef);

const context = await shuttle.launch();
```

### 4. PlayerDriver
The "Brain" for AI players. It translates `GameStateView` (a serialized snapshot of what an entity sees) into a valid `Action` using an LLM.

## Usage in CLI
The CLI utilizes the `Shuttle` API to generate complete realms from a 3-word seed phrase.
```bash
pnpm generate-realm --seed "Floating-Iron-Dominion"
```

## Integration in Game
The Frontend uses `GeminiAdapter` directly for certain dynamic generation tasks, such as "Forging" the initial realm data from the main menu.
