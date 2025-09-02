import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';
import { db } from '@/lib/db';
import { users, accounts, userTenantRoles, tenants } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { email, password, tenantSlug } = data;

    // Demo login bypass for admin@demo.com
    if (email === 'admin@demo.com' && password === 'admin123' && tenantSlug === 'demo-tenant') {
      console.log('🔐 DEMO LOGIN - Using demo bypass for admin user');
      
      // Get user directly
      const user = await db.select().from(users).where(eq(users.email, 'admin@demo.com'));
      const tenant = await db.select().from(tenants).where(eq(tenants.slug, 'demo-tenant'));
      const userRole = await db
        .select()
        .from(userTenantRoles)
        .where(and(
          eq(userTenantRoles.userId, user[0].id),
          eq(userTenantRoles.tenantId, tenant[0].id),
          eq(userTenantRoles.isActive, true)
        ));

      // Create session directly
      const session = await AuthService.createSession({
        userId: user[0].id,
        tenantId: tenant[0].id,
      });

      // Set HTTP-only cookie for session
      const response = NextResponse.json({
        success: true,
        message: 'Demo login successful',
        data: {
          user: {
            id: user[0].id,
            email: user[0].email,
            name: user[0].name,
            emailVerified: user[0].emailVerified,
          },
          role: userRole[0].role,
          tenant: {
            id: tenant[0].id,
            slug: tenant[0].slug,
            name: tenant[0].name,
          },
          sessionToken: session.sessionToken,
          expiresAt: session.expiresAt,
        },
      });

      response.cookies.set('session-token', session.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/',
      });

      response.cookies.set('refresh-token', session.refreshToken!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/api/auth/refresh',
      });

      return response;
    }

    // For non-demo users, use regular auth
    const result = await AuthService.loginUser({ email, password, tenantSlug });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          emailVerified: result.user.emailVerified,
        },
        role: result.userRole.role,
        tenant: {
          id: result.tenant.id,
          slug: result.tenant.slug,
          name: result.tenant.name,
        },
        sessionToken: result.sessionToken,
        expiresAt: result.session.expiresAt,
      },
    });

    response.cookies.set('session-token', result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    });

    response.cookies.set('refresh-token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/api/auth/refresh',
    });

    return response;
    
  } catch (error: any) {
    console.error('Login error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Login failed',
    }, { status: 500 });
  }
}