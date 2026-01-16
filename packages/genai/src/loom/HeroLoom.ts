import { Faction, Hero, HeroSchema, LoomSettings, RpgClass } from '@realm-walker/shared';
import { AbstractLoom } from './AbstractLoom.js';

interface HeroContext {
    factions: Faction[];
    classes: RpgClass[];
}

export class HeroLoom extends AbstractLoom<Hero[], HeroContext> {
    constructor(apiKey: string) {
        super(apiKey, HeroSchema.array());
    }

    protected constructPrompt(settings: LoomSettings, context?: HeroContext): string {
        const factions = context?.factions.map(f => f.name).join(', ') || 'None';
        const classes = context?.classes.map(c => c.name).join(', ') || 'Generic';

        return `
      Weave the Heroes (108 Stars of Destiny) for this Realm.
      
      SEED: "${settings.seed}"
      FACTIONS: ${factions}
      CLASSES: ${classes}
      
      WARP CONSTRAINTS:
      1. COUNT: 3-5 Key Characters.
      2. VARIETY: Mix of combat and support roles.
      3. RECRUITMENT: Define a specific 'joinCondition' (e.g. "Level 5", "Talk to in Capital").
      
      WEFT INSTRUCTIONS:
      - 'personality' should be distinct.
      
      Output ONLY valid JSON matching HeroSchema[].
    `;
    }
}
