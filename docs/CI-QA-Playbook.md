# 🔍💎 ERIFY™ CI-QA Playbook

**Crown-tier quality assurance for the ERIFY™ ecosystem** — A comprehensive guide for reviewers, maintainers, and CI validation procedures.

*From the ashes to the stars ✨*

---

## 🚀 Quick Reference

### PR Review Checklist
- [ ] **Brand Compliance**: Follows ERIFY™ design standards
- [ ] **Stream Workflow**: Media handling works correctly
- [ ] **Accessibility**: Meets WCAG 2.1 AA standards
- [ ] **Performance**: No regression in Core Web Vitals
- [ ] **Security**: Signed tokens and data protection
- [ ] **Mobile**: Responsive design maintained

### CI Status Quick Check
```bash
# Check all workflow statuses
gh pr checks

# View specific workflow logs
gh run view --log

# Re-run failed checks
gh run rerun
```

---

## 🎯 ERIFY™ Smoke Test Procedures

### Core Functionality Validation

#### 1. Visual Brand Consistency
```checklist
✅ Color palette matches ERIFY™ standards
✅ Typography uses approved fonts (Neue Haas Grotesk/Gilroy)
✅ Glow system implementation (L1/L2/L3 hierarchy)
✅ Proper spacing using 8px base unit
✅ Contrast ratios meet 4.5:1 minimum
```

#### 2. Interactive Elements
```checklist
✅ Buttons have proper hover/focus states
✅ Touch targets are minimum 44×44px
✅ Focus indicators visible and branded
✅ Animations respect prefers-reduced-motion
✅ Loading states provide clear feedback
```

#### 3. Layout & Responsiveness
```checklist
✅ Mobile breakpoints work correctly
✅ Content reflows properly on all screen sizes
✅ Navigation remains functional on touch devices
✅ Images and media scale appropriately
✅ Text remains readable at all zoom levels
```

### Stream Workflow Validation

#### 1. Upload Functionality
```bash
# Test stream upload with signed token
curl -X POST https://api.erify.world/stream/upload \
  -H "Authorization: Bearer $SIGNED_TOKEN" \
  -F "file=@test-video.mp4"

# Verify response includes proper stream ID
```

#### 2. Playback Verification
```checklist
✅ Video loads within 2 seconds
✅ Audio quality maintains clarity
✅ Seeking works smoothly
✅ Full-screen mode functions
✅ Mobile controls are responsive
```

#### 3. Announce Channel Integration
```checklist
✅ New streams appear in announce channel
✅ Metadata displays correctly (title, duration, etc.)
✅ Thumbnails generate and load quickly
✅ Social sharing links work properly
✅ Engagement metrics track correctly
```

---

## 🔒 Security & Signed Mode Requirements

### Signed Token Validation
```javascript
// Example token verification
const verifySignedToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.permissions.includes('stream:upload');
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};
```

### Security Checklist
- [ ] **Input Sanitization**: All user inputs properly escaped
- [ ] **Token Expiry**: JWT tokens have reasonable expiration times
- [ ] **HTTPS Only**: All endpoints use secure connections
- [ ] **CORS Configuration**: Properly configured for expected origins
- [ ] **Rate Limiting**: API endpoints have appropriate rate limits

---

## 🔧 CI Workflow Configuration

### Automated Triage (triage.yml)
```yaml
# Key validation points:
- PR not in draft mode
- Not from common bots (dependabot, github-actions)
- Automatically adds 'needs-review' label
- Assigns @erify-world for review
```

### Stream Upload Workflow (stream-upload-and-announce.yml)
```yaml
# Validation steps:
- Node.js 14+ environment setup
- Dependency installation and caching
- Signed iframe token handling test
- Core functionality test suite
- Deployment to staging environment
- Error handling and rollback procedures
```

### Examples Pages Workflow (examples-pages.yml)
```yaml
# GitHub Pages deployment for documentation
- Static site generation
- Asset optimization
- Cross-browser testing
- Accessibility validation
```

---

## 📊 Performance Baselines

### Core Web Vitals Targets
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Stream Performance Metrics
- **Upload Start Time**: < 1s for initialization
- **Encoding Speed**: Real-time or faster
- **Playback Buffer**: < 3s initial buffer
- **Seek Performance**: < 500ms seek time

### Monitoring Commands
```bash
# Lighthouse CI for performance testing
npx lhci autorun

# Bundle size analysis
npx webpack-bundle-analyzer dist/stats.json

# Stream performance testing
npm run test:stream-performance
```

---

## 🛠️ Troubleshooting Guide

### Common CI Failures

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for version conflicts
npm ls

# Update dependencies if needed
npm audit fix
```

#### Stream Upload Issues
```bash
# Check signed token validity
node -e "console.log(require('jsonwebtoken').decode(process.env.STREAM_TOKEN))"

# Verify file permissions
ls -la uploads/

# Test with minimal payload
curl -X POST /api/stream/test -d '{"test": true}'
```

#### Deployment Failures
```bash
# Check deployment logs
gh api repos/erify-world/erify-world/deployments

# Verify environment variables
printenv | grep ERIFY

# Test staging environment
curl -f https://staging.erify.world/health
```

### Debug Mode Activation
```bash
# Enable verbose CI logging
export CI_DEBUG=true

# Run tests with detailed output
npm test -- --verbose

# Stream debugging mode
export STREAM_DEBUG=true
```

---

## 📈 Quality Metrics & KPIs

### Code Quality Thresholds
- **Test Coverage**: Minimum 80%
- **ESLint Score**: Zero errors, warnings < 5
- **TypeScript**: Strict mode compliance
- **Bundle Size**: < 500KB gzipped for core

### User Experience Metrics
- **Page Load Time**: < 3s on 3G networks
- **Time to Interactive**: < 5s
- **Error Rate**: < 0.1% of user sessions
- **Accessibility Score**: 100/100 (aXe)

### Stream Quality Metrics
- **Encoding Success Rate**: > 99.5%
- **Playback Success Rate**: > 99.9%
- **Average Upload Time**: < 10s for 1MB files
- **User Engagement**: > 85% completion rate

---

## 🎨 Brand Quality Assurance

### Visual Design Review
```checklist
✅ Glow effects use approved CSS custom properties
✅ Animations follow ERIFY™ motion principles
✅ Color usage matches brand guidelines
✅ Typography hierarchy is consistent
✅ Spacing follows 8px grid system
```

### Content Standards
```checklist
✅ Tone matches luxury, cinematic brand voice
✅ Technical accuracy verified
✅ Accessibility considerations documented
✅ Cross-platform compatibility confirmed
✅ SEO optimization implemented
```

---

## 🚨 Emergency Procedures

### Critical Bug Response
1. **Immediate**: Create hotfix branch from main
2. **Assess**: Determine scope and user impact
3. **Fix**: Minimal change to resolve issue
4. **Test**: Rapid but thorough validation
5. **Deploy**: Emergency deployment procedures
6. **Monitor**: Close monitoring post-deployment

### Rollback Procedures
```bash
# Quick rollback to previous version
git revert HEAD
git push origin main

# Database rollback (if applicable)
npm run db:rollback

# CDN cache invalidation
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache"
```

---

## 📞 Escalation Contacts

### Primary Contacts
- **Lead Maintainer**: [@erify-world](https://github.com/erify-world)
- **Technical Issues**: Create GitHub issue with `urgent` label
- **Security Concerns**: security@erify.world (private)
- **Infrastructure**: ops@erify.world

### Response Time SLAs
- **Critical (P0)**: 1 hour response
- **High (P1)**: 4 hours response
- **Medium (P2)**: 24 hours response
- **Low (P3)**: 72 hours response

---

## 📚 Additional Resources

### Documentation Links
- [ERIFY™ UI Style Guide](./ERIFY_UI_Style_Guide.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [GitHub Workflows Documentation](./.github/workflows/)
- [PR Template](./.github/PULL_REQUEST_TEMPLATE.md)

### External Tools
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [aXe Accessibility Testing](https://www.deque.com/axe/)
- [WebPageTest](https://www.webpagetest.org/)
- [Vercel Analytics](https://vercel.com/analytics)

---

**💎🔥 Quality is not an act, but a habit. Every review, every test, every deployment reflects the ERIFY™ commitment to excellence.**

*Maintaining crown-tier standards, one commit at a time.* ✨