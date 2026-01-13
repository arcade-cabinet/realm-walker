import fs from 'fs';
import path from 'path';
export const tsxXmlPlugin = (config) => {
    return {
        name: 'tsx-xml-loader',
        enforce: 'pre',
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                const { url } = req;
                if (url && (url.startsWith('/' + config.modulesRoot)) && (url.endsWith('.tsx')) && !url.includes('gui')) {
                    const publicPath = server.config.root;
                    const filePath = path.join(publicPath, url);
                    if (fs.existsSync(filePath)) {
                        const xmlContent = fs.readFileSync(filePath, 'utf-8');
                        res.setHeader('Content-Type', 'application/xml');
                        res.end(xmlContent);
                        return;
                    }
                }
                next();
            });
        },
    };
};
//# sourceMappingURL=vite-plugin-tsx-xml.js.map