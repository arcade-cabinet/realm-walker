import builder from 'xmlbuilder';
export class Tileset {
    constructor(nbTilesWidth, nbTilesHeight) {
        this.nbTilesWidth = nbTilesWidth;
        this.nbTilesHeight = nbTilesHeight;
    }
    generate(attr) {
        const root = builder.create('tileset');
        for (let param in attr.root) {
            root.att(param, attr.root[param]);
        }
        root.att('tilecount', this.nbTilesWidth * this.nbTilesHeight);
        root.att('columns', this.nbTilesWidth);
        root.ele('image', attr.image);
        return root;
    }
    createTile(id, properties) {
        const tile = builder.create('tile', { headless: true });
        tile.att('id', id);
        const elProperties = tile.ele('properties');
        for (let key in properties) {
            const value = properties[key];
            let type;
            if (typeof value == 'boolean') {
                type = 'bool';
            }
            elProperties.ele('property', { name: key, type, value });
        }
        return tile;
    }
}
//# sourceMappingURL=tileset.js.map