import {
    FactionSchema,
    LoomSettings,
    RpgAbility,
    RpgAbilitySchema,
    RpgBestiary,
    RpgBestiarySchema,
    RpgClass,
    RpgClassSchema,
    RpgDialogue,
    RpgDialogueSchema,
    RpgDungeon,
    RpgDungeonSchema,
    RpgFaction,
    RpgGod,
    RpgGodSchema,
    RpgHero,
    RpgHeroSchema,
    RpgHistoryEvent,
    RpgHistoryEventSchema,
    RpgItem,
    RpgItemSchema,
    RpgLoom,
    RpgLoomSchema,
    RpgNpc,
    RpgNpcSchema,
    RpgQuest,
    RpgQuestSchema,
    RpgShop,
    RpgShopSchema,
    RpgTalent,
    RpgTalentSchema
} from '@realm-walker/shared';
import { z } from 'zod';
import { GeminiModel } from './GeminiAdapter.js';
import { LoomDefinition } from './Loom.js';

// --- CONTEXT ---
export interface RealmContext {
    settings: LoomSettings;
    world?: RpgLoom;
    factions?: RpgFaction[];
    items?: RpgItem[];
    bestiary?: RpgBestiary[];
    hero?: RpgHero;
    quests?: RpgQuest[];
    history?: RpgHistoryEvent[];
    pantheon?: RpgGod[];
    dungeons?: RpgDungeon[];
    shops?: RpgShop[];
    talents?: RpgTalent[];
    npcs?: RpgNpc[];
    classes?: RpgClass[];
    abilities?: RpgAbility[];
    dialogue?: RpgDialogue[];
}

// --- DDL DEFINITIONS ---

export const WorldLoomDef: LoomDefinition<LoomSettings, RpgLoom, RealmContext> = {
    name: "WorldLoom",
    tags: ['core', 'world'],
    produces: ['world'],
    schema: RpgLoomSchema as z.ZodType<any>,
    model: GeminiModel.GEMINI_2_0_FLASH, // Pinned to v2 for stability
    pattern: (settings) => {
        const { worldScale, minNodes, dangerLevel, magicLevel, technologyLevel } = settings.controls;
        return `
        Weave a Narrative World Graph.
        SEED: "${settings.seed}"
        THEME: "${settings.age}"
        
        WARP CONSTRAINTS:
        1. Create at least ${minNodes} Nodes.
        2. Make a DAG from Start to End.
        3. Tech Level: ${technologyLevel}/10. Magic Level: ${magicLevel}/10.
        4. Danger: ${dangerLevel}/10.
        
        Output strictly valid JSON.
        `;
    },
    verify: (output, input) => {
        if (output.nodes.length < input.controls.minNodes) {
            throw new Error(`Generated nodes (${output.nodes.length}) < MinNodes (${input.controls.minNodes})`);
        }
        const hasStart = output.nodes.some(n => n.type === 'start');
        if (!hasStart) throw new Error("Missing 'start' node.");
    }
};

export const FactionLoomDef: LoomDefinition<LoomSettings, RpgFaction[], RealmContext> = {
    name: "FactionLoom",
    tags: ['social', 'world'],
    consumes: ['world'],
    produces: ['factions'],
    schema: z.array(FactionSchema) as z.ZodType<any>,
    model: GeminiModel.GEMINI_2_0_FLASH,
    pattern: (settings, tapestry) => {
        const world = tapestry.get('world');
        if (!world) throw new Error("Missing World Graph Context");

        const nodes = world.nodes.map(n => `${n.id} (${n.biome})`).join(', ');

        return `
        Weave Factions for this World.
        THEME: "${settings.age}"
        NODES: ${nodes}
        
        WARP CONSTRAINTS:
        1. Generate 2-4 Factions.
        2. 'homeNodeId' MUST be a valid Node ID from the list above.
        3. Define allies/enemies.
        
        Output strictly valid JSON Array of Factions.
        `;
    },
    verify: (output, input, tapestry) => {
        if (output.length < 2) throw new Error("Too few factions generated.");
        const world = tapestry.get('world');
        if (world) {
            // Verify Logic Consistency
            const nodeIds = new Set(world.nodes.map(n => n.id));
            output.forEach(f => {
                if (!nodeIds.has(f.homeNodeId)) {
                    throw new Error(`Faction ${f.name} has invalid homeNodeId: ${f.homeNodeId}`);
                }
            });
        }
    }
};

export const ItemLoomDef: LoomDefinition<LoomSettings, RpgItem[], RealmContext> = {
    name: "ItemLoom",
    tags: ['loot', 'economy'],
    consumes: ['world', 'factions'],
    produces: ['items'],
    schema: z.array(RpgItemSchema) as z.ZodType<any>,
    model: GeminiModel.GEMINI_2_0_FLASH,
    pattern: (settings, tapestry) => {
        const world = tapestry.get('world');
        const factions = tapestry.get('factions');

        const worldContext = world ? world.description : "A generic fantasy world";
        const factionContext = factions ? factions.map(f => f.name).join(", ") : "Unknown";

        return `
        Weave Items and Equipment.
        THEME: "${settings.age}"
        WORLD CONTEXT: ${worldContext}
        FACTIONS: ${factionContext}
        
        WARP CONSTRAINTS:
        1. Generate 5-10 Unique Items.
        2. Include a mix of Weapons, Armor, and Consumables.
        3. Items should reflect the technology level (${settings.controls.technologyLevel}/10) and magic level (${settings.controls.magicLevel}/10).
        4. Name them creatively.
        
        Output strictly valid JSON Array of Items.
        `;
    },
    verify: (output) => {
        if (output.length < 5) throw new Error("Too few items generated.");
        const types = new Set(output.map(i => i.type));
        if (types.size < 2) throw new Error("Lack of item variety (types).");
    }
};

export const BestiaryLoomDef: LoomDefinition<LoomSettings, RpgBestiary[], RealmContext> = {
    name: "BestiaryLoom",
    tags: ['world', 'monsters'],
    consumes: ['world'],
    produces: ['bestiary'],
    schema: z.array(RpgBestiarySchema) as z.ZodType<any>,
    model: GeminiModel.GEMINI_2_0_FLASH,
    pattern: (settings, tapestry) => {
        const world = tapestry.get('world');
        const nodes = world ? world.nodes.map(n => `${n.name} (${n.biome})`).join(', ') : "Legacy";

        return `
         Weave a Bestiary of Monsters.
         THEME: "${settings.age}"
         BIOMES: ${nodes}
         DANGER: ${settings.controls.dangerLevel}/10
         
         WARP CONSTRAINTS:
         1. Generate 3-6 Unique Monsters.
         2. Adapt stats to fit the danger level.
         3. Assign appropriate 'behavior' based on the creature type.
         
         Output strictly valid JSON Array of Bestiary entries.
         `;
    },
    verify: (output) => {
        if (output.length < 3) throw new Error("Too few monsters.");
    }
};

export const HeroLoomDef: LoomDefinition<LoomSettings, RpgHero, RealmContext> = {
    name: "HeroLoom",
    tags: ['character', 'protagonist'],
    consumes: ['world', 'factions'],
    produces: ['hero'],
    schema: RpgHeroSchema as z.ZodType<any>,
    model: GeminiModel.GEMINI_2_0_FLASH,
    pattern: (settings, tapestry) => {
        const world = tapestry.get('world');
        const factions = tapestry.get('factions');

        const nodes = world ? world.nodes.map(n => n.id).join(', ') : "Unknown";
        const factionList = factions ? factions.map(f => f.name).join(', ') : "None";

        return `
        Weave the Protagonist Hero.
        THEME: "${settings.age}"
        NODES: ${nodes}
        FACTIONS: ${factionList}
        
        WARP CONSTRAINTS:
        1. Create a Hero that fits the theme.
        2. 'originNodeId' MUST be one of the nodes above.
        3. 'factionId' (optional) MUST be one of the factions or undefined.
        4. Stats should reflect class (Warrior -> Str, Mage -> Int).
        
        Output strictly valid JSON for a Single Hero.
        `;
    },
    verify: (output, _input, tapestry) => {
        const world = tapestry.get('world');
        if (world) {
            const nodeIds = new Set(world.nodes.map(n => n.id));
            if (!nodeIds.has(output.originNodeId)) {
                throw new Error(`Hero origin ${output.originNodeId} invalid.`);
            }
        }
    }
};

export const QuestLoomDef: LoomDefinition<LoomSettings, RpgQuest[], RealmContext> = {
    name: "QuestLoom",
    tags: ['scenarios', 'gameplay'],
    consumes: ['world', 'factions', 'bestiary', 'items', 'hero'],
    produces: ['quests'],
    schema: z.array(RpgQuestSchema) as z.ZodType<any>,
    model: GeminiModel.GEMINI_2_0_FLASH,
    pattern: (settings, tapestry) => {
        // We need all context here
        const w = tapestry.get('world');
        const b = tapestry.get('bestiary');
        const h = tapestry.get('hero'); // Assuming hero is set

        const monsters = b ? b.map(m => m.id).join(', ') : "";
        const heroName = h ? h.name : "Adventurer";

        const focus = settings.preferences?.biases?.questFocus || 'balanced';

        return `
        Weave Quests for ${heroName}.
        THEME: "${settings.age}"
        MONSTERS: ${monsters}
        FOCUS: ${focus.toUpperCase()}
        
        WARP CONSTRAINTS:
        1. Generate 3 Starting Quests.
        2. 'objectives.targetId' should reference valid monster IDs or locations if possible (or be generic).
        3. Mix types: Kill, Fetch, Explore.
        4. Bias the Quests towards: ${focus}.
        
        Output strictly valid JSON Array of Quests.
        `;
    },
    verify: (output) => {
        if (output.length < 3) throw new Error("Too few quests.");
    }
};

export const HistoryLoomDef: LoomDefinition<LoomSettings, RpgHistoryEvent[], RealmContext> = {
    name: "HistoryLoom",
    tags: ['lore', 'background'],
    produces: ['history'],
    schema: z.array(RpgHistoryEventSchema) as z.ZodType<any>,
    model: GeminiModel.GEMINI_2_0_FLASH,
    pattern: (settings) => {
        return `
        Weave the History of this World.
        THEME: "${settings.age}"
        SEED: "${settings.seed}"
        
        WARP CONSTRAINTS:
        1. Create a timeline of 5-10 Major Events.
        2. Spans at least 1000 years.
        3. Define eras (e.g. "Age of Fire", "The Dark Years").
        
        Output strictly valid JSON Array of History Events.
        `;
    },
    verify: (output) => {
        if (output.length < 5) throw new Error("Too short history.");
    }
};

export const PantheonLoomDef: LoomDefinition<LoomSettings, RpgGod[], RealmContext> = {
    name: "PantheonLoom",
    tags: ['religion', 'lore'],
    consumes: ['history'],
    produces: ['pantheon'],
    schema: z.array(RpgGodSchema) as z.ZodType<any>,
    model: GeminiModel.GEMINI_2_0_FLASH,
    pattern: (settings, tapestry) => {
        const history = tapestry.get('history');
        const context = history ? history.map(h => h.name).join(', ') : "Mythic Age";

        return `
        Weave the Pantheon of Gods.
        THEME: "${settings.age}"
        HISTORY LINK: ${context}
        
        WARP CONSTRAINTS:
        1. Generate 3-7 Gods.
        2. Varied domains (War, Nature, Death, Innovation).
        3. Connect them to the history/theme.
        
        Output strictly valid JSON Array of Gods.
        `;
    },
    verify: (output) => {
        if (output.length < 3) throw new Error("Too small pantheon.");
    }
};

export const DungeonLoomDef: LoomDefinition<LoomSettings, RpgDungeon[], RealmContext> = {
    name: "DungeonLoom",
    tags: ['gameplay', 'level-design'],
    consumes: ['world', 'bestiary', 'items'],
    produces: ['dungeons'],
    schema: z.array(RpgDungeonSchema) as z.ZodType<any>,
    model: GeminiModel.GEMINI_2_0_FLASH,
    pattern: (settings, tapestry) => {
        const world = tapestry.get('world');
        // Find nodes tagged as 'dungeon' or suitable
        const dungeonNodes = world ? world.nodes.filter(n => n.type === 'dungeon' || n.dangerLevel > 7).slice(0, 3) : [];
        const targets = dungeonNodes.map(n => `${n.id} (${n.name})`).join(', ');

        return `
        Weave Dungeon Layouts.
        THEME: "${settings.age}"
        TARGET LOCATIONS: ${targets || "Generic Dungeon"}
        
        WARP CONSTRAINTS:
        1. Generate a valid Dungeon Logic for EACH target location above.
        2. Create 5-10 Rooms per dungeon.
        3. 'connections' must form a valid graph between rooms.
        4. Include a BOSS room.
        
        Output strictly valid JSON Array of Dungeons.
        `;
    },
    verify: (output) => {
        if (output.length === 0) return; // Might be none if no dungeon nodes
        output.forEach(d => {
            if (d.rooms.length < 3) throw new Error(`Dungeon ${d.name} too small.`);
            const hasBoss = d.rooms.some(r => r.type === 'boss');
            if (!hasBoss) throw new Error(`Dungeon ${d.name} missing boss.`);
        });
    }
};




// --- PRACTICAL LOOMS ---

export const ShopLoomDef: LoomDefinition<LoomSettings, RpgShop[], RealmContext> = {
    name: "ShopLoom",
    tags: ['economy', 'gameplay'],
    consumes: ['world', 'items'],
    produces: ['shops'],
    schema: z.array(RpgShopSchema) as z.ZodType<any>,
    model: GeminiModel.GEMINI_2_0_FLASH,
    pattern: (settings, tapestry) => {
        const world = tapestry.get('world');
        const items = tapestry.get('items');

        const towns = world ? world.nodes.filter(n => n.type === 'town' || n.type === 'hub' || n.type === 'start') : [];
        const townList = towns.map(n => `${n.id} (${n.name})`).join(', ');
        const itemList = items ? items.map(i => `${i.id} (${i.type})`).join(', ') : "Generic Items";

        return `
        Weave Shops for the Towns.
        THEME: "${settings.age}"
        TOWNS: ${townList}
        AVAILABLE ITEMS: ${itemList}
        
        WARP CONSTRAINTS:
        1. Create 1-2 Shops per Town.
        2. Vary types (Blacksmith, Alchemist, General).
        3. Stock valid items from the list.
        4. Create a Keeper personality.
        
        Output strictly valid JSON Array of Shops.
        `;
    },
    verify: (output) => {
        if (output.length === 0) return;
        output.forEach(s => {
            if (s.inventory.length < 1) throw new Error(`Shop ${s.name} is empty.`);
        });
    }
};

export const TalentLoomDef: LoomDefinition<LoomSettings, RpgTalent[], RealmContext> = {
    name: "TalentLoom",
    tags: ['gameplay', 'mechanics'],
    consumes: ['hero'], // Could look at class
    produces: ['talents'],
    schema: z.array(RpgTalentSchema) as z.ZodType<any>,
    model: GeminiModel.GEMINI_2_0_FLASH,
    pattern: (settings) => {
        return `
        Weave a Talent Tree System.
        THEME: "${settings.age}"
        MAGIC: ${settings.controls.magicLevel}/10
        TECH: ${settings.controls.technologyLevel}/10
        
        WARP CONSTRAINTS:
        1. Generate 10-15 Talents.
        2. Mix of Passive and Active skills.
        3. Align names with the theme (e.g. "Steam Power" vs "Arcane Focus").
        
        Output strictly valid JSON Array of Talents.
        `;
    },
    verify: (output) => {
        if (output.length < 5) throw new Error("Too few talents.");
    }
};

export const NpcLoomDef: LoomDefinition<LoomSettings, RpgNpc[], RealmContext> = {
    name: "NpcLoom",
    tags: ['characters', 'world'],
    consumes: ['world', 'factions', 'dungeons'],
    produces: ['npcs'],
    schema: z.array(RpgNpcSchema) as z.ZodType<any>,
    model: GeminiModel.GEMINI_2_0_FLASH,
    pattern: (settings, tapestry) => {
        const dungeons = tapestry.get('dungeons');
        const world = tapestry.get('world');

        // Find Boss Rooms
        const bossContext = dungeons ? dungeons.flatMap(d => d.rooms.filter(r => r.type === 'boss').map(r => `Boss in ${d.name}`)) : [];

        return `
        Weave NPCs and Bosses.
        THEME: "${settings.age}"
        BOSS CONTEXT: ${bossContext.join(', ')}
        
        WARP CONSTRAINTS:
        1. Create Boss NPCs for the dungeons.
        2. Create 3-5 Notable NPCs (Villagers/Guards) for towns.
        3. Make them distinct.
        
        Output strictly valid JSON Array of NPCs.
        `;
    },
    verify: (output, input, tapestry) => {
        // Ensure at least one boss if we have dungeons
        const dungeons = tapestry.get('dungeons');
        if (dungeons && dungeons.length > 0) {
            const bosses = output.filter(n => n.role === 'boss');
            if (bosses.length < 1) throw new Error("Missing Boss NPCs for dungeons.");
        }
    }
};

export const ClassLoomDef: LoomDefinition<LoomSettings, RpgClass[], RealmContext> = {
    name: "ClassLoom",
    tags: ['mechanics', 'core'],
    produces: ['classes'],
    schema: z.array(RpgClassSchema) as z.ZodType<any>,
    model: GeminiModel.GEMINI_2_0_FLASH,
    pattern: (settings) => {
        return `
        Weave Character Classes.
        THEME: "${settings.age}"
        MAGIC: ${settings.controls.magicLevel}
        TECH: ${settings.controls.technologyLevel}
        
        WARP CONSTRAINTS:
        1. Generate 3-5 Core Classes (Warrior, Mage, Rogue equivalents).
        2. Name them thematically (e.g. "Steam Knight" instead of Warrior).
        3. Define base stats.
        
        Output strictly valid JSON Array of Classes.
        `;
    },
    verify: (output) => {
        if (output.length < 3) throw new Error("Too few classes.");
    }
};

export const AbilityLoomDef: LoomDefinition<LoomSettings, RpgAbility[], RealmContext> = {
    name: "AbilityLoom",
    tags: ['combat', 'mechanics'],
    consumes: ['classes'],
    produces: ['abilities'],
    schema: z.array(RpgAbilitySchema) as z.ZodType<any>,
    model: GeminiModel.GEMINI_2_0_FLASH,
    pattern: (settings, tapestry) => {
        const classes = tapestry.get('classes');
        const classContext = classes ? classes.map(c => c.name).join(', ') : "Generic";

        return `
        Weave Combat Abilities.
        THEME: "${settings.age}"
        CLASSES: ${classContext}
        
        WARP CONSTRAINTS:
        1. Generate 3 Abilities per Class.
        2. Mix of Physical/Magical.
        3. Include Costs (MP/SP).
        
        Output strictly valid JSON Array of Abilities.
        `;
    },
    verify: (output) => {
        if (output.length < 3) throw new Error("Too few abilities.");
    }
};

export const DialogueLoomDef: LoomDefinition<LoomSettings, RpgDialogue[], RealmContext> = {
    name: "DialogueLoom",
    tags: ['narrative', 'flavor'],
    consumes: ['npcs', 'world'],
    produces: ['dialogue'],
    schema: z.array(RpgDialogueSchema) as z.ZodType<any>,
    model: GeminiModel.GEMINI_2_0_FLASH,
    pattern: (settings, tapestry) => {
        const npcs = tapestry.get('npcs');
        const world = tapestry.get('world');

        const context = npcs ? npcs.slice(0, 5).map(n => `${n.name} (${n.role})`).join(', ') : "Generic NPCs";

        return `
        Weave Dialogue Barks & Rumors.
        THEME: "${settings.age}"
        NPC CONTEXT: ${context}
        
        WARP CONSTRAINTS:
        1. Generate Greetings for the NPCs.
        2. Generate Rumors about the world/dungeons.
        3. Keep it brief.
        
        Output strictly valid JSON Array of Dialogue objects.
        `;
    },
    verify: (output) => {
        if (output.length < 3) throw new Error("Too little dialogue.");
    }
};
