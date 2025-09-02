import { NextRequest, NextResponse } from 'next/server';
import { ContactService, PropertyService, TenantService } from '@/lib/services';
import { ContactPropertyRelationshipService } from '@/lib/services/contact.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const resolvedParams = await params;
    const tenantSlug = resolvedParams.tenant;
    const data = await request.json();

    // Verify tenant exists
    const tenant = await TenantService.getTenantBySlug(tenantSlug);
    if (!tenant) {
      return NextResponse.json({
        success: false,
        error: 'Tenant not found',
      }, { status: 404 });
    }

    // Validate required fields
    const { contactId, propertyId, relationship } = data;
    if (!contactId || !propertyId || !relationship) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: contactId, propertyId, relationship',
      }, { status: 400 });
    }

    // Verify contact exists and belongs to tenant
    const contact = await ContactService.getContactById(contactId, tenant.id);
    if (!contact) {
      return NextResponse.json({
        success: false,
        error: 'Contact not found',
      }, { status: 404 });
    }

    // Verify property exists and belongs to tenant
    const property = await PropertyService.getPropertyById(propertyId, tenant.id);
    if (!property) {
      return NextResponse.json({
        success: false,
        error: 'Property not found',
      }, { status: 404 });
    }

    // Create relationship
    const relationshipRecord = await ContactPropertyRelationshipService.createRelationship({
      tenantId: tenant.id,
      contactId,
      propertyId,
      relationship,
      notes: data.notes,
    });

    return NextResponse.json({
      success: true,
      message: 'Relationship created successfully',
      data: relationshipRecord,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating relationship:', error);
    
    if (error.message.includes('unique') || error.message.includes('duplicate')) {
      return NextResponse.json({
        success: false,
        error: 'Relationship between this contact and property already exists',
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create relationship',
    }, { status: 500 });
  }
}