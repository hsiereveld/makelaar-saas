import { NextRequest, NextResponse } from 'next/server';
import { ContactService, TenantService } from '@/lib/services';

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

    // Validate that we have an array of contacts
    const { contacts: contactsToImport } = data;
    if (!Array.isArray(contactsToImport) || contactsToImport.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Expected an array of contacts to import',
      }, { status: 400 });
    }

    const results = {
      imported: [],
      failed: [],
      skipped: [],
    } as any;

    // Process each contact
    for (let i = 0; i < contactsToImport.length; i++) {
      const contactData = contactsToImport[i];
      
      try {
        // Validate required fields
        if (!contactData.firstName || !contactData.lastName || !contactData.email || !contactData.type) {
          results.failed.push({
            index: i,
            data: contactData,
            error: 'Missing required fields: firstName, lastName, email, type',
          });
          continue;
        }

        // Check if contact already exists
        const existingContacts = await ContactService.searchContactsByEmail(tenant.id, contactData.email);
        if (existingContacts.length > 0) {
          results.skipped.push({
            index: i,
            data: contactData,
            reason: 'Contact with this email already exists',
            existingContact: existingContacts[0],
          });
          continue;
        }

        // Create contact
        const contact = await ContactService.createContact({
          tenantId: tenant.id,
          firstName: contactData.firstName,
          lastName: contactData.lastName,
          email: contactData.email,
          phone: contactData.phone,
          type: contactData.type,
          nationality: contactData.nationality,
          preferredLanguage: contactData.preferredLanguage,
          budget: contactData.budget ? parseInt(contactData.budget) : undefined,
          notes: contactData.notes,
          tags: contactData.tags || ['bulk-import'],
        });

        results.imported.push({
          index: i,
          contact,
        });
      } catch (error: any) {
        results.failed.push({
          index: i,
          data: contactData,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk import completed: ${results.imported.length} imported, ${results.skipped.length} skipped, ${results.failed.length} failed`,
      data: results,
      tenant: tenantSlug,
    }, { status: 201 });
  } catch (error) {
    console.error('Error importing contacts:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to import contacts',
    }, { status: 500 });
  }
}