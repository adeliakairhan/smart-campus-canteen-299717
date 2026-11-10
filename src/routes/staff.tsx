import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { BarChart3, ClipboardList, Coins, Inbox, RefreshCw, ShoppingBag, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState, ErrorState, NotConnectedBanner, PageHeading, PreviewTag } from '@/components/canteen/states'
import { StatusBadge } from '@/components/canteen/order-status'
import { useAppState } from '@/lib/app-state'
import { kzt } from '@/lib/categories'
import { getSalesStats, listStaffOrders, updateOrderStatus } from '@/lib/data/source'
import { ORDER_STATUSES, ORDER_STATUS_LABEL, type DataResult, type Order, type OrderStatus, type SalesStats } from '@/lib/data/types'
import { PREVIEW_ORDERS, PREVIEW_STATS } from '@/lib/preview/fixtures'
import { useResult } from '@/lib/use-result'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/staff')({
  head: () => ({ meta: [{ title: 'Staff dashboard · Smart Campus Canteen' }] }),
  component: StaffPage,
})

type PreviewMode = 'sample' | 'loading' | 'empty' | 'error'
type View<T> = { kind: 'loading' } | { kind: 'ok'; data: T; preview: boolean } | { kind: 'not-connected' } | { kind: 'error'; message: string }

function toView<T>(r: DataResult<T> | null, preview: boolean, mode: PreviewMode, sample: T, empty: T): View<T> {
  if (!r) return { kind: 'loading' }
  if (r.kind === 'ok') return { kind: 'ok', data: r.data, preview: false }
  if (r.kind === 'error') return r
  if (!preview) return { kind: 'not-connected' }
  if (mode === 'loading') return { kind: 'loading' }
  if (mode === 'error') return { kind: 'error', message: 'Preview of the error state: the dashboard could not reach the database.' }
  return { kind: 'ok', data: mode === 'empty' ? empty : sample, preview: true }
}

const EMPTY_STATS: SalesStats = {
  ordersToday: 0,
  revenueToday: 0,
  averageOrderValue: 0,
  byStatus: { pending: 0, preparing: 0, ready: 0, completed: 0 },
  popularDishes: [],
}

function StaffPage() {
  const { preview } = useAppState()
  const [mode, setMode] = React.useState<PreviewMode>('sample')
  const orders = useResult(() => listStaffOrders(), [])
  const stats = useResult(() => getSalesStats(), [])
  const [previewOrders, setPreviewOrders] = React.useState<Order[]>(PREVIEW_ORDERS)
  const [filter, setFilter] = React.useState<OrderStatus | 'all'>('all')
  const [saving, setSaving] = React.useState<string | null>(null)

  const ordersView = toView(orders.result, preview, mode, previewOrders, [])
  const statsView = toView(stats.result, preview, mode, PREVIEW_STATS, EMPTY_STATS)
  const notConnected = orders.result?.kind === 'not-connected'

  async function changeStatus(order: Order, status: OrderStatus, isPreview: boolean) {
    if (isPreview) {
      setPreviewOrders((list) => list.map((o) => (o.id === order.id ? { ...o, status } : o)))
      toast.info('Preview only — the change was not saved to any database.')
      return
    }
    setSaving(order.id)
    try {
      const r = await updateOrderStatus(order.id, status)
      if (r.kind === 'ok') {
        orders.setResult((prev) => (prev?.kind === 'ok' ? { kind: 'ok', data: prev.data.map((o) => (o.id === r.data.id ? r.data : o)) } : prev))
        toast.success(`Order ${r.data.id} is now ${ORDER_STATUS_LABEL[r.data.status]}`)
      } else if (r.kind === 'not-connected') {
        toast.error('Not saved: the database is not connected.')
      } else {
        toast.error(`Not saved: ${r.message}`)
      }
    } catch (e) {
      toast.error(`Not saved: ${e instanceof Error ? e.message : 'request failed'}`)
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-6">
      <PageHeading title="Staff dashboard" subtitle="Live orders, status control and sales at a glance.">
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => {
            orders.retry()
            stats.retry()
          }}
        >
          <RefreshCw /> Refresh
        </Button>
      </PageHeading>

      {notConnected && <NotConnectedBanner what="Orders and sales statistics" className="mb-6" />}

      {notConnected && preview && (
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-card p-3">
          <PreviewTag />
          <span className="text-sm text-muted-foreground">Preview state:</span>
          {(['sample', 'loading', 'empty', 'error'] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={cn('rounded-full border px-3 py-1 text-xs font-semibold capitalize', mode === m ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-muted')}
            >
              {m === 'sample' ? 'Sample layout' : m}
            </button>
          ))}
        </div>
      )}

      <Kpis view={statsView} onRetry={stats.retry} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section className="min-w-0 rounded-2xl border bg-card shadow-card" aria-labelledby="orders-heading">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:p-5">
            <h2 id="orders-heading" className="flex items-center gap-2 text-lg font-bold">
              <ClipboardList className="size-5 text-primary" /> Orders
              {ordersView.kind === 'ok' && ordersView.preview && <PreviewTag />}
            </h2>
            <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by status">
              {(['all', ...ORDER_STATUSES] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={filter === s}
                  onClick={() => setFilter(s)}
                  className={cn('rounded-full px-3 py-1 text-xs font-semibold', filter === s ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted')}
                >
                  {s === 'all' ? 'All' : ORDER_STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
          <OrdersTable view={ordersView} filter={filter} saving={saving} onChange={changeStatus} onRetry={orders.retry} />
        </section>

        <div className="space-y-6">
          <PopularDishes view={statsView} />
          <StatusBreakdown view={statsView} />
        </div>
      </div>
    </div>
  )
}

function Kpis({ view, onRetry }: { view: View<SalesStats>; onRetry: () => void }) {
  if (view.kind === 'error') return <ErrorState message={view.message} onRetry={onRetry} />
  const d = view.kind === 'ok' ? view.data : null
  const tiles: { label: string; icon: LucideIcon; value: string | undefined }[] = [
    { label: 'Orders today', icon: ShoppingBag, value: d ? String(d.ordersToday) : undefined },
    { label: 'Revenue today', icon: Coins, value: d ? kzt(d.revenueToday) : undefined },
    { label: 'Average order', icon: TrendingUp, value: d ? kzt(d.averageOrderValue) : undefined },
    { label: 'Ready for pickup', icon: Inbox, value: d ? String(d.byStatus.ready) : undefined },
  ]
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-2xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            {t.label}
            <span className="grid size-8 place-items-center rounded-lg bg-accent text-primary">
              <t.icon className="size-4" />
            </span>
          </div>
          {view.kind === 'loading' ? (
            <Skeleton className="mt-3 h-8 w-24" />
          ) : (
            <p className="mt-2 font-display text-2xl font-extrabold tabular-nums sm:text-3xl">{t.value ?? '—'}</p>
          )}
          {view.kind === 'not-connected' && <p className="mt-1 text-xs text-muted-foreground">No data source</p>}
          {view.kind === 'ok' && view.preview && <p className="mt-1 text-xs text-muted-foreground">Preview value</p>}
        </div>
      ))}
    </div>
  )
}

function OrdersTable({
  view,
  filter,
  saving,
  onChange,
  onRetry,
}: {
  view: View<Order[]>
  filter: OrderStatus | 'all'
  saving: string | null
  onChange: (o: Order, s: OrderStatus, isPreview: boolean) => void
  onRetry: () => void
}) {
  if (view.kind === 'error')
    return (
      <div className="p-5">
        <ErrorState message={view.message} onRetry={onRetry} />
      </div>
    )
  if (view.kind === 'not-connected')
    return (
      <div className="p-5">
        <EmptyState icon={ClipboardList} title="No orders to show">
          Orders appear here as soon as the database is connected.
        </EmptyState>
      </div>
    )
  if (view.kind === 'loading')
    return (
      <div className="space-y-3 p-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  const rows = view.data.filter((o) => filter === 'all' || o.status === filter)
  if (rows.length === 0)
    return (
      <div className="p-5">
        <EmptyState icon={Inbox} title={view.data.length === 0 ? 'No orders yet' : 'No orders with this status'}>
          {view.data.length === 0 ? 'New orders will show up here.' : 'Try another status filter.'}
        </EmptyState>
      </div>
    )
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-5">Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead className="text-right">Items</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="pr-5">Update</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((o) => (
            <TableRow key={o.id}>
              <TableCell className="pl-5 font-semibold">{o.id}</TableCell>
              <TableCell className="text-muted-foreground">{o.customerLabel ?? '—'}</TableCell>
              <TableCell className="text-right tabular-nums">{o.itemCount ?? '—'}</TableCell>
              <TableCell className="text-right tabular-nums">{kzt(o.total)}</TableCell>
              <TableCell>
                <StatusBadge status={o.status} />
              </TableCell>
              <TableCell className="pr-5">
                <Select value={o.status} disabled={saving === o.id} onValueChange={(v) => onChange(o, v as OrderStatus, view.preview)}>
                  <SelectTrigger size="sm" className="w-32 rounded-lg" aria-label={`Update status for ${o.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {ORDER_STATUS_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function Panel({ title, icon: Icon, preview, children }: { title: string; icon: LucideIcon; preview?: boolean; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-card">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
        <Icon className="size-5 text-primary" /> {title}
        {preview && <PreviewTag />}
      </h2>
      {children}
    </section>
  )
}

function PopularDishes({ view }: { view: View<SalesStats> }) {
  const dishes = view.kind === 'ok' ? view.data.popularDishes : []
  const top = Math.max(1, ...dishes.map((d) => d.orders))
  return (
    <Panel title="Popular dishes" icon={BarChart3} preview={view.kind === 'ok' && view.preview}>
      {view.kind === 'loading' ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-8" />
          ))}
        </div>
      ) : dishes.length === 0 ? (
        <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
          {view.kind === 'ok' ? 'No sales recorded yet.' : 'Sales rankings appear once the database is connected.'}
        </p>
      ) : (
        <ol className="space-y-3">
          {dishes.map((d) => (
            <li key={d.name}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium">{d.name}</span>
                <span className="text-muted-foreground tabular-nums">
                  {d.orders} orders · {kzt(d.revenue)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(d.orders / top) * 100}%` }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  )
}

const STATUS_TONE: Record<OrderStatus, string> = {
  pending: 'bg-warning',
  preparing: 'bg-chart-4',
  ready: 'bg-primary',
  completed: 'bg-chart-5',
}

function StatusBreakdown({ view }: { view: View<SalesStats> }) {
  const by = view.kind === 'ok' ? view.data.byStatus : null
  const total = by ? ORDER_STATUSES.reduce((s, k) => s + by[k], 0) : 0
  return (
    <Panel title="Orders by status" icon={ClipboardList} preview={view.kind === 'ok' && view.preview}>
      {view.kind === 'loading' ? (
        <Skeleton className="h-16" />
      ) : !by || total === 0 ? (
        <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
          {by ? 'No orders yet today.' : 'Status totals appear once the database is connected.'}
        </p>
      ) : (
        <>
          <div className="flex h-3 gap-0.5 overflow-hidden rounded-full" role="img" aria-label="Order status distribution">
            {ORDER_STATUSES.map((s) => by[s] > 0 && <div key={s} className={STATUS_TONE[s]} style={{ width: `${(by[s] / total) * 100}%` }} />)}
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {ORDER_STATUSES.map((s) => (
              <li key={s} className="flex items-center gap-2">
                <span className={cn('size-2.5 rounded-full', STATUS_TONE[s])} />
                {ORDER_STATUS_LABEL[s]}
                <span className="ml-auto font-semibold tabular-nums">{by[s]}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Panel>
  )
}
