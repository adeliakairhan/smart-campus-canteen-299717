import * as React from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ImageOff, Loader2, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState, PageHeading, PreviewTag } from '@/components/canteen/states'
import { useAppState } from '@/lib/app-state'
import { img, kzt } from '@/lib/categories'
import { DATA_SOURCE, placeOrder } from '@/lib/data/source'
import type { DataResult, Order } from '@/lib/data/types'

export const Route = createFileRoute('/cart')({
  head: () => ({ meta: [{ title: 'Cart · Smart Campus Canteen' }] }),
  component: CartPage,
})

function CartPage() {
  const { cart, setQuantity, removeFromCart, cartTotal, cartCount, clearCart, setLastSubmission } = useAppState()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = React.useState(false)
  const hasPreview = cart.some((l) => l.isPreview)

  async function submit() {
    setSubmitting(true)
    const lines = cart.map((l) => ({ ...l }))
    let result: DataResult<Order>
    try {
      result =
        hasPreview && DATA_SOURCE.connected
          ? { kind: 'error', message: 'Layout preview items can’t be ordered. Remove them and add items from the live menu.' }
          : await placeOrder(lines.filter((l) => !l.isPreview))
    } catch (e) {
      result = { kind: 'error', message: e instanceof Error ? e.message : 'The order could not be sent.' }
    }
    setLastSubmission({ result, lines, cartTotal, at: Date.now() })
    // Only empty the cart once the backend has confirmed the order.
    if (result.kind === 'ok') clearCart()
    setSubmitting(false)
    void navigate({ to: '/order/confirmation' })
  }

  if (cart.length === 0)
    return (
      <div className="mx-auto max-w-content px-4 py-10 sm:px-6">
        <PageHeading title="Your cart" />
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          action={
            <Button asChild className="rounded-xl">
              <Link to="/menu">View Menu</Link>
            </Button>
          }
        >
          Add something tasty from the menu to get started.
        </EmptyState>
      </div>
    )

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-6">
      <PageHeading title="Your cart" subtitle={`${cartCount} ${cartCount === 1 ? 'item' : 'items'} selected`} />
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <ul className="space-y-3">
          {cart.map((l) => (
            <li key={l.menuItemId} className="flex items-center gap-4 rounded-2xl border bg-card p-3 shadow-card sm:p-4">
              <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-20">
                {l.imageUrl ? (
                  <img src={l.imageUrl.startsWith('/') ? img(l.imageUrl, 160) : l.imageUrl} alt="" className="size-full object-cover" />
                ) : (
                  <div className="grid size-full place-items-center text-muted-foreground">
                    <ImageOff className="size-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold">{l.name}</p>
                  {l.isPreview && <PreviewTag />}
                </div>
                <p className="text-sm text-muted-foreground">{kzt(l.unitPrice)} each</p>
                <div className="mt-2 flex items-center gap-1">
                  <Button variant="outline" size="icon-sm" className="rounded-lg" aria-label={`Decrease ${l.name}`} onClick={() => setQuantity(l.menuItemId, l.quantity - 1)}>
                    <Minus />
                  </Button>
                  <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite">
                    {l.quantity}
                  </span>
                  <Button variant="outline" size="icon-sm" className="rounded-lg" aria-label={`Increase ${l.name}`} onClick={() => setQuantity(l.menuItemId, l.quantity + 1)}>
                    <Plus />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="font-display font-bold tabular-nums">{kzt(l.unitPrice * l.quantity)}</span>
                <Button variant="ghost" size="icon-sm" aria-label={`Remove ${l.name}`} onClick={() => removeFromCart(l.menuItemId)}>
                  <Trash2 className="text-muted-foreground" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
        <aside className="h-fit rounded-2xl border bg-card p-5 shadow-card lg:sticky lg:top-24">
          <h2 className="text-lg font-bold">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Items</dt>
              <dd className="tabular-nums">{cartCount}</dd>
            </div>
            <div className="flex justify-between border-t pt-3 text-base font-bold">
              <dt>Total</dt>
              <dd className="font-display tabular-nums">{kzt(cartTotal)}</dd>
            </div>
          </dl>
          <Button className="mt-5 h-12 w-full rounded-xl text-base" disabled={submitting} onClick={submit}>
            {submitting ? <Loader2 className="animate-spin" /> : <ShoppingBag />}
            {submitting ? 'Sending order…' : 'Place Order'}
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            {DATA_SOURCE.connected
              ? 'Your order is confirmed only after the canteen system accepts it.'
              : 'The canteen database isn’t connected yet, so orders can’t be submitted. Your cart is kept.'}
          </p>
          {hasPreview && (
            <p className="mt-2 text-xs text-muted-foreground">Cart contains layout preview items, which are never sent as real orders.</p>
          )}
        </aside>
      </div>
    </div>
  )
}
