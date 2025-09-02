'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingButton } from '@/components/ui/loading-button'
import { SearchBar } from '@/components/ui/search-bar'
import { EmptyStates } from '@/components/ui/empty-state'
import { toast } from '@/components/ui/toast'
import { useURLFilters, FilterTags } from '@/components/ui/url-filters'
import { 
  Bell, 
  Send, 
  Mail,
  MessageSquare,
  Users,
  Building2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'

interface GlobalNotification {
  id: string
  title: string
  content: string
  type: 'info' | 'warning' | 'success' | 'error'
  recipients: 'all_tenants' | 'all_users' | 'platform_admins' | 'specific_tenants'
  targetTenants?: string[]
  scheduledFor?: string
  status: 'draft' | 'scheduled' | 'sent' | 'failed'
  sentAt?: string
  createdBy: string
  createdAt: string
  stats?: {
    sent: number
    delivered: number
    opened: number
    clicked: number
  }
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<GlobalNotification[]>([
    {
      id: '1',
      title: 'Platform Maintenance Scheduled',
      content: 'Beste gebruikers, wij voeren gepland onderhoud uit op zondag 3 september tussen 02:00-04:00 CEST. Tijdens deze periode kan de service tijdelijk niet beschikbaar zijn.',
      type: 'warning',
      recipients: 'all_tenants',
      status: 'sent',
      sentAt: '2025-09-01T14:00:00Z',
      createdBy: 'Platform Admin',
      createdAt: '2025-09-01T13:45:00Z',
      stats: { sent: 156, delivered: 154, opened: 89, clicked: 12 }
    },
    {
      id: '2',
      title: 'New Feature: Advanced Property Analytics',
      content: 'We hebben een nieuwe analytics functie toegevoegd waarmee je gedetailleerde property performance rapporten kunt genereren.',
      type: 'success',
      recipients: 'all_tenants',
      status: 'scheduled',
      scheduledFor: '2025-09-03T09:00:00Z',
      createdBy: 'Product Manager',
      createdAt: '2025-09-02T10:00:00Z'
    }
  ])

  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const { filters, updateFilter, clearFilters, hasActiveFilters } = useURLFilters({
    search: '',
    type: 'all',
    status: 'all',
    recipients: 'all'
  })

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = !filters.search || 
      notification.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      notification.content.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesType = filters.type === 'all' || notification.type === filters.type
    const matchesStatus = filters.status === 'all' || notification.status === filters.status
    const matchesRecipients = filters.recipients === 'all' || notification.recipients === filters.recipients
    
    return matchesSearch && matchesType && matchesStatus && matchesRecipients
  })

  const getTypeBadge = (type: string) => {
    const variants = {
      info: <Badge className="bg-primary-100 text-primary-700">Info</Badge>,
      warning: <Badge className="bg-warning-100 text-warning-700">Waarschuwing</Badge>,
      success: <Badge className="bg-success-100 text-success-700">Succes</Badge>,
      error: <Badge className="bg-error-100 text-error-700">Fout</Badge>
    }
    return variants[type as keyof typeof variants]
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: <Badge variant="outline">Concept</Badge>,
      scheduled: <Badge className="bg-warning-100 text-warning-700">Gepland</Badge>,
      sent: <Badge className="bg-success-100 text-success-700">Verzonden</Badge>,
      failed: <Badge className="bg-error-100 text-error-700">Mislukt</Badge>
    }
    return variants[status as keyof typeof variants]
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
            <Bell className="h-7 w-7 text-primary-600" />
            Global Notification Center
          </h2>
          <p className="text-neutral-600">Beheer platform-brede notificaties en communicatie</p>
        </div>
        
        <Button 
          onClick={() => setShowCreateForm(true)} 
          variant="business"
          size="lg"
        >
          <Plus className="h-5 w-5" />
          Nieuwe Notificatie
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="business" elevation="medium">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {notifications.filter(n => n.status === 'sent').length}
            </div>
            <p className="text-sm text-neutral-600">Verzonden Vandaag</p>
          </CardContent>
        </Card>
        
        <Card variant="business" elevation="medium">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-warning-600 mb-2">
              {notifications.filter(n => n.status === 'scheduled').length}
            </div>
            <p className="text-sm text-neutral-600">Gepland</p>
          </CardContent>
        </Card>
        
        <Card variant="business" elevation="medium">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-neutral-600 mb-2">
              {notifications.reduce((acc, n) => acc + (n.stats?.delivered || 0), 0)}
            </div>
            <p className="text-sm text-neutral-600">Totaal Bezorgd</p>
          </CardContent>
        </Card>
        
        <Card variant="business" elevation="medium">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-success-600 mb-2">
              {Math.round((notifications.reduce((acc, n) => acc + (n.stats?.opened || 0), 0) / 
                notifications.reduce((acc, n) => acc + (n.stats?.sent || 1), 0)) * 100) || 0}%
            </div>
            <p className="text-sm text-neutral-600">Open Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card variant="business" elevation="medium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Notificaties Filter</CardTitle>
            <div className="flex items-center gap-4">
              <SearchBar
                placeholder="Zoek notificaties, content, ontvangers..."
                value={filters.search}
                onChange={(value) => updateFilter('search', value)}
                className="w-80"
                storageKey="notificationSearch"
              />
              
              <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="draft">Concept</SelectItem>
                  <SelectItem value="scheduled">Gepland</SelectItem>
                  <SelectItem value="sent">Verzonden</SelectItem>
                  <SelectItem value="failed">Mislukt</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Waarschuwing</SelectItem>
                  <SelectItem value="success">Succes</SelectItem>
                  <SelectItem value="error">Fout</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        {hasActiveFilters && (
          <CardContent className="pt-0">
            <FilterTags
              filters={filters}
              defaultFilters={{ search: '', type: 'all', status: 'all', recipients: 'all' }}
              onClearFilter={(key) => updateFilter(key, key === 'search' ? '' : 'all')}
              onClearAll={clearFilters}
              filterLabels={{ 
                search: 'Zoeken', 
                type: 'Type', 
                status: 'Status', 
                recipients: 'Ontvangers' 
              }}
            />
          </CardContent>
        )}
      </Card>

      {/* Notifications List */}
      <Card variant="business" elevation="medium">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">Loading notifications...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-6">
              {hasActiveFilters ? (
                <EmptyStates.SearchResults searchTerm={filters.search || 'filters'} />
              ) : (
                <EmptyStates.Messages />
              )}
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {filteredNotifications.map((notification) => (
                <div key={notification.id} className="p-6 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-neutral-900">{notification.title}</h3>
                        {getTypeBadge(notification.type)}
                        {getStatusBadge(notification.status)}
                      </div>
                      
                      <p className="text-neutral-600 text-sm max-w-2xl">
                        {notification.content}
                      </p>
                      
                      <div className="flex items-center gap-6 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {notification.recipients.replace('_', ' ').replace('all', 'alle')}
                        </span>
                        
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {notification.sentAt ? 
                            `Verzonden ${new Date(notification.sentAt).toLocaleDateString('nl-NL')}` :
                            notification.scheduledFor ?
                            `Gepland ${new Date(notification.scheduledFor).toLocaleDateString('nl-NL')}` :
                            `Concept sinds ${new Date(notification.createdAt).toLocaleDateString('nl-NL')}`
                          }
                        </span>
                        
                        {notification.stats && (
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {notification.stats.opened}/{notification.stats.sent} geopend
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" title="Bekijk details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Bewerken">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {notification.status === 'draft' && (
                        <Button variant="ghost" size="sm" title="Versturen">
                          <Send className="h-4 w-4 text-success-600" />
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
    </div>
  )
}