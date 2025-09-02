import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const { email, password, tenantSlug } = data;
    if (!email || !password || !tenantSlug) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: email, password, tenantSlug',
      }, { status: 400 });
    }

    // Authenticate user
    const result = await AuthService.loginUser({
      email,
      password,
      tenantSlug,
    });

    // Set session cookie
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

    // Set HTTP-only cookie for session
    response.cookies.set('session-token', result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    // Set refresh token cookie
    response.cookies.set('refresh-token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/api/auth/refresh',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    
    if (error.message.includes('Invalid credentials')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password',
      }, { status: 401 });
    }
    
    if (error.message.includes('not found')) {
      return NextResponse.json({
        success: false,
        error: 'User or tenant not found',
      }, { status: 404 });
    }
    
    if (error.message.includes('access')) {
      return NextResponse.json({
        success: false,
        error: 'User does not have access to this tenant',
      }, { status: 403 });
    }

    return NextResponse.json({
      success: false,
      error: 'Login failed',
    }, { status: 500 });
  }
}