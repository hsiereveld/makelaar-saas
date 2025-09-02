import { db } from '@/lib/db'
import { tenantSettings, tenantFeatureFlags, tenantBranding } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import type { TenantSettings, TenantFeatureFlag, TenantBranding } from '@/lib/types/database'

// Input types for tenant configuration
export interface SetSettingInput {
  tenantId: string
  category: string
  key: string
  value: any
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array'
  isPublic?: boolean
  description?: string
  validationRules?: any
}

export interface SetFeatureFlagInput {
  tenantId: string
  featureName: string
  isEnabled: boolean
  enabledBy?: string
  configuration?: any
  expiresAt?: Date
}

export interface UpdateBrandingInput {
  tenantId: string
  logoUrl?: string
  faviconUrl?: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  fontFamily?: string
  customCss?: string
  websiteUrl?: string
  contactEmail?: string
  contactPhone?: string
  socialMedia?: any
}

export class TenantConfigService {
  /**
   * Set or update a tenant setting
   */
  static async setSetting(input: SetSettingInput): Promise<TenantSettings> {
    // Validate category and key
    if (!this.validateCategoryAndKey(input.category, input.key)) {
      throw new Error('Invalid category or key format')
    }

    // Validate data type matches value
    if (!this.validateDataType(input.value, input.dataType)) {
      throw new Error(`Value does not match specified data type: ${input.dataType}`)
    }

    // Sanitize value if it's a string
    const sanitizedValue = typeof input.value === 'string' 
      ? this.sanitizeValue(input.value)
      : input.value

    const settingData = {
      tenantId: input.tenantId,
      category: input.category,
      key: input.key,
      value: sanitizedValue,
      dataType: input.dataType,
      isPublic: input.isPublic || false,
      description: input.description,
      validationRules: input.validationRules || {},
      updatedAt: new Date(),
    }

    // Check if setting exists
    const existingSetting = await this.getSetting(input.tenantId, input.category, input.key)

    if (existingSetting) {
      // Update existing setting
      const result = await db
        .update(tenantSettings)
        .set(settingData)
        .where(eq(tenantSettings.id, existingSetting.id))
        .returning()
      
      return result[0]
    } else {
      // Create new setting
      const result = await db.insert(tenantSettings).values(settingData).returning()
      return result[0]
    }
  }

  /**
   * Get a specific tenant setting
   */
  static async getSetting(
    tenantId: string,
    category: string,
    key: string
  ): Promise<TenantSettings | null> {
    const result = await db
      .select()
      .from(tenantSettings)
      .where(and(
        eq(tenantSettings.tenantId, tenantId),
        eq(tenantSettings.category, category),
        eq(tenantSettings.key, key)
      ))

    return result[0] || null
  }

  /**
   * Get all settings for a category
   */
  static async getSettingsByCategory(
    tenantId: string,
    category: string
  ): Promise<TenantSettings[]> {
    return await db
      .select()
      .from(tenantSettings)
      .where(and(
        eq(tenantSettings.tenantId, tenantId),
        eq(tenantSettings.category, category)
      ))
  }

  /**
   * Get all settings for a tenant
   */
  static async getAllSettings(tenantId: string): Promise<TenantSettings[]> {
    return await db
      .select()
      .from(tenantSettings)
      .where(eq(tenantSettings.tenantId, tenantId))
  }

  /**
   * Get tenant configuration structured by category
   */
  static async getTenantConfiguration(tenantId: string): Promise<any> {
    const settings = await this.getAllSettings(tenantId)
    const features = await TenantFeatureService.getAllFeatures(tenantId)
    const branding = await TenantBrandingService.getBranding(tenantId)

    // Structure settings by category
    const structuredSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {}
      }
      acc[setting.category][setting.key] = setting.value
      return acc
    }, {} as any)

    // Structure features by name
    const structuredFeatures = features.reduce((acc, feature) => {
      acc[feature.featureName] = {
        enabled: feature.isEnabled,
        configuration: feature.configuration,
        expiresAt: feature.expiresAt,
      }
      return acc
    }, {} as any)

    return {
      tenantId,
      settings: structuredSettings,
      features: structuredFeatures,
      branding,
    }
  }

  /**
   * Get public configuration (safe for frontend)
   */
  static async getPublicConfiguration(tenantId: string): Promise<any> {
    const publicSettings = await db
      .select()
      .from(tenantSettings)
      .where(and(
        eq(tenantSettings.tenantId, tenantId),
        eq(tenantSettings.isPublic, true)
      ))

    const features = await TenantFeatureService.getEnabledFeatures(tenantId)
    const branding = await TenantBrandingService.getBranding(tenantId)

    const structuredSettings = publicSettings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {}
      }
      acc[setting.category][setting.key] = setting.value
      return acc
    }, {} as any)

    const structuredFeatures = features.reduce((acc, feature) => {
      acc[feature.featureName] = {
        enabled: true,
        configuration: feature.configuration,
      }
      return acc
    }, {} as any)

    return {
      tenantId,
      settings: structuredSettings,
      features: structuredFeatures,
      branding: {
        logoUrl: branding?.logoUrl,
        primaryColor: branding?.primaryColor,
        secondaryColor: branding?.secondaryColor,
        accentColor: branding?.accentColor,
        fontFamily: branding?.fontFamily,
      },
    }
  }

  /**
   * Update bulk configuration
   */
  static async updateBulkConfiguration(
    tenantId: string,
    config: {
      settings?: Array<{
        category: string
        key: string
        value: any
        dataType: string
        isPublic?: boolean
      }>
      branding?: any
      features?: Array<{ name: string; enabled: boolean; configuration?: any }>
    }
  ): Promise<any> {
    const results = {
      settingsUpdated: 0,
      brandingUpdated: false,
      featuresUpdated: 0,
      settings: [],
      features: [],
    } as any

    // Update settings
    if (config.settings) {
      for (const setting of config.settings) {
        const updatedSetting = await this.setSetting({
          tenantId,
          ...setting,
          dataType: setting.dataType as any,
        })
        results.settings.push(updatedSetting)
        results.settingsUpdated++
      }
    }

    // Update branding
    if (config.branding) {
      await TenantBrandingService.updateBranding({
        tenantId,
        ...config.branding,
      })
      results.brandingUpdated = true
    }

    // Update features
    if (config.features) {
      for (const feature of config.features) {
        const updatedFeature = await TenantFeatureService.setFeatureFlag({
          tenantId,
          featureName: feature.name,
          isEnabled: feature.enabled,
          configuration: feature.configuration,
        })
        results.features.push(updatedFeature)
        results.featuresUpdated++
      }
    }

    return results
  }

  /**
   * Export tenant configuration
   */
  static async exportConfiguration(tenantId: string): Promise<any> {
    const config = await this.getTenantConfiguration(tenantId)
    
    return {
      ...config,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }
  }

  /**
   * Initialize default configuration for new tenant
   */
  static async initializeDefaultConfiguration(tenantId: string): Promise<any> {
    const defaultSettings = [
      { category: 'notifications', key: 'email_enabled', value: true, dataType: 'boolean', isPublic: true },
      { category: 'notifications', key: 'sms_enabled', value: false, dataType: 'boolean', isPublic: true },
      { category: 'features', key: 'lead_scoring', value: true, dataType: 'boolean', isPublic: false },
      { category: 'features', key: 'auto_followup', value: false, dataType: 'boolean', isPublic: false },
      { category: 'limits', key: 'max_properties', value: 1000, dataType: 'number', isPublic: false },
      { category: 'limits', key: 'max_contacts', value: 5000, dataType: 'number', isPublic: false },
    ]

    const defaultFeatures = [
      { name: 'property_management', enabled: true },
      { name: 'contact_management', enabled: true },
      { name: 'lead_tracking', enabled: true },
      { name: 'workflow_automation', enabled: false },
      { name: 'advanced_analytics', enabled: false },
    ]

    // Create default settings
    const createdSettings = []
    for (const setting of defaultSettings) {
      const created = await this.setSetting({
        tenantId,
        ...setting,
        dataType: setting.dataType as any,
      })
      createdSettings.push(created)
    }

    // Create default branding
    const branding = await TenantBrandingService.updateBranding({
      tenantId,
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      accentColor: '#10b981',
      fontFamily: 'Inter',
    })

    // Create default features
    const createdFeatures = []
    for (const feature of defaultFeatures) {
      const created = await TenantFeatureService.setFeatureFlag({
        tenantId,
        featureName: feature.name,
        isEnabled: feature.enabled,
      })
      createdFeatures.push(created)
    }

    return {
      settingsCreated: createdSettings.length,
      brandingCreated: true,
      featuresCreated: createdFeatures.length,
    }
  }

  /**
   * Validate category and key format
   */
  static validateCategoryAndKey(category: string, key: string): boolean {
    const validFormat = /^[a-zA-Z0-9_-]+$/
    return validFormat.test(category) && validFormat.test(key)
  }

  /**
   * Validate data type matches value
   */
  static validateDataType(value: any, dataType: string): boolean {
    switch (dataType) {
      case 'string': return typeof value === 'string'
      case 'number': return typeof value === 'number'
      case 'boolean': return typeof value === 'boolean'
      case 'object': return typeof value === 'object' && !Array.isArray(value)
      case 'array': return Array.isArray(value)
      default: return false
    }
  }

  /**
   * Sanitize configuration values
   */
  static sanitizeValue(value: string): string {
    return value
      .trim()
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
      .replace(/[<>]/g, '') // Remove angle brackets
      .trim()
  }

  /**
   * Merge configuration with inheritance
   */
  static mergeConfiguration(globalConfig: any, tenantConfig: any): any {
    return { ...globalConfig, ...tenantConfig }
  }
}

export class TenantFeatureService {
  /**
   * Set feature flag for tenant
   */
  static async setFeatureFlag(input: SetFeatureFlagInput): Promise<TenantFeatureFlag> {
    const featureData = {
      tenantId: input.tenantId,
      featureName: input.featureName,
      isEnabled: input.isEnabled,
      enabledAt: input.isEnabled ? new Date() : null,
      enabledBy: input.enabledBy,
      configuration: input.configuration || {},
      expiresAt: input.expiresAt,
      updatedAt: new Date(),
    }

    // Check if feature flag exists
    const existingFeature = await db
      .select()
      .from(tenantFeatureFlags)
      .where(and(
        eq(tenantFeatureFlags.tenantId, input.tenantId),
        eq(tenantFeatureFlags.featureName, input.featureName)
      ))

    if (existingFeature[0]) {
      // Update existing feature
      const result = await db
        .update(tenantFeatureFlags)
        .set(featureData)
        .where(eq(tenantFeatureFlags.id, existingFeature[0].id))
        .returning()
      
      return result[0]
    } else {
      // Create new feature
      const result = await db.insert(tenantFeatureFlags).values(featureData).returning()
      return result[0]
    }
  }

  /**
   * Check if feature is enabled for tenant
   */
  static async isFeatureEnabled(tenantId: string, featureName: string): Promise<boolean> {
    const feature = await db
      .select()
      .from(tenantFeatureFlags)
      .where(and(
        eq(tenantFeatureFlags.tenantId, tenantId),
        eq(tenantFeatureFlags.featureName, featureName)
      ))

    if (!feature[0]) {
      return false // Feature not configured = disabled
    }

    // Check if feature is expired
    if (feature[0].expiresAt && new Date() > feature[0].expiresAt) {
      return false
    }

    return feature[0].isEnabled
  }

  /**
   * Get feature configuration
   */
  static async getFeatureConfiguration(tenantId: string, featureName: string): Promise<any> {
    const feature = await db
      .select()
      .from(tenantFeatureFlags)
      .where(and(
        eq(tenantFeatureFlags.tenantId, tenantId),
        eq(tenantFeatureFlags.featureName, featureName)
      ))

    return feature[0]?.configuration || {}
  }

  /**
   * Get all features for tenant
   */
  static async getAllFeatures(tenantId: string): Promise<TenantFeatureFlag[]> {
    return await db
      .select()
      .from(tenantFeatureFlags)
      .where(eq(tenantFeatureFlags.tenantId, tenantId))
  }

  /**
   * Get enabled features only
   */
  static async getEnabledFeatures(tenantId: string): Promise<TenantFeatureFlag[]> {
    const allFeatures = await this.getAllFeatures(tenantId)
    
    // Filter enabled and non-expired features
    return allFeatures.filter(feature => {
      if (!feature.isEnabled) return false
      if (feature.expiresAt && new Date() > feature.expiresAt) return false
      return true
    })
  }
}

export class TenantBrandingService {
  /**
   * Update tenant branding
   */
  static async updateBranding(input: UpdateBrandingInput): Promise<TenantBranding> {
    // Validate colors if provided
    if (input.primaryColor && !this.validateColor(input.primaryColor)) {
      throw new Error('Invalid primary color format')
    }
    if (input.secondaryColor && !this.validateColor(input.secondaryColor)) {
      throw new Error('Invalid secondary color format')
    }
    if (input.accentColor && !this.validateColor(input.accentColor)) {
      throw new Error('Invalid accent color format')
    }

    const brandingData = {
      tenantId: input.tenantId,
      logoUrl: input.logoUrl,
      faviconUrl: input.faviconUrl,
      primaryColor: input.primaryColor,
      secondaryColor: input.secondaryColor,
      accentColor: input.accentColor,
      fontFamily: input.fontFamily,
      customCss: input.customCss,
      websiteUrl: input.websiteUrl,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      socialMedia: input.socialMedia || {},
      updatedAt: new Date(),
    }

    // Check if branding exists
    const existingBranding = await this.getBranding(input.tenantId)

    if (existingBranding) {
      // Update existing branding
      const result = await db
        .update(tenantBranding)
        .set(brandingData)
        .where(eq(tenantBranding.id, existingBranding.id))
        .returning()
      
      return result[0]
    } else {
      // Create new branding
      const result = await db.insert(tenantBranding).values(brandingData).returning()
      return result[0]
    }
  }

  /**
   * Get tenant branding
   */
  static async getBranding(tenantId: string): Promise<TenantBranding | null> {
    const result = await db
      .select()
      .from(tenantBranding)
      .where(eq(tenantBranding.tenantId, tenantId))

    return result[0] || null
  }

  /**
   * Generate CSS variables from branding
   */
  static async generateBrandingCSS(tenantId: string): Promise<string> {
    const branding = await this.getBranding(tenantId)
    
    if (!branding) {
      return ':root { /* No custom branding configured */ }'
    }

    const cssVariables = [
      `--primary-color: ${branding.primaryColor || '#3b82f6'}`,
      `--secondary-color: ${branding.secondaryColor || '#64748b'}`,
      `--accent-color: ${branding.accentColor || '#10b981'}`,
      `--font-family: ${branding.fontFamily || 'Inter'}`,
    ]

    const customCss = branding.customCss || ''

    return `:root {\n  ${cssVariables.join(';\n  ')};\n}\n\n${customCss}`
  }

  /**
   * Validate color format
   */
  static validateColor(color: string): boolean {
    // Support hex, rgb, rgba, hsl, hsla, and named colors
    const colorPatterns = [
      /^#([0-9A-F]{3}){1,2}$/i, // Hex colors
      /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i, // RGB
      /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/i, // RGBA
      /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/i, // HSL
      /^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)$/i, // HSLA
    ]

    return colorPatterns.some(pattern => pattern.test(color))
  }
}