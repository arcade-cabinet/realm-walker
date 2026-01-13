import { Action, ActionSchema, GameStateView } from '@realm-walker/shared';
import { GenAIWrapper } from './index';

export class PlayerDriver {
    constructor(private genai: GenAIWrapper) { }

    async decide(state: GameStateView): Promise<Action> {
        const prompt = `
            You are playing RealmWalker. 
            Roleplay as an adventurer. Your goal is to explore, survive, and equip better gear.

            CURRENT STATE:
            ${JSON.stringify(state, null, 2)}

            AVAILABLE ACTIONS (JSON Format):
            - MOVE: { "type": "MOVE", "target": { "x": number, "y": number } }
            - WAIT: { "type": "WAIT", "turns": number }
            - EQUIP: { "type": "EQUIP_ITEM", "itemId": "string", "slot": "string" }
            - ATTACK: { "type": "ATTACK", "targetId": "string" }

            INSTRUCTIONS:
            1. Analyze the Surroundings. Is there loot? Enemies?
            2. Check your Status. Low HP? 
            3. OUTPUT a valid JSON Action object conforming to the schema.
            4. Do not output markdown code blocks, just the raw JSON string.
        `;

        try {
            // Using a high temperature for creativity, or low for strict play?
            // Flash 1.5 is good with 1.0
            const responseText = await this.genai.generateContent(prompt);

            // Clean up potentially messy output
            const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

            const json = JSON.parse(cleaned);

            // Validate against schema
            const action = ActionSchema.parse(json);

            return action;

        } catch (error) {
            console.error("PlayerDriver Decision Failed:", error);
            // Fallback action
            return { type: 'WAIT', turns: 1 };
        }
    }
}
