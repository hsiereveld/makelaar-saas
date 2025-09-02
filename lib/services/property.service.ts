import { db } from '@/lib/db'
import { properties, tenants, contacts, leads, contactPropertyRelationships } from '@/lib/db/schema'
import { eq, and, count, avg, desc, asc, gte, lte, inArray } from 'drizzle-orm'
import type { Property, Tenant, Contact, Lead, ContactPropertyRelationship, LeadSource } from '@/lib/types/database'

export interface CreatePropertyInput {
  tenantId: string
  title: string
  slug: string
  address: string
  city: string
  price: number
  bedrooms?: number
  bathrooms?: number
  livingArea?: number
  status?: 'draft' | 'active' | 'under_offer' | 'sold' | 'withdrawn'
}

export interface UpdatePropertyInput {
  title?: string
  slug?: string
  address?: string
  city?: string
  price?: number
  bedrooms?: number
  bathrooms?: number
  livingArea?: number
  status?: 'draft' | 'active' | 'under_offer' | 'sold' | 'withdrawn'
}

export interface PropertyWithRelationships {
  property: Property
  interestedContacts: ContactPropertyRelationship[]
  activeLeads: Lead[]
  totalInterest: number
}

export interface PropertyInterestMetrics {
  totalContacts: number
  interestedCount: number
  viewingScheduledCount: number
  offerMadeCount: number
  averageLeadScore: number
  lastActivityAt: Date | null
}

export interface ContactAssignmentInput {
  tenantId: string
  contactId: string
  propertyId: string
  relationship: string
  notes?: string
  createLead?: boolean
  leadSource?: LeadSource
}

export class PropertyService {
  /**
   * Get all properties for a specific tenant
   */
  static async getPropertiesByTenant(tenantId: string): Promise<Property[]> {
    return await db
      .select()
      .from(properties)
      .where(eq(properties.tenantId, tenantId))
  }

  /**
   * Get all properties for a tenant by tenant slug
   */
  static async getPropertiesByTenantSlug(tenantSlug: string): Promise<Property[]> {
    const result = await db
      .select({
        id: properties.id,
        tenantId: properties.tenantId,
        title: properties.title,
        slug: properties.slug,
        address: properties.address,
        city: properties.city,
        price: properties.price,
        bedrooms: properties.bedrooms,
        bathrooms: properties.bathrooms,
        livingArea: properties.livingArea,
        status: properties.status,
        createdAt: properties.createdAt,
      })
      .from(properties)
      .innerJoin(tenants, eq(properties.tenantId, tenants.id))
      .where(eq(tenants.slug, tenantSlug))

    return result
  }

  /**
   * Get a specific property by ID and tenant
   */
  static async getPropertyById(propertyId: string, tenantId: string): Promise<Property | null> {
    const result = await db
      .select()
      .from(properties)
      .where(and(
        eq(properties.id, propertyId),
        eq(properties.tenantId, tenantId)
      ))

    return result[0] || null
  }

  /**
   * Create a new property
   */
  static async createProperty(input: CreatePropertyInput): Promise<Property> {
    const result = await db
      .insert(properties)
      .values({
        ...input,
        status: input.status || 'draft',
      })
      .returning()

    return result[0]
  }

  /**
   * Update a property
   */
  static async updateProperty(
    propertyId: string,
    tenantId: string,
    input: UpdatePropertyInput
  ): Promise<Property | null> {
    const result = await db
      .update(properties)
      .set(input)
      .where(and(
        eq(properties.id, propertyId),
        eq(properties.tenantId, tenantId)
      ))
      .returning()

    return result[0] || null
  }

  /**
   * Update property status using workflow system
   */
  static async updatePropertyStatus(
    propertyId: string,
    tenantId: string,
    newStatus: PropertyStatus,
    options: {
      userId?: string
      userRole?: UserRole
      reason?: string
      notes?: string
      executeWorkflows?: boolean
    } = {}
  ): Promise<any> {
    // Use workflow service for status changes
    const { PropertyWorkflowService } = await import('./workflow.service')
    
    return await PropertyWorkflowService.changePropertyStatus({
      propertyId,
      tenantId,
      newStatus,
      userId: options.userId,
      userRole: options.userRole,
      reason: options.reason,
      notes: options.notes,
      executeTriggers: options.executeWorkflows !== false,
    })
  }

  /**
   * Get property with workflow state
   */
  static async getPropertyWithWorkflow(
    propertyId: string,
    tenantId: string
  ): Promise<any> {
    const property = await this.getPropertyById(propertyId, tenantId)
    if (!property) return null

    const { PropertyWorkflowService } = await import('./workflow.service')
    const workflowState = await PropertyWorkflowService.getPropertyCurrentWorkflowState(
      propertyId,
      tenantId
    )

    return {
      ...property,
      workflow: workflowState,
    }
  }

  /**
   * Delete a property
   */
  static async deleteProperty(propertyId: string, tenantId: string): Promise<boolean> {
    const result = await db
      .delete(properties)
      .where(and(
        eq(properties.id, propertyId),
        eq(properties.tenantId, tenantId)
      ))
      .returning()

    return result.length > 0
  }

  /**
   * Get properties by status for a tenant
   */
  static async getPropertiesByStatus(
    tenantId: string,
    status: 'draft' | 'active' | 'under_offer' | 'sold' | 'withdrawn'
  ): Promise<Property[]> {
    return await db
      .select()
      .from(properties)
      .where(and(
        eq(properties.tenantId, tenantId),
        eq(properties.status, status)
      ))
  }

  /**
   * Get properties by city for a tenant
   */
  static async getPropertiesByCity(tenantId: string, city: string): Promise<Property[]> {
    return await db
      .select()
      .from(properties)
      .where(and(
        eq(properties.tenantId, tenantId),
        eq(properties.city, city)
      ))
  }

  // ===== INTEGRATION METHODS =====

  /**
   * Get property with contact relationships and leads
   */
  static async getPropertyWithRelationships(
    propertyId: string,
    tenantId: string
  ): Promise<PropertyWithRelationships | null> {
    const property = await this.getPropertyById(propertyId, tenantId)
    if (!property) return null

    const relationships = await db
      .select()
      .from(contactPropertyRelationships)
      .where(and(
        eq(contactPropertyRelationships.propertyId, propertyId),
        eq(contactPropertyRelationships.tenantId, tenantId),
        eq(contactPropertyRelationships.isActive, true)
      ))

    const activeLeads = await db
      .select()
      .from(leads)
      .where(and(
        eq(leads.propertyId, propertyId),
        eq(leads.tenantId, tenantId)
      ))

    return {
      property,
      interestedContacts: relationships,
      activeLeads,
      totalInterest: relationships.length + activeLeads.length,
    }
  }

  /**
   * Get property interest metrics
   */
  static async getPropertyInterestMetrics(
    propertyId: string,
    tenantId: string
  ): Promise<PropertyInterestMetrics> {
    const relationships = await db
      .select()
      .from(contactPropertyRelationships)
      .where(and(
        eq(contactPropertyRelationships.propertyId, propertyId),
        eq(contactPropertyRelationships.tenantId, tenantId)
      ))

    const propertyLeads = await db
      .select()
      .from(leads)
      .where(and(
        eq(leads.propertyId, propertyId),
        eq(leads.tenantId, tenantId)
      ))

    const interestedCount = relationships.filter(r => r.relationship === 'interested').length
    const viewingScheduledCount = relationships.filter(r => r.relationship === 'viewing_scheduled').length
    const offerMadeCount = relationships.filter(r => r.relationship === 'offer_made').length
    
    const averageScore = propertyLeads.length > 0 
      ? propertyLeads.reduce((sum, lead) => sum + (lead.score || 0), 0) / propertyLeads.length 
      : 0

    const lastActivityAt = propertyLeads.length > 0
      ? new Date(Math.max(...propertyLeads.map(l => new Date(l.updatedAt || l.createdAt!).getTime())))
      : null

    return {
      totalContacts: relationships.length,
      interestedCount,
      viewingScheduledCount,
      offerMadeCount,
      averageLeadScore: Math.round(averageScore),
      lastActivityAt,
    }
  }

  /**
   * Get properties with contact activity
   */
  static async getPropertiesWithContactActivity(tenantId: string): Promise<any[]> {
    const result = await db
      .select({
        id: properties.id,
        title: properties.title,
        price: properties.price,
        status: properties.status,
        contactCount: count(contactPropertyRelationships.id),
      })
      .from(properties)
      .leftJoin(contactPropertyRelationships, eq(properties.id, contactPropertyRelationships.propertyId))
      .where(eq(properties.tenantId, tenantId))
      .groupBy(properties.id, properties.title, properties.price, properties.status)
      .having(gte(count(contactPropertyRelationships.id), 1))

    return result
  }

  /**
   * Get properties matching contact budget and preferences
   */
  static async getPropertiesMatchingContact(
    contactId: string,
    tenantId: string
  ): Promise<Property[]> {
    // Get contact details
    const contact = await db
      .select()
      .from(contacts)
      .where(and(
        eq(contacts.id, contactId),
        eq(contacts.tenantId, tenantId)
      ))

    if (!contact[0]) return []

    const contactData = contact[0]
    
    // Find properties that match contact budget and preferences
    const matchingProperties = await db
      .select()
      .from(properties)
      .where(and(
        eq(properties.tenantId, tenantId),
        eq(properties.status, 'active'),
        contactData.budget ? lte(properties.price, contactData.budget) : undefined
      ))

    return matchingProperties.filter(Boolean)
  }

  /**
   * Get properties with lead metrics
   */
  static async getPropertiesWithLeadMetrics(tenantId: string): Promise<any[]> {
    const result = await db
      .select({
        id: properties.id,
        title: properties.title,
        price: properties.price,
        status: properties.status,
        city: properties.city,
        leadCount: count(leads.id),
        averageLeadScore: avg(leads.score),
        lastActivityAt: properties.createdAt, // Simplified for now
      })
      .from(properties)
      .leftJoin(leads, eq(properties.id, leads.propertyId))
      .where(eq(properties.tenantId, tenantId))
      .groupBy(properties.id, properties.title, properties.price, properties.status, properties.city, properties.createdAt)

    return result
  }

  /**
   * Get properties by lead status
   */
  static async getPropertiesByLeadStatus(
    tenantId: string,
    leadStatus: string
  ): Promise<Property[]> {
    const result = await db
      .selectDistinct()
      .from(properties)
      .innerJoin(leads, eq(properties.id, leads.propertyId))
      .where(and(
        eq(properties.tenantId, tenantId),
        eq(leads.status, leadStatus as any)
      ))

    return result.map(r => r.properties)
  }

  /**
   * Get properties by contact type interest
   */
  static async getPropertiesByContactType(
    tenantId: string,
    contactType: string
  ): Promise<Property[]> {
    const result = await db
      .selectDistinct()
      .from(properties)
      .innerJoin(contactPropertyRelationships, eq(properties.id, contactPropertyRelationships.propertyId))
      .innerJoin(contacts, eq(contactPropertyRelationships.contactId, contacts.id))
      .where(and(
        eq(properties.tenantId, tenantId),
        eq(contacts.type, contactType as any)
      ))

    return result.map(r => r.properties)
  }

  /**
   * Sort properties by engagement level
   */
  static async getPropertiesByEngagement(
    tenantId: string,
    order: 'asc' | 'desc' = 'desc'
  ): Promise<any[]> {
    const result = await db
      .select({
        id: properties.id,
        title: properties.title,
        price: properties.price,
        status: properties.status,
        city: properties.city,
        leadCount: count(leads.id),
        averageScore: avg(leads.score),
        engagementScore: count(leads.id), // Simplified engagement calculation
      })
      .from(properties)
      .leftJoin(leads, eq(properties.id, leads.propertyId))
      .where(eq(properties.tenantId, tenantId))
      .groupBy(properties.id, properties.title, properties.price, properties.status, properties.city)
      .orderBy(order === 'desc' ? desc(count(leads.id)) : asc(count(leads.id)))

    return result
  }

  /**
   * Assign contact to property with relationship and optional lead creation
   */
  static async assignContactToProperty(input: ContactAssignmentInput): Promise<any> {
    const { ContactPropertyRelationshipService } = await import('./contact.service')
    const { LeadService } = await import('./contact.service')

    // Create relationship
    const relationship = await ContactPropertyRelationshipService.createRelationship({
      tenantId: input.tenantId,
      contactId: input.contactId,
      propertyId: input.propertyId,
      relationship: input.relationship,
      notes: input.notes,
    })

    let lead = null
    if (input.createLead) {
      lead = await LeadService.createLead({
        tenantId: input.tenantId,
        contactId: input.contactId,
        propertyId: input.propertyId,
        status: input.relationship as any,
        source: input.leadSource || 'agent_assignment',
        message: input.notes,
      })
    }

    return { relationship, lead }
  }

  /**
   * Update property priority based on contact engagement
   */
  static async updatePropertyPriority(propertyId: string, tenantId: string): Promise<any> {
    const metrics = await this.getPropertyInterestMetrics(propertyId, tenantId)
    
    // Calculate priority score based on engagement
    let priorityScore = 0
    priorityScore += metrics.totalContacts * 10
    priorityScore += metrics.interestedCount * 20
    priorityScore += metrics.viewingScheduledCount * 30
    priorityScore += metrics.offerMadeCount * 50
    priorityScore += metrics.averageLeadScore

    return {
      propertyId,
      priorityScore: Math.min(priorityScore, 100),
      factors: {
        leadCount: metrics.totalContacts,
        averageScore: metrics.averageLeadScore,
        viewingActivity: metrics.viewingScheduledCount,
        offerActivity: metrics.offerMadeCount,
      },
    }
  }

  /**
   * Get suggested actions for property based on contact engagement
   */
  static async getPropertyActionSuggestions(propertyId: string, tenantId: string): Promise<any[]> {
    const metrics = await this.getPropertyInterestMetrics(propertyId, tenantId)
    const suggestions = []

    if (metrics.viewingScheduledCount > 0) {
      suggestions.push({
        action: 'Follow up on scheduled viewings',
        reason: `${metrics.viewingScheduledCount} viewing(s) scheduled`,
        priority: 'high',
      })
    }

    if (metrics.offerMadeCount > 0) {
      suggestions.push({
        action: 'Review pending offers',
        reason: `${metrics.offerMadeCount} offer(s) pending`,
        priority: 'urgent',
      })
    }

    if (metrics.interestedCount > 3) {
      suggestions.push({
        action: 'Consider price optimization',
        reason: `High interest (${metrics.interestedCount} contacts) but few offers`,
        priority: 'medium',
      })
    }

    if (metrics.averageLeadScore > 80) {
      suggestions.push({
        action: 'Focus on high-quality leads',
        reason: `High average lead score (${metrics.averageLeadScore})`,
        priority: 'high',
      })
    }

    return suggestions
  }

  /**
   * Get property engagement metrics
   */
  static async getPropertyEngagementMetrics(propertyId: string, tenantId: string): Promise<any> {
    const propertyLeads = await db
      .select()
      .from(leads)
      .where(and(
        eq(leads.propertyId, propertyId),
        eq(leads.tenantId, tenantId)
      ))

    const uniqueContacts = new Set(propertyLeads.map(l => l.contactId)).size
    const leadSources = propertyLeads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1
      return acc
    }, {} as any)

    const averageScore = propertyLeads.length > 0
      ? propertyLeads.reduce((sum, l) => sum + (l.score || 0), 0) / propertyLeads.length
      : 0

    const convertedLeads = propertyLeads.filter(l => l.status === 'converted').length
    const conversionRate = propertyLeads.length > 0 ? convertedLeads / propertyLeads.length : 0

    return {
      totalLeads: propertyLeads.length,
      uniqueContacts,
      leadSources,
      averageScore: Math.round(averageScore),
      conversionRate: Math.round(conversionRate * 100),
    }
  }

  /**
   * Get property activity timeline
   */
  static async getPropertyActivityTimeline(propertyId: string, tenantId: string): Promise<any[]> {
    // Get leads for timeline
    const propertyLeads = await db
      .select()
      .from(leads)
      .where(and(
        eq(leads.propertyId, propertyId),
        eq(leads.tenantId, tenantId)
      ))

    // Get relationships for timeline
    const relationships = await db
      .select()
      .from(contactPropertyRelationships)
      .where(and(
        eq(contactPropertyRelationships.propertyId, propertyId),
        eq(contactPropertyRelationships.tenantId, tenantId)
      ))

    // Combine into timeline activities
    const activities = [
      ...propertyLeads.map(lead => ({
        type: 'lead_created',
        timestamp: lead.createdAt!,
        contactId: lead.contactId,
        details: {
          status: lead.status,
          source: lead.source,
          score: lead.score,
          message: lead.message,
        },
      })),
      ...relationships.map(rel => ({
        type: 'relationship_created',
        timestamp: rel.createdAt!,
        contactId: rel.contactId,
        details: {
          relationship: rel.relationship,
          notes: rel.notes,
          isActive: rel.isActive,
        },
      })),
    ]

    // Sort by timestamp (newest first)
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  /**
   * Get property performance report with contact data
   */
  static async getPropertyPerformanceReport(
    propertyId: string,
    tenantId: string,
    options: { startDate?: Date; endDate?: Date } = {}
  ): Promise<any> {
    const property = await this.getPropertyById(propertyId, tenantId)
    if (!property) return null

    const metrics = await this.getPropertyEngagementMetrics(propertyId, tenantId)
    const interestMetrics = await this.getPropertyInterestMetrics(propertyId, tenantId)

    return {
      property,
      metrics: {
        totalViews: metrics.totalLeads, // Simplified
        leadCount: metrics.totalLeads,
        averageScore: metrics.averageScore,
        ...interestMetrics,
      },
      leadSources: metrics.leadSources,
      contactTypes: {}, // Would need to implement contact type breakdown
      reportPeriod: {
        startDate: options.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: options.endDate || new Date(),
      },
    }
  }
}