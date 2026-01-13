import { TiledProperties } from "./Properties";
export declare class TileGid extends TiledProperties {
    obj?: any;
    private _gid;
    constructor(obj?: any);
    static getRealGid(gid: number): number;
    get horizontalFlip(): boolean;
    get verticalFlip(): boolean;
    get diagonalFlip(): boolean;
    get rotatedHex120(): boolean;
    get gid(): number;
    set gid(val: number);
}
