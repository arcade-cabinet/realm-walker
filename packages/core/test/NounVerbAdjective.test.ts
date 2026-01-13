import { fc } from '@fast-check/vitest';
import { Agent, AISystem } from '@realm-walker/ai';
import { db, SchemaLoader } from '@realm-walker/mechanics';
import { beforeEach, describe, expect, it } from 'vitest';
import { GameStateSerializer, World } from '../src';

describe('Noun-Verb-Adjective Test Patterns', () => {
  let world: World;
  let serializer: GameStateSerializer;
  let aiSystem: AISystem;
  let loader: SchemaLoader;

  beforeEach(() => {
    // Fresh world for each test
    world = new World('test-noun-verb-adjective');
    serializer = new GameStateSerializer();
    aiSystem = new AISystem(world);
    loader = new SchemaLoader(db);
    
    // Load basic test realm data
    const testRealmData = {
      age: { id: "test-age", name: "Test Era" },
      classes: [{ 
        id: "warrior", 
        name: "Test Warrior", 
        stats: { str: 15, agi: 10, int: 8, hp: 120 },
        visuals: { spriteId: "warrior" }
      }],
      items: [
        { id: "sword", name: "Test Sword", type: "weapon", visuals: { iconId: "sword" } },
        { id: "potion", name: "Health Potion", type: "consumable", visuals: { iconId: "potion" } }
      ],
      bestiary: [
        { id: "goblin", name: "Test Goblin", stats: { str: 8, agi: 12, int: 5, hp: 60 }, behavior: "aggressive" }
      ]
    };
    loader.loadRealm(testRealmData);
  });

  describe('Basic Noun-Verb-Adjective Pattern', () => {
    it('should follow the complete pattern: load state, execute action, verify result', () => {
      // NOUN: Load a known world state (fixture)
      const heroEntity = world.create({
        position: { x: 5, y: 5, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        brain: { agent: new Agent() },
        health: { current: 100, max: 100 },
        inventory: { items: ['sword'], equipped: { weapon: 'sword' } },
        stats: { str: 15, agi: 10, int: 8 }
      });

      const goblinEntity = world.create({
        position: { x: 6, y: 5, z: 0 },
        health: { current: 60, max: 60 },
        stats: { str: 8, agi: 12, int: 5 },
        ai: { behavior: 'aggressive', target: heroEntity.id }
      });

      // Serialize the initial state
      const initialState = serializer.serialize(world);
      expect(initialState.entities).toHaveLength(2);

      // VERB: AI decides an action based ONLY on serialized data
      const serializedData = JSON.parse(JSON.stringify(initialState));
      const decisions = aiSystem.makeDecisions(serializedData);
      
      expect(decisions).toBeDefined();
      expect(Array.isArray(decisions)).toBe(true);

      // ADJECTIVE: Verify the state transition is correct
      if (decisions.length > 0) {
        const decision = decisions[0];
        expect(decision).toHaveProperty('entityId');
        expect(decision).toHaveProperty('action');
        expect(decision.action).toHaveProperty('type');
        
        // Verify action is valid for the entity's state
        const entity = serializedData.entities.find((e: any) => e.id === decision.entityId);
        expect(entity).toBeDefined();
        
        // Action should be contextually appropriate
        const validActionTypes = ['MOVE', 'ATTACK', 'WAIT', 'USE_ITEM', 'CONSUME'];
        expect(validActionTypes).toContain(decision.action.type);
      }
    });

    it('should maintain state consistency across serialization cycles', () => {
      // NOUN: Create a complex world state
      const entities = [];
      for (let i = 0; i < 3; i++) {
        entities.push(world.create({
          position: { x: i * 2, y: i * 2, z: 0 },
          velocity: { x: 0, y: 0, z: 0 },
          brain: { agent: new Agent() },
          health: { current: 100 - i * 10, max: 100 },
          inventory: { items: i > 0 ? ['sword'] : [], equipped: {} }
        }));
      }

      // VERB: Serialize, make decisions, and apply them
      const state1 = serializer.serialize(world);
      const decisions = aiSystem.makeDecisions(state1);
      
      // Apply decisions (simulate one tick)
      aiSystem.update(0.016666); // 60fps tick
      
      const state2 = serializer.serialize(world);

      // ADJECTIVE: Verify state evolution is deterministic and valid
      expect(state2.entities).toHaveLength(state1.entities.length);
      expect(state2.metadata.entityCount).toBe(state1.metadata.entityCount);
      
      // Entities should maintain their core identity
      state1.entities.forEach((originalEntity: any) => {
        const updatedEntity = state2.entities.find((e: any) => e.id === originalEntity.id);
        expect(updatedEntity).toBeDefined();
        expect(updatedEntity.id).toBe(originalEntity.id);
      });
    });
  });

  describe('Property-Based Noun-Verb-Adjective Tests', () => {
    // Property test for the complete pattern
    fc.it('property: noun-verb-adjective pattern maintains world consistency',
      fc.record({
        entityCount: fc.integer({ min: 1, max: 5 }),
        initialHealth: fc.integer({ min: 20, max: 100 }),
        positionRange: fc.integer({ min: 0, max: 10 })
      }),
      ({ entityCount, initialHealth, positionRange }) => {
        // NOUN: Generate a random but valid world state
        const entities = [];
        for (let i = 0; i < entityCount; i++) {
          entities.push(world.create({
            position: { 
              x: Math.floor(Math.random() * positionRange), 
              y: Math.floor(Math.random() * positionRange), 
              z: 0 
            },
            velocity: { x: 0, y: 0, z: 0 },
            brain: { agent: new Agent() },
            health: { current: initialHealth, max: initialHealth },
            stats: { str: 10, agi: 10, int: 10 }
          }));
        }

        const initialState = serializer.serialize(world);

        // VERB: AI makes decisions based on serialized state
        const decisions = aiSystem.makeDecisions(initialState);

        // ADJECTIVE: Verify decisions are valid and world remains consistent
        expect(decisions).toBeDefined();
        expect(Array.isArray(decisions)).toBe(true);

        // All decisions should reference valid entities
        decisions.forEach(decision => {
          const entity = initialState.entities.find((e: any) => e.id === decision.entityId);
          expect(entity).toBeDefined();
          expect(decision.action).toHaveProperty('type');
        });

        // World state should remain valid after decision making
        const postDecisionState = serializer.serialize(world);
        expect(postDecisionState.entities).toHaveLength(entityCount);
        expect(postDecisionState.metadata.entityCount).toBe(entityCount);
      },
      { numRuns: 50 }
    );

    // Property test for action validity
    fc.it('property: all AI decisions are contextually valid',
      fc.record({
        heroHealth: fc.integer({ min: 1, max: 100 }),
        enemyCount: fc.integer({ min: 0, max: 3 }),
        hasWeapon: fc.boolean(),
        hasPotion: fc.boolean()
      }),
      ({ heroHealth, enemyCount, hasWeapon, hasPotion }) => {
        // NOUN: Create specific scenario
        const inventory = [];
        const equipped: any = {};
        
        if (hasWeapon) {
          inventory.push('sword');
          equipped.weapon = 'sword';
        }
        if (hasPotion) {
          inventory.push('potion');
        }

        const hero = world.create({
          position: { x: 5, y: 5, z: 0 },
          velocity: { x: 0, y: 0, z: 0 },
          brain: { agent: new Agent() },
          health: { current: heroHealth, max: 100 },
          inventory: { items: inventory, equipped },
          stats: { str: 15, agi: 10, int: 8 }
        });

        // Add enemies
        for (let i = 0; i < enemyCount; i++) {
          world.create({
            position: { x: 5 + i + 1, y: 5, z: 0 },
            health: { current: 50, max: 50 },
            stats: { str: 8, agi: 8, int: 5 },
            ai: { behavior: 'aggressive', target: hero.id }
          });
        }

        // VERB: Get AI decisions
        const state = serializer.serialize(world);
        const decisions = aiSystem.makeDecisions(state);

        // ADJECTIVE: Verify decision validity
        const heroDecision = decisions.find(d => d.entityId === hero.id);
        if (heroDecision) {
          const action = heroDecision.action;
          
          // Validate action based on context
          if (action.type === 'CONSUME') {
            expect(hasPotion).toBe(true); // Can only consume if has potion
            expect(action.itemId).toBe('potion');
          }
          
          if (action.type === 'ATTACK') {
            expect(enemyCount).toBeGreaterThan(0); // Can only attack if enemies exist
            expect(action.targetId).toBeDefined();
          }
          
          if (action.type === 'USE_ITEM') {
            expect(inventory.length).toBeGreaterThan(0); // Must have items to use
            expect(inventory).toContain(action.itemId);
          }

          // All actions should be from valid set
          const validActions = ['MOVE', 'ATTACK', 'WAIT', 'USE_ITEM', 'CONSUME', 'EQUIP_ITEM'];
          expect(validActions).toContain(action.type);
        }
      },
      { numRuns: 100 }
    );
  });

  describe('Deterministic Replay Tests', () => {
    it('should produce identical results when replaying from same state', () => {
      // NOUN: Create initial state
      const hero = world.create({
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        brain: { agent: new Agent() },
        health: { current: 100, max: 100 },
        stats: { str: 15, agi: 10, int: 8 }
      });

      const initialState = serializer.serialize(world);

      // VERB: Run simulation twice from same state
      const decisions1 = aiSystem.makeDecisions(initialState);
      
      // Reset world to initial state
      const restoredWorld = World.deserialize(initialState);
      const aiSystem2 = new AISystem(restoredWorld);
      const decisions2 = aiSystem2.makeDecisions(initialState);

      // ADJECTIVE: Results should be identical
      expect(decisions1).toEqual(decisions2);
    });

    it('should maintain determinism across multiple simulation steps', () => {
      // NOUN: Setup initial scenario
      const entities = [];
      for (let i = 0; i < 2; i++) {
        entities.push(world.create({
          position: { x: i * 3, y: 0, z: 0 },
          velocity: { x: 0, y: 0, z: 0 },
          brain: { agent: new Agent() },
          health: { current: 100, max: 100 },
          stats: { str: 10, agi: 10, int: 10 }
        }));
      }

      const initialState = serializer.serialize(world);

      // VERB: Run multi-step simulation twice
      const results1 = [];
      const results2 = [];

      // First run
      let currentState1 = initialState;
      for (let step = 0; step < 3; step++) {
        const decisions = aiSystem.makeDecisions(currentState1);
        results1.push(decisions);
        aiSystem.update(0.016666);
        currentState1 = serializer.serialize(world);
      }

      // Second run (reset world)
      const world2 = World.deserialize(initialState);
      const aiSystem2 = new AISystem(world2);
      let currentState2 = initialState;
      for (let step = 0; step < 3; step++) {
        const decisions = aiSystem2.makeDecisions(currentState2);
        results2.push(decisions);
        aiSystem2.update(0.016666);
        currentState2 = serializer.serialize(world2);
      }

      // ADJECTIVE: Both runs should produce identical results
      expect(results1).toEqual(results2);
    });
  });
});