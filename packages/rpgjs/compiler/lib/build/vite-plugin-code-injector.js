const scriptInjection = `
  <script>
    var global = global || window
  </script>
`;
export function codeInjectorPlugin() {
    return {
        name: 'html-transform',
        transformIndexHtml: {
            enforce: 'pre',
            transform(html) {
                return html.replace('<head>', `<head>${scriptInjection}`);
            }
        }
    };
}
//# sourceMappingURL=vite-plugin-code-injector.js.map