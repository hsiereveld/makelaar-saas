import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export function useURLFilters<T extends Record<string, any>>(
  defaultFilters: T,
  options?: {
    debounceDelay?: number
    replaceHistory?: boolean
  }
) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { debounceDelay = 300, replaceHistory = false } = options || {}

  // Initialize filters from URL or defaults
  const [filters, setFilters] = useState<T>(() => {
    const urlFilters = { ...defaultFilters }
    
    searchParams.forEach((value, key) => {
      if (key in defaultFilters) {
        // Parse the value based on the default type
        const defaultValue = defaultFilters[key as keyof T]
        if (typeof defaultValue === 'number') {
          urlFilters[key as keyof T] = Number(value) as T[keyof T]
        } else if (typeof defaultValue === 'boolean') {
          urlFilters[key as keyof T] = (value === 'true') as T[keyof T]
        } else {
          urlFilters[key as keyof T] = value as T[keyof T]
        }
      }
    })
    
    return urlFilters
  })

  const [pendingUpdate, setPendingUpdate] = useState<NodeJS.Timeout | null>(null)

  // Update URL when filters change
  const updateURL = useCallback((newFilters: T) => {
    const params = new URLSearchParams()
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== defaultFilters[key as keyof T] && value !== '' && value != null) {
        params.set(key, String(value))
      }
    })

    const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname
    
    if (replaceHistory) {
      router.replace(newURL)
    } else {
      router.push(newURL)
    }
  }, [router, defaultFilters, replaceHistory])

  // Debounced URL update
  useEffect(() => {
    if (pendingUpdate) {
      clearTimeout(pendingUpdate)
    }

    const timeout = setTimeout(() => {
      updateURL(filters)
    }, debounceDelay)

    setPendingUpdate(timeout)

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [filters, debounceDelay]) // Removed updateURL from dependencies to prevent loop

  const updateFilter = useCallback(<K extends keyof T>(
    key: K,
    value: T[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const updateFilters = useCallback((newFilters: Partial<T>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [defaultFilters])

  const clearFilter = useCallback(<K extends keyof T>(key: K) => {
    setFilters(prev => ({
      ...prev,
      [key]: defaultFilters[key]
    }))
  }, [defaultFilters])

  // Check if filters are active (different from defaults)
  const hasActiveFilters = Object.keys(filters).some(
    key => filters[key as keyof T] !== defaultFilters[key as keyof T]
  )

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    clearFilter,
    hasActiveFilters
  }
}

// Nederlandse Filter Components
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface FilterTagsProps<T> {
  filters: T
  defaultFilters: T
  onClearFilter: (key: keyof T) => void
  onClearAll: () => void
  filterLabels?: Partial<Record<keyof T, string>>
}

export function FilterTags<T extends Record<string, any>>({
  filters,
  defaultFilters,
  onClearFilter,
  onClearAll,
  filterLabels = {}
}: FilterTagsProps<T>) {
  const activeFilters = Object.entries(filters).filter(
    ([key, value]) => value !== defaultFilters[key as keyof T] && value !== '' && value != null
  )

  if (activeFilters.length === 0) return null

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-neutral-600">Filters:</span>
      
      {activeFilters.map(([key, value]) => (
        <Badge
          key={key}
          variant="secondary"
          className="flex items-center gap-1 pr-1"
        >
          <span className="text-xs">
            {filterLabels[key as keyof T] || key}: {String(value)}
          </span>
          <button
            onClick={() => onClearFilter(key as keyof T)}
            className="ml-1 p-0.5 hover:bg-neutral-200 rounded-sm"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </Badge>
      ))}
      
      {activeFilters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-6 px-2 text-xs"
        >
          Alle wissen
        </Button>
      )}
    </div>
  )
}