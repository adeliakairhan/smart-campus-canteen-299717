import { Link, createFileRoute } from '@tanstack/react-router'
import { CheckCircle2, DatabaseZap, QrCode, Receipt, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState, PageHeading } from '@/components/canteen/states'
import { StatusBadge } from '@/components/canteen/order-status'
import { useAppState } from '@/lib/app-state'
import { kzt } from '@/lib/categories'

export const Route = createFileRoute('/order/confirmation')({
  head: () => ({ meta: [{ title: 'Order confirmation · Smart Campus Canteen' }] }),
  component: ConfirmationPage,
})

function ConfirmationPage() {
  const { lastSubmission } = useAppState()

  if (!lastSubmission)
    return (
      <Shell>
        <EmptyState
          icon={Receipt}
          title="No recent order"
          action={
            <Button asChild className="rounded-xl">
              <Link to="/menu">View Menu</Link>
            </Button>
          }
        >
          Place an order from your cart to see its confirmation here.
        </EmptyState>
      </Shell>
    )

  const { result, lines, cartTotal } = lastSubmission

  if (result.kind === 'ok') {
    const order = result.data
    return (
      <Shell>
        <div className="rounded-3xl border bg-card p-8 text-center shadow-card">
          <CheckCircle2 className="mx-auto size-14 text-primary" />
          <h2 className="mt-4 text-2xl font-extrabold">Order placed!</h2>
          <p className="mt-1 text-muted-foreground">The canteen has received your order.</p>
          <dl className="mx-auto mt-6 grid max-w-md gap-3 text-left sm:grid-cols-3">
            <Field label="Order ID" value={order.id} />
            <Field label="Total" value={kzt(order.total)} />
            <div className="rounded-xl bg-muted p-3">
              <dt className="text-xs text-muted-foreground">Status</dt>
              <dd className="mt-1">
                <StatusBadge status={order.status} />
              </dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-xl">
              <Link to="/track" search={{ orderId: order.id }}>Track order</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/pickup" search={{ orderId: order.id }}>
                <QrCode /> Pickup QR
              </Link>
            </Button>
          </div>
        </div>
      </Shell>
    )
  }

  const notConnected = result.kind === 'not-connected'
  return (
    <Shell>
      <div className="rounded-3xl border bg-card p-8 shadow-card">
        <div className="flex flex-col items-center text-center">
          {notConnected ? <DatabaseZap className="size-14 text-warning" /> : <XCircle className="size-14 text-destructive" />}
          <h2 className="mt-4 text-2xl font-extrabold">Order not placed</h2>
          <p className="mt-1 max-w-md text-muted-foreground">
            {notConnected
              ? 'The canteen database isn’t connected yet, so no order was created. No order ID, status, or pickup code has been issued.'
              : result.message}
          </p>
        </div>
        <div className="mx-auto mt-6 max-w-md rounded-2xl bg-muted p-4">
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Cart you tried to order</p>
          <ul className="space-y-1 text-sm">
            {lines.map((l) => (
              <li key={l.menuItemId} className="flex justify-between">
                <span>
                  {l.quantity} × {l.name}
                </span>
                <span className="tabular-nums">{kzt(l.unitPrice * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 flex justify-between border-t pt-2 text-sm font-semibold">
            <span>Cart total (not charged)</span>
            <span className="tabular-nums">{kzt(cartTotal)}</span>
          </p>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild className="rounded-xl">
            <Link to="/cart">Back to cart</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/menu">View Menu</Link>
          </Button>
        </div>
      </div>
    </Shell>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-display font-bold break-all">{value}</dd>
    </div>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PageHeading title="Order confirmation" />
      {children}
    </div>
  )
}
