# Issue Triage Steering

Guidelines for triaging incoming issues, bugs, and feature requests.

## Triage Workflow

### 1. Review New Issues

```bash
# List untriaged issues (no labels)
gh issue list --state open --json number,title,labels \
  --jq '.[] | select(.labels | length == 0) | "\(.number): \(.title)"'

# Or issues with "needs-triage" label
gh issue list --label "needs-triage"
```

### 2. Categorize Issue

Determine issue type and apply appropriate label:

| Type | Label | Description |
|------|-------|-------------|
| Bug | `bug` | Something broken |
| Feature | `feature` | New functionality |
| Enhancement | `enhancement` | Improve existing |
| Documentation | `docs` | Documentation only |
| Question | `question` | Needs clarification |
| Duplicate | `duplicate` | Already exists |
| Invalid | `invalid` | Not actionable |

```bash
gh issue edit {number} --add-label "bug"
```

### 3. Assess Priority

| Priority | Label | Criteria |
|----------|-------|----------|
| Critical | `priority:critical` | Core engine broken, blocking all work |
| High | `priority:high` | Major feature broken, blocking progress |
| Medium | `priority:medium` | Important but workaround exists |
| Low | `priority:low` | Nice to have, minor issue |

```bash
gh issue edit {number} --add-label "priority:high"
```

### 4. Categorize by System

| System | Label | Scope |
|--------|-------|-------|
| ECS Core | `ecs` | World, Loop, Entities |
| Looms | `looms` | Procedural generation |
| AI | `ai` | Decision engine, agents |
| Headless | `headless` | CLI, simulation |
| Mechanics | `mechanics` | RPG rules, equipment |

```bash
gh issue edit {number} --add-label "looms"
```

### 5. Assign to Milestone

```bash
gh issue edit {number} --milestone "v0.1 - RealmWalker Headless Core"
```

### 6. Remove Triage Label

```bash
gh issue edit {number} --remove-label "needs-triage"
```

## Triage Decision Tree

```
New Issue
    │
    ├─ Is it a duplicate?
    │   └─ Yes → Label "duplicate", close with reference
    │
    ├─ Is it valid/actionable?
    │   └─ No → Label "invalid", close with explanation
    │
    ├─ Is it a question?
    │   └─ Yes → Label "question", answer, close
    │
    ├─ Is it a bug?
    │   ├─ Yes → Label "bug"
    │   │   ├─ Critical? → "priority:critical", assign immediately
    │   │   ├─ High? → "priority:high", add to current milestone
    │   │   └─ Medium/Low? → appropriate priority, backlog
    │   │
    │   └─ No → Is it a feature?
    │       ├─ Yes → Label "feature"
    │       │   ├─ Has spec? → Label "spec", link to spec
    │       │   └─ Needs spec? → Create spec first
    │       │
    │       └─ No → Label "enhancement" or "docs"
    │
    └─ Assign system label and milestone
```

## RealmWalker-Specific Triage

### Known Issue Categories

#### Loom Framework Issues
- **Pattern function errors**: Check LoomDefinition has valid `pattern` function
- **Quantity threshold failures**: Adjust `verify` function thresholds
- **Schema validation failures**: Check Zod schema matches generated output
- **API rate limiting**: Implement retry logic or use mock mode

#### ECS Core Issues
- **Determinism failures**: Check PRNG seed consistency
- **Entity ID collisions**: Verify seed-based ID generation
- **Serialization errors**: Check component serialization completeness

#### Headless Simulation Issues
- **CLI command failures**: Check Commander.js configuration
- **Simulation hangs**: Check for infinite loops in game loop
- **Mock data issues**: Verify mock realm.json structure

### Quick Triage Commands

```bash
# Triage as Loom bug, high priority
gh issue edit {number} --add-label "bug" --add-label "looms" --add-label "priority:high"

# Triage as ECS enhancement, medium priority
gh issue edit {number} --add-label "enhancement" --add-label "ecs" --add-label "priority:medium"

# Triage as headless feature request
gh issue edit {number} --add-label "feature" --add-label "headless" --add-label "priority:low"
```

## Handling Duplicates

```bash
gh issue close {number} --comment "Duplicate of #{original-number}. Closing in favor of the original issue."
gh issue edit {number} --add-label "duplicate"
```

## Handling Invalid Issues

```bash
gh issue close {number} --comment "Closing as this doesn't appear to be actionable. Please reopen with more details if needed."
gh issue edit {number} --add-label "invalid"
```

## Stale Issue Management

```bash
# Find stale issues (no activity in 30 days)
gh issue list --state open --json number,title,updatedAt \
  --jq '.[] | select(.updatedAt < (now - 2592000 | todate)) | "\(.number): \(.title)"'

# Add stale label
gh issue edit {number} --add-label "stale"

# Comment on stale issue
gh issue comment {number} --body "This issue has been inactive for 30 days. Please comment if still relevant, otherwise it will be closed in 7 days."
```

## PR Feedback Triage (CodeRabbit)

When resuming work on an existing PR, triage CodeRabbit feedback:

### Get Pending Feedback

```bash
# Get unresolved review threads
gh api graphql -f query='
query($owner: String!, $repo: String!, $pr: Int!) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $pr) {
      reviewThreads(first: 50) {
        nodes {
          id
          isResolved
          path
          comments(first: 5) {
            nodes {
              body
              author { login }
            }
          }
        }
      }
    }
  }
}' -f owner="{owner}" -f repo="{repo}" -F pr={pr-number}
```

### Categorize Feedback

| Feedback Type | Action | Priority |
|---------------|--------|----------|
| Security issue | Fix immediately | Critical |
| Bug/Logic error | Fix before continuing | High |
| Performance suggestion | Evaluate, apply if reasonable | Medium |
| Style/formatting | Apply if quick, else defer | Low |
| False positive | Reply with explanation | Low |

### Batch Address Feedback

```bash
# After fixing multiple issues
git add -A
git commit -m "fix(realm-walker-v0-1): address CodeRabbit feedback

- Fixed security issue in X
- Resolved logic error in Y
- Applied style suggestions"

git push origin feature/realm-walker-v0-1

# Reply to CodeRabbit
gh pr comment {pr-number} --body "@coderabbitai I've addressed your feedback in the latest commit."
gh pr comment {pr-number} --body "@coderabbitai I've addressed your feedback in the latest commit."
