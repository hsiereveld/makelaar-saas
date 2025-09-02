import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const { email, password, name, tenantSlug, role } = data;
    if (!email || !password || !name || !tenantSlug || !role) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: email, password, name, tenantSlug, role',
      }, { status: 400 });
    }

    // Register user
    const result = await AuthService.registerUser({
      email,
      password,
      name,
      tenantSlug,
      role,
      image: data.image,
    });

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          emailVerified: result.user.emailVerified,
        },
        role: result.userTenantRole.role,
        tenant: tenantSlug,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.message.includes('password')) {
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 400 });
    }
    
    if (error.message.includes('already exists')) {
      return NextResponse.json({
        success: false,
        error: 'A user with this email already exists',
      }, { status: 409 });
    }
    
    if (error.message.includes('Tenant not found')) {
      return NextResponse.json({
        success: false,
        error: 'Tenant not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      error: 'Registration failed',
    }, { status: 500 });
  }
}