import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    testTimeout: 60000, // Longer timeout for CLI integration tests
    hookTimeout: 30000,
  },
});