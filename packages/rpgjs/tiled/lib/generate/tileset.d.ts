import builder from 'xmlbuilder';
export declare class Tileset {
    protected nbTilesWidth: number;
    protected nbTilesHeight: number;
    constructor(nbTilesWidth: number, nbTilesHeight: number);
    generate(attr: {
        root: any;
        image: any;
    }): builder.XMLElement;
    createTile(id: number, properties: any): builder.XMLElement;
}
