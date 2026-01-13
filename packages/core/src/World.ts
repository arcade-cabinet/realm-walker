import { Prng } from '@realm-walker/shared';
import { World as MiniplexWorld } from 'miniplex';

// Basic entity type - flexible for now, will grow as we add components
// We deliberately keep this loose to allow dynamic component addition
export type Entity = {
    id: string;
    [key: string]: any;
};

// Miniplex requires an interface that indexed by string, so we ensure Entity is compatible
export class World extends MiniplexWorld<Entity> {
    public rng: Prng;

    constructor(seed = 'default-seed') {
        super();
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
}

// Global world instance for convenience, defaulting to a fixed seed for development
export const world = new World("dev-seed");

// Helper for standalone creation (Contract requirement)
export const createEntity = (components: Partial<Entity> = {}) => world.create(components);
