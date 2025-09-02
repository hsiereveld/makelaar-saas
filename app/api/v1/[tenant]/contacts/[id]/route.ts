import { NextRequest, NextResponse } from 'next/server';
import { ContactService, TenantService } from '@/lib/services';

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

    // Get contact by ID
    const contact = await ContactService.getContactById(contactId, tenant.id);
    if (!contact) {
      return NextResponse.json({
        success: false,
        error: 'Contact not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: contact,
      tenant: tenantSlug,
    });
  } catch (error) {
    console.error('Error fetching contact:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch contact',
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string; id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { tenant: tenantSlug, id: contactId } = resolvedParams;
    const data = await request.json();

    // Verify tenant exists
    const tenant = await TenantService.getTenantBySlug(tenantSlug);
    if (!tenant) {
      return NextResponse.json({
        success: false,
        error: 'Tenant not found',
      }, { status: 404 });
    }

    // Verify contact exists
    const existingContact = await ContactService.getContactById(contactId, tenant.id);
    if (!existingContact) {
      return NextResponse.json({
        success: false,
        error: 'Contact not found',
      }, { status: 404 });
    }

    // Update contact
    const updatedContact = await ContactService.updateContact(contactId, tenant.id, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      type: data.type,
      nationality: data.nationality,
      preferredLanguage: data.preferredLanguage,
      budget: data.budget ? parseInt(data.budget) : undefined,
      notes: data.notes,
      tags: data.tags,
    });

    return NextResponse.json({
      success: true,
      message: 'Contact updated successfully',
      data: updatedContact,
    });
  } catch (error: any) {
    console.error('Error updating contact:', error);
    
    if (error.message.includes('required') || error.message.includes('invalid')) {
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to update contact',
    }, { status: 500 });
  }
}

export async function DELETE(
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
    const existingContact = await ContactService.getContactById(contactId, tenant.id);
    if (!existingContact) {
      return NextResponse.json({
        success: false,
        error: 'Contact not found',
      }, { status: 404 });
    }

    // Delete contact
    const deleted = await ContactService.deleteContact(contactId, tenant.id);
    
    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: 'Failed to delete contact',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Contact deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting contact:', error);
    
    if (error.message.includes('foreign key') || error.message.includes('referenced')) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete contact with existing leads or relationships. Please remove associated data first.',
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to delete contact',
    }, { status: 500 });
  }
}