'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { SearchBar } from '@/components/ui/search-bar'
import { EmptyStates } from '@/components/ui/empty-state'
import { LoadingButton } from '@/components/ui/loading-button'
import { toast } from '@/components/ui/toast'
import { useFormAutoSave, AutoSaveStatus } from '@/hooks/use-auto-save'
import { useURLFilters, FilterTags } from '@/components/ui/url-filters'
import { 
  Settings, 
  Save,
  Mail,
  Shield,
  Globe,
  Zap,
  Database,
  Lock,
  Bell,
  Code,
  FileText,
  Users,
  Plus,
  Edit,
  Building2
} from 'lucide-react'

interface PlatformSetting {
  id: string
  key: string
  value: any
  description?: string
  category: string
  isPublic: boolean
  updatedBy?: string
  updatedAt: string
}

export default function PlatformSettingsManagement() {
  const [settings, setSettings] = useState<PlatformSetting[]>([])

  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('general')
  const [editingSetting, setEditingSetting] = useState<PlatformSetting | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load settings from API on mount
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/platform-admin/settings')
        
        if (!response.ok) {
          throw new Error('Failed to fetch settings')
        }
        
        const result = await response.json()
        
        console.log('API Response:', result)
        
        if (result.success) {
          if (result.data && result.data.length > 0) {
            console.log('Loading settings from database:', result.data)
            setSettings(result.data)
          } else {
            console.log('Database empty, no settings loaded')
            setSettings([])
          }
        } else {
          console.log('API error:', result.error)
          setSettings([])
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading settings:', error)
        toast.error('Laden mislukt', 'Kon settings niet laden van de server')
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const categories = [
    { id: 'general', name: 'Bedrijfsinfo', icon: Building2 },
    { id: 'content', name: 'Website Content', icon: FileText },
    { id: 'billing', name: 'Facturering', icon: Database },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'features', name: 'Platform Limieten', icon: Zap },
    { id: 'notifications', name: 'Notificaties', icon: Bell }
  ]

  const filteredSettings = settings.filter(setting => 
    activeCategory === 'all' || setting.category === activeCategory
  )

  const handleEditSetting = (setting: PlatformSetting) => {
    setEditingSetting(setting)
  }

  const handleSaveSetting = async (setting: PlatformSetting) => {
    setLoading(true)
    try {
      // API call to save setting
      const response = await fetch('/api/platform-admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: setting.id,
          key: setting.key,
          value: setting.value,
          category: setting.category,
          isPublic: setting.isPublic
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save setting')
      }

      // Update in local state
      setSettings(prev => prev.map(s => 
        s.id === setting.id ? { ...setting, updatedAt: new Date().toISOString() } : s
      ))
      
      setEditingSetting(null)
      toast.success('Setting opgeslagen', `"${setting.key}" is succesvol bijgewerkt in de database`)
      
    } catch (error) {
      console.error('Error saving setting:', error)
      toast.error('Opslaan mislukt', 'Kon de setting niet opslaan. Probeer opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryBadge = (category: string) => {
    const variants = {
      general: <Badge className="bg-primary-100 text-primary-700">Bedrijfsinfo</Badge>,
      content: <Badge className="bg-success-100 text-success-700">Website Content</Badge>,
      email: <Badge className="bg-blue-100 text-blue-700">Email</Badge>,
      billing: <Badge className="bg-warning-100 text-warning-700">Facturering</Badge>,
      features: <Badge className="bg-neutral-100 text-neutral-700">Platform Limieten</Badge>,
      notifications: <Badge className="bg-purple-100 text-purple-700">Notificaties</Badge>,
    }
    return variants[category as keyof typeof variants] || <Badge>{category}</Badge>
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Professional Nederlandse Settings Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="container-business">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success-50 rounded-xl">
                <Settings className="h-8 w-8 text-success-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Platform Settings</h1>
                <p className="text-neutral-600 text-base">Global configuratie en business rules voor hele platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="business" size="lg">
                <Plus className="h-5 w-5" />
                Nieuwe Setting
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-business py-8">
        {/* Settings Categories */}
        <div className="grid md:grid-cols-6 gap-4 mb-8">
          {categories.map((category) => {
            const Icon = category.icon
            const isActive = activeCategory === category.id
            return (
              <Card 
                key={category.id}
                variant="business" 
                className={`cursor-pointer transition-all ${
                  isActive ? 'border-primary-500 bg-primary-50' : 'hover:shadow-md'
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`p-2 rounded-lg w-fit mx-auto mb-2 ${
                    isActive ? 'bg-primary-100' : 'bg-neutral-100'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      isActive ? 'text-primary-600' : 'text-neutral-600'
                    }`} />
                  </div>
                  <div className={`text-sm font-medium ${
                    isActive ? 'text-primary-900' : 'text-neutral-900'
                  }`}>
                    {category.name}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Settings Table */}
        <Card variant="business" elevation="medium">
          <CardHeader>
            <CardTitle className="text-xl">
              {categories.find(c => c.id === activeCategory)?.name || 'Alle'} Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="p-6">
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-6 gap-4 p-4 border border-neutral-100 rounded-lg">
                      <div className="h-4 bg-neutral-200 rounded animate-pulse" />
                      <div className="h-4 bg-neutral-200 rounded animate-pulse" />
                      <div className="h-4 bg-neutral-200 rounded animate-pulse" />
                      <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                      <div className="h-6 w-20 bg-neutral-200 rounded animate-pulse" />
                      <div className="h-8 w-16 bg-neutral-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredSettings.length === 0 ? (
              <div className="p-6">
                <EmptyStates.Settings />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSettings.map((setting) => (
                  <Card key={setting.id} variant="business" className="hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="font-mono text-sm bg-neutral-100 px-3 py-1 rounded">
                              {setting.key}
                            </div>
                            {getCategoryBadge(setting.category)}
                            {setting.isPublic ? (
                              <Badge className="bg-success-100 text-success-700">Publiek</Badge>
                            ) : (
                              <Badge className="bg-warning-100 text-warning-700">Privé</Badge>
                            )}
                          </div>
                          
                          <div>
                            <div className="text-sm text-neutral-500 mb-1">Huidige waarde:</div>
                            <div className="font-medium text-neutral-900">
                              {typeof setting.value === 'string' ? (
                                <span>{setting.value}</span>
                              ) : (
                                <code className="bg-neutral-100 px-2 py-1 rounded text-xs">
                                  {JSON.stringify(setting.value)}
                                </code>
                              )}
                            </div>
                          </div>
                          
                          {setting.description && (
                            <div>
                              <div className="text-sm text-neutral-500 mb-1">Beschrijving:</div>
                              <div className="text-sm text-neutral-700">{setting.description}</div>
                            </div>
                          )}
                          
                          <div className="text-xs text-neutral-500">
                            Laatst gewijzigd: {new Date(setting.updatedAt).toLocaleDateString('nl-NL')}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button 
                            size="sm" 
                            variant="business"
                            onClick={() => handleEditSetting(setting)}
                            title="Setting bewerken"
                          >
                            <Edit className="h-4 w-4" />
                            Bewerken
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit Setting Modal */}
      {editingSetting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Platform Setting Bewerken</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <Label>Setting Key</Label>
                <Input value={editingSetting.key} disabled className="font-mono bg-neutral-50" />
              </div>
              
              <div>
                <Label>Waarde</Label>
                <Input 
                  value={typeof editingSetting.value === 'string' ? editingSetting.value : JSON.stringify(editingSetting.value)}
                  onChange={(e) => setEditingSetting({
                    ...editingSetting,
                    value: e.target.value
                  })}
                />
              </div>
              
              <div>
                <Label>Beschrijving</Label>
                <Textarea 
                  value={editingSetting.description || ''}
                  onChange={(e) => setEditingSetting({
                    ...editingSetting,
                    description: e.target.value
                  })}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div>
                  <Label>Categorie</Label>
                  <Select 
                    value={editingSetting.category} 
                    onValueChange={(value) => setEditingSetting({
                      ...editingSetting,
                      category: value
                    })}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={editingSetting.isPublic}
                    onChange={(e) => setEditingSetting({
                      ...editingSetting,
                      isPublic: e.target.checked
                    })}
                  />
                  <Label>Publiek toegankelijk</Label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingSetting(null)}>
                Annuleren
              </Button>
              <LoadingButton 
                onClick={() => handleSaveSetting(editingSetting)} 
                variant="business"
                loading={loading}
                loadingText="Opslaan..."
              >
                <Save className="h-4 w-4 mr-2" />
                Opslaan
              </LoadingButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}