import { TileGid } from "./Gid";
export class Tile extends TileGid {
    constructor(tile) {
        super(tile);
        this.tile = tile;
        Reflect.deleteProperty(tile, 'gid');
        Object.assign(this, tile);
    }
}
//# sourceMappingURL=Tile.js.map