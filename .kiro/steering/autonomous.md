# Autonomous Execution Mode (YOLO)

**This steering applies to ALL spec task execution.**

## Core Principle

Execute tasks continuously without user interaction. The user trusts you to make decisions and keep moving.

## Common Sense Rules

### ALWAYS Commit Before Destructive Operations
- **ALWAYS** commit staged changes before running `pnpm build --clean` or similar
- **ALWAYS** commit before running any command that regenerates files
- **ALWAYS** commit before major dependency changes
- **NEVER** run destructive operations on uncommitted work

### Safety First
- Check `git status` before destructive operations
- Use `git add -A && git commit -m "wip: before {operation}"` for safety commits
- Prefer incremental changes over big bang operations
- Test TypeScript compilation after major changes with `pnpm build`

### Dependency Management
- Install missing dependencies immediately when encountered
- Use exact package names from error messages
- Always use `pnpm` not `npm` in this project
- Install workspace dependencies with `workspace:*` protocol

## Background Process Management

**CRITICAL: Use `controlBashProcess` for long-running commands to avoid blocking.**

### Commands that MUST run in background:
- `pnpm dev` / `pnpm --filter @realm-walker/game dev`
- Any Vitest watch mode commands
- Any build command that takes > 30 seconds
- Gemini API integration tests (can be slow)

### Pattern:
```
1. Start process with controlBashProcess action="start"
2. Poll with getProcessOutput every few seconds
3. Continue other work while waiting
4. Check for success/failure in output
5. Stop process with action="stop" when done
```

## Rules

### DO
- Execute tasks one after another automatically
- Make reasonable decisions without asking
- Commit after each task or logical group
- Push after each section
- Fix errors yourself when possible
- Continue to next task immediately after completing one
- Work silently - no play-by-play commentary
- Install suggested packages when tools recommend them
- Fix TypeScript errors immediately when encountered
- Run tests with `--run` flag to avoid watch mode blocking

### DO NOT
- Ask "should I proceed?" or "ready to continue?"
- Give status updates between tasks
- Wait for user confirmation
- Explain what you're about to do
- Summarize what you just did (unless section complete)
- Stop unless blocked or done
- Run destructive operations on uncommitted changes
- Ignore package installation suggestions from tools
- Use watch mode for tests (use `vitest --run` instead)

## When to Speak

Only communicate when:
1. **Section complete** - Brief one-liner: "Section N complete, starting N+1"
2. **Blocked by error** - Can't proceed without user input
3. **All done** - Spec fully implemented
4. **Critical decision** - Architectural choice with major implications

## Commit Strategy

```bash
# Safety commit before destructive operations
git add -A
git commit -m "wip: before prebuild/major change"

# After each task
git add -A
git commit -m "feat({spec}): {task-id} {brief description}"

# After section complete
git push origin feature/{spec-name}
gh pr comment {pr} --body "@coderabbitai review"
```

## Error Handling

1. **Missing dependency**: Install it immediately, continue
2. **TypeScript error**: Fix it immediately, continue
3. **Fixable error**: Fix it, continue
4. **Ambiguous requirement**: Make reasonable choice, document in commit
5. **Blocking error**: Report concisely, ask specific question
6. **Test failure**: Fix the code or test, continue
7. **Gemini API error**: Use mock mode if API unavailable, continue

## Task Execution Flow

```
┌─────────────────────────────────────────┐
│           YOLO EXECUTION LOOP           │
│                                         │
│  Read task → Execute → Commit → Next    │
│       ↑                          │      │
│       └──────────────────────────┘      │
│                                         │
│  Only exit when: blocked OR done        │
└─────────────────────────────────────────┘
```

## Section Transitions

When completing a section:
1. Mark tasks complete in task file
2. Update GitHub issue checkbox
3. Commit and push
4. **Immediately** start next section

No pause. No "ready for next section?" Just go.

## RealmWalker-Specific Rules

### Headless First Mandate
- Always verify changes work in headless mode first
- Run `pnpm generate-realm simulate --mock` to validate core functionality
- Graphics are secondary to logic correctness

### Test Execution
- Use `pnpm --filter {package} test --run` for single execution
- Never use watch mode in autonomous execution
- Property-based tests may take longer - be patient

### Loom Framework
- When testing Looms, prefer mock mode unless specifically testing API integration
- Set `GEMINI_API_KEY` environment variable for live tests
- Handle rate limiting gracefully with retries
