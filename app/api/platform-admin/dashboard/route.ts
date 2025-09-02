import { NextResponse } from 'next/server'
import { createPlatformAdminHandler } from '@/lib/middleware/platform-admin.middleware'
import { PlatformAdminService } from '@/lib/services/platform-admin.service'

// GET /api/platform-admin/dashboard - Get platform dashboard statistics
export const GET = createPlatformAdminHandler(async (request, context) => {
  try {
    const stats = await PlatformAdminService.getDashboardStats()
    
    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dashboard statistics',
      data: {
        tenants: { totalTenants: 0, activeTenants: 0, trialTenants: 0 },
        users: { totalUsers: 0, newUsersThisMonth: 0 },
        support: { openTickets: 0, resolvedTickets: 0 },
        revenue: { monthlyRevenue: 0, totalRevenue: 0 }
      }
    }, { status: 500 })
  }
})