/**
 * E2E Tests for Realm Walker Story
 * Tests game UI, interactions, and takes screenshots at different game states
 * 
 * Compatible with both:
 * - Local development (npx playwright test)
 * - Playwright MCP Server (for Copilot agents)
 */

import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { pathToFileURL } from 'url';

const TEST_HARNESS_PATH = pathToFileURL(path.resolve(__dirname, 'test-harness.html')).toString();

test.describe('Realm Walker Story - E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to test harness
    await page.goto(TEST_HARNESS_PATH);
    
    // Wait for page to be ready
    await page.waitForSelector('[data-testid="game-screen"]');
  });

  test.describe('Game Initialization', () => {
    test('should load game UI correctly', async ({ page }) => {
      // Verify main elements are present
      await expect(page.locator('[data-testid="game-screen"]')).toBeVisible();
      await expect(page.locator('[data-testid="current-scene"]')).toContainText('Starting Room');
      await expect(page.locator('[data-testid="quest-log"]')).toBeVisible();
      
      // Take screenshot of initial state
      await page.screenshot({ 
        path: 'tests/screenshots/01-initial-game-screen.png',
        fullPage: true 
      });
    });

    test('should display game controls', async ({ page }) => {
      await expect(page.locator('[data-testid="btn-start-game"]')).toBeVisible();
      await expect(page.locator('[data-testid="btn-talk-to-guide"]')).toBeVisible();
      await expect(page.locator('[data-testid="btn-open-chest"]')).toBeVisible();
      
      // Take screenshot of controls
      await page.screenshot({ 
        path: 'tests/screenshots/02-game-controls.png',
        fullPage: true 
      });
    });

    test('should show initial quest flags as false', async ({ page }) => {
      await expect(page.locator('[data-testid="flag-game-started"]')).toContainText('false');
      await expect(page.locator('[data-testid="flag-chest-opened"]')).toContainText('false');
      await expect(page.locator('[data-testid="flag-talked-to-guide"]')).toContainText('false');
      
      // Take screenshot of initial flags
      await page.locator('[data-testid="flag-game-started"]').screenshot({
        path: 'tests/screenshots/03-initial-quest-flags.png'
      });
    });
  });

  test.describe('Quest System', () => {
    test('should update game_started flag when starting game', async ({ page }) => {
      // Click start game button
      await page.click('[data-testid="btn-start-game"]');
      
      // Verify flag updated
      await expect(page.locator('[data-testid="flag-game-started"]')).toContainText('true');
      
      // Take screenshot after starting game
      await page.screenshot({ 
        path: 'tests/screenshots/04-game-started.png',
        fullPage: true 
      });
    });

    test('should update chest_opened flag when opening chest', async ({ page }) => {
      // Start game first
      await page.click('[data-testid="btn-start-game"]');
      
      // Open chest
      await page.click('[data-testid="btn-open-chest"]');
      
      // Verify flag updated
      await expect(page.locator('[data-testid="flag-chest-opened"]')).toContainText('true');
      
      // Take screenshot after opening chest
      await page.screenshot({ 
        path: 'tests/screenshots/05-chest-opened.png',
        fullPage: true 
      });
    });

    test('should mark quest as completed after talking to guide', async ({ page }) => {
      // Open dialogue
      await page.click('[data-testid="btn-talk-to-guide"]');
      
      // Wait for dialogue to appear
      await expect(page.locator('[data-testid="dialogue-box"]')).toBeVisible();
      
      // Take screenshot of dialogue
      await page.screenshot({ 
        path: 'tests/screenshots/06-dialogue-active.png',
        fullPage: true 
      });
      
      // Choose "I'm ready to start"
      await page.click('[data-testid="dialogue-choice-1"]');
      
      // Wait for dialogue to close
      await expect(page.locator('[data-testid="dialogue-box"]')).not.toBeVisible();
      
      // Verify flag updated
      await expect(page.locator('[data-testid="flag-talked-to-guide"]')).toContainText('true');
      
      // Verify quest marked as completed
      await expect(page.locator('[data-testid="quest-tutorial"]')).toHaveClass(/quest-completed/);
      
      // Take screenshot after quest completion
      await page.screenshot({ 
        path: 'tests/screenshots/07-quest-completed.png',
        fullPage: true 
      });
    });
  });

  test.describe('Dialogue System', () => {
    test('should show and hide dialogue box', async ({ page }) => {
      // Initially hidden
      await expect(page.locator('[data-testid="dialogue-box"]')).not.toBeVisible();
      
      // Click to talk
      await page.click('[data-testid="btn-talk-to-guide"]');
      
      // Should be visible
      await expect(page.locator('[data-testid="dialogue-box"]')).toBeVisible();
      await expect(page.locator('[data-testid="dialogue-speaker"]')).toContainText('Guide');
      await expect(page.locator('[data-testid="dialogue-text"]')).toBeVisible();
      
      // Take screenshot of dialogue
      await page.screenshot({ 
        path: 'tests/screenshots/08-dialogue-open.png',
        fullPage: true 
      });
      
      // Make a choice
      await page.click('[data-testid="dialogue-choice-0"]');
      
      // Should be hidden again
      await expect(page.locator('[data-testid="dialogue-box"]')).not.toBeVisible();
      
      // Take screenshot after closing
      await page.screenshot({ 
        path: 'tests/screenshots/09-dialogue-closed.png',
        fullPage: true 
      });
    });

    test('should display dialogue choices', async ({ page }) => {
      await page.click('[data-testid="btn-talk-to-guide"]');
      
      // Verify choices are visible
      await expect(page.locator('[data-testid="dialogue-choice-0"]')).toBeVisible();
      await expect(page.locator('[data-testid="dialogue-choice-1"]')).toBeVisible();
      
      // Take screenshot of choices
      await page.locator('[data-testid="dialogue-choices"]').screenshot({
        path: 'tests/screenshots/10-dialogue-choices.png'
      });
    });
  });

  test.describe('Scene Navigation', () => {
    test('should change scenes when button is clicked', async ({ page }) => {
      // Initial scene
      await expect(page.locator('[data-testid="current-scene"]')).toContainText('Starting Room');
      
      // Change scene
      await page.click('[data-testid="btn-change-scene"]');
      
      // Verify scene changed
      await expect(page.locator('[data-testid="current-scene"]')).toContainText('Village Square');
      
      // Take screenshot of new scene
      await page.screenshot({ 
        path: 'tests/screenshots/11-scene-village-square.png',
        fullPage: true 
      });
      
      // Change back
      await page.click('[data-testid="btn-change-scene"]');
      await expect(page.locator('[data-testid="current-scene"]')).toContainText('Starting Room');
      
      // Take screenshot of original scene
      await page.screenshot({ 
        path: 'tests/screenshots/12-scene-starting-room.png',
        fullPage: true 
      });
    });
  });

  test.describe('Complete Gameplay Flow', () => {
    test('should complete full game flow with all interactions', async ({ page }) => {
      // Step 1: Initial state
      await page.screenshot({ 
        path: 'tests/screenshots/flow-01-initial.png',
        fullPage: true 
      });
      
      // Step 2: Start game
      await page.click('[data-testid="btn-start-game"]');
      await expect(page.locator('[data-testid="flag-game-started"]')).toContainText('true');
      await page.screenshot({ 
        path: 'tests/screenshots/flow-02-game-started.png',
        fullPage: true 
      });
      
      // Step 3: Talk to guide
      await page.click('[data-testid="btn-talk-to-guide"]');
      await expect(page.locator('[data-testid="dialogue-box"]')).toBeVisible();
      await page.screenshot({ 
        path: 'tests/screenshots/flow-03-dialogue-opened.png',
        fullPage: true 
      });
      
      // Step 4: Make dialogue choice
      await page.click('[data-testid="dialogue-choice-1"]');
      await expect(page.locator('[data-testid="flag-talked-to-guide"]')).toContainText('true');
      await page.screenshot({ 
        path: 'tests/screenshots/flow-04-talked-to-guide.png',
        fullPage: true 
      });
      
      // Step 5: Open chest
      await page.click('[data-testid="btn-open-chest"]');
      await expect(page.locator('[data-testid="flag-chest-opened"]')).toContainText('true');
      await page.screenshot({ 
        path: 'tests/screenshots/flow-05-chest-opened.png',
        fullPage: true 
      });
      
      // Step 6: Change scene
      await page.click('[data-testid="btn-change-scene"]');
      await expect(page.locator('[data-testid="current-scene"]')).toContainText('Village Square');
      await page.screenshot({ 
        path: 'tests/screenshots/flow-06-scene-changed.png',
        fullPage: true 
      });
      
      // Final state verification
      await expect(page.locator('[data-testid="flag-game-started"]')).toContainText('true');
      await expect(page.locator('[data-testid="flag-chest-opened"]')).toContainText('true');
      await expect(page.locator('[data-testid="flag-talked-to-guide"]')).toContainText('true');
      await expect(page.locator('[data-testid="quest-tutorial"]')).toHaveClass(/quest-completed/);
      
      // Final screenshot
      await page.screenshot({ 
        path: 'tests/screenshots/flow-07-final-state.png',
        fullPage: true 
      });
    });
  });

  test.describe('Quest Log UI', () => {
    test('should display quest log with active quest', async ({ page }) => {
      await expect(page.locator('[data-testid="quest-log"]')).toBeVisible();
      await expect(page.locator('[data-testid="quest-tutorial"]')).toBeVisible();
      await expect(page.locator('[data-testid="quest-tutorial"]')).toContainText('Tutorial Quest');
      
      // Take screenshot of quest log
      await page.locator('[data-testid="quest-log"]').screenshot({
        path: 'tests/screenshots/13-quest-log.png'
      });
    });
  });

  test.describe('Testability', () => {
    test('should have proper test IDs for automation', async ({ page }) => {
      // Verify all key elements have test IDs
      const elements = [
        'game-screen',
        'current-scene',
        'quest-log',
        'dialogue-box',
        'btn-start-game',
        'btn-talk-to-guide',
        'btn-open-chest',
        'flag-game-started',
        'flag-chest-opened',
        'flag-talked-to-guide'
      ];
      
      for (const testId of elements) {
        await expect(page.locator(`[data-testid="${testId}"]`)).toBeVisible();
      }
    });
  });
});

// Helper function to ensure screenshots directory exists
test.beforeAll(async () => {
  const screenshotsDir = path.resolve(__dirname, '../screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
});
