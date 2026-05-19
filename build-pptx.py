#!/usr/bin/env python3
"""
Horizon ETRM — AI-Friendly UI Architecture
Presentation for architect audience: WHY this works with AI (mechanics, not marketing)
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# Brand colours
BG_DARK     = RGBColor(0x09, 0x09, 0x0B)
BG_SURFACE  = RGBColor(0x0F, 0x0F, 0x12)
BG_CARD     = RGBColor(0x18, 0x18, 0x1B)
BG_CODE     = RGBColor(0x11, 0x11, 0x14)
ACCENT      = RGBColor(0x4F, 0x46, 0xE5)
GREEN       = RGBColor(0x22, 0xC5, 0x5E)
RED         = RGBColor(0xEF, 0x44, 0x44)
AMBER       = RGBColor(0xF5, 0x9E, 0x0B)
BLUE        = RGBColor(0x3B, 0x82, 0xF6)
WHITE       = RGBColor(0xFA, 0xFA, 0xFA)
GREY        = RGBColor(0xA1, 0xA1, 0xAA)
MUTED       = RGBColor(0x71, 0x71, 0x7A)
BORDER      = RGBColor(0x27, 0x27, 0x2A)

prs = Presentation()
prs.slide_width  = Inches(13.333)
prs.slide_height = Inches(7.5)

def set_bg(slide, color=BG_DARK):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color

def add_text(slide, left, top, width, height, text, size=18, color=WHITE, bold=False, align=PP_ALIGN.LEFT, font='Calibri'):
    txBox = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(size)
    p.font.color.rgb = color
    p.font.bold = bold
    p.font.name = font
    p.alignment = align
    return txBox

def add_multiline(slide, left, top, width, height, lines, size=13, font='Consolas', default_color=GREY):
    """Lines is list of (text, color) tuples or just strings"""
    txBox = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    tf = txBox.text_frame
    tf.word_wrap = True
    for i, line in enumerate(lines):
        if isinstance(line, str):
            text, color = line, default_color
        else:
            text, color = line
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_before = Pt(1)
        p.space_after = Pt(1)
        run = p.add_run()
        run.text = text
        run.font.size = Pt(size)
        run.font.color.rgb = color
        run.font.name = font
    return txBox

def accent_line(slide, left, top, width=2.5):
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(left), Inches(top), Inches(width), Pt(3))
    shape.fill.solid()
    shape.fill.fore_color.rgb = ACCENT
    shape.line.fill.background()

def code_box(slide, left, top, width, height, lines, size=11):
    """Dark code block with coloured lines"""
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
    shape.fill.solid()
    shape.fill.fore_color.rgb = BG_CODE
    shape.line.color.rgb = BORDER
    shape.line.width = Pt(1)
    add_multiline(slide, left + 0.15, top + 0.1, width - 0.3, height - 0.2, lines, size=size, font='Consolas')

def card(slide, left, top, width, height, title, body_lines, title_color=ACCENT):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
    shape.fill.solid()
    shape.fill.fore_color.rgb = BG_CARD
    shape.line.color.rgb = BORDER
    shape.line.width = Pt(1)
    add_text(slide, left + 0.2, top + 0.12, width - 0.4, 0.35, title, size=14, color=title_color, bold=True)
    add_multiline(slide, left + 0.2, top + 0.45, width - 0.4, height - 0.6, body_lines, size=11, font='Calibri', default_color=GREY)

def number_circle(slide, x, y, num, color=ACCENT):
    shape = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(x), Inches(y), Inches(0.5), Inches(0.5))
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    shape.line.fill.background()
    tf = shape.text_frame
    tf.word_wrap = False
    p = tf.paragraphs[0]
    p.text = str(num)
    p.font.size = Pt(18)
    p.font.color.rgb = WHITE
    p.font.bold = True
    p.alignment = PP_ALIGN.CENTER
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE


# ============================================================
# SLIDE 1 — Title
# ============================================================
s = prs.slides.add_slide(prs.slide_layouts[6])
set_bg(s)

add_text(s, 0.8, 1.2, 11, 0.5, "HORIZON ETRM", size=14, color=MUTED, bold=True)
accent_line(s, 0.8, 1.65)
add_text(s, 0.8, 1.9, 11, 1.2, "AI-Friendly UI Architecture", size=48, color=WHITE, bold=True)
add_text(s, 0.8, 3.2, 11, 0.8, "Why this works with AI — the mechanics,\nnot the marketing", size=22, color=GREY)
add_text(s, 0.8, 4.5, 11, 0.6, "We added no AI markers, no annotations, no data attributes.\nThe AI-friendliness is emergent from the architecture itself.", size=16, color=ACCENT)
add_text(s, 0.8, 6.0, 11, 0.4, "Design Authority  ·  May 2026", size=13, color=MUTED)


# ============================================================
# SLIDE 2 — What Does an AI See?
# ============================================================
s = prs.slides.add_slide(prs.slide_layouts[6])
set_bg(s)

add_text(s, 0.8, 0.4, 11, 0.4, "WHAT DOES AN AI SEE?", size=14, color=MUTED, bold=True)
accent_line(s, 0.8, 0.8)
add_text(s, 0.8, 1.0, 11, 0.8, "An AI reads code by pattern-matching over context", size=32, color=WHITE, bold=True)

add_text(s, 0.8, 2.0, 11, 0.8,
    "When an AI reads your markup, it doesn't \"understand\" your design system.\n"
    "It recognises patterns in the text and predicts what comes next.\n"
    "The more semantic context per line of code, the better its predictions.",
    size=16, color=GREY)

add_text(s, 0.8, 3.3, 5.5, 0.4, "High context (AI reads and understands):", size=14, color=GREEN, bold=True)
code_box(s, 0.8, 3.7, 5.5, 1.6, [
    ('<div className="hz-kpi">', WHITE),
    ('  <span className="hz-kpi-label">', ACCENT),
    ('    System Health', WHITE),
    ('  </span>', ACCENT),
    ('  <span className="hz-kpi-value">', ACCENT),
    ('    <span className="hz-dot green pulse" />', GREEN),
    ('    HEALTHY', GREEN),
    ('  </span>', ACCENT),
    ('</div>', WHITE),
])

add_text(s, 7.0, 3.3, 5.5, 0.4, "Low context (AI has to trace 5 files):", size=14, color=RED, bold=True)
code_box(s, 7.0, 3.7, 5.5, 1.6, [
    ('<KpiCell', WHITE),
    ('  kind="status"', GREY),
    ('  title="System Health"', GREY),
    ('  value="HEALTHY"', GREY),
    ('  tone="pass"', GREY),
    ('  loading={probes.isPending}', GREY),
    ('/>', WHITE),
    ('', GREY),
    ('// What CSS ends up on screen? Read 5 files to find out.', MUTED),
])

add_text(s, 0.8, 5.6, 11.7, 0.8,
    "The Tailwind insight: \"In the age of AI, context is the scarcest resource.\"\n"
    "Utility-first CSS puts styling context next to structure. Class names encode purpose.\n"
    "An AI reads one file and knows everything about the component.",
    size=14, color=MUTED)

add_text(s, 0.8, 6.6, 11.7, 0.3,
    "Source: Silvermine AI — \"The Utility-Semantic Paradox: Tailwind CSS in the Era of Generative AI\"",
    size=10, color=MUTED)


# ============================================================
# SLIDE 3 — The Indirection Problem
# ============================================================
s = prs.slides.add_slide(prs.slide_layouts[6])
set_bg(s)

add_text(s, 0.8, 0.4, 11, 0.4, "THE INDIRECTION PROBLEM", size=14, color=MUTED, bold=True)
accent_line(s, 0.8, 0.8)
add_text(s, 0.8, 1.0, 11, 0.8, "Same KPI card. Two architectures.\nHow many files does an AI read?", size=32, color=WHITE, bold=True)

# Left — CSS-direct
add_text(s, 0.8, 2.3, 5.5, 0.4, "CSS-Direct: 1 file", size=18, color=GREEN, bold=True)
code_box(s, 0.8, 2.8, 5.5, 2.0, [
    ('DemoSupportDashboard.tsx', GREEN),
    ('', GREY),
    ('  <div className="hz-kpi">', WHITE),
    ('    <span className="hz-kpi-label">System Health</span>', GREY),
    ('    <span className="hz-kpi-value">', GREY),
    ('      <span className="hz-dot green pulse" />', GREEN),
    ('      <span style={{color:"var(--green)"}}>HEALTHY</span>', GREEN),
    ('    </span>', GREY),
    ('  </div>', WHITE),
    ('', GREY),
    ('  Markup IS the component. Done.', ACCENT),
])

# Right — Abstracted
add_text(s, 7.0, 2.3, 5.5, 0.4, "Abstracted: 5+ files", size=18, color=RED, bold=True)
code_box(s, 7.0, 2.8, 5.5, 2.0, [
    ('SupportDashboardPage.tsx', RED),
    ('  -> imports KpiStrip.tsx', GREY),
    ('    -> imports KpiCell.tsx', GREY),
    ('      -> imports Text.tsx (inline styles)', GREY),
    ('        -> reads _semantic.css (token values)', GREY),
    ('          -> reads theme-horizon-ui.css (overrides)', GREY),
    ('            -> Tailwind config (utility classes)', GREY),
    ('', GREY),
    ('  5+ files. 4 indirection levels.', RED),
    ('  Each one is a place where values drift.', RED),
    ('  AI must trace the full chain to predict output.', RED),
])

add_text(s, 0.8, 5.2, 11.7, 1.0,
    "Every indirection layer is a cognitive cost for the AI. It reduces prediction accuracy.\n"
    "The abstracted approach requires the AI to understand: TypeScript discriminated unions,\n"
    "Record<> type maps, CSS variable resolution chains, and Tailwind class compilation.\n\n"
    "The CSS-direct approach requires: reading class names.",
    size=14, color=GREY)


# ============================================================
# SLIDE 4 — Semantic Density
# ============================================================
s = prs.slides.add_slide(prs.slide_layouts[6])
set_bg(s)

add_text(s, 0.8, 0.4, 11, 0.4, "SEMANTIC DENSITY", size=14, color=MUTED, bold=True)
accent_line(s, 0.8, 0.8)
add_text(s, 0.8, 1.0, 11, 0.8, "How much meaning does each line carry?", size=32, color=WHITE, bold=True)

add_text(s, 0.8, 2.0, 5.5, 0.4, "CSS-Direct: every token is meaningful", size=14, color=GREEN, bold=True)
code_box(s, 0.8, 2.4, 5.8, 3.2, [
    ('class="hz-kpi"          -> "this is a KPI card"', GREEN),
    ('class="hz-kpi-label"    -> "this is its label"', GREEN),
    ('class="hz-kpi-value"    -> "this is the value"', GREEN),
    ('class="hz-dot green"    -> "green status dot"', GREEN),
    ('class="hz-dot pulse"    -> "it\'s animated (live)"', GREEN),
    ('class="hz-badge red"    -> "red severity badge"', GREEN),
    ('class="check-row"       -> "integrity check row"', GREEN),
    ('class="alert-row"       -> "severity alert block"', GREEN),
    ('class="feed-row"        -> "activity feed entry"', GREEN),
    ('class="tbl"             -> "compact data table"', GREEN),
    ('class="sec-title"       -> "section heading"', GREEN),
    ('', GREY),
    ('var(--green)            -> "status colour: good"', ACCENT),
    ('var(--text-muted)       -> "de-emphasised text"', ACCENT),
    ('var(--sp-2)             -> "spacing unit 2"', ACCENT),
])

add_text(s, 7.0, 2.0, 5.5, 0.4, "Abstracted: meaning hidden in types", size=14, color=RED, bold=True)
code_box(s, 7.0, 2.4, 5.8, 3.2, [
    ('kind="status"           -> what does this render?', RED),
    ('tone="pass"             -> green? which green?', RED),
    ('size="xl"               -> 20px? 24px? 14px?', RED),
    ('weight={600}            -> is this semibold or bold?', RED),
    ('', GREY),
    ('// To answer these, read:', MUTED),
    ('TONE_TO_VALUE: Record<KpiTone, string> = {', GREY),
    ('  pass:    "rag-green",', GREY),
    ('  warn:    "rag-amber",', GREY),
    ('  fail:    "rag-red",', GREY),
    ('  neutral: "primary",', GREY),
    ('};', GREY),
    ('', GREY),
    ('// Then find --rag-green in _semantic.css...', MUTED),
    ('// ...which is empty. It was renamed from --green.', RED),
])

add_text(s, 0.8, 5.9, 11.7, 0.8,
    "In the CSS-direct approach, the class name IS the documentation.\n"
    "An AI reading \"hz-badge green\" immediately knows: severity badge, green status.\n"
    "No type definitions, no mapping tables, no file traversal needed.",
    size=15, color=WHITE)


# ============================================================
# SLIDE 5 — No Markers Needed
# ============================================================
s = prs.slides.add_slide(prs.slide_layouts[6])
set_bg(s)

add_text(s, 0.8, 0.4, 11, 0.4, "NO MARKERS NEEDED", size=14, color=MUTED, bold=True)
accent_line(s, 0.8, 0.8)
add_text(s, 0.8, 1.0, 11, 0.8, "The class names ARE the semantic markers", size=32, color=WHITE, bold=True)

add_text(s, 0.8, 2.0, 11.7, 0.6,
    "We added zero AI-specific annotations. No data-ai-purpose attributes.\n"
    "No special comments. No metadata tags. The structure itself tells the AI everything.",
    size=16, color=GREY)

# Three examples
card(s, 0.8, 3.0, 3.7, 2.5, "Structure = semantics", [
    ('<div class="hz-kpi">', ACCENT),
    ('  <span class="hz-kpi-label">', ACCENT),
    ('  <span class="hz-kpi-value">', ACCENT),
    ('  <span class="hz-kpi-delta positive">', ACCENT),
    ('', GREY),
    ('The HTML hierarchy mirrors the', GREY),
    ('visual hierarchy. Container -> label', GREY),
    ('-> value -> delta. An AI sees the', GREY),
    ('nesting and understands composition.', GREY),
], title_color=GREEN)

card(s, 4.8, 3.0, 3.7, 2.5, "Names = documentation", [
    ('hz-kpi-label   = "this is a label"', ACCENT),
    ('hz-badge green = "green status pill"', ACCENT),
    ('check-row      = "a check in a list"', ACCENT),
    ('pnl-positive   = "positive P&L"', ACCENT),
    ('', GREY),
    ('Descriptive names eliminate the need', GREY),
    ('for comments or annotations. The name', GREY),
    ('tells the AI what the element does', GREY),
    ('and how to use it elsewhere.', GREY),
], title_color=GREEN)

card(s, 8.8, 3.0, 3.7, 2.5, "Tokens = intent", [
    ('var(--green)       = "status: good"', ACCENT),
    ('var(--red)         = "status: bad"', ACCENT),
    ('var(--text-muted)  = "de-emphasised"', ACCENT),
    ('var(--surface-base)= "chrome bg"', ACCENT),
    ('', GREY),
    ('CSS variables are named by purpose,', GREY),
    ('not by value. An AI reads --green', GREY),
    ('and knows it means "positive status"', GREY),
    ('without knowing the hex code.', GREY),
], title_color=GREEN)

add_text(s, 0.8, 5.8, 11.7, 0.8,
    "This is the core architectural insight: when your naming is good enough,\n"
    "the code IS the documentation. AI markers are only needed when the code\n"
    "doesn't explain itself — and utility-first CSS with semantic class names does.",
    size=15, color=WHITE)


# ============================================================
# SLIDE 6 — Copy-Paste Architecture
# ============================================================
s = prs.slides.add_slide(prs.slide_layouts[6])
set_bg(s)

add_text(s, 0.8, 0.4, 11, 0.4, "COPY-PASTE ARCHITECTURE", size=14, color=MUTED, bold=True)
accent_line(s, 0.8, 0.8)
add_text(s, 0.8, 1.0, 11, 0.8, "An AI builds a new page by copying patterns", size=32, color=WHITE, bold=True)

add_text(s, 0.8, 2.0, 5.8, 0.4, "Step 1: AI reads an existing page", size=14, color=ACCENT, bold=True)
code_box(s, 0.8, 2.4, 5.8, 1.5, [
    ('// Existing: integrity check list', MUTED),
    ('<div class="check-row">', WHITE),
    ('  <span class="hz-dot green" />', GREEN),
    ('  <span class="check-label">Trade Recon</span>', GREY),
    ('  <span class="hz-badge green">PASS</span>', GREEN),
    ('</div>', WHITE),
])

add_text(s, 0.8, 4.1, 5.8, 0.4, "Step 2: AI builds a new page from the same vocabulary", size=14, color=ACCENT, bold=True)
code_box(s, 0.8, 4.5, 5.8, 1.5, [
    ('// New page: cargo check list (AI-generated)', MUTED),
    ('<div class="check-row">', WHITE),
    ('  <span class="hz-dot amber pulse" />', AMBER),
    ('  <span class="check-label">Vessel ETA</span>', GREY),
    ('  <span class="hz-badge amber">WARN</span>', AMBER),
    ('</div>', WHITE),
])

add_text(s, 7.2, 2.0, 5.5, 0.4, "Why this works:", size=14, color=WHITE, bold=True)
add_multiline(s, 7.2, 2.5, 5.5, 4.0, [
    ("Self-contained patterns", WHITE),
    ("Each component pattern is visible in the page.", GREY),
    ("No imports to trace. No API to learn.", GREY),
    ("", GREY),
    ("Finite vocabulary", WHITE),
    ("~30 class names make up the entire library.", GREY),
    ("An AI learns them from ONE page.", GREY),
    ("", GREY),
    ("Predictable output", WHITE),
    ("Same class = same result. Always.", GREY),
    ("No runtime conditions, no theme context,", GREY),
    ("no conditional class computation.", GREY),
    ("", GREY),
    ("Contrast: React primitives", RED),
    ("kind x tone x size x weight x role x tabular", RED),
    ("= exponential combination space.", RED),
    ("AI can't predict output without reading source.", RED),
], size=12, font='Calibri')


# ============================================================
# SLIDE 7 — The Vocabulary
# ============================================================
s = prs.slides.add_slide(prs.slide_layouts[6])
set_bg(s)

add_text(s, 0.8, 0.4, 11, 0.4, "THE VOCABULARY", size=14, color=MUTED, bold=True)
accent_line(s, 0.8, 0.8)
add_text(s, 0.8, 1.0, 11, 0.8, "~30 class names = the entire component library", size=32, color=WHITE, bold=True)

# Four columns of classes
cols = [
    ("Layout", [
        ("hz-content-fill", "viewport-filling page"),
        ("hz-header", "top bar"),
        ("hz-sidebar", "navigation panel"),
        ("hz-status-bar", "bottom bar"),
        ("dash", "3-column grid"),
        ("dash-col", "grid column"),
        ("kpis", "KPI strip row"),
    ]),
    ("Data display", [
        ("hz-kpi", "KPI card"),
        ("hz-kpi-label", "KPI label text"),
        ("hz-kpi-value", "KPI value text"),
        ("hz-kpi-delta", "KPI change indicator"),
        ("tbl", "compact data table"),
        ("hz-badge", "status pill"),
        ("hz-dot", "status dot"),
    ]),
    ("Content rows", [
        ("check-row", "integrity check"),
        ("check-label", "check name text"),
        ("check-detail", "check sub-detail"),
        ("alert-row", "severity alert"),
        ("feed-row", "activity entry"),
        ("sec-title", "section heading"),
        ("eod-footer", "footer summary"),
    ]),
    ("Modifiers", [
        (".green / .red / .amber", "RAG status"),
        (".pulse", "animated (live)"),
        (".positive / .negative", "P&L direction"),
        (".neutral", "no status"),
        ("font-mono", "monospace text"),
        ("text-amber", "amber text"),
        ("pnl-positive", "profit value"),
    ]),
]

for i, (title, items) in enumerate(cols):
    x = 0.5 + i * 3.15
    add_text(s, x, 2.0, 3.0, 0.35, title, size=13, color=ACCENT, bold=True)
    for j, (cls, desc) in enumerate(items):
        y = 2.4 + j * 0.55
        add_text(s, x, y, 1.5, 0.3, cls, size=10, color=WHITE, font='Consolas')
        add_text(s, x + 1.55, y, 1.5, 0.3, desc, size=10, color=MUTED)

add_text(s, 0.8, 6.4, 11.7, 0.6,
    "An AI that knows these 30 names can build any page in the system.\n"
    "Compare: the React primitive library had 63 exported types, 15 component props interfaces,\n"
    "and 8 discriminated unions — an API surface that grows exponentially with every new prop.",
    size=14, color=GREY)


# ============================================================
# SLIDE 8 — One-File Theming
# ============================================================
s = prs.slides.add_slide(prs.slide_layouts[6])
set_bg(s)

add_text(s, 0.8, 0.4, 11, 0.4, "ONE-FILE THEMING", size=14, color=MUTED, bold=True)
accent_line(s, 0.8, 0.8)
add_text(s, 0.8, 1.0, 11, 0.8, "An AI reskins the entire app by editing :root", size=32, color=WHITE, bold=True)

code_box(s, 0.8, 2.2, 5.8, 4.5, [
    ('/* tokens.css — the ENTIRE design system */', MUTED),
    ('', GREY),
    (':root {', WHITE),
    ('  /* Surfaces */', MUTED),
    ('  --surface-canvas: #09090b;', GREY),
    ('  --surface-base:   #0f0f12;', GREY),
    ('  --card-bg:        #141417;', GREY),
    ('', GREY),
    ('  /* Text */', MUTED),
    ('  --text-primary:   #fafafa;', GREY),
    ('  --text-muted:     #71717a;', GREY),
    ('', GREY),
    ('  /* Status */', MUTED),
    ('  --green: #22c55e;', GREEN),
    ('  --red:   #ef4444;', RED),
    ('  --amber: #f59e0b;', AMBER),
    ('', GREY),
    ('  /* Type scale */', MUTED),
    ('  --text-xs:   0.6875rem;  /* 11px */', GREY),
    ('  --text-sm:   0.8125rem;  /* 13px */', GREY),
    ('  --text-base: 0.875rem;   /* 14px */', GREY),
    ('}', WHITE),
])

add_text(s, 7.2, 2.2, 5.5, 0.4, "What an AI can do with this:", size=14, color=WHITE, bold=True)

card(s, 7.2, 2.7, 5.3, 1.2, "Rebrand", [
    ("Change --accent from #4f46e5 (indigo) to #0ea5e9 (sky blue).", GREY),
    ("Every button, link, active state, and brand touch updates.", GREY),
    ("Zero component code changes. Zero build steps.", GREY),
], title_color=ACCENT)

card(s, 7.2, 4.1, 5.3, 1.2, "Dark / Light", [
    ("[data-theme=\"light\"] overrides the same variables.", GREY),
    ("--surface-canvas: #f8fafc; --text-primary: #0f172a;", GREY),
    ("Toggle one attribute on <html>, everything flips.", GREY),
], title_color=ACCENT)

card(s, 7.2, 5.5, 5.3, 1.2, "Density adjustment", [
    ("Change --text-xs from 11px to 10px.", GREY),
    ("Every label, badge, table header, and meta text tightens.", GREY),
    ("The entire app gets denser from one value change.", GREY),
], title_color=ACCENT)


# ============================================================
# SLIDE 9 — The Handover
# ============================================================
s = prs.slides.add_slide(prs.slide_layouts[6])
set_bg(s)

add_text(s, 0.8, 0.4, 11, 0.4, "THE HANDOVER", size=14, color=MUTED, bold=True)
accent_line(s, 0.8, 0.8)
add_text(s, 0.8, 1.0, 11, 0.8, "CSS files in, CSS files out", size=32, color=WHITE, bold=True)

# 5-step flow
steps = [
    ("1", "Design", "HTML prototype\niterates (v43, v44...)", ACCENT),
    ("2", "Extract", "tokens.css\nshell.css\n{page}.css", ACCENT),
    ("3", "Drop in", "Replace CSS files\nin production repo", GREEN),
    ("4", "Wire data", "Replace static strings\nwith API hooks", GREEN),
    ("5", "Verify", "Screenshot both\nconfirm pixel match", GREEN),
]

for i, (num, title, desc, col) in enumerate(steps):
    x = 0.6 + i * 2.45
    number_circle(s, x + 0.5, 2.3, num, col)
    add_text(s, x, 2.95, 2.2, 0.35, title, size=16, color=WHITE, bold=True, align=PP_ALIGN.CENTER)
    add_text(s, x, 3.3, 2.2, 1.2, desc, size=12, color=GREY, align=PP_ALIGN.CENTER)

# Arrow between each step
for i in range(4):
    x = 2.1 + i * 2.45
    add_text(s, x, 2.35, 0.5, 0.4, "->", size=18, color=MUTED, bold=True)

add_text(s, 0.8, 4.8, 11.7, 0.4, "What this eliminates:", size=16, color=RED, bold=True)

card(s, 0.8, 5.2, 3.7, 1.5, "No component specs", [
    ("Previously: 120-property measurement", GREY),
    ("documents that drifted on every handover.", GREY),
    ("Now: the CSS file IS the spec.", GREY),
], title_color=RED)

card(s, 4.8, 5.2, 3.7, 1.5, "No token audits", [
    ("Previously: comparing values across files", GREY),
    ("that used different names for the same thing.", GREY),
    ("Now: one file, one truth.", GREY),
], title_color=RED)

card(s, 8.8, 5.2, 3.7, 1.5, "No React wrappers", [
    ("Previously: abstraction layers that added", GREY),
    ("complexity without adding value.", GREY),
    ("Now: class names in JSX. Done.", GREY),
], title_color=RED)


# ============================================================
# SLIDE 10 — Summary
# ============================================================
s = prs.slides.add_slide(prs.slide_layouts[6])
set_bg(s)

add_text(s, 0.8, 0.4, 11, 0.4, "SUMMARY", size=14, color=MUTED, bold=True)
accent_line(s, 0.8, 0.8)
add_text(s, 0.8, 1.0, 11, 0.8, "AI-friendliness is not a feature.\nIt's an emergent property of good architecture.", size=32, color=WHITE, bold=True)

points = [
    ("Co-location", "Style, structure, and semantics in one file. An AI reads one file, knows everything."),
    ("Semantic naming", "Class names describe purpose: hz-kpi, hz-badge, check-row. No annotations needed."),
    ("Flat vocabulary", "30 class names vs 63 types + 15 interfaces + 8 unions. AI learns from one page."),
    ("Zero indirection", "1 file path to rendered output vs 5+ files through abstraction layers."),
    ("Token architecture", "CSS variables named by intent, declared in one :root block, changed in one place."),
    ("Framework agnostic", "Works in React, Vue, Svelte, plain HTML. The CSS is the design system, not the JS."),
]

for i, (title, desc) in enumerate(points):
    y = 2.6 + i * 0.7
    add_text(s, 0.8, y, 2.5, 0.35, title, size=16, color=ACCENT, bold=True)
    add_text(s, 3.5, y, 9.0, 0.35, desc, size=14, color=GREY)

add_text(s, 0.8, 6.9, 11.7, 0.3,
    "horizon-ui-templates  ·  github.com/sitebyte  ·  Design Authority 2026",
    size=11, color=MUTED)


# ============================================================
out = "/Users/jonathancobley/projects/horizon-ui-templates/analysis/horizon-ai-friendly-architecture.pptx"
prs.save(out)
print(f"Saved: {out}")
