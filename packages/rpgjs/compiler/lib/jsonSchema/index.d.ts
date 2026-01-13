declare const _default: {
    server: {
        type: string;
        properties: {
            vitest: {
                type: string;
                additionalProperties: boolean;
            };
            express: {
                type: string;
                properties: {
                    static: {
                        type: string;
                    };
                    port: {
                        type: string;
                    };
                    json: {
                        type: string;
                        additionalProperties: boolean;
                    };
                    cors: {
                        type: string;
                        additionalProperties: boolean;
                    };
                    socketIo: {
                        type: string;
                        additionalProperties: boolean;
                    };
                };
            };
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
            startMap: {
                type: string;
            };
            start: {
                type: string;
                properties: {
                    map: {
                        type: string;
                    };
                    graphic: {
                        type: string;
                    };
                    hitbox: {
                        type: string;
                        items: {
                            type: string;
                        }[];
                        additionalItems: boolean;
                        minItems: number;
                        maxItems: number;
                    };
                };
            };
            api: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    authSecret: {
                        type: string;
                    };
                };
                required: string[];
            };
        };
    };
    client: {
        type: string;
        properties: {
            socketIoClient: {
                type: string;
                additionalProperties: boolean;
            };
            canvas: {
                type: string;
                properties: {
                    transparent: {
                        type: string;
                    };
                    autoDensity: {
                        type: string;
                    };
                    antialias: {
                        type: string;
                    };
                    resolution: {
                        type: string;
                    };
                    preserveDrawingBuffer: {
                        type: string;
                    };
                    backgroundColor: {
                        type: string;
                    };
                };
            };
            selector: {
                type: string;
            };
            selectorGui: {
                type: string;
            };
            selectorCanvas: {
                type: string;
            };
            standalone: {
                type: string;
            };
            drawMap: {
                type: string;
            };
            maxFps: {
                type: string;
            };
            serverFps: {
                type: string;
            };
            shortName: {
                type: string;
            };
            description: {
                type: string;
            };
            themeColor: {
                type: string;
            };
            icons: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        src: {
                            type: string;
                        };
                        sizes: {
                            type: string;
                            items: {
                                type: string;
                                minimum: number;
                            };
                        };
                        type: {
                            type: string;
                        };
                    };
                };
            };
            themeCss: {
                type: string;
            };
            matchMakerService: {
                type: string;
            };
            pwa: {
                type: string;
                additionalProperties: boolean;
            };
        };
    };
    "*": {
        type: string;
        properties: {
            inputs: {
                type: string;
                additionalProperties: {
                    oneOf: {
                        type: string;
                        properties: {
                            repeat: {
                                type: string;
                                default: boolean;
                            };
                            bind: {
                                type: string[];
                            };
                            delay: {
                                type: string;
                                properties: {
                                    duration: {
                                        type: string;
                                        minimum: number;
                                    };
                                    otherControls: {
                                        type: string;
                                        items: {
                                            type: string;
                                        };
                                    };
                                };
                                required: string[];
                            };
                        };
                        required: string[];
                    }[];
                };
            };
            name: {
                type: string;
            };
        };
    };
};
export default _default;
