#!/usr/bin/env python3
"""
Horizon ETRM — AI-Friendly UI Architecture v2
For architect audience. Mechanics + citations + real code examples.
"""

from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# Brand colours
BG      = RGBColor(0x09, 0x09, 0x0B)
BG_CARD = RGBColor(0x18, 0x18, 0x1B)
BG_CODE = RGBColor(0x11, 0x11, 0x14)
ACCENT  = RGBColor(0x4F, 0x46, 0xE5)
GREEN   = RGBColor(0x22, 0xC5, 0x5E)
RED     = RGBColor(0xEF, 0x44, 0x44)
AMBER   = RGBColor(0xF5, 0x9E, 0x0B)
BLUE    = RGBColor(0x3B, 0x82, 0xF6)
WHITE   = RGBColor(0xFA, 0xFA, 0xFA)
GREY    = RGBColor(0xA1, 0xA1, 0xAA)
MUTED   = RGBColor(0x71, 0x71, 0x7A)
BORDER  = RGBColor(0x27, 0x27, 0x2A)

prs = Presentation()
prs.slide_width  = Inches(13.333)
prs.slide_height = Inches(7.5)

def bg(slide):
    f = slide.background.fill; f.solid(); f.fore_color.rgb = BG

def txt(s, l, t, w, h, text, sz=18, c=WHITE, b=False, a=PP_ALIGN.LEFT, f='Calibri'):
    tx = s.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = tx.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = text; p.font.size = Pt(sz); p.font.color.rgb = c; p.font.bold = b; p.font.name = f; p.alignment = a
    return tx

def mline(s, l, t, w, h, lines, sz=11, fn='Consolas', dc=GREY):
    tx = s.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = tx.text_frame; tf.word_wrap = True
    for i, ln in enumerate(lines):
        text, col = (ln, dc) if isinstance(ln, str) else ln
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_before = Pt(1); p.space_after = Pt(1)
        r = p.add_run(); r.text = text; r.font.size = Pt(sz); r.font.color.rgb = col; r.font.name = fn

def aline(s, l, t, w=2.5):
    sh = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(l), Inches(t), Inches(w), Pt(3))
    sh.fill.solid(); sh.fill.fore_color.rgb = ACCENT; sh.line.fill.background()

def cbox(s, l, t, w, h, lines, sz=10):
    sh = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(l), Inches(t), Inches(w), Inches(h))
    sh.fill.solid(); sh.fill.fore_color.rgb = BG_CODE; sh.line.color.rgb = BORDER; sh.line.width = Pt(1)
    mline(s, l+0.12, t+0.08, w-0.24, h-0.16, lines, sz=sz)

def card(s, l, t, w, h, title, lines, tc=ACCENT):
    sh = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(l), Inches(t), Inches(w), Inches(h))
    sh.fill.solid(); sh.fill.fore_color.rgb = BG_CARD; sh.line.color.rgb = BORDER; sh.line.width = Pt(1)
    txt(s, l+0.15, t+0.1, w-0.3, 0.3, title, sz=13, c=tc, b=True)
    mline(s, l+0.15, t+0.38, w-0.3, h-0.5, lines, sz=10, fn='Calibri', dc=GREY)

def circ(s, x, y, n, c=ACCENT):
    sh = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(x), Inches(y), Inches(0.45), Inches(0.45))
    sh.fill.solid(); sh.fill.fore_color.rgb = c; sh.line.fill.background()
    tf = sh.text_frame; tf.word_wrap = False
    p = tf.paragraphs[0]; p.text = str(n); p.font.size = Pt(16); p.font.color.rgb = WHITE; p.font.bold = True; p.alignment = PP_ALIGN.CENTER
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE


# ============================================================
# SLIDE 1 — Title
# ============================================================
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
txt(s, 0.8, 1.0, 11, 0.4, "HORIZON ETRM", sz=14, c=MUTED, b=True)
aline(s, 0.8, 1.4)
txt(s, 0.8, 1.6, 11, 1.2, "AI-Friendly UI Architecture", sz=48, c=WHITE, b=True)
txt(s, 0.8, 2.9, 11, 0.6, "Why this works with AI — no markers, no annotations,\njust architecture", sz=22, c=GREY)
txt(s, 0.8, 3.8, 11, 1.0,
    '"The perceived clutter of utility classes transforms into essential context\n'
    'when viewed through the lens of an AI agent. Context is the scarcest\n'
    'resource, and utility-first CSS is the most context-efficient styling\n'
    'protocol available."', sz=16, c=ACCENT)
txt(s, 0.8, 5.0, 11, 0.3, "— Silvermine AI, \"The Utility-Semantic Paradox\" (Jan 2026)", sz=12, c=MUTED)
txt(s, 0.8, 6.2, 11, 0.3, "Design Authority  ·  May 2026", sz=13, c=MUTED)


# ============================================================
# SLIDE 2 — The Context Problem
# ============================================================
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
txt(s, 0.8, 0.4, 11, 0.3, "THE CONTEXT PROBLEM", sz=14, c=MUTED, b=True)
aline(s, 0.8, 0.7)
txt(s, 0.8, 0.9, 11, 0.7, "LLMs lose accuracy when context is spread across files", sz=30, c=WHITE, b=True)

txt(s, 0.8, 1.8, 6, 1.2,
    "Stanford & UC Berkeley's \"Lost in the Middle\" research (2023)\n"
    "shows LLMs lose 30%+ accuracy when relevant information\n"
    "is buried in the middle of long contexts.\n\n"
    "Multi-file CSS architectures create exactly this problem:\n"
    "the styling information an AI needs is scattered across\n"
    "component files, token files, theme files, and config files.",
    sz=14, c=GREY)

card(s, 7.2, 1.8, 5.5, 1.5, "The multi-file problem", [
    ("An AI generating a KPI card must read:", GREY),
    ("", GREY),
    ("1. Page component (composition)", WHITE),
    ("2. KpiCell.tsx (rendering logic)", WHITE),
    ("3. Text.tsx (typography primitives)", WHITE),
    ("4. _semantic.css (token declarations)", WHITE),
    ("5. theme-horizon-ui.css (token values)", WHITE),
    ("6. Tailwind config (utility classes)", WHITE),
    ("", GREY),
    ("6 files. The styling intent is scattered.", RED),
], tc=RED)

txt(s, 0.8, 3.6, 6, 0.3, "The solution: co-location", sz=16, c=GREEN, b=True)
txt(s, 0.8, 3.9, 6, 0.8,
    "Tailwind's utility-first approach puts style declarations\n"
    "next to the elements they style. Our approach goes further:\n"
    "semantic class names encode the component's PURPOSE.",
    sz=14, c=GREY)

card(s, 7.2, 3.6, 5.5, 1.5, "The co-located solution", [
    ("An AI generating a KPI card reads:", GREY),
    ("", GREY),
    ("1. The page file. That's it.", GREEN),
    ("", GREY),
    ('<div class="hz-kpi">', ACCENT),
    ('  <span class="hz-kpi-label">System Health</span>', ACCENT),
    ('  <span class="hz-kpi-value">', ACCENT),
    ('    <span class="hz-dot green pulse" /> HEALTHY', GREEN),
    ('  </span>', ACCENT),
    ('</div>', ACCENT),
], tc=GREEN)

txt(s, 0.8, 5.4, 11.7, 0.6,
    "v0.dev, Bolt.new, and Cursor all default to Tailwind because it's \"the assembly language AI tools speak natively.\"\n"
    "v0.dev generates Tailwind + shadcn/UI at ~90% accuracy specifically because styling context is in the same file.",
    sz=12, c=MUTED)

txt(s, 0.8, 6.2, 11.7, 0.5,
    "Sources: Liu et al. \"Lost in the Middle\" (Stanford/UC Berkeley 2023)  ·  Silvermine AI \"Utility-Semantic Paradox\" (2026)\n"
    "Flexxited v0.dev Guide (2025)  ·  iTitans \"Future of Front-End: Tailwind + AI\" (2025)",
    sz=9, c=MUTED)


# ============================================================
# SLIDE 3 — Real Example: Our Markup
# ============================================================
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
txt(s, 0.8, 0.4, 11, 0.3, "REAL EXAMPLE: OUR MARKUP", sz=14, c=MUTED, b=True)
aline(s, 0.8, 0.7)
txt(s, 0.8, 0.9, 11, 0.7, "What an AI sees when it reads our code", sz=30, c=WHITE, b=True)

txt(s, 0.8, 1.7, 6.2, 0.3, "From DemoSupportDashboard.tsx — the KPI strip:", sz=12, c=ACCENT, b=True)
cbox(s, 0.8, 2.0, 6.2, 3.0, [
    ('<div className="kpis">', WHITE),
    ('  <div className="hz-kpi">', WHITE),
    ('    <span className="hz-kpi-label">', ACCENT),
    ('      System Health', WHITE),
    ('    </span>', ACCENT),
    ('    <span className="hz-kpi-value"', ACCENT),
    ('      style={{fontSize:"var(--text-base)"}}>', ACCENT),
    ('      <span className="hz-dot green pulse" />', GREEN),
    ('      <span style={{color:"var(--green)"}}>', GREEN),
    ('        HEALTHY', GREEN),
    ('      </span>', GREEN),
    ('    </span>', ACCENT),
    ('  </div>', WHITE),
    ('  ...5 more KPI cells, same pattern...', MUTED),
    ('</div>', WHITE),
], sz=10)

txt(s, 7.3, 1.7, 5.5, 0.3, "What the AI learns from this (zero docs needed):", sz=12, c=GREEN, b=True)

mline(s, 7.3, 2.1, 5.5, 3.8, [
    ("CLASS NAME          →  MEANING", WHITE),
    ("", GREY),
    ("kpis                   horizontal strip container", GREY),
    ("hz-kpi                 one KPI card", GREY),
    ("hz-kpi-label           label text (uppercase, muted)", GREY),
    ("hz-kpi-value           the main value display", GREY),
    ("hz-dot                 status indicator dot", GREY),
    ("  .green               positive/healthy status", GREY),
    ("  .pulse               it's live/animated", GREY),
    ("", GREY),
    ("CSS VARIABLE        →  INTENT", WHITE),
    ("", GREY),
    ("var(--text-base)       body-size text (14px)", GREY),
    ("var(--green)           status colour: good", GREY),
    ("var(--text-muted)      de-emphasised text", GREY),
    ("", GREY),
    ("STRUCTURE           →  VISUAL HIERARCHY", WHITE),
    ("", GREY),
    ("kpis > hz-kpi          strip contains cards", GREY),
    ("hz-kpi > label + value card has label above value", GREY),
    ("value > dot + text     value has status dot + text", GREY),
], sz=10, fn='Consolas', dc=GREY)

txt(s, 0.8, 5.3, 11.7, 0.6,
    "No data-ai attributes. No aria-purpose annotations. No README.\n"
    "The class names ARE the semantic markers. The HTML hierarchy IS the visual hierarchy.\n"
    "An AI reads this once and can build any KPI strip from the pattern.",
    sz=14, c=WHITE)

txt(s, 0.8, 6.1, 11.7, 0.4,
    "This is what Silvermine AI calls \"100% context-complete styling\" — the AI has everything it needs in one place.",
    sz=12, c=MUTED)


# ============================================================
# SLIDE 4 — Contrast: The Abstracted Approach
# ============================================================
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
txt(s, 0.8, 0.4, 11, 0.3, "CONTRAST: THE ABSTRACTED APPROACH", sz=14, c=MUTED, b=True)
aline(s, 0.8, 0.7)
txt(s, 0.8, 0.9, 11, 0.7, "What an AI sees when React primitives hide the CSS", sz=30, c=WHITE, b=True)

txt(s, 0.8, 1.7, 6.2, 0.3, "From EOS.Horizon's KpiCell.tsx — the AI must read this:", sz=12, c=RED, b=True)
cbox(s, 0.8, 2.0, 6.2, 3.2, [
    ('// File 1: The page', MUTED),
    ('<KpiCell kind="status" tone="pass"', WHITE),
    ('  title="System Health" value="HEALTHY" />', WHITE),
    ('', GREY),
    ('// File 2: KpiCell.tsx — what does tone="pass" mean?', MUTED),
    ('const TONE_TO_VALUE: Record<KpiTone, string> = {', GREY),
    ('  pass:    "rag-green",     // → what is rag-green?', RED),
    ('  warn:    "rag-amber",', GREY),
    ('  fail:    "rag-red",', GREY),
    ('  neutral: "primary",', GREY),
    ('};', GREY),
    ('', GREY),
    ('// File 3: _semantic.css — where is --rag-green?', MUTED),
    ('--rag-green: ???  // EMPTY — renamed from --green', RED),
    ('', GREY),
    ('// File 4: theme-horizon-ui.css — the actual value', MUTED),
    ('--rag-green: #22c55e;  // finally found it', RED),
], sz=10)

txt(s, 7.3, 1.7, 5.5, 0.3, "The AI's file traversal for one colour:", sz=12, c=RED, b=True)
mline(s, 7.3, 2.1, 5.5, 2.0, [
    ('Page → KpiCell.tsx → TONE_TO_VALUE map', WHITE),
    ('  → finds "rag-green"', GREY),
    ('  → reads _semantic.css', GREY),
    ('  → --rag-green is EMPTY (undefined)', RED),
    ('  → must read theme-horizon-ui.css', GREY),
    ('  → finally finds #22c55e', GREY),
    ('', GREY),
    ('4 files. 4 indirections.', RED),
    ('And the AI still doesn\'t know what', RED),
    ('"kind=status" renders vs "kind=counter".', RED),
], sz=11, fn='Consolas')

txt(s, 7.3, 4.2, 5.5, 0.3, "The discriminated union problem:", sz=12, c=AMBER, b=True)
cbox(s, 7.3, 4.5, 5.5, 1.5, [
    ('type KpiCellProps = {', GREY),
    ('  title: string; tone?: KpiTone;', GREY),
    ('} & (', GREY),
    ('  | { kind: "status";  value: string | null }', AMBER),
    ('  | { kind: "counter"; value: number | null }', AMBER),
    ('  | { kind: "counter-delta"; value: number |', AMBER),
    ('      null; delta?: string; deltaTone?: KpiTone }', AMBER),
    ('  | { kind: "percentage"; value: number | null }', AMBER),
    ('  | { kind: "money"; value: number | null;', AMBER),
    ('      currency?: string; formatted?: string }', AMBER),
    (');', GREY),
], sz=9)

txt(s, 0.8, 5.5, 11.7, 0.8,
    "An AI reading this must understand: TypeScript discriminated unions, Record<> type mappings,\n"
    "CSS variable resolution chains across 4 files, and conditional rendering paths.\n"
    "Compare to the CSS-direct approach: read one class name, know what it does.",
    sz=14, c=WHITE)


# ============================================================
# SLIDE 5 — Semantic Density Measured
# ============================================================
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
txt(s, 0.8, 0.4, 11, 0.3, "SEMANTIC DENSITY — MEASURED", sz=14, c=MUTED, b=True)
aline(s, 0.8, 0.7)
txt(s, 0.8, 0.9, 11, 0.7, "How many semantic signals per line of code?", sz=30, c=WHITE, b=True)

txt(s, 0.8, 1.8, 11.7, 0.3, "Real code from our integrity checks panel:", sz=14, c=ACCENT, b=True)
cbox(s, 0.8, 2.1, 11.7, 1.7, [
    ('<!-- CSS-Direct: 6 semantic signals in 4 lines -->', MUTED),
    ('<div class="check-row" style="background:var(--amber-dim)">', WHITE),
    ('  <span class="hz-dot amber pulse" />                        ', AMBER),
    ('  <span class="check-label">Missing Settlement Prices</span> ', WHITE),
    ('  <span class="hz-badge amber">WARN</span>                   ', AMBER),
    ('</div>', WHITE),
    ('', GREY),
    ('Signals: check-row(purpose) amber-dim(severity-bg) hz-dot(indicator) amber(status)', GREEN),
    ('         pulse(live) check-label(role) hz-badge(pill) WARN(state) = 8 signals / 4 lines', GREEN),
], sz=10)

cbox(s, 0.8, 4.1, 11.7, 1.7, [
    ('<!-- Abstracted: same component, but signals hidden in types -->', MUTED),
    ('<CheckRow', WHITE),
    ('  severity="warn"                    // what CSS does this produce?', RED),
    ('  title="Missing Settlement Prices"  // how is this rendered?', GREY),
    ('  detail="2 curves: JKM Nov-26..."   // italic? muted? what size?', GREY),
    ('  subtlePills                        // what does subtle mean visually?', RED),
    ('/>', WHITE),
    ('', GREY),
    ('Signals: severity(status) title(content) detail(content) subtlePills(?) = 4 signals / 5 lines', RED),
    ('To know what renders: read CheckRow.tsx + StatusPill.tsx + Text.tsx + CSS', RED),
], sz=10)

txt(s, 0.8, 6.1, 11.7, 0.6,
    "CSS-direct: 8 semantic signals in 4 lines = 2.0 signals/line. AI understands on first read.\n"
    "Abstracted: 4 signals in 5 lines = 0.8 signals/line. AI must chase through 4 more files to resolve.\n"
    "2.5x higher semantic density means the AI needs 2.5x less context to understand the same component.",
    sz=13, c=WHITE)


# ============================================================
# SLIDE 6 — No Markers Needed
# ============================================================
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
txt(s, 0.8, 0.4, 11, 0.3, "NO MARKERS NEEDED", sz=14, c=MUTED, b=True)
aline(s, 0.8, 0.7)
txt(s, 0.8, 0.9, 11, 0.7, "The architecture IS the annotation", sz=30, c=WHITE, b=True)

txt(s, 0.8, 1.8, 11.7, 0.6,
    "We added zero AI-specific attributes. No data-ai-purpose. No machine-readable comments.\n"
    "Three properties of the architecture make explicit markers unnecessary:",
    sz=15, c=GREY)

card(s, 0.8, 2.6, 3.7, 3.2, "1. Names describe function", [
    ("", GREY),
    ("hz-kpi-label", ACCENT),
    ("  → this is a KPI's label", GREY),
    ("", GREY),
    ("hz-badge red", ACCENT),
    ("  → red severity badge", GREY),
    ("", GREY),
    ("check-row", ACCENT),
    ("  → a row in a check list", GREY),
    ("", GREY),
    ("pnl-positive", ACCENT),
    ("  → positive P&L value", GREY),
    ("", GREY),
    ("The name IS the marker.", GREEN),
    ("No annotation needed because", GREEN),
    ("the class name already says", GREEN),
    ("what the element does.", GREEN),
], tc=GREEN)

card(s, 4.8, 2.6, 3.7, 3.2, "2. Structure mirrors visuals", [
    ("", GREY),
    ("HTML nesting:", ACCENT),
    ("  kpis", WHITE),
    ("    └ hz-kpi", WHITE),
    ("        ├ hz-kpi-label", WHITE),
    ("        └ hz-kpi-value", WHITE),
    ("            ├ hz-dot green", WHITE),
    ("            └ text", WHITE),
    ("", GREY),
    ("Visual layout:", ACCENT),
    ("  [strip of cards]", WHITE),
    ("    [card]", WHITE),
    ("      [label above]", WHITE),
    ("      [dot + value below]", WHITE),
    ("", GREY),
    ("Same hierarchy. Same order.", GREEN),
], tc=GREEN)

card(s, 8.8, 2.6, 3.7, 3.2, "3. Tokens encode intent", [
    ("", GREY),
    ("var(--green)", ACCENT),
    ("  → status: good", GREY),
    ("  not: colour #22c55e", GREY),
    ("", GREY),
    ("var(--text-muted)", ACCENT),
    ("  → de-emphasised text", GREY),
    ("  not: colour #71717a", GREY),
    ("", GREY),
    ("var(--surface-base)", ACCENT),
    ("  → app chrome background", GREY),
    ("  not: colour #0f0f12", GREY),
    ("", GREY),
    ("Named by purpose, not value.", GREEN),
    ("AI infers intent from the name", GREEN),
    ("without reading the token file.", GREEN),
], tc=GREEN)

txt(s, 0.8, 6.1, 11.7, 0.5,
    "This aligns with the Flowbite LLM guide: \"Providing Tailwind classes as context gives AI models\n"
    "the vocabulary to generate accurate, consistent UI without referencing external style documentation.\"",
    sz=12, c=MUTED)


# ============================================================
# SLIDE 7 — The Vocabulary (30 classes)
# ============================================================
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
txt(s, 0.8, 0.4, 11, 0.3, "THE VOCABULARY", sz=14, c=MUTED, b=True)
aline(s, 0.8, 0.7)
txt(s, 0.8, 0.9, 11, 0.7, "30 class names = the entire component library", sz=30, c=WHITE, b=True)

txt(s, 0.8, 1.7, 11.7, 0.3,
    "An AI learns these from ONE page and can build ANY page in the system.", sz=14, c=ACCENT)

cols = [
    ("Shell", [
        ("hz-header", "top bar"),
        ("hz-sidebar", "nav panel"),
        ("hz-status-bar", "bottom bar"),
        ("hz-content-fill", "page wrapper"),
        ("hz-cmd-k-btn", "search trigger"),
        ("hz-avatar", "user icon"),
        ("hz-env-badge", "env label"),
    ]),
    ("Components", [
        ("hz-kpi", "KPI card"),
        ("hz-kpi-label", "KPI label"),
        ("hz-kpi-value", "KPI value"),
        ("hz-kpi-delta", "KPI change"),
        ("hz-badge", "status pill"),
        ("hz-dot", "status dot"),
        ("hz-entity-link", "clickable ID"),
    ]),
    ("Page patterns", [
        ("kpis", "KPI strip row"),
        ("dash", "3-column grid"),
        ("dash-col", "grid column"),
        ("tbl", "compact table"),
        ("check-row", "check item"),
        ("check-label", "check name"),
        ("alert-row", "alert block"),
        ("feed-row", "activity item"),
        ("sec-title", "section title"),
    ]),
    ("Modifiers", [
        (".green .red .amber", "RAG status"),
        (".blue", "info status"),
        (".pulse", "animated live"),
        (".positive .negative", "P&L direction"),
        (".neutral", "no status"),
        ("font-mono", "monospace"),
        ("pnl-positive", "profit colour"),
    ]),
]

for i, (title, items) in enumerate(cols):
    x = 0.5 + i * 3.15
    txt(s, x, 2.1, 3.0, 0.3, title, sz=13, c=ACCENT, b=True)
    for j, (cls, desc) in enumerate(items):
        y = 2.45 + j * 0.47
        txt(s, x, y, 1.6, 0.25, cls, sz=9, c=WHITE, f='Consolas')
        txt(s, x + 1.6, y, 1.4, 0.25, desc, sz=9, c=MUTED)

txt(s, 0.8, 6.0, 11.7, 0.3, "Contrast: the React primitive library", sz=14, c=RED, b=True)
txt(s, 0.8, 6.3, 11.7, 0.5,
    "63 exported types  ·  15 component prop interfaces  ·  8 discriminated unions  ·  5 Record<> mapping tables\n"
    "Exponential API surface: kind(5) × tone(6) × size(9) × weight(4) × role(5) = 5,400 possible combinations per component",
    sz=12, c=GREY)


# ============================================================
# SLIDE 8 — One-File Theming
# ============================================================
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
txt(s, 0.8, 0.4, 11, 0.3, "ONE-FILE THEMING", sz=14, c=MUTED, b=True)
aline(s, 0.8, 0.7)
txt(s, 0.8, 0.9, 11, 0.7, "An AI reskins the entire app by editing one :root block", sz=30, c=WHITE, b=True)

txt(s, 0.8, 1.7, 6, 0.3, "Real excerpt from tokens-v43.css:", sz=12, c=ACCENT, b=True)
cbox(s, 0.8, 2.0, 6, 4.0, [
    (':root {', WHITE),
    ('  /* Typography */', MUTED),
    ('  --font-ui: "Inter", system-ui, sans-serif;', GREY),
    ('  --font-mono: "JetBrains Mono", monospace;', GREY),
    ('', GREY),
    ('  /* Type scale */', MUTED),
    ('  --text-xs:   0.6875rem;  /* 11px */', GREY),
    ('  --text-sm:   0.8125rem;  /* 13px */', GREY),
    ('  --text-base: 0.875rem;   /* 14px */', GREY),
    ('', GREY),
    ('  /* Status colours */', MUTED),
    ('  --green: #22c55e;', GREEN),
    ('  --green-dim: rgba(34,197,94, 0.15);', GREEN),
    ('  --red:   #ef4444;', RED),
    ('  --red-dim: rgba(239,68,68, 0.15);', RED),
    ('  --amber: #f59e0b;', AMBER),
    ('  --blue:  #3b82f6;', BLUE),
    ('', GREY),
    ('  /* Surfaces (5-tier ramp) */', MUTED),
    ('  --surface-canvas: #09090b;', GREY),
    ('  --surface-base:   #0f0f12;', GREY),
    ('  --card-bg:        #141417;', GREY),
    ('}', WHITE),
], sz=10)

txt(s, 7.2, 1.7, 5.5, 0.3, "What an AI can do with this:", sz=14, c=WHITE, b=True)

card(s, 7.2, 2.1, 5.3, 1.1, "Rebrand the entire app", [
    ("Change --accent: #4f46e5 to --accent: #0ea5e9", GREY),
    ("Every button, link, active state, brand touch updates.", GREY),
    ("Zero component code changes.", GREY),
], tc=ACCENT)

card(s, 7.2, 3.4, 5.3, 1.1, "Switch dark / light", [
    ("[data-theme=\"light\"] { --surface-canvas: #f8fafc; }", GREY),
    ("Toggle one attribute on <html>.", GREY),
    ("Everything flips. No JS theming logic.", GREY),
], tc=ACCENT)

card(s, 7.2, 4.7, 5.3, 1.1, "Adjust global density", [
    ("Change --text-xs from 11px to 10px.", GREY),
    ("Every label, badge, table header tightens.", GREY),
    ("The entire app gets denser from ONE value.", GREY),
], tc=ACCENT)

txt(s, 0.8, 6.3, 11.7, 0.4,
    "222 lines of CSS. That's the entire design system surface. An AI can parse and modify it in a single context window.",
    sz=13, c=GREEN)


# ============================================================
# SLIDE 9 — Copy-Paste: Building New Pages
# ============================================================
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
txt(s, 0.8, 0.4, 11, 0.3, "COPY-PASTE ARCHITECTURE", sz=14, c=MUTED, b=True)
aline(s, 0.8, 0.7)
txt(s, 0.8, 0.9, 11, 0.7, "An AI builds new pages by copying patterns", sz=30, c=WHITE, b=True)

txt(s, 0.8, 1.8, 5.8, 0.3, "Step 1 — AI reads an existing check row:", sz=12, c=ACCENT, b=True)
cbox(s, 0.8, 2.1, 5.8, 1.0, [
    ('<div class="check-row">', WHITE),
    ('  <span class="hz-dot green" />', GREEN),
    ('  <span class="check-label">Trade Recon</span>', GREY),
    ('  <span class="hz-badge green">PASS</span>', GREEN),
    ('</div>', WHITE),
])

txt(s, 0.8, 3.3, 5.8, 0.3, "Step 2 — AI generates a new page for cargo checks:", sz=12, c=ACCENT, b=True)
cbox(s, 0.8, 3.6, 5.8, 1.8, [
    ('<!-- AI-generated: Cargo Inspection Checks -->', MUTED),
    ('<div class="hz-content-fill">', WHITE),
    ('  <div class="kpis">...KPI strip...</div>', GREY),
    ('  <span class="sec-title">Cargo Inspections</span>', WHITE),
    ('  <div class="check-row">', WHITE),
    ('    <span class="hz-dot amber pulse" />', AMBER),
    ('    <span class="check-label">Vessel ETA Drift</span>', GREY),
    ('    <span class="hz-badge amber">WARN</span>', AMBER),
    ('  </div>', WHITE),
    ('  <div class="check-row">', WHITE),
    ('    <span class="hz-dot green" />', GREEN),
    ('    <span class="check-label">Bill of Lading</span>', GREY),
    ('    <span class="hz-badge green">PASS</span>', GREEN),
    ('  </div>', WHITE),
    ('</div>', WHITE),
])

txt(s, 7.0, 1.8, 5.8, 0.3, "Why this works for AI:", sz=14, c=WHITE, b=True)

card(s, 7.0, 2.2, 5.8, 1.1, "Finite vocabulary", [
    ("~30 class names. An AI learns them all from one page.", GREY),
    ("No new concepts to discover when building page 2, 3, or 10.", GREY),
    ("Compare: React primitives have 5,400 prop combinations per component.", GREY),
], tc=GREEN)

card(s, 7.0, 3.5, 5.8, 1.1, "Predictable output", [
    ("Same class name = same visual result. Always.", GREY),
    ("No runtime conditions. No theme context traversal.", GREY),
    ("No conditional class computation. hz-badge green = green pill.", GREY),
], tc=GREEN)

card(s, 7.0, 4.8, 5.8, 1.1, "No API to learn", [
    ("No component props, no type signatures, no imports.", GREY),
    ("The pattern is the HTML structure + class names.", GREY),
    ("An AI copies the pattern, changes the data. Done.", GREY),
], tc=GREEN)

txt(s, 0.8, 6.2, 11.7, 0.5,
    "\"AI generates better Tailwind output because Tailwind dominates training data. Every open-source\n"
    "Next.js starter, YouTube tutorial repo, and SaaS template uses Tailwind.\" — Vibe Coder Blog, 2026",
    sz=11, c=MUTED)


# ============================================================
# SLIDE 10 — The Handover Mechanics
# ============================================================
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
txt(s, 0.8, 0.4, 11, 0.3, "THE HANDOVER", sz=14, c=MUTED, b=True)
aline(s, 0.8, 0.7)
txt(s, 0.8, 0.9, 11, 0.7, "CSS files in, CSS files out", sz=30, c=WHITE, b=True)

steps = [
    ("1", "Design", "Iterate HTML\nprototype", ACCENT),
    ("2", "Extract", "tokens.css +\nshell.css +\npage CSS", ACCENT),
    ("3", "Drop in", "Replace CSS\nin production", GREEN),
    ("4", "Wire data", "Swap static\nfor API hooks", GREEN),
    ("5", "Verify", "Screenshot\ncomparison", GREEN),
]
for i, (n, title, desc, col) in enumerate(steps):
    x = 0.5 + i * 2.5
    circ(s, x+0.55, 1.9, n, col)
    txt(s, x, 2.5, 2.2, 0.3, title, sz=15, c=WHITE, b=True, a=PP_ALIGN.CENTER)
    txt(s, x, 2.8, 2.2, 0.9, desc, sz=11, c=GREY, a=PP_ALIGN.CENTER)

txt(s, 0.8, 3.9, 11.7, 0.3, "What this replaces:", sz=14, c=RED, b=True)

card(s, 0.8, 4.2, 3.7, 1.8, "Component specs (eliminated)", [
    ("120-property measurement documents", GREY),
    ("that drifted on every handover cycle.", GREY),
    ("", GREY),
    ("6 evaluation documents, 3 response", GREY),
    ("plans, 2 integration lessons — and the", GREY),
    ("production app still didn't match.", GREY),
], tc=RED)

card(s, 4.8, 4.2, 3.7, 1.8, "Token audits (eliminated)", [
    ("Comparing values across files that", GREY),
    ("used different names for the same thing.", GREY),
    ("", GREY),
    ("--green renamed to --rag-green.", GREY),
    ("0.6875rem became 0.625rem.", GREY),
    ("\"horizon-ui\" instead of \"dark\".", GREY),
], tc=RED)

card(s, 8.8, 4.2, 3.7, 1.8, "React wrappers (eliminated)", [
    ("Abstraction layers that added complexity", GREY),
    ("without adding value.", GREY),
    ("", GREY),
    ("<KpiCell kind=\"status\" tone=\"pass\">", GREY),
    ("→ replaced by →", GREY),
    ("<div class=\"hz-kpi\">", GREEN),
], tc=RED)

txt(s, 0.8, 6.3, 11.7, 0.4,
    "The one rule: never rename, re-map, or abstract the CSS. The moment someone creates a mapping layer, the designs diverge.",
    sz=14, c=ACCENT, b=True)


# ============================================================
# SLIDE 11 — Proof: Side-by-Side
# ============================================================
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
txt(s, 0.8, 0.4, 11, 0.3, "PROOF", sz=14, c=MUTED, b=True)
aline(s, 0.8, 0.7)
txt(s, 0.8, 0.9, 11, 0.7, "The React app renders pixel-identical to the prototype", sz=30, c=WHITE, b=True)

txt(s, 0.8, 1.8, 5.8, 0.3, "What we measured (Playwright):", sz=14, c=GREEN, b=True)

mline(s, 0.8, 2.2, 11.7, 2.5, [
    ("PROPERTY              PROTOTYPE        REACT APP         MATCH", WHITE),
    ("", GREY),
    ("Root font-size        16px             16px              ✓", GREEN),
    ("--text-xs             0.6875rem        0.6875rem         ✓  (was 0.625rem — fixed)", GREEN),
    ("--text-sm             0.8125rem        0.8125rem         ✓  (was 0.75rem — fixed)", GREEN),
    ("--text-base           0.875rem         0.875rem          ✓  (was 0.8125rem — fixed)", GREEN),
    ("--font-ui             Inter            Inter             ✓  (was DM Sans — fixed)", GREEN),
    ("--green               #22c55e          #22c55e           ✓  (was empty — fixed)", GREEN),
    ("data-theme            dark             dark              ✓  (was horizon-ui — fixed)", GREEN),
    ("Tailwind              v3 CDN           v3 CDN            ✓  (was v4 npm — fixed)", GREEN),
    ("KPI value height      14px             14px              ✓", GREEN),
    ("Check row height      23.5px           23.5px            ✓", GREEN),
    ("Alert row padding     4px 8px          4px 8px           ✓", GREEN),
], sz=10, fn='Consolas')

txt(s, 0.8, 5.0, 11.7, 0.6,
    "5 support pages. Full interactive shell (sidebar, Cmd+K, workspace tabs, theme toggle).\n"
    "Same CSS files. Same class names. Pixel match confirmed via Playwright screenshots.",
    sz=15, c=WHITE)

txt(s, 0.8, 5.8, 11.7, 0.5,
    "Static data inline with {/* TODO: API */} markers. EOS.Horizon replaces strings with useQuery hooks.\n"
    "JSX structure unchanged. Backend wiring is the only remaining integration work.",
    sz=13, c=GREY)


# ============================================================
# SLIDE 12 — Summary
# ============================================================
s = prs.slides.add_slide(prs.slide_layouts[6]); bg(s)
txt(s, 0.8, 0.4, 11, 0.3, "SUMMARY", sz=14, c=MUTED, b=True)
aline(s, 0.8, 0.7)
txt(s, 0.8, 0.9, 11, 1.0, "AI-friendliness is not a feature you add.\nIt's an emergent property of good architecture.", sz=32, c=WHITE, b=True)

points = [
    ("Co-location", "Style + structure + semantics in one file. 1 file vs 6 files for the same component."),
    ("Semantic naming", "Class names describe purpose. hz-kpi, hz-badge, check-row. No markers needed."),
    ("Semantic density", "2.0 signals/line (CSS-direct) vs 0.8 signals/line (abstracted). 2.5x more context."),
    ("Flat vocabulary", "30 class names vs 63 types + 15 interfaces + 8 unions. AI learns from one page."),
    ("Token architecture", "CSS variables named by intent. One :root block. Change once, updates everywhere."),
    ("Framework agnostic", "Works in React, Vue, Svelte, plain HTML. The CSS is the design system, not the JS."),
]

for i, (title, desc) in enumerate(points):
    y = 2.5 + i * 0.65
    txt(s, 0.8, y, 2.5, 0.3, title, sz=15, c=ACCENT, b=True)
    txt(s, 3.5, y, 9.0, 0.3, desc, sz=13, c=GREY)

txt(s, 0.8, 6.5, 11.7, 0.6,
    "Sources: Silvermine AI \"Utility-Semantic Paradox\" (2026)  ·  Liu et al. \"Lost in the Middle\" (Stanford 2023)\n"
    "Flowbite LLM Guide  ·  Flexxited v0.dev Guide  ·  Vibe Coder Blog  ·  iTitans \"Tailwind + AI\" (2025)\n"
    "LogRocket \"Tailwind CSS Guide 2026\"  ·  51% CSS developer adoption (State of CSS 2026)",
    sz=9, c=MUTED)

txt(s, 0.8, 7.15, 11.7, 0.2, "horizon-ui-templates  ·  github.com/sitebyte  ·  Design Authority 2026", sz=10, c=MUTED)


# Save
out = "/Users/jonathancobley/projects/horizon-ui-templates/analysis/horizon-ai-friendly-architecture.pptx"
prs.save(out)
print(f"Saved v2: {out}")
