import { db } from '@/lib/db'
import { tenants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
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
}