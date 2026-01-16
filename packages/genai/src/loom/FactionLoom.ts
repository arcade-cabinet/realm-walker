import { Faction, FactionSchema, LoomSettings, RpgLoom } from '@realm-walker/shared';
import { z } from 'zod';
import { AbstractLoom } from './AbstractLoom.js';

const FactionArraySchema = z.array(FactionSchema);

export class FactionLoom extends AbstractLoom<Faction[], RpgLoom> {
    constructor(apiKey: string) {
        super(apiKey, FactionArraySchema);
    }

    protected constructPrompt(settings: LoomSettings, world?: RpgLoom): string {
        // Extract node regions if available, or just use names
        const territories = world ? world.nodes.map(n => n.name).join(', ') : 'Unknown Lands';

        return `
      Weave the Factions (Politics) for this Realm.
      
      SEED: "${settings.seed}"
      AGE: "${settings.age}"
      TERRITORIES: ${territories}
      
      WARP CONSTRAINTS:
      1. COUNT: 2-3 Major Factions.
      2. IDEOLOGY: Must align with the Age (e.g., Technocracy in a Tech Age).
      3. CONTROL: Assign ownership of the provided Node IDs (from the World Graph) to these factions.
         - Every Node should ideally be claimed, or designated 'Wild'.
      4. CONFLICT: Ensure at least one rivalry exists.
      
      WEFT INSTRUCTIONS:
      - 'visuals.color' must be a hex code.
      - 'control' array must contain valid Node IDs from the World Graph.
      
      Output ONLY valid JSON matching FactionSchema[].
    `;
    }
}
