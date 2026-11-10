import { Flame, ImageOff, Plus, Thermometer } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppState } from '@/lib/app-state'
import { img, kzt } from '@/lib/categories'
import type { MenuItem } from '@/lib/data/types'
import { cn } from '@/lib/utils'
import { PreviewTag } from './states'

export function MenuCard({ item, isPreview }: { item: MenuItem; isPreview: boolean }) {
  const { addToCart } = useAppState()
  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-shadow hover:shadow-lg motion-reduce:transition-none',
        !item.isAvailable && 'opacity-75',
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {item.imageUrl ? (
          <img
            src={item.imageUrl.startsWith('/') ? img(item.imageUrl, 480) : item.imageUrl}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
          />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground">
            <ImageOff className="size-8" />
            <span className="sr-only">No image</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          {isPreview && <PreviewTag className="bg-card/90" />}
        </div>
        <span
          className={cn(
            'absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm',
            item.isAvailable ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground',
          )}
        >
          {item.isAvailable ? 'Available' : 'Sold out'}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1">
          <h3 className="font-bold">{item.name}</h3>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {item.calories != null && (
              <span className="inline-flex items-center gap-1">
                <Flame className="size-3.5" /> {item.calories} kcal
              </span>
            )}
            {item.dietaryTag && item.dietaryTag !== 'None' && <span>{item.dietaryTag}</span>}
            {item.temperatureCelsius != null && (
              <span className="inline-flex items-center gap-1">
                <Thermometer className="size-3.5" /> {item.temperatureCelsius}°C
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-extrabold font-display">{kzt(item.price)}</span>
          <Button
            size="sm"
            className="rounded-xl"
            disabled={!item.isAvailable}
            onClick={() => {
              addToCart({ menuItemId: item.id, name: item.name, unitPrice: item.price, imageUrl: item.imageUrl, isPreview })
              toast.success(`${item.name} added to cart`)
            }}
          >
            <Plus /> Add
          </Button>
        </div>
      </div>
    </article>
  )
}

export function MenuCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-2/3" />
        <div className="flex justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  )
}
