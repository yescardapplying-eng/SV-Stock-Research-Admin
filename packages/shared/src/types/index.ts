import { LeadStatus, SyncJobStatus, SyncJobType, ActivityAction, AdminRole } from '../enums';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: Record<string, any>;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface WPFormField {
  id: string | number;
  name: string;
  value: any;
  type?: string;
}

export interface WPFormsSubmissionPayload {
  siteIdentifier: string;
  formId: number | string;
  formName: string;
  entryId: number | string;
  submittedAt: string;
  fields: Record<string, WPFormField>;
  userIp?: string;
  userAgent?: string;
}

export interface NormalizedLeadFields {
  fullName?: string;
  phone?: string;
  email?: string;
  state?: string;
  tradingSegment?: string;
  tradingCapital?: string;
  message?: string;
  [key: string]: any;
}

export interface LeadDTO {
  id: string;
  sourceEntryId: string;
  wpSiteId: string;
  wpFormId: string;
  wpEntryId: string;
  formName: string;
  submittedAt: string;
  status: LeadStatus;
  isArchived: boolean;
  archivedAt?: string | null;
  nextFollowupAt?: string | null;
  lastContactedAt?: string | null;
  normalizedFields: NormalizedLeadFields;
  originalFields: Record<string, any>;
  notesCount: number;
  activitiesCount: number;
  overrides?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface LeadStatsDTO {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  interestedLeads: number;
  followUpLeads: number;
  convertedLeads: number;
  archivedLeads: number;
  formWiseDistribution: Array<{ formName: string; count: number }>;
  dailyTrends: Array<{ date: string; count: number }>;
  statusDistribution: Array<{ status: LeadStatus; count: number }>;
}

export interface AdminUserDTO {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
}

export interface AuthSessionDTO {
  admin: AdminUserDTO;
  accessToken: string;
  expiresIn: number;
}
