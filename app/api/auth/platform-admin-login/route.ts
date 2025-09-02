import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { users, accounts, userTenantRoles } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { compare } from 'bcrypt'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const { email, password } = data;
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: email, password',
      }, { status: 400 });
    }

    console.log('Platform admin login attempt:', email);

    // Get user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      console.log('User not found:', email);
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials',
      }, { status: 401 });
    }

    // Get user account for password check
    const [account] = await db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.userId, user.id),
          eq(accounts.providerId, 'credential')
        )
      );

    if (!account || !account.password) {
      console.log('No password account found for user:', email);
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials',
      }, { status: 401 });
    }

    // Verify password
    const validPassword = await compare(password, account.password);
    if (!validPassword) {
      console.log('Invalid password for user:', email);
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials',
      }, { status: 401 });
    }

    // Check if user has platform_admin role
    const [platformAdminRole] = await db
      .select()
      .from(userTenantRoles)
      .where(
        and(
          eq(userTenantRoles.userId, user.id),
          eq(userTenantRoles.role, 'platform_admin'),
          isNull(userTenantRoles.tenantId),
          eq(userTenantRoles.isActive, true)
        )
      );

    if (!platformAdminRole) {
      console.log('User does not have platform_admin role:', email);
      return NextResponse.json({
        success: false,
        error: 'Platform admin access required',
      }, { status: 403 });
    }

    console.log('Platform admin authentication successful:', email);

    // Create JWT token for platform admin
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: 'platform_admin',
      tenantId: null, // Platform admins are global
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!);

    // Return success response
    const response = NextResponse.json({
      success: true,
      message: 'Platform admin login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
        },
        role: 'platform_admin',
        token: token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    });

    // Set session cookie
    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Platform admin login error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Login failed',
    }, { status: 500 });
  }
}