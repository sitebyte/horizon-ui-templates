# Round 3: Build Plan — Three Views of the EOS Landscape

**Orchestrated by:** Tony Stark
**Date:** 4 May 2026

---

## The Decision

Build all three views in a single page with tab switching. The topology data is defined once and rendered three ways. This demonstrates the system's flexibility while giving support users the right tool for each task.

## Implementation Plan

### Phase 1: Data Layer
Define the topology data structure in JS — nodes (with positions, types, sizes), flows (with labels, directions), and annotations. This is shared across all three views.

### Phase 2: View A — "The Map" (primary view)
**This is the faithful recreation of the drawio diagram.** Priority one.

Layout approach: CSS positioning with percentage-based coordinates (scalable, no px). Each node type has distinct visual treatment:

| Type | Shape | Size | Visual |
|------|-------|------|--------|
| External (DQ Prices, ICE, etc.) | Rounded pill, dashed border | Medium | Cloud-like, soft glow |
| Pipeline (KTP, Shovel) | Small circle | Small | Subtle, connecting dots |
| Glint Module | Compact rectangle | Small-Medium | Solid border, container feel |
| RabbitMQ | Hexagon or distinctive shape | Large | Orange glow, central hub |
| EOS | Large rounded rectangle | XL (dominant) | Indigo/violet gradient glow |
| Destination (Pioneer, etc.) | Rounded rectangle | Medium | Distinct color per system |
| Output (AX Cloud, SAP) | Icon + label | Small | File/document feel |

Flow lines: SVG paths with **text labels along the path** using `<textPath>`. Animated dashes show direction. Line thickness proportional to message volume.

Annotations: Absolutely positioned text near relevant nodes, italic, muted color, with a small connecting line to the relevant flow.

Click interactions:
- Click node → right panel slides in with details (status, recent messages, latency, config)
- Click flow → highlights entire path, shows messages on that route
- Click annotation → expands with more context

### Phase 3: View B — "The Flow Tracer"
Search by correlation ID. The map dims, the traced path lights up, an animated particle travels the route.

### Phase 4: View C — "The Dashboard"  
Simplified topology with live numbers overlaid. Messages/hr, latency, error rate per node.

### File Structure
Single file: `support-environments.html` (rewritten)
- Tab bar: Map | Flow Tracer | Dashboard
- Shared topology data
- Three render functions
- Message explorer below (kept from v26/v27)

### Key CSS Techniques

**Labeled flow lines (SVG textPath):**
```html
<svg>
  <defs>
    <path id="flow-price" d="M 80,100 C 200,100 300,250 450,250" />
  </defs>
  <use href="#flow-price" stroke="var(--accent)" stroke-dasharray="6 3" />
  <text>
    <textPath href="#flow-price" startOffset="50%" text-anchor="middle"
      fill="var(--text-muted)" font-size="0.5rem">
      Price Ingress
    </textPath>
  </text>
</svg>
```

**Distinct node shapes (CSS):**
```css
.topo-node[data-type="external"] { border-radius: 2rem; border-style: dashed; }
.topo-node[data-type="glint"] { border-radius: var(--radius-sm); }
.topo-node[data-type="core"] { border-radius: var(--radius-xl); min-width: 12rem; min-height: 8rem; }
.topo-node[data-type="broker"] { clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%); }
```

**Annotations:**
```css
.topo-annotation {
  position: absolute;
  font-size: 0.5rem;
  font-style: italic;
  color: var(--text-muted);
  max-width: 10rem;
  pointer-events: auto;
  cursor: help;
}
```

**Animated particle (for flow tracer):**
```css
.trace-particle {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0.5rem var(--accent), 0 0 1rem rgba(79,70,229,0.5);
  position: absolute;
  offset-path: path('...');
  animation: traceFlow 3s ease forwards;
}
```

## Success Criteria

1. A support user opens the page and in 5 seconds understands the EOS landscape — without reading documentation
2. They can identify which system is unhealthy by color alone
3. They can trace a message by typing a correlation ID and watching it travel
4. The labeled flow lines read as sentences: "Price Ingress", "Trade/Recap data put into Pioneer"
5. EOS dominates the centre, RabbitMQ is the visible hub, everything else orbits

## What Tony Would Say

"JARVIS, show me the building."

That's what this should feel like. Open the page, see the whole system at a glance. Say "show me trade T-1001" and watch the message trace light up through the architecture. Every node, every flow, every label tells a story.

The current v28 is a grid of rectangles. The drawio is a story. v29 should be a LIVING story.
