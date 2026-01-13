import { Action, ActionSchema, GameStateView } from '@realm-walker/shared';
import { GeminiAdapter } from './GeminiAdapter.js';

/**
 * The PlayerDriver translates game state into AI-driven actions.
 * It acts as the "Player Brain" in the simulation loop.
 */
export class PlayerDriver {
    private adapter: GeminiAdapter;

    constructor(apiKey?: string) {
        this.adapter = new GeminiAdapter(apiKey);
    }

    /**
     * Decides the next action for a player agent based on their current view of the world.
     */
    async decide(state: GameStateView): Promise<Action> {
        const prompt = `
            You are playing RealmWalker. 
            Roleplay as an adventurer. Your goal is to explore, survive, and equip better gear.

            CURRENT STATE:
            ${JSON.stringify(state, null, 2)}

            INSTRUCTIONS:
            1. Analyze the Surroundings. Is there loot? Enemies?
            2. Check your Status. Low HP? 
            3. OUTPUT a valid JSON Action object conforming to the schema.
        `;

        try {
            // Use GeminiAdapter for structured validation and retries
            const action = await this.adapter.generate<Action>(prompt, {
                schema: ActionSchema as any,
                temperature: 1.0 // Higher temperature for more "roleplay" style decisions
            });

            return action;

        } catch (error) {
            console.error("PlayerDriver Decision Failed (Falling back to WAIT):", error);
            // Fallback action to keep the simulation loop alive
            return { type: 'WAIT', turns: 1 };
        }
    }
}
