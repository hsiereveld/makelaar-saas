'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingButton } from '@/components/ui/loading-button'
import { toast } from '@/components/ui/toast'
import { useFormAutoSave, AutoSaveStatus } from '@/hooks/use-auto-save'
import { 
  Users, 
  Shield,
  CheckCircle,
  UserPlus
} from 'lucide-react'

interface SaaSTeamModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateUser: (data: any) => void
  user?: any // For editing existing users
}

export function SaaSTeamModal({ isOpen, onClose, onCreateUser, user }: SaaSTeamModalProps) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'support_admin',
    department: user?.department || 'support',
    permissions: user?.permissions || []
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auto-save form data
  const autoSave = useFormAutoSave({
    data: formData,
    onSave: async (data) => {
      console.log('Auto-saving SaaS team member draft:', data)
    },
    storageKey: `saasTeamDraft_${user?.id || 'new'}_${Date.now()}`,
    enabled: isOpen
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Naam is verplicht'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is verplicht'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ongeldig email adres'
    }

    if (!formData.role) {
      newErrors.role = 'Rol is verplicht'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await onCreateUser(formData)
      
      toast.success(
        user ? "Team lid bijgewerkt" : "Team lid toegevoegd", 
        user ? "De wijzigingen zijn succesvol opgeslagen" : "Het nieuwe team lid is toegevoegd aan het platform"
      )
      
      if (!user) {
        setFormData({
          name: '',
          email: '',
          role: 'support_admin',
          department: 'support',
          permissions: []
        })
      }
      
      autoSave.clearBackup()
      onClose()
    } catch (error) {
      console.error('Error saving team member:', error)
      toast.error("Opslaan mislukt", "Er ging iets mis bij het opslaan")
    } finally {
      setLoading(false)
    }
  }

  const roleOptions = [
    { value: 'super_admin', label: 'Super Administrator', description: 'Volledige platform toegang' },
    { value: 'billing_admin', label: 'Billing Administrator', description: 'Facturering en betalingen' },
    { value: 'support_admin', label: 'Support Administrator', description: 'Support en customer service' },
    { value: 'technical_admin', label: 'Technical Administrator', description: 'Technisch beheer en monitoring' }
  ]

  const departmentOptions = [
    { value: 'support', label: 'Support & Customer Success' },
    { value: 'billing', label: 'Billing & Finance' },
    { value: 'technical', label: 'Technical Operations' },
    { value: 'management', label: 'Management' }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <UserPlus className="h-6 w-6 text-primary-600" />
            {user ? 'Team Lid Bewerken' : 'Nieuw Team Lid Toevoegen'}
          </DialogTitle>
          <DialogDescription>
            {user ? 'Wijzig de gegevens van dit SaaS team lid' : 'Voeg een nieuw lid toe aan het SaaS platform team'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Personal Information */}
          <Card variant="business">
            <CardHeader>
              <CardTitle className="text-lg">Persoonlijke Gegevens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Volledige Naam *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jan van der Berg"
                    className={errors.name ? 'border-error-500' : ''}
                  />
                  {errors.name && <p className="text-xs text-error-600">{errors.name}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Adres *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jan@makelaar-saas.com"
                    className={errors.email ? 'border-error-500' : ''}
                  />
                  {errors.email && <p className="text-xs text-error-600">{errors.email}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role and Permissions */}
          <Card variant="business">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Rol & Rechten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platform Rol *</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger className={errors.role ? 'border-error-500' : ''}>
                      <SelectValue placeholder="Selecteer rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div>
                            <div className="font-medium">{role.label}</div>
                            <div className="text-xs text-neutral-500">{role.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && <p className="text-xs text-error-600">{errors.role}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Afdeling</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer afdeling" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentOptions.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
                <p className="text-sm text-primary-800">
                  <CheckCircle className="h-4 w-4 inline mr-2" />
                  {user ? 'Wijzigingen worden direct doorgevoerd na opslaan' : 'Er wordt een tijdelijk wachtwoord gegenereerd en per email verstuurd'}
                </p>
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
            onClick={handleSubmit} 
            loading={loading}
            loadingText={user ? "Bijwerken..." : "Toevoegen..."}
            variant="business"
          >
            {user ? 'Wijzigingen Opslaan' : 'Team Lid Toevoegen'}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}