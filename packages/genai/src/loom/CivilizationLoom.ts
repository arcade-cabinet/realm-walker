import { Faction, LoomSettings, Town, TownSchema } from '@realm-walker/shared';
import { AbstractLoom } from './AbstractLoom.js';

interface TownContext {
    nodeId: string;
    biome: string;
    faction?: Faction;
}

export class CivilizationLoom extends AbstractLoom<Town, TownContext> {
    constructor(apiKey: string) {
        super(apiKey, TownSchema);
    }

    protected constructPrompt(settings: LoomSettings, context?: TownContext): string {
        const { technologyLevel, magicLevel } = settings.controls;

        // Faction Influence
        const factionContext = context?.faction ?
            `Controlled by ${context.faction.name} (${context.faction.ideology}). Aesthetics: ${context.faction.visuals.color} flags.` :
            'Independent Settlement.';

        return `
      Weave a Town (Civilization) for Node "${context?.nodeId}".
      
      SEED: "${settings.seed}"
      THEME: "${settings.age}"
      BIOME: ${context?.biome}
      CONTEXT: ${factionContext}
      
      WARP CONSTRAINTS:
      1. TECH: Level ${technologyLevel}.
      2. MAGIC: Level ${magicLevel}.
      3. SIZE: Based on tech level (Higher Tech -> Larger Cities).
      
      WEFT INSTRUCTIONS:
      - 'services' should reflect the ideology (e.g. Theocracy -> Temple).
      - 'npcDensity' should match the Size.
      
      Output ONLY valid JSON matching TownSchema.
    `;
    }
}
