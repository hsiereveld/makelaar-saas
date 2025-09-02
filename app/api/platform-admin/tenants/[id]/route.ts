import { NextRequest } from 'next/server'
import { createPlatformAdminHandler } from '@/lib/middleware/platform-admin.middleware'
import { PlatformAdminService } from '@/lib/services/platform-admin.service'

// GET /api/platform-admin/tenants/[id] - Get tenant details
export const GET = createPlatformAdminHandler(async (request, context, { params }) => {
  const tenantId = params.id

  try {
    const result = await PlatformAdminService.getTenantDetails(tenantId)
    
    return Response.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error fetching tenant details:', error)
    return Response.json({
      success: false,
      error: 'Failed to fetch tenant details'
    }, { status: 500 })
  }
})

// PUT /api/platform-admin/tenants/[id] - Update tenant and subscription
export const PUT = createPlatformAdminHandler(async (request, context, { params }) => {
  const tenantId = params.id

  try {
    const body = await request.json()
    const { action, reason, name, slug, plan, status, maxUsers, maxProperties } = body

    if (action === 'suspend') {
      if (!reason) {
        return Response.json({
          success: false,
          error: 'Suspension reason is required'
        }, { status: 400 })
      }

      const result = await PlatformAdminService.suspendTenant(tenantId, reason)

      return Response.json({
        success: true,
        data: result,
        message: 'Tenant suspended successfully'
      })
    }

    if (action === 'update') {
      // Update tenant basic info if provided
      if (name || slug) {
        // TODO: Add tenant basic info update to service
        console.log('Updating tenant basic info:', { name, slug })
      }

      // Update subscription if provided
      if (plan || status || maxUsers || maxProperties) {
        const subscriptionUpdates: any = {}
        if (plan) subscriptionUpdates.plan = plan
        if (status) subscriptionUpdates.status = status
        if (maxUsers) subscriptionUpdates.maxUsers = maxUsers
        if (maxProperties) subscriptionUpdates.maxProperties = maxProperties

        const result = await PlatformAdminService.updateSubscription(tenantId, subscriptionUpdates)

        // Log the action
        await PlatformAdminService.logSystemAction({
          userId: context.user.id,
          action: 'tenant_updated',
          resource: 'tenant',
          resourceId: tenantId,
          details: { updates: { name, slug, ...subscriptionUpdates } },
        })

        return Response.json({
          success: true,
          data: result,
          message: 'Agency successfully updated'
        })
      }
    }

    return Response.json({
      success: false,
      error: 'Invalid action or missing data'
    }, { status: 400 })
  } catch (error) {
    console.error('Error updating tenant:', error)
    return Response.json({
      success: false,
      error: 'Failed to update tenant'
    }, { status: 500 })
  }
})