import { DungeonSchema } from '@realm-walker/shared';
import * as dotenv from 'dotenv';
import path from 'path';
import { beforeAll, describe, expect, it } from 'vitest';
import { DungeonLoom } from '../../src/loom/DungeonLoom.js';

// Fix Path: 4 levels up from test/loom/file.ts
dotenv.config({ path: path.resolve(__dirname, '../../../../../../.env') });

const RESERVED_SEED = "Frozen-Iron-Dominion";

describe('DungeonLoom (Live Proof)', () => {
    let loom: DungeonLoom;
    let apiKey: string;

    beforeAll(() => {
        apiKey = process.env.GEMINI_API_KEY || '';
        loom = new DungeonLoom(apiKey);
    });

    it('Should weave a Dungeon from Node Context', async () => {
        if (!apiKey) return;

        const settings = {
            seed: RESERVED_SEED,
            age: 'Age of Rust',
            controls: {
                worldScale: 5,
                minNodes: 3,
                dangerLevel: 8, // High Danger
                magicLevel: 5,
                technologyLevel: 5
            }
        };

        console.log(`🤖 Weaving Dungeon...`);
        const dungeon = await loom.weave(settings, {
            nodeId: 'n2',
            biome: 'ruin',
            danger: 8
        });

        console.log("📦 Output:", JSON.stringify(dungeon, null, 2));

        expect(() => DungeonSchema.parse(dungeon)).not.toThrow();
        expect(dungeon.dangerLevel).toBe(8);
        expect(dungeon.traps).toBeGreaterThan(0); // High danger implies traps
    }, 30000);
});
