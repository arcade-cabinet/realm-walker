import { fc } from '@fast-check/vitest';
import { describe, expect, it } from 'vitest';
import * as CorePackage from '../src';

describe('Package Architecture Validation', () => {
  describe('Core Package Responsibilities', () => {
    it('should provide ECS runtime functionality', () => {
      // Verify core ECS exports
      expect(CorePackage.World).toBeDefined();
      expect(CorePackage.createEntity).toBeDefined();
      
      // Test ECS runtime creation
      const world = new CorePackage.World('architecture-test');
      expect(world).toBeDefined();
      expect(world.entities).toBeDefined();
      expect(world.rng).toBeDefined();
      
      // Test entity creation
      const entity = world.create({
        position: { x: 0, y: 0, z: 0 },
        testComponent: 'architecture-validation'
      });
      
      expect(entity).toBeDefined();
      expect(entity.id).toBeDefined();
      expect(entity.position).toEqual({ x: 0, y: 0, z: 0 });
      expect(entity.testComponent).toBe('architecture-validation');
    });

    it('should provide game loop functionality', () => {
      // Verify Loop export
      expect(CorePackage.Loop).toBeDefined();
      
      // Test Loop creation and basic functionality
      const loop = new CorePackage.Loop();
      expect(loop).toBeDefined();
      
      let systemExecuted = false;
      loop.addSystem(() => {
        systemExecuted = true;
      });
      
      // Start and immediately stop to test system execution
      loop.start();
      
      // Give it a moment to execute
      setTimeout(() => {
        loop.stop();
        expect(systemExecuted).toBe(true);
      }, 50);
    });

    it('should provide state serialization functionality', () => {
      // Verify GameStateSerializer export
      expect(CorePackage.GameStateSerializer).toBeDefined();
      
      // Test serialization functionality
      const world = new CorePackage.World('serialization-test');
      const serializer = new CorePackage.GameStateSerializer();
      
      // Create test entity
      world.create({
        position: { x: 1, y: 2, z: 3 },
        health: { current: 100, max: 100 },
        testData: 'serialization-test'
      });
      
      // Test serialization
      const serialized = serializer.serialize(world);
      expect(serialized).toBeDefined();
      expect(serialized.entities).toHaveLength(1);
      expect(serialized.seed).toBe('serialization-test');
      expect(serialized.metadata).toBeDefined();
      
      // Test deserialization
      const deserializedWorld = CorePackage.World.deserialize(serialized);
      expect(deserializedWorld.entities).toHaveLength(1);
      expect(deserializedWorld.entities[0].testData).toBe('serialization-test');
    });

    it('should provide input system functionality', () => {
      // Verify InputSystem export
      expect(CorePackage.InputSystem).toBeDefined();
      
      // Test InputSystem creation
      const inputSystem = new CorePackage.InputSystem();
      expect(inputSystem).toBeDefined();
      expect(inputSystem.update).toBeDefined();
      
      // Test update functionality (should not throw)
      expect(() => inputSystem.update()).not.toThrow();
    });

    it('should provide action handling functionality', () => {
      // Verify ActionHandler export
      expect(CorePackage.ActionHandler).toBeDefined();
      
      // Test ActionHandler creation
      const world = new CorePackage.World('action-test');
      const actionHandler = new CorePackage.ActionHandler(world);
      expect(actionHandler).toBeDefined();
      expect(actionHandler.execute).toBeDefined();
    });
  });

  describe('Package Interface Consistency', () => {
    it('should maintain consistent API surface', () => {
      // Core exports that should always be available
      const requiredExports = [
        'World',
        'createEntity',
        'Loop',
        'GameStateSerializer',
        'InputSystem',
        'ActionHandler'
      ];

      requiredExports.forEach(exportName => {
        expect(CorePackage).toHaveProperty(exportName);
        expect(CorePackage[exportName as keyof typeof CorePackage]).toBeDefined();
      });
    });

    it('should provide stable constructor interfaces', () => {
      // Test that constructors accept expected parameters
      expect(() => new CorePackage.World()).not.toThrow();
      expect(() => new CorePackage.World('test-seed')).not.toThrow();
      
      expect(() => new CorePackage.Loop()).not.toThrow();
      expect(() => new CorePackage.GameStateSerializer()).not.toThrow();
      expect(() => new CorePackage.InputSystem()).not.toThrow();
      
      const world = new CorePackage.World('constructor-test');
      expect(() => new CorePackage.ActionHandler(world)).not.toThrow();
    });

    it('should maintain backward compatibility', () => {
      // Test that existing API patterns still work
      const world = new CorePackage.World('compatibility-test');
      
      // Entity creation should work with various component combinations
      const entity1 = world.create({ position: { x: 0, y: 0, z: 0 } });
      const entity2 = world.create({ 
        position: { x: 1, y: 1, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        health: { current: 100, max: 100 }
      });
      
      expect(entity1.id).toBeDefined();
      expect(entity2.id).toBeDefined();
      expect(entity1.id).not.toBe(entity2.id);
      
      // Serialization should work with any valid world
      const serializer = new CorePackage.GameStateSerializer();
      const serialized = serializer.serialize(world);
      expect(serialized.entities).toHaveLength(2);
      
      // Deserialization should restore the world
      const restored = CorePackage.World.deserialize(serialized);
      expect(restored.entities).toHaveLength(2);
    });
  });

  describe('Property-Based Architecture Tests', () => {
    // Property test for package interface stability
    fc.it('property: core package maintains interface stability across different usage patterns',
      fc.record({
        worldSeed: fc.string({ minLength: 1, maxLength: 20 }),
        entityCount: fc.integer({ min: 0, max: 10 }),
        componentVariations: fc.integer({ min: 1, max: 5 })
      }),
      ({ worldSeed, entityCount, componentVariations }) => {
        // Test world creation with various seeds
        const world = new CorePackage.World(worldSeed);
        expect(world).toBeDefined();
        expect(world.rng).toBeDefined();
        
        // Test entity creation with various component combinations
        for (let i = 0; i < entityCount; i++) {
          const components: any = { testId: i };
          
          // Add random components based on variations
          if (componentVariations >= 1) {
            components.position = { x: i, y: i, z: 0 };
          }
          if (componentVariations >= 2) {
            components.velocity = { x: 0, y: 0, z: 0 };
          }
          if (componentVariations >= 3) {
            components.health = { current: 100, max: 100 };
          }
          if (componentVariations >= 4) {
            components.stats = { str: 10, agi: 10, int: 10 };
          }
          if (componentVariations >= 5) {
            components.inventory = { items: [], equipped: {} };
          }
          
          const entity = world.create(components);
          expect(entity).toBeDefined();
          expect(entity.id).toBeDefined();
          expect(entity.testId).toBe(i);
        }
        
        // Test serialization works with any configuration
        const serializer = new CorePackage.GameStateSerializer();
        const serialized = serializer.serialize(world);
        expect(serialized.entities).toHaveLength(entityCount);
        expect(serialized.seed).toBe(worldSeed);
        
        // Test deserialization maintains data integrity
        if (entityCount > 0) {
          const restored = CorePackage.World.deserialize(serialized);
          expect(restored.entities).toHaveLength(entityCount);
          
          restored.entities.forEach((entity, index) => {
            expect(entity.testId).toBe(index);
          });
        }
      },
      { numRuns: 50 }
    );

    // Property test for system integration
    fc.it('property: core systems integrate correctly regardless of configuration',
      fc.record({
        systemCount: fc.integer({ min: 1, max: 5 }),
        entityCount: fc.integer({ min: 1, max: 8 })
      }),
      ({ systemCount, entityCount }) => {
        const world = new CorePackage.World('integration-test');
        const loop = new CorePackage.Loop();
        const inputSystem = new CorePackage.InputSystem();
        const actionHandler = new CorePackage.ActionHandler(world);
        
        // Create entities
        for (let i = 0; i < entityCount; i++) {
          world.create({
            position: { x: i, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            integrationTest: true
          });
        }
        
        // Add systems to loop
        let systemExecutions = 0;
        for (let i = 0; i < systemCount; i++) {
          loop.addSystem(() => {
            systemExecutions++;
          });
        }
        
        // Add input system
        loop.addSystem(() => inputSystem.update());
        
        // Test that all systems can coexist
        expect(() => {
          loop.start();
          setTimeout(() => loop.stop(), 10);
        }).not.toThrow();
        
        // Verify world state remains valid
        expect(world.entities).toHaveLength(entityCount);
        world.entities.forEach(entity => {
          expect(entity.integrationTest).toBe(true);
          expect(entity.position).toBeDefined();
        });
      },
      { numRuns: 30 }
    );
  });

  describe('Performance and Resource Management', () => {
    it('should handle large entity counts efficiently', () => {
      const world = new CorePackage.World('performance-test');
      const startTime = performance.now();
      
      // Create many entities
      const entityCount = 1000;
      for (let i = 0; i < entityCount; i++) {
        world.create({
          position: { x: i % 100, y: Math.floor(i / 100), z: 0 },
          performanceTest: i
        });
      }
      
      const creationTime = performance.now() - startTime;
      expect(creationTime).toBeLessThan(1000); // Should complete in under 1 second
      expect(world.entities).toHaveLength(entityCount);
      
      // Test serialization performance
      const serializationStart = performance.now();
      const serializer = new CorePackage.GameStateSerializer();
      const serialized = serializer.serialize(world);
      const serializationTime = performance.now() - serializationStart;
      
      expect(serializationTime).toBeLessThan(500); // Should serialize in under 0.5 seconds
      expect(serialized.entities).toHaveLength(entityCount);
    });

    it('should manage memory efficiently', () => {
      const world = new CorePackage.World('memory-test');
      
      // Create and remove entities to test memory management
      const cycles = 100;
      for (let cycle = 0; cycle < cycles; cycle++) {
        // Create entities
        const entities = [];
        for (let i = 0; i < 10; i++) {
          entities.push(world.create({
            position: { x: i, y: cycle, z: 0 },
            memoryTest: `cycle-${cycle}-entity-${i}`
          }));
        }
        
        // Remove half of them
        for (let i = 0; i < 5; i++) {
          world.remove(entities[i]);
        }
      }
      
      // Should have 5 entities per cycle remaining
      expect(world.entities).toHaveLength(cycles * 5);
      
      // Clear all entities
      world.clear();
      expect(world.entities).toHaveLength(0);
    });

    it('should handle rapid state changes efficiently', () => {
      const world = new CorePackage.World('state-change-test');
      const serializer = new CorePackage.GameStateSerializer();
      
      // Create initial entities
      for (let i = 0; i < 50; i++) {
        world.create({
          position: { x: i, y: 0, z: 0 },
          velocity: { x: 0, y: 0, z: 0 },
          health: { current: 100, max: 100 },
          stateTest: i
        });
      }
      
      const startTime = performance.now();
      
      // Perform rapid state changes and serializations
      for (let iteration = 0; iteration < 100; iteration++) {
        // Modify entities
        world.entities.forEach(entity => {
          entity.position.x += 0.1;
          entity.health.current = Math.max(1, entity.health.current - 1);
        });
        
        // Serialize state
        const state = serializer.serialize(world);
        expect(state.entities).toHaveLength(50);
        
        // Verify state integrity
        state.entities.forEach((entity: any) => {
          expect(entity.stateTest).toBeGreaterThanOrEqual(0);
          expect(entity.health.current).toBeGreaterThan(0);
        });
      }
      
      const totalTime = performance.now() - startTime;
      expect(totalTime).toBeLessThan(2000); // Should complete in under 2 seconds
    });
  });
});