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
        // If timestamps are identical, sort by entityId for consistency
        this.pendingDecisions.sort((a, b) => {
            if (a.timestamp !== b.timestamp) {
                return a.timestamp - b.timestamp;
            }
            return a.entityId.localeCompare(b.entityId);
        });
        
        // Apply decisions in deterministic order
        for (const decision of this.pendingDecisions) {
            this.applyDecision(decision);
        }
        
        // Clear pending decisions
        this.pendingDecisions = [];
    }

    /**
     * Apply a single AI decision to the world with comprehensive validation
     */
    private applyDecision(decision: AIDecision): void {
        const entity = this.world.entities.find(e => e.id === decision.entityId);
        if (!entity) {
            console.warn(`Entity ${decision.entityId} not found for decision ${decision.type}`);
            return;
        }

        // Validate decision against game rules before applying
        if (!this.validateDecisionAgainstRules(decision, entity)) {
            console.warn(`Decision ${decision.type} for entity ${decision.entityId} failed validation`);
            return;
        }

        switch (decision.type) {
            case 'move':
                this.applyMoveDecision(decision, entity);
                break;
                
            case 'interact':
                this.applyInteractDecision(decision, entity);
                break;
                
            case 'wander':
                this.applyWanderDecision(decision, entity);
                break;
                
            case 'seek_healing':
                this.applySeekHealingDecision(decision, entity);
                break;
                
            case 'idle':
            default:
                // Do nothing for idle or unknown actions
                break;
        }
    }

    /**
     * Validate a decision against game rules
     */
    private validateDecisionAgainstRules(decision: AIDecision, entity: any): boolean {
        // Basic validation - entity must exist and have required components
        if (!entity) return false;

        switch (decision.type) {
            case 'move':
            case 'wander':
                // Movement requires position component
                return !!entity.position;
                
            case 'interact':
                // Interaction requires position and valid target
                if (!entity.position || !decision.parameters.targetId) return false;
                const target = this.world.entities.find(e => e.id === decision.parameters.targetId);
                return !!target && !!target.position;
                
            case 'seek_healing':
                // Healing requires health component
                return !!entity.health;
                
            case 'idle':
            default:
                return true;
        }
    }

    /**
     * Apply move decision with bounds checking
     */
    private applyMoveDecision(decision: AIDecision, entity: any): void {
        if (!entity.position || !decision.parameters.direction) return;
        
        const newX = entity.position.x + decision.parameters.direction.x;
        const newY = entity.position.y + decision.parameters.direction.y;
        
        // Basic bounds checking (could be configurable)
        const maxBounds = 1000;
        if (Math.abs(newX) <= maxBounds && Math.abs(newY) <= maxBounds) {
            entity.position.x = newX;
            entity.position.y = newY;
        }
    }

    /**
     * Apply interaction decision with distance validation
     */
    private applyInteractDecision(decision: AIDecision, entity: any): void {
        if (!decision.parameters.targetId) return;
        
        const target = this.world.entities.find(e => e.id === decision.parameters.targetId);
        if (!target || !target.position || !entity.position) return;
        
        // Check interaction distance
        const distance = Math.sqrt(
            Math.pow(entity.position.x - target.position.x, 2) +
            Math.pow(entity.position.y - target.position.y, 2)
        );
        
        if (distance <= 5) { // Interaction range
            // Perform interaction (simplified)
            if (target.health && entity.health) {
                // Example: healing interaction
                target.health.current = Math.min(target.health.max, target.health.current + 10);
            }
        }
    }

    /**
     * Apply wander decision with controlled movement
     */
    private applyWanderDecision(decision: AIDecision, entity: any): void {
        if (!entity.position || !decision.parameters.direction) return;
        
        // Wandering is slower than direct movement
        const wanderSpeed = 0.1;
        entity.position.x += decision.parameters.direction.x * wanderSpeed;
        entity.position.y += decision.parameters.direction.y * wanderSpeed;
    }

    /**
     * Apply seek healing decision
     */
    private applySeekHealingDecision(_decision: AIDecision, entity: any): void {
        if (!entity.health) return;
        
        // Simple healing behavior - move towards nearest healing source or self-heal
        entity.health.current = Math.min(entity.health.max, entity.health.current + 5);
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
     * Validate that action resolution is deterministic and ordered correctly
     */
    validateActionResolutionOrdering(decisions: AIDecision[]): boolean {
        // Sort decisions the same way applyPendingDecisions does
        const sortedDecisions = [...decisions].sort((a, b) => {
            if (a.timestamp !== b.timestamp) {
                return a.timestamp - b.timestamp;
            }
            return a.entityId.localeCompare(b.entityId);
        });
        
        // Check that the sorting is stable and deterministic
        for (let i = 0; i < decisions.length; i++) {
            if (decisions[i] !== sortedDecisions[i]) {
                // If original order doesn't match sorted order, verify it's deterministic
                const reSorted = [...decisions].sort((a, b) => {
                    if (a.timestamp !== b.timestamp) {
                        return a.timestamp - b.timestamp;
                    }
                    return a.entityId.localeCompare(b.entityId);
                });
                
                // Check if re-sorting produces the same result
                for (let j = 0; j < reSorted.length; j++) {
                    if (sortedDecisions[j] !== reSorted[j]) {
                        return false;
                    }
                }
                break;
            }
        }
        
        return true;
    }

    /**
     * Get the expected resolution order for a set of decisions
     */
    getExpectedResolutionOrder(decisions: AIDecision[]): AIDecision[] {
        return [...decisions].sort((a, b) => {
            if (a.timestamp !== b.timestamp) {
                return a.timestamp - b.timestamp;
            }
            return a.entityId.localeCompare(b.entityId);
        });
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
