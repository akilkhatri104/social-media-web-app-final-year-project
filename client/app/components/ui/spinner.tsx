import { cn } from "~/lib/utils"
import { Loader2Icon } from "lucide-react"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon role="status" aria-label="Loading" className={cn("size-6 animate-spin text-primary", className)} {...props} />
  )
}

type LoadingStateProps = {
  label?: string
  className?: string
  spinnerClassName?: string
  variant?: "page" | "section" | "inline"
}

function LoadingState({
  label = "Loading...",
  className,
  spinnerClassName,
  variant = "section",
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 text-sm text-muted-foreground",
        variant === "page" && "min-h-screen w-full",
        variant === "section" && "min-h-40 w-full p-6",
        variant === "inline" && "py-2",
        className,
      )}
    >
      <Spinner className={spinnerClassName} />
      {label && <span>{label}</span>}
    </div>
  )
}

export { LoadingState, Spinner }
