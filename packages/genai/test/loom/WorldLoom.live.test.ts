import { RpgLoomSchema } from '@realm-walker/shared';
import * as dotenv from 'dotenv';
import path from 'path';
import { beforeAll, describe, expect, it } from 'vitest';
import { WorldLoom } from '../../src/loom/WorldLoom.js';

dotenv.config({ path: path.resolve(__dirname, '../../../../../../.env') });

const RESERVED_SEED = "Frozen-Iron-Dominion";

describe('WorldLoom (Schrodingers Cat Proof)', () => {
    let loom: WorldLoom;
    let apiKey: string;

    beforeAll(() => {
        apiKey = process.env.GEMINI_API_KEY || '';
        console.log("DEBUG: Loaded Key:", apiKey ? apiKey.substring(0, 5) + "..." : "NONE");
        loom = new WorldLoom(apiKey);
    });

    it('Should weave a valid Graph from the Reserved Seed', async () => {
        if (!apiKey) return;

        const settings = {
            seed: RESERVED_SEED,
            age: 'Age of Rust',
            controls: {
                worldScale: 3, // Small graph for speed
                minNodes: 3,
                dangerLevel: 5,
                magicLevel: 5,
                technologyLevel: 5
            }
        };

        console.log(`🤖 Weaving World with Seed: ${RESERVED_SEED}...`);
        const graph = await loom.weave(settings);

        console.log("📦 Output:", JSON.stringify(graph, null, 2));

        // Schema Proof
        expect(() => RpgLoomSchema.parse(graph)).not.toThrow();

        // Logical Proof
        expect(graph.nodes.length).toBeGreaterThanOrEqual(3);
        expect(graph.edges.length).toBeGreaterThanOrEqual(2); // Must be connected

        // Biome variety? We expect "Ruins" or "Tech" or "Cave" given the seed name
        const biomes = graph.nodes.map(n => n.biome);
        // We can't strictly assert biome because AI variance, but we can log it.
        console.log("Biomes:", biomes);

    }, 30000);
});
