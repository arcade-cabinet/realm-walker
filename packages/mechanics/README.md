# @realm-walker/mechanics ⚖️

The "Rulebook" of the realm. Manages the hydration of generated data into the active simulation.

## Key Modules
- **`SchemaLoader`**: Ingests `RealmSchema` JSON and populates the registries.
- **`Registry`**: Centralized storage for Classes, Items, and Bestiary entries.
- **`ActionHandler`**: Implements the specific logic for verbs (MOVE, ATTACK, EQUIP).

## Usage
Used by the CLI and Frontend to transform static generation into live entities.
