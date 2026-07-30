import { Ticket, TicketFilters, PaginatedTickets, TicketStatistics } from './ticket';
import { AIAnalysisRequest, AIAnalysisResponse, AIBatchAnalysisRequest, AIBatchAnalysisResponse, AIProviderConfig, AIProviderHealth, AIInsightType } from './ai';

export interface ITicketProvider {
  name: string;
  version: string;
  initialize(config: ProviderConfig): Promise<void>;
  healthCheck(): Promise<ProviderHealth>;
  getTickets(filters?: TicketFilters): Promise<PaginatedTickets>;
  getTicketById(id: string): Promise<Ticket | null>;
  getTicketByKey(key: string): Promise<Ticket | null>;
  getStatistics(filters?: TicketFilters): Promise<TicketStatistics>;
  getApplications(): Promise<string[]>;
  getTeams(): Promise<string[]>;
  getAssignees(): Promise<string[]>;
  getTags(): Promise<string[]>;
  searchTickets(query: string, filters?: TicketFilters): Promise<Ticket[]>;
  exportTickets(filters?: TicketFilters, format?: 'csv' | 'xlsx' | 'json'): Promise<Buffer>;
  subscribeToUpdates(callback: (ticket: Ticket) => void): () => void;
  close(): Promise<void>;
}

export interface IAIProvider {
  name: string;
  version: string;
  initialize(config: AIProviderConfig): Promise<void>;
  healthCheck(): Promise<AIProviderHealth>;
  analyzeTicket(request: AIAnalysisRequest): Promise<AIAnalysisResponse>;
  analyzeBatch(request: AIBatchAnalysisRequest): Promise<AIBatchAnalysisResponse>;
  getAvailableModels(): Promise<AIModelConfig[]>;
  getPromptTemplates(): Promise<AIPromptTemplate[]>;
  estimateTokens(request: AIAnalysisRequest): Promise<{ prompt: number; estimatedCompletion: number }>;
  close(): Promise<void>;
}

export interface IReportProvider {
  name: string;
  version: string;
  initialize(config: ProviderConfig): Promise<void>;
  healthCheck(): Promise<ProviderHealth>;
  generateExecutiveSummary(params: ExecutiveSummaryParams): Promise<ExecutiveReport>;
  generateOperationalReport(params: OperationalReportParams): Promise<OperationalReport>;
  generateTrendReport(params: TrendReportParams): Promise<TrendReport>;
  generateSLAReport(params: SLAReportParams): Promise<SLAReport>;
  generateTeamPerformanceReport(params: TeamPerformanceParams): Promise<TeamPerformanceReport>;
  generateApplicationHealthReport(params: ApplicationHealthParams): Promise<ApplicationHealthReport>;
  exportReport(report: BaseReport, format: 'pdf' | 'xlsx' | 'csv' | 'json'): Promise<Buffer>;
  scheduleReport(schedule: ReportSchedule): Promise<ScheduledReport>;
  getScheduledReports(): Promise<ScheduledReport[]>;
  deleteScheduledReport(id: string): Promise<void>;
  close(): Promise<void>;
}

export interface ProviderConfig {
  name: string;
  version: string;
  settings: Record<string, unknown>;
  credentials?: Record<string, string>;
  options?: Record<string, unknown>;
}

export interface ProviderHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latencyMs: number;
  lastCheck: Date;
  details?: Record<string, unknown>;
  errors?: string[];
}

export interface ExecutiveSummaryParams {
  dateRange: { start: Date; end: Date };
  applications?: string[];
  includeAIInsights: boolean;
  includeTrends: boolean;
  includeRecommendations: boolean;
  audience: 'executive' | 'management' | 'technical';
}

export interface OperationalReportParams {
  dateRange: { start: Date; end: Date };
  applications?: string[];
  teams?: string[];
  includeSLA: boolean;
  includeReopens: boolean;
  includeRemediation: boolean;
  groupBy: 'application' | 'team' | 'priority' | 'requestType';
}

export interface TrendReportParams {
  dateRange: { start: Date; end: Date };
  granularity: 'day' | 'week' | 'month' | 'quarter';
  metrics: ('volume' | 'sla' | 'resolution' | 'reopens' | 'satisfaction' | 'aiInsights')[];
  applications?: string[];
  compareWithPrevious?: boolean;
}

export interface SLAReportParams {
  dateRange: { start: Date; end: Date };
  applications?: string[];
  slaNames?: string[];
  includeBreaches: boolean;
  includeNearBreaches: boolean;
  groupBy: 'application' | 'sla' | 'priority' | 'team';
}

export interface TeamPerformanceParams {
  dateRange: { start: Date; end: Date };
  teams?: string[];
  includeWorkload: boolean;
  includeQuality: boolean;
  includeSLA: boolean;
  includeSatisfaction: boolean;
}

export interface ApplicationHealthParams {
  dateRange: { start: Date; end: Date };
  applications?: string[];
  includeTrends: boolean;
  includeAIInsights: boolean;
  includeDependencies: boolean;
}

export interface BaseReport {
  id: string;
  type: string;
  title: string;
  generatedAt: Date;
  generatedBy: string;
  dateRange: { start: Date; end: Date };
  parameters: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface ExecutiveReport extends BaseReport {
  type: 'executive';
  summary: ExecutiveSummary;
  kpis: ExecutiveKPI[];
  insights: ExecutiveInsight[];
  recommendations: ExecutiveRecommendation[];
  risks: ExecutiveRisk[];
}

export interface ExecutiveSummary {
  totalTickets: number;
  ticketsTrend: number; // percentage change
  slaCompliance: number;
  avgResolutionTime: number;
  avgResolutionTrend: number;
  customerSatisfaction: number;
  satisfactionTrend: number;
  criticalIssues: number;
  recurringIssues: number;
  topApplications: Array<{ name: string; count: number; trend: number }>;
  topRisks: string[];
}

export interface ExecutiveKPI {
  id: string;
  name: string;
  value: number | string;
  target: number | string;
  status: 'on-track' | 'at-risk' | 'off-track';
  trend: number;
  unit: string;
  description: string;
}

export interface ExecutiveInsight {
  id: string;
  type: AIInsightType;
  title: string;
  description: string;
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  confidence: number;
  applications: string[];
  evidence: string[];
}

export interface ExecutiveRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  effort: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  owner: string;
  timeline: string;
  relatedInsights: string[];
}

export interface ExecutiveRisk {
  id: string;
  title: string;
  description: string;
  likelihood: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  mitigation: string;
  owner: string;
  status: 'open' | 'mitigating' | 'monitored' | 'closed';
}

export interface OperationalReport extends BaseReport {
  type: 'operational';
  summary: OperationalSummary;
  ticketsByStatus: Record<string, number>;
  ticketsByPriority: Record<string, number>;
  ticketsByApplication: Record<string, number>;
  ticketsByTeam: Record<string, number>;
  slaPerformance: SLAPerformance;
  reopenAnalysis: ReopenAnalysis;
  remediationAnalysis: RemediationAnalysis;
  workloadDistribution: WorkloadDistribution;
}

export interface OperationalSummary {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  avgTimeToFirstResponse: number;
  avgTimeToResolution: number;
  slaComplianceRate: number;
  reopenRate: number;
  customerSatisfaction: number;
}

export interface SLAPerformance {
  overall: { met: number; breached: number; atRisk: number; na: number };
  bySLA: Record<string, { met: number; breached: number; atRisk: number; target: number; actual: number }>;
  byApplication: Record<string, { met: number; breached: number; atRisk: number }>;
  byPriority: Record<string, { met: number; breached: number; atRisk: number }>;
  breaches: Array<{ ticketKey: string; slaName: string; target: number; actual: number; breachBy: number }>;
}

export interface ReopenAnalysis {
  totalReopens: number;
  reopenRate: number;
  byReason: Record<string, number>;
  byApplication: Record<string, number>;
  byAssignee: Record<string, number>;
  topReopenedTickets: Array<{ key: string; summary: string; reopenCount: number; reasons: string[] }>;
}

export interface RemediationAnalysis {
  totalNotes: number;
  completedNotes: number;
  incompleteNotes: number;
  completionRate: number;
  aiEnhancedRate: number;
  byApplication: Record<string, { total: number; completed: number; incomplete: number }>;
  topIncomplete: Array<{ ticketKey: string; note: string; assignee: string; daysOpen: number }>;
}

export interface WorkloadDistribution {
  byAssignee: Record<string, { assigned: number; resolved: number; avgResolutionTime: number }>;
  byTeam: Record<string, { assigned: number; resolved: number; avgResolutionTime: number }>;
  utilization: Record<string, number>;
}

export interface TrendReport extends BaseReport {
  type: 'trend';
  granularity: 'day' | 'week' | 'month' | 'quarter';
  series: TrendSeries[];
  comparisons?: TrendComparison[];
}

export interface TrendSeries {
  metric: string;
  label: string;
  data: Array<{ date: Date; value: number }>;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
}

export interface TrendComparison {
  metric: string;
  currentPeriod: { start: Date; end: Date; value: number };
  previousPeriod: { start: Date; end: Date; value: number };
  changePercent: number;
  changeDirection: 'up' | 'down' | 'stable';
}

export interface SLAReport extends BaseReport {
  type: 'sla';
  summary: SLASummary;
  performanceBySLA: Record<string, SLAPerformanceDetail>;
  performanceByApplication: Record<string, SLAPerformanceDetail>;
  performanceByPriority: Record<string, SLAPerformanceDetail>;
  breaches: SLABreach[];
  nearBreaches: SLANearBreach[];
  trends: SLATrend[];
}

export interface SLASummary {
  totalSLAs: number;
  metCount: number;
  breachedCount: number;
  atRiskCount: number;
  complianceRate: number;
  avgComplianceBySLA: Record<string, number>;
}

export interface SLAPerformanceDetail {
  met: number;
  breached: number;
  atRisk: number;
  complianceRate: number;
  avgActualTime: number;
  targetTime: number;
}

export interface SLABreach {
  ticketKey: string;
  ticketSummary: string;
  slaName: string;
  targetMinutes: number;
  actualMinutes: number;
  breachMinutes: number;
  priority: string;
  application: string;
  assignee: string;
  breachedAt: Date;
}

export interface SLANearBreach {
  ticketKey: string;
  ticketSummary: string;
  slaName: string;
  targetMinutes: number;
  currentMinutes: number;
  remainingMinutes: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  priority: string;
  application: string;
  assignee: string;
}

export interface SLATrend {
  date: Date;
  complianceRate: number;
  met: number;
  breached: number;
  atRisk: number;
}

export interface TeamPerformanceReport extends BaseReport {
  type: 'team-performance';
  teams: TeamPerformance[];
  summary: TeamPerformanceSummary;
}

export interface TeamPerformance {
  teamName: string;
  members: TeamMemberPerformance[];
  totals: {
    assigned: number;
    resolved: number;
    avgResolutionTime: number;
    slaCompliance: number;
    customerSatisfaction: number;
    reopenRate: number;
    utilization: number;
  };
}

export interface TeamMemberPerformance {
  name: string;
  email: string;
  assigned: number;
  resolved: number;
  avgResolutionTime: number;
  slaCompliance: number;
  customerSatisfaction: number;
  reopenRate: number;
  workload: number;
  qualityScore: number;
}

export interface TeamPerformanceSummary {
  totalTeams: number;
  totalMembers: number;
  avgTeamSLACompliance: number;
  avgTeamResolutionTime: number;
  topPerformingTeam: string;
  teamNeedingSupport: string;
}

export interface ApplicationHealthReport extends BaseReport {
  type: 'application-health';
  applications: ApplicationHealth[];
  summary: ApplicationHealthSummary;
  dependencies: ApplicationDependency[];
}

export interface ApplicationHealth {
  name: string;
  healthScore: number; // 0-100
  status: 'Healthy' | 'Degraded' | 'Critical';
  ticketVolume: number;
  ticketTrend: number;
  slaCompliance: number;
  avgResolutionTime: number;
  reopenRate: number;
  customerSatisfaction: number;
  topIssues: Array<{ issue: string; count: number; trend: number }>;
  aiInsights: Array<{ type: string; title: string; confidence: number }>;
  riskFactors: string[];
  recommendations: string[];
}

export interface ApplicationHealthSummary {
  totalApplications: number;
  healthyCount: number;
  degradedCount: number;
  criticalCount: number;
  avgHealthScore: number;
  topRiskApplication: string;
  mostImprovedApplication: string;
}

export interface ApplicationDependency {
  application: string;
  dependsOn: string[];
  dependedBy: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface ReportSchedule {
  id: string;
  name: string;
  description: string;
  reportType: string;
  parameters: Record<string, unknown>;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    dayOfWeek?: number; // 0-6
    dayOfMonth?: number; // 1-31
    hour: number; // 0-23
    minute: number; // 0-59
    timezone: string;
  };
  recipients: string[];
  format: 'pdf' | 'xlsx' | 'csv' | 'json';
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastRun?: Date;
  nextRun?: Date;
}

export interface ScheduledReport extends ReportSchedule {
  id: string;
  lastRun?: Date;
  nextRun?: Date;
  lastStatus?: 'success' | 'failed';
  lastError?: string;
}