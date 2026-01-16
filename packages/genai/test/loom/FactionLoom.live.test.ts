import { FactionSchema, RpgLoom } from '@realm-walker/shared';
import * as dotenv from 'dotenv';
import path from 'path';
import { beforeAll, describe, expect, it } from 'vitest';
import { FactionLoom } from '../../src/loom/FactionLoom.js';

// Load Environment Variables (API Key)
dotenv.config({ path: path.resolve(__dirname, '../../../../../../.env') });

const RESERVED_SEED = "Frozen-Iron-Dominion";

describe('FactionLoom (Schrodingers Cat Proof)', () => {
    let loom: FactionLoom;
    let apiKey: string;

    beforeAll(() => {
        apiKey = process.env.GEMINI_API_KEY || '';
        if (!apiKey) {
            console.warn("⚠️ SKIPPING LIVE PROOF: No GEMINI_API_KEY found.");
        }
        loom = new FactionLoom(apiKey);
    });

    it('Should weave valid Factions from the Reserved Seed', async () => {
        if (!apiKey) return;

        // 1. Arrange: Minimal World Context (The "Box" input)
        // We provide a static "World" context to ground the AI, 
        // but the FactionLoom is doing the work.
        const mockWorld: RpgLoom = {
            title: "The Frozen Wastes",
            summary: "A cold, iron-rich land.",
            nodes: [
                { id: 'n1', name: 'Iron Citadel', biome: 'city', difficulty: 1 },
                { id: 'n2', name: 'Frost Mine', biome: 'cave', difficulty: 5 }
            ],
            edges: []
        };

        const settings = {
            seed: RESERVED_SEED,
            age: 'Age of Rust',
            controls: {
                worldScale: 5,
                minNodes: 2,
                dangerLevel: 5,
                magicLevel: 1,
                technologyLevel: 8 // Technocracy likely
            }
        };

        // 2. Act: The Weave
        console.log(`🤖 Weaving Factions with Seed: ${RESERVED_SEED}...`);
        const factions = await loom.weave(settings, mockWorld);

        // 3. Assert (The Observation)
        console.log("📦 Output:", JSON.stringify(factions, null, 2));

        // A. Variance Check: We expect SOME output
        expect(factions.length).toBeGreaterThan(0);

        // B. Schema Integrity (The Proof)
        factions.forEach(f => {
            expect(() => FactionSchema.parse(f)).not.toThrow();
            // Check structural integrity
            expect(f.visuals.color).toMatch(/^#[0-9A-F]{6}$/i);
        });

        // C. Thematic Resonance (The "Cat" is alive)
        // Given "Frozen-Iron-Dominion" and Tech Level 8, we roughly expect "Technocracy"
        const ideologies = factions.map(f => f.ideology);
        expect(ideologies).toContain('Technocracy');

        // D. Connection Integrity
        // Factions should claim the nodes provided
        const allClaims = factions.flatMap(f => f.control || []);
        expect(allClaims).toContain('n1'); // Someone must own the Citadel
    }, 30000); // 30s timeout for AI
});
