import { Check, ChefHat, Clock, PackageCheck, ShoppingBag } from 'lucide-react'
import { ORDER_STATUSES, ORDER_STATUS_LABEL, type OrderStatus } from '@/lib/data/types'
import { cn } from '@/lib/utils'

const ICONS = { pending: Clock, preparing: ChefHat, ready: ShoppingBag, completed: PackageCheck }

const BADGE: Record<OrderStatus, string> = {
  pending: 'bg-warning/15 text-[oklch(0.5_0.12_70)] border-warning/30',
  preparing: 'bg-chart-4/10 text-chart-4 border-chart-4/30',
  ready: 'bg-accent text-accent-foreground border-primary/30',
  completed: 'bg-muted text-muted-foreground border-border',
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const Icon = ICONS[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold', BADGE[status])}>
      <Icon className="size-3.5" /> {ORDER_STATUS_LABEL[status]}
    </span>
  )
}

const HINT: Record<OrderStatus, string> = {
  pending: 'Order received by the canteen',
  preparing: 'Kitchen is preparing your food',
  ready: 'Ready to collect at the counter or locker',
  completed: 'Picked up — enjoy your meal',
}

/** Steps view. `current` is null when no status has been returned by the backend. */
export function StatusSteps({ current }: { current: OrderStatus | null }) {
  const idx = current ? ORDER_STATUSES.indexOf(current) : -1
  return (
    <ol className="grid gap-3 sm:grid-cols-4">
      {ORDER_STATUSES.map((s, i) => {
        const Icon = ICONS[s]
        const done = i < idx
        const active = i === idx
        return (
          <li
            key={s}
            aria-current={active ? 'step' : undefined}
            className={cn(
              'relative flex items-start gap-3 rounded-2xl border bg-card p-4 transition-colors sm:flex-col',
              active && 'border-primary bg-accent shadow-card',
              done && 'border-primary/30',
            )}
          >
            <span
              className={cn(
                'grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground',
                (done || active) && 'bg-primary text-primary-foreground',
              )}
            >
              {done ? <Check className="size-5" /> : <Icon className="size-5" />}
            </span>
            <div>
              <p className="font-semibold">{ORDER_STATUS_LABEL[s]}</p>
              <p className="text-xs text-muted-foreground">{HINT[s]}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
