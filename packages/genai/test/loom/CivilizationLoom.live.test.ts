import { TownSchema } from '@realm-walker/shared';
import * as dotenv from 'dotenv';
import path from 'path';
import { beforeAll, describe, expect, it } from 'vitest';
import { CivilizationLoom } from '../../src/loom/CivilizationLoom.js';

dotenv.config({ path: path.resolve(__dirname, '../../../../../../.env') });

const RESERVED_SEED = "Frozen-Iron-Dominion";

describe('CivilizationLoom (Live Proof)', () => {
    let loom: CivilizationLoom;
    let apiKey: string;

    beforeAll(() => {
        apiKey = process.env.GEMINI_API_KEY || '';
        loom = new CivilizationLoom(apiKey);
    });

    it('Should weave a Town from Node Context', async () => {
        if (!apiKey) return;

        const faction = {
            id: 'f1',
            name: 'Iron Legion',
            description: 'Industrialists',
            ideology: 'Technocracy', // Matches schema enum
            visuals: { color: '#FF0000' }
        };

        const settings = {
            seed: RESERVED_SEED,
            age: 'Age of Rust',
            controls: {
                worldScale: 5,
                minNodes: 3,
                dangerLevel: 5,
                magicLevel: 1,
                technologyLevel: 8
            }
        };

        console.log(`🤖 Weaving Town...`);
        const town = await loom.weave(settings, {
            nodeId: 'n1',
            biome: 'tech',
            faction
        });

        console.log("📦 Output:", JSON.stringify(town, null, 2));

        expect(() => TownSchema.parse(town)).not.toThrow();
        expect(town.services.length).toBeGreaterThan(0);
        // Expect tech services given context
        // expect(town.services).toContain('Alchemist'); // Maybe not alchemist, but 'Inn' or 'Blacksmith'
    }, 30000);
});
