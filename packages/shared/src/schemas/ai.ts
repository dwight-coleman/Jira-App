import { z } from 'zod';
import type { AIInsightType } from '../types/ai';

export const aiProviderConfigSchema = z.object({
  provider: z.enum(['mock', 'openai', 'anthropic', 'custom']),
  apiKey: z.string().optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().optional(),
  baseUrl: z.string().url().optional(),
  organizationId: z.string().optional(),
  timeout: z.number().int().positive().optional(),
  maxRetries: z.number().int().nonnegative().optional(),
});

export const aiAnalysisRequestSchema = z.object({
  ticketId: z.string().uuid(),
  ticketData: z.object({
    key: z.string(),
    summary: z.string(),
    description: z.string(),
    priority: z.string(),
    severity: z.string(),
    status: z.string(),
    requestType: z.string(),
    application: z.string(),
    comments: z.array(z.object({
      author: z.string(),
      role: z.string(),
      content: z.string(),
      isInternal: z.boolean(),
      createdAt: z.coerce.date(),
    })),
    remediationNotes: z.array(z.object({
      content: z.string(),
      isComplete: z.boolean(),
      author: z.string(),
      createdAt: z.coerce.date(),
    })),
    slaStatus: z.string().optional(),
    reopenCount: z.number().int().nonnegative(),
    linkedIssues: z.array(z.object({
      key: z.string(),
      summary: z.string(),
      type: z.string(),
    })),
    tags: z.array(z.string()),
    customFields: z.record(z.unknown()),
  }),
  context: z.object({
    recentTickets: z.array(z.object({
      key: z.string(),
      summary: z.string(),
      application: z.string(),
      rootCause: z.string().optional(),
    })).optional(),
    similarTickets: z.array(z.object({
      key: z.string(),
      summary: z.string(),
      rootCause: z.string().optional(),
      resolution: z.string().optional(),
    })).optional(),
    applicationContext: z.object({
      name: z.string(),
      commonIssues: z.array(z.string()),
      knownIssues: z.array(z.string()),
    }).optional(),
    teamContext: z.object({
      name: z.string(),
      expertise: z.array(z.string()),
      workload: z.number(),
    }).optional(),
  }).optional(),
  analysisTypes: z.array(z.enum(['Root Cause', 'Trend', 'Recommendation', 'Risk', 'Pattern', 'Anomaly', 'Recurring Issue', 'SLA Risk', 'Knowledge Gap'])),
  options: z.object({
    includeRecommendations: z.boolean().optional(),
    includeRiskAssessment: z.boolean().optional(),
    includePatternDetection: z.boolean().optional(),
    confidenceThreshold: z.number().min(0).max(1).optional(),
    maxInsights: z.number().int().positive().optional(),
  }).optional(),
});

export const aiInsightResultSchema = z.object({
  id: z.string().uuid(),
  ticketId: z.string().uuid(),
  type: z.enum(['Root Cause', 'Trend', 'Recommendation', 'Risk', 'Pattern', 'Anomaly', 'Recurring Issue', 'SLA Risk', 'Knowledge Gap']),
  title: z.string(),
  description: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  evidence: z.array(z.string()),
  recommendations: z.array(z.string()),
  riskLevel: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  impact: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  effort: z.enum(['Low', 'Medium', 'High']).optional(),
  tags: z.array(z.string()),
  metadata: z.record(z.unknown()),
  generatedAt: z.coerce.date(),
  provider: z.string(),
  model: z.string(),
});

export const aiAnalysisResponseSchema = z.object({
  ticketId: z.string().uuid(),
  insights: z.array(aiInsightResultSchema),
  summary: z.string(),
  overallRisk: z.enum(['Low', 'Medium', 'High', 'Critical']),
  processingTimeMs: z.number().int().nonnegative(),
  tokensUsed: z.object({
    prompt: z.number().int().nonnegative(),
    completion: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
  }),
  provider: z.string(),
  model: z.string(),
  generatedAt: z.coerce.date(),
});

export const aiProviderHealthSchema = z.object({
  provider: z.string(),
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  latencyMs: z.number().nonnegative(),
  lastCheck: z.coerce.date(),
  errorRate: z.number().min(0).max(1),
  quotaRemaining: z.number().int().nonnegative().optional(),
  model: z.string().optional(),
});

export const aiBatchAnalysisRequestSchema = z.object({
  ticketIds: z.array(z.string().uuid()),
  analysisTypes: z.array(z.enum(['Root Cause', 'Trend', 'Recommendation', 'Risk', 'Pattern', 'Anomaly', 'Recurring Issue', 'SLA Risk', 'Knowledge Gap'])),
  options: z.object({
    includeRecommendations: z.boolean().optional(),
    includeRiskAssessment: z.boolean().optional(),
    includePatternDetection: z.boolean().optional(),
    confidenceThreshold: z.number().min(0).max(1).optional(),
    maxInsights: z.number().int().positive().optional(),
  }).optional(),
});

export const aiBatchAnalysisResponseSchema = z.object({
  results: z.array(aiAnalysisResponseSchema),
  summary: z.object({
    totalProcessed: z.number().int().nonnegative(),
    successful: z.number().int().nonnegative(),
    failed: z.number().int().nonnegative(),
    totalInsights: z.number().int().nonnegative(),
    avgConfidence: z.number().min(0).max(1),
    processingTimeMs: z.number().int().nonnegative(),
  }),
});

export const aiPromptTemplateSchema = z.object({
  name: z.string(),
  description: z.string(),
  systemPrompt: z.string(),
  userPromptTemplate: z.string(),
  variables: z.array(z.string()),
  analysisTypes: z.array(z.enum(['Root Cause', 'Trend', 'Recommendation', 'Risk', 'Pattern', 'Anomaly', 'Recurring Issue', 'SLA Risk', 'Knowledge Gap'])),
  version: z.string(),
});

export const aiModelConfigSchema = z.object({
  provider: z.string(),
  model: z.string(),
  displayName: z.string(),
  maxTokens: z.number().int().positive(),
  supportsStreaming: z.boolean(),
  supportsFunctions: z.boolean(),
  costPer1kInputTokens: z.number().nonnegative(),
  costPer1kOutputTokens: z.number().nonnegative(),
  capabilities: z.array(z.string()),
});

export type AIProviderConfig = z.infer<typeof aiProviderConfigSchema>;
export type AIAnalysisRequest = z.infer<typeof aiAnalysisRequestSchema>;
export type AIInsightResult = z.infer<typeof aiInsightResultSchema>;
export type AIAnalysisResponse = z.infer<typeof aiAnalysisResponseSchema>;
export type AIProviderHealth = z.infer<typeof aiProviderHealthSchema>;
export type AIBatchAnalysisRequest = z.infer<typeof aiBatchAnalysisRequestSchema>;
export type AIBatchAnalysisResponse = z.infer<typeof aiBatchAnalysisResponseSchema>;
export type AIPromptTemplate = z.infer<typeof aiPromptTemplateSchema>;
export type AIModelConfig = z.infer<typeof aiModelConfigSchema>;