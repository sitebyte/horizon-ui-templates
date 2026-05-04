# Round 1: How Films Present Data — Principles for EOS Topology

**Orchestrated by:** Tony Stark
**Date:** 4 May 2026

---

## What Films Get Right That Our v28 Gets Wrong

### The JARVIS Principle: Progressive Reveal
JARVIS doesn't show everything at once. Three concentric rings at different speeds — inner (system stats, slow), middle (data processing, medium), outer (critical alerts, fast). Information is LAYERED. You see the overview first, then drill into detail.

**Our v28 failure:** Everything is shown at the same level. A Glint module has the same visual weight as EOS itself. There's no hierarchy of importance.

### The Minority Report Principle: Spatial Narrative
Data is arranged in SPACE to tell a story. Tom Cruise doesn't read a list — he navigates a 3D space where position = meaning. Left = past, right = future. Near = relevant, far = context.

**Our v28 failure:** We have a 5-column grid but it doesn't tell a story. You can't FEEL the data flowing left to right. It's nodes in boxes, not a narrative.

### The Original Drawio Principle: Labeled Flows
The user's diagram works because every line has a LABEL: "Price Ingress", "Trade/Recap data put into Pioneer", "Settlements data flow", "Spanish gas trade data flow". These labels turn abstract lines into understandable stories.

**Our v28 failure:** We have animated lines but NO labels. A glowing line between two nodes tells you nothing. Is it price data? Trade captures? Settlements? You can't tell.

### The FUI Principle: Shape = Type
In film interfaces, every type of entity has a distinct visual shape. Shields are circles, threats are triangles, data is hexagons. You can identify what something IS before reading its label.

**Our v28 failure:** All nodes look the same — rectangles with different border colors. An external cloud system looks like a Docker container looks like the core ETRM.

### The Size Principle: Scale = Importance
In the drawio diagram, EOS is HUGE. RabbitMQ is medium. Glint modules are small. You instantly know what matters. In JARVIS, the central orb is dominant; rings are peripheral.

**Our v28 failure:** All nodes are roughly the same size. EOS doesn't feel like the core of everything.

---

## Six Design Principles for v29

1. **LABELED FLOWS** — Every connector line gets a text label describing what's flowing ("Price Ingress", "Trade Captures", "Settlement Data"). The label IS the explanation.

2. **DISTINCT SHAPES** — External systems are cloud shapes (rounded, dashed border). Glint modules are compact pills. RabbitMQ is a hexagon or distinctive shape. EOS is a large rounded box. Destinations have their own shape.

3. **SCALE = IMPORTANCE** — EOS is 3x the size of a Glint module. RabbitMQ is 2x. External systems are medium. This communicates hierarchy instantly.

4. **PROGRESSIVE REVEAL** — Default view shows the high-level flow (External → RabbitMQ → EOS → Destinations). Click to expand and see individual Glint modules. Click a module to see its message queue details.

5. **SPATIAL NARRATIVE** — Left = data sources, Centre = processing, Right = outputs. The eye naturally reads the data flow story left to right.

6. **ANNOTATIONS** — Contextual notes on the diagram explaining WHY flows exist: "Spanish gas trade data flow", "Invoices saved as PDF", "Manual pull". These are the support user's guide.

Sources:
- [Sci-Fi UI Design Inspired by Films](https://liistudio.com/sci-fi-ui-design-inspired-by-films/)
- [JARVIS UI Design Spec](https://docsbot.ai/prompts/technical/jarvis-ui-design-spec)
- [Iron Man 2 Technology Design — Perception](https://www.experienceperception.com/work/iron-man-2/)
- [Jayse Hansen FUI Portfolio](https://jayse.tv/v2/?portfolio=hud-2-2)
- [FUI Design in Marvel/DC](https://greyscalegorilla.com/blog/fui-design-haddow-marvel-dc)
- [Redesigning JARVIS UX](https://medium.com/fictional-products-for-fictional-worlds/redesigning-the-jarvis-ux-a-minimalist-approach-to-a-genius-system-208b39113e8d)
