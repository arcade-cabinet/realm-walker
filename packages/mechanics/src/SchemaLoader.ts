import { RpgBestiarySchema, RpgClassSchema, RpgItemSchema } from '@realm-walker/shared';
import * as z from 'zod';
import { Registry } from './Registry';

// Types derived from our shared schema
type ClassData = z.infer<typeof RpgClassSchema>;
type ItemData = z.infer<typeof RpgItemSchema>;
type BestiaryData = z.infer<typeof RpgBestiarySchema>;

export class SchemaLoader {
    constructor(private database: Registry) { }

    loadClasses(classes: ClassData[]) {
        for (const cls of classes) {
            console.log(`Loading Class: ${cls.name}`);
            this.database.addClass(cls);
        }
    }

    loadItems(items: ItemData[]) {
        for (const item of items) {
            console.log(`Loading Item: ${item.name}`);
            this.database.addItem(item);
        }
    }

    loadBestiary(monsters: BestiaryData[]) {
        for (const monster of monsters) {
            console.log(`Loading Monster: ${monster.name}`);
            this.database.addMonster(monster);
        }
    }

    loadRealm(realmData: any) {
        if (realmData.classes) this.loadClasses(realmData.classes);
        if (realmData.items) this.loadItems(realmData.items);
        if (realmData.bestiary) this.loadBestiary(realmData.bestiary);
    }
}
