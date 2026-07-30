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
    { app: 'AI Flow', summary: 'Authentication failures in AI Flow model serving endpoints', priority: 'Critical', severity: 'Severity 1', requestType: 'Incident', status: 'Resolved', slaStatus: 'Breached' },
    { app: 'AI Flow', summary: 'GPU memory leaks in batch inference pipeline', priority: 'High', severity: 'Severity 2', requestType: 'Problem', status: 'Resolved', slaStatus: 'At Risk' },
    { app: 'AI Flow', summary: 'Model drift detection alert for credit scoring model v3.2', priority: 'Medium', severity: 'Severity 3', requestType: 'Problem', status: 'Resolved', slaStatus: 'Met' },
    // RS2 tickets
    { app: 'RS2', summary: 'Invoice processing timeout for high-volume vendors', priority: 'High', severity: 'Severity 2', requestType: 'Incident', status: 'Resolved', slaStatus: 'Breached' },
    { app: 'RS2', summary: 'Duplicate payment detection false positives', priority: 'Medium', severity: 'Severity 3', requestType: 'Service Request', status: 'Resolved', slaStatus: 'Met' },
    // ATR tickets
    { app: 'ATR', summary: 'Order routing latency spike during market open', priority: 'Critical', severity: 'Severity 1', requestType: 'Incident', status: 'Resolved', slaStatus: 'Breached' },
    { app: 'ATR', summary: 'FIX session drops with liquidity provider Citadel', priority: 'High', severity: 'Severity 2', requestType: 'Incident', status: 'Resolved', slaStatus: 'Met' },
    // FMIS tickets
    { app: 'FMIS', summary: 'Month-end close: GL reconciliation failure', priority: 'Critical', severity: 'Severity 1', requestType: 'Incident', status: 'Resolved', slaStatus: 'Breached' },
    { app: 'FMIS', summary: 'Expense report approval workflow stuck', priority: 'High', severity: 'Severity 2', requestType: 'Incident', status: 'Resolved', slaStatus: 'At Risk' },
    // PRIME tickets
    { app: 'PRIME', summary: 'API rate limiting blocking legitimate partner traffic', priority: 'High', severity: 'Severity 2', requestType: 'Incident', status: 'Resolved', slaStatus: 'Breached' },
    { app: 'PRIME', summary: 'Database connection pool exhaustion', priority: 'Critical', severity: 'Severity 1', requestType: 'Incident', status: 'Resolved', slaStatus: 'Breached' },
    // RPMS tickets
    { app: 'RPMS', summary: 'VaR calculation discrepancies between intraday and EOD', priority: 'High', severity: 'Severity 2', requestType: 'Problem', status: 'Resolved', slaStatus: 'Met' },
    { app: 'RPMS', summary: 'Portfolio aggregation failing for new crypto asset class', priority: 'Medium', severity: 'Severity 3', requestType: 'Service Request', status: 'Resolved', slaStatus: 'Met' },
    // FDM tickets
    { app: 'FDM', summary: 'Data freshness SLA breach for consumer lending dataset', priority: 'High', severity: 'Severity 2', requestType: 'Incident', status: 'Resolved', slaStatus: 'Breached' },
    { app: 'FDM', summary: 'Schema evolution breaking downstream consumers', priority: 'High', severity: 'Severity 2', requestType: 'Incident', status: 'Resolved', slaStatus: 'Breached' },
  ];

  for (const template of ticketTemplates) {
    const app = applications.find(a => a.name === template.app)!;
    const appEngineers = engineers.filter(e => JSON.parse(e.applications || '[]').includes(app.name));
    const assignee = appEngineers.length > 0 ? getRandomElement(appEngineers) : getRandomElement(engineers);
    const reporter = getRandomElement(engineers);
    const userAssignee = users.find(u => u.email === assignee.email)!;
    const userReporter = users.find(u => u.email === reporter.email)!;
    
    ticketCounter++;
    const createdAt = randomDate(monthStart, monthEnd);
    const resolvedAt = ['Resolved', 'Closed'].includes(template.status) ? addHours(createdAt, Math.floor(Math.random() * 48) + 1) : null;
    const timeToResolution = resolvedAt ? differenceInMinutes(resolvedAt, createdAt) : null;
    const actualResponse = Math.floor(Math.random() * 120) + 5;
    
    await prisma.ticket.create({
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
      const reporter = getRandomElement(engineers);
      const userAssignee = users.find(u => u.email === assignee.email)!;
      const userReporter = users.find(u => u.email === reporter.email)!;
      const priority = getRandomElement(PRIORITIES);
      const severity = getRandomElement(SEVERITIES);
      const timeToResolution = resolvedAt ? differenceInMinutes(resolvedAt, createdAt) : null;
      const actualResponse = Math.floor(Math.random() * 120) + 5;
      
      await prisma.ticket.create({
        data: {
          key: generateTicketKey(appPrefixMap[app.name], ticketCounter),
          summary: `${getRandomElement(['Issue', 'Error', 'Failure', 'Degradation', 'Timeout', 'Outage'])} in ${app.name} ${getRandomElement(['module', 'service', 'component', 'pipeline', 'API'])}`,
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
    }
  }

  const allTickets = await prisma.ticket.findMany({
    include: { sla: true },
  });
  
  console.log(`✅ Created ${allTickets.length} tickets`);

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
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });