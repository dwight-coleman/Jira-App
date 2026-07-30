import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface Ticket {
  id: string;
  key: string;
  summary: string;
  description: string;
  priority: string;
  severity: string;
  status: string;
  requestType: string;
  application: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneeEmail?: string;
  team?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  dueDate?: string;
  firstResponseAt?: string;
  tags: string;
  customFields: string;
  customerSatisfaction?: number;
  timeToFirstResponse?: number;
  timeToResolution?: number;
  sla?: SLAInfo;
  comments?: TicketComment[];
  reopenHistory?: ReopenHistory[];
  remediationNotes?: RemediationNote[];
  linkedIssues?: LinkedIssue[];
  attachments?: Attachment[];
  aiAnalysis?: AIAnalysis;
  aiInsights?: AIInsight[];
}

export interface SLAInfo {
  id: string;
  ticketId: string;
  slaName: string;
  targetResponseTime: number;
  targetResolutionTime: number;
  actualResponseTime?: number;
  actualResolutionTime?: number;
  status: string;
  breachedAt?: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  isInternal: boolean;
  isAI: boolean;
  aiInsightType?: string;
  aiConfidence?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReopenHistory {
  id: string;
  ticketId: string;
  reopenedBy: string;
  reopenedByRole: string;
  reason: string;
  previousStatus: string;
  reopenedAt: string;
  resolutionNotes?: string;
}

export interface RemediationNote {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  content: string;
  isComplete: boolean;
  isAIEnhanced: boolean;
  aiConfidence?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LinkedIssue {
  id: string;
  ticketId: string;
  linkedIssueKey: string;
  linkedIssueSummary: string;
  linkType: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  ticketId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface AIAnalysis {
  id: string;
  ticketId: string;
  executiveSummary: string;
  condensedTechnicalSummary: string;
  rootCause: string;
  affectedApplication: string;
  remediationSummary: string;
  businessImpact: string;
  recommendedPreventativeActions: string[];
  actionItems: any[];
  confidenceScore: number;
  tags: string[];
  recurringIssueDetected: boolean;
  recurringIssueId?: string;
  similarTickets: string[];
  generatedBy: string;
  model: string;
  generatedAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

export interface AIInsight {
  id: string;
  ticketId: string;
  type: string;
  title: string;
  description: string;
  confidence: number;
  generatedBy: string;
  generatedAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  isActionable: boolean;
  tags: string[];
  metadata: string;
}

export interface Application {
  id: string;
  name: string;
  displayName: string;
  description: string;
  owner: string;
  ownerEmail: string;
  team: string;
  criticality: string;
  type: string;
  environment: string;
  technologies: string;
  dependencies: string;
  slaResponseTime: number;
  slaResolutionTime: number;
  healthHealthy: number;
  healthDegraded: number;
  healthCritical: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  healthScores?: ApplicationHealthScore[];
}

export interface ApplicationHealthScore {
  id: string;
  applicationId: string;
  applicationName: string;
  date: string;
  healthScore: number;
  ticketVolume: number;
  avgSeverity: number;
  slaViolations: number;
  resolutionTime: number;
  repeatIncidents: number;
  reopenedTickets: number;
  criticalIncidents: number;
  riskLevel: string;
  trend: string;
  recommendedActions: string;
  calculatedAt: string;
}

export interface Engineer {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  team: string;
  applications: string;
  expertise: string;
  isActive: boolean;
  hireDate: string;
  createdAt: string;
  updatedAt: string;
  preferences: string;
  workload?: EngineerWorkload;
  performance?: EngineerPerformance[];
}

export interface EngineerWorkload {
  id: string;
  engineerId: string;
  engineerName: string;
  team: string;
  currentTickets: number;
  openTickets: number;
  inProgressTickets: number;
  overdueTickets: number;
  dueTodayTickets: number;
  avgResolutionTime: number;
  capacity: number;
  recommendedAction?: string;
  updatedAt: string;
}

export interface EngineerPerformance {
  id: string;
  engineerId: string;
  engineerName: string;
  team: string;
  periodStart: string;
  periodEnd: string;
  ticketsAssigned: number;
  ticketsResolved: number;
  ticketsReopened: number;
  avgResolutionTime: number;
  medianResolutionTime: number;
  slaComplianceRate: number;
  slaMet: number;
  slaBreached: number;
  slaAtRisk: number;
  avgPriority: number;
  applicationsSupported: string;
  customerSatisfaction: number;
  qualityScore: number;
  utilizationRate: number;
  workloadTrend: string;
  recurringTicketTypes: string;
  aiSummary: string;
  previousPeriodComparison: string;
  createdAt: string;
  updatedAt: string;
}

export interface KPIData {
  totalTickets: number;
  resolvedTickets: number;
  openTickets: number;
  slaCompliance: string;
  avgResolutionTime: number;
  criticalTickets: number;
  reopenedTickets: number;
}

export interface ChartData {
  name: string;
  value: number;
  count?: number;
  [key: string]: any;
}

export interface MonthlyReport {
  id: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  generatedBy: string;
  generatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  publishedAt?: string;
  executiveSummary: string;
  kpis: any[];
  charts: any[];
  operationalRisks: any[];
  recurringIssues: any[];
  engineerHighlights: any[];
  applicationHealth: any[];
  recommendations: any[];
  actionItems: any[];
  appendix: any;
  metadata: any;
}

// API Methods
export const ticketApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; filters?: any }) =>
    api.get<Ticket[]>('/tickets', { params }),
  
  getById: (id: string) =>
    api.get<Ticket>(`/tickets/${id}`),
  
  getByKey: (key: string) =>
    api.get<Ticket>(`/tickets/key/${key}`),
  
  getStatistics: (filters?: any) =>
    api.get('/tickets/statistics', { params: { filters } }),
  
  getApplications: () =>
    api.get<string[]>('/tickets/applications'),
  
  getTeams: () =>
    api.get<string[]>('/tickets/teams'),
  
  getAssignees: () =>
    api.get<string[]>('/tickets/assignees'),
  
  getTags: () =>
    api.get<string[]>('/tickets/tags'),
  
  search: (query: string, filters?: any) =>
    api.get<Ticket[]>('/tickets/search', { params: { q: query, ...filters } }),
  
  export: (filters?: any, format?: 'csv' | 'xlsx' | 'json') =>
    api.get('/tickets/export', { params: { ...filters, format }, responseType: 'blob' }),
};

export const applicationApi = {
  getAll: () =>
    api.get<Application[]>('/applications'),
  
  getById: (id: string) =>
    api.get<Application>(`/applications/${id}`),
  
  getHealth: (id: string) =>
    api.get<ApplicationHealthScore[]>(`/applications/${id}/health`),
};

export const engineerApi = {
  getAll: () =>
    api.get<Engineer[]>('/engineers'),
  
  getById: (id: string) =>
    api.get<Engineer>(`/engineers/${id}`),
  
  getWorkload: (id: string) =>
    api.get<EngineerWorkload>(`/engineers/${id}/workload`),
  
  getPerformance: (id: string, periodStart?: string, periodEnd?: string) =>
    api.get<EngineerPerformance[]>(`/engineers/${id}/performance`, { params: { periodStart, periodEnd } }),
};

export const dashboardApi = {
  getKPIs: () =>
    api.get<KPIData>('/dashboard/kpis'),
  
  getTicketsByApplication: () =>
    api.get<ChartData[]>('/dashboard/charts/tickets-by-application'),
  
  getTicketsByPriority: () =>
    api.get<ChartData[]>('/dashboard/charts/tickets-by-priority'),
  
  getTicketsByStatus: () =>
    api.get<ChartData[]>('/dashboard/charts/tickets-by-status'),
  
  getMonthlyTrend: () =>
    api.get<ChartData[]>('/dashboard/charts/monthly-trend'),
  
  getSLACompliance: () =>
    api.get<ChartData[]>('/dashboard/charts/sla-compliance'),
};

export const reportApi = {
  getMonthlyReports: () =>
    api.get<MonthlyReport[]>('/reports/monthly'),
  
  getById: (id: string) =>
    api.get<MonthlyReport>(`/reports/monthly/${id}`),
};

export const healthApi = {
  getApplicationHealth: (applicationId: string) =>
    api.get(`/health/application/${applicationId}`),
};

export default api;