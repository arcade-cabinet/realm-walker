import { describe, expect, it } from 'vitest';
import { EquipmentSystem } from './EquipmentSystem';
import { Registry } from './Registry';

describe('EquipmentSystem', () => {
    it('should modify stats when item is equipped', () => {
        const registry = new Registry();

        // 1. Define Rules
        registry.addClass({
            id: 'warrior',
            name: 'Warrior',
            stats: { hp: 100, str: 10, agi: 5, int: 0 }
        });

        registry.addItem({
            id: 'magic-shield',
            name: 'Magic Shield',
            description: 'Adds HP',
            hpValue: 50,
            type: 'armor'
        });

        // 2. Execute Logic
        const system = new EquipmentSystem(registry);
        const stats = system.calculateStats('warrior', ['magic-shield']);

        // 3. Verify Outcome
        expect(stats.hp).toBe(150); // 100 base + 50 item
        expect(stats.str).toBe(10); // Unchanged
    });
});
