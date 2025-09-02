import { NextRequest, NextResponse } from 'next/server';
import { PropertyService, TenantService } from '@/lib/services';
import { requireAuth, requireTenantAuth } from '@/lib/middleware/auth.middleware';

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

    // Authenticate user and verify tenant access
    const auth = await requireTenantAuth(request, tenant.id);
    if (auth instanceof NextResponse) {
      return auth; // Return authentication error
    }

    // Check if enhanced data is requested
    const includeContacts = searchParams.get('include') === 'contacts';
    const includeMetrics = searchParams.get('include') === 'metrics';

    let properties;
    
    if (includeMetrics) {
      // Get properties with lead metrics
      properties = await PropertyService.getPropertiesWithLeadMetrics(tenant.id);
    } else {
      // Get regular properties
      properties = await PropertyService.getPropertiesByTenantSlug(tenantSlug);
    }
    
    return NextResponse.json({
      success: true,
      data: properties,
      tenant: tenantSlug,
      enhanced: includeContacts || includeMetrics,
      user: {
        id: auth.user.id,
        name: auth.user.name,
        role: auth.userRole.role,
      },
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch properties',
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

    // Authenticate user and verify tenant access
    const auth = await requireTenantAuth(request, tenant.id);
    if (auth instanceof NextResponse) {
      return auth; // Return authentication error
    }

    // Check if user has permission to create properties
    // For now, allow agents and admins to create properties
    const allowedRoles = ['tenant_admin', 'agent'];
    if (!allowedRoles.includes(auth.userRole.role)) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient permissions to create properties',
      }, { status: 403 });
    }

    // Validate required fields
    const { title, address, city, price } = data;
    if (!title || !address || !city || !price) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title, address, city, price',
      }, { status: 400 });
    }

    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // Create property
    const property = await PropertyService.createProperty({
      tenantId: tenant.id,
      title,
      slug,
      address,
      city,
      price: parseInt(price),
      bedrooms: data.bedrooms || 0,
      bathrooms: data.bathrooms || 0,
      livingArea: data.livingArea,
      status: data.status || 'draft',
    });

    return NextResponse.json({
      success: true,
      message: 'Property created successfully',
      data: property,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create property',
    }, { status: 500 });
  }
}
