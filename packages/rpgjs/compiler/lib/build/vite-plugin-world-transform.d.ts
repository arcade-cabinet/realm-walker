export declare function worldTransformPlugin(serverUrl?: string): {
    name: string;
    transform(source: any, id: any): {
        code: string;
        map: null;
    } | undefined;
    configureServer(server: any): void;
};
