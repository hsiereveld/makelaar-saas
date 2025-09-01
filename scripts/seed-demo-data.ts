import { db } from '../lib/db'
import { TenantService, PropertyService } from '../lib/services'

async function seedDemoData() {
  try {
    console.log('Creating demo tenant...')
    
    // Check if demo tenant already exists
    let tenant = await TenantService.getTenantBySlug('demo-tenant')
    
    if (!tenant) {
      tenant = await TenantService.createTenant({
        slug: 'demo-tenant',
        name: 'Demo Tenant',
      })
      console.log('✓ Demo tenant created:', tenant.slug)
    } else {
      console.log('✓ Demo tenant already exists:', tenant.slug)
    }

    // Check if demo properties exist
    const existingProperties = await PropertyService.getPropertiesByTenant(tenant.id)
    
    if (existingProperties.length === 0) {
      console.log('Creating demo properties...')
      
      await PropertyService.createProperty({
        tenantId: tenant.id,
        title: 'Modern Apartment Amsterdam',
        slug: 'modern-apartment-amsterdam',
        address: '123 Canal Street',
        city: 'Amsterdam',
        price: 450000,
        bedrooms: 2,
        bathrooms: 1,
        livingArea: 85,
        status: 'active',
      })

      await PropertyService.createProperty({
        tenantId: tenant.id,
        title: 'Family House Utrecht',
        slug: 'family-house-utrecht',
        address: '456 Family Lane',
        city: 'Utrecht',
        price: 650000,
        bedrooms: 4,
        bathrooms: 2,
        livingArea: 150,
        status: 'active',
      })

      console.log('✓ Demo properties created')
    } else {
      console.log('✓ Demo properties already exist:', existingProperties.length)
    }

    console.log('✓ Demo data seeding complete!')
    
  } catch (error) {
    console.error('Error seeding demo data:', error)
  }
}

seedDemoData()