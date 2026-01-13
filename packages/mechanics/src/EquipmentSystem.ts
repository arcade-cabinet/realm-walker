import { Registry } from './Registry';
import { isValidSlot, SlotType } from './slots';

export class EquipmentSystem {
    constructor(private registry: Registry) { }

    canEquip(itemId: string, slot: SlotType): boolean {
        const item = this.registry.getItem(itemId);
        if (!item) throw new Error(`Item ${itemId} not found`);

        return isValidSlot(item, slot);
    }

    calculateStats(classId: string, equipmentIds: string[]) {
        const classDef = this.registry.getClass(classId);
        if (!classDef) throw new Error(`Class ${classId} not found`);

        // Clone base stats
        const stats = { ...classDef.stats };

        for (const itemId of equipmentIds) {
            const item = this.registry.getItem(itemId);
            if (item) {
                // Simple modifier application (placeholder for complex logic)
                if (item.hpValue) stats.hp = (stats.hp || 0) + item.hpValue;
                // Add more stat modifiers here as our schema evolves
            }
        }

        return stats;
    }
}
