import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { TenantService, PropertyService } from '@/lib/services'
import { db } from '@/lib/db'
import { tenants, properties } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

describe('API Routes Integration Tests', () => {
  let testTenantId: string
  let testPropertyIds: string[] = []

  beforeAll(async () => {
    // Get or create test tenant for API testing
    let tenant = await TenantService.getTenantBySlug('demo-tenant')
    
    if (!tenant) {
      tenant = await TenantService.createTenant({
        slug: 'demo-tenant',
        name: 'Demo Tenant',
      })
    }
    
    testTenantId = tenant.id

    // Create some test properties
    const property1 = await PropertyService.createProperty({
      tenantId: testTenantId,
      title: 'Modern Apartment Amsterdam',
      slug: 'modern-apartment-amsterdam',
      address: '123 Test Street',
      city: 'Amsterdam',
      price: 450000,
      bedrooms: 2,
      status: 'active',
    })

    const property2 = await PropertyService.createProperty({
      tenantId: testTenantId,
      title: 'Family House Utrecht',
      slug: 'family-house-utrecht',
      address: '456 Family Lane',
      city: 'Utrecht',
      price: 650000,
      bedrooms: 4,
      status: 'active',
    })

    testPropertyIds = [property1.id, property2.id]
  })

  afterAll(async () => {
    // Clean up test properties only (leave demo tenant for other tests/usage)
    for (const id of testPropertyIds) {
      await db.delete(properties).where(eq(properties.id, id))
    }
  })

  it('should create demo tenant and properties for API testing', async () => {
    // Verify the tenant was created
    const tenant = await TenantService.getTenantBySlug('demo-tenant')
    expect(tenant).toBeTruthy()
    expect(tenant?.name).toBe('Demo Tenant')

    // Verify properties exist and include our test properties
    const properties = await PropertyService.getPropertiesByTenant(testTenantId)
    expect(properties.length).toBeGreaterThanOrEqual(2)
    
    const propertyTitles = properties.map(p => p.title)
    expect(propertyTitles).toContain('Modern Apartment Amsterdam')
    expect(propertyTitles).toContain('Family House Utrecht')
  })

  it('should simulate API GET request for properties', async () => {
    // This simulates what the API route does
    const tenantSlug = 'demo-tenant'
    
    // Verify tenant exists (like in API route)
    const tenant = await TenantService.getTenantBySlug(tenantSlug)
    expect(tenant).toBeTruthy()

    // Get properties (like in API route)
    const properties = await PropertyService.getPropertiesByTenantSlug(tenantSlug)
    expect(properties.length).toBeGreaterThanOrEqual(2)
    expect(properties.every(p => p.tenantId === testTenantId)).toBe(true)
  })

  it('should simulate API POST request for creating property', async () => {
    // This simulates what the API route does
    const tenantSlug = 'demo-tenant'
    const requestData = {
      title: 'New Test Property',
      address: '789 New Street',
      city: 'Rotterdam',
      price: 550000,
      bedrooms: 3,
      bathrooms: 2,
    }

    // Verify tenant exists (like in API route)
    const tenant = await TenantService.getTenantBySlug(tenantSlug)
    expect(tenant).toBeTruthy()

    // Generate slug (like in API route)
    const slug = requestData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

    // Create property (like in API route)
    const property = await PropertyService.createProperty({
      tenantId: tenant!.id,
      title: requestData.title,
      slug,
      address: requestData.address,
      city: requestData.city,
      price: requestData.price,
      bedrooms: requestData.bedrooms,
      bathrooms: requestData.bathrooms,
      status: 'draft',
    })

    expect(property.title).toBe(requestData.title)
    expect(property.city).toBe(requestData.city)
    expect(property.price).toBe(requestData.price)
    expect(property.slug).toBe('new-test-property')

    // Add to cleanup list
    testPropertyIds.push(property.id)
  })

  it('should handle non-existent tenant gracefully', async () => {
    const tenant = await TenantService.getTenantBySlug('non-existent-tenant')
    expect(tenant).toBeNull()
  })
})