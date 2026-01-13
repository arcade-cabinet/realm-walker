import { LoomSettings, RpgLoom, RpgLoomSchema } from '@realm-walker/shared';
import { AbstractLoom } from './AbstractLoom.js';

export class WorldLoom extends AbstractLoom<RpgLoom> {
    constructor(apiKey: string) {
        super(apiKey, RpgLoomSchema);
    }

    protected constructPrompt(settings: LoomSettings): string {
        const { worldScale, minNodes, dangerLevel, magicLevel, technologyLevel } = settings.controls;

        return `
      Weave a Narrative World Graph (The Loom).
      
      SEED: "${settings.seed}"
      THEME: "${settings.age}" (Ancient/Modern/Etc)
      
      WARP CONSTRAINTS (The Rules):
      1. NODES: Generate between ${minNodes} and ${minNodes + Math.floor(worldScale * 1.5)} distinct locations (nodes).
      2. STRUCTURE: A Directed Acyclic Graph (DAG) flowing from a safe Start to a climatic End.
      3. DANGER: Overall hostility is Level ${dangerLevel}/11.
         - Start nodes should be safer (Level 1-${Math.ceil(dangerLevel / 3)}).
         - End nodes should be Level ${dangerLevel}.
      4. MAGIC vs TECH:
         - Magic Presence: ${magicLevel}/10.
         - Tech Presence: ${technologyLevel}/10.
         - Reflect this in the 'biome' and 'description' of nodes.
      
      WEFT INSTRUCTIONS (The Content):
      - Create vivid, thematic names and descriptions.
      - Ensure connectivity makes sense (e.g. Forest -> Cave -> Mountain).
      - 'travelTime' represents distance.
      
      Output ONLY valid JSON matching RpgLoomSchema.
    `;
    }
}
