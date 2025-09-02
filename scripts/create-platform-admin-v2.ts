import { db } from '../lib/db'
import { users, userTenantRoles, accounts } from '../lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { hash } from 'bcrypt'
import { sql } from 'drizzle-orm'

async function createPlatformAdminV2() {
  try {
    const email = 'admin@makelaar-saas.com'
    const password = 'SuperAdmin123!'
    const name = 'Platform Administrator'

    console.log('🚀 Creating platform super-admin...')
    console.log('Email:', email)

    // First, let's try to manually alter the schema with raw SQL
    console.log('⚡ Updating database schema for platform admins...')
    
    try {
      // Drop index if exists
      await db.execute(sql`DROP INDEX IF EXISTS "user_tenant_role_idx"`)
      console.log('✅ Dropped existing index')
      
      // Make tenant_id nullable
      await db.execute(sql`ALTER TABLE "user_tenant_roles" ALTER COLUMN "tenant_id" DROP NOT NULL`)
      console.log('✅ Made tenant_id nullable')
      
      // Recreate index to handle NULL values
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "user_tenant_role_idx" ON "user_tenant_roles" ("user_id", "tenant_id")`)
      console.log('✅ Recreated index')
      
    } catch (schemaError) {
      console.log('⚠️ Schema update error (may already be applied):', schemaError.message)
    }

    // Check if admin already exists
    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))

    let userId: string

    if (existingAdmin) {
      console.log('👤 Using existing user:', existingAdmin.email)
      userId = existingAdmin.id
    } else {
      // Hash password
      const hashedPassword = await hash(password, 12)

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          email,
          name,
          emailVerified: true,
        })
        .returning()

      // Create account for password authentication
      await db
        .insert(accounts)
        .values({
          userId: newUser.id,
          accountId: email,
          providerId: 'credential',
          password: hashedPassword,
        })

      console.log('✅ Platform admin user created:', newUser.id)
      userId = newUser.id
    }

    // Check if platform admin role already exists
    const [existingRole] = await db
      .select()
      .from(userTenantRoles)
      .where(
        and(
          eq(userTenantRoles.userId, userId),
          eq(userTenantRoles.role, 'platform_admin'),
          isNull(userTenantRoles.tenantId)
        )
      )

    if (existingRole) {
      console.log('✅ Platform admin role already exists!')
    } else {
      // Create platform admin role with NULL tenant_id
      await db
        .insert(userTenantRoles)
        .values({
          userId: userId,
          tenantId: null, // Platform admin is global
          role: 'platform_admin',
          isActive: true,
        })

      console.log('✅ Platform admin role assigned!')
    }

    console.log('')
    console.log('🎉 Platform super-administrator setup complete!')
    console.log('')
    console.log('🔐 Login details:')
    console.log('URL: http://localhost:3000/platform-admin/login')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('')
    console.log('🎛️ Platform Admin Dashboard:')
    console.log('URL: http://localhost:3000/platform-admin')
    console.log('')
    console.log('⚠️  IMPORTANT: Change the default password after first login!')

    return { success: true, userId, email }

  } catch (error) {
    console.error('❌ Error creating platform admin:', error)
    return { success: false, error: error.message }
  }
}

if (require.main === module) {
  createPlatformAdminV2().then((result) => {
    if (result.success) {
      console.log('✅ Script completed successfully!')
      process.exit(0)
    } else {
      console.log('❌ Script failed:', result.error)
      process.exit(1)
    }
  }).catch((error) => {
    console.error('💥 Script crashed:', error)
    process.exit(1)
  })
}

export { createPlatformAdminV2 }