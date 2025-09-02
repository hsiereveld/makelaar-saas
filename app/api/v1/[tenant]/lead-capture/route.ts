import { NextRequest, NextResponse } from 'next/server';
import { ContactService, LeadService, TenantService } from '@/lib/services';

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

    // Validate required fields for lead capture
    const { firstName, lastName, email, source } = data;
    if (!firstName || !lastName || !email || !source) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: firstName, lastName, email, source',
      }, { status: 400 });
    }

    // Try to find existing contact or create new one
    let contact;
    try {
      // Check if contact already exists
      const existingContacts = await ContactService.searchContactsByEmail(tenant.id, email);
      
      if (existingContacts.length > 0) {
        contact = existingContacts[0];
      } else {
        // Create new contact
        contact = await ContactService.createContact({
          tenantId: tenant.id,
          firstName,
          lastName,
          email,
          phone: data.phone,
          type: data.type || 'buyer', // Default to buyer for lead capture
          nationality: data.nationality,
          preferredLanguage: data.preferredLanguage,
          budget: data.budget ? parseInt(data.budget) : undefined,
          notes: data.notes,
          tags: data.tags || ['lead-capture'],
        });
      }
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        // If contact exists, get it
        const existingContacts = await ContactService.searchContactsByEmail(tenant.id, email);
        contact = existingContacts[0];
      } else {
        throw error;
      }
    }

    // Create lead
    const lead = await LeadService.createLead({
      tenantId: tenant.id,
      contactId: contact.id,
      propertyId: data.propertyId,
      status: 'new', // Always start as new for lead capture
      source: source,
      message: data.message,
      metadata: {
        utm_source: data.utm_source,
        utm_campaign: data.utm_campaign,
        utm_medium: data.utm_medium,
        referrer: data.referrer,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString(),
        ...data.metadata,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Lead captured successfully',
      data: {
        leadId: lead.id,
        contactId: contact.id,
        status: lead.status,
        score: lead.score,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error capturing lead:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to capture lead',
    }, { status: 500 });
  }
}