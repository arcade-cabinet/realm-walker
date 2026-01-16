import { HeroSchema, RpgClass } from '@realm-walker/shared';
import * as dotenv from 'dotenv';
import path from 'path';
import { beforeAll, describe, expect, it } from 'vitest';
import { HeroLoom } from '../../src/loom/HeroLoom.js';

dotenv.config({ path: path.resolve(__dirname, '../../../../../../.env') });

const RESERVED_SEED = "Frozen-Iron-Dominion";

describe('HeroLoom (Live Proof)', () => {
    let loom: HeroLoom;
    let apiKey: string;

    beforeAll(() => {
        apiKey = process.env.GEMINI_API_KEY || '';
        loom = new HeroLoom(apiKey);
    });

    it('Should weave Heroes from Context', async () => {
        if (!apiKey) return;

        const factions = [{ id: 'f1', name: 'Iron Legion', description: 'Tech Fanatics', ideology: 'Technocracy', visuals: { color: '#FF0000' } }];
        const classes: RpgClass[] = [{
            id: 'c1', name: 'Tech Knight', description: 'Armored Soldier',
            stats: { str: 10, agi: 5, int: 5, hp: 100 },
            visuals: { spriteId: 'tech_knight' }
        }];

        const settings = {
            seed: RESERVED_SEED,
            age: 'Age of Rust',
            controls: { worldScale: 5, minNodes: 3, dangerLevel: 5, magicLevel: 1, technologyLevel: 8 }
        };

        console.log(`🤖 Weaving Heroes...`);
        const heroes = await loom.weave(settings, { factions, classes });

        console.log("📦 Output:", JSON.stringify(heroes, null, 2));

        expect(heroes.length).toBeGreaterThan(0);
        heroes.forEach(h => expect(() => HeroSchema.parse(h)).not.toThrow());

        // Check connectivity
        expect(heroes[0].classId).toBe('c1'); // Should use provided class
    }, 30000);
});
