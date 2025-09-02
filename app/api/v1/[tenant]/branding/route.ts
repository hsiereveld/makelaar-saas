import { NextRequest, NextResponse } from 'next/server';
import { TenantBrandingService } from '@/lib/services/tenant-config.service';
import { TenantService } from '@/lib/services';
import { requireTenantAuth, requireAdmin } from '@/lib/middleware/auth.middleware';

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

    // Authenticate user (branding can be viewed by all authenticated users)
    const auth = await requireTenantAuth(request, tenant.id);
    if (auth instanceof NextResponse) {
      return auth;
    }

    // Get tenant branding
    const branding = await TenantBrandingService.getBranding(tenant.id);

    return NextResponse.json({
      success: true,
      data: branding || {
        tenantId: tenant.id,
        primaryColor: '#3b82f6',
        secondaryColor: '#64748b',
        accentColor: '#10b981',
        fontFamily: 'Inter',
      },
      tenant: tenantSlug,
    });
  } catch (error: any) {
    console.error('Error fetching tenant branding:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch branding',
    }, { status: 500 });
  }
}

export async function PUT(
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

    // Authenticate user and verify admin access
    const auth = await requireTenantAuth(request, tenant.id);
    if (auth instanceof NextResponse) {
      return auth;
    }

    const adminCheck = requireAdmin(auth);
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    // Get branding data
    const data = await request.json();

    // Update tenant branding
    const branding = await TenantBrandingService.updateBranding({
      tenantId: tenant.id,
      ...data,
    });

    return NextResponse.json({
      success: true,
      message: 'Branding updated successfully',
      data: branding,
    });
  } catch (error: any) {
    console.error('Error updating tenant branding:', error);
    
    if (error.message.includes('Invalid') || error.message.includes('color')) {
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to update branding',
    }, { status: 500 });
  }
}