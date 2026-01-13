import { TiledProperties } from "./Properties";
const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
const FLIPPED_VERTICALLY_FLAG = 0x40000000;
const FLIPPED_DIAGONALLY_FLAG = 0x20000000;
const ROTATED_HEXAGONAL_120_FLAG = 0x10000000;
export class TileGid extends TiledProperties {
    constructor(obj) {
        super(obj);
        this.obj = obj;
        this._gid = obj?.gid;
    }
    static getRealGid(gid) {
        return gid & ~(FLIPPED_HORIZONTALLY_FLAG |
            FLIPPED_VERTICALLY_FLAG |
            FLIPPED_DIAGONALLY_FLAG |
            ROTATED_HEXAGONAL_120_FLAG);
    }
    get horizontalFlip() {
        return !!(this._gid & FLIPPED_HORIZONTALLY_FLAG);
    }
    get verticalFlip() {
        return !!(this._gid & FLIPPED_VERTICALLY_FLAG);
    }
    get diagonalFlip() {
        return !!(this._gid & FLIPPED_DIAGONALLY_FLAG);
    }
    get rotatedHex120() {
        return !!(this._gid & ROTATED_HEXAGONAL_120_FLAG);
    }
    get gid() {
        return TileGid.getRealGid(this._gid);
    }
    set gid(val) {
        this._gid = val;
    }
}
//# sourceMappingURL=Gid.js.map