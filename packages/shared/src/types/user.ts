export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'Admin' | 'Manager' | 'Analyst' | 'Engineer' | 'Viewer';
  teams: string[];
  applications: string[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
  permissions: UserPermissions;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  dashboardLayout: 'compact' | 'comfortable' | 'spacious';
  defaultPageSize: number;
  notifications: {
    email: boolean;
    inApp: boolean;
    push: boolean;
    digest: 'none' | 'daily' | 'weekly';
    alerts: {
      slaBreach: boolean;
      criticalTicket: boolean;
      reopen: boolean;
      assignment: boolean;
      mention: boolean;
    };
  };
  ai: {
    autoAnalyze: boolean;
    confidenceThreshold: number;
    showInsights: boolean;
  };
}

export interface UserPermissions {
  canViewDashboard: boolean;
  canViewTickets: boolean;
  canExportTickets: boolean;
  canViewEngineers: boolean;
  canViewApplications: boolean;
  canViewReports: boolean;
  canGenerateReports: boolean;
  canManageSettings: boolean;
  canManageProviders: boolean;
  canManageUsers: boolean;
  canViewAuditLog: boolean;
  canAccessAdmin: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: User['role'];
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface Session {
  id: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  location?: string;
  isCurrent: boolean;
  createdAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
}