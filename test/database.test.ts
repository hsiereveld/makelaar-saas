import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '@/lib/db'
import { properties, tenants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

describe('Database Connection and Property Queries', () => {
  let testTenantId: string
  let testPropertyId: string

  beforeAll(async () => {
    // Create a test tenant
    const testTenant = await db.insert(tenants).values({
      slug: 'test-tenant',
      name: 'Test Tenant',
    }).returning()
    
    testTenantId = testTenant[0].id
  })

  afterAll(async () => {
    // Clean up test data
    if (testPropertyId) {
      await db.delete(properties).where(eq(properties.id, testPropertyId))
    }
    if (testTenantId) {
      await db.delete(tenants).where(eq(tenants.id, testTenantId))
    }
  })

  it('should connect to database successfully', async () => {
    // Test basic database connection
    const result = await db.select().from(tenants).limit(1)
    expect(Array.isArray(result)).toBe(true)
  })

  it('should create a property with all required fields', async () => {
    const propertyData = {
      tenantId: testTenantId,
      title: 'Test Property',
      slug: 'test-property',
      address: '123 Test Street',
      city: 'Test City',
      price: 500000,
      bedrooms: 3,
      bathrooms: 2,
      livingArea: 120,
      status: 'draft' as const,
    }

    const result = await db.insert(properties).values(propertyData).returning()
    testPropertyId = result[0].id

    expect(result).toHaveLength(1)
    expect(result[0].title).toBe(propertyData.title)
    expect(result[0].tenantId).toBe(testTenantId)
    expect(result[0].price).toBe(propertyData.price)
  })

  it('should retrieve properties by tenant', async () => {
    const result = await db
      .select()
      .from(properties)
      .where(eq(properties.tenantId, testTenantId))

    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].tenantId).toBe(testTenantId)
  })

  it('should update a property', async () => {
    const updatedTitle = 'Updated Test Property'
    
    await db
      .update(properties)
      .set({ title: updatedTitle })
      .where(eq(properties.id, testPropertyId))

    const result = await db
      .select()
      .from(properties)
      .where(eq(properties.id, testPropertyId))

    expect(result[0].title).toBe(updatedTitle)
  })

  it('should delete a property', async () => {
    await db
      .delete(properties)
      .where(eq(properties.id, testPropertyId))

    const result = await db
      .select()
      .from(properties)
      .where(eq(properties.id, testPropertyId))

    expect(result).toHaveLength(0)
    testPropertyId = '' // Clear the ID since we've deleted it
  })

  it('should enforce tenant isolation', async () => {
    // Create another tenant
    const anotherTenant = await db.insert(tenants).values({
      slug: 'another-tenant',
      name: 'Another Tenant',
    }).returning()

    const anotherTenantId = anotherTenant[0].id

    // Create properties for both tenants
    const property1 = await db.insert(properties).values({
      tenantId: testTenantId,
      title: 'Tenant 1 Property',
      slug: 'tenant-1-property',
      address: '123 Tenant 1 Street',
      city: 'City 1',
      price: 400000,
    }).returning()

    const property2 = await db.insert(properties).values({
      tenantId: anotherTenantId,
      title: 'Tenant 2 Property',
      slug: 'tenant-2-property',
      address: '123 Tenant 2 Street',
      city: 'City 2',
      price: 600000,
    }).returning()

    // Query properties for tenant 1 only
    const tenant1Properties = await db
      .select()
      .from(properties)
      .where(eq(properties.tenantId, testTenantId))

    // Should only return tenant 1's property
    expect(tenant1Properties).toHaveLength(1)
    expect(tenant1Properties[0].title).toBe('Tenant 1 Property')

    // Clean up
    await db.delete(properties).where(eq(properties.id, property1[0].id))
    await db.delete(properties).where(eq(properties.id, property2[0].id))
    await db.delete(tenants).where(eq(tenants.id, anotherTenantId))
  })
})