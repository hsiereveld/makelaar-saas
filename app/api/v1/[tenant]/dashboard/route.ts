import { NextRequest, NextResponse } from 'next/server';
import { PropertyService, ContactService, TenantService } from '@/lib/services';
import { UserService } from '@/lib/services/auth.service';
import { requireTenantAuth } from '@/lib/middleware/auth.middleware';

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

    // Authenticate user and verify tenant access
    const auth = await requireTenantAuth(request, tenant.id);
    if (auth instanceof NextResponse) {
      return auth; // Return authentication error
    }

    // Get role-specific dashboard data
    const dashboardData: any = {
      user: {
        id: auth.user.id,
        name: auth.user.name,
        email: auth.user.email,
        role: auth.userRole.role,
      },
      tenant: {
        id: auth.tenant.id,
        slug: auth.tenant.slug,
        name: auth.tenant.name,
      },
      lastUpdated: new Date().toISOString(),
    };

    // Get basic metrics that all users can see
    const properties = await PropertyService.getPropertiesByTenant(tenant.id);
    const contacts = await ContactService.getContactsByTenant(tenant.id);

    dashboardData.overview = {
      totalProperties: properties.length,
      totalContacts: contacts.length,
      activeProperties: properties.filter(p => p.status === 'active').length,
      buyerContacts: contacts.filter(c => c.type === 'buyer').length,
    };

    // Role-specific data
    switch (auth.userRole.role) {
      case 'tenant_admin':
      case 'tenant_owner':
        // Admin dashboard includes user management and full analytics
        const tenantUsers = await UserService.getUsersByTenant(tenant.id);
        const crmMetrics = await TenantService.getTenantCRMMetrics(tenant.id);
        
        dashboardData.administration = {
          totalUsers: tenantUsers.length,
          activeUsers: tenantUsers.filter(u => u.isActive).length,
          usersByRole: tenantUsers.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
          }, {} as any),
        };
        
        dashboardData.analytics = crmMetrics;
        break;

      case 'agent':
        // Agent dashboard includes property/contact management and performance
        dashboardData.performance = {
          propertiesManaged: properties.length, // Simplified
          contactsManaged: contacts.length, // Simplified
          averageLeadScore: 75, // Would calculate from actual data
          thisMonthActivities: 15, // Would track actual activities
        };
        
        dashboardData.recentActivities = [
          // Would fetch recent property/contact activities by this user
        ];
        break;

      case 'viewer':
        // Viewer dashboard is read-only with basic information
        dashboardData.access = {
          readOnly: true,
          availableResources: ['properties', 'contacts'],
          restrictions: ['Cannot create, update, or delete data'],
        };
        break;

      default:
        dashboardData.features = ['basic_access'];
    }

    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to load dashboard',
    }, { status: 500 });
  }
}