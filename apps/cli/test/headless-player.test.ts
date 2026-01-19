import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { beforeAll, describe, expect, it } from 'vitest';
import { ActionHandler, GameStateSerializer, createEntity, world } from '../../../packages/core/src/index';
import { PlayerDriver } from '../../../packages/looms/src/index';
import { SchemaLoader, db } from '../../../packages/mechanics/src/index';

// Load root .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

describe('Looms End-to-End Playthrough', () => {
    let driver: any;
    let serializer: GameStateSerializer;
    let handler: ActionHandler;
    let heroId: string;

    beforeAll(async () => {
        // 1. Setup Driver
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            console.log("🔑 API Key found. Using PlayerDriver from looms.");
            driver = new PlayerDriver(apiKey);
        } else {
            console.warn('⚠️ GEMINI_API_KEY missing. Using MOCK Driver.');
            driver = {
                decide: async (view: any) => {
                    // Deterministic Mock Logic
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

        // 2. Load Real Fixture (Noun)
        // Prefer the stable manual one or generated? Let's use the one in apps/cli if exists
        let realmPath = path.resolve(__dirname, '../realm.json');
        if (!fs.existsSync(realmPath)) {
            // Fallback to creating a minimal test fixture
            fs.writeFileSync(realmPath, JSON.stringify({
                age: { name: "Test Age" },
                classes: [{ id: "c1", name: "Test Class" }],
                items: []
            }));
        }
        const realmData = JSON.parse(fs.readFileSync(realmPath, 'utf-8'));

        // 3. Hydrate Core (Body)
        const loader = new SchemaLoader(db);
        loader.loadRealm(realmData);

        // Reset world for test isolation? Miniplex might need manual clear if shared state
        // world.entities.clear(); // Theoretical

        heroId = 'hero_test_1';
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

        serializer = new GameStateSerializer(world);
        handler = new ActionHandler(world);
    });

    it('should complete a 3-turn playthrough', async () => {
        const maxTurns = 3;

        for (let i = 1; i <= maxTurns; i++) {
            // A. Observe
            const view = serializer.serialize(heroId, i);
            expect(view).toBeDefined();
            expect(view.agent.id).toBe(heroId);

            // B. Decide
            const action = await driver.decide(view);
            expect(action).toBeDefined();
            expect(action.type).toBeDefined(); // e.g. 'MOVE' or 'WAIT'

            // C. Act
            const result = handler.execute(heroId, action);
            expect(result.success).toBe(true);

            // D. Verify State Change
            // If mock driver equips sword, check it
            const hero = world.with('id').where(e => e.id === heroId).first;
            if (action.type === 'EQUIP_ITEM' && result.success) {
                expect(hero?.equipment?.['main_hand']).toBe('item_rusty_sword');
            }
        }
    }, 30000); // 30s timeout for AI
});
