import { TiledLayer } from "../types/Layer";
import { TiledMap } from "../types/Map";
import { TiledTileset } from "../types/Tileset";
import { Layer } from "./Layer";
import { TiledObjectClass } from "./Object";
import { TiledProperties } from "./Properties";
import { Tile } from "./Tile";
import { Tileset } from "./Tileset";
export interface TileInfo {
    tiles: Tile[];
    hasCollision: boolean | undefined;
    isClimbable?: boolean | undefined;
    isOverlay: boolean | undefined;
    objectGroups: TiledObjectClass[];
    tileIndex: number;
}
export interface GetTileOptions {
    populateTiles?: boolean;
}
export declare let bufferTilesets: {};
export declare class MapClass extends TiledProperties {
    /**
     * @title Data of map
     * @prop {object} [data]
     * @readonly
     * @memberof Map
     * @memberof RpgSceneMap
     * */
    data: TiledMap;
    tilesets: Tileset[];
    layers: Layer[];
    private tmpLayers;
    private tilesIndex;
    /**
     * Allows to define the size of ArrayBuffer to keep in memory the tiles of the map
     */
    private allocateMemory;
    /**
     * If set to true, the memory allocation will take only one tile (the tile of the last layer)
     */
    private lowMemory;
    constructor(map?: TiledMap);
    load(map: TiledMap): void;
    /**
     * @title Width of the map in pixels
     * @prop {number} [widthPx]
     * @readonly
     * @memberof Map
     * @memberof RpgSceneMap
     * */
    get widthPx(): number;
    /**
    * @title Height of the map in pixels
    * @prop {number} [heightPx]
    * @readonly
    * @memberof Map
    * @memberof RpgSceneMap
    * */
    get heightPx(): number;
    /**
     * @title The depth of the map in pixels (this is the height of a tile ;))
     * @prop {number} map.zTileHeight
     * @readonly
     * @memberof Map
     * @memberof RpgSceneMap
     * */
    get zTileHeight(): number;
    /**
     * Find a layer by name. Returns `undefined` is the layer is not found

     * @title Get Layer by name
     * @method map.getLayerByName(name)
     * @param {string} name layer name
     * @returns {LayerInfo | undefined}
     * @example
     *  ```ts
     *  const tiles = map.getLayerByName(0, 0)
     *  ```
     * @memberof Map
     * @memberof RpgSceneMap
     */
    getLayerByName(name: string): TiledLayer | undefined;
    /**
    * Get the tile index on the tileset
    *
    * @title Get index of tile
    * @method map.getTileIndex(x,y)
    * @param {number} x Position X
    * @param {number} x Position Y
    * @returns {number}
    * @memberof Map
    * @memberof RpgSceneMap
    */
    getTileIndex(x: number, y: number, [z]?: [number]): number;
    getTilePosition(index: number): {
        x: number;
        y: number;
    };
    /**
     * Find the point of origin (top left) of a tile. Of course, its position depends on the size of the tile

     * @title Get origin position of tile
     * @method map.getTileOriginPosition(x,y)
     * @param {number} x Position X
     * @param {number} x Position Y
     * @returns { {x: number, y: number }}
     * @example
     *  ```ts
     *  // If the size of a tile is 32x32px
     *  const position = map.getTileOriginPosition(35, 12)
     *  console.log(position) // { x: 32, y: 0 }
     *  ```
     * @memberof Map
     * @memberof RpgSceneMap
     */
    getTileOriginPosition(x: number, y: number): {
        x: number;
        y: number;
    };
    /**
    * Recover tiles according to a position

    * @title Get tile by position
    * @method map.getTileByPosition(x,y)
    * @param {number} x Position X
    * @param {number} x Position Y
    * @returns {TileInfo}
    * @example
    *  ```ts
    *  const tiles = map.getTileByPosition(0, 0)
    *  ```
    * @memberof Map
    * @memberof RpgSceneMap
    */
    getTileByPosition(x: number, y: number, z?: [number, number], options?: GetTileOptions): TileInfo;
    /**
     * Retrieves tiles according to its index

     * @title Get tile by index
     * @method map.getTileByIndex(tileIndex)
     * @param {number} tileIndex tile index
     * @returns {TileInfo}
     * @example
     *  ```ts
     *  const index = map.getTileIndex(0, 0)
     *  const tiles = map.getTileByIndex(index)
     *  ```
     * @memberof Map
     * @memberof RpgSceneMap
     */
    getTileByIndex(tileIndex: number, zPlayer?: [number, number], options?: GetTileOptions): TileInfo;
    getAllObjects(): TiledObjectClass[];
    getData(): {
        layers: Layer[];
        type: "map";
        version: number;
        width: number;
        height: number;
        hexsidelength: number;
        tileheight: number;
        tilewidth: number;
        backgroundcolor: string;
        compressionlevel: number;
        infinite: boolean;
        nextlayerid: number;
        nextobjectid: number;
        orientation: "orthogonal" | "isometric" | "staggered" | "hexagonal";
        properties: {
            [key: string]: any;
        };
        tilesets: TiledTileset[];
        renderorder: "right-down" | "right-up" | "left-down" | "left-up";
        staggeraxis: "x" | "y";
        staggerindex: "odd" | "even";
        tiledversion: string;
        class: string;
    };
    setTile(x: number, y: number, layerFilter: string | ((layer: any) => boolean), tileInfo: any): {
        x: number;
        y: number;
        tiles: {
            [tileIndex: number]: Tile;
        };
    } | never;
    removeCacheTileset(name: string): void;
    clearCacheTilesets(): void;
    private mapTilesets;
    private mapLayers;
    private setTileIndex;
    /**
     * We multiply by 2 because 2 entries are stored for a tile: its GID and the Layer Index
     *
     * Example If I have 3 layers, The array will have the following form
     *
     * [
     *  GID of Layer 3,
     *  Layer Index of Layer 3,
     *  GID of Layer 2,
     *  Layer Index of Layer 2,
     *  GID of Layer 1,
     *  Layer Index of Layer 1,
     * ... others tiles
     * ]
     *
     * The size in memory of the map is therefore:
     *
     * `(map width * map height * number of layers * 4) bytes`
     *
     * > We multiply by 4, because an element takes 2 bytes and has 2 elements for a tile is 4 bytes in all
     *
     * Example (a 100x100 map with 5 layers)
     *
     * `100 * 100 * 5 * 4 = 200000 bytes = ~195 Kb`
     *
     * If we define on lowMemory then the calculation is the following
     *
     * `(map width * map height * 4) bytes`
     *
     * Example
     *
     * `100 * 100 * 4 = 40000 bytes = ~39 Kb`
     */
    private get realAllocateMemory();
    /**
     * We keep each tile in memory classified by z value. The values are ordered from the end to the beginning so that the first element of the array (when retrieved with getTileByIndex() is the tile on the highest layer. This way, the tile search is very fast for collisions
     *
     */
    private addTileIndex;
    private setTilesIndex;
}
export interface MapClass extends TiledMap {
}
