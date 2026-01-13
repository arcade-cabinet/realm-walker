export declare const OUPUT_DIR_CLIENT_ASSETS = "dist/client/assets";
export declare const entryPointServer: (entryPointPath?: string) => string;
export declare const globFiles: (extension: string) => string[];
export declare const assetsFolder: (outputDir: string) => string;
export declare const createDistFolder: (outputDir: string) => Promise<string>;
export declare function toPosix(path: string): string;
export declare function relativePath(file: string): string;
/**
 * Example:
 *
 * const projectPath = extractProjectPath('/home/user/project/RPG-JS-v4/packages/sample2/main/characters/npc', '/main/characters')
 * console.log(projectPath) // /main/characters/npc
 */
export declare function extractProjectPath(absolutePath: string, projectPath: string): string;
export declare function replaceEnvVars(obj: any, envs: any): any;
