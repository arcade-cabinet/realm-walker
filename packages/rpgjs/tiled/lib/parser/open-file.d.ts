import { TiledMap } from "../types/Map";
type ParseOptions = {
    getOnlyBasename?: boolean;
};
export declare class TiledParserFile {
    private file;
    private basePath;
    private staticDir;
    private relativePath;
    constructor(file: string, { basePath, staticDir, relativePath }?: {
        basePath?: string | undefined;
        staticDir?: string | undefined;
        relativePath?: string | undefined;
    });
    static isBrowser(): boolean;
    static typeOfFile(file: string): {
        isXml: boolean;
        isObject: boolean;
        isHttp: boolean;
        isPath: boolean;
    };
    private _parseFile;
    parseFile(cb: Function, options?: ParseOptions): void;
    parseFilePromise(options?: ParseOptions): Promise<TiledMap>;
}
export {};
