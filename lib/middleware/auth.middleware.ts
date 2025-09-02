import { NextRequest, NextResponse } from 'next/server';
import { AuthService, PermissionService } from '@/lib/services/auth.service';

export interface AuthContext {
  user: any;
  userRole: any;
  tenant: any;
  permissions: any[];
}

/**
 * Authentication middleware for API routes
 */
export async function requireAuth(request: NextRequest): Promise<AuthContext | NextResponse> {
  try {
    // Get session token from cookie or Authorization header
    const sessionToken = 
      request.cookies.get('session-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!sessionToken) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    // Validate session
    const validation = await AuthService.validateSession(sessionToken);
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: validation.error || 'Invalid session',
      }, { status: 401 });
    }

    return {
      user: validation.user,
      userRole: validation.userRole,
      tenant: validation.tenant,
      permissions: validation.permissions,
    };
  } catch (error: any) {
    console.error('Authentication middleware error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Authentication failed',
    }, { status: 500 });
  }
}

/**
 * Tenant-specific authentication middleware
 */
export async function requireTenantAuth(
  request: NextRequest,
  tenantSlugOrId: string
): Promise<AuthContext | NextResponse> {
  const auth = await requireAuth(request);
  
  if (auth instanceof NextResponse) {
    return auth; // Return error response
  }

  // Verify user has access to this tenant (check both ID and slug)
  if (auth.tenant.id !== tenantSlugOrId && auth.tenant.slug !== tenantSlugOrId) {
    return NextResponse.json({
      success: false,
      error: 'Access denied for this tenant',
    }, { status: 403 });
  }

  return auth;
}

/**
 * Permission-based authorization middleware
 */
export async function requirePermission(
  authContext: AuthContext,
  resource: string,
  action: string
): Promise<boolean | NextResponse> {
  try {
    const hasPermission = await PermissionService.userHasPermission(
      authContext.user.id,
      authContext.tenant.id,
      resource,
      action
    );

    if (!hasPermission) {
      return NextResponse.json({
        success: false,
        error: `Insufficient permissions: ${action} ${resource}`,
      }, { status: 403 });
    }

    return true;
  } catch (error: any) {
    console.error('Permission check error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Permission validation failed',
    }, { status: 500 });
  }
}

/**
 * Role-based authorization middleware
 */
export function requireRole(
  authContext: AuthContext,
  requiredRoles: string[]
): boolean | NextResponse {
  if (!requiredRoles.includes(authContext.userRole.role)) {
    return NextResponse.json({
      success: false,
      error: `Access denied. Required roles: ${requiredRoles.join(', ')}`,
    }, { status: 403 });
  }

  return true;
}

/**
 * Admin-only authorization middleware
 */
export function requireAdmin(authContext: AuthContext): boolean | NextResponse {
  const adminRoles = ['platform_admin', 'tenant_owner', 'tenant_admin'];
  return requireRole(authContext, adminRoles);
}

/**
 * Helper function to extract session token from request
 */
export function extractSessionToken(request: NextRequest): string | null {
  return (
    request.cookies.get('session-token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    null
  );
}

/**
 * Helper function to create authenticated response with user context
 */
export function createAuthenticatedResponse(
  data: any,
  authContext: AuthContext,
  status: number = 200
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    user: {
      id: authContext.user.id,
      email: authContext.user.email,
      name: authContext.user.name,
      role: authContext.userRole.role,
    },
    tenant: {
      id: authContext.tenant.id,
      slug: authContext.tenant.slug,
      name: authContext.tenant.name,
    },
  }, { status });
}