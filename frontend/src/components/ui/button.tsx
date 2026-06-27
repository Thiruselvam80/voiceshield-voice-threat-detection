import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary/80 backdrop-blur-md text-primary-foreground hover:bg-primary shadow-[0_4px_14px_0_rgba(99,102,241,0.2)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.3)] hover:-translate-y-[1px] border border-white/10",
        destructive:
          "bg-destructive/80 backdrop-blur-md text-destructive-foreground hover:bg-destructive shadow-[0_4px_14px_0_rgba(239,68,68,0.2)] hover:-translate-y-[1px] border border-white/10",
        outline:
          "border border-border bg-transparent hover:bg-secondary/50 backdrop-blur-sm hover:text-secondary-foreground",
        secondary:
          "bg-secondary/60 backdrop-blur-md text-secondary-foreground hover:bg-secondary/80 border border-white/5",
        ghost: "hover:bg-secondary/50 backdrop-blur-sm hover:text-secondary-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-full px-4 text-xs",
        lg: "h-12 rounded-full px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
