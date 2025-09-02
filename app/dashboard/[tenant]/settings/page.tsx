'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingButton } from '@/components/ui/loading-button'
import { toast } from '@/components/ui/toast'
import { useFormAutoSave, AutoSaveStatus } from '@/hooks/use-auto-save'
import { ProtectedRoute } from '@/lib/auth/AuthContext'
import { 
  Settings, 
  Building2, 
  Palette,
  Users,
  CreditCard,
  Shield,
  Mail,
  Phone,
  Globe,
  MapPin,
  Save,
  Upload,
  Eye,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

interface TenantSettings {
  // Business Information
  agencyName: string
  businessDescription: string
  contactEmail: string
  contactPhone: string
  address: string
  website: string
  kvkNumber: string
  btwNumber: string
  
  // Branding
  primaryColor: string
  secondaryColor: string
  logo: string
  
  // Regional Settings  
  timezone: string
  language: string
  currency: string
  
  // Business Hours
  businessHours: {
    monday: { open: string; close: string; closed: boolean }
    tuesday: { open: string; close: string; closed: boolean }
    wednesday: { open: string; close: string; closed: boolean }
    thursday: { open: string; close: string; closed: boolean }
    friday: { open: string; close: string; closed: boolean }
    saturday: { open: string; close: string; closed: boolean }
    sunday: { open: string; close: string; closed: boolean }
  }
  
  // Subscription Info (read-only)
  subscription: {
    plan: string
    status: string
    nextBilling: string
    usersUsed: number
    usersLimit: number
    propertiesUsed: number
    propertiesLimit: number
  }
}

export default function AgencySettingsPage() {
  return (
    <ProtectedRoute>
      <AgencySettingsContent />
    </ProtectedRoute>
  )
}

function AgencySettingsContent() {
  const params = useParams()
  const tenant = params.tenant as string
  
  const [settings, setSettings] = useState<TenantSettings>({
    // Default Nederlandse makelaar settings
    agencyName: '',
    businessDescription: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    website: '',
    kvkNumber: '',
    btwNumber: '',
    primaryColor: '#1d4ed8', // Nederlandse business blue
    secondaryColor: '#059669', // Success green
    logo: '',
    timezone: 'Europe/Amsterdam',
    language: 'nl',
    currency: 'EUR',
    businessHours: {
      monday: { open: '09:00', close: '17:30', closed: false },
      tuesday: { open: '09:00', close: '17:30', closed: false },
      wednesday: { open: '09:00', close: '17:30', closed: false },
      thursday: { open: '09:00', close: '17:30', closed: false },
      friday: { open: '09:00', close: '17:30', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true }
    },
    subscription: {
      plan: 'Professional',
      status: 'active',
      nextBilling: '2025-10-02',
      usersUsed: 3,
      usersLimit: 15,
      propertiesUsed: 47,
      propertiesLimit: 200
    }
  })

  const [loading, setLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Auto-save Nederlandse makelaar settings
  const autoSave = useFormAutoSave({
    data: settings,
    onSave: async (data) => {
      const response = await fetch(`/api/v1/${tenant}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error('Failed to save settings')
      }
    },
    storageKey: `agencySettings_${tenant}`,
    enabled: true
  })

  // Load tenant settings
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/v1/${tenant}/settings`)
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setSettings({ ...settings, ...result.data })
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error)
        toast.error('Laden mislukt', 'Kon agency settings niet laden')
      } finally {
        setIsLoading(false)
      }
    }

    if (tenant) {
      loadSettings()
    }
  }, [tenant])

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/v1/${tenant}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      toast.success('Instellingen opgeslagen', 'Je agency instellingen zijn succesvol bijgewerkt')
      autoSave.clearBackup()
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Opslaan mislukt', 'Kon instellingen niet opslaan. Probeer opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="container-business py-8">
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} variant="business">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-6 bg-neutral-200 rounded w-48 animate-pulse" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-10 bg-neutral-200 rounded animate-pulse" />
                      <div className="h-10 bg-neutral-200 rounded animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Professional Nederlandse Agency Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="container-business">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-50 rounded-xl">
                <Settings className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Agency Instellingen</h1>
                <p className="text-neutral-600 text-base">Beheer je makelaarspraktijk configuratie en branding</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <AutoSaveStatus {...autoSave} />
              <LoadingButton
                onClick={handleSave}
                loading={loading}
                loadingText="Opslaan..."
                variant="business"
                size="lg"
              >
                <Save className="h-5 w-5" />
                Instellingen Opslaan
              </LoadingButton>
            </div>
          </div>
        </div>
      </header>

      <main className="container-business py-8">
        <Tabs defaultValue="business" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="business">Bedrijfsgegevens</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="hours">Openingstijden</TabsTrigger>
            <TabsTrigger value="subscription">Abonnement</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          {/* Business Information Tab */}
          <TabsContent value="business" className="space-y-6">
            <Card variant="business" elevation="medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Building2 className="h-6 w-6 text-primary-600" />
                  Makelaarspraktijk Informatie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="agencyName">Makelaarskantoor Naam *</Label>
                    <Input
                      id="agencyName"
                      value={settings.agencyName}
                      onChange={(e) => setSettings({ ...settings, agencyName: e.target.value })}
                      placeholder="Amsterdam International Real Estate"
                      className="text-lg font-medium"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website URL</Label>
                    <Input
                      id="website"
                      type="url"
                      value={settings.website}
                      onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                      placeholder="https://amsterdam-re.nl"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="businessDescription">Bedrijfsomschrijving</Label>
                  <Textarea
                    id="businessDescription"
                    value={settings.businessDescription}
                    onChange={(e) => setSettings({ ...settings, businessDescription: e.target.value })}
                    placeholder="Specialist in Spaanse vastgoed voor Nederlandse kopers..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      placeholder="info@amsterdam-re.nl"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Telefoonnummer *</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={settings.contactPhone}
                      onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                      placeholder="+31 20 123 4567"
                      autoComplete="tel"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Kantooradres</Label>
                  <Input
                    id="address"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    placeholder="Herengracht 123, 1015 BG Amsterdam"
                  />
                </div>
                
                {/* Nederlandse Legal Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="kvkNumber">KvK Nummer</Label>
                    <Input
                      id="kvkNumber"
                      value={settings.kvkNumber}
                      onChange={(e) => setSettings({ ...settings, kvkNumber: e.target.value })}
                      placeholder="12345678"
                      className="font-mono"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="btwNumber">BTW Nummer</Label>
                    <Input
                      id="btwNumber"
                      value={settings.btwNumber}
                      onChange={(e) => setSettings({ ...settings, btwNumber: e.target.value })}
                      placeholder="NL123456789B01"
                      className="font-mono"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-6">
            <Card variant="business" elevation="medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Palette className="h-6 w-6 text-primary-600" />
                  Agency Branding & Styling
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primaire Kleur (Nederlandse Business Blue)</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="w-20 h-12 rounded-lg"
                      />
                      <Input
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        placeholder="#1d4ed8"
                        className="font-mono"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secundaire Kleur (Accent)</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={settings.secondaryColor}
                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                        className="w-20 h-12 rounded-lg"
                      />
                      <Input
                        value={settings.secondaryColor}
                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                        placeholder="#059669"
                        className="font-mono"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Logo Upload */}
                <div className="space-y-4">
                  <Label>Agency Logo</Label>
                  <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                    {settings.logo ? (
                      <div className="space-y-4">
                        <img src={settings.logo} alt="Agency logo" className="h-16 mx-auto" />
                        <div className="flex justify-center gap-3">
                          <Button variant="outline" size="sm">
                            <Upload className="h-4 w-4" />
                            Vervangen
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="h-12 w-12 text-neutral-400 mx-auto" />
                        <div>
                          <p className="font-medium text-neutral-900">Upload je agency logo</p>
                          <p className="text-sm text-neutral-500">SVG, PNG, JPG up to 2MB (Recommended: 200x80px)</p>
                        </div>
                        <Button variant="business">
                          <Upload className="h-4 w-4" />
                          Logo Selecteren
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Brand Preview */}
                <div className="p-6 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200">
                  <h3 className="font-semibold text-neutral-900 mb-4">Brand Preview</h3>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-neutral-200">
                      <div className="flex items-center gap-3">
                        {settings.logo ? (
                          <img src={settings.logo} alt="Logo" className="h-8" />
                        ) : (
                          <div className="p-2 rounded-lg" style={{ backgroundColor: settings.primaryColor }}>
                            <Building2 className="h-6 w-6 text-white" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-neutral-900">{settings.agencyName || 'Je Agency Naam'}</div>
                          <div className="text-sm text-neutral-600">Professional Real Estate</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        size="sm" 
                        style={{ backgroundColor: settings.primaryColor, color: 'white' }}
                      >
                        Primaire Actie
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        style={{ borderColor: settings.secondaryColor, color: settings.secondaryColor }}
                      >
                        Secundaire Actie
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Hours Tab */}
          <TabsContent value="hours" className="space-y-6">
            <Card variant="business" elevation="medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Globe className="h-6 w-6 text-primary-600" />
                  Nederlandse Openingstijden
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(settings.businessHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-4 p-4 border border-neutral-200 rounded-lg">
                    <div className="w-24 font-medium text-neutral-900 capitalize">
                      {day === 'monday' ? 'Maandag' :
                       day === 'tuesday' ? 'Dinsdag' :
                       day === 'wednesday' ? 'Woensdag' :
                       day === 'thursday' ? 'Donderdag' :
                       day === 'friday' ? 'Vrijdag' :
                       day === 'saturday' ? 'Zaterdag' : 'Zondag'}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!hours.closed}
                        onChange={(e) => setSettings({
                          ...settings,
                          businessHours: {
                            ...settings.businessHours,
                            [day]: { ...hours, closed: !e.target.checked }
                          }
                        })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-neutral-600">Open</span>
                    </div>
                    
                    {!hours.closed && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={hours.open}
                          onChange={(e) => setSettings({
                            ...settings,
                            businessHours: {
                              ...settings.businessHours,
                              [day]: { ...hours, open: e.target.value }
                            }
                          })}
                          className="w-32"
                        />
                        <span className="text-neutral-500">tot</span>
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) => setSettings({
                            ...settings,
                            businessHours: {
                              ...settings.businessHours,
                              [day]: { ...hours, close: e.target.value }
                            }
                          })}
                          className="w-32"
                        />
                      </div>
                    )}
                    
                    {hours.closed && (
                      <Badge className="bg-neutral-100 text-neutral-600">Gesloten</Badge>
                    )}
                  </div>
                ))}
                
                {/* Timezone & Language */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-neutral-200">
                  <div className="space-y-2">
                    <Label>Tijdzone</Label>
                    <Select value={settings.timezone} onValueChange={(value) => setSettings({ ...settings, timezone: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/Amsterdam">Amsterdam (CET)</SelectItem>
                        <SelectItem value="Europe/Madrid">Madrid (CET)</SelectItem>
                        <SelectItem value="Europe/London">Londen (GMT)</SelectItem>
                        <SelectItem value="Europe/Brussels">Brussel (CET)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Standaard Taal</Label>
                    <Select value={settings.language} onValueChange={(value) => setSettings({ ...settings, language: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nl">🇳🇱 Nederlands</SelectItem>
                        <SelectItem value="en">🇬🇧 English</SelectItem>
                        <SelectItem value="es">🇪🇸 Español</SelectItem>
                        <SelectItem value="fr">🇫🇷 Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Valuta</Label>
                    <Select value={settings.currency} onValueChange={(value) => setSettings({ ...settings, currency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">€ Euro</SelectItem>
                        <SelectItem value="GBP">£ Pound Sterling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card variant="business" elevation="medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-primary-600" />
                  Abonnement & Gebruik
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-primary-50 rounded-lg border border-primary-200">
                    <div className="text-2xl font-bold text-primary-700 mb-1">
                      {settings.subscription.plan}
                    </div>
                    <div className="text-sm text-primary-600">Huidige Plan</div>
                    <Badge className="mt-2 bg-success-100 text-success-700">
                      {settings.subscription.status === 'active' ? 'Actief' : 'Inactief'}
                    </Badge>
                  </div>
                  
                  <div className="text-center p-6 bg-neutral-50 rounded-lg border border-neutral-200">
                    <div className="text-2xl font-bold text-neutral-700 mb-1">
                      {settings.subscription.usersUsed}/{settings.subscription.usersLimit}
                    </div>
                    <div className="text-sm text-neutral-600">Team Leden</div>
                    <div className="mt-2 w-full bg-neutral-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(settings.subscription.usersUsed / settings.subscription.usersLimit) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-center p-6 bg-neutral-50 rounded-lg border border-neutral-200">
                    <div className="text-2xl font-bold text-neutral-700 mb-1">
                      {settings.subscription.propertiesUsed}/{settings.subscription.propertiesLimit}
                    </div>
                    <div className="text-sm text-neutral-600">Panden</div>
                    <div className="mt-2 w-full bg-neutral-200 rounded-full h-2">
                      <div 
                        className="bg-secondary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(settings.subscription.propertiesUsed / settings.subscription.propertiesLimit) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning-600" />
                    <div>
                      <p className="font-medium text-warning-800">Volgende factuur: {new Date(settings.subscription.nextBilling).toLocaleDateString('nl-NL')}</p>
                      <p className="text-sm text-warning-700">Je abonnement wordt automatisch verlengd</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button variant="business">
                    Plan Upgraden
                  </Button>
                  <Button variant="outline">
                    Factuurgeschiedenis
                  </Button>
                  <Button variant="outline">
                    Betalingsmethode
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}