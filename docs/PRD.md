# Product Requirements Document (PRD): PriorityAI — AI Feature Prioritizer

> **Document Status:** APPROVED FOR PRODUCTION  
> **Target Audience:** Product Managers, Startup Founders, Engineering Leads, HR Assessors  
> **Companion Documents:** [GTM-STRATEGY.md](./GTM-STRATEGY.md) | [ARCHITECTURE.md](./ARCHITECTURE.md) | [USER-RESEARCH.md](./USER-RESEARCH.md)

---

## 1. Executive Summary & Problem Statement

### 1.1 Problem Statement
Product Managers and Startup Founders spend **4 to 8 hours every week** manually populating spreadsheets with RICE scores (Reach, Impact, Confidence, Effort), mapping feature backlogs onto Effort vs Impact 2×2 matrices, and building sprint roadmaps. Existing tools (Jira, Linear, Notion) either lack automated AI scoring engines or require complex SQL/custom script configurations.

### 1.2 The Solution
**PriorityAI (AI Feature Prioritizer)** is an automated PM tool powered by **NVIDIA NIM (Llama 3.3 70B)**, **Neon Serverless Postgres**, and **Firebase Auth**. It calculates objective RICE scores in 5 seconds, plots features on an interactive 2×2 matrix, organizes NOW/NEXT/LATER sprint swimlanes, and persists roadmap data across sessions.

---

## 2. Target Personas

### Persona 1: Ananya, Senior Product Manager (B2B SaaS Startup)
* **Context:** Manages a backlog of 45+ feature requests from sales, customer success, and engineering.
* **Goal:** Rank features objectively using RICE scoring before sprint planning meetings.
* **Pain Point:** Tired of spreadsheet math and subjective debates with engineers on Effort points.

### Persona 2: Sid, Solo Founder & Builder
* **Context:** Building an MVP and trying to decide which 3 core features to ship first.
* **Goal:** A simple tool that categorizes "Quick Wins" vs "Major Projects" instantly.

---

## 3. Core Product Features & Requirements

### 3.1 AI RICE Scoring Engine (`/api/prioritize`)
* **Functional Requirement:** User enters a feature title, brief description, and category.
* **AI Scoring Logic:** LLM analyzes the feature text against industry benchmarks and assigns:
  * **Reach:** Target users reached per month (1 – 10,000+).
  * **Impact:** Business impact score (0.25 = Minimal, 3.0 = Massive).
  * **Confidence:** Certainty percentage (50% = Low, 100% = High).
  * **Effort:** Person-weeks required (1 = Low Effort, 5 = Heavy Effort).
* **Mathematical Formula:** $\text{RICE Score} = \frac{\text{Reach} \times \text{Impact} \times \text{Confidence}}{\text{Effort}}$

### 3.2 Interactive 2×2 Matrix & Sprint Roadmap
* **Effort vs Impact Plot:** Automatically maps scored features into 4 quadrants:
  1. **Quick Wins** (Low Effort, High Impact) $\rightarrow$ Assigned to **NOW**.
  2. **Major Projects** (High Effort, High Impact) $\rightarrow$ Assigned to **NEXT**.
  3. **Fill-Ins** (Low Effort, Low Impact) $\rightarrow$ Assigned to **LATER**.
  4. **Thankless Tasks** (High Effort, Low Impact) $\rightarrow$ Backlog / Deprecated.

### 3.3 Full-Stack Database Persistence & Multi-User Auth
* **Firebase Auth:** Google & Email sign-in for workspace isolation.
* **Neon Serverless Postgres:** Stores backlog items, RICE scores, and roadmap history.
