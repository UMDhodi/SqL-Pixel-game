# ⚔️ Pixel Dungeon Codex (16-Bit SQL Learning Platform)

> **Master SQL from Novice to Advanced through 16-Bit Retro Dungeon Battles.**  
> Built for aspiring and practicing **Data Analysts, Data Scientists, and Analytics Engineers**.

---

## 🎮 Features at a Glance

1. **Retro-Brutalist 16-Bit Pixel RPG Battler**
   - Animated pixel canvas featuring player hero casting SQL spell attacks against dungeon bosses.
   - Dynamic boss encounters with segmented 20-tick HP meters, hit-shake effects, and floating critical damage numbers.
   - Built strictly to the specifications of [`DESIGN.md`](./DESIGN.md) (`Space Mono` + `JetBrains Mono`, 0px border radius, sharp pixel drop shadows, and cyber mana highlights).

2. **Zero-Backend Database Sign-In & Persistence**
   - **No Database Required**: Player profiles, character classes, unlocked chapters, and daily streaks persist 100% locally in `localStorage` and `IndexedDB`.
   - **Adventure Save Scrolls**: Encodes your entire save state into a portable `CODEX-SCROLL-V1-...` string or downloadable `.codex-save` JSON file to resume your dungeon run anywhere.

3. **High-Performance In-Browser Analytical SQL Engine**
   - Powered by an embedded client-side analytical SQL database (`alasql` / SQL Wasm engine).
   - Pre-seeded with over **10,000+ realistic enterprise rows**:
     - `customers`: 300+ adventurer profiles with lifetime values, tiers, and realms.
     - `orders`: 1,200+ transactional sales records.
     - `order_items`: 3,000+ itemized product lines.
     - `products`: Armory items, prices, wholesale costs, and stock levels.
     - `user_events`: 4,500+ telemetry rows for Data Science retention and session analytics.
     - `boss_monsters`: Boss stats and weakness mappings.

4. **Strict Progression Gates & Practical Case Studies**
   - Each chamber ends with a **Mandatory Gatekeeper Case Study**:
     - *Chapter 1*: **The Slime Hoard Audit** (`SELECT`, `WHERE`, `ORDER BY`, `LIMIT`)
     - *Chapter 2*: **The Lost Merchant Guild** (`INNER JOIN`, `LEFT JOIN`, aliases)
     - *Chapter 3*: **The Goblin Treasury Ledger** (`GROUP BY`, `HAVING`, `SUM`, `COUNT`)
     - *Chapter 4*: **The Shadow Infiltrator** (Scalar & membership subqueries)
     - *Chapter 5*: **The Arch-Lich Chronomancer** (Window functions: `ROW_NUMBER() OVER (...)`)
     - *Chapter 6*: **The Grand SQL Wyrm Final Exam** (Common Table Expressions: `WITH regional_revenue AS (...)`)
   - **Next chapters remain locked** until you achieve a passing validation test against the boss!
   - 3-Tier Hint Oracle with concept tips, scaffold clauses, and full rune solutions.

5. **Daily SQL Bounty Chamber**
   - Date-seeded daily query challenges with streak tracking flame counter and XP rewards.

6. **Plain-English Explanations & Real-World Analogies**
   - Every lesson includes concept breakdowns in easy conversational language, relatable dungeon metaphors, and instant starter scrolls.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node v22)
- npm 9+

### 2. Development Mode
Run the development server with Hot Module Replacement:
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Production Build
Compile optimized assets to the `dist/` directory:
```bash
npm run build
```
Preview the production build:
```bash
npm run preview
```

---

## 📜 Keyboard Shortcuts & Controls
- **Ctrl + Enter** (or **Cmd + Enter**): Cast Query (Execute SQL)
- **Top HUD**: Click on Player Card to export/import save scrolls or switch career roles.
- **Flame Icon**: View and load today's Daily Bounty query.
- **Reset DB**: Instantly restore the in-browser database to pristine default records.

---

## 🎨 Design System
Follows [`DESIGN.md`](./DESIGN.md) specification:
- Background: `#0a0f1d` (Surface Abyss)
- Panel containers: `#0d1527` (Surface Chamber)
- Mana Core: `#00f2fe`
- Quest Gold: `#fbbf24`
- Boss Crimson: `#ef4444`
- Fonts: `Space Mono` & `JetBrains Mono`
