import { NextRequest } from 'next/server'
import { createPlatformAdminHandler } from '@/lib/middleware/platform-admin.middleware'
import { PlatformAdminService } from '@/lib/services/platform-admin.service'

// GET /api/platform-admin/support/tickets - Get all support tickets
export const GET = createPlatformAdminHandler(async (request) => {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const status = searchParams.get('status') as any
  const priority = searchParams.get('priority') as any
  const tenantId = searchParams.get('tenantId') || undefined
  const assignedTo = searchParams.get('assignedTo') || undefined

  try {
    const result = await PlatformAdminService.getAllSupportTickets({
      page,
      limit,
      status,
      priority,
      tenantId,
      assignedTo,
    })
    
    return Response.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error fetching support tickets:', error)
    return Response.json({
      success: false,
      error: 'Failed to fetch support tickets'
    }, { status: 500 })
  }
})

// POST /api/platform-admin/support/tickets - Create support ticket
export const POST = createPlatformAdminHandler(async (request, context) => {
  try {
    const body = await request.json()
    const { tenantId, userId, title, description, priority } = body

    if (!title || !description) {
      return Response.json({
        success: false,
        error: 'Title and description are required'
      }, { status: 400 })
    }

    const ticket = await PlatformAdminService.createSupportTicket({
      tenantId,
      userId,
      title,
      description,
      priority
    })
    
    return Response.json({
      success: true,
      data: ticket
    })
  } catch (error) {
    console.error('Error creating support ticket:', error)
    return Response.json({
      success: false,
      error: 'Failed to create support ticket'
    }, { status: 500 })
  }
})