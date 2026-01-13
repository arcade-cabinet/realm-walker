import { RpgBestiary } from '@realm-walker/shared';
import { ClassOptions, ItemOptions } from './rpg-types';

export class Registry {
    private classes: Map<string, ClassOptions> = new Map();
    private items: Map<string, ItemOptions> = new Map();
    private bestiary: Map<string, RpgBestiary> = new Map();

    addClass(cls: ClassOptions) {
        if (!cls.id) throw new Error('Class must have an ID');
        this.classes.set(cls.id, cls);
    }

    addItem(item: ItemOptions) {
        if (!item.id) throw new Error('Item must have an ID');
        this.items.set(item.id, item);
    }

    addMonster(monster: RpgBestiary) {
        if (!monster.id) throw new Error('Monster must have an ID');
        this.bestiary.set(monster.id, monster);
    }

    getClass(id: string): ClassOptions | undefined {
        return this.classes.get(id);
    }

    getItem(id: string): ItemOptions | undefined {
        return this.items.get(id);
    }

    getMonster(id: string): RpgBestiary | undefined {
        return this.bestiary.get(id);
    }
}

export const db = new Registry();
