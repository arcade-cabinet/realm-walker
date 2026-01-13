import { createServer } from 'vite';
import { clientBuildConfig } from '../build/client-config.js';
import { runServer } from './run-server.js';
import portfinder from 'portfinder';
import colors from 'picocolors';
import * as hmr from 'vite-node/hmr';
import path from 'path';
import { loadConfigFile } from '../build/load-config-file.js';
export async function devMode(options = {}) {
    var _a;
    const jsonConfig = await loadConfigFile();
    if (jsonConfig.type && !process.env.RPG_TYPE)
        process.env.RPG_TYPE = jsonConfig.type;
    options.port = process.env.PORT ? parseInt(process.env.PORT) : options.port;
    if (!options.port) {
        options.port = await portfinder.getPortPromise({
            port: 3000
        });
    }
    const isRpg = process.env.RPG_TYPE == 'rpg';
    process.env.NODE_ENV = 'development';
    (_a = process.env).VITE_GAME_URL ?? (_a.VITE_GAME_URL = `http://localhost:${options.port}`);
    const cwd = process.cwd();
    const colorUrl = (url) => colors.cyan(url.replace(/:(\d+)\//, (_, port) => `:${colors.bold(port)}/`));
    async function restartViteServer(server, close) {
        server.watcher.add(path.resolve(process.cwd(), 'rpg.toml'));
        server.watcher.on('change', async (file) => {
            if (file.endsWith('rpg.toml')) {
                console.log(`  ${colors.green('➜')}  ${colors.bold('rpg.toml changed. Restarting')} server...`);
                await server.close();
                if (close)
                    await close();
                await devMode(options);
            }
        });
    }
    if (isRpg) {
        const config = await clientBuildConfig(cwd, {
            type: 'rpg',
            serveMode: true,
            overrideOptions: {
                jsx: 'preserve'
            },
            optimizeDepsExclude: ['*.tsx'],
            server: options
        }, jsonConfig);
        const server = await createServer(config);
        await server.listen();
        console.log(`  ${colors.green('➜')}  ${colors.bold('Mode')}:    ${colorUrl('RPG')}`);
        server.printUrls();
        restartViteServer(server);
        return;
    }
    let server;
    const buildEnd = async () => {
        const { runner, server: serverSide, files, node } = await runServer();
        console.log(`  ${colors.green('➜')}  ${colors.bold('Mode')}:    ${colorUrl('MMORPG')}`);
        server.printUrls();
        console.log(`  ${colors.dim('➜')}  ${colors.dim('Server')}:  ${colors.dim(`http://localhost:${serverPort}/`)}`);
        restartViteServer(server, async () => {
            await hmr.handleMessage(runner, serverSide.emitter, [], {
                type: 'full-reload',
            });
            serverSide.emitter.removeAllListeners();
        });
    };
    const serverPort = await portfinder.getPortPromise();
    process.env.VITE_SERVER_URL = 'http://localhost:' + serverPort;
    const config = await clientBuildConfig(cwd, {
        serveMode: true,
        buildEnd,
        server: {
            host: 'localhost',
            ...options
        }
    }, jsonConfig);
    server = await createServer(config);
    await server.listen();
}
//# sourceMappingURL=index.js.map