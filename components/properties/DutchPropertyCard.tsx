'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  MapPin, 
  Euro, 
  Bed, 
  Bath, 
  Square,
  Camera,
  Heart,
  Share2,
  Eye,
  Edit,
  BarChart3,
  Plane,
  Waves,
  Car,
  TreePine,
  Zap,
  Calendar,
  TrendingDown
} from 'lucide-react'

interface DutchPropertyCardProps {
  property: {
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
    
    // Key features for Dutch buyers
    amenities?: {
      privatePool?: boolean
      seaView?: boolean
      golf?: boolean
      garage?: boolean
      airConditioning?: boolean
      centralHeating?: boolean
      solarPanels?: boolean
    }
    
    // Critical distances
    distances?: {
      airport?: number
      beach?: number
      golf?: number
    }
    
    // Media
    mainImage?: string
    imageCount: number
    hasVirtualTour?: boolean
    
    // Performance
    viewsCount: number
    inquiriesCount: number
    
    createdAt: string
    featured?: boolean
  }
  onView: () => void
  onEdit: () => void
  onAnalytics: () => void
  onToggleFavorite?: () => void
}

export function DutchPropertyCard({ 
  property, 
  onView, 
  onEdit, 
  onAnalytics,
  onToggleFavorite 
}: DutchPropertyCardProps) {
  
  const getStatusBadge = (status: string) => {
    const variants = {
      available: <Badge className="bg-success-100 text-success-700">Beschikbaar</Badge>,
      reserved: <Badge className="bg-warning-100 text-warning-700">Gereserveerd</Badge>,
      under_offer: <Badge className="bg-primary-100 text-primary-700">Bod Ontvangen</Badge>,
      sold: <Badge className="bg-neutral-100 text-neutral-700">Verkocht</Badge>,
      new_build: <Badge className="bg-blue-100 text-blue-700">Nieuwbouw</Badge>
    }
    return variants[status as keyof typeof variants] || <Badge>{status}</Badge>
  }

  const getAudienceFlag = (audience: string) => {
    const flags = {
      dutch: '🇳🇱',
      english: '🇬🇧', 
      belgian: '🇧🇪',
      german: '🇩🇪',
      all: '🌍'
    }
    return flags[audience as keyof typeof flags] || '🌍'
  }

  const getInvestmentTypeLabel = (type: string) => {
    const labels = {
      holiday_home: 'Vakantiehuis',
      permanent_residence: 'Permanent',
      rental_investment: 'Verhuur',
      retirement_property: 'Pensioen'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getPropertyTypeIcon = (type: string) => {
    const icons = {
      villa: '🏖️',
      apartment: '🏢', 
      townhouse: '🏘️',
      finca: '🌿',
      penthouse: '🏙️'
    }
    return icons[type as keyof typeof icons] || '🏠'
  }

  return (
    <Card variant="business" className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Featured Ribbon */}
      {property.featured && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-warning-500 text-white text-xs font-bold px-3 py-1 transform rotate-12 translate-x-3 -translate-y-1">
            UITGELICHT
          </div>
        </div>
      )}

      {/* Property Image with Overlays */}
      <div className="relative h-56 bg-neutral-100 overflow-hidden">
        {property.mainImage ? (
          <img 
            src={property.mainImage} 
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-neutral-100 to-neutral-200">
            <Camera className="h-16 w-16 text-neutral-400" />
            <span className="ml-3 text-neutral-500">Geen foto's</span>
          </div>
        )}
        
        {/* Price Badge (IkZoekEenHuis style) */}
        <div className="absolute top-4 left-4">
          <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-neutral-900">
                {property.currency === 'EUR' ? '€' : '£'}{property.price.toLocaleString('nl-NL')}
              </div>
              {property.priceReduced && (
                <div className="flex items-center gap-1">
                  <TrendingDown className="h-4 w-4 text-error-500" />
                  <div className="text-xs text-error-600 line-through">
                    €{property.priceReduced.originalPrice.toLocaleString('nl-NL')}
                  </div>
                </div>
              )}
            </div>
            {property.livingArea && (
              <div className="text-xs text-neutral-600">
                €{Math.round(property.price / property.livingArea)} per m²
              </div>
            )}
          </div>
        </div>

        {/* Status & Audience Badges */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {getStatusBadge(property.status)}
          <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm text-center">
            {getAudienceFlag(property.targetAudience)}
          </div>
        </div>

        {/* Media Count */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <Camera className="h-3 w-3" />
            {property.imageCount} foto's
            {property.hasVirtualTour && (
              <span className="ml-1 text-blue-300">+ Virtual Tour</span>
            )}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            {onToggleFavorite && (
              <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                <Heart className="h-4 w-4 text-neutral-600" />
              </button>
            )}
            <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
              <Share2 className="h-4 w-4 text-neutral-600" />
            </button>
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Property Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-neutral-900 line-clamp-2 leading-tight">
                {property.title}
              </h3>
              <div className="text-sm text-neutral-500 mt-1">
                Ref: {property.referenceNumber}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg">
                {getPropertyTypeIcon(property.propertyType)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-neutral-600">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{property.city}, {property.region}</span>
            <span className="text-xs text-neutral-400">({property.province})</span>
          </div>
        </div>

        {/* Property Specifications (IkZoekEenHuis style) */}
        <div className="grid grid-cols-3 gap-4 py-3 border-y border-neutral-100">
          <div className="flex items-center gap-2 text-sm">
            <Bed className="h-4 w-4 text-primary-600" />
            <span className="font-medium">{property.bedrooms}</span>
            <span className="text-neutral-500">bed</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Bath className="h-4 w-4 text-primary-600" />
            <span className="font-medium">{property.bathrooms}</span>
            <span className="text-neutral-500">bad</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Square className="h-4 w-4 text-primary-600" />
            <span className="font-medium">{property.livingArea}</span>
            <span className="text-neutral-500">m²</span>
          </div>
        </div>

        {/* Key Features for Dutch Buyers */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {property.amenities?.privatePool && (
              <Badge variant="outline" className="text-xs">🏊 Privé Zwembad</Badge>
            )}
            {property.amenities?.seaView && (
              <Badge variant="outline" className="text-xs">🌊 Zeezicht</Badge>
            )}
            {property.amenities?.golf && (
              <Badge variant="outline" className="text-xs">⛳ Golf</Badge>
            )}
            {property.amenities?.airConditioning && (
              <Badge variant="outline" className="text-xs">❄️ Airco</Badge>
            )}
            {property.amenities?.centralHeating && (
              <Badge variant="outline" className="text-xs">🔥 C.V.</Badge>
            )}
            {property.plotSize && (
              <Badge variant="outline" className="text-xs">🌳 {property.plotSize}m² tuin</Badge>
            )}
          </div>

          {/* Investment Type & Target */}
          <div className="flex items-center justify-between text-xs">
            <Badge className="bg-primary-50 text-primary-700">
              {getInvestmentTypeLabel(property.investmentType)}
            </Badge>
            <span className="text-neutral-500">
              Voor {getAudienceFlag(property.targetAudience)} klanten
            </span>
          </div>
        </div>

        {/* Critical Distances (Dutch Buyer Priorities) */}
        {property.distances && (
          <div className="bg-neutral-50 p-3 rounded-lg">
            <div className="grid grid-cols-3 gap-3 text-xs text-neutral-600">
              {property.distances.airport && (
                <div className="flex items-center gap-1">
                  <Plane className="h-3 w-3" />
                  <span>{property.distances.airport}min</span>
                </div>
              )}
              {property.distances.beach && (
                <div className="flex items-center gap-1">
                  <Waves className="h-3 w-3" />
                  <span>{property.distances.beach}min</span>
                </div>
              )}
              {property.distances.golf && (
                <div className="flex items-center gap-1">
                  <TreePine className="h-3 w-3" />
                  <span>{property.distances.golf}min golf</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-3 text-xs text-neutral-500 border-t border-neutral-100 pt-3">
          <div className="text-center">
            <div className="font-medium text-neutral-900">{property.viewsCount}</div>
            <div>Weergaven</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-neutral-900">{property.inquiriesCount}</div>
            <div>Info Aanvragen</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-neutral-900">
              {new Date(property.createdAt).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' })}
            </div>
            <div>Toegevoegd</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button onClick={onView} variant="business" size="sm" className="flex-1">
            <Eye className="h-4 w-4" />
            Bekijk Details
          </Button>
          <Button onClick={onEdit} variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button onClick={onAnalytics} variant="outline" size="sm" title="Analytics">
            <BarChart3 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Dutch Property List View (Alternative layout)
export function DutchPropertyListItem({ 
  property, 
  onView, 
  onEdit, 
  onAnalytics 
}: DutchPropertyCardProps) {
  
  const getInvestmentTypeLabel = (type: string) => {
    const labels = {
      holiday_home: 'Vakantiehuis',
      permanent_residence: 'Permanent',
      rental_investment: 'Verhuur',
      retirement_property: 'Pensioen'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      available: <Badge className="bg-success-100 text-success-700">Beschikbaar</Badge>,
      reserved: <Badge className="bg-warning-100 text-warning-700">Gereserveerd</Badge>,
      under_offer: <Badge className="bg-primary-100 text-primary-700">Bod Ontvangen</Badge>,
      sold: <Badge className="bg-neutral-100 text-neutral-700">Verkocht</Badge>,
      new_build: <Badge className="bg-blue-100 text-blue-700">Nieuwbouw</Badge>
    }
    return variants[status as keyof typeof variants] || <Badge>{status}</Badge>
  }

  const getAudienceFlag = (audience: string) => {
    const flags = {
      dutch: '🇳🇱',
      english: '🇬🇧', 
      belgian: '🇧🇪',
      german: '🇩🇪',
      all: '🌍'
    }
    return flags[audience as keyof typeof flags] || '🌍'
  }
  return (
    <div className="group p-6 border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
      <div className="flex items-start gap-6">
        {/* Thumbnail */}
        <div className="w-32 h-24 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0 relative">
          {property.mainImage ? (
            <img 
              src={property.mainImage} 
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Camera className="h-8 w-8 text-neutral-400" />
            </div>
          )}
          
          <div className="absolute bottom-1 right-1">
            <Badge className="bg-black/70 text-white text-xs">
              {property.imageCount}
            </Badge>
          </div>
        </div>

        {/* Property Info */}
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg text-neutral-900 line-clamp-1">
                {property.title}
              </h3>
              <div className="flex items-center gap-3 text-sm text-neutral-600 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {property.city}, {property.region}
                </span>
                <span className="text-neutral-400">Ref: {property.referenceNumber}</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-neutral-900">
                €{property.price.toLocaleString('nl-NL')}
              </div>
              {property.priceReduced && (
                <div className="flex items-center gap-1 justify-end">
                  <TrendingDown className="h-3 w-3 text-error-500" />
                  <span className="text-xs text-error-600 line-through">
                    €{property.priceReduced.originalPrice.toLocaleString('nl-NL')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-neutral-600">
            <span className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              {property.bedrooms} slaapkamers
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              {property.bathrooms} badkamers
            </span>
            <span className="flex items-center gap-1">
              <Square className="h-4 w-4" />
              {property.livingArea} m²
            </span>
            {property.plotSize && (
              <span className="flex items-center gap-1">
                <TreePine className="h-4 w-4" />
                {property.plotSize} m² tuin
              </span>
            )}
          </div>

          {/* Key Features Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {property.amenities?.privatePool && <Badge variant="outline" className="text-xs">🏊 Zwembad</Badge>}
            {property.amenities?.seaView && <Badge variant="outline" className="text-xs">🌊 Zeezicht</Badge>}
            {property.amenities?.airConditioning && <Badge variant="outline" className="text-xs">❄️ Airco</Badge>}
            {property.amenities?.centralHeating && <Badge variant="outline" className="text-xs">🔥 C.V.</Badge>}
            {property.amenities?.garage && <Badge variant="outline" className="text-xs">🚗 Garage</Badge>}
            
            <Badge className="bg-primary-50 text-primary-700 text-xs ml-auto">
              {getInvestmentTypeLabel(property.investmentType)}
            </Badge>
          </div>

          {/* Distance Info (Critical for Dutch buyers) */}
          {property.distances && (
            <div className="flex items-center gap-4 text-xs text-neutral-500">
              {property.distances.airport && (
                <span className="flex items-center gap-1">
                  <Plane className="h-3 w-3" />
                  {property.distances.airport} min luchthaven
                </span>
              )}
              {property.distances.beach && (
                <span className="flex items-center gap-1">
                  <Waves className="h-3 w-3" />
                  {property.distances.beach} min strand
                </span>
              )}
              {property.distances.golf && (
                <span className="flex items-center gap-1">
                  <TreePine className="h-3 w-3" />
                  {property.distances.golf} min golf
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 justify-center">
          <Button onClick={onView} variant="business" size="sm" className="min-w-32">
            <Eye className="h-4 w-4" />
            Details
          </Button>
          <div className="flex gap-1">
            <Button onClick={onEdit} variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button onClick={onAnalytics} variant="outline" size="sm">
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-xs text-neutral-500 text-center">
            {property.viewsCount} weergaven
          </div>
        </div>
      </div>
    </div>
  )
}

// Property Performance Indicator (Dutch Analytics)
export function DutchPropertyPerformance({ property }: { property: any }) {
  const performanceScore = Math.round(
    (property.viewsCount * 0.4) + 
    (property.inquiriesCount * 3) + 
    (property.featured ? 20 : 0)
  )

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-success-600 bg-success-50'
    if (score >= 60) return 'text-warning-600 bg-warning-50'
    if (score >= 40) return 'text-primary-600 bg-primary-50'
    return 'text-neutral-600 bg-neutral-50'
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getPerformanceColor(performanceScore)}`}>
      <BarChart3 className="h-3 w-3" />
      Performance: {performanceScore}%
    </div>
  )
}