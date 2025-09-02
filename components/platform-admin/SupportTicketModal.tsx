'use client'

import { useState, useEffect } from 'react'
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
  Ticket, 
  MessageSquare,
  User,
  Building2,
  Clock,
  AlertTriangle,
  CheckCircle,
  Mail,
  Phone,
  Calendar,
  FileText,
  Send
} from 'lucide-react'

interface SupportTicket {
  id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  tenantId?: string
  userId?: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
  tenant?: { name: string; slug: string }
  user?: { name: string; email: string; phone?: string }
  assignee?: { name: string; email: string }
  comments?: Array<{
    id: string
    content: string
    createdBy: string
    createdAt: string
    isInternal: boolean
  }>
}

interface SupportTicketModalProps {
  ticket?: SupportTicket
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  mode: 'view' | 'edit' | 'create'
}

export function SupportTicketModal({ ticket, isOpen, onClose, onSave, mode }: SupportTicketModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'open',
    priority: 'normal',
    assignedTo: 'unassigned',
    response: ''
  })

  // Update form when ticket changes
  useEffect(() => {
    if (ticket) {
      setFormData({
        title: ticket.title || '',
        description: ticket.description || '',
        status: ticket.status || 'open',
        priority: ticket.priority || 'normal',
        assignedTo: ticket.assignedTo || 'unassigned',
        response: ''
      })
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'open',
        priority: 'normal',
        assignedTo: 'unassigned',
        response: ''
      })
    }
  }, [ticket, isOpen])

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auto-save for editing
  const autoSave = useFormAutoSave({
    data: formData,
    onSave: async (data) => {
      if (mode === 'edit' && ticket) {
        console.log('Auto-saving ticket changes:', data)
      }
    },
    storageKey: `supportTicket_${ticket?.id || 'new'}_${Date.now()}`,
    enabled: isOpen && mode !== 'view'
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Titel is verplicht'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Beschrijving is verplicht'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (mode === 'view') return

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await onSave({
        ...formData,
        id: ticket?.id
      })
      
      const actionText = mode === 'create' ? 'aangemaakt' : 'bijgewerkt'
      toast.success(`Ticket ${actionText}`, `Het support ticket is succesvol ${actionText}`)
      
      autoSave.clearBackup()
      onClose()
    } catch (error) {
      console.error('Error saving ticket:', error)
      toast.error('Opslaan mislukt', 'Er ging iets mis bij het opslaan van het ticket')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (mode === 'view' || !ticket) return

    setLoading(true)
    try {
      await onSave({
        ...ticket,
        status: newStatus,
        updatedAt: new Date().toISOString()
      })
      
      toast.success('Status bijgewerkt', `Ticket status is gewijzigd naar ${getStatusLabel(newStatus)}`)
      setFormData({ ...formData, status: newStatus })
    } catch (error) {
      toast.error('Status update mislukt', 'Er ging iets mis bij het bijwerken van de status')
    } finally {
      setLoading(false)
    }
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      open: 'Open',
      in_progress: 'In Behandeling',
      waiting_customer: 'Wacht op Klant',
      resolved: 'Opgelost',
      closed: 'Gesloten'
    }
    return labels[status as keyof typeof labels] || status
  }

  const getPriorityLabel = (priority: string) => {
    const labels = {
      low: 'Laag',
      normal: 'Normaal',
      high: 'Hoog',
      urgent: 'Urgent'
    }
    return labels[priority as keyof typeof labels] || priority
  }

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-error-100 text-error-700',
      in_progress: 'bg-warning-100 text-warning-700',
      waiting_customer: 'bg-primary-100 text-primary-700',
      resolved: 'bg-success-100 text-success-700',
      closed: 'bg-neutral-100 text-neutral-700'
    }
    return colors[status as keyof typeof colors] || 'bg-neutral-100 text-neutral-700'
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'bg-error-500 text-white',
      high: 'bg-warning-500 text-white',
      normal: 'bg-neutral-100 text-neutral-700',
      low: 'bg-neutral-50 text-neutral-600'
    }
    return colors[priority as keyof typeof colors] || 'bg-neutral-100 text-neutral-700'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Ticket className="h-6 w-6 text-primary-600" />
            {mode === 'create' ? 'Nieuw Support Ticket' : 
             mode === 'edit' ? 'Ticket Bewerken' : 'Ticket Details'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Maak een nieuw support ticket aan' :
             mode === 'edit' ? 'Bewerk de ticket gegevens en status' :
             'Bekijk alle details van dit support ticket'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Ticket Header Info */}
          {ticket && mode !== 'create' && (
            <Card variant="business">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(ticket.status)}>
                        {getStatusLabel(ticket.status)}
                      </Badge>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {getPriorityLabel(ticket.priority)}
                      </Badge>
                    </div>
                  </div>
                  
                  {mode === 'view' && (
                    <div className="flex items-center gap-2">
                      <Select value={ticket.status} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Behandeling</SelectItem>
                          <SelectItem value="waiting_customer">Wacht op Klant</SelectItem>
                          <SelectItem value="resolved">Opgelost</SelectItem>
                          <SelectItem value="closed">Gesloten</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6 text-sm">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-neutral-400" />
                      <div>
                        <p className="font-medium text-neutral-900">{ticket.user?.name || 'Onbekende gebruiker'}</p>
                        <p className="text-neutral-500">{ticket.user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-neutral-400" />
                      <div>
                        <p className="font-medium text-neutral-900">{ticket.tenant?.name || 'Platform Level'}</p>
                        <p className="text-neutral-500">{ticket.tenant?.slug || 'platform'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-neutral-400" />
                      <div>
                        <p className="font-medium text-neutral-900">
                          {new Date(ticket.createdAt).toLocaleDateString('nl-NL')}
                        </p>
                        <p className="text-neutral-500">
                          {new Date(ticket.createdAt).toLocaleTimeString('nl-NL')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ticket Content */}
          <Card variant="business">
            <CardHeader>
              <CardTitle className="text-lg">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Korte beschrijving van het probleem"
                  className={errors.title ? 'border-error-500' : ''}
                  disabled={mode === 'view'}
                />
                {errors.title && <p className="text-xs text-error-600">{errors.title}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Beschrijving *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Gedetailleerde beschrijving van het probleem..."
                  className={errors.description ? 'border-error-500' : ''}
                  disabled={mode === 'view'}
                  rows={4}
                />
                {errors.description && <p className="text-xs text-error-600">{errors.description}</p>}
              </div>
              
              {(mode === 'edit' || mode === 'create') && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Behandeling</SelectItem>
                        <SelectItem value="waiting_customer">Wacht op Klant</SelectItem>
                        <SelectItem value="resolved">Opgelost</SelectItem>
                        <SelectItem value="closed">Gesloten</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Prioriteit</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer prioriteit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Laag</SelectItem>
                        <SelectItem value="normal">Normaal</SelectItem>
                        <SelectItem value="high">Hoog</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments/Responses */}
          {ticket && mode !== 'create' && (
            <Card variant="business">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Ticket Communicatie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticket.comments?.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    <MessageSquare className="h-8 w-8 text-neutral-300 mx-auto mb-3" />
                    <p>Nog geen communicatie voor dit ticket</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ticket.comments?.map((comment) => (
                      <div 
                        key={comment.id}
                        className={`p-4 rounded-lg border ${
                          comment.isInternal 
                            ? 'bg-warning-50 border-warning-200' 
                            : 'bg-neutral-50 border-neutral-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-neutral-900">{comment.createdBy}</span>
                            {comment.isInternal && (
                              <Badge className="bg-warning-100 text-warning-700 text-xs">Intern</Badge>
                            )}
                          </div>
                          <span className="text-xs text-neutral-500">
                            {new Date(comment.createdAt).toLocaleString('nl-NL')}
                          </span>
                        </div>
                        <p className="text-neutral-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add Response */}
                <div className="space-y-3 border-t pt-4">
                  <Label htmlFor="response">Reactie Toevoegen</Label>
                  <Textarea
                    id="response"
                    value={formData.response}
                    onChange={(e) => setFormData({ ...formData, response: e.target.value })}
                    placeholder="Type je reactie hier..."
                    rows={3}
                  />
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="business" 
                      size="sm"
                      onClick={() => {
                        if (formData.response.trim()) {
                          toast.success('Reactie toegevoegd', 'Je reactie is toegevoegd aan het ticket')
                          setFormData({ ...formData, response: '' })
                        }
                      }}
                    >
                      <Send className="h-4 w-4" />
                      Reactie Versturen
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (formData.response.trim()) {
                          toast.success('Interne notitie toegevoegd', 'Je interne notitie is opgeslagen')
                          setFormData({ ...formData, response: '' })
                        }
                      }}
                    >
                      Interne Notitie
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assignment */}
          {ticket && mode !== 'create' && (
            <Card variant="business">
              <CardHeader>
                <CardTitle className="text-lg">Toewijzing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Toegewezen aan</Label>
                  <Select 
                    value={formData.assignedTo} 
                    onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
                    disabled={mode === 'view'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer team lid" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Niet toegewezen</SelectItem>
                      <SelectItem value="admin-1">Support Admin 1</SelectItem>
                      <SelectItem value="admin-2">Support Admin 2</SelectItem>
                      <SelectItem value="tech-1">Technical Admin</SelectItem>
                      <SelectItem value="billing-1">Billing Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {ticket.assignee && (
                  <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-100 rounded-full">
                        <User className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-primary-900">{ticket.assignee.name}</p>
                        <p className="text-sm text-primary-700">{ticket.assignee.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-3">
          {mode !== 'view' && (
            <div className="flex-1">
              <AutoSaveStatus {...autoSave} />
            </div>
          )}
          
          <Button variant="outline" onClick={onClose}>
            {mode === 'view' ? 'Sluiten' : 'Annuleren'}
          </Button>
          
          {mode === 'view' ? (
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => {
                  // Switch to edit mode - this would require parent component state management
                  toast.info('Edit mode', 'Edit functionaliteit wordt toegevoegd')
                }}
              >
                Bewerken
              </Button>
              <Button 
                variant="business"
                onClick={() => handleStatusChange('resolved')}
                disabled={loading}
              >
                Markeer als Opgelost
              </Button>
            </div>
          ) : (
            <LoadingButton 
              onClick={handleSave} 
              loading={loading}
              loadingText={mode === 'create' ? "Aanmaken..." : "Opslaan..."}
              variant="business"
            >
              {mode === 'create' ? 'Ticket Aanmaken' : 'Wijzigingen Opslaan'}
            </LoadingButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}