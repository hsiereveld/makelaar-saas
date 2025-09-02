'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SearchBar } from '@/components/ui/search-bar'
import { EmptyStates } from '@/components/ui/empty-state'
import { SkeletonTable } from '@/components/ui/skeleton'
import { LoadingButton } from '@/components/ui/loading-button'
import { toast } from '@/components/ui/toast'
import { useURLFilters, FilterTags } from '@/components/ui/url-filters'
import { SupportTicketModal } from '@/components/platform-admin/SupportTicketModal'
import { 
  Ticket, 
  Search, 
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Building2,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
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
  user?: { name: string; email: string }
  assignee?: { name: string; email: string }
}

export default function SupportTicketsManagement() {
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: '1',
      title: 'Login Issues - Amsterdam Agency',
      description: 'Gebruiker kan niet inloggen na wachtwoord reset. Meerdere pogingen gefaald.',
      status: 'open',
      priority: 'high',
      tenantId: 'amsterdam-id',
      createdAt: '2025-09-02T09:30:00Z',
      updatedAt: '2025-09-02T09:30:00Z',
      tenant: { name: 'Amsterdam International Real Estate', slug: 'amsterdam-real-estate' },
      user: { name: 'Jan van der Berg', email: 'jan@amsterdam-re.nl' }
    },
    {
      id: '2', 
      title: 'Subscription Upgrade Request - Rotterdam',
      description: 'Rotterdam Properties wil upgraden naar Professional plan voor meer gebruikers.',
      status: 'in_progress',
      priority: 'normal',
      tenantId: 'rotterdam-id',
      assignedTo: 'admin-user-1',
      createdAt: '2025-09-01T14:20:00Z',
      updatedAt: '2025-09-02T08:15:00Z',
      tenant: { name: 'Rotterdam Properties International', slug: 'rotterdam-properties' },
      user: { name: 'Piet Janssen', email: 'piet@rotterdam-props.nl' },
      assignee: { name: 'Support Admin', email: 'support@makelaarcrm.nl' }
    },
    {
      id: '3',
      title: 'Feature Request - Bulk Property Import',
      description: 'Utrecht Premium Homes heeft bulk property import functionaliteit nodig voor 200+ panden.',
      status: 'open',
      priority: 'low',
      tenantId: 'utrecht-id',
      createdAt: '2025-08-30T16:45:00Z',
      updatedAt: '2025-08-30T16:45:00Z',
      tenant: { name: 'Utrecht Premium Homes', slug: 'utrecht-premium-homes' },
      user: { name: 'Marie de Wit', email: 'marie@utrecht-homes.nl' }
    }
  ])

  const [loading, setLoading] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view')
  const [showModal, setShowModal] = useState(false)
  
  // URL-persisted filters
  const { filters, updateFilter, clearFilters, hasActiveFilters } = useURLFilters({
    search: '',
    status: 'all',
    priority: 'all'
  })

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = !filters.search || 
      ticket.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      ticket.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      ticket.tenant?.name.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesStatus = filters.status === 'all' || ticket.status === filters.status
    const matchesPriority = filters.priority === 'all' || ticket.priority === filters.priority
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      open: <Badge className="bg-error-100 text-error-700">Open</Badge>,
      in_progress: <Badge className="bg-warning-100 text-warning-700">In Behandeling</Badge>,
      waiting_customer: <Badge className="bg-primary-100 text-primary-700">Wacht op Klant</Badge>,
      resolved: <Badge className="bg-success-100 text-success-700">Opgelost</Badge>,
      closed: <Badge className="bg-neutral-100 text-neutral-700">Gesloten</Badge>,
    }
    return variants[status as keyof typeof variants] || <Badge>Onbekend</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const variants = {
      urgent: <Badge className="bg-error-500 text-white">Urgent</Badge>,
      high: <Badge className="bg-warning-500 text-white">Hoog</Badge>,
      normal: <Badge variant="outline">Normaal</Badge>,
      low: <Badge className="bg-neutral-100 text-neutral-600">Laag</Badge>,
    }
    return variants[priority as keyof typeof variants] || <Badge>Onbekend</Badge>
  }

  const handleCreateTicket = () => {
    setSelectedTicket(null)
    setModalMode('create')
    setShowModal(true)
  }

  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    setModalMode('view')
    setShowModal(true)
  }

  const handleEditTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleSaveTicket = async (ticketData: any) => {
    try {
      if (modalMode === 'create') {
        const newTicket: SupportTicket = {
          id: Date.now().toString(),
          ...ticketData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: { name: 'Nieuwe Gebruiker', email: 'user@example.com' }
        }
        setTickets([newTicket, ...tickets])
      } else if (modalMode === 'edit' && selectedTicket) {
        setTickets(tickets.map(t => 
          t.id === selectedTicket.id 
            ? { ...t, ...ticketData, updatedAt: new Date().toISOString() }
            : t
        ))
      }
    } catch (error) {
      throw error
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedTicket(null)
    setModalMode('view')
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Professional Nederlandse Support Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="container-business">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning-50 rounded-xl">
                <Ticket className="h-8 w-8 text-warning-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Support Ticket Management</h1>
                <p className="text-neutral-600 text-base">Complete beheer van alle platform support tickets</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={handleCreateTicket} variant="business" size="lg">
                <Plus className="h-5 w-5" />
                Nieuw Ticket
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-business py-8">
        {/* Support Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card variant="business" elevation="medium">
            <CardHeader>
              <CardTitle className="text-base">Open Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-error-600">
                {tickets.filter(t => t.status === 'open').length}
              </div>
            </CardContent>
          </Card>

          <Card variant="business" elevation="medium">
            <CardHeader>
              <CardTitle className="text-base">In Behandeling</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning-600">
                {tickets.filter(t => t.status === 'in_progress').length}
              </div>
            </CardContent>
          </Card>

          <Card variant="business" elevation="medium">
            <CardHeader>
              <CardTitle className="text-base">Opgelost Vandaag</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success-600">
                {tickets.filter(t => t.status === 'resolved').length}
              </div>
            </CardContent>
          </Card>

          <Card variant="business" elevation="medium">
            <CardHeader>
              <CardTitle className="text-base">Urgente Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-error-600">
                {tickets.filter(t => t.priority === 'urgent' || t.priority === 'high').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card variant="business" elevation="medium" className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Support Tickets Filter</CardTitle>
              <div className="flex items-center gap-4">
                <SearchBar
                  placeholder="Zoek tickets, agencies, gebruikers..."
                  value={filters.search}
                  onChange={(value) => updateFilter('search', value)}
                  className="w-80"
                  storageKey="supportTicketSearch"
                />
                
                <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Behandeling</SelectItem>
                    <SelectItem value="waiting_customer">Wacht op Klant</SelectItem>
                    <SelectItem value="resolved">Opgelost</SelectItem>
                    <SelectItem value="closed">Gesloten</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.priority} onValueChange={(value) => updateFilter('priority', value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Prioriteit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Prioriteit</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">Hoog</SelectItem>
                    <SelectItem value="normal">Normaal</SelectItem>
                    <SelectItem value="low">Laag</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          {hasActiveFilters && (
            <CardContent className="pt-0">
              <FilterTags
                filters={filters}
                defaultFilters={{ search: '', status: 'all', priority: 'all' }}
                onClearFilter={(key) => updateFilter(key, key === 'search' ? '' : 'all')}
                onClearAll={clearFilters}
                filterLabels={{ search: 'Zoeken', status: 'Status', priority: 'Prioriteit' }}
              />
            </CardContent>
          )}
        </Card>

        {/* Support Tickets Table */}
        <Card variant="business" elevation="medium">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6">
                <SkeletonTable />
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-6">
                {hasActiveFilters ? (
                  <EmptyStates.SearchResults searchTerm={filters.search || 'geen filters'} />
                ) : (
                  <EmptyStates.Messages />
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-business">
                <thead>
                  <tr>
                    <th>Ticket Details</th>
                    <th>Agency</th>
                    <th>Prioriteit</th>
                    <th>Status</th>
                    <th>Toegewezen</th>
                    <th>Aangemaakt</th>
                    <th>Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>
                        <div className="space-y-1">
                          <div className="font-medium text-neutral-900">{ticket.title}</div>
                          <div className="text-sm text-neutral-600 max-w-md">
                            {ticket.description.length > 80 
                              ? ticket.description.substring(0, 80) + '...' 
                              : ticket.description}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-neutral-500">
                            <User className="h-3 w-3" />
                            {ticket.user?.name || 'Onbekende gebruiker'}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="font-medium text-neutral-900">{ticket.tenant?.name || 'Platform'}</div>
                          <div className="text-sm text-neutral-500">{ticket.tenant?.slug}</div>
                        </div>
                      </td>
                      <td>
                        {getPriorityBadge(ticket.priority)}
                      </td>
                      <td>
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td>
                        <div className="text-sm">
                          {ticket.assignee ? (
                            <div>
                              <div className="font-medium text-neutral-900">{ticket.assignee.name}</div>
                              <div className="text-neutral-500">{ticket.assignee.email}</div>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleAssignTicket(ticket)}
                            >
                              Toewijzen
                            </Button>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm text-neutral-600">
                          {new Date(ticket.createdAt).toLocaleDateString('nl-NL')}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleViewTicket(ticket)}
                            title="Ticket bekijken"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEditTicket(ticket)}
                            title="Ticket bewerken"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
                              const updatedTickets = tickets.map(t => 
                                t.id === ticket.id 
                                  ? { ...t, status: 'resolved' as const, updatedAt: new Date().toISOString() }
                                  : t
                              )
                              setTickets(updatedTickets)
                              toast.success('Ticket opgelost', 'Het ticket is gemarkeerd als opgelost')
                            }}
                            title="Ticket afsluiten"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <Card variant="business" className="cursor-pointer hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-error-50 rounded-lg w-fit mx-auto mb-3">
                <AlertTriangle className="h-6 w-6 text-error-600" />
              </div>
              <h3 className="font-medium text-neutral-900 mb-1">Urgente Tickets</h3>
              <p className="text-sm text-neutral-500">Directe aandacht vereist</p>
              <div className="mt-3">
                <Badge className="bg-error-100 text-error-700">
                  {tickets.filter(t => t.priority === 'urgent' || t.priority === 'high').length} tickets
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card variant="business" className="cursor-pointer hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-warning-50 rounded-lg w-fit mx-auto mb-3">
                <Clock className="h-6 w-6 text-warning-600" />
              </div>
              <h3 className="font-medium text-neutral-900 mb-1">Wacht op Klant</h3>
              <p className="text-sm text-neutral-500">Klant response verwacht</p>
              <div className="mt-3">
                <Badge className="bg-warning-100 text-warning-700">
                  {tickets.filter(t => t.status === 'waiting_customer').length} tickets
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card variant="business" className="cursor-pointer hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-success-50 rounded-lg w-fit mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-success-600" />
              </div>
              <h3 className="font-medium text-neutral-900 mb-1">Opgeloste Tickets</h3>
              <p className="text-sm text-neutral-500">Succesvol afgehandeld</p>
              <div className="mt-3">
                <Badge className="bg-success-100 text-success-700">
                  {tickets.filter(t => t.status === 'resolved').length} tickets
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card variant="business" className="cursor-pointer hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-primary-50 rounded-lg w-fit mx-auto mb-3">
                <MessageSquare className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-medium text-neutral-900 mb-1">Team Workload</h3>
              <p className="text-sm text-neutral-500">Ticket verdeling team</p>
              <div className="mt-3">
                <Badge className="bg-primary-100 text-primary-700">Bekijk Verdeling</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support Ticket Modal */}
        <SupportTicketModal
          ticket={selectedTicket}
          isOpen={showModal}
          onClose={handleCloseModal}
          onSave={handleSaveTicket}
          mode={modalMode}
        />
      </main>
    </div>
  )
}