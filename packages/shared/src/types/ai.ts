export interface AIProviderConfig {
  provider: 'mock' | 'openai' | 'anthropic' | 'custom';
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  baseUrl?: string;
  organizationId?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface AIAnalysisRequest {
  ticketId: string;
  ticketData: {
    key: string;
    summary: string;
    description: string;
    priority: string;
    severity: string;
    status: string;
    requestType: string;
    application: string;
    comments: Array<{
      author: string;
      role: string;
      content: string;
      isInternal: boolean;
      createdAt: Date;
    }>;
    remediationNotes: Array<{
      content: string;
      isComplete: boolean;
      author: string;
      createdAt: Date;
    }>;
    slaStatus?: string;
    reopenCount: number;
    linkedIssues: Array<{
      key: string;
      summary: string;
      type: string;
    }>;
    tags: string[];
    customFields: Record<string, unknown>;
  };
  context?: {
    recentTickets?: Array<{
      key: string;
      summary: string;
      application: string;
      rootCause?: string;
    }>;
    similarTickets?: Array<{
      key: string;
      summary: string;
      rootCause?: string;
      resolution?: string;
    }>;
    applicationContext?: {
      name: string;
      commonIssues: string[];
      knownIssues: string[];
    };
    teamContext?: {
      name: string;
      expertise: string[];
      workload: number;
    };
  };
  analysisTypes: AIInsightType[];
  options?: {
    includeRecommendations?: boolean;
    includeRiskAssessment?: boolean;
    includePatternDetection?: boolean;
    confidenceThreshold?: number;
    maxInsights?: number;
  };
}

export interface AIInsightResult {
  id: string;
  ticketId: string;
  type: AIInsightType;
  title: string;
  description: string;
  confidence: number;
  reasoning: string;
  evidence: string[];
  recommendations: string[];
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  impact?: 'Low' | 'Medium' | 'High' | 'Critical';
  effort?: 'Low' | 'Medium' | 'High';
  tags: string[];
  metadata: Record<string, unknown>;
  generatedAt: Date;
  provider: string;
  model: string;
}

export interface AIAnalysisResponse {
  ticketId: string;
  insights: AIInsightResult[];
  summary: string;
  overallRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  processingTimeMs: number;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  provider: string;
  model: string;
  generatedAt: Date;
}

export interface AIProviderHealth {
  provider: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latencyMs: number;
  lastCheck: Date;
  errorRate: number;
  quotaRemaining?: number;
  model?: string;
}

export interface AIBatchAnalysisRequest {
  ticketIds: string[];
  analysisTypes: AIInsightType[];
  options?: AIAnalysisRequest['options'];
}

export interface AIBatchAnalysisResponse {
  results: AIAnalysisResponse[];
  summary: {
    totalProcessed: number;
    successful: number;
    failed: number;
    totalInsights: number;
    avgConfidence: number;
    processingTimeMs: number;
  };
}

export interface AIPromptTemplate {
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  variables: string[];
  analysisTypes: AIInsightType[];
  version: string;
}

export interface AIModelConfig {
  provider: string;
  model: string;
  displayName: string;
  maxTokens: number;
  supportsStreaming: boolean;
  supportsFunctions: boolean;
  costPer1kInputTokens: number;
  costPer1kOutputTokens: number;
  capabilities: string[];
}