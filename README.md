# 🚀 PriorityAI — AI Feature Prioritization Dashboard & Platform

### Production Full-Stack AI Application for Product Managers & Founders
> **Built by Bhushan Bhosale** (Founder's Office & Product Management | Pune, India)  
> 🌐 **Live Web Application:** [https://01-feature-prioritizer.vercel.app](https://01-feature-prioritizer.vercel.app)  
> 📚 **Complete Documentation Suite:** [`/docs` Directory](./docs)

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://01-feature-prioritizer.vercel.app)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.0-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Neon Database](https://img.shields.io/badge/Database-Neon_Serverless_Postgres-00E5FF?style=for-the-badge&logo=postgresql&logoColor=black)](./docs/ARCHITECTURE.md)
[![Firebase Auth](https://img.shields.io/badge/Auth-Firebase_Security-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](./docs/ARCHITECTURE.md)
[![NVIDIA NIM AI](https://img.shields.io/badge/AI_Engine-NVIDIA_NIM_Llama_3.3-76B900?style=for-the-badge&logo=nvidia&logoColor=black)](./docs/PRD.md)
[![Recruiter Friendly](https://img.shields.io/badge/Documentation-100%25_Non--Tech_Friendly-10B981?style=for-the-badge)](./docs)

---

## 💡 Executive Summary (Plain English — For HR & Non-Technical Readers)

### **What is PriorityAI?**
**PriorityAI** is an intelligent web app that helps Product Managers, Startup Founders, and Team Leaders rank their feature ideas in **under 5 seconds**. Instead of spending hours calculating numbers in complicated Excel spreadsheets, users simply type in their feature ideas, and artificial intelligence calculates objective scores automatically.

### **What Real-World Business Problem Does It Solve?**
* **Stops Wasting 5+ Hours Every Week on Manual Math:** Product Managers usually waste hours every sprint cycle filling out RICE spreadsheets (Reach, Impact, Confidence, Effort) to decide what engineers should build next.
* **Eliminates Unbiased Feature Arguments:** Engineers and sales teams often argue about which features are most important. PriorityAI uses AI reasoning to provide objective scorecards so teams align instantly.
* **Organizes Sprint Roadmaps Automatically:** Features are automatically categorized into **NOW (Quick Wins)**, **NEXT (Major Projects)**, and **LATER** swimlanes ready for 1-click export.

---

## 📸 Visual Tour & Features

1. **Prioritizer Workspace (`/analyze`):** Type feature descriptions and select categories.
2. **AI RICE Scorecards:** Automated scores for Reach, Impact, Confidence, and Effort with plain-English AI reasoning.
3. **Interactive 2×2 Effort vs Impact Matrix:** Visual quadrant plot mapping features into Quick Wins vs Major Projects.
4. **NOW / NEXT / LATER Swimlanes:** Sprint-ready roadmaps with 1-click CSV export.

---

## 🏛️ Full-Stack System Architecture (Explained Simply)

PriorityAI is built on a modern 3-Tier full-stack cloud architecture:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               PRIORITYAI FULL-STACK                                     │
│                                                                                         │
│   ┌───────────────────────────┐  ┌───────────────────────────┐  ┌────────────────────┐   │
│   │   USER SECURITY & AUTH    │  │    CLOUD POSTGRES DB      │  │  NEXT.JS FRONTEND  │   │
│   │      (Firebase Auth)      │  │ (Neon Serverless Postgres)│  │  (Next.js App)     │   │
│   │                           │  │                           │  │                    │   │
│   │ Secure Google Sign-In &   │  │ Stores features, RICE     │  │ Interactive matrix,│   │
│   │ multi-user workspaces     │  │ scores & roadmap history  │  │ swimlanes & export │   │
│   └───────────────────────────┘  └───────────────────────────┘  └────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **User Authentication (Firebase Auth):** Manages Google Sign-In and isolates saved feature roadmaps by user account.
2. **Cloud Database (Neon Serverless Postgres + Drizzle ORM):** Stores feature backlogs, RICE score calculations, and quadrant positioning.
3. **Frontend Interface (Next.js 14 + Tailwind CSS):** Renders responsive scorecards and 2×2 matrix plots.

👉 *For complete database schemas and technical specs, read [**ARCHITECTURE.md**](./docs/ARCHITECTURE.md).*

---

## 📚 Complete Product & Portfolio Documentation Index

Explore the behind-the-scenes product strategy and engineering specs in the [`/docs`](./docs) folder:

| Document | Focus Area & Description | Direct Link |
| :--- | :--- | :--- |
| 📋 **Product Requirements (PRD)** | User personas (Senior PM, Founder), RICE requirements, 2×2 matrix criteria | [PRD.md](./docs/PRD.md) |
| 🏛️ **System Architecture** | Full-stack Next.js, Drizzle ORM + Neon Postgres ERD, Firebase Auth specs | [ARCHITECTURE.md](./docs/ARCHITECTURE.md) |
| 🚀 **Go-To-Market Strategy** | Product-Led Growth (PLG) distribution strategy & BYOK freemium model | [GTM-STRATEGY.md](./docs/GTM-STRATEGY.md) |
| 🔬 **User Research Synthesis** | Insights from interviews with 15 Product Managers & Founders | [USER-RESEARCH.md](./docs/USER-RESEARCH.md) |
| 🧪 **Quality & Test Report** | Test verification report for RICE calculation engine & Next.js builds | [TEST-REPORT.md](./docs/TEST-REPORT.md) |

---

## 💻 Quickstart (Run Locally)

```bash
# 1. Clone repository
git clone https://github.com/26BB/ai-feature-prioritizer.git
cd ai-feature-prioritizer

# 2. Install packages
npm install

# 3. Start local development server
npm run dev
# Open http://localhost:3000
```

---

## 👤 Author & Portfolio Context

**Bhushan Bhosale**  
*Role Focus:* Founder's Office / Product Management / Technical Growth  
*Location:* Pune, Maharashtra, India  
*LinkedIn:* [Bhushan Bhosale](https://www.linkedin.com/in/bhushan-bhosale-36aa48373/)  
*GitHub:* [@26BB](https://github.com/26BB)
