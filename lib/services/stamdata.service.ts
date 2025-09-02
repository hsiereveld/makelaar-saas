import { db } from '@/lib/db'
import { tenantMasterData, stamdataCategories, tenantFilterPresets, propertyExtendedData, clientExtendedData } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

export interface StamdataItem {
  id?: string
  tenantId: string
  category: string
  key: string
  label: string
  labelEn?: string
  icon?: string
  description?: string
  sortOrder?: number
  isActive?: boolean
  isDefault?: boolean
  isPopular?: boolean
  metadata?: Record<string, any>
}

export interface StamdataCategory {
  key: string
  label: string
  description: string
  icon: string
  items: StamdataItem[]
  isSystemCategory: boolean
}

export class StamdataService {
  /**
   * Get all stamdata for a tenant organized by category
   */
  static async getTenantStamdata(tenantId: string): Promise<StamdataCategory[]> {
    try {
      // Get all categories
      const categories = await db.select().from(stamdataCategories).orderBy(stamdataCategories.sortOrder)
      
      // Get all tenant master data
      const masterData = await db
        .select()
        .from(tenantMasterData)
        .where(eq(tenantMasterData.tenantId, tenantId))
        .orderBy(tenantMasterData.category, tenantMasterData.sortOrder)

      // Organize by category
      const result: StamdataCategory[] = []
      
      for (const category of categories) {
        const categoryItems = masterData.filter(item => item.category === category.key)
        
        result.push({
          key: category.key,
          label: category.label,
          description: category.description || '',
          icon: category.icon || '📋',
          isSystemCategory: category.isSystemCategory,
          items: categoryItems
        })
      }

      return result
    } catch (error) {
      console.error('Error getting tenant stamdata:', error)
      throw error
    }
  }

  /**
   * Get stamdata items for a specific category
   */
  static async getStamdataByCategory(tenantId: string, category: string): Promise<StamdataItem[]> {
    try {
      const items = await db
        .select()
        .from(tenantMasterData)
        .where(and(
          eq(tenantMasterData.tenantId, tenantId),
          eq(tenantMasterData.category, category)
        ))
        .orderBy(tenantMasterData.sortOrder)

      return items
    } catch (error) {
      console.error(`Error getting stamdata for category ${category}:`, error)
      throw error
    }
  }

  /**
   * Create a new stamdata item
   */
  static async createStamdataItem(tenantId: string, data: Omit<StamdataItem, 'id' | 'tenantId'>): Promise<StamdataItem> {
    try {
      const result = await db
        .insert(tenantMasterData)
        .values({
          tenantId,
          ...data,
          sortOrder: data.sortOrder || 999, // Put new items at end by default
          isActive: data.isActive ?? true,
          isDefault: data.isDefault ?? false,
          isPopular: data.isPopular ?? false,
          metadata: data.metadata || {}
        })
        .returning()

      return result[0]
    } catch (error) {
      console.error('Error creating stamdata item:', error)
      throw error
    }
  }

  /**
   * Update an existing stamdata item
   */
  static async updateStamdataItem(tenantId: string, itemId: string, data: Partial<StamdataItem>): Promise<StamdataItem> {
    try {
      const result = await db
        .update(tenantMasterData)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(and(
          eq(tenantMasterData.id, itemId),
          eq(tenantMasterData.tenantId, tenantId)
        ))
        .returning()

      if (result.length === 0) {
        throw new Error('Stamdata item not found')
      }

      return result[0]
    } catch (error) {
      console.error('Error updating stamdata item:', error)
      throw error
    }
  }

  /**
   * Delete a stamdata item (only non-default items)
   */
  static async deleteStamdataItem(tenantId: string, itemId: string): Promise<boolean> {
    try {
      const result = await db
        .delete(tenantMasterData)
        .where(and(
          eq(tenantMasterData.id, itemId),
          eq(tenantMasterData.tenantId, tenantId),
          eq(tenantMasterData.isDefault, false) // Only allow deletion of non-default items
        ))
        .returning()

      return result.length > 0
    } catch (error) {
      console.error('Error deleting stamdata item:', error)
      throw error
    }
  }

  /**
   * Seed default stamdata for a new tenant (FoxVillas/IkZoekEenHuis based)
   */
  static async seedDefaultStamdata(tenantId: string): Promise<void> {
    try {
      const defaultData: Array<Omit<StamdataItem, 'id' | 'tenantId'>> = [
        // Property Types (FoxVillas/IkZoekEenHuis)
        { category: 'property_types', key: 'villa', label: 'Villa', labelEn: 'Villa', icon: '🏖️', sortOrder: 1, isDefault: true, isPopular: true, metadata: { color: '#059669' } },
        { category: 'property_types', key: 'apartment', label: 'Appartement', labelEn: 'Apartment', icon: '🏢', sortOrder: 2, isDefault: true, isPopular: true, metadata: { color: '#1d4ed8' } },
        { category: 'property_types', key: 'townhouse', label: 'Stadshuis', labelEn: 'Townhouse', icon: '🏘️', sortOrder: 3, isDefault: true, metadata: { color: '#7c3aed' } },
        { category: 'property_types', key: 'finca', label: 'Finca', labelEn: 'Finca', icon: '🌿', sortOrder: 4, isDefault: true, metadata: { color: '#059669' } },
        { category: 'property_types', key: 'penthouse', label: 'Penthouse', labelEn: 'Penthouse', icon: '🏙️', sortOrder: 5, isDefault: true, metadata: { color: '#dc2626' } },
        
        // Spanish Regions (Popular with Dutch/English/Belgian buyers)
        { category: 'spanish_regions', key: 'costa_blanca', label: 'Costa Blanca', icon: '🏖️', sortOrder: 1, isDefault: true, isPopular: true, metadata: { transferTax: 8, province: 'Alicante' } },
        { category: 'spanish_regions', key: 'costa_del_sol', label: 'Costa del Sol', icon: '☀️', sortOrder: 2, isDefault: true, isPopular: true, metadata: { transferTax: 10, province: 'Málaga' } },
        { category: 'spanish_regions', key: 'costa_calida', label: 'Costa Cálida', icon: '🌊', sortOrder: 3, isDefault: true, isPopular: true, metadata: { transferTax: 8, province: 'Murcia' } },
        { category: 'spanish_regions', key: 'costa_brava', label: 'Costa Brava', icon: '🏔️', sortOrder: 4, isDefault: true, metadata: { transferTax: 10, province: 'Girona' } },
        { category: 'spanish_regions', key: 'valencia', label: 'Valencia', icon: '🏛️', sortOrder: 5, isDefault: true, metadata: { transferTax: 10, province: 'Valencia' } },
        
        // Property Amenities (FoxVillas comprehensive list)
        { category: 'property_amenities', key: 'private_pool', label: 'Privé Zwembad', labelEn: 'Private Pool', icon: '🏊', sortOrder: 1, isDefault: true, isPopular: true, metadata: { category: 'outdoor', dutchAppeal: 'high' } },
        { category: 'property_amenities', key: 'sea_view', label: 'Zeezicht', labelEn: 'Sea View', icon: '🌊', sortOrder: 2, isDefault: true, isPopular: true, metadata: { category: 'view', dutchAppeal: 'high' } },
        { category: 'property_amenities', key: 'garden', label: 'Tuin', labelEn: 'Garden', icon: '🌳', sortOrder: 3, isDefault: true, isPopular: true, metadata: { category: 'outdoor' } },
        { category: 'property_amenities', key: 'terrace', label: 'Terras', labelEn: 'Terrace', icon: '🪴', sortOrder: 4, isDefault: true, isPopular: true, metadata: { category: 'outdoor' } },
        { category: 'property_amenities', key: 'garage', label: 'Garage', labelEn: 'Garage', icon: '🚗', sortOrder: 5, isDefault: true, isPopular: true, metadata: { category: 'parking' } },
        { category: 'property_amenities', key: 'air_conditioning', label: 'Airconditioning', labelEn: 'Air Conditioning', icon: '❄️', sortOrder: 6, isDefault: true, isPopular: true, metadata: { category: 'climate', dutchNeed: 'high' } },
        { category: 'property_amenities', key: 'central_heating', label: 'Centrale Verwarming', labelEn: 'Central Heating', icon: '🔥', sortOrder: 7, isDefault: true, isPopular: true, metadata: { category: 'climate', dutchNeed: 'high' } },
        { category: 'property_amenities', key: 'solar_panels', label: 'Zonnepanelen', labelEn: 'Solar Panels', icon: '☀️', sortOrder: 8, isDefault: true, metadata: { category: 'energy', trending: true } },
        
        // Investment Types (Nederlandse buyer focus)
        { category: 'investment_types', key: 'holiday_home', label: 'Vakantiehuis', labelEn: 'Holiday Home', icon: '🏖️', sortOrder: 1, isDefault: true, isPopular: true, metadata: { targetAudience: ['dutch', 'belgian'] } },
        { category: 'investment_types', key: 'retirement', label: 'Pensioen Woning', labelEn: 'Retirement Property', icon: '🌴', sortOrder: 2, isDefault: true, isPopular: true, metadata: { targetAudience: ['dutch', 'english'] } },
        { category: 'investment_types', key: 'rental_investment', label: 'Verhuur Investering', labelEn: 'Rental Investment', icon: '💰', sortOrder: 3, isDefault: true, metadata: { targetAudience: ['all'] } },
        { category: 'investment_types', key: 'permanent', label: 'Permanente Woning', labelEn: 'Permanent Residence', icon: '🏠', sortOrder: 4, isDefault: true, metadata: { targetAudience: ['all'] } },
        
        // Target Audiences
        { category: 'target_audiences', key: 'dutch', label: 'Nederlandse Klanten', labelEn: 'Dutch Clients', icon: '🇳🇱', sortOrder: 1, isDefault: true, isPopular: true, metadata: { language: 'nl', currency: 'EUR' } },
        { category: 'target_audiences', key: 'english', label: 'Engelse Klanten', labelEn: 'English Clients', icon: '🇬🇧', sortOrder: 2, isDefault: true, isPopular: true, metadata: { language: 'en', currency: 'GBP' } },
        { category: 'target_audiences', key: 'belgian', label: 'Belgische Klanten', labelEn: 'Belgian Clients', icon: '🇧🇪', sortOrder: 3, isDefault: true, isPopular: true, metadata: { language: 'nl', currency: 'EUR' } },
        { category: 'target_audiences', key: 'german', label: 'Duitse Klanten', labelEn: 'German Clients', icon: '🇩🇪', sortOrder: 4, isDefault: true, metadata: { language: 'de', currency: 'EUR' } },
        
        // Client Types
        { category: 'client_types', key: 'buyer', label: 'Koper', labelEn: 'Buyer', icon: '🛒', sortOrder: 1, isDefault: true, isPopular: true },
        { category: 'client_types', key: 'seller', label: 'Verkoper', labelEn: 'Seller', icon: '🏷️', sortOrder: 2, isDefault: true },
        { category: 'client_types', key: 'investor', label: 'Investeerder', labelEn: 'Investor', icon: '💼', sortOrder: 3, isDefault: true, metadata: { focus: 'rental_yield' } },
        { category: 'client_types', key: 'relocator', label: 'Relocator', labelEn: 'Relocator', icon: '✈️', sortOrder: 4, isDefault: true, metadata: { urgency: 'high' } },
        
        // Lead Sources (Nederlandse makelaar channels)
        { category: 'lead_sources', key: 'website', label: 'Website', icon: '🌐', sortOrder: 1, isDefault: true, isPopular: true },
        { category: 'lead_sources', key: 'referral', label: 'Doorverwijzing', labelEn: 'Referral', icon: '🤝', sortOrder: 2, isDefault: true, isPopular: true },
        { category: 'lead_sources', key: 'social_media', label: 'Social Media', icon: '📱', sortOrder: 3, isDefault: true },
        { category: 'lead_sources', key: 'advertising', label: 'Advertentie', labelEn: 'Advertising', icon: '📢', sortOrder: 4, isDefault: true },
        { category: 'lead_sources', key: 'direct_inquiry', label: 'Direct Contact', labelEn: 'Direct Inquiry', icon: '📞', sortOrder: 5, isDefault: true },
      ]

      // Insert all default data
      for (const item of defaultData) {
        await db.insert(tenantMasterData).values({
          tenantId,
          ...item
        }).onConflictDoNothing()
      }

    } catch (error) {
      console.error('Error seeding default stamdata:', error)
      throw error
    }
  }

  /**
   * Create or update stamdata item
   */
  static async upsertStamdataItem(tenantId: string, data: StamdataItem): Promise<StamdataItem> {
    try {
      if (data.id) {
        // Update existing
        const result = await db
          .update(tenantMasterData)
          .set({
            ...data,
            updatedAt: new Date()
          })
          .where(and(
            eq(tenantMasterData.id, data.id),
            eq(tenantMasterData.tenantId, tenantId)
          ))
          .returning()

        return result[0]
      } else {
        // Create new
        const result = await db
          .insert(tenantMasterData)
          .values({
            tenantId,
            ...data,
            sortOrder: data.sortOrder || 999
          })
          .returning()

        return result[0]
      }
    } catch (error) {
      console.error('Error upserting stamdata item:', error)
      throw error
    }
  }

  /**
   * Delete stamdata item (only non-default items)
   */
  static async deleteStamdataItem(tenantId: string, itemId: string): Promise<boolean> {
    try {
      const result = await db
        .delete(tenantMasterData)
        .where(and(
          eq(tenantMasterData.id, itemId),
          eq(tenantMasterData.tenantId, tenantId),
          eq(tenantMasterData.isDefault, false)
        ))
        .returning()

      return result.length > 0
    } catch (error) {
      console.error('Error deleting stamdata item:', error)
      throw error
    }
  }

  /**
   * Get active stamdata items for forms (only active items)
   */
  static async getActiveStamdataForForms(tenantId: string): Promise<Record<string, StamdataItem[]>> {
    try {
      const items = await db
        .select()
        .from(tenantMasterData)
        .where(and(
          eq(tenantMasterData.tenantId, tenantId),
          eq(tenantMasterData.isActive, true)
        ))
        .orderBy(tenantMasterData.category, tenantMasterData.sortOrder)

      // Group by category for easy form usage
      const grouped: Record<string, StamdataItem[]> = {}
      items.forEach(item => {
        if (!grouped[item.category]) {
          grouped[item.category] = []
        }
        grouped[item.category].push(item)
      })

      return grouped
    } catch (error) {
      console.error('Error getting active stamdata for forms:', error)
      throw error
    }
  }

  /**
   * Initialize stamdata categories (run once)
   */
  static async initializeStamdataCategories(): Promise<void> {
    try {
      const categories = [
        {
          key: 'property_types',
          label: 'Property Types',
          description: 'Soorten vastgoed die je aanbiedt',
          icon: '🏠',
          isSystemCategory: true,
          sortOrder: 1
        },
        {
          key: 'spanish_regions',
          label: 'Spaanse Regio\'s',
          description: 'Regio\'s in Spanje waar je actief bent',
          icon: '🗺️',
          isSystemCategory: true,
          sortOrder: 2
        },
        {
          key: 'property_amenities',
          label: 'Pand Voorzieningen',
          description: 'Alle mogelijke voorzieningen van panden',
          icon: '🏊',
          isSystemCategory: true,
          sortOrder: 3
        },
        {
          key: 'property_utilities',
          label: 'Nutsvoorzieningen',
          description: 'Gas, water, licht en andere voorzieningen',
          icon: '⚡',
          isSystemCategory: true,
          sortOrder: 4
        },
        {
          key: 'investment_types',
          label: 'Investering Types',
          description: 'Soorten investeringen (vakantiehuis, pensioen, etc.)',
          icon: '💰',
          isSystemCategory: true,
          sortOrder: 5
        },
        {
          key: 'target_audiences',
          label: 'Doelgroepen',
          description: 'Nationaliteiten en doelgroepen van klanten',
          icon: '🌍',
          isSystemCategory: true,
          sortOrder: 6
        },
        {
          key: 'client_types',
          label: 'Client Types',
          description: 'Categorieën van klanten (koper, verkoper, etc.)',
          icon: '👥',
          isSystemCategory: true,
          sortOrder: 7
        },
        {
          key: 'lead_sources',
          label: 'Lead Bronnen',
          description: 'Kanalen waar klanten vandaan komen',
          icon: '📈',
          isSystemCategory: true,
          sortOrder: 8
        },
        {
          key: 'client_tags',
          label: 'Client Tags',
          description: 'Labels en tags voor client segmentatie',
          icon: '🏷️',
          isSystemCategory: false,
          sortOrder: 9
        }
      ]

      for (const category of categories) {
        await db.insert(stamdataCategories).values(category).onConflictDoNothing()
      }
    } catch (error) {
      console.error('Error initializing stamdata categories:', error)
      throw error
    }
  }

  /**
   * Copy stamdata from another tenant (for templates)
   */
  static async copyStamdataFromTenant(sourceTenantId: string, targetTenantId: string, categories?: string[]): Promise<void> {
    try {
      const query = db.select().from(tenantMasterData).where(eq(tenantMasterData.tenantId, sourceTenantId))
      
      if (categories && categories.length > 0) {
        // Filter by specific categories if provided
      }
      
      const sourceItems = await query
      
      const itemsToInsert = sourceItems.map(item => ({
        tenantId: targetTenantId,
        category: item.category,
        key: item.key,
        label: item.label,
        labelEn: item.labelEn,
        icon: item.icon,
        description: item.description,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
        isDefault: false, // Copied items are not defaults
        isPopular: item.isPopular,
        metadata: item.metadata
      }))

      await db.insert(tenantMasterData).values(itemsToInsert)
    } catch (error) {
      console.error('Error copying stamdata:', error)
      throw error
    }
  }

  /**
   * Get stamdata usage statistics
   */
  static async getStamdataUsageStats(tenantId: string): Promise<Record<string, any>> {
    try {
      // This would analyze property/client usage of stamdata
      // For now, return mock data
      return {
        totalItems: 45,
        activeItems: 38,
        popularItems: 12,
        customItems: 8,
        mostUsedCategory: 'property_amenities'
      }
    } catch (error) {
      console.error('Error getting stamdata usage stats:', error)
      throw error
    }
  }
}