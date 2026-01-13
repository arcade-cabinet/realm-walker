import { resolve } from 'path';
import fs from 'fs/promises';
import _fs from 'fs';
import toml from '@iarna/toml';
import { loadEnv } from 'vite';
import { replaceEnvVars } from './utils.js';
import path from 'path';
export async function loadConfigFile(mode = 'development') {
    const { cwd, env } = process;
    let config = {};
    const tomlFile = resolve(cwd(), 'rpg.toml');
    const jsonFile = resolve(cwd(), 'rpg.json');
    // if file exists
    if (_fs.existsSync(tomlFile)) {
        config = toml.parse(await fs.readFile(tomlFile, 'utf8'));
    }
    else if (_fs.existsSync(jsonFile)) {
        config = JSON.parse(await fs.readFile(jsonFile, 'utf8'));
    }
    const envs = loadEnv(mode, cwd());
    config = replaceEnvVars(config, envs);
    config.autostart = config.autostart ?? true;
    config.modulesRoot = config.modulesRoot ?? '';
    let buildOptions = config.compilerOptions?.build || {};
    if (!config.compilerOptions) {
        config.compilerOptions = {};
    }
    if (!config.compilerOptions.build) {
        config.compilerOptions.build = {};
    }
    if (buildOptions.pwaEnabled === undefined) {
        config.compilerOptions.build.pwaEnabled = true;
    }
    if (buildOptions.outputDir === undefined) {
        config.compilerOptions.build.outputDir = 'dist';
    }
    if (config.modules) {
        config.modules = config.modules.map((module) => {
            if (module.startsWith('.')) {
                return './' + path.join(config.modulesRoot, module);
            }
            return module;
        });
    }
    config.startMap = config.startMap || config.start?.map;
    return config;
}
//# sourceMappingURL=load-config-file.js.map