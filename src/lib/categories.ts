import { Coffee, Cookie, Salad, Sandwich, Soup, UtensilsCrossed } from 'lucide-react'

/** Browse shortcuts. They filter the menu by category key once real data exists. */
export const CATEGORIES = [
  { key: 'hot', label: 'Hot meals', icon: UtensilsCrossed, image: '/img/cat-hot.png' },
  { key: 'salads', label: 'Salads', icon: Salad, image: '/img/cat-salads.png' },
  { key: 'soups', label: 'Soups', icon: Soup, image: '/img/cat-soups.png' },
  { key: 'drinks', label: 'Drinks', icon: Coffee, image: '/img/cat-drinks.png' },
  { key: 'bakery', label: 'Bakery', icon: Cookie, image: '/img/cat-bakery.png' },
  { key: 'snacks', label: 'Snacks', icon: Sandwich, image: '/img/cat-snacks.png' },
] as const

export function img(src: string, w: number) {
  return `/.netlify/images?url=${encodeURIComponent(src)}&w=${w}&fm=webp`
}

export function kzt(n: number) {
  return `${new Intl.NumberFormat('en-US').format(n)} ₸`
}
