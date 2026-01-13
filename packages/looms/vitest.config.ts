import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Run in single execution mode by default (no watch mode)
    run: true,
    // Run test files sequentially to respect Gemini API rate limits
    fileParallelism: false,
    // Run tests within a file sequentially
    sequence: {
      concurrent: false,
    },
    // Longer timeout for API calls
    testTimeout: 120000,
  },
});
