# CommitOS – Agentic Decision & Execution Intelligence OS

> **Tagline**: *Your Meetings. Now, Executed.*
> 
> **CommitOS** is an autonomous, agentic meeting-to-execution platform featuring multi-tenant **Role-Based Access Control (RBAC)**, persistent organizational memory (RAG), real-time cross-meeting decision conflict detection, and live **Google Gemini AI** orchestration. Built for startups, college clubs, student committees, and high-velocity engineering squads.

[![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-8E75B2?style=flat-square&logo=google)](https://aistudio.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=flat-square)](LICENSE)
[![User Guide](https://img.shields.io/badge/Manual-Complete_User_Guide-white?style=flat-square&logo=markdown)](USER_GUIDE.md)

> 📖 **Looking for a complete feature walkthrough and roles guide?**  
> Check out the [Complete User Guide](USER_GUIDE.md) for step-by-step instructions on every feature, role permissions, and real-world workflows.

---

## 🌟 The Problem CommitOS Solves

In fast-paced organizations, meetings generate energy, promises, and strategic choices. Yet immediately afterward:
- **Decision Drift**: Agreed dates, budgets, or scopes are remembered differently and contradicted in later meetings.
- **Lost Commitments**: Spoken action items dissolve without accountability, assigned owners, or deadlines.
- **Organizational Amnesia**: Teams forget what was approved three weeks ago regarding vendors, budget limits, or architectural choices.
- **Silent Execution Risks**: Dependency failures and deadline collisions stay hidden until days before launch.

**CommitOS transforms passive conversations into an active, verifiable execution system.** It does not merely summarize transcripts; it analyzes blast radius, detects contradictions across time, enforces role permissions, and tracks tasks to completion.

---

## 🛡️ Role-Based Access Control (RBAC) Architecture

CommitOS enforces strict three-tier organizational governance both on the client and with server-side validation. AI agents and user actions cannot bypass permissions.

```
┌─────────────────────────────────────────────────────────────────┐
│                      ORGANIZATION ADMIN                         │
│  Full Access • Member & Role Management • Decision Ratification │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         TEAM LEADER                             │
│  Upload Meetings • Review AI Insights • Assign Tasks & Monitor  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         TEAM MEMBER                             │
│  View Permitted Meetings • Update Task Status • Query RAG Memory│
└─────────────────────────────────────────────────────────────────┘
```

### 1. 👑 Organization Admin
* **Full Organization Access**: Read and write access to all organizational resources, analytics, and audit logs.
* **Team Governance**: Invite new members, modify member roles, or revoke access on the Team Management portal.
* **Decision Ratification**: Exclusively approve or reject official decision modifications and conflict triage.
* **Workspace Settings**: Manage organization profile, API keys (safely masked), and global configurations.

### 2. ⚡ Team Leader
* **Meeting Operations**: Upload audio recordings and paste transcripts for AI pipeline processing.
* **AI Intelligence Review**: Review AI-generated summaries, key discussion points, and extracted commitments.
* **Task Delegation**: Create, prioritize, and assign action items to team members.
* **Conflict Review**: Review cross-meeting decision conflicts; approve changes when delegated authorization by the Admin.
* **Velocity Tracking**: Monitor milestone health and team workload distribution.

### 3. 👤 Team Member
* **Permitted Visibility**: Access permitted organizational meetings and public summaries.
* **Task Execution**: View personal task queue and update task statuses (*Todo*, *In Progress*, *Done*).
* **Ask CommitOS**: Query organizational memory with grounded RAG to recall past decisions and context.
* **Security Barriers**: Upload controls and administrative settings are protected by permission gates.

---

## 🔐 Dedicated Role-Based Authentication

CommitOS features dedicated **Sign In** (`/signin`) and **Sign Up** (`/signup`) portals with complete role-based onboarding:

- **Role Selection Portals**: Explicit entry paths for **Organization Admin**, **Team Leader**, and **Team Member** with permission breakdowns.
- **1-Click Instant Evaluation**: Pre-configured verified profiles (Yug Patel, Rahul Sharma, Priya Nair) for instant testing during hackathons and demos.
- **Custom Account Registration**: Register custom members with full name, designation title, and organization affiliation.
- **Multi-Tenant Organization Isolation**: Strict data segregation ensuring members only view records belonging to their active organization.
- **Protected Application Shell**: Unauthenticated visitors are automatically routed to the role authentication portal.

---

## ⚡ Live Multi-Agent AI System (Google Gemini)

CommitOS runs an autonomous multi-agent pipeline powered by **Google Gemini** (`gemini-3.5-flash-lite`):

```
Audio Recording / Transcript Input
              │
              ▼
    [ 1. Audio Ingestion & Diarization ]
              │
              ▼
    [ 2. Meeting Intelligence Agent ]
       ├── Extracts official decisions, confidence scores, and rationales
       ├── Segregates approved choices vs proposals vs disagreements
       └── Extracts actionable tasks with assigned owners & deadlines
              │
              ├──────────────────────────────┐
              ▼                              ▼
    [ 3. Memory Synthesis Agent ]   [ 4. Task Execution Agent ]
       ├── Indexes decisions & context ├── Populates Kanban board
       └── Enriches organization memory└── Tracks due dates & status
              │                              │
              ▼                              ▼
    [ 5. Decision Conflict Agent ]  [ 6. Execution Risk Predictor ]
       ├── Cross-references historical ├── Calculates blast radius
       └── Flags contradictory items   └── Predicts HIGH/MED/LOW risk
```

### Signature Feature: Cross-Meeting Decision Conflict Detection
When a new meeting is processed, CommitOS compares newly proposed items against past decisions:
* **Real-World Example**:
  - In Meeting 1, the event date was approved for **December 15**.
  - In Meeting 3, a member suggests moving the date to **December 20**.
* **CommitOS Agentic Detection**:
  - Triggers an instant **Decision Conflict Alert**.
  - Displays a side-by-side comparison: *Previously Approved (Dec 15)* vs *Newly Proposed (Dec 20)*.
  - Assesses blast radius: venue booking, speaker availability, and marketing deadlines.
  - Enforces a Human-in-the-Loop triage workflow (**Approve**, **Reject**, or **Request Discussion**) verified by server-side RBAC.

### Grounded RAG Assistant: Ask CommitOS
- Queries the organization's decisions, tasks, and memory.
- Direct answers with **zero hallucinations**, citing the exact meeting title, date, and decision context.

---

## 🔒 Security & Privacy

1. **Masked Secret Keys**: All secret API keys (Gemini, AssemblyAI, Supabase) in Settings are masked with bullet characters (`••••••••••••••••`) and cannot be viewed in clear text.
2. **Server-Side Enforcement**: All API endpoints (`/api/team/members`, `/api/triage-conflict`, `/api/process-meeting`) verify user identity and role authority on the server before mutating data.
3. **Audit Trail**: Every invitation, role modification, conflict approval, and login event is permanently recorded in an immutable audit log.
4. **Zero Simulation Dummy Buttons**: Every button across the application performs actual state changes or API requests.

---

## 📁 Repository Structure

```
CommitOS/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ask-commit-os/     # Grounded Gemini RAG endpoint
│   │   │   ├── process-meeting/   # Multi-agent meeting extraction & conflict detection
│   │   │   ├── team/members/      # RBAC team member management (invite, role edit, remove)
│   │   │   └── triage-conflict/   # Server-side conflict ratification with role checks
│   │   ├── analytics/             # Risk radar, team velocity, & execution analytics
│   │   ├── meetings/              # Meeting list & detail views with transcript player
│   │   ├── memory/                # Searchable organizational memory vault & audit trail
│   │   ├── settings/              # Organization settings, RBAC team roster, & masked keys
│   │   ├── signin/                # Role-based sign in with 1-click test credentials
│   │   ├── signup/                # Member registration with role selection
│   │   ├── tasks/                 # Kanban, list, and calendar task views
│   │   ├── layout.tsx             # Root layout with AppShell wrapper
│   │   └── page.tsx               # Executive dashboard & live AI quick query
│   ├── components/
│   │   ├── dashboard/             # AskCommitOSWidget & dashboard stat cards
│   │   ├── layout/                # AppShell, Header, Sidebar with role switchers
│   │   └── meetings/              # UploadMeetingModal & transcript viewers
│   └── lib/
│       ├── demo-data.ts           # Initial seeded organization data (SVIT Podcast Club)
│       ├── gemini.ts              # Live Google Gemini AI client & prompts
│       ├── rbac.ts                # Role definitions, permission matrix, & checks
│       ├── store.ts               # Client-side store, audit logging, & auth state
│       └── types.ts               # Core TypeScript models (Meeting, Decision, Task, etc.)
├── supabase/
│   └── schema.sql                 # Complete PostgreSQL schema with pgvector & RLS
├── .env                           # Environment variables
├── package.json                   # Dependencies and scripts
└── README.md                      # Documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm** or **pnpm**

### 2. Clone and Install
```bash
git clone https://github.com/Yug030806/CommitOS.git
cd CommitOS
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Google Gemini AI (Required for Live AI reasoning)
GEMINI_API_KEY=your_google_gemini_api_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_google_gemini_api_key_here

# Optional: Supabase PostgreSQL & Authentication
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. You will be greeted by the role-based authentication portal.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 👥 Seeded Demonstration Dataset (SVIT Podcast Club)

CommitOS comes pre-seeded with a complete organization dataset for instant evaluation:

| Member | Title | Role | Access Level |
| :--- | :--- | :--- | :--- |
| **Yug Patel** | Production Head | `org_admin` | Full governance & decision ratification |
| **Rahul Sharma** | Marketing Lead | `team_leader` | Meeting ingestion & task management |
| **Yash Mehta** | Sponsorship Lead | `team_leader` | Task management & milestone tracking |
| **Priya Nair** | Event Coordinator | `team_member` | Task status updates & memory query |

### Historical Meetings:
1. **Meeting 1: Event Planning Meeting (Nov 15)**
   - *Decisions*: Event Date = December 15; Budget = ₹15,000; Marketing & Sponsorship leads assigned.
2. **Meeting 2: Production Discussion (Nov 22)**
   - *Decisions*: Format = Live Interactive Panel; Audio equipment = Shure SM7B + Sony A7III cameras.
3. **Meeting 3: Follow-up Sync (Nov 28) — [Conflict Trigger]**
   - *Event*: Yash proposes shifting the event to December 20 to secure an EdTech sponsor.
   - *Agent Reaction*: **Decision Conflict Detected** (Dec 15 vs Dec 20) with blast radius analysis and pending triage!

---

## 🧪 Testing the Live AI Features

1. **Ask CommitOS RAG**:
   - Go to the Dashboard or `/memory`.
   - Ask: *"What was the approved event budget and who is responsible for posters?"*
   - Watch Gemini answer in real time with exact citations.
2. **Upload New Meeting**:
   - As an Organization Admin or Team Leader, click **Upload Meeting**.
   - Click **Insert Sample Transcript** to test Meeting 4 (Resolution Sync).
   - Click **Run AI Agent Pipeline** and watch the multi-agent orchestration extract decisions, tasks, and resolve conflicts live!
3. **Test Role Permissions**:
   - Sign out or use the role switcher to switch to **Priya Nair (Team Member)**.
   - Notice that administrative actions like uploading meetings, inviting members, or editing roles are securely disabled.

---

## 📄 License
This project is licensed under the MIT License. Built for the Agentic AI Hackathon.
