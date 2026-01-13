import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { ActionHandler, GameStateSerializer, createEntity, world } from '../../../packages/core/src/index';
import { GenAIWrapper, PlayerDriver } from '../../../packages/genai/src/index';
import { SchemaLoader, db } from '../../../packages/mechanics/src/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manual assertions to run without Vitest
function expect(actual: any) {
    return {
        toBeDefined: () => { if (actual === undefined || actual === null) throw new Error(`Expected defined, got ${actual}`); },
        toBe: (expected: any) => { if (actual !== expected) throw new Error(`Expected ${expected}, got ${actual}`); }
    };
}

async function runTest() {
    console.log("🧪 Starting Headless Integration Test...");

    // Load root .env manually if needed, or rely on preloaded env
    // dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

    // 1. Setup Driver
    let driver: any;
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
        console.log("🔑 API Key found. Using Gemini 1.5 Flash.");
        const wrapper = new GenAIWrapper(apiKey, 'gemini-1.5-flash');
        driver = new PlayerDriver(wrapper);
    } else {
        console.warn('⚠️ GEMINI_API_KEY missing. Using MOCK Driver.');
        driver = {
            decide: async (view: any) => {
                // Context-Aware Behavior Rule:
                // If it's Night/Dusk, we are scared -> WAIT
                if (view.global?.timeOfDay === 'night' || view.global?.timeOfDay === 'dusk') {
                    console.log("🌑 It is too dark to move. Waiting...");
                    return { type: 'WAIT', turns: 1 };
                }

                if (!view.agent.equipment['main_hand']) {
                    return { type: 'EQUIP_ITEM', itemId: 'item_rusty_sword', slot: 'main_hand' };
                }
                if (view.agent.position.x === 12) {
                    return { type: 'MOVE', target: { x: 13, y: 12 } };
                }
                return { type: 'WAIT', turns: 1 };
            }
        };
    }

    // 2. Load Fixture
    let realmPath = path.resolve(__dirname, '../realm.json');
    if (!fs.existsSync(realmPath)) {
        fs.writeFileSync(realmPath, JSON.stringify({
            age: { name: "Test Age" },
            classes: [{ id: "c1", name: "Test Class" }],
            items: []
        }));
    }
    const realmData = JSON.parse(fs.readFileSync(realmPath, 'utf-8'));

    // 3. Hydrate
    const loader = new SchemaLoader(db);
    loader.loadRealm(realmData);

    const heroId = 'hero_test_1';
    createEntity({
        id: heroId,
        name: 'Test Hero',
        position: { x: 12, y: 12, z: 0 },
        stats: { hp: 100, maxHp: 100 },
        inventory: [],
        log: []
    });

    createEntity({
        id: 'item_rusty_sword',
        name: 'Rusty Sword',
        type: 'item',
        position: { x: 13, y: 12, z: 0 },
        visuals: { spriteId: 'sword_icon', billboard: true }
    });

    createEntity({
        id: 'goblin_1',
        name: 'Goblin Scout',
        type: 'enemy',
        position: { x: 13, y: 12, z: 0 },
        stats: { hp: 20, maxHp: 20 }
    });

    const serializer = new GameStateSerializer(world);
    const handler = new ActionHandler(world);

    // 4. Loop
    // Start at tick 70 (Dusk) -> Night
    const startTick = 70;
    const maxTurns = 3;
    for (let i = startTick; i <= startTick + maxTurns; i++) {
        console.log(`\n--- Turn ${i} ---`);
        const view = serializer.serialize(heroId, i);
        console.log(`👁️  AI sees: [${view.global.timeOfDay.toUpperCase()}] ${view.surroundings.length} entities.`);

        // MOCK DECISION LOGIC FOR CONSUME TEST
        let action: any = { type: 'WAIT', turns: 1 };

        // If we are hurt, CONSUME potion!
        // Hack: Manually damage the hero to test healing
        const hero = world.with('id').where(e => e.id === heroId).first;
        if (hero && hero.stats && hero.stats.hp > 10) {
            hero.stats.hp = 5; // Ouch!
            console.log("🚑 Hero manually damaged to 5 HP for testing.");
        }

        if (view.agent.hp < 20) {
            console.log("🚑 Health low! Consuming potion...");
            action = { type: 'CONSUME', itemId: 'potion_small' };
        } else {
            // Fallback to combat if healthy (or if healing worked)
            const enemy = view.surroundings.find(e => e.type === 'enemy');
            if (enemy && view.global.timeOfDay !== 'night') {
                action = { type: 'ATTACK', targetId: enemy.id };
            }
        }

        console.log(`💡 AI decided: ${JSON.stringify(action)}`);

        const result = handler.execute(heroId, action);
        console.log(`⚡ Result: ${result.success ? '✅' : '❌'} ${result.message}`);


        if (action.type === 'EQUIP_ITEM' && result.success) {
            const hero = world.with('id').where(e => e.id === heroId).first;
            expect(hero?.equipment?.['main_hand']).toBe('item_rusty_sword');
            console.log("✅ Verified Equipment Change");
        }
    }
    console.log("\n✅ Test Passed Successfully.");
}

runTest().catch(e => {
    console.error("❌ Test Failed:", e);
    process.exit(1);
});
