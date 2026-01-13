# Spec Kickoff Workflow

When user says "kickoff {spec-name}", execute this complete workflow to set up a spec for autonomous development.

## INTELLIGENT RESUME DETECTION

**CRITICAL: Before creating new resources, check if we're resuming existing work.**

### Resume Detection Checklist

```bash
# 1. Check current branch
CURRENT_BRANCH=$(git branch --show-current)

# 2. Check if feature branch already exists
git branch -a | grep "feature/{spec-name}"

# 3. Check for existing PR
gh pr list --head "feature/{spec-name}" --json number,state,url

# 4. Check for existing tracking issue
gh issue list --search "{spec-name} in:title" --json number,title,state

# 5. Check for existing worktree
git worktree list | grep "{spec-name}"
```

### Decision Matrix

| Current Branch | Feature Branch Exists | PR Exists | Action |
|----------------|----------------------|-----------|--------|
| main/release | No | No | **Full Kickoff** - Create everything |
| main/release | Yes | No | **Partial Resume** - Use existing branch, create PR |
| main/release | Yes | Yes | **Full Resume** - Switch to branch, continue work |
| feature/{spec} | Yes | Yes | **Already Resumed** - Just start executing tasks |
| feature/{spec} | Yes | No | **Create PR** - Branch exists, need PR |

### Resume Mode Workflow

If resuming existing work:

```bash
# 1. Fetch latest
git fetch origin

# 2. If not on feature branch, switch to it
git checkout feature/{spec-name}

# 3. Pull latest changes
git pull origin feature/{spec-name}

# 4. Get existing PR number
PR_NUMBER=$(gh pr list --head "feature/{spec-name}" --json number --jq '.[0].number')

# 5. Get existing issue number
ISSUE_NUMBER=$(gh issue list --search "{spec-name} in:title" --json number --jq '.[0].number')

# 6. Triage existing issues/comments
just triage-existing $PR_NUMBER
```

## YOLO Mode (Default)

**CRITICAL: Execute ALL tasks autonomously without stopping for user confirmation.**

- Do NOT ask "ready to proceed?" or "should I continue?"
- Do NOT give status updates between tasks
- Do NOT wait for user input unless blocked by an error
- Just execute task after task silently
- Only speak when: (1) spec section complete, (2) error needs user input, (3) all done
- Commit and push after each logical unit of work
- Follow SEESAW pattern continuously

## Kickoff Command

```
kickoff {spec-name}
```

Example: `kickoff realm-walker-v0-1`

## Full Kickoff Workflow (New Spec)

### 1. Validate Spec Exists

```bash
# Check spec directory exists
ls .kiro/specs/{spec-name}/

# Required files
- requirements.md
- design.md  
- tasks.md
```

### 2. Create Feature Branch

```bash
# Create feature branch from current branch
git checkout -b feature/{spec-name}

# Or if using worktrees (optional for isolation)
WORKTREE_PATH="../worktrees/$(basename $(pwd))-{spec-name}"
git worktree add "$WORKTREE_PATH" -b feature/{spec-name}
```

### 3. Create GitHub Issue

```bash
# Create tracking issue with spec link
gh issue create \
  --title "🚀 {Spec Title}" \
  --body "## Overview
Tracking issue for {spec-name} implementation.

## Spec Documents
- [Requirements](.kiro/specs/{spec-name}/requirements.md)
- [Design](.kiro/specs/{spec-name}/design.md)
- [Tasks](.kiro/specs/{spec-name}/tasks.md)

## Progress
- [ ] Section 1: Core Engine Stabilization
- [ ] Section 2: Loom Framework Fixes
- [ ] Section 3: Deterministic Simulation
- [ ] Section 4: AI System Enhancement
- [ ] Section 5: Headless Simulation
- [ ] Section 6: Testing Framework
- [ ] Section 7: Package Architecture
- [ ] Section 8: Final Integration

## Links
- PR: TBD
- Milestone: TBD" \
  --label "feature" \
  --label "spec"
```

### 4. Create/Assign Milestone

```bash
# List existing milestones
gh api repos/{owner}/{repo}/milestones

# Create milestone if needed
gh api repos/{owner}/{repo}/milestones \
  --method POST \
  -f title="v0.1 - {Spec Title}" \
  -f description="Implementation of {spec-name}" \
  -f due_on="2026-02-01T00:00:00Z"

# Add issue to milestone
gh issue edit {issue-number} --milestone "v0.1 - {Spec Title}"
```

### 5. Create Pull Request (Draft)

```bash
# Make initial commit
git add .kiro/specs/{spec-name}/
git commit -m "feat({spec-name}): initialize spec implementation"
git push -u origin feature/{spec-name}

# Create draft PR
gh pr create \
  --title "feat({spec-name}): {Spec Title}" \
  --body "## Summary
Implements {spec-name} per spec documents.

Closes #{issue-number}

## Spec Documents
- [Requirements](.kiro/specs/{spec-name}/requirements.md)
- [Design](.kiro/specs/{spec-name}/design.md)
- [Tasks](.kiro/specs/{spec-name}/tasks.md)

## Checklist
- [ ] All tasks complete
- [ ] Tests passing
- [ ] CodeRabbit review addressed" \
  --draft \
  --label "feature" \
  --milestone "v0.1 - {Spec Title}"
```

### 6. Link Issue to PR

```bash
# Update issue body with PR link
gh issue edit {issue-number} --body "... PR: #{pr-number} ..."
```

## Resume Kickoff Workflow (Existing Work)

### 1. Detect Existing Resources

```bash
# Get current state
CURRENT_BRANCH=$(git branch --show-current)
FEATURE_BRANCH="feature/{spec-name}"

# Check for existing PR
EXISTING_PR=$(gh pr list --head "$FEATURE_BRANCH" --json number --jq '.[0].number // empty')

# Check for existing issue
EXISTING_ISSUE=$(gh issue list --search "{spec-name} in:title" --state open --json number --jq '.[0].number // empty')
```

### 2. Switch to Feature Branch (if needed)

```bash
if [ "$CURRENT_BRANCH" != "$FEATURE_BRANCH" ]; then
  git fetch origin
  git checkout "$FEATURE_BRANCH"
  git pull origin "$FEATURE_BRANCH"
fi
```

### 3. Triage Existing PR Feedback

```bash
# Get unresolved review threads
gh api graphql -f query='
query {
  repository(owner: "{owner}", name: "{repo}") {
    pullRequest(number: '$EXISTING_PR') {
      reviewThreads(first: 50) {
        nodes {
          id
          isResolved
          comments(first: 10) {
            nodes {
              body
              author { login }
            }
          }
        }
      }
    }
  }
}'

# Get CodeRabbit comments
gh api repos/{owner}/{repo}/pulls/$EXISTING_PR/comments \
  --jq '.[] | select(.user.login == "coderabbitai") | {id: .id, body: .body, path: .path}'
```

### 4. Check Task Progress

```bash
# Read tasks.md and identify completed vs pending tasks
cat .kiro/specs/{spec-name}/tasks.md | grep -E "^\s*-\s*\[[ x]\]"
```

### 5. Resume Execution

Continue from first incomplete task, addressing any pending feedback first.

## Post-Kickoff (YOLO Autonomous Execution)

After kickoff completes, immediately begin task execution:

1. **Execute from current location**: Work in feature branch
2. **Address pending feedback first**: If resuming, handle CodeRabbit comments
3. **Execute tasks**: Start with first incomplete task
4. **Commit frequently**: Small, atomic commits after each task
5. **Push after each section**: Keep PR updated
6. **SEESAW continuously**: Don't wait for CodeRabbit, keep executing
7. **No status updates**: Only report when section complete or blocked
8. **Auto-advance**: When section done, immediately start next section

### Autonomous Execution Rules

- **NEVER** ask "should I proceed?" - just proceed
- **NEVER** give task-by-task updates - work silently
- **NEVER** wait for approval between tasks
- **ALWAYS** continue to next task automatically
- **ONLY** stop when: error requires user input, or all sections complete
- **COMMIT** after each task or logical group
- **PUSH** after each section completes

### Section Completion

When a section completes:
1. Update tasks.md checkboxes
2. Update GitHub issue checkbox
3. Commit: `git commit -m "feat({spec}): complete section N"`
4. Push and trigger CodeRabbit: `@coderabbitai review`
5. Immediately start next section (don't wait for review)

## SEESAW Pattern (Autonomous Agent-to-Agent Loop)

SEESAW = **S**ubmit → **E**valuate → **E**xecute → **S**ubmit → **A**ssess → **W**rap

Continuous autonomous loop for agent-to-agent collaboration with CodeRabbit:

### The Loop

```
┌─────────────────────────────────────────────────────────┐
│                    SEESAW LOOP                          │
│                                                         │
│  1. SUBMIT    → Push commits to feature branch          │
│       ↓                                                 │
│  2. EVALUATE  → Trigger CodeRabbit review               │
│       ↓                                                 │
│  3. EXECUTE   → Continue next task while waiting        │
│       ↓                                                 │
│  4. SUBMIT    → Push next batch of commits              │
│       ↓                                                 │
│  5. ASSESS    → Fetch and process CodeRabbit feedback   │
│       ↓                                                 │
│  6. WRAP      → Resolve threads, mark complete          │
│       ↓                                                 │
│  └──────────→ Loop back to step 1                       │
└─────────────────────────────────────────────────────────┘
```

### Step 1: SUBMIT - Push Work

```bash
git add -A
git commit -m "feat({spec}): {task description}"
git push origin feature/{spec-name}
```

### Step 2: EVALUATE - Trigger Review

```bash
gh pr comment {pr-number} --body "@coderabbitai review"
```

### Step 3: EXECUTE - Continue Working

Don't wait for review. Continue with next task immediately.

### Step 4: SUBMIT - Push Next Batch

```bash
git add -A
git commit -m "feat({spec}): {next task description}"
git push origin feature/{spec-name}
```

### Step 5: ASSESS - Process Feedback

```bash
# Get CodeRabbit comments
gh api repos/{owner}/{repo}/pulls/{pr-number}/comments \
  --jq '.[] | select(.user.login == "coderabbitai") | {id: .id, body: .body, path: .path, line: .line}'
```

### Step 6: WRAP - Resolve and Close

```bash
# Reply to CodeRabbit with resolution
gh pr comment {pr-number} --body "@coderabbitai I've addressed your feedback:
- Fixed {issue 1} in commit abc123
- Refactored {issue 2} per suggestion"
```

### Autonomous Decision Making

When processing CodeRabbit feedback:

| Feedback Type | Action |
|---------------|--------|
| Valid bug | Fix immediately, commit, resolve thread |
| Style suggestion | Apply if reasonable, resolve thread |
| False positive | Reply with explanation, resolve thread |
| Question | Answer with context, resolve thread |
| Major refactor | Create follow-up issue, note in thread |

## Error Handling

If CodeRabbit is unresponsive:

```bash
# Check CodeRabbit status
gh api repos/{owner}/{repo}/installation --jq '.id'

# Manual review request
gh pr comment {pr-number} --body "@coderabbitai please review this PR"

# Fallback: request human review
gh pr edit {pr-number} --add-reviewer {username}
```