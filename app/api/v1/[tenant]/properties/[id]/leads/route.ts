import { NextRequest, NextResponse } from 'next/server';
import { PropertyService, LeadService, TenantService } from '@/lib/services';

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

    // Verify property exists
    const property = await PropertyService.getPropertyById(propertyId, tenant.id);
    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Property not found',
      }, { status: 404 });
    }

    // Get leads for this property
    const leads = await LeadService.getLeadsByProperty(propertyId, tenant.id);

    return NextResponse.json({
      success: true,
      data: leads,
      tenant: tenantSlug,
      propertyId,
      count: leads.length,
    });
  } catch (error) {
    console.error('Error fetching property leads:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch property leads',
    }, { status: 500 });
  }
}