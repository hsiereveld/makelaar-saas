'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingButton } from '@/components/ui/loading-button'
import { toast } from '@/components/ui/toast'
import { useFormAutoSave, AutoSaveStatus } from '@/hooks/use-auto-save'
import { PropertyFormSections, DynamicStamdataSelect, DynamicStamdataChecklist } from '@/components/forms/DynamicStamdataForm'
import { usePropertyStamdata } from '@/hooks/use-stamdata'
import { 
  Building2, 
  MapPin,
  Euro,
  Camera,
  Bed,
  Bath,
  Square,
  Zap,
  Car,
  TreePine,
  Waves,
  Shield,
  Wifi,
  Snowflake,
  Sun,
  Home,
  Users,
  CheckCircle,
  Info,
  Upload,
  X
} from 'lucide-react'

interface EnhancedProperty {
  // Basic Information
  id?: string
  referenceNumber: string
  title: string
  description: string
  propertyType: 'villa' | 'apartment' | 'townhouse' | 'finca' | 'penthouse' | 'duplex' | 'studio'
  status: 'available' | 'reserved' | 'sold' | 'off_market'
  
  // Financial
  price: number
  currency: 'EUR' | 'GBP'
  priceNegotiable: boolean
  
  // Spanish Location Details
  address: string
  city: string
  region: 'Costa del Sol' | 'Costa Blanca' | 'Costa Brava' | 'Balearic Islands' | 'Canary Islands' | 'Madrid' | 'Barcelona' | 'Valencia'
  province: string
  postalCode: string
  country: 'Spain'
  
  // Property Specifications
  bedrooms: number
  bathrooms: number
  livingArea: number // m²
  plotSize?: number // m²
  builtYear: number
  orientation: 'North' | 'South' | 'East' | 'West' | 'Southeast' | 'Southwest' | 'Northeast' | 'Northwest'
  floors: number
  
  // Spanish Property Features
  amenities: string[] // Pool, Garden, Terrace, Garage, etc.
  utilities: string[] // Electricity, Water, Internet, Gas, etc.
  heating: string[] // Central, Electric, Gas, Solar, etc.
  cooling: string[] // Air Conditioning, Fans, Natural, etc.
  
  // Legal & Certificates
  habitationCertificate: boolean
  energyRating?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
  ibi: number // Annual property tax
  communityFees?: number
  
  // Investment Information
  rentalPotential?: {
    weeklyRate: number
    monthlyRate: number
    annualYield: number
  }
  investmentType: 'permanent_residence' | 'holiday_home' | 'rental_investment' | 'retirement'
  
  // Internacional Target Market
  targetAudience: 'dutch' | 'english' | 'belgian' | 'german' | 'all'
  keyFeatures: string[] // Highlight features for marketing
  
  // Media
  images: Array<{
    url: string
    caption?: string
    isMain: boolean
    order: number
  }>
  virtualTour?: string
  floorPlan?: string
  
  // Distance Information (crucial for international buyers)
  distances: {
    airport?: number // minutes to nearest airport
    beach?: number // minutes to beach
    hospital?: number // minutes to hospital
    golf?: number // minutes to golf course
    shopping?: number // minutes to shopping center
    city_center?: number // minutes to city center
  }
  
  // Nederlandse Makelaar Tracking
  sourceChannel: string
  leadSource?: string
  viewsCount: number
  inquiriesCount: number
  showingsScheduled: number
  
  // Timestamps
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

interface EnhancedPropertyModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  property?: EnhancedProperty
}

export function EnhancedPropertyModal({ isOpen, onClose, onSave, property }: EnhancedPropertyModalProps) {
  const [formData, setFormData] = useState<Partial<EnhancedProperty>>({
    referenceNumber: '',
    title: '',
    description: '',
    propertyType: 'villa',
    status: 'available',
    price: 0,
    currency: 'EUR',
    priceNegotiable: false,
    
    // Spanish defaults
    address: '',
    city: '',
    region: 'Costa del Sol',
    province: 'Alicante',
    postalCode: '',
    country: 'Spain',
    
    bedrooms: 3,
    bathrooms: 2,
    livingArea: 150,
    plotSize: 500,
    builtYear: 2020,
    orientation: 'South',
    floors: 2,
    
    amenities: {},
    utilities: [],
    heating: [],
    cooling: [],
    
    habitationCertificate: false,
    ibi: 500,
    
    investmentType: 'holiday_home',
    targetAudience: 'dutch',
    keyFeatures: [],
    
    images: [],
    
    distances: {
      airport: 45,
      beach: 15,
      hospital: 20,
      golf: 10,
      shopping: 5,
      city_center: 10
    },
    
    sourceChannel: 'manual'
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auto-save enhanced property data
  const autoSave = useFormAutoSave({
    data: formData,
    onSave: async (data) => {
      // Auto-save property draft locally
    },
    storageKey: `enhancedProperty_${property?.id || 'new'}`,
    enabled: isOpen
  })

  // Initialize form
  useEffect(() => {
    if (property && isOpen) {
      setFormData(property)
    } else {
      // Generate reference number
      setFormData(prev => ({
        ...prev,
        referenceNumber: `REF-${Date.now().toString().slice(-6)}`
      }))
    }
  }, [property, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title?.trim()) newErrors.title = 'Pand titel is verplicht'
    if (!formData.price || formData.price <= 0) newErrors.price = 'Geldig prijs is verplicht'
    if (!formData.city?.trim()) newErrors.city = 'Stad is verplicht'
    if (!formData.livingArea || formData.livingArea <= 0) newErrors.livingArea = 'Woonoppervlakte is verplicht'
    if (!formData.bedrooms || formData.bedrooms < 0) newErrors.bedrooms = 'Aantal slaapkamers is verplicht'
    if (!formData.bathrooms || formData.bathrooms < 0) newErrors.bathrooms = 'Aantal badkamers is verplicht'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Formulier ongeldig', 'Controleer alle verplichte velden')
      return
    }

    setLoading(true)
    try {
      await onSave(formData)
      
      const actionText = property ? 'bijgewerkt' : 'toegevoegd'
      toast.success(`Pand ${actionText}`, `Het pand is succesvol ${actionText} aan je portfolio`)
      
      autoSave.clearBackup()
      onClose()
    } catch (error) {
      console.error('Error saving property:', error)
      toast.error('Opslaan mislukt', 'Er ging iets mis bij het opslaan')
    } finally {
      setLoading(false)
    }
  }

  // Note: Amenities and utilities now loaded from database via DynamicStamdataChecklist

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary-600" />
            {property ? 'Pand Bewerken' : 'Nieuw Spaans Pand Toevoegen'}
          </DialogTitle>
          <DialogDescription>
            Professioneel vastgoed management voor Spaanse panden - geoptimaliseerd voor Nederlandse, Engelse en Belgische klanten
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basis Info</TabsTrigger>
            <TabsTrigger value="details">Specificaties</TabsTrigger>
            <TabsTrigger value="features">Voorzieningen</TabsTrigger>
            <TabsTrigger value="investment">Investering</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic" className="space-y-6">
            <Card variant="business">
              <CardHeader>
                <CardTitle>Basis Pand Informatie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="referenceNumber">Referentie Nummer</Label>
                    <Input
                      id="referenceNumber"
                      value={formData.referenceNumber}
                      onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                      placeholder="FOX-R129"
                      className="font-mono"
                    />
                  </div>
                  
                  <DynamicStamdataSelect
                    category="property_types"
                    value={formData.propertyType || ''}
                    onChange={(value) => setFormData({ ...formData, propertyType: value })}
                    label="Property Type"
                    placeholder="Selecteer property type"
                    required
                    showPopular={true}
                    error={errors.propertyType}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Pand Titel * (Nederlandse/Engelse Marketing)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Schitterende moderne villa met panoramisch zeezicht"
                    className={errors.title ? 'border-error-500 text-lg' : 'text-lg'}
                  />
                  {errors.title && <p className="text-xs text-error-600">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Uitgebreide Beschrijving (FoxVillas Style)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Deze prachtige villa uit 2019 biedt een unieke combinatie van moderne luxe en traditionele Spaanse charme. Gelegen op een ruim perceel van 12.691 m² met panoramisch uitzicht over de vallei en bergen. De villa beschikt over een moderne keuken met bijkeuken, centrale verwarming op gas en uitstekende isolatie..."
                    rows={6}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Vraagprijs *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        placeholder="425000"
                        className={errors.price ? 'border-error-500' : ''}
                      />
                      <Select value={formData.currency} onValueChange={(value: any) => setFormData({ ...formData, currency: value })}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EUR">€</SelectItem>
                          <SelectItem value="GBP">£</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {errors.price && <p className="text-xs text-error-600">{errors.price}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Beschikbaar</SelectItem>
                        <SelectItem value="reserved">Gereserveerd</SelectItem>
                        <SelectItem value="sold">Verkocht</SelectItem>
                        <SelectItem value="off_market">Niet op Markt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="priceNegotiable"
                      checked={formData.priceNegotiable}
                      onCheckedChange={(checked) => setFormData({ ...formData, priceNegotiable: !!checked })}
                    />
                    <Label htmlFor="priceNegotiable" className="text-sm">Prijs onderhandelbaar</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Property Details & Specifications */}
          <TabsContent value="details" className="space-y-6">
            <Card variant="business">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Spaanse Locatie Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Stad/Plaats *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Marbella"
                      className={errors.city ? 'border-error-500' : ''}
                    />
                    {errors.city && <p className="text-xs text-error-600">{errors.city}</p>}
                  </div>
                  
                  <DynamicStamdataSelect
                    category="spanish_regions"
                    value={formData.region || ''}
                    onChange={(value) => setFormData({ ...formData, region: value })}
                    label="Spaanse Regio"
                    placeholder="Selecteer regio"
                    showPopular={true}
                    required
                    error={errors.region}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Provincie</Label>
                    <Input
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      placeholder="Alicante"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Postcode</Label>
                    <Input
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      placeholder="03509"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Orientatie</Label>
                    <Select value={formData.orientation} onValueChange={(value: any) => setFormData({ ...formData, orientation: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="South">Zuid</SelectItem>
                        <SelectItem value="Southeast">Zuidoost</SelectItem>
                        <SelectItem value="Southwest">Zuidwest</SelectItem>
                        <SelectItem value="East">Oost</SelectItem>
                        <SelectItem value="West">West</SelectItem>
                        <SelectItem value="North">Noord</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Volledig Adres</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Calle de los Olivos 15, Urbanización Vista Sol"
                  />
                </div>
              </CardContent>
            </Card>

            <Card variant="business">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Pand Specificaties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Slaapkamers *</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                      className={errors.bedrooms ? 'border-error-500' : ''}
                    />
                    {errors.bedrooms && <p className="text-xs text-error-600">{errors.bedrooms}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Badkamers *</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                      className={errors.bathrooms ? 'border-error-500' : ''}
                    />
                    {errors.bathrooms && <p className="text-xs text-error-600">{errors.bathrooms}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="livingArea">Woonoppervlakte (m²) *</Label>
                    <Input
                      id="livingArea"
                      type="number"
                      value={formData.livingArea}
                      onChange={(e) => setFormData({ ...formData, livingArea: Number(e.target.value) })}
                      className={errors.livingArea ? 'border-error-500' : ''}
                    />
                    {errors.livingArea && <p className="text-xs text-error-600">{errors.livingArea}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="plotSize">Perceel (m²)</Label>
                    <Input
                      id="plotSize"
                      type="number"
                      value={formData.plotSize}
                      onChange={(e) => setFormData({ ...formData, plotSize: Number(e.target.value) })}
                      placeholder="12691"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Bouwjaar</Label>
                    <Input
                      type="number"
                      value={formData.builtYear}
                      onChange={(e) => setFormData({ ...formData, builtYear: Number(e.target.value) })}
                      placeholder="2019"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Aantal Verdiepingen</Label>
                    <Input
                      type="number"
                      value={formData.floors}
                      onChange={(e) => setFormData({ ...formData, floors: Number(e.target.value) })}
                      placeholder="2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Energie Label</Label>
                    <Select value={formData.energyRating} onValueChange={(value: any) => setFormData({ ...formData, energyRating: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer label" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A - Zeer efficiënt</SelectItem>
                        <SelectItem value="B">B - Efficiënt</SelectItem>
                        <SelectItem value="C">C - Gemiddeld</SelectItem>
                        <SelectItem value="D">D - Matig</SelectItem>
                        <SelectItem value="E">E - Slecht</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features & Amenities */}
          <TabsContent value="features" className="space-y-6">
            <Card variant="business">
              <CardHeader>
                <CardTitle>Voorzieningen & Kenmerken (FoxVillas Style)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <DynamicStamdataChecklist
                  category="property_amenities"
                  selectedValues={formData.amenities || {}}
                  onChange={(values) => setFormData({ ...formData, amenities: values })}
                  label="Pand Voorzieningen"
                  description="Alle voorzieningen die dit pand heeft (⭐ = populair bij Nederlandse kopers)"
                  mode="object"
                  columns={3}
                  showDescriptions={true}
                  groupByMetadata="category"
                />

                <DynamicStamdataChecklist
                  category="property_utilities"
                  selectedValues={formData.utilities || []}
                  onChange={(values) => setFormData({ ...formData, utilities: values })}
                  label="Nutsvoorzieningen"
                  description="Gas, water, licht en andere voorzieningen"
                  mode="array"
                  columns={4}
                />

                {/* Legal Requirements */}
                <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Checkbox
                      id="habitationCertificate"
                      checked={formData.habitationCertificate}
                      onCheckedChange={(checked) => setFormData({ ...formData, habitationCertificate: !!checked })}
                    />
                    <Label htmlFor="habitationCertificate" className="font-medium">Habitation Certificate Aanwezig</Label>
                    <Badge className="bg-success-100 text-success-700 text-xs">Verplicht voor Verkoop</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>IBI (Jaarlijkse Belasting) €</Label>
                      <Input
                        type="number"
                        value={formData.ibi}
                        onChange={(e) => setFormData({ ...formData, ibi: Number(e.target.value) })}
                        placeholder="500"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Community Fees (€/month)</Label>
                      <Input
                        type="number"
                        value={formData.communityFees}
                        onChange={(e) => setFormData({ ...formData, communityFees: Number(e.target.value) })}
                        placeholder="150"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investment & Target Market */}
          <TabsContent value="investment" className="space-y-6">
            <Card variant="business">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Nederlandse/Internationale Doelgroep
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DynamicStamdataSelect
                    category="target_audiences"
                    value={formData.targetAudience || ''}
                    onChange={(value) => setFormData({ ...formData, targetAudience: value })}
                    label="Primaire Doelgroep"
                    placeholder="Selecteer doelgroep"
                    showPopular={true}
                    required
                  />
                  
                  <DynamicStamdataSelect
                    category="investment_types"
                    value={formData.investmentType || ''}
                    onChange={(value) => setFormData({ ...formData, investmentType: value })}
                    label="Investering Type"
                    placeholder="Selecteer investment type"
                    showPopular={true}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Distances (Critical for International Buyers) */}
            <Card variant="business">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Afstanden (Cruciale Info voor Internationale Kopers)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Luchthaven (min)</Label>
                    <Input
                      type="number"
                      value={formData.distances?.airport}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        distances: { ...formData.distances, airport: Number(e.target.value) }
                      })}
                      placeholder="45"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Strand (min)</Label>
                    <Input
                      type="number"
                      value={formData.distances?.beach}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        distances: { ...formData.distances, beach: Number(e.target.value) }
                      })}
                      placeholder="15"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Golf (min)</Label>
                    <Input
                      type="number"
                      value={formData.distances?.golf}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        distances: { ...formData.distances, golf: Number(e.target.value) }
                      })}
                      placeholder="10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Ziekenhuis (min)</Label>
                    <Input
                      type="number"
                      value={formData.distances?.hospital}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        distances: { ...formData.distances, hospital: Number(e.target.value) }
                      })}
                      placeholder="20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Winkelcentrum (min)</Label>
                    <Input
                      type="number"
                      value={formData.distances?.shopping}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        distances: { ...formData.distances, shopping: Number(e.target.value) }
                      })}
                      placeholder="5"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Stadscentrum (min)</Label>
                    <Input
                      type="number"
                      value={formData.distances?.city_center}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        distances: { ...formData.distances, city_center: Number(e.target.value) }
                      })}
                      placeholder="10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Upload */}
          <TabsContent value="media" className="space-y-6">
            <Card variant="business">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Property Media Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                  <Camera className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="font-medium text-neutral-900">Upload Professional Property Photos</p>
                    <p className="text-sm text-neutral-500">High-quality JPG/PNG images up to 10MB each</p>
                    <p className="text-xs text-neutral-400">Recommended: Exterior, interior, views, amenities (20+ photos)</p>
                  </div>
                  <Button variant="business" className="mt-6">
                    <Upload className="h-4 w-4" />
                    Select Photos
                  </Button>
                </div>
                
                {formData.images && formData.images.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-4">Uploaded Photos ({formData.images.length})</h4>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={typeof image === 'string' ? image : image.url} 
                            alt={`Property ${index + 1}`} 
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button className="absolute -top-2 -right-2 bg-error-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-3">
          <div className="flex-1">
            <AutoSaveStatus {...autoSave} />
          </div>
          <Button variant="outline" onClick={onClose}>
            Annuleren
          </Button>
          <LoadingButton 
            onClick={handleSave} 
            loading={loading}
            loadingText={property ? "Bijwerken..." : "Pand Toevoegen..."}
            variant="business"
            size="lg"
          >
            <Building2 className="h-4 w-4" />
            {property ? 'Wijzigingen Opslaan' : 'Pand Toevoegen aan Portfolio'}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}