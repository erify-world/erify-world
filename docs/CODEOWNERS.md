# CODEOWNERS Explainer

## What is CODEOWNERS?

The CODEOWNERS file is a GitHub feature that automatically routes pull request reviews to specific teams or individuals based on the files being changed. When a pull request is opened, GitHub automatically requests reviews from the appropriate code owners.

## How It Works

### File Location
The CODEOWNERS file is located at `.github/CODEOWNERS` in the repository root.

### Pattern Matching
CODEOWNERS uses gitignore-style patterns to match file paths:
- `*` matches any file in the current directory
- `**/*` matches any file in any subdirectory
- `*.js` matches all JavaScript files
- `/api/` matches the api directory at the repository root

### Team Structure

Our repository uses the following team structure:

#### @erify-world/frontend
**Responsible for:** User interface, styling, and client-side code
- `/components/` - UI components
- `/styles/` - CSS and SCSS files  
- `/styleguide/` - Style guide and design system
- `*.html`, `*.css`, `*.scss` - Web markup and styling files

#### @erify-world/backend  
**Responsible for:** Server-side code, APIs, and data processing
- `/api/` - API endpoints and server logic
- Backend-specific files and directories

#### @erify-world/ops
**Responsible for:** Infrastructure, CI/CD, deployment, and DevOps
- `.github/workflows/` - GitHub Actions workflows
- `docker*`, `*.dockerfile` - Docker configuration
- `package.json`, `*.yml`, `*.yaml` - Configuration files
- Infrastructure and deployment scripts

#### @erify-world/docs
**Responsible for:** Documentation, README files, and technical writing
- `/docs/` - Documentation directory
- `*.md` - Markdown documentation files
- `README*`, `LICENSE` - Project documentation

### Default Reviewers

All files are assigned to `@erify-world` as a fallback to ensure every change gets reviewed.

### Special Files

Some critical files require review from multiple teams:
- `LICENSE` → ops + docs teams
- `CODEOWNERS` → ops + docs teams  
- `package.json` → ops + backend teams

## Automatic Review Assignment

### When Reviews Are Requested
- Pull request is opened
- Pull request is moved from draft to ready for review
- Pull request is reopened

### When Reviews Are Skipped
Auto-assignment is skipped when these labels are present:
- `chore` - Maintenance tasks
- `dependencies` - Dependency updates
- `docs-only` - Documentation-only changes
- `do not review` - Skip all automated review assignment

### Fallback Reviewers
If team mentions cannot be resolved, fallback reviewers from `.github/auto_assign.yml` will be assigned instead.

## Path-Based Labeling

Pull requests are automatically labeled based on the files changed:

- **area:web** - Frontend/UI changes
- **area:api** - Backend/API changes  
- **area:infra** - Infrastructure/DevOps changes
- **area:docs** - Documentation changes
- **docs-only** - Changes only to documentation files

## Best Practices

### For Contributors
1. **Review the checklist** in the PR template before submitting
2. **Apply appropriate labels** if you want to skip auto-assignment
3. **Tag specific teams** in comments if you need additional review
4. **Keep changes focused** to minimize review complexity

### For Reviewers
1. **Review within your expertise** - focus on your team's responsibilities
2. **Request additional reviewers** if changes affect other areas
3. **Use GitHub's review features** - approve, request changes, or comment
4. **Provide constructive feedback** to help improve code quality

### For Maintainers
1. **Keep teams updated** - ensure team membership reflects current responsibilities
2. **Update CODEOWNERS** when repository structure changes
3. **Monitor assignment effectiveness** and adjust patterns as needed
4. **Document exceptions** for special cases or complex ownership

## Troubleshooting

### Teams Not Found
If you see "team not found" errors:
1. Verify teams exist in the GitHub organization
2. Check team visibility settings (teams should be visible)
3. Ensure team names match exactly (case-sensitive)
4. Fallback reviewers will be used automatically

### Too Many/Few Reviewers
- Adjust patterns in CODEOWNERS for more precise matching
- Update `numberOfReviewers` in `.github/auto_assign.yml`
- Use labels to skip assignment when appropriate

### Assignment Not Working
1. Check that workflows have proper permissions
2. Verify PR is not in draft mode
3. Ensure skip labels are not present
4. Check workflow logs for error messages

## Related Files

- `.github/CODEOWNERS` - Team routing configuration
- `.github/workflows/auto-assign.yml` - Auto-assignment workflow
- `.github/auto_assign.yml` - Assignment configuration
- `.github/workflows/auto-label.yml` - Auto-labeling workflow
- `.github/labeler.yml` - Labeling rules