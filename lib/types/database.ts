import { InferSelectModel } from 'drizzle-orm'
import { 
  properties, 
  tenants, 
  contacts, 
  leads, 
  contactPropertyRelationships,
  users,
  sessions,
  accounts,
  userTenantRoles,
  permissions,
  rolePermissions,
  userSessions,
  propertyWorkflowHistory,
  workflowRules,
  workflowTriggers,
  workflowActions,
  tenantSettings,
  tenantFeatureFlags,
  tenantBranding,
  subscriptions,
  invoices,
  usageMetrics,
  supportTickets,
  supportTicketMessages,
  platformSettings,
  systemLogs,
  platformStats
} from '@/lib/db/schema'

export type Property = InferSelectModel<typeof properties>
export type Tenant = InferSelectModel<typeof tenants>
export type Contact = InferSelectModel<typeof contacts>
export type Lead = InferSelectModel<typeof leads>
export type ContactPropertyRelationship = InferSelectModel<typeof contactPropertyRelationships>
export type User = InferSelectModel<typeof users>
export type Session = InferSelectModel<typeof sessions>
export type Account = InferSelectModel<typeof accounts>
export type UserTenantRole = InferSelectModel<typeof userTenantRoles>
export type Permission = InferSelectModel<typeof permissions>
export type RolePermission = InferSelectModel<typeof rolePermissions>
export type UserSession = InferSelectModel<typeof userSessions>
export type PropertyWorkflowHistory = InferSelectModel<typeof propertyWorkflowHistory>
export type WorkflowRule = InferSelectModel<typeof workflowRules>
export type WorkflowTrigger = InferSelectModel<typeof workflowTriggers>
export type WorkflowAction = InferSelectModel<typeof workflowActions>
export type TenantSettings = InferSelectModel<typeof tenantSettings>
export type TenantFeatureFlag = InferSelectModel<typeof tenantFeatureFlags>
export type TenantBranding = InferSelectModel<typeof tenantBranding>

// Platform Admin & SaaS Management Types
export type Subscription = InferSelectModel<typeof subscriptions>
export type Invoice = InferSelectModel<typeof invoices>
export type UsageMetric = InferSelectModel<typeof usageMetrics>
export type SupportTicket = InferSelectModel<typeof supportTickets>
export type SupportTicketMessage = InferSelectModel<typeof supportTicketMessages>
export type PlatformSetting = InferSelectModel<typeof platformSettings>
export type SystemLog = InferSelectModel<typeof systemLogs>
export type PlatformStat = InferSelectModel<typeof platformStats>

export type PropertyStatus = 'draft' | 'active' | 'under_offer' | 'sold' | 'withdrawn'
export type PropertyType = 'apartment' | 'house' | 'villa' | 'studio' | 'penthouse' | 'townhouse' | 'land'
export type ContactType = 'buyer' | 'seller' | 'landlord' | 'tenant'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'interested' | 'viewing_scheduled' | 'offer_made' | 'converted' | 'lost'
export type LeadSource = 'website' | 'referral' | 'social_media' | 'email_campaign' | 'phone_call' | 'walk_in' | 'partner' | 'advertising'
export type UserRole = 'platform_admin' | 'tenant_owner' | 'tenant_admin' | 'agent' | 'assistant' | 'viewer'

// Platform Admin Specific Types
export type SubscriptionPlan = 'trial' | 'basic' | 'professional' | 'enterprise' | 'custom'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing' | 'paused'
export type SupportTicketStatus = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed'
export type SupportTicketPriority = 'low' | 'normal' | 'high' | 'urgent'