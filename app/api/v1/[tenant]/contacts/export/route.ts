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

    // Get export format (default to JSON)
    const format = searchParams.get('format') || 'json';

    // Get all contacts for tenant
    const contacts = await ContactService.getContactsByTenant(tenant.id);

    if (format === 'csv') {
      // Return CSV format
      const csvHeader = 'firstName,lastName,email,phone,type,nationality,preferredLanguage,budget,notes,createdAt\n';
      const csvRows = contacts.map(contact => 
        `"${contact.firstName}","${contact.lastName}","${contact.email}","${contact.phone || ''}","${contact.type}","${contact.nationality || ''}","${contact.preferredLanguage || ''}","${contact.budget || ''}","${contact.notes || ''}","${contact.createdAt}"`
      ).join('\n');
      
      const csvContent = csvHeader + csvRows;

      return new Response(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="contacts-${tenantSlug}-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else {
      // Return JSON format
      return NextResponse.json({
        success: true,
        data: contacts,
        tenant: tenantSlug,
        count: contacts.length,
        exportedAt: new Date().toISOString(),
        format: 'json',
      });
    }
  } catch (error) {
    console.error('Error exporting contacts:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to export contacts',
    }, { status: 500 });
  }
}