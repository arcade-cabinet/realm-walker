import { TiledProperties } from "./Properties";
import { Tile } from "./Tile";
export class Tileset extends TiledProperties {
    constructor(tileset) {
        super(tileset);
        this.tileset = tileset;
        this.cacheTileId = new Map();
        Object.assign(this, tileset);
        this.margin = this.margin ?? 0;
        this.spacing = this.spacing ?? 0;
        for (let tile of tileset.tiles) {
            this.addTile(tile);
        }
        Reflect.deleteProperty(this, 'tiles');
    }
    addTile(tileObj) {
        const tile = new Tile(tileObj);
        this.cacheTileId.set(tile.id, tile);
        return tile;
    }
    getTile(id) {
        return this.cacheTileId.get(+id);
    }
}
//# sourceMappingURL=Tileset.js.map