import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PropertyService, TenantService } from '@/lib/services'
import { db } from '@/lib/db'
import { properties, tenants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

describe('Service Layer Tests', () => {
  let testTenantId: string
  let testPropertyId: string

  beforeAll(async () => {
    // Create a test tenant
    const tenant = await TenantService.createTenant({
      slug: 'service-test-tenant',
      name: 'Service Test Tenant',
    })
    testTenantId = tenant.id
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

  describe('TenantService', () => {
    it('should create and retrieve tenant by slug', async () => {
      const tenant = await TenantService.getTenantBySlug('service-test-tenant')
      
      expect(tenant).toBeTruthy()
      expect(tenant?.slug).toBe('service-test-tenant')
      expect(tenant?.name).toBe('Service Test Tenant')
    })

    it('should check slug availability', async () => {
      const isAvailable = await TenantService.isSlugAvailable('service-test-tenant')
      const isNewSlugAvailable = await TenantService.isSlugAvailable('new-unique-slug')
      
      expect(isAvailable).toBe(false)
      expect(isNewSlugAvailable).toBe(true)
    })
  })

  describe('PropertyService', () => {
    it('should create a property using service', async () => {
      const propertyInput = {
        tenantId: testTenantId,
        title: 'Service Test Property',
        slug: 'service-test-property',
        address: '123 Service Street',
        city: 'Service City',
        price: 750000,
        bedrooms: 3,
        bathrooms: 2,
        livingArea: 150,
        status: 'draft' as const,
      }

      const property = await PropertyService.createProperty(propertyInput)
      testPropertyId = property.id

      expect(property.title).toBe(propertyInput.title)
      expect(property.tenantId).toBe(testTenantId)
      expect(property.price).toBe(propertyInput.price)
      expect(property.status).toBe('draft')
    })

    it('should retrieve properties by tenant', async () => {
      const properties = await PropertyService.getPropertiesByTenant(testTenantId)
      
      expect(properties).toHaveLength(1)
      expect(properties[0].tenantId).toBe(testTenantId)
    })

    it('should retrieve properties by tenant slug', async () => {
      const properties = await PropertyService.getPropertiesByTenantSlug('service-test-tenant')
      
      expect(properties).toHaveLength(1)
      expect(properties[0].title).toBe('Service Test Property')
    })

    it('should get property by ID and tenant', async () => {
      const property = await PropertyService.getPropertyById(testPropertyId, testTenantId)
      
      expect(property).toBeTruthy()
      expect(property?.id).toBe(testPropertyId)
      expect(property?.title).toBe('Service Test Property')
    })

    it('should update property', async () => {
      const updatedProperty = await PropertyService.updateProperty(
        testPropertyId,
        testTenantId,
        { title: 'Updated Service Test Property', price: 800000 }
      )
      
      expect(updatedProperty).toBeTruthy()
      expect(updatedProperty?.title).toBe('Updated Service Test Property')
      expect(updatedProperty?.price).toBe(800000)
    })

    it('should get properties by status', async () => {
      const draftProperties = await PropertyService.getPropertiesByStatus(testTenantId, 'draft')
      
      expect(draftProperties).toHaveLength(1)
      expect(draftProperties[0].status).toBe('draft')
    })

    it('should get properties by city', async () => {
      const cityProperties = await PropertyService.getPropertiesByCity(testTenantId, 'Service City')
      
      expect(cityProperties).toHaveLength(1)
      expect(cityProperties[0].city).toBe('Service City')
    })

    it('should enforce tenant isolation in service methods', async () => {
      // Create another tenant
      const otherTenant = await TenantService.createTenant({
        slug: 'other-tenant',
        name: 'Other Tenant',
      })

      // Try to get the property with wrong tenant ID
      const property = await PropertyService.getPropertyById(testPropertyId, otherTenant.id)
      
      expect(property).toBeNull()

      // Clean up the other tenant
      await TenantService.deleteTenant(otherTenant.id)
    })

    it('should delete property', async () => {
      const deleted = await PropertyService.deleteProperty(testPropertyId, testTenantId)
      
      expect(deleted).toBe(true)

      // Verify it's actually deleted
      const property = await PropertyService.getPropertyById(testPropertyId, testTenantId)
      expect(property).toBeNull()
      
      testPropertyId = '' // Clear the ID since we've deleted it
    })
  })
})