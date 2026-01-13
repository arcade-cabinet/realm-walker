import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['test/**/*.test.ts'],
        testTimeout: 60000,
    },
    resolve: {
        alias: {
            '@realm-walker/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
            '@realm-walker/mechanics': path.resolve(__dirname, '../../packages/mechanics/src/index.ts'),
            '@realm-walker/genai': path.resolve(__dirname, '../../packages/genai/src/index.ts'),
            '@realm-walker/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
        }
    }
});
