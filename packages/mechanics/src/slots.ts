import { ItemOptions } from './rpg-types';

export enum SlotType {
    MainHand = 'main_hand',
    OffHand = 'off_hand',
    Head = 'head',
    Body = 'body',
    Accessory = 'accessory'
}

// Mapping between Item 'type' (from RPG-JS or custom) and valid Slots
// RPG-JS 'type' is often just 'weapon', 'armor', 'item'. We might need more granular types or properties.
export const SLOT_RULES: Record<string, SlotType[]> = {
    'weapon': [SlotType.MainHand, SlotType.OffHand],
    'armor': [SlotType.Body],
    'shield': [SlotType.OffHand],
    'helmet': [SlotType.Head],
    'accessory': [SlotType.Accessory]
};

export function isValidSlot(item: ItemOptions, slot: SlotType): boolean {
    if (!item.type) return false;

    // Check if the item's type allows this slot
    const allowedSlots = SLOT_RULES[item.type];
    return allowedSlots ? allowedSlots.includes(slot) : false;
}
