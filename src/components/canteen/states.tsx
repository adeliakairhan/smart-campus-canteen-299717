import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, DatabaseZap, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppState } from '@/lib/app-state'
import { DATA_SOURCE } from '@/lib/data/source'
import { cn } from '@/lib/utils'

/** Shown wherever a screen depends on data the backend has not provided. */
export function NotConnectedBanner({ what, className }: { what: string; className?: string }) {
  const { preview, setPreview } = useAppState()
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-dashed border-warning/60 bg-warning/10 p-4 sm:flex-row sm:items-center',
        className,
      )}
    >
      <DatabaseZap className="size-5 shrink-0 text-warning" />
      <div className="flex-1 text-sm">
        <p className="font-semibold">{DATA_SOURCE.provider} database not connected</p>
        <p className="text-muted-foreground">
          {what} will appear here once the canteen database is connected.
          {preview && ' You are viewing layout preview content — it is not real data.'}
        </p>
      </div>
      {!preview && (
        <Button size="sm" variant="outline" className="rounded-lg" onClick={() => setPreview(true)}>
          <Eye /> Show layout preview
        </Button>
      )}
    </div>
  )
}

export function PreviewTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-dashed border-primary/50 bg-accent px-2 py-0.5 text-[11px] font-semibold tracking-wide text-accent-foreground uppercase',
        className,
      )}
    >
      <Eye className="size-3" /> Preview
    </span>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: LucideIcon
  title: string
  children?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border bg-card px-6 py-14 text-center shadow-card">
      <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-accent text-primary">
        <Icon className="size-7" />
      </span>
      <h2 className="text-lg font-bold">{title}</h2>
      {children && <div className="mt-1 max-w-md text-sm text-muted-foreground">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
      <AlertTriangle className="mb-3 size-8 text-destructive" />
      <h2 className="text-lg font-bold">Something went wrong</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-5 rounded-lg" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

export function PageHeading({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}
