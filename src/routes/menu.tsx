import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { SearchX, Search, Wallet, UtensilsCrossed } from 'lucide-react'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { MenuCard, MenuCardSkeleton } from '@/components/canteen/menu-card'
import { EmptyState, ErrorState, NotConnectedBanner, PageHeading } from '@/components/canteen/states'
import { CATEGORIES, kzt } from '@/lib/categories'
import { useMenu, visibleItems } from '@/lib/use-menu'
import { useAppState } from '@/lib/app-state'
import { cn } from '@/lib/utils'

const BUDGET = 1500
const PRICE_CEILING = 5000

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  max: z.number().int().positive().optional(),
})

export const Route = createFileRoute('/menu')({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: 'Menu · Smart Campus Canteen' }] }),
  component: MenuPage,
})

function MenuPage() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: '/menu' })
  const { state, retry } = useMenu()
  const { setPreview } = useAppState()
  const { items, isPreview } = visibleItems(state)

  const [q, setQ] = React.useState(search.q ?? '')
  const [availableOnly, setAvailableOnly] = React.useState(false)
  const max = search.max ?? PRICE_CEILING
  const budgetOn = search.max === BUDGET

  React.useEffect(() => setQ(search.q ?? ''), [search.q])

  const update = (patch: Partial<z.infer<typeof searchSchema>>) =>
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })

  const filtered = items.filter(
    (i) =>
      (!q || i.name.toLowerCase().includes(q.toLowerCase())) &&
      (!search.category || i.category === search.category) &&
      i.price <= max &&
      (!availableOnly || i.isAvailable),
  )

  const hasFilters = !!q || !!search.category || search.max != null || availableOnly

  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:px-6">
      <PageHeading title="Menu" subtitle="Fresh food from the campus canteen. Prices in KZT." />

      {state.kind === 'not-connected' && <NotConnectedBanner what="Menu items" className="mb-6" />}

      <div className="mb-6 space-y-4 rounded-2xl border bg-card p-4 shadow-card sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Label htmlFor="menu-search" className="sr-only">
              Search menu
            </Label>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="menu-search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                update({ q: e.target.value || undefined })
              }}
              placeholder="Search by dish name"
              className="h-11 rounded-xl pl-9"
            />
          </div>
          <div className="flex flex-1 items-center gap-3">
            <Label htmlFor="price" className="shrink-0 text-sm font-medium">
              Max price
            </Label>
            <input
              id="price"
              type="range"
              min={200}
              max={PRICE_CEILING}
              step={100}
              value={max}
              onChange={(e) => {
                const v = Number(e.target.value)
                update({ max: v >= PRICE_CEILING ? undefined : v })
              }}
              className="h-2 flex-1 cursor-pointer accent-[var(--primary)]"
            />
            <span className="w-20 text-right text-sm font-semibold tabular-nums">
              {max >= PRICE_CEILING ? 'Any' : kzt(max)}
            </span>
          </div>
          <Button
            variant={budgetOn ? 'default' : 'outline'}
            className="h-11 rounded-xl"
            aria-pressed={budgetOn}
            onClick={() => update({ max: budgetOn ? undefined : BUDGET })}
          >
            <Wallet /> Budget meals ≤ {kzt(BUDGET)}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip active={!search.category} onClick={() => update({ category: undefined })}>
            All
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c.key} active={search.category === c.key} onClick={() => update({ category: search.category === c.key ? undefined : c.key })}>
              <c.icon className="size-4" /> {c.label}
            </Chip>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <Switch id="avail" checked={availableOnly} onCheckedChange={setAvailableOnly} />
            <Label htmlFor="avail" className="text-sm">
              Available only
            </Label>
          </div>
        </div>
      </div>

      {state.kind === 'loading' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <MenuCardSkeleton key={i} />
          ))}
        </div>
      )}
      {state.kind === 'error' && <ErrorState message={state.message} onRetry={retry} />}
      {state.kind === 'not-connected' && !isPreview && (
        <EmptyState
          icon={UtensilsCrossed}
          title="The menu isn’t available yet"
          action={
            <Button className="rounded-xl" onClick={() => setPreview(true)}>
              Show layout preview
            </Button>
          }
        >
          No menu items are shown because the canteen database isn’t connected. Layout preview shows
          clearly labeled sample cards so you can try the filters and cart.
        </EmptyState>
      )}
      {(state.kind === 'ok' || isPreview) &&
        (filtered.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
              {isPreview && ' · layout preview content'}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map((item) => (
                <MenuCard key={item.id} item={item} isPreview={isPreview} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={SearchX}
            title={items.length === 0 ? 'No menu items yet' : 'No dishes match your filters'}
            action={
              hasFilters && (
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    setQ('')
                    setAvailableOnly(false)
                    void navigate({ search: {}, replace: true })
                  }}
                >
                  Clear filters
                </Button>
              )
            }
          >
            {items.length === 0 ? 'The canteen hasn’t published any items.' : 'Try a higher price limit or another category.'}
          </EmptyState>
        ))}
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
        active ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-muted',
      )}
    >
      {children}
    </button>
  )
}
