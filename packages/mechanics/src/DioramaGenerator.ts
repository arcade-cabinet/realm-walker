import { Prng } from '@realm-walker/shared';
import { Diorama, Tile, TileType } from './diorama';

export class DioramaGenerator {
    private prng: Prng;

    constructor(seed: string) {
        this.prng = new Prng(seed);
    }

    generate(id: string, width: number = 12, depth: number = 12): Diorama {
        const tiles: Tile[][] = [];
        const props: any[] = []; // Props logic to come later
        const exits: any[] = [];

        // 1. Initialize empty grid (Gap)
        for (let y = 0; y < depth; y++) {
            const row: Tile[] = [];
            for (let x = 0; x < width; x++) {
                row.push({ x, y, height: 0, type: TileType.Gap });
            }
            tiles.push(row);
        }

        // 2. Create a basic "Island" shape (Circle-ish)
        const centerX = width / 2;
        const centerY = depth / 2;
        const radius = Math.min(width, depth) / 2 - 1;

        for (let y = 0; y < depth; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist <= radius) {
                    tiles[y][x].type = TileType.Floor;
                    // Add some noise to height?
                    // tiles[y][x].height = this.prng.next() > 0.8 ? 1 : 0;
                }
            }
        }

        // 3. Add a single Exit at the edge
        exits.push({
            x: Math.floor(centerX),
            y: Math.floor(centerY + radius - 1),
            z: 0
        });

        return {
            id,
            width,
            depth,
            tiles,
            props,
            exits
        };
    }
}
