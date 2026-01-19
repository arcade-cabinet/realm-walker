import { World } from '@realm-walker/core';
import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { Agent, AISystem, SerializedGameState } from '../src/index.js';

describe('AI Decision Purity', () => {
    it('should make identical decisions for identical game states', () => {
        const agent = new Agent();
        
        const gameState: SerializedGameState = {
            entities: [
                {
                    id: 'agent-1',
                    components: {
                        brain: { agentId: agent.uuid },
                        position: { x: 0, y: 0, z: 0 },
                        health: { current: 100, max: 100 }
                    }
                },
                {
                    id: 'target-1',
                    components: {
                        position: { x: 2, y: 2, z: 0 },
                        health: { current: 50, max: 100 }
                    }
                }
            ],
            worldState: {
                seed: 'test-seed',
                tick: 0,
                metadata: {}
            }
        };

        const decision1 = agent.makeDecision(gameState);
        const decision2 = agent.makeDecision(gameState);

        expect(decision1.type).toBe(decision2.type);
        expect(decision1.entityId).toBe(decision2.entityId);
        expect(decision1.parameters).toEqual(decision2.parameters);
    });

    it('should validate decision reproducibility', () => {
        const agent = new Agent();
        
        const gameState: SerializedGameState = {
            entities: [
                {
                    id: 'agent-1',
                    components: {
                        brain: { agentId: agent.uuid },
                        position: { x: 5, y: 5, z: 0 },
                        health: { current: 20, max: 100 } // Low health should trigger healing
                    }
                }
            ],
            worldState: {
                seed: 'healing-test',
                tick: 0,
                metadata: {}
            }
        };

        const decision = agent.makeDecision(gameState);
        const isReproducible = agent.validateDecisionReproducibility(gameState, decision);

        expect(isReproducible).toBe(true);
        expect(decision.type).toBe('seek_healing');
        expect(decision.parameters.urgency).toBe('high');
    });

    it('property: AI decisions are deterministic across multiple identical states', () => {
        fc.assert(fc.property(
            fc.record({
                seed: fc.string({ minLength: 1, maxLength: 20 }),
                agentPosition: fc.record({
                    x: fc.integer({ min: -100, max: 100 }),
                    y: fc.integer({ min: -100, max: 100 }),
                    z: fc.integer({ min: -100, max: 100 })
                }),
                agentHealth: fc.record({
                    current: fc.integer({ min: 1, max: 100 }),
                    max: fc.constant(100)
                }),
                tick: fc.integer({ min: 0, max: 1000 })
            }),
            (testData) => {
                const agent = new Agent();
                
                const gameState: SerializedGameState = {
                    entities: [
                        {
                            id: 'test-agent',
                            components: {
                                brain: { agentId: agent.uuid },
                                position: testData.agentPosition,
                                health: testData.agentHealth
                            }
                        }
                    ],
                    worldState: {
                        seed: testData.seed,
                        tick: testData.tick,
                        metadata: {}
                    }
                };

                // Make the same decision multiple times
                const decisions = Array.from({ length: 5 }, () => agent.makeDecision(gameState));
                
                // All decisions should be identical (except timestamp)
                const firstDecision = decisions[0];
                for (let i = 1; i < decisions.length; i++) {
                    const currentDecision = decisions[i];
                    
                    expect(currentDecision.type).toBe(firstDecision.type);
                    expect(currentDecision.entityId).toBe(firstDecision.entityId);
                    expect(currentDecision.parameters).toEqual(firstDecision.parameters);
                }
                
                return true;
            }
        ), { numRuns: 100 });
    });

    it('property: AI system maintains decision purity across world states', () => {
        fc.assert(fc.property(
            fc.record({
                seed: fc.string({ minLength: 1, maxLength: 20 }),
                entityCount: fc.integer({ min: 1, max: 5 }),
                worldTick: fc.integer({ min: 0, max: 100 })
            }),
            (testData) => {
                const world = new World(testData.seed);
                const aiSystem = new AISystem(world);
                
                // Create test entities with brain components
                for (let i = 0; i < testData.entityCount; i++) {
                    const agent = new Agent();
                    world.create({
                        id: `agent-${i}`,
                        brain: { agent, agentId: agent.uuid },
                        position: { x: i * 10, y: i * 10, z: 0 },
                        health: { current: 100, max: 100 }
                    });
                }
                
                // Get serialized state
                const serializedState: SerializedGameState = {
                    entities: world.entities.map(entity => ({
                        id: entity.id,
                        components: JSON.parse(JSON.stringify({
                            brain: entity.brain ? { agentId: entity.brain.agentId } : undefined,
                            position: entity.position,
                            health: entity.health
                        }))
                    })),
                    worldState: {
                        seed: testData.seed,
                        tick: testData.worldTick,
                        metadata: {}
                    }
                };
                
                // Validate decision purity
                const isPure = aiSystem.validateDecisionPurity(serializedState);
                expect(isPure).toBe(true);
                
                return true;
            }
        ), { numRuns: 50 });
    });

    it('should make different decisions for different game states', () => {
        const agent1 = new Agent();
        const agent2 = new Agent();
        
        const gameState1: SerializedGameState = {
            entities: [
                {
                    id: 'agent-1',
                    components: {
                        brain: { agentId: agent1.uuid },
                        position: { x: 0, y: 0, z: 0 },
                        health: { current: 100, max: 100 }
                    }
                }
            ],
            worldState: {
                seed: 'state-1',
                tick: 0,
                metadata: {}
            }
        };

        const gameState2: SerializedGameState = {
            entities: [
                {
                    id: 'agent-2',
                    components: {
                        brain: { agentId: agent2.uuid },
                        position: { x: 0, y: 0, z: 0 },
                        health: { current: 30, max: 100 } // 30% health should trigger healing
                    }
                }
            ],
            worldState: {
                seed: 'state-2',
                tick: 0,
                metadata: {}
            }
        };

        const decision1 = agent1.makeDecision(gameState1);
        const decision2 = agent2.makeDecision(gameState2);

        // Decisions should be different due to different health states
        expect(decision1.type).not.toBe(decision2.type);
        expect(decision2.type).toBe('seek_healing');
    });

    it('should handle deterministic random decisions based on world seed', () => {
        const agent = new Agent();
        
        const createGameState = (seed: string): SerializedGameState => ({
            entities: [
                {
                    id: 'agent-1',
                    components: {
                        brain: { agentId: agent.uuid },
                        position: { x: 0, y: 0, z: 0 },
                        health: { current: 100, max: 100 }
                    }
                }
            ],
            worldState: {
                seed,
                tick: 0,
                metadata: {}
            }
        });

        const decision1a = agent.makeDecision(createGameState('seed-alpha'));
        const decision1b = agent.makeDecision(createGameState('seed-alpha'));
        
        const decision2a = agent.makeDecision(createGameState('seed-beta'));
        const decision2b = agent.makeDecision(createGameState('seed-beta'));

        // Same seed should produce same decisions
        expect(decision1a.type).toBe(decision1b.type);
        expect(decision1a.parameters).toEqual(decision1b.parameters);
        
        expect(decision2a.type).toBe(decision2b.type);
        expect(decision2a.parameters).toEqual(decision2b.parameters);
        
        // Different seeds may produce different decisions
        // (This is not guaranteed but likely for wander behavior)
    });
});