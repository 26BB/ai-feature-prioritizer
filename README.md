# PriorityAI — AI Feature Prioritization Dashboard

> Input your product feature ideas. Get RICE scores, an effort vs. impact matrix, and a sprint roadmap — powered by NVIDIA NIM in seconds.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://01-feature-prioritizer.vercel.app)
![Powered by NVIDIA NIM](https://img.shields.io/badge/Powered%20by-NVIDIA%20NIM-76b900?style=for-the-badge&logo=nvidia)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![AI PM Portfolio](https://img.shields.io/badge/AI%20PM-Portfolio%20Project%201%2F5-f59e0b?style=for-the-badge)

🌐 **Live App:** [https://01-feature-prioritizer.vercel.app](https://01-feature-prioritizer.vercel.app)

---

## What It Does

PriorityAI is a real, working AI product tool built as part of an AI Product Manager portfolio. It solves a genuine PM pain point: **feature prioritization at speed**.

You input feature ideas → NVIDIA's Llama 3.3 70B model scores each one using the **RICE framework** → you get:

- **Score Cards** — ranked feature cards with RICE breakdown, AI reasoning, and risk tags
- **Matrix Chart** — an interactive effort vs. impact bubble chart (2×2 quadrants)
- **Sprint Roadmap** — features grouped into `NOW / NEXT / LATER` swim lanes
- **CSV Export** — download results for stakeholder sharing

**Interview hook:** *"I built the prioritization tool I wish I had when shipping features at scale."*

---

## RICE Framework

$$\text{RICE Score} = \frac{\text{Reach} \times \text{Impact} \times \text{Confidence}}{\text{Effort}}$$

| Component | Scale | Meaning |
|-----------|-------|---------|
| **Reach** | 1–10 | Users impacted per quarter |
| **Impact** | 1–10 | How much it moves key metrics |
| **Confidence** | 10–100% | How certain we are in estimates |
| **Effort** | 1–10 | Person-months to build |

Sprint assignment:
- **NOW** — RICE > 500 and Effort ≤ 5
- **NEXT** — RICE 200–500 or Effort 5–7
- **LATER** — RICE < 200 or Effort > 7

---

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 16 (App Router) | API routes + pages in one project |
| Styling | Vanilla CSS + CSS Modules | Full control, zero framework overhead |
| LLM | NVIDIA NIM — Llama 3.3 70B | OpenAI-compatible, fast, free tier available |
| Charts | Chart.js (dynamic import) | Lazy-loaded — only shipped when Matrix tab opens |
| Export | Native `Blob` + `URL` API | Zero dependency CSV export |

---

## Project Structure

```
01-feature-prioritizer/
│
├── app/
│   ├── globals.css              # Design tokens (amber theme, glassmorphism)
│   ├── layout.js                # Root layout — Sora + Inter fonts, SEO metadata
│   ├── page.js                  # Home: feature input form
│   ├── page.module.css          # Scoped styles for home page
│   │
│   ├── results/
│   │   ├── page.js              # Results: Score Cards, Matrix Chart, Roadmap tabs
│   │   └── page.module.css      # Scoped styles for results page
│   │
│   └── api/
│       └── prioritize/
│           └── route.js         # POST /api/prioritize — calls NVIDIA NIM
│
├── lib/
│   ├── nvidia.js                # NVIDIA NIM client (OpenAI-compatible)
│   ├── prompts.js               # Builds the structured RICE scoring prompt
│   └── scoring.js               # Pure utils: calcRice, groupBySprint, color helpers
│
├── scratch/
│   └── check-scoring.mjs        # Self-check script (run with: node scratch/check-scoring.mjs)
│
├── .env.local                   # NVIDIA_API_KEY (never committed)
├── .env.example                 # Template for new contributors
└── next.config.mjs
```

---

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd 01-feature-prioritizer
npm install
```

### 2. Set up your NVIDIA API key

```bash
cp .env.example .env.local
# Then edit .env.local and add your key:
# NVIDIA_API_KEY=nvapi-your-key-here
```

Get a free key at [build.nvidia.com](https://build.nvidia.com).

### 3. Run locally

```bash
npm run dev
# → http://localhost:3000
```

### 4. Verify the scoring logic

```bash
node scratch/check-scoring.mjs
# → 6 passed · 0 failed
```

---

## Usage

1. **Add features** — fill in name, description, and category for each idea
2. **Click "Analyze Features →"** — NVIDIA AI scores each one in ~5–10 seconds
3. **Explore results** across three tabs:
   - **Score Cards** — detailed RICE breakdown per feature
   - **Matrix Chart** — visualize effort vs. impact positioning
   - **Roadmap** — sprint-grouped swim lanes
4. **Export CSV** — share with your team or attach to a PRD

---

## Design System

The UI uses a **Warm Obsidian + Amber Gold** theme — think Bloomberg Terminal meets Figma.

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-base` | `#0f0d0a` | Page background |
| `--primary` | `#f59e0b` | Amber gold — primary actions, scores |
| `--secondary` | `#10b981` | Emerald — NOW sprint, success states |
| `--danger` | `#f43f5e` | Rose — risks, low scores, high effort |
| `--font-headline` | Sora | All headings |
| `--font-body` | Inter | Body text, labels |

---

## API Reference

### `POST /api/prioritize`

**Request body:**
```json
{
  "features": [
    {
      "name": "AI Auto-complete",
      "description": "Suggest completions as users type in the search bar",
      "category": "AI/ML"
    }
  ]
}
```

**Response:**
```json
{
  "features": [
    {
      "name": "AI Auto-complete",
      "reach": 8,
      "impact": 9,
      "confidence": 85,
      "effort": 3,
      "rice_score": 2040,
      "sprint": "NOW",
      "reasoning": "High reach and impact with manageable effort. Strong confidence given existing ML infra.",
      "risks": ["Model latency on mobile", "Training data quality"],
      "category": "AI/ML"
    }
  ],
  "model": "meta/llama-3.3-70b-instruct"
}
```

Limits: 1–10 features per request.

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| `sessionStorage` for results | Simplest zero-server-state handoff between pages. Ceiling: same-tab only. |
| Dynamic `import('chart.js')` | Chart.js is only loaded when the Matrix tab opens — keeps initial page load fast. |
| Bracket extraction for JSON | `indexOf('[')` + `lastIndexOf(']')` is resilient to LLM preamble text; regex strip is not. |
| Case-insensitive sprint grouping | LLMs sometimes return `"Now"` instead of `"NOW"` — `.toUpperCase()` prevents silent data loss. |
| Native `Blob` CSV export | No dependency needed — the Web API covers it completely. |

---

## What I Learned (PM Reflection)

Building this revealed how AI product decisions are different from traditional ones:

1. **Prompt engineering is product design.** The quality of the RICE prompt directly determines output quality — this is the PM's job.
2. **LLM outputs need defensive parsing.** You can't trust structure — bracket extraction + case normalization are non-negotiable.
3. **The loading state is a trust signal.** Showing step-by-step AI "thinking" reduced perceived wait time and made the tool feel more trustworthy.
4. **Metrics for AI features are compound.** RICE scores for AI features need an extra "model confidence" dimension that traditional RICE misses.

---

## Part of the AI PM Portfolio

This is **Project 1 of 5** in an AI Product Manager portfolio:

| # | Project | Skill |
|---|---------|-------|
| **1** | **PriorityAI — Feature Prioritization Dashboard** ← you are here | Roadmapping |
| 2 | PRD Generator for AI Products | Spec Writing |
| 3 | User Interview Analyzer | Discovery Research |
| 4 | AI Metrics & Eval Framework | Metrics Design |
| 5 | Competitive AI Landscape Tracker | Market Intelligence |

---

## License

MIT — feel free to fork, modify, and use in your own portfolio.
