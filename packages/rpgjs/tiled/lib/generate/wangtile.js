import builder from 'xmlbuilder';
import { Tileset } from './tileset';
export class Autotile extends Tileset {
    constructor(nbGroupTilesWidth, nbGroupTilesHeight, nbAnimation = 1) {
        const totalWidth = nbGroupTilesWidth * Autotile.WIDTH_TILES * nbAnimation;
        const totalHeight = nbGroupTilesHeight * Autotile.HEIGHT_TILES;
        super(totalWidth, totalHeight);
        this.nbGroupTilesWidth = nbGroupTilesWidth;
        this.nbGroupTilesHeight = nbGroupTilesHeight;
        this.nbAnimation = nbAnimation;
    }
    static getWangTiles(id) {
        return [
            [0, 0, id, 0, 0, 0, 0, 0],
            [0, 0, id, 0, 0, 0, id, 0],
            [0, 0, 0, 0, 0, 0, id, 0],
            [0, 0, 0, 0, id, 0, 0, 0],
            [0, 0, id, id, id, 0, 0, 0],
            [0, 0, id, id, id, id, id, 0],
            [0, 0, 0, 0, id, id, id, 0],
            [0, 0, id, 0, id, 0, 0, 0],
            [0, 0, 0, 0, id, 0, id, 0],
            [id, 0, id, 0, id, 0, 0, 0],
            [0, 0, id, 0, id, 0, id, 0],
            [id, 0, 0, 0, id, 0, 0, 0],
            [id, id, id, id, id, 0, 0, 0],
            [id, id, id, id, id, id, id, id],
            [id, 0, 0, 0, id, id, id, id],
            [id, 0, id, 0, 0, 0, 0, 0],
            [id, 0, 0, 0, 0, 0, id, 0],
            [id, 0, id, 0, 0, 0, id, 0],
            [id, 0, 0, 0, id, 0, id, 0],
            [id, 0, 0, 0, 0, 0, 0, 0],
            [id, id, id, 0, 0, 0, 0, 0],
            [id, id, id, 0, 0, 0, id, id],
            [id, 0, 0, 0, 0, 0, id, id],
            [id, id, id, 0, id, 0, 0, 0],
            [id, 0, 0, 0, id, 0, id, id],
            [0, 0, id, 0, id, id, id, 0],
            [0, 0, id, id, id, 0, id, 0],
            [id, id, id, 0, id, id, id, id],
            [id, id, id, id, id, 0, id, id],
            [id, 0, id, 0, id, 0, id, id],
            [id, id, id, 0, id, 0, id, 0],
            [id, 0, id, id, id, 0, 0, 0],
            [id, 0, 0, 0, id, id, id, 0],
            [id, 0, id, 0, 0, 0, id, id],
            [id, id, id, 0, 0, 0, id, 0],
            [id, 0, id, id, id, id, id, id],
            [id, id, id, id, id, id, id, 0],
            [id, 0, id, 0, id, id, id, 0],
            [id, 0, id, id, id, 0, id, 0],
            [id, 0, id, id, id, id, id, 0],
            [id, id, id, 0, id, 0, id, id],
            [id, 0, id, 0, id, id, id, id],
            [id, id, id, id, id, 0, id, 0],
            [id, 0, id, id, id, 0, id, id],
            [id, id, id, 0, id, id, id, 0],
            [id, 0, id, 0, id, 0, id, 0]
        ];
    }
    static getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    get hasAnimation() {
        return this.nbAnimation > 1;
    }
    getIndex(x, y) {
        return x + y * this.nbTilesWidth;
    }
    generate(attr) {
        const root = super.generate({
            root: attr.root,
            image: attr.image
        });
        for (let i = 0; i < this.nbTilesHeight; i++) {
            for (let j = 0; j < this.nbTilesWidth; j++) {
                const tileId = this.getIndex(j, i);
                const nbProp = Object.keys(attr.tile).length;
                const hasAnimation = this.hasAnimation && j < Autotile.WIDTH_TILES;
                if (nbProp == 0 && !hasAnimation) {
                    continue;
                }
                const xmlTile = this.createTile(tileId, attr.tile);
                if (hasAnimation) {
                    const xmlAnimation = this.generateAnimationTile(tileId);
                    xmlTile.importDocument(xmlAnimation);
                }
                root.importDocument(xmlTile);
            }
        }
        const xmlWang = this.generateWangTiles();
        root.importDocument(xmlWang);
        return root;
    }
    generateAnimationTile(tileId) {
        let xml = builder.create('animation', { headless: true });
        for (let i = 0; i < this.nbAnimation; i++) {
            xml.ele('frame', { tileid: tileId + i * Autotile.WIDTH_TILES, duration: 100 });
        }
        return xml;
    }
    generateWangTiles(tileId = 0, name = 'Autotile') {
        let xml = builder.create('wangsets', { headless: true });
        const xmlWangset = xml.ele('wangset', { name, type: 'mixed', tile: tileId });
        const getOrigin = (i, j) => i * Autotile.WIDTH_TILES + (j * Autotile.HEIGHT_TILES * this.nbTilesWidth);
        for (let i = 0; i < this.nbGroupTilesWidth; i++) {
            for (let j = 0; j < this.nbGroupTilesHeight; j++) {
                xmlWangset.ele('wangcolor', { color: Autotile.getRandomColor(), tile: getOrigin(i, j), probability: 1 });
            }
        }
        let k = 0;
        for (let i = 0; i < this.nbGroupTilesWidth; i++) {
            for (let j = 0; j < this.nbGroupTilesHeight; j++) {
                const wangTiles = Autotile.getWangTiles(k + 1);
                const origin = getOrigin(i, j);
                for (let l = 0; l <= wangTiles.length; l++) {
                    const wangTile = wangTiles[l - 1];
                    if (!wangTile)
                        continue;
                    const x = l % Autotile.WIDTH_TILES;
                    const y = Math.floor(l / Autotile.WIDTH_TILES);
                    const index = this.getIndex(x, y);
                    const tileId = origin + index;
                    xmlWangset.ele('wangtile', { tileid: tileId, wangid: wangTile.join(',') });
                }
                k++;
            }
        }
        return xml;
    }
}
Autotile.HEIGHT_TILES = 6;
Autotile.WIDTH_TILES = 8;
/*
const str = new Autotile(1, 2).generate({
    root: {
        version: '1.8',
        tiledversion: "1.8.2",
        name: "[A]Wall-Up_pipo",
        tilewidth: "32",
        tileheight: "32"
    },
    image: {
        source: '../../../client/maps/assets/[A]Wall-Up_pipo.png',
        width: "256",
        height: "384"
    },
    tile: {}
 }).end({ pretty: true })
console.log(str)
*/ 
//# sourceMappingURL=wangtile.js.map