import { AlertTriangleIcon, InboxIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { LoadingState, type LoadingStateProps } from "~/components/ui/spinner";

type QueryEmptyStateProps = {
  label?: string;
  className?: string;
  icon?: React.ReactNode;
};

function QueryEmptyState({
  label = "Nothing here yet.",
  className,
  icon,
}: QueryEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-center",
        className,
      )}
    >
      {icon ?? <InboxIcon className="size-10 text-muted-foreground/50" />}
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

type QueryErrorStateProps = {
  message?: string;
  className?: string;
  onRetry?: () => void;
};

function QueryErrorState({
  message = "Something went wrong. Please try again later.",
  className,
  onRetry,
}: QueryErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-center",
        className,
      )}
    >
      <AlertTriangleIcon className="size-10 text-destructive/60" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-primary underline underline-offset-4 hover:no-underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export { QueryEmptyState, QueryErrorState };
export type { QueryEmptyStateProps, QueryErrorStateProps };
