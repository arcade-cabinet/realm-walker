import { TiledMap } from '../types/Map';
import { TiledTileset } from '../types/Tileset';
import { Buffer } from 'buffer';
export declare class TiledParser {
    private xml;
    private filePath;
    private layers;
    constructor(xml: string, filePath?: string);
    static propToNumber: (obj: any, props: string[]) => any;
    static propToBool: (obj: any, props: string[]) => any;
    static toArray<T>(prop: any): T[];
    getImagePath(image: string): string;
    transform: (obj: any) => any;
    static unpackTileBytes(buffer: Buffer, size: number): number[] | never;
    static decode(obj: {
        encoding: string;
        data: string;
    }, size: number): string | number[];
    parseMap(): TiledMap;
    parseTileset(): TiledTileset;
}
