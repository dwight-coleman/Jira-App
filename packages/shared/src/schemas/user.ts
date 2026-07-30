import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  avatar: z.string().url().optional(),
  role: z.enum(['Admin', 'Manager', 'Analyst', 'Engineer', 'Viewer']),
  teams: z.array(z.string()),
  applications: z.array(z.string()),
  isActive: z.boolean(),
  lastLoginAt: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']),
    language: z.string(),
    timezone: z.string(),
    dateFormat: z.string(),
    numberFormat: z.string(),
    dashboardLayout: z.enum(['compact', 'comfortable', 'spacious']),
    defaultPageSize: z.number().int().positive().max(100).default(20),
    notifications: z.object({
      email: z.boolean(),
      inApp: z.boolean(),
      push: z.boolean(),
      digest: z.enum(['none', 'daily', 'weekly']),
      alerts: z.object({
        slaBreach: z.boolean(),
        criticalTicket: z.boolean(),
        reopen: z.boolean(),
        assignment: z.boolean(),
        mention: z.boolean(),
      }),
    }),
    ai: z.object({
      autoAnalyze: z.boolean(),
      confidenceThreshold: z.number().min(0).max(1),
      showInsights: z.boolean(),
    }),
  }),
  permissions: z.object({
    canViewDashboard: z.boolean(),
    canViewTickets: z.boolean(),
    canExportTickets: z.boolean(),
    canViewEngineers: z.boolean(),
    canViewApplications: z.boolean(),
    canViewReports: z.boolean(),
    canGenerateReports: z.boolean(),
    canManageSettings: z.boolean(),
    canManageProviders: z.boolean(),
    canManageUsers: z.boolean(),
    canViewAuditLog: z.boolean(),
    canAccessAdmin: z.boolean(),
  }),
});

export const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.string(),
  timezone: z.string(),
  dateFormat: z.string(),
  numberFormat: z.string(),
  dashboardLayout: z.enum(['compact', 'comfortable', 'spacious']),
  defaultPageSize: z.number().int().positive().max(100).default(20),
  notifications: z.object({
    email: z.boolean(),
    inApp: z.boolean(),
    push: z.boolean(),
    digest: z.enum(['none', 'daily', 'weekly']),
    alerts: z.object({
      slaBreach: z.boolean(),
      criticalTicket: z.boolean(),
      reopen: z.boolean(),
      assignment: z.boolean(),
      mention: z.boolean(),
    }),
  }),
  ai: z.object({
    autoAnalyze: z.boolean(),
    confidenceThreshold: z.number().min(0).max(1),
    showInsights: z.boolean(),
  }),
});

export const userPermissionsSchema = z.object({
  canViewDashboard: z.boolean(),
  canViewTickets: z.boolean(),
  canExportTickets: z.boolean(),
  canViewEngineers: z.boolean(),
  canViewApplications: z.boolean(),
  canViewReports: z.boolean(),
  canGenerateReports: z.boolean(),
  canManageSettings: z.boolean(),
  canManageProviders: z.boolean(),
  canManageUsers: z.boolean(),
  canViewAuditLog: z.boolean(),
  canAccessAdmin: z.boolean(),
});

export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().int().positive(),
  tokenType: z.literal('Bearer'),
});

export const loginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean().optional(),
});

export const registerDataSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(['Admin', 'Manager', 'Analyst', 'Engineer', 'Viewer']).optional(),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

export const passwordResetConfirmSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const changePasswordDataSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const sessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  device: z.string().optional(),
  location: z.string().optional(),
  isCurrent: z.boolean(),
  createdAt: z.coerce.date(),
  lastActiveAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
});

export type User = z.infer<typeof userSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type UserPermissions = z.infer<typeof userPermissionsSchema>;
export type AuthTokens = z.infer<typeof authTokensSchema>;
export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;
export type RegisterData = z.infer<typeof registerDataSchema>;
export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetConfirm = z.infer<typeof passwordResetConfirmSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordDataSchema>;
export type Session = z.infer<typeof sessionSchema>;