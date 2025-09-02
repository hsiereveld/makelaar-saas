'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface Tenant {
  id: string
  slug: string
  name: string
}

interface AuthContextType {
  user: User | null
  tenant: Tenant | null
  loading: boolean
  login: (email: string, password: string, tenantSlug: string) => Promise<boolean>
  logout: () => void
  refreshSession: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check for existing session on mount
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          console.log('✅ Session valid:', data.data.user.email)
          setUser(data.data.user)
          setTenant(data.data.tenant)
        }
      } else {
        console.log('❌ Session invalid:', response.status)
      }
    } catch (error) {
      console.error('Session check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string, tenantSlug: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting login:', { email, tenantSlug })
      const response = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, tenantSlug }),
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.data.user)
        setTenant(data.data.tenant)
        return true
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setTenant(null)
      router.push('/auth/login')
    }
  }

  const refreshSession = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        await checkSession()
        return true
      }
      return false
    } catch (error) {
      console.error('Session refresh failed:', error)
      return false
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      tenant,
      loading,
      login,
      logout,
      refreshSession
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function ProtectedRoute({ children, requiredRole }: { 
  children: React.ReactNode
  requiredRole?: string[] 
}) {
  const { user, tenant, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user || !tenant) {
        router.push('/auth/login')
      } else if (requiredRole && !requiredRole.includes(user.role)) {
        router.push('/unauthorized')
      }
    }
  }, [user, tenant, loading, requiredRole, router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user || !tenant) {
    return null
  }

  if (requiredRole && !requiredRole.includes(user.role)) {
    return <div className="min-h-screen flex items-center justify-center">Unauthorized</div>
  }

  return <>{children}</>
}