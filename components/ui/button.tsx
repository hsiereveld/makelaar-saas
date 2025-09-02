import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 ease-in-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transform-gpu",
  {
    variants: {
      variant: {
        default: // Nederlandse Primary Business Button
          "bg-primary-600 text-white shadow-sm hover:bg-primary-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm",
        destructive: // Nederlandse Error Button
          "bg-error-500 text-white shadow-sm hover:bg-error-600 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
        outline: // Nederlandse Secondary Business Button
          "border border-neutral-300 bg-white text-neutral-700 shadow-sm hover:bg-neutral-50 hover:border-neutral-400 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
        secondary: // Nederlandse Subtle Action Button
          "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0",
        ghost: // Nederlandse Minimal Button
          "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 hover:-translate-y-0.5 active:translate-y-0",
        link: // Nederlandse Text Link
          "text-primary-600 underline-offset-4 hover:underline hover:text-primary-700",
        success: // Nederlandse Success Button
          "bg-success-500 text-white shadow-sm hover:bg-success-600 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
        business: // Nederlandse Executive Button
          "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md hover:from-primary-700 hover:to-primary-800 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:shadow-md",
      },
      size: {
        xs: "h-7 px-2.5 text-xs gap-1.5", // Nederlandse compact button
        sm: "h-8 px-3 text-xs gap-1.5", // Nederlandse small button
        default: "h-10 px-4 text-sm gap-2", // Nederlandse standard business button
        lg: "h-12 px-6 text-base gap-2", // Nederlandse prominent button
        xl: "h-14 px-8 text-lg gap-3", // Nederlandse hero button
        icon: "size-10 p-0", // Nederlandse square icon button
        "icon-sm": "size-8 p-0", // Nederlandse small icon button
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
