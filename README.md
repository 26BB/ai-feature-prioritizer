# PriorityAI — Micro-SaaS AI Feature Prioritization Dashboard & PWA

> Input your product feature ideas. Get RICE scores, effort vs. impact matrices, and sprint roadmaps — powered by Multi-Provider AI (NVIDIA, Gemini, Groq, OpenAI) with zero downtime fallback.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://01-feature-prioritizer.vercel.app)
![Powered by Multi-AI](https://img.shields.io/badge/Powered%20by-NVIDIA%20%7C%20Gemini%20%7C%20Groq-76b900?style=for-the-badge)
![Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![PWA Ready](https://img.shields.io/badge/PWA-Installable%20App-5B21B6?style=for-the-badge)
![Firebase Auth](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?style=for-the-badge&logo=firebase)

🌐 **Live App:** [https://01-feature-prioritizer.vercel.app](https://01-feature-prioritizer.vercel.app)

---

## ✨ What's New in v2.0 (Micro-SaaS Upgrade)

PriorityAI has evolved from a standalone portfolio tool into a full-featured, installable **Micro-SaaS Application** tailored for Growth Product Managers, Founders, and Engineering Leads.

### 🌟 Key Features
- 🏠 **SaaS Landing Home Page (`/`):** High-converting landing page with live interactive preview teasers, metrics, and feature showcases.
- ⚡ **Prioritizer Workspace (`/analyze`):** Dedicated workspace form for entering feature backlogs and running AI RICE prioritization.
- 🔒 **Firebase User Authentication:** 1-Click **Google Sign-In** and **Email/Password** registration with user profiles.
- 💾 **Personal Saved History (`/history`):** Save prioritization boards to your account, re-open previous sessions with 1 click, or export to CSV.
- 🔑 **Bring Your Own Key (BYOK):** Use your own Gemini, OpenAI, Groq, or NVIDIA API keys securely stored in browser `localStorage`.
- ⚡ **Zero-Cost Client Caching:** Hashes feature inputs to return instant cached scorecards without spending API credits.
- 🛡️ **Multi-Provider Auto-Failover:** Sequence: BYOK Key → NVIDIA NIM → Google Gemini → Groq → **Deterministic Math Engine** for 100% uptime.
- 📱 **Installable PWA App:** 1-Click **"📱 Install App"** banner for Android, iOS, Mac, and Windows home screens.
- 🎨 **Retro Vintage Paperback Theme:** Warm vanilla cream paper palette, Terracotta Orange action accents, `Playfair Display` serif headlines, `Space Mono` typewriter scores, and kinetic word motion animations.

---

## 🧮 RICE Framework

$$\text{RICE Score} = \frac{\text{Reach} \times \text{Impact} \times \text{Confidence}}{\text{Effort}}$$

| Component | Scale | Meaning |
| :--- | :--- | :--- |
| **Reach** | 1–10 | Users impacted per quarter |
| **Impact** | 1–10 | How significantly it moves key metrics |
| **Confidence** | 10–100% | Certainty in estimates |
| **Effort** | 1–10 | Person-months required to build |

### Sprint Assignment Logic:
- **NOW:** RICE > 500 AND Effort ≤ 5
- **NEXT:** RICE 200–500 OR Effort 5–7
- **LATER:** RICE < 200 OR Effort > 7

---

## 🛠️ Tech Stack

| Layer | Choice | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router + Turbopack) | Fast SSR & API routes in a unified codebase |
| **Styling** | Vanilla CSS + CSS Modules | Custom Retro Paperback Design System & word animations |
| **Typography** | Google Fonts (`Playfair Display`, `Space Mono`, `Plus Jakarta Sans`) | Editorial vintage book title serifs + typewriter monospaced metrics |
| **AI Engine** | NVIDIA NIM, Google Gemini, Groq, OpenAI | Multi-LLM failover & BYOK support |
| **Backend & Auth** | Firebase Auth & Firestore DB | User accounts (Google/Email) & saved history persistence |
| **Mobile & PWA** | Web App Manifest + Service Worker hooks | Installable native app experience across platforms |
| **Charts & Export** | Chart.js & Native Blob API | 2x2 Effort vs Impact bubble matrix & CSV downloads |

---

## 📂 Project Structure

```
01-feature-prioritizer/
├── app/
│   ├── page.js                  # SaaS Landing Home Page
│   ├── landing.module.css       # Retro landing page styling
│   ├── analyze/
│   │   └── page.js              # Prioritizer Workspace tool
│   ├── history/
│   │   ├── page.js              # My History saved sessions dashboard
│   │   └── page.module.css      # History page styling
│   ├── results/
│   │   └── page.js              # Results: Score Cards, 2x2 Matrix, Roadmap
│   ├── components/
│   │   ├── ApiKeyModal.js       # BYOK Settings & Cache management modal
│   │   ├── AuthModal.js         # Firebase Login & Sign Up modal
│   │   └── PwaInstallPrompt.js  # Floating 1-click PWA app install banner
│   ├── api/
│   │   └── prioritize/
│   │       └── route.js         # POST API route handling multi-provider AI
│   ├── globals.css              # Design tokens (Retro Vanilla Cream & Terracotta)
│   └── layout.js                # Root layout with AuthProvider & PWA manifest
├── context/
│   └── AuthContext.js           # Firebase Auth & Firestore state management
├── lib/
│   ├── firebase.js              # Firebase initialization with mock fallback
│   ├── llmProviders.js          # Multi-LLM failover & deterministic math engine
│   ├── prompts.js               # Structured RICE prompt builder
│   └── scoring.js              # Sprint grouping & color utilities
├── public/
│   ├── manifest.json            # Web App Manifest for PWA installation
│   └── icons/                   # Vector app icons (192x192, 512x512)
└── DESIGN.md                    # Semantic Retro Vintage Design System specification
```

---

## 💻 Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/26BB/ai-feature-prioritizer.git
   cd ai-feature-prioritizer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run local dev server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:3000`.

---

## 📄 License

MIT © [Bhushan Bhosale](https://github.com/26BB)
