import { TilesetTile } from "../types/Tile";
import { TiledTileset } from "../types/Tileset";
import { TiledProperties } from "./Properties";
import { Tile } from "./Tile";
export declare class Tileset extends TiledProperties {
    private tileset;
    private cacheTileId;
    constructor(tileset: TiledTileset);
    addTile(tileObj: TilesetTile): Tile;
    getTile(id: number): Tile | undefined;
}
export interface Tileset extends TiledTileset {
}
