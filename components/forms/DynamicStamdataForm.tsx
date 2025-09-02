'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useStamdata, StamdataItem } from '@/hooks/use-stamdata'
import { Star } from 'lucide-react'

interface DynamicSelectProps {
  category: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  required?: boolean
  showPopular?: boolean
  className?: string
  error?: string
}

export function DynamicStamdataSelect({
  category,
  value,
  onChange,
  placeholder = "Selecteer...",
  label,
  required = false,
  showPopular = true,
  className,
  error
}: DynamicSelectProps) {
  const { stamdata, loading } = useStamdata([category])
  const items = stamdata[category] || []

  if (loading) {
    return (
      <div className="space-y-2">
        {label && <Label>{label}</Label>}
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label>
          {label} {required && '*'}
          {showPopular && items.some(item => item.isPopular) && (
            <span className="text-xs text-neutral-500 ml-2">
              ⭐ = Populair bij Nederlandse kopers
            </span>
          )}
        </Label>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`${className} ${error ? 'border-error-500' : ''}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.id} value={item.key}>
              <div className="flex items-center gap-2">
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
                {item.isPopular && showPopular && (
                  <Star className="h-3 w-3 text-warning-500" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-error-600">{error}</p>}
    </div>
  )
}

interface DynamicChecklistProps {
  category: string
  selectedValues: string[] | Record<string, boolean>
  onChange: (values: string[] | Record<string, boolean>) => void
  label?: string
  description?: string
  mode?: 'array' | 'object' // array returns ['pool', 'garden'], object returns {pool: true, garden: false}
  columns?: number
  showDescriptions?: boolean
  groupByMetadata?: string // Group items by metadata field
}

export function DynamicStamdataChecklist({
  category,
  selectedValues,
  onChange,
  label,
  description,
  mode = 'array',
  columns = 3,
  showDescriptions = false,
  groupByMetadata
}: DynamicChecklistProps) {
  const { stamdata, loading } = useStamdata([category])
  const items = stamdata[category] || []

  if (loading) {
    return (
      <div className="space-y-3">
        {label && <Label>{label}</Label>}
        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-3`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    )
  }

  // Group items if requested
  const groupedItems = groupByMetadata 
    ? items.reduce((acc, item) => {
        const groupKey = item.metadata[groupByMetadata] || 'other'
        if (!acc[groupKey]) acc[groupKey] = []
        acc[groupKey].push(item)
        return acc
      }, {} as Record<string, StamdataItem[]>)
    : { all: items }

  const isSelected = (itemKey: string): boolean => {
    if (mode === 'array') {
      return Array.isArray(selectedValues) && selectedValues.includes(itemKey)
    } else {
      return !!(selectedValues as Record<string, boolean>)[itemKey]
    }
  }

  const handleToggle = (itemKey: string, checked: boolean) => {
    if (mode === 'array') {
      const currentArray = Array.isArray(selectedValues) ? selectedValues : []
      if (checked) {
        onChange([...currentArray, itemKey])
      } else {
        onChange(currentArray.filter(key => key !== itemKey))
      }
    } else {
      const currentObject = selectedValues as Record<string, boolean> || {}
      onChange({
        ...currentObject,
        [itemKey]: checked
      })
    }
  }

  return (
    <div className="space-y-4">
      {label && (
        <div className="space-y-1">
          <Label className="text-base font-medium">{label}</Label>
          {description && <p className="text-sm text-neutral-600">{description}</p>}
        </div>
      )}
      
      {Object.keys(groupedItems).map((groupKey) => (
        <div key={groupKey} className="space-y-3">
          {Object.keys(groupedItems).length > 1 && groupKey !== 'all' && (
            <h4 className="font-medium text-neutral-800 text-sm capitalize border-b border-neutral-200 pb-1">
              {groupKey.replace('_', ' ')}
            </h4>
          )}
          
          <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-3`}>
            {groupedItems[groupKey].map((item) => (
              <div key={item.id} className="flex items-start space-x-3 p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                <Checkbox
                  id={`${category}-${item.key}`}
                  checked={isSelected(item.key)}
                  onCheckedChange={(checked) => handleToggle(item.key, !!checked)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <Label 
                    htmlFor={`${category}-${item.key}`}
                    className="flex items-center gap-2 cursor-pointer text-sm font-medium"
                  >
                    {item.icon && <span className="text-base">{item.icon}</span>}
                    <span>{item.label}</span>
                    {item.isPopular && (
                      <Star className="h-3 w-3 text-warning-500" title="Populair bij Nederlandse kopers" />
                    )}
                  </Label>
                  {showDescriptions && item.description && (
                    <p className="text-xs text-neutral-500 mt-1">{item.description}</p>
                  )}
                  {item.labelEn && (
                    <p className="text-xs text-neutral-400 mt-1">{item.labelEn}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {items.length === 0 && (
        <div className="text-center py-8 text-neutral-500">
          <p>Geen {label?.toLowerCase()} beschikbaar</p>
          <p className="text-xs mt-1">Configureer stamdata in agency instellingen</p>
        </div>
      )}
    </div>
  )
}

interface DynamicFilterPresetsProps {
  entityType: 'properties' | 'clients'
  onApplyPreset: (filters: any) => void
  currentFilters?: any
}

export function DynamicFilterPresets({ entityType, onApplyPreset, currentFilters }: DynamicFilterPresetsProps) {
  const [presets, setPresets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { params } = useParams()
  const tenant = params.tenant as string

  useEffect(() => {
    const fetchPresets = async () => {
      if (!tenant) return
      
      try {
        const response = await fetch(`/api/v1/${tenant}/filter-presets?entityType=${entityType}`)
        if (response.ok) {
          const result = await response.json()
          setPresets(result.data || getDefaultPresets(entityType))
        } else {
          setPresets(getDefaultPresets(entityType))
        }
      } catch (error) {
        console.error('Error fetching filter presets:', error)
        setPresets(getDefaultPresets(entityType))
      } finally {
        setLoading(false)
      }
    }

    fetchPresets()
  }, [tenant, entityType])

  const getDefaultPresets = (type: string) => {
    if (type === 'properties') {
      return [
        {
          name: 'Pensioen Villa\'s',
          description: 'Geschikt voor Nederlandse pensionado\'s',
          icon: '🌴',
          filters: {
            propertyType: 'villa',
            priceRange: '200000-500000',
            targetAudience: 'dutch',
            investmentType: 'retirement_property',
            hasPool: true,
            hasCentralHeating: true,
            maxAirportDistance: 60
          }
        },
        {
          name: 'Vakantie Appartementen',
          description: 'Perfect voor Nederlandse vakanties', 
          icon: '🏖️',
          filters: {
            propertyType: 'apartment',
            priceRange: '150000-350000',
            hasSeaView: true,
            maxBeachDistance: 10,
            region: 'costa_del_sol',
            investmentType: 'holiday_home'
          }
        },
        {
          name: 'Verhuur Investering',
          description: 'Hoog rendement potentiaal',
          icon: '💰',
          filters: {
            hasPool: true,
            maxAirportDistance: 45,
            investmentType: 'rental_investment',
            hasAirConditioning: true
          }
        },
        {
          name: 'Instapklare Woningen',
          description: 'Turn-key ready properties',
          icon: '✅',
          filters: {
            condition: 'excellent',
            hasHabitationCertificate: true,
            hasAirConditioning: true,
            hasCentralHeating: true
          }
        }
      ]
    } else {
      return [
        {
          name: 'Hot Nederlandse Leads',
          description: 'Actieve Nederlandse kopers',
          icon: '🔥',
          filters: {
            targetAudience: 'dutch',
            leadStage: 'hot',
            clientType: 'buyer',
            engagementLevel: 80
          }
        },
        {
          name: 'Pensioen Klanten',
          description: 'Klanten die willen pensioneren',
          icon: '🌅',
          filters: {
            clientSubtype: 'retiree',
            investmentType: 'retirement_property',
            budgetMin: 200000
          }
        }
      ]
    }
  }

  if (loading) {
    return (
      <Card variant="business" elevation="subtle">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="business" elevation="subtle">
      <CardHeader>
        <CardTitle className="text-base">
          {entityType === 'properties' ? 'Nederlandse Koper Selecties' : 'Client Filter Presets'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {presets.map((preset, index) => (
            <button
              key={index}
              onClick={() => onApplyPreset(preset.filters)}
              className="text-left p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{preset.icon}</div>
              <div className="font-medium text-neutral-900 text-sm mb-1">{preset.name}</div>
              <div className="text-xs text-neutral-600 line-clamp-2">{preset.description}</div>
              
              {/* Show active filters count */}
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  {Object.keys(preset.filters).length} filters
                </Badge>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Helper component for rendering dynamic form sections based on stamdata
 */
interface DynamicFormSectionProps {
  title: string
  description?: string
  icon?: string
  children: React.ReactNode
  collapsible?: boolean
  defaultExpanded?: boolean
}

export function DynamicFormSection({ 
  title, 
  description, 
  icon, 
  children, 
  collapsible = false,
  defaultExpanded = true 
}: DynamicFormSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <Card variant="business">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-3">
            {icon && <span className="text-xl">{icon}</span>}
            {title}
          </CardTitle>
          {collapsible && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-neutral-500 hover:text-neutral-700"
            >
              {isExpanded ? 'Inklappen' : 'Uitklappen'}
            </button>
          )}
        </div>
        {description && (
          <p className="text-neutral-600 text-sm">{description}</p>
        )}
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
          {children}
        </CardContent>
      )}
    </Card>
  )
}

/**
 * Stamdata-driven property form sections
 */
interface PropertyFormSectionsProps {
  formData: any
  setFormData: (data: any) => void
  errors: Record<string, string>
}

export function PropertyFormSections({ formData, setFormData, errors }: PropertyFormSectionsProps) {
  return (
    <>
      {/* Basic Property Information */}
      <DynamicFormSection
        title="Basis Pand Informatie" 
        icon="🏠"
        description="Type pand en doelgroep configuratie"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DynamicStamdataSelect
            category="property_types"
            value={formData.propertyType || ''}
            onChange={(value) => setFormData({ ...formData, propertyType: value })}
            label="Type Pand"
            placeholder="Selecteer property type"
            required
            error={errors.propertyType}
          />
          
          <DynamicStamdataSelect
            category="target_audiences"
            value={formData.targetAudience || ''}
            onChange={(value) => setFormData({ ...formData, targetAudience: value })}
            label="Primaire Doelgroep"
            placeholder="Selecteer doelgroep"
            required
            error={errors.targetAudience}
          />
        </div>
      </DynamicFormSection>

      {/* Spanish Location */}
      <DynamicFormSection
        title="Spaanse Locatie"
        icon="🗺️"
        description="Regio en locatie details in Spanje"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DynamicStamdataSelect
            category="spanish_regions"
            value={formData.region || ''}
            onChange={(value) => setFormData({ ...formData, region: value })}
            label="Regio"
            placeholder="Selecteer Spaanse regio"
            showPopular={true}
            required
            error={errors.region}
          />
          
          <div className="space-y-2">
            <Label htmlFor="city">Stad/Plaats *</Label>
            <Input
              id="city"
              value={formData.city || ''}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Marbella"
              className={errors.city ? 'border-error-500' : ''}
            />
            {errors.city && <p className="text-xs text-error-600">{errors.city}</p>}
          </div>
        </div>
      </DynamicFormSection>

      {/* Investment & Usage */}
      <DynamicFormSection
        title="Investering & Gebruik"
        icon="💰"
        description="Investment type en target market"
      >
        <DynamicStamdataSelect
          category="investment_types"
          value={formData.investmentType || ''}
          onChange={(value) => setFormData({ ...formData, investmentType: value })}
          label="Investment Type"
          placeholder="Selecteer investment type"
          showPopular={true}
        />
      </DynamicFormSection>

      {/* Property Amenities */}
      <DynamicFormSection
        title="Pand Voorzieningen" 
        icon="🏊"
        description="Alle voorzieningen en features van het pand"
        collapsible={true}
      >
        <DynamicStamdataChecklist
          category="property_amenities"
          selectedValues={formData.amenities || {}}
          onChange={(values) => setFormData({ ...formData, amenities: values })}
          mode="object"
          columns={3}
          showDescriptions={true}
          groupByMetadata="category"
        />
      </DynamicFormSection>

      {/* Utilities */}
      <DynamicFormSection
        title="Nutsvoorzieningen"
        icon="⚡"
        description="Gas, water, licht en andere voorzieningen"
        collapsible={true}
      >
        <DynamicStamdataChecklist
          category="property_utilities"
          selectedValues={formData.utilities || []}
          onChange={(values) => setFormData({ ...formData, utilities: values })}
          mode="array"
          columns={4}
        />
      </DynamicFormSection>
    </>
  )
}

/**
 * Stamdata-driven client form sections
 */
interface ClientFormSectionsProps {
  formData: any
  setFormData: (data: any) => void
  errors: Record<string, string>
}

export function ClientFormSections({ formData, setFormData, errors }: ClientFormSectionsProps) {
  return (
    <>
      {/* Basic Client Information */}
      <DynamicFormSection
        title="Client Informatie"
        icon="👤"
        description="Type client en doelgroep"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DynamicStamdataSelect
            category="client_types"
            value={formData.clientType || ''}
            onChange={(value) => setFormData({ ...formData, clientType: value })}
            label="Client Type"
            placeholder="Selecteer client type"
            required
            error={errors.clientType}
          />
          
          <DynamicStamdataSelect
            category="target_audiences"
            value={formData.nationality || ''}
            onChange={(value) => setFormData({ ...formData, nationality: value })}
            label="Nationaliteit"
            placeholder="Selecteer nationaliteit"
            required
            error={errors.nationality}
          />
        </div>
      </DynamicFormSection>

      {/* Lead Information */}
      <DynamicFormSection
        title="Lead Informatie"
        icon="📈"
        description="Hoe en waarom kwam deze client bij je"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DynamicStamdataSelect
            category="lead_sources"
            value={formData.leadSource || ''}
            onChange={(value) => setFormData({ ...formData, leadSource: value })}
            label="Lead Bron"
            placeholder="Waar kwam de client vandaan"
            showPopular={true}
          />
          
          <DynamicStamdataSelect
            category="investment_types"
            value={formData.investmentInterest || ''}
            onChange={(value) => setFormData({ ...formData, investmentInterest: value })}
            label="Investment Interesse"
            placeholder="Wat zoekt de client"
          />
        </div>
      </DynamicFormSection>

      {/* Client Tags */}
      <DynamicFormSection
        title="Client Tags & Segmentatie"
        icon="🏷️"
        description="Labels voor client categorisering"
        collapsible={true}
      >
        <DynamicStamdataChecklist
          category="client_tags"
          selectedValues={formData.tags || []}
          onChange={(values) => setFormData({ ...formData, tags: values })}
          mode="array"
          columns={3}
          showDescriptions={true}
        />
      </DynamicFormSection>
    </>
  )
}