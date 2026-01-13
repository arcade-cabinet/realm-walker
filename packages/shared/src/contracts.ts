// Defines the vocabulary of actions the AI (or Human) can take
import { z } from 'zod';

export const ActionType = {
    MOVE: 'MOVE',
    WAIT: 'WAIT',
    USE_ITEM: 'USE_ITEM',
    HEADLESS_CONSUME: 'CONSUME', // Explicitly different to avoid ambiguity
    EQUIP_ITEM: 'EQUIP_ITEM',
    ATTACK: 'ATTACK'
} as const;

export const ActionSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal(ActionType.MOVE),
        target: z.object({ x: z.number(), y: z.number() })
    }),
    z.object({
        type: z.literal(ActionType.WAIT),
        turns: z.number().default(1)
    }),
    z.object({
        type: z.literal(ActionType.USE_ITEM),
        itemId: z.string()
    }),
    z.object({
        type: z.literal(ActionType.EQUIP_ITEM),
        itemId: z.string(),
        slot: z.string() // Should match SlotType enum
    }),
    z.object({
        type: z.literal(ActionType.HEADLESS_CONSUME),
        itemId: z.string()
    }),
    z.object({
        type: z.literal(ActionType.ATTACK),
        targetId: z.string()
    })
]);

export type Action = z.infer<typeof ActionSchema>;

// Defines what the AI "sees"
export interface GameStateView {
    tick: number;
    global: {
        timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
        lightLevel: number; // 0.0 to 1.0
    };
    agent: {
        id: string;
        hp: number;
        position: { x: number, y: number };
        inventory: string[]; // List of Item Names for simplicity
        equipment: Record<string, string>; // Slot -> Item Name
    };
    surroundings: {
        id: string;
        name: string;
        type: 'enemy' | 'item' | 'npc';
        position: { x: number, y: number };
        distance: number;
    }[];
    log: string[]; // Last N messages ("You hit the goblin for 5 damage")
}
