import { NextRequest, NextResponse } from 'next/server';
import { LeadService, TenantService, ContactService } from '@/lib/services';

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
    const { contactId, status, source } = data;
    if (!contactId || !status || !source) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: contactId, status, source',
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

    // Create lead
    const lead = await LeadService.createLead({
      tenantId: tenant.id,
      contactId,
      propertyId: data.propertyId,
      status,
      source,
      score: data.score,
      message: data.message,
      metadata: data.metadata || {},
    });

    return NextResponse.json({
      success: true,
      message: 'Lead created successfully',
      data: lead,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create lead',
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const resolvedParams = await params;
    const tenantSlug = resolvedParams.tenant;
    const { searchParams } = new URL(request.url);

    // Verify tenant exists
    const tenant = await TenantService.getTenantBySlug(tenantSlug);
    if (!tenant) {
      return NextResponse.json({
        success: false,
        error: 'Tenant not found',
      }, { status: 404 });
    }

    // Handle query parameters
    const status = searchParams.get('status') as any;
    const contactId = searchParams.get('contactId');
    const propertyId = searchParams.get('propertyId');

    let leads;

    if (status) {
      leads = await LeadService.getLeadsByStatus(tenant.id, status);
    } else if (contactId) {
      leads = await LeadService.getLeadsByContact(contactId, tenant.id);
    } else if (propertyId) {
      leads = await LeadService.getLeadsByProperty(propertyId, tenant.id);
    } else {
      // For now, return empty array for all leads (would need pagination in real app)
      leads = [];
    }

    return NextResponse.json({
      success: true,
      data: leads,
      tenant: tenantSlug,
      count: leads.length,
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch leads',
    }, { status: 500 });
  }
}