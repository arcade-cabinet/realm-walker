import { LoomSettings, RpgClass, RpgClassSchema, RpgLoom } from '@realm-walker/shared';
import { z } from 'zod';
import { AbstractLoom } from './AbstractLoom.js';

// We return an array of classes
const RpgClassArraySchema = z.array(RpgClassSchema);

export class CharacterLoom extends AbstractLoom<RpgClass[], RpgLoom> {
    constructor(apiKey: string) {
        super(apiKey, RpgClassArraySchema);
    }

    protected constructPrompt(settings: LoomSettings, world?: RpgLoom): string {
        const { magicLevel, technologyLevel, dangerLevel } = settings.controls;
        const biomeContext = world ?
            `The world includes these biomes: ${world.nodes.map(n => n.biome).join(', ')}.` :
            'A generic fantasy world.';

        return `
      Weave the Heroes (Classes) for this Realm.
      
      SEED: "${settings.seed}"
      THEME: "${settings.age}"
      CONTEXT: ${biomeContext}
      
      WARP CONSTRAINTS:
      1. COUNT: 3-5 distinct classes.
      2. TYPE: Adapted to the Magic Level (${magicLevel}) and Tech Level (${technologyLevel}).
         - High Magic -> Mages, Sorcerers.
         - High Tech -> Engineers, Cyber-Knights.
         - Mixed -> Technomancers.
      3. SURVIVABILITY: Must be capable of surviving Danger Level ${dangerLevel}.
      
      WEFT INSTRUCTIONS:
      - 'visuals.spriteId' MUST be a 2D billboard ID (e.g. 'pixel_mage_red').
      - Stats should sum to approx 30-40 initially.
      
      Output ONLY valid JSON matching RpgClassSchema[].
    `;
    }
}
