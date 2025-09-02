import * as React from "react"
import { useState, useCallback } from "react"
import { toast } from "@/components/ui/toast"
import { CheckCircle, X } from "lucide-react"

interface OptimisticAction<T> {
  action: () => Promise<T>
  optimisticUpdate: () => void
  rollback: () => void
  successMessage?: string
  errorMessage?: string
}

export function useOptimisticUI<T>() {
  const [isPending, setIsPending] = useState(false)

  const executeOptimistic = useCallback(async ({
    action,
    optimisticUpdate,
    rollback,
    successMessage = "Actie voltooid",
    errorMessage = "Actie mislukt"
  }: OptimisticAction<T>) => {
    setIsPending(true)
    
    // Show immediate optimistic update
    optimisticUpdate()
    
    // Show optimistic success message
    const optimisticToast = toast.success("Wordt verwerkt...", "Je wijziging wordt toegepast")

    try {
      const result = await action()
      
      // Show actual success
      toast.success(successMessage, "De wijziging is succesvol doorgevoerd")
      
      setIsPending(false)
      return result
    } catch (error) {
      // Rollback optimistic changes
      rollback()
      
      // Show error
      toast.error(errorMessage, "De wijziging kon niet worden doorgevoerd")
      
      setIsPending(false)
      throw error
    }
  }, [])

  return {
    executeOptimistic,
    isPending
  }
}

// Nederlandse Optimistic UI Components
interface OptimisticFeedbackProps {
  isOptimistic: boolean
  children: React.ReactNode
}

export function OptimisticFeedback({ isOptimistic, children }: OptimisticFeedbackProps) {
  return (
    <div className={`transition-all duration-200 ${isOptimistic ? 'opacity-75 scale-[0.99]' : ''}`}>
      {children}
      {isOptimistic && (
        <div className="absolute inset-0 bg-primary-50/50 rounded-lg flex items-center justify-center">
          <div className="bg-white px-3 py-2 rounded-full shadow-md flex items-center gap-2">
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" />
            <span className="text-xs text-primary-700 font-medium">Verwerken...</span>
          </div>
        </div>
      )}
    </div>
  )
}

interface OptimisticListItemProps {
  item: any
  isOptimistic?: boolean
  isDeleted?: boolean
  children: React.ReactNode
}

export function OptimisticListItem({ 
  item, 
  isOptimistic = false, 
  isDeleted = false, 
  children 
}: OptimisticListItemProps) {
  if (isDeleted) {
    return (
      <div className="relative overflow-hidden">
        <div className="animate-pulse opacity-50 transform scale-95 transition-all duration-300">
          {children}
        </div>
        <div className="absolute inset-0 bg-error-50/80 flex items-center justify-center">
          <div className="bg-white px-3 py-2 rounded-full shadow-md flex items-center gap-2">
            <X className="h-3 w-3 text-error-600" />
            <span className="text-xs text-error-700 font-medium">Verwijderen...</span>
          </div>
        </div>
      </div>
    )
  }

  if (isOptimistic) {
    return (
      <div className="relative">
        <div className="animate-pulse border-primary-200 bg-primary-50/20 rounded-lg">
          {children}
        </div>
        <div className="absolute top-2 right-2">
          <div className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Toevoegen...
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Nederlandse Success Animation Component
export function SuccessAnimation({ show }: { show: boolean }) {
  if (!show) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white rounded-full p-4 shadow-lg animate-pulse">
        <CheckCircle className="h-8 w-8 text-success-600" />
      </div>
    </div>
  )
}