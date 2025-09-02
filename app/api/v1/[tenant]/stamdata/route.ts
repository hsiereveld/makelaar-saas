import { NextRequest, NextResponse } from 'next/server'
import { requireTenantAuth } from '@/lib/middleware/auth.middleware'
import { StamdataService } from '@/lib/services/stamdata.service'

// GET /api/v1/[tenant]/stamdata - Get all stamdata for tenant
export async function GET(request: NextRequest, { params }: { params: Promise<{ tenant: string }> }) {
  try {
    const { tenant: tenantSlug } = await params
    
    // For demo, skip auth and use tenant slug directly
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const activeOnly = url.searchParams.get('activeOnly') === 'true'
    
    if (category) {
      // Get specific category
      const items = await StamdataService.getStamdataByCategory(tenantSlug, category)
      
      return NextResponse.json({
        success: true,
        data: activeOnly ? items.filter(item => item.isActive) : items
      })
    } else {
      // Get all categories
      const allStamdata = await StamdataService.getTenantStamdata(tenantSlug)
      
      return NextResponse.json({
        success: true,
        data: allStamdata
      })
    }
  } catch (error) {
    console.error('Error fetching stamdata:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch stamdata'
    }, { status: 500 })
  }
}

// POST /api/v1/[tenant]/stamdata - Create new stamdata item
export async function POST(request: NextRequest, { params }: { params: Promise<{ tenant: string }> }) {
  try {
    const { tenant: tenantSlug } = await params
    const body = await request.json()
    
    // Validate required fields
    if (!body.category || !body.key || !body.label) {
      return NextResponse.json({
        success: false,
        error: 'Category, key en label zijn verplicht'
      }, { status: 400 })
    }

    // Validate key format
    if (!/^[a-z0-9_]+$/.test(body.key)) {
      return NextResponse.json({
        success: false,
        error: 'Key mag alleen lowercase letters, cijfers en underscores bevatten'
      }, { status: 400 })
    }

    const newItem = await StamdataService.createStamdataItem(tenantSlug, body)
    
    return NextResponse.json({
      success: true,
      data: newItem,
      message: `Stamdata item "${body.label}" succesvol toegevoegd`
    })
  } catch (error) {
    console.error('Error creating stamdata item:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create stamdata item'
    }, { status: 500 })
  }
}

// PUT /api/v1/[tenant]/stamdata - Update stamdata item
export async function PUT(request: NextRequest, { params }: { params: Promise<{ tenant: string }> }) {
  try {
    const { tenant: tenantSlug } = await params
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json({
        success: false,
        error: 'Item ID is verplicht voor update'
      }, { status: 400 })
    }

    const updatedItem = await StamdataService.updateStamdataItem(tenantSlug, body.id, body)
    
    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: `Stamdata item "${body.label}" succesvol bijgewerkt`
    })
  } catch (error) {
    console.error('Error updating stamdata item:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update stamdata item'
    }, { status: 500 })
  }
}