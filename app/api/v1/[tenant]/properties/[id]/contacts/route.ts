import { NextRequest, NextResponse } from 'next/server';
import { PropertyService, TenantService } from '@/lib/services';
import { ContactPropertyRelationshipService } from '@/lib/services/contact.service';

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

    // Get relationships for this property
    const relationships = await ContactPropertyRelationshipService.getRelationshipsByProperty(
      propertyId,
      tenant.id
    );

    return NextResponse.json({
      success: true,
      data: relationships,
      tenant: tenantSlug,
      propertyId,
      count: relationships.length,
    });
  } catch (error) {
    console.error('Error fetching property contacts:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch property contacts',
    }, { status: 500 });
  }
}