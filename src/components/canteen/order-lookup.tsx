import * as React from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function OrderLookup({ initial, onSubmit }: { initial?: string; onSubmit: (id: string | undefined) => void }) {
  const [value, setValue] = React.useState(initial ?? '')
  React.useEffect(() => setValue(initial ?? ''), [initial])
  return (
    <form
      className="flex flex-col gap-2 rounded-2xl border bg-card p-4 shadow-card sm:flex-row sm:items-end"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(value.trim() || undefined)
      }}
    >
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="order-id">Order ID</Label>
        <Input id="order-id" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter the ID from your confirmation" className="h-11 rounded-xl" />
      </div>
      <Button type="submit" className="h-11 rounded-xl">
        <Search /> Find order
      </Button>
    </form>
  )
}
