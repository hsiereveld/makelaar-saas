import { NextRequest, NextResponse } from 'next/server';
import { ContactService, LeadService, TenantService } from '@/lib/services';

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

    // Get leads for this contact
    const leads = await LeadService.getLeadsByContact(contactId, tenant.id);

    return NextResponse.json({
      success: true,
      data: leads,
      tenant: tenantSlug,
      contactId,
      count: leads.length,
    });
  } catch (error) {
    console.error('Error fetching contact leads:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch contact leads',
    }, { status: 500 });
  }
}