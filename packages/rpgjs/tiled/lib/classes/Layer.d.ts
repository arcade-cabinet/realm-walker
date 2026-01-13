import { TiledLayer } from "../types/Layer";
import { TiledObjectClass } from "./Object";
import { TiledProperties } from "./Properties";
import { Tile } from "./Tile";
import { Tileset } from "./Tileset";
export declare class Layer extends TiledProperties {
    private tilesets;
    private parent?;
    cacheTiles: boolean;
    tiles: (Tile | undefined)[];
    objects: TiledObjectClass[];
    get size(): number;
    constructor(layer: TiledLayer, tilesets: Tileset[], parent?: Layer | undefined);
    createTile(gid: number, tileIndex: number, layerIndex?: number): Tile | undefined;
    private mergePropertiesWithParent;
    private propertiesTiles;
    private mapObjects;
    getTileByIndex(tileIndex: number): Tile | undefined;
    static findTileSet(gid: number, tileSets: Tileset[]): Tileset | undefined;
    getLayerParent(): Layer | undefined;
    tilesForEach(cb: (tile: Tile | undefined, index: number) => void): void;
    setData(tileIndex: number, gid: number): void;
}
export interface Layer extends TiledLayer {
    objects: TiledObjectClass[];
}
