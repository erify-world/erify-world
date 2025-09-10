# 🏷️ ERIFY™ Labels Reference

This document outlines the labeling system used in the ERIFY™ World repository to help contributors understand how issues and pull requests are categorized.

## 📋 Label Categories

### 🔧 Types
Labels that describe the nature of the contribution:

| Label | Color | Description |
|-------|--------|-------------|
| `type: docs` | `#0366d6` | Documentation changes |
| `type: chore` | `#d4c5f9` | Chore / maintenance |
| `bug` | `#d73a49` | Something isn't working |
| `enhancement` | `#a2eeef` | New feature or request |
| `question` | `#d876e3` | Further information is requested |

### 🎯 Areas
Labels that indicate which part of the system is affected:

| Label | Color | Description |
|-------|--------|-------------|
| `area: ci` | `#0e8a16` | CI / workflows |
| `area: infra` | `#5319e7` | Infrastructure |
| `area: stream` | `#fbca04` | Cloudflare Stream |
| `area: frontend` | `#1d76db` | Frontend / UI |
| `area: backend` | `#d93f0b` | Backend / API |

### ⚡ Priority
Labels that indicate urgency or importance:

| Label | Color | Description |
|-------|--------|-------------|
| `priority: high` | `#b60205` | High priority |

### 📊 Status
Labels that track the current state:

| Label | Color | Description |
|-------|--------|-------------|
| `status: wip` | `#bfdadc` | Work in progress |
| `needs-review` | `#fbca04` | Waiting for review |

### 🤝 Community
Labels to help community contributors:

| Label | Color | Description |
|-------|--------|-------------|
| `good first issue` | `#7057ff` | Great for first-time contributors |
| `help wanted` | `#008672` | Community help appreciated |

## 🤖 Automated Labeling

### Pull Requests
The repository automatically applies labels to PRs based on:

**Path-based labeling** (via `.github/labeler.yml`):
- Files changed determine area labels
- Documentation files get `type: docs`
- CI/workflow files get `area: ci`
- Frontend files get `area: frontend`
- Backend files get `area: backend`

**Keyword-based labeling** (via PR title/description):
- `[WIP]`, `draft:`, "work in progress" → `status: wip`
- "docs", "documentation", "readme" → `type: docs`
- "workflow", "github actions", "ci/cd" → `area: ci`
- "chore", "maintenance", "cleanup" → `type: chore`
- "urgent", "critical", "hotfix" → `priority: high`

### Issues
Issues are automatically labeled based on keywords in title/description:

- **Bug detection**: "bug", "error", "broken", "fix" → `bug`
- **Feature requests**: "feature", "enhancement", "request" → `enhancement`
- **Documentation**: "docs", "documentation", "guide" → `type: docs`
- **Questions**: "question", "how to", "help", "?" → `question`
- **Community**: "good first issue", "beginner" → `good first issue`
- **Help wanted**: "help wanted", "assistance" → `help wanted`
- **Priority**: "urgent", "critical", "blocking" → `priority: high`

## 🛠️ Setting Up Labels

If labels don't exist in your repository, run these commands locally:

```bash
# Core types/areas
gh label create "type: docs"      -c "#0366d6" -d "Documentation changes" || true
gh label create "type: chore"     -c "#d4c5f9" -d "Chore / maintenance"   || true
gh label create "area: ci"        -c "#0e8a16" -d "CI / workflows"        || true
gh label create "area: infra"     -c "#5319e7" -d "Infrastructure"        || true
gh label create "area: stream"    -c "#fbca04" -d "Cloudflare Stream"     || true
gh label create "area: frontend"  -c "#1d76db" -d "Frontend / UI"         || true
gh label create "area: backend"   -c "#d93f0b" -d "Backend / API"         || true
gh label create "priority: high"  -c "#b60205" -d "High priority"         || true
gh label create "status: wip"     -c "#bfdadc" -d "Work in progress"      || true
gh label create "good first issue" -c "#7057ff" -d "Great for first-time contributors" || true
gh label create "help wanted"      -c "#008672" -d "Community help appreciated"        || true
```

## 📝 Manual Labeling Guidelines

### For Maintainers
When reviewing PRs and issues, consider adding these labels manually:

- Use `good first issue` for simple, well-defined tasks
- Add `help wanted` when community input would be valuable
- Apply `priority: high` for critical fixes or important features
- Use `needs-review` when a PR is ready for maintainer attention

### For Contributors
When creating issues or PRs:

- Use descriptive titles that include relevant keywords
- Mention specific areas in your description (frontend, backend, CI, etc.)
- Mark drafts or work-in-progress items clearly
- Ask questions using clear question words

## 🔗 Related Workflows

The auto-labeling system works alongside:

- **Triage workflow** (`.github/workflows/triage.yml`) - Adds `needs-review` and assigns maintainers
- **Auto-label workflow** (`.github/workflows/auto-label.yml`) - Path and keyword-based PR labeling
- **Auto-label issues workflow** (`.github/workflows/auto-label-issues.yml`) - Keyword-based issue labeling

---

💡 **Tip**: Labels help everyone understand the scope and priority of contributions. When in doubt, the automated system will help, but don't hesitate to ask maintainers for guidance!