'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingButton } from '@/components/ui/loading-button'
import { toast } from '@/components/ui/toast'
import { useFormAutoSave, AutoSaveStatus } from '@/hooks/use-auto-save'
import { 
  Building2, 
  CreditCard,
  CheckCircle,
  Users,
  Calendar
} from 'lucide-react'

interface CreateTenantModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: any) => void
}

export function CreateTenantModal({ isOpen, onClose, onCreate }: CreateTenantModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    plan: 'trial',
    adminEmail: '',
    adminName: '',
    trialDays: 14
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auto-save form data
  const autoSave = useFormAutoSave({
    data: formData,
    onSave: async (data) => {
      // Auto-save draft locally
    },
    storageKey: `createTenantDraft_${Date.now()}`,
    enabled: isOpen
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Agency naam is verplicht'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'URL identifier is verplicht'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Alleen kleine letters, cijfers en streepjes toegestaan'
    }

    if (!formData.adminEmail.trim()) {
      newErrors.adminEmail = 'Admin email is verplicht'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
      newErrors.adminEmail = 'Ongeldig email adres'
    }

    if (!formData.adminName.trim()) {
      newErrors.adminName = 'Admin naam is verplicht'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreate = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await onCreate(formData)
      
      // Show success and reset form
      toast.success("Agency aangemaakt", "De nieuwe agency is succesvol toegevoegd aan het platform")
      
      setFormData({
        name: '',
        slug: '',
        plan: 'trial',
        adminEmail: '',
        adminName: '',
        trialDays: 14
      })
      
      autoSave.clearBackup()
      onClose()
    } catch (error) {
      console.error('Error creating agency:', error)
      toast.error("Aanmaken mislukt", "Er ging iets mis bij het aanmaken van de agency")
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = () => {
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      
      setFormData({ ...formData, slug })
    }
  }

  const getPlanDetails = (plan: string) => {
    const plans = {
      trial: { name: 'Proefperiode', price: 0, users: 3, properties: 15, features: ['Basis CRM', 'Email support'] },
      basic: { name: 'Basis', price: 49, users: 5, properties: 50, features: ['Complete CRM', 'Analytics', 'Email support'] },
      professional: { name: 'Professional', price: 99, users: 15, properties: 200, features: ['Advanced CRM', 'Integraties', 'Priority support'] },
      enterprise: { name: 'Enterprise', price: 199, users: 50, properties: 1000, features: ['Enterprise CRM', 'API toegang', 'Telefoon support'] },
    }
    return plans[plan as keyof typeof plans] || plans.trial
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary-600" />
            Nieuwe Agency Aanmaken
          </DialogTitle>
          <DialogDescription>
            Maak een nieuwe makelaarskantoor aan met abonnement en admin gebruiker
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Agency Details */}
          <Card variant="business">
            <CardHeader>
              <CardTitle className="text-lg">Agency Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Agency Naam *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="bijv. Amsterdam International Real Estate"
                    className={errors.name ? 'border-error-500' : ''}
                  />
                  {errors.name && <p className="text-xs text-error-600">{errors.name}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Identifier *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="amsterdam-international"
                      className={errors.slug ? 'border-error-500' : ''}
                    />
                    <Button type="button" variant="outline" onClick={generateSlug}>
                      Genereer
                    </Button>
                  </div>
                  {errors.slug && <p className="text-xs text-error-600">{errors.slug}</p>}
                  <p className="text-xs text-neutral-500">
                    Dashboard URL: /dashboard/{formData.slug || 'url-identifier'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin User */}
          <Card variant="business">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Agency Administrator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email *</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    placeholder="admin@agency.nl"
                    className={errors.adminEmail ? 'border-error-500' : ''}
                  />
                  {errors.adminEmail && <p className="text-xs text-error-600">{errors.adminEmail}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adminName">Admin Naam *</Label>
                  <Input
                    id="adminName"
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    placeholder="John van der Berg"
                    className={errors.adminName ? 'border-error-500' : ''}
                  />
                  {errors.adminName && <p className="text-xs text-error-600">{errors.adminName}</p>}
                </div>
              </div>
              
              <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
                <p className="text-sm text-primary-800">
                  <CheckCircle className="h-4 w-4 inline mr-2" />
                  Er wordt automatisch een tijdelijk wachtwoord gegenereerd en per email verstuurd
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Plan */}
          <Card variant="business">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Abonnement Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Selecteer Plan</Label>
                <div className="grid gap-3">
                  {['trial', 'basic', 'professional', 'enterprise'].map((plan) => {
                    const details = getPlanDetails(plan)
                    return (
                      <div
                        key={plan}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.plan === plan 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                        onClick={() => setFormData({ ...formData, plan })}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-neutral-900">{details.name}</div>
                            <div className="text-sm text-neutral-600">
                              {details.users} gebruikers • {details.properties} panden
                            </div>
                            <div className="text-xs text-neutral-500 mt-1">
                              {details.features.join(' • ')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-neutral-900">
                              €{details.price}
                            </div>
                            <div className="text-xs text-neutral-500">per maand</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
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
            onClick={handleCreate} 
            loading={loading}
            loadingText="Agency Aanmaken..."
            variant="business"
          >
            Agency Aanmaken
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}