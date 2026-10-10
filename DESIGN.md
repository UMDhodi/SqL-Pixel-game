---
name: Pixel Dungeon Codex
colors:
  surface: '#0e1321'
  surface-dim: '#0e1321'
  surface-bright: '#343948'
  surface-container-lowest: '#090e1c'
  surface-container-low: '#161b2a'
  surface-container: '#1a1f2e'
  surface-container-high: '#252a39'
  surface-container-highest: '#303444'
  on-surface: '#dee2f6'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#dee2f6'
  inverse-on-surface: '#2b303f'
  outline: '#849495'
  outline-variant: '#3a494b'
  surface-tint: '#00dce6'
  primary: '#e0fdff'
  on-primary: '#00373a'
  primary-container: '#00f2fe'
  on-primary-container: '#006a70'
  inverse-primary: '#00696f'
  secondary: '#ffc640'
  on-secondary: '#402d00'
  secondary-container: '#e3aa00'
  on-secondary-container: '#5a4100'
  tertiary: '#e1ffec'
  on-tertiary: '#003824'
  tertiary-container: '#67f4b7'
  on-tertiary-container: '#006e4b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ff6ff'
  primary-fixed-dim: '#00dce6'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f53'
  secondary-fixed: '#ffdf9f'
  secondary-fixed-dim: '#f9bd22'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5c4300'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0e1321'
  on-background: '#dee2f6'
  surface-variant: '#303444'
typography:
  display:
    fontFamily: Space Mono
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: Space Mono
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Space Mono
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Space Mono
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 30px
  headline-md:
    fontFamily: Space Mono
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  headline-sm:
    fontFamily: Space Mono
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 24px
  body-lg:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  code-snippet:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 20px
  label-lg:
    fontFamily: Space Mono
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.06em
  label-md:
    fontFamily: Space Mono
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.05em
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system blends 16-bit retro RPG dungeon crawlers with a cyberpunk developer IDE. Designed for technical learners, database engineers, and students mastering SQL through gamified quest loops, the aesthetic balances playful 90s nostalgia with modern data tooling ergonomics.

The visual style is **Retro-Brutalist Arcade**:
- Crisp, un-antialiased silhouettes, stepped pixel corners, and thick 2px–3px borders simulate CRT monitors and high-end retro inventory screens.
- Dark, atmospheric indigo-slate depths evoke ancient digital catacombs.
- Neon cyber-mana highlights, radiant loot golds, and runic terminal typography ensure technical legibility without sacrificing the fantasy theme.
- Interactive states prioritize tactile feedback: depressed states shift 2px down/right, borders switch to luminous mana cyan, and critical alerts ignite with dungeon-boss crimson.

## Colors

The palette leverages high-contrast luminescence against deep void backgrounds to mimic glowing pixel displays:

- **Dungeon Substrates (Neutrals):**
  - Surface Abyss: `#0a0f1d` (Core app canvas, terminal background)
  - Surface Chamber: `#0d1527` (Card panels, sidebar navigations, grimoire drawers)
  - Surface Crypt: `#131e38` (Active inventory slots, hover tiers, nested code blocks)
  - Surface Border: `#1e293b` (Subtle boundary borders)
  - Surface Highlight Border: `#334155` (Chiseled panel edges)

- **Cyber Mana (Primary):**
  - Mana Core: `#00f2fe` (Interactive highlights, quest completion links, primary spell buttons)
  - Mana Glow: `#38bdf8` (Secondary focus halos, telemetry links, SQL keywords)

- **Quest Gold (Secondary):**
  - Treasure Radiant: `#fbbf24` (XP badges, legendaries, coin meters, milestone headers)
  - Treasure Deep: `#f59e0b` (Active achievements, rank borders, progress fill)

- **Elemental Indicators (Semantic):**
  - Emerald Glyph (Success / Valid Query): `#10b981`
  - Boss Crimson (Syntax Error / Boss Encounter / Critical Warning): `#ef4444`
  - Arcane Violet (Database Index / Foreign Key Tag): `#a855f7`

- **Typography & Content Text:**
  - Parchment White: `#f8fafc` (Headings, primary values)
  - Slate Rune: `#94a3b8` (Muted labels, secondary parameters, code comments)

## Typography

The typography strategy unites pixel arcade presentation with high-performance code clarity:

- **Display & Section Headers:** Set in `Space Mono` in uppercase styling to echo vintage computer terminals and arcade scoreboards, while retaining legible structural proportions.
- **Body & Query Code:** Rendered strictly in `JetBrains Mono` to optimize query reading, data table columns, syntax trees, and prompt instructions. Ligatures and distinctive glyphs prevent confusion between `0` (zero) and `O` (letter), or `1`, `l`, and `I`.
- **Labels & Micro-UI:** Set in capitalized `Space Mono` or dense `JetBrains Mono` with expanded tracking to evoke arcade HUD metrics (e.g., `LVL 42`, `MANA: 100/100`, `200 OK`).

## Layout & Spacing

The layout is built upon an 8-bit modular rhythm adhering strictly to 4px and 8px multiples:

- **Grid Architecture:** 
  - Desktop: 12-column split-pane layout with 24px gutters, prioritizing a dual-pane "Grimoire / Battle Terminal" workflow (Quest objectives on the left, SQL IDE & Output schema on the right).
  - Tablet: 8-column layout with 16px gutters, collapsible quest objectives drawer.
  - Mobile: Single-column full-width stack with tabs switching between the "Dungeon Log" and "Query Terminal".
- **Density:** High information density. Component internals use compact paddings (`space-xs` and `space-sm`) to maximize code visible per viewport without scrolling.
- **Rhythm Rules:** Never use odd pixel spacing. All structural gaps snap to `space-xs` (4px), `space-sm` (8px), `space-md` (16px), `space-lg` (24px), or `space-xl` (40px).

## Elevation & Depth

In place of soft Gaussian blurs, this design system utilizes **Tactile Chiseled Pixel Depth** and **CRT Phosphor Glows**:

- **Hard Pixel Drop Shadows:** Depth is produced using rigid, unblurred offsets:
  - Base Card / Panel: `3px 3px 0px 0px #030712`
  - Elevated Container / Dialog: `5px 5px 0px 0px #030712`
  - Floating Grimoire Modal: `8px 8px 0px 0px #000000`
- **Bevels & Double Borders:**
  - Outer border: 2px solid `#1e293b`
  - Inner inset border: 1px solid `#334155`
  - Active/Focused: Outer border flips to `#00f2fe` with an inner border of `#0d1527` and a soft ambient phosphorescent backlight (`0 0 12px rgba(0, 242, 254, 0.25)`).
- **Physical Depress Mechanism:** Interactive components (buttons, item tiles) visually press down upon activation (`:active`), shifting `transform: translate(2px, 2px)` while reducing shadow offset by 2px.

## Shapes

The design system is strictly **Sharp (`roundedness: 0`)**. 

- **Pixel Geometry:** Rounded radii are completely prohibited (`border-radius: 0px`).
- **Corner Stepping:** Complex hero cards and legendary item badges utilize a CSS `clip-path` stepped polygon to mimic authentic 8-bit diagonal cutouts (`clip-path: polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))`).
- **Dividers:** Clean, jagged, or dashed 2px pixel dividers with alternating opacity to denote structural partitions.

## Components

- **Action Buttons (Runes & Spellcasts):**
  - *Primary (Cast Query):* Background `#00f2fe`, text `#0a0f1d`, 2px solid `#f8fafc`, hard shadow `3px 3px 0px #030712`. Font `Space Mono` uppercase bold. Active state: translate `2px, 2px` with `1px 1px 0px` shadow.
  - *Secondary (Reset Schema):* Background `#0d1527`, text `#f8fafc`, 2px solid `#334155`, hover border `#38bdf8`.
  - *Boss / Danger (Drop Database):* Background `#ef4444`, text `#f8fafc`, 2px solid `#7f1d1d`.

- **Grimoire Badges & Loot Chips:**
  - Inventory badges representing data types (`VARCHAR`, `INT`, `FOREIGN KEY`) and SQL power levels.
  - Rectangular token frames: 2px solid `#fbbf24` (Gold/Legendary), `#00f2fe` (Rare), `#10b981` (Common).
  - Background `#131e38`, font size `11px`, tracking `0.08em`.

- **SQL Terminal & Editor Panel:**
  - Background `#0a0f1d` with an inner 1px border of `#1e293b`.
  - Header bar styled as a vintage CRT window header containing "CHAMBER 04: THE JOIN CATACOMBS" and retro window icons (underscore, square, X).
  - Cursor: Blinking rectangular solid block in `#00f2fe`.

- **Inventory Grid (Schema & Table Explorer):**
  - 48px × 48px square slots with 2px borders (`#1e293b`). Empty slots render with a faint inner checkerboard pixel pattern.
  - Hovering a table slot highlights the border in `#38bdf8` and opens an arcade tooltip box displaying row count and column schemas.

- **Checkboxes & Radios (Quest Objectives):**
  - Checkbox: 16px × 16px sharp square, 2px border `#334155`, unrounded. When checked, fills with `#10b981` displaying a crisp 2-bit pixelated checkmark.
  - Radio: 16px × 16px diamond/square cutout, inner filled 6px square in `#00f2fe` when selected.

- **Input Fields (Terminal Prompts):**
  - Surface `#0a0f1d`, border 2px solid `#334155`, text `#f8fafc`. 
  - Prefix with neon cyan chevron `>` prompt glyph. Focus switches border to `#00f2fe` with a subtle mana glow.

- **Dungeon Boss Status Bars (Health / Boss HP / Query Execution Time):**
  - Segmented pixel meter with a 2px outer casing in `#f8fafc`.
  - Fill contains discrete vertical pixel ticks (4px blocks with 1px gaps) alternating between `#ef4444` (Boss HP) and `#00f2fe` (Mana/Progress).