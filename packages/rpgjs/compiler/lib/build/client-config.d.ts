import { DevOptions } from '../serve/index.js';
export interface ClientBuildConfigOptions {
    buildEnd?: () => void;
    serveMode?: boolean;
    plugins?: any[];
    overrideOptions?: any;
    side?: 'client' | 'server';
    mode?: 'development' | 'production' | 'test';
    type?: 'mmorpg' | 'rpg';
    server?: DevOptions;
    plugin?: {
        entry: string;
    };
    optimizeDepsExclude?: string[];
}
export declare function clientBuildConfig(dirname: string, options?: ClientBuildConfigOptions, config?: any): Promise<any>;
