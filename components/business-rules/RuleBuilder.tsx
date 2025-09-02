'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { LoadingButton } from '@/components/ui/loading-button'
import { toast } from '@/components/ui/toast'
import { 
  Zap, 
  Plus, 
  Trash2, 
  Play,
  Pause,
  Settings,
  ArrowRight
} from 'lucide-react'

interface BusinessRule {
  id: string
  name: string
  trigger: string
  conditions: Array<{
    field: string
    operator: string
    value: string
  }>
  actions: Array<{
    type: string
    parameters: Record<string, any>
  }>
  enabled: boolean
  createdAt: string
}

interface RuleBuilderProps {
  onSaveRule: (rule: Partial<BusinessRule>) => void
  existingRule?: BusinessRule
}

export function RuleBuilder({ onSaveRule, existingRule }: RuleBuilderProps) {
  const [rule, setRule] = useState<Partial<BusinessRule>>(existingRule || {
    name: '',
    trigger: '',
    conditions: [],
    actions: [],
    enabled: true
  })

  const [loading, setLoading] = useState(false)

  const triggers = [
    { value: 'tenant_created', label: 'Nieuwe Agency Aangemaakt' },
    { value: 'user_login', label: 'Gebruiker Ingelogd' },
    { value: 'subscription_expired', label: 'Abonnement Verlopen' },
    { value: 'support_ticket_created', label: 'Support Ticket Aangemaakt' },
    { value: 'property_created', label: 'Nieuw Pand Toegevoegd' }
  ]

  const actionTypes = [
    { value: 'send_email', label: 'Email Versturen', icon: '✉️' },
    { value: 'create_notification', label: 'Notificatie Aanmaken', icon: '🔔' },
    { value: 'update_status', label: 'Status Bijwerken', icon: '🔄' },
    { value: 'assign_support', label: 'Support Toewijzen', icon: '👤' },
    { value: 'log_event', label: 'Event Loggen', icon: '📝' }
  ]

  const addCondition = () => {
    setRule({
      ...rule,
      conditions: [
        ...(rule.conditions || []),
        { field: '', operator: 'equals', value: '' }
      ]
    })
  }

  const addAction = () => {
    setRule({
      ...rule,
      actions: [
        ...(rule.actions || []),
        { type: '', parameters: {} }
      ]
    })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await onSaveRule(rule)
      toast.success('Business regel opgeslagen', 'De regel is succesvol geconfigureerd')
    } catch (error) {
      toast.error('Opslaan mislukt', 'Er ging iets mis bij het opslaan van de regel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Rule Basic Info */}
      <Card variant="business">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Business Rule Configuratie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Rule Naam</Label>
              <Input
                id="name"
                value={rule.name || ''}
                onChange={(e) => setRule({ ...rule, name: e.target.value })}
                placeholder="bijv. Welcome nieuwe agency"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Trigger Event</Label>
              <Select value={rule.trigger || ''} onValueChange={(value) => setRule({ ...rule, trigger: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer trigger" />
                </SelectTrigger>
                <SelectContent>
                  {triggers.map((trigger) => (
                    <SelectItem key={trigger.value} value={trigger.value}>
                      {trigger.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card variant="business">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Acties</CardTitle>
            <Button onClick={addAction} variant="outline" size="sm">
              <Plus className="h-4 w-4" />
              Actie Toevoegen
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {rule.actions?.length === 0 && (
            <p className="text-sm text-neutral-500 text-center py-8">
              Nog geen acties geconfigureerd. Voeg een actie toe om te starten.
            </p>
          )}
          
          {rule.actions?.map((action, index) => (
            <Card key={index} className="border border-neutral-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Select 
                    value={action.type} 
                    onValueChange={(value) => {
                      const newActions = [...(rule.actions || [])]
                      newActions[index] = { ...action, type: value }
                      setRule({ ...rule, actions: newActions })
                    }}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Selecteer actie type" />
                    </SelectTrigger>
                    <SelectContent>
                      {actionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <span>{type.icon} {type.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <ArrowRight className="h-4 w-4 text-neutral-400" />
                  
                  <Input
                    placeholder="Parameters configureren..."
                    className="flex-1"
                  />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newActions = rule.actions?.filter((_, i) => i !== index) || []
                      setRule({ ...rule, actions: newActions })
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-error-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Save Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant={rule.enabled ? "default" : "secondary"}>
            {rule.enabled ? 'Actief' : 'Inactief'}
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRule({ ...rule, enabled: !rule.enabled })}
          >
            {rule.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {rule.enabled ? 'Deactiveren' : 'Activeren'}
          </Button>
        </div>
        
        <LoadingButton
          onClick={handleSave}
          loading={loading}
          loadingText="Opslaan..."
          variant="business"
        >
          Business Rule Opslaan
        </LoadingButton>
      </div>
    </div>
  )
}