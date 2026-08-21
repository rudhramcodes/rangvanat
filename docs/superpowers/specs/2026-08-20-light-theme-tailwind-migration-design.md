# Rangvanat — Light Theme + Tailwind Migration Design

Date: 2026-08-20
Status: Approved (user: "yes" after design review)
Path: Architectural (full restyle + CSS→Tailwind migration)

## Objective

Switch the entire site from the dark-red (oxblood) theme to a light, warm,
"handmade Khadi" theme modeled on the existing **founder section** (parchment
background, espresso ink, terracotta arch, heritage accents). Simultaneously
migrate all custom CSS (~3,418 lines in `src/index.css`) into Tailwind
utility classes in the JSX, keeping in CSS only what Tailwind cannot express.

User constraints (verbatim intent):
- "Everything light" — no dark contrast blocks remain (mobile menu, artisans
  section, footer, timeline all go light).
- Full migration to Tailwind; "only use CSS if needed".
- Spacing/layout must not break anywhere.

## Current State (measured)

- `src/index.css`: 3,418 lines, 174 unique custom classes referenced from JSX,
  8 `@media` blocks, ~142 `var(--color-*)` usages.
- JSX surface: `src/App.jsx` (1,372 lines, 139 className attrs),
  `src/components/CollectionsPage.jsx` (377), `ProductPage.jsx` (130),
  `Preloader.jsx` (109).
- Tailwind v4.3.3 via `@tailwindcss/vite` — CSS-first config in `@theme`
  (no `tailwind.config.js`), `@import "tailwindcss"` at top of index.css.
- Fonts: Bebas Neue (display), Questrial (sans/subhead). Gold shimmer gradient.
- Motion: animejs v4 (JS-driven reveals), gsap/ScrollTrigger, CSS grain overlay,
  CSS marquee keyframes. Lenis was removed (native scroll).

## Palette (single source of truth — token names unchanged, values re-mapped)

| Token | Dark value | New light value | Role |
|---|---|---|---|
| `--color-oxblood` | `#5e1b10` | `#5e1b10` | deep ink for blockquote/strong (as in founder section) |
| `--color-espresso` | `#2a0e06` | `#2a0e06` | primary ink / text |
| `--color-parchment` | `#efe3cb` | `#efe3cb` | panel/section accent bg |
| `--color-ivory` | `#fbf6ec` | `#fbf6ec` | **main page background** (body) |
| `--color-champagne` | `#e8d9ae` | `#e8d9ae` | secondary surface / hairline borders |
| `--color-heritage` | `#b34a1a` | `#b34a1a` | eyebrows, links, accents |
| `--color-terracotta` | `#d08a5a` | `#d08a5a` | warm panels / CTA accents (founder arch) |
| `--color-brass` | `#cfa158` | `#cfa158` | shimmer / stars / sparkle |

Body: `bg-ivory` + `text-espresso`. Sections use parchment/champagne surfaces.

Note: token **names** stay identical so utility classes like `bg-oxblood`
still compile — but their meaning flips to ink-accent. Where a token's name
is misleading after the flip (e.g. `bg-oxblood` meaning dark bg), the class
is replaced in JSX by the correct light utility during migration.

## Migration strategy

### What moves into JSX (Tailwind utilities)
All layout, spacing, color, typography, and breakpoint behavior currently
expressed as custom classes:
- spacing (padding/margin/gap/width/height) → `p-*`, `m-*`, `gap-*`, `w-*`
- colors → `bg-*`, `text-*`, `border-*` from re-mapped `@theme` tokens
- typography → `font-*`, `text-*`, `tracking-*`, `uppercase`
- breakpoints → `max-md:`, `max-lg:`, `max-sm:` (Tailwind v4 max-* variants
  match the existing max-width media queries)
- clamp() → arbitrary values `text-[clamp(1.1rem,3vw,2rem)]`
- fallback `bg-[var(--color-x)]` only where a token utility name would be
  ambiguous/misleading mid-migration

### What stays in CSS (~600-800 lines target)
1. `@theme` tokens + font stacks
2. `@layer base` (body, font families, scroll-behavior, reduced-motion block)
3. Keyframes: `grain-shift`, marquee scroll, preloader, shimmer
4. Grain texture overlay (`.grain::before` SVG noise + `.grain-overlay`)
5. CTA hover sheen + ghost-text char animations (`.cta-sheen`, `.cta-text--ghost`,
   `.cta-char` stagger)
6. Desktop nav underline `::after` hover grow
7. Care-label thread draw + link-arrow animations
8. FAQ open/close transitions
9. Any stateful pseudo-element selectors without Tailwind equivalents

## Migration order (each step visually verified before the next)

1. **Token re-map + body base** — flip `@theme` values + `body` to light.
   Colors change site-wide; layout untouched. Zero layout risk step.
2. **App.jsx — header/nav/mobile-menu**
3. **App.jsx — hero, story, heritage, founder**
4. **App.jsx — timeline, craft/process, artisans, why**
5. **App.jsx — collections, questions, faq, closing, footer**
6. **CollectionsPage.jsx** — toolbar, search, filters, layout toggle, cards
7. **ProductPage.jsx + Preloader.jsx**
8. **index.css purge** — remove migrated rules; keep only necessary CSS
9. **Full visual QA** desktop + mobile; `eslint` + `build`

## Spacing/layout safety

- Step 1 changes colors only → cannot break layout.
- Every later step converts values 1:1 (same px/em/clamp/gap values, expressed
  as utilities) — no layout math changes.
- Screenshot before/after at 1280×900 and 390×844 for each phase.
- Route coverage at final QA: home (all sections), collections (search,
  filters, chip, layout toggle, no-results), product page, mobile menu,
  back/forward, anchor nav.

## Open decisions (resolved)

- Body background: **ivory `#fbf6ec`** with parchment section panels
  (recommended, approved by user via design "yes").

## Out of scope

- No new features. No copy changes. No dependency changes.
- No font changes. Motion behavior preserved (colors/contrast only).