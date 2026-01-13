import { Entity, World } from '@realm-walker/core';
import { EntityManager, GameEntity } from 'yuka';

// ECS Component that holds the reference to the Yuka agent
export type BrainComponent = {
    agent: GameEntity;
};

// System to update Yuka entities
// Note: We don't extend a class, we just export a function or a class that manages the system state
export class AISystem {
    private entityManager: EntityManager;

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
        this.entityManager.update(dt);

        // Sync Yuka transforms back to ECS components if needed (e.g. for creating a 'transform' component for rendering)
        // This depends on whether Yuka or ECS is the source of truth for position. 
        // In this architecture, Yuka drives the position of agents.
        for (const _entity of this.world.with('brain', 'position')) {
            // const agent = entity.brain.agent;
            // We assume the entity has a position component that matches the core structure
            // entity.position.copy(agent.position); 
            // For now, we leave this sync logic up to specific implementations or a separate SyncSystem
        }
    }
}
