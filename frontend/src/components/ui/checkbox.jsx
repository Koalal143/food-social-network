"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(({
  className,
  checked,
  onCheckedChange,
  disabled,
  ...props
}, ref) => {
  const [isChecked, setIsChecked] = React.useState(checked || false)

  React.useEffect(() => {
    setIsChecked(checked || false)
  }, [checked])

  const handleChange = (e) => {
    const newChecked = e.target.checked
    setIsChecked(newChecked)
    if (onCheckedChange) {
      onCheckedChange(newChecked)
    }
  }

  return (
    <div className="relative inline-flex items-center">
      <input
        ref={ref}
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
      <div
        className={cn(
          "h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isChecked
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-background border-input hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={() => !disabled && handleChange({ target: { checked: !isChecked } })}
      >
        {isChecked && (
          <div className="flex items-center justify-center text-current">
            <Check className="h-3 w-3" />
          </div>
        )}
      </div>
    </div>
  )
})

Checkbox.displayName = "Checkbox"

export { Checkbox }
