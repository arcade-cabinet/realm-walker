import { describe, expect, it } from 'vitest';
import { World } from '../src/World';

describe('Determinism', () => {
    it('should generate identical Entity IDs for the same seed', () => {
        const seed = "frozen-iron-dominion";

        const worldA = new World(seed);
        const entityA1 = worldA.create({ name: 'Hero' });
        const entityA2 = worldA.create({ name: 'Goblin' });

        const worldB = new World(seed);
        const entityB1 = worldB.create({ name: 'Hero' });
        const entityB2 = worldB.create({ name: 'Goblin' });

        expect(entityA1.id).toBe(entityB1.id);
        expect(entityA2.id).toBe(entityB2.id);

        // Sanity check: IDs in sequence are different
        expect(entityA1.id).not.toBe(entityA2.id);
    });

    it('should generate different IDs for different seeds', () => {
        const worldA = new World("seed-1");
        const entityA = worldA.create();

        const worldB = new World("seed-2");
        const entityB = worldB.create();

        expect(entityA.id).not.toBe(entityB.id);
    });
});
