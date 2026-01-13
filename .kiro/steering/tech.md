# Technology Stack & Build System

## Package Manager & Workspace
- **pnpm** with workspace configuration
- Monorepo structure with packages and apps
- Node.js with ES modules (`"type": "module"`)

## Core Technologies
- **TypeScript 5.9.3** - Primary language
- **Biome** - Linting and formatting (replaces ESLint/Prettier)
- **tsup** - TypeScript bundler for packages
- **Vitest** - Testing framework
- **tsx** - TypeScript execution for development

## Key Libraries
- **Miniplex** - ECS (Entity Component System) runtime
- **Yuka** - AI/pathfinding for decision engine
- **Three.js** - 3D graphics (when needed)
- **Zod** - Schema validation and type safety
- **Google GenAI** - Gemini API integration for procedural generation
- **Commander.js** - CLI interface

## Common Commands

### Development
```bash
pnpm install          # Install all dependencies
pnpm build            # Build all packages
pnpm dev              # Start development mode
pnpm test             # Run all tests
```

### Linting & Formatting
```bash
pnpm lint             # Check code with Biome
pnpm lint:fix         # Auto-fix linting issues
pnpm format           # Format code with Biome
```

### RealmWalker Specific
```bash
pnpm generate-realm simulate  # Run headless simulation
pnpm --filter @realm-walker/cli start  # Run CLI directly
```

## Code Style (Biome Configuration)
- 2-space indentation
- Single quotes for JS, double quotes for JSX
- 100 character line width
- Trailing commas always
- Semicolons always
- Import organization enabled
