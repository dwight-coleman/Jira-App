import type { ReportSchedule } from './provider';

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FilterParams {
  search?: string;
  dateRange?: { start: Date; end: Date };
  applications?: string[];
  engineers?: string[];
  priorities?: string[];
  severities?: string[];
  statuses?: string[];
  requestTypes?: string[];
  slaStatuses?: string[];
  tags?: string[];
  rootCauses?: string[];
  recurringOnly?: boolean;
  slaBreachedOnly?: boolean;
  reopenedOnly?: boolean;
  hasAIAnalysis?: boolean;
  minConfidence?: number;
  maxConfidence?: number;
}

export interface DateRange {
  start: Date;
  end: Date;
  preset?: 'today' | 'yesterday' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'this-quarter' | 'last-quarter' | 'this-year' | 'last-year';
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ColumnConfig {
  field: string;
  header: string;
  type?: 'string' | 'number' | 'date' | 'boolean' | 'priority' | 'severity' | 'status' | 'progress';
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  hideable?: boolean;
  pinned?: 'left' | 'right';
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

export interface ChartDataPoint {
  x: string | number | Date;
  y: number;
  label?: string;
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
  type?: 'line' | 'bar' | 'area' | 'scatter' | 'pie' | 'donut' | 'radar';
  yAxisIndex?: number;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'area' | 'pie' | 'donut' | 'scatter' | 'heatmap' | 'radar' | 'gauge';
  title?: string;
  subtitle?: string;
  xAxis?: { key: string; name?: string; type?: 'category' | 'number' | 'time'; format?: string };
  yAxis?: { key: string; name?: string; type?: 'value' | 'category'; format?: string; min?: number; max?: number };
  series: ChartSeries[];
  legend?: { show: boolean; position?: 'top' | 'bottom' | 'left' | 'right' };
  tooltip?: { show: boolean; formatter?: (value: number, name: string, dataPoint: ChartDataPoint) => string };
  grid?: { show: boolean; top?: number; right?: number; bottom?: number; left?: number };
  colors?: string[];
  animation?: boolean;
  responsive?: boolean;
}

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf' | 'json';
  filename: string;
  includeHeaders: boolean;
  selectedFields?: string[];
  filters?: FilterParams;
  chartImages?: boolean;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; field?: string; message: string }>;
  duplicates: number;
  updated: number;
  created: number;
}

export interface ProviderConfig {
  id: string;
  name: string;
  type: 'jira' | 'servicenow' | 'azure-devops' | 'csv' | 'synthetic' | 'custom';
  isEnabled: boolean;
  isDefault: boolean;
  config: Record<string, unknown>;
  credentials?: Record<string, string>;
  syncSchedule?: {
    frequency: 'manual' | 'hourly' | 'daily' | 'weekly';
    time?: string;
    timezone?: string;
  };
  filters?: {
    projects?: string[];
    issueTypes?: string[];
    statuses?: string[];
    dateRange?: DateRange;
  };
  fieldMappings?: Record<string, string>;
  lastSyncAt?: Date;
  lastSyncStatus?: 'success' | 'failed' | 'partial';
  lastSyncError?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIProviderConfig {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'mock' | 'custom';
  isEnabled: boolean;
  isDefault: boolean;
  config: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
    apiVersion?: string;
    baseURL?: string;
  };
  credentials?: {
    apiKey?: string;
    organizationId?: string;
  };
  prompts?: {
    executiveSummary?: string;
    technicalSummary?: string;
    rootCause?: string;
    remediation?: string;
    businessImpact?: string;
    preventativeActions?: string;
    recurringDetection?: string;
  };
  rateLimits?: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  general: {
    appName: string;
    appDescription: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    language: string;
  };
  dashboard: {
    defaultPeriod: DateRange;
    refreshInterval: number;
    autoRefresh: boolean;
    defaultPageSize: number;
  };
  tickets: {
    defaultFilters: FilterParams;
    slaTargets: Record<string, { response: number; resolution: number }>;
    priorities: Record<string, { color: string; weight: number; slaHours: number }>;
    severities: Record<string, { color: string; weight: number }>;
    statuses: Record<string, { color: string; order: number; isTerminal: boolean }>;
    requestTypes: Record<string, { color: string; icon: string }>;
  };
  ai: {
    enabled: boolean;
    defaultProvider: string;
    autoAnalyzeNewTickets: boolean;
    batchSize: number;
    confidenceThreshold: number;
    retainAnalyses: number; // days
  };
  reports: {
    defaultPeriod: DateRange;
    templatePath?: string;
    logoPath?: string;
    footerText?: string;
    recipients: string[];
    schedule: ReportSchedule[];
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      maxAge: number;
      historyCount: number;
    };
    twoFactor: {
      enabled: boolean;
      required: boolean;
      methods: ('totp' | 'sms' | 'email')[];
    };
  };
  integrations: {
    jira: JiraIntegrationConfig;
    servicenow?: ServiceNowIntegrationConfig;
    azureDevops?: AzureDevOpsIntegrationConfig;
    slack?: SlackIntegrationConfig;
    teams?: TeamsIntegrationConfig;
    email?: EmailIntegrationConfig;
  };
  notifications: {
    channels: ('email' | 'slack' | 'teams' | 'webhook')[];
    defaultChannel: string;
    templates: Record<string, string>;
  };
  updatedAt: Date;
  updatedBy: string;
}

export interface JiraIntegrationConfig {
  enabled: boolean;
  baseUrl: string;
  authType: 'basic' | 'bearer' | 'oauth';
  username?: string;
  apiToken?: string;
  accessToken?: string;
  refreshToken?: string;
  projectKeys: string[];
  serviceDeskIds: string[];
  requestTypes: string[];
  syncFields: string[];
  webhookUrl?: string;
  webhookSecret?: string;
}

export interface ServiceNowIntegrationConfig {
  enabled: boolean;
  instanceUrl: string;
  username: string;
  password?: string;
  clientId?: string;
  clientSecret?: string;
  table: string;
  queryFields: string[];
}

export interface AzureDevOpsIntegrationConfig {
  enabled: boolean;
  organization: string;
  project: string;
  personalAccessToken: string;
  workItemTypes: string[];
  areaPaths: string[];
  iterationPaths: string[];
}

export interface SlackIntegrationConfig {
  enabled: boolean;
  botToken: string;
  signingSecret: string;
  defaultChannel: string;
  channels: Record<string, string>; // event -> channel
}

export interface TeamsIntegrationConfig {
  enabled: boolean;
  tenantId: string;
  clientId: string;
  clientSecret: string;
  webhookUrl?: string;
}

export interface EmailIntegrationConfig {
  enabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromAddress: string;
  fromName: string;
  useTLS: boolean;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure' | 'partial';
  errorMessage?: string;
  duration?: number;
  createdAt: Date;
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: { status: 'healthy' | 'unhealthy'; latency?: number; error?: string };
    redis?: { status: 'healthy' | 'unhealthy'; latency?: number; error?: string };
    ai?: { status: 'healthy' | 'unhealthy'; latency?: number; error?: string; provider?: string };
    jira?: { status: 'healthy' | 'unhealthy'; latency?: number; error?: string };
    disk?: { status: 'healthy' | 'unhealthy'; freeSpace?: number; error?: string };
    memory?: { status: 'healthy' | 'unhealthy'; used?: number; total?: number; error?: string };
  };
}