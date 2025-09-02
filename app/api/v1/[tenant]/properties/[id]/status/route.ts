import { NextRequest, NextResponse } from 'next/server';
import { PropertyService, TenantService } from '@/lib/services';
import { requireTenantAuth } from '@/lib/middleware/auth.middleware';

export async function PUT(
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

    // Get request data
    const data = await request.json();
    const { newStatus, reason, notes } = data;

    if (!newStatus) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: newStatus',
      }, { status: 400 });
    }

    // Update property status using workflow system
    const result = await PropertyService.updatePropertyStatus(
      propertyId,
      tenant.id,
      newStatus,
      {
        userId: auth.user.id,
        userRole: auth.userRole.role,
        reason,
        notes,
        executeWorkflows: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Property status updated successfully',
      data: {
        property: result.property,
        workflowHistory: result.workflowHistory,
        triggeredActions: result.triggeredActions.length,
      },
      user: {
        id: auth.user.id,
        name: auth.user.name,
        role: auth.userRole.role,
      },
    });
  } catch (error: any) {
    console.error('Property status update error:', error);
    
    if (error.message.includes('Invalid transition') || error.message.includes('transition')) {
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 400 });
    }
    
    if (error.message.includes('blocked') || error.message.includes('permission')) {
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 403 });
    }
    
    if (error.message.includes('not found')) {
      return NextResponse.json({
        success: false,
        error: 'Property not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to update property status',
    }, { status: 500 });
  }
}