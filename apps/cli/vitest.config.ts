import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Disable watch mode by default
        watch: false,
        globals: true,
        environment: 'node',
        include: ['test/**/*.test.ts'],
        testTimeout: 60000,
    },
    resolve: {
        alias: {
            '@realm-walker/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
            '@realm-walker/mechanics': path.resolve(__dirname, '../../packages/mechanics/src/index.ts'),
            '@realm-walker/looms': path.resolve(__dirname, '../../packages/looms/src/index.ts'),
            '@realm-walker/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
        }
    }
});
