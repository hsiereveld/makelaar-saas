import { NextRequest, NextResponse } from 'next/server';
import { PropertyService, TenantService } from '@/lib/services';
import { requireTenantAuth } from '@/lib/middleware/auth.middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string; id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { tenant: tenantSlug, id: propertyId } = resolvedParams;

    // Verify tenant exists
    const tenant = await TenantService.getTenantBySlug(tenantSlug);
    if (!tenant) {
      return NextResponse.json({
        success: false,
        error: 'Tenant not found',
      }, { status: 404 });
    }

    // Authenticate user and verify tenant access
    const auth = await requireTenantAuth(request, tenant.id);
    if (auth instanceof NextResponse) {
      return auth;
    }

    // Get property with workflow state
    const propertyWithWorkflow = await PropertyService.getPropertyWithWorkflow(
      propertyId,
      tenant.id
    );

    if (!propertyWithWorkflow) {
      return NextResponse.json({
        success: false,
        error: 'Property not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        property: {
          id: propertyWithWorkflow.id,
          title: propertyWithWorkflow.title,
          status: propertyWithWorkflow.status,
          price: propertyWithWorkflow.price,
        },
        workflow: propertyWithWorkflow.workflow,
      },
      tenant: tenantSlug,
      user: {
        id: auth.user.id,
        role: auth.userRole.role,
      },
    });
  } catch (error: any) {
    console.error('Property workflow fetch error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch property workflow',
    }, { status: 500 });
  }
}