import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import type {
  CartLine,
  DataResult,
  MenuItem,
  Order,
  OrderStatus,
  PickupInfo,
  SalesStats,
} from './types'

export const DATA_SOURCE = {
  provider: 'Supabase',
  connected: true,
} as const

type JsonRecord = Record<string, unknown>

type SupabaseConfig = {
  url: string
  anonKey: string
}

type DishRow = {
  dish_id: string
  category_id: string | null
  dish_name: string
  price: number | string
  calories: number | string | null
  dietary_tag: string | null
  is_available: boolean
}

type CategoryRow = {
  category_id: string
  category_name: string
}

type OrderRow = {
  order_id: string
  student_id: string
  dish_id: string
  order_date: string
  pickup_time: string
  quantity: number | string
  total_price: number | string
  qr_token: string | null
  status: string
}

type StudentRow = {
  student_id: string
  name: string
  surname: string
}

type LockerRow = {
  locker_id: string
  order_id: string | null
  status: string | null
  unlock_timestamp: string | null
}

const cartLineSchema = z.object({
  menuItemId: z.string().min(1),
  name: z.string(),
  unitPrice: z.number(),
  quantity: z.number().int().min(1).max(20),
  imageUrl: z.string().nullish(),
  isPreview: z.boolean().optional(),
})

const placeOrderInput = z.object({ lines: z.array(cartLineSchema).min(1) })
const orderIdInput = z.object({ orderId: z.string().min(1) })
const statusInput = z.object({
  orderId: z.string().min(1),
  status: z.enum(['pending', 'preparing', 'ready', 'completed']),
})

function env(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]
    if (value?.trim()) return value.trim()
  }
  return undefined
}

function normalizeSupabaseUrl(raw: string | undefined) {
  if (!raw) return null
  const value = raw.replace(/\/+$/, '')
  if (/^https?:\/\//i.test(value)) return value

  try {
    const parsed = new URL(value)
    if (!/^postgres(ql)?:$/i.test(parsed.protocol)) return null

    const hostMatch = parsed.hostname.match(/^db\.([^.]+)\.supabase\.co$/i)
    if (hostMatch?.[1]) return `https://${hostMatch[1]}.supabase.co`

    const user = decodeURIComponent(parsed.username)
    const userMatch = user.match(/^postgres\.([^.]+)$/i)
    if (userMatch?.[1]) return `https://${userMatch[1]}.supabase.co`
  } catch {
    return null
  }

  return null
}

function getConfig(): SupabaseConfig {
  const rawUrl = env(
    'SUPABASE_URL',
    'SUPABASE_DATABASE_URL',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
  )
  const url = normalizeSupabaseUrl(rawUrl)
  const anonKey = env(
    'SUPABASE_ANON_KEY',
    'VITE_SUPABASE_ANON_KEY',
    'SUPABASE_PUBLISHABLE_KEY',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  )

  if (!url || !anonKey) {
    throw new Error('Supabase environment variables are missing. Check SUPABASE_DATABASE_URL/SUPABASE_URL and SUPABASE_ANON_KEY in Netlify.')
  }

  return { url, anonKey }
}

async function rest<T>(path: string, init?: RequestInit): Promise<T> {
  const { url, anonKey } = getConfig()
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  const body = await response.text()
  if (!response.ok) {
    let message = body || `Supabase request failed (${response.status})`
    try {
      const parsed = JSON.parse(body) as JsonRecord
      const detail = parsed.message ?? parsed.details ?? parsed.hint
      if (typeof detail === 'string' && detail) message = detail
    } catch {
      // Keep raw response text.
    }
    throw new Error(message)
  }

  if (!body) return undefined as T
  return JSON.parse(body) as T
}

function query(path: string, params: Record<string, string>) {
  const search = new URLSearchParams(params)
  return `${path}?${search.toString()}`
}

function asNumber(value: number | string | null | undefined) {
  const n = Number(value ?? 0)
  return Number.isFinite(n) ? n : 0
}

function statusFromDb(value: string | null | undefined): OrderStatus {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'preparing') return 'preparing'
  if (normalized === 'ready') return 'ready'
  if (normalized === 'completed' || normalized === 'collected') return 'completed'
  return 'pending'
}

function statusToDb(value: OrderStatus) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function categoryKey(name: string | null | undefined) {
  const n = String(name ?? '').toLowerCase()
  if (n.includes('soup')) return 'soups'
  if (n.includes('salad')) return 'salads'
  if (n.includes('drink') || n.includes('tea') || n.includes('coffee') || n.includes('juice')) return 'drinks'
  if (n.includes('bakery') || n.includes('dessert')) return 'bakery'
  if (n.includes('snack') || n.includes('sandwich') || n.includes('fruit')) return 'snacks'
  return 'hot'
}

function categoryImage(key: string) {
  const map: Record<string, string> = {
    hot: '/img/cat-hot.png',
    salads: '/img/cat-salads.png',
    soups: '/img/cat-soups.png',
    drinks: '/img/cat-drinks.png',
    bakery: '/img/cat-bakery.png',
    snacks: '/img/cat-snacks.png',
  }
  return map[key] ?? '/img/cat-hot.png'
}

function toOrder(row: OrderRow, customerLabel?: string | null): Order {
  return {
    id: row.order_id,
    status: statusFromDb(row.status),
    total: asNumber(row.total_price),
    createdAt: row.order_date,
    customerLabel: customerLabel ?? row.student_id,
    itemCount: asNumber(row.quantity),
  }
}

function todayAlmaty() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Almaty',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

function nextPickupWindow() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Almaty',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date())
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '12')
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0')
  const current = hour * 60 + minute
  const start = Math.ceil((current + 1) / 15) * 15
  const end = start + 15
  const fmt = (total: number) => {
    const wrapped = ((total % 1440) + 1440) % 1440
    const h = Math.floor(wrapped / 60)
    const m = wrapped % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }
  return `${fmt(start)} - ${fmt(end)}`
}

async function loadStudentsMap() {
  const rows = await rest<StudentRow[]>(query('student', {
    select: 'student_id,name,surname',
  }))
  return new Map(rows.map((s) => [s.student_id, `${s.name} ${s.surname}`.trim()]))
}

async function loadDishesMap() {
  const rows = await rest<DishRow[]>(query('dish', {
    select: 'dish_id,category_id,dish_name,price,calories,dietary_tag,is_available',
  }))
  return new Map(rows.map((d) => [d.dish_id, d]))
}

const listMenuItemsServer = createServerFn({ method: 'GET' }).handler(async (): Promise<DataResult<MenuItem[]>> => {
  try {
    const [dishes, categories] = await Promise.all([
      rest<DishRow[]>(query('dish', {
        select: 'dish_id,category_id,dish_name,price,calories,dietary_tag,is_available',
        is_available: 'eq.true',
        order: 'dish_id.asc',
      })),
      rest<CategoryRow[]>(query('category', {
        select: 'category_id,category_name',
      })),
    ])

    const categoryNames = new Map(categories.map((c) => [c.category_id, c.category_name]))
    const data: MenuItem[] = dishes.map((dish) => {
      const key = categoryKey(categoryNames.get(dish.category_id ?? ''))
      return {
        id: dish.dish_id,
        name: dish.dish_name,
        price: asNumber(dish.price),
        isAvailable: dish.is_available,
        category: key,
        imageUrl: categoryImage(key),
        calories: dish.calories == null ? null : asNumber(dish.calories),
        dietaryTag: dish.dietary_tag,
      }
    })

    return { kind: 'ok', data }
  } catch (error) {
    return { kind: 'error', message: error instanceof Error ? error.message : 'Could not load the menu.' }
  }
})

const placeOrderServer = createServerFn({ method: 'POST' })
  .validator(placeOrderInput)
  .handler(async ({ data }): Promise<DataResult<Order>> => {
    try {
      if (data.lines.some((line) => line.isPreview)) {
        return { kind: 'error', message: 'Preview items cannot be submitted as real orders.' }
      }

      const dishes = await loadDishesMap()
      const date = todayAlmaty()
      const pickupTime = nextPickupWindow()
      const stamp = Date.now().toString(36).toUpperCase()

      const rows = data.lines.map((line, index) => {
        const dish = dishes.get(line.menuItemId)
        if (!dish) throw new Error(`Dish ${line.menuItemId} was not found in Supabase.`)
        if (!dish.is_available) throw new Error(`${dish.dish_name} is not available.`)
        const total = asNumber(dish.price) * line.quantity
        const random = crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()
        return {
          order_id: `WEB-${stamp}-${index + 1}-${random}`,
          student_id: 'S-001',
          dish_id: dish.dish_id,
          order_date: date,
          pickup_time: pickupTime,
          quantity: line.quantity,
          total_price: total,
          qr_token: `QR_${crypto.randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase()}`,
          status: 'Pending',
        }
      })

      const inserted = await rest<OrderRow[]>('order', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(rows),
      })

      const first = inserted[0]
      if (!first) return { kind: 'error', message: 'Supabase did not return the created order.' }
      return { kind: 'ok', data: toOrder(first, 'Aruzhan Akhmetova') }
    } catch (error) {
      return { kind: 'error', message: error instanceof Error ? error.message : 'The order could not be created.' }
    }
  })

const getOrderServer = createServerFn({ method: 'GET' })
  .validator(orderIdInput)
  .handler(async ({ data }): Promise<DataResult<Order>> => {
    try {
      const rows = await rest<OrderRow[]>(query('order', {
        select: 'order_id,student_id,dish_id,order_date,pickup_time,quantity,total_price,qr_token,status',
        order_id: `eq.${data.orderId}`,
        limit: '1',
      }))
      const row = rows[0]
      if (!row) return { kind: 'error', message: 'Order not found.' }

      const students = await loadStudentsMap()
      return { kind: 'ok', data: toOrder(row, students.get(row.student_id)) }
    } catch (error) {
      return { kind: 'error', message: error instanceof Error ? error.message : 'Could not load the order.' }
    }
  })

const getPickupInfoServer = createServerFn({ method: 'GET' })
  .validator(orderIdInput)
  .handler(async ({ data }): Promise<DataResult<PickupInfo>> => {
    try {
      const orders = await rest<OrderRow[]>(query('order', {
        select: 'order_id,student_id,dish_id,order_date,pickup_time,quantity,total_price,qr_token,status',
        order_id: `eq.${data.orderId}`,
        limit: '1',
      }))
      const order = orders[0]
      if (!order) return { kind: 'error', message: 'Order not found.' }

      const lockers = await rest<LockerRow[]>(query('locker', {
        select: 'locker_id,order_id,status,unlock_timestamp',
        order_id: `eq.${data.orderId}`,
        limit: '1',
      }))
      const locker = lockers[0]

      return {
        kind: 'ok',
        data: {
          orderId: order.order_id,
          status: statusFromDb(order.status),
          pickupToken: order.qr_token,
          qrImageUrl: null,
          locker: locker
            ? {
                id: locker.locker_id,
                label: locker.locker_id,
                location: null,
                temperatureCelsius: null,
              }
            : null,
        },
      }
    } catch (error) {
      return { kind: 'error', message: error instanceof Error ? error.message : 'Could not load pickup information.' }
    }
  })

const listStaffOrdersServer = createServerFn({ method: 'GET' }).handler(async (): Promise<DataResult<Order[]>> => {
  try {
    const [rows, students] = await Promise.all([
      rest<OrderRow[]>(query('order', {
        select: 'order_id,student_id,dish_id,order_date,pickup_time,quantity,total_price,qr_token,status',
        order: 'order_date.desc,order_id.desc',
        limit: '200',
      })),
      loadStudentsMap(),
    ])
    return {
      kind: 'ok',
      data: rows.map((row) => toOrder(row, students.get(row.student_id))),
    }
  } catch (error) {
    return { kind: 'error', message: error instanceof Error ? error.message : 'Could not load staff orders.' }
  }
})

const updateOrderStatusServer = createServerFn({ method: 'POST' })
  .validator(statusInput)
  .handler(async ({ data }): Promise<DataResult<Order>> => {
    try {
      const rows = await rest<OrderRow[]>(query('order', { order_id: `eq.${data.orderId}` }), {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ status: statusToDb(data.status) }),
      })
      const row = rows[0]
      if (!row) return { kind: 'error', message: 'Order not found or not updated.' }
      const students = await loadStudentsMap()
      return { kind: 'ok', data: toOrder(row, students.get(row.student_id)) }
    } catch (error) {
      return { kind: 'error', message: error instanceof Error ? error.message : 'Could not update the order.' }
    }
  })

const getSalesStatsServer = createServerFn({ method: 'GET' }).handler(async (): Promise<DataResult<SalesStats>> => {
  try {
    const date = todayAlmaty()
    const [orders, dishes] = await Promise.all([
      rest<OrderRow[]>(query('order', {
        select: 'order_id,student_id,dish_id,order_date,pickup_time,quantity,total_price,qr_token,status',
        order_date: `eq.${date}`,
      })),
      loadDishesMap(),
    ])

    const byStatus: SalesStats['byStatus'] = {
      pending: 0,
      preparing: 0,
      ready: 0,
      completed: 0,
    }
    let revenueToday = 0
    const dishStats = new Map<string, { orders: number; revenue: number }>()

    for (const order of orders) {
      byStatus[statusFromDb(order.status)] += 1
      revenueToday += asNumber(order.total_price)
      const current = dishStats.get(order.dish_id) ?? { orders: 0, revenue: 0 }
      current.orders += 1
      current.revenue += asNumber(order.total_price)
      dishStats.set(order.dish_id, current)
    }

    const popularDishes = [...dishStats.entries()]
      .map(([dishId, stat]) => ({
        name: dishes.get(dishId)?.dish_name ?? dishId,
        orders: stat.orders,
        revenue: stat.revenue,
      }))
      .sort((a, b) => b.orders - a.orders || b.revenue - a.revenue)
      .slice(0, 8)

    return {
      kind: 'ok',
      data: {
        ordersToday: orders.length,
        revenueToday,
        averageOrderValue: orders.length ? Math.round(revenueToday / orders.length) : 0,
        byStatus,
        popularDishes,
      },
    }
  } catch (error) {
    return { kind: 'error', message: error instanceof Error ? error.message : 'Could not load statistics.' }
  }
})

const deleteOrderServer = createServerFn({ method: 'POST' })
  .validator(orderIdInput)
  .handler(async ({ data }): Promise<DataResult<{ id: string }>> => {
    try {
      const orders = await rest<OrderRow[]>(query('order', {
        select: 'order_id,student_id,dish_id,order_date,pickup_time,quantity,total_price,qr_token,status',
        order_id: `eq.${data.orderId}`,
        limit: '1',
      }))
      const order = orders[0]
      if (!order) return { kind: 'error', message: 'Order not found.' }
      if (statusFromDb(order.status) !== 'pending') {
        return { kind: 'error', message: 'Only Pending orders can be cancelled.' }
      }

      const lockers = await rest<LockerRow[]>(query('locker', {
        select: 'locker_id,order_id,status,unlock_timestamp',
        order_id: `eq.${data.orderId}`,
        limit: '1',
      }))
      if (lockers.length > 0) {
        return { kind: 'error', message: 'This order already has a locker assignment and cannot be deleted.' }
      }

      const deleted = await rest<OrderRow[]>(query('order', { order_id: `eq.${data.orderId}` }), {
        method: 'DELETE',
        headers: { Prefer: 'return=representation' },
      })
      if (!deleted[0]) return { kind: 'error', message: 'The order was not deleted.' }
      return { kind: 'ok', data: { id: data.orderId } }
    } catch (error) {
      return { kind: 'error', message: error instanceof Error ? error.message : 'Could not delete the order.' }
    }
  })

export async function listMenuItems(): Promise<DataResult<MenuItem[]>> {
  return listMenuItemsServer()
}

export async function placeOrder(lines: CartLine[]): Promise<DataResult<Order>> {
  return placeOrderServer({ data: { lines } })
}

export async function getOrder(orderId: string): Promise<DataResult<Order>> {
  return getOrderServer({ data: { orderId } })
}

export async function getPickupInfo(orderId: string): Promise<DataResult<PickupInfo>> {
  return getPickupInfoServer({ data: { orderId } })
}

export async function listStaffOrders(): Promise<DataResult<Order[]>> {
  return listStaffOrdersServer()
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<DataResult<Order>> {
  return updateOrderStatusServer({ data: { orderId, status } })
}

export async function getSalesStats(): Promise<DataResult<SalesStats>> {
  return getSalesStatsServer()
}

export async function deleteOrder(orderId: string): Promise<DataResult<{ id: string }>> {
  return deleteOrderServer({ data: { orderId } })
}
