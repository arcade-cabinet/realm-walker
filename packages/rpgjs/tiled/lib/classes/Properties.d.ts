export declare class TiledProperties {
    properties: {
        [key: string]: any;
    };
    class: string;
    constructor(data?: any);
    getProperty<P, D = undefined>(name: string, defaultValue?: D): P | D;
    hasProperty(name: string): boolean;
    setProperty<T>(name: string, value: T): void;
    getType(): string;
}
