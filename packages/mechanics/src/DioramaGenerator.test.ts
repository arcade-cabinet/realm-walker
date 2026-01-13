import { describe, expect, it } from 'vitest';
import { DioramaGenerator } from './DioramaGenerator';
import { TileType } from './diorama';

describe('DioramaGenerator', () => {
    const generator = new DioramaGenerator('test-seed-123');
    const diorama = generator.generate('test-room', 12, 12);

    it('should generate a grid of correct size', () => {
        expect(diorama.tiles.length).toBe(12);
        expect(diorama.tiles[0].length).toBe(12);
    });

    it('should have a central floor area (Island)', () => {
        // Center should be floor
        expect(diorama.tiles[6][6].type).toBe(TileType.Floor);
    });

    it('should have gaps at corners (Island shape)', () => {
        // 0,0 is usually outside the circle radius for a 12x12
        expect(diorama.tiles[0][0].type).toBe(TileType.Gap);
    });

    it('should have at least one exit', () => {
        expect(diorama.exits.length).toBeGreaterThan(0);
    });
});
