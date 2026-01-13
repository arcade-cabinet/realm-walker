import { fc } from '@fast-check/vitest';
import { Agent } from '@realm-walker/ai';
import { beforeEach, describe, expect, it } from 'vitest';
import { GameStateSerializer, World } from '../src';

describe('Test Data Consistency', () => {
  let world: World;
  let serializer: GameStateSerializer;

  beforeEach(() => {
    world = new World('test-data-consistency');
    serializer = new GameStateSerializer();
  });

  describe('Fixture Data Integrity', () => {
    it('should maintain consistent test fixtures across test runs', () => {
      // Create standardized test fixture
      const testFixture = createStandardTestFixture();
      
      // Serialize and verify structure
      const serialized = serializer.serialize(world);
      
      expect(serialized.entities).toHaveLength(3); // Hero, enemy, item
      expect(serialized.seed).toBe('test-data-consistency');
      expect(serialized.metadata.entityCount).toBe(3);
      
      // Verify specific entity properties
      const hero = serialized.entities.find((e: any) => e.brain?.agent);
      expect(hero).toBeDefined();
      expect(hero.health.current).toBe(100);
      expect(hero.position).toEqual({ x: 0, y: 0, z: 0 });
      
      const enemy = serialized.entities.find((e: any) => e.ai?.behavior === 'aggressive');
      expect(enemy).toBeDefined();
      expect(enemy.health.current).toBe(50);
    });

    it('should produce identical fixtures when created multiple times', () => {
      const fixture1 = createStandardTestFixture();
      const state1 = serializer.serialize(world);
      
      // Reset world and create fixture again
      world = new World('test-data-consistency');
      serializer = new GameStateSerializer();
      const fixture2 = createStandardTestFixture();
      const state2 = serializer.serialize(world);
      
      // States should be structurally identical
      expect(state1.entities).toHaveLength(state2.entities.length);
      expect(state1.seed).toBe(state2.seed);
      expect(state1.metadata.entityCount).toBe(state2.metadata.entityCount);
      
      // Entity properties should match
      for (let i = 0; i < state1.entities.length; i++) {
        const entity1 = state1.entities[i];
        const entity2 = state2.entities[i];
        
        // Core properties should be identical
        expect(entity1.position).toEqual(entity2.position);
        expect(entity1.health).toEqual(entity2.health);
        expect(entity1.stats).toEqual(entity2.stats);
      }
    });

    it('should validate fixture data against expected schemas', () => {
      createStandardTestFixture();
      const state = serializer.serialize(world);
      
      // Validate world state schema
      expect(state).toHaveProperty('seed');
      expect(state).toHaveProperty('entities');
      expect(state).toHaveProperty('rngState');
      expect(state).toHaveProperty('metadata');
      
      // Validate entity schemas
      state.entities.forEach((entity: any) => {
        expect(entity).toHaveProperty('id');
        expect(typeof entity.id).toBe('string');
        
        if (entity.position) {
          expect(entity.position).toHaveProperty('x');
          expect(entity.position).toHaveProperty('y');
          expect(entity.position).toHaveProperty('z');
          expect(typeof entity.position.x).toBe('number');
          expect(typeof entity.position.y).toBe('number');
          expect(typeof entity.position.z).toBe('number');
        }
        
        if (entity.health) {
          expect(entity.health).toHaveProperty('current');
          expect(entity.health).toHaveProperty('max');
          expect(typeof entity.health.current).toBe('number');
          expect(typeof entity.health.max).toBe('number');
          expect(entity.health.current).toBeLessThanOrEqual(entity.health.max);
        }
        
        if (entity.stats) {
          expect(entity.stats).toHaveProperty('str');
          expect(entity.stats).toHaveProperty('agi');
          expect(entity.stats).toHaveProperty('int');
          expect(typeof entity.stats.str).toBe('number');
          expect(typeof entity.stats.agi).toBe('number');
          expect(typeof entity.stats.int).toBe('number');
        }
      });
    });
  });

  describe('Property-Based Test Data Validation', () => {
    // Property test for fixture consistency
    fc.it('property: test fixtures maintain structural consistency',
      fc.record({
        heroHealth: fc.integer({ min: 1, max: 100 }),
        enemyHealth: fc.integer({ min: 1, max: 100 }),
        posX: fc.integer({ min: -10, max: 10 }),
        posY: fc.integer({ min: -10, max: 10 })
      }),
      ({ heroHealth, enemyHealth, posX, posY }) => {
        // Create parameterized fixture
        const hero = world.create({
          position: { x: posX, y: posY, z: 0 },
          velocity: { x: 0, y: 0, z: 0 },
          brain: { agent: new Agent() },
          health: { current: heroHealth, max: 100 },
          stats: { str: 15, agi: 10, int: 8 }
        });

        const enemy = world.create({
          position: { x: posX + 1, y: posY, z: 0 },
          health: { current: enemyHealth, max: 100 },
          stats: { str: 8, agi: 8, int: 5 },
          ai: { behavior: 'aggressive', target: hero.id }
        });

        const state = serializer.serialize(world);

        // Validate consistency properties
        expect(state.entities).toHaveLength(2);
        expect(state.metadata.entityCount).toBe(2);
        
        // Validate hero properties
        const serializedHero = state.entities.find((e: any) => e.brain?.agent);
        expect(serializedHero).toBeDefined();
        expect(serializedHero.health.current).toBe(heroHealth);
        expect(serializedHero.position.x).toBe(posX);
        expect(serializedHero.position.y).toBe(posY);
        
        // Validate enemy properties
        const serializedEnemy = state.entities.find((e: any) => e.ai?.behavior === 'aggressive');
        expect(serializedEnemy).toBeDefined();
        expect(serializedEnemy.health.current).toBe(enemyHealth);
        expect(serializedEnemy.position.x).toBe(posX + 1);
        expect(serializedEnemy.ai.target).toBe(hero.id);
      },
      { numRuns: 50 }
    );

    // Property test for serialization round-trip consistency
    fc.it('property: test data survives serialization round-trips',
      fc.record({
        entityCount: fc.integer({ min: 1, max: 5 }),
        healthRange: fc.integer({ min: 10, max: 100 })
      }),
      ({ entityCount, healthRange }) => {
        // Create entities with random but valid data
        const originalEntities = [];
        for (let i = 0; i < entityCount; i++) {
          const entity = world.create({
            position: { x: i, y: i, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            health: { current: healthRange, max: healthRange },
            stats: { str: 10 + i, agi: 10 + i, int: 10 + i }
          });
          originalEntities.push(entity);
        }

        // Serialize and deserialize
        const serialized = serializer.serialize(world);
        const deserialized = World.deserialize(serialized);
        const reserializedState = serializer.serialize(deserialized);

        // Data should be identical after round-trip
        expect(reserializedState.entities).toHaveLength(entityCount);
        expect(reserializedState.metadata.entityCount).toBe(entityCount);
        expect(reserializedState.seed).toBe(serialized.seed);

        // Entity data should be preserved
        for (let i = 0; i < entityCount; i++) {
          const original = serialized.entities[i];
          const roundTrip = reserializedState.entities[i];
          
          expect(roundTrip.id).toBe(original.id);
          expect(roundTrip.position).toEqual(original.position);
          expect(roundTrip.health).toEqual(original.health);
          expect(roundTrip.stats).toEqual(original.stats);
        }
      },
      { numRuns: 30 }
    );
  });

  describe('Test Environment Isolation', () => {
    it('should isolate test data between test runs', () => {
      // First test run
      const entity1 = world.create({
        position: { x: 1, y: 1, z: 0 },
        health: { current: 50, max: 100 }
      });
      
      const state1 = serializer.serialize(world);
      expect(state1.entities).toHaveLength(1);
      
      // Reset environment
      world = new World('isolated-test');
      serializer = new GameStateSerializer();
      
      // Second test run should start clean
      const state2 = serializer.serialize(world);
      expect(state2.entities).toHaveLength(0);
      expect(state2.seed).toBe('isolated-test');
      expect(state2.seed).not.toBe(state1.seed);
    });

    it('should prevent test data contamination', () => {
      // Create entities in first scenario
      const scenario1Entities = [];
      for (let i = 0; i < 3; i++) {
        scenario1Entities.push(world.create({
          position: { x: i, y: 0, z: 0 },
          health: { current: 100, max: 100 },
          testMarker: 'scenario1'
        }));
      }
      
      const state1 = serializer.serialize(world);
      expect(state1.entities).toHaveLength(3);
      
      // Clear world for second scenario
      world.clear();
      
      // Create different entities in second scenario
      const scenario2Entities = [];
      for (let i = 0; i < 2; i++) {
        scenario2Entities.push(world.create({
          position: { x: i * 2, y: 1, z: 0 },
          health: { current: 75, max: 75 },
          testMarker: 'scenario2'
        }));
      }
      
      const state2 = serializer.serialize(world);
      expect(state2.entities).toHaveLength(2);
      
      // Verify no contamination
      state2.entities.forEach((entity: any) => {
        expect(entity.testMarker).toBe('scenario2');
        expect(entity.health.max).toBe(75);
      });
      
      // Original state should be unchanged
      expect(state1.entities).toHaveLength(3);
      state1.entities.forEach((entity: any) => {
        expect(entity.testMarker).toBe('scenario1');
        expect(entity.health.max).toBe(100);
      });
    });
  });

  // Helper function to create standardized test fixtures
  function createStandardTestFixture() {
    const hero = world.create({
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      brain: { agent: new Agent() },
      health: { current: 100, max: 100 },
      stats: { str: 15, agi: 10, int: 8 },
      inventory: { items: ['sword'], equipped: { weapon: 'sword' } }
    });

    const enemy = world.create({
      position: { x: 1, y: 0, z: 0 },
      health: { current: 50, max: 50 },
      stats: { str: 8, agi: 8, int: 5 },
      ai: { behavior: 'aggressive', target: hero.id }
    });

    const item = world.create({
      position: { x: 2, y: 0, z: 0 },
      item: { type: 'potion', name: 'Health Potion' },
      visuals: { iconId: 'potion' }
    });

    return { hero, enemy, item };
  }
});