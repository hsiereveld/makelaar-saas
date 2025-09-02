import { NextRequest, NextResponse } from 'next/server';
import { ContactService, TenantService } from '@/lib/services';
import { ContactPropertyRelationshipService } from '@/lib/services/contact.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string; id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { tenant: tenantSlug, id: contactId } = resolvedParams;

    // Verify tenant exists
    const tenant = await TenantService.getTenantBySlug(tenantSlug);
    if (!tenant) {
      return NextResponse.json({
        success: false,
        error: 'Tenant not found',
      }, { status: 404 });
    }

    // Verify contact exists
    const contact = await ContactService.getContactById(contactId, tenant.id);
    if (!contact) {
      return NextResponse.json({
        success: false,
        error: 'Contact not found',
      }, { status: 404 });
    }

    // Get relationships for this contact
    const relationships = await ContactPropertyRelationshipService.getRelationshipsByContact(
      contactId,
      tenant.id
    );

    return NextResponse.json({
      success: true,
      data: relationships,
      tenant: tenantSlug,
      contactId,
      count: relationships.length,
    });
  } catch (error) {
    console.error('Error fetching contact properties:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch contact properties',
    }, { status: 500 });
  }
}