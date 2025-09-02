import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const progressVariants = cva(
  "h-2 w-full overflow-hidden rounded-full",
  {
    variants: {
      variant: {
        default: "bg-neutral-200",
        primary: "bg-primary-100",
        success: "bg-success-100",
        warning: "bg-warning-100",
        error: "bg-error-100"
      },
      size: {
        sm: "h-1.5",
        default: "h-2",
        lg: "h-3",
        xl: "h-4"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

const progressIndicatorVariants = cva(
  "h-full w-full flex-1 transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-primary-600",
        primary: "bg-primary-600",
        success: "bg-success-600",
        warning: "bg-warning-600",
        error: "bg-error-600"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  value?: number
  showPercentage?: boolean
  label?: string
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, variant, size, showPercentage, label, ...props }, ref) => (
  <div className="space-y-2">
    {(label || showPercentage) && (
      <div className="flex items-center justify-between">
        {label && <span className="text-sm font-medium text-neutral-700">{label}</span>}
        {showPercentage && (
          <span className="text-sm text-neutral-500">{Math.round(value)}%</span>
        )}
      </div>
    )}
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(progressVariants({ variant, size }), className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(progressIndicatorVariants({ variant }))}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  </div>
))
Progress.displayName = ProgressPrimitive.Root.displayName

// Nederlandse Business Progress Components
function UploadProgress({ 
  progress, 
  fileName, 
  fileSize 
}: { 
  progress: number
  fileName: string
  fileSize?: string 
}) {
  return (
    <div className="p-4 border border-neutral-200 rounded-lg bg-white">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-neutral-900">{fileName}</p>
          {fileSize && <p className="text-xs text-neutral-500">{fileSize}</p>}
        </div>
        <span className="text-sm text-neutral-500">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} variant="primary" />
    </div>
  )
}

function FormProgress({ 
  currentStep, 
  totalSteps, 
  stepLabels 
}: { 
  currentStep: number
  totalSteps: number
  stepLabels?: string[]
}) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="space-y-4">
      {stepLabels && (
        <div className="flex justify-between">
          {stepLabels.map((label, index) => (
            <div
              key={index}
              className={cn(
                "text-xs font-medium",
                index < currentStep ? "text-success-600" :
                index === currentStep ? "text-primary-600" :
                "text-neutral-400"
              )}
            >
              {label}
            </div>
          ))}
        </div>
      )}
      <Progress 
        value={progress} 
        variant="primary"
        label={stepLabels ? undefined : `Stap ${currentStep} van ${totalSteps}`}
        showPercentage={!stepLabels}
      />
    </div>
  )
}

export { Progress, UploadProgress, FormProgress }