import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Lock, MapPin, QrCode, Thermometer } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { z } from 'zod'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState, NotConnectedBanner, PageHeading } from '@/components/canteen/states'
import { StatusBadge } from '@/components/canteen/order-status'
import { OrderLookup } from '@/components/canteen/order-lookup'
import { getPickupInfo } from '@/lib/data/source'
import type { PickupInfo } from '@/lib/data/types'
import { useResult } from '@/lib/use-result'

export const Route = createFileRoute('/pickup')({
  validateSearch: z.object({ orderId: z.string().optional() }),
  head: () => ({ meta: [{ title: 'QR pickup · Smart Campus Canteen' }] }),
  component: PickupPage,
})

function PickupPage() {
  const { orderId } = Route.useSearch()
  const navigate = useNavigate({ from: '/pickup' })
  const { result, retry } = useResult(orderId ? () => getPickupInfo(orderId) : null, [orderId])
  const info: PickupInfo | null = result?.kind === 'ok' ? result.data : null

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <PageHeading title="QR pickup" subtitle="Show this screen at the counter or scan it at your locker." />
      <OrderLookup initial={orderId} onSubmit={(id) => void navigate({ search: { orderId: id } })} />

      {result?.kind === 'not-connected' && <NotConnectedBanner what="Pickup codes and locker details" className="mt-6" />}
      {result?.kind === 'error' && (
        <div className="mt-6">
          <ErrorState message={result.message} onRetry={retry} />
        </div>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1fr]">
        <section className="flex flex-col items-center rounded-3xl border bg-card p-8 text-center shadow-card" aria-labelledby="qr-heading">
          <h2 id="qr-heading" className="text-lg font-bold">
            Pickup code
          </h2>
          <div className="mt-5 grid size-60 place-items-center rounded-2xl border-2 border-dashed bg-muted/50">
            {orderId && !result ? (
              <Skeleton className="size-52 rounded-xl" />
            ) : info?.qrImageUrl ? (
              <img src={info.qrImageUrl} alt="Pickup QR code" className="size-52" />
            ) : info?.pickupToken ? (
              <div className="rounded-xl bg-white p-3">
                <QRCodeSVG value={info.pickupToken} size={200} aria-label="Pickup QR code" />
              </div>
            ) : (
              <div className="px-6 text-sm text-muted-foreground">
                <QrCode className="mx-auto mb-3 size-10 text-muted-foreground/60" />
                {info ? 'Your pickup code hasn’t been generated yet.' : 'Your QR code appears here once the canteen system generates it.'}
              </div>
            )}
          </div>
          {info?.pickupToken && (
            <p className="mt-4 font-mono text-lg font-semibold tracking-widest break-all">{info.pickupToken}</p>
          )}
          {info && (
            <div className="mt-4">
              <StatusBadge status={info.status} />
            </div>
          )}
        </section>

        <section className="rounded-3xl border bg-card p-8 shadow-card" aria-labelledby="locker-heading">
          <h2 id="locker-heading" className="flex items-center gap-2 text-lg font-bold">
            <Lock className="size-5 text-primary" /> Locker
          </h2>
          {info?.locker ? (
            <dl className="mt-5 space-y-4">
              <div className="rounded-2xl bg-accent p-5">
                <dt className="text-xs text-accent-foreground">Locker</dt>
                <dd className="font-display text-4xl font-extrabold text-accent-foreground">{info.locker.label}</dd>
              </div>
              {info.locker.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="size-4 text-muted-foreground" />
                  <dt className="sr-only">Location</dt>
                  <dd>{info.locker.location}</dd>
                </div>
              )}
              {info.locker.temperatureCelsius != null && (
                <div className="flex items-center gap-2 text-sm">
                  <Thermometer className="size-4 text-muted-foreground" />
                  <dt className="sr-only">Temperature</dt>
                  <dd>{info.locker.temperatureCelsius}°C</dd>
                </div>
              )}
            </dl>
          ) : (
            <div className="mt-5 rounded-2xl border-2 border-dashed p-6 text-sm text-muted-foreground">
              Locker details appear here only when the canteen system assigns one to your order. Otherwise, collect your
              order at the counter.
            </div>
          )}
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li>1. Wait until your order status is <strong className="text-foreground">Ready</strong>.</li>
            <li>2. Show the QR code to staff or scan it at the locker.</li>
            <li>3. Collect your food — the order moves to Completed.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
