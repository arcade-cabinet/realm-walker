export interface Config {
    modules?: string[];
    startMap?: string;
    name?: string;
    shortName?: string;
    short_name?: string;
    description?: string;
    themeColor?: string;
    background_color?: string;
    icons?: {
        src: string;
        sizes: number[];
        type: string;
    }[];
    themeCss?: string;
    inputs?: {
        [key: string]: {
            name: string;
            repeat?: boolean;
            bind: string | string[];
        };
    };
    start?: {
        map?: string;
        graphic?: string;
        hitbox?: [number, number];
    };
    spritesheetDirectories?: string[];
    compilerOptions?: {
        alias?: {
            [key: string]: string;
        };
        build?: {
            pwaEnabled?: boolean;
            assetsPath?: string;
            outputDir?: string;
            serverUrl?: string;
        };
    };
    pwa?: {
        [key: string]: any;
    };
    vite?: any;
    modulesRoot?: string;
    autostart?: boolean;
    type?: 'mmorpg' | 'rpg';
}
export declare function loadConfigFile(mode?: string): Promise<any>;
