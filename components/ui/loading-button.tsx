import * as React from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean
  loadingText?: string
  children: React.ReactNode
}

function LoadingButton({ 
  loading = false, 
  loadingText, 
  disabled,
  children, 
  className,
  ...props 
}: LoadingButtonProps) {
  const isDisabled = loading || disabled

  return (
    <Button 
      disabled={isDisabled}
      className={cn(className)}
      {...props}
    >
      {loading ? (
        <>
          <Spinner variant="primary" size="sm" />
          {loadingText || children}
        </>
      ) : (
        children
      )}
    </Button>
  )
}

export { LoadingButton }