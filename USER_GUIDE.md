# CommitOS — Complete User & Feature Guide

> **Your Meetings. Now, Executed.**  
> *AI-Powered Organizational Memory, Conflict Triage & Execution Engine for SVIT Podcast Club and High-Velocity Squads.*

---

## 📑 Table of Contents

1. [Introduction to CommitOS](#-introduction-to-commitos)
2. [Quick-Start Guide (1-Minute Tour)](#-quick-start-guide-1-minute-tour)
3. [User Roles & Permissions Matrix](#-user-roles--permissions-matrix)
   - [Organization Admin (`org_admin`)](#1-organization-admin-org_admin)
   - [Team Leader (`team_leader`)](#2-team-leader-team_leader)
   - [Team Member (`team_member`)](#3-team-member-team_member)
   - [Side-by-Side Permissions Table](#side-by-side-permissions-table)
4. [Step-by-Step Feature Walkthrough](#-step-by-step-feature-walkthrough)
   - [1. Authentication & Role Switcher (`/signin`, `/signup`)](#1-authentication--role-switcher-signin-signup)
   - [2. Dashboard (`/`) — The Operational Hub](#2-dashboard---the-operational-hub)
   - [3. AskCommitOS AI Chatbot (Interactive RAG Memory)](#3-askcommitos-ai-chatbot-interactive-rag-memory)
   - [4. Meeting Ingestion & AI Intelligence (`/meetings`)](#4-meeting-ingestion--ai-intelligence-meetings)
   - [5. Organizational Memory (`/memory`)](#5-organizational-memory-memory)
   - [6. Decision Conflict Detection & Triage Engine](#6-decision-conflict-detection--triage-engine)
   - [7. Tasks & Execution Tracking (`/tasks`)](#7-tasks--execution-tracking-tasks)
   - [8. Governance Analytics & Club Health (`/analytics`)](#8-governance-analytics--club-health-analytics)
   - [9. Team Management & Settings (`/settings`)](#9-team-management--settings-settings)
5. [Real-World Walkthrough Scenarios](#-real-world-walkthrough-scenarios)
   - [Scenario A: Logging a New Podcast Episode Planning Meeting](#scenario-a-logging-a-new-podcast-episode-planning-meeting)
   - [Scenario B: Handling a Budget Conflict Between Leads](#scenario-b-handling-a-budget-conflict-between-leads)
   - [Scenario C: A Team Member Checking Their Weekly Workload](#scenario-c-a-team-member-checking-their-weekly-workload)
6. [Frequently Asked Questions & Troubleshooting](#-frequently-asked-questions--troubleshooting)

---

## 🌟 Introduction to CommitOS

CommitOS is an **Agentic Operating System for Organizational Memory and Execution**. 

In organizations like student clubs, engineering squads, and startups, meetings produce commitments, approved budgets, and decisions. Soon after:
- Decisions get contradicted in subsequent meetings (**Decision Drift**).
- Action items are forgotten without assigned owners or deadlines (**Lost Commitments**).
- New members have no single place to recall why a policy was chosen (**Organizational Amnesia**).

**CommitOS solves this permanently.** Powered by **Google Gemini AI**, it ingests transcripts or audio recordings, extracts verifiable decisions, cross-references past agreements across time to catch contradictions before they execute, assigns actionable tasks, and enables natural-language Q&A across the entire organizational history.

---

## ⚡ Quick-Start Guide (1-Minute Tour)

If you are running the app locally on `http://localhost:3000` (or `http://localhost:3001`):

1. **Sign In**: Visit [`/signin`](http://localhost:3000/signin). Click on any of the **Role Portal** buttons (`Admin`, `Team Leader`, or `Team Member`) to instantly fill demo credentials and click **Sign In**.
2. **Chat with AI**: On the **Dashboard**, click the AskCommitOS chat bar, type `hello` or `hi`, and press Enter. CommitOS will introduce itself.
3. **Query Past Decisions**: Ask: *"What is the approved budget for Season 2?"* or *"Who is assigned to edit Episode 4?"* to see grounded RAG memory in action.
4. **Inspect Meetings**: Click **Meetings** in the sidebar to review processed transcripts, extracted commitments, and conflict alerts.
5. **Track Tasks**: Click **Tasks** in the sidebar to view Kanban cards and drag/update task progress from *Todo* to *Completed*.
6. **Switch Roles**: Open the bottom user menu or top-right profile badge to switch between Admin, Leader, and Member to see permissions dynamically adapt.

---

## 🛡️ User Roles & Permissions Matrix

CommitOS enforces strict **Role-Based Access Control (RBAC)** across the UI and server APIs.

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

### 1. 👑 Organization Admin (`org_admin`)
* **Default Preset**: **Yug Patel** (`yug@svitpodcast.org`) — *Production Head & Club Admin*
* **What this role does**: Represents club presidents, board chairs, or executive directors with full governance authority.
* **Exclusive Capabilities**:
  - **Member Governance**: Invite new members, modify member roles (promote to Leader or demote), and remove members on the [Settings page](file:///Users/yugpatel/Desktop/Hackathon/src/app/settings/page.tsx).
  - **Decision Ratification**: Exclusively approve or ratify decision conflicts (e.g., overriding a previous budget decision).
  - **Delegation Control**: Can toggle the *Leader Delegation Switch* in Settings to grant or revoke conflict approval powers to Team Leaders.
  - **Organization Settings**: Update organization profile name, slug, description, and API keys.
  - **Meeting & Task Deletion**: Delete corrupted meeting records or obsolete tasks.

### 2. ⚡ Team Leader (`team_leader`)
* **Default Presets**:
  - **Rahul Sharma** (`rahul@svitpodcast.org`) — *Marketing Lead*
  - **Yash Patel** (`yash@svitpodcast.org`) — *Sponsorship Lead*
* **What this role does**: Represents department heads, scrum masters, or committee leads running day-to-day operations.
* **Capabilities**:
  - **Meeting Ingestion**: Upload audio recordings, video files, or paste transcripts to trigger the Google Gemini AI analysis pipeline.
  - **Task Delegation**: Create new tasks, set deadlines, pick priority levels (`Urgent`, `High`, `Medium`, `Low`), and assign tasks to any team member.
  - **Intelligence Review**: Review AI-extracted summaries, key points, and identified commitments.
  - **Conflict Triage**: Flag conflicts for discussion or reject invalid proposals. If the Admin has enabled *Leader Delegation*, Leaders can also ratify decision overrides.
  - **Cannot**: Modify organization billing/API keys, invite/remove members, or change member roles.

### 3. 👤 Team Member (`team_member`)
* **Default Presets**:
  - **Priya Nair** (`priya@svitpodcast.org`) — *Audio Engineer & Editor*
  - **Ananya Verma** (`ananya@svitpodcast.org`) — *Social Media Coordinator*
* **What this role does**: Represents contributors, editors, and volunteers executing assignments.
* **Capabilities**:
  - **Task Execution**: View personal task queue and update task progress (`Todo` ➔ `In Progress` ➔ `Completed`).
  - **Organizational Memory Access**: Query the **AskCommitOS AI** chatbot to recall past club decisions, budget limits, and context.
  - **Meeting Visibility**: View meeting summaries and decisions ratified by the leadership.
  - **Conflict Awareness**: View detected decision conflicts and click *Request Discussion* to notify leaders during team syncs.
  - **Security Barriers**: Upload buttons, member invitation forms, and administrative controls are safely hidden or disabled.

---

### Side-by-Side Permissions Table

| Feature / Action | Organization Admin | Team Leader | Team Member |
| :--- | :---: | :---: | :---: |
| **Sign In / Switch Roles** | ✅ Full | ✅ Full | ✅ Full |
| **AskCommitOS AI Q&A** | ✅ Full | ✅ Full | ✅ Full |
| **View Meetings & Summaries** | ✅ Full | ✅ Full | ✅ Permitted |
| **Upload & Process New Meetings** | ✅ Yes | ✅ Yes | ❌ Gate Protected |
| **Delete Meeting Records** | ✅ Yes | ❌ No | ❌ No |
| **Create & Assign Tasks** | ✅ Yes | ✅ Yes | ❌ No |
| **Update Task Status (Todo ➔ Done)** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Search Organizational Memory** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Ratify Decision Conflict Override** | ✅ Yes | ⚠️ If Delegated | ❌ Read-Only |
| **Flag Conflict for Discussion** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Invite / Remove Team Members** | ✅ Yes | ❌ No | ❌ No |
| **Change Member Roles** | ✅ Yes | ❌ No | ❌ No |
| **Configure API Keys & Models** | ✅ Yes | ❌ No | ❌ No |
| **Reset Demo Database** | ✅ Yes | ❌ No | ❌ No |

---

## 🔍 Step-by-Step Feature Walkthrough

### 1. Authentication & Role Switcher (`/signin`, `/signup`)

CommitOS provides a clean, dedicated onboarding experience with frosted glass aesthetics and the official CommitOS logo glowing in the background.

```
+-------------------------------------------------------+
|                       CommitOS                        |
|                       Sign In                         |
|      Access your meetings, decisions & tasks          |
|                                                       |
|  ROLE PORTAL                                          |
|  [ Admin ]        [ Team Leader ]     [ Team Member ] |
|                                                       |
|  EMAIL ADDRESS: [ yug@svitpodcast.org               ] |
|  PASSWORD:      [ .................                 ] |
|                                                       |
|  [                   Sign In  ->                    ] |
+-------------------------------------------------------+
```

* **1-Click Role Portals**:
  - Click **Admin** to autofill Yug Patel's credentials (`yug@svitpodcast.org`).
  - Click **Team Leader** to autofill Rahul Sharma's credentials (`rahul@svitpodcast.org`).
  - Click **Team Member** to autofill Priya Nair's credentials (`priya@svitpodcast.org`).
* **Custom Sign Up**: Click **Sign Up** at the bottom to register a custom account with name, email, password, role, and organization.
* **Instant Role Switcher**: Once logged in, you can switch between roles at any time using the quick profile widget at the bottom of the sidebar.

---

### 2. Dashboard (`/`) — The Operational Hub

The home screen provides a simplified command center designed to eliminate cognitive clutter:

1. **AskCommitOS Hero Centerpiece**: Positioned at the top of the page with luminous monochrome borders. This is the fastest way to interact with club intelligence.
2. **Recent Meetings**: Displays the last 3 meetings processed by the club, showing date, attendee badges, extracted decision counts, and task counts.
3. **Action Items**: Displays high-priority tasks assigned to the team with status pills and deadlines.
4. **Quick Action Shortcuts**:
   - **Upload Meeting**: Opens the meeting ingestion pipeline.
   - **Search Memory**: Opens the searchable knowledge repository.
   - **View Analytics**: Opens the club governance health report.

---

### 3. AskCommitOS AI Chatbot (Interactive RAG Memory)

The AskCommitOS assistant sits on the home dashboard and connects directly to Google Gemini and your club's organizational memory store.

#### How It Works:
* **Clean Greeting Behavior**: When you first load the page, the chat input is completely empty and clean.
* **Conversational Trigger**: If you type `hi`, `hello`, or `hey`, CommitOS immediately replies with the official welcome greeting:
  > *"Hello! I am CommitOS, your AI organizational memory assistant for SVIT Podcast Club. Ask me anything about previous meetings, approved budgets, task assignments, or decision history."*
* **Grounding Across Past Meetings**: Unlike generic chatbots, CommitOS queries your actual meeting transcripts, ratified decisions, and tasks.

#### Example Questions You Can Ask:
| Question You Type | What CommitOS Analyzes | Example Response |
| :--- | :--- | :--- |
| *"What is the approved budget for audio equipment?"* | Looks up decision history in the `budget` category. | *"In the Sponsorship & Budget Strategy meeting, the team ratified ₹15,000 for Shure SM7B microphones."* |
| *"Who is responsible for editing Episode 4?"* | Searches active tasks assigned to team members. | *"Priya Nair is assigned to 'Edit Episode 4 multi-track audio' due on Nov 25, 2026."* |
| *"Are there any active decision conflicts?"* | Scans pending conflicts detected by Gemini. | *"Yes, there is 1 active conflict: Meeting 3 proposed ₹25,000 for guest honorarium, which exceeds the ₹10,000 limit set in Meeting 1."* |

---

### 4. Meeting Ingestion & AI Intelligence (`/meetings`)

This is the ingestion engine of CommitOS. When team leaders hold a club sync, they record the conversation or take transcript notes.

```
Transcript / Audio
        │
        ▼
[ Google Gemini Multi-Agent Pipeline ]
   ├── Executive Summary Generator
   ├── Key Discussion Points Extractor
   ├── Verifiable Decision Parser (with confidence score)
   ├── Action Item Extractor (Assignee, Priority, Deadline)
   └── Cross-Meeting Conflict Detector (checks past decisions)
        │
        ▼
Structured Meeting Record Saved to Organizational Memory
```

#### Steps to Ingest a Meeting:
1. Navigate to **Meetings** from the sidebar.
2. Click the **+ New Meeting** button (visible to Admin and Team Leaders).
3. Fill in:
   - **Meeting Title**: e.g. *"SVIT Podcast — Season 2 Guest Outreach"*
   - **Date & Duration**: Select meeting date and length in minutes.
   - **Attendees**: Select participating club members.
   - **Input Method**: Either paste a raw text transcript or upload an audio/video recording.
4. Click **Process Meeting with Gemini**.
5. The AI agent processes the meeting in real time, displaying:
   - **Executive Summary**: A concise 2-3 paragraph breakdown.
   - **Decisions Ratified**: Approved motions with confidence ratings (e.g. 95% Confidence).
   - **Action Items Created**: Tasks automatically populated into the team task board.
   - **Conflict Alerts**: If any spoken decision contradicts an earlier meeting, a conflict flag is raised immediately.

---

### 5. Organizational Memory (`/memory`)

The Organizational Memory portal acts as the permanent, immutable ledger of the club.

* **Searchable Index**: Search across past decisions, rationales, and motions using keywords.
* **Category Filters**: Filter decisions by:
  - `Budget`: Equipment purchases, software subscriptions, travel funds.
  - `Marketing`: Poster releases, social media schedules, teaser clips.
  - `Production`: Studio booking, recording dates, audio mastering.
  - `Sponsorship`: Brand partnerships, revenue sharing, guest terms.
  - `Logistics`: Room reservations, SVIT campus approvals.
* **Status Flags**:
  - `Approved`: Currently active and binding.
  - `Superseded`: Replaced by a newer decision ratified by an Admin.
  - `Rejected`: Proposed in a meeting but voted down.
* **Audit Trail**: Click any decision to view its full history (who changed it, in which meeting, and the exact rationale).

---

### 6. Decision Conflict Detection & Triage Engine

When a club holds multiple meetings across weeks, teams frequently agree to things that violate earlier commitments. CommitOS detects this automatically using temporal RAG cross-referencing.

#### Example Scenario:
- **Meeting 1 (Oct 10)**: Admin approves: *"Total seasonal marketing budget is capped at ₹5,000."*
- **Meeting 3 (Nov 15)**: Social Media lead announces: *"We agreed to spend ₹8,500 on Instagram and LinkedIn ads."*
- **CommitOS Detection**: When Meeting 3 is ingested, CommitOS flags a **High-Impact Decision Conflict**.

#### Conflict Resolution Workflow:
```
                     [ Conflict Detected ]
                                │
               ┌────────────────┴────────────────┐
               ▼                                 ▼
      [ Ratify New Decision ]           [ Keep Previous Decision ]
   • Overrides old agreement         • Rejects new proposal
   • Requires Admin authorization    • Preserves original budget
   • Logs to immutable audit trail   • Notifies proposing team
```

* **Who can resolve?**:
  - **Organization Admin**: Can click **Ratify & Override** or **Reject** at any time.
  - **Team Leader**: Can reject or request discussion. If the Admin has enabled *Leader Delegation* in Settings, Leaders can also ratify.
  - **Team Member**: Can click **Request Discussion** to add the item to the next meeting agenda.

---

### 7. Tasks & Execution Tracking (`/tasks`)

CommitOS ensures spoken action items turn into finished deliverables.

* **Kanban Board & List Views**: Organize tasks by status:
  - `Todo` — Pending action items freshly extracted from meetings.
  - `In Progress` — Tasks currently being worked on by assigned members.
  - `Completed` — Executed and archived commitments.
* **Interactive Status Updates**: Any team member can click a task status badge or drag a card to transition it from *Todo* to *Completed*.
* **Priority Badges**:
  - 🔴 `Urgent` — Blocker or impending hard deadline.
  - 🟠 `High` — Core deliverable for current episode.
  - 🔵 `Medium` — Standard operational task.
  - ⚪ `Low` — Backlog improvement.
* **Create Manual Task**: Leaders and Admins can click **+ New Task** to manually assign deliverables without needing a meeting transcript.

---

### 8. Governance Analytics & Club Health (`/analytics`)

The Analytics dashboard provides visual telemetry on how effectively the club is operating:

* **Executive Metrics**:
  - **Total Meetings Held**: Historical meeting count.
  - **Decision Consensus Rate**: Percentage of decisions approved without persistent disputes.
  - **Task Completion Velocity**: Average days taken from meeting assignment to task completion.
  - **Open Conflicts**: Number of unresolved policy or budget contradictions.
* **Interactive Data Visualizations**:
  - **Meeting Velocity Trends**: Monthly meeting frequency line charts.
  - **Category Breakdown**: Pie charts showing budget vs marketing vs production split.
  - **Workload Distribution**: Bar charts showing assigned tasks per member to prevent burnout.
  - **High-Contrast Tooltips**: Hover over any chart point to see white text tooltips clearly rendered against the dark monochrome theme.

---

### 9. Team Management & Settings (`/settings`)

The Settings portal is the administrative center for managing club members, organizational access, and AI engine parameters.

* **Active Team Roster**:
  - Displays all registered club members with their official designations (`Production Head`, `Marketing Lead`, `Audio Engineer`) and role badges.
* **Invite Team Member** *(Admin Only)*:
  - Click **Invite Member**, enter their name, college email, designation, and assign an initial role (`Admin`, `Leader`, or `Member`).
* **Modify Member Roles** *(Admin Only)*:
  - Promote a Member to Leader, or change operational titles.
* **Remove Member** *(Admin Only)*:
  - Revoke member access (self-removal is guarded to prevent orphaned workspaces).
* **Leader Delegation Toggle** *(Admin Only)*:
  - Turn on *"Authorize Team Leaders to Ratify Conflicts"* to delegate override authority to department heads during high-velocity sprints.
* **AI & Provider Settings** *(Admin Only)*:
  - Configure the Google Gemini API key (safely masked in the UI).
  - Select AI model (`gemini-3.5-flash-lite` recommended for high speed).
* **1-Click Demo Reset**:
  - Click **Reset to Demo Data** at the bottom of Settings to reset all meetings, tasks, and conflicts back to the default SVIT Podcast Club state.

---

## 🎭 Real-World Walkthrough Scenarios

### Scenario A: Logging a New Podcast Episode Planning Meeting
1. Log in as **Rahul Sharma** (Team Leader) via the `/signin` portal.
2. In the sidebar, click **Meetings**, then click **+ New Meeting**.
3. Set the Title to: *"SVIT Podcast — Ep 05 Tech Innovations Planning"*.
4. Paste the transcript where Yug and Priya discuss studio availability and equipment setup.
5. Click **Process Meeting with Gemini**.
6. Gemini automatically parses:
   - Decision: *"Record Ep 05 in SVIT Studio B on Nov 28."* (Confidence: 96%).
   - Task: *"Priya to check 3-point lighting setup in Studio B"* due Nov 27.
7. Click **Save Meeting**. The task immediately appears on Priya's task board.

### Scenario B: Handling a Budget Conflict Between Leads
1. Suppose a meeting proposes spending ₹18,000 on studio rental when the approved budget cap was ₹10,000.
2. In the sidebar, a red **1 alert** badge appears on the **Meetings** tab.
3. Open the meeting to see the **Decision Conflict Alert Banner**.
4. If logged in as **Priya** (Member), Priya can click **Request Discussion** to place it on the agenda.
5. If logged in as **Yug** (Admin), Yug reviews the blast radius:
   - Click **Ratify & Override** if the extra expense was justified by club sponsorship.
   - Click **Keep Previous Decision** if the team must stick to the original ₹10,000 limit.

### Scenario C: A Team Member Checking Their Weekly Workload
1. Log in as **Priya Nair** (Team Member) via `/signin`.
2. On the **Dashboard**, look at the **Action Items** card to see tasks specifically assigned to Priya.
3. In the AskCommitOS chat widget, type:
   *"What tasks are assigned to me for this week?"*
4. CommitOS summarizes Priya's action items, priority levels, and due dates.
5. When Priya finishes editing Episode 4, she navigates to **Tasks**, finds the card, and clicks the status pill to change it from `In Progress` to `Completed`.

---

## ❓ Frequently Asked Questions & Troubleshooting

### Q1: Which port should I use in my browser?
The Next.js application runs on `http://localhost:3000` (or `http://localhost:3001` if port 3000 is occupied). Both ports share the same synchronized application build.

### Q2: Why is the AI chatbot empty when I open the dashboard?
By design! CommitOS presents a clean, distraction-free interface. If you want an introduction, simply type `hello`, `hi`, or `hey` into the chat box, and CommitOS will reply with its capabilities.

### Q3: How do I test the application as an Admin vs a Member?
You can switch instantly!
- On `/signin`, click the **Admin**, **Team Leader**, or **Team Member** tab pill to load that profile.
- Or while logged in, click your name badge in the bottom-left of the sidebar to switch profiles without logging out.

### Q4: Can Team Members delete meetings or change budgets?
**No.** CommitOS enforces strict RBAC barriers. The UI hides deletion buttons and administrative settings for Team Members, and backend API routes verify permissions before executing any mutations.

### Q5: How do I reset all test data if I make changes during a demo?
Go to **Settings** (`/settings`), scroll down to the bottom, and click **Reset to Demo Data**. This will instantly restore all SVIT Podcast Club demo meetings, decisions, and tasks.

---

*CommitOS — Built for autonomous, accountable organizational execution.*
