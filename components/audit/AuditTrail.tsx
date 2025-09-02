'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SearchBar } from '@/components/ui/search-bar'
import { EmptyStates } from '@/components/ui/empty-state'
import { SkeletonTable } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/toast'
import { useURLFilters, FilterTags } from '@/components/ui/url-filters'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Shield, 
  Download,
  Filter,
  User,
  Building2,
  Database,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Calendar
} from 'lucide-react'

interface AuditEvent {
  id: string
  action: string
  resource: string
  resourceId: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  userId: string
  tenantId?: string
  ipAddress: string
  userAgent: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  user: { name: string; email: string; role: string }
  tenant?: { name: string; slug: string }
}

export function AuditTrail() {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([
    {
      id: '1',
      action: 'tenant_created',
      resource: 'tenant',
      resourceId: 'amsterdam-real-estate',
      newValues: { name: 'Amsterdam International Real Estate', plan: 'professional' },
      userId: 'admin-123',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 Chrome/120.0',
      timestamp: '2025-09-02T10:30:00Z',
      severity: 'medium',
      user: { name: 'Platform Admin', email: 'admin@makelaar-saas.com', role: 'super_admin' }
    },
    {
      id: '2',
      action: 'user_role_changed',
      resource: 'user',
      resourceId: 'user-456',
      oldValues: { role: 'agent' },
      newValues: { role: 'admin' },
      userId: 'admin-123',
      tenantId: 'rotterdam-properties',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 Chrome/120.0',
      timestamp: '2025-09-02T09:15:00Z',
      severity: 'high',
      user: { name: 'Platform Admin', email: 'admin@makelaar-saas.com', role: 'super_admin' },
      tenant: { name: 'Rotterdam Properties International', slug: 'rotterdam-properties' }
    },
    {
      id: '3',
      action: 'data_export',
      resource: 'tenant_data',
      resourceId: 'utrecht-premium-homes',
      newValues: { exportType: 'full_backup', fileCount: 1247 },
      userId: 'admin-123',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 Chrome/120.0',
      timestamp: '2025-09-01T16:20:00Z',
      severity: 'critical',
      user: { name: 'Platform Admin', email: 'admin@makelaar-saas.com', role: 'super_admin' }
    }
  ])

  const [loading, setLoading] = useState(false)

  const { filters, updateFilter, clearFilters, hasActiveFilters } = useURLFilters({
    search: '',
    severity: 'all',
    resource: 'all',
    timeframe: '7d'
  })

  const filteredEvents = auditEvents.filter(event => {
    const matchesSearch = !filters.search || 
      event.action.toLowerCase().includes(filters.search.toLowerCase()) ||
      event.resource.toLowerCase().includes(filters.search.toLowerCase()) ||
      event.user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      event.tenant?.name.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesSeverity = filters.severity === 'all' || event.severity === filters.severity
    const matchesResource = filters.resource === 'all' || event.resource === filters.resource
    
    return matchesSearch && matchesSeverity && matchesResource
  })

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: <Badge className="bg-neutral-100 text-neutral-700">Laag</Badge>,
      medium: <Badge className="bg-primary-100 text-primary-700">Medium</Badge>,
      high: <Badge className="bg-warning-100 text-warning-700">Hoog</Badge>,
      critical: <Badge className="bg-error-100 text-error-700">Kritiek</Badge>
    }
    return variants[severity as keyof typeof variants]
  }

  const exportAuditLog = async () => {
    try {
      setLoading(true)
      // Generate and download audit export
      toast.success('Export gestart', 'Audit log wordt geëxporteerd naar CSV')
    } catch (error) {
      toast.error('Export mislukt', 'Er ging iets mis bij het exporteren')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
            <Shield className="h-7 w-7 text-primary-600" />
            Audit Trail & Compliance
          </h2>
          <p className="text-neutral-600">Complete audit logging voor compliance en beveiliging</p>
        </div>
        
        <Button onClick={exportAuditLog} variant="business">
          <Download className="h-4 w-4" />
          Export Audit Log
        </Button>
      </div>

      {/* Audit Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="business" elevation="medium">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-neutral-600 mb-2">
              {auditEvents.length.toLocaleString()}
            </div>
            <p className="text-sm text-neutral-600">Totaal Events</p>
          </CardContent>
        </Card>
        
        <Card variant="business" elevation="medium">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-error-600 mb-2">
              {auditEvents.filter(e => e.severity === 'critical' || e.severity === 'high').length}
            </div>
            <p className="text-sm text-neutral-600">Hoge Prioriteit</p>
          </CardContent>
        </Card>
        
        <Card variant="business" elevation="medium">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {new Set(auditEvents.map(e => e.userId)).size}
            </div>
            <p className="text-sm text-neutral-600">Unieke Gebruikers</p>
          </CardContent>
        </Card>
        
        <Card variant="business" elevation="medium">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-success-600 mb-2">100%</div>
            <p className="text-sm text-neutral-600">Compliance Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card variant="business" elevation="medium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Audit Events Filter</CardTitle>
            <div className="flex items-center gap-4">
              <SearchBar
                placeholder="Zoek events, gebruikers, resources..."
                value={filters.search}
                onChange={(value) => updateFilter('search', value)}
                className="w-80"
                storageKey="auditEventSearch"
              />
              
              <Select value={filters.severity} onValueChange={(value) => updateFilter('severity', value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="low">Laag</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">Hoog</SelectItem>
                  <SelectItem value="critical">Kritiek</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.resource} onValueChange={(value) => updateFilter('resource', value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Resource" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="tenant">Tenant</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="property">Property</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        {hasActiveFilters && (
          <CardContent className="pt-0">
            <FilterTags
              filters={filters}
              defaultFilters={{ search: '', severity: 'all', resource: 'all', timeframe: '7d' }}
              onClearFilter={(key) => updateFilter(key, key === 'search' ? '' : 'all')}
              onClearAll={clearFilters}
              filterLabels={{ 
                search: 'Zoeken', 
                severity: 'Severity', 
                resource: 'Resource',
                timeframe: 'Periode'
              }}
            />
          </CardContent>
        )}
      </Card>

      {/* Audit Events Table */}
      <Card variant="business" elevation="medium">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <SkeletonTable />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-6">
              {hasActiveFilters ? (
                <EmptyStates.SearchResults searchTerm={filters.search || 'filters'} />
              ) : (
                <EmptyStates.Documents />
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-business">
                <thead>
                  <tr>
                    <th>Event Details</th>
                    <th>Resource</th>
                    <th>Gebruiker</th>
                    <th>Tenant</th>
                    <th>Severity</th>
                    <th>Timestamp</th>
                    <th>Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <tr key={event.id}>
                      <td>
                        <div className="space-y-1">
                          <div className="font-medium text-neutral-900">{event.action}</div>
                          <div className="text-sm text-neutral-500">
                            Resource ID: {event.resourceId}
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge variant="outline">{event.resource}</Badge>
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="font-medium text-neutral-900">{event.user.name}</div>
                          <div className="text-sm text-neutral-500">{event.user.role}</div>
                        </div>
                      </td>
                      <td>
                        {event.tenant ? (
                          <div className="space-y-1">
                            <div className="font-medium text-neutral-900">{event.tenant.name}</div>
                            <div className="text-sm text-neutral-500">{event.tenant.slug}</div>
                          </div>
                        ) : (
                          <span className="text-neutral-500">Platform</span>
                        )}
                      </td>
                      <td>
                        {getSeverityBadge(event.severity)}
                      </td>
                      <td>
                        <div className="text-sm text-neutral-600">
                          {new Date(event.timestamp).toLocaleDateString('nl-NL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td>
                        <Button variant="ghost" size="sm" title="Event details">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}