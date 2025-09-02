'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Building2, 
  Users, 
  CreditCard, 
  Settings, 
  Calendar,
  Euro,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react'

interface Tenant {
  id: string
  slug: string
  name: string
  createdAt: string
  subscription: {
    id: string
    plan: string
    status: string
    currentPeriodEnd: string | null
    trialEndsAt: string | null
    monthlyPrice: number
    maxUsers: number
    maxProperties: number
    features: any
  } | null
  userCount: number
  propertyCount: number
  contactCount: number
}

interface AgencyEditModalProps {
  tenant: Tenant | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
}

export function AgencyEditModal({ tenant, isOpen, onClose, onSave }: AgencyEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    plan: 'trial',
    status: 'trialing',
    maxUsers: 5,
    maxProperties: 50,
    notes: ''
  })

  // Update form data when tenant changes
  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name || '',
        slug: tenant.slug || '',
        plan: tenant.subscription?.plan || 'trial',
        status: tenant.subscription?.status || 'trialing',
        maxUsers: tenant.subscription?.maxUsers || 5,
        maxProperties: tenant.subscription?.maxProperties || 50,
        notes: ''
      })
    }
  }, [tenant, isOpen])

  const [loading, setLoading] = useState(false)

  const getSessionToken = async () => {
    try {
      const response = await fetch('/api/auth/platform-admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@makelaar-saas.com',
          password: 'SuperAdmin123!'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.data.token
      }
    } catch (error) {
      console.error('Error getting session token:', error)
    }
    return null
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Get authentication token
      const sessionToken = await getSessionToken()
      
      // Call API to update tenant in database
      const response = await fetch(`/api/platform-admin/tenants/${tenant?.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          action: 'update',
          name: formData.name,
          slug: formData.slug,
          plan: formData.plan,
          status: formData.status,
          maxUsers: formData.maxUsers,
          maxProperties: formData.maxProperties
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Agency updated in database:', result.message)
        await onSave(formData) // Also call parent callback
        onClose()
      } else {
        const error = await response.json()
        console.error('❌ Failed to update agency:', error.error)
        alert(`Fout bij opslaan: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving agency:', error)
      alert('Netwerk fout bij opslaan van agency')
    } finally {
      setLoading(false)
    }
  }

  const getPlanDetails = (plan: string) => {
    const plans = {
      trial: { name: 'Proefperiode', price: 0, color: 'bg-neutral-100 text-neutral-700' },
      basic: { name: 'Basis', price: 49, color: 'bg-blue-100 text-blue-700' },
      professional: { name: 'Professional', price: 99, color: 'bg-primary-100 text-primary-700' },
      enterprise: { name: 'Enterprise', price: 199, color: 'bg-purple-100 text-purple-700' },
      custom: { name: 'Custom', price: 399, color: 'bg-orange-100 text-orange-700' }
    }
    return plans[plan as keyof typeof plans] || plans.trial
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-success-100 text-success-700',
      trialing: 'bg-primary-100 text-primary-700',
      canceled: 'bg-error-100 text-error-700',
      past_due: 'bg-warning-100 text-warning-700',
      paused: 'bg-neutral-100 text-neutral-700'
    }
    return colors[status as keyof typeof colors] || 'bg-neutral-100 text-neutral-700'
  }

  if (!tenant) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary-600" />
            Agency Beheer: {tenant.name}
          </DialogTitle>
          <DialogDescription>
            Complete beheer van agency instellingen, abonnement en gebruikerslimieten
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-4">
          {/* Basic Agency Information */}
          <Card variant="business">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Agency Informatie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Agency Naam</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Naam van het makelaarskantoor"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">URL Identifier</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="url-identifier"
                />
                <p className="text-xs text-neutral-500">
                  Dashboard URL: /dashboard/{formData.slug}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notities</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Interne notities over deze agency..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Subscription Management */}
          <Card variant="business">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Abonnement Beheer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plan">Abonnement Plan</Label>
                <Select value={formData.plan} onValueChange={(value) => setFormData({ ...formData, plan: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial">Proefperiode (Gratis)</SelectItem>
                    <SelectItem value="basic">Basis (€49/maand)</SelectItem>
                    <SelectItem value="professional">Professional (€99/maand)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (€199/maand)</SelectItem>
                    <SelectItem value="custom">Custom (€399/maand)</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getPlanDetails(formData.plan).color}>
                    {getPlanDetails(formData.plan).name}
                  </Badge>
                  <span className="text-sm text-neutral-600">
                    €{getPlanDetails(formData.plan).price}/maand
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trialing">Proefperiode</SelectItem>
                    <SelectItem value="active">Actief</SelectItem>
                    <SelectItem value="paused">Gepauzeerd</SelectItem>
                    <SelectItem value="canceled">Geannuleerd</SelectItem>
                    <SelectItem value="past_due">Betaling Achterstallig</SelectItem>
                  </SelectContent>
                </Select>
                <Badge className={getStatusColor(formData.status)}>
                  {formData.status === 'active' ? 'Actief' : 
                   formData.status === 'trialing' ? 'Proefperiode' :
                   formData.status === 'paused' ? 'Gepauzeerd' :
                   formData.status === 'canceled' ? 'Geannuleerd' : 'Betaling Achterstallig'}
                </Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxUsers">Max Gebruikers</Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    value={formData.maxUsers}
                    onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) || 0 })}
                    min="1"
                    max="999"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxProperties">Max Panden</Label>
                  <Input
                    id="maxProperties"
                    type="number"
                    value={formData.maxProperties}
                    onChange={(e) => setFormData({ ...formData, maxProperties: parseInt(e.target.value) || 0 })}
                    min="1"
                    max="9999"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Usage Statistics */}
        <Card variant="business">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Huidige Gebruik & Statistieken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-neutral-50 rounded-lg text-center">
                <Users className="h-5 w-5 text-neutral-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-neutral-900">{tenant.userCount}</div>
                <div className="text-xs text-neutral-500">
                  van {tenant.subscription?.maxUsers || 0} gebruikers
                </div>
                <div className="mt-1">
                  {tenant.userCount >= (tenant.subscription?.maxUsers || 0) ? (
                    <AlertTriangle className="h-4 w-4 text-warning-600 mx-auto" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-success-600 mx-auto" />
                  )}
                </div>
              </div>

              <div className="p-4 bg-neutral-50 rounded-lg text-center">
                <Building2 className="h-5 w-5 text-neutral-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-neutral-900">{tenant.propertyCount}</div>
                <div className="text-xs text-neutral-500">
                  van {tenant.subscription?.maxProperties || 0} panden
                </div>
                <div className="mt-1">
                  {tenant.propertyCount >= (tenant.subscription?.maxProperties || 0) ? (
                    <AlertTriangle className="h-4 w-4 text-warning-600 mx-auto" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-success-600 mx-auto" />
                  )}
                </div>
              </div>

              <div className="p-4 bg-neutral-50 rounded-lg text-center">
                <TrendingUp className="h-5 w-5 text-neutral-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-neutral-900">{tenant.contactCount}</div>
                <div className="text-xs text-neutral-500">contacten</div>
              </div>

              <div className="p-4 bg-neutral-50 rounded-lg text-center">
                <Euro className="h-5 w-5 text-neutral-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-neutral-900">
                  €{Math.round((tenant.subscription?.monthlyPrice || 0) / 100)}
                </div>
                <div className="text-xs text-neutral-500">per maand</div>
              </div>
            </div>

            {tenant.subscription?.trialEndsAt && (
              <div className="mt-4 p-4 bg-warning-50 border border-warning-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-warning-600" />
                  <span className="text-sm font-medium text-warning-800">
                    Proefperiode eindigt: {new Date(tenant.subscription.trialEndsAt).toLocaleDateString('nl-NL')}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={onClose}>
            Annuleren
          </Button>
          <Button onClick={handleSave} disabled={loading} variant="business">
            {loading ? 'Opslaan...' : 'Wijzigingen Opslaan'}
          </Button>
          <Button variant="outline" onClick={() => window.open(`/dashboard/${tenant.slug}`, '_blank')}>
            Agency Dashboard Openen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}