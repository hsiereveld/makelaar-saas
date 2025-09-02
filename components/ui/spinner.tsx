import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const spinnerVariants = cva(
  "animate-spin inline-block",
  {
    variants: {
      variant: {
        default: "border-2 border-neutral-300 border-t-primary-600 rounded-full",
        primary: "border-2 border-primary-100 border-t-primary-600 rounded-full",
        success: "border-2 border-success-100 border-t-success-600 rounded-full",
        warning: "border-2 border-warning-100 border-t-warning-600 rounded-full",
        error: "border-2 border-error-100 border-t-error-600 rounded-full",
        dots: "text-primary-600"
      },
      size: {
        xs: "w-3 h-3 border-[1px]",
        sm: "w-4 h-4 border-[1.5px]",
        default: "w-5 h-5 border-2",
        lg: "w-6 h-6 border-2",
        xl: "w-8 h-8 border-[3px]"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

const DotsSpinner = ({ size }: { size: string }) => {
  const dotSize = size === 'xs' ? 'w-1 h-1' : 
                  size === 'sm' ? 'w-1.5 h-1.5' :
                  size === 'lg' ? 'w-2.5 h-2.5' :
                  size === 'xl' ? 'w-3 h-3' : 'w-2 h-2'
  
  return (
    <div className="flex items-center gap-1">
      <div className={`${dotSize} bg-current rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
      <div className={`${dotSize} bg-current rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
      <div className={`${dotSize} bg-current rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
    </div>
  )
}

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  text?: string
}

function Spinner({ className, variant, size, text, ...props }: SpinnerProps) {
  if (variant === 'dots') {
    return (
      <div className={cn("flex items-center gap-2", className)} {...props}>
        <DotsSpinner size={size || 'default'} />
        {text && <span className="text-sm text-neutral-600">{text}</span>}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <div className={cn(spinnerVariants({ variant, size }))} />
      {text && <span className="text-sm text-neutral-600">{text}</span>}
    </div>
  )
}

export { Spinner, spinnerVariants }