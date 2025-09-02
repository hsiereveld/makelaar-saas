import { NextRequest } from 'next/server'
import { createPlatformAdminHandler } from '@/lib/middleware/platform-admin.middleware'
import { PlatformAdminService } from '@/lib/services/platform-admin.service'

// PUT /api/platform-admin/tenants/[id]/subscription - Update tenant subscription
export const PUT = createPlatformAdminHandler(async (request, context, { params }) => {
  const tenantId = params.id

  try {
    const body = await request.json()
    const { plan, status, maxUsers, maxProperties } = body

    if (!plan && !status && !maxUsers && !maxProperties) {
      return Response.json({
        success: false,
        error: 'At least one subscription field is required'
      }, { status: 400 })
    }

    // Update subscription
    const result = await PlatformAdminService.updateSubscription(tenantId, {
      plan,
      status,
      maxUsers,
      maxProperties
    })

    // Log the action
    await PlatformAdminService.logSystemAction({
      userId: context.user.id,
      action: 'subscription_updated',
      resource: 'subscription',
      resourceId: result.id,
      details: { tenantId, updates: { plan, status, maxUsers, maxProperties } },
    })

    return Response.json({
      success: true,
      data: result,
      message: 'Subscription successfully updated'
    })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return Response.json({
      success: false,
      error: 'Failed to update subscription'
    }, { status: 500 })
  }
})