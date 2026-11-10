/**
 * Data access layer — the ONLY place that talks to the backend.
 *
 * Status: the existing Supabase database is not connected yet, so every call
 * resolves to `{ kind: 'not-connected' }`. Nothing here returns simulated
 * records, fabricated order IDs, QR tokens or locker assignments.
 *
 * Integration plan (see PLAN.md):
 *  1. Verify the real Supabase schema (tables, columns, RLS policies).
 *  2. Implement these functions as TanStack Start server functions that call
 *     Supabase with server-side credentials (never ship a service-role key to
 *     the browser).
 *  3. Map real rows onto the types in `./types.ts`.
 */
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
  connected: false,
} as const

const notConnected = { kind: 'not-connected' } as const

export async function listMenuItems(): Promise<DataResult<MenuItem[]>> {
  // TODO(milestone 2): select from the verified menu table.
  return notConnected
}

export async function placeOrder(
  _lines: CartLine[],
): Promise<DataResult<Order>> {
  // TODO(milestone 3): insert order + lines; return the row Supabase confirms.
  return notConnected
}

export async function getOrder(_orderId: string): Promise<DataResult<Order>> {
  return notConnected
}

export async function getPickupInfo(
  _orderId: string,
): Promise<DataResult<PickupInfo>> {
  // TODO(milestone 4): token + locker exactly as stored in the database.
  return notConnected
}

export async function listStaffOrders(): Promise<DataResult<Order[]>> {
  return notConnected
}

export async function updateOrderStatus(
  _orderId: string,
  _status: OrderStatus,
): Promise<DataResult<Order>> {
  return notConnected
}

export async function getSalesStats(): Promise<DataResult<SalesStats>> {
  // TODO(milestone 5): database-side aggregation (view or RPC).
  return notConnected
}
