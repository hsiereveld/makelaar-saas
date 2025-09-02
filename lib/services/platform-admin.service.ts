import { db } from '@/lib/db'
import { 
  tenants, subscriptions, invoices, usageMetrics, supportTickets, 
  supportTicketMessages, platformSettings, systemLogs, platformStats,
  users, userTenantRoles, properties, contacts, leads
} from '@/lib/db/schema'
import { eq, desc, asc, count, sum, and, gte, lte, sql, like, or } from 'drizzle-orm'
import type { 
  SubscriptionPlan, SubscriptionStatus, SupportTicketStatus, 
  SupportTicketPriority 
} from '@/lib/types/database'

export class PlatformAdminService {
  // Tenant Management
  static async getAllTenants(page = 1, limit = 20, search?: string) {
    let query = db
      .select({
        id: tenants.id,
        slug: tenants.slug,
        name: tenants.name,
        createdAt: tenants.createdAt,
        subscription: {
          id: subscriptions.id,
          plan: subscriptions.plan,
          status: subscriptions.status,
          currentPeriodEnd: subscriptions.currentPeriodEnd,
          trialEndsAt: subscriptions.trialEndsAt,
          monthlyPrice: subscriptions.monthlyPrice,
          maxUsers: subscriptions.maxUsers,
          maxProperties: subscriptions.maxProperties,
          features: subscriptions.features,
        },
        userCount: sql<number>`count(distinct ${userTenantRoles.userId})`,
        propertyCount: sql<number>`count(distinct ${properties.id})`,
        contactCount: sql<number>`count(distinct ${contacts.id})`,
      })
      .from(tenants)
      .leftJoin(subscriptions, eq(tenants.id, subscriptions.tenantId))
      .leftJoin(userTenantRoles, eq(tenants.id, userTenantRoles.tenantId))
      .leftJoin(properties, eq(tenants.id, properties.tenantId))
      .leftJoin(contacts, eq(tenants.id, contacts.tenantId))
      .groupBy(tenants.id, subscriptions.id)
      .orderBy(desc(tenants.createdAt))

    if (search) {
      query = query.where(or(
        like(tenants.name, `%${search}%`),
        like(tenants.slug, `%${search}%`)
      ))
    }

    const offset = (page - 1) * limit
    const results = await query.limit(limit).offset(offset)

    const totalQuery = db.select({ count: count() }).from(tenants)
    const [{ count: total }] = await (search 
      ? totalQuery.where(or(
          like(tenants.name, `%${search}%`),
          like(tenants.slug, `%${search}%`)
        ))
      : totalQuery
    )

    return {
      tenants: results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  static async getTenantDetails(tenantId: string) {
    const [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))

    if (!tenant) {
      throw new Error('Tenant not found')
    }

    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId))

    const stats = await db
      .select({
        users: count(userTenantRoles.id),
        properties: count(properties.id),
        contacts: count(contacts.id),
        leads: count(leads.id),
      })
      .from(tenants)
      .leftJoin(userTenantRoles, eq(tenants.id, userTenantRoles.tenantId))
      .leftJoin(properties, eq(tenants.id, properties.tenantId))
      .leftJoin(contacts, eq(tenants.id, contacts.tenantId))
      .leftJoin(leads, eq(tenants.id, leads.tenantId))
      .where(eq(tenants.id, tenantId))
      .groupBy(tenants.id)

    return {
      tenant,
      subscription,
      stats: stats[0] || { users: 0, properties: 0, contacts: 0, leads: 0 },
    }
  }

  static async createTenant(data: { name: string; slug: string; plan?: SubscriptionPlan }) {
    const [tenant] = await db
      .insert(tenants)
      .values({
        name: data.name,
        slug: data.slug,
      })
      .returning()

    // Create default subscription
    const [subscription] = await db
      .insert(subscriptions)
      .values({
        tenantId: tenant.id,
        plan: data.plan || 'trial',
        status: 'trialing',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      })
      .returning()

    await this.logSystemAction({
      action: 'tenant_created',
      resource: 'tenant',
      resourceId: tenant.id,
      details: { tenantName: data.name, plan: data.plan || 'trial' },
    })

    return { tenant, subscription }
  }

  static async suspendTenant(tenantId: string, reason: string) {
    const [subscription] = await db
      .update(subscriptions)
      .set({ 
        status: 'paused',
        metadata: sql`jsonb_set(coalesce(metadata, '{}'), '{suspension}', ${JSON.stringify({ 
          reason, 
          suspendedAt: new Date().toISOString() 
        })})`,
      })
      .where(eq(subscriptions.tenantId, tenantId))
      .returning()

    await this.logSystemAction({
      action: 'tenant_suspended',
      resource: 'tenant',
      resourceId: tenantId,
      details: { reason },
    })

    return subscription
  }

  // Subscription Management
  static async updateSubscription(
    tenantId: string, 
    updates: Partial<{
      plan: SubscriptionPlan
      status: SubscriptionStatus
      maxUsers: number
      maxProperties: number
      features: any
    }>
  ) {
    const [subscription] = await db
      .update(subscriptions)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.tenantId, tenantId))
      .returning()

    await this.logSystemAction({
      action: 'subscription_updated',
      resource: 'subscription',
      resourceId: subscription.id,
      details: { tenantId, updates },
    })

    return subscription
  }

  // Usage Metrics & Billing
  static async recordUsageMetric(
    tenantId: string, 
    metric: string, 
    value: number, 
    billingPeriod?: string
  ) {
    const [usage] = await db
      .insert(usageMetrics)
      .values({
        tenantId,
        metric,
        value,
        recordedAt: new Date(),
        billingPeriod: billingPeriod || new Date().toISOString().slice(0, 7), // YYYY-MM
      })
      .returning()

    return usage
  }

  static async getTenantUsage(tenantId: string, billingPeriod?: string) {
    let query = db
      .select({
        metric: usageMetrics.metric,
        totalValue: sum(usageMetrics.value),
        recordCount: count(usageMetrics.id),
      })
      .from(usageMetrics)
      .where(eq(usageMetrics.tenantId, tenantId))
      .groupBy(usageMetrics.metric)

    if (billingPeriod) {
      query = query.where(
        and(
          eq(usageMetrics.tenantId, tenantId),
          eq(usageMetrics.billingPeriod, billingPeriod)
        )
      )
    }

    return await query
  }

  // Support Ticket Management
  static async getAllSupportTickets(
    filters: {
      status?: SupportTicketStatus
      priority?: SupportTicketPriority
      tenantId?: string
      assignedTo?: string
      page?: number
      limit?: number
    } = {}
  ) {
    const { status, priority, tenantId, assignedTo, page = 1, limit = 20 } = filters

    let query = db
      .select({
        ticket: supportTickets,
        tenant: { name: tenants.name, slug: tenants.slug },
        user: { name: users.name, email: users.email },
      })
      .from(supportTickets)
      .leftJoin(tenants, eq(supportTickets.tenantId, tenants.id))
      .leftJoin(users, eq(supportTickets.userId, users.id))
      .orderBy(desc(supportTickets.createdAt))

    const conditions = []
    if (status) conditions.push(eq(supportTickets.status, status))
    if (priority) conditions.push(eq(supportTickets.priority, priority))
    if (tenantId) conditions.push(eq(supportTickets.tenantId, tenantId))
    if (assignedTo) conditions.push(eq(supportTickets.assignedTo, assignedTo))

    if (conditions.length > 0) {
      query = query.where(and(...conditions))
    }

    const offset = (page - 1) * limit
    const tickets = await query.limit(limit).offset(offset)

    return { tickets, pagination: { page, limit } }
  }

  static async createSupportTicket(data: {
    tenantId?: string
    userId?: string
    title: string
    description: string
    priority?: SupportTicketPriority
  }) {
    const [ticket] = await db
      .insert(supportTickets)
      .values({
        tenantId: data.tenantId,
        userId: data.userId,
        title: data.title,
        description: data.description,
        priority: data.priority || 'normal',
        status: 'open',
      })
      .returning()

    await this.logSystemAction({
      action: 'support_ticket_created',
      resource: 'support_ticket',
      resourceId: ticket.id,
      details: { title: data.title, priority: data.priority },
    })

    return ticket
  }

  // Platform Statistics
  static async getDashboardStats() {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Total counts
    const [tenantStats] = await db
      .select({
        totalTenants: count(tenants.id),
        activeTenants: sql<number>`count(case when ${subscriptions.status} = 'active' then 1 end)`,
        trialTenants: sql<number>`count(case when ${subscriptions.status} = 'trialing' then 1 end)`,
      })
      .from(tenants)
      .leftJoin(subscriptions, eq(tenants.id, subscriptions.tenantId))

    const [userStats] = await db
      .select({
        totalUsers: count(users.id),
        newUsersThisMonth: sql<number>`count(case when ${users.createdAt} >= ${thirtyDaysAgo} then 1 end)`,
      })
      .from(users)

    const [supportStats] = await db
      .select({
        openTickets: sql<number>`count(case when ${supportTickets.status} = 'open' then 1 end)`,
        resolvedTickets: sql<number>`count(case when ${supportTickets.status} = 'resolved' then 1 end)`,
      })
      .from(supportTickets)

    // Monthly revenue (if you have billing data)
    const monthlyRevenue = await db
      .select({
        amount: sum(invoices.amount),
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.status, 'paid'),
          gte(invoices.paidAt, thirtyDaysAgo)
        )
      )

    return {
      tenants: tenantStats,
      users: userStats,
      support: supportStats,
      revenue: {
        monthlyRevenue: monthlyRevenue[0]?.amount || 0,
      },
    }
  }

  // System Logging
  static async logSystemAction(data: {
    tenantId?: string
    userId?: string
    action: string
    resource?: string
    resourceId?: string
    details?: any
    ipAddress?: string
    userAgent?: string
  }) {
    const [log] = await db
      .insert(systemLogs)
      .values({
        tenantId: data.tenantId,
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        details: data.details || {},
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      })
      .returning()

    return log
  }

  static async getSystemLogs(filters: {
    tenantId?: string
    action?: string
    resource?: string
    startDate?: Date
    endDate?: Date
    page?: number
    limit?: number
  } = {}) {
    const { tenantId, action, resource, startDate, endDate, page = 1, limit = 50 } = filters

    let query = db
      .select({
        log: systemLogs,
        tenant: { name: tenants.name, slug: tenants.slug },
        user: { name: users.name, email: users.email },
      })
      .from(systemLogs)
      .leftJoin(tenants, eq(systemLogs.tenantId, tenants.id))
      .leftJoin(users, eq(systemLogs.userId, users.id))
      .orderBy(desc(systemLogs.createdAt))

    const conditions = []
    if (tenantId) conditions.push(eq(systemLogs.tenantId, tenantId))
    if (action) conditions.push(eq(systemLogs.action, action))
    if (resource) conditions.push(eq(systemLogs.resource, resource))
    if (startDate) conditions.push(gte(systemLogs.createdAt, startDate))
    if (endDate) conditions.push(lte(systemLogs.createdAt, endDate))

    if (conditions.length > 0) {
      query = query.where(and(...conditions))
    }

    const offset = (page - 1) * limit
    const logs = await query.limit(limit).offset(offset)

    return { logs, pagination: { page, limit } }
  }

  // Platform Settings
  static async getPlatformSettings(category?: string) {
    let query = db.select().from(platformSettings).orderBy(asc(platformSettings.category), asc(platformSettings.key))
    
    if (category) {
      query = query.where(eq(platformSettings.category, category))
    }

    return await query
  }

  static async updatePlatformSetting(
    key: string, 
    value: any, 
    updatedBy: string,
    description?: string,
    category?: string
  ) {
    const [setting] = await db
      .insert(platformSettings)
      .values({
        key,
        value,
        description,
        category: category || 'general',
        updatedBy,
      })
      .onConflictDoUpdate({
        target: platformSettings.key,
        set: {
          value,
          description,
          updatedBy,
          updatedAt: new Date(),
        },
      })
      .returning()

    await this.logSystemAction({
      action: 'platform_setting_updated',
      resource: 'platform_setting',
      resourceId: setting.id,
      userId: updatedBy,
      details: { key, value },
    })

    return setting
  }
}