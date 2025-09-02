import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/auth.service';
import { TenantService } from '@/lib/services';
import { requireAuth, requireAdmin } from '@/lib/middleware/auth.middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const resolvedParams = await params;
    const tenantSlug = resolvedParams.tenant;

    // Verify tenant exists
    const tenant = await TenantService.getTenantBySlug(tenantSlug);
    if (!tenant) {
      return NextResponse.json({
        success: false,
        error: 'Tenant not found',
      }, { status: 404 });
    }

    // Authenticate user
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) {
      return auth; // Return error response
    }

    // Verify user has access to this tenant
    if (auth.tenant.id !== tenant.id) {
      return NextResponse.json({
        success: false,
        error: 'Access denied for this tenant',
      }, { status: 403 });
    }

    // Check admin permissions
    const adminCheck = requireAdmin(auth);
    if (adminCheck instanceof NextResponse) {
      return adminCheck; // Return error response
    }

    // Get tenant users
    const users = await UserService.getUsersByTenant(tenant.id);

    return NextResponse.json({
      success: true,
      data: users,
      tenant: tenantSlug,
      count: users.length,
    });
  } catch (error: any) {
    console.error('Error fetching tenant users:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch users',
    }, { status: 500 });
  }
}