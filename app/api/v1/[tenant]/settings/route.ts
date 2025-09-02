import { NextRequest, NextResponse } from 'next/server'
import { requireTenantAuth } from '@/lib/middleware/auth.middleware'
import { TenantService } from '@/lib/services/tenant.service'

// GET /api/v1/[tenant]/settings - Get tenant settings from database
export async function GET(request: NextRequest, { params }: { params: Promise<{ tenant: string }> }) {
  try {
    const { tenant: tenantSlug } = await params
    
    // For demo purposes, get tenant by slug
    const tenant = await TenantService.getTenantBySlug(tenantSlug)
    if (!tenant) {
      return NextResponse.json({
        success: false,
        error: 'Tenant not found'
      }, { status: 404 })
    }

    // Get real tenant settings from database
    const settings = await TenantService.getTenantSettings(tenant.id)
    
    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Error fetching tenant settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch tenant settings'
    }, { status: 500 })
  }
}

// PUT /api/v1/[tenant]/settings - Update tenant settings
export async function PUT(request: NextRequest, { params }: { params: Promise<{ tenant: string }> }) {
  try {
    const { tenant: tenantSlug } = await params
    
    // For demo purposes, get tenant by slug
    const tenant = await TenantService.getTenantBySlug(tenantSlug)
    if (!tenant) {
      return NextResponse.json({
        success: false,
        error: 'Tenant not found'
      }, { status: 404 })
    }

    const body = await request.json()
    
    // Validate Nederlandse business requirements
    const requiredFields = ['agencyName', 'contactEmail', 'contactPhone']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `${field} is verplicht voor Nederlandse makelaarspraktijk`
        }, { status: 400 })
      }
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contactEmail)) {
      return NextResponse.json({
        success: false,
        error: 'Ongeldig email adres'
      }, { status: 400 })
    }

    // Validate phone format (basic)
    if (!/^\+?[\d\s\-\(\)]+$/.test(body.contactPhone)) {
      return NextResponse.json({
        success: false,
        error: 'Ongeldig telefoonnummer format'
      }, { status: 400 })
    }

    // Save to real database
    const updatedSettings = await TenantService.updateTenantSettings(
      tenant.id,
      body,
      'demo-user' // For demo purposes
    )
    
    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: 'Agency instellingen succesvol bijgewerkt'
    })
  } catch (error) {
    console.error('Error updating tenant settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update tenant settings'
    }, { status: 500 })
  }
}