import { NextRequest, NextResponse } from 'next/server'
import { createPlatformAdminHandler } from '@/lib/middleware/platform-admin.middleware'
import { db } from '@/lib/db'
import { platformSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// GET /api/platform-admin/settings - Get all platform settings
export const GET = createPlatformAdminHandler(async (request, context) => {
  try {
    const settings = await db.select().from(platformSettings)
    
    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Error fetching platform settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch platform settings',
      data: []
    }, { status: 500 })
  }
})

// PUT /api/platform-admin/settings - Update a platform setting
export const PUT = createPlatformAdminHandler(async (request, context) => {
  try {
    const body = await request.json()
    const { id, key, value, category, isPublic } = body

    if (!id || !key) {
      return NextResponse.json({
        success: false,
        error: 'Setting ID and key are required'
      }, { status: 400 })
    }

    // Update the setting
    const updated = await db
      .update(platformSettings)
      .set({
        key,
        value: value, // Already JSON in database
        category,
        isPublic,
        updatedAt: new Date(),
        updatedBy: context.user.id
      })
      .where(eq(platformSettings.id, id))
      .returning()

    if (updated.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Setting not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updated[0],
      message: `Setting "${key}" successfully updated`
    })
  } catch (error) {
    console.error('Error updating platform setting:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update platform setting'
    }, { status: 500 })
  }
})

// POST /api/platform-admin/settings - Create a new platform setting
export const POST = createPlatformAdminHandler(async (request, context) => {
  try {
    const body = await request.json()
    const { key, value, description, category, isPublic } = body

    if (!key || value === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Setting key and value are required'
      }, { status: 400 })
    }

    // Create new setting
    const newSetting = await db
      .insert(platformSettings)
      .values({
        key,
        value: value, // Already JSON in database
        description,
        category: category || 'general',
        isPublic: isPublic ?? false,
        updatedBy: context.user.id
      })
      .returning()

    return NextResponse.json({
      success: true,
      data: newSetting[0],
      message: `Setting "${key}" successfully created`
    })
  } catch (error) {
    console.error('Error creating platform setting:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create platform setting'
    }, { status: 500 })
  }
})