import type { ClientBuildConfigOptions } from './client-config';
import { type Config } from './load-config-file.js';
export declare function loadGlobalConfig(modules: string[], config: Config, options: ClientBuildConfigOptions): {
    configClient: any;
    configServer: any;
} | false;
