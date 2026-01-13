import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Disable watch mode by default
        watch: false,
    },
    // Force Vitest to bundle/transpile our local packages
    server: {
        deps: {
            inline: [/@realm-walker\/.*/]
        }
    }
});
