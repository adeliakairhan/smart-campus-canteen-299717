/**
 * LAYOUT PREVIEW CONTENT — NOT DATABASE DATA.
 *
 * Generic placeholders used only when the visitor turns on "Layout preview"
 * so the screens can be demonstrated before Supabase is connected. Names are
 * deliberately generic ("Sample …") and every screen labels them as preview.
 * Never return these from `src/lib/data/source.ts`.
 */
import type { MenuItem, Order, SalesStats } from '@/lib/data/types'

export const PREVIEW_MENU: MenuItem[] = [
  { id: 'preview-1', name: 'Sample hot meal', price: 1400, isAvailable: true, category: 'hot', imageUrl: '/img/cat-hot.png' },
  { id: 'preview-2', name: 'Sample salad', price: 900, isAvailable: true, category: 'salads', imageUrl: '/img/cat-salads.png' },
  { id: 'preview-3', name: 'Sample soup', price: 750, isAvailable: true, category: 'soups', imageUrl: '/img/cat-soups.png' },
  { id: 'preview-4', name: 'Sample drink', price: 450, isAvailable: true, category: 'drinks', imageUrl: '/img/cat-drinks.png' },
  { id: 'preview-5', name: 'Sample pastry', price: 600, isAvailable: false, category: 'bakery', imageUrl: '/img/cat-bakery.png' },
  { id: 'preview-6', name: 'Sample snack box', price: 1500, isAvailable: true, category: 'snacks', imageUrl: '/img/cat-snacks.png' },
  { id: 'preview-7', name: 'Sample combo meal', price: 2200, isAvailable: true, category: 'hot', imageUrl: null },
  { id: 'preview-8', name: 'Sample large salad', price: 1800, isAvailable: false, category: 'salads', imageUrl: null },
]

export const PREVIEW_ORDERS: Order[] = [
  { id: 'Sample row 1', status: 'pending', total: 1850, itemCount: 2, customerLabel: 'Student A' },
  { id: 'Sample row 2', status: 'preparing', total: 1400, itemCount: 1, customerLabel: 'Student B' },
  { id: 'Sample row 3', status: 'ready', total: 2650, itemCount: 3, customerLabel: 'Student C' },
  { id: 'Sample row 4', status: 'completed', total: 900, itemCount: 1, customerLabel: 'Student D' },
  { id: 'Sample row 5', status: 'pending', total: 3100, itemCount: 4, customerLabel: 'Student E' },
]

export const PREVIEW_STATS: SalesStats = {
  ordersToday: 5,
  revenueToday: 9900,
  averageOrderValue: 1980,
  byStatus: { pending: 2, preparing: 1, ready: 1, completed: 1 },
  popularDishes: [
    { name: 'Sample hot meal', orders: 12, revenue: 16800 },
    { name: 'Sample salad', orders: 9, revenue: 8100 },
    { name: 'Sample soup', orders: 7, revenue: 5250 },
    { name: 'Sample drink', orders: 5, revenue: 2250 },
  ],
}
