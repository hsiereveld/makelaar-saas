import { db } from '@/lib/db'
import { contacts, leads, contactPropertyRelationships } from '@/lib/db/schema'
import { eq, and, ilike, gte, lte, or } from 'drizzle-orm'
import type { Contact, Lead, ContactPropertyRelationship, ContactType, LeadStatus, LeadSource } from '@/lib/types/database'

// Input types for contact operations
export interface CreateContactInput {
  tenantId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  type: ContactType
  nationality?: string
  preferredLanguage?: string
  budget?: number
  notes?: string
  tags?: any[]
}

export interface UpdateContactInput {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  type?: ContactType
  nationality?: string
  preferredLanguage?: string
  budget?: number
  notes?: string
  tags?: any[]
}

// Input types for lead operations
export interface CreateLeadInput {
  tenantId: string
  contactId: string
  propertyId?: string
  status: LeadStatus
  source: LeadSource
  score?: number
  message?: string
  metadata?: any
}

export interface UpdateLeadInput {
  status?: LeadStatus
  score?: number
  message?: string
  metadata?: any
}

// Input types for relationship operations
export interface CreateRelationshipInput {
  tenantId: string
  contactId: string
  propertyId: string
  relationship: string
  notes?: string
}

export interface UpdateRelationshipInput {
  relationship?: string
  notes?: string
  isActive?: boolean
}

// Validation helper functions
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function sanitizeString(input: string): string {
  return input.trim().split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ')
}

function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function sanitizePhone(phone: string): string {
  // Remove all non-numeric characters and format
  const cleaned = phone.replace(/\D/g, '')
  // Add country code if missing (assuming Netherlands +31)
  if (cleaned.length === 9 && cleaned.startsWith('6')) {
    return `+31${cleaned}`
  }
  if (cleaned.length === 11 && cleaned.startsWith('31')) {
    return `+${cleaned}`
  }
  return `+${cleaned}` // Return with + prefix
}

function calculateLeadScore(status: LeadStatus, source: LeadSource): number {
  let score = 0
  
  // Score based on status
  switch (status) {
    case 'new': score += 10; break
    case 'contacted': score += 25; break
    case 'qualified': score += 50; break
    case 'interested': score += 65; break
    case 'viewing_scheduled': score += 80; break
    case 'offer_made': score += 90; break
    case 'converted': score += 100; break
    case 'lost': score = 0; break
  }
  
  // Bonus based on source
  switch (source) {
    case 'referral': score += 20; break
    case 'website': score += 10; break
    case 'social_media': score += 5; break
    case 'email_campaign': score += 8; break
    case 'partner': score += 15; break
    case 'advertising': score += 5; break
    default: break
  }
  
  return Math.min(score, 100) // Cap at 100
}

export class ContactService {
  /**
   * Create a new contact with validation and sanitization
   */
  static async createContact(input: CreateContactInput): Promise<Contact> {
    // Validation
    if (!input.firstName?.trim()) {
      throw new Error('First name is required and cannot be empty')
    }
    if (!input.lastName?.trim()) {
      throw new Error('Last name is required and cannot be empty')
    }
    if (!input.email?.trim()) {
      throw new Error('Email is required and cannot be empty')
    }
    if (!validateEmail(input.email)) {
      throw new Error('Invalid email format')
    }

    // Sanitization
    const sanitizedData = {
      ...input,
      firstName: sanitizeString(input.firstName),
      lastName: sanitizeString(input.lastName),
      email: sanitizeEmail(input.email),
      phone: input.phone ? sanitizePhone(input.phone) : undefined,
      preferredLanguage: input.preferredLanguage || 'en',
      tags: input.tags || [],
    }

    try {
      const result = await db.insert(contacts).values(sanitizedData).returning()
      return result[0]
    } catch (error: any) {
      if (error.message.includes('unique') || error.message.includes('duplicate')) {
        throw new Error('A contact with this email already exists for this tenant')
      }
      throw error
    }
  }

  /**
   * Get contact by ID with tenant verification
   */
  static async getContactById(contactId: string, tenantId: string): Promise<Contact | null> {
    const result = await db
      .select()
      .from(contacts)
      .where(and(
        eq(contacts.id, contactId),
        eq(contacts.tenantId, tenantId)
      ))

    return result[0] || null
  }

  /**
   * Update contact information
   */
  static async updateContact(
    contactId: string,
    tenantId: string,
    input: UpdateContactInput
  ): Promise<Contact | null> {
    // Sanitize update data if provided
    const sanitizedData: any = {}
    
    if (input.firstName !== undefined) {
      if (!input.firstName?.trim()) {
        throw new Error('First name cannot be empty')
      }
      sanitizedData.firstName = sanitizeString(input.firstName)
    }
    
    if (input.lastName !== undefined) {
      if (!input.lastName?.trim()) {
        throw new Error('Last name cannot be empty')
      }
      sanitizedData.lastName = sanitizeString(input.lastName)
    }
    
    if (input.email !== undefined) {
      if (!validateEmail(input.email)) {
        throw new Error('Invalid email format')
      }
      sanitizedData.email = sanitizeEmail(input.email)
    }
    
    if (input.phone !== undefined) {
      sanitizedData.phone = input.phone ? sanitizePhone(input.phone) : null
    }
    
    // Copy other fields directly
    Object.keys(input).forEach(key => {
      if (!['firstName', 'lastName', 'email', 'phone'].includes(key)) {
        sanitizedData[key] = (input as any)[key]
      }
    })

    // Add update timestamp
    sanitizedData.updatedAt = new Date()

    const result = await db
      .update(contacts)
      .set(sanitizedData)
      .where(and(
        eq(contacts.id, contactId),
        eq(contacts.tenantId, tenantId)
      ))
      .returning()

    return result[0] || null
  }

  /**
   * Delete a contact
   */
  static async deleteContact(contactId: string, tenantId: string): Promise<boolean> {
    const result = await db
      .delete(contacts)
      .where(and(
        eq(contacts.id, contactId),
        eq(contacts.tenantId, tenantId)
      ))
      .returning()

    return result.length > 0
  }

  /**
   * Get all contacts for a tenant
   */
  static async getContactsByTenant(tenantId: string): Promise<Contact[]> {
    return await db
      .select()
      .from(contacts)
      .where(eq(contacts.tenantId, tenantId))
  }

  /**
   * Filter contacts by type
   */
  static async getContactsByType(tenantId: string, type: ContactType): Promise<Contact[]> {
    return await db
      .select()
      .from(contacts)
      .where(and(
        eq(contacts.tenantId, tenantId),
        eq(contacts.type, type)
      ))
  }

  /**
   * Search contacts by name
   */
  static async searchContactsByName(tenantId: string, searchTerm: string): Promise<Contact[]> {
    const searchPattern = `%${searchTerm}%`
    
    return await db
      .select()
      .from(contacts)
      .where(and(
        eq(contacts.tenantId, tenantId),
        or(
          ilike(contacts.firstName, searchPattern),
          ilike(contacts.lastName, searchPattern)
        )
      ))
  }

  /**
   * Filter contacts by budget range
   */
  static async getContactsByBudgetRange(
    tenantId: string,
    minBudget: number,
    maxBudget: number
  ): Promise<Contact[]> {
    return await db
      .select()
      .from(contacts)
      .where(and(
        eq(contacts.tenantId, tenantId),
        gte(contacts.budget, minBudget),
        lte(contacts.budget, maxBudget)
      ))
  }

  /**
   * Search contacts by email
   */
  static async searchContactsByEmail(tenantId: string, emailSearch: string): Promise<Contact[]> {
    const searchPattern = `%${emailSearch}%`
    
    return await db
      .select()
      .from(contacts)
      .where(and(
        eq(contacts.tenantId, tenantId),
        ilike(contacts.email, searchPattern)
      ))
  }

  // ===== INTEGRATION METHODS =====

  /**
   * Get contact activity history
   */
  static async getContactActivityHistory(contactId: string, tenantId: string): Promise<any> {
    const contactLeads = await db
      .select()
      .from(leads)
      .where(and(
        eq(leads.contactId, contactId),
        eq(leads.tenantId, tenantId)
      ))

    const relationships = await db
      .select()
      .from(contactPropertyRelationships)
      .where(and(
        eq(contactPropertyRelationships.contactId, contactId),
        eq(contactPropertyRelationships.tenantId, tenantId)
      ))

    const propertiesViewed = new Set(contactLeads.map(l => l.propertyId).filter(Boolean)).size
    const totalLeads = contactLeads.length

    const recentActivity = [
      ...contactLeads.map(lead => ({
        type: 'lead',
        timestamp: lead.createdAt!,
        propertyId: lead.propertyId,
        details: { status: lead.status, source: lead.source, score: lead.score },
      })),
      ...relationships.map(rel => ({
        type: 'relationship',
        timestamp: rel.createdAt!,
        propertyId: rel.propertyId,
        details: { relationship: rel.relationship, notes: rel.notes },
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return {
      totalLeads,
      propertiesViewed,
      recentActivity: recentActivity.slice(0, 10), // Last 10 activities
      averageResponseTime: 24, // Simplified - would calculate actual response times
    }
  }

  /**
   * Get contacts matching property criteria
   */
  static async getContactsMatchingProperty(propertyId: string, tenantId: string): Promise<Contact[]> {
    // Get property details
    const propertyResult = await db
      .select()
      .from(properties)
      .where(and(
        eq(properties.id, propertyId),
        eq(properties.tenantId, tenantId)
      ))

    if (!propertyResult[0]) return []

    const property = propertyResult[0]

    // Find contacts that match property criteria
    return await db
      .select()
      .from(contacts)
      .where(and(
        eq(contacts.tenantId, tenantId),
        eq(contacts.type, 'buyer'),
        gte(contacts.budget, property.price) // Budget >= property price
      ))
  }

  /**
   * Get property recommendations for contact
   */
  static async getPropertyRecommendations(
    contactId: string,
    tenantId: string,
    options: { limit?: number } = {}
  ): Promise<any[]> {
    const contact = await this.getContactById(contactId, tenantId)
    if (!contact) return []

    // Get properties matching contact budget
    const matchingProperties = await db
      .select()
      .from(properties)
      .where(and(
        eq(properties.tenantId, tenantId),
        eq(properties.status, 'active'),
        contact.budget ? lte(properties.price, contact.budget) : undefined
      ))
      .limit(options.limit || 10)

    // Calculate match scores (simplified)
    return matchingProperties.map(property => ({
      property,
      matchScore: this.calculateMatchScore(contact, property),
      reasons: this.getMatchReasons(contact, property),
    }))
  }

  /**
   * Calculate property compatibility score for contact
   */
  static async calculatePropertyCompatibility(
    contactId: string,
    propertyId: string,
    tenantId: string
  ): Promise<any> {
    const contact = await this.getContactById(contactId, tenantId)
    const property = await db
      .select()
      .from(properties)
      .where(and(
        eq(properties.id, propertyId),
        eq(properties.tenantId, tenantId)
      ))

    if (!contact || !property[0]) return null

    const prop = property[0]
    
    // Calculate compatibility factors
    const budgetMatch = contact.budget 
      ? Math.max(0, 100 - Math.abs((contact.budget - prop.price) / contact.budget * 100))
      : 50

    const typeMatch = contact.type === 'buyer' ? 100 : 0
    const locationScore = 75 // Simplified - would use actual location matching

    const totalScore = (budgetMatch + typeMatch + locationScore) / 3

    return {
      totalScore: Math.round(totalScore),
      factors: {
        budgetMatch: Math.round(budgetMatch),
        typeMatch,
        locationScore,
      },
    }
  }

  /**
   * Get contact activity timeline
   */
  static async getContactActivityTimeline(contactId: string, tenantId: string): Promise<any[]> {
    const contactLeads = await db
      .select()
      .from(leads)
      .where(and(
        eq(leads.contactId, contactId),
        eq(leads.tenantId, tenantId)
      ))

    const relationships = await db
      .select()
      .from(contactPropertyRelationships)
      .where(and(
        eq(contactPropertyRelationships.contactId, contactId),
        eq(contactPropertyRelationships.tenantId, tenantId)
      ))

    const activities = [
      ...contactLeads.map(lead => ({
        type: 'lead_created',
        timestamp: lead.createdAt!,
        propertyId: lead.propertyId,
        details: { status: lead.status, source: lead.source, score: lead.score },
      })),
      ...relationships.map(rel => ({
        type: 'relationship_created',
        timestamp: rel.createdAt!,
        propertyId: rel.propertyId,
        details: { relationship: rel.relationship, notes: rel.notes },
      })),
    ]

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  /**
   * Get contact engagement report
   */
  static async getContactEngagementReport(
    contactId: string,
    tenantId: string,
    options: { startDate?: Date; endDate?: Date } = {}
  ): Promise<any> {
    const contact = await this.getContactById(contactId, tenantId)
    if (!contact) return null

    const activityHistory = await this.getContactActivityHistory(contactId, tenantId)
    
    return {
      contact,
      metrics: {
        totalLeads: activityHistory.totalLeads,
        propertiesViewed: activityHistory.propertiesViewed,
        averageScore: 75, // Simplified
      },
      activitySummary: activityHistory.recentActivity,
      reportPeriod: {
        startDate: options.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: options.endDate || new Date(),
      },
    }
  }

  // Helper methods
  private static calculateMatchScore(contact: Contact, property: Property): number {
    let score = 50 // Base score

    if (contact.budget && property.price <= contact.budget) {
      score += 30
    }

    if (contact.type === 'buyer') {
      score += 20
    }

    return Math.min(score, 100)
  }

  private static getMatchReasons(contact: Contact, property: Property): string[] {
    const reasons = []

    if (contact.budget && property.price <= contact.budget) {
      reasons.push('Within budget')
    }

    if (contact.type === 'buyer') {
      reasons.push('Contact is a buyer')
    }

    return reasons
  }
}

export class LeadService {
  /**
   * Create a new lead
   */
  static async createLead(input: CreateLeadInput): Promise<Lead> {
    // Calculate score if not provided
    const score = input.score ?? calculateLeadScore(input.status, input.source)

    const leadData = {
      ...input,
      score,
      metadata: input.metadata || {},
    }

    const result = await db.insert(leads).values(leadData).returning()
    return result[0]
  }

  /**
   * Get lead by ID with tenant verification
   */
  static async getLeadById(leadId: string, tenantId: string): Promise<Lead | null> {
    const result = await db
      .select()
      .from(leads)
      .where(and(
        eq(leads.id, leadId),
        eq(leads.tenantId, tenantId)
      ))

    return result[0] || null
  }

  /**
   * Update lead information
   */
  static async updateLead(
    leadId: string,
    tenantId: string,
    input: UpdateLeadInput
  ): Promise<Lead | null> {
    const updateData = {
      ...input,
      updatedAt: new Date(),
    }

    const result = await db
      .update(leads)
      .set(updateData)
      .where(and(
        eq(leads.id, leadId),
        eq(leads.tenantId, tenantId)
      ))
      .returning()

    return result[0] || null
  }

  /**
   * Delete a lead
   */
  static async deleteLead(leadId: string, tenantId: string): Promise<boolean> {
    const result = await db
      .delete(leads)
      .where(and(
        eq(leads.id, leadId),
        eq(leads.tenantId, tenantId)
      ))
      .returning()

    return result.length > 0
  }

  /**
   * Get leads by contact
   */
  static async getLeadsByContact(contactId: string, tenantId: string): Promise<Lead[]> {
    return await db
      .select()
      .from(leads)
      .where(and(
        eq(leads.contactId, contactId),
        eq(leads.tenantId, tenantId)
      ))
  }

  /**
   * Get leads by property
   */
  static async getLeadsByProperty(propertyId: string, tenantId: string): Promise<Lead[]> {
    return await db
      .select()
      .from(leads)
      .where(and(
        eq(leads.propertyId, propertyId),
        eq(leads.tenantId, tenantId)
      ))
  }

  /**
   * Filter leads by status
   */
  static async getLeadsByStatus(tenantId: string, status: LeadStatus): Promise<Lead[]> {
    return await db
      .select()
      .from(leads)
      .where(and(
        eq(leads.tenantId, tenantId),
        eq(leads.status, status)
      ))
  }
}

export class ContactPropertyRelationshipService {
  /**
   * Create a contact-property relationship
   */
  static async createRelationship(input: CreateRelationshipInput): Promise<ContactPropertyRelationship> {
    const relationshipData = {
      ...input,
      isActive: true,
    }

    const result = await db.insert(contactPropertyRelationships).values(relationshipData).returning()
    return result[0]
  }

  /**
   * Get relationships by contact
   */
  static async getRelationshipsByContact(
    contactId: string,
    tenantId: string
  ): Promise<ContactPropertyRelationship[]> {
    return await db
      .select()
      .from(contactPropertyRelationships)
      .where(and(
        eq(contactPropertyRelationships.contactId, contactId),
        eq(contactPropertyRelationships.tenantId, tenantId)
      ))
  }

  /**
   * Get relationships by property
   */
  static async getRelationshipsByProperty(
    propertyId: string,
    tenantId: string
  ): Promise<ContactPropertyRelationship[]> {
    return await db
      .select()
      .from(contactPropertyRelationships)
      .where(and(
        eq(contactPropertyRelationships.propertyId, propertyId),
        eq(contactPropertyRelationships.tenantId, tenantId)
      ))
  }

  /**
   * Update relationship
   */
  static async updateRelationship(
    relationshipId: string,
    tenantId: string,
    input: UpdateRelationshipInput
  ): Promise<ContactPropertyRelationship | null> {
    const result = await db
      .update(contactPropertyRelationships)
      .set(input)
      .where(and(
        eq(contactPropertyRelationships.id, relationshipId),
        eq(contactPropertyRelationships.tenantId, tenantId)
      ))
      .returning()

    return result[0] || null
  }

  /**
   * Deactivate relationship
   */
  static async deactivateRelationship(
    relationshipId: string,
    tenantId: string
  ): Promise<ContactPropertyRelationship | null> {
    return await this.updateRelationship(relationshipId, tenantId, { isActive: false })
  }
}