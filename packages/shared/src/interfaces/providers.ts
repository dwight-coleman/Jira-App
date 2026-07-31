import { ITicketProvider, IAIProvider, IReportProvider } from '../types/provider';
import { Ticket, TicketFilters, PaginatedTickets, TicketStatistics } from '../types/ticket';
import { AIAnalysisRequest, AIAnalysisResponse, AIBatchAnalysisRequest, AIBatchAnalysisResponse, AIProviderConfig, AIProviderHealth, AIModelConfig, AIPromptTemplate, AIInsightType } from '../types/ai';
import { ProviderConfig, ProviderHealth, ExecutiveSummaryParams, OperationalReportParams, TrendReportParams, SLAReportParams, TeamPerformanceParams, ApplicationHealthParams, BaseReport, ExecutiveReport, OperationalReport, TrendReport, SLAReport, TeamPerformanceReport, ApplicationHealthReport, ReportSchedule, ScheduledReport } from '../types/provider';

export type { ITicketProvider, IAIProvider, IReportProvider };
export type { ProviderConfig, ProviderHealth };
export type { Ticket, TicketFilters, PaginatedTickets, TicketStatistics };
export type { AIAnalysisRequest, AIAnalysisResponse, AIBatchAnalysisRequest, AIBatchAnalysisResponse, AIProviderConfig, AIProviderHealth, AIModelConfig, AIPromptTemplate, AIInsightType };
export type { ExecutiveSummaryParams, OperationalReportParams, TrendReportParams, SLAReportParams, TeamPerformanceParams, ApplicationHealthParams };
export type { BaseReport, ExecutiveReport, OperationalReport, TrendReport, SLAReport, TeamPerformanceReport, ApplicationHealthReport, ReportSchedule, ScheduledReport };

export abstract class BaseTicketProvider implements ITicketProvider {
  abstract name: string;
  abstract version: string;

  async initialize(config: ProviderConfig): Promise<void> {
    // Override in subclass
  }

  async healthCheck(): Promise<ProviderHealth> {
    return {
      status: 'healthy',
      latencyMs: 0,
      lastCheck: new Date(),
    };
  }

  abstract getTickets(filters?: TicketFilters): Promise<PaginatedTickets>;
  abstract getTicketById(id: string): Promise<Ticket | null>;
  abstract getTicketByKey(key: string): Promise<Ticket | null>;
  abstract getStatistics(filters?: TicketFilters): Promise<TicketStatistics>;
  abstract getApplications(): Promise<string[]>;
  abstract getTeams(): Promise<string[]>;
  abstract getAssignees(): Promise<string[]>;
  abstract getTags(): Promise<string[]>;
  abstract searchTickets(query: string, filters?: TicketFilters): Promise<Ticket[]>;
  abstract exportTickets(filters?: TicketFilters, format?: 'csv' | 'xlsx' | 'json'): Promise<Buffer>;
  abstract subscribeToUpdates(callback: (ticket: Ticket) => void): () => void;
  abstract close(): Promise<void>;
}

export abstract class BaseAIProvider implements IAIProvider {
  abstract name: string;
  abstract version: string;

  async initialize(config: AIProviderConfig): Promise<void> {
    // Override in subclass
  }

  async healthCheck(): Promise<AIProviderHealth> {
    return {
      provider: this.name,
      status: 'healthy',
      latencyMs: 0,
      lastCheck: new Date(),
      errorRate: 0,
    };
  }

  abstract analyzeTicket(request: AIAnalysisRequest): Promise<AIAnalysisResponse>;
  abstract analyzeBatch(request: AIBatchAnalysisRequest): Promise<AIBatchAnalysisResponse>;
  abstract getAvailableModels(): Promise<AIModelConfig[]>;
  abstract getPromptTemplates(): Promise<AIPromptTemplate[]>;
  abstract estimateTokens(request: AIAnalysisRequest): Promise<{ prompt: number; estimatedCompletion: number }>;
  abstract close(): Promise<void>;
}

export abstract class BaseReportProvider implements IReportProvider {
  abstract name: string;
  abstract version: string;

  async initialize(config: ProviderConfig): Promise<void> {
    // Override in subclass
  }

  async healthCheck(): Promise<ProviderHealth> {
    return {
      status: 'healthy',
      latencyMs: 0,
      lastCheck: new Date(),
    };
  }

  abstract generateExecutiveSummary(params: ExecutiveSummaryParams): Promise<ExecutiveReport>;
  abstract generateOperationalReport(params: OperationalReportParams): Promise<OperationalReport>;
  abstract generateTrendReport(params: TrendReportParams): Promise<TrendReport>;
  abstract generateSLAReport(params: SLAReportParams): Promise<SLAReport>;
  abstract generateTeamPerformanceReport(params: TeamPerformanceParams): Promise<TeamPerformanceReport>;
  abstract generateApplicationHealthReport(params: ApplicationHealthParams): Promise<ApplicationHealthReport>;
  abstract exportReport(report: BaseReport, format: 'pdf' | 'xlsx' | 'csv' | 'json'): Promise<Buffer>;
  abstract scheduleReport(schedule: ReportSchedule): Promise<ScheduledReport>;
  abstract getScheduledReports(): Promise<ScheduledReport[]>;
  abstract deleteScheduledReport(id: string): Promise<void>;
  abstract close(): Promise<void>;
}

export interface ProviderFactory {
  createTicketProvider(type: string, config: ProviderConfig): ITicketProvider;
  createAIProvider(type: string, config: AIProviderConfig): IAIProvider;
  createReportProvider(type: string, config: ProviderConfig): IReportProvider;
}

export class ProviderRegistry {
  private static ticketProviders = new Map<string, new (config: ProviderConfig) => ITicketProvider>();
  private static aiProviders = new Map<string, new (config: AIProviderConfig) => IAIProvider>();
  private static reportProviders = new Map<string, new (config: ProviderConfig) => IReportProvider>();

  static registerTicketProvider(name: string, providerClass: new (config: ProviderConfig) => ITicketProvider): void {
    this.ticketProviders.set(name, providerClass);
  }

  static registerAIProvider(name: string, providerClass: new (config: AIProviderConfig) => IAIProvider): void {
    this.aiProviders.set(name, providerClass);
  }

  static registerReportProvider(name: string, providerClass: new (config: ProviderConfig) => IReportProvider): void {
    this.reportProviders.set(name, providerClass);
  }

  static getTicketProvider(name: string, config: ProviderConfig): ITicketProvider | null {
    const ProviderClass = this.ticketProviders.get(name);
    if (!ProviderClass) return null;
    return new ProviderClass(config);
  }

  static getAIProvider(name: string, config: AIProviderConfig): IAIProvider | null {
    const ProviderClass = this.aiProviders.get(name);
    if (!ProviderClass) return null;
    return new ProviderClass(config);
  }

  static getReportProvider(name: string, config: ProviderConfig): IReportProvider | null {
    const ProviderClass = this.reportProviders.get(name);
    if (!ProviderClass) return null;
    return new ProviderClass(config);
  }

  static listTicketProviders(): string[] {
    return Array.from(this.ticketProviders.keys());
  }

  static listAIProviders(): string[] {
    return Array.from(this.aiProviders.keys());
  }

  static listReportProviders(): string[] {
    return Array.from(this.reportProviders.keys());
  }
}