import { NextRequest, NextResponse } from 'next/server';
import { PropertyService, TenantService } from '@/lib/services';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const resolvedParams = await params;
    const tenantSlug = resolvedParams.tenant;

    // Verify tenant exists
    const tenant = await TenantService.getTenantBySlug(tenantSlug);
    if (!tenant) {
      return NextResponse.json({
        success: false,
        error: 'Tenant not found',
      }, { status: 404 });
    }

    // Get properties for the tenant
    const properties = await PropertyService.getPropertiesByTenantSlug(tenantSlug);
    
    return NextResponse.json({
      success: true,
      data: properties,
      tenant: tenantSlug,
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
