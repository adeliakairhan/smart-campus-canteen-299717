import * as React from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Clock, QrCode, Search, ShoppingBag, Sparkles, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MenuCard, MenuCardSkeleton } from '@/components/canteen/menu-card'
import { EmptyState, ErrorState, NotConnectedBanner } from '@/components/canteen/states'
import { CATEGORIES, img } from '@/lib/categories'
import { useMenu, visibleItems } from '@/lib/use-menu'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const navigate = useNavigate()
  const [q, setQ] = React.useState('')

  return (
    <>
      <section className="mx-auto grid max-w-content items-center gap-10 px-4 pt-10 pb-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">
            <Clock className="size-4" /> Order before your break
          </span>
          <h1 className="mt-5 text-4xl leading-[1.08] font-extrabold sm:text-5xl lg:text-6xl">
            What would you like to eat <span className="text-primary">today?</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Smart Campus Canteen lets you order ahead, follow your order in real time, and pick it up
            with a QR code — no queue, even on a ten-minute break.
          </p>
          <form
            role="search"
            className="mt-8 flex max-w-xl gap-2 rounded-2xl border bg-card p-2 shadow-card"
            onSubmit={(e) => {
              e.preventDefault()
              void navigate({ to: '/menu', search: { q: q.trim() || undefined } })
            }}
          >
            <label htmlFor="home-search" className="sr-only">
              Search the menu
            </label>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="home-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search meals, soups, drinks…"
                className="h-11 border-0 pl-9 shadow-none focus-visible:ring-0"
              />
            </div>
            <Button type="submit" className="h-11 rounded-xl px-5">
              Search
            </Button>
          </form>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 rounded-xl px-6 text-base">
              <Link to="/menu">
                View Menu <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-xl px-6 text-base">
              <Link to="/track">Track my order</Link>
            </Button>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-accent/60 blur-2xl" />
          <img
            src={img('/img/hero.png', 1100)}
            alt="A canteen tray with a grain bowl, salad, soup and water"
            className="aspect-[16/11] w-full rounded-[1.75rem] object-cover shadow-xl"
          />
          <div className="absolute -bottom-5 left-5 flex items-center gap-3 rounded-2xl border bg-card p-3 pr-5 shadow-card">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <QrCode className="size-5" />
            </span>
            <div className="text-sm">
              <p className="font-semibold">Scan &amp; collect</p>
              <p className="text-muted-foreground">Pickup with your QR code</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-content px-4 py-10 sm:px-6" aria-labelledby="cat-heading">
        <div className="mb-5 flex items-end justify-between">
          <h2 id="cat-heading" className="text-2xl font-bold">
            Food categories
          </h2>
          <Link to="/menu" className="text-sm font-semibold text-primary hover:underline">
            See all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              to="/menu"
              search={{ category: c.key }}
              className="group overflow-hidden rounded-2xl border bg-card shadow-card transition-shadow hover:shadow-lg"
            >
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={img(c.image, 320)}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                />
              </div>
              <div className="flex items-center gap-2 p-3 font-semibold">
                <c.icon className="size-4 text-primary" /> {c.label}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Featured />

      <section className="mx-auto max-w-content px-4 py-10 sm:px-6" aria-labelledby="how-heading">
        <h2 id="how-heading" className="mb-5 text-2xl font-bold">
          How it works
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: UtensilsCrossed, title: 'Choose your meal', text: 'Browse today’s menu, filter by price, and stay within budget.' },
            { icon: ShoppingBag, title: 'Place your order', text: 'Send your order before the break and watch its status update.' },
            { icon: QrCode, title: 'Pick it up fast', text: 'Show your pickup QR at the counter or open your assigned locker.' },
          ].map((s, i) => (
            <div key={s.title} className="rounded-2xl border bg-card p-6 shadow-card">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-accent text-primary">
                  <s.icon className="size-5" />
                </span>
                <span className="text-sm font-semibold text-muted-foreground">Step {i + 1}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function Featured() {
  const { state, retry } = useMenu()
  const { items, isPreview } = visibleItems(state)
  const featured = items.filter((i) => i.isAvailable).slice(0, 4)

  return (
    <section className="mx-auto max-w-content px-4 py-10 sm:px-6" aria-labelledby="featured-heading">
      <div className="mb-5 flex items-end justify-between">
        <h2 id="featured-heading" className="flex items-center gap-2 text-2xl font-bold">
          <Sparkles className="size-5 text-primary" /> Featured menu
        </h2>
        <Link to="/menu" className="text-sm font-semibold text-primary hover:underline">
          View Menu
        </Link>
      </div>
      {state.kind === 'not-connected' && <NotConnectedBanner what="Featured dishes" className="mb-5" />}
      {state.kind === 'loading' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <MenuCardSkeleton key={i} />
          ))}
        </div>
      )}
      {state.kind === 'error' && <ErrorState message={state.message} onRetry={retry} />}
      {featured.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((item) => (
            <MenuCard key={item.id} item={item} isPreview={isPreview} />
          ))}
        </div>
      )}
      {state.kind === 'ok' && featured.length === 0 && (
        <EmptyState icon={UtensilsCrossed} title="No dishes available right now">
          Check back soon — the canteen hasn’t published available items yet.
        </EmptyState>
      )}
    </section>
  )
}
