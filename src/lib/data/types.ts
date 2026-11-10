/**
 * Provisional domain types for the canteen UI.
 *
 * These describe what the screens need, NOT the Supabase schema. Project docs
 * mention tables `menu_item`, `orders`, `dish`, `locker` and fields such as
 * `is_available`, `price`, `status`, `temperature_celsius`, but the real schema
 * has not been verified yet. Map real columns onto these shapes inside
 * `src/lib/data/source.ts` once the schema is confirmed.
 */

export const ORDER_STATUSES = [
  'pending',
  'preparing',
  'ready',
  'completed',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
}

export interface MenuItem {
  id: string
  name: string
  /** Price in KZT */
  price: number
  isAvailable: boolean
  category?: string | null
  imageUrl?: string | null
  temperatureCelsius?: number | null
}

export interface CartLine {
  menuItemId: string
  name: string
  unitPrice: number
  quantity: number
  imageUrl?: string | null
  /** True when the line came from layout-preview content, not the database. */
  isPreview?: boolean
}

export interface Locker {
  id: string
  label: string
  location?: string | null
  temperatureCelsius?: number | null
}

export interface Order {
  id: string
  status: OrderStatus
  /** Total in KZT as returned by the backend */
  total: number
  createdAt?: string | null
  customerLabel?: string | null
  itemCount?: number | null
}

export interface PickupInfo {
  orderId: string
  status: OrderStatus
  /** Token issued by the backend. Rendered as a QR code only if present. */
  pickupToken?: string | null
  /** Optional pre-rendered QR image URL from the backend. */
  qrImageUrl?: string | null
  locker?: Locker | null
}

export interface PopularDish {
  name: string
  orders: number
  revenue: number
}

export interface SalesStats {
  ordersToday: number
  revenueToday: number
  averageOrderValue: number
  byStatus: Record<OrderStatus, number>
  popularDishes: PopularDish[]
}

/**
 * Every data call returns one of these. Screens must render each case and
 * never treat `not-connected` or `error` as success.
 */
export type DataResult<T> =
  | { kind: 'ok'; data: T }
  | { kind: 'not-connected' }
  | { kind: 'error'; message: string }
