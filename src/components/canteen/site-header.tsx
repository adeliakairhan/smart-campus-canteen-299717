import { Link } from '@tanstack/react-router'
import { Eye, Leaf, Menu as MenuIcon, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAppState } from '@/lib/app-state'

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/track', label: 'Track order' },
  { to: '/pickup', label: 'QR pickup' },
  { to: '/staff', label: 'Staff' },
] as const

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 font-display font-extrabold">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Leaf className="size-5" />
      </span>
      <span className="leading-tight">
        Smart Campus
        <span className="block text-xs font-semibold tracking-wide text-primary uppercase">
          Canteen
        </span>
      </span>
    </Link>
  )
}

function PreviewToggle({ id }: { id: string }) {
  const { preview, setPreview } = useAppState()
  return (
    <div className="flex items-center gap-2">
      <Switch id={id} checked={preview} onCheckedChange={setPreview} />
      <Label htmlFor={id} className="cursor-pointer text-sm text-muted-foreground">
        <Eye className="size-4" /> Layout preview
      </Label>
    </div>
  )
}

export function SiteHeader() {
  const { cartCount } = useAppState()
  return (
    <header className="sticky top-0 z-40 border-b bg-card/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-content items-center gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === '/' }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[status=active]:bg-accent data-[status=active]:text-accent-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:block">
            <PreviewToggle id="preview-desktop" />
          </div>
          <Button asChild variant="outline" className="relative rounded-xl">
            <Link to="/cart" aria-label={`Cart, ${cartCount} items`}>
              <ShoppingBag />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>Student and staff screens</SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4" aria-label="Mobile">
                {NAV.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    activeOptions={{ exact: n.to === '/' }}
                    className="rounded-lg px-3 py-2.5 font-medium hover:bg-muted data-[status=active]:bg-accent data-[status=active]:text-accent-foreground"
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-4 border-t px-4 pt-4">
                <PreviewToggle id="preview-mobile" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-card">
      <div className="mx-auto flex max-w-content flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span>© Smart Campus Canteen · Order ahead, skip the queue.</span>
        <Link to="/staff" className="hover:text-foreground">
          Staff dashboard →
        </Link>
      </div>
    </footer>
  )
}
