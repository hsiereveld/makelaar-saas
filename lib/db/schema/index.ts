import { pgTable, text, timestamp, uuid, integer, decimal, boolean, jsonb, pgEnum, index, uniqueIndex } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['platform_admin', 'tenant_owner', 'tenant_admin', 'agent', 'assistant', 'viewer']);
export const propertyStatusEnum = pgEnum('property_status', ['draft', 'active', 'under_offer', 'sold', 'withdrawn']);
export const propertyTypeEnum = pgEnum('property_type', ['apartment', 'house', 'villa', 'studio', 'penthouse', 'townhouse', 'land']);
export const contactTypeEnum = pgEnum('contact_type', ['buyer', 'seller', 'landlord', 'tenant']);
export const leadStatusEnum = pgEnum('lead_status', ['new', 'contacted', 'qualified', 'interested', 'viewing_scheduled', 'offer_made', 'converted', 'lost']);
export const leadSourceEnum = pgEnum('lead_source', ['website', 'referral', 'social_media', 'email_campaign', 'phone_call', 'walk_in', 'partner', 'advertising']);

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const properties = pgTable('properties', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  price: integer('price').notNull(),
  bedrooms: integer('bedrooms').default(0),
  bathrooms: integer('bathrooms').default(0),
  livingArea: integer('living_area'),
  status: propertyStatusEnum('status').notNull().default('draft'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  type: contactTypeEnum('type').notNull(),
  nationality: text('nationality'),
  preferredLanguage: text('preferred_language').default('en'),
  budget: integer('budget'),
  notes: text('notes'),
  tags: jsonb('tags').default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  tenantEmailIdx: uniqueIndex('contacts_tenant_email_idx').on(table.tenantId, table.email),
}));

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  contactId: uuid('contact_id').notNull().references(() => contacts.id),
  propertyId: uuid('property_id').references(() => properties.id),
  status: leadStatusEnum('status').notNull().default('new'),
  source: leadSourceEnum('source').notNull(),
  score: integer('score').default(0),
  message: text('message'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const contactPropertyRelationships = pgTable('contact_property_relationships', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  contactId: uuid('contact_id').notNull().references(() => contacts.id),
  propertyId: uuid('property_id').notNull().references(() => properties.id),
  relationship: text('relationship').notNull(), // 'interested', 'viewing', 'offer_made', 'owner', 'renter'
  notes: text('notes'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  tenantContactPropertyIdx: uniqueIndex('contact_property_tenant_idx').on(table.tenantId, table.contactId, table.propertyId),
}));

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  name: text('name').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  expiresAt: timestamp('expires_at'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  providerAccountIdx: uniqueIndex('accounts_provider_account_idx').on(table.providerId, table.accountId),
}));

export const userTenantRoles = pgTable('user_tenant_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }), // Made optional for platform admins
  role: userRoleEnum('role').notNull(),
  isActive: boolean('is_active').default(true),
  invitedBy: uuid('invited_by').references(() => users.id),
  inviteToken: text('invite_token'),
  inviteExpiresAt: timestamp('invite_expires_at'),
  joinedAt: timestamp('joined_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  // Updated index to handle NULL tenant_id for platform admins
  userTenantIdx: index('user_tenant_role_idx').on(table.userId, table.tenantId),
}));

export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  description: text('description'),
  resource: text('resource').notNull(), // 'property', 'contact', 'lead', 'user', 'tenant'
  action: text('action').notNull(), // 'create', 'read', 'update', 'delete', 'manage'
  createdAt: timestamp('created_at').defaultNow(),
});

export const rolePermissions = pgTable('role_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  role: userRoleEnum('role').notNull(),
  permissionId: uuid('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  rolePermissionIdx: uniqueIndex('role_permission_idx').on(table.role, table.permissionId),
}));

export const userSessions = pgTable('user_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').references(() => tenants.id),
  sessionToken: text('session_token').notNull().unique(),
  refreshToken: text('refresh_token').unique(),
  expiresAt: timestamp('expires_at').notNull(),
  refreshExpiresAt: timestamp('refresh_expires_at').notNull(),
  isActive: boolean('is_active').default(true),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  lastAccessedAt: timestamp('last_accessed_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const propertyWorkflowHistory = pgTable('property_workflow_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  propertyId: uuid('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  fromStatus: propertyStatusEnum('from_status'),
  toStatus: propertyStatusEnum('to_status').notNull(),
  userId: uuid('user_id').references(() => users.id),
  reason: text('reason'),
  notes: text('notes'),
  metadata: jsonb('metadata').default({}),
  triggeredBy: text('triggered_by'), // 'user', 'automation', 'system'
  triggerData: jsonb('trigger_data').default({}),
  createdAt: timestamp('created_at').defaultNow(),
});

export const workflowRules = pgTable('workflow_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  description: text('description'),
  fromStatus: propertyStatusEnum('from_status'),
  toStatus: propertyStatusEnum('to_status').notNull(),
  conditions: jsonb('conditions').default({}), // Business rule conditions
  requiredRole: userRoleEnum('required_role'),
  isActive: boolean('is_active').default(true),
  priority: integer('priority').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const workflowTriggers = pgTable('workflow_triggers', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  description: text('description'),
  triggerEvent: text('trigger_event').notNull(), // 'status_change', 'time_based', 'condition_met'
  conditions: jsonb('conditions').default({}),
  actions: jsonb('actions').default({}), // Actions to execute
  isActive: boolean('is_active').default(true),
  lastTriggered: timestamp('last_triggered'),
  triggerCount: integer('trigger_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const workflowActions = pgTable('workflow_actions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  triggerId: uuid('trigger_id').notNull().references(() => workflowTriggers.id, { onDelete: 'cascade' }),
  propertyId: uuid('property_id').references(() => properties.id),
  actionType: text('action_type').notNull(), // 'send_notification', 'update_leads', 'create_task', 'send_email'
  actionData: jsonb('action_data').default({}),
  status: text('status').notNull().default('pending'), // 'pending', 'executed', 'failed'
  executedAt: timestamp('executed_at'),
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tenantSettings = pgTable('tenant_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  category: text('category').notNull(), // 'branding', 'features', 'notifications', 'integrations'
  key: text('key').notNull(),
  value: jsonb('value').notNull(),
  dataType: text('data_type').notNull(), // 'string', 'number', 'boolean', 'object', 'array'
  isPublic: boolean('is_public').default(false), // Whether setting is visible to non-admin users
  description: text('description'),
  validationRules: jsonb('validation_rules').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  tenantCategoryKeyIdx: uniqueIndex('tenant_settings_category_key_idx').on(table.tenantId, table.category, table.key),
}));

export const tenantFeatureFlags = pgTable('tenant_feature_flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  featureName: text('feature_name').notNull(),
  isEnabled: boolean('is_enabled').default(false),
  enabledAt: timestamp('enabled_at'),
  enabledBy: uuid('enabled_by').references(() => users.id),
  configuration: jsonb('configuration').default({}),
  expiresAt: timestamp('expires_at'), // Optional feature expiration
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  tenantFeatureIdx: uniqueIndex('tenant_feature_flags_idx').on(table.tenantId, table.featureName),
}));

export const tenantBranding = pgTable('tenant_branding', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  logoUrl: text('logo_url'),
  faviconUrl: text('favicon_url'),
  primaryColor: text('primary_color').default('#3b82f6'), // Default blue
  secondaryColor: text('secondary_color').default('#64748b'), // Default slate
  accentColor: text('accent_color').default('#10b981'), // Default emerald
  fontFamily: text('font_family').default('Inter'),
  customCss: text('custom_css'),
  websiteUrl: text('website_url'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  socialMedia: jsonb('social_media').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Platform Admin & SaaS Management Tables

export const subscriptionPlanEnum = pgEnum('subscription_plan', ['trial', 'basic', 'professional', 'enterprise', 'custom']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'canceled', 'past_due', 'incomplete', 'trialing', 'paused']);
export const supportTicketStatusEnum = pgEnum('support_ticket_status', ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed']);
export const supportTicketPriorityEnum = pgEnum('support_ticket_priority', ['low', 'normal', 'high', 'urgent']);

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  plan: subscriptionPlanEnum('plan').notNull().default('trial'),
  status: subscriptionStatusEnum('status').notNull().default('trialing'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripeCustomerId: text('stripe_customer_id'),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  trialEndsAt: timestamp('trial_ends_at'),
  canceledAt: timestamp('canceled_at'),
  monthlyPrice: integer('monthly_price'), // in cents
  yearlyPrice: integer('yearly_price'), // in cents
  maxUsers: integer('max_users'),
  maxProperties: integer('max_properties'),
  features: jsonb('features').default({}), // Feature flags for this subscription
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id),
  stripeInvoiceId: text('stripe_invoice_id'),
  invoiceNumber: text('invoice_number').notNull(),
  amount: integer('amount').notNull(), // in cents
  tax: integer('tax').default(0), // in cents
  currency: text('currency').notNull().default('EUR'),
  status: text('status').notNull().default('draft'), // draft, open, paid, uncollectible
  dueDate: timestamp('due_date'),
  paidAt: timestamp('paid_at'),
  description: text('description'),
  lineItems: jsonb('line_items').default([]),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usageMetrics = pgTable('usage_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  metric: text('metric').notNull(), // 'properties', 'contacts', 'leads', 'api_calls', 'storage_mb'
  value: integer('value').notNull(),
  recordedAt: timestamp('recorded_at').notNull(),
  billingPeriod: text('billing_period'), // 'YYYY-MM' format
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  tenantMetricDateIdx: index('usage_metrics_tenant_metric_date_idx').on(table.tenantId, table.metric, table.recordedAt),
}));

export const supportTickets = pgTable('support_tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: supportTicketStatusEnum('status').notNull().default('open'),
  priority: supportTicketPriorityEnum('priority').notNull().default('normal'),
  assignedTo: uuid('assigned_to').references(() => users.id), // Platform admin user
  tags: jsonb('tags').default([]),
  metadata: jsonb('metadata').default({}),
  resolvedAt: timestamp('resolved_at'),
  closedAt: timestamp('closed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const supportTicketMessages = pgTable('support_ticket_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  ticketId: uuid('ticket_id').notNull().references(() => supportTickets.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id),
  message: text('message').notNull(),
  isInternal: boolean('is_internal').default(false), // Internal notes only visible to platform admins
  attachments: jsonb('attachments').default([]),
  createdAt: timestamp('created_at').defaultNow(),
});

export const platformSettings = pgTable('platform_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  description: text('description'),
  category: text('category').notNull(), // 'general', 'billing', 'email', 'security', 'features'
  isPublic: boolean('is_public').default(false), // Whether visible to tenants
  updatedBy: uuid('updated_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const systemLogs = pgTable('system_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id),
  action: text('action').notNull(), // 'tenant_created', 'subscription_changed', 'user_login', etc.
  resource: text('resource'), // 'tenant', 'user', 'subscription', 'property', etc.
  resourceId: text('resource_id'),
  details: jsonb('details').default({}),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  tenantActionDateIdx: index('system_logs_tenant_action_date_idx').on(table.tenantId, table.action, table.createdAt),
  actionResourceDateIdx: index('system_logs_action_resource_date_idx').on(table.action, table.resource, table.createdAt),
}));

export const platformStats = pgTable('platform_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  metric: text('metric').notNull(), // 'total_tenants', 'active_users', 'monthly_revenue', etc.
  value: decimal('value', { precision: 15, scale: 2 }).notNull(),
  date: timestamp('date').notNull(),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  metricDateIdx: uniqueIndex('platform_stats_metric_date_idx').on(table.metric, table.date),
}));

// ===== STAMDATA MANAGEMENT TABLES =====

// Tenant-specific master data for configurable dropdowns/checklists
export const tenantMasterData = pgTable('tenant_master_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  category: text('category').notNull(), // 'property_types', 'regions', 'amenities', 'utilities', 'investment_types', 'target_audiences', 'client_types', 'lead_sources', 'client_tags'
  key: text('key').notNull(), // machine readable key like 'villa', 'costa_blanca', 'private_pool'
  label: text('label').notNull(), // Nederlandse display label like 'Villa', 'Costa Blanca', 'Privé Zwembad'
  labelEn: text('label_en'), // English label for international properties
  icon: text('icon'), // Icon or emoji for UI
  description: text('description'), // Additional info for complex items
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  isDefault: boolean('is_default').default(false), // For seeding defaults
  isPopular: boolean('is_popular').default(false), // For highlighting popular choices
  metadata: jsonb('metadata').default({}), // Extra configuration like color, priority, etc.
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  updatedBy: uuid('updated_by').references(() => users.id),
}, (table) => ({
  tenantCategoryKeyIdx: uniqueIndex('tenant_master_data_category_key_idx').on(table.tenantId, table.category, table.key),
  tenantCategorySortIdx: index('tenant_master_data_category_sort_idx').on(table.tenantId, table.category, table.sortOrder),
}));

// Extended property data for Spanish real estate features (FoxVillas/IkZoekEenHuis level)
export const propertyExtendedData = pgTable('property_extended_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  
  // Spanish Location Details
  region: text('region'), // Costa Blanca, Costa del Sol, etc.
  province: text('province'), // Alicante, Malaga, Valencia, etc.
  municipality: text('municipality'),
  postalCode: text('postal_code'),
  coordinates: jsonb('coordinates'), // { lat, lng }
  
  // Extended Property Specifications
  propertySubtype: text('property_subtype'), // Country House, Beachfront, Golf Resort
  plotSize: integer('plot_size'), // m² land
  terraceArea: integer('terrace_area'), // m² terrace
  poolArea: integer('pool_area'), // m² pool
  builtYear: integer('built_year'),
  lastRenovation: integer('last_renovation'),
  orientation: text('orientation'), // North, South, East, West, Southeast, etc.
  floors: integer('floors').default(1),
  condition: text('condition'), // new, excellent, good, needs_renovation
  
  // Spanish Features (JSONB for flexibility)
  amenities: jsonb('amenities').default({}), // { privatePool: true, seaView: true, etc. }
  utilities: jsonb('utilities').default([]), // ['Electricity', 'Water', 'Internet']
  climate: jsonb('climate').default({}), // { airConditioning: true, centralHeating: true }
  
  // Spanish Legal & Financial
  habitationCertificate: boolean('habitation_certificate').default(false),
  energyRating: text('energy_rating'), // A, B, C, D, E, F, G
  ibi: integer('ibi'), // Annual property tax in euros
  communityFees: integer('community_fees'), // Monthly in euros
  basura: integer('basura'), // Waste collection tax
  transferTax: decimal('transfer_tax', { precision: 5, scale: 2 }), // Percentage
  
  // Investment Data
  investmentType: text('investment_type'), // permanent_residence, holiday_home, rental_investment, retirement
  rentalPotential: jsonb('rental_potential'), // { weeklyRateHigh, weeklyRateLow, monthlyRate, annualYield }
  
  // Internacional Marketing
  targetAudience: text('target_audience'), // dutch, english, belgian, german, all
  keyFeatures: jsonb('key_features').default([]), // Marketing highlight features
  lifestyleKeywords: jsonb('lifestyle_keywords').default([]), // For Dutch marketing
  
  // Critical Distances for International Buyers
  distances: jsonb('distances').default({}), // { airport: 45, beach: 15, golf: 10, hospital: 20, shopping: 5 }
  
  // Media
  virtualTour: text('virtual_tour_url'),
  floorPlan: text('floor_plan_url'),
  aerialPhotos: jsonb('aerial_photos').default([]),
  videos: jsonb('videos').default([]),
  
  // Marketing Performance
  featured: boolean('featured').default(false),
  featuredUntil: timestamp('featured_until'),
  seoKeywords: jsonb('seo_keywords').default([]),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  propertyIdx: uniqueIndex('property_extended_data_property_idx').on(table.propertyId),
}));

// Extended client data for Dutch buyer segmentation 
export const clientExtendedData = pgTable('client_extended_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  contactId: uuid('contact_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  
  // Dutch Client Segmentation
  clientSubtype: text('client_subtype'), // First-time buyer, Investor, Relocator, Retiree
  investmentProfile: text('investment_profile'), // Conservative, Moderate, Aggressive
  budgetFlexibility: text('budget_flexibility'), // Strict, Flexible, Very_flexible
  timeframe: text('timeframe'), // Immediate, 3_months, 6_months, 12_months, no_rush
  
  // Investment Preferences (matching property data)
  preferredRegions: jsonb('preferred_regions').default([]), // ['Costa Blanca', 'Costa del Sol']
  preferredPropertyTypes: jsonb('preferred_property_types').default([]), // ['villa', 'apartment']
  mustHaveAmenities: jsonb('must_have_amenities').default([]), // ['private_pool', 'sea_view']
  preferredAmenities: jsonb('preferred_amenities').default([]), // ['garage', 'air_conditioning']
  
  // Budget Analysis
  budgetMin: integer('budget_min'),
  budgetMax: integer('budget_max'),
  budgetCurrency: text('budget_currency').default('EUR'),
  financingRequired: boolean('financing_required').default(false),
  cashBuyer: boolean('cash_buyer').default(false),
  
  // Communication & Marketing
  communicationStyle: text('communication_style'), // formal, casual, technical
  marketingConsent: jsonb('marketing_consent').default({}), // { email: true, phone: false, whatsapp: true }
  referralSource: text('referral_source'), // website, google, facebook, referral, direct
  utm: jsonb('utm').default({}), // UTM tracking data
  
  // Lead Scoring Components
  engagementLevel: integer('engagement_level').default(0), // 0-100 score
  responseSpeed: text('response_speed'), // immediate, fast, slow, very_slow
  meetingWillingness: text('meeting_willingness'), // eager, willing, hesitant, unwilling
  decisionMakingSpeed: text('decision_making_speed'), // fast, normal, slow, very_slow
  
  // Dutch Buyer Behavior
  visitFrequency: integer('visit_frequency').default(0), // Times visited Spain
  spanishPropertyExperience: text('spanish_property_experience'), // none, limited, moderate, extensive
  legalKnowledge: text('legal_knowledge'), // none, basic, good, expert
  languageBarrier: boolean('language_barrier').default(false),
  localAgentRequired: boolean('local_agent_required').default(true),
  
  // Interaction History
  lastContactDate: timestamp('last_contact_date'),
  totalInteractions: integer('total_interactions').default(0),
  propertiesViewed: integer('properties_viewed').default(0),
  brochuresDownloaded: integer('brochures_downloaded').default(0),
  virtualToursViewed: integer('virtual_tours_viewed').default(0),
  showingsAttended: integer('showings_attended').default(0),
  offersSubmitted: integer('offers_submitted').default(0),
  
  // Lifecycle Stage
  leadStage: text('lead_stage').default('cold'), // cold, warm, hot, qualified, nurturing, lost
  conversionProbability: integer('conversion_probability').default(0), // 0-100%
  expectedClosingDate: timestamp('expected_closing_date'),
  lostReason: text('lost_reason'),
  lostDate: timestamp('lost_date'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  contactIdx: uniqueIndex('client_extended_data_contact_idx').on(table.contactId),
  leadStageIdx: index('client_extended_data_lead_stage_idx').on(table.leadStage),
  engagementIdx: index('client_extended_data_engagement_idx').on(table.engagementLevel),
}));

// Stamdata Categories (for organizing master data)
export const stamdataCategories = pgTable('stamdata_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(), // 'property_types', 'spanish_regions', 'amenities'
  label: text('label').notNull(), // 'Property Types', 'Spaanse Regio\'s', 'Voorzieningen'
  description: text('description'),
  icon: text('icon'), // Icon for UI
  isSystemCategory: boolean('is_system_category').default(true), // Cannot be deleted
  sortOrder: integer('sort_order').default(0),
  metadata: jsonb('metadata').default({}), // UI configuration
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  keyIdx: uniqueIndex('stamdata_categories_key_idx').on(table.key),
}));

// Filter presets for quick selections (Nederlandse koper selecties)
export const tenantFilterPresets = pgTable('tenant_filter_presets', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // 'Pensioen Villa\'s', 'Vakantie Appartementen'
  description: text('description'), // 'Geschikt voor Nederlandse pensionado\'s'
  icon: text('icon'), // Emoji or icon
  entityType: text('entity_type').notNull(), // 'properties' or 'clients'
  filterData: jsonb('filter_data').notNull(), // The actual filter configuration
  isPublic: boolean('is_public').default(true), // Visible to all users in tenant
  usageCount: integer('usage_count').default(0), // Track popularity
  createdBy: uuid('created_by').notNull().references(() => users.id),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  tenantEntityIdx: index('tenant_filter_presets_tenant_entity_idx').on(table.tenantId, table.entityType),
}));
