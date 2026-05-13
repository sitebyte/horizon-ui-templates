# Evaluation 2 -- Visual & Component Gap Analysis

**Date:** 2026-05-13
**Auditor:** Senior Designer (Design Authority)
**Comparing:** v41 template screenshots vs EOS.Horizon TST2 screenshots

---

## 1. Alert Banding -- Close But Six Micro-Differences

EOS's AlertRow.tsx already implements full-width severity tinting. Very close to the template. Detailed comparison:

| Property | Template (v41) | EOS.Horizon | Fix needed |
|---|---|---|---|
| Background opacity | 15% (`--red-dim`) | 20% (`/20`) | Reduce to `/15` or use `--rag-*-dim` directly |
| Left border width | 2px (`0.125rem`) | 4px (`border-l-4`) | Reduce to `border-l-2` |
| Horizontal padding | 8px (`--sp-2`) | 12px (`px-3`) | Reduce to `px-2` |
| Vertical padding | 4px (`--sp-1`) | 6px (`py-1.5`) | Reduce to `py-1` |
| Border radius | 4px (`--radius-sm`) | None | Add `rounded-sm` |
| Row separation | margin-bottom gap (4px air) | border-bottom hairline | Switch to `mb-1` gaps, drop hairline |
| Title text color | Severity color (red/amber/blue) | Primary (white) | **Most impactful fix:** title should use severity tone |

**Most impactful gap:** Title text color. Template makes alert titles red/amber/blue directly -- the whole line screams severity. EOS keeps titles primary/white and only the small severity label is colored. This massively reduces urgency signal.

---

## 2. Row Density -- Exact Gap Per Component

### CheckRow (worst offender: +45%)
| Property | Template | EOS | Gap |
|---|---|---|---|
| Vertical padding | 3px top + 3px bottom (6px total) | 6px + 6px (12px total) | +6px per row |
| Measured row height | ~22px | ~32px | +10px per row |

Over 8 integrity-check rows, EOS needs 80px more vertical space -- roughly 1.5 rows of information lost from viewport.

### AlertRow (+25%)
| Property | Template | EOS | Gap |
|---|---|---|---|
| Vertical padding | 4px top + 4px bottom (8px total) | 6px + 6px (12px total) | +4px per row |

### KvGrid (minor)
| Property | Template | EOS | Gap |
|---|---|---|---|
| Vertical gap | 2px | 2px (sm) / 4px (md) | 0-2px |
| Font size | 7-8px (micro) | 10px | +2-3px effective |

### Summary: Density gap origin
Two root causes:
1. Tailwind `py-1.5` (6px each side) where template uses `0.125rem` to `0.1875rem` (2-3px each side)
2. EOS type scale runs 1px smaller per step -- but this is offset by larger padding, so net rows are bigger

---

## 3. StatusPill -- Architecture Is Superior

Template uses one `.hz-badge` class for everything. EOS implements a three-kind discriminated union (informational/severity/lifecycle) with two rendering modes (saturated/subtle).

**Assessment: NOT over-engineering.** The three-kind taxonomy is architecturally correct for production ETRM:
- `severity` (PASS/WARN/FAIL): high-signal, regulatory context
- `lifecycle` (APPROVED/REJECTED/POSTED): closed union with enforced tone derivation
- `informational` (filter chips, count badges): ambient hints

**Visual mismatch:** Template uses **subtle** pills (tinted bg + colored text) for integrity checks. EOS uses **saturated** pills (solid fill + white text) for severity. Template reads calmer; EOS reads louder.

**Recommendation:** Consider subtle for severity pills on the support dashboard to match v41's calmer visual. Keep saturated for lifecycle pills (settlements/trade workflow) where the pill IS the regulatory signal.

---

## 4. KPI Cell -- Container and Sizing Differences

| Property | Template (actual render) | EOS KpiCell | Gap |
|---|---|---|---|
| Container | Individual card per cell (with gaps) | Single strip, hairline dividers | EOS is cleaner -- **acknowledge as improvement** |
| Label font | 8px (0.5rem) | 10px (--text-xs) | +2px |
| Label color | `--text-muted` | `tertiary` | Minor |
| Value font | 14px (overridden in HTML) | 20px (--text-xl) | **+6px -- most visible** |
| Value weight | 700 | 600 | -100 weight units |

The KPI value being 20px vs 14px is the most visible single difference on the dashboard. Template KPIs are compact and informational; EOS KPIs are large and prominent.

---

## 5. Typography Weight -- Their Self-Assessment Is Inverted

They said: "template labels ~500 weight; ours ~600."
**Actual finding:** Template labels ARE 600. The gap is on **check-row body text:**
- Template `.check-label`: no weight override = 400 (normal)
- EOS CheckRow title: `weight={600}` = semibold

Check row labels should be readable body text (400-500), not bold labels (600). Section titles and severity pills should be 600.

---

## 6. What EOS Got Right (Acknowledge Explicitly)

1. **Token architecture** -- two-tier model (semantic shape + theme bindings) is exactly right
2. **RAG color values** -- byte-for-byte identical to v41
3. **Surface ramp** -- all 5 tiers perfect
4. **StatusPill three-kind taxonomy** -- architecturally superior to our single `.hz-badge`
5. **KpiCell discriminated union** -- proper typing and formatting per kind
6. **AlertRow link handling** -- automatic internal vs external routing
7. **CheckRow detail prop** -- structural support for expandable sub-detail (ready to wire)
8. **KvGrid density prop** -- practical `sm`/`md` variant we don't have
9. **STUB severity concept** -- correct operational choice for not-yet-implemented checks
10. **Light theme values** -- complete and correct (the bug is wiring, not values)
11. **Page composition** -- layout topology matches v41 accurately

---

## Visual Gaps Ranked by Impact

1. **Light mode non-functional** (integration bug, not CSS)
2. **Row density +25-45% too loose** (CheckRow worst at +45%)
3. **KPI value font 20px vs 14px** (different component feel)
4. **Alert title text not severity-colored** (reduced urgency)
5. **Alert border 4px vs 2px** (visually heavier)
6. **CheckRow label weight 600 vs 400** (reads as headers not body)
7. **Pill saturation** (loud vs quiet -- design judgment)
8. **Alert row separation** (card-with-gaps vs list-with-hairlines)
9. **Background opacity 20% vs 15%** (minor heaviness)
10. **Type scale cross-cutting 1px difference** (product concern, leave alone)
