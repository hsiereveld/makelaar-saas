import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookie or Authorization header
    const sessionToken = 
      request.cookies.get('session-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!sessionToken) {
      return NextResponse.json({
        success: false,
        error: 'No session token provided',
      }, { status: 401 });
    }

    // Validate session
    const validation = await AuthService.validateSession(sessionToken);

    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: validation.error || 'Invalid session',
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: validation.user.id,
          email: validation.user.email,
          name: validation.user.name,
          emailVerified: validation.user.emailVerified,
        },
        role: validation.userRole.role,
        tenant: {
          id: validation.tenant.id,
          slug: validation.tenant.slug,
          name: validation.tenant.name,
        },
        permissions: validation.permissions,
      },
    });
  } catch (error: any) {
    console.error('Session validation error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Session validation failed',
    }, { status: 500 });
  }
}