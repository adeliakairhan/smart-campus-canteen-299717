import * as React from 'react'
import type { DataResult } from '@/lib/data/types'

/** Runs a data call and exposes `null` while loading. Pass `null` as fn to skip. */
export function useResult<T>(fn: (() => Promise<DataResult<T>>) | null, deps: React.DependencyList) {
  const [result, setResult] = React.useState<DataResult<T> | null>(null)
  const [nonce, setNonce] = React.useState(0)
  React.useEffect(() => {
    if (!fn) {
      setResult(null)
      return
    }
    let alive = true
    setResult(null)
    fn()
      .then((r) => alive && setResult(r))
      .catch((e: unknown) => alive && setResult({ kind: 'error', message: e instanceof Error ? e.message : 'Request failed.' }))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])
  return { result, retry: () => setNonce((n) => n + 1), setResult }
}
