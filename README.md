# CommitOS – AI Decision & Execution Intelligence

> **Tagline**: *Your Meetings. Now, Executed.*
> 
> CommitOS is an autonomous, agentic meeting-to-execution platform that solves the universal organizational problem of decisions, commitments, and deadlines getting lost between meetings. Built for college clubs, startup teams, student committees, and project squads.

---

## 🌟 The Core Problem CommitOS Solves

In most organizations, meetings generate enthusiasm, promises, and ideas. But immediately afterward:
- **Decision Drift**: Important agreements are remembered differently or contradicted in subsequent meetings.
- **Lost Commitments**: Action items discussed verbally are forgotten without ownership or deadlines.
- **Organizational Amnesia**: Nobody remembers what was approved three meetings ago regarding budgets, dates, or vendor selections.
- **Unseen Execution Risks**: Critical path dependencies fail silently until days before the milestone.

CommitOS does **not** build another generic chatbot summary. Instead, it operates as an active **Execution Operating System** with long-term memory, cross-meeting contradiction detection, and predictive risk tracking.

---

## 🚀 Key Differentiating Features

### 1. Persistent Organizational Memory (Vectorized RAG)
Every confirmed decision, budget cap, format selection, and responsibility is preserved across time in a dedicated organizational memory vault. When members or leaders ask questions, CommitOS cites the exact meeting name, date, and decision identifier.

### 2. Signature Feature: Cross-Meeting Decision Conflict Detection
When a new meeting is processed, CommitOS compares newly proposed or discussed items against historical organizational memory.
* **Example**: In Meeting 1, the event date was approved for **December 15**. In Meeting 3, a member casually suggests moving it to **December 20**.
* **CommitOS triggers a Decision Conflict Alert**:
  - Highlights the contradiction (Dec 15 approved vs Dec 20 proposed)
  - Identifies the blast radius impact (venue booking, poster deadlines, sponsor contract terms)
  - Enforces a Human-in-the-Loop Triage Workflow: **`Approve Change`**, **`Reject Change`**, or **`Request Discussion`**.
  - Maintains an immutable decision audit log.

### 3. Predictive Execution Risk Analysis
Analyzes pending tasks, approaching milestones, unratified conflicts, and team workloads to compute an overall risk level (**LOW**, **MEDIUM**, **HIGH**) with causal explanations and recommended mitigations.

### 4. Interactive Task & Kanban Engine
Automatically extracts action items with assigned owners, deadlines, and priorities, mapping them directly to the originating meeting and decision.

### 5. Ask CommitOS: Grounded RAG Assistant
Natural language question-answering over organizational history with zero hallucinations and verified source grounding.

---

## 🏗️ Multi-Agent Architecture

CommitOS coordinates five specialized agents sharing an organization-scoped memory store:

```
Audio Recording / Transcript
           │
           ▼
[ Meeting Intelligence Agent ]
   ├── Transcribes & diarizes speakers
   ├── Separates approved decisions vs proposals vs disagreements
   └── Extracts action items with owners and deadlines
           │
           ├────────────────────────────┐
           ▼                            ▼
[ Organizational Memory Agent ]   [ AI Execution Agent ]
   ├── Embeds decisions into vector store   ├── Generates Kanban tasks
   └── Manages cross-meeting retrieval    └── Tracks status & due dates
           │                                    │
           ▼                                    ▼
[ Conflict Detection Agent ]       [ Execution Risk Predictor ]
   ├── Compares new vs historical       ├── Evaluates milestone blockers
   └── Generates blast radius diff     └── Alerts on pending dependencies
```

---

## 👥 Hackathon Demonstration Organization: SVIT Podcast Club

CommitOS is pre-seeded out-of-the-box with a complete demonstration dataset:
- **Organization**: SVIT Podcast Club
- **Team**:
  - **Yug** – Production Head (Lead)
  - **Rahul** – Marketing Lead
  - **Yash** – Sponsorship Lead
  - **Priya** – Event Coordinator

### Three Historical Meetings:
1. **Meeting 1: Event Planning Meeting (Nov 15)**
   - *Decisions*: Event Date = December 15; Budget Cap = ₹15,000; Rahul leads marketing; Yash leads sponsorship.
   - *Tasks*: "Create event poster" (Rahul), "Contact sponsors" (Yash).
2. **Meeting 2: Production Discussion (Nov 22)**
   - *Decisions*: Format = Live Interactive Panel; Tech Setup = 4 Shure SM7B mics + 2 Sony A7III 4K cameras.
   - *Tasks*: "Check recording equipment" (Yug), "Finalize production schedule" (Priya).
3. **Meeting 3: Follow-up Meeting (Nov 28) [Conflict Demonstration]**
   - *Event*: Yash proposes shifting event date to December 20 to close an EdTech sponsorship.
   - *Result*: **Decision Conflict Detected** (Dec 15 vs Dec 20) with pending triage and **HIGH execution risk**.

---

## 🎬 Live Hackathon Demonstration Script (60 Seconds)

1. **Dashboard Overview**:
   - Open CommitOS at `http://localhost:3000`.
   - Point out the 4 stat cards (3 Meetings, 6 Tasks, High Risk alert).
   - Point out the **Signature AI Alert Banner** for the Dec 15 vs Dec 20 contradiction.
2. **Review Conflict Triage**:
   - Click **Review & Ratify Triage** on the banner (or visit `/meetings/meet-003`).
   - Open the **AI Insights (1 Conflict)** tab to show the side-by-side diff:
     - Previously Approved: *December 15* (Nov 15 meeting)
     - New Proposal: *December 20* (Nov 28 meeting)
     - Conflict Rationale & Blast Radius impact.
   - Demonstrate the human-in-the-loop action buttons: **Approve Change**, **Reject Change**, or **Request Discussion**.
3. **Inspect Organizational Memory**:
   - Navigate to `/memory`.
   - Show the searchable timeline and the **Decision History & Audit Trail** recording all changes.
4. **Execution Tasks**:
   - Navigate to `/tasks` and switch between **Kanban Board**, **List View**, and **Calendar View**.
   - Drag or toggle a task status (e.g., mark "Create event poster" as done) and watch team velocity update.
5. **Ask CommitOS RAG Assistant**:
   - Return to the Dashboard or use the query bar.
   - Click the prompt chip: *"What was the approved event budget?"*
   - Watch CommitOS answer: *"The officially approved event budget is ₹15,000, established during the Event Planning Meeting on November 15, 2026."* citing the exact source!
6. **Upload New Meeting (Meeting 4 Resolution Sync)**:
   - Click **Upload Meeting** in the top navigation.
   - Click **Load Demo Meeting 4** (or upload your own audio).
   - Click **Run AI Agent Pipeline** and watch the animated multi-agent visualizer process the conversation!

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Dark Executive Palette (Zinc / Black `#09090b` / Crisp White)
- **Icons & Animation**: Lucide React, Framer Motion, Radix UI Primitives
- **Data Visualization**: Recharts (Workload velocity, execution status distribution, risk radar)
- **AI Backend**: Google Gemini API (`@google/generative-ai`), Gemini 1.5 Flash / Pro, Gemini Embeddings
- **Audio Transcription**: Native Gemini 1.5 Audio (Zero external keys required), Deepgram, AssemblyAI
- **Database & Memory**: Supabase PostgreSQL with `pgvector`, Row Level Security (RLS), and resilient local memory repository.

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm or pnpm

### 2. Installation
```bash
git clone <repo-url>
cd Hackathon
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your Google Gemini API Key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: If no API key is provided, CommitOS runs in Offline Demo Mode with its intelligent deterministic reasoning engine).*

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 🗄️ Database Setup (Supabase PostgreSQL)

To connect a remote Supabase database instance:
1. Create a new Supabase project at [https://supabase.com](https://supabase.com).
2. Navigate to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/schema.sql` from this repository and run the entire script. It creates:
   - `organizations`, `users`, `organization_members`
   - `meetings`, `meeting_participants`, `transcripts`
   - `decisions`, `decision_history`, `decision_conflicts`
   - `tasks`, `task_comments`
   - `organizational_memories` with `vector(768)` embeddings
   - `execution_risks`, `notifications`, `audit_logs`
   - Row Level Security (RLS) policies and performance indexes.
4. Add your Supabase URL and Anon key in `Settings` (`/settings`) or in `.env.local`.

---

## 🚢 Deployment to Vercel

CommitOS is optimized for deployment on Vercel:
1. Push your repository to GitHub.
2. Import the project into Vercel.
3. Add the environment variables:
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_GEMINI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL` (optional)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional)
4. Click **Deploy**.

---

## 📄 License
MIT License. Built for the Agentic AI Hackathon.
