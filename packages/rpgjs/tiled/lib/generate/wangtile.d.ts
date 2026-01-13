import builder from 'xmlbuilder';
import { Tileset } from './tileset';
export declare class Autotile extends Tileset {
    private nbGroupTilesWidth;
    private nbGroupTilesHeight;
    private nbAnimation;
    static readonly HEIGHT_TILES: number;
    static readonly WIDTH_TILES: number;
    constructor(nbGroupTilesWidth: number, nbGroupTilesHeight: number, nbAnimation?: number);
    static getWangTiles(id: number): [number, number, number, number, number, number, number, number][];
    static getRandomColor(): string;
    get hasAnimation(): boolean;
    getIndex(x: number, y: number): number;
    generate(attr: {
        root: any;
        image: any;
        tile: any;
    }): builder.XMLElement;
    generateAnimationTile(tileId: number): builder.XMLElement;
    generateWangTiles(tileId?: number, name?: string): builder.XMLElement;
}
