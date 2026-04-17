# Vision: Frontend Craft for Accuracy-First LNG Trading

**Author:** Senior Front-End Engineer (9 yrs trading UIs, ex-Citadel)
**Date:** 2026-04-11
**Scope:** Technical implementation patterns for building accuracy into every layer of the Horizon frontend -- from input masking through calculation transparency to the test harness that proves it all works.

---

## Thesis

The #1 cause of P&L-affecting bugs in trading systems is not the algorithm. It is the **interface between human intention and system state**. A trader types "3200000" meaning 3.2 million MMBtu. The system stores "3200000" as a string. The frontend multiplies it by a price that arrived as a `number | null`. Something rounds. Something truncates. Something displays "NaN" for 4 seconds before the next render fixes it. Nobody notices until month-end reconciliation surfaces a $180K discrepancy.

Accuracy is not a feature you add. It is a property of every line of code. Here is how to build it into Horizon.

---

## 1. The Number Problem -- And How to Solve It

### 1.1 Current State

The Horizon backend uses Python `Decimal` throughout (`quantity_mmbtu: Decimal`, `average_price: Decimal`, `slope: Decimal`). This is correct. But the API serializes these as strings in some places and numbers in others:

```typescript
// From api.ts -- inconsistent numeric representation
export interface HedgePosition {
  physical_long_mmbtu: string    // String-typed
  net_total_mmbtu: string        // String-typed
  hedge_ratio: string            // String-typed
}

export interface PositionData {
  volume_mmbtu: number           // Number-typed
  average_price: number          // Number-typed
  current_price: number | null   // Nullable number
}
```

The frontend currently handles this with ad-hoc `Number()` coercion scattered across components:

```typescript
// From PositionsView.tsx
{portfolio ? formatVolume(Number(portfolio.net_position_mmbtu)) : '-'}
{portfolio ? formatCurrency(Number(portfolio.total_long_value)) : '-'}
```

This works until someone changes the backend serialization or a field arrives as `""` instead of `"0"`.

### 1.2 The Solution: A Defensive Numeric Layer

Create a single numeric coercion module that every component uses. Never call `Number()` or `parseFloat()` directly in render code.

```typescript
// lib/numbers.ts -- the ONLY place raw values become numbers

/**
 * Safely coerce any API value to a number.
 * Returns null for genuinely absent values (null, undefined, "").
 * Returns 0 for explicit zeroes ("0", 0, "0.00").
 * Never returns NaN -- if parsing fails, returns null.
 */
export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number') return Number.isNaN(value) ? null : value
  if (typeof value === 'string') {
    // Strip commas (user-formatted input) but preserve sign and decimal
    const cleaned = value.replace(/,/g, '').trim()
    if (cleaned === '' || cleaned === '-') return null
    const parsed = Number(cleaned)
    return Number.isNaN(parsed) ? null : parsed
  }
  return null
}

/**
 * Like toNumber but returns 0 instead of null for missing values.
 * Use this for arithmetic -- never for display.
 */
export function toNumberOrZero(value: unknown): number {
  return toNumber(value) ?? 0
}
```

Why this matters: every `Number()` call in the current codebase is a potential NaN. `Number("")` returns 0, `Number(undefined)` returns NaN, `Number("12,345.67")` returns NaN. The defensive layer handles all of these.

### 1.3 Formatting Layer

The current `formatCurrency` in `lib/utils.ts` is a good start but incomplete. It does not handle null, string-typed inputs, or the different precision requirements across the domain (prices need 2-4 decimals, volumes need 0, ratios need 1-2).

```typescript
// lib/formatters.ts -- domain-aware formatting

import { toNumber } from './numbers'

interface FormatOptions {
  nullText?: string       // What to show for null/undefined (default: '-')
  compact?: boolean       // Use K/M/B suffixes
  sign?: boolean          // Force +/- prefix
  minDecimals?: number
  maxDecimals?: number
}

/**
 * Format a price ($/MMBtu). Commodity prices: 2-4 decimal places.
 * Input can be number, string, null, undefined -- anything the API sends.
 */
export function formatPrice(
  value: unknown,
  opts: FormatOptions = {}
): string {
  const n = toNumber(value)
  if (n === null) return opts.nullText ?? '-'
  
  const { minDecimals = 2, maxDecimals = 4 } = opts
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  }).format(n)
  
  return opts.sign && n > 0 ? `+${formatted}` : formatted
}

/**
 * Format a volume in MMBtu. Always integer display, compact optional.
 * 3200000 -> "3,200,000" or "3.20M"
 */
export function formatVolume(
  value: unknown,
  opts: FormatOptions = {}
): string {
  const n = toNumber(value)
  if (n === null) return opts.nullText ?? '-'
  
  if (opts.compact) {
    const abs = Math.abs(n)
    if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
    if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
    if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  }
  
  const prefix = opts.sign && n > 0 ? '+' : ''
  return prefix + n.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

/**
 * Format a percentage (hedge ratio, utilization, tolerance).
 * "87.5" -> "87.5%", null -> "-"
 */
export function formatPercent(
  value: unknown,
  opts: FormatOptions = {}
): string {
  const n = toNumber(value)
  if (n === null) return opts.nullText ?? '-'
  const { maxDecimals = 1 } = opts
  return `${n.toFixed(maxDecimals)}%`
}

/**
 * Format P&L with color-aware sign.
 * Returns { text, colorClass } so the component can apply styling.
 */
export function formatPnL(value: unknown, compact = false): {
  text: string
  colorClass: string
} {
  const n = toNumber(value)
  if (n === null) return { text: '-', colorClass: 'text-muted-foreground' }
  
  const text = formatPrice(n, { compact, sign: true })
  const colorClass = n >= 0
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400'
  
  return { text, colorClass }
}
```

The key principle: **formatters accept `unknown`, not `number`**. The API contract is untrustworthy at the type level. Every formatter must be its own safety net.

---

## 2. Input Masking and Live Formatting

### 2.1 The Problem With `<input type="number">`

The current `TradeForm.tsx` uses `type="number"` for volume and price inputs:

```tsx
<input
  type="number"
  value={volumeMmbtu}
  onChange={(e) => setVolumeMmbtu(e.target.value)}
  placeholder="3200000"
/>
```

Problems:
1. No comma formatting as-you-type. A trader entering 3,200,000 has to type "3200000" and count zeros.
2. Browser-native number inputs have invisible spinner buttons that accidentally change values on scroll.
3. `type="number"` silently discards non-numeric input, making it impossible to show validation errors for partial input like "12.4.5".
4. Copy-paste from Excel brings "3,200,000" which `type="number"` rejects silently.

### 2.2 Masked Numeric Input Component

```typescript
// components/ui/NumericInput.tsx

import { useState, useRef, useCallback, useEffect } from 'react'
import { toNumber } from '@/lib/numbers'

interface NumericInputProps {
  value: string                    // Raw value (e.g., "3200000")
  onChange: (raw: string) => void  // Called with clean numeric string
  format?: 'integer' | 'decimal'  // Formatting mode
  decimals?: number                // Max decimal places (default: 2)
  min?: number                     // Minimum value (validated on blur)
  max?: number                     // Maximum value (validated on blur)
  unit?: string                    // Suffix label (e.g., "MMBtu", "$/MMBtu")
  placeholder?: string
  error?: string                   // External error message
  className?: string
  disabled?: boolean
  onBlurValidate?: (value: number | null) => string | null
}

export function NumericInput({
  value,
  onChange,
  format = 'decimal',
  decimals = 2,
  min,
  max,
  unit,
  placeholder,
  error,
  className,
  disabled,
  onBlurValidate,
}: NumericInputProps) {
  // Display value is formatted; raw value is clean
  const [displayValue, setDisplayValue] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync external value -> display
  useEffect(() => {
    const n = toNumber(value)
    if (n === null) {
      setDisplayValue('')
    } else if (format === 'integer') {
      setDisplayValue(Math.round(n).toLocaleString('en-US'))
    } else {
      setDisplayValue(n.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
      }))
    }
  }, [value, format, decimals])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    // Allow typing: digits, commas, decimal point, minus sign
    const cleaned = raw.replace(/[^0-9.,-]/g, '')
    setDisplayValue(cleaned)

    // Extract numeric value for the parent
    const numericString = cleaned.replace(/,/g, '')
    const parsed = toNumber(numericString)
    if (parsed !== null || numericString === '' || numericString === '-') {
      onChange(numericString)
      setLocalError(null)
    }
  }, [onChange])

  const handleBlur = useCallback(() => {
    const n = toNumber(value)
    
    // Range validation
    if (n !== null) {
      if (min !== undefined && n < min) {
        setLocalError(`Minimum: ${min.toLocaleString()}`)
        return
      }
      if (max !== undefined && n > max) {
        setLocalError(`Maximum: ${max.toLocaleString()}`)
        return
      }
    }
    
    // Custom validation
    if (onBlurValidate) {
      const err = onBlurValidate(n)
      setLocalError(err)
    }

    // Re-format on blur
    if (n !== null) {
      if (format === 'integer') {
        setDisplayValue(Math.round(n).toLocaleString('en-US'))
      } else {
        setDisplayValue(n.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: decimals,
        }))
      }
    }
  }, [value, min, max, format, decimals, onBlurValidate])

  const effectiveError = error || localError

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"              // NOT type="number"
        inputMode="decimal"      // Mobile: show numeric keyboard
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-sm font-mono rounded-md border bg-background
          tabular-nums
          ${effectiveError ? 'border-red-500 focus:ring-red-500' : ''}
          ${unit ? 'pr-16' : ''}
          ${className ?? ''}
        `}
      />
      {unit && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {unit}
        </span>
      )}
      {effectiveError && (
        <p className="text-xs text-red-500 mt-1">{effectiveError}</p>
      )}
    </div>
  )
}
```

Usage in the trade form:

```tsx
<NumericInput
  value={volumeMmbtu}
  onChange={setVolumeMmbtu}
  format="integer"
  min={100000}
  max={10000000}
  unit="MMBtu"
  placeholder="3,200,000"
  onBlurValidate={(v) => {
    if (v !== null && v % 100000 !== 0) {
      return 'Volume should be in lots of 100,000 MMBtu'
    }
    return null
  }}
/>
```

Key properties:
- `type="text"` with `inputMode="decimal"` -- gets the numeric keyboard on mobile without the browser number input quirks.
- Commas appear as-you-type but the parent receives a clean string.
- Range validation on blur, not on every keystroke.
- `tabular-nums` CSS ensures digits stay aligned in columns.

---

## 3. Schema-Driven Validation (Zod Mirroring Pydantic)

### 3.1 The Principle

The backend has authoritative validation in Pydantic models. The frontend should mirror these rules exactly, so the user gets instant feedback without a round-trip. When the schemas drift apart, a test catches it.

### 3.2 Trade Entry Schema

```typescript
// schemas/trade.ts
import { z } from 'zod'

// Mirror of backend PricingBasis enum
const PricingBasis = z.enum(['fixed', 'hub_indexed', 'oil_indexed', 'hybrid'])

// Mirror of backend DeliveryTerms enum
const DeliveryTerms = z.enum(['fob', 'des', 'dap'])

// Mirror of backend Benchmark options
const Benchmark = z.enum(['JKM', 'TTF', 'HH', 'BRENT', 'NBP', 'JCC'])

const PricingSchema = z.discriminatedUnion('basis', [
  z.object({
    basis: z.literal('fixed'),
    constant: z.string().refine(v => {
      const n = Number(v)
      return !isNaN(n) && n > 0 && n < 200
    }, 'Price must be between $0.01 and $200.00/MMBtu'),
  }),
  z.object({
    basis: z.literal('hub_indexed'),
    benchmark: Benchmark,
    constant: z.string().refine(v => {
      const n = Number(v)
      return !isNaN(n) && Math.abs(n) < 50
    }, 'Premium must be between -$50 and +$50/MMBtu'),
  }),
  z.object({
    basis: z.literal('oil_indexed'),
    slope: z.string().refine(v => {
      const n = Number(v)
      return !isNaN(n) && n > 0 && n < 100
    }, 'Slope must be between 0% and 100% of oil index'),
    constant: z.string().optional(),
  }),
  z.object({
    basis: z.literal('hybrid'),
    benchmark: Benchmark,
    slope: z.string().refine(v => {
      const n = Number(v)
      return !isNaN(n) && n > 0 && n < 100
    }, 'Slope must be between 0% and 100%'),
    constant: z.string().optional(),
  }),
])

export const TradeFormSchema = z.object({
  reference: z.string().min(1, 'Reference is required').max(50),
  counterparty_id: z.string().uuid('Select a valid counterparty'),
  contract_id: z.string().uuid().optional().or(z.literal('')),
  direction: z.enum(['buy', 'sell']),
  pricing: PricingSchema,
  volume: z.object({
    quantity_mmbtu: z.string()
      .refine(v => {
        const n = Number(v.replace(/,/g, ''))
        return !isNaN(n) && n >= 100000
      }, 'Minimum volume: 100,000 MMBtu')
      .refine(v => {
        const n = Number(v.replace(/,/g, ''))
        return !isNaN(n) && n <= 10000000
      }, 'Maximum volume: 10,000,000 MMBtu'),
    tolerance_percent: z.string()
      .refine(v => {
        const n = Number(v)
        return !isNaN(n) && n >= 0 && n <= 20
      }, 'Tolerance must be 0-20%')
      .default('5'),
  }),
  delivery_terms: DeliveryTerms,
  delivery_window: z.object({
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    load_port: z.string().min(1, 'Load port is required'),
    discharge_port: z.string().min(1, 'Discharge port is required'),
  }).refine(
    data => {
      if (!data.start_date || !data.end_date) return true
      return new Date(data.end_date) >= new Date(data.start_date)
    },
    { message: 'End date must be on or after start date', path: ['end_date'] }
  ),
})

export type TradeFormData = z.infer<typeof TradeFormSchema>
```

### 3.3 Real-Time Field-Level Validation

Validate on blur for individual fields, validate the whole form on submit. Show errors immediately where possible but do not block typing.

```typescript
// hooks/useFormValidation.ts
import { useState, useCallback } from 'react'
import { z } from 'zod'

export function useFormValidation<T extends z.ZodType>(schema: T) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateField = useCallback((
    fieldPath: string,
    value: unknown
  ) => {
    // Extract the sub-schema for this field and validate just that
    try {
      // For nested paths like "volume.quantity_mmbtu", walk the schema
      const parts = fieldPath.split('.')
      let subSchema: z.ZodType = schema
      for (const part of parts) {
        if (subSchema instanceof z.ZodObject) {
          subSchema = subSchema.shape[part]
        }
      }
      if (subSchema) {
        subSchema.parse(value)
        setErrors(prev => {
          const next = { ...prev }
          delete next[fieldPath]
          return next
        })
      }
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [fieldPath]: e.errors[0]?.message ?? 'Invalid value',
        }))
      }
    }
  }, [schema])

  const validateAll = useCallback((data: unknown): data is z.infer<T> => {
    const result = schema.safeParse(data)
    if (result.success) {
      setErrors({})
      return true
    }
    const newErrors: Record<string, string> = {}
    for (const issue of result.error.issues) {
      const path = issue.path.join('.')
      newErrors[path] = issue.message
    }
    setErrors(newErrors)
    return false
  }, [schema])

  const clearErrors = useCallback(() => setErrors({}), [])

  return { errors, validateField, validateAll, clearErrors }
}
```

---

## 4. Idempotent Submissions and Double-Submit Prevention

### 4.1 The Problem

The current `TradeForm.tsx` disables the submit button during `isPending`, which is necessary but not sufficient. The real risk vectors are:
1. Network retry: the browser retries a POST on timeout, creating a duplicate trade.
2. Back-button resubmit: the user navigates away and back, browser replays the POST.
3. Keyboard double-tap: the user hits Enter twice before the button disables.

### 4.2 Client-Side Idempotency Key

```typescript
// hooks/useIdempotentMutation.ts
import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query'
import { useRef, useCallback } from 'react'

/**
 * Wraps useMutation to:
 * 1. Generate an idempotency key per submission attempt
 * 2. Prevent duplicate in-flight requests
 * 3. Send X-Idempotency-Key header so the backend can deduplicate
 */
export function useIdempotentMutation<TData, TVariables>(
  mutationFn: (vars: TVariables, idempotencyKey: string) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
) {
  const lastKeyRef = useRef<string | null>(null)
  const inFlightRef = useRef(false)

  const wrappedFn = useCallback(async (vars: TVariables) => {
    if (inFlightRef.current) {
      throw new Error('Submission already in progress')
    }
    inFlightRef.current = true
    
    // Generate a unique key for this submission
    const key = crypto.randomUUID()
    lastKeyRef.current = key
    
    try {
      return await mutationFn(vars, key)
    } finally {
      inFlightRef.current = false
    }
  }, [mutationFn])

  return useMutation({
    mutationFn: wrappedFn,
    ...options,
  })
}
```

The backend receives the `X-Idempotency-Key` header and deduplicates -- if it sees the same key twice within a TTL window, it returns the cached response from the first request rather than creating a second trade.

### 4.3 Integration With the Trade Form

```typescript
const createTrade = useIdempotentMutation(
  async (payload: CreateTradeRequest, idempotencyKey: string) => {
    return fetchApi<Trade>('/trades/', {
      method: 'POST',
      headers: { 'X-Idempotency-Key': idempotencyKey },
      body: JSON.stringify(payload),
    })
  },
  {
    onSuccess: (trade) => {
      queryClient.invalidateQueries({ queryKey: ['trades'] })
      queryClient.invalidateQueries({ queryKey: ['positions'] })
      showToast(`Trade ${trade.reference} created`)
      onSuccess?.()
    },
  }
)
```

---

## 5. State Machines in the UI

### 5.1 Current State

The backend defines explicit state machines:

```python
# From trade/models.py
VALID_TRADE_TRANSITIONS: dict[TradeStatus, set[TradeStatus]] = {
    TradeStatus.DRAFT: {TradeStatus.PENDING_APPROVAL, TradeStatus.CANCELLED},
    TradeStatus.PENDING_APPROVAL: {TradeStatus.APPROVED, TradeStatus.DRAFT, TradeStatus.CANCELLED},
    TradeStatus.APPROVED: {TradeStatus.EXECUTED, TradeStatus.CANCELLED},
    ...
}
```

But the frontend does not enforce these. A button could fire `updateStatus('settled')` on a `DRAFT` trade. The API would reject it, but the user would see a cryptic error.

### 5.2 Frontend State Machine Mirror

```typescript
// domain/trade-states.ts

export const TRADE_STATUS = [
  'draft', 'pending_approval', 'approved', 'executed',
  'in_transit', 'delivered', 'settled', 'cancelled',
] as const

export type TradeStatus = typeof TRADE_STATUS[number]

const TRANSITIONS: Record<TradeStatus, readonly TradeStatus[]> = {
  draft:              ['pending_approval', 'cancelled'],
  pending_approval:   ['approved', 'draft', 'cancelled'],
  approved:           ['executed', 'cancelled'],
  executed:           ['in_transit', 'delivered', 'cancelled'],
  in_transit:         ['delivered'],
  delivered:          ['settled'],
  settled:            [],
  cancelled:          [],
}

/**
 * Get the valid next states for a trade.
 * Returns empty array for terminal states.
 */
export function getValidTransitions(current: TradeStatus): TradeStatus[] {
  return [...(TRANSITIONS[current] ?? [])]
}

/**
 * Human-readable labels and colors for status actions.
 */
export const STATUS_ACTIONS: Record<TradeStatus, {
  label: string
  variant: 'default' | 'success' | 'warning' | 'danger'
}> = {
  draft:            { label: 'Draft',         variant: 'default' },
  pending_approval: { label: 'Submit',        variant: 'warning' },
  approved:         { label: 'Approve',       variant: 'success' },
  executed:         { label: 'Execute',       variant: 'success' },
  in_transit:       { label: 'Mark In Transit', variant: 'default' },
  delivered:        { label: 'Mark Delivered', variant: 'default' },
  settled:          { label: 'Settle',        variant: 'success' },
  cancelled:        { label: 'Cancel',        variant: 'danger' },
}
```

In the UI, the trade detail view renders action buttons dynamically:

```tsx
function TradeActions({ trade }: { trade: Trade }) {
  const nextStates = getValidTransitions(trade.status as TradeStatus)
  const updateStatus = useUpdateTradeStatus()

  if (nextStates.length === 0) return null

  return (
    <div className="flex gap-2">
      {nextStates.map(status => {
        const action = STATUS_ACTIONS[status]
        return (
          <button
            key={status}
            onClick={() => updateStatus.mutate({ id: trade.id, status })}
            disabled={updateStatus.isPending}
            className={buttonVariants({ variant: action.variant })}
          >
            {action.label}
          </button>
        )
      })}
    </div>
  )
}
```

The user literally cannot see a button that would trigger an invalid transition. The invariant is enforced by the rendering logic, not by validation after the fact.

---

## 6. Optimistic Updates With Rollback

### 6.1 When to Use Optimistic Updates

Use them for **status transitions** and **value edits** where the user expects instant feedback. Do NOT use them for **trade creation** (too much can go wrong -- credit check, duplicate reference, validation failure).

### 6.2 Pattern: Trade Status Change

```typescript
// hooks/useTradeStatusUpdate.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tradesApi, type TradeSummary } from '@/lib/api'

export function useUpdateTradeStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      tradesApi.updateStatus(id, status),

    onMutate: async ({ id, status }) => {
      // Cancel in-flight fetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['trades'] })

      // Snapshot previous state for rollback
      const previousTrades = queryClient.getQueryData<TradeSummary[]>(['trades'])

      // Optimistically update
      queryClient.setQueryData<TradeSummary[]>(['trades'], old =>
        old?.map(t => t.id === id ? { ...t, status } : t) ?? []
      )

      return { previousTrades }
    },

    onError: (_err, _vars, context) => {
      // Rollback to snapshot
      if (context?.previousTrades) {
        queryClient.setQueryData(['trades'], context.previousTrades)
      }
    },

    onSettled: () => {
      // Refetch to ensure server state is canonical
      queryClient.invalidateQueries({ queryKey: ['trades'] })
      queryClient.invalidateQueries({ queryKey: ['positions'] })
    },
  })
}
```

The user sees the status change instantly. If the server rejects it (e.g., another user already changed the status), the UI snaps back to the correct state and shows a toast explaining what happened.

---

## 7. AG Grid Cell Validation

### 7.1 Inline Editing With Revert

For the position ladder and blotter, traders expect to click a cell and edit it. The edit should validate before committing.

```typescript
// AG Grid column definition with validation
{
  field: 'volume',
  headerName: 'Volume (MMBtu)',
  editable: true,
  valueSetter: (params: ValueSetterParams) => {
    const newValue = toNumber(params.newValue)
    
    // Validation gate
    if (newValue === null) {
      showToast('Volume must be a number', 'error')
      return false  // AG Grid reverts the cell
    }
    if (newValue < 0) {
      showToast('Volume cannot be negative', 'error')
      return false
    }
    if (newValue > 10_000_000) {
      showToast('Volume exceeds maximum (10M MMBtu)', 'error')
      return false
    }

    // Accept the edit
    params.data.volume = newValue
    return true
  },
  valueFormatter: (params: ValueFormatterParams) =>
    formatVolume(params.value, { compact: false }),
}
```

Returning `false` from `valueSetter` is AG Grid's built-in revert mechanism. The cell snaps back to its previous value and the user sees a toast explaining why the edit was rejected. No modal, no dialog -- just a non-intrusive notification.

### 7.2 Cell-Level Async Validation

For credit-sensitive edits (changing a trade's volume), validate against the credit service before committing:

```typescript
onCellValueChanged: async (event: CellValueChangedEvent) => {
  if (event.colDef.field === 'volume') {
    const tradeId = event.data.id
    const newVolume = event.newValue
    
    // Debounce this in production
    try {
      const creditCheck = await checkCreditImpact(tradeId, newVolume)
      if (creditCheck.is_breach) {
        // Revert the cell
        event.data.volume = event.oldValue
        event.api.refreshCells({ rowNodes: [event.node] })
        showToast(
          `Credit limit breach: ${creditCheck.counterparty_name} would be at ` +
          `${formatPercent(creditCheck.utilization_percent)} utilization`,
          'error'
        )
      }
    } catch {
      // On error, revert to be safe
      event.data.volume = event.oldValue
      event.api.refreshCells({ rowNodes: [event.node] })
      showToast('Credit check failed -- edit reverted', 'error')
    }
  }
}
```

---

## 8. WebSocket-Driven Live Position Impact

### 8.1 Current State

The existing `useWebSocket` hook invalidates TanStack Query caches when `price_updated` events arrive. This is correct for background updates. But during trade entry, the user needs to see the position impact preview update in real-time as market prices move.

### 8.2 Live Impact Preview

```typescript
// hooks/usePositionImpact.ts
import { useMemo } from 'react'
import { usePortfolioSummary } from './usePositions'
import { useLatestPrice } from './useMarketData'
import { toNumberOrZero } from '@/lib/numbers'

interface PositionImpact {
  currentPosition: number         // Current net position for this benchmark/month
  tradeImpact: number             // What this trade would add/subtract
  newPosition: number             // Post-trade position
  currentHedgeRatio: number       // Current hedge ratio
  newHedgeRatio: number           // Post-trade hedge ratio
  estimatedTradeValue: number     // Volume * price estimate
  creditImpact: number            // Notional exposure change
  priceAsOf: string | null        // When the price was last updated
}

export function usePositionImpact(
  direction: 'buy' | 'sell',
  volumeMmbtu: string,
  benchmark: string,
  deliveryMonth: string,
  premium: string,
): PositionImpact {
  const { data: portfolio } = usePortfolioSummary()
  const { data: latestPrice } = useLatestPrice(benchmark)

  return useMemo(() => {
    const vol = toNumberOrZero(volumeMmbtu)
    const signedVol = direction === 'buy' ? vol : -vol
    const price = latestPrice?.price ?? 0
    const prem = toNumberOrZero(premium)

    // Find current position for this benchmark/month
    const currentPos = portfolio?.positions?.find(
      p => p.benchmark === benchmark
        && p.delivery_month === deliveryMonth
    )
    const current = toNumberOrZero(currentPos?.volume_mmbtu) *
      (currentPos?.direction === 'long' ? 1 : -1)

    const newPos = current + signedVol
    const tradeValue = vol * (price + prem)

    return {
      currentPosition: current,
      tradeImpact: signedVol,
      newPosition: newPos,
      currentHedgeRatio: 0,  // Computed from hedge summary
      newHedgeRatio: 0,
      estimatedTradeValue: tradeValue,
      creditImpact: tradeValue,
      priceAsOf: latestPrice?.observed_at ?? null,
    }
  }, [direction, volumeMmbtu, benchmark, deliveryMonth, premium, portfolio, latestPrice])
}
```

Because `useLatestPrice` is backed by TanStack Query, and the WebSocket hook invalidates the `['price']` query key on `price_updated` events, the position impact preview updates automatically whenever a new price arrives -- no additional wiring needed.

The component renders a staleness indicator:

```tsx
{impact.priceAsOf && (
  <p className="text-[10px] text-muted-foreground">
    Price as of {formatDateTime(impact.priceAsOf)}
    {isPriceStale(impact.priceAsOf) && (
      <span className="text-amber-500 ml-1">(stale)</span>
    )}
  </p>
)}
```

---

## 9. Calculation Transparency

### 9.1 The Principle

A trader should never see a number without understanding how it was computed. Every derived value should be expandable to show its formula.

### 9.2 Implementation: Transparent Calculation Component

```tsx
// components/ui/TransparentCalc.tsx

interface CalcStep {
  label: string      // "Volume"
  value: string      // "3,200,000 MMBtu"
  raw?: number       // 3200000 (for copying)
}

interface TransparentCalcProps {
  label: string              // "Estimated Trade Value"
  result: string             // "$39,840,000"
  formula: string            // "Volume x (JKM + Premium)"
  steps: CalcStep[]          // Individual variables
  className?: string
}

export function TransparentCalc({
  label, result, formula, steps, className
}: TransparentCalcProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-muted-foreground hover:text-foreground"
          title="Show calculation"
        >
          <span className="font-mono font-semibold text-sm text-foreground">
            {result}
          </span>
          <svg
            className={`inline-block w-3 h-3 ml-1 transition-transform ${
              expanded ? 'rotate-180' : ''
            }`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>
      {expanded && (
        <div className="mt-2 p-2 rounded bg-muted/50 text-xs space-y-1">
          <p className="font-mono text-muted-foreground">{formula}</p>
          <div className="border-t pt-1 space-y-0.5">
            {steps.map((step, i) => (
              <div key={i} className="flex justify-between font-mono">
                <span className="text-muted-foreground">{step.label}</span>
                <span>{step.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

Usage in the position impact panel:

```tsx
<TransparentCalc
  label="Estimated Trade Value"
  result={formatPrice(impact.estimatedTradeValue, { compact: true })}
  formula="Volume x (Benchmark + Premium)"
  steps={[
    { label: 'Volume', value: formatVolume(volumeMmbtu) + ' MMBtu' },
    { label: `${benchmark} (spot)`, value: formatPrice(latestPrice?.price) },
    { label: 'Premium', value: formatPrice(premium) },
    { label: 'Effective Price', value: formatPrice((latestPrice?.price ?? 0) + toNumberOrZero(premium)) },
  ]}
/>
```

---

## 10. Defensive Rendering

### 10.1 The Rule

Every component that displays a number must be provably safe against: `null`, `undefined`, `NaN`, `""`, `"not a number"`, `Infinity`, and `"-0"`. The test for this is mechanical.

### 10.2 Safe Number Display Component

```tsx
// components/ui/Num.tsx -- the atomic unit of numeric display

import { toNumber } from '@/lib/numbers'
import { cn } from '@/lib/utils'

interface NumProps {
  value: unknown
  format: 'price' | 'volume' | 'percent' | 'ratio' | 'raw'
  compact?: boolean
  sign?: boolean
  colorize?: boolean      // Green for positive, red for negative
  nullText?: string
  className?: string
  decimals?: number
}

export function Num({
  value,
  format,
  compact,
  sign,
  colorize,
  nullText = '-',
  className,
  decimals,
}: NumProps) {
  const n = toNumber(value)

  if (n === null) {
    return (
      <span className={cn('text-muted-foreground', className)}>
        {nullText}
      </span>
    )
  }

  let text: string
  switch (format) {
    case 'price':
      text = formatPrice(n, { compact, sign, maxDecimals: decimals })
      break
    case 'volume':
      text = formatVolume(n, { compact, sign })
      break
    case 'percent':
      text = formatPercent(n, { maxDecimals: decimals ?? 1 })
      break
    case 'ratio':
      text = n.toFixed(decimals ?? 2)
      break
    case 'raw':
      text = n.toLocaleString('en-US')
      break
  }

  const color = colorize
    ? n >= 0
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400'
    : ''

  return (
    <span className={cn('font-mono tabular-nums', color, className)}>
      {text}
    </span>
  )
}
```

Every position table cell, every P&L display, every volume column -- all route through `<Num>`. If you grep the codebase and find a raw `${}` interpolation with `.toFixed()` or `.toLocaleString()`, that is a bug.

---

## 11. Unit Conversion Accuracy

### 11.1 The Problem

LNG volumes are expressed in MMBtu, cubic meters (m3), and metric tonnes (MT). The conversion factors depend on LNG composition (GCV/NCV, density), which varies by cargo. Using a fixed conversion factor introduces systematic error.

### 11.2 Domain-Aware Conversion Module

```typescript
// lib/unit-conversion.ts

/**
 * LNG unit conversion factors.
 * 
 * IMPORTANT: These are APPROXIMATE defaults. For invoicing and settlement,
 * always use the cargo-specific GCV from the custody transfer survey.
 */
export const LNG_DEFAULTS = {
  // 1 m3 LNG ~ 21.2 - 24.4 MMBtu depending on composition
  // Default: Qatar lean LNG
  mmbtuPerM3: 22.6,
  
  // 1 MT LNG ~ 48 - 53 MMBtu
  // Default: typical lean LNG
  mmbtuPerMT: 52.0,
  
  // 1 m3 LNG ~ 0.420 - 0.470 MT depending on temperature/pressure
  mtPerM3: 0.432,
} as const

interface ConversionContext {
  /** Gross Calorific Value in BTU/scf, if known from cargo survey */
  gcv_btu_scf?: number
  /** LNG density in kg/m3, if known from cargo survey */
  density_kg_m3?: number
}

export function mmbtuToM3(mmbtu: number, ctx?: ConversionContext): number {
  const factor = ctx?.gcv_btu_scf
    ? computeConversionFactor(ctx)
    : LNG_DEFAULTS.mmbtuPerM3
  return mmbtu / factor
}

export function m3ToMmbtu(m3: number, ctx?: ConversionContext): number {
  const factor = ctx?.gcv_btu_scf
    ? computeConversionFactor(ctx)
    : LNG_DEFAULTS.mmbtuPerM3
  return m3 * factor
}

export function mmbtuToMT(mmbtu: number, ctx?: ConversionContext): number {
  const factor = ctx?.gcv_btu_scf
    ? computeMTConversionFactor(ctx)
    : LNG_DEFAULTS.mmbtuPerMT
  return mmbtu / factor
}

/**
 * Show the conversion with explicit provenance.
 * Returns both the result AND an explanation of which factor was used.
 */
export function convertWithProvenance(
  value: number,
  from: 'mmbtu' | 'm3' | 'mt',
  to: 'mmbtu' | 'm3' | 'mt',
  ctx?: ConversionContext,
): {
  result: number
  factor: number
  source: 'cargo_survey' | 'default_lean_lng'
  warning?: string
} {
  const source = ctx?.gcv_btu_scf ? 'cargo_survey' : 'default_lean_lng'
  // ... conversion logic ...
  
  return {
    result,
    factor,
    source,
    warning: source === 'default_lean_lng'
      ? 'Using default conversion factor. Actual value depends on LNG composition.'
      : undefined,
  }
}
```

The `convertWithProvenance` function is the key to accuracy: every converted number carries metadata about which conversion factor was used and whether it is cargo-specific or a default estimate. The UI shows a warning icon when default factors are used.

---

## 12. Debounced Real-Time Validation

### 12.1 Credit Check While Typing

```typescript
// hooks/useDebouncedCreditCheck.ts

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { toNumber } from '@/lib/numbers'

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])
  return debounced
}

export function useDebouncedCreditCheck(
  counterpartyId: string | undefined,
  volumeMmbtu: string,
  priceMmbtu: string,
) {
  const vol = toNumber(volumeMmbtu) ?? 0
  const price = toNumber(priceMmbtu) ?? 0
  const notional = vol * price

  // Debounce: only fire the credit check 500ms after the user stops typing
  const debouncedNotional = useDebouncedValue(notional, 500)

  return useQuery({
    queryKey: ['credit-check', counterpartyId, debouncedNotional],
    queryFn: () => fetchApi<CreditCheckResult>(
      `/credit/check/${counterpartyId}?proposed_amount=${debouncedNotional}`
    ),
    enabled: !!counterpartyId && debouncedNotional > 0,
    staleTime: 10_000,  // Cache for 10 seconds
  })
}
```

In the trade form, show credit status inline:

```tsx
const { data: creditCheck, isLoading: creditLoading } = useDebouncedCreditCheck(
  counterpartyId,
  volumeMmbtu,
  effectivePrice,
)

// Render inline credit indicator
{creditCheck && (
  <div className={cn(
    'p-2 rounded text-xs',
    creditCheck.is_breach ? 'bg-red-50 text-red-700 border border-red-200' :
    creditCheck.requires_approval ? 'bg-amber-50 text-amber-700 border border-amber-200' :
    'bg-green-50 text-green-700 border border-green-200'
  )}>
    {creditCheck.is_breach && 'Credit limit breach -- trade requires override'}
    {creditCheck.requires_approval && `Credit at ${formatPercent(creditCheck.utilization_percent)} -- requires approval`}
    {!creditCheck.is_breach && !creditCheck.requires_approval && (
      `Headroom: ${formatPrice(creditCheck.available_headroom_usd, { compact: true })}`
    )}
  </div>
)}
```

---

## 13. Audit-First Architecture

### 13.1 Frontend Action Logging

Every user action that mutates state should emit an event. Not just for compliance -- for debugging. When a trader says "I didn't change that volume," you need evidence.

```typescript
// lib/audit.ts

interface AuditEvent {
  timestamp: string
  action: string
  entity_type: string
  entity_id?: string
  field?: string
  old_value?: unknown
  new_value?: unknown
  metadata?: Record<string, unknown>
}

const auditBuffer: AuditEvent[] = []
const FLUSH_INTERVAL = 5000  // Flush every 5 seconds
const MAX_BUFFER = 50

export function emitAudit(event: Omit<AuditEvent, 'timestamp'>) {
  auditBuffer.push({
    ...event,
    timestamp: new Date().toISOString(),
  })
  
  if (auditBuffer.length >= MAX_BUFFER) {
    flushAudit()
  }
}

async function flushAudit() {
  if (auditBuffer.length === 0) return
  const events = auditBuffer.splice(0)
  
  try {
    await fetch('/api/audit/frontend-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
    })
  } catch {
    // On failure, put events back (with cap to prevent memory growth)
    auditBuffer.unshift(...events.slice(-MAX_BUFFER))
  }
}

// Start periodic flush
setInterval(flushAudit, FLUSH_INTERVAL)

// Flush on page unload
window.addEventListener('beforeunload', () => {
  if (auditBuffer.length > 0) {
    // Use sendBeacon for reliability during unload
    navigator.sendBeacon(
      '/api/audit/frontend-events',
      JSON.stringify({ events: auditBuffer })
    )
  }
})
```

Usage in components:

```typescript
const updateStatus = useUpdateTradeStatus({
  onMutate: ({ id, status }) => {
    emitAudit({
      action: 'status_change',
      entity_type: 'trade',
      entity_id: id,
      old_value: currentStatus,
      new_value: status,
    })
  },
})
```

---

## 14. Testing for Accuracy

### 14.1 The Specific Tests That Catch Accuracy Bugs

**Category 1: Numeric coercion boundary tests**

```typescript
// __tests__/numbers.test.ts
import { toNumber, toNumberOrZero } from '../lib/numbers'

describe('toNumber', () => {
  // API sends numbers as strings
  it('parses string integers', () => expect(toNumber("3200000")).toBe(3200000))
  it('parses string decimals', () => expect(toNumber("12.45")).toBe(12.45))
  it('parses negative strings', () => expect(toNumber("-1500000")).toBe(-1500000))
  
  // API sends numbers as numbers
  it('passes through numbers', () => expect(toNumber(12.45)).toBe(12.45))
  it('passes through zero', () => expect(toNumber(0)).toBe(0))
  
  // User pastes from Excel with commas
  it('strips commas', () => expect(toNumber("3,200,000")).toBe(3200000))
  it('strips commas with decimals', () => expect(toNumber("3,200,000.50")).toBe(3200000.5))
  
  // Edge cases that have caused production bugs
  it('returns null for empty string', () => expect(toNumber("")).toBeNull())
  it('returns null for null', () => expect(toNumber(null)).toBeNull())
  it('returns null for undefined', () => expect(toNumber(undefined)).toBeNull())
  it('returns null for NaN', () => expect(toNumber(NaN)).toBeNull())
  it('returns null for non-numeric string', () => expect(toNumber("N/A")).toBeNull())
  it('returns null for Infinity', () => expect(toNumber(Infinity)).toBeNull())
  it('handles whitespace', () => expect(toNumber(" 12.45 ")).toBe(12.45))
  it('handles negative zero', () => expect(toNumber("-0")).toBe(0))
})
```

**Category 2: Rounding error tests**

```typescript
describe('formatPrice', () => {
  // IEEE 754 floating point: 0.1 + 0.2 !== 0.3
  it('handles floating point addition', () => {
    const premium = 0.1 + 0.2  // 0.30000000000000004
    expect(formatPrice(premium)).toBe('$0.30')
  })
  
  // Prices near zero
  it('formats sub-cent prices', () => {
    expect(formatPrice(0.001)).toBe('$0.001')
    expect(formatPrice(0.0001)).toBe('$0.0001')
  })
  
  // Large notional values
  it('formats billion-dollar values', () => {
    expect(formatPrice(1234567890.12, { compact: true })).toBe('$1.23B')
  })
})
```

**Category 3: Unit conversion round-trip tests**

```typescript
describe('unit conversions', () => {
  it('MMBtu -> m3 -> MMBtu round-trips within 0.01%', () => {
    const original = 3200000
    const m3 = mmbtuToM3(original)
    const backToMmbtu = m3ToMmbtu(m3)
    expect(Math.abs(backToMmbtu - original) / original).toBeLessThan(0.0001)
  })
  
  it('uses cargo-specific GCV when available', () => {
    const ctx = { gcv_btu_scf: 1100 }
    const resultWithCtx = mmbtuToM3(3200000, ctx)
    const resultDefault = mmbtuToM3(3200000)
    expect(resultWithCtx).not.toBe(resultDefault)
  })
  
  it('provides provenance for default conversions', () => {
    const { source, warning } = convertWithProvenance(3200000, 'mmbtu', 'm3')
    expect(source).toBe('default_lean_lng')
    expect(warning).toBeTruthy()
  })
})
```

**Category 4: State machine invariant tests**

```typescript
describe('trade state machine', () => {
  it('draft can only go to pending_approval or cancelled', () => {
    const valid = getValidTransitions('draft')
    expect(valid).toEqual(['pending_approval', 'cancelled'])
  })
  
  it('settled is a terminal state', () => {
    expect(getValidTransitions('settled')).toEqual([])
  })
  
  it('cannot skip from draft to executed', () => {
    const valid = getValidTransitions('draft')
    expect(valid).not.toContain('executed')
  })
  
  // This test fails if frontend and backend state machines diverge
  it('matches backend VALID_TRADE_TRANSITIONS', async () => {
    const backendTransitions = await fetch('/api/trades/state-machine')
      .then(r => r.json())
    
    for (const [status, validTargets] of Object.entries(TRANSITIONS)) {
      expect(validTargets.sort()).toEqual(
        backendTransitions[status].sort()
      )
    }
  })
})
```

**Category 5: Timezone tests**

```typescript
describe('date handling', () => {
  it('business dates are timezone-naive (no UTC conversion)', () => {
    // Backend sends "2026-06-15" meaning June 15 business date
    // Frontend must NOT convert to local timezone
    const businessDate = '2026-06-15'
    const displayed = formatDate(businessDate, true)
    expect(displayed).toContain('Jun')
    expect(displayed).toContain('15')
    // Must not shift to Jun 14 or Jun 16 regardless of local timezone
  })
  
  it('timestamps use UTC consistently', () => {
    const utcTimestamp = '2026-06-15T23:30:00Z'
    const formatted = formatDateTime(utcTimestamp)
    // Verify it shows the correct local time for the user
    expect(formatted).toBeTruthy()
    expect(formatted).not.toContain('undefined')
  })
})
```

**Category 6: Integration tests for the backend-frontend contract**

```typescript
describe('API contract', () => {
  it('PortfolioSummary numeric fields are parseable', async () => {
    const summary = await positionsApi.getSummary()
    
    // Every numeric field must be parseable by toNumber
    expect(toNumber(summary.net_position_mmbtu)).not.toBeNull()
    expect(toNumber(summary.total_long_mmbtu)).not.toBeNull()
    expect(toNumber(summary.total_unrealized_pnl)).not.toBeNull()
    
    // Every position must have parseable volume
    for (const pos of summary.positions) {
      expect(toNumber(pos.volume_mmbtu)).not.toBeNull()
      expect(toNumber(pos.average_price)).not.toBeNull()
      // current_price can be null (no market data), but not NaN
      if (pos.current_price !== null) {
        expect(toNumber(pos.current_price)).not.toBeNull()
      }
    }
  })
  
  it('HedgeSummary string-typed numbers are all parseable', async () => {
    const summary = await hedgesApi.getSummary()
    
    expect(toNumber(summary.total_physical_exposure_mmbtu)).not.toBeNull()
    expect(toNumber(summary.total_paper_exposure_mmbtu)).not.toBeNull()
    expect(toNumber(summary.overall_hedge_ratio)).not.toBeNull()
    
    for (const pos of summary.positions) {
      // All these come as strings from the API
      expect(toNumber(pos.physical_long_mmbtu)).not.toBeNull()
      expect(toNumber(pos.net_total_mmbtu)).not.toBeNull()
      expect(toNumber(pos.hedge_ratio)).not.toBeNull()
    }
  })
})
```

---

## 15. Library Choices

| Concern | Library | Why |
|---------|---------|-----|
| Form validation | `zod` | TypeScript-native, composable, discriminated unions for pricing types. Mirrors Pydantic's validation model. |
| Numeric input masking | Custom `NumericInput` component | Libraries like react-number-format add 15KB and don't handle LNG-specific validation (lot sizes, tolerance bands). Roll your own with `inputMode="decimal"`. |
| Grid | AG Grid Community (already in templates) | Only grid that handles 10K+ rows with inline editing, column pinning, and cell-level validation. `getRowId` + immutable updates are mandatory. |
| State management | TanStack Query (already in use) | Server state is the source of truth. No Redux/Zustand needed. Optimistic updates are built in. |
| WebSocket | Native WebSocket (already in use) | The existing `useWebSocket` hook is correct. Add message typing with discriminated unions for type safety. |
| Charts | Recharts (already in use) | Fine for forward curves and P&L. For the position ladder sparklines, consider raw SVG for performance. |
| Date handling | Native `Intl.DateTimeFormat` | Luxon/date-fns add bundle size. The `Intl` API handles timezone-aware formatting. Business dates should stay as strings. |
| Decimal arithmetic (if needed) | `decimal.js-light` (6KB) | Only if the frontend needs to do multi-step arithmetic (e.g., oil-indexed price formula preview). For display-only formatting, native `Number` with `toFixed()` is sufficient. |

---

## 16. Architecture Summary

```
User Input
    |
    v
NumericInput (masking, live formatting)
    |
    v
Zod Schema (field-level validation on blur, form-level on submit)
    |
    v
Debounced API Checks (credit limit, position limit, price sanity)
    |
    v
Idempotent Mutation (X-Idempotency-Key, double-submit prevention)
    |
    v
Optimistic Update (instant UI, rollback on server rejection)
    |
    v
WebSocket Event (server confirms, updates propagate to all views)
    |
    v
Defensive Rendering (formatters accept unknown, never show NaN)
    |
    v
Audit Buffer (every mutation logged, flushed to backend)
```

Every layer in this stack exists to prevent a specific class of accuracy bug:

| Layer | Prevents |
|-------|----------|
| NumericInput | Fat-finger errors, comma/decimal confusion, invisible scroll-wheel changes |
| Zod Schema | Invalid trades reaching the API, missing required fields |
| Debounced Checks | Credit breaches, position limit violations caught before submission |
| Idempotent Mutation | Duplicate trade creation from network retries or double-click |
| Optimistic Update | Stale UI after successful mutations, jarring loading states |
| WebSocket | Position displays showing stale prices, missing real-time updates |
| Defensive Rendering | NaN, undefined, or blank cells in position/P&L tables |
| Audit Buffer | "I didn't do that" disputes, regulatory reconstruction requirements |

---

## 17. What Matters Most

If you only do three things:

1. **Build `lib/numbers.ts` and `lib/formatters.ts`** and make every component use them. Grep the codebase for direct `Number()`, `.toFixed()`, `.toLocaleString()` calls and replace them. This alone will eliminate the most common class of frontend bug in trading systems.

2. **Mirror the backend state machines** in `domain/trade-states.ts` and `domain/invoice-states.ts`. Render only valid transitions as buttons. Add an integration test that compares the frontend transition map to the backend.

3. **Add the `NumericInput` component** with comma formatting, range validation, and `inputMode="decimal"`. Replace all `type="number"` inputs. A trader should never have to count zeros.

Everything else -- optimistic updates, audit logging, calculation transparency -- is important, but these three changes have the highest accuracy-per-effort ratio.
