# 🔧 Daily Maintenance Logbook — ai-feature-prioritizer

> This file is read and updated by the Daily Maintenance Squad agent on every run.
> It serves as persistent memory across sessions — what was done, what's pending, what to watch.

---

## 📋 Backlog (unfixed items from previous sweeps)
<!-- Items the agent found but couldn't fix in that run's budget. Next run picks these up first. -->

| Date Found | Category | File | Issue | Priority |
|------------|----------|------|-------|----------|

---

## ✅ Completed Log (most recent first)

### 2026-10-19 — Add Unit Tests for Scoring & Utility Logic
**Status:** ✅ Completed by ATLAS
**Fixed:**
- 🧪 Added `test/scoring.test.js` covering `calcRice`, `sanitizeCsvCell`, `groupBySprint`, `getSprintBadgeClass`, and `getScoreColor` using native Node test runner.
**PR:** `chore(atlas): add unit tests for scoring and utility logic [2026-10-19]`

### 2026-10-20 — Refactor RICE Score Calculations to Use Centralized Utility
**Status:** ✅ Completed by ATLAS
**Fixed:**
- Centralized inline RICE score calculations across `lib/llmProviders.js` and updated unit test script `scratch/check-scoring.mjs` to import directly from `lib/scoring.js`.
**PR:** `chore(atlas): refactor RICE score calculations to use centralized utility [2026-10-20]`

### 2026-10-18 — Enhance Workspace Form Validation and Accessibility
**Status:** ✅ Completed by ATLAS
**Fixed:**
- 🎨 Add visual error state highlights, `aria-invalid`, `aria-describedby` helper texts, and focus management to the workspace form in `app/analyze/page.js`.
**PR:** `chore(atlas): enhance workspace form validation and accessibility [2026-10-18]`

### 2026-10-17 — Fix Feedback Widget API Key Telemetry Leakage
**Status:** ✅ Completed by ATLAS
**Fixed:**
- 🛡️ Redact API keys, tokens, auth parameters, and bearer headers in `public/feedback_widget.js` console error logging. Safe JSON serialization prevents circular reference exceptions (CWE-532, CWE-209).
**PR:** `chore(atlas): fix API key leakage in feedback widget telemetry [2026-10-17]`

### 2026-10-15 — Initial Logbook + Jules Master Bulk Merge
**Status:** ✅ Bulk merge by Jules Master
**Fixed:**
- 🛡️ Sanitize BYOK API keys in modal (#98)
- 🛡️ Fix LLM score validation (#92)
- ⚡ Optimize cache key string generation in analyze page (#90)
- ⚡ Pre-allocate API provider Set and fast-path sprint parsing (#96)
- 🎨 Add accessible ARIA labels and titles to Settings navigation buttons (#95)
- 🎨 Add 1-click sample feature loader to workspace (#91)
**Deferred to backlog:**
- PR #93 (Bolt: hash calculation) — merge conflicts
- PR #94 (Sentinel: API key leakage) — merge conflicts ⚠️ HIGH PRIORITY
- PR #97 (Palette: form validation) — merge conflicts
**PR:** #90–98 (squash merged by Jules Master)

---

## ⚠️ Known Constraints & Gotchas

- **Default branch is `master`, not `main`.** Always target `master` for PRs.
- `app/analyze/page.js` is the most frequently touched file — Bolt, Palette, and Sentinel all modify it. High conflict risk. Coordinate changes.
- `public/feedback_widget.js` is loaded by external sites as a standalone script — changes affect production immediately with no build step.
- `lib/llmProviders.js` contains API provider logic — Sentinel and Bolt both touch it. Test with multiple provider keys.
- The app uses Next.js — verify commands with `package.json` before assuming `pnpm test` or `npm run lint`.
