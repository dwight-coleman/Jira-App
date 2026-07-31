import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { addDays, subDays, subMonths, startOfMonth, endOfMonth, differenceInMinutes, addMinutes, addHours } from 'date-fns';

const prisma = new PrismaClient();

const APPLICATIONS = [
  { name: 'AI Flow', displayName: 'AI Flow', criticality: 'Critical', team: 'AI Platform', owner: 'Sarah Chen', ownerEmail: 'sarah.chen@company.com' },
  { name: 'RS2', displayName: 'Revenue System 2', criticality: 'High', team: 'Finance Engineering', owner: 'Marcus Johnson', ownerEmail: 'marcus.johnson@company.com' },
  { name: 'ATR', displayName: 'Automated Trading Router', criticality: 'Critical', team: 'Trading Platform', owner: 'Elena Rodriguez', ownerEmail: 'elena.rodriguez@company.com' },
  { name: 'FMIS', displayName: 'Financial Management Information System', criticality: 'High', team: 'Finance Engineering', owner: 'David Kim', ownerEmail: 'david.kim@company.com' },
  { name: 'PRIME', displayName: 'PRIME Platform', criticality: 'Critical', team: 'Core Platform', owner: 'Lisa Thompson', ownerEmail: 'lisa.thompson@company.com' },
  { name: 'RPMS', displayName: 'Risk & Portfolio Management System', criticality: 'High', team: 'Risk Engineering', owner: 'James Wilson', ownerEmail: 'james.wilson@company.com' },
  { name: 'FDM', displayName: 'Financial Data Mesh', criticality: 'Medium', team: 'Data Platform', owner: 'Amanda Foster', ownerEmail: 'amanda.foster@company.com' },
];

const USERS = [
  { id: uuidv4(), email: 'alex.martinez@company.com', name: 'Alex Martinez', role: 'Senior', team: 'AI Platform', passwordHash: '$2a$10$dummy' },
  { id: uuidv4(), email: 'priya.sharma@company.com', name: 'Priya Sharma', role: 'Lead Engineer', team: 'Finance Engineering', passwordHash: '$2a$10$dummy' },
  { id: uuidv4(), email: 'carlos.mendez@company.com', name: 'Carlos Mendez', role: 'Engineer', team: 'Trading Platform', passwordHash: '$2a$10$dummy' },
  { id: uuidv4(), email: 'sarah.kim@company.com', name: 'Sarah Kim', role: 'Senior Engineer', team: 'Core Platform', passwordHash: '$2a$10$dummy' },
  { id: uuidv4(), email: 'michael.chen@company.com', name: 'Michael Chen', role: 'Engineer', team: 'Risk Engineering', passwordHash: '$2a$10$dummy' },
  { id: uuidv4(), email: 'emily.davis@company.com', name: 'Emily Davis', role: 'Senior Engineer', team: 'Data Platform', passwordHash: '$2a$10$dummy' },
  { id: uuidv4(), email: 'robert.taylor@company.com', name: 'Robert Taylor', role: 'Engineer', team: 'AI Platform', passwordHash: '$2a$10$dummy' },
  { id: uuidv4(), email: 'jennifer.lee@company.com', name: 'Jennifer Lee', role: 'Lead Engineer', team: 'Finance Engineering', passwordHash: '$2a$10$dummy' },
];

const ENGINEERS = [
  { id: uuidv4(), email: 'alex.martinez@company.com', name: 'Alex Martinez', role: 'Senior Engineer', team: 'AI Platform', applications: ['AI Flow'], expertise: ['MLOps', 'Kubernetes', 'Python'] },
  { id: uuidv4(), email: 'priya.sharma@company.com', name: 'Priya Sharma', role: 'Lead Engineer', team: 'Finance Engineering', applications: ['RS2', 'FMIS'], expertise: ['Java', 'Spring Boot', 'PostgreSQL'] },
  { id: uuidv4(), email: 'carlos.mendez@company.com', name: 'Carlos Mendez', role: 'Engineer', team: 'Trading Platform', applications: ['ATR'], expertise: ['C++', 'Low Latency', 'FIX Protocol'] },
  { id: uuidv4(), email: 'sarah.kim@company.com', name: 'Sarah Kim', role: 'Senior Engineer', team: 'Core Platform', applications: ['PRIME'], expertise: ['Go', 'Microservices', 'gRPC'] },
  { id: uuidv4(), email: 'michael.chen@company.com', name: 'Michael Chen', role: 'Engineer', team: 'Risk Engineering', applications: ['RPMS'], expertise: ['Python', 'Risk Models', 'AWS'] },
  { id: uuidv4(), email: 'emily.davis@company.com', name: 'Emily Davis', role: 'Senior Engineer', team: 'Data Platform', applications: ['FDM'], expertise: ['Spark', 'Kafka', 'Data Engineering'] },
  { id: uuidv4(), email: 'robert.taylor@company.com', name: 'Robert Taylor', role: 'Engineer', team: 'AI Platform', applications: ['AI Flow'], expertise: ['TensorFlow', 'Model Serving', 'Docker'] },
  { id: uuidv4(), email: 'jennifer.lee@company.com', name: 'Jennifer Lee', role: 'Lead Engineer', team: 'Finance Engineering', applications: ['RS2', 'FMIS'], expertise: ['Java', 'Kafka', 'Event Sourcing'] },
];

const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
const SEVERITIES = ['Severity 1', 'Severity 2', 'Severity 3', 'Severity 4'];
const STATUSES = ['Open', 'In Progress', 'Waiting for Customer', 'Waiting for Support', 'Resolved', 'Closed', 'Reopened'];
const REQUEST_TYPES = ['Incident', 'Service Request', 'Change Request', 'Problem', 'Access Request', 'Information Request'];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateTicketKey(appPrefix: string, number: number): string {
  return `${appPrefix}-${number.toString().padStart(4, '0')}`;
}

interface CommentBeat {
  author: 'reporter' | 'assignee';
  text: string;
  internal?: boolean;
}

interface UserRef {
  id: string;
  name: string;
}

let commentsCreated = 0;
let analysesCreated = 0;

async function createComments(ticketId: string, startTime: Date, endTime: Date, reporterUser: UserRef, assigneeUser: UserRef, beats: CommentBeat[]) {
  if (beats.length === 0) return;
  const span = Math.max(endTime.getTime() - startTime.getTime(), beats.length * 10 * 60 * 1000);
  for (let i = 0; i < beats.length; i++) {
    const beat = beats[i];
    const author = beat.author === 'reporter' ? reporterUser : assigneeUser;
    const authorRole = beat.author === 'reporter' ? 'Reporter' : 'Engineer';
    const offsetRatio = (i + 1) / (beats.length + 1);
    const commentTime = new Date(startTime.getTime() + span * offsetRatio);
    const isInternal = beat.internal ?? (beat.author === 'assignee' && i > 0 && i < beats.length - 1);
    await prisma.ticketComment.create({
      data: {
        ticketId,
        authorId: author.id,
        authorName: author.name,
        authorRole,
        content: beat.text,
        isInternal,
        createdAt: commentTime,
        updatedAt: commentTime,
      },
    });
    commentsCreated++;
  }
}

interface AnalysisContent {
  rootCause: string;
  remediation: string;
  businessImpact: string;
  preventativeActions: string[];
}

async function createAIAnalysis(ticketId: string, appName: string, summary: string, priority: string, content: AnalysisContent) {
  await prisma.aIAnalysis.create({
    data: {
      ticketId,
      executiveSummary: `${summary}. ${content.businessImpact}`,
      condensedTechnicalSummary: content.rootCause,
      rootCause: content.rootCause,
      affectedApplication: appName,
      remediationSummary: content.remediation,
      businessImpact: content.businessImpact,
      recommendedPreventativeActions: JSON.stringify(content.preventativeActions),
      actionItems: JSON.stringify([]),
      confidenceScore: Math.round((0.8 + Math.random() * 0.17) * 100) / 100,
      tags: JSON.stringify(['generated', appName.toLowerCase().replace(/\s+/g, '-'), priority.toLowerCase()]),
      recurringIssueDetected: false,
      generatedBy: 'mock-ai',
      model: 'mock-ai-v1',
    },
  });
  analysesCreated++;
}

function genericComments(status: string, appName: string, summaryText: string): CommentBeat[] {
  const beats: CommentBeat[] = [
    { author: 'assignee', text: `Acknowledged — starting to look into "${summaryText}" now.` },
  ];
  if (['In Progress', 'Waiting for Customer', 'Waiting for Support', 'Resolved', 'Closed'].includes(status)) {
    beats.push({
      author: 'assignee',
      text: `Traced this to the ${getRandomElement(['service layer', 'data pipeline', 'integration point', 'background job', 'API gateway'])} in ${appName}. Continuing to narrow down the root cause.`,
      internal: true,
    });
  }
  if (status === 'Waiting for Customer') {
    beats.push({ author: 'assignee', text: 'Following up with the reporting team for more detail before we can proceed further.' });
  } else if (status === 'Waiting for Support') {
    beats.push({ author: 'assignee', text: 'Escalated to the platform team for input, waiting on their response before continuing.', internal: true });
  }
  if (['Resolved', 'Closed'].includes(status)) {
    beats.push({ author: 'assignee', text: 'Deployed a fix and confirmed the issue is no longer reproducing. Marking as resolved.' });
  }
  return beats;
}

function genericAnalysisContent(appName: string, priority: string): AnalysisContent {
  const rootCause = `Investigation traced the issue to a fault in ${appName}'s ${getRandomElement(['service layer', 'data pipeline', 'integration point', 'background job', 'API gateway'])}, consistent with the reported symptoms.`;
  const remediation = 'Applied a fix directly to the affected component and verified normal behavior was restored before closing out the ticket.';
  const businessImpact = priority === 'Critical'
    ? `Caused a significant disruption to ${appName} for affected users until resolved.`
    : priority === 'High'
    ? `Degraded ${appName} for a subset of users until the fix was deployed.`
    : `Minor, contained impact to ${appName} with no significant disruption to end users.`;
  const preventativeActions = [
    `Add monitoring around the affected component in ${appName}`,
    'Document this failure mode in the team runbook',
  ];
  return { rootCause, remediation, businessImpact, preventativeActions };
}

async function main() {
  console.log('🌱 Starting synthetic data generation...');

  // Clean existing data
  await prisma.$transaction([
    prisma.aIAnalysis.deleteMany(),
    prisma.aIInsight.deleteMany(),
    prisma.monthlyReport.deleteMany(),
    prisma.applicationHealthScore.deleteMany(),
    prisma.trendHistory.deleteMany(),
    prisma.ticket.deleteMany(),
    prisma.engineer.deleteMany(),
    prisma.user.deleteMany(),
    prisma.application.deleteMany(),
    prisma.providerConfig.deleteMany(),
    prisma.aIProviderConfig.deleteMany(),
    prisma.settings.deleteMany(),
  ]);

  console.log('🧹 Cleaned existing data');

  // Create users (for ticket foreign keys)
  console.log('👥 Creating users...');
  for (const user of USERS) {
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        teams: user.team,
        passwordHash: user.passwordHash,
        isActive: true,
        preferences: JSON.stringify({
          timezone: 'America/New_York',
          notifications: { email: true, slack: true, inApp: true },
          workingHours: { start: '09:00', end: '17:00', days: [1, 2, 3, 4, 5] },
        }),
      },
    });
  }
  console.log(`✅ Created ${USERS.length} users`);

  // Create engineers (for performance tracking)
  console.log('👷 Creating engineers...');
  for (const eng of ENGINEERS) {
    await prisma.engineer.create({
      data: {
        id: eng.id,
        email: eng.email,
        name: eng.name,
        role: eng.role,
        team: eng.team,
        applications: JSON.stringify(eng.applications),
        expertise: JSON.stringify(eng.expertise),
        isActive: true,
        hireDate: subDays(new Date(), Math.floor(Math.random() * 1000) + 100),
        preferences: JSON.stringify({
          timezone: 'America/New_York',
          notifications: { email: true, slack: true, inApp: true },
          workingHours: { start: '09:00', end: '17:00', days: [1, 2, 3, 4, 5] },
        }),
      },
    });
  }
  console.log(`✅ Created ${ENGINEERS.length} engineers`);

  // Create applications
  console.log('📱 Creating applications...');
  for (const app of APPLICATIONS) {
    await prisma.application.create({
      data: {
        name: app.name,
        displayName: app.displayName,
        description: `Enterprise application: ${app.displayName}`,
        owner: app.owner,
        ownerEmail: app.ownerEmail,
        team: app.team,
        criticality: app.criticality,
        type: 'Internal',
        environment: 'Production',
        technologies: JSON.stringify(getRandomElements(['Java', 'Python', 'Go', 'C++', 'React', 'Kubernetes', 'Kafka', 'PostgreSQL', 'Redis', 'AWS'], 4)),
        dependencies: JSON.stringify(getRandomElements(APPLICATIONS.filter(a => a.name !== app.name).map(a => a.name), 2)),
        slaResponseTime: 30,
        slaResolutionTime: 240,
        healthHealthy: 80,
        healthDegraded: 50,
        healthCritical: 30,
        isActive: true,
      },
    });
  }
  console.log(`✅ Created ${APPLICATIONS.length} applications`);

  // Get created records for reference
  const users = await prisma.user.findMany();
  const engineers = await prisma.engineer.findMany();
  const applications = await prisma.application.findMany();

  const appPrefixMap: Record<string, string> = {
    'AI Flow': 'AI',
    'RS2': 'RS2',
    'ATR': 'ATR',
    'FMIS': 'FMIS',
    'PRIME': 'PRIME',
    'RPMS': 'RPMS',
    'FDM': 'FDM',
  };

  const monthStart = startOfMonth(subMonths(new Date(), 1));
  const monthEnd = endOfMonth(subMonths(new Date(), 1));

  let ticketCounter = 1000;

  // Generate tickets from templates
  console.log('🎫 Generating tickets...');

  const ticketTemplates = [
    // AI Flow tickets
    {
      app: 'AI Flow', summary: 'Authentication failures in AI Flow model serving endpoints',
      priority: 'Critical', severity: 'Severity 1', requestType: 'Incident', status: 'Resolved', slaStatus: 'Breached',
      rootCause: "A service-account credential used by the model-serving gateway to authenticate against the internal token service expired overnight and was not covered by existing rotation alerting, causing all inference requests to be rejected with 401 errors.",
      remediation: "Rotated the expired credential, redeployed the gateway with the refreshed secret from the vault, and verified inference traffic recovered to baseline within minutes.",
      businessImpact: "Real-time credit scoring inference was unavailable for roughly 47 minutes during US market hours, forcing loan-decisioning requests to fail over to manual review for an estimated 340 applications.",
      preventativeActions: ['Automate rotation for all AI Flow service-account credentials', 'Add expiry alerting 14 days ahead of credential expiration', 'Add a synthetic authentication health check to the deployment pipeline'],
      comments: [
        { author: 'assignee', text: "Picking this up — seeing a spike in 401s from the model-serving gateway starting around 09:14 UTC. Checking the auth service logs now." },
        { author: 'assignee', text: "Confirmed: the gateway's service-account credential expired overnight and wasn't covered by our rotation alerting. Rotating it now." },
        { author: 'reporter', text: "This is blocking loan-decisioning for the credit scoring team — they've had to fail over to manual review. Please prioritize." },
        { author: 'assignee', text: "New credential deployed and gateway restarted. Inference traffic is back to baseline. Adding expiry alerting so this can't happen silently again." },
      ] as CommentBeat[],
    },
    {
      app: 'AI Flow', summary: 'GPU memory leaks in batch inference pipeline',
      priority: 'High', severity: 'Severity 2', requestType: 'Problem', status: 'Resolved', slaStatus: 'At Risk',
      rootCause: "A tensor cache in the batch inference worker was not being released between batches, causing GPU memory usage to climb until the worker pods were OOM-killed.",
      remediation: "Patched the batch worker to explicitly clear the tensor cache after each batch and rolled out the fix to all inference nodes; memory usage now stays flat across multi-hour runs.",
      businessImpact: "Nightly batch scoring runs were intermittently failing partway through, delaying downstream risk reports by up to a few hours on affected nights.",
      preventativeActions: ['Add GPU memory usage alerting per inference node', 'Add a soak test to CI that runs multiple batches back-to-back', 'Set explicit memory limits with faster pod restarts as a safety net'],
      comments: [
        { author: 'assignee', text: "Looking into the OOM-kill pattern on the batch workers — memory climbs steadily across batches rather than spiking once." },
        { author: 'assignee', text: "Found it: we're not releasing the tensor cache between batches. Writing a fix to clear it explicitly after each batch completes." },
        { author: 'assignee', text: "Fix rolled out to all inference nodes. Ran three consecutive batches without a memory climb, looks stable. Will keep an eye on tonight's run." },
      ] as CommentBeat[],
    },
    {
      app: 'AI Flow', summary: 'Model drift detection alert for credit scoring model v3.2',
      priority: 'Medium', severity: 'Severity 3', requestType: 'Problem', status: 'Resolved', slaStatus: 'Met',
      rootCause: "A gradual shift in the distribution of incoming applicant income data caused the credit scoring model's prediction distribution to drift outside its configured threshold, triggering the automated drift alert.",
      remediation: "Confirmed the drift was due to a legitimate seasonal shift in applicant mix rather than a data pipeline issue, and scheduled the model for its regular quarterly retrain a few weeks early to account for it.",
      businessImpact: "No customer-facing impact; the model continued scoring within acceptable accuracy bounds, but early retraining reduces the risk of scoring degradation over the next quarter.",
      preventativeActions: ['Track applicant demographic shifts alongside drift metrics to speed up triage', 'Document expected seasonal drift patterns for future alerts'],
      comments: [
        { author: 'assignee', text: "Drift alert fired for the credit scoring model — checking whether this is a pipeline issue or an actual distribution shift." },
        { author: 'assignee', text: "This looks like a genuine shift in applicant income distribution, not a data quality issue. Comparing against last year's seasonal pattern now." },
        { author: 'assignee', text: "Confirmed it's seasonal. Model accuracy is still within bounds, but I've moved the quarterly retrain up by a few weeks to be safe." },
      ] as CommentBeat[],
    },
    // RS2 tickets
    {
      app: 'RS2', summary: 'Invoice processing timeout for high-volume vendors',
      priority: 'High', severity: 'Severity 2', requestType: 'Incident', status: 'Resolved', slaStatus: 'Breached',
      rootCause: "A small number of high-volume vendor accounts had invoice batches large enough to exceed the synchronous processing timeout on the invoice ingestion service.",
      remediation: "Moved large-batch invoice processing to an asynchronous queue with status polling, removing the synchronous timeout ceiling entirely.",
      businessImpact: "Several of the highest-volume vendors experienced delayed invoice confirmations, risking late-payment penalties if not resolved before the next payment run.",
      preventativeActions: ['Move all invoice batch processing to async by default', 'Add batch-size-aware alerting before vendors hit the old timeout ceiling'],
      comments: [
        { author: 'assignee', text: "Reproduced the timeout — it only hits vendors submitting very large invoice batches in a single request." },
        { author: 'assignee', text: "Rather than just raising the timeout, moving large-batch processing to an async queue so this can't recur at any volume." },
        { author: 'reporter', text: "A couple of our top vendors are asking about payment timing — appreciate a fast turnaround here." },
        { author: 'assignee', text: "Async processing is live for all vendors. Reprocessed the backlog manually and confirmed all pending invoices are through." },
      ] as CommentBeat[],
    },
    {
      app: 'RS2', summary: 'Duplicate payment detection false positives',
      priority: 'Medium', severity: 'Severity 3', requestType: 'Service Request', status: 'Resolved', slaStatus: 'Met',
      rootCause: "The duplicate-payment matcher was flagging legitimate recurring payments from the same vendor and amount as duplicates because it didn't account for scheduled recurring invoices.",
      remediation: "Added a recurring-invoice exception to the matcher so scheduled payments with a known recurrence pattern are no longer flagged.",
      businessImpact: "Finance ops was manually clearing several false-positive flags per week, adding avoidable review overhead.",
      preventativeActions: ['Tag recurring invoices at creation time so downstream matching can use that signal directly'],
      comments: [
        { author: 'assignee', text: "Reviewing the flagged 'duplicates' — several look like legitimate recurring payments to the same vendor." },
        { author: 'assignee', text: "Confirmed, the matcher doesn't know about recurring invoice schedules. Adding an exception for known recurring patterns." },
        { author: 'assignee', text: "Deployed the fix and re-ran the matcher against last week's flagged items — false positive rate dropped to zero for recurring vendors." },
      ] as CommentBeat[],
    },
    // ATR tickets
    {
      app: 'ATR', summary: 'Order routing latency spike during market open',
      priority: 'Critical', severity: 'Severity 1', requestType: 'Incident', status: 'Resolved', slaStatus: 'Breached',
      rootCause: "A downstream market-data feed handler fell behind during the opening auction volume spike, causing the order router to queue orders while waiting on stale price data.",
      remediation: "Added a dedicated, pre-scaled feed handler pool for the market-open window and tuned the router to fail over to the backup feed automatically when handler lag exceeds a threshold.",
      businessImpact: "Order routing latency briefly exceeded acceptable bounds during the opening minutes of trading, affecting execution quality on a subset of orders routed through the primary venue.",
      preventativeActions: ['Pre-scale feed handler capacity ahead of every market open', 'Add automatic feed failover based on handler lag', 'Add a latency dashboard specifically for the open/close windows'],
      comments: [
        { author: 'assignee', text: "Latency spike lines up exactly with market open — pulling feed handler metrics now." },
        { author: 'assignee', text: "Feed handler lag spiked under opening volume and the router was queuing orders behind stale price data as a result." },
        { author: 'reporter', text: "Desk is asking if this affected fills this morning — need an answer for the post-mortem." },
        { author: 'assignee', text: "Added dedicated pre-scaled handler capacity for the open and automatic failover on handler lag. Latency held steady through this afternoon's close as a first check." },
      ] as CommentBeat[],
    },
    {
      app: 'ATR', summary: 'FIX session drops with liquidity provider Citadel',
      priority: 'High', severity: 'Severity 2', requestType: 'Incident', status: 'Resolved', slaStatus: 'Met',
      rootCause: "A heartbeat interval mismatch between our FIX engine and Citadel's gateway caused the session to be dropped as unresponsive during periods of low message volume.",
      remediation: "Aligned our heartbeat interval configuration with Citadel's published spec and added automatic session re-establishment with sequence number recovery.",
      businessImpact: "Brief gaps in connectivity to one liquidity venue during low-volume periods; order flow automatically rerouted to backup venues with no missed trades.",
      preventativeActions: ["Audit heartbeat interval configuration against each venue's published spec", 'Add alerting on FIX session drops with time-to-reconnect tracking'],
      comments: [
        { author: 'assignee', text: "Seeing repeated session drops with Citadel specifically, other venues are stable. Comparing heartbeat configs." },
        { author: 'assignee', text: "Our heartbeat interval doesn't match what Citadel's gateway expects — that's causing it to treat us as unresponsive and drop the session." },
        { author: 'assignee', text: "Corrected the heartbeat interval and added auto-reconnect with sequence recovery. No drops since the fix went out." },
      ] as CommentBeat[],
    },
    // FMIS tickets
    {
      app: 'FMIS', summary: 'Month-end close: GL reconciliation failure',
      priority: 'Critical', severity: 'Severity 1', requestType: 'Incident', status: 'Resolved', slaStatus: 'Breached',
      rootCause: "A rounding-precision mismatch between the sub-ledger export and the GL import job caused reconciliation totals to differ by fractions of a cent across thousands of line items, failing the automated balance check.",
      remediation: "Standardized rounding precision across the sub-ledger export and GL import to match, and re-ran the reconciliation job successfully against the corrected export.",
      businessImpact: "Month-end close was delayed while finance investigated the imbalance, putting pressure on the close timeline reported to leadership.",
      preventativeActions: ['Standardize rounding precision across all finance data pipelines', 'Add a pre-close dry-run reconciliation check earlier in the month'],
      comments: [
        { author: 'assignee', text: "GL reconciliation is failing on a balance mismatch — pulling the diff between sub-ledger and GL totals now." },
        { author: 'assignee', text: "The imbalance traces back to a rounding precision difference between the two exports, not an actual accounting error." },
        { author: 'reporter', text: "Finance needs this resolved before end of day to hit the close deadline — flagging as high priority." },
        { author: 'assignee', text: "Standardized the rounding precision and re-ran reconciliation — balances match exactly. Close can proceed." },
      ] as CommentBeat[],
    },
    {
      app: 'FMIS', summary: 'Expense report approval workflow stuck',
      priority: 'High', severity: 'Severity 2', requestType: 'Incident', status: 'Resolved', slaStatus: 'At Risk',
      rootCause: "A manager reassignment left several expense reports pointing at an approver role that no longer had an active user assigned, so the workflow had no valid next approver and stalled silently.",
      remediation: "Reassigned the stuck reports to the correct current approver and added a validation check that flags workflows pointing at roles with no active assignee.",
      businessImpact: "A batch of employee expense reimbursements was delayed by several days pending manual intervention.",
      preventativeActions: ['Validate approver assignment whenever a manager role changes', 'Add a stalled-workflow alert for reports with no movement after a set period'],
      comments: [
        { author: 'assignee', text: "Looking into the stuck expense reports — none of them have a valid next approver in the workflow." },
        { author: 'assignee', text: "Found it: these all route through an approver role that lost its active assignee during a recent reorg." },
        { author: 'assignee', text: "Reassigned the stuck reports to the current approver and added a check to catch this earlier next time. Reimbursements should process on the next run." },
      ] as CommentBeat[],
    },
    // PRIME tickets
    {
      app: 'PRIME', summary: 'API rate limiting blocking legitimate partner traffic',
      priority: 'High', severity: 'Severity 2', requestType: 'Incident', status: 'Resolved', slaStatus: 'Breached',
      rootCause: "A partner's integration began batching requests more aggressively after a recent update on their side, pushing them over the per-key rate limit configured for their tier.",
      remediation: "Worked with the partner to adjust their batching interval and raised their rate-limit tier to match their updated integration pattern.",
      businessImpact: "The partner's integration experienced intermittent request failures during peak hours, risking the relationship if left unresolved.",
      preventativeActions: ['Add proactive alerting when a partner approaches their rate limit consistently', "Review partner rate-limit tiers quarterly against actual usage"],
      comments: [
        { author: 'assignee', text: "Partner is reporting 429s during peak hours — checking their usage against their configured rate limit." },
        { author: 'assignee', text: "They're consistently right at their limit since their last integration update, this looks like a legitimate usage change, not abuse." },
        { author: 'reporter', text: "Partner success wants an update to share with the client — can we move on this today?" },
        { author: 'assignee', text: "Adjusted the partner's rate-limit tier and confirmed with them their batching interval. No further 429s reported." },
      ] as CommentBeat[],
    },
    {
      app: 'PRIME', summary: 'Database connection pool exhaustion',
      priority: 'Critical', severity: 'Severity 1', requestType: 'Incident', status: 'Resolved', slaStatus: 'Breached',
      rootCause: "A recently deployed reporting feature was opening database connections per request without releasing them promptly, gradually exhausting the shared connection pool under load.",
      remediation: "Rolled back the reporting feature, fixed the connection leak by ensuring connections are released in a finally block, and redeployed with connection pool monitoring in place.",
      businessImpact: "PRIME API requests began failing intermittently platform-wide as the pool exhausted, affecting all partners integrated with the platform during the incident window.",
      preventativeActions: ['Add connection pool utilization alerting', 'Require connection-leak testing in code review for any new database-touching feature', 'Add a pool exhaustion circuit breaker'],
      comments: [
        { author: 'assignee', text: "API error rate is climbing platform-wide — connection pool metrics show we're nearly exhausted. Rolling back the most recent deploy as a precaution." },
        { author: 'assignee', text: "Rollback resolved it immediately, which points at the new reporting feature. Found a connection leak where connections weren't released on the error path." },
        { author: 'reporter', text: "This is affecting every partner right now, need status updates every 15 minutes until resolved." },
        { author: 'assignee', text: "Fixed the leak, added pool utilization alerting, and redeployed. Pool usage is stable under normal load." },
      ] as CommentBeat[],
    },
    // RPMS tickets
    {
      app: 'RPMS', summary: 'VaR calculation discrepancies between intraday and EOD',
      priority: 'High', severity: 'Severity 2', requestType: 'Problem', status: 'Resolved', slaStatus: 'Met',
      rootCause: "The intraday VaR calculation was using a slightly stale correlation matrix that hadn't picked up the most recent end-of-day recalibration, causing small but visible discrepancies against the official EOD figure.",
      remediation: "Fixed the intraday job to pull the latest calibrated correlation matrix at the start of each run instead of caching it across the trading day.",
      businessImpact: "Risk desk noticed the discrepancy during a routine cross-check; no incorrect risk decisions were made, but confidence in intraday figures was affected until resolved.",
      preventativeActions: ['Add an automated cross-check between intraday and EOD VaR figures', 'Alert if the correlation matrix used intraday is older than the last calibration'],
      comments: [
        { author: 'assignee', text: "Comparing the intraday and EOD VaR runs — the gap is small but consistent, so likely a stale input rather than a calculation bug." },
        { author: 'assignee', text: "Confirmed: intraday is caching the correlation matrix at day-start instead of picking up the latest EOD recalibration." },
        { author: 'assignee', text: "Fixed the caching behavior so intraday always pulls the current calibrated matrix. Today's intraday and EOD figures now match within expected tolerance." },
      ] as CommentBeat[],
    },
    {
      app: 'RPMS', summary: 'Portfolio aggregation failing for new crypto asset class',
      priority: 'Medium', severity: 'Severity 3', requestType: 'Service Request', status: 'Resolved', slaStatus: 'Met',
      rootCause: "The portfolio aggregation service didn't have a mapping configured for the newly onboarded crypto asset class, causing positions in that class to be silently excluded from aggregated totals.",
      remediation: "Added the missing asset class mapping and backfilled aggregation for the affected date range.",
      businessImpact: "Portfolio totals for accounts holding the new asset class were understated until the mapping was added; caught before any external reporting used the affected figures.",
      preventativeActions: ['Add a pre-launch checklist item to configure aggregation mappings for any new asset class', 'Add a reconciliation check that flags positions excluded from aggregation'],
      comments: [
        { author: 'assignee', text: "Aggregation totals look short for accounts holding the new crypto asset class — checking the asset mapping config." },
        { author: 'assignee', text: "As suspected, there's no mapping configured for that asset class yet, so it's being dropped from aggregation silently." },
        { author: 'assignee', text: "Added the mapping and backfilled aggregation for the affected date range. Totals now include the crypto positions correctly." },
      ] as CommentBeat[],
    },
    // FDM tickets
    {
      app: 'FDM', summary: 'Data freshness SLA breach for consumer lending dataset',
      priority: 'High', severity: 'Severity 2', requestType: 'Incident', status: 'Resolved', slaStatus: 'Breached',
      rootCause: "An upstream source system's nightly export job started running later than usual after a schedule change on their end, pushing the downstream ingestion pipeline past its freshness SLA.",
      remediation: "Coordinated with the upstream team to confirm their new export schedule and adjusted the downstream pipeline's trigger window to match, restoring freshness within SLA.",
      businessImpact: "Consumer lending dataset consumers, including risk and reporting teams, were working with data that was several hours staler than expected for part of the day.",
      preventativeActions: ['Subscribe to upstream schedule-change notifications where available', 'Add a freshness SLA alert with enough lead time to investigate before breach'],
      comments: [
        { author: 'assignee', text: "Freshness SLA breached on the lending dataset — checking whether this is an ingestion issue or an upstream delay." },
        { author: 'assignee', text: "Upstream's nightly export is landing later than before. Reaching out to their team to confirm if this is a schedule change." },
        { author: 'assignee', text: "Confirmed it's an intentional schedule change on their end. Adjusted our pipeline trigger window to match and freshness is back within SLA." },
      ] as CommentBeat[],
    },
    {
      app: 'FDM', summary: 'Schema evolution breaking downstream consumers',
      priority: 'High', severity: 'Severity 2', requestType: 'Incident', status: 'Resolved', slaStatus: 'Breached',
      rootCause: "An upstream schema change removed a field that several downstream consumers depended on without going through the data platform's schema compatibility review process.",
      remediation: "Restored the field as a deprecated-but-present column to unblock downstream consumers immediately, and required the upstream team to route future schema changes through compatibility review.",
      businessImpact: "Several downstream reporting jobs failed until the field was restored, delaying dependent reports for part of the day.",
      preventativeActions: ['Enforce schema compatibility review for all upstream schema changes', 'Add automated consumer-impact detection before schema changes are deployed'],
      comments: [
        { author: 'assignee', text: "Multiple downstream jobs are failing on a missing field — tracing it back to yesterday's upstream schema change." },
        { author: 'assignee', text: "Confirmed the field was dropped without going through compatibility review. Restoring it as deprecated-but-present to unblock consumers." },
        { author: 'reporter', text: "A few of my team's reports are broken because of this, would like an ETA." },
        { author: 'assignee', text: "Field is restored and all downstream jobs are passing again. Following up with the upstream team to require compatibility review going forward." },
      ] as CommentBeat[],
    },
  ];

  for (const template of ticketTemplates) {
    const app = applications.find(a => a.name === template.app)!;
    const appEngineers = engineers.filter(e => JSON.parse(e.applications || '[]').includes(app.name));
    const assignee = appEngineers.length > 0 ? getRandomElement(appEngineers) : getRandomElement(engineers);
    const reporter = getRandomElement(engineers.filter(e => e.id !== assignee.id));
    const userAssignee = users.find(u => u.email === assignee.email)!;
    const userReporter = users.find(u => u.email === reporter.email)!;

    ticketCounter++;
    const createdAt = randomDate(monthStart, monthEnd);
    const resolvedAt = ['Resolved', 'Closed'].includes(template.status) ? addHours(createdAt, Math.floor(Math.random() * 48) + 1) : null;
    const timeToResolution = resolvedAt ? differenceInMinutes(resolvedAt, createdAt) : null;
    const actualResponse = Math.floor(Math.random() * 120) + 5;

    const ticket = await prisma.ticket.create({
      data: {
        key: generateTicketKey(appPrefixMap[app.name], ticketCounter),
        summary: template.summary,
        description: `Detailed description of the issue affecting ${app.name}. This is a generated ticket for demonstration purposes.`,
        priority: template.priority,
        severity: template.severity,
        status: template.status,
        requestType: template.requestType,
        application: app.name,
        reporterId: userReporter.id,
        reporterName: userReporter.name,
        reporterEmail: userReporter.email,
        assigneeId: userAssignee.id,
        assigneeName: userAssignee.name,
        assigneeEmail: userAssignee.email,
        team: assignee.team,
        createdAt,
        updatedAt: resolvedAt || createdAt,
        resolvedAt,
        closedAt: template.status === 'Closed' ? addHours(resolvedAt!, Math.floor(Math.random() * 24) + 1) : null,
        dueDate: addHours(createdAt, template.priority === 'Critical' ? 4 : template.priority === 'High' ? 8 : 24),
        firstResponseAt: addMinutes(createdAt, actualResponse),
        sla: {
          create: {
            slaName: `${template.priority} Response/Resolution`,
            targetResponseTime: 30,
            targetResolutionTime: template.priority === 'Critical' ? 240 : template.priority === 'High' ? 480 : 1440,
            actualResponseTime: actualResponse,
            actualResolutionTime: timeToResolution || undefined,
            status: template.slaStatus,
            breachedAt: template.slaStatus === 'Breached' ? addMinutes(createdAt, template.priority === 'Critical' ? 240 : template.priority === 'High' ? 480 : 1440) : undefined,
          },
        },
        tags: JSON.stringify(['generated', app.name.toLowerCase().replace(/\s+/g, '-')]),
        customFields: JSON.stringify({}),
        customerSatisfaction: resolvedAt ? Math.floor(Math.random() * 2) + 4 : null,
        timeToFirstResponse: actualResponse,
        timeToResolution: timeToResolution || undefined,
      },
    });

    await createComments(ticket.id, createdAt, resolvedAt ?? new Date(), userReporter, userAssignee, template.comments);
    if (['Resolved', 'Closed'].includes(template.status)) {
      await createAIAnalysis(ticket.id, app.name, template.summary, template.priority, {
        rootCause: template.rootCause,
        remediation: template.remediation,
        businessImpact: template.businessImpact,
        preventativeActions: template.preventativeActions,
      });
    }

    console.log(`  ✅ Created ${appPrefixMap[app.name]}-${ticketCounter}: ${template.summary.substring(0, 60)}...`);
  }

  // Add additional random tickets
  console.log('🎲 Adding additional random tickets...');
  for (const app of applications) {
    const appEngineers = engineers.filter(e => JSON.parse(e.applications || '[]').includes(app.name));
    for (let i = 0; i < 2; i++) {
      ticketCounter++;
      const createdAt = randomDate(monthStart, monthEnd);
      const status = getRandomElement(STATUSES.filter(s => s !== 'Reopened'));
      const resolvedAt = ['Resolved', 'Closed'].includes(status) ? addHours(createdAt, Math.floor(Math.random() * 72) + 1) : null;
      const assignee = appEngineers.length > 0 ? getRandomElement(appEngineers) : getRandomElement(engineers);
      const reporter = getRandomElement(engineers.filter(e => e.id !== assignee.id));
      const userAssignee = users.find(u => u.email === assignee.email)!;
      const userReporter = users.find(u => u.email === reporter.email)!;
      const priority = getRandomElement(PRIORITIES);
      const severity = getRandomElement(SEVERITIES);
      const timeToResolution = resolvedAt ? differenceInMinutes(resolvedAt, createdAt) : null;
      const actualResponse = Math.floor(Math.random() * 120) + 5;
      const summary = `${getRandomElement(['Issue', 'Error', 'Failure', 'Degradation', 'Timeout', 'Outage'])} in ${app.name} ${getRandomElement(['module', 'service', 'component', 'pipeline', 'API'])}`;

      const ticket = await prisma.ticket.create({
        data: {
          key: generateTicketKey(appPrefixMap[app.name], ticketCounter),
          summary,
          description: `Detailed description of the issue affecting ${app.name}. This is a generated ticket for demonstration purposes.`,
          priority,
          severity,
          status,
          requestType: getRandomElement(REQUEST_TYPES),
          application: app.name,
          reporterId: userReporter.id,
          reporterName: userReporter.name,
          reporterEmail: userReporter.email,
          assigneeId: userAssignee.id,
          assigneeName: userAssignee.name,
          assigneeEmail: userAssignee.email,
          team: assignee.team,
          createdAt,
          updatedAt: resolvedAt || createdAt,
          resolvedAt,
          closedAt: status === 'Closed' ? addHours(resolvedAt!, Math.floor(Math.random() * 24) + 1) : null,
          dueDate: addHours(createdAt, priority === 'Critical' ? 4 : priority === 'High' ? 8 : 24),
          firstResponseAt: addMinutes(createdAt, actualResponse),
          sla: {
            create: {
              slaName: `${priority} Response/Resolution`,
              targetResponseTime: 30,
              targetResolutionTime: priority === 'Critical' ? 240 : priority === 'High' ? 480 : 1440,
              actualResponseTime: actualResponse,
              actualResolutionTime: timeToResolution || undefined,
              status: timeToResolution && timeToResolution > (priority === 'Critical' ? 240 : priority === 'High' ? 480 : 1440) ? 'Breached' : 'Met',
            },
          },
          tags: JSON.stringify(['generated', app.name.toLowerCase().replace(/\s+/g, '-')]),
          customFields: JSON.stringify({}),
          customerSatisfaction: resolvedAt ? Math.floor(Math.random() * 2) + 4 : null,
          timeToFirstResponse: actualResponse,
          timeToResolution: timeToResolution || undefined,
        },
      });

      await createComments(ticket.id, createdAt, resolvedAt ?? new Date(), userReporter, userAssignee, genericComments(status, app.name, summary));
      if (['Resolved', 'Closed'].includes(status)) {
        await createAIAnalysis(ticket.id, app.name, summary, priority, genericAnalysisContent(app.name, priority));
      }
    }
  }

  const allTickets = await prisma.ticket.findMany({
    include: { sla: true },
  });

  console.log(`✅ Created ${allTickets.length} tickets`);
  console.log(`✅ Created ${commentsCreated} comments`);
  console.log(`✅ Created ${analysesCreated} AI analyses`);

  // Create default provider configs
  console.log('⚙️ Creating provider configurations...');
  await prisma.providerConfig.create({
    data: {
      name: 'synthetic-demo',
      type: 'synthetic',
      isEnabled: true,
      isDefault: true,
      config: JSON.stringify({ ticketsPerApp: 10, monthOffset: 1 }),
    },
  });

  await prisma.aIProviderConfig.create({
    data: {
      name: 'mock-ai',
      type: 'mock',
      isEnabled: true,
      isDefault: true,
      config: JSON.stringify({ model: 'mock-ai-v1', temperature: 0.3, maxTokens: 2000 }),
    },
  });

  await prisma.settings.create({
    data: {
      id: 'singleton',
      general: JSON.stringify({ appName: 'Jira Executive Reporting', appDescription: 'Executive operational intelligence for Jira Service Desk', timezone: 'America/New_York', dateFormat: 'MM/dd/yyyy', currency: 'USD', language: 'en' }),
      dashboard: JSON.stringify({ defaultPeriod: { start: monthStart.toISOString(), end: monthEnd.toISOString() }, refreshInterval: 300000, autoRefresh: true, defaultPageSize: 20 }),
      tickets: JSON.stringify({ defaultFilters: {}, slaTargets: { Critical: { response: 30, resolution: 240 }, High: { response: 60, resolution: 480 }, Medium: { response: 120, resolution: 1440 }, Low: { response: 240, resolution: 10080 } } }),
      ai: JSON.stringify({ enabled: true, defaultProvider: 'mock-ai', autoAnalyzeNewTickets: true, batchSize: 10, confidenceThreshold: 0.7, retainAnalyses: 90 }),
      reports: JSON.stringify({ defaultPeriod: { start: monthStart.toISOString(), end: monthEnd.toISOString() }, recipients: [], schedule: [] }),
      security: JSON.stringify({ sessionTimeout: 3600, maxLoginAttempts: 5, lockoutDuration: 900, passwordPolicy: { minLength: 12, requireUppercase: true, requireLowercase: true, requireNumbers: true, requireSpecialChars: true, maxAge: 90, historyCount: 5 }, twoFactor: { enabled: false, required: false, methods: ['totp'] } }),
      integrations: JSON.stringify({ jira: { enabled: false, baseUrl: '', authType: 'bearer', projectKeys: [], serviceDeskIds: [], requestTypes: [], syncFields: [] } }),
      notifications: JSON.stringify({ channels: ['inApp'], defaultChannel: 'inApp', templates: {} }),
      updatedBy: 'system',
    },
  });

  console.log('✅ Synthetic data generation complete!');
  console.log(`📊 Generated:`);
  console.log(`   - ${users.length} users`);
  console.log(`   - ${engineers.length} engineers`);
  console.log(`   - ${applications.length} applications`);
  console.log(`   - ${allTickets.length} tickets`);
  console.log(`   - ${commentsCreated} comments`);
  console.log(`   - ${analysesCreated} AI analyses`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
