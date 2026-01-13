import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  // Core package
  {
    test: {
      name: 'core',
      root: './packages/core',
      environment: 'node',
    },
  },
  // AI package
  {
    test: {
      name: 'ai',
      root: './packages/ai',
      environment: 'node',
    },
  },
  // Looms package
  {
    test: {
      name: 'looms',
      root: './packages/looms',
      environment: 'node',
    },
  },
  // Mechanics package
  {
    test: {
      name: 'mechanics',
      root: './packages/mechanics',
      environment: 'node',
    },
  },
  // CLI package
  {
    test: {
      name: 'cli',
      root: './apps/cli',
      environment: 'node',
    },
  },
])