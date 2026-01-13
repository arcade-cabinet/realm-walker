# RealmWalker Product Overview

RealmWalker is an engine-first procedural RPG built on the principle of **Empirical Verification**. The core philosophy is "headless first" - the engine must be provably correct in a text-only environment before any graphics are rendered.

## Key Principles

- **Empirical > Qualitative**: Mathematical proof over subjective feel
- **Logic before Graphics**: Simulation correctness is independent of visual representation
- **Deterministic Verification**: Must be able to predict game state N moves ahead
- **Seed-based Generation**: Every realm is procedurally generated from a seed phrase

## Architecture Components

- **Structure**: RPG-JS mechanics and rules
- **Logic**: ECS runtime with Miniplex and AI decision engine with Yuka
- **Soul**: Looms system powered by Gemini AI for procedural generation

## Testing Philosophy

Follow the "Noun-Verb-Adjective" test pattern:
1. **Noun (Fixture)**: Load known world state from JSON
2. **Verb (Action)**: AI/Mock decides action based on serialized data
3. **Adjective (Assertion)**: Verify state transitions are correct