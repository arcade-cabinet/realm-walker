# Documentation

**Version**: 1.0 **FROZEN**

This directory contains the authoritative documentation for the Realm Walker Story project. All architectural decisions, game design, and technical specifications are documented here as the single source of truth.

## Document Status

- **FROZEN**: Cannot be changed without explicit approval and version bump
- **Versioned**: Uses semantic versioning (major.minor.patch)
- **Cross-referenced**: Documents link to related information

## Directory Structure

```
docs/
├── README.md                    # This file
├── architecture/               # Technical architecture (FROZEN)
│   ├── compositor-pattern.md   # Three-tier compositor system
│   ├── quest-system.md         # Boolean flag quest system
│   ├── rwmd-parser.md          # Scene file format and parser
│   ├── type-system.md          # TypeScript type definitions
│   └── data-flow.md            # System data flow
├── design/                     # Game design and vision (FROZEN)
│   ├── game-vision.md          # Core game concept and pillars
│   ├── world-lore.md           # Narrative foundation
│   ├── art-style.md            # Visual design guidelines
│   └── content-structure.md    # Chapter and scene organization
├── content/                    # Game content specifications (FROZEN)
│   ├── scenes/                 # Scene definitions and requirements
│   ├── dialogues/              # Dialogue system and content
│   ├── quests/                 # Quest design and progression
│   └── characters/             # Character definitions and arcs
├── development/                # Development processes (Versioned)
│   ├── setup.md                # Development environment setup
│   ├── testing.md              # Testing strategy and guidelines
│   ├── deployment.md           # Build and deployment process
│   └── contributing.md         # Contribution guidelines
└── api/                        # API documentation (Versioned)
    ├── runtime-api.md          # Runtime system APIs
    ├── content-api.md          # Content authoring APIs
    └── integration-api.md      # External integration APIs
```

## Usage Guidelines

1. **Always consult docs first** before making architectural decisions
2. **Reference docs** in code comments and memory bank entries
3. **Update docs** when making significant changes (with version bump)
4. **Cross-reference** related documents for consistency
5. **Keep memory bank current** but don't duplicate doc content

## Version Control

- **FROZEN** documents require explicit approval to change
- **Versioned** documents can be updated with appropriate version bump
- All changes must be documented in the decision log
- Memory bank tracks current state, docs track stable decisions