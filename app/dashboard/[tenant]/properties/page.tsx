'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyStates } from '@/components/ui/empty-state'
import { ProtectedRoute } from '@/lib/auth/AuthContext'
import { EnhancedPropertyModal } from '@/components/properties/EnhancedPropertyModal'
import { DutchPropertyCard, DutchPropertyListItem, DutchPropertyPerformance } from '@/components/properties/DutchPropertyCard'
import { DutchPropertyFilters, DutchPropertySummary, DutchFilterPresets } from '@/components/properties/DutchPropertyFilters'
import { useURLFilters } from '@/components/ui/url-filters'
import { toast } from '@/components/ui/toast'
import { 
  Building2, 
  Plus, 
  Grid, 
  List,
  BarChart3,
  TrendingUp,
  Users,
  Euro,
  Map
} from 'lucide-react'

// Enhanced property interface based on IkZoekEenHuis analysis
interface SpanishProperty {
  id: string
  referenceNumber: string
  title: string
  price: number
  currency: string
  priceReduced?: { originalPrice: number; reducedDate: string }
  
  city: string
  region: string
  province: string
  
  bedrooms: number
  bathrooms: number
  livingArea: number
  plotSize?: number
  
  propertyType: string
  status: string
  targetAudience: string
  investmentType: string
  
  amenities: {
    privatePool?: boolean
    seaView?: boolean
    golf?: boolean
    garage?: boolean
    airConditioning?: boolean
    centralHeating?: boolean
    solarPanels?: boolean
  }
  
  distances: {
    airport?: number
    beach?: number
    golf?: number
  }
  
  mainImage?: string
  imageCount: number
  hasVirtualTour?: boolean
  
  viewsCount: number
  inquiriesCount: number
  
  createdAt: string
  featured?: boolean
}

export default function DutchSpanishPropertiesPage() {
  return (
    <ProtectedRoute>
      <DutchSpanishPropertiesContent />
    </ProtectedRoute>
  )
}

function DutchSpanishPropertiesContent() {
  const params = useParams()
  const tenant = params.tenant as string
  
  // Demo properties (IkZoekEenHuis style)
  const [properties, setProperties] = useState<SpanishProperty[]>([
    {
      id: '1',
      referenceNumber: 'DUT-001',
      title: 'Instapklare villa in de prachtige Zarza vallei nabij Pinoso',
      price: 359950,
      currency: 'EUR',
      city: 'Pinoso',
      region: 'Costa Blanca',
      province: 'Alicante',
      bedrooms: 3,
      bathrooms: 2,
      livingArea: 226,
      plotSize: 3354,
      propertyType: 'villa',
      status: 'available',
      targetAudience: 'dutch',
      investmentType: 'retirement_property',
      amenities: {
        privatePool: true,
        airConditioning: true,
        centralHeating: true,
        solarPanels: true,
        garage: true
      },
      distances: {
        airport: 45,
        beach: 35,
        golf: 25
      },
      imageCount: 15,
      hasVirtualTour: true,
      viewsCount: 234,
      inquiriesCount: 12,
      createdAt: '2025-01-15T10:00:00Z',
      featured: true
    },
    {
      id: '2',
      referenceNumber: 'DUT-002', 
      title: 'Modern appartement met zeezicht in het hart van Torrevieja',
      price: 189000,
      currency: 'EUR',
      city: 'Torrevieja',
      region: 'Costa Blanca',
      province: 'Alicante',
      bedrooms: 2,
      bathrooms: 2,
      livingArea: 85,
      propertyType: 'apartment',
      status: 'available',
      targetAudience: 'dutch',
      investmentType: 'holiday_home',
      amenities: {
        seaView: true,
        airConditioning: true
      },
      distances: {
        airport: 40,
        beach: 2,
        golf: 15
      },
      imageCount: 12,
      viewsCount: 156,
      inquiriesCount: 8,
      createdAt: '2025-01-20T14:00:00Z'
    }
  ])
  
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showModal, setShowModal] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<SpanishProperty | undefined>(undefined)

  // Dutch buyer-focused filters (IkZoekEenHuis style)
  const { filters, updateFilter, clearFilters, hasActiveFilters } = useURLFilters({
    search: '',
    propertyType: 'all',
    region: 'all',
    priceRange: 'all',
    bedrooms: '',
    bathrooms: '',
    hasPool: false,
    hasSeaView: false,
    hasGolf: false,
    maxAirportDistance: '',
    maxBeachDistance: '',
    investmentType: 'all',
    targetAudience: 'all'
  })

  // Filter properties with Dutch buyer logic
  const filteredProperties = properties.filter(property => {
    const matchesSearch = !filters.search || 
      property.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      property.city.toLowerCase().includes(filters.search.toLowerCase()) ||
      property.referenceNumber.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesType = filters.propertyType === 'all' || property.propertyType === filters.propertyType
    const matchesRegion = filters.region === 'all' || property.region.toLowerCase().replace(' ', '-') === filters.region
    const matchesAudience = filters.targetAudience === 'all' || property.targetAudience === filters.targetAudience
    const matchesInvestment = filters.investmentType === 'all' || property.investmentType === filters.investmentType
    
    // Price range filtering
    let matchesPrice = true
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number)
      matchesPrice = property.price >= (min || 0) && (!max || property.price <= max)
    }
    
    // Room requirements
    const matchesBedrooms = !filters.bedrooms || property.bedrooms >= Number(filters.bedrooms)
    const matchesBathrooms = !filters.bathrooms || property.bathrooms >= Number(filters.bathrooms)
    
    // Feature requirements (Dutch priorities)
    const matchesPool = !filters.hasPool || property.amenities.privatePool
    const matchesSeaView = !filters.hasSeaView || property.amenities.seaView
    const matchesGolf = !filters.hasGolf || property.amenities.golf
    
    // Distance requirements
    const matchesAirport = !filters.maxAirportDistance || !property.distances.airport || property.distances.airport <= Number(filters.maxAirportDistance)
    const matchesBeach = !filters.maxBeachDistance || !property.distances.beach || property.distances.beach <= Number(filters.maxBeachDistance)
    
    return matchesSearch && matchesType && matchesRegion && matchesAudience && matchesInvestment && 
           matchesPrice && matchesBedrooms && matchesBathrooms && matchesPool && matchesSeaView && 
           matchesGolf && matchesAirport && matchesBeach
  })

  const handleCreateProperty = () => {
    setSelectedProperty(undefined)
    setShowModal(true)
  }

  const handleSaveProperty = async (propertyData: any) => {
    try {
      if (propertyData.id) {
        // Update existing
        setProperties(properties.map(p => 
          p.id === propertyData.id ? { ...p, ...propertyData } : p
        ))
      } else {
        // Create new with proper Dutch structure
        const newProperty: SpanishProperty = {
          ...propertyData,
          id: Date.now().toString(),
          referenceNumber: `DUT-${String(properties.length + 1).padStart(3, '0')}`,
          viewsCount: 0,
          inquiriesCount: 0,
          createdAt: new Date().toISOString(),
          imageCount: 0
        }
        setProperties([newProperty, ...properties])
      }
      
      // Clear filters if needed to show new property
      if (hasActiveFilters) {
        toast.info('Filters gewist', 'Om je nieuwe pand te zien zijn filters geleegd')
        clearFilters()
      }
    } catch (error) {
      throw error
    }
  }

  const applyFilterPreset = (preset: any) => {
    Object.keys(preset).forEach(key => {
      updateFilter(key, preset[key])
    })
    toast.success('Filter toegepast', 'Nederlandse koper selectie actief')
  }

  // Calculate analytics for Dutch buyers
  const analytics = {
    totalProperties: properties.length,
    filteredCount: filteredProperties.length,
    averagePrice: Math.round(filteredProperties.reduce((acc, p) => acc + p.price, 0) / filteredProperties.length) || 0,
    popularRegions: [
      { region: 'Costa Blanca', count: properties.filter(p => p.region === 'Costa Blanca').length },
      { region: 'Costa del Sol', count: properties.filter(p => p.region === 'Costa del Sol').length }
    ]
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Nederlandse Makelaar Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="container-business">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-50 rounded-xl">
                <Building2 className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Spaanse Vastgoed Portfolio</h1>
                <p className="text-neutral-600 text-base">Voor Nederlandse, Engelse en Belgische klanten • IkZoekEenHuis style</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex items-center gap-2 border border-neutral-200 rounded-lg p-1">
                <Button 
                  variant={viewMode === 'grid' ? 'business' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'business' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <Button onClick={handleCreateProperty} variant="business" size="lg">
                <Plus className="h-5 w-5" />
                Nieuw Spaans Pand
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-business py-8 space-y-8">
        {/* Dutch Property Summary */}
        <DutchPropertySummary {...analytics} />

        {/* Dutch Buyer Filter Presets */}
        <DutchFilterPresets onApplyPreset={applyFilterPreset} />

        {/* Advanced Filters */}
        <DutchPropertyFilters
          filters={filters}
          onFilterChange={updateFilter}
          onClearAll={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Properties Display */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} variant="business">
                <CardContent className="p-6 space-y-4">
                  <div className="h-48 bg-neutral-200 rounded animate-pulse" />
                  <div className="h-6 bg-neutral-200 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-neutral-200 rounded w-1/2 animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <Card variant="business" elevation="medium">
            <CardContent className="p-12">
              {hasActiveFilters ? (
                <EmptyStates.SearchResults searchTerm={filters.search || 'filters'} />
              ) : (
                <EmptyStates.Properties />
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-neutral-900">
                  {filteredProperties.length} {filteredProperties.length === 1 ? 'pand' : 'panden'} gevonden
                </h2>
                {hasActiveFilters && (
                  <span className="text-sm text-neutral-500">
                    (gefilterd van {properties.length} totaal)
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-neutral-600">
                  Gemiddelde prijs: €{Math.round(analytics.averagePrice / 1000)}k
                </span>
              </div>
            </div>

            {/* Property Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <div key={property.id} className="relative">
                    <DutchPropertyCard 
                      property={property}
                      onView={() => toast.info('Property details', 'Detail view wordt binnenkort toegevoegd')}
                      onEdit={() => {
                        setSelectedProperty(property)
                        setShowModal(true)
                      }}
                      onAnalytics={() => toast.info('Analytics', 'Property analytics worden binnenkort toegevoegd')}
                    />
                    {/* Performance Indicator */}
                    <div className="absolute -top-2 -right-2">
                      <DutchPropertyPerformance property={property} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card variant="business" elevation="medium">
                <CardContent className="p-0">
                  <div className="divide-y divide-neutral-100">
                    {filteredProperties.map((property) => (
                      <DutchPropertyListItem 
                        key={property.id}
                        property={property}
                        onView={() => toast.info('Property details', 'Detail view wordt binnenkort toegevoegd')}
                        onEdit={() => {
                          setSelectedProperty(property)
                          setShowModal(true)
                        }}
                        onAnalytics={() => toast.info('Analytics', 'Property analytics worden binnenkort toegevoegd')}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Enhanced Property Modal */}
        <EnhancedPropertyModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveProperty}
          property={selectedProperty}
        />
      </main>
    </div>
  )
}