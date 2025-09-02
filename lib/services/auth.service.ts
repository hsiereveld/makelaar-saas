import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'
import type { 
  User, 
  Account, 
  UserTenantRole, 
  UserSession, 
  Permission,
  UserRole 
} from '@/lib/types/database'

// JWT Secret - In production, this should be from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

// Input types
export interface RegisterUserInput {
  email: string
  password: string
  name: string
  tenantSlug: string
  role: UserRole
  image?: string
}

export interface LoginUserInput {
  email: string
  password: string
  tenantSlug: string
}

export interface CreateSessionInput {
  userId: string
  tenantId: string
  ipAddress?: string
  userAgent?: string
}

export interface InviteUserInput {
  email: string
  tenantId: string
  role: UserRole
  invitedBy: string
}

// Password validation
export interface PasswordValidation {
  valid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
}

export class AuthService {
  /**
   * Register a new user with tenant assignment
   */
  static async registerUser(input: RegisterUserInput): Promise<any> {
    // Validate password strength
    const passwordValidation = this.validatePasswordStrength(input.password)
    if (!passwordValidation.valid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`)
    }

    // Check if tenant exists
    const tenant = await db.select().from(schema.tenants).where(eq(schema.tenants.slug, input.tenantSlug))
    if (!tenant[0]) {
      throw new Error('Tenant not found')
    }

    // Check if user already exists
    const existingUser = await db.select().from(schema.users).where(eq(schema.users.email, input.email.toLowerCase()))
    if (existingUser[0]) {
      throw new Error('A user with this email already exists')
    }

    // Hash password
    const hashedPassword = await this.hashPassword(input.password)

    // Create user
    const newUser = await db.insert(schema.users).values({
      email: input.email.toLowerCase(),
      name: input.name,
      image: input.image,
      emailVerified: false,
    }).returning()

    // Create account
    const newAccount = await db.insert(schema.accounts).values({
      userId: newUser[0].id,
      accountId: newUser[0].id,
      providerId: 'credential',
      password: hashedPassword,
    }).returning()

    // Assign user to tenant with role
    const userTenantRole = await db.insert(schema.userTenantRoles).values({
      userId: newUser[0].id,
      tenantId: tenant[0].id,
      role: input.role,
      isActive: true,
    }).returning()

    return {
      success: true,
      user: newUser[0],
      account: newAccount[0],
      userTenantRole: userTenantRole[0],
    }
  }

  /**
   * Authenticate user login
   */
  static async loginUser(input: LoginUserInput): Promise<any> {
    // Find user by email
    const user = await db.select().from(schema.users).where(eq(schema.users.email, input.email.toLowerCase()))
    if (!user[0]) {
      throw new Error('Invalid credentials')
    }

    // Get user account for password verification
    const account = await db
      .select()
      .from(schema.accounts)
      .where(and(
        eq(schema.accounts.userId, user[0].id),
        eq(schema.accounts.providerId, 'credential')
      ))

    if (!account[0] || !account[0].password) {
      throw new Error('Invalid credentials')
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(input.password, account[0].password)
    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    // Check tenant access
    const tenant = await db.select().from(schema.tenants).where(eq(schema.tenants.slug, input.tenantSlug))
    if (!tenant[0]) {
      throw new Error('Tenant not found')
    }

    // Check user role in tenant
    const userRole = await db
      .select()
      .from(schema.userTenantRoles)
      .where(and(
        eq(schema.userTenantRoles.userId, user[0].id),
        eq(schema.userTenantRoles.tenantId, tenant[0].id),
        eq(schema.userTenantRoles.isActive, true)
      ))

    if (!userRole[0]) {
      throw new Error('User does not have access to this tenant')
    }

    // Create session
    const session = await this.createSession({
      userId: user[0].id,
      tenantId: tenant[0].id,
    })

    return {
      success: true,
      user: user[0],
      session,
      sessionToken: session.sessionToken,
      refreshToken: session.refreshToken,
      userRole: userRole[0],
      tenant: tenant[0],
    }
  }

  /**
   * Create a new session for user
   */
  static async createSession(input: CreateSessionInput): Promise<UserSession> {
    const sessionToken = this.generateSecureToken()
    const refreshToken = this.generateSecureToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const session = await db.insert(schema.userSessions).values({
      userId: input.userId,
      tenantId: input.tenantId,
      sessionToken,
      refreshToken,
      expiresAt,
      refreshExpiresAt,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      isActive: true,
    }).returning()

    return session[0]
  }

  /**
   * Validate session token
   */
  static async validateSession(sessionToken: string): Promise<any> {
    const session = await db
      .select({
        session: schema.userSessions,
        user: schema.users,
        userRole: schema.userTenantRoles,
        tenant: schema.tenants,
      })
      .from(schema.userSessions)
      .innerJoin(schema.users, eq(schema.userSessions.userId, schema.users.id))
      .innerJoin(schema.userTenantRoles, and(
        eq(schema.userSessions.userId, schema.userTenantRoles.userId),
        eq(schema.userSessions.tenantId, schema.userTenantRoles.tenantId)
      ))
      .innerJoin(schema.tenants, eq(schema.userSessions.tenantId, schema.tenants.id))
      .where(and(
        eq(schema.userSessions.sessionToken, sessionToken),
        eq(schema.userSessions.isActive, true)
      ))

    if (!session[0]) {
      return { valid: false, error: 'Invalid session' }
    }

    // Check if session is expired
    if (new Date() > session[0].session.expiresAt) {
      return { valid: false, error: 'Session expired' }
    }

    // Update last accessed time
    await db
      .update(schema.userSessions)
      .set({ lastAccessedAt: new Date() })
      .where(eq(schema.userSessions.sessionToken, sessionToken))

    // Get user permissions
    const permissions = await PermissionService.getUserPermissions(
      session[0].user.id,
      session[0].tenant.id
    )

    return {
      valid: true,
      user: session[0].user,
      userRole: session[0].userRole,
      tenant: session[0].tenant,
      permissions: permissions.permissions,
    }
  }

  /**
   * Validate session for specific tenant
   */
  static async validateSessionForTenant(sessionToken: string, tenantId: string): Promise<any> {
    const validation = await this.validateSession(sessionToken)
    
    if (!validation.valid) {
      return validation
    }

    if (validation.tenant.id !== tenantId) {
      return { valid: false, error: 'Session not valid for this tenant' }
    }

    return { ...validation, tenantId }
  }

  /**
   * Refresh session token
   */
  static async refreshSession(refreshToken: string): Promise<any> {
    const session = await db
      .select()
      .from(schema.userSessions)
      .where(and(
        eq(userSessions.refreshToken, refreshToken),
        eq(schema.userSessions.isActive, true)
      ))

    if (!session[0]) {
      return { success: false, error: 'Invalid refresh token' }
    }

    // Check if refresh token is expired
    if (new Date() > session[0].refreshExpiresAt) {
      return { success: false, error: 'Refresh token expired' }
    }

    // Generate new tokens
    const newSessionToken = this.generateSecureToken()
    const newRefreshToken = this.generateSecureToken()
    const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const newRefreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    // Update session with new tokens
    await db
      .update(schema.userSessions)
      .set({
        sessionToken: newSessionToken,
        refreshToken: newRefreshToken,
        expiresAt: newExpiresAt,
        refreshExpiresAt: newRefreshExpiresAt,
        lastAccessedAt: new Date(),
      })
      .where(eq(userSessions.id, session[0].id))

    return {
      success: true,
      newSessionToken,
      newRefreshToken,
      expiresAt: newExpiresAt,
    }
  }

  /**
   * Logout user by invalidating session
   */
  static async logoutUser(sessionToken: string): Promise<any> {
    const result = await db
      .update(schema.userSessions)
      .set({ isActive: false })
      .where(eq(schema.userSessions.sessionToken, sessionToken))
      .returning()

    return {
      success: result.length > 0,
      message: result.length > 0 ? 'Logged out successfully' : 'Session not found',
    }
  }

  /**
   * Generate JWT token with tenant and role claims
   */
  static async generateJWT(data: {
    userId: string
    tenantId: string
    role: string
    email: string
    expiresIn?: string
  }): Promise<string> {
    const payload = {
      userId: data.userId,
      tenantId: data.tenantId,
      role: data.role,
      email: data.email,
      iat: Math.floor(Date.now() / 1000),
    }

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: data.expiresIn || '24h',
    })
  }

  /**
   * Verify and decode JWT token
   */
  static async verifyJWT(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      return {
        valid: true,
        payload: decoded,
      }
    } catch (error: any) {
      return {
        valid: false,
        error: error.message,
      }
    }
  }

  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash)
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): PasswordValidation {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    let strength: 'weak' | 'medium' | 'strong' = 'weak'
    if (errors.length === 0) {
      strength = password.length >= 12 ? 'strong' : 'medium'
    }

    return {
      valid: errors.length === 0,
      errors,
      strength,
    }
  }

  /**
   * Generate secure random token
   */
  private static generateSecureToken(): string {
    return randomBytes(32).toString('hex')
  }
}

export class UserService {
  /**
   * Get user profile with tenant context
   */
  static async getUserProfile(userId: string, tenantId: string): Promise<any> {
    const result = await db
      .select({
        user: users,
        role: schema.userTenantRoles.role,
        tenant: schema.tenants,
        isActive: schema.userTenantRoles.isActive,
      })
      .from(schema.users)
      .innerJoin(schema.userTenantRoles, eq(schema.users.id, schema.userTenantRoles.userId))
      .innerJoin(schema.tenants, eq(schema.userTenantRoles.tenantId, schema.tenants.id))
      .where(and(
        eq(schema.users.id, userId),
        eq(schema.userTenantRoles.tenantId, tenantId),
        eq(schema.userTenantRoles.isActive, true)
      ))

    if (!result[0]) {
      return null
    }

    const permissions = await PermissionService.getUserPermissions(userId, tenantId)

    return {
      user: result[0].user,
      role: result[0].role,
      tenant: result[0].tenant,
      permissions: permissions.permissions,
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId: string, updateData: any): Promise<any> {
    const sanitizedData = {
      ...updateData,
      updatedAt: new Date(),
    }

    const result = await db
      .update(users)
      .set(sanitizedData)
      .where(eq(schema.users.id, userId))
      .returning()

    return {
      success: result.length > 0,
      user: result[0],
    }
  }

  /**
   * Change user password
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<any> {
    // Get current account
    const account = await db
      .select()
      .from(schema.accounts)
      .where(and(
        eq(schema.accounts.userId, userId),
        eq(schema.accounts.providerId, 'credential')
      ))

    if (!account[0] || !account[0].password) {
      throw new Error('Account not found or not using password authentication')
    }

    // Verify current password
    const isCurrentValid = await AuthService.verifyPassword(currentPassword, account[0].password)
    if (!isCurrentValid) {
      throw new Error('Current password is incorrect')
    }

    // Validate new password
    const passwordValidation = AuthService.validatePasswordStrength(newPassword)
    if (!passwordValidation.valid) {
      throw new Error(`New password validation failed: ${passwordValidation.errors.join(', ')}`)
    }

    // Hash new password
    const hashedNewPassword = await AuthService.hashPassword(newPassword)

    // Update account
    await db
      .update(accounts)
      .set({ 
        password: hashedNewPassword,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, account[0].id))

    return { success: true }
  }

  /**
   * Get users by tenant
   */
  static async getUsersByTenant(tenantId: string): Promise<any[]> {
    const result = await db
      .select({
        id: schema.users.id,
        email: schema.users.email,
        name: users.name,
        image: users.image,
        role: schema.userTenantRoles.role,
        isActive: schema.userTenantRoles.isActive,
        joinedAt: schema.userTenantRoles.joinedAt,
        tenantId: schema.userTenantRoles.tenantId,
      })
      .from(schema.users)
      .innerJoin(schema.userTenantRoles, eq(schema.users.id, schema.userTenantRoles.userId))
      .where(eq(schema.userTenantRoles.tenantId, tenantId))

    return result
  }

  /**
   * Update user role in tenant
   */
  static async updateUserRole(
    userId: string,
    tenantId: string,
    newRole: UserRole
  ): Promise<any> {
    const result = await db
      .update(schema.userTenantRoles)
      .set({ role: newRole })
      .where(and(
        eq(schema.userTenantRoles.userId, userId),
        eq(schema.userTenantRoles.tenantId, tenantId)
      ))
      .returning()

    return {
      success: result.length > 0,
      userRole: result[0],
    }
  }

  /**
   * Invite user to tenant
   */
  static async inviteUserToTenant(input: InviteUserInput): Promise<any> {
    // Check if user exists
    const user = await db.select().from(schema.users).where(eq(schema.users.email, input.email.toLowerCase()))
    
    let userId: string
    if (!user[0]) {
      // Create user if doesn't exist
      const newUser = await db.insert(schema.users).values({
        email: input.email.toLowerCase(),
        name: input.email.split('@')[0], // Use email prefix as temporary name
        emailVerified: false,
      }).returning()
      userId = newUser[0].id
    } else {
      userId = user[0].id
    }

    // Generate invite token
    const inviteToken = AuthService.generateSecureToken()
    const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Create user-tenant role (inactive until accepted)
    const userTenantRole = await db.insert(schema.userTenantRoles).values({
      userId,
      tenantId: input.tenantId,
      role: input.role,
      isActive: false,
      invitedBy: input.invitedBy,
      inviteToken,
      inviteExpiresAt,
    }).returning()

    return {
      success: true,
      inviteToken,
      userTenantRole: userTenantRole[0],
    }
  }

  /**
   * Accept invitation
   */
  static async acceptInvitation(inviteToken: string, password?: string): Promise<any> {
    // Find invitation
    const invitation = await db
      .select()
      .from(schema.userTenantRoles)
      .where(and(
        eq(schema.userTenantRoles.inviteToken, inviteToken),
        eq(schema.userTenantRoles.isActive, false)
      ))

    if (!invitation[0]) {
      throw new Error('Invalid or expired invitation')
    }

    // Check if invitation is expired
    if (invitation[0].inviteExpiresAt && new Date() > invitation[0].inviteExpiresAt) {
      throw new Error('Invitation has expired')
    }

    // If password provided, create account
    if (password) {
      const passwordValidation = AuthService.validatePasswordStrength(password)
      if (!passwordValidation.valid) {
        throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`)
      }

      const hashedPassword = await AuthService.hashPassword(password)
      
      await db.insert(schema.accounts).values({
        userId: invitation[0].userId,
        accountId: invitation[0].userId,
        providerId: 'credential',
        password: hashedPassword,
      })
    }

    // Activate the role
    const activatedRole = await db
      .update(schema.userTenantRoles)
      .set({
        isActive: true,
        joinedAt: new Date(),
        inviteToken: null,
        inviteExpiresAt: null,
      })
      .where(eq(schema.userTenantRoles.id, invitation[0].id))
      .returning()

    return {
      success: true,
      userRole: activatedRole[0],
    }
  }

  /**
   * Deactivate user in tenant
   */
  static async deactivateUserInTenant(userId: string, tenantId: string): Promise<any> {
    const result = await db
      .update(schema.userTenantRoles)
      .set({ isActive: false })
      .where(and(
        eq(schema.userTenantRoles.userId, userId),
        eq(schema.userTenantRoles.tenantId, tenantId)
      ))
      .returning()

    return {
      success: result.length > 0,
      userRole: result[0],
    }
  }

  /**
   * Generate secure token (delegated to AuthService)
   */
  private static generateSecureToken(): string {
    return (AuthService as any).generateSecureToken()
  }
}

export class PermissionService {
  /**
   * Check if user has specific permission
   */
  static async userHasPermission(
    userId: string,
    tenantId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId, tenantId)
    
    return userPermissions.permissions.some((perm: any) => 
      perm.resource === resource && perm.action === action
    )
  }

  /**
   * Get all permissions for user in tenant
   */
  static async getUserPermissions(userId: string, tenantId: string): Promise<any> {
    const result = await db
      .select({
        role: schema.userTenantRoles.role,
        tenant: schema.tenants,
        permission: schema.permissions,
      })
      .from(schema.userTenantRoles)
      .innerJoin(schema.tenants, eq(schema.userTenantRoles.tenantId, schema.tenants.id))
      .leftJoin(schema.rolePermissions, eq(schema.userTenantRoles.role, schema.rolePermissions.role))
      .leftJoin(schema.permissions, eq(schema.rolePermissions.permissionId, schema.permissions.id))
      .where(and(
        eq(schema.userTenantRoles.userId, userId),
        eq(schema.userTenantRoles.tenantId, tenantId),
        eq(schema.userTenantRoles.isActive, true)
      ))

    const userRole = result[0]?.role
    const tenant = result[0]?.tenant
    const permissions = result.map(r => r.permission).filter(Boolean) // Filter out null permissions

    return {
      role: userRole,
      tenant,
      permissions,
    }
  }

  /**
   * Seed default permissions for the system
   */
  static async seedDefaultPermissions(): Promise<void> {
    const defaultPermissions = [
      // Property permissions
      { name: 'create_properties', resource: 'property', action: 'create' },
      { name: 'read_properties', resource: 'property', action: 'read' },
      { name: 'update_properties', resource: 'property', action: 'update' },
      { name: 'delete_properties', resource: 'property', action: 'delete' },
      
      // Contact permissions
      { name: 'create_contacts', resource: 'contact', action: 'create' },
      { name: 'read_contacts', resource: 'contact', action: 'read' },
      { name: 'update_contacts', resource: 'contact', action: 'update' },
      { name: 'delete_contacts', resource: 'contact', action: 'delete' },
      
      // Lead permissions
      { name: 'create_leads', resource: 'lead', action: 'create' },
      { name: 'read_leads', resource: 'lead', action: 'read' },
      { name: 'update_leads', resource: 'lead', action: 'update' },
      { name: 'delete_leads', resource: 'lead', action: 'delete' },
      
      // User permissions
      { name: 'invite_users', resource: 'user', action: 'create' },
      { name: 'read_users', resource: 'user', action: 'read' },
      { name: 'update_users', resource: 'user', action: 'update' },
      { name: 'manage_users', resource: 'user', action: 'manage' },
      
      // Tenant permissions
      { name: 'read_tenant', resource: 'tenant', action: 'read' },
      { name: 'update_tenant', resource: 'tenant', action: 'update' },
      { name: 'manage_tenant', resource: 'tenant', action: 'manage' },
    ]

    for (const perm of defaultPermissions) {
      try {
        await db.insert(schema.permissions).values(perm)
      } catch (error) {
        // Permission might already exist, skip
      }
    }
  }
}