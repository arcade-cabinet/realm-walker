import { describe, expect, it } from 'vitest';
import { EquipmentSystem } from './EquipmentSystem';
import { Registry } from './Registry';
import { SlotType } from './slots';

describe('EquipmentSystem - Slots', () => {
    const registry = new Registry();
    const system = new EquipmentSystem(registry);

    // Setup Test Data
    registry.addItem({
        id: 'iron-sword',
        name: 'Iron Sword',
        description: 'Basic sword',
        type: 'weapon'
    });

    registry.addItem({
        id: 'leather-armor',
        name: 'Leather Armor',
        description: 'Basic armor',
        type: 'armor'
    });

    it('should allow equipping a weapon to Main Hand', () => {
        expect(system.canEquip('iron-sword', SlotType.MainHand)).toBe(true);
    });

    it('should allow equipping a weapon to Off Hand (dual wield)', () => {
        expect(system.canEquip('iron-sword', SlotType.OffHand)).toBe(true);
    });

    it('should NOT allow equipping armor to Main Hand', () => {
        expect(system.canEquip('leather-armor', SlotType.MainHand)).toBe(false);
    });

    it('should allow equipping armor to Body', () => {
        expect(system.canEquip('leather-armor', SlotType.Body)).toBe(true);
    });

    it('should throw error for non-existent item', () => {
        expect(() => system.canEquip('ghost-item', SlotType.Head)).toThrow();
    });
});
