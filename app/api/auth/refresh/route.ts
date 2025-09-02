import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie or request body
    const refreshToken = 
      request.cookies.get('refresh-token')?.value ||
      (await request.json()).refreshToken;

    if (!refreshToken) {
      return NextResponse.json({
        success: false,
        error: 'No refresh token provided',
      }, { status: 400 });
    }

    // Refresh session
    const result = await AuthService.refreshSession(refreshToken);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 401 });
    }

    // Set new session cookies
    const response = NextResponse.json({
      success: true,
      message: 'Session refreshed successfully',
      data: {
        sessionToken: result.newSessionToken,
        expiresAt: result.expiresAt,
      },
    });

    response.cookies.set('session-token', result.newSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    response.cookies.set('refresh-token', result.newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/api/auth/refresh',
    });

    return response;
  } catch (error: any) {
    console.error('Token refresh error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Token refresh failed',
    }, { status: 500 });
  }
}