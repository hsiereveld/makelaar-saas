'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LoadingButton } from '@/components/ui/loading-button'
import { SearchBar } from '@/components/ui/search-bar'
import { EmptyStates } from '@/components/ui/empty-state'
import { toast } from '@/components/ui/toast'
import { useFormAutoSave, AutoSaveStatus } from '@/hooks/use-auto-save'
import { ProtectedRoute } from '@/lib/auth/AuthContext'
import { 
  Database, 
  Settings,
  Building2,
  Users,
  MapPin,
  Zap,
  Target,
  Tag,
  Plus,
  Edit,
  Trash2,
  Save,
  Download,
  Upload,
  Copy,
  CheckCircle,
  AlertTriangle,
  Info,
  Star,
  ArrowUp,
  ArrowDown,
  Grid,
  List
} from 'lucide-react'

interface MasterDataItem {
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
  createdAt: string
  updatedAt: string
}

interface StamdataCategory {
  key: string
  label: string
  description: string
  icon: string
  items: MasterDataItem[]
  isSystemCategory: boolean
}

export default function StamdataManagementPage() {
  return (
    <ProtectedRoute>
      <StamdataManagementContent />
    </ProtectedRoute>
  )
}

function StamdataManagementContent() {
  const params = useParams()
  const tenant = params.tenant as string
  
  const [categories, setCategories] = useState<StamdataCategory[]>([
    {
      key: 'property_types',
      label: 'Property Types',
      description: 'Configureer welke vastgoed types je aanbiedt (Villa, Appartement, etc.)',
      icon: '🏠',
      isSystemCategory: true,
      items: [
        {
          id: '1',
          tenantId: tenant,
          category: 'property_types',
          key: 'villa',
          label: 'Villa',
          labelEn: 'Villa',
          icon: '🏖️',
          description: 'Vrijstaande villa met tuin',
          sortOrder: 1,
          isActive: true,
          isDefault: true,
          isPopular: true,
          metadata: { color: '#059669', targetMarket: 'luxury' },
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        },
        {
          id: '2',
          tenantId: tenant,
          category: 'property_types',
          key: 'apartment',
          label: 'Appartement',
          labelEn: 'Apartment',
          icon: '🏢',
          description: 'Appartement of flat',
          sortOrder: 2,
          isActive: true,
          isDefault: true,
          isPopular: true,
          metadata: { color: '#1d4ed8', targetMarket: 'general' },
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      ]
    },
    {
      key: 'spanish_regions',
      label: 'Spaanse Regio\'s',
      description: 'Regio\'s waar je panden aanbiedt in Spanje',
      icon: '🗺️',
      isSystemCategory: true,
      items: [
        {
          id: '3',
          tenantId: tenant,
          category: 'spanish_regions',
          key: 'costa_blanca',
          label: 'Costa Blanca',
          labelEn: 'Costa Blanca',
          icon: '🏖️',
          description: 'Populair bij Nederlandse kopers',
          sortOrder: 1,
          isActive: true,
          isDefault: true,
          isPopular: true,
          metadata: { transferTax: 8, popularWith: ['dutch', 'belgian'] },
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      ]
    },
    {
      key: 'property_amenities',
      label: 'Pand Voorzieningen',
      description: 'Alle mogelijke voorzieningen die je panden kunnen hebben',
      icon: '🏊',
      isSystemCategory: true,
      items: [
        {
          id: '4',
          tenantId: tenant,
          category: 'property_amenities',
          key: 'private_pool',
          label: 'Privé Zwembad',
          labelEn: 'Private Pool',
          icon: '🏊',
          description: 'Eigen zwembad bij het pand',
          sortOrder: 1,
          isActive: true,
          isDefault: true,
          isPopular: true,
          metadata: { category: 'outdoor', priority: 'high', dutchAppeal: 'high' },
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z'
        }
      ]
    }
  ])
  
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('property_types')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<MasterDataItem | null>(null)

  const activeData = categories.find(c => c.key === activeCategory)
  const filteredItems = activeData?.items.filter(item => 
    item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.key.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleSaveItem = async (itemData: Partial<MasterDataItem>) => {
    try {
      setLoading(true)
      
      // API call to save item
      const response = await fetch(`/api/v1/${tenant}/stamdata`, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...itemData,
          category: activeCategory,
          id: editingItem?.id
        })
      })

      if (!response.ok) throw new Error('Failed to save item')

      const actionText = editingItem ? 'bijgewerkt' : 'toegevoegd'
      toast.success(`Stamdata ${actionText}`, `"${itemData.label}" is succesvol ${actionText}`)
      
      // Refresh data
      // In real implementation, this would reload from API
      
      setEditingItem(null)
      setShowAddModal(false)
    } catch (error) {
      toast.error('Opslaan mislukt', 'Er ging iets mis bij het opslaan van de stamdata')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (item: MasterDataItem) => {
    if (!confirm(`Weet je zeker dat je "${item.label}" wilt verwijderen?`)) return
    
    try {
      setLoading(true)
      
      const response = await fetch(`/api/v1/${tenant}/stamdata/${item.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete item')

      toast.success('Stamdata verwijderd', `"${item.label}" is verwijderd`)
      
      // Refresh data
    } catch (error) {
      toast.error('Verwijderen mislukt', 'Er ging iets mis bij het verwijderen')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (item: MasterDataItem) => {
    try {
      const updatedItem = { ...item, isActive: !item.isActive }
      await handleSaveItem(updatedItem)
    } catch (error) {
      console.error('Error toggling active state:', error)
    }
  }

  const handleReorderItem = (item: MasterDataItem, direction: 'up' | 'down') => {
    // Implement reordering logic
    toast.info('Volgorde wijzigen', 'Drag & drop functionaliteit wordt binnenkort toegevoegd')
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Nederlandse Stamdata Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="container-business">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-50 rounded-xl">
                <Database className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Stamdata Beheer</h1>
                <p className="text-neutral-600 text-base">Configureer al je dropdown lijsten, voorzieningen en client categorieën</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
              <Button variant="business" size="lg">
                <Upload className="h-4 w-4" />
                Import Data
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-business py-8">
        {/* Stamdata Categories */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {categories.map((category) => (
            <Card 
              key={category.key}
              variant="business" 
              className={`cursor-pointer transition-all ${
                activeCategory === category.key ? 'border-primary-500 bg-primary-50' : 'hover:shadow-md'
              }`}
              onClick={() => setActiveCategory(category.key)}
            >
              <CardContent className="p-6 text-center">
                <div className={`text-4xl mb-3 ${
                  activeCategory === category.key ? 'scale-110' : ''
                } transition-transform`}>
                  {category.icon}
                </div>
                <h3 className={`font-semibold mb-2 ${
                  activeCategory === category.key ? 'text-primary-900' : 'text-neutral-900'
                }`}>
                  {category.label}
                </h3>
                <p className="text-sm text-neutral-600 mb-3">{category.description}</p>
                <Badge variant={activeCategory === category.key ? 'default' : 'outline'}>
                  {category.items.length} items
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Active Category Management */}
        {activeData && (
          <Card variant="business" elevation="medium">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{activeData.icon}</span>
                  <div>
                    <CardTitle className="text-xl">{activeData.label}</CardTitle>
                    <p className="text-neutral-600">{activeData.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <SearchBar
                    placeholder={`Zoek ${activeData.label.toLowerCase()}...`}
                    value={searchTerm}
                    onChange={setSearchTerm}
                    className="w-64"
                    storageKey={`stamdata_${activeCategory}`}
                  />
                  <Button onClick={() => setShowAddModal(true)} variant="business">
                    <Plus className="h-4 w-4" />
                    Nieuwe {activeData.label.slice(0, -1)}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredItems.length === 0 ? (
                <div className="p-12 text-center">
                  <EmptyStates.Settings />
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredItems.map((item) => (
                    <div key={item.id} className={`p-4 border rounded-lg transition-all ${
                      item.isActive ? 'border-neutral-200 bg-white' : 'border-neutral-100 bg-neutral-50 opacity-75'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleReorderItem(item, 'up')}
                              className="p-1 hover:bg-neutral-100 rounded"
                              title="Omhoog"
                            >
                              <ArrowUp className="h-3 w-3 text-neutral-400" />
                            </button>
                            <button 
                              onClick={() => handleReorderItem(item, 'down')}
                              className="p-1 hover:bg-neutral-100 rounded"
                              title="Omlaag"
                            >
                              <ArrowDown className="h-3 w-3 text-neutral-400" />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{item.icon || '📋'}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-neutral-900">{item.label}</span>
                                {item.labelEn && (
                                  <span className="text-sm text-neutral-500">({item.labelEn})</span>
                                )}
                                {item.isDefault && (
                                  <Badge className="bg-blue-100 text-blue-700 text-xs">Default</Badge>
                                )}
                                {item.isPopular && (
                                  <Badge className="bg-warning-100 text-warning-700 text-xs">
                                    <Star className="h-3 w-3 mr-1" />
                                    Populair
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-neutral-600">
                                Key: <code className="bg-neutral-100 px-1 rounded text-xs">{item.key}</code>
                                {item.description && <span className="ml-2">• {item.description}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant={item.isActive ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleToggleActive(item)}
                            title={item.isActive ? 'Deactiveren' : 'Activeren'}
                          >
                            {item.isActive ? 'Actief' : 'Inactief'}
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditingItem(item)}
                            title="Bewerken"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          {!item.isDefault && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteItem(item)}
                              title="Verwijderen"
                            >
                              <Trash2 className="h-4 w-4 text-error-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Bulk Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card variant="business" className="cursor-pointer hover:shadow-md transition-all">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-success-50 rounded-lg w-fit mx-auto mb-3">
                <Copy className="h-6 w-6 text-success-600" />
              </div>
              <h3 className="font-medium text-neutral-900 mb-1">Kopieer van Template</h3>
              <p className="text-sm text-neutral-500">Importeer FoxVillas/IkZoekEenHuis defaults</p>
              <Button variant="outline" size="sm" className="mt-3">
                Template Laden
              </Button>
            </CardContent>
          </Card>

          <Card variant="business" className="cursor-pointer hover:shadow-md transition-all">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-primary-50 rounded-lg w-fit mx-auto mb-3">
                <Download className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-medium text-neutral-900 mb-1">Export naar Excel</h3>
              <p className="text-sm text-neutral-500">Download al je stamdata voor backup</p>
              <Button variant="outline" size="sm" className="mt-3">
                Exporteren
              </Button>
            </CardContent>
          </Card>

          <Card variant="business" className="cursor-pointer hover:shadow-md transition-all">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-warning-50 rounded-lg w-fit mx-auto mb-3">
                <Upload className="h-6 w-6 text-warning-600" />
              </div>
              <h3 className="font-medium text-neutral-900 mb-1">Bulk Import</h3>
              <p className="text-sm text-neutral-500">Upload CSV met nieuwe stamdata</p>
              <Button variant="outline" size="sm" className="mt-3">
                CSV Uploaden
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add/Edit Modal */}
      <StamdataItemModal
        isOpen={showAddModal || !!editingItem}
        onClose={() => {
          setShowAddModal(false)
          setEditingItem(null)
        }}
        onSave={handleSaveItem}
        category={activeCategory}
        item={editingItem}
        categories={categories}
      />
    </div>
  )
}

// Stamdata Item Add/Edit Modal
interface StamdataItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  category: string
  item?: MasterDataItem | null
  categories: StamdataCategory[]
}

function StamdataItemModal({ isOpen, onClose, onSave, category, item, categories }: StamdataItemModalProps) {
  const [formData, setFormData] = useState({
    key: '',
    label: '',
    labelEn: '',
    icon: '',
    description: '',
    isActive: true,
    isPopular: false,
    metadata: {}
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const categoryInfo = categories.find(c => c.key === category)

  // Auto-save functionality
  const autoSave = useFormAutoSave({
    data: formData,
    onSave: async (data) => {
      console.log('Auto-saving stamdata item:', data)
    },
    storageKey: `stamdataItem_${category}_${item?.id || 'new'}`,
    enabled: isOpen
  })

  useEffect(() => {
    if (item && isOpen) {
      setFormData({
        key: item.key,
        label: item.label,
        labelEn: item.labelEn || '',
        icon: item.icon || '',
        description: item.description || '',
        isActive: item.isActive,
        isPopular: item.isPopular,
        metadata: item.metadata || {}
      })
    } else {
      setFormData({
        key: '',
        label: '',
        labelEn: '',
        icon: '',
        description: '',
        isActive: true,
        isPopular: false,
        metadata: {}
      })
    }
  }, [item, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.key.trim()) newErrors.key = 'Key is verplicht'
    if (!formData.label.trim()) newErrors.label = 'Nederlandse label is verplicht'
    
    // Key format validation
    if (!/^[a-z0-9_]+$/.test(formData.key)) {
      newErrors.key = 'Key mag alleen lowercase letters, cijfers en underscores bevatten'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      // Generate key from label if empty
      const finalKey = formData.key || formData.label.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')

      await onSave({
        ...formData,
        key: finalKey
      })
      
      autoSave.clearBackup()
    } catch (error) {
      console.error('Error saving stamdata item:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">{categoryInfo?.icon}</span>
            {item ? 'Stamdata Bewerken' : 'Nieuwe Stamdata Toevoegen'}
          </DialogTitle>
          <DialogDescription>
            {item ? 
              `Bewerk "${item.label}" in categorie ${categoryInfo?.label}` :
              `Voeg een nieuw item toe aan ${categoryInfo?.label}`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Card variant="business">
            <CardHeader>
              <CardTitle className="text-lg">Item Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Nederlandse Label *</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="Privé Zwembad"
                    className={errors.label ? 'border-error-500' : ''}
                  />
                  {errors.label && <p className="text-xs text-error-600">{errors.label}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="labelEn">Engelse Label</Label>
                  <Input
                    id="labelEn"
                    value={formData.labelEn}
                    onChange={(e) => setFormData({ ...formData, labelEn: e.target.value })}
                    placeholder="Private Pool"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="key">Machine Key *</Label>
                  <Input
                    id="key"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    placeholder="private_pool"
                    className={`font-mono ${errors.key ? 'border-error-500' : ''}`}
                  />
                  {errors.key && <p className="text-xs text-error-600">{errors.key}</p>}
                  <p className="text-xs text-neutral-500">Voor database opslag (lowercase, underscores)</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon/Emoji</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="🏊"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beschrijving</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Uitleg voor gebruikers over dit item..."
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })}
                  />
                  <Label htmlFor="isActive">Actief (zichtbaar in formulieren)</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPopular"
                    checked={formData.isPopular}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPopular: !!checked })}
                  />
                  <Label htmlFor="isPopular">Populair (gemarkeerd met ⭐)</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
            loadingText={item ? "Bijwerken..." : "Toevoegen..."}
            variant="business"
          >
            <Save className="h-4 w-4" />
            {item ? 'Wijzigingen Opslaan' : 'Item Toevoegen'}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}