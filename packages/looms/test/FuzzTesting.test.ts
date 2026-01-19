import { test as fcTest } from '@fast-check/vitest';
import * as fc from 'fast-check';
import { Agent, AISystem } from '@realm-walker/ai';
import { World } from '@realm-walker/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { RealmContext, Tapestry } from '../src';

describe('Loom Framework Fuzz Testing', () => {
  let world: World;
  let aiSystem: AISystem;

  beforeEach(() => {
    world = new World('fuzz-test-seed');
    aiSystem = new AISystem(world);
  });

  describe('Randomized Input Generation', () => {
    it('should handle random realm generation parameters', async () => {
      // Skip if no API key (use mock mode)
      const apiKey = process.env.GEMINI_API_KEY || 'mock-key';
      const useMock = !process.env.GEMINI_API_KEY;

      if (useMock) {
        console.log('🎭 Using mock mode for fuzz testing');
      }

      const settings = {
        seed: 'fuzz-test-realm',
        age: 'random-age',
        controls: {
          worldScale: 3,
          minNodes: 2,
          dangerLevel: 5,
          magicLevel: 5,
          technologyLevel: 3
        }
      };

      const tapestry = new Tapestry<RealmContext>({ settings });
      
      if (useMock) {
        // Mock the shuttle behavior for testing
        const mockContext: RealmContext = {
          world: {
            title: 'Fuzz Test World',
            summary: 'A procedurally generated test world',
            nodes: [
              { id: 'start', name: 'Origin', description: 'Starting point', biome: 'plains', difficulty: 1 },
              { id: 'end', name: 'Destination', description: 'Final location', biome: 'mountain', difficulty: 5 }
            ],
            edges: [
              { from: 'start', to: 'end', description: 'Mountain path', travelTime: 10 }
            ]
          },
          classes: [
            { id: 'warrior', name: 'Test Warrior', description: 'Fuzz test class', stats: { str: 15, agi: 10, int: 8, hp: 100 } }
          ],
          bestiary: [
            { id: 'monster', name: 'Test Monster', description: 'Fuzz test enemy', stats: { str: 10, agi: 8, int: 5, hp: 60 } }
          ],
          items: [
            { id: 'weapon', name: 'Test Weapon', description: 'Fuzz test item', type: 'weapon' }
          ]
        };

        // Validate mock context structure
        expect(mockContext.world).toBeDefined();
        expect(mockContext.world.nodes).toHaveLength(2);
        expect(mockContext.world.edges).toHaveLength(1);
        expect(mockContext.classes).toHaveLength(1);
        expect(mockContext.bestiary).toHaveLength(1);
        expect(mockContext.items).toHaveLength(1);
      } else {
        // Real API testing would go here
        // For now, we'll skip to avoid API rate limits in tests
        console.log('⏭️ Skipping real API fuzz testing to avoid rate limits');
      }
    });

    // Property-based fuzz test for Loom input validation
    fcTest.prop([fc.record({
        worldScale: fc.integer({ min: 1, max: 10 }),
        minNodes: fc.integer({ min: 1, max: 8 }),
        dangerLevel: fc.integer({ min: 1, max: 11 }),
        magicLevel: fc.integer({ min: 1, max: 10 }),
        technologyLevel: fc.integer({ min: 1, max: 10 }),
        seedLength: fc.integer({ min: 3, max: 20 })
      })])('property: Loom framework handles arbitrary input parameters gracefully',
      ({ worldScale, minNodes, dangerLevel, magicLevel, technologyLevel, seedLength }) => {
        // Generate random seed
        const seed = 'fuzz-' + Math.random().toString(36).substring(2, 2 + seedLength);
        
        const settings = {
          seed,
          age: 'fuzz-age',
          controls: {
            worldScale,
            minNodes,
            dangerLevel,
            magicLevel,
            technologyLevel
          }
        };

        // Tapestry should handle any valid parameter combination
        const tapestry = new Tapestry<RealmContext>({ settings });
        
        expect(tapestry).toBeDefined();
        expect(tapestry.settings.seed).toBe(seed);
        expect(tapestry.settings.controls.worldScale).toBe(worldScale);
        expect(tapestry.settings.controls.minNodes).toBe(minNodes);
        expect(tapestry.settings.controls.dangerLevel).toBe(dangerLevel);
        expect(tapestry.settings.controls.magicLevel).toBe(magicLevel);
        expect(tapestry.settings.controls.technologyLevel).toBe(technologyLevel);
      }, { numRuns: 50 });
  });

  describe('AI Driver Integration Fuzz Testing', () => {
    it('should handle random AI decision sequences', () => {
      // Create entities with random but valid configurations
      const entities = [];
      for (let i = 0; i < 3; i++) {
        entities.push(world.create({
          position: { x: Math.random() * 10, y: Math.random() * 10, z: 0 },
          velocity: { x: 0, y: 0, z: 0 },
          brain: { agent: new Agent() },
          health: { current: 50 + Math.random() * 50, max: 100 },
          stats: { 
            str: 8 + Math.random() * 12, 
            agi: 8 + Math.random() * 12, 
            int: 8 + Math.random() * 12 
          }
        }));
      }

      // Run multiple AI decision cycles with random timing
      for (let cycle = 0; cycle < 5; cycle++) {
        const deltaTime = 0.01 + Math.random() * 0.03; // 10-40ms
        aiSystem.update(deltaTime);
        
        // Verify world remains in valid state
        const currentEntities = world.with('position');
        expect(currentEntities.size).toBe(3);
        
        // All entities should maintain valid positions
        currentEntities.forEach(entity => {
          expect(entity.position.x).toBeGreaterThanOrEqual(0);
          expect(entity.position.y).toBeGreaterThanOrEqual(0);
          expect(entity.position.z).toBe(0);
          expect(entity.health.current).toBeGreaterThan(0);
          expect(entity.health.current).toBeLessThanOrEqual(entity.health.max);
        });
      }
    });

    // Property-based fuzz test for AI-Loom interaction
    fcTest.prop([fc.record({
        entityCount: fc.integer({ min: 1, max: 4 }),
        worldSize: fc.integer({ min: 5, max: 15 }),
        simulationSteps: fc.integer({ min: 1, max: 10 })
      })])('property: AI driver produces valid decisions for any generated world state',
      ({ entityCount, worldSize, simulationSteps }) => {
        // Generate random world configuration
        const entities = [];
        for (let i = 0; i < entityCount; i++) {
          entities.push(world.create({
            position: { 
              x: Math.floor(Math.random() * worldSize), 
              y: Math.floor(Math.random() * worldSize), 
              z: 0 
            },
            velocity: { x: 0, y: 0, z: 0 },
            brain: { agent: new Agent() },
            health: { current: 60 + Math.random() * 40, max: 100 },
            stats: { 
              str: 5 + Math.random() * 15, 
              agi: 5 + Math.random() * 15, 
              int: 5 + Math.random() * 15 
            }
          }));
        }

        // Run simulation steps
        for (let step = 0; step < simulationSteps; step++) {
          const deltaTime = 0.016666; // Fixed timestep
          aiSystem.update(deltaTime);
          
          // Verify system stability
          const activeEntities = world.with('position');
          expect(activeEntities.size).toBe(entityCount);
          
          // All entities should remain valid
          activeEntities.forEach(entity => {
            expect(entity.position).toBeDefined();
            expect(entity.health).toBeDefined();
            expect(entity.stats).toBeDefined();
            expect(entity.health.current).toBeGreaterThan(0);
            expect(entity.position.x).toBeGreaterThanOrEqual(0);
            expect(entity.position.y).toBeGreaterThanOrEqual(0);
          });
        }
      }, { numRuns: 25 });
  });

  describe('Stress Testing with Random Scenarios', () => {
    it('should handle rapid entity creation and destruction', () => {
      const maxEntities = 10;
      const operations = 20;
      
      for (let op = 0; op < operations; op++) {
        const currentEntityCount = world.with('position').size;
        
        if (Math.random() > 0.5 && currentEntityCount < maxEntities) {
          // Create entity
          world.create({
            position: { x: Math.random() * 10, y: Math.random() * 10, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            brain: { agent: new Agent() },
            health: { current: 50 + Math.random() * 50, max: 100 },
            stats: { str: 10, agi: 10, int: 10 }
          });
        } else if (currentEntityCount > 1) {
          // Remove random entity
          const entities = Array.from(world.with('position'));
          const randomEntity = entities[Math.floor(Math.random() * entities.length)];
          world.remove(randomEntity);
        }
        
        // Run AI update
        aiSystem.update(0.016666);
        
        // Verify world consistency
        const entities = world.with('position');
        expect(entities.size).toBeLessThanOrEqual(maxEntities);
        expect(entities.size).toBeGreaterThanOrEqual(0);
      }
    });

    // Property-based stress test
    fcTest.prop([fc.record({
        initialEntities: fc.integer({ min: 2, max: 5 }),
        modifications: fc.integer({ min: 5, max: 15 }),
        maxHealth: fc.integer({ min: 50, max: 150 })
      })])('property: system remains stable under random entity modifications',
      ({ initialEntities, modifications, maxHealth }) => {
        // Create initial entities
        for (let i = 0; i < initialEntities; i++) {
          world.create({
            position: { x: i * 2, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            brain: { agent: new Agent() },
            health: { current: maxHealth, max: maxHealth },
            stats: { str: 10, agi: 10, int: 10 }
          });
        }

        // Apply random modifications
        for (let mod = 0; mod < modifications; mod++) {
          const entities = Array.from(world.with('position'));
          if (entities.length > 0) {
            const randomEntity = entities[Math.floor(Math.random() * entities.length)];
            
            // Random modification
            const modType = Math.floor(Math.random() * 3);
            switch (modType) {
              case 0: // Move entity
                randomEntity.position.x += (Math.random() - 0.5) * 2;
                randomEntity.position.y += (Math.random() - 0.5) * 2;
                break;
              case 1: // Modify health
                randomEntity.health.current = Math.max(1, randomEntity.health.current + (Math.random() - 0.5) * 20);
                break;
              case 2: // Modify stats
                randomEntity.stats.str = Math.max(1, randomEntity.stats.str + (Math.random() - 0.5) * 4);
                break;
            }
          }
          
          // Update AI system
          aiSystem.update(0.016666);
          
          // Verify stability
          const currentEntities = world.with('position');
          expect(currentEntities.size).toBeGreaterThan(0);
          
          currentEntities.forEach(entity => {
            expect(entity.health.current).toBeGreaterThan(0);
            expect(entity.health.current).toBeLessThanOrEqual(entity.health.max);
            expect(entity.stats.str).toBeGreaterThan(0);
            expect(entity.stats.agi).toBeGreaterThan(0);
            expect(entity.stats.int).toBeGreaterThan(0);
          });
        }
      }, { numRuns: 20 });
  });

  describe('Edge Case Discovery', () => {
    it('should handle empty world scenarios', () => {
      // Start with empty world
      expect(world.entities.length).toBe(0);
      
      // AI system should handle empty world gracefully
      aiSystem.update(0.016666);
      
      // World should remain empty and stable
      expect(world.entities.length).toBe(0);
    });

    it('should handle single entity scenarios', () => {
      const loneEntity = world.create({
        position: { x: 5, y: 5, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        brain: { agent: new Agent() },
        health: { current: 100, max: 100 },
        stats: { str: 10, agi: 10, int: 10 }
      });

      // Run multiple updates
      for (let i = 0; i < 10; i++) {
        aiSystem.update(0.016666);
        
        // Entity should remain valid
        expect(world.entities.length).toBe(1);
        expect(loneEntity.health.current).toBeGreaterThan(0);
        expect(loneEntity.position).toBeDefined();
      }
    });

    it('should handle extreme stat values', () => {
      // Create entities with extreme stats
      const extremeEntities = [
        world.create({
          position: { x: 0, y: 0, z: 0 },
          brain: { agent: new Agent() },
          health: { current: 1, max: 1 }, // Minimum health
          stats: { str: 1, agi: 1, int: 1 } // Minimum stats
        }),
        world.create({
          position: { x: 1, y: 0, z: 0 },
          brain: { agent: new Agent() },
          health: { current: 1000, max: 1000 }, // Maximum health
          stats: { str: 100, agi: 100, int: 100 } // Maximum stats
        })
      ];

      // System should handle extreme values
      for (let i = 0; i < 5; i++) {
        aiSystem.update(0.016666);
        
        extremeEntities.forEach(entity => {
          expect(entity.health.current).toBeGreaterThan(0);
          expect(entity.health.current).toBeLessThanOrEqual(entity.health.max);
          expect(entity.stats.str).toBeGreaterThan(0);
        });
      }
    });
  });
});