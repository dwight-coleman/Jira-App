import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

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
        comments: true,
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});

export default app;