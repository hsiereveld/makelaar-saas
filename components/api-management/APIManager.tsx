'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingButton } from '@/components/ui/loading-button'
import { SearchBar } from '@/components/ui/search-bar'
import { EmptyStates } from '@/components/ui/empty-state'
import { toast } from '@/components/ui/toast'
import { useURLFilters, FilterTags } from '@/components/ui/url-filters'
import { Progress } from '@/components/ui/progress'
import { 
  Code, 
  Key,
  Activity,
  BarChart3,
  Shield,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy
} from 'lucide-react'

interface APIKey {
  id: string
  name: string
  keyPreview: string
  tenant?: { name: string; slug: string }
  permissions: string[]
  rateLimits: {
    requestsPerMinute: number
    requestsPerHour: number
    requestsPerDay: number
  }
  usage: {
    requestsToday: number
    requestsThisMonth: number
    lastUsed?: string
  }
  status: 'active' | 'suspended' | 'expired'
  expiresAt?: string
  createdAt: string
}

interface RateLimit {
  id: string
  path: string
  method: string
  limit: number
  window: string
  tenantId?: string
  userRole?: string
  current: number
  resetAt: string
}

export function APIManager() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Amsterdam RE API Key',
      keyPreview: 'mk_live_1234...5678',
      tenant: { name: 'Amsterdam International Real Estate', slug: 'amsterdam-real-estate' },
      permissions: ['properties:read', 'properties:write', 'contacts:read'],
      rateLimits: { requestsPerMinute: 100, requestsPerHour: 1000, requestsPerDay: 10000 },
      usage: { requestsToday: 247, requestsThisMonth: 8543, lastUsed: '2025-09-02T13:45:00Z' },
      status: 'active',
      expiresAt: '2026-09-02T00:00:00Z',
      createdAt: '2025-08-15T10:00:00Z'
    }
  ])

  const [rateLimits, setRateLimits] = useState<RateLimit[]>([
    {
      id: '1',
      path: '/api/v1/[tenant]/properties',
      method: 'GET',
      limit: 100,
      window: '1m',
      current: 23,
      resetAt: '2025-09-02T14:16:00Z'
    },
    {
      id: '2',
      path: '/api/v1/[tenant]/contacts',
      method: 'POST',
      limit: 50,
      window: '1h',
      tenantId: 'amsterdam-real-estate',
      current: 12,
      resetAt: '2025-09-02T15:00:00Z'
    }
  ])

  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('keys')

  const { filters, updateFilter, clearFilters, hasActiveFilters } = useURLFilters({
    search: '',
    status: 'all',
    tenant: 'all'
  })

  const copyApiKey = (keyPreview: string) => {
    // In real app, this would copy the full key
    navigator.clipboard.writeText(keyPreview)
    toast.success('API key gekopieerd', 'De API key is naar je klembord gekopieerd')
  }

  const revokeApiKey = async (keyId: string) => {
    try {
      setLoading(true)
      // API call to revoke key
      toast.success('API key ingetrokken', 'De API key is niet meer geldig')
    } catch (error) {
      toast.error('Intrekken mislukt', 'Er ging iets mis bij het intrekken van de API key')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
          <Code className="h-7 w-7 text-primary-600" />
          API Management
        </h2>
        <p className="text-neutral-600">Beheer API toegang, rate limiting en gebruik monitoring</p>
      </div>

      {/* API Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="business" elevation="medium">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-success-600 mb-2">
              {apiKeys.filter(k => k.status === 'active').length}
            </div>
            <p className="text-sm text-neutral-600">Actieve API Keys</p>
          </CardContent>
        </Card>
        
        <Card variant="business" elevation="medium">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {apiKeys.reduce((acc, k) => acc + k.usage.requestsToday, 0).toLocaleString()}
            </div>
            <p className="text-sm text-neutral-600">Requests Vandaag</p>
          </CardContent>
        </Card>
        
        <Card variant="business" elevation="medium">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-warning-600 mb-2">
              {rateLimits.filter(r => r.current / r.limit > 0.8).length}
            </div>
            <p className="text-sm text-neutral-600">Rate Limit Waarschuwingen</p>
          </CardContent>
        </Card>
        
        <Card variant="business" elevation="medium">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-neutral-600 mb-2">99.9%</div>
            <p className="text-sm text-neutral-600">API Uptime</p>
          </CardContent>
        </Card>
      </div>

      {/* API Keys Management */}
      <Card variant="business" elevation="medium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>API Keys Beheer</CardTitle>
            <Button variant="business">
              <Plus className="h-4 w-4" />
              Nieuwe API Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <EmptyStates.Settings />
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div key={key.id} className="border border-neutral-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-50 rounded-lg">
                        <Key className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-900">{key.name}</h4>
                        <p className="text-sm text-neutral-500">{key.tenant?.name || 'Platform Level'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                        {key.status === 'active' ? 'Actief' : 'Inactief'}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => copyApiKey(key.keyPreview)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => revokeApiKey(key.id)}>
                        <Trash2 className="h-4 w-4 text-error-500" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-500">Gebruik Vandaag</p>
                      <div className="font-medium">{key.usage.requestsToday.toLocaleString()}</div>
                      <Progress value={(key.usage.requestsToday / key.rateLimits.requestsPerDay) * 100} size="sm" />
                    </div>
                    <div>
                      <p className="text-neutral-500">Deze Maand</p>
                      <div className="font-medium">{key.usage.requestsThisMonth.toLocaleString()}</div>
                    </div>
                    <div>
                      <p className="text-neutral-500">Laatst Gebruikt</p>
                      <div className="font-medium">
                        {key.usage.lastUsed ? new Date(key.usage.lastUsed).toLocaleDateString('nl-NL') : 'Nooit'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rate Limits Overview */}
      <Card variant="business" elevation="medium">
        <CardHeader>
          <CardTitle>Rate Limits Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rateLimits.map((limit) => (
              <div key={limit.id} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-neutral-900">{limit.method} {limit.path}</h4>
                    <p className="text-sm text-neutral-500">
                      {limit.tenantId ? `Tenant: ${limit.tenantId}` : 'Platform Global'}
                    </p>
                  </div>
                  <Badge variant={limit.current / limit.limit > 0.8 ? 'secondary' : 'outline'}>
                    {limit.current}/{limit.limit} per {limit.window}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Gebruik: {limit.current}/{limit.limit}</span>
                    <span>Reset: {new Date(limit.resetAt).toLocaleTimeString('nl-NL')}</span>
                  </div>
                  <Progress 
                    value={(limit.current / limit.limit) * 100} 
                    variant={limit.current / limit.limit > 0.8 ? 'warning' : 'primary'}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}