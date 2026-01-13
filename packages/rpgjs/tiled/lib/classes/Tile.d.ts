import { TilesetTile } from "../types/Tile";
import { TileGid } from "./Gid";
type TileInfo = TilesetTile & {
    gid?: number;
    index: number;
    layerIndex?: number;
};
export declare class Tile extends TileGid {
    tile: TileInfo | {
        gid: number;
    };
    index: number;
    constructor(tile: TileInfo | {
        gid: number;
    });
}
export interface Tile extends TileInfo {
}
export {};
