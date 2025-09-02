'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProtectedRoute, useAuth } from '@/lib/auth/AuthContext'
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Settings, 
  LogOut,
  Plus
} from 'lucide-react'
import { Skeleton, SkeletonDashboard } from '@/components/ui/skeleton'
import { EmptyStates } from '@/components/ui/empty-state'

interface DashboardStats {
  totalProperties: number
  totalContacts: number
  activeProperties: number
  buyerContacts: number
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const params = useParams()
  const tenant = params.tenant as string
  const { user, logout } = useAuth()
  
  const [stats] = useState<DashboardStats>({
    totalProperties: 0,
    totalContacts: 0,
    activeProperties: 0,
    buyerContacts: 0
  })
  const [loading] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
          <div className="container-business">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-neutral-900">Makelaar CRM</h1>
                  <p className="text-sm text-neutral-500 font-medium capitalize">{tenant.replace('-', ' ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-32" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="container-business py-8">
          <SkeletonDashboard />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Professional Nederlandse Dashboard Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="container-business">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Building2 className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-neutral-900">Makelaar CRM</h1>
                <p className="text-sm text-neutral-500 font-medium capitalize">{tenant.replace('-', ' ')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="business" size="default">
                <Plus className="h-4 w-4" />
                Nieuw Pand
              </Button>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-neutral-600">Welkom, {user?.name || 'Gebruiker'}</span>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                  Uitloggen
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Nederlandse Business Dashboard Content */}
      <main className="container-business py-8">
        {/* Nederlandse Business KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card variant="business" elevation="subtle">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Building2 className="h-5 w-5 text-primary-600" />
                  </div>
                  <CardTitle className="text-base">Totaal Panden</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 mb-1">{stats.totalProperties}</div>
              <p className="text-sm text-neutral-500">
                {stats.activeProperties} actieve advertenties
              </p>
            </CardContent>
          </Card>

          <Card variant="business" elevation="subtle">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success-50 rounded-lg">
                    <Users className="h-5 w-5 text-success-600" />
                  </div>
                  <CardTitle className="text-base">Totaal Contacten</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 mb-1">{stats.totalContacts}</div>
              <p className="text-sm text-neutral-500">
                {stats.buyerContacts} potentiële kopers
              </p>
            </CardContent>
          </Card>

          <Card variant="business" elevation="subtle">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-warning-600" />
                  </div>
                  <CardTitle className="text-base">Actieve Leads</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 mb-1">24</div>
              <p className="text-sm text-neutral-500">
                +12% vanaf vorige week
              </p>
            </CardContent>
          </Card>

          <Card variant="business" elevation="subtle">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-success-600" />
                  </div>
                  <CardTitle className="text-base">Omzet Deze Maand</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 mb-1">€2.4M</div>
              <p className="text-sm text-neutral-500">
                +8% vanaf vorige maand
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Nederlandse Business Quick Actions */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card variant="business" elevation="medium">
            <CardHeader>
              <CardTitle>Snelle Acties</CardTitle>
              <CardDescription>Meest gebruikte functies voor dagelijks werk</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-16 flex-col gap-2">
                <Building2 className="h-5 w-5" />
                <span className="text-xs">Nieuw Pand</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <Users className="h-5 w-5" />
                <span className="text-xs">Nieuw Contact</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <TrendingUp className="h-5 w-5" />
                <span className="text-xs">Rapporten</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <Settings className="h-5 w-5" />
                <span className="text-xs">Instellingen</span>
              </Button>
            </CardContent>
          </Card>

          <Card variant="business" elevation="medium">
            <CardHeader>
              <CardTitle>Recente Activiteit</CardTitle>
              <CardDescription>Laatste updates van het systeem</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.totalProperties === 0 && stats.totalContacts === 0 ? (
                <EmptyStates.Messages />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                    <div className="p-1 bg-success-100 rounded-full">
                      <Users className="h-3 w-3 text-success-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">Nieuw contact toegevoegd</p>
                      <p className="text-xs text-neutral-500">2 minuten geleden</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                    <div className="p-1 bg-primary-100 rounded-full">
                      <Building2 className="h-3 w-3 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">Pand status gewijzigd</p>
                      <p className="text-xs text-neutral-500">15 minuten geleden</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}