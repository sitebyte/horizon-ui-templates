# Round 1: Competitive Landscape & Market Analysis

**Orchestrated by:** Jon Ive (Design Director)
**Panel:** UX Researcher, Commodity Trading SME, Visual Designer, Front-End Architect
**Date:** 3 May 2026

---

## 1. The Competitive Field

### Tier 1: Legacy Incumbents (70% market share)
- **ION Allegro** — Full ETRM, steeper learning curve, multiple panes for data entry, comprehensive but cumbersome. ~$500K-$2M implementation.
- **ION Openlink/Endur** — V25 released Feb 2025. Process automation, advanced analytics. Enterprise-grade but dated UI.
- **ION RightAngle** — Oil & gas focused. Traditional enterprise interface.
- **Brady ETRM** — European energy specialist. Extensive risk modelling, live-price feeds.

### Tier 2: Modern Challengers
- **Molecule** — Cloud-native SaaS. "Modern, automated, reliable." 90-day implementation. Natural language trade entry. AI chatbot (Mo). Spreadsheet upload. One-click trade cloning. The only genuinely modern ETRM UI.
- **Trayport Joule** — Broker/trader screen. Market Matrix with aggregated prices from 50+ brokers/exchanges. 8 chart types. Customizable depth. The best execution-focused interface in commodities.

### Tier 3: Generic Platforms
- **TradingView** — Best-in-class charting. Dark theme standard. Multi-layout workspace. 60M+ users prove the UX works.
- **Bloomberg Terminal** — The density benchmark. Every pixel justified. Keyboard-first. Zero-latency data. The standard traders compare everything against.

## 2. What the Best Do That Horizon Doesn't

### Bloomberg: Density Through Speed
- **Every screen is full.** No whitespace, no decorative cards, no breathing room. Data everywhere.
- **Keyboard navigation replaces mouse.** Function codes (GO commands) reach any screen in 2 keystrokes.
- **Data loads instantaneously.** The real superpower — not the layout, but the latency.
- **Horizon gap:** Our cards have internal padding. Our tables have gaps between them. Our content doesn't fill the viewport. Bloomberg would use every pixel.

### Trayport Joule: The Market Matrix
- **Price matrix dominates.** Instruments on rows, delivery periods on columns. Bid/ask/last/volume in each cell.
- **Aggregation across venues.** One view shows prices from 50+ sources.
- **Depth of market inline.** Click any cell for level-2 book.
- **Horizon gap:** Our position ladder is the closest analog but shows only our positions, not market depth. A trader needs to see the market, not just their book.

### Molecule: Modern SaaS UX
- **Conversational trade entry.** Type deals in natural language.
- **90-day implementation.** Cloud-native means no infrastructure.
- **Customizable dashboard views.** Users create their own layouts.
- **Horizon gap:** We don't allow user customization of layouts. Our trade entry is structured fields, not conversational. We don't show configurable views.

### TradingView: The Layout System
- **Multi-chart workspaces.** Users arrange 2, 4, 8 charts in a grid.
- **Persistent layouts.** Save multiple workspace configurations.
- **Dark theme as default.** Dark grey, not true black. Reduces eye strain.
- **Horizon gap:** We have one fixed layout per page. No workspace customization. No user-configurable panel arrangements.

## 3. Market Positioning Assessment

### Where Horizon Wins
1. **Role-adaptive dashboard** — No incumbent does this. Trader/Ops/Manager views from one URL.
2. **LNG domain specificity** — Correct fields (incoterm, WACOG, delivery month, GCV). Competitors are generic.
3. **Visual quality** — "A generation ahead of incumbents" (reviewer quote). Modern dark theme, gradient branding, professional typography.
4. **Quick entry ergonomics** — 8-keystroke trade capture. Faster than Bloomberg's modal, faster than Allegro's multi-pane.
5. **Reconciliation UX** — Side-by-side diff with tolerance highlighting. Better than Allegro/Endur.

### Where Horizon Loses
1. **No workspace customization** — Fixed layouts. Traders want to rearrange panels.
2. **No market data context** — Static ticker. No depth of market. No real-time charts.
3. **Settlement is thin** — No demurrage, quality adjustment, or payment tracking pages.
4. **No cross-entity navigation** — Can't click from trade to cargo to invoice to nomination.
5. **No saved views** — Traders re-apply the same filters daily.

---

## Jon Ive's Perspective

> "True simplicity is derived from so much more than just the absence of clutter. It's about bringing order to complexity."

The question for Horizon isn't "how do we add more stuff?" — it's "how do we make what's there feel intentional, inevitable, and complete?"

Bloomberg achieves density through speed. Trayport achieves it through aggregation. Molecule achieves it through automation. **Horizon should achieve density through coherence** — every element connected to every other element, every action flowing to the next, every screen knowing what you did on the last one.

The current v2 is structurally sound but **emotionally neutral**. It doesn't feel like it was designed with care for the specific person using it. A trader's dashboard should feel urgent. An operations view should feel controlled. A manager's view should feel commanding.

Sources:
- [Bloomberg Terminal UX](https://www.bloomberg.com/company/stories/how-bloomberg-terminal-ux-designers-conceal-complexity/)
- [Trayport Joule](https://trayport.com/products/joule/)
- [Molecule ETRM](https://molecule.io/)
- [ION Allegro](https://iongroup.com/products/commodities/allegro/)
- [UI Density](https://mattstromawn.com/writing/ui-density/)
- [Jony Ive Design Reckoning](https://www.designative.info/2025/05/21/jony-ives-design-reckoning-from-minimalism-to-meaning/)
- [10 Best Trading Platform Designs](https://merge.rocks/blog/the-10-best-trading-platform-design-examples-in-2024)
- [Enterprise Data Tables](https://medium.com/pulsar/modern-enterprise-ui-design-part-1-tables-ad8ee1b9feb)
