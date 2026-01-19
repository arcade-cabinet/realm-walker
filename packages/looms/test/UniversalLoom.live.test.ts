import { LoomSettings } from '@realm-walker/shared';
import * as dotenv from 'dotenv';
import { describe, expect, it } from 'vitest';
import { Shuttle } from '../src/Shuttle.js';
import { Tapestry } from '../src/Tapestry.js';
import {
    AbilityLoomDef,
    BestiaryLoomDef,
    ClassLoomDef,
    DialogueLoomDef,
    DungeonLoomDef,
    FactionLoomDef,
    HeroLoomDef,
    HistoryLoomDef,
    ItemLoomDef,
    NpcLoomDef,
    PantheonLoomDef,
    QuestLoomDef,
    RealmContext,
    ShopLoomDef,
    TalentLoomDef,
    WorldLoomDef
} from '../src/definitions.js';

dotenv.config({ path: '../../.env' });

describe('Universal Loom (DDL Proof)', () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("Skipping Live Proof: No GEMINI_API_KEY found.");
        return;
    }

    const SETTINGS: LoomSettings = {
        seed: "Universal-Test-Seed-Full",
        age: "Age of the Universal Machine",
        controls: {
            worldScale: 1, // Keep it small for speed
            minNodes: 3,
            dangerLevel: 5,
            magicLevel: 5,
            technologyLevel: 5
        },
        preferences: {
            biases: {
                questFocus: 'dungeon',
                combatDifficulty: 'balanced'
            }
        }
    };

    it('Should execute Full DDL Chain (World... -> Quest) with Verification', async () => {
        // 1. Setup - Use current Shuttle API: Shuttle(apiKey, tapestry)
        const tapestry = new Tapestry<RealmContext>({ settings: SETTINGS });
        const shuttle = new Shuttle<RealmContext>(apiKey, tapestry);

        // 2. Register Jobs using current DDL API: addJob(def, options?)
        // The LoomDefinitions already have 'produces' which auto-weaves to tapestry
        shuttle
            .addJob(WorldLoomDef)
            .addJob(FactionLoomDef)
            .addJob(ClassLoomDef)
            .addJob(ItemLoomDef)
            .addJob(BestiaryLoomDef)
            .addJob(HistoryLoomDef)
            .addJob(PantheonLoomDef)
            .addJob(AbilityLoomDef)
            .addJob(HeroLoomDef)
            .addJob(TalentLoomDef)
            .addJob(DungeonLoomDef)
            .addJob(ShopLoomDef)
            .addJob(NpcLoomDef)
            .addJob(DialogueLoomDef)
            .addJob(QuestLoomDef);

        // 3. Launch
        console.log("🚀 Launching Universal Shuttle...");
        await shuttle.launch();

        // 4. Verify Final State (Tapestry)
        const world = tapestry.get('world');
        const factions = tapestry.get('factions');
        const items = tapestry.get('items');
        const bestiary = tapestry.get('bestiary');
        const hero = tapestry.get('hero');
        const quests = tapestry.get('quests');
        const history = tapestry.get('history');
        const pantheon = tapestry.get('pantheon');
        const dungeons = tapestry.get('dungeons');

        const classes = tapestry.get('classes');
        const abilities = tapestry.get('abilities');
        const talents = tapestry.get('talents');
        const shops = tapestry.get('shops');
        const npcs = tapestry.get('npcs');
        const dialogue = tapestry.get('dialogue');

        expect(world).toBeDefined();
        expect(factions).toBeDefined();
        expect(classes).toBeDefined();
        expect(items).toBeDefined();
        expect(bestiary).toBeDefined();
        expect(history).toBeDefined();
        expect(pantheon).toBeDefined();
        expect(abilities).toBeDefined();
        expect(hero).toBeDefined();
        expect(talents).toBeDefined();
        expect(dungeons).toBeDefined();
        expect(shops).toBeDefined();
        expect(npcs).toBeDefined();
        expect(dialogue).toBeDefined();
        expect(quests).toBeDefined();

        console.log(`🌍 Generated ${world?.nodes.length} nodes.`);
        console.log(`🚩 Generated ${factions?.length} factions.`);
        console.log(`🛡️ Generated ${classes?.length} classes.`);
        console.log(`⚔️ Generated ${items?.length} items.`);
        console.log(`🐉 Generated ${bestiary?.length} monsters.`);
        console.log(`📜 Generated ${history?.length} history events.`);
        console.log(`⚡ Generated ${pantheon?.length} gods.`);
        console.log(`🔥 Generated ${abilities?.length} abilities.`);
        console.log(`🦸 Hero: ${hero?.name} of ${hero?.originNodeId}`);
        console.log(`🌟 Generated ${talents?.length} talents.`);
        console.log(`🏰 Generated ${dungeons?.length} dungeons.`);
        console.log(`💰 Generated ${shops?.length} shops.`);
        console.log(`👤 Generated ${npcs?.length} NPCs.`);
        console.log(`💬 Generated ${dialogue?.length} dialogue lines.`);
        console.log(`🛡️ Generated ${quests?.length} quests.`);

        // Detailed check
        expect(world?.nodes.length).toBeGreaterThanOrEqual(3);
        expect(factions?.length).toBeGreaterThanOrEqual(2);
        expect(classes?.length).toBeGreaterThanOrEqual(3);
        expect(hero?.name).toBeTruthy();
        expect(quests?.length).toBeGreaterThanOrEqual(3);
        expect(history?.length).toBeGreaterThanOrEqual(5);
        expect(pantheon?.length).toBeGreaterThanOrEqual(3);
        expect(shops?.length).toBeGreaterThanOrEqual(1);
        expect(npcs?.length).toBeGreaterThanOrEqual(1);

    }, 300000); // 5 minute timeout for 15 jobs

    // Property 6: Dependency Orchestration
    // **Validates: Requirements 2.5**
    it('property: dependency orchestration consistency across different job orders', async () => {
        // Property-based test: For any valid ordering of Loom jobs,
        // the dependency orchestration should produce consistent results
        const jobOrders = [
            // Standard order (dependencies first)
            [WorldLoomDef, FactionLoomDef, ClassLoomDef, ItemLoomDef, BestiaryLoomDef, HeroLoomDef],
            // Reverse order (dependencies last)
            [HeroLoomDef, BestiaryLoomDef, ItemLoomDef, ClassLoomDef, FactionLoomDef, WorldLoomDef],
            // Mixed order
            [ClassLoomDef, WorldLoomDef, ItemLoomDef, FactionLoomDef, HeroLoomDef, BestiaryLoomDef]
        ];

        const results = [];

        for (const [index, jobOrder] of jobOrders.entries()) {
            const testSettings: LoomSettings = {
                seed: `dependency-test-${index}`,
                age: `Age of Order ${index}`,
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

            const tapestry = new Tapestry<RealmContext>({ settings: testSettings });
            const shuttle = new Shuttle<RealmContext>(apiKey, tapestry);

            // Add jobs in the specified order
            for (const jobDef of jobOrder) {
                shuttle.addJob(jobDef);
            }

            await shuttle.launch();

            // Collect results for comparison
            const result = {
                world: tapestry.get('world'),
                factions: tapestry.get('factions'),
                classes: tapestry.get('classes'),
                items: tapestry.get('items'),
                bestiary: tapestry.get('bestiary'),
                hero: tapestry.get('hero')
            };

            results.push(result);

            // Verify all dependencies were resolved correctly regardless of order
            expect(result.world).toBeDefined();
            expect(result.world?.nodes.length).toBeGreaterThanOrEqual(3);
            
            expect(result.factions).toBeDefined();
            expect(result.factions?.length).toBeGreaterThanOrEqual(2);
            
            expect(result.classes).toBeDefined();
            expect(result.classes?.length).toBeGreaterThanOrEqual(3);
            
            expect(result.items).toBeDefined();
            expect(result.items?.length).toBeGreaterThanOrEqual(1);
            
            expect(result.bestiary).toBeDefined();
            expect(result.bestiary?.length).toBeGreaterThanOrEqual(1);
            
            expect(result.hero).toBeDefined();
            expect(result.hero?.name).toBeTruthy();
            expect(result.hero?.originNodeId).toBeTruthy();

            // Verify hero references valid world node
            const heroNode = result.world?.nodes.find(n => n.id === result.hero?.originNodeId);
            expect(heroNode).toBeDefined();

            // Verify hero references valid class
            const heroClass = result.classes?.find(c => c.id === result.hero?.classId);
            expect(heroClass).toBeDefined();

            // Verify hero references valid faction
            const heroFaction = result.factions?.find(f => f.id === result.hero?.factionId);
            expect(heroFaction).toBeDefined();
        }

        // Verify that different job orders produce structurally consistent results
        // (same types of content, even if specific content differs due to different seeds)
        for (let i = 1; i < results.length; i++) {
            const prev = results[i - 1];
            const curr = results[i];

            // Structure should be consistent
            expect(typeof curr.world?.nodes.length).toBe(typeof prev.world?.nodes.length);
            expect(typeof curr.factions?.length).toBe(typeof prev.factions?.length);
            expect(typeof curr.classes?.length).toBe(typeof prev.classes?.length);
            expect(typeof curr.hero?.name).toBe(typeof prev.hero?.name);

            // All should have valid cross-references
            expect(curr.hero?.originNodeId).toBeTruthy();
            expect(curr.hero?.classId).toBeTruthy();
            expect(curr.hero?.factionId).toBeTruthy();
        }
    }, 600000); // 10 minute timeout for multiple orchestrations
});
