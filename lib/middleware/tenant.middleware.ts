import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, AuthContext } from './auth.middleware'

export interface TenantContext extends AuthContext {
  tenant: {
    id: string
    slug: string
    name: string
  }
}

export function createTenantHandler<T = any>(
  handler: (request: NextRequest, context: TenantContext) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest, { params }: { params: { tenant: string } }) => {
    try {
      // Authenticate user
      const auth = await requireAuth(request)
      
      if (auth instanceof NextResponse) {
        return auth // Return authentication error
      }

      // Extract tenant from URL
      const tenantSlug = params.tenant
      
      // Verify user has access to this tenant
      if (auth.tenant.slug !== tenantSlug) {
        return NextResponse.json({
          success: false,
          error: 'Access denied for this tenant'
        }, { status: 403 })
      }

      // Create tenant context
      const context: TenantContext = {
        ...auth,
        tenant: auth.tenant
      }

      // Call the actual handler
      return await handler(request, context)
    } catch (error) {
      console.error('Tenant middleware error:', error)
      return NextResponse.json({
        success: false,
        error: 'Internal server error'
      }, { status: 500 })
    }
  }
}