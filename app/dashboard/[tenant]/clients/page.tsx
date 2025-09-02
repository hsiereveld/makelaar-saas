'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SearchBar } from '@/components/ui/search-bar'
import { EmptyStates } from '@/components/ui/empty-state'
import { LoadingButton } from '@/components/ui/loading-button'
import { toast } from '@/components/ui/toast'
import { useURLFilters, FilterTags } from '@/components/ui/url-filters'
import { ProtectedRoute } from '@/lib/auth/AuthContext'
import { 
  Users, 
  Plus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Euro,
  TrendingUp,
  Eye,
  Edit,
  MessageSquare,
  Star,
  User,
  Building2
} from 'lucide-react'

interface Client {
  id: string
  type: 'buyer' | 'seller' | 'both'
  firstName: string
  lastName: string
  email: string
  phone: string
  nationality: 'dutch' | 'english' | 'belgian' | 'other'
  language: string
  
  // Contact preferences
  preferredContact: 'email' | 'phone' | 'whatsapp'
  timezone: string
  
  // Business info
  budget?: { min: number; max: number }
  searchCriteria?: string[]
  leadScore: number
  
  // Interaction tracking
  lastContact: string
  totalInteractions: number
  propertiesViewed: number
  inquiriesSent: number
  
  // Nederlandse makelaar specifics
  referralSource: string
  tags: string[]
  notes: string
  
  createdAt: string
  updatedAt: string
}

export default function ClientManagementPage() {
  return (
    <ProtectedRoute>
      <ClientManagementContent />
    </ProtectedRoute>
  )
}

function ClientManagementContent() {
  const params = useParams()
  const tenant = params.tenant as string
  
  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      type: 'buyer',
      firstName: 'Jan',
      lastName: 'van der Berg',
      email: 'jan.vandenberg@email.nl',
      phone: '+31 6 1234 5678',
      nationality: 'dutch',
      language: 'nl',
      preferredContact: 'email',
      timezone: 'Europe/Amsterdam',
      budget: { min: 300000, max: 500000 },
      searchCriteria: ['Villa', 'Costa del Sol', '3+ slaapkamers'],
      leadScore: 85,
      lastContact: '2025-09-01T14:30:00Z',
      totalInteractions: 12,
      propertiesViewed: 8,
      inquiriesSent: 3,
      referralSource: 'Website',
      tags: ['Hot Lead', 'Villa Specialist'],
      notes: 'Zoekt villa in Costa del Sol voor pensioen. Budget flexibel.',
      createdAt: '2025-08-15T10:00:00Z',
      updatedAt: '2025-09-01T14:30:00Z'
    }
  ])

  const [loading, setLoading] = useState(false)

  const { filters, updateFilter, clearFilters, hasActiveFilters } = useURLFilters({
    search: '',
    type: 'all',
    nationality: 'all',
    leadScore: 'all',
    lastContact: 'all'
  })

  const filteredClients = clients.filter(client => {
    const matchesSearch = !filters.search || 
      `${client.firstName} ${client.lastName}`.toLowerCase().includes(filters.search.toLowerCase()) ||
      client.email.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesType = filters.type === 'all' || client.type === filters.type
    const matchesNationality = filters.nationality === 'all' || client.nationality === filters.nationality
    
    return matchesSearch && matchesType && matchesNationality
  })

  const getNationalityFlag = (nationality: string) => {
    const flags = { dutch: '🇳🇱', english: '🇬🇧', belgian: '🇧🇪', other: '🌍' }
    return flags[nationality as keyof typeof flags] || '🌍'
  }

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-600 bg-success-100'
    if (score >= 60) return 'text-warning-600 bg-warning-100'
    return 'text-neutral-600 bg-neutral-100'
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="container-business">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success-50 rounded-xl">
                <Users className="h-8 w-8 text-success-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Klanten Beheer</h1>
                <p className="text-neutral-600 text-base">Nederlandse, Engelse en Belgische vastgoed klanten</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="business" size="lg">
                <Plus className="h-5 w-5" />
                Nieuwe Klant
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-business py-8">
        {/* Nederlandse CRM KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card variant="business" elevation="subtle">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-success-600 mb-2">{clients.length}</div>
              <div className="text-sm text-neutral-600">Totaal Klanten</div>
            </CardContent>
          </Card>
          
          <Card variant="business" elevation="subtle">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {clients.filter(c => c.leadScore >= 80).length}
              </div>
              <div className="text-sm text-neutral-600">Hot Leads</div>
            </CardContent>
          </Card>
          
          <Card variant="business" elevation="subtle">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-warning-600 mb-2">
                {clients.filter(c => c.nationality === 'dutch').length}
              </div>
              <div className="text-sm text-neutral-600">🇳🇱 Nederlandse</div>
            </CardContent>
          </Card>
          
          <Card variant="business" elevation="subtle">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-neutral-600 mb-2">
                €{Math.round(clients.reduce((acc, c) => acc + ((c.budget?.max || 0) / 1000), 0))}k
              </div>
              <div className="text-sm text-neutral-600">Gem. Budget</div>
            </CardContent>
          </Card>
        </div>

        {/* Client Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} variant="business">
                <CardContent className="p-6 space-y-4">
                  <div className="h-6 bg-neutral-200 rounded animate-pulse" />
                  <div className="h-4 bg-neutral-200 rounded w-2/3 animate-pulse" />
                  <div className="h-4 bg-neutral-200 rounded w-1/2 animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <EmptyStates.Contacts />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <Card key={client.id} variant="business" className="hover:shadow-md transition-all">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-50 rounded-full">
                        <User className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900">
                          {client.firstName} {client.lastName}
                        </h3>
                        <div className="text-sm text-neutral-600 flex items-center gap-2">
                          <span>{getNationalityFlag(client.nationality)}</span>
                          <Badge className="text-xs" variant={client.type === 'buyer' ? 'default' : 'secondary'}>
                            {client.type === 'buyer' ? 'Koper' : client.type === 'seller' ? 'Verkoper' : 'Beide'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getLeadScoreColor(client.leadScore)}`}>
                      {client.leadScore}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Mail className="h-4 w-4" />
                      <span>{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Phone className="h-4 w-4" />
                      <span>{client.phone}</span>
                    </div>
                    {client.budget && (
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Euro className="h-4 w-4" />
                        <span>€{client.budget.min.toLocaleString()} - €{client.budget.max.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                    <div className="text-xs text-neutral-500">
                      Laatste contact: {new Date(client.lastContact).toLocaleDateString('nl-NL')}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                      <Button variant="business" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}