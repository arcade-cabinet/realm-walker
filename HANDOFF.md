# 🌍 THE GRAND WEAVE: TOTAL HANDOFF (v0.2.0)

> "Every scrap of lore, every line of logic, every ghost in the machine."

## � The Meta-Mission
We are building **RealmWalker**, a procedurally generated, engine-first RPG. We prove playability mathematically (Headless) before rendering any visuals.

---

## 🏗 CURRENT PROJECT STATUS: "CONSENSUS REACHED"
We have successfully migrated from the fragmented `genai` prototype to the unified `@realm-walker/looms` framework.

### 📍 Key Locations
- **Core Engine**: [packages/core](file:///Users/jbogaty/src/arcade-cabinet/realm-walker/packages/core) (Miniplex ECS, deteministic loop)
- **AI Reflexes**: [packages/ai](file:///Users/jbogaty/src/arcade-cabinet/realm-walker/packages/ai) (Yuka agents, FSMs)
- **The Weaving Framework**: [packages/looms](file:///Users/jbogaty/src/arcade-cabinet/realm-walker/packages/looms) (Tapestry/Shuttle API)
- **Shared Schemas**: [packages/shared](file:///Users/jbogaty/src/arcade-cabinet/realm-walker/packages/shared) (The Zod Source of Truth)
- **CLI/QA Driver**: [apps/cli](file:///Users/jbogaty/src/arcade-cabinet/realm-walker/apps/cli) (Headless playtesting)
- **The Diorama**: [apps/game](file:///Users/jbogaty/src/arcade-cabinet/realm-walker/apps/game) (Visual mapping of the ECS)

---

## 🧵 THE LOOM REGISTRY (Complete DDL Index)

| Loom Definition | Purpose | Consumes | Produces | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **WorldLoom** | Geographic Narrative Graph | Settings | `world` | **CRITICAL** |
| **FactionLoom** | Socio-Political Entities | `world` | `factions` | **CRITICAL** |
| **HistoryLoom** | Timeline & Millennial Eras | Settings | `history` | HIGH |
| **PantheonLoom** | Deities & Divine Domains | `history` | `pantheon` | HIGH |
| **ClassLoom** | Character Archetypes (SteamPunk themed) | Theme | `classes` | **CRITICAL** |
| **AbilityLoom** | Combat Moves & MP/SP Costs | `classes` | `abilities` | MEDIUM |
| **ItemLoom** | Weapons, Armor, Loot | `world`, `factions`| `items` | MEDIUM |
| **BestiaryLoom** | Monsters & Bosses | `world` | `bestiary` | MEDIUM |
| **DungeonLoom** | Room Layouts & Boss Placement | `world`, `bestiary`| `dungeons` | MEDIUM |
| **ShopLoom** | Economy & Merchant Personality | `world`, `items` | `shops` | LOW |
| **QuestLoom** | Narrative Objectives (Kill/Fetch/Explore) | ALL | `quests` | HIGH |
| **NpcLoom** | Notable NPCs & Elite Bosses | `dungeons`, `world`| `npcs` | MEDIUM |
| **DialogueLoom** | Greetings, Rumors, Barks | `npcs`, `world` | `dialogue` | LOW |
| **TalentLoom** | Passive/Active skill trees | Theme | `talents` | LOW |

---

## 🏗 ARCHITECTURAL PILLARS

### 1. The Headless First Mandate ([AGENTS.md](file:///Users/jbogaty/src/arcade-cabinet/realm-walker/docs/AGENTS.md))
- **Logic must be blind.** The engine should be provable in a text-only environment.
- **Verification is Empirical.** Use the `apps/cli` simulate command.

### 2. The Universal Loom DDL ([GEMINI.md](file:///Users/jbogaty/src/arcade-cabinet/realm-walker/docs/GEMINI.md))
- We do not write concept-specific code; we write definitions in [definitions.ts](file:///Users/jbogaty/src/arcade-cabinet/realm-walker/packages/looms/src/definitions.ts).
- Every Loom is wrapped in a `Shuttle` job for dependency-aware orchestration.

### 3. Resilience & Retries
- `GeminiAdapter` handles exponential backoff for 429s and schema-strict validation for **Gemini 2.0 Flash**.

---

## 🧬 THE "SCRAPS" (Missing / Unaccounted Work)

> [!CAUTION]
> **UNMERGED/GHOST CONTENT**
> Previous agent summaries mentioned **PR #7 (Stacking Zones)** and **PR #8 (Llama Visuals)**. 
> - **Status**: These were not found in the `main` or `release/v0.1-headless-core` git history. 
> - **Clue**: `poc.html` contains a "Handoff System" for "Next Zone". This might be the seed of the stacking zone work.
> - **Action**: If the next task is visuals, look for the "Llama" in the procedural sprite generator logic or the textures.

---

## 🛠 ESSENTIAL TOOLING

| Command | Result |
| :--- | :--- |
| `pnpm build` | Full workspace re-compile. |
| `pnpm generate-realm` | Weave a new `realm.json` in the CLI. |
| `pnpm generate-realm simulate` | Run a 5-tick headless simulation. |
| `pnpm --filter @realm-walker/cli test` | Run the full Weaver-to-Quest E2E proof. |

---

## 🌉 THE VISUAL BRIDGE (feat/visual-bridge)
A satellite worktree exists in [.worktrees/visuals](file:///Users/jbogaty/src/arcade-cabinet/realm-walker/.worktrees/visuals). It contains:
- `DioramaRenderer.tsx`: R3F mapping of ECS positions.
- `SpriteGenerator.ts`: Procedural canvas textures for placeholders.
- **Status**: Merged into `release/v0.1-headless-core` but the worktree remains as a reference.

---

## 🗓 2026 ROADMAP
1. **Decision Graph**: Multi-step AI planning via world nodes.
2. **Combat Integration**: Wire `@realm-walker/mechanics` to the core `AISystem`.
3. **Interior Mapping**: Move from World Graph to Room-level dioramas.

---
*Signed, Antigravity*
*(Finalizing after GenAI-to-Looms Migration)*
