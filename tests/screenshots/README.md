# Screenshots Directory

This directory contains screenshots captured during Playwright E2E test runs. Screenshots document the visual state of the game at various points during testing.

## Screenshot Naming Convention

### Individual Feature Screenshots
- `01-initial-game-screen.png` - Initial game state on load
- `02-game-controls.png` - Game control buttons
- `03-initial-quest-flags.png` - Starting quest flag status
- `04-game-started.png` - After clicking "Start Game"
- `05-chest-opened.png` - After opening the chest
- `06-dialogue-active.png` - Dialogue system in active state
- `07-quest-completed.png` - Quest completion state
- `08-dialogue-open.png` - Dialogue box opened
- `09-dialogue-closed.png` - After dialogue is closed
- `10-dialogue-choices.png` - Dialogue choice buttons
- `11-scene-village-square.png` - Village Square scene
- `12-scene-starting-room.png` - Starting Room scene
- `13-quest-log.png` - Quest log UI component

### Complete Flow Screenshots
- `flow-01-initial.png` - Beginning of gameplay flow
- `flow-02-game-started.png` - Game started
- `flow-03-dialogue-opened.png` - Dialogue initiated
- `flow-04-talked-to-guide.png` - After talking to guide
- `flow-05-chest-opened.png` - Chest interaction
- `flow-06-scene-changed.png` - Scene transition
- `flow-07-final-state.png` - Final state with all features tested

## When Are Screenshots Generated?

Screenshots are automatically captured when running E2E tests:

```bash
npm run test:e2e
```

The tests in `tests/e2e/game-flow.spec.ts` will generate these screenshots during test execution.

## Purpose

These screenshots serve multiple purposes:

1. **Visual Documentation**: Provide visual evidence of the game's UI and features
2. **Regression Testing**: Help identify visual changes between test runs
3. **Bug Investigation**: Assist in debugging by showing exact state at failure
4. **Feature Demonstration**: Show stakeholders how different game features work
5. **Test Verification**: Confirm that placeholder UI renders correctly

## Notes

- Screenshots are captured at full page resolution by default
- Individual elements can also be captured (e.g., quest log, dialogue box)
- Screenshots are kept in version control for documentation purposes
- File sizes are typically 50-200KB per screenshot

## Placeholder Content

All screenshots show placeholder UI elements since this is a test harness, not the actual game. The placeholders include:
- 🎮 Game screen placeholder
- Quest flag status indicators
- Dialogue boxes with sample text
- Quest log with placeholder quests
- Interactive buttons for testing

These placeholders are designed to test the layout, interactions, and state management without requiring full game assets.
