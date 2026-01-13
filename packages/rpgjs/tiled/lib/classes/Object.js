import { TileGid } from "./Gid";
export class TiledObjectClass extends TileGid {
    constructor(object) {
        super(object);
        this.layerName = '';
        Object.assign(this, object);
        if (object?.gid) {
            this.y -= this.height;
        }
    }
}
//# sourceMappingURL=Object.js.map