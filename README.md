# RealmWalker 🌍

> "A Loom for Worlds"

RealmWalker is an engine-first procedural RPG where every realm is woven from a seed phrase. It emphasizes **Structure** (RPG-JS), **Logic** (Yuka/Miniplex), and **Soul** (GenAI).

## 🏗 Architecture (The Loom)
- **`packages/core`**: The ECS Runtime (Miniplex).
- **`packages/ai`**: The Decision Engine (Yuka).
- **`packages/mechanics`**: The Rulebook & Registry (RPG-JS).
- **`packages/genai`**: The Weaver (Gemini).

## 🚀 Getting Started

### Prerequisites
- Node.js & pnpm
- `GEMINI_API_KEY` in `.env`

### Installation
```bash
pnpm install
pnpm build
```

### Run the Simulation (Headless)
Verify the engine works without graphics:
```bash
pnpm generate-realm simulate
```

### Documentation
- [System Contracts (Agents)](./docs/AGENTS.md)
- [The Weaver's Guide (Gemini)](./docs/GEMINI.md)
