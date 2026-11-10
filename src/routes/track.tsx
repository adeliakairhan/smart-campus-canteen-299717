import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ClipboardList } from 'lucide-react'
import { z } from 'zod'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState, NotConnectedBanner, PageHeading, PreviewTag } from '@/components/canteen/states'
import { StatusBadge, StatusSteps } from '@/components/canteen/order-status'
import { OrderLookup } from '@/components/canteen/order-lookup'
import { useAppState } from '@/lib/app-state'
import { kzt } from '@/lib/categories'
import { getOrder } from '@/lib/data/source'
import { ORDER_STATUSES, ORDER_STATUS_LABEL, type OrderStatus } from '@/lib/data/types'
import { useResult } from '@/lib/use-result'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/track')({
  validateSearch: z.object({ orderId: z.string().optional() }),
  head: () => ({ meta: [{ title: 'Track order · Smart Campus Canteen' }] }),
  component: TrackPage,
})

function TrackPage() {
  const { orderId } = Route.useSearch()
  const navigate = useNavigate({ from: '/track' })
  const { preview } = useAppState()
  const { result, retry } = useResult(orderId ? () => getOrder(orderId) : null, [orderId])
  const [previewStep, setPreviewStep] = React.useState<OrderStatus>('preparing')

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <PageHeading title="Track your order" subtitle="Follow your order from the kitchen to pickup." />
      <OrderLookup initial={orderId} onSubmit={(id) => void navigate({ search: { orderId: id } })} />

      <div className="mt-8 space-y-6">
        {!orderId && !preview && (
          <>
            <EmptyState icon={ClipboardList} title="Enter an order ID">
              The status shown here comes directly from the canteen system.
            </EmptyState>
            <StatusSteps current={null} />
          </>
        )}

        {orderId && !result && (
          <div className="space-y-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        )}

        {orderId && result?.kind === 'error' && <ErrorState message={result.message} onRetry={retry} />}

        {orderId && result?.kind === 'ok' && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5 shadow-card">
              <div>
                <p className="text-xs text-muted-foreground">Order</p>
                <p className="font-display text-xl font-bold break-all">{result.data.id}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-display text-xl font-bold">{kzt(result.data.total)}</p>
              </div>
              <StatusBadge status={result.data.status} />
            </div>
            <StatusSteps current={result.data.status} />
          </>
        )}

        {(result?.kind === 'not-connected' || (!orderId && preview)) && (
          <>
            {result?.kind === 'not-connected' && <NotConnectedBanner what="Your order status" />}
            {preview ? (
              <div className="space-y-4 rounded-2xl border border-dashed border-primary/40 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <PreviewTag />
                  <span className="text-sm text-muted-foreground">Step through each status to see the layout:</span>
                  <div className="flex flex-wrap gap-1" role="group" aria-label="Preview status">
                    {ORDER_STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        aria-pressed={previewStep === s}
                        onClick={() => setPreviewStep(s)}
                        className={cn('rounded-full border px-3 py-1 text-xs font-semibold', previewStep === s ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-muted')}
                      >
                        {ORDER_STATUS_LABEL[s]}
                      </button>
                    ))}
                  </div>
                </div>
                <StatusSteps current={previewStep} />
              </div>
            ) : (
              <StatusSteps current={null} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
