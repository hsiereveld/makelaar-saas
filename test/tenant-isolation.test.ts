import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { TenantService, PropertyService } from '@/lib/services'
import { db } from '@/lib/db'
import { tenants, properties } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

describe('Multi-Tenant Data Isolation Tests', () => {
  let tenant1Id: string
  let tenant2Id: string
  let property1Ids: string[] = []
  let property2Ids: string[] = []

  beforeAll(async () => {
    // Create two separate test tenants
    const tenant1 = await TenantService.createTenant({
      slug: 'isolation-tenant-1',
      name: 'Isolation Test Tenant 1',
    })
    tenant1Id = tenant1.id

    const tenant2 = await TenantService.createTenant({
      slug: 'isolation-tenant-2', 
      name: 'Isolation Test Tenant 2',
    })
    tenant2Id = tenant2.id

    // Create properties for tenant 1
    const t1p1 = await PropertyService.createProperty({
      tenantId: tenant1Id,
      title: 'Tenant 1 Property A',
      slug: 'tenant-1-property-a',
      address: '123 Tenant 1 Street',
      city: 'Amsterdam',
      price: 500000,
      bedrooms: 2,
      status: 'active',
    })

    const t1p2 = await PropertyService.createProperty({
      tenantId: tenant1Id,
      title: 'Tenant 1 Property B',
      slug: 'tenant-1-property-b',
      address: '456 Tenant 1 Avenue',
      city: 'Utrecht',
      price: 600000,
      bedrooms: 3,
      status: 'draft',
    })

    property1Ids = [t1p1.id, t1p2.id]

    // Create properties for tenant 2
    const t2p1 = await PropertyService.createProperty({
      tenantId: tenant2Id,
      title: 'Tenant 2 Property X',
      slug: 'tenant-2-property-x',
      address: '789 Tenant 2 Road',
      city: 'Rotterdam',
      price: 750000,
      bedrooms: 4,
      status: 'active',
    })

    const t2p2 = await PropertyService.createProperty({
      tenantId: tenant2Id,
      title: 'Tenant 2 Property Y',
      slug: 'tenant-2-property-y',
      address: '012 Tenant 2 Lane',
      city: 'The Hague',
      price: 800000,
      bedrooms: 5,
      status: 'under_offer',
    })

    property2Ids = [t2p1.id, t2p2.id]
  })

  afterAll(async () => {
    // Clean up test data
    for (const id of [...property1Ids, ...property2Ids]) {
      await db.delete(properties).where(eq(properties.id, id))
    }
    
    if (tenant1Id) {
      await db.delete(tenants).where(eq(tenants.id, tenant1Id))
    }
    if (tenant2Id) {
      await db.delete(tenants).where(eq(tenants.id, tenant2Id))
    }
  })

  describe('Tenant Isolation - Basic Queries', () => {
    it('should only return properties for the specific tenant by ID', async () => {
      const tenant1Properties = await PropertyService.getPropertiesByTenant(tenant1Id)
      const tenant2Properties = await PropertyService.getPropertiesByTenant(tenant2Id)

      // Each tenant should only see their own properties
      expect(tenant1Properties).toHaveLength(2)
      expect(tenant2Properties).toHaveLength(2)

      // Verify tenant 1 properties
      expect(tenant1Properties.every(p => p.tenantId === tenant1Id)).toBe(true)
      expect(tenant1Properties.map(p => p.title)).toContain('Tenant 1 Property A')
      expect(tenant1Properties.map(p => p.title)).toContain('Tenant 1 Property B')

      // Verify tenant 2 properties
      expect(tenant2Properties.every(p => p.tenantId === tenant2Id)).toBe(true)
      expect(tenant2Properties.map(p => p.title)).toContain('Tenant 2 Property X')
      expect(tenant2Properties.map(p => p.title)).toContain('Tenant 2 Property Y')
    })

    it('should only return properties for the specific tenant by slug', async () => {
      const tenant1Properties = await PropertyService.getPropertiesByTenantSlug('isolation-tenant-1')
      const tenant2Properties = await PropertyService.getPropertiesByTenantSlug('isolation-tenant-2')

      expect(tenant1Properties).toHaveLength(2)
      expect(tenant2Properties).toHaveLength(2)

      // Verify no cross-contamination
      const tenant1Titles = tenant1Properties.map(p => p.title)
      const tenant2Titles = tenant2Properties.map(p => p.title)

      expect(tenant1Titles).not.toContain('Tenant 2 Property X')
      expect(tenant1Titles).not.toContain('Tenant 2 Property Y')
      expect(tenant2Titles).not.toContain('Tenant 1 Property A')
      expect(tenant2Titles).not.toContain('Tenant 1 Property B')
    })
  })

  describe('Tenant Isolation - CRUD Operations', () => {
    it('should not allow cross-tenant property access by ID', async () => {
      const tenant1PropertyId = property1Ids[0]
      const tenant2PropertyId = property2Ids[0]

      // Try to access tenant 1's property with tenant 2's ID - should fail
      const crossAccess1 = await PropertyService.getPropertyById(tenant1PropertyId, tenant2Id)
      expect(crossAccess1).toBeNull()

      // Try to access tenant 2's property with tenant 1's ID - should fail  
      const crossAccess2 = await PropertyService.getPropertyById(tenant2PropertyId, tenant1Id)
      expect(crossAccess2).toBeNull()

      // But correct tenant access should work
      const correctAccess1 = await PropertyService.getPropertyById(tenant1PropertyId, tenant1Id)
      const correctAccess2 = await PropertyService.getPropertyById(tenant2PropertyId, tenant2Id)
      expect(correctAccess1).toBeTruthy()
      expect(correctAccess2).toBeTruthy()
    })

    it('should not allow cross-tenant property updates', async () => {
      const tenant1PropertyId = property1Ids[0]
      
      // Try to update tenant 1's property using tenant 2's ID - should fail
      const updateResult = await PropertyService.updateProperty(
        tenant1PropertyId, 
        tenant2Id, 
        { title: 'Hacked Title' }
      )
      
      expect(updateResult).toBeNull()

      // Verify the property wasn't actually updated
      const originalProperty = await PropertyService.getPropertyById(tenant1PropertyId, tenant1Id)
      expect(originalProperty?.title).toBe('Tenant 1 Property A')
    })

    it('should not allow cross-tenant property deletion', async () => {
      const tenant1PropertyId = property1Ids[1] // Use second property for deletion test
      
      // Try to delete tenant 1's property using tenant 2's ID - should fail
      const deleteResult = await PropertyService.deleteProperty(tenant1PropertyId, tenant2Id)
      
      expect(deleteResult).toBe(false)

      // Verify the property still exists
      const stillExists = await PropertyService.getPropertyById(tenant1PropertyId, tenant1Id)
      expect(stillExists).toBeTruthy()
    })
  })

  describe('Tenant Isolation - Filtering Operations', () => {
    it('should isolate properties by status per tenant', async () => {
      const tenant1Active = await PropertyService.getPropertiesByStatus(tenant1Id, 'active')
      const tenant1Draft = await PropertyService.getPropertiesByStatus(tenant1Id, 'draft')
      const tenant2Active = await PropertyService.getPropertiesByStatus(tenant2Id, 'active')
      const tenant2UnderOffer = await PropertyService.getPropertiesByStatus(tenant2Id, 'under_offer')

      // Check tenant 1 status filtering
      expect(tenant1Active).toHaveLength(1)
      expect(tenant1Active[0].title).toBe('Tenant 1 Property A')
      expect(tenant1Draft).toHaveLength(1)
      expect(tenant1Draft[0].title).toBe('Tenant 1 Property B')

      // Check tenant 2 status filtering
      expect(tenant2Active).toHaveLength(1)
      expect(tenant2Active[0].title).toBe('Tenant 2 Property X')
      expect(tenant2UnderOffer).toHaveLength(1)
      expect(tenant2UnderOffer[0].title).toBe('Tenant 2 Property Y')

      // Verify no cross-tenant leakage in status queries
      expect(tenant1Active[0].tenantId).toBe(tenant1Id)
      expect(tenant1Draft[0].tenantId).toBe(tenant1Id)
      expect(tenant2Active[0].tenantId).toBe(tenant2Id)
      expect(tenant2UnderOffer[0].tenantId).toBe(tenant2Id)
    })

    it('should isolate properties by city per tenant', async () => {
      const tenant1Amsterdam = await PropertyService.getPropertiesByCity(tenant1Id, 'Amsterdam')
      const tenant1Utrecht = await PropertyService.getPropertiesByCity(tenant1Id, 'Utrecht')
      const tenant2Rotterdam = await PropertyService.getPropertiesByCity(tenant2Id, 'Rotterdam')
      const tenant2TheHague = await PropertyService.getPropertiesByCity(tenant2Id, 'The Hague')

      // Verify city filtering works and respects tenant boundaries
      expect(tenant1Amsterdam).toHaveLength(1)
      expect(tenant1Amsterdam[0].city).toBe('Amsterdam')
      expect(tenant1Amsterdam[0].tenantId).toBe(tenant1Id)

      expect(tenant1Utrecht).toHaveLength(1)
      expect(tenant1Utrecht[0].city).toBe('Utrecht')
      expect(tenant1Utrecht[0].tenantId).toBe(tenant1Id)

      expect(tenant2Rotterdam).toHaveLength(1)
      expect(tenant2Rotterdam[0].city).toBe('Rotterdam')
      expect(tenant2Rotterdam[0].tenantId).toBe(tenant2Id)

      expect(tenant2TheHague).toHaveLength(1)
      expect(tenant2TheHague[0].city).toBe('The Hague')
      expect(tenant2TheHague[0].tenantId).toBe(tenant2Id)

      // Cross-city queries should return empty for other tenants
      const tenant1Rotterdam = await PropertyService.getPropertiesByCity(tenant1Id, 'Rotterdam')
      const tenant2Amsterdam = await PropertyService.getPropertiesByCity(tenant2Id, 'Amsterdam')
      expect(tenant1Rotterdam).toHaveLength(0)
      expect(tenant2Amsterdam).toHaveLength(0)
    })
  })

  describe('Tenant Isolation - Edge Cases', () => {
    it('should handle non-existent tenant IDs gracefully', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      
      const properties = await PropertyService.getPropertiesByTenant(fakeId)
      const property = await PropertyService.getPropertyById(property1Ids[0], fakeId)
      const statusProperties = await PropertyService.getPropertiesByStatus(fakeId, 'active')
      const cityProperties = await PropertyService.getPropertiesByCity(fakeId, 'Amsterdam')

      expect(properties).toHaveLength(0)
      expect(property).toBeNull()
      expect(statusProperties).toHaveLength(0)
      expect(cityProperties).toHaveLength(0)
    })

    it('should maintain isolation even with identical property data', async () => {
      // Create identical properties in both tenants
      const identicalData = {
        title: 'Identical Property',
        slug: 'identical-property',
        address: '999 Same Street',
        city: 'Same City',
        price: 999000,
        bedrooms: 3,
        status: 'active' as const,
      }

      const t1Identical = await PropertyService.createProperty({
        ...identicalData,
        tenantId: tenant1Id,
      })

      const t2Identical = await PropertyService.createProperty({
        ...identicalData,
        tenantId: tenant2Id,
      })

      // Even with identical data, they should be isolated
      const t1Properties = await PropertyService.getPropertiesByCity(tenant1Id, 'Same City')
      const t2Properties = await PropertyService.getPropertiesByCity(tenant2Id, 'Same City')

      expect(t1Properties).toHaveLength(1)
      expect(t2Properties).toHaveLength(1)
      expect(t1Properties[0].id).not.toBe(t2Properties[0].id)
      expect(t1Properties[0].tenantId).toBe(tenant1Id)
      expect(t2Properties[0].tenantId).toBe(tenant2Id)

      // Clean up
      property1Ids.push(t1Identical.id)
      property2Ids.push(t2Identical.id)
    })
  })
})