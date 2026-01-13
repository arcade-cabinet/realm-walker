import { LoomSettings, RpgBestiary, RpgBestiarySchema, RpgLoom } from '@realm-walker/shared';
import { z } from 'zod';
import { AbstractLoom } from './AbstractLoom.js';

const RpgBestiaryArraySchema = z.array(RpgBestiarySchema);

export class BestiaryLoom extends AbstractLoom<RpgBestiary[], RpgLoom> {
    constructor(apiKey: string) {
        super(apiKey, RpgBestiaryArraySchema);
    }

    protected constructPrompt(settings: LoomSettings, world?: RpgLoom): string {
        const { dangerLevel } = settings.controls;

        // Extract unique biomes from the world context
        const biomes = world ? [...new Set(world.nodes.map(n => n.biome))].join(', ') : 'Standard Biomes';

        return `
      Weave the Bestiary (Monsters) for this Realm.
      
      SEED: "${settings.seed}"
      THEME: "${settings.age}"
      CONTEXT: This world contains: ${biomes}.
      
      WARP CONSTRAINTS:
      1. COUNT: 5-8 distinct monsters.
      2. ECOLOGY: Create creatures native to the listed biomes.
      3. DIFFICULTY:
         - Scale stats up to Danger Level ${dangerLevel}.
         - Level ${dangerLevel} implies Boss-tier threats (High HP/STR).
      
      WEFT INSTRUCTIONS:
      - 'visuals.spriteId' MUST be a 2D billboard ID.
      - Behavior should vary (aggressive vs neutral).
      
      Output ONLY valid JSON matching RpgBestiarySchema[].
    `;
    }
}
