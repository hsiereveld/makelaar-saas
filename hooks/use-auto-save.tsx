import { useEffect, useState, useCallback } from 'react'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

interface UseAutoSaveOptions<T> {
  data: T
  onSave: (data: T) => Promise<void>
  delay?: number
  storageKey?: string
  enabled?: boolean
}

export function useAutoSave<T>({
  data,
  onSave,
  delay = 10000, // 10 seconds
  storageKey,
  enabled = true
}: UseAutoSaveOptions<T>) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Save to localStorage for recovery (debounced)
  useEffect(() => {
    if (storageKey && enabled && data) {
      const timeoutId = setTimeout(() => {
        try {
          const currentData = localStorage.getItem(storageKey)
          const dataString = JSON.stringify(data)
          
          // Only update if data actually changed
          if (currentData !== dataString) {
            localStorage.setItem(storageKey, dataString)
            setHasUnsavedChanges(true)
          }
        } catch (error) {
          console.error('Failed to save to localStorage:', error)
        }
      }, 500) // Debounce localStorage updates

      return () => clearTimeout(timeoutId)
    }
  }, [data, storageKey, enabled])

  // Auto-save timer
  useEffect(() => {
    if (!enabled || !hasUnsavedChanges) return

    const saveTimer = setInterval(async () => {
      if (hasUnsavedChanges) {
        setIsSaving(true)
        try {
          await onSave(data)
          setLastSaved(new Date())
          setHasUnsavedChanges(false)
          
          // Clear localStorage backup after successful save
          if (storageKey) {
            localStorage.removeItem(storageKey)
          }
        } catch (error) {
          console.error('Auto-save failed:', error)
          toast.error('Auto-opslaan mislukt', 'Je wijzigingen worden lokaal bewaard')
        } finally {
          setIsSaving(false)
        }
      }
    }, delay)

    return () => clearInterval(saveTimer)
  }, [data, onSave, delay, hasUnsavedChanges, enabled, storageKey])

  // Manual save function
  const saveNow = useCallback(async () => {
    setIsSaving(true)
    try {
      await onSave(data)
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      
      if (storageKey) {
        localStorage.removeItem(storageKey)
      }
      
      toast.success('Opgeslagen', 'Je wijzigingen zijn bewaard')
    } catch (error) {
      console.error('Manual save failed:', error)
      toast.error('Opslaan mislukt', 'Probeer het opnieuw')
    } finally {
      setIsSaving(false)
    }
  }, [data, onSave, storageKey])

  // Load from localStorage on mount
  const loadBackup = useCallback(() => {
    if (!storageKey) return null
    
    try {
      const backup = localStorage.getItem(storageKey)
      return backup ? JSON.parse(backup) : null
    } catch (error) {
      console.error('Failed to load backup:', error)
      return null
    }
  }, [storageKey])

  // Clear localStorage backup
  const clearBackup = useCallback(() => {
    if (storageKey) {
      localStorage.removeItem(storageKey)
    }
  }, [storageKey])

  return {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    saveNow,
    loadBackup,
    clearBackup
  }
}

// Hook for form auto-save with beforeunload protection
export function useFormAutoSave<T>(options: UseAutoSaveOptions<T>) {
  const autoSave = useAutoSave(options)

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (autoSave.hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = 'Je hebt niet-opgeslagen wijzigingen. Weet je zeker dat je wilt vertrekken?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [autoSave.hasUnsavedChanges])

  return autoSave
}

// Nederlandse Auto-save Status Component
interface AutoSaveStatusProps {
  isSaving: boolean
  lastSaved: Date | null
  hasUnsavedChanges: boolean
}

export function AutoSaveStatus({ isSaving, lastSaved, hasUnsavedChanges }: AutoSaveStatusProps) {
  const getStatusText = () => {
    if (isSaving) return 'Opslaan...'
    if (hasUnsavedChanges) return 'Niet opgeslagen'
    if (lastSaved) {
      const timeAgo = Math.floor((Date.now() - lastSaved.getTime()) / 1000)
      if (timeAgo < 60) return 'Zojuist opgeslagen'
      return `${Math.floor(timeAgo / 60)} min geleden opgeslagen`
    }
    return 'Geen wijzigingen'
  }

  const getStatusColor = () => {
    if (isSaving) return 'text-primary-600'
    if (hasUnsavedChanges) return 'text-warning-600'
    return 'text-neutral-500'
  }

  return (
    <div className={cn("flex items-center gap-1 text-xs", getStatusColor())}>
      {isSaving && <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" />}
      <span>{getStatusText()}</span>
    </div>
  )
}