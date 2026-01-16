import { Dungeon, DungeonSchema, LoomSettings } from '@realm-walker/shared';
import { AbstractLoom } from './AbstractLoom.js';

interface DungeonContext {
    nodeId: string;
    biome: string;
    danger: number;
}

export class DungeonLoom extends AbstractLoom<Dungeon, DungeonContext> {
    constructor(apiKey: string) {
        super(apiKey, DungeonSchema);
    }

    protected constructPrompt(settings: LoomSettings, context?: DungeonContext): string {
        return `
      Weave a Dungeon for Node "${context?.nodeId}".
      
      SEED: "${settings.seed}"
      BIOME: ${context?.biome}
      DANGER: Level ${context?.danger} (Max 11)
      
      WARP CONSTRAINTS:
      1. LAYOUT: Compatible with Biome (Cave -> Branching, Ruin -> Labyrinth).
      2. TRAPS: Likelihood scales with Danger Level.
      
      WEFT INSTRUCTIONS:
      - 'description' should be atmospheric and ominous.
      
      Output ONLY valid JSON matching DungeonSchema.
    `;
    }
}
