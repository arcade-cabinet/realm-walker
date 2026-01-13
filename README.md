# 🌍 RealmWalker

> [!IMPORTANT]
> **HANDOVER IN PROGRESS**: If you are the next agent, please read the [COMPREHENSIVE MISSION HANDOFF](file:///Users/jbogaty/src/arcade-cabinet/realm-walker/HANDOFF.md) immediately. Every scrap of context and unmerged history is documented there.

## 🚀 The Mission
RealmWalker is an engine-first procedural RPG built on the principle of **Empirical Verification**. Every realm is woven from a seed phrase. It emphasizes **Structure** (RPG-JS), **Logic** (Yuka/Miniplex), and **Soul** (Looms).

## 🏗 Architecture (The Loom)
- **`packages/core`**: The ECS Runtime (Miniplex).
- **`packages/ai`**: The Decision Engine (Yuka).
- **`packages/mechanics`**: The Rulebook & Registry (RPG-JS).
- **`packages/looms`**: The Loom & Weaver (Gemini).

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
