import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    // Get session token from cookie or Authorization header
    const sessionToken = 
      request.cookies.get('session-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!sessionToken) {
      return NextResponse.json({
        success: false,
        error: 'No session token provided',
      }, { status: 400 });
    }

    // Logout user
    const result = await AuthService.logoutUser(sessionToken);

    // Clear cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    response.cookies.delete('session-token');
    response.cookies.delete('refresh-token');

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Logout failed',
    }, { status: 500 });
  }
}