import { NextRequest, NextResponse } from 'next/server';
import { AuthService, UserService } from '@/lib/services/auth.service';

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookie or Authorization header
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

    // Get user profile
    const profile = await UserService.getUserProfile(
      validation.user.id,
      validation.tenant.id
    );

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch profile',
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    // Get update data
    const updateData = await request.json();

    // Update user profile
    const result = await UserService.updateUserProfile(
      validation.user.id,
      updateData
    );

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: result.user,
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update profile',
    }, { status: 500 });
  }
}