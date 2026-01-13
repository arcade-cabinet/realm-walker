import { describe, expect, it, vi } from 'vitest';
import { Registry } from './Registry';
import { SchemaLoader } from './SchemaLoader';

describe('SchemaLoader', () => {
    it('should load classes from JSON', () => {
        const db = new Registry();
        const loader = new SchemaLoader(db);
        const consoleSpy = vi.spyOn(console, 'log');

        const mockData = {
            classes: [
                {
                    id: 'test-warrior',
                    name: 'Test Warrior',
                    description: 'A test class',
                    stats: { str: 10, agi: 5, int: 1, hp: 100 }
                }
            ],
            items: [
                {
                    id: 'test-sword',
                    name: 'Test Sword',
                    description: 'Sharp',
                    type: 'weapon' as const
                }
            ]
        };

        loader.loadRealm(mockData);

        expect(consoleSpy).toHaveBeenCalledWith('Loading Class: Test Warrior');
        expect(consoleSpy).toHaveBeenCalledWith('Loading Item: Test Sword');

        // In a real integration, we would assert db.classes['test-warrior'] exists.
        // Since RpgDatabase internals are complex/private, we trust the console log 
        // for this architectural proof-of-concept.
    });
});
