import { NextRequest, NextResponse } from 'next/server';
import { LeadService, TenantService } from '@/lib/services';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string; id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { tenant: tenantSlug, id: leadId } = resolvedParams;

    // Verify tenant exists
    const tenant = await TenantService.getTenantBySlug(tenantSlug);
    if (!tenant) {
      return NextResponse.json({
        success: false,
        error: 'Tenant not found',
      }, { status: 404 });
    }

    // Get lead by ID
    const lead = await LeadService.getLeadById(leadId, tenant.id);
    if (!lead) {
      return NextResponse.json({
        success: false,
        error: 'Lead not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: lead,
      tenant: tenantSlug,
    });
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch lead',
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string; id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { tenant: tenantSlug, id: leadId } = resolvedParams;
    const data = await request.json();

    // Verify tenant exists
    const tenant = await TenantService.getTenantBySlug(tenantSlug);
    if (!tenant) {
      return NextResponse.json({
        success: false,
        error: 'Tenant not found',
      }, { status: 404 });
    }

    // Verify lead exists
    const existingLead = await LeadService.getLeadById(leadId, tenant.id);
    if (!existingLead) {
      return NextResponse.json({
        success: false,
        error: 'Lead not found',
      }, { status: 404 });
    }

    // Update lead
    const updatedLead = await LeadService.updateLead(leadId, tenant.id, {
      status: data.status,
      score: data.score ? parseInt(data.score) : undefined,
      message: data.message,
      metadata: data.metadata,
    });

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully',
      data: updatedLead,
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update lead',
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string; id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { tenant: tenantSlug, id: leadId } = resolvedParams;

    // Verify tenant exists
    const tenant = await TenantService.getTenantBySlug(tenantSlug);
    if (!tenant) {
      return NextResponse.json({
        success: false,
        error: 'Tenant not found',
      }, { status: 404 });
    }

    // Verify lead exists
    const existingLead = await LeadService.getLeadById(leadId, tenant.id);
    if (!existingLead) {
      return NextResponse.json({
        success: false,
        error: 'Lead not found',
      }, { status: 404 });
    }

    // Delete lead
    const deleted = await LeadService.deleteLead(leadId, tenant.id);
    
    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: 'Failed to delete lead',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete lead',
    }, { status: 500 });
  }
}