import { GameEntity } from 'yuka';

export interface SerializedGameState {
    entities: Array<{
        id: string;
        components: Record<string, any>;
    }>;
    worldState: {
        seed: string;
        tick: number;
        metadata: Record<string, any>;
    };
}

export interface AIDecision {
    type: string;
    entityId: string;
    parameters: Record<string, any>;
    timestamp: number;
}

export class Agent extends GameEntity {
    private lastDecisionState: string | null = null;
    private lastDecision: AIDecision | null = null;

    constructor() {
        super();
        // Default Yuka setup
    }

    /**
     * Make a decision based solely on serialized game state
     * This ensures decisions are reproducible and deterministic
     */
    makeDecision(serializedState: SerializedGameState): AIDecision {
        // Create a deterministic hash of the state for reproducibility checking
        const stateHash = this.hashGameState(serializedState);
        
        // If we've seen this exact state before, return the same decision
        if (this.lastDecisionState === stateHash && this.lastDecision) {
            return { ...this.lastDecision, timestamp: Date.now() };
        }

        // Make a new decision based purely on the serialized state
        const decision = this.analyzeStateAndDecide(serializedState);
        
        // Cache for reproducibility
        this.lastDecisionState = stateHash;
        this.lastDecision = decision;
        
        return decision;
    }

    /**
     * Analyze the serialized state and make a decision
     * This method should only use data from the serialized state
     */
    private analyzeStateAndDecide(state: SerializedGameState): AIDecision {
        // Find this agent's entity in the serialized state
        const agentEntity = state.entities.find(e => e.components.brain?.agentId === this.uuid);
        
        if (!agentEntity) {
            return {
                type: 'idle',
                entityId: this.uuid,
                parameters: {},
                timestamp: Date.now()
            };
        }

        // Simple decision logic based on entity state
        const position = agentEntity.components.position;
        const health = agentEntity.components.health;
        
        // Example decision logic - this would be more sophisticated in practice
        if (health && health.current < health.max * 0.5) { // Changed threshold to 50%
            return {
                type: 'seek_healing',
                entityId: agentEntity.id,
                parameters: { urgency: 'high' },
                timestamp: Date.now()
            };
        }
        
        if (position) {
            // Look for nearby entities to interact with
            const nearbyEntities = state.entities.filter(e => 
                e.id !== agentEntity.id && 
                e.components.position &&
                this.calculateDistance(position, e.components.position) < 5
            );
            
            if (nearbyEntities.length > 0) {
                return {
                    type: 'interact',
                    entityId: agentEntity.id,
                    parameters: { targetId: nearbyEntities[0].id },
                    timestamp: Date.now()
                };
            }
        }

        return {
            type: 'wander',
            entityId: agentEntity.id,
            parameters: { direction: this.getRandomDirection(state.worldState.seed) },
            timestamp: Date.now()
        };
    }

    /**
     * Create a deterministic hash of the game state
     */
    private hashGameState(state: SerializedGameState): string {
        // Simple hash implementation - in practice might use a proper hash function
        const stateString = JSON.stringify(state, Object.keys(state).sort());
        let hash = 0;
        for (let i = 0; i < stateString.length; i++) {
            const char = stateString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    /**
     * Calculate distance between two positions
     */
    private calculateDistance(pos1: any, pos2: any): number {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dz = (pos1.z || 0) - (pos2.z || 0);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * Get a deterministic random direction based on world seed
     */
    private getRandomDirection(seed: string): { x: number, y: number } {
        // Simple deterministic random based on seed
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = ((hash << 5) - hash) + seed.charCodeAt(i);
            hash = hash & hash;
        }
        
        const angle = (hash % 360) * (Math.PI / 180);
        return {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
    }

    /**
     * Validate that a decision is reproducible given the same state
     */
    validateDecisionReproducibility(state: SerializedGameState, expectedDecision: AIDecision): boolean {
        const actualDecision = this.makeDecision(state);
        
        return (
            actualDecision.type === expectedDecision.type &&
            actualDecision.entityId === expectedDecision.entityId &&
            JSON.stringify(actualDecision.parameters) === JSON.stringify(expectedDecision.parameters)
        );
    }
}
