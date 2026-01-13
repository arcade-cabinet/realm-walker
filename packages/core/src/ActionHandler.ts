import { Action, ActionType } from '@realm-walker/shared';
import { Entity, World } from './World';

export class ActionHandler {
    constructor(private world: World) { }

    execute(agentId: string, action: Action): { success: boolean; message: string } {
        const entities = this.world.with('id');
        let agent: Entity | undefined;

        for (const e of entities) {
            if (e.id === agentId) {
                agent = e;
                break;
            }
        }

        if (!agent) {
            return { success: false, message: `Agent ${agentId} not found` };
        }

        // Initialize log if missing
        if (!agent.log) agent.log = [];

        try {
            switch (action.type) {
                case ActionType.MOVE:
                    // Simple teleport for now, or velocity change
                    // In a real system, this would set a target for the Steering Behavior
                    if (!agent.position) {
                        throw new Error("Agent has no position");
                    }
                    agent.position.x = action.target.x;
                    agent.position.y = action.target.y;
                    this.log(agent, `Moved to (${action.target.x}, ${action.target.y})`);
                    break;

                case ActionType.WAIT:
                    this.log(agent, `Waited for ${action.turns} turns`);
                    break;

                case ActionType.EQUIP_ITEM:
                    // Need checks in Mechanics, but for core just set the state
                    if (!agent.equipment) agent.equipment = {};
                    agent.equipment[action.slot] = action.itemId;
                    this.log(agent, `Equipped ${action.itemId} to ${action.slot}`);
                    break;

                case ActionType.ATTACK: {
                    let target: Entity | undefined;
                    for (const e of entities) {
                        if (e.id === action.targetId) {
                            target = e;
                            break;
                        }
                    }

                    if (!target) {
                        this.log(agent, "Target not found!");
                        return { success: false, message: "Target not found" };
                    }

                    // Deterministic Dice Roll
                    const hitRoll = this.world.rng.int(1, 20); // D20
                    // Basic stats: Assume 10 base + STR mod (0 for now)
                    const hitChance = 10;

                    if (hitRoll >= hitChance) {
                        const damage = this.world.rng.int(1, 6); // D6 Damage
                        target.stats = target.stats || { hp: 10, maxHp: 10 };
                        target.stats.hp -= damage;
                        this.log(agent, `Attacked ${target.name} for ${damage} damage! (Roll: ${hitRoll})`);
                        if (target.stats.hp <= 0) {
                            this.log(agent, `${target.name} was defeated!`);
                            // In a real system, remove entity or set 'dead' state
                        }
                    } else {
                        this.log(agent, `Missed ${target.name}! (Roll: ${hitRoll})`);
                    }
                    break;
                }

                case ActionType.HEADLESS_CONSUME:
                    // Simplistic consume logic
                    this.log(agent, `Consumed ${action.itemId}. Healed 10 HP.`);
                    if (agent.stats) agent.stats.hp = Math.min(agent.stats.hp + 10, agent.stats.maxHp || 100);
                    break;

                default:
                    this.log(agent, `Performed unknown action: ${action.type}`);
                    return { success: false, message: `Unknown action ${action.type}` };
            }

            return { success: true, message: "Action executed" };

        } catch (e: any) {
            this.log(agent, `Action failed: ${e.message}`);
            return { success: false, message: e.message };
        }
    }

    private log(agent: Entity, message: string) {
        agent.log.push(message);
        // Keep log size manageable
        if (agent.log.length > 10) agent.log.shift();
    }
}
