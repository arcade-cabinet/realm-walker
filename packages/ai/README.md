# @realm-walker/ai 🧠

The "Reflexes" of the realm. Handles local, high-frequency NPC behavior using the Yuka graph and steering library.

## Features
- **Steering Behaviors**: Path following, pursuit, and evasion.
- **FSM (Finite State Machines)**: Modular logic for NPC states (Idle, Wander, Attack).
- **AISystem**: Integrates Yuka's `EntityManager` with the Core ECS.

## Integration
Entities with a `brain` component are automatically registered with the `AISystem`.
