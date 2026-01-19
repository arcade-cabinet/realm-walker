# @realm-walker/core ⚙️

The "Body" of the realm. A headless, deterministic Entity Component System (ECS) powered by Miniplex.

## Key Components
- **`World`**: The primary ECS container.
- **`Loop`**: A fixed-timestep game loop for deterministic logic.
- **`InputSystem`**: Captures and routes player/agent intentions.
- **`ActionHandler`**: Executes `Action` objects against the world state.

## Design Philosophy
- **Headless First**: Graphics are optional. The core should run perfectly in a console.
- **Deterministic**: Given the same seed and input, the world state must evolve identically.
- **Loose Coupling**: Systems interact only through components.
