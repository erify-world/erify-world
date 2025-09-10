# ERIFY™ Smoke Test Review Checklist ✅

This checklist is for reviewers validating the **ERIFY™ Smoke Test Workflow** (`.github/workflows/erify-smoke-test.yml`).

---

## 🔐 Security & Secrets
- [ ] `CF_API_TOKEN` present and scoped (Stream Read/Write as needed)  
- [ ] If `require_signed_urls=true`, `CF_STREAM_SIGNING_KEY` exists  
- [ ] Secrets never echoed in logs  

## ⚙️ Behavior
- [ ] Workflow runs manually via `workflow_dispatch`  
- [ ] Echo step confirms pipeline alive 🟢  
- [ ] Key secrets checked (notice if missing, not blocking)  

## 📡 Announce (if extended later)
- [ ] Slack/Discord/Teams secrets detected properly  
- [ ] Dry-run mode respected (payloads logged only)  

## 📝 Quality
- [ ] Job summary shows clear outputs  
- [ ] CI environment uses **Node 20** where needed  
- [ ] `set -euo pipefail` used in scripts for strict handling  

---

**Reviewer Note:**  
This smoke test is intended as a baseline sanity check. Passing it confirms GitHub Actions + secrets are wired up for ERIFY™ pipelines.