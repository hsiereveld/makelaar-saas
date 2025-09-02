import { NextRequest, NextResponse } from 'next/server';
import { AuthService, UserService } from '@/lib/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    // Get session token
    const sessionToken = 
      request.cookies.get('session-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!sessionToken) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
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

    // Get password data
    const data = await request.json();
    const { currentPassword, newPassword } = data;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: currentPassword, newPassword',
      }, { status: 400 });
    }

    // Change password
    const result = await UserService.changePassword(
      validation.user.id,
      currentPassword,
      newPassword
    );

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    console.error('Password change error:', error);
    
    if (error.message.includes('incorrect') || error.message.includes('current')) {
      return NextResponse.json({
        success: false,
        error: 'Current password is incorrect',
      }, { status: 400 });
    }
    
    if (error.message.includes('validation')) {
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to change password',
    }, { status: 500 });
  }
}