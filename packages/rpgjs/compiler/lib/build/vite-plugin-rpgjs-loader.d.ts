export declare function rpgjsPluginLoader(output?: string, isBuild?: boolean): {
    name: string;
    enforce: string;
    transform: (code: any, id: string) => Promise<{
        code: string;
        map: null;
    } | undefined>;
};
