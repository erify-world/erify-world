#!/bin/bash

# Script to set up gh-pages branch content
# This script should be run from the repository root

echo "Setting up gh-pages branch..."

# Create or switch to gh-pages branch
if git show-ref --verify --quiet refs/heads/gh-pages; then
    echo "Switching to existing gh-pages branch..."
    git checkout gh-pages
else
    echo "Creating new gh-pages branch..."
    git checkout --orphan gh-pages
    git rm -rf . 2>/dev/null || true
fi

# Copy content to gh-pages branch
echo "Copying content..."
cp -r gh-pages-content/* . 2>/dev/null || true
cp gh-pages-content/.nojekyll . 2>/dev/null || true

# Add and commit changes
git add .
git commit -m "Update GitHub Pages content" || echo "No changes to commit"

echo "gh-pages branch setup complete!"
echo "To push: git push origin gh-pages"