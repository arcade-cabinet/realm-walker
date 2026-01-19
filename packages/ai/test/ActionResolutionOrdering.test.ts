import { World } from '@realm-walker/core';
import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { Agent, AIDecision, AISystem } from '../src/index.js';

describe('Action Resolution Ordering', () => {
    it('should resolve actions in deterministic timestamp order', () => {
        const world = new World('test-seed');
        const aiSystem = new AISystem(world);
        
        // Create test decisions with different timestamps
        const decisions: AIDecision[] = [
            {
                type: 'move',
                entityId: 'entity-3',
                parameters: { direction: { x: 1, y: 0 } },
                timestamp: 1000
            },
            {
                type: 'interact',
                entityId: 'entity-1',
                parameters: { targetId: 'entity-2' },
                timestamp: 500
            },
            {
                type: 'wander',
                entityId: 'entity-2',
                parameters: { direction: { x: 0, y: 1 } },
                timestamp: 750
            }
        ];
        
        const expectedOrder = aiSystem.getExpectedResolutionOrder(decisions);
        
        // Should be ordered by timestamp: entity-1 (500), entity-2 (750), entity-3 (1000)
        expect(expectedOrder[0].entityId).toBe('entity-1');
        expect(expectedOrder[1].entityId).toBe('entity-2');
        expect(expectedOrder[2].entityId).toBe('entity-3');
        
        expect(aiSystem.validateActionResolutionOrdering(decisions)).toBe(true);
    });

    it('should resolve actions with identical timestamps by entity ID', () => {
        const world = new World('test-seed');
        const aiSystem = new AISystem(world);
        
        // Create test decisions with identical timestamps
        const decisions: AIDecision[] = [
            {
                type: 'move',
                entityId: 'entity-c',
                parameters: { direction: { x: 1, y: 0 } },
                timestamp: 1000
            },
            {
                type: 'interact',
                entityId: 'entity-a',
                parameters: { targetId: 'entity-b' },
                timestamp: 1000
            },
            {
                type: 'wander',
                entityId: 'entity-b',
                parameters: { direction: { x: 0, y: 1 } },
                timestamp: 1000
            }
        ];
        
        const expectedOrder = aiSystem.getExpectedResolutionOrder(decisions);
        
        // Should be ordered by entity ID: entity-a, entity-b, entity-c
        expect(expectedOrder[0].entityId).toBe('entity-a');
        expect(expectedOrder[1].entityId).toBe('entity-b');
        expect(expectedOrder[2].entityId).toBe('entity-c');
        
        expect(aiSystem.validateActionResolutionOrdering(decisions)).toBe(true);
    });

    it('should validate comprehensive action resolution with game rules', () => {
        const world = new World('validation-test');
        const aiSystem = new AISystem(world);
        
        // Create entities with required components
        const agent1 = new Agent();
        const agent2 = new Agent();
        
        const entity1 = world.create({
            id: 'healer',
            brain: { agent: agent1, agentId: agent1.uuid },
            position: { x: 0, y: 0, z: 0 },
            health: { current: 80, max: 100 }
        });
        
        const entity2 = world.create({
            id: 'patient',
            brain: { agent: agent2, agentId: agent2.uuid },
            position: { x: 2, y: 2, z: 0 },
            health: { current: 30, max: 100 }
        });
        
        // Create decisions that should be validated and applied
        const decisions: AIDecision[] = [
            {
                type: 'interact',
                entityId: 'healer',
                parameters: { targetId: 'patient' },
                timestamp: 1000
            },
            {
                type: 'seek_healing',
                entityId: 'patient',
                parameters: { urgency: 'high' },
                timestamp: 1001
            }
        ];
        
        // Store initial health values
        const initialHealerHealth = entity1.health.current;
        const initialPatientHealth = entity2.health.current;
        
        // Validate ordering
        expect(aiSystem.validateActionResolutionOrdering(decisions)).toBe(true);
        
        // The decisions should be valid according to game rules
        const expectedOrder = aiSystem.getExpectedResolutionOrder(decisions);
        expect(expectedOrder.length).toBe(2);
        expect(expectedOrder[0].type).toBe('interact');
        expect(expectedOrder[1].type).toBe('seek_healing');
    });

    it('property: action resolution ordering is deterministic across multiple runs', () => {
        fc.assert(fc.property(
            fc.array(
                fc.record({
                    type: fc.constantFrom('move', 'interact', 'wander', 'seek_healing', 'idle'),
                    entityId: fc.string({ minLength: 1, maxLength: 20 }),
                    timestamp: fc.integer({ min: 0, max: 10000 }),
                    parameters: fc.record({
                        direction: fc.record({
                            x: fc.float({ min: -1, max: 1 }),
                            y: fc.float({ min: -1, max: 1 })
                        }),
                        targetId: fc.string({ minLength: 1, maxLength: 20 }),
                        urgency: fc.constantFrom('low', 'medium', 'high')
                    })
                }),
                { minLength: 1, maxLength: 10 }
            ),
            (decisionData) => {
                const world = new World('property-test');
                const aiSystem = new AISystem(world);
                
                // Convert test data to AIDecision objects
                const decisions: AIDecision[] = decisionData.map(data => ({
                    type: data.type,
                    entityId: data.entityId,
                    parameters: data.parameters,
                    timestamp: data.timestamp
                }));
                
                // Get expected order multiple times
                const order1 = aiSystem.getExpectedResolutionOrder(decisions);
                const order2 = aiSystem.getExpectedResolutionOrder(decisions);
                const order3 = aiSystem.getExpectedResolutionOrder(decisions);
                
                // All orders should be identical
                expect(order1.length).toBe(order2.length);
                expect(order2.length).toBe(order3.length);
                
                for (let i = 0; i < order1.length; i++) {
                    expect(order1[i].entityId).toBe(order2[i].entityId);
                    expect(order2[i].entityId).toBe(order3[i].entityId);
                    expect(order1[i].timestamp).toBe(order2[i].timestamp);
                    expect(order2[i].timestamp).toBe(order3[i].timestamp);
                }
                
                // Validation should be consistent
                const isValid1 = aiSystem.validateActionResolutionOrdering(decisions);
                const isValid2 = aiSystem.validateActionResolutionOrdering(decisions);
                expect(isValid1).toBe(isValid2);
                
                return true;
            }
        ), { numRuns: 100 });
    });

    it('property: action resolution respects timestamp precedence', () => {
        fc.assert(fc.property(
            fc.array(
                fc.record({
                    entityId: fc.string({ minLength: 1, maxLength: 10 }),
                    timestamp: fc.integer({ min: 0, max: 1000 })
                }),
                { minLength: 2, maxLength: 5 }
            ),
            (testData) => {
                const world = new World('timestamp-test');
                const aiSystem = new AISystem(world);
                
                // Create decisions from test data
                const decisions: AIDecision[] = testData.map(data => ({
                    type: 'idle',
                    entityId: data.entityId,
                    parameters: {},
                    timestamp: data.timestamp
                }));
                
                const orderedDecisions = aiSystem.getExpectedResolutionOrder(decisions);
                
                // Verify timestamp ordering
                for (let i = 1; i < orderedDecisions.length; i++) {
                    const prev = orderedDecisions[i - 1];
                    const curr = orderedDecisions[i];
                    
                    // Current timestamp should be >= previous timestamp
                    expect(curr.timestamp).toBeGreaterThanOrEqual(prev.timestamp);
                    
                    // If timestamps are equal, entity IDs should be in lexicographic order
                    if (curr.timestamp === prev.timestamp) {
                        expect(curr.entityId.localeCompare(prev.entityId)).toBeGreaterThanOrEqual(0);
                    }
                }
                
                return true;
            }
        ), { numRuns: 50 });
    });

    it('should handle empty decision arrays', () => {
        const world = new World('empty-test');
        const aiSystem = new AISystem(world);
        
        const emptyDecisions: AIDecision[] = [];
        const orderedDecisions = aiSystem.getExpectedResolutionOrder(emptyDecisions);
        
        expect(orderedDecisions).toEqual([]);
        expect(aiSystem.validateActionResolutionOrdering(emptyDecisions)).toBe(true);
    });

    it('should handle single decision arrays', () => {
        const world = new World('single-test');
        const aiSystem = new AISystem(world);
        
        const singleDecision: AIDecision[] = [{
            type: 'idle',
            entityId: 'solo-entity',
            parameters: {},
            timestamp: 1000
        }];
        
        const orderedDecisions = aiSystem.getExpectedResolutionOrder(singleDecision);
        
        expect(orderedDecisions).toEqual(singleDecision);
        expect(aiSystem.validateActionResolutionOrdering(singleDecision)).toBe(true);
    });
});