# 💎🔥 Contributing to ERIFY™ World

Welcome to the **ERIFY™ Technologies** ecosystem! We're building luxury digital experiences that inspire the world, and we're excited you want to contribute.

> **"From the ashes to the stars ✨"** — Every contribution moves us closer to our vision of global-scale luxury tech.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** 14+ (for projects requiring Node.js)
- **Git** with SSH keys configured
- **GitHub account** with 2FA enabled
- **Familiarity** with conventional commits

### 1. Fork & Clone
```bash
# Fork the repository on GitHub, then:
git clone git@github.com:YOUR_USERNAME/erify-world.git
cd erify-world

# Add upstream remote
git remote add upstream git@github.com:erify-world/erify-world.git
```

### 2. Set Up Your Environment
```bash
# Install dependencies (if package.json exists)
npm install

# Create your feature branch
git checkout -b feat/your-amazing-feature
```

### 3. Make Your Changes
- Follow our [ERIFY™ UI Style Guide](./ERIFY_UI_Style_Guide.md) for design consistency
- Write clear, descriptive commit messages using [conventional commits](#commit-guidelines)
- Keep changes focused and atomic

---

## 🎯 CI Expectations & Standards

### Automated Checks
Our CI pipeline automatically validates:
- **Conventional commit** format compliance
- **Code quality** and style guidelines
- **Stream workflow** integration (for applicable changes)
- **Documentation** updates and accuracy

### PR Requirements
✅ **Before submitting your PR:**
- [ ] Commits follow [conventional commit format](#commit-guidelines)
- [ ] PR description uses our [template](./.github/PULL_REQUEST_TEMPLATE.md)
- [ ] Changes are **small and focused** (< 500 lines when possible)
- [ ] Documentation updated if needed
- [ ] Self-review completed

---

## 📋 PR Review Guidelines

### Review Process
1. **Automated triage** assigns `needs-review` label and @erify-world
2. **Maintainer review** within 48-72 hours
3. **Feedback cycle** with constructive suggestions
4. **Final approval** and merge to main

### What Reviewers Look For
- **Brand alignment** with ERIFY™ luxury standards
- **Code quality** and maintainability
- **Performance** considerations
- **Security** best practices
- **Accessibility** compliance (≥ 4.5:1 contrast)

---

## 🌊 Stream-Specific Requirements

### ERIFY Stream Integration
When contributing to Stream-related features:

- **Signed iframe token handling** must be secure and robust
- **Error handling** should be comprehensive with fallbacks
- **Deployment scripts** must follow our staging → production flow
- **Testing** on multiple browsers and devices

### Stream Workflow Checklist
- [ ] Signed mode compatibility verified
- [ ] Token refresh mechanisms tested
- [ ] Error scenarios handled gracefully
- [ ] Performance metrics within acceptable ranges
- [ ] Security audit completed for sensitive operations

---

## 📝 Commit Guidelines

We use **conventional commits** for automated changelog generation and semantic versioning.

### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Allowed Types
- `feat` — New feature or enhancement
- `fix` — Bug fix
- `docs` — Documentation updates
- `style` — Code style changes (formatting, no logic changes)
- `refactor` — Code refactoring without feature changes
- `perf` — Performance improvements
- `test` — Adding or fixing tests
- `chore` — Maintenance tasks
- `ci` — CI/CD pipeline changes

### Examples
```bash
feat(ui): add diamond blue accent to navigation bar

fix(stream): resolve signed iframe token refresh issue

docs(contributing): update Stream workflow requirements

style(components): format code according to ERIFY style guide
```

---

## 💡 Helpful Tips

### GitHub Saved Replies
Create saved replies for common responses:

**For reviewing PRs:**
```
Thanks for the contribution! A few quick notes:
- Consider breaking this into smaller PRs for easier review
- Please update the documentation for the new feature
- Ensure all commits follow our conventional format
```

**For feedback requests:**
```
This looks great overall! 🔥 Just a couple of adjustments needed:
- [specific feedback]
- [specific feedback]

Feel free to reach out if you need clarification on any points.
```

### Keep PRs Small
- **Aim for < 500 lines** of changes when possible
- **Single responsibility** — one feature/fix per PR
- **Split large features** into multiple logical PRs
- **Use draft PRs** for work-in-progress collaboration

### Best Practices
- **Write descriptive PR titles** that explain the change
- **Include screenshots** for UI/visual changes
- **Link related issues** using `Fixes #123` or `Relates to #456`
- **Test on multiple devices** for responsive changes
- **Ask questions** if requirements are unclear

---

## 🏗 Development Workflow

### Branch Naming
```bash
feat/add-voice-assistant-integration
fix/resolve-wallet-connection-issue
docs/update-api-documentation
chore/upgrade-dependencies
```

### Pre-Commit Checklist
- [ ] Code follows ERIFY™ style guidelines
- [ ] Commit message follows conventional format
- [ ] Changes are tested locally
- [ ] Documentation updated if needed
- [ ] No sensitive data committed

### Sync with Upstream
```bash
# Regularly sync your fork
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

---

## 🆘 Getting Help

### Resources
- **Style Guide:** [ERIFY_UI_Style_Guide.md](./ERIFY_UI_Style_Guide.md)
- **PR Template:** [.github/PULL_REQUEST_TEMPLATE.md](./.github/PULL_REQUEST_TEMPLATE.md)
- **CI Playbook:** [docs/CI-QA-Playbook.md](./docs/CI-QA-Playbook.md)

### Contact
- **Issues:** Open a GitHub issue for bugs or feature requests
- **Discussions:** Use GitHub Discussions for general questions
- **Direct:** Reach out to @erify-world for urgent matters

---

## 🌍 Community Guidelines

### Our Values
- **Excellence:** We strive for luxury-grade quality in everything
- **Innovation:** We embrace cutting-edge technology and creative solutions
- **Collaboration:** We support each other's growth and success
- **Respect:** We maintain professional, inclusive communication

### Code of Conduct
- Be respectful and professional in all interactions
- Provide constructive feedback with specific suggestions
- Welcome newcomers and help them learn our processes
- Focus on the work, not the person when reviewing

---

**Thank you for contributing to ERIFY™ World!** 🚀✨

*Together, we're building the future of luxury digital experiences.*