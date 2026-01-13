# Project Structure & Organization

## Workspace Layout
```
realm-walker/
├── packages/           # Core library packages
├── apps/              # Applications
├── docs/              # Documentation
├── .worktrees/        # Git worktrees for parallel development
└── .kiro/             # Kiro configuration and steering
```

## Package Architecture

### Core Packages (`packages/`)
- **`@realm-walker/core`** - ECS runtime with Miniplex, game loop, world management
- **`@realm-walker/looms`** - Gemini AI integration, procedural generation system
- **`@realm-walker/mechanics`** - RPG rules, equipment system, game mechanics
- **`@realm-walker/ai`** - Yuka-based AI decision engine
- **`@realm-walker/shared`** - Common types, utilities, schemas

### Applications (`apps/`)
- **`@realm-walker/cli`** - Command-line interface for headless simulation
- **`@realm-walker/game`** - React/Vite web application (when graphics needed)

## Development Workflow

### Git Worktree Protocol
- **Main workspace**: Stable/release branch for reviews and fixes
- **Satellite worktrees** (`.worktrees/<feature>`): New feature development
- Use `git worktree add .worktrees/<feature-name> <branch-name>` for parallel work

### Package Dependencies
- All packages use workspace protocol (`workspace:*`)
- Shared package contains common contracts and schemas
- Core depends on mechanics and shared
- Apps depend on multiple core packages

## File Naming Conventions
- **PascalCase** for classes and components
- **camelCase** for functions and variables
- **kebab-case** for file names when multiple words
- **`.test.ts`** for unit tests
- **`.live.test.ts`** for integration tests requiring external APIs

## Import/Export Patterns
- Each package has single `index.ts` entry point
- Use barrel exports to expose public API
- Internal modules should not be imported directly from other packages
- Prefer named exports over default exports