'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SearchBar } from '@/components/ui/search-bar'
import { EmptyStates } from '@/components/ui/empty-state'
import { SkeletonTable } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/toast'
import { useURLFilters, FilterTags } from '@/components/ui/url-filters'
import { 
  Activity, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building2
} from 'lucide-react'

interface SystemLog {
  id: string
  action: string
  resource?: string
  resourceId?: string
  details: any
  userId?: string
  tenantId?: string
  ipAddress?: string
  createdAt: string
  user?: { name: string; email: string }
  tenant?: { name: string; slug: string }
}

export default function SystemLogsManagement() {
  const [logs, setLogs] = useState<SystemLog[]>([
    {
      id: '1',
      action: 'tenant_created',
      resource: 'tenant',
      resourceId: 'amsterdam-id',
      details: { tenantName: 'Amsterdam International Real Estate', plan: 'professional' },
      userId: 'admin-user',
      ipAddress: '192.168.1.100',
      createdAt: '2025-09-02T10:30:00Z',
      user: { name: 'Platform Admin', email: 'admin@makelaar-saas.com' },
      tenant: { name: 'Amsterdam International Real Estate', slug: 'amsterdam-real-estate' }
    },
    {
      id: '2',
      action: 'subscription_updated',
      resource: 'subscription',
      resourceId: 'sub-2',
      details: { tenantId: 'rotterdam-id', updates: { plan: 'professional' } },
      userId: 'admin-user',
      tenantId: 'rotterdam-id',
      ipAddress: '192.168.1.100',
      createdAt: '2025-09-02T09:15:00Z',
      user: { name: 'Platform Admin', email: 'admin@makelaar-saas.com' },
      tenant: { name: 'Rotterdam Properties International', slug: 'rotterdam-properties' }
    },
    {
      id: '3',
      action: 'user_login',
      resource: 'user',
      resourceId: 'user-123',
      details: { loginMethod: 'email', successful: true },
      userId: 'user-123',
      tenantId: 'utrecht-id',
      ipAddress: '185.20.30.40',
      createdAt: '2025-09-02T08:45:00Z',
      user: { name: 'Marie de Wit', email: 'marie@utrecht-homes.nl' },
      tenant: { name: 'Utrecht Premium Homes', slug: 'utrecht-premium-homes' }
    },
    {
      id: '4',
      action: 'platform_setting_updated',
      resource: 'platform_setting',
      resourceId: 'setting-1',
      details: { key: 'email.smtp_host', value: 'smtp.makelaarcrm.nl' },
      userId: 'admin-user',
      ipAddress: '192.168.1.100',
      createdAt: '2025-09-01T16:20:00Z',
      user: { name: 'Platform Admin', email: 'admin@makelaar-saas.com' }
    }
  ])

  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [resourceFilter, setResourceFilter] = useState<string>('all')

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.tenant?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter
    const matchesResource = resourceFilter === 'all' || log.resource === resourceFilter
    
    return matchesSearch && matchesAction && matchesResource
  })

  const getActionBadge = (action: string) => {
    const variants = {
      tenant_created: <Badge className="bg-success-100 text-success-700">Agency Aangemaakt</Badge>,
      tenant_suspended: <Badge className="bg-error-100 text-error-700">Agency Gepauzeerd</Badge>,
      subscription_updated: <Badge className="bg-primary-100 text-primary-700">Abonnement Gewijzigd</Badge>,
      user_login: <Badge className="bg-neutral-100 text-neutral-700">Gebruiker Login</Badge>,
      support_ticket_created: <Badge className="bg-warning-100 text-warning-700">Support Ticket</Badge>,
      platform_setting_updated: <Badge className="bg-purple-100 text-purple-700">Platform Instelling</Badge>,
    }
    return variants[action as keyof typeof variants] || <Badge variant="outline">{action}</Badge>
  }

  const handleExportLogs = () => {
    alert('Export logs functionality would be implemented here')
  }

  const handleRefreshLogs = () => {
    alert('Refreshing logs from database...')
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Professional Nederlandse Logs Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="container-business">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-50 rounded-xl">
                <Activity className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">System Logs Monitoring</h1>
                <p className="text-neutral-600 text-base">Complete platform activiteit monitoring en audit trails</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={handleRefreshLogs} variant="outline" size="lg">
                <RefreshCw className="h-5 w-5" />
                Vernieuwen
              </Button>
              <Button onClick={handleExportLogs} variant="business" size="lg">
                <Download className="h-5 w-5" />
                Export Logs
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-business py-8">
        {/* Log Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card variant="business" elevation="medium">
            <CardHeader>
              <CardTitle className="text-base">Vandaag</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary-600">
                {logs.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length}
              </div>
              <p className="text-sm text-neutral-500">acties</p>
            </CardContent>
          </Card>

          <Card variant="business" elevation="medium">
            <CardHeader>
              <CardTitle className="text-base">Deze Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success-600">{logs.length}</div>
              <p className="text-sm text-neutral-500">totaal acties</p>
            </CardContent>
          </Card>

          <Card variant="business" elevation="medium">
            <CardHeader>
              <CardTitle className="text-base">Unieke Gebruikers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning-600">
                {new Set(logs.map(l => l.userId)).size}
              </div>
              <p className="text-sm text-neutral-500">actieve users</p>
            </CardContent>
          </Card>

          <Card variant="business" elevation="medium">
            <CardHeader>
              <CardTitle className="text-base">Agencies Actief</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900">
                {new Set(logs.filter(l => l.tenantId).map(l => l.tenantId)).size}
              </div>
              <p className="text-sm text-neutral-500">met activiteit</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card variant="business" elevation="medium" className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>System Logs Filter</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Zoek in logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Actie Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Acties</SelectItem>
                    <SelectItem value="tenant_created">Agency Aangemaakt</SelectItem>
                    <SelectItem value="subscription_updated">Abonnement Gewijzigd</SelectItem>
                    <SelectItem value="user_login">Gebruiker Login</SelectItem>
                    <SelectItem value="platform_setting_updated">Platform Instelling</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={resourceFilter} onValueChange={setResourceFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Resource" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Resources</SelectItem>
                    <SelectItem value="tenant">Agency</SelectItem>
                    <SelectItem value="subscription">Abonnement</SelectItem>
                    <SelectItem value="user">Gebruiker</SelectItem>
                    <SelectItem value="platform_setting">Platform Setting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* System Logs Table */}
        <Card variant="business" elevation="medium">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="table-business">
                <thead>
                  <tr>
                    <th>Actie</th>
                    <th>Resource</th>
                    <th>Gebruiker</th>
                    <th>Agency</th>
                    <th>Details</th>
                    <th>IP Adres</th>
                    <th>Tijdstip</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        {getActionBadge(log.action)}
                      </td>
                      <td>
                        <div className="text-sm">
                          <div className="font-medium text-neutral-900">{log.resource || '-'}</div>
                          {log.resourceId && (
                            <div className="text-neutral-500 text-xs">{log.resourceId.substring(0, 8)}...</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          <div className="font-medium text-neutral-900">{log.user?.name || 'System'}</div>
                          <div className="text-neutral-500">{log.user?.email}</div>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          {log.tenant ? (
                            <div>
                              <div className="font-medium text-neutral-900">{log.tenant.name}</div>
                              <div className="text-neutral-500">{log.tenant.slug}</div>
                            </div>
                          ) : (
                            <span className="text-neutral-500">Platform</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm text-neutral-600 max-w-md">
                          {JSON.stringify(log.details).length > 50 
                            ? JSON.stringify(log.details).substring(0, 50) + '...'
                            : JSON.stringify(log.details)}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm text-neutral-600 font-mono">
                          {log.ipAddress || '-'}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm text-neutral-600">
                          {new Date(log.createdAt).toLocaleString('nl-NL')}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}