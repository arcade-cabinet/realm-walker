import { TiledObject } from "../types/Objects";
import { TileGid } from "./Gid";
export declare class TiledObjectClass extends TileGid {
    layerName?: string;
    constructor(object?: TiledObject);
}
export interface TiledObjectClass extends TiledObject {
}
