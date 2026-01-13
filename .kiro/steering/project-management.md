# Project Management Steering

Guidelines for managing GitHub issues, milestones, projects, and tracking spec progress.

## GitHub CLI Setup

Ensure gh is authenticated with required scopes:

```bash
# Check current auth
gh auth status

# Add project scope if needed
gh auth refresh -s project

# Verify repo access
gh repo view
```

## Milestone Management

### Create Milestone for Spec

```bash
gh api repos/{owner}/{repo}/milestones \
  --method POST \
  -f title="v0.1 - RealmWalker Headless Core" \
  -f description="Implementation of realm-walker-v0-1 spec" \
  -f due_on="2026-02-01T00:00:00Z" \
  -f state="open"
```

### List Milestones

```bash
gh api repos/{owner}/{repo}/milestones --jq '.[] | "\(.number): \(.title) (\(.open_issues) open)"'
```

### Update Milestone Progress

```bash
# Close milestone when complete
gh api repos/{owner}/{repo}/milestones/{number} \
  --method PATCH \
  -f state="closed"
```

## Issue Management

### Issue Templates

#### Feature Issue (Spec Implementation)
```bash
gh issue create \
  --title "🚀 feat: {Spec Title}" \
  --body "## Overview
{Brief description}

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

## Acceptance Criteria
- All tasks in tasks.md complete
- All tests passing
- CodeRabbit review addressed

## Links
- PR: TBD
- Milestone: TBD" \
  --label "feature" \
  --label "spec"
```

#### Bug Issue
```bash
gh issue create \
  --title "🐛 bug: {Short Description}" \
  --body "## Description
{What's broken}

## Steps to Reproduce
1. 
2. 
3. 

## Expected Behavior
{What should happen}

## Actual Behavior
{What actually happens}

## Environment
- OS: 
- Node Version: 
- pnpm Version: 

## Logs
\`\`\`
{Error output}
\`\`\`" \
  --label "bug"
```

### Link Issues

```bash
# Add issue to milestone
gh issue edit {number} --milestone "{Milestone Title}"

# Add labels
gh issue edit {number} --add-label "priority:high"

# Assign to user
gh issue edit {number} --add-assignee "@me"
```

## Progress Tracking

### Update Issue Progress

When completing spec sections, update the tracking issue:

```bash
# Get current issue body
BODY=$(gh issue view {number} --json body --jq '.body')

# Update checkbox (manual edit or script)
# Mark "- [ ] Section 1" as "- [x] Section 1"

gh issue edit {number} --body "$UPDATED_BODY"
```

### Add Progress Comment

```bash
gh issue comment {number} --body "## Progress Update

✅ Completed Section 1: Core Engine Stabilization
- Fixed schema validation tests
- Resolved entity ID generation issues

🔄 Starting Section 2: Loom Framework Fixes

**Next steps:**
- Fix Universal Loom orchestration error
- Adjust content generation thresholds"
```

## Labels

### Standard Labels for RealmWalker

```bash
# Create standard labels
gh label create "feature" --color "0E8A16" --description "New feature"
gh label create "bug" --color "D73A4A" --description "Something isn't working"
gh label create "spec" --color "1D76DB" --description "Has associated spec"
gh label create "headless" --color "7057FF" --description "Headless/CLI related"
gh label create "looms" --color "FBCA04" --description "Loom framework related"
gh label create "ecs" --color "0E8A16" --description "ECS/Core engine related"
gh label create "ai" --color "D876E3" --description "AI system related"
gh label create "priority:high" --color "B60205" --description "High priority"
gh label create "priority:medium" --color "FBCA04" --description "Medium priority"
gh label create "priority:low" --color "0E8A16" --description "Low priority"
gh label create "blocked" --color "D93F0B" --description "Blocked by dependency"
gh label create "needs-review" --color "7057FF" --description "Needs code review"
```

## RealmWalker-Specific Tracking

### Test Status Tracking

Track test suite health in issues:

```bash
gh issue comment {number} --body "## Test Status

| Package | Tests | Status |
|---------|-------|--------|
| @realm-walker/core | 5 | ⚠️ 1 failing |
| @realm-walker/looms | 11 | ⚠️ 3 failing |
| @realm-walker/cli | 1 | ✅ passing |
| @realm-walker/mechanics | 0 | N/A |
| @realm-walker/ai | 0 | N/A |

**Failing Tests:**
- core: Slots.test.ts - schema validation mismatch
- looms: UniversalLoom.live.test.ts - def.pattern error
- looms: IsolatedLooms.live.test.ts - quantity thresholds"
```

### Loom Registry Status

Track Loom implementation status:

```bash
gh issue comment {number} --body "## Loom Registry Status

| Loom | Priority | Status |
|------|----------|--------|
| WorldLoom | CRITICAL | ✅ Working |
| FactionLoom | CRITICAL | ✅ Working |
| ClassLoom | CRITICAL | ✅ Working |
| ItemLoom | MEDIUM | ✅ Working |
| BestiaryLoom | MEDIUM | ✅ Working |
| DungeonLoom | MEDIUM | ✅ Working |
| ShopLoom | LOW | ✅ Working |
| TalentLoom | LOW | ✅ Working |
| NpcLoom | MEDIUM | ✅ Working |
| AbilityLoom | MEDIUM | ⚠️ Quantity issue |
| DialogueLoom | LOW | ⚠️ Quantity issue |
| HistoryLoom | HIGH | ⏳ Not tested |
| PantheonLoom | HIGH | ⏳ Not tested |
| QuestLoom | HIGH | ⏳ Not tested |
| HeroLoom | HIGH | ⏳ Not tested |"
```