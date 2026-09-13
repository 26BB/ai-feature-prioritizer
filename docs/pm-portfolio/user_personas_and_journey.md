# User Personas & Customer Journey Maps — PriorityAI 👤

> **Product:** PriorityAI (AI-Powered Feature Prioritization Dashboard)  
> **Author:** Bhushan Bhosale (Lead Product Manager)  
> **Methodology:** Jobs-to-be-Done (JTBD) & User Journey Mapping  
> **Last Updated:** August 2026  

---

## 1. Deep User Personas

### 🥇 Primary Persona: Solo PM Sam

```mermaid
mindmap
  root((Solo PM Sam))
    Demographics
      Age: 28
      Role: First & Sole PM
      Company: B2B SaaS Seed-to-Series A (15-40 people)
      Tools: Jira, Notion, Slack, Google Sheets
    Goals
      Cut sprint grooming time by 75%
      Defend roadmap decisions with objective data
      Align founders and senior devs effortlessly
    Pains
      Spends hours configuring RICE formulas in Excel
      Meetings derail into HiPPO debates
      Roadmap spreadsheet becomes outdated instantly
    JTBD
      When preparing for bi-weekly sprint planning
      I want to objectively rank unstructured feature ideas
      So that my team builds high-impact features with zero friction
```

* **Quote:** *"I spend more time arguing about whether a button is high-effort than actually shipping features. I need an objective, math-backed baseline in seconds."*
* **Behavioral Traits:** Analytical, time-constrained, highly organized, values standardized frameworks (RICE, MoSCoW), constantly switching context between customer requests and developer constraints.
* **Key Objections:** "Will the AI produce believable scores, or generic hallucinations that our lead engineer will immediately dismiss?"

---

### 🥈 Secondary Persona: Founder Fiona

```mermaid
mindmap
  root((Founder Fiona))
    Demographics
      Age: 34
      Role: Non-technical CEO / Founder
      Company: Early-Stage Startup (3-10 people)
      Tools: Linear, Trello, Loom, Google Docs
    Goals
      Avoid burning scarce runway on wrong features
      Get senior PM-level clarity without hiring a $140k PM
      Quickly separate Quick Wins from complex traps
    Pains
      Overwhelmed by feature requests from every sales call
      Doesn't know formal PM scoring frameworks
      Scared of committing 6 weeks of engineering to a dud
    JTBD
      When inundated with new feature requests
      I want an AI advisor to categorize what to build now vs later
      So that I protect our runway and ship needle-moving updates
```

* **Quote:** *"Every customer asks for something different. I need a clear way to see which requests are quick wins versus massive traps before I tell our dev team."*
* **Behavioral Traits:** Visionary, fast-paced, intuitive, impatient with complex enterprise tooling, needs immediate visual clarity (2x2 matrix).

---

### 🥉 Expansion Persona: Growth PM Priya

```mermaid
mindmap
  root((Growth PM Priya))
    Demographics
      Age: 31
      Role: Growth & Monetization PM
      Company: Scaleup (50-200 people)
      Tools: Amplitude, PostHog, Mixpanel, Jira
    Goals
      Rapidly screen 20+ growth experiment hypotheses
      Prioritize activation and onboarding tweaks
      Export cleanly to experiment tracking boards
    Pains
      Backlog is clogged with small conversion ideas
      Heavy enterprise tools like Productboard take too long to update
      Needs rapid batch estimation
    JTBD
      When evaluating growth hypotheses for the upcoming cycle
      I want a fast, standardized RICE scoring tool
      So that our squad can execute the highest ROI experiments first
```

* **Quote:** *"Growth is all about velocity. If it takes me 20 minutes to prioritize a single experiment idea in our legacy tool, we're moving too slowly."*

---

## 2. Customer Journey Map: Before vs. After PriorityAI

```mermaid
journey
    title User Emotional Journey: Solo PM Sam (Sprint Planning)
    section Current State (Manual Sheets)
      Collect ideas from Slack/Notion: 4: Sam
      Open Google Sheets & build RICE formula: 2: Sam
      Manually debate Effort & Reach with Lead Dev: 1: Sam
      HiPPO Founder demands pet feature: 1: Sam
      Format 2x2 chart manually in slides: 2: Sam
    section Future State (PriorityAI)
      Paste features into PriorityAI: 5: Sam
      AI generates RICE scores & rationales in 5s: 6: Sam
      Review interactive 2x2 Effort vs Impact Matrix: 6: Sam
      Review Now/Next/Later Swimlanes: 5: Sam
      1-Click CSV Export into Jira Sprint: 6: Sam
```

---

## 3. End-to-End Journey Map Matrix (Future State)

| Stage | User Goal | User Actions & Thoughts | Touchpoint / Screen | User Emotion | Opportunities for Delight |
|---|---|---|---|---|---|
| **1. Discovery & Arrival** | Understand what the tool does in $<10$ seconds | Lands on homepage; scans hero section; clicks *"Launch Prioritizer"*. | Landing Page Hero | 🤩 Intrigued | Vintage paperback aesthetic with live interactive teaser scorecards. |
| **2. Setup & Configuration** | Set up AI provider with zero billing friction | Opens Settings modal; enters free Google Gemini API key or uses demo session. | `SettingsModal.js` | 😌 Relieved | Clear step-by-step link to Google AI Studio for free instant API keys. |
| **3. Inputting Backlog** | Enter multiple feature ideas quickly | Enters feature names, short descriptions, and tags (e.g. Growth, Core, UX). | `/analyze` Input Card | ✍️ Focused | Pre-filled sample dataset buttons for 1-click test runs. |
| **4. AI RICE Generation** | Get objective, calculated scores & rationale | Clicks *"Analyze Feature"*; watches real-time progress skeleton. | AI Scoring Engine (`/api/prioritize`) | ⚡ Amazed | Granular AI rationale explaining *why* Reach is 500 and Effort is 2 months. |
| **5. Strategic Visualization** | Identify Quick Wins vs. Thankless Tasks | Interacts with 2x2 Effort vs. Impact bubble chart; hovers on quadrants. | 2x2 Matrix Component | 💡 Enlightened | Instant visual clarity—Quick Wins quadrant highlighted in crisp contrasting tones. |
| **6. Sprint Allocation & Export** | Organize into sprints and push to dev backlog | Checks Now / Next / Later lanes; clicks *"Export CSV"*. | Swimlanes & CSV Export | 🚀 Empowered | Auto-generated timestamped CSV ready for direct drag-and-drop into Jira / Linear. |
| **7. Retention & Revisit** | Re-open prior sessions for next sprint | Installs PWA to home screen; logs in via Google to sync workspace. | PWA Banner / Auth Menu | 🔒 Confident | Seamless offline PWA support and persistent multi-device syncing. |

---

## 4. Key Takeaways & Product Implications

1. **AI Rationale is the Moat:** Scores alone (e.g. "RICE = 750") are not enough; the PM needs the written *justification* to defend the score to engineering leads.
2. **Visual 2x2 is the Executive Selling Tool:** While PMs care about RICE numbers, Founders and Executives care about the visual 2x2 matrix to quickly sign off on decisions.
3. **Zero Friction Export is Mandatory:** The output must easily bridge back to Jira, Linear, or Notion; any platform lock-in will kill adoption.
