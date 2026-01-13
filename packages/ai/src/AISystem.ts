import { Entity, World } from '@realm-walker/core';
import { EntityManager } from 'yuka';
import { Agent, AIDecision, SerializedGameState } from './Agent.js';

// ECS Component that holds the reference to the Yuka agent
export type BrainComponent = {
    agent: Agent;
    agentId: string;
};

// System to update Yuka entities with pure AI decisions
export class AISystem {
    private entityManager: EntityManager;
    private pendingDecisions: AIDecision[] = [];

    constructor(private world: World) {
        this.entityManager = new EntityManager();

        // Listen for entities with brains being added/removed
        this.world.with('brain').onEntityAdded.subscribe((entity: Entity & { brain: BrainComponent }) => {
            this.entityManager.add(entity.brain.agent);
        });

        this.world.with('brain').onEntityRemoved.subscribe((entity: Entity & { brain: BrainComponent }) => {
            this.entityManager.remove(entity.brain.agent);
        });
    }

    update(dt: number) {
        // First, make AI decisions based on current serialized state
        this.makeAIDecisions();
        
        // Then update the Yuka entity manager
        this.entityManager.update(dt);
        
        // Finally, apply pending decisions to the world
        this.applyPendingDecisions();

        // Sync Yuka transforms back to ECS components if needed
        for (const _entity of this.world.with('brain', 'position')) {
            // Sync logic would go here if needed
        }
    }

    /**
     * Make AI decisions for all brain entities based on serialized world state
     */
    private makeAIDecisions(): void {
        // Get current serialized state of the world
        const serializedState = this.getSerializedWorldState();
        
        // Make decisions for each AI agent
        for (const entity of this.world.with('brain')) {
            const brainComponent = entity.brain as BrainComponent;
            const decision = brainComponent.agent.makeDecision(serializedState);
            this.pendingDecisions.push(decision);
        }
    }

    /**
     * Get the current world state in serialized form for AI decision making
     */
    private getSerializedWorldState(): SerializedGameState {
        const entities = [];
        
        // Serialize all entities with their components
        for (const entity of this.world.entities) {
            const serializedEntity = {
                id: entity.id,
                components: {} as Record<string, any>
            };
            
            // Copy all components (this is a simplified version)
            Object.keys(entity).forEach(key => {
                if (key !== 'id') {
                    serializedEntity.components[key] = JSON.parse(JSON.stringify(entity[key]));
                }
            });
            
            entities.push(serializedEntity);
        }

        // Use the world's serialize method to get consistent state
        const worldState = this.world.serialize();

        return {
            entities,
            worldState: {
                seed: worldState.seed,
                tick: 0, // We'll add tick tracking later if needed
                metadata: worldState.metadata
            }
        };
    }

    /**
     * Apply pending AI decisions to the world state
     */
    private applyPendingDecisions(): void {
        // Sort decisions by timestamp for deterministic ordering
        this.pendingDecisions.sort((a, b) => a.timestamp - b.timestamp);
        
        for (const decision of this.pendingDecisions) {
            this.applyDecision(decision);
        }
        
        // Clear pending decisions
        this.pendingDecisions = [];
    }

    /**
     * Apply a single AI decision to the world
     */
    private applyDecision(decision: AIDecision): void {
        const entity = this.world.entities.find(e => e.id === decision.entityId);
        if (!entity) return;

        switch (decision.type) {
            case 'move':
                if (entity.position && decision.parameters.direction) {
                    entity.position.x += decision.parameters.direction.x;
                    entity.position.y += decision.parameters.direction.y;
                }
                break;
                
            case 'interact':
                // Handle interaction logic
                if (decision.parameters.targetId) {
                    // Find target entity and perform interaction
                    const target = this.world.entities.find(e => e.id === decision.parameters.targetId);
                    if (target) {
                        // Interaction logic would go here
                    }
                }
                break;
                
            case 'wander':
                if (entity.position && decision.parameters.direction) {
                    // Apply wandering movement
                    entity.position.x += decision.parameters.direction.x * 0.1;
                    entity.position.y += decision.parameters.direction.y * 0.1;
                }
                break;
                
            case 'seek_healing':
                // Handle healing seeking behavior
                break;
                
            case 'idle':
            default:
                // Do nothing for idle or unknown actions
                break;
        }
    }

    /**
     * Validate that AI decisions are reproducible
     */
    validateDecisionPurity(state: SerializedGameState): boolean {
        const decisions1 = this.makeDecisionsForState(state);
        const decisions2 = this.makeDecisionsForState(state);
        
        if (decisions1.length !== decisions2.length) return false;
        
        for (let i = 0; i < decisions1.length; i++) {
            const d1 = decisions1[i];
            const d2 = decisions2[i];
            
            if (d1.type !== d2.type || 
                d1.entityId !== d2.entityId ||
                JSON.stringify(d1.parameters) !== JSON.stringify(d2.parameters)) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Make decisions for a given state (used for testing)
     */
    private makeDecisionsForState(state: SerializedGameState): AIDecision[] {
        const decisions: AIDecision[] = [];
        
        for (const entity of this.world.with('brain')) {
            const brainComponent = entity.brain as BrainComponent;
            const decision = brainComponent.agent.makeDecision(state);
            decisions.push(decision);
        }
        
        return decisions;
    }
}
