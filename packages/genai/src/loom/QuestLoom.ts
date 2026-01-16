import { Faction, Hero, LoomSettings, Quest, QuestSchema, RpgLoom } from '@realm-walker/shared';
import { AbstractLoom } from './AbstractLoom.js';

interface QuestContext {
    world: RpgLoom;
    heroes: Hero[];
    factions: Faction[];
}

export class QuestLoom extends AbstractLoom<Quest[], QuestContext> {
    constructor(apiKey: string) {
        super(apiKey, QuestSchema.array());
    }

    protected constructPrompt(settings: LoomSettings, context?: QuestContext): string {
        const nodes = context?.world.nodes.map(n => n.name).join(', ') || 'Unknown';
        const heroes = context?.heroes.map(h => h.name).join(', ') || 'None';

        return `
      Weave the Quest Log for this Realm.
      
      SEED: "${settings.seed}"
      LOCATIONS: ${nodes}
      NPCs: ${heroes}
      
      WARP CONSTRAINTS:
      1. COUNT: 3-5 Main Quests.
      2. STRUCTURE: Linked to existing Nodes and NPCs.
      3. GIVER: Assign a 'giverId' from the provided Heroes list.
      
      WEFT INSTRUCTIONS:
      - Objectives must reference real Node IDs or vague "Explore" tasks.
      
      Output ONLY valid JSON matching QuestSchema[].
    `;
    }
}
