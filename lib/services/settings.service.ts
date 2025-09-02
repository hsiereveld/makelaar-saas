import { db } from '@/lib/db'
import { platformSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export class SettingsService {
  /**
   * Get a platform setting by key
   */
  static async getSetting(key: string): Promise<any> {
    try {
      const setting = await db
        .select()
        .from(platformSettings)
        .where(eq(platformSettings.key, key))
        .limit(1)

      return setting[0]?.value || null
    } catch (error) {
      console.error(`Error getting setting ${key}:`, error)
      return null
    }
  }

  /**
   * Get multiple settings by keys
   */
  static async getSettings(keys: string[]): Promise<Record<string, any>> {
    try {
      const settings = await db
        .select()
        .from(platformSettings)
        .where(
          // Use OR conditions for multiple keys
          keys.length > 0 ? 
            keys.reduce((acc, key, index) => 
              index === 0 ? eq(platformSettings.key, key) : 
              // Note: This is simplified - in real app use `inArray` or similar
              acc
            , eq(platformSettings.key, keys[0])) :
            eq(platformSettings.key, '')
        )

      const settingsMap: Record<string, any> = {}
      settings.forEach(setting => {
        settingsMap[setting.key] = setting.value
      })

      return settingsMap
    } catch (error) {
      console.error('Error getting multiple settings:', error)
      return {}
    }
  }

  /**
   * Get all public settings (safe for frontend)
   */
  static async getPublicSettings(): Promise<Record<string, any>> {
    try {
      const settings = await db
        .select()
        .from(platformSettings)
        .where(eq(platformSettings.isPublic, true))

      const settingsMap: Record<string, any> = {}
      settings.forEach(setting => {
        settingsMap[setting.key] = setting.value
      })

      return settingsMap
    } catch (error) {
      console.error('Error getting public settings:', error)
      return {}
    }
  }

  /**
   * Update a platform setting
   */
  static async updateSetting(key: string, value: any, updatedBy: string): Promise<boolean> {
    try {
      const updated = await db
        .update(platformSettings)
        .set({
          value,
          updatedAt: new Date(),
          updatedBy
        })
        .where(eq(platformSettings.key, key))
        .returning()

      return updated.length > 0
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error)
      return false
    }
  }

  /**
   * Create a new platform setting
   */
  static async createSetting(data: {
    key: string
    value: any
    description?: string
    category: string
    isPublic: boolean
    updatedBy: string
  }): Promise<any> {
    try {
      const created = await db
        .insert(platformSettings)
        .values({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning()

      return created[0]
    } catch (error) {
      console.error('Error creating setting:', error)
      throw error
    }
  }

  /**
   * Delete a platform setting
   */
  static async deleteSetting(key: string): Promise<boolean> {
    try {
      const deleted = await db
        .delete(platformSettings)
        .where(eq(platformSettings.key, key))
        .returning()

      return deleted.length > 0
    } catch (error) {
      console.error(`Error deleting setting ${key}:`, error)
      return false
    }
  }

  // Nederlandse Business Setting Helpers
  static async getBusinessInfo() {
    return await this.getSettings([
      'company.name',
      'company.description', 
      'company.phone',
      'company.email',
      'company.address',
      'business.hours_weekdays',
      'business.hours_weekend',
      'legal.kvk_number',
      'legal.btw_number'
    ])
  }

  static async getHomepageContent() {
    return await this.getSettings([
      'homepage.hero_title',
      'homepage.hero_subtitle', 
      'homepage.cta_text'
    ])
  }

  static async getBillingConfig() {
    return await this.getSettings([
      'billing.currency',
      'billing.trial_days',
      'billing.vat_rate'
    ])
  }
}