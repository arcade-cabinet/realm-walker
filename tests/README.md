# Testing Documentation

## Overview

This project has a comprehensive testing infrastructure covering unit tests, integration tests, and end-to-end (E2E) tests using Playwright.

## Test Structure

```
tests/
├── unit/              # Unit tests for individual components
├── integration/       # Integration tests for system interactions
├── e2e/              # End-to-end tests with Playwright
│   ├── test-harness.html    # Test HTML page for E2E tests
│   └── game-flow.spec.ts    # E2E test suites
└── screenshots/      # Game screenshots from E2E tests
```

## Running Tests

### Unit Tests

Run all unit tests:
```bash
npm test
# or
npm run test:unit
```

Watch mode for development:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

### Integration Tests

Run integration tests:
```bash
npm run test:integration
```

These tests verify the interaction between multiple components like:
- Three-tier compositor chain (Scene → Story → Game)
- Quest system with dialogue integration
- Flag-based content loading

### End-to-End Tests

#### Prerequisites

Install Playwright browsers:
```bash
npm run playwright:install
```

#### Running E2E Tests

Run all E2E tests:
```bash
npm run test:e2e
```

Run in headed mode (see browser):
```bash
npm run test:e2e:headed
```

Run with UI mode (interactive):
```bash
npm run test:e2e:ui
```

Debug mode:
```bash
npm run test:e2e:debug
```

#### E2E Test Features

The E2E tests cover:
- Game initialization and UI loading
- Quest flag management
- Dialogue system interactions
- Scene navigation
- Complete gameplay flow
- Screenshot capture at each major game state

Screenshots are automatically saved to `tests/screenshots/` directory.

### Run All Tests

Run both unit/integration tests and E2E tests:
```bash
npm run test:all
```

## Playwright Configuration

### Local Development

The Playwright configuration (`playwright.config.ts`) is set up to work seamlessly in local development:

```typescript
// playwright.config.ts
// NOTE: Replace 'http://localhost:3000' with the actual server URL as needed.
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000', // Example placeholder
    // ... other settings
  }
});
```

### Playwright MCP Server Support

For use with GitHub Copilot agents and the Playwright MCP server, the tests:
- Use `data-testid` attributes for stable element selection
- Include clear descriptions and structure
- Generate screenshots for visual verification
- Support file:// URLs for standalone HTML testing

## Test Coverage

Current test coverage includes:

### Unit Tests (tests/unit/)
- ✅ DialogueManager
- ✅ QuestManager
- ✅ GridSystemImpl
- ✅ YukaGridSystem
- ✅ SceneCompositor
- ✅ StoryBindingLoader

### Integration Tests (tests/integration/)
- ✅ Compositor Chain (Scene → Story → Game)
- ✅ Quest System with Dialogue Integration
- ✅ Flag-based Content Loading
- ✅ Story State Management

### E2E Tests (tests/e2e/)
- ✅ Game Initialization
- ✅ Quest System UI
- ✅ Dialogue System
- ✅ Scene Navigation
- ✅ Complete Gameplay Flow
- ✅ Accessibility (test IDs)

## Screenshots

E2E tests automatically capture screenshots at key game states:

1. **Initial State**: `01-initial-game-screen.png`
2. **Game Controls**: `02-game-controls.png`
3. **Quest Flags**: `03-initial-quest-flags.png`
4. **Game Started**: `04-game-started.png`
5. **Chest Opened**: `05-chest-opened.png`
6. **Dialogue Active**: `06-dialogue-active.png`
7. **Quest Completed**: `07-quest-completed.png`
8. **Dialogue System**: `08-dialogue-open.png`, `09-dialogue-closed.png`
9. **Dialogue Choices**: `10-dialogue-choices.png`
10. **Scene Changes**: `11-scene-village-square.png`, `12-scene-starting-room.png`
11. **Complete Flow**: `flow-01-initial.png` through `flow-07-final-state.png`

## Writing Tests

### Unit Tests

Place unit tests in `tests/unit/` with the naming convention `*.test.ts`:

```typescript
import { QuestManager } from '../../src/runtime/systems/QuestManager';

describe('QuestManager', () => {
  test('should set and get flags', () => {
    const manager = new QuestManager();
    manager.setFlag('test_flag', true);
    expect(manager.hasFlag('test_flag')).toBe(true);
  });
});
```

### Integration Tests

Place integration tests in `tests/integration/`:

```typescript
import { SceneCompositor } from '../../src/runtime/systems/SceneCompositor';
import { StoryCompositor } from '../../src/runtime/systems/StoryCompositor';

describe('Compositor Integration', () => {
  test('should compose scene and story', () => {
    const sceneComp = new SceneCompositor();
    const storyComp = new StoryCompositor();
    // Test full pipeline...
  });
});
```

### E2E Tests

Place E2E tests in `tests/e2e/` with the naming convention `*.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('should interact with game', async ({ page }) => {
  await page.goto('file://path/to/test-harness.html');
  await page.click('[data-testid="btn-start-game"]');
  await expect(page.locator('[data-testid="flag-game-started"]')).toContainText('true');
  
  // Capture screenshot
  await page.screenshot({ path: 'tests/screenshots/test.png' });
});
```

## Best Practices

### Use Test IDs

Always use `data-testid` attributes for elements that need to be tested:

```html
<button data-testid="btn-start-game">Start Game</button>
```

### Screenshot Guidelines

- Use descriptive filenames: `flow-01-initial-state.png`
- Capture full page for context: `fullPage: true`
- Save to `tests/screenshots/` directory
- Document what each screenshot shows

### Test Independence

- Each test should be independent
- Use `beforeEach` to set up fresh state
- Don't rely on test execution order

### Async/Await

Always await Playwright actions:

```typescript
await page.click('[data-testid="button"]');
await expect(page.locator('[data-testid="result"]')).toBeVisible();
```

## Continuous Integration

Tests can be run in CI environments:

```yaml
# .github/workflows/test.yml
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run all tests
  run: npm run test:all
```

## Troubleshooting

### Playwright Browser Installation Issues

If browsers fail to install:
```bash
# Clear cache
rm -rf ~/.cache/ms-playwright

# Reinstall
npx playwright install chromium --with-deps
```

### E2E Tests Failing

- Check that test harness HTML is accessible
- Verify test IDs haven't changed
- Check browser console for errors
- Review screenshots in test-results/

### Coverage Not Generating

Make sure you're using:
```bash
npm run test:coverage
```

Not just `npm test`.

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
