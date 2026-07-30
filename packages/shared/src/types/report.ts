export interface Engineer {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'Engineer' | 'Senior Engineer' | 'Lead Engineer' | 'Manager' | 'Director';
  team: string;
  applications: string[];
  expertise: string[];
  isActive: boolean;
  hireDate: Date;
  createdAt: Date;
  updatedAt: Date;
  preferences: {
    timezone: string;
    notifications: {
      email: boolean;
      slack: boolean;
      inApp: boolean;
    };
    workingHours: {
      start: string; // HH:mm
      end: string; // HH:mm
      days: number[]; // 0-6
    };
  };
}

export interface EngineerPerformance {
  engineerId: string;
  engineerName: string;
  team: string;
  period: { start: Date; end: Date };
  ticketsAssigned: number;
  ticketsResolved: number;
  ticketsReopened: number;
  avgResolutionTime: number; // minutes
  medianResolutionTime: number; // minutes
  slaComplianceRate: number; // 0-1
  slaMet: number;
  slaBreached: number;
  slaAtRisk: number;
  avgPriority: number; // 1-4 (Critical=1, Low=4)
  applicationsSupported: string[];
  customerSatisfaction: number; // 1-5
  qualityScore: number; // 0-100
  utilizationRate: number; // 0-1
  workloadTrend: 'increasing' | 'decreasing' | 'stable';
  recurringTicketTypes: Array<{ type: string; count: number }>;
  aiSummary: string;
  previousPeriodComparison: {
    ticketsResolvedChange: number; // percentage
    avgResolutionTimeChange: number; // percentage
    slaComplianceChange: number; // percentage
    qualityScoreChange: number; // percentage
  };
}

export interface EngineerWorkload {
  engineerId: string;
  engineerName: string;
  team: string;
  currentTickets: number;
  openTickets: number;
  inProgressTickets: number;
  overdueTickets: number;
  dueTodayTickets: number;
  avgResolutionTime: number;
  capacity: number; // 0-1
  recommendedAction?: 'redistribute' | 'hire' | 'automate' | 'monitor';
}

export interface Application {
  id: string;
  name: string;
  displayName: string;
  description: string;
  owner: string;
  ownerEmail: string;
  team: string;
  criticality: 'Critical' | 'High' | 'Medium' | 'Low';
  type: 'Internal' | 'Customer-Facing' | 'Infrastructure' | 'Platform' | 'Mobile' | 'Web';
  environment: 'Production' | 'Staging' | 'Development' | 'Mixed';
  technologies: string[];
  dependencies: string[];
  slaTargets: {
    responseTime: number; // minutes
    resolutionTime: number; // minutes
  };
  healthThresholds: {
    healthy: number; // health score above this
    degraded: number; // health score below this
    critical: number; // health score below this
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationHealth {
  applicationId: string;
  applicationName: string;
  period: { start: Date; end: Date };
  healthScore: number; // 0-100
  status: 'Healthy' | 'Degraded' | 'Critical';
  trend: 'improving' | 'stable' | 'declining';
  ticketVolume: number;
  ticketTrend: number; // percentage change
  avgSeverity: number; // 1-4
  slaComplianceRate: number; // 0-1
  avgResolutionTime: number; // minutes
  medianResolutionTime: number; // minutes
  reopenRate: number; // 0-1
  customerSatisfaction: number; // 1-5
  criticalIncidents: number;
  recurringIncidents: number;
  topRootCauses: Array<{ cause: string; count: number; trend: number }>;
  priorityDistribution: Record<string, number>;
  requestTypeDistribution: Record<string, number>;
  monthlyTrend: Array<{ month: string; tickets: number; healthScore: number }>;
  aiOperationalNarrative: string;
  topRecommendations: string[];
  riskFactors: string[];
}

export interface MonthlyReport {
  id: string;
  name: string;
  period: { start: Date; end: Date };
  status: 'draft' | 'pending-review' | 'approved' | 'published' | 'archived';
  generatedBy: string;
  generatedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  publishedAt?: Date;
  executiveSummary: string;
  kpis: ReportKPI[];
  charts: ReportChart[];
  operationalRisks: OperationalRisk[];
  recurringIssues: RecurringIssue[];
  engineerHighlights: EngineerHighlight[];
  applicationHealth: ApplicationHealth[];
  recommendations: Recommendation[];
  actionItems: ActionItem[];
  appendix: ReportAppendix;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportKPI {
  id: string;
  name: string;
  value: number | string;
  target: number | string;
  unit: string;
  status: 'on-track' | 'at-risk' | 'off-track';
  trend: number;
  description: string;
  category: 'volume' | 'performance' | 'quality' | 'satisfaction' | 'risk';
}

export interface ReportChart {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'scatter' | 'heatmap' | 'radar';
  title: string;
  data: unknown;
  config: Record<string, unknown>;
  insights: string[];
}

export interface OperationalRisk {
  id: string;
  title: string;
  description: string;
  likelihood: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  riskScore: number; // 1-25
  category: 'Technical' | 'Process' | 'Resource' | 'Vendor' | 'Security' | 'Compliance';
  affectedApplications: string[];
  affectedTeams: string[];
  mitigation: string;
  owner: string;
  status: 'open' | 'mitigating' | 'monitored' | 'accepted' | 'closed';
  identifiedAt: Date;
  lastReviewedAt: Date;
  nextReviewAt: Date;
}

export interface RecurringIssue {
  id: string;
  title: string;
  description: string;
  pattern: string;
  frequency: number;
  affectedApplications: string[];
  affectedTickets: string[];
  rootCause: string;
  currentWorkaround: string;
  permanentFix: string;
  fixStatus: 'not-started' | 'in-progress' | 'testing' | 'deployed' | 'verified';
  fixOwner: string;
  fixTargetDate: Date;
  businessImpact: 'Low' | 'Medium' | 'High' | 'Critical';
  slaImpact: number; // percentage of SLA breaches attributed
  costEstimate: number;
  aiConfidence: number; // 0-1
  identifiedAt: Date;
  lastOccurrence: Date;
}

export interface EngineerHighlight {
  engineerId: string;
  engineerName: string;
  team: string;
  highlight: string;
  category: 'performance' | 'quality' | 'innovation' | 'collaboration' | 'customer-focus' | 'leadership';
  metrics: Record<string, number>;
  period: { start: Date; end: Date };
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  category: 'Process' | 'Technology' | 'People' | 'Automation' | 'Training' | 'Governance';
  effort: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  owner: string;
  targetDate: Date;
  status: 'proposed' | 'approved' | 'in-progress' | 'completed' | 'deferred';
  relatedRisks: string[];
  relatedIssues: string[];
  kpis: string[];
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  assignee: string;
  assigneeEmail: string;
  dueDate: Date;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
  dependencies: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportAppendix {
  methodology: string;
  dataSources: string[];
  assumptions: string[];
  limitations: string[];
  glossary: Record<string, string>;
  rawDataReferences: string[];
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
  actionItems: ActionItem[];
  confidenceScore: number; // 0-1
  tags: string[];
  recurringIssueDetected: boolean;
  recurringIssueId?: string;
  similarTickets: string[];
  generatedBy: 'MockAI' | 'OpenAI' | 'Anthropic';
  model: string;
  generatedAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

export interface ExecutiveNarrative {
  id: string;
  section: 'application-health' | 'engineer-performance' | 'recurring-issues' | 'operational-risks' | 'monthly-highlights' | 'executive-summary' | 'recommendations';
  period: { start: Date; end: Date };
  narrative: string;
  keyMetrics: Record<string, number | string>;
  references: string[]; // ticket IDs, report IDs, etc.
  generatedBy: 'MockAI' | 'OpenAI' | 'Anthropic';
  model: string;
  generatedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface ApplicationHealthScore {
  applicationId: string;
  applicationName: string;
  date: Date;
  healthScore: number; // 0-100
  factors: {
    ticketVolume: number;
    avgSeverity: number;
    slaViolations: number;
    resolutionTime: number;
    repeatIncidents: number;
    reopenedTickets: number;
    criticalIncidents: number;
  };
  weights: {
    ticketVolume: number;
    avgSeverity: number;
    slaViolations: number;
    resolutionTime: number;
    repeatIncidents: number;
    reopenedTickets: number;
    criticalIncidents: number;
  };
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  trend: 'improving' | 'stable' | 'declining';
  recommendedActions: string[];
  calculatedAt: Date;
}

export interface TrendHistory {
  id: string;
  metric: string;
  dimension: string; // application, team, priority, etc.
  dimensionValue: string;
  period: { start: Date; end: Date };
  value: number;
  previousValue?: number;
  changePercent?: number;
  trend: 'up' | 'down' | 'stable';
  metadata: Record<string, unknown>;
  createdAt: Date;
}