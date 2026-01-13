import { Registry, SchemaLoader } from '@realm-walker/mechanics';
import { RealmSchema } from '@realm-walker/shared';
import { describe, expect, it } from 'vitest';

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
});
