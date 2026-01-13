import { defineConfig } from 'vitest/config';

export default defineConfig({
    // Force Vitest to bundle/transpile our local packages
    server: {
        deps: {
            inline: [/@realm-walker\/.*/]
        }
    }
});
