'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { SearchBar } from '@/components/ui/search-bar'
import { FilterTags } from '@/components/ui/url-filters'
import { 
  Filter, 
  MapPin, 
  Building2, 
  Euro, 
  Waves,
  TreePine,
  Car,
  Zap,
  Plane,
  X
} from 'lucide-react'

interface DutchPropertyFiltersProps {
  filters: any
  onFilterChange: (key: string, value: any) => void
  onClearAll: () => void
  hasActiveFilters: boolean
  className?: string
}

export function DutchPropertyFilters({ 
  filters, 
  onFilterChange, 
  onClearAll, 
  hasActiveFilters,
  className 
}: DutchPropertyFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Note: These should be loaded from database stamdata via useStamdata hook
  // Keeping minimal hardcoded fallbacks for initial load only

  return (
    <Card variant="business" elevation="medium" className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-primary-600" />
            Spaanse Vastgoed Filters (Nederlandse Kopers)
          </CardTitle>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Minder Filters' : 'Meer Filters'}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
              >
                <X className="h-4 w-4" />
                Alles Wissen
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Search Bar (IkZoekEenHuis style) */}
        <div className="space-y-3">
          <SearchBar
            placeholder="Zoek stad, regio, referentie nummer..."
            value={filters.search}
            onChange={(value) => onFilterChange('search', value)}
            suggestions={['Marbella', 'Torrevieja', 'Calpe', 'Alicante', 'Pinoso', 'Villa', 'Zeezicht']}
            className="w-full"
            storageKey="spanishPropertySearch"
          />
          
          {/* Quick Filters Row */}
          <div className="flex items-center gap-4 flex-wrap">
            <Select value={filters.propertyType} onValueChange={(value) => onFilterChange('propertyType', value)}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Types</SelectItem>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.region} onValueChange={(value) => onFilterChange('region', value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Regio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Regio's</SelectItem>
                {spanishRegions.map((region) => (
                  <SelectItem key={region.value} value={region.value}>
                    {region.label} {region.popular && '⭐'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.priceRange} onValueChange={(value) => onFilterChange('priceRange', value)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Prijs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Prijzen</SelectItem>
                <SelectItem value="0-200000">Tot €200k</SelectItem>
                <SelectItem value="200000-350000">€200k - €350k</SelectItem>
                <SelectItem value="350000-500000">€350k - €500k</SelectItem>
                <SelectItem value="500000-750000">€500k - €750k</SelectItem>
                <SelectItem value="750000-1000000">€750k - €1M</SelectItem>
                <SelectItem value="1000000-99999999">€1M+</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-3">
              <Input
                type="number"
                placeholder="Slaapkamers"
                value={filters.bedrooms}
                onChange={(e) => onFilterChange('bedrooms', e.target.value)}
                className="w-32"
              />
              <Input
                type="number" 
                placeholder="Badkamers"
                value={filters.bathrooms}
                onChange={(e) => onFilterChange('bathrooms', e.target.value)}
                className="w-32"
              />
            </div>
          </div>
        </div>

        {/* Priority Features (Always visible) */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Nederlandse Koper Prioriteiten</Label>
          <div className="flex flex-wrap gap-3">
            {priorityFeatures.map((feature) => (
              <div key={feature.key} className="flex items-center space-x-2">
                <Checkbox
                  id={feature.key}
                  checked={filters[feature.key]}
                  onCheckedChange={(checked) => onFilterChange(feature.key, checked)}
                />
                <Label htmlFor={feature.key} className="text-sm cursor-pointer">
                  {feature.icon} {feature.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Filters (Expandable) */}
        {isExpanded && (
          <div className="space-y-6 border-t border-neutral-200 pt-6">
            {/* Distance Filters (Critical for international buyers) */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Plane className="h-4 w-4" />
                Maximum Afstanden (Nederlandse Prioriteiten)
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-neutral-600">Luchthaven (min)</Label>
                  <Input
                    type="number"
                    value={filters.maxAirportDistance}
                    onChange={(e) => onFilterChange('maxAirportDistance', Number(e.target.value))}
                    placeholder="60"
                    className="text-sm"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-neutral-600">Strand (min)</Label>
                  <Input
                    type="number"
                    value={filters.maxBeachDistance}
                    onChange={(e) => onFilterChange('maxBeachDistance', Number(e.target.value))}
                    placeholder="20"
                    className="text-sm"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-neutral-600">Golf (min)</Label>
                  <Input
                    type="number"
                    value={filters.maxGolfDistance}
                    onChange={(e) => onFilterChange('maxGolfDistance', Number(e.target.value))}
                    placeholder="15"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Investment Filters */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Investering & Gebruik</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: 'holiday_home', label: 'Vakantiehuis' },
                  { key: 'retirement', label: 'Pensioen' },
                  { key: 'rental_investment', label: 'Verhuur' },
                  { key: 'permanent', label: 'Permanent' }
                ].map((type) => (
                  <div key={type.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={type.key}
                      checked={filters.investmentTypes?.includes(type.key)}
                      onCheckedChange={(checked) => {
                        const current = filters.investmentTypes || []
                        if (checked) {
                          onFilterChange('investmentTypes', [...current, type.key])
                        } else {
                          onFilterChange('investmentTypes', current.filter((t: string) => t !== type.key))
                        }
                      }}
                    />
                    <Label htmlFor={type.key} className="text-sm">{type.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Filters */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Financiële Details</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-neutral-600">Max. Community Fees (€/maand)</Label>
                  <Input
                    type="number"
                    value={filters.maxCommunityFees}
                    onChange={(e) => onFilterChange('maxCommunityFees', Number(e.target.value))}
                    placeholder="200"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-neutral-600">Max. IBI (€/jaar)</Label>
                  <Input
                    type="number"
                    value={filters.maxIbi}
                    onChange={(e) => onFilterChange('maxIbi', Number(e.target.value))}
                    placeholder="1000"
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-4">
                  <Checkbox
                    id="habitationCert"
                    checked={filters.hasHabitationCertificate}
                    onCheckedChange={(checked) => onFilterChange('hasHabitationCertificate', checked)}
                  />
                  <Label htmlFor="habitationCert" className="text-sm">Habitation Certificate</Label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="border-t border-neutral-200 pt-4">
            <FilterTags
              filters={filters}
              defaultFilters={{ 
                search: '', 
                propertyType: 'all', 
                region: 'all', 
                priceRange: 'all',
                bedrooms: '',
                bathrooms: '',
                hasPool: false,
                hasSeaView: false,
                hasGolf: false
              }}
              onClearFilter={(key) => onFilterChange(key, key === 'search' ? '' : key.includes('has') ? false : 'all')}
              onClearAll={onClearAll}
              filterLabels={{ 
                search: 'Zoeken', 
                propertyType: 'Type',
                region: 'Regio',
                priceRange: 'Prijs',
                bedrooms: 'Slaapkamers',
                bathrooms: 'Badkamers',
                hasPool: 'Zwembad',
                hasSeaView: 'Zeezicht',
                hasGolf: 'Golf'
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Dutch Property Results Summary Component
export function DutchPropertySummary({ 
  totalProperties, 
  filteredCount,
  averagePrice,
  popularRegions 
}: {
  totalProperties: number
  filteredCount: number
  averagePrice: number
  popularRegions: Array<{ region: string; count: number }>
}) {
  return (
    <Card variant="business" elevation="subtle">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-primary-600">{filteredCount}</div>
            <div className="text-sm text-neutral-600">Panden Gevonden</div>
            {filteredCount !== totalProperties && (
              <div className="text-xs text-neutral-500">van {totalProperties} totaal</div>
            )}
          </div>
          
          <div>
            <div className="text-2xl font-bold text-success-600">
              €{Math.round(averagePrice / 1000)}k
            </div>
            <div className="text-sm text-neutral-600">Gemiddelde Prijs</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-warning-600">
              {popularRegions[0]?.region || 'Costa Blanca'}
            </div>
            <div className="text-sm text-neutral-600">Populairste Regio</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-neutral-600">🇳🇱</div>
            <div className="text-sm text-neutral-600">Nederlandse Focus</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Quick Filter Presets for Dutch Buyers
export function DutchFilterPresets({ onApplyPreset }: { onApplyPreset: (preset: any) => void }) {
  const presets = [
    {
      name: 'Pensioen Villa\'s',
      description: 'Geschikt voor Nederlandse pensionado\'s',
      icon: '🏖️',
      filters: {
        propertyType: 'villa',
        priceRange: '200000-500000',
        hasPool: true,
        centralHeating: true,
        maxAirportDistance: 60,
        region: 'costa-blanca',
        investmentType: 'retirement'
      }
    },
    {
      name: 'Vakantie Appartementen', 
      description: 'Perfect voor Nederlandse vakanties',
      icon: '🏢',
      filters: {
        propertyType: 'apartment',
        priceRange: '150000-350000', 
        hasSeaView: true,
        maxBeachDistance: 10,
        region: 'costa-del-sol',
        investmentType: 'holiday_home'
      }
    },
    {
      name: 'Verhuur Investering',
      description: 'Hoog rendement voor Nederlandse investeerders',
      icon: '💰',
      filters: {
        hasPool: true,
        maxAirportDistance: 45,
        hasRentalPotential: true,
        investmentType: 'rental_investment'
      }
    },
    {
      name: 'Instapklare Woningen',
      description: 'Turn-key ready voor Nederlandse kopers',
      icon: '✅',
      filters: {
        condition: 'excellent',
        hasHabitationCertificate: true,
        airConditioning: true,
        centralHeating: true
      }
    }
  ]

  return (
    <Card variant="business" elevation="subtle">
      <CardHeader>
        <CardTitle className="text-base">Nederlandse Koper Selecties</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onApplyPreset(preset.filters)}
              className="text-left p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all"
            >
              <div className="text-lg mb-1">{preset.icon}</div>
              <div className="font-medium text-neutral-900 text-sm mb-1">{preset.name}</div>
              <div className="text-xs text-neutral-600">{preset.description}</div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}