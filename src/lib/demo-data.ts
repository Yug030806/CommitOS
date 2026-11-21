import {
  Organization,
  TeamMember,
  Meeting,
  Decision,
  DecisionConflict,
  Task,
  OrganizationalMemory,
  ExecutionRisk,
} from './types';

export const DEMO_MEMBERS: TeamMember[] = [
  {
    id: 'user-1',
    name: 'Yug',
    email: 'yug@svitpodcast.org',
    role: 'Production Head',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 'user-2',
    name: 'Rahul',
    email: 'rahul@svitpodcast.org',
    role: 'Marketing Lead',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 'user-3',
    name: 'Yash',
    email: 'yash@svitpodcast.org',
    role: 'Sponsorship Lead',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 'user-4',
    name: 'Priya',
    email: 'priya@svitpodcast.org',
    role: 'Event Coordinator',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face',
  },
];

export const DEMO_ORGANIZATION: Organization = {
  id: 'org-svit-podcast',
  name: 'SVIT Podcast Club',
  slug: 'svit-podcast-club',
  description: 'Premier student podcast and media production collective at SVIT.',
  members: DEMO_MEMBERS,
  createdAt: '2026-10-01T10:00:00Z',
};

export const DEMO_DECISIONS: Decision[] = [
  // Meeting 1 decisions
  {
    id: 'dec-101',
    organizationId: DEMO_ORGANIZATION.id,
    meetingId: 'meet-001',
    meetingTitle: 'Event Planning Meeting',
    title: 'Annual Flagship Event Date',
    value: 'December 15',
    status: 'approved',
    confidence: 0.96,
    category: 'logistics',
    rationale: 'Unanimously agreed upon to maximize student attendance before winter exams.',
    decidedAt: '2026-11-15T16:30:00Z',
  },
  {
    id: 'dec-102',
    organizationId: DEMO_ORGANIZATION.id,
    meetingId: 'meet-001',
    meetingTitle: 'Event Planning Meeting',
    title: 'Total Event Budget Cap',
    value: '₹15,000',
    status: 'approved',
    confidence: 0.94,
    category: 'budget',
    rationale: 'Budget allocated for stage decor, audio equipment rentals, and guest refreshments.',
    decidedAt: '2026-11-15T16:45:00Z',
  },
  {
    id: 'dec-103',
    organizationId: DEMO_ORGANIZATION.id,
    meetingId: 'meet-001',
    meetingTitle: 'Event Planning Meeting',
    title: 'Marketing & Outreach Responsibility',
    value: 'Rahul handles marketing & digital campaigns',
    status: 'approved',
    confidence: 0.98,
    category: 'marketing',
    rationale: 'Rahul has previous graphic design and campaign experience with club handles.',
    decidedAt: '2026-11-15T17:00:00Z',
  },
  {
    id: 'dec-104',
    organizationId: DEMO_ORGANIZATION.id,
    meetingId: 'meet-001',
    meetingTitle: 'Event Planning Meeting',
    title: 'Sponsorship Acquisition Responsibility',
    value: 'Yash handles corporate & local sponsorship outreach',
    status: 'approved',
    confidence: 0.95,
    category: 'sponsorship',
    rationale: 'Yash will target tech startups and regional educational partners.',
    decidedAt: '2026-11-15T17:15:00Z',
  },

  // Meeting 2 decisions
  {
    id: 'dec-201',
    organizationId: DEMO_ORGANIZATION.id,
    meetingId: 'meet-002',
    meetingTitle: 'Production Discussion',
    title: 'Main Show Event Format',
    value: 'Live Interactive Podcast with Audience Q&A Panel',
    status: 'approved',
    confidence: 0.92,
    category: 'production',
    rationale: 'Format selected to engage attendees and gather live audio clips for YouTube release.',
    decidedAt: '2026-11-22T15:20:00Z',
  },
  {
    id: 'dec-202',
    organizationId: DEMO_ORGANIZATION.id,
    meetingId: 'meet-002',
    meetingTitle: 'Production Discussion',
    title: 'Production Hardware & Setup',
    value: '4 Shure SM7B dynamic mics + 2 Sony A7III 4K camera rigs reserved from SVIT Media Lab',
    status: 'approved',
    confidence: 0.97,
    category: 'production',
    rationale: 'Equipment requisition signed off with college media center.',
    decidedAt: '2026-11-22T15:50:00Z',
  },

  // Meeting 3 decisions
  {
    id: 'dec-301',
    organizationId: DEMO_ORGANIZATION.id,
    meetingId: 'meet-003',
    meetingTitle: 'Follow-up Meeting',
    title: 'Proposed Event Date Change',
    value: 'December 20',
    status: 'proposed',
    confidence: 0.89,
    category: 'logistics',
    rationale: 'Yash requested an extension to close ₹8,000 corporate sponsorship with tech firm.',
    decidedAt: '2026-11-28T14:15:00Z',
  },
];

export const DEMO_TASKS: Task[] = [
  {
    id: 'task-001',
    organizationId: DEMO_ORGANIZATION.id,
    meetingId: 'meet-001',
    meetingTitle: 'Event Planning Meeting',
    decisionId: 'dec-103',
    title: 'Create event poster & social banners',
    description: 'Design official poster for December 15 event and submit to faculty coordinator for sign-off.',
    assigneeName: 'Rahul',
    assigneeRole: 'Marketing Lead',
    deadline: '2026-12-05',
    priority: 'high',
    status: 'in_progress',
    createdAt: '2026-11-15T17:30:00Z',
  },
  {
    id: 'task-002',
    organizationId: DEMO_ORGANIZATION.id,
    meetingId: 'meet-001',
    meetingTitle: 'Event Planning Meeting',
    decisionId: 'dec-104',
    title: 'Contact 5 potential sponsors for event funding',
    description: 'Pitch regional tech accelerators and local cafes for ₹15,000 sponsorship target.',
    assigneeName: 'Yash',
    assigneeRole: 'Sponsorship Lead',
    deadline: '2026-12-08',
    priority: 'high',
    status: 'in_progress',
    createdAt: '2026-11-15T17:35:00Z',
  },
  {
    id: 'task-003',
    organizationId: DEMO_ORGANIZATION.id,
    meetingId: 'meet-002',
    meetingTitle: 'Production Discussion',
    decisionId: 'dec-202',
    title: 'Check and test recording equipment & audio levels',
    description: 'Inspect XLR cables, audio interface gain levels, and SD card capacities in the studio.',
    assigneeName: 'Yug',
    assigneeRole: 'Production Head',
    deadline: '2026-12-01',
    priority: 'medium',
    status: 'completed',
    createdAt: '2026-11-22T16:05:00Z',
    completedAt: '2026-11-30T11:00:00Z',
  },
  {
    id: 'task-004',
    organizationId: DEMO_ORGANIZATION.id,
    meetingId: 'meet-002',
    meetingTitle: 'Production Discussion',
    decisionId: 'dec-201',
    title: 'Finalize production schedule & cue sheet',
    description: 'Draft minute-by-minute breakdown for the panel discussion and guest speaker transitions.',
    assigneeName: 'Priya',
    assigneeRole: 'Event Coordinator',
    deadline: '2026-12-06',
    priority: 'medium',
    status: 'in_progress',
    createdAt: '2026-11-22T16:10:00Z',
  },
  {
    id: 'task-005',
    organizationId: DEMO_ORGANIZATION.id,
    meetingId: 'meet-003',
    meetingTitle: 'Follow-up Meeting',
    decisionId: 'dec-301',
    title: 'Follow up on tech firm sponsorship MoU',
    description: 'Provide company rep with expected student footfall data and lock ₹8,000 sponsor package.',
    assigneeName: 'Yash',
    assigneeRole: 'Sponsorship Lead',
    deadline: '2026-12-04',
    priority: 'urgent',
    status: 'todo',
    createdAt: '2026-11-28T14:40:00Z',
  },
  {
    id: 'task-006',
    organizationId: DEMO_ORGANIZATION.id,
    meetingId: 'meet-003',
    meetingTitle: 'Follow-up Meeting',
    decisionId: 'dec-301',
    title: 'Verify SVIT Main Auditorium availability for Dec 20',
    description: 'Check college admin facility booking calendar if the date shift to Dec 20 is ratified.',
    assigneeName: 'Priya',
    assigneeRole: 'Event Coordinator',
    deadline: '2026-12-03',
    priority: 'urgent',
    status: 'todo',
    createdAt: '2026-11-28T14:45:00Z',
  },
];

export const DEMO_CONFLICTS: DecisionConflict[] = [
  {
    id: 'conf-001',
    organizationId: DEMO_ORGANIZATION.id,
    newMeetingId: 'meet-003',
    newMeetingTitle: 'Follow-up Meeting',
    previousDecisionId: 'dec-101',
    previousMeetingTitle: 'Event Planning Meeting',
    previousMeetingDate: 'November 15, 2026',
    proposedValue: 'December 20',
    previousValue: 'December 15',
    conflictReason:
      'The new proposal in Meeting 3 moves the event date to December 20, contradicting the officially approved December 15 date decided in Meeting 1.',
    impact:
      'High blast radius: Marketing poster deadline (Dec 5) will be misaligned, auditorium slot reservation may be forfeited, and speaker availability will need re-confirmation.',
    status: 'pending',
    detectedAt: '2026-11-28T14:50:00Z',
  },
];

export const DEMO_RISKS: ExecutionRisk[] = [
  {
    id: 'risk-001',
    organizationId: DEMO_ORGANIZATION.id,
    level: 'HIGH',
    title: 'Critical Milestone Delay & Date Ambiguity for Upcoming Flagship Event',
    reason:
      'Event poster approval and sponsorship commitments are still pending while the approved date of December 15 is approaching. A proposal to move to December 20 is awaiting confirmation, causing execution gridlock.',
    affectedTaskTitles: [
      'Create event poster & social banners',
      'Contact 5 potential sponsors for event funding',
      'Verify SVIT Main Auditorium availability for Dec 20',
    ],
    potentialImpact:
      'Marketing campaign launch blocked; printing delays will result in lower event turnout; sponsor packages cannot be invoiced without a verified date.',
    recommendedAction:
      'Use the Decision Conflict Triage to definitively approve or reject the December 20 date shift, then fast-track poster approval by Dec 5.',
    detectedAt: '2026-11-28T15:00:00Z',
  },
];

export const DEMO_MEMORIES: OrganizationalMemory[] = [
  {
    id: 'mem-001',
    organizationId: DEMO_ORGANIZATION.id,
    meetingId: 'meet-001',
    meetingTitle: 'Event Planning Meeting',
    date: '2026-11-15',
    category: 'Logistics',
    content:
      'The flagship podcast event date was confirmed as December 15 by unanimous agreement across Yug, Rahul, Yash, and Priya.',
    tags: ['event date', 'december 15', 'flagship', 'logistics'],
  },
  {
    id: 'mem-002',
    organizationId: DEMO_ORGANIZATION.id,
    meetingId: 'meet-001',
    meetingTitle: 'Event Planning Meeting',
    date: '2026-11-15',
    category: 'Budget',
    content:
      'The approved event budget is ₹15,000, funded partly from club reserves and partly through sponsorship outreach.',
    tags: ['budget', '₹15,000', 'finance', 'funding'],
  },
  {
    id: 'mem-003',
    organizationId: DEMO_ORGANIZATION.id,
    meetingId: 'meet-001',
    meetingTitle: 'Event Planning Meeting',
    date: '2026-11-15',
    category: 'Roles & Responsibilities',
    content:
      'Rahul was appointed responsible for marketing campaigns and event poster design. Yash was appointed responsible for sponsorship acquisition.',
    tags: ['marketing', 'rahul', 'sponsorship', 'yash', 'roles'],
  },
  {
    id: 'mem-004',
    organizationId: DEMO_ORGANIZATION.id,
    meetingId: 'meet-002',
    meetingTitle: 'Production Discussion',
    date: '2026-11-22',
    category: 'Production',
    content:
      'The live podcast format was finalized as an interactive panel. Equipment reservation confirmed for 4 Shure SM7B mics and 2 Sony A7III 4K cameras from SVIT Media Lab.',
    tags: ['production', 'shure sm7b', 'audio', 'video', 'format'],
  },
  {
    id: 'mem-005',
    organizationId: DEMO_ORGANIZATION.id,
    meetingId: 'meet-003',
    meetingTitle: 'Follow-up Meeting',
    date: '2026-11-28',
    category: 'Logistics Conflict',
    content:
      'Yash proposed shifting the event date from December 15 to December 20 to accommodate a ₹8,000 corporate sponsorship. The decision remains in pending conflict review.',
    tags: ['date change', 'conflict', 'december 20', 'yash', 'sponsor'],
  },
];

export const DEMO_MEETINGS: Meeting[] = [
  {
    id: 'meet-001',
    organizationId: DEMO_ORGANIZATION.id,
    title: 'Event Planning Meeting',
    date: '2026-11-15T16:00:00Z',
    duration: '42 mins',
    status: 'processed',
    summary:
      'Kickoff session for the SVIT Podcast Club annual flagship live event. The team locked in the target date of December 15 and established a hard budget ceiling of ₹15,000. Core ownership was divided with Rahul leading marketing initiatives and Yash driving sponsor outreach.',
    participants: ['Yug (Production Head)', 'Rahul (Marketing Lead)', 'Yash (Sponsorship Lead)', 'Priya (Event Coordinator)'],
    keyDiscussionPoints: [
      'Evaluation of student attendance schedules before December semester exams',
      'Cost estimations for stage lighting, acoustic treatment, and guest speaker honorarium',
      'Targeting regional tech incubators and student cafes for branding partnerships',
    ],
    unresolvedQuestions: [
      'Will college admin provide catering support for the guest speaker lounge?',
    ],
    decisions: [DEMO_DECISIONS[0], DEMO_DECISIONS[1], DEMO_DECISIONS[2], DEMO_DECISIONS[3]],
    actionItems: [DEMO_TASKS[0], DEMO_TASKS[1]],
    transcript: [
      { id: 't1', speaker: 'Yug', text: 'Welcome team. Let us settle the core logistics for our flagship live podcast. First priority: date and budget.', timestamp: '00:12' },
      { id: 't2', speaker: 'Priya', text: 'Looking at the academic calendar, December 15 is optimal before exam revision kicks in.', timestamp: '01:05' },
      { id: 't3', speaker: 'Rahul', text: 'I agree. December 15 gives us three full weeks to roll out teasers and print the campus posters.', timestamp: '01:42' },
      { id: 't4', speaker: 'Yug', text: 'Agreed. Event date is confirmed for December 15. Next, what is our budget cap?', timestamp: '02:30' },
      { id: 't5', speaker: 'Yash', text: 'Based on our club account and projected sponsor money, ₹15,000 is our maximum ceiling.', timestamp: '03:15' },
      { id: 't6', speaker: 'Yug', text: 'Approved: ₹15,000 budget cap. Rahul, you take full ownership of marketing and posters. Yash, you lead sponsorships.', timestamp: '04:10' },
      { id: 't7', speaker: 'Rahul', text: 'Understood. I will draft the official poster by December 5.', timestamp: '04:45' },
      { id: 't8', speaker: 'Yash', text: 'I am on it. Aiming for 5 sponsor outreach pitches by December 8.', timestamp: '05:12' },
    ],
    conflictDetected: false,
    createdAt: '2026-11-15T16:00:00Z',
  },
  {
    id: 'meet-002',
    organizationId: DEMO_ORGANIZATION.id,
    title: 'Production Discussion',
    date: '2026-11-22T15:00:00Z',
    duration: '35 mins',
    status: 'processed',
    summary:
      'Technical breakdown and studio logistics for the flagship podcast. The panel interview format was chosen over solo interviews. Hardware reservation of four Shure SM7B microphones and two Sony A7III 4K camera rigs was confirmed with the SVIT Media Lab.',
    participants: ['Yug (Production Head)', 'Priya (Event Coordinator)'],
    keyDiscussionPoints: [
      'Multi-microphone acoustic isolation on the auditorium stage',
      'Video switching workflows for live multi-camera recording',
      'Stage run-down and speaker transition timings',
    ],
    unresolvedQuestions: [
      'Do we have sufficient XLR cables for four table boom arms?',
    ],
    decisions: [DEMO_DECISIONS[4], DEMO_DECISIONS[5]],
    actionItems: [DEMO_TASKS[2], DEMO_TASKS[3]],
    transcript: [
      { id: 't9', speaker: 'Yug', text: 'Today we need to lock the technical and production setup for December 15.', timestamp: '00:15' },
      { id: 't10', speaker: 'Priya', text: 'We received positive feedback on doing a live interactive panel with audience questions rather than a closed room format.', timestamp: '01:20' },
      { id: 't11', speaker: 'Yug', text: 'Agreed, let us confirm the live interactive panel format. I will personally inspect the 4 Shure mics and cameras.', timestamp: '02:45' },
      { id: 't12', speaker: 'Priya', text: 'Great, I will prepare the minute-by-minute cue sheet and speaker rundown by December 6.', timestamp: '03:50' },
    ],
    conflictDetected: false,
    createdAt: '2026-11-22T15:00:00Z',
  },
  {
    id: 'meet-003',
    organizationId: DEMO_ORGANIZATION.id,
    title: 'Follow-up Meeting',
    date: '2026-11-28T14:00:00Z',
    duration: '28 mins',
    status: 'needs_review',
    summary:
      'Mid-cycle progress review. Yash reported progress on a major ₹8,000 corporate sponsorship with an EdTech firm, but the partner requested the event occur on December 20. This conflicts directly with the approved December 15 date. Yug flagged the decision conflict for formal triage.',
    participants: ['Yug (Production Head)', 'Rahul (Marketing Lead)', 'Yash (Sponsorship Lead)', 'Priya (Event Coordinator)'],
    keyDiscussionPoints: [
      'Status of sponsor commitments and contract paperwork',
      'Proposal by Yash to push the event date to December 20',
      'Repercussions on poster printing, exam schedules, and auditorium booking',
    ],
    unresolvedQuestions: [
      'Will the EdTech sponsor sign the memorandum if we hold the date at December 15?',
      'Is the SVIT auditorium available on December 20?',
    ],
    decisions: [DEMO_DECISIONS[6]],
    actionItems: [DEMO_TASKS[4], DEMO_TASKS[5]],
    transcript: [
      { id: 't13', speaker: 'Yug', text: 'Let us check in on our deliverables. Rahul, how is the poster? Yash, what is the sponsor status?', timestamp: '00:10' },
      { id: 't14', speaker: 'Rahul', text: 'Poster design is almost done, but I held off final printing until Yash locks the sponsor logos.', timestamp: '01:05' },
      { id: 't15', speaker: 'Yash', text: 'Here is the situation: a prominent EdTech startup wants to give us ₹8,000 in title sponsorship, but their VP can only join on December 20. Can we move the event date to December 20?', timestamp: '02:15' },
      { id: 't16', speaker: 'Priya', text: 'Wait! In Meeting 1 on November 15, we formally approved December 15! If we move it to December 20, I have to renegotiate the auditorium with the dean.', timestamp: '03:00' },
      { id: 't17', speaker: 'Yug', text: 'This is a direct decision contradiction. We cannot just informally change an approved date. CommitOS will flag this as a Decision Conflict. Let us log the proposal and run the review triage before overwriting anything.', timestamp: '04:15' },
      { id: 't18', speaker: 'Yash', text: 'Understood. I will follow up with the firm while Priya checks auditorium availability for December 20.', timestamp: '05:00' },
    ],
    conflictDetected: true,
    createdAt: '2026-11-28T14:00:00Z',
  },
];

// Sample transcript for "Meeting 4" that users can test uploading or simulating in the demo
export const SAMPLE_MEETING_4_TRANSCRIPT = `
Yug (Production Head): Welcome everyone to the Special Triage & Execution Sync for the SVIT Podcast Club.
Priya (Event Coordinator): Thanks Yug. We need to resolve the December 15 versus December 20 date conflict once and for all.
Yash (Sponsorship Lead): Good news from my end! The EdTech sponsor confirmed they can accommodate our original schedule if we offer them a 5-minute pre-show keynote! So we don't have to push to December 20 after all.
Rahul (Marketing Lead): That is huge! That means our original December 15 date stands firm! I can finalize the poster today!
Yug (Production Head): Fantastic! Let's formally record the decision: Event Date is reaffirmed as December 15. The proposed December 20 change is officially rejected.
Priya (Event Coordinator): Confirmed. I will also lock the faculty approval letter tomorrow.
Rahul (Marketing Lead): I will send the finalized poster to the print shop by 5 PM today.
Yash (Sponsorship Lead): And I will prepare the sponsorship agreement paperwork for signature by December 3.
Yug (Production Head): Excellent work. Let's make sure all tasks are updated in CommitOS. Meeting adjourned!
`;
