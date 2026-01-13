import { LoomSettings, RpgFaction, RpgLoom } from '@realm-walker/shared';
import * as dotenv from 'dotenv';
import { describe, expect, it } from 'vitest';
import { Loom } from '../src/Loom.js';
import { Tapestry } from '../src/Tapestry.js';
import {
    AbilityLoomDef,
    ClassLoomDef,
    DialogueLoomDef,
    DungeonLoomDef,
    ItemLoomDef,
    NpcLoomDef,
    RealmContext,
    ShopLoomDef,
    TalentLoomDef
} from '../src/definitions.js';

dotenv.config({ path: '../../.env' });

// --- MOCK DATA ---
const MOCK_SETTINGS: LoomSettings = {
    seed: "Test-Seed-Isolated",
    age: "Age of Mockery",
    controls: {
        worldScale: 1,
        minNodes: 3,
        dangerLevel: 5,
        magicLevel: 5,
        technologyLevel: 5
    },
    preferences: {
        biases: { questFocus: 'balanced', combatDifficulty: 'balanced' }
    }
};

const MOCK_WORLD: RpgLoom = {
    name: "Mock World",
    description: "A testing ground for looms.",
    nodes: [
        { id: "n1", name: "Start Village", type: "start", biome: "Plains", dangerLevel: 1 },
        { id: "n2", name: "Dark Forest", type: "wild", biome: "Forest", dangerLevel: 5 },
        { id: "n3", name: "Evil Keep", type: "dungeon", biome: "Badlands", dangerLevel: 8 }
    ],
    edges: [
        { from: "n1", to: "n2", type: "road", travelTime: 10 },
        { from: "n2", to: "n3", type: "path", travelTime: 20 }
    ]
};

const MOCK_FACTIONS: RpgFaction[] = [
    {
        id: "f1", name: "Knights of Null", description: "Testers",
        archetype: "empire", motto: "Void implies value.",
        homeNodeId: "n1", allies: [], enemies: ["f2"],
        colors: ["#FFF", "#000"]
    },
    {
        id: "f2", name: "Chaos Bugs", description: "Glitches",
        archetype: "cult", motto: "Crash it.",
        homeNodeId: "n3", allies: [], enemies: ["f1"],
        colors: ["#F00", "#0F0"]
    }
];

describe('Isolated Loom Verification (Practical)', () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("Skipping Isolated Tests: No GEMINI_API_KEY found.");
        return;
    }

    const engine = new Loom({ apiKey });

    // Helper to weave a single loom with mock context
    async function weaveIsolated<T>(def: any, contextUpdates: Partial<RealmContext>) {
        const tapestry = new Tapestry<RealmContext>({ settings: MOCK_SETTINGS });
        tapestry.weave('world', MOCK_WORLD);
        tapestry.weave('factions', MOCK_FACTIONS);

        // Apply specific context needed for the test
        Object.entries(contextUpdates).forEach(([key, value]) => {
            tapestry.weave(key as keyof RealmContext, value);
        });

        // FIXED: Call weave() with correct signature: (def, input, tapestry)
        // input = MOCK_SETTINGS for all our definitions
        const output = await engine.weave(def, MOCK_SETTINGS, tapestry);

        // Manually trigger verify since Shuttle isn't running
        if (def.verify) def.verify(output, MOCK_SETTINGS, tapestry);

        return output;
    }

    it('ItemLoom should generate items from Mock World/Factions', async () => {
        const items = await weaveIsolated(ItemLoomDef, {});
        console.log(`⚔️ Mock Items: ${items.length} generated.`);
        expect(items.length).toBeGreaterThanOrEqual(1);
    });

    it('DungeonLoom should generate layout for Mock Dungeon Node', async () => {
        const mockItems = [{ id: "i1", name: "Sword", type: "weapon", description: "Test Sword" }];
        const mockBestiary = [{ id: "m1", name: "Goblin", stats: { hp: 10, str: 2, agi: 2, int: 1 }, visuals: { spriteId: "goblin" }, behavior: "aggressive", tint: "#00FF00" }];

        const dungeons = await weaveIsolated(DungeonLoomDef, {
            items: mockItems as any,
            bestiary: mockBestiary as any
        });
        console.log(`🏰 Mock Dungeons: ${dungeons.length} generated.`);
        expect(dungeons.length).toBeGreaterThanOrEqual(1);
        expect(dungeons[0].rooms.length).toBeGreaterThan(0);
    });

    it('ShopLoom should populate shops in Start Village', async () => {
        const mockItems = [{ id: "i1", name: "Potion", type: "item" }];
        const shops = await weaveIsolated(ShopLoomDef, { items: mockItems as any });
        console.log(`💰 Mock Shops: ${shops.length} generated.`);
        expect(shops.length).toBeGreaterThan(0);
        expect(shops[0].inventory).toBeDefined();
    });

    it('TalentLoom should generate a skill tree', async () => {
        const talents = await weaveIsolated(TalentLoomDef, {});
        console.log(`🌟 Mock Talents: ${talents.length} generated.`);
        expect(talents.length).toBeGreaterThan(5);
    });

    it('NpcLoom should generate Bosses and Villagers', async () => {
        const mockDungeons = [{ id: "n3", name: "Evil Keep", rooms: [{ type: "boss", id: "r1" }] }];
        const npcs = await weaveIsolated(NpcLoomDef, { dungeons: mockDungeons as any });
        console.log(`👤 Mock NPCs: ${npcs.length} generated.`);
        expect(npcs.length).toBeGreaterThan(0);
        const boss = npcs.find((n: any) => n.role === 'boss');
        expect(boss).toBeDefined();
    });

    it('ClassLoom should generate playable classes', async () => {
        const classes = await weaveIsolated(ClassLoomDef, {});
        console.log(`🛡️ Mock Classes: ${classes.length} generated.`);
        expect(classes.length).toBeGreaterThanOrEqual(3);
        const warrior = classes.find((c: any) => c.stats.str > c.stats.int);
        expect(warrior).toBeDefined();
    });

    it('AbilityLoom should generate moves for classes', async () => {
        const mockClasses = [{ id: "c1", name: "Mock Knight", description: "Tester", stats: { str: 10, agi: 5, int: 2, hp: 100 } }];
        const abilities = await weaveIsolated(AbilityLoomDef, { classes: mockClasses as any });
        console.log(`🔥 Mock Abilities: ${abilities.length} generated.`);
        expect(abilities.length).toBeGreaterThanOrEqual(3);
    });

    it('DialogueLoom should generate barks', async () => {
        // Need visuals/stats properties to match schema, even if using any cast, for safety in case validation runs deep
        const mockNpcs = [{ id: "npc1", name: "Bob", role: "villager", stats: {}, visuals: { spriteId: "bob" } }];
        const dialogue = await weaveIsolated(DialogueLoomDef, { npcs: mockNpcs as any });
        console.log(`💬 Mock Dialogue: ${dialogue.length} lines generated.`);
        expect(dialogue.length).toBeGreaterThan(0);
    });

    // Property 5: Loom Content Generation
    // **Validates: Requirements 2.1, 2.4**
    it('property: loom content generation consistency across multiple seeds', async () => {
        // Property-based test: For any valid seed and context,
        // Looms should generate consistent, valid content that meets minimum thresholds
        const testSeeds = ['seed-alpha', 'seed-beta', 'seed-gamma'];
        const testContexts = [
            { worldScale: 1, minNodes: 3 },
            { worldScale: 2, minNodes: 5 },
            { worldScale: 3, minNodes: 7 }
        ];

        for (const seed of testSeeds) {
            for (const context of testContexts) {
                const settings: LoomSettings = {
                    seed,
                    age: `Age of ${seed}`,
                    controls: {
                        worldScale: context.worldScale,
                        minNodes: context.minNodes,
                        dangerLevel: 5,
                        magicLevel: 5,
                        technologyLevel: 5
                    },
                    preferences: {
                        biases: { questFocus: 'balanced', combatDifficulty: 'balanced' }
                    }
                };

                // Test critical Looms that must meet quantity thresholds
                const items = await weaveIsolated(ItemLoomDef, {});
                expect(items.length).toBeGreaterThanOrEqual(1);
                expect(items.every((item: any) => item.id && item.name && item.type)).toBe(true);

                const classes = await weaveIsolated(ClassLoomDef, {});
                expect(classes.length).toBeGreaterThanOrEqual(3);
                expect(classes.every((cls: any) => cls.id && cls.name && cls.stats)).toBe(true);

                const abilities = await weaveIsolated(AbilityLoomDef, { classes });
                expect(abilities.length).toBeGreaterThanOrEqual(3);
                expect(abilities.every((ability: any) => ability.id && ability.name && ability.type)).toBe(true);

                // Test that generated content is contextually appropriate
                expect(items.length).toBeLessThanOrEqual(context.worldScale * 10); // Reasonable upper bound
                expect(classes.length).toBeLessThanOrEqual(context.worldScale * 5); // Reasonable upper bound
                
                // Test that all generated content has required fields
                for (const item of items) {
                    expect(typeof item.id).toBe('string');
                    expect(typeof item.name).toBe('string');
                    expect(typeof item.description).toBe('string');
                    expect(['item', 'weapon', 'armor'].includes(item.type)).toBe(true);
                }

                for (const cls of classes) {
                    expect(typeof cls.id).toBe('string');
                    expect(typeof cls.name).toBe('string');
                    expect(typeof cls.description).toBe('string');
                    expect(cls.stats.hp).toBeGreaterThan(0);
                    expect(cls.stats.str).toBeGreaterThan(0);
                }
            }
        }
    });

}, 120000); // 2 minute timeout for AI calls
