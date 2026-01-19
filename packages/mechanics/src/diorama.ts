export enum TileType {
    Floor = 'floor',
    Wall = 'wall',
    Gap = 'gap', // For floating island effect
    Stairs = 'stairs'
}

export interface Tile {
    x: number;
    y: number;
    height: number; // Vertical steps (0, 1, 2...)
    type: TileType;
}

export interface Prop {
    id: string; // ID from Registry
    x: number;
    y: number;
    z: number; // Height
    rotation: number; // 0, 90, 180, 270
}

export interface Exit {
    x: number;
    y: number;
    z: number;
    targetDioramaId?: string; // Where this leads (if generated)
}

export interface Diorama {
    id: string;
    width: number;
    depth: number;
    tiles: Tile[][]; // 2D grid [y][x]
    props: Prop[];
    exits: Exit[];
}
