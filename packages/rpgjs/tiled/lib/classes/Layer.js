import { TileGid } from "./Gid";
import { TiledObjectClass } from "./Object";
import { TiledProperties } from "./Properties";
import { Tile } from "./Tile";
export class Layer extends TiledProperties {
    get size() {
        return this.data.length;
    }
    constructor(layer, tilesets, parent) {
        super(layer);
        this.tilesets = tilesets;
        this.parent = parent;
        this.cacheTiles = false;
        this.tiles = [];
        Object.assign(this, layer);
        this.mapObjects();
        this.mergePropertiesWithParent();
        // Caching tiles saves CPU but consumes RAM for large maps
        this.cacheTiles = this.getProperty('cache-tiles', false);
        if (this.cacheTiles)
            this.propertiesTiles();
    }
    createTile(gid, tileIndex, layerIndex) {
        if (gid == 0) {
            return;
        }
        const realGid = TileGid.getRealGid(gid);
        const tileset = Layer.findTileSet(realGid, this.tilesets);
        if (!tileset) {
            return undefined;
        }
        const tile = tileset.getTile(realGid - tileset.firstgid);
        if (tile) {
            return new Tile({
                ...tile.tile,
                gid,
                index: tileIndex,
                layerIndex
            });
        }
        return new Tile({
            gid,
            index: tileIndex,
            layerIndex
        });
    }
    mergePropertiesWithParent() {
        const parent = this.getLayerParent();
        if (!this.properties)
            this.properties = {};
        if (!parent)
            return;
        for (let key in parent.properties) {
            const val = parent.properties[key];
            const valChild = this.properties[key];
            if (valChild === undefined) {
                this.properties[key] = val;
            }
            else {
                if (key == 'z') {
                    this.properties[key] += val;
                }
                else {
                    continue;
                }
            }
        }
        this.opacity = Math.round((parent.opacity ?? 1) * (this.opacity ?? 1) * 100) / 100;
        this.offsetx = (parent.offsetx ?? 0) + (this.offsetx ?? 0);
        this.offsety = (parent.offsety ?? 0) + (this.offsety ?? 0);
        this.locked = parent.locked ?? false;
    }
    propertiesTiles() {
        if (!this.data)
            return;
        const data = this.data;
        for (let i = 0; i < data.length; i++) {
            const id = data[i];
            this.tiles.push(this.createTile(id, i));
        }
    }
    mapObjects() {
        if (this.objects) {
            this.objects = this.objects.map(object => {
                const obj = new TiledObjectClass(object);
                obj.layerName = this.name;
                return obj;
            });
        }
    }
    getTileByIndex(tileIndex) {
        if (this.cacheTiles) {
            return this.tiles[tileIndex];
        }
        return this.createTile(this.data[tileIndex], tileIndex);
    }
    static findTileSet(gid, tileSets) {
        let tileset;
        for (let i = tileSets.length - 1; i >= 0; i--) {
            tileset = tileSets[i];
            if (tileset.firstgid && tileset.firstgid <= gid) {
                break;
            }
        }
        return tileset;
    }
    getLayerParent() {
        return this.parent;
    }
    tilesForEach(cb) {
        for (let i = 0; i < this.data.length; i++) {
            if (this.cacheTiles) {
                cb(this.tiles[i], i);
                continue;
            }
            cb(this.createTile(this.data[i], i), i);
        }
    }
    setData(tileIndex, gid) {
        this.data[tileIndex] = gid;
    }
}
//# sourceMappingURL=Layer.js.map