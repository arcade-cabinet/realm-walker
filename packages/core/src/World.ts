import { Prng } from '@realm-walker/shared';
import { World as MiniplexWorld } from 'miniplex';

// Basic entity type - flexible for now, will grow as we add components
// We deliberately keep this loose to allow dynamic component addition
export type Entity = {
    id: string;
    [key: string]: any;
};

// Serializable world state for deterministic replay
export interface WorldState {
    seed: string;
    entities: Entity[];
    rngState: string;
    metadata: {
        createdAt: number;
        entityCount: number;
        version: string;
    };
}

// Miniplex requires an interface that indexed by string, so we ensure Entity is compatible
export class World extends MiniplexWorld<Entity> {
    public rng: Prng;
    private seed: string;

    constructor(seed = 'default-seed') {
        super();
        this.seed = seed;
        this.rng = new Prng(seed);
        console.log(`🌌 Core ECS World initialized with seed: "${seed}"`);
    }

    // Helper to quickly create an entity with an ID
    create(components: Partial<Entity> = {}): Entity {
        // We use a deterministic ID generator if none provided
        // This ensures replays work exactly the same
        const id = components.id || `entity_${this.rng.next().toString(36).substr(2, 9)}`;

        const entity = {
            id,
            ...components
        };
        this.add(entity);
        return entity;
    }

    // Serialize complete world state for deterministic replay
    serialize(): WorldState {
        return {
            seed: this.seed,
            entities: this.entities.map(entity => ({ ...entity })), // Deep copy entities
            rngState: this.rng.getState(),
            metadata: {
                createdAt: Date.now(),
                entityCount: this.entities.length,
                version: '1.0.0'
            }
        };
    }

    // Deserialize world state from serialized data
    static deserialize(state: WorldState): World {
        const world = new World(state.seed);
        
        // Restore RNG state
        world.rng.setState(state.rngState);
        
        // Clear any existing entities
        world.clear();
        
        // Restore entities
        for (const entityData of state.entities) {
            const entity = { ...entityData };
            world.add(entity);
        }
        
        return world;
    }

    // Validate serialization integrity
    validateSerialization(): boolean {
        try {
            const serialized = this.serialize();
            const deserialized = World.deserialize(serialized);
            
            // Check entity count
            if (this.entities.length !== deserialized.entities.length) {
                return false;
            }
            
            // Check entity data integrity
            for (let i = 0; i < this.entities.length; i++) {
                const original = this.entities[i];
                const restored = deserialized.entities[i];
                
                if (original.id !== restored.id) {
                    return false;
                }
                
                // Check all properties match
                for (const [key, value] of Object.entries(original)) {
                    if (restored[key] !== value) {
                        return false;
                    }
                }
            }
            
            return true;
        } catch (error) {
            return false;
        }
    }
}

// Global world instance for convenience, defaulting to a fixed seed for development
export const world = new World("dev-seed");

// Helper for standalone creation (Contract requirement)
export const createEntity = (components: Partial<Entity> = {}) => world.create(components);
