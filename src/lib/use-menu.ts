import * as React from 'react'
import { listMenuItems } from '@/lib/data/source'
import type { DataResult, MenuItem } from '@/lib/data/types'
import { PREVIEW_MENU } from '@/lib/preview/fixtures'
import { useAppState } from '@/lib/app-state'

export type MenuState =
  | { kind: 'loading' }
  | { kind: 'ok'; items: MenuItem[] }
  | { kind: 'not-connected'; previewItems: MenuItem[] | null }
  | { kind: 'error'; message: string }

export function useMenu() {
  const { preview } = useAppState()
  const [result, setResult] = React.useState<DataResult<MenuItem[]> | null>(null)
  const [nonce, setNonce] = React.useState(0)

  React.useEffect(() => {
    let alive = true
    setResult(null)
    listMenuItems()
      .then((r) => alive && setResult(r))
      .catch((e: unknown) => alive && setResult({ kind: 'error', message: e instanceof Error ? e.message : 'Could not load the menu.' }))
    return () => {
      alive = false
    }
  }, [nonce])

  let state: MenuState
  if (!result) state = { kind: 'loading' }
  else if (result.kind === 'ok') state = { kind: 'ok', items: result.data }
  else if (result.kind === 'error') state = { kind: 'error', message: result.message }
  else state = { kind: 'not-connected', previewItems: preview ? PREVIEW_MENU : null }

  return { state, retry: () => setNonce((n) => n + 1) }
}

/** Items to display: real items when connected, preview placeholders when enabled. */
export function visibleItems(state: MenuState): { items: MenuItem[]; isPreview: boolean } {
  if (state.kind === 'ok') return { items: state.items, isPreview: false }
  if (state.kind === 'not-connected' && state.previewItems) return { items: state.previewItems, isPreview: true }
  return { items: [], isPreview: false }
}
