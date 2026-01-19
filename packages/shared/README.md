# @realm-walker/shared 📚

The "Truth" of the Realm. This package contains the core Zod schemas, TypeScript types, and universal constants used across all other packages.

## Core Schemas
- **`RealmSchema`**: The master contract for a woven world.
- **`LoomSettingsSchema`**: The input parameters for the weaver.
- **`ActionSchema`**: The format for agent decisions.
- **`GameStateViewSchema`**: The serialized snapshot used by Brains/Drivers.

## Principles
1. **Strict Types**: Every asset must validate against its schema.
2. **Zero Dependencies**: This package should remain lightweight and portable (browser/node).
3. **Canonical**: If it's a game rule or data structure, it lives here.
