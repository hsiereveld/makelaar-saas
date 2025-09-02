import { NextRequest } from 'next/server'
import { createPlatformAdminHandler } from '@/lib/middleware/platform-admin.middleware'
import { PlatformAdminService } from '@/lib/services/platform-admin.service'

// GET /api/platform-admin/tenants - Get all tenants
export const GET = createPlatformAdminHandler(async (request) => {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || undefined

  try {
    const result = await PlatformAdminService.getAllTenants(page, limit, search)
    
    return Response.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error fetching tenants:', error)
    return Response.json({
      success: false,
      error: 'Failed to fetch tenants'
    }, { status: 500 })
  }
})

// POST /api/platform-admin/tenants - Create new tenant
export const POST = createPlatformAdminHandler(async (request, context) => {
  try {
    const body = await request.json()
    const { name, slug, plan } = body

    if (!name || !slug) {
      return Response.json({
        success: false,
        error: 'Name and slug are required'
      }, { status: 400 })
    }

    const result = await PlatformAdminService.createTenant({
      name,
      slug,
      plan
    })

    // Log the action
    await PlatformAdminService.logSystemAction({
      userId: context.user.id,
      action: 'tenant_created',
      resource: 'tenant',
      resourceId: result.tenant.id,
      details: { name, slug, plan },
    })
    
    return Response.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error creating tenant:', error)
    return Response.json({
      success: false,
      error: 'Failed to create tenant'
    }, { status: 500 })
  }
})