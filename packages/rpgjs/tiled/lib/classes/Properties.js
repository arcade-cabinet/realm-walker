export class TiledProperties {
    constructor(data) {
        this.properties = {};
        this.properties = data?.properties ?? {};
    }
    getProperty(name, defaultValue) {
        const val = this.properties[name];
        if (val === undefined) {
            return defaultValue;
        }
        return val;
    }
    hasProperty(name) {
        return !!this.properties[name];
    }
    setProperty(name, value) {
        this.properties[name] = value;
    }
    getType() {
        return this.class || this['type'];
    }
}
//# sourceMappingURL=Properties.js.map