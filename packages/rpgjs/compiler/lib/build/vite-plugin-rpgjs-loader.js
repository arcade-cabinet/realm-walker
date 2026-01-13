export function rpgjsPluginLoader(output = 'client', isBuild = false) {
    return {
        name: 'rpgjs-assets-loader',
        enforce: 'pre',
        transform: async (code, id) => {
            const regex = /^(?!.*node_modules(?:\/|\\)(?!rpgjs-|@rpgjs)).*$/;
            if (regex.test(id) && id.endsWith('.ts')) {
                return {
                    code: `import '${id}';\n${code}`,
                    map: null
                };
            }
        }
    };
}
//# sourceMappingURL=vite-plugin-rpgjs-loader.js.map