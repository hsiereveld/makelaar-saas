import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'
import { users, userTenantRoles } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export interface PlatformAdminContext {
  user: {
    id: string
    email: string
    name: string
    role: 'platform_admin'
  }
}

export async function requirePlatformAdmin(request: NextRequest): Promise<PlatformAdminContext> {
  const token = request.cookies.get('session_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    throw new NextResponse(JSON.stringify({ 
      success: false, 
      error: 'Authentication required' 
    }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    if (!decoded.userId) {
      throw new Error('Invalid token format')
    }

    // Get user details
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
      })
      .from(users)
      .where(eq(users.id, decoded.userId))

    if (!user) {
      throw new Error('User not found')
    }

    // Check if user has platform_admin role
    const [adminRole] = await db
      .select()
      .from(userTenantRoles)
      .where(
        and(
          eq(userTenantRoles.userId, user.id),
          eq(userTenantRoles.role, 'platform_admin'),
          eq(userTenantRoles.isActive, true)
        )
      )

    if (!adminRole) {
      throw new NextResponse(JSON.stringify({ 
        success: false, 
        error: 'Platform admin access required' 
      }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: 'platform_admin' as const,
      }
    }
  } catch (error) {
    if (error instanceof NextResponse) {
      throw error
    }

    throw new NextResponse(JSON.stringify({ 
      success: false, 
      error: 'Invalid or expired token' 
    }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export function createPlatformAdminHandler<T = any>(
  handler: (request: NextRequest, context: PlatformAdminContext, ...args: any[]) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse<T>> => {
    try {
      const context = await requirePlatformAdmin(request)
      
      // Log platform admin action
      const userAgent = request.headers.get('user-agent')
      const clientIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'

      // You could add logging here if needed
      // await PlatformAdminService.logSystemAction({
      //   userId: context.user.id,
      //   action: 'platform_admin_api_access',
      //   resource: 'api',
      //   details: { 
      //     endpoint: request.nextUrl.pathname,
      //     method: request.method 
      //   },
      //   ipAddress: clientIP,
      //   userAgent
      // })

      return await handler(request, context, ...args)
    } catch (error) {
      if (error instanceof NextResponse) {
        return error
      }

      console.error('Platform admin middleware error:', error)
      return new NextResponse(JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}

// Utility function to check if user is platform admin (for server components)
export async function isPlatformAdmin(userId: string): Promise<boolean> {
  try {
    const [adminRole] = await db
      .select()
      .from(userTenantRoles)
      .where(
        and(
          eq(userTenantRoles.userId, userId),
          eq(userTenantRoles.role, 'platform_admin'),
          eq(userTenantRoles.isActive, true)
        )
      )

    return !!adminRole
  } catch (error) {
    console.error('Error checking platform admin status:', error)
    return false
  }
}

// Platform admin middleware for Next.js middleware.ts
export function platformAdminMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only apply to platform admin routes
  if (!pathname.startsWith('/platform-admin')) {
    return NextResponse.next()
  }

  // Allow access to login page
  if (pathname === '/platform-admin/login') {
    return NextResponse.next()
  }

  // Check authentication for other platform admin routes
  const token = request.cookies.get('session_token')?.value
  
  if (!token) {
    return NextResponse.redirect(new URL('/platform-admin/login', request.url))
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!)
    return NextResponse.next()
  } catch (error) {
    return NextResponse.redirect(new URL('/platform-admin/login', request.url))
  }
}