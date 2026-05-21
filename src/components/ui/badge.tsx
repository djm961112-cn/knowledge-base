import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'success' | 'warning' | 'purple' | 'teal'
}

const variantStyles: Record<string, string> = {
  default: "bg-primary/15 text-primary border-primary/20",
  outline: "border border-border text-muted-foreground",
  ghost: "bg-surface text-muted-foreground",
  success: "bg-brand-teal/15 text-brand-teal border-brand-teal/20",
  warning: "bg-brand-amber/15 text-brand-amber border-brand-amber/20",
  purple: "bg-brand-purple/15 text-brand-purple border-brand-purple/20",
  teal: "bg-brand-teal/15 text-brand-teal border-brand-teal/20",
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "doc-tag border",
          variantStyles[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
