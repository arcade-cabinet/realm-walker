import { GameStateView } from '@realm-walker/shared';
import { Entity, World } from './World';

export class GameStateSerializer {
    constructor(private world: World) { }

    serialize(agentId: string, tick: number): GameStateView {
        // Find the agent entity
        const entities = this.world.with('id');
        let agent: Entity | undefined;

        for (const e of entities) {
            if (e.id === agentId) {
                agent = e;
                break;
            }
        }

        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }

        // naive implementation for now
        // In a real scenario, we'd filter by distance (Standard "Vision" component)
        const surroundings: GameStateView['surroundings'] = [];

        for (const e of entities) {
            if (e.id === agentId) continue;

            // Simple distance check
            if (e.position) {
                const dist = Math.sqrt(
                    Math.pow(e.position.x - agent.position.x, 2) +
                    Math.pow(e.position.y - agent.position.y, 2)
                );

                // If within vision range (lets say 20 units)
                if (dist < 20) {
                    surroundings.push({
                        id: e.id,
                        name: e.name || 'Unknown',
                        type: e.type || 'item', // Default to item for now
                        position: { x: e.position.x, y: e.position.y },
                        distance: dist
                    });
                }
            }
        }

        // Calculate Time of Day based on tick (Simple day/night cycle)
        // Assume 100 ticks = 1 full day for simplicity in testing
        const cycle = tick % 100;
        let timeOfDay: GameStateView['global']['timeOfDay'] = 'day';
        let lightLevel = 1.0;

        if (cycle < 25) { timeOfDay = 'dawn'; lightLevel = 0.5; }
        else if (cycle < 50) { timeOfDay = 'day'; lightLevel = 1.0; }
        else if (cycle < 75) { timeOfDay = 'dusk'; lightLevel = 0.5; }
        else { timeOfDay = 'night'; lightLevel = 0.2; }

        return {
            tick,
            global: {
                timeOfDay,
                lightLevel
            },
            agent: {
                id: agent.id,
                hp: agent.stats?.hp || 100, // Default to 100 if missing
                position: { x: agent.position.x, y: agent.position.y },
                inventory: agent.inventory || [],
                equipment: agent.equipment || {}
            },
            surroundings,
            log: agent.log || [] // Agent memory/log
        };
    }
}
