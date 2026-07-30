export type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type TicketSeverity = 'Severity 1' | 'Severity 2' | 'Severity 3' | 'Severity 4';
export type TicketStatus = 'Open' | 'In Progress' | 'Waiting for Customer' | 'Waiting for Support' | 'Resolved' | 'Closed' | 'Reopened';
export type RequestType = 'Incident' | 'Service Request' | 'Change Request' | 'Problem' | 'Access Request' | 'Information Request';
export type SLAStatus = 'Met' | 'Breached' | 'At Risk' | 'Not Applicable';
export type AIInsightType = 'Root Cause' | 'Trend' | 'Recommendation' | 'Risk' | 'Pattern' | 'Anomaly' | 'Recurring Issue' | 'SLA Risk' | 'Knowledge Gap';
export type AttachmentType = 'Screenshot' | 'Log' | 'Document' | 'Video' | 'Other';
export type LinkedIssueType = 'Blocks' | 'Is Blocked By' | 'Relates To' | 'Duplicates' | 'Is Duplicated By' | 'Parent' | 'Child';

export interface TicketAttachment {
  id: string;
  ticketId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  type: AttachmentType;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: 'Customer' | 'Engineer' | 'Manager' | 'System';
  content: string;
  isInternal: boolean;
  isAI: boolean;
  aiInsightType?: AIInsightType;
  aiConfidence?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SLAInfo {
  id: string;
  ticketId: string;
  slaName: string;
  targetResponseTime: number; // minutes
  targetResolutionTime: number; // minutes
  actualResponseTime?: number; // minutes
  actualResolutionTime?: number; // minutes
  status: SLAStatus;
  breachedAt?: Date;
  pausedAt?: Date;
  resumedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReopenHistory {
  id: string;
  ticketId: string;
  reopenedBy: string;
  reopenedByRole: 'Customer' | 'Engineer' | 'Manager';
  reason: string;
  previousStatus: TicketStatus;
  reopenedAt: Date;
  resolutionNotes?: string;
  createdAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface LinkedIssue {
  id: string;
  ticketId: string;
  linkedIssueKey: string;
  linkedIssueSummary: string;
  linkType: LinkedIssueType;
  createdAt: Date;
}

export interface AIInsight {
  id: string;
  ticketId: string;
  type: AIInsightType;
  title: string;
  description: string;
  confidence: number; // 0-1
  generatedBy: 'MockAI' | 'OpenAI' | 'Anthropic';
  generatedAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  isActionable: boolean;
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface Ticket {
  id: string;
  key: string; // e.g., "AI-1234"
  summary: string;
  description: string;
  priority: TicketPriority;
  severity: TicketSeverity;
  status: TicketStatus;
  requestType: RequestType;
  application: string; // AI Flow, RS2, ATR, FMIS, PRIME, RPMS, FDM
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneeEmail?: string;
  team?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  dueDate?: Date;
  firstResponseAt?: Date;
  sla?: SLAInfo;
  comments: TicketComment[];
  attachments: TicketAttachment[];
  reopenHistory: ReopenHistory[];
  remediationNotes: RemediationNote[];
  linkedIssues: LinkedIssue[];
  aiInsights: AIInsight[];
  tags: string[];
  customFields: Record<string, unknown>;
  customerSatisfaction?: number; // 1-5
  timeToFirstResponse?: number; // minutes
  timeToResolution?: number; // minutes
  businessImpact?: string;
  rootCause?: string;
  category?: string;
  subCategory?: string;
}

export interface TicketFilters {
  applications?: string[];
  priorities?: TicketPriority[];
  severities?: TicketSeverity[];
  statuses?: TicketStatus[];
  requestTypes?: RequestType[];
  assignees?: string[];
  teams?: string[];
  dateRange?: {
    start: Date;
    end: Date;
    field: 'createdAt' | 'updatedAt' | 'resolvedAt' | 'closedAt';
  };
  slaStatuses?: SLAStatus[];
  hasSLAViolation?: boolean;
  hasReopens?: boolean;
  hasAIInsights?: boolean;
  search?: string;
  tags?: string[];
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedTickets {
  tickets: Ticket[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TicketStatistics {
  total: number;
  byStatus: Record<TicketStatus, number>;
  byPriority: Record<TicketPriority, number>;
  bySeverity: Record<TicketSeverity, number>;
  byApplication: Record<string, number>;
  byRequestType: Record<RequestType, number>;
  byAssignee: Record<string, number>;
  byTeam: Record<string, number>;
  slaMet: number;
  slaBreached: number;
  slaAtRisk: number;
  avgTimeToFirstResponse: number;
  avgTimeToResolution: number;
  reopenRate: number;
  customerSatisfaction: number;
  ticketsWithAIInsights: number;
  ticketsWithReopens: number;
  ticketsWithIncompleteRemediation: number;
  recurringIssues: number;
}