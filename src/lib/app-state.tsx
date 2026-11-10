import * as React from 'react'
import type { CartLine, DataResult, Order } from '@/lib/data/types'

export interface Submission {
  result: DataResult<Order>
  lines: CartLine[]
  cartTotal: number
  at: number
}

interface AppState {
  preview: boolean
  setPreview: (v: boolean) => void
  cart: CartLine[]
  addToCart: (line: Omit<CartLine, 'quantity'>) => void
  setQuantity: (id: string, qty: number) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  cartCount: number
  cartTotal: number
  lastSubmission: Submission | null
  setLastSubmission: (s: Submission | null) => void
}

const Ctx = React.createContext<AppState | null>(null)

const CART_KEY = 'scc.cart'
const PREVIEW_KEY = 'scc.preview'

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [preview, setPreviewState] = React.useState(false)
  const [cart, setCart] = React.useState<CartLine[]>([])
  const [hydrated, setHydrated] = React.useState(false)
  const [lastSubmission, setLastSubmission] = React.useState<Submission | null>(null)

  React.useEffect(() => {
    try {
      const c = localStorage.getItem(CART_KEY)
      if (c) setCart(JSON.parse(c) as CartLine[])
      setPreviewState(localStorage.getItem(PREVIEW_KEY) === '1')
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true)
  }, [])

  React.useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart, hydrated])

  const setPreview = React.useCallback((v: boolean) => {
    setPreviewState(v)
    localStorage.setItem(PREVIEW_KEY, v ? '1' : '0')
    // Preview lines must never linger in a real cart.
    if (!v) setCart((c) => c.filter((l) => !l.isPreview))
  }, [])

  const value: AppState = {
    preview,
    setPreview,
    cart,
    addToCart: (line) =>
      setCart((c) => {
        const found = c.find((l) => l.menuItemId === line.menuItemId)
        if (found)
          return c.map((l) =>
            l.menuItemId === line.menuItemId ? { ...l, quantity: Math.min(l.quantity + 1, 20) } : l,
          )
        return [...c, { ...line, quantity: 1 }]
      }),
    setQuantity: (id, qty) =>
      setCart((c) =>
        qty <= 0
          ? c.filter((l) => l.menuItemId !== id)
          : c.map((l) => (l.menuItemId === id ? { ...l, quantity: Math.min(qty, 20) } : l)),
      ),
    removeFromCart: (id) => setCart((c) => c.filter((l) => l.menuItemId !== id)),
    clearCart: () => setCart([]),
    cartCount: cart.reduce((s, l) => s + l.quantity, 0),
    cartTotal: cart.reduce((s, l) => s + l.quantity * l.unitPrice, 0),
    lastSubmission,
    setLastSubmission,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAppState() {
  const v = React.useContext(Ctx)
  if (!v) throw new Error('useAppState must be used inside AppStateProvider')
  return v
}
