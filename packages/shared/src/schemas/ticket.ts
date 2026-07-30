import { z } from 'zod';
import type { TicketPriority, TicketSeverity, TicketStatus, RequestType, SLAStatus, AIInsightType, AttachmentType, LinkedIssueType } from '../types/ticket';

export const ticketPrioritySchema = z.enum(['Critical', 'High', 'Medium', 'Low']);
export const ticketSeveritySchema = z.enum(['Severity 1', 'Severity 2', 'Severity 3', 'Severity 4']);
export const ticketStatusSchema = z.enum(['Open', 'In Progress', 'Waiting for Customer', 'Waiting for Support', 'Resolved', 'Closed', 'Reopened']);
export const requestTypeSchema = z.enum(['Incident', 'Service Request', 'Change Request', 'Problem', 'Access Request', 'Information Request']);
export const slaStatusSchema = z.enum(['Met', 'Breached', 'At Risk', 'Not Applicable']);
export const aiInsightTypeSchema = z.enum(['Root Cause', 'Trend', 'Recommendation', 'Risk', 'Pattern', 'Anomaly', 'Recurring Issue', 'SLA Risk', 'Knowledge Gap']);
export const attachmentTypeSchema = z.enum(['Screenshot', 'Log', 'Document', 'Video', 'Other']);
export const linkedIssueTypeSchema = z.enum(['Blocks', 'Is Blocked By', 'Relates To', 'Duplicates', 'Is Duplicated By', 'Parent', 'Child']);

export const dateSchema = z.coerce.date();

export const ticketAttachmentSchema = z.object({
  id: z.string().uuid(),
  ticketId: z.string().uuid(),
  fileName: z.string().min(1),
  fileSize: z.number().int().positive(),
  mimeType: z.string(),
  type: attachmentTypeSchema,
  url: z.string().url(),
  uploadedBy: z.string(),
  uploadedAt: dateSchema,
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export const ticketCommentSchema = z.object({
  id: z.string().uuid(),
  ticketId: z.string().uuid(),
  authorId: z.string().uuid(),
  authorName: z.string(),
  authorRole: z.enum(['Customer', 'Engineer', 'Manager', 'System']),
  content: z.string().min(1),
  isInternal: z.boolean(),
  isAI: z.boolean(),
  aiInsightType: aiInsightTypeSchema.optional(),
  aiConfidence: z.number().min(0).max(1).optional(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export const slaInfoSchema = z.object({
  id: z.string().uuid(),
  ticketId: z.string().uuid(),
  slaName: z.string(),
  targetResponseTime: z.number().int().positive(),
  targetResolutionTime: z.number().int().positive(),
  actualResponseTime: z.number().int().positive().optional(),
  actualResolutionTime: z.number().int().positive().optional(),
  status: slaStatusSchema,
  breachedAt: dateSchema.optional(),
  pausedAt: dateSchema.optional(),
  resumedAt: dateSchema.optional(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export const reopenHistorySchema = z.object({
  id: z.string().uuid(),
  ticketId: z.string().uuid(),
  reopenedBy: z.string().uuid(),
  reopenedByRole: z.enum(['Customer', 'Engineer', 'Manager']),
  reason: z.string().min(1),
  previousStatus: ticketStatusSchema,
  reopenedAt: dateSchema,
  resolutionNotes: z.string().optional(),
  createdAt: dateSchema,
});

export const remediationNoteSchema = z.object({
  id: z.string().uuid(),
  ticketId: z.string().uuid(),
  authorId: z.string().uuid(),
  authorName: z.string(),
  content: z.string().min(1),
  isComplete: z.boolean(),
  isAIEnhanced: z.boolean(),
  aiConfidence: z.number().min(0).max(1).optional(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export const linkedIssueSchema = z.object({
  id: z.string().uuid(),
  ticketId: z.string().uuid(),
  linkedIssueKey: z.string(),
  linkedIssueSummary: z.string(),
  linkType: linkedIssueTypeSchema,
  createdAt: dateSchema,
});

export const aiInsightSchema = z.object({
  id: z.string().uuid(),
  ticketId: z.string().uuid(),
  type: aiInsightTypeSchema,
  title: z.string(),
  description: z.string(),
  confidence: z.number().min(0).max(1),
  generatedBy: z.enum(['MockAI', 'OpenAI', 'Anthropic']),
  generatedAt: dateSchema,
  acknowledgedAt: dateSchema.optional(),
  acknowledgedBy: z.string().optional(),
  isActionable: z.boolean(),
  tags: z.array(z.string()),
  metadata: z.record(z.unknown()),
});

export const ticketSchema = z.object({
  id: z.string().uuid(),
  key: z.string().regex(/^[A-Z]+-\d+$/),
  summary: z.string().min(1).max(500),
  description: z.string().min(1),
  priority: ticketPrioritySchema,
  severity: ticketSeveritySchema,
  status: ticketStatusSchema,
  requestType: requestTypeSchema,
  application: z.string().min(1),
  reporterId: z.string().uuid(),
  reporterName: z.string(),
  reporterEmail: z.string().email(),
  assigneeId: z.string().uuid().optional(),
  assigneeName: z.string().optional(),
  assigneeEmail: z.string().email().optional(),
  team: z.string().optional(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  resolvedAt: dateSchema.optional(),
  closedAt: dateSchema.optional(),
  dueDate: dateSchema.optional(),
  firstResponseAt: dateSchema.optional(),
  sla: slaInfoSchema.optional(),
  comments: z.array(ticketCommentSchema),
  attachments: z.array(ticketAttachmentSchema),
  reopenHistory: z.array(reopenHistorySchema),
  remediationNotes: z.array(remediationNoteSchema),
  linkedIssues: z.array(linkedIssueSchema),
  aiInsights: z.array(aiInsightSchema),
  tags: z.array(z.string()),
  customFields: z.record(z.unknown()),
  customerSatisfaction: z.number().int().min(1).max(5).optional(),
  timeToFirstResponse: z.number().int().positive().optional(),
  timeToResolution: z.number().int().positive().optional(),
  businessImpact: z.string().optional(),
  rootCause: z.string().optional(),
  category: z.string().optional(),
  subCategory: z.string().optional(),
});

export const ticketFiltersSchema = z.object({
  applications: z.array(z.string()).optional(),
  priorities: z.array(ticketPrioritySchema).optional(),
  severities: z.array(ticketSeveritySchema).optional(),
  statuses: z.array(ticketStatusSchema).optional(),
  requestTypes: z.array(requestTypeSchema).optional(),
  assignees: z.array(z.string()).optional(),
  teams: z.array(z.string()).optional(),
  dateRange: z.object({
    start: dateSchema,
    end: dateSchema,
    field: z.enum(['createdAt', 'updatedAt', 'resolvedAt', 'closedAt']),
  }).optional(),
  slaStatuses: z.array(slaStatusSchema).optional(),
  hasSLAViolation: z.boolean().optional(),
  hasReopens: z.boolean().optional(),
  hasAIInsights: z.boolean().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const paginatedTicketsSchema = z.object({
  tickets: z.array(ticketSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const ticketStatisticsSchema = z.object({
  total: z.number().int().nonnegative(),
  byStatus: z.record(ticketStatusSchema, z.number().int().nonnegative()),
  byPriority: z.record(ticketPrioritySchema, z.number().int().nonnegative()),
  bySeverity: z.record(ticketSeveritySchema, z.number().int().nonnegative()),
  byApplication: z.record(z.string(), z.number().int().nonnegative()),
  byRequestType: z.record(requestTypeSchema, z.number().int().nonnegative()),
  byAssignee: z.record(z.string(), z.number().int().nonnegative()),
  byTeam: z.record(z.string(), z.number().int().nonnegative()),
  slaMet: z.number().int().nonnegative(),
  slaBreached: z.number().int().nonnegative(),
  slaAtRisk: z.number().int().nonnegative(),
  avgTimeToFirstResponse: z.number().nonnegative(),
  avgTimeToResolution: z.number().nonnegative(),
  reopenRate: z.number().min(0).max(1),
  customerSatisfaction: z.number().min(1).max(5),
  ticketsWithAIInsights: z.number().int().nonnegative(),
  ticketsWithReopens: z.number().int().nonnegative(),
  ticketsWithIncompleteRemediation: z.number().int().nonnegative(),
  recurringIssues: z.number().int().nonnegative(),
});

export type TicketAttachment = z.infer<typeof ticketAttachmentSchema>;
export type TicketComment = z.infer<typeof ticketCommentSchema>;
export type SLAInfo = z.infer<typeof slaInfoSchema>;
export type ReopenHistory = z.infer<typeof reopenHistorySchema>;
export type RemediationNote = z.infer<typeof remediationNoteSchema>;
export type LinkedIssue = z.infer<typeof linkedIssueSchema>;
export type AIInsight = z.infer<typeof aiInsightSchema>;
export type Ticket = z.infer<typeof ticketSchema>;
export type TicketFilters = z.infer<typeof ticketFiltersSchema>;
export type PaginatedTickets = z.infer<typeof paginatedTicketsSchema>;
export type TicketStatistics = z.infer<typeof ticketStatisticsSchema>;