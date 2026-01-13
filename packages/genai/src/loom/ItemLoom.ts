import { LoomSettings, RpgClass, RpgItem, RpgItemSchema, RpgLoom } from '@realm-walker/shared';
import { z } from 'zod';
import { AbstractLoom } from './AbstractLoom.js';

const RpgItemArraySchema = z.array(RpgItemSchema);

interface ItemContext {
    world: RpgLoom;
    classes: RpgClass[];
}

export class ItemLoom extends AbstractLoom<RpgItem[], ItemContext> {
    constructor(apiKey: string) {
        super(apiKey, RpgItemArraySchema);
    }

    protected constructPrompt(settings: LoomSettings, context?: ItemContext): string {
        const { magicLevel, technologyLevel } = settings.controls;

        // Suggest items useful for the generated classes
        const classHints = context?.classes ?
            `Create weapons suitable for: ${context.classes.map(c => c.name).join(', ')}.` :
            '';

        return `
      Weave the Items (Loot & Gear) for this Realm.
      
      SEED: "${settings.seed}"
      THEME: "${settings.age}"
      HINTS: ${classHints}
      
      WARP CONSTRAINTS:
      1. COUNT: 8-12 items.
      2. BALANCE: Mix of Weapons, Armor, and Consumables.
      3. TECH LEVEL: Magic (${magicLevel}) vs Tech (${technologyLevel}).
      
      WEFT INSTRUCTIONS:
      - 'visuals.iconId' must be unique.
      - Make items interesting, not just "Iron Sword".
      
      Output ONLY valid JSON matching RpgItemSchema[].
    `;
    }
}
