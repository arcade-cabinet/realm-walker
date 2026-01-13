declare const _default: {
    compilerOptions: {
        type: string;
        properties: {
            alias: {
                type: string;
                additionalProperties: {
                    type: string;
                };
            };
            build: {
                type: string;
                properties: {
                    pwaEnabled: {
                        type: string;
                    };
                    assetsPath: {
                        type: string;
                    };
                    outputDir: {
                        type: string;
                    };
                    serverUrl: {
                        type: string;
                    };
                };
            };
            spritesheetDirectories: {
                type: string;
                items: {
                    type: string;
                };
            };
        };
    };
    vite: {
        type: string;
        additionalProperties: boolean;
    };
    modulesRoot: {
        type: string;
    };
    autostart: {
        type: string;
    };
    spritesheetDirectories: {
        type: string;
        items: {
            type: string;
        };
    };
};
export default _default;
