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

    // Property 3: Game State Determinism
    // **Validates: Requirements 3.1, 3.2, 3.3**
    it('property: game state determinism across multiple simulation runs', () => {
        // Property-based test: For any valid seed and sequence of operations,
        // the game state should be identical across multiple runs
        const testScenarios = [
            {
                seed: 'determinism-test-1',
                operations: [
                    { type: 'create', data: { name: 'Player', hp: 100 } },
                    { type: 'create', data: { name: 'Enemy', hp: 50 } },
                    { type: 'update', target: 0, field: 'hp', value: 90 }
                ]
            },
            {
                seed: 'determinism-test-2',
                operations: [
                    { type: 'create', data: { name: 'Warrior', str: 15, agi: 10 } },
                    { type: 'create', data: { name: 'Mage', str: 8, int: 20 } },
                    { type: 'update', target: 1, field: 'int', value: 25 },
                    { type: 'create', data: { name: 'Rogue', agi: 18, str: 12 } }
                ]
            },
            {
                seed: 'determinism-test-3',
                operations: [
                    { type: 'create', data: { name: 'Item1', value: 100 } },
                    { type: 'create', data: { name: 'Item2', value: 200 } },
                    { type: 'create', data: { name: 'Item3', value: 300 } },
                    { type: 'update', target: 0, field: 'value', value: 150 },
                    { type: 'update', target: 2, field: 'value', value: 350 }
                ]
            }
        ];

        for (const scenario of testScenarios) {
            // Run the same scenario multiple times
            const runs = [];
            const numRuns = 3;

            for (let run = 0; run < numRuns; run++) {
                const world = new World(scenario.seed);
                const entities: any[] = [];

                // Execute operations in order
                for (const operation of scenario.operations) {
                    switch (operation.type) {
                        case 'create':
                            entities.push(world.create(operation.data));
                            break;
                        case 'update':
                            if (entities[operation.target]) {
                                entities[operation.target][operation.field] = operation.value;
                            }
                            break;
                    }
                }

                // Capture final state
                const finalState = {
                    entityCount: entities.length,
                    entityIds: entities.map(e => e.id),
                    entityData: entities.map(e => ({ ...e })),
                    worldEntityCount: world.entities.length
                };

                runs.push(finalState);
            }

            // All runs should produce identical results
            for (let i = 1; i < runs.length; i++) {
                const prev = runs[i - 1];
                const curr = runs[i];

                expect(curr.entityCount).toBe(prev.entityCount);
                expect(curr.entityIds).toEqual(prev.entityIds);
                expect(curr.worldEntityCount).toBe(prev.worldEntityCount);

                // Compare entity data field by field
                for (let j = 0; j < curr.entityData.length; j++) {
                    const prevEntity = prev.entityData[j];
                    const currEntity = curr.entityData[j];

                    expect(currEntity.id).toBe(prevEntity.id);
                    expect(currEntity.name).toBe(prevEntity.name);

                    // Compare all numeric fields
                    for (const [key, value] of Object.entries(currEntity)) {
                        if (typeof value === 'number') {
                            expect(currEntity[key]).toBe(prevEntity[key]);
                        }
                    }
                }
            }
        }
    });
});
