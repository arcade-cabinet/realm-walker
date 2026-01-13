import { globFiles } from './utils.js';
import { errorApi, info } from '../logs/warning.js';
import fs from 'fs-extra';
import xml2js from 'xml2js';
import axios from '../serve/api.js';
export function mapUpdatePlugin(_serverUrl, config) {
    return {
        name: 'vite-plugin-map-update',
        configureServer(server) {
            const serverUrl = _serverUrl || (server.httpServer?.address()).port;
            server.watcher.add(globFiles('@(tmx|tsx)'));
            server.watcher.on('change', async (file) => {
                const gameRoot = config.modulesRoot;
                if (!file.startsWith(gameRoot))
                    return;
                if (file.endsWith('tmx')) {
                    info(`File ${file} changed, updating map...`);
                    // open file
                    const data = await fs.readFile(file, 'utf-8');
                    axios.put(serverUrl + '/api/maps', {
                        mapFile: file,
                        data
                    }).catch(errorApi);
                }
                else if (file.endsWith('tsx') && !file.includes('gui')) {
                    info(`File ${file} changed, updating tileset...`);
                    // open file
                    const data = await fs.readFile(file, 'utf-8');
                    const parser = new xml2js.Parser();
                    const result = await parser.parseStringPromise(data);
                    axios.put(serverUrl + '/api/tilesets', {
                        tilesetId: result.tileset.$.name,
                        data
                    }).catch(errorApi);
                }
            });
        }
    };
}
//# sourceMappingURL=vite-plugin-map-update.js.map