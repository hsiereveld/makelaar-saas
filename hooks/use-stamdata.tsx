import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export interface StamdataItem {
  id: string
  tenantId: string
  category: string
  key: string
  label: string
  labelEn?: string
  icon?: string
  description?: string
  sortOrder: number
  isActive: boolean
  isDefault: boolean
  isPopular: boolean
  metadata: Record<string, any>
}

export interface StamdataCategory {
  key: string
  label: string
  description: string
  icon: string
  items: StamdataItem[]
}

/**
 * Hook to fetch and manage stamdata for forms
 */
export function useStamdata(categories?: string[]) {
  const params = useParams()
  const tenant = params.tenant as string
  
  const [stamdata, setStamdata] = useState<Record<string, StamdataItem[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStamdata = async () => {
      if (!tenant) return
      
      setLoading(true)
      try {
        const url = categories?.length 
          ? `/api/v1/${tenant}/stamdata?activeOnly=true&categories=${categories.join(',')}`
          : `/api/v1/${tenant}/stamdata?activeOnly=true`
          
        const response = await fetch(url)
        
        if (!response.ok) {
          // Fallback to hardcoded data if API fails
          console.warn('Stamdata API failed, using fallbacks')
          setStamdata(getHardcodedFallbacks())
          setLoading(false)
          return
        }
        
        const result = await response.json()
        
        if (result.success && result.data) {
          // Convert array format to category-keyed object
          const grouped: Record<string, StamdataItem[]> = {}
          
          if (Array.isArray(result.data)) {
            // Handle category array format
            result.data.forEach((category: StamdataCategory) => {
              grouped[category.key] = category.items.filter(item => item.isActive)
            })
          } else {
            // Handle direct object format
            Object.keys(result.data).forEach(key => {
              grouped[key] = result.data[key].filter((item: StamdataItem) => item.isActive)
            })
          }
          
          setStamdata(grouped)
        }
      } catch (error) {
        console.error('Error fetching stamdata:', error)
        // Use fallback data
        setStamdata(getHardcodedFallbacks())
        setError('Failed to load configuration data')
      } finally {
        setLoading(false)
      }
    }

    fetchStamdata()
  }, [tenant, categories?.join(',')])

  return {
    stamdata,
    loading,
    error,
    refreshStamdata: () => {
      setLoading(true)
      // Trigger refetch
    }
  }
}

/**
 * Hardcoded fallback data (FoxVillas/IkZoekEenHuis defaults)
 */
function getHardcodedFallbacks(): Record<string, StamdataItem[]> {
  return {
    property_types: [
      { id: '1', tenantId: 'fallback', category: 'property_types', key: 'villa', label: 'Villa', labelEn: 'Villa', icon: '🏖️', sortOrder: 1, isActive: true, isDefault: true, isPopular: true, metadata: {} },
      { id: '2', tenantId: 'fallback', category: 'property_types', key: 'apartment', label: 'Appartement', labelEn: 'Apartment', icon: '🏢', sortOrder: 2, isActive: true, isDefault: true, isPopular: true, metadata: {} },
      { id: '3', tenantId: 'fallback', category: 'property_types', key: 'townhouse', label: 'Stadshuis', labelEn: 'Townhouse', icon: '🏘️', sortOrder: 3, isActive: true, isDefault: true, isPopular: false, metadata: {} },
      { id: '4', tenantId: 'fallback', category: 'property_types', key: 'finca', label: 'Finca', labelEn: 'Finca', icon: '🌿', sortOrder: 4, isActive: true, isDefault: true, isPopular: false, metadata: {} },
      { id: '5', tenantId: 'fallback', category: 'property_types', key: 'penthouse', label: 'Penthouse', labelEn: 'Penthouse', icon: '🏙️', sortOrder: 5, isActive: true, isDefault: true, isPopular: false, metadata: {} }
    ],
    spanish_regions: [
      { id: '6', tenantId: 'fallback', category: 'spanish_regions', key: 'costa_blanca', label: 'Costa Blanca', icon: '🏖️', sortOrder: 1, isActive: true, isDefault: true, isPopular: true, metadata: {} },
      { id: '7', tenantId: 'fallback', category: 'spanish_regions', key: 'costa_del_sol', label: 'Costa del Sol', icon: '☀️', sortOrder: 2, isActive: true, isDefault: true, isPopular: true, metadata: {} },
      { id: '8', tenantId: 'fallback', category: 'spanish_regions', key: 'costa_calida', label: 'Costa Cálida', icon: '🌊', sortOrder: 3, isActive: true, isDefault: true, isPopular: true, metadata: {} }
    ],
    property_amenities: [
      { id: '9', tenantId: 'fallback', category: 'property_amenities', key: 'private_pool', label: 'Privé Zwembad', labelEn: 'Private Pool', icon: '🏊', sortOrder: 1, isActive: true, isDefault: true, isPopular: true, metadata: {} },
      { id: '10', tenantId: 'fallback', category: 'property_amenities', key: 'sea_view', label: 'Zeezicht', labelEn: 'Sea View', icon: '🌊', sortOrder: 2, isActive: true, isDefault: true, isPopular: true, metadata: {} },
      { id: '11', tenantId: 'fallback', category: 'property_amenities', key: 'air_conditioning', label: 'Airconditioning', labelEn: 'Air Conditioning', icon: '❄️', sortOrder: 3, isActive: true, isDefault: true, isPopular: true, metadata: {} },
      { id: '12', tenantId: 'fallback', category: 'property_amenities', key: 'central_heating', label: 'Centrale Verwarming', labelEn: 'Central Heating', icon: '🔥', sortOrder: 4, isActive: true, isDefault: true, isPopular: true, metadata: {} },
      { id: '13', tenantId: 'fallback', category: 'property_amenities', key: 'garage', label: 'Garage', labelEn: 'Garage', icon: '🚗', sortOrder: 5, isActive: true, isDefault: true, isPopular: true, metadata: {} }
    ],
    investment_types: [
      { id: '14', tenantId: 'fallback', category: 'investment_types', key: 'holiday_home', label: 'Vakantiehuis', labelEn: 'Holiday Home', icon: '🏖️', sortOrder: 1, isActive: true, isDefault: true, isPopular: true, metadata: {} },
      { id: '15', tenantId: 'fallback', category: 'investment_types', key: 'retirement_property', label: 'Pensioen Woning', labelEn: 'Retirement Property', icon: '🌴', sortOrder: 2, isActive: true, isDefault: true, isPopular: true, metadata: {} },
      { id: '16', tenantId: 'fallback', category: 'investment_types', key: 'rental_investment', label: 'Verhuur Investering', labelEn: 'Rental Investment', icon: '💰', sortOrder: 3, isActive: true, isDefault: true, isPopular: false, metadata: {} }
    ],
    target_audiences: [
      { id: '17', tenantId: 'fallback', category: 'target_audiences', key: 'dutch', label: 'Nederlandse Klanten', labelEn: 'Dutch Clients', icon: '🇳🇱', sortOrder: 1, isActive: true, isDefault: true, isPopular: true, metadata: {} },
      { id: '18', tenantId: 'fallback', category: 'target_audiences', key: 'english', label: 'Engelse Klanten', labelEn: 'English Clients', icon: '🇬🇧', sortOrder: 2, isActive: true, isDefault: true, isPopular: true, metadata: {} },
      { id: '19', tenantId: 'fallback', category: 'target_audiences', key: 'belgian', label: 'Belgische Klanten', labelEn: 'Belgian Clients', icon: '🇧🇪', sortOrder: 3, isActive: true, isDefault: true, isPopular: true, metadata: {} }
    ]
  }
}

/**
 * Hook specifically for property form stamdata
 */
export function usePropertyStamdata() {
  return useStamdata([
    'property_types',
    'spanish_regions', 
    'property_amenities',
    'property_utilities',
    'investment_types',
    'target_audiences'
  ])
}

/**
 * Hook specifically for client form stamdata
 */
export function useClientStamdata() {
  return useStamdata([
    'client_types',
    'target_audiences',
    'lead_sources',
    'client_tags',
    'investment_types' // For matching client interests to properties
  ])
}