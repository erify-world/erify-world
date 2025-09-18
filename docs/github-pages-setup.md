# GitHub Pages Setup

This repository is configured to deploy to GitHub Pages from the `gh-pages` branch.

## Overview

- **Source Branch**: `gh-pages`
- **Workflow**: `.github/workflows/examples-pages.yml`
- **Deploy Trigger**: Pushes to `gh-pages` branch
- **Permissions**: Configured for GitHub Pages deployment with `id-token: write`

## Setup

The `gh-pages` branch has been initialized with:
- `.nojekyll` file (prevents Jekyll processing)
- `index.html` (basic landing page)
- `README.md` (branch documentation)

## Using the Setup Script

A setup script is provided to easily update the `gh-pages` branch:

```bash
./setup-gh-pages.sh
```

This script will:
1. Switch to or create the `gh-pages` branch
2. Copy content from `gh-pages-content/` directory
3. Commit changes
4. Provide instructions for pushing

## Workflow Details

The GitHub Pages workflow (`.github/workflows/examples-pages.yml`) includes:

- **Trigger**: Runs on pushes to `gh-pages` branch
- **Permissions**: 
  - `contents: read` - Read repository contents
  - `pages: write` - Write to GitHub Pages
  - `id-token: write` - Write OIDC token for deployment
- **Actions**: Uses official GitHub Pages actions for deployment

## Deployment Process

1. Push content to the `gh-pages` branch
2. The workflow automatically triggers
3. Content is uploaded and deployed to GitHub Pages
4. Site becomes available at the GitHub Pages URL

## Content Management

To update the site:
1. Modify files in `gh-pages-content/` directory
2. Run `./setup-gh-pages.sh`
3. Push the `gh-pages` branch

Or manually:
1. Switch to `gh-pages` branch
2. Add/modify content
3. Commit and push changes