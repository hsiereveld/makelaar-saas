import { db } from '@/lib/db'
import { tenants, properties, contacts, leads, tenantSettings } from '@/lib/db/schema'
import { eq, count, avg } from 'drizzle-orm'
import type { Tenant } from '@/lib/types/database'

export interface CreateTenantInput {
  slug: string
  name: string
}

export class TenantService {
  /**
   * Get a tenant by slug
   */
  static async getTenantBySlug(slug: string): Promise<Tenant | null> {
    const result = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, slug))

    return result[0] || null
  }

  /**
   * Get a tenant by ID
   */
  static async getTenantById(id: string): Promise<Tenant | null> {
    const result = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, id))

    return result[0] || null
  }

  /**
   * Create a new tenant
   */
  static async createTenant(input: CreateTenantInput): Promise<Tenant> {
    const result = await db
      .insert(tenants)
      .values(input)
      .returning()

    return result[0]
  }

  /**
   * Get tenant settings from database
   */
  static async getTenantSettings(tenantId: string): Promise<any> {
    try {
      const settings = await db
        .select()
        .from(tenantSettings)
        .where(eq(tenantSettings.tenantId, tenantId))

      // Convert array of settings to object
      const settingsObject: any = {}
      settings.forEach(setting => {
        settingsObject[setting.key] = setting.value
      })

      // If no settings exist, return default Nederlandse makelaar settings
      if (Object.keys(settingsObject).length === 0) {
        const tenant = await this.getTenantById(tenantId)
        if (!tenant) throw new Error('Tenant not found')

        const cityName = tenant.slug.split('-')[0]
        const capitalizedCity = cityName.charAt(0).toUpperCase() + cityName.slice(1)
        
        return {
          agencyName: `${capitalizedCity} International Real Estate`,
          businessDescription: `Specialist makelaar in Spaanse vastgoed voor ${capitalizedCity} en omgeving.`,
          contactEmail: `info@${tenant.slug}.nl`,
          contactPhone: `+31 ${cityName === 'eindhoven' ? '40' : cityName === 'amsterdam' ? '20' : '50'} 123 4567`,
          address: `${capitalizedCity}straat 123, ${capitalizedCity}`,
          website: `https://${tenant.slug}.nl`,
          kvkNumber: Math.floor(Math.random() * 90000000 + 10000000).toString(),
          btwNumber: `NL${Math.floor(Math.random() * 900000000 + 100000000)}B01`,
          primaryColor: '#1d4ed8',
          secondaryColor: '#059669',
          timezone: 'Europe/Amsterdam',
          language: 'nl',
          currency: 'EUR'
        }
      }

      return settingsObject
    } catch (error) {
      console.error('Error getting tenant settings:', error)
      throw error
    }
  }

  /**
   * Update tenant settings in database
   */
  static async updateTenantSettings(tenantId: string, settings: any, updatedBy: string): Promise<any> {
    try {
      // Update or insert each setting
      for (const [key, value] of Object.entries(settings)) {
        if (key === 'subscription') continue // Skip read-only subscription data
        
        const category = key.startsWith('business') ? 'business' : 
                        key.startsWith('contact') ? 'contact' :
                        key.includes('Color') ? 'branding' : 'general'
        
        // Check if setting exists
        const existing = await db
          .select()
          .from(tenantSettings)
          .where(eq(tenantSettings.tenantId, tenantId))
          .where(eq(tenantSettings.key, key))
          .limit(1)

        if (existing.length > 0) {
          // Update existing
          await db
            .update(tenantSettings)
            .set({
              value,
              updatedAt: new Date(),
              updatedBy
            })
            .where(eq(tenantSettings.tenantId, tenantId))
            .where(eq(tenantSettings.key, key))
        } else {
          // Insert new
          await db
            .insert(tenantSettings)
            .values({
              tenantId,
              category,
              key,
              value,
              dataType: typeof value,
              isPublic: false,
              updatedBy
            })
        }
      }

      // Return updated settings
      return await this.getTenantSettings(tenantId)
    } catch (error) {
      console.error('Error updating tenant settings:', error)
      throw error
    }
  }

  /**
   * Update a tenant
   */
  static async updateTenant(id: string, input: Partial<CreateTenantInput>): Promise<Tenant | null> {
    const result = await db
      .update(tenants)
      .set(input)
      .where(eq(tenants.id, id))
      .returning()

    return result[0] || null
  }

  /**
   * Delete a tenant
   */
  static async deleteTenant(id: string): Promise<boolean> {
    const result = await db
      .delete(tenants)
      .where(eq(tenants.id, id))
      .returning()

    return result.length > 0
  }

  /**
   * Check if tenant slug is available
   */
  static async isSlugAvailable(slug: string): Promise<boolean> {
    const existing = await this.getTenantBySlug(slug)
    return !existing
  }

  /**
   * Get comprehensive CRM metrics for tenant
   */
  static async getTenantCRMMetrics(tenantId: string): Promise<any> {
    // Get basic counts
    const propertyCount = await db
      .select({ count: count() })
      .from(properties)
      .where(eq(properties.tenantId, tenantId))

    const contactCount = await db
      .select({ count: count() })
      .from(contacts)
      .where(eq(contacts.tenantId, tenantId))

    const leadCount = await db
      .select({ count: count() })
      .from(leads)
      .where(eq(leads.tenantId, tenantId))

    // Get average lead score
    const avgScoreResult = await db
      .select({ avg: avg(leads.score) })
      .from(leads)
      .where(eq(leads.tenantId, tenantId))

    // Calculate conversion rate
    const convertedLeads = await db
      .select({ count: count() })
      .from(leads)
      .where(eq(leads.tenantId, tenantId))
      // .where(eq(leads.status, 'converted'))

    const conversionRate = leadCount[0]?.count > 0 
      ? ((convertedLeads[0]?.count || 0) / (leadCount[0]?.count || 1)) * 100 
      : 0

    return {
      totalProperties: propertyCount[0]?.count || 0,
      totalContacts: contactCount[0]?.count || 0,
      totalLeads: leadCount[0]?.count || 0,
      averageLeadScore: Math.round(Number(avgScoreResult[0]?.avg || 0)),
      conversionRate: Math.round(conversionRate),
      topPerformingProperties: [], // Simplified for now
      mostEngagedContacts: [], // Simplified for now
    }
  }
}