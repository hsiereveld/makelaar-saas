import { NextRequest, NextResponse } from 'next/server';
import { ContactService, TenantService } from '@/lib/services';

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

    // Handle different query parameters
    const type = searchParams.get('type') as any;
    const search = searchParams.get('search');
    const email = searchParams.get('email');
    const minBudget = searchParams.get('minBudget');
    const maxBudget = searchParams.get('maxBudget');

    let contacts;

    if (type) {
      // Filter by contact type
      contacts = await ContactService.getContactsByType(tenant.id, type);
    } else if (search) {
      // Search by name
      contacts = await ContactService.searchContactsByName(tenant.id, search);
    } else if (email) {
      // Search by email
      contacts = await ContactService.searchContactsByEmail(tenant.id, email);
    } else if (minBudget && maxBudget) {
      // Filter by budget range
      contacts = await ContactService.getContactsByBudgetRange(
        tenant.id,
        parseInt(minBudget),
        parseInt(maxBudget)
      );
    } else {
      // Get all contacts for tenant
      contacts = await ContactService.getContactsByTenant(tenant.id);
    }

    return NextResponse.json({
      success: true,
      data: contacts,
      tenant: tenantSlug,
      count: contacts.length,
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch contacts',
    }, { status: 500 });
  }
}

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
    const { firstName, lastName, email, type } = data;
    if (!firstName || !lastName || !email || !type) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: firstName, lastName, email, type',
      }, { status: 400 });
    }

    // Create contact
    const contact = await ContactService.createContact({
      tenantId: tenant.id,
      firstName,
      lastName,
      email,
      phone: data.phone,
      type,
      nationality: data.nationality,
      preferredLanguage: data.preferredLanguage,
      budget: data.budget ? parseInt(data.budget) : undefined,
      notes: data.notes,
      tags: data.tags || [],
    });

    return NextResponse.json({
      success: true,
      message: 'Contact created successfully',
      data: contact,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating contact:', error);
    
    if (error.message.includes('already exists')) {
      return NextResponse.json({
        success: false,
        error: 'A contact with this email already exists',
      }, { status: 409 });
    }
    
    if (error.message.includes('required') || error.message.includes('invalid')) {
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create contact',
    }, { status: 500 });
  }
}