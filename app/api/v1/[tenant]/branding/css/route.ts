import { NextRequest, NextResponse } from 'next/server';
import { TenantBrandingService } from '@/lib/services/tenant-config.service';
import { TenantService } from '@/lib/services';

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
      return new Response('/* Tenant not found */', {
        status: 404,
        headers: { 'Content-Type': 'text/css' },
      });
    }

    // Generate CSS from branding (no authentication required for CSS)
    const css = await TenantBrandingService.generateBrandingCSS(tenant.id);

    return new Response(css, {
      status: 200,
      headers: {
        'Content-Type': 'text/css',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error: any) {
    console.error('Error generating branding CSS:', error);
    
    return new Response('/* Error generating CSS */', {
      status: 500,
      headers: { 'Content-Type': 'text/css' },
    });
  }
}