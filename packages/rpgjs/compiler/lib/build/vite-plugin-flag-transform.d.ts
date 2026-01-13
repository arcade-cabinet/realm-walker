/**
 * Transforms source code based on specified flags and options
 *
 * @param {Object} [options={}] - Options for flag transformation
 * @param {'client' | 'server'} [options.side=client] - Specifies whether to transform for client or server-side
 * @param {'development' | 'production' | 'test'} [options.mode=development] - Specifies the environment mode to transform for
 * @param {'mmorpg' | 'rpg'} [options.type=mmorpg] - Specifies the type of game to transform for
 *
 * @returns {Object} - Object containing two methods for resolving and transforming source code
 */
export declare function flagTransform(options?: any): {
    name: string;
    resolveId: (source: any, importer: any, options: any) => Promise<any>;
    transform: (source: any, id: any) => Promise<{
        code: any;
        map: null;
    }>;
};
