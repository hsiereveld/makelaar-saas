import { db } from '@/lib/db'
import { properties, tenants } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import type { Property, Tenant } from '@/lib/types/database'

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
}