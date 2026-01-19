import { Registry, SchemaLoader } from '@realm-walker/mechanics';
import { RealmSchema } from '@realm-walker/shared';
import { describe, expect, it } from 'vitest';
import { World } from '../src/World';

describe('The Slots Contract (Data Pipeline)', () => {
    it('should validate and hydrate a full Realm with all Slots filled', () => {
        // 1. The Mock Data (Simulating Weaver Output)
        // Note: Include all fields that Zod will add via defaults to ensure exact match
        const mockRealm = {
            age: {
                id: 'age_1',
                name: 'Age of Fire',
                description: 'A hot place',
                theme: 'fire',
                seed: 'fire-seed'
            },
            classes: [
                {
                    id: 'class_pyromancer',
                    name: 'Pyromancer',
                    description: 'Burns things',
                    stats: { hp: 80, sp: 100, str: 5, agi: 10, int: 20 },
                    skillsToLearn: [], // Zod default
                    visuals: { spriteId: 'pyro_v1', billboard: true, scale: 1 } // scale is Zod default
                }
            ],
            items: [
                {
                    id: 'item_cinder',
                    name: 'Cinder Shard',
                    description: 'Glowing hot',
                    type: 'item',
                    price: 0, // Zod default
                    hpValue: 0, // Zod default
                    hitRate: 0, // Zod default
                    consumable: false, // Zod default
                    visuals: { iconId: 'cinder_icon' }
                }
            ],
            bestiary: [
                {
                    id: 'mon_lava_golem',
                    name: 'Lava Golem',
                    description: 'Made of rocks',
                    stats: { hp: 200, str: 20, agi: 5, int: 5 },
                    behavior: 'aggressive',
                    visuals: { spriteId: 'golem_sprite', scale: 2.0 },
                    lootTable: [{ itemId: 'item_cinder', chance: 0.5 }]
                }
            ]
        };

        // 2. The Verification (Type Check via Zod)
        const parsed = RealmSchema.parse(mockRealm);
        expect(parsed).toEqual(mockRealm); // Passes Schema Contract - now includes Zod defaults

        // 3. The Hydration (Registry Slotting)
        const registry = new Registry();
        const loader = new SchemaLoader(registry);
        loader.loadRealm(mockRealm);

        // 4. The Retrieval (Proof of Slotting)
        const loadedClass = registry.getClass('class_pyromancer');
        expect(loadedClass).toBeDefined();
        expect(loadedClass?.stats?.int).toBe(20);

        const loadedItem = registry.getItem('item_cinder');
        expect(loadedItem).toBeDefined();

        const loadedMonster = registry.getMonster('mon_lava_golem');
        expect(loadedMonster).toBeDefined();
        expect(loadedMonster?.stats.hp).toBe(200);
        expect(loadedMonster?.lootTable?.[0].itemId).toBe('item_cinder');

        console.log("✅ The Slots are watertight.");
    });

    it('should reject invalid data that breaks the contract', () => {
        const invalidRealm = {
            age: { name: "Broken Age" }, // Missing ID
            bestiary: [{ name: "Missing ID Monster" }]
        };

        expect(() => RealmSchema.parse(invalidRealm)).toThrow();
    });

    // Property 2: Schema Validation Completeness
    // **Validates: Requirements 1.2, 2.3, 6.4**
    it('property: schema validation completeness across all realm variations', () => {
        // Property-based test: For any valid realm structure,
        // schema validation should accept valid data and reject invalid data
        const validRealms = [
            // Minimal valid realm
            {
                age: { id: 'age_min', name: 'Minimal Age', description: 'Basic', theme: 'neutral', seed: 'min-seed' },
                classes: [],
                items: [],
                bestiary: []
            },
            // Single item realm
            {
                age: { id: 'age_single', name: 'Single Age', description: 'One of each', theme: 'test', seed: 'single-seed' },
                classes: [{
                    id: 'class_test', name: 'Test Class', description: 'Testing',
                    stats: { hp: 100, sp: 50, str: 10, agi: 8, int: 6 },
                    skillsToLearn: [],
                    visuals: { spriteId: 'test_sprite', billboard: true, scale: 1 }
                }],
                items: [{
                    id: 'item_test', name: 'Test Item', description: 'Testing', type: 'item',
                    price: 0, hpValue: 0, hitRate: 0, consumable: false,
                    visuals: { iconId: 'test_icon' }
                }],
                bestiary: [{
                    id: 'mon_test', name: 'Test Monster', description: 'Testing',
                    stats: { hp: 50, str: 5, agi: 5, int: 3 },
                    behavior: 'neutral',
                    visuals: { spriteId: 'test_monster', scale: 1.0 },
                    lootTable: []
                }]
            }
        ];

        const invalidRealms = [
            // Missing required age field
            { classes: [], items: [], bestiary: [] },
            // Invalid age structure
            { age: { name: 'No ID Age' }, classes: [], items: [], bestiary: [] },
            // Invalid class structure
            { 
                age: { id: 'age_bad', name: 'Bad Age', description: 'Bad', theme: 'bad', seed: 'bad-seed' },
                classes: [{ name: 'No ID Class' }], items: [], bestiary: [] 
            },
            // Invalid item structure
            { 
                age: { id: 'age_bad2', name: 'Bad Age 2', description: 'Bad', theme: 'bad', seed: 'bad-seed-2' },
                classes: [], items: [{ name: 'No ID Item' }], bestiary: [] 
            },
            // Invalid monster structure
            { 
                age: { id: 'age_bad3', name: 'Bad Age 3', description: 'Bad', theme: 'bad', seed: 'bad-seed-3' },
                classes: [], items: [], bestiary: [{ name: 'No ID Monster' }] 
            }
        ];

        // Test valid realms pass validation
        for (const realm of validRealms) {
            expect(() => RealmSchema.parse(realm)).not.toThrow();
            
            // Test registry loading works
            const registry = new Registry();
            const loader = new SchemaLoader(registry);
            expect(() => loader.loadRealm(realm)).not.toThrow();
            
            // Verify loaded data matches input counts
            expect(registry['classes'].size).toBe(realm.classes.length);
            expect(registry['items'].size).toBe(realm.items.length);
            expect(registry['bestiary'].size).toBe(realm.bestiary.length);
        }

        // Test invalid realms fail validation
        for (const realm of invalidRealms) {
            expect(() => RealmSchema.parse(realm)).toThrow();
        }
    });

    // Property 4: State Serialization Round Trip
    // **Validates: Requirements 6.1, 6.2, 6.3**
    it('property: state serialization round trip integrity', () => {
        // Property-based test: For any valid world state,
        // serialization and deserialization should preserve all data
        const testScenarios = [
            {
                seed: 'serialization-test-1',
                entities: [
                    { name: 'Player', hp: 100, level: 5, inventory: ['sword', 'potion'] },
                    { name: 'Enemy', hp: 50, type: 'goblin', position: { x: 10, y: 20 } }
                ]
            },
            {
                seed: 'serialization-test-2',
                entities: [
                    { name: 'Warrior', class: 'fighter', stats: { str: 18, agi: 12, int: 8 } },
                    { name: 'Mage', class: 'wizard', stats: { str: 8, agi: 10, int: 20 }, spells: ['fireball', 'heal'] },
                    { name: 'Item', type: 'treasure', value: 1000, magical: true }
                ]
            },
            {
                seed: 'serialization-test-3',
                entities: [
                    { name: 'Complex Entity', nested: { deep: { value: 42 } }, array: [1, 2, 3], boolean: true },
                    { name: 'Simple Entity', value: 'test' }
                ]
            }
        ];

        for (const scenario of testScenarios) {
            // Create world and populate with test data
            const originalWorld = new World(scenario.seed);
            const originalEntities = [];

            for (const entityData of scenario.entities) {
                originalEntities.push(originalWorld.create(entityData));
            }

            // Perform some operations to advance RNG state
            for (let i = 0; i < 5; i++) {
                originalWorld.create({ temp: `temp_${i}`, random: originalWorld.rng.next() });
            }

            // Serialize the world state
            const serializedState = originalWorld.serialize();

            // Verify serialized state structure
            expect(serializedState.seed).toBe(scenario.seed);
            expect(serializedState.entities).toBeDefined();
            expect(serializedState.rngState).toBeDefined();
            expect(serializedState.metadata).toBeDefined();
            expect(serializedState.metadata.entityCount).toBe(originalWorld.entities.length);

            // Deserialize into new world
            const restoredWorld = World.deserialize(serializedState);

            // Verify world properties match
            expect(restoredWorld.entities.length).toBe(originalWorld.entities.length);
            expect(restoredWorld.rng.getSeed()).toBe(originalWorld.rng.getSeed());

            // Verify all entities are restored correctly
            for (let i = 0; i < originalWorld.entities.length; i++) {
                const original = originalWorld.entities[i];
                const restored = restoredWorld.entities[i];

                expect(restored.id).toBe(original.id);
                expect(restored.name).toBe(original.name);

                // Deep compare all properties
                for (const [key, value] of Object.entries(original)) {
                    expect(restored[key]).toEqual(value);
                }
            }

            // Verify RNG state is preserved by generating next values
            const originalNext = originalWorld.rng.next();
            const restoredNext = restoredWorld.rng.next();
            expect(restoredNext).toBe(originalNext);

            // Verify serialization validation passes
            expect(originalWorld.validateSerialization()).toBe(true);
            expect(restoredWorld.validateSerialization()).toBe(true);

            // Test that creating new entities produces same IDs
            const newOriginal = originalWorld.create({ test: 'new' });
            const newRestored = restoredWorld.create({ test: 'new' });
            expect(newRestored.id).toBe(newOriginal.id);
        }
    });
});
