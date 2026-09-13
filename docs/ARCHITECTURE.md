# 🏛️ Full-Stack System Architecture: AI Feature Prioritizer

> **Document Status:** APPROVED FOR PRODUCTION  
> **Target Audience:** Full-Stack Engineers, System Architects, Technical Assessors  
> **Companion Documents:** [PRD.md](./PRD.md) | [GTM-STRATEGY.md](./GTM-STRATEGY.md)

---

## 1. System Architecture Overview

AI Feature Prioritizer is structured as a **Full-Stack Next.js 14 App Router Application** backed by **Neon Serverless Postgres**, **Drizzle ORM**, **Firebase Auth**, and **NVIDIA NIM / Google Gemini LLM API**.

```
                               AI FEATURE PRIORITIZER ARCHITECTURE
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                                   NEXT.JS FRONTEND LAYER                                  │
│                                                                                           │
│   ┌───────────────────────────────┐               ┌───────────────────────────────────┐   │
│   │     PRIORITIZER WORKSPACE     │               │   EFFORT VS IMPACT 2x2 MATRIX     │   │
│   │ • Feature Input & Category    │               │ • Interactive Quadrant Plotter    │   │
│   │ • RICE Scorecard Generator    │◄─────────────►│ • NOW / NEXT / LATER Swimlanes    │   │
│   │ • BYOK Gemini API Settings    │               │ • CSV & Markdown Exporter         │   │
│   └───────────────┬───────────────┘               └─────────────────┬─────────────────┘   │
└───────────────────┼─────────────────────────────────────────────────┼─────────────────────┘
                    │                                                 │
                    │ 1. Firebase Auth JWT                            │ 2. API Queries & Mutations
                    ▼                                                 ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                               NEXT.JS SERVERLESS BACKEND ROUTES                           │
│                                                                                           │
│   ┌───────────────────────────────┐               ┌───────────────────────────────────┐   │
│   │        FIREBASE AUTHENTICATION │               │      AI SCORING & API ROUTES      │   │
│   │ • Google & Email Sign-In      │               │ • `/api/prioritize` (LLM Engine)  │   │
│   │ • User Workspace Isolation    │               │ • `/api/user` (Roadmap Mutate)    │   │
│   └───────────────────────────────┘               └─────────────────┬─────────────────┘   │
└─────────────────────────────────────────────────────────────────────┼─────────────────────┘
                                                                      │
                                                                      │ 3. Drizzle ORM SQL Queries
                                                                      ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                               DATABASE & PERSISTENCE LAYER                                │
│                                                                                           │
│   ┌───────────────────────────────────────────────────────────────────────────────────┐   │
│   │                       NEON SERVERLESS POSTGRES (DRIZZLE ORM)                      │   │
│   │ • `items` — Feature title, category, description, and status                      │   │
│   │ • `rice_scores` — Calculated Reach, Impact, Confidence, Effort & total score     │   │
│   │ • `matrices` — Quadrant positioning & NOW/NEXT/LATER sprint swimlanes            │   │
│   └───────────────────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Drizzle ORM Relational Schema (Neon Serverless Postgres)

```typescript
// src/lib/db/schema.ts
import { pgTable, uuid, varchar, text, integer, decimal, timestamp } from 'drizzle-orm/pg-core';

// 1. Feature Items Table
export const items = pgTable('items', {
  id: uuid('id').defaultRandom().primaryKey(),
  userFirebaseUid: varchar('user_firebase_uid', { length: 128 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. RICE Scores Table
export const riceScores = pgTable('rice_scores', {
  id: uuid('id').defaultRandom().primaryKey(),
  itemId: uuid('item_id').references(() => items.id, { onDelete: 'cascade' }).notNull(),
  reach: integer('reach').notNull(),
  impact: decimal('impact', { precision: 4, scale: 2 }).notNull(),
  confidence: integer('confidence').notNull(),
  effort: decimal('effort', { precision: 4, scale: 2 }).notNull(),
  totalScore: decimal('total_score', { precision: 8, scale: 2 }).notNull(),
  reasoning: text('reasoning'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Matrix & Swimlanes Table
export const matrices = pgTable('matrices', {
  id: uuid('id').defaultRandom().primaryKey(),
  itemId: uuid('item_id').references(() => items.id, { onDelete: 'cascade' }).notNull(),
  quadrant: varchar('quadrant', { length: 50 }).notNull(), // 'QUICK_WIN', 'MAJOR_PROJECT', etc.
  swimlane: varchar('swimlane', { length: 20 }).notNull(), // 'NOW', 'NEXT', 'LATER'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

---

## 3. Technology Stack Summary

* **Framework:** Next.js 14 App Router + TypeScript + Tailwind CSS.
* **ORM & Database:** Drizzle ORM + Neon Serverless Postgres.
* **Security & Auth:** Firebase Auth.
* **LLM Engine:** NVIDIA NIM (Llama 3.3 70B) & Google Gemini 1.5 Flash.
