import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "border bg-white text-neutral-900 transition-all duration-200 ease-in-out",
  {
    variants: {
      variant: {
        default: "rounded-xl shadow-sm border-neutral-200",
        business: "rounded-lg shadow-md border-neutral-200 hover:shadow-lg hover:border-neutral-300",
        executive: "rounded-lg shadow-lg border-neutral-300 bg-gradient-to-br from-white to-neutral-50",
        minimal: "rounded-lg border-neutral-100 shadow-sm hover:shadow-md",
      },
      spacing: {
        compact: "",
        normal: "",
        spacious: "",
      },
      elevation: {
        flat: "shadow-none",
        subtle: "shadow-sm",
        medium: "shadow-md",
        prominent: "shadow-lg hover:shadow-xl",
      }
    },
    defaultVariants: {
      variant: "business",
      spacing: "normal",
      elevation: "medium",
    },
  }
)

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, spacing, elevation, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, spacing, elevation }), className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-2 p-6 pb-4",
      "border-b border-neutral-100", // Nederlandse business divider
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-tight tracking-tight", 
      "text-neutral-900", // Professional Nederlandse title color
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-sm leading-relaxed", 
      "text-neutral-600", // Nederlandse business description color
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "p-6 pt-4", // Nederlandse business content spacing
      className
    )} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between p-6 pt-0",
      "border-t border-neutral-100 mt-4", // Nederlandse business footer separation
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
