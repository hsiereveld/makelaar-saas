import { db } from '../lib/db'
import { tenants, subscriptions, usageMetrics, supportTickets, invoices } from '../lib/db/schema'

async function seedPlatformAdminData() {
  try {
    console.log('🌱 Seeding Platform Admin Development Data...')

    // Create test agencies with different subscription plans
    const agencies = [
      {
        slug: 'amsterdam-real-estate',
        name: 'Amsterdam International Real Estate',
        plan: 'professional' as const,
        status: 'active' as const
      },
      {
        slug: 'rotterdam-properties',
        name: 'Rotterdam Properties International',
        plan: 'basic' as const,
        status: 'trialing' as const
      },
      {
        slug: 'utrecht-homes',
        name: 'Utrecht Premium Homes',
        plan: 'enterprise' as const,
        status: 'active' as const
      },
      {
        slug: 'eindhoven-estates',
        name: 'Eindhoven International Estates',
        plan: 'trial' as const,
        status: 'trialing' as const
      }
    ]

    for (const agency of agencies) {
      // Check if tenant already exists
      const existingTenant = await db
        .select()
        .from(tenants)
        .where(eq(tenants.slug, agency.slug))

      let tenantId: string

      if (existingTenant.length > 0) {
        console.log(`✅ Agency ${agency.name} already exists`)
        tenantId = existingTenant[0].id
      } else {
        // Create tenant
        const [newTenant] = await db
          .insert(tenants)
          .values({
            slug: agency.slug,
            name: agency.name,
          })
          .returning()
        
        tenantId = newTenant.id
        console.log(`✅ Created agency: ${agency.name}`)
      }

      // Check if subscription already exists
      const existingSubscription = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.tenantId, tenantId))

      let subscription
      if (existingSubscription.length > 0) {
        console.log(`✅ Subscription already exists for ${agency.name}`)
        subscription = existingSubscription[0]
      } else {
        // Create new subscription
        const [newSubscription] = await db
          .insert(subscriptions)
          .values({
            tenantId,
            plan: agency.plan,
            status: agency.status,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            trialEndsAt: agency.status === 'trialing' ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null,
            monthlyPrice: getPlanPrice(agency.plan),
            maxUsers: getPlanLimits(agency.plan).users,
            maxProperties: getPlanLimits(agency.plan).properties,
            features: getPlanFeatures(agency.plan),
          })
          .returning()
        
        subscription = newSubscription
      }

      console.log(`✅ Subscription setup: ${agency.name} (${agency.plan})`)

      // Add usage metrics for realistic data
      const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
      const metrics = [
        { metric: 'properties', value: Math.floor(Math.random() * 50) + 10 },
        { metric: 'contacts', value: Math.floor(Math.random() * 200) + 50 },
        { metric: 'leads', value: Math.floor(Math.random() * 100) + 25 },
        { metric: 'api_calls', value: Math.floor(Math.random() * 10000) + 1000 },
        { metric: 'storage_mb', value: Math.floor(Math.random() * 1000) + 100 },
      ]

      for (const metric of metrics) {
        await db
          .insert(usageMetrics)
          .values({
            tenantId,
            metric: metric.metric,
            value: metric.value,
            recordedAt: new Date(),
            billingPeriod: currentMonth,
          })
          .onConflictDoNothing()
      }

      // Create sample invoice if professional or enterprise
      if (agency.plan === 'professional' || agency.plan === 'enterprise') {
        await db
          .insert(invoices)
          .values({
            tenantId,
            subscriptionId: subscription.id,
            invoiceNumber: `INV-${Date.now()}-${tenantId.slice(0, 8)}`,
            amount: getPlanPrice(agency.plan),
            tax: Math.floor(getPlanPrice(agency.plan) * 0.21), // 21% BTW
            currency: 'EUR',
            status: 'paid',
            dueDate: new Date(),
            paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            description: `${agency.plan.charAt(0).toUpperCase() + agency.plan.slice(1)} Plan - Monthly Subscription`,
            lineItems: [{
              description: `${agency.plan} Plan`,
              quantity: 1,
              unitPrice: getPlanPrice(agency.plan),
              totalPrice: getPlanPrice(agency.plan)
            }],
          })
          .onConflictDoNothing()
      }
    }

    // Create sample support tickets
    const tickets = [
      {
        title: 'Login Issues - Amsterdam Agency',
        description: 'User cannot access dashboard after password reset',
        priority: 'high' as const,
        status: 'open' as const
      },
      {
        title: 'Subscription Upgrade Request',
        description: 'Rotterdam Properties wants to upgrade to Professional plan',
        priority: 'normal' as const,
        status: 'in_progress' as const
      },
      {
        title: 'Property Import Feature Request',
        description: 'Bulk property import functionality needed for Utrecht',
        priority: 'low' as const,
        status: 'open' as const
      }
    ]

    for (const ticket of tickets) {
      await db
        .insert(supportTickets)
        .values({
          title: ticket.title,
          description: ticket.description,
          priority: ticket.priority,
          status: ticket.status,
        })
        .onConflictDoNothing()
    }

    console.log('')
    console.log('🎉 Platform Admin Development Data Seeded Successfully!')
    console.log('')
    console.log('📊 Created:')
    console.log(`- ${agencies.length} Test Agencies with different subscription plans`)
    console.log('- Usage metrics for realistic analytics')
    console.log('- Sample invoices for billing testing')
    console.log('- Support tickets for testing')
    console.log('')
    console.log('🎛️ Test Platform Admin Dashboard:')
    console.log('URL: http://localhost:3000/platform-admin')
    console.log('Login: admin@makelaar-saas.com / SuperAdmin123!')

  } catch (error) {
    console.error('❌ Error seeding platform admin data:', error)
    process.exit(1)
  }
}

function getPlanPrice(plan: string): number {
  const prices = {
    trial: 0,
    basic: 4900, // €49/month in cents
    professional: 9900, // €99/month in cents
    enterprise: 19900, // €199/month in cents
    custom: 39900, // €399/month in cents
  }
  return prices[plan as keyof typeof prices] || 0
}

function getPlanLimits(plan: string) {
  const limits = {
    trial: { users: 2, properties: 10 },
    basic: { users: 5, properties: 50 },
    professional: { users: 15, properties: 200 },
    enterprise: { users: 50, properties: 1000 },
    custom: { users: 999, properties: 9999 },
  }
  return limits[plan as keyof typeof limits] || { users: 2, properties: 10 }
}

function getPlanFeatures(plan: string) {
  const features = {
    trial: { analytics: false, integrations: false, support: 'email' },
    basic: { analytics: true, integrations: false, support: 'email' },
    professional: { analytics: true, integrations: true, support: 'priority' },
    enterprise: { analytics: true, integrations: true, support: 'phone', whitelabel: true },
    custom: { analytics: true, integrations: true, support: 'dedicated', whitelabel: true, api_access: true },
  }
  return features[plan as keyof typeof features] || {}
}

// Add missing import
const { eq } = require('drizzle-orm')

if (require.main === module) {
  seedPlatformAdminData().then(() => {
    console.log('✅ Seed script completed!')
    process.exit(0)
  }).catch((error) => {
    console.error('💥 Seed script failed:', error)
    process.exit(1)
  })
}

export { seedPlatformAdminData }