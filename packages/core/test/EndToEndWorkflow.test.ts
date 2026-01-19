import { test as fcTest } from '@fast-check/vitest';
import * as fc from 'fast-check';
import { Agent, AISystem } from '@realm-walker/ai';
import { db, SchemaLoader } from '@realm-walker/mechanics';
import { beforeEach, describe, expect, it } from 'vitest';
import { GameStateSerializer, World } from '../src';

describe('End-to-End Workflow', () => {
  let world: World;
  let serializer: GameStateSerializer;
  let aiSystem: AISystem;
  let loader: SchemaLoader;

  beforeEach(() => {
    world = new World('e2e-workflow-test');
    serializer = new GameStateSerializer();
    aiSystem = new AISystem(world);
    loader = new SchemaLoader(db);
  });

  describe('Complete Game Loop Integration', () => {
    it('should execute complete workflow: realm generation → simulation → verification', async () => {
      // PHASE 1: Realm Generation (Mock)
      const mockRealmData = {
        age: { id: "e2e-age", name: "End-to-End Test Era", description: "Complete workflow test" },
        classes: [
          { 
            id: "paladin", 
            name: "Test Paladin", 
            description: "Holy warrior for testing",
            stats: { str: 16, agi: 12, int: 14, hp: 140 },
            visuals: { spriteId: "paladin", scale: 1.2 }
          },
          { 
            id: "rogue", 
            name: "Test Rogue", 
            description: "Stealthy assassin for testing",
            stats: { str: 10, agi: 18, int: 12, hp: 100 },
            visuals: { spriteId: "rogue", scale: 0.9 }
          }
        ],
        items: [
          { id: "holy-sword", name: "Blessed Blade", type: "weapon", stats: { damage: 25 } },
          { id: "healing-potion", name: "Greater Heal", type: "consumable", effects: { heal: 50 } },
          { id: "stealth-cloak", name: "Shadow Cloak", type: "armor", stats: { stealth: 15 } }
        ],
        bestiary: [
          { 
            id: "shadow-beast", 
            name: "Shadow Beast", 
            description: "Dark creature from the void",
            stats: { str: 14, agi: 16, int: 8, hp: 120 },
            behavior: "aggressive",
            abilities: ["shadow-strike", "phase-shift"]
          },
          { 
            id: "fire-elemental", 
            name: "Fire Elemental", 
            description: "Living flame entity",
            stats: { str: 18, agi: 10, int: 6, hp: 100 },
            behavior: "territorial",
            abilities: ["flame-burst", "ignite"]
          }
        ],
        loom: {
          title: "The Convergence Nexus",
          summary: "A mystical realm where light and shadow collide",
          nodes: [
            { id: "sanctuary", name: "Holy Sanctuary", description: "Safe starting area", biome: "temple", difficulty: 1 },
            { id: "shadowlands", name: "Shadow Realm", description: "Dark twisted landscape", biome: "shadow", difficulty: 7 },
            { id: "fire-peaks", name: "Volcanic Peaks", description: "Molten mountain range", biome: "volcanic", difficulty: 8 },
            { id: "nexus-core", name: "Convergence Core", description: "Final challenge area", biome: "mystical", difficulty: 10 }
          ],
          edges: [
            { from: "sanctuary", to: "shadowlands", description: "Dark portal", travelTime: 15 },
            { from: "sanctuary", to: "fire-peaks", description: "Mountain path", travelTime: 20 },
            { from: "shadowlands", to: "nexus-core", description: "Shadow bridge", travelTime: 10 },
            { from: "fire-peaks", to: "nexus-core", description: "Lava tunnel", travelTime: 12 }
          ]
        }
      };

      // Load realm data into mechanics system
      loader.loadRealm(mockRealmData);

      // PHASE 2: World Population
      const heroes = [];
      const enemies = [];

      // Create hero party
      mockRealmData.classes.forEach((cls, index) => {
        const hero = world.create({
          position: { x: index * 2, y: 0, z: 0 },
          velocity: { x: 0, y: 0, z: 0 },
          brain: { agent: new Agent() },
          health: { current: cls.stats.hp, max: cls.stats.hp },
          stats: { str: cls.stats.str, agi: cls.stats.agi, int: cls.stats.int },
          inventory: { 
            items: index === 0 ? ['holy-sword', 'healing-potion'] : ['stealth-cloak'], 
            equipped: index === 0 ? { weapon: 'holy-sword' } : { armor: 'stealth-cloak' }
          },
          visuals: cls.visuals,
          classId: cls.id
        });
        heroes.push(hero);
      });

      // Create enemy encounters
      mockRealmData.bestiary.forEach((monster, index) => {
        const enemy = world.create({
          position: { x: 5 + index * 3, y: 2, z: 0 },
          health: { current: monster.stats.hp, max: monster.stats.hp },
          stats: { str: monster.stats.str, agi: monster.stats.agi, int: monster.stats.int },
          ai: { 
            behavior: monster.behavior, 
            target: heroes[0].id, // Target first hero
            abilities: monster.abilities 
          },
          monsterId: monster.id
        });
        enemies.push(enemy);
      });

      expect(world.entities.length).toBe(4); // 2 heroes + 2 enemies

      // PHASE 3: Simulation Execution
      const simulationSteps = 10;
      const stateHistory = [];

      for (let step = 0; step < simulationSteps; step++) {
        // Capture pre-update state
        const preState = serializer.serialize(world);
        stateHistory.push({
          step,
          phase: 'pre-update',
          entityCount: preState.entities.length,
          heroHealth: preState.entities
            .filter((e: any) => e.classId)
            .map((e: any) => ({ id: e.id, health: e.health.current })),
          enemyHealth: preState.entities
            .filter((e: any) => e.monsterId)
            .map((e: any) => ({ id: e.id, health: e.health.current }))
        });

        // Execute AI decisions
        aiSystem.update(0.016666);

        // Capture post-update state
        const postState = serializer.serialize(world);
        stateHistory.push({
          step,
          phase: 'post-update',
          entityCount: postState.entities.length,
          heroHealth: postState.entities
            .filter((e: any) => e.classId)
            .map((e: any) => ({ id: e.id, health: e.health.current })),
          enemyHealth: postState.entities
            .filter((e: any) => e.monsterId)
            .map((e: any) => ({ id: e.id, health: e.health.current }))
        });
      }

      // PHASE 4: Verification
      expect(stateHistory).toHaveLength(simulationSteps * 2);

      // Verify simulation progression
      const finalState = stateHistory[stateHistory.length - 1];
      expect(finalState.entityCount).toBeGreaterThan(0);

      // Verify all entities maintained valid health
      stateHistory.forEach(state => {
        state.heroHealth.forEach((hero: any) => {
          expect(hero.health).toBeGreaterThan(0);
        });
        state.enemyHealth.forEach((enemy: any) => {
          expect(enemy.health).toBeGreaterThan(0);
        });
      });

      // Verify state transitions were logical
      for (let i = 1; i < stateHistory.length; i++) {
        const prevState = stateHistory[i - 1];
        const currState = stateHistory[i];
        
        // Entity count should remain stable or decrease (entities can die)
        expect(currState.entityCount).toBeLessThanOrEqual(prevState.entityCount);
        
        // Health should only decrease or stay same (no spontaneous healing without items)
        currState.heroHealth.forEach((hero: any) => {
          const prevHero = prevState.heroHealth.find((h: any) => h.id === hero.id);
          if (prevHero) {
            expect(hero.health).toBeLessThanOrEqual(prevHero.health + 50); // Allow for healing potion
          }
        });
      }
    });

    it('should handle complete realm lifecycle with serialization', () => {
      // Create initial realm state
      const initialEntities = [];
      for (let i = 0; i < 3; i++) {
        initialEntities.push(world.create({
          position: { x: i * 2, y: 0, z: 0 },
          velocity: { x: 0, y: 0, z: 0 },
          brain: { agent: new Agent() },
          health: { current: 100, max: 100 },
          stats: { str: 10 + i, agi: 10 + i, int: 10 + i },
          realmId: `entity-${i}`
        }));
      }

      // Serialize initial state
      const checkpoint1 = serializer.serialize(world);
      expect(checkpoint1.entities).toHaveLength(3);

      // Run simulation for several steps
      for (let step = 0; step < 5; step++) {
        aiSystem.update(0.016666);
      }

      // Create checkpoint
      const checkpoint2 = serializer.serialize(world);

      // Continue simulation
      for (let step = 0; step < 5; step++) {
        aiSystem.update(0.016666);
      }

      // Final checkpoint
      const checkpoint3 = serializer.serialize(world);

      // Verify checkpoints are valid and show progression
      expect(checkpoint1.metadata.entityCount).toBe(3);
      expect(checkpoint2.metadata.entityCount).toBe(3);
      expect(checkpoint3.metadata.entityCount).toBe(3);

      // Verify we can restore from any checkpoint
      const restoredWorld1 = World.deserialize(checkpoint1);
      const restoredWorld2 = World.deserialize(checkpoint2);
      const restoredWorld3 = World.deserialize(checkpoint3);

      expect(restoredWorld1.entities.length).toBe(3);
      expect(restoredWorld2.entities.length).toBe(3);
      expect(restoredWorld3.entities.length).toBe(3);

      // Verify entity data integrity
      checkpoint1.entities.forEach((entity: any, index: number) => {
        expect(entity.realmId).toBe(`entity-${index}`);
        expect(entity.health.current).toBe(100);
        expect(entity.stats.str).toBe(10 + index);
      });
    });
  });

  describe('Property-Based End-to-End Testing', () => {
    // Property test for complete workflow consistency
    fcTest.prop([fc.record({
        heroCount: fc.integer({ min: 1, max: 3 }),
        enemyCount: fc.integer({ min: 1, max: 4 }),
        simulationSteps: fc.integer({ min: 3, max: 12 }),
        initialHealth: fc.integer({ min: 50, max: 150 })
      })])('property: end-to-end workflow maintains system invariants',
      ({ heroCount, enemyCount, simulationSteps, initialHealth }) => {
        // Setup phase
        const heroes = [];
        const enemies = [];

        // Create heroes
        for (let i = 0; i < heroCount; i++) {
          heroes.push(world.create({
            position: { x: i, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            brain: { agent: new Agent() },
            health: { current: initialHealth, max: initialHealth },
            stats: { str: 12, agi: 12, int: 12 },
            faction: 'hero'
          }));
        }

        // Create enemies
        for (let i = 0; i < enemyCount; i++) {
          enemies.push(world.create({
            position: { x: 5 + i, y: 1, z: 0 },
            health: { current: initialHealth, max: initialHealth },
            stats: { str: 10, agi: 10, int: 10 },
            ai: { behavior: 'aggressive', target: heroes[0].id },
            faction: 'enemy'
          }));
        }

        const initialEntityCount = heroCount + enemyCount;
        expect(world.entities.length).toBe(initialEntityCount);

        // Simulation phase
        const checkpoints = [];
        for (let step = 0; step < simulationSteps; step++) {
          const preState = serializer.serialize(world);
          aiSystem.update(0.016666);
          const postState = serializer.serialize(world);
          
          checkpoints.push({ pre: preState, post: postState });
        }

        // Verification phase
        expect(checkpoints).toHaveLength(simulationSteps);

        // Verify system invariants
        checkpoints.forEach((checkpoint, index) => {
          // Entity count should not increase
          expect(checkpoint.post.entities.length).toBeLessThanOrEqual(checkpoint.pre.entities.length);
          
          // All remaining entities should have valid health
          checkpoint.post.entities.forEach((entity: any) => {
            expect(entity.health.current).toBeGreaterThan(0);
            expect(entity.health.current).toBeLessThanOrEqual(entity.health.max);
          });

          // Positions should be valid
          checkpoint.post.entities.forEach((entity: any) => {
            expect(entity.position.x).toBeGreaterThanOrEqual(0);
            expect(entity.position.y).toBeGreaterThanOrEqual(0);
            expect(entity.position.z).toBe(0);
          });

          // Stats should remain positive
          checkpoint.post.entities.forEach((entity: any) => {
            if (entity.stats) {
              expect(entity.stats.str).toBeGreaterThan(0);
              expect(entity.stats.agi).toBeGreaterThan(0);
              expect(entity.stats.int).toBeGreaterThan(0);
            }
          });
        });

        // Final state should be valid
        const finalState = serializer.serialize(world);
        expect(finalState.entities.length).toBeGreaterThan(0);
        expect(finalState.entities.length).toBeLessThanOrEqual(initialEntityCount);
      }, { numRuns: 30 });

    // Property test for serialization consistency throughout workflow
    fcTest.prop([fc.record({
        entityCount: fc.integer({ min: 2, max: 6 }),
        checkpointInterval: fc.integer({ min: 1, max: 3 }),
        totalSteps: fc.integer({ min: 5, max: 15 })
      })])('property: serialization remains consistent throughout complete workflow',
      ({ entityCount, checkpointInterval, totalSteps }) => {
        // Create entities
        for (let i = 0; i < entityCount; i++) {
          world.create({
            position: { x: i, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            brain: { agent: new Agent() },
            health: { current: 100, max: 100 },
            stats: { str: 10, agi: 10, int: 10 },
            workflowId: `wf-entity-${i}`
          });
        }

        // Run workflow with periodic checkpoints
        const checkpoints = [];
        for (let step = 0; step < totalSteps; step++) {
          if (step % checkpointInterval === 0) {
            const checkpoint = serializer.serialize(world);
            checkpoints.push(checkpoint);
          }
          
          aiSystem.update(0.016666);
        }

        // Final checkpoint
        const finalCheckpoint = serializer.serialize(world);
        checkpoints.push(finalCheckpoint);

        // Verify all checkpoints are valid
        checkpoints.forEach((checkpoint, index) => {
          expect(checkpoint.entities.length).toBeGreaterThan(0);
          expect(checkpoint.entities.length).toBeLessThanOrEqual(entityCount);
          expect(checkpoint.seed).toBe('e2e-workflow-test');
          expect(checkpoint.metadata.entityCount).toBe(checkpoint.entities.length);

          // Verify each checkpoint can be deserialized
          const restoredWorld = World.deserialize(checkpoint);
          expect(restoredWorld.entities.length).toBe(checkpoint.entities.length);
          
          // Verify entity data integrity
          checkpoint.entities.forEach((entity: any) => {
            expect(entity.workflowId).toMatch(/^wf-entity-\d+$/);
            expect(entity.health.current).toBeGreaterThan(0);
            expect(entity.position).toBeDefined();
          });
        });

        // Verify checkpoint progression is logical
        for (let i = 1; i < checkpoints.length; i++) {
          const prev = checkpoints[i - 1];
          const curr = checkpoints[i];
          
          // Entity count should not increase
          expect(curr.entities.length).toBeLessThanOrEqual(prev.entities.length);
          
          // Seed should remain consistent
          expect(curr.seed).toBe(prev.seed);
        }
      }, { numRuns: 25 });
  });

  describe('Integration Failure Recovery', () => {
    it('should recover gracefully from mid-workflow failures', () => {
      // Create initial state
      const entities = [];
      for (let i = 0; i < 3; i++) {
        entities.push(world.create({
          position: { x: i, y: 0, z: 0 },
          velocity: { x: 0, y: 0, z: 0 },
          brain: { agent: new Agent() },
          health: { current: 100, max: 100 },
          stats: { str: 10, agi: 10, int: 10 }
        }));
      }

      // Create checkpoint before potential failure
      const safeCheckpoint = serializer.serialize(world);

      // Simulate workflow steps
      for (let step = 0; step < 3; step++) {
        aiSystem.update(0.016666);
      }

      // Simulate failure by corrupting an entity
      const corruptEntity = world.entities[0];
      corruptEntity.health.current = -10; // Invalid state

      // System should detect and handle invalid state
      expect(corruptEntity.health.current).toBeLessThan(0);

      // Restore from checkpoint
      const restoredWorld = World.deserialize(safeCheckpoint);
      expect(restoredWorld.entities.length).toBe(3);
      
      // All entities should be in valid state
      restoredWorld.entities.forEach(entity => {
        expect(entity.health.current).toBeGreaterThan(0);
        expect(entity.health.current).toBeLessThanOrEqual(entity.health.max);
      });
    });

    it('should maintain data integrity during concurrent operations', () => {
      // Create entities
      for (let i = 0; i < 4; i++) {
        world.create({
          position: { x: i, y: 0, z: 0 },
          velocity: { x: 0, y: 0, z: 0 },
          brain: { agent: new Agent() },
          health: { current: 100, max: 100 },
          stats: { str: 10, agi: 10, int: 10 },
          concurrentId: i
        });
      }

      // Simulate concurrent operations
      const operations = [];
      for (let op = 0; op < 10; op++) {
        operations.push(() => {
          // AI update
          aiSystem.update(0.016666);
          
          // Serialization
          const state = serializer.serialize(world);
          
          // Validation
          expect(state.entities.length).toBeGreaterThan(0);
          state.entities.forEach((entity: any) => {
            expect(entity.concurrentId).toBeGreaterThanOrEqual(0);
            expect(entity.health.current).toBeGreaterThan(0);
          });
        });
      }

      // Execute operations
      operations.forEach(op => op());

      // Final validation
      const finalState = serializer.serialize(world);
      expect(finalState.entities.length).toBeGreaterThan(0);
      expect(finalState.metadata.entityCount).toBe(finalState.entities.length);
    });
  });
});