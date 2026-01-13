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

    // Property 1: Deterministic Entity Creation
    // **Validates: Requirements 1.3**
    it('property: deterministic entity creation across multiple worlds', () => {
        // Property-based test: For any seed and entity count, 
        // creating entities in the same order should produce identical IDs
        const seeds = ["test-seed-1", "realm-alpha", "dungeon-beta", "forest-gamma"];
        const entityCounts = [1, 5, 10, 20];

        for (const seed of seeds) {
            for (const count of entityCounts) {
                const worldA = new World(seed);
                const worldB = new World(seed);
                
                const entitiesA = [];
                const entitiesB = [];
                
                // Create entities in both worlds
                for (let i = 0; i < count; i++) {
                    entitiesA.push(worldA.create({ index: i }));
                    entitiesB.push(worldB.create({ index: i }));
                }
                
                // Verify all IDs match
                for (let i = 0; i < count; i++) {
                    expect(entitiesA[i].id).toBe(entitiesB[i].id);
                }
                
                // Verify IDs are unique within each world
                const idsA = entitiesA.map(e => e.id);
                const uniqueIdsA = new Set(idsA);
                expect(uniqueIdsA.size).toBe(count);
            }
        }
    });
});
