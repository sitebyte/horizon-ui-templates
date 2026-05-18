import { useState, useCallback } from 'react'

/**
 * Persist state to localStorage with a typed React hook.
 * Falls back to `initial` when localStorage is empty or unreadable.
 */
export function useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw !== null ? JSON.parse(raw) : initial
    } catch {
      return initial
    }
  })

  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      setValue(prev => {
        const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v
        try { localStorage.setItem(key, JSON.stringify(next)) } catch { /* quota */ }
        return next
      })
    },
    [key],
  )

  return [value, set]
}
