import type { Plugin } from 'vite';
import type { ClientBuildConfigOptions } from './client-config';
import { Config } from './load-config-file';
type ImportObject = {
    importString: string;
    variablesString: string;
    folder: string;
    relativePath: string;
};
type ImportImageObject = ImportObject & {
    propImagesString: string;
};
export declare function formatVariableName(packageName: string): string;
export declare function transformPathIfModule(moduleName: string): string;
export declare function getAllFiles(dirPath: string): string[];
export declare function searchFolderAndTransformToImportString(folderPath: string, modulePath: string, extensionFilter: string | string[], returnCb?: (file: string, variableName: string) => string, options?: {
    customFilter?: (file: string) => boolean;
}): ImportObject;
export declare function importString(modulePath: string, fileName: string, variableName?: string): string;
export declare function loadServerFiles(modulePath: string, options: any, config: any): string;
export declare function loadSpriteSheet(directoryName: string, modulePath: string, options: any, warning?: boolean): ImportImageObject;
export declare function loadClientFiles(modulePath: string, options: any, config: Config): string;
export declare function createModuleLoad(id: string, variableName: string, modulePath: string, options: any, config: any): string;
export declare function createConfigFiles(id: string, configServer: any, configClient: any): string | null;
export default function configTomlPlugin(options: ClientBuildConfigOptions | undefined, config: Config): Plugin | undefined;
export {};
