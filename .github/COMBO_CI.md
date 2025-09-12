# Combo CI Workflow

The Combo CI workflow (`combo-ci.yml`) provides auto-detection of Node.js projects and conditional execution of npm steps, ensuring the CI pipeline remains green regardless of project structure.

## Features

### 🔍 Auto-Detection Logic
The workflow automatically detects Node.js projects using a priority-based approach:

1. **Root Priority**: Checks for `./package.json` first
2. **Known Subproject**: Looks for `./erify-discord/package.json`
3. **Depth Search**: Falls back to first `package.json` found within 2 directory levels

### ⚡ Conditional Execution
- **npm install**: Only runs when `package.json` is detected
- **npm test**: Only runs if both `package.json` exists AND test script is defined
- **npm run build**: Only runs if both `package.json` exists AND build script is defined

### 🔧 Debugging & Transparency
- Shows directory structure (up to depth 3)
- Lists all `package.json` files found
- Displays detection scope and results
- Outputs working directory for npm commands
- Provides clear summary of actions taken

## Triggers

The workflow runs on:
- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop` branches

## Example Scenarios

### Scenario 1: No Node.js Project (Current State)
```
Repository structure:
├── docs/
├── styles/
└── components/

Result: ✅ Gracefully skips npm steps, CI stays green
```

### Scenario 2: Root Package.json
```
Repository structure:
├── package.json  ← Detected (Priority 1)
├── docs/
└── styles/

Result: ✅ Runs npm steps in root directory
```

### Scenario 3: erify-discord Subproject
```
Repository structure:
├── erify-discord/
│   └── package.json  ← Detected (Priority 2)
├── docs/
└── styles/

Result: ✅ Runs npm steps in ./erify-discord/
```

### Scenario 4: Other Subproject
```
Repository structure:
├── frontend/
│   └── package.json  ← Detected (Priority 3)
├── docs/
└── styles/

Result: ✅ Runs npm steps in ./frontend/
```

## Maintenance

The workflow is designed to be:
- **Future-proof**: Handles multiple project structures
- **Zero-maintenance**: No manual updates needed when adding projects
- **Fail-safe**: Always keeps CI green, never blocks on missing Node.js setup

## Customization

To modify detection behavior:
1. Edit the `detect_project_path()` function in the workflow
2. Add new known subprojects to Priority 2 checks
3. Adjust depth limit (currently 2) in Priority 3 search