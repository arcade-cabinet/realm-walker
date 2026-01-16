import { Faction, Hero, QuestSchema, RpgLoom } from '@realm-walker/shared';
import * as dotenv from 'dotenv';
import path from 'path';
import { beforeAll, describe, expect, it } from 'vitest';
import { QuestLoom } from '../../src/loom/QuestLoom.js';

dotenv.config({ path: path.resolve(__dirname, '../../../../../../.env') });

const RESERVED_SEED = "Frozen-Iron-Dominion";

describe('QuestLoom (Live Proof)', () => {
    let loom: QuestLoom;
    let apiKey: string;

    beforeAll(() => {
        apiKey = process.env.GEMINI_API_KEY || '';
        loom = new QuestLoom(apiKey);
    });

    it('Should weave Quests from Context', async () => {
        if (!apiKey) return;

        const world: RpgLoom = {
            title: "The Graph", summary: "Graph",
            nodes: [{ id: 'n1', name: 'Capital', biome: 'city', difficulty: 1 }],
            edges: []
        };
        const heroes: Hero[] = [{
            id: 'h1', name: 'Commander Shepard', classId: 'c1',
            description: 'Hero', personality: 'Stoic', joinCondition: 'Free',
            visuals: { spriteId: 'shepard' }
        }];
        const factions: Faction[] = [];

        const settings = {
            seed: RESERVED_SEED,
            age: 'Age of Rust',
            controls: { worldScale: 5, minNodes: 3, dangerLevel: 5, magicLevel: 1, technologyLevel: 8 }
        };

        console.log(`🤖 Weaving Quests...`);
        const quests = await loom.weave(settings, { world, heroes, factions });

        console.log("📦 Output:", JSON.stringify(quests, null, 2));

        expect(quests.length).toBeGreaterThan(0);
        quests.forEach(q => expect(() => QuestSchema.parse(q)).not.toThrow());

        // Check logic
        expect(quests[0].giverId).toBe('h1'); // Should be assigned to the hero
    }, 30000);
});
