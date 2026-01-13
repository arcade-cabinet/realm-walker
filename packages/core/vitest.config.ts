import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Run in single execution mode by default (no watch mode)
        run: true,
    },
    // Force Vitest to bundle/transpile our local packages
    server: {
        deps: {
            inline: [/@realm-walker\/.*/]
        }
    }
});
