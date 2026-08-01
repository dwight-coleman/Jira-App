import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 3001;

// Comma-separated list of permitted origins. Defaults to the local dev server;
// set CORS_ORIGINS explicitly when deploying.
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Same-origin/non-browser requests (curl, health probes) send no Origin.
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
}));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({
  windowMs: 60_000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again shortly.' },
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      include: { sla: true },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

app.get('/api/tickets/:id', async (req, res) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: {
        comments: { orderBy: { createdAt: 'asc' } },
        sla: true,
        reopenHistory: true,
        remediationNotes: true,
        linkedIssues: true,
        attachments: true,
        aiAnalysis: true,
        aiInsights: true,
      },
    });
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

app.post('/api/tickets/:id/comments', async (req, res) => {
  try {
    const { content, authorId, isInternal } = req.body;
    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'content is required' });
    }
    if (!authorId) {
      return res.status(400).json({ error: 'authorId is required' });
    }

    const ticket = await prisma.ticket.findUnique({ where: { id: req.params.id } });
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const author = await prisma.user.findUnique({ where: { id: authorId } });
    if (!author) {
      return res.status(400).json({ error: 'Invalid authorId' });
    }

    const comment = await prisma.ticketComment.create({
      data: {
        ticketId: ticket.id,
        authorId: author.id,
        authorName: author.name,
        authorRole: author.role,
        content: content.trim(),
        isInternal: Boolean(isInternal),
      },
    });

    await prisma.ticket.update({ where: { id: ticket.id }, data: { updatedAt: new Date() } });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      select: { id: true, email: true, name: true, role: true, avatar: true },
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/applications', async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { isActive: true },
      include: { healthScores: { orderBy: { date: 'desc' }, take: 1 } },
    });
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

app.get('/api/engineers', async (req, res) => {
  try {
    const engineers = await prisma.engineer.findMany({
      where: { isActive: true },
      include: { workload: true, performance: { orderBy: { periodStart: 'desc' }, take: 1 } },
    });
    res.json(engineers);
  } catch (error) {
    console.error('Error fetching engineers:', error);
    res.status(500).json({ error: 'Failed to fetch engineers' });
  }
});

app.get('/api/dashboard/kpis', async (req, res) => {
  try {
    const totalTickets = await prisma.ticket.count();
    const resolvedTickets = await prisma.ticket.count({
      where: { status: { in: ['Resolved', 'Closed'] } },
    });
    const openTickets = await prisma.ticket.count({
      where: { status: { in: ['Open', 'In Progress', 'Waiting for Customer', 'Waiting for Support'] } },
    });
    
    const ticketsWithSla = await prisma.ticket.findMany({
      include: { sla: true },
    });
    
    const slaMet = ticketsWithSla.filter(t => t.sla?.status === 'Met').length;
    const slaBreached = ticketsWithSla.filter(t => t.sla?.status === 'Breached').length;
    
    const resolved = ticketsWithSla.filter(t => t.timeToResolution);
    const avgResolution = resolved.length > 0 
      ? resolved.reduce((sum, t) => sum + (t.timeToResolution || 0), 0) / resolved.length 
      : 0;
    
    const criticalTickets = await prisma.ticket.count({
      where: { priority: 'Critical' },
    });
    
    const reopenedTickets = await prisma.ticket.count({
      where: { reopenHistory: { some: {} } },
    });

    res.json({
      totalTickets,
      resolvedTickets,
      openTickets,
      slaCompliance: totalTickets > 0 ? ((slaMet / totalTickets) * 100).toFixed(1) : 100,
      avgResolutionTime: Math.round(avgResolution / 60),
      criticalTickets,
      reopenedTickets,
    });
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    res.status(500).json({ error: 'Failed to fetch KPIs' });
  }
});

app.get('/api/dashboard/charts/tickets-by-application', async (req, res) => {
  try {
    const tickets = await prisma.ticket.groupBy({
      by: ['application'],
      _count: { application: true },
    });
    res.json(tickets.map(t => ({ application: t.application, count: t._count.application })));
  } catch (error) {
    console.error('Error fetching tickets by application:', error);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

app.get('/api/dashboard/charts/tickets-by-priority', async (req, res) => {
  try {
    const tickets = await prisma.ticket.groupBy({
      by: ['priority'],
      _count: { priority: true },
    });
    res.json(tickets.map(t => ({ priority: t.priority, count: t._count.priority })));
  } catch (error) {
    console.error('Error fetching tickets by priority:', error);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

app.get('/api/dashboard/charts/tickets-by-status', async (req, res) => {
  try {
    const tickets = await prisma.ticket.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    res.json(tickets.map(t => ({ status: t.status, count: t._count.status })));
  } catch (error) {
    console.error('Error fetching tickets by status:', error);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

app.get('/api/dashboard/charts/monthly-trend', async (req, res) => {
  try {
    const trend = await prisma.trendHistory.findMany({
      where: { metric: 'ticket_volume' },
      orderBy: { periodStart: 'asc' },
      take: 12,
    });
    res.json(trend.map(t => ({ month: t.periodStart, value: t.value })));
  } catch (error) {
    console.error('Error fetching monthly trend:', error);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

app.get('/api/dashboard/charts/sla-compliance', async (req, res) => {
  try {
    const trend = await prisma.trendHistory.findMany({
      where: { metric: 'sla_compliance' },
      orderBy: { periodStart: 'asc' },
      take: 12,
    });
    res.json(trend.map(t => ({ month: t.periodStart, value: t.value })));
  } catch (error) {
    console.error('Error fetching SLA compliance:', error);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

app.get('/api/reports/monthly', async (req, res) => {
  try {
    const reports = await prisma.monthlyReport.findMany({
      orderBy: { periodStart: 'desc' },
      take: 10,
    });
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

app.post('/api/reports/monthly', async (req, res) => {
  try {
    const { name, periodStart, periodEnd, generatedBy } = req.body;
    if (!name || !periodStart || !periodEnd) {
      return res.status(400).json({ error: 'name, periodStart, and periodEnd are required' });
    }

    const start = new Date(periodStart);
    const end = new Date(periodEnd);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'periodStart and periodEnd must be valid dates' });
    }

    const periodTickets = await prisma.ticket.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { sla: true },
    });

    const totalTickets = periodTickets.length;
    const resolvedTickets = periodTickets.filter(t => ['Resolved', 'Closed'].includes(t.status)).length;
    const criticalTickets = periodTickets.filter(t => t.priority === 'Critical').length;
    const slaMet = periodTickets.filter(t => t.sla?.status === 'Met').length;
    const slaBreached = periodTickets.filter(t => t.sla?.status === 'Breached').length;
    const slaCompliance = totalTickets > 0 ? Math.round((slaMet / totalTickets) * 100) : 100;

    const resolvedWithTime = periodTickets.filter(t => t.timeToResolution);
    const avgResolutionHours = resolvedWithTime.length > 0
      ? Math.round(resolvedWithTime.reduce((sum, t) => sum + (t.timeToResolution || 0), 0) / resolvedWithTime.length / 60)
      : 0;

    const kpis = [
      { name: 'Total Tickets', value: totalTickets },
      { name: 'Resolved', value: resolvedTickets },
      { name: 'SLA Compliance', value: `${slaCompliance}%`, target: '95%' },
      { name: 'Critical Tickets', value: criticalTickets },
      { name: 'SLA Breaches', value: slaBreached, target: 0 },
      { name: 'Avg Resolution Time', value: `${avgResolutionHours}h` },
    ];

    const executiveSummary = totalTickets === 0
      ? `No tickets were reported between ${start.toDateString()} and ${end.toDateString()}.`
      : `During this period, ${totalTickets} ticket${totalTickets === 1 ? ' was' : 's were'} logged across supported applications, with ${resolvedTickets} resolved (${slaCompliance}% SLA compliance). ${criticalTickets} critical-priority ticket${criticalTickets === 1 ? '' : 's'} ${criticalTickets === 1 ? 'was' : 'were'} reported${slaBreached > 0 ? `, and ${slaBreached} ticket${slaBreached === 1 ? '' : 's'} breached SLA targets` : ' with no SLA breaches'}. Average resolution time was ${avgResolutionHours} hours.`;

    const report = await prisma.monthlyReport.create({
      data: {
        name,
        periodStart: start,
        periodEnd: end,
        status: 'draft',
        generatedBy: generatedBy || 'system',
        executiveSummary,
        kpis: JSON.stringify(kpis),
      },
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

app.get('/api/risks', async (req, res) => {
  try {
    const risks = await prisma.operationalRisk.findMany({
      orderBy: [{ riskScore: 'desc' }, { identifiedAt: 'desc' }],
    });
    res.json(risks);
  } catch (error) {
    console.error('Error fetching risks:', error);
    res.status(500).json({ error: 'Failed to fetch risks' });
  }
});

app.get('/api/recurring-issues', async (req, res) => {
  try {
    const issues = await prisma.recurringIssue.findMany({
      orderBy: [{ slaImpact: 'desc' }, { frequency: 'desc' }],
    });
    res.json(issues);
  } catch (error) {
    console.error('Error fetching recurring issues:', error);
    res.status(500).json({ error: 'Failed to fetch recurring issues' });
  }
});

app.get('/api/action-items', async (req, res) => {
  try {
    const items = await prisma.actionItem.findMany({ orderBy: { dueDate: 'asc' } });
    res.json(items);
  } catch (error) {
    console.error('Error fetching action items:', error);
    res.status(500).json({ error: 'Failed to fetch action items' });
  }
});

app.patch('/api/action-items/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'in_progress', 'completed', 'blocked'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
    }
    const existing = await prisma.actionItem.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Action item not found' });

    const updated = await prisma.actionItem.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating action item:', error);
    res.status(500).json({ error: 'Failed to update action item' });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } });
    if (!settings) {
      return res.json({});
    }
    const parse = (json: string) => {
      try { return JSON.parse(json); } catch { return {}; }
    };
    // Never send stored secrets to the client. The UI shows whether a key is
    // configured, not its value.
    const redactCredentials = (section: Record<string, any>) => {
      if (!section || typeof section !== 'object' || !section.credentials) return section;
      const redacted: Record<string, boolean> = {};
      for (const key of Object.keys(section.credentials)) {
        redacted[key] = Boolean(section.credentials[key]);
      }
      return { ...section, credentials: undefined, credentialsConfigured: redacted };
    };
    res.json({
      general: parse(settings.general),
      dashboard: parse(settings.dashboard),
      tickets: parse(settings.tickets),
      ai: redactCredentials(parse(settings.ai)),
      reports: parse(settings.reports),
      security: parse(settings.security),
      integrations: redactCredentials(parse(settings.integrations)),
      notifications: parse(settings.notifications),
      updatedAt: settings.updatedAt,
      updatedBy: settings.updatedBy,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.get('/api/health/application/:id', async (req, res) => {
  try {
    const health = await prisma.applicationHealthScore.findMany({
      where: { applicationId: req.params.id },
      orderBy: { date: 'desc' },
      take: 30,
    });
    res.json(health);
  } catch (error) {
    console.error('Error fetching application health:', error);
    res.status(500).json({ error: 'Failed to fetch application health' });
  }
});

// Unknown API route
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Central error handler. Returns a generic message so internal details and
// stack traces are never exposed to clients.
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err?.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not permitted' });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});

export default app;