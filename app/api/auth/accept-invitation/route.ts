import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const { inviteToken, password, name } = data;
    if (!inviteToken) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: inviteToken',
      }, { status: 400 });
    }

    // Accept invitation
    const result = await UserService.acceptInvitation(inviteToken, password);

    return NextResponse.json({
      success: true,
      message: 'Invitation accepted successfully',
      data: {
        userRole: {
          role: result.userRole.role,
          isActive: result.userRole.isActive,
          joinedAt: result.userRole.joinedAt,
        },
      },
    });
  } catch (error: any) {
    console.error('Accept invitation error:', error);
    
    if (error.message.includes('expired')) {
      return NextResponse.json({
        success: false,
        error: 'Invitation has expired',
      }, { status: 400 });
    }
    
    if (error.message.includes('invalid')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid invitation token',
      }, { status: 400 });
    }
    
    if (error.message.includes('password')) {
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to accept invitation',
    }, { status: 500 });
  }
}