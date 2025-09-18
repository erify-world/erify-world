#!/bin/bash

# GitHub Pages Setup Verification Script
echo "Verifying GitHub Pages setup..."

# Check if gh-pages branch exists
if git show-ref --verify --quiet refs/heads/gh-pages; then
    echo "✅ gh-pages branch exists"
else
    echo "❌ gh-pages branch does not exist"
    exit 1
fi

# Check if .nojekyll exists on gh-pages branch
if git show gh-pages:.nojekyll >/dev/null 2>&1; then
    echo "✅ .nojekyll file exists on gh-pages branch"
else
    echo "❌ .nojekyll file missing on gh-pages branch"
    exit 1
fi

# Check if workflow file exists and has correct content
if [ -f ".github/workflows/examples-pages.yml" ]; then
    echo "✅ GitHub Pages workflow file exists"
    
    # Check for correct trigger
    if grep -q "gh-pages" .github/workflows/examples-pages.yml; then
        echo "✅ Workflow triggers on gh-pages branch"
    else
        echo "❌ Workflow does not trigger on gh-pages branch"
        exit 1
    fi
    
    # Check for permissions
    if grep -q "pages: write" .github/workflows/examples-pages.yml; then
        echo "✅ Workflow has pages: write permission"
    else
        echo "❌ Workflow missing pages: write permission"
        exit 1
    fi
    
    if grep -q "id-token: write" .github/workflows/examples-pages.yml; then
        echo "✅ Workflow has id-token: write permission"
    else
        echo "❌ Workflow missing id-token: write permission"
        exit 1
    fi
    
    if grep -q "contents: read" .github/workflows/examples-pages.yml; then
        echo "✅ Workflow has contents: read permission"
    else
        echo "❌ Workflow missing contents: read permission"
        exit 1
    fi
    
else
    echo "❌ GitHub Pages workflow file missing"
    exit 1
fi

echo ""
echo "🎉 All GitHub Pages setup requirements verified!"
echo ""
echo "Next steps:"
echo "1. Enable GitHub Pages in repository settings"
echo "2. Set source to 'Deploy from a branch'"
echo "3. Select 'gh-pages' as the source branch"
echo "4. Push content to gh-pages branch to trigger deployment"