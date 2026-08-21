# Rangvanat Light Theme + Tailwind Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Switch the entire Rangvanat site from the dark-red (oxblood) theme to a light, warm "handmade Khadi" theme modeled on the existing founder section, and migrate all custom CSS (~3,419 lines in `src/index.css`) into Tailwind utility classes in the JSX — keeping in CSS only what Tailwind cannot express.

**Architecture:** The project already runs Tailwind v4.3.3 via `@tailwindcss/vite` with CSS-first config (`@theme` block at the top of `src/index.css`). The migration is: (1) re-map the `@theme` color tokens to light values (token names unchanged, so every existing utility like `bg-oxblood` keeps compiling), (2) convert each custom class in JSX to Tailwind utilities section by section, (3) delete the migrated CSS rules, leaving only keyframes, grain texture, CTA char animations, nav underlines, reduced-motion, and base-layer rules.

**Tech Stack:** React 19, Vite 8, Tailwind CSS v4.3.3 (`@tailwindcss/vite`), animejs v4 (JS reveals — untouched), gsap/ScrollTrigger (untouched), lucide-react. Native scroll (Lenis already removed).

**Spec:** `docs/superpowers/specs/2026-08-20-light-theme-tailwind-migration-design.md`

## Global Constraints

1. **Token values (exact, from spec):** token **names** stay identical; values stay identical for most — only *roles* change. `oxblood #5e1b10` = deep ink accent (blockquote/strong); `espresso #2a0e06` = primary ink/text; `parchment #efe3cb` = section panel bg; `ivory #fbf6ec` = **main page background**; `champagne #e8d9ae` = secondary surface/hairline borders; `heritage #b34a1a` = eyebrows/links/accent; `terracotta #d08a5a` = warm panels (founder arch); `brass #cfa158` = shimmer/stars/sparkle.
2. **Body base:** `bg-ivory text-espresso` (body), `overflow-x: clip`. Sections alternate `bg-parchment` / `bg-ivory` / `bg-champagne/40`; NO dark backgrounds remain anywhere (mobile menu, artisans, footer, timeline, hero all go light).
3. **Everything light** — the user explicitly rejected keeping dark contrast blocks.
4. **Full migration:** every custom class named in JSX is replaced by Tailwind utilities; `src/index.css` ends at roughly 600-800 lines containing ONLY: `@theme`, `@layer base`, keyframes (`grain-shift`, marquee), grain/weave background-image classes, CTA sheen/ghost-char animation rules, `.desktop-nav a::after` + `.care-label nav a::after` underline, FAQ open/close, closing-underline, `prefers-reduced-motion`, and any pseudo-element selectors without Tailwind equivalents.
5. **Layout values are sacred:** every px/em/clamp/gap/margin/padding converts 1:1 to its Tailwind equivalent. Do NOT "improve" spacing. If a computed style differs from the pre-migration value at any breakpoint, it is a bug.
6. **Breakpoints:** CSS `@media (max-width: 1023px)` → Tailwind `max-lg:`; `@media (max-width: 640px)` → `max-sm:`. Tailwind v4's `max-lg` is `<= 1023.9px`, matching the intent. Use `max-lg:`/`max-sm:` variants on the SAME element, exactly like the media blocks.
7. **Fonts:** `font-display`, `font-subhead`, `font-sans` utilities come from `@theme` `--font-*` (already defined). `h1/h2/blockquote` → `font-display`; `h3` → `font-subhead`.
8. **Text on light:** former `rgba(232,217,174,0.76)` (champagne body text on dark) becomes `text-espresso/75`; `rgba(42,14,6,0.62-0.74)` (espresso translucent) stays espresso with matching alpha (`.text-espresso/60`–`/75`). `rgba(251,246,236,...)` (ivory text) becomes `text-espresso`. Brass `rgba(207,161,88,...)` borders/fills stay brass.
9. **Grain overlay** stays dark-on-light: `.grain-overlay` opacity 0.05 on light (was 0.08 on dark) — adjust only if visual QA shows the grain is too loud; do not remove the class or animation.
10. **Verification protocol (every task):** dev server on port 5199 (`npm run dev -- --port 5199`). Before starting a task, screenshot the section at 1280×900 and 390×844 (Playwright `browser_resize` + screenshot). After the task, screenshot the same views and compare element-for-element: background colors light, text contrast OK, no overlap/overflow, spacing identical. Run `npx eslint src/` and `npm run build` at the end of each task. Do not commit unless the user asks.
11. **Do not touch** `src/lib/lookbook.js`, `src/lib/motion.js`, `package.json`, or any animation logic in JSX (animejs/gsap calls, refs, `useReveal`). Only `className` strings and `src/index.css` change.
12. **`section[id]` scroll-margin:** keep as a base-layer rule (or `scroll-mt-20` class on each `<section id=...>` — pick ONE, keep consistent; base rule is simpler, do that).

---

## File Structure

- `src/index.css` — the ONLY stylesheet. Starts 3,419 lines. Ends ~600-800 lines. Tasks delete rules from it after migrating.
- `src/App.jsx` — 1,372 lines. All home-page sections + Header/Footer + routing. Tasks 1-7.
- `src/components/CollectionsPage.jsx` — 377 lines. Lookbook page. Tasks 8-9.
- `src/components/ProductPage.jsx` — 130 lines. Product detail. Task 10.
- `src/components/Preloader.jsx` — 109 lines. Task 11.

Order matters: Task 1 first (global flip, zero layout risk), then Header/hero down the page, then sub-pages. Every task ends with CSS lines deleted for that section AND a visual verify.

---

### Task 1: Global token re-map + body/base layer

**Files:**
- Modify: `src/index.css:3-20` (`@theme`), `src/index.css:22-60` (`@layer base`), `src/index.css:146-315` (header/global rules that will be migrated in later tasks — in THIS task only `body`, `html`, `@theme`, font stacks)
- Test: visual — run dev server, confirm page background is ivory, text espresso, all dark-red sections still dark-red *styling classes* render but body is light.

**Interfaces:**
- Produces: the light token set every later task depends on. `--color-*` names unchanged so `bg-oxblood text-champagne` still compile (meaning: ink accent + secondary surface).

- [ ] **Step 1: Re-map `@theme` tokens**

Edit `src/index.css:3-20` so the comment + values reflect the light palette. **Names and hex values stay exactly as listed in Global Constraint 1** — the ONLY change is the comment block (dark → light description) and confirming the order:

```css
@theme {
  /* Light editorial luxury — ivory paper #FBF6EC, espresso ink #2A0E06 */
  --color-oxblood: #5e1b10;
  --color-heritage: #b34a1a;
  --color-brass: #cfa158;
  --color-champagne: #e8d9ae;
  --color-ivory: #fbf6ec;
  --color-parchment: #efe3cb;
  --color-espresso: #2a0e06;
  --color-terracotta: #d08a5a;
  --color-emerald: #1f3d2b;

  --font-display: "Bebas Neue", Georgia, serif;
  --font-sans: "Questrial", ui-sans-serif, system-ui, sans-serif;
  --font-subhead: "Questrial", ui-sans-serif, system-ui, sans-serif;

  --gold-shimmer: linear-gradient(120deg, #cfa158 0%, #e8d9ae 45%, #cfa158 100%);
}
```

(If no value lines change, this step is just the comment + verification — that is expected and fine.)

- [ ] **Step 2: Update `@layer base` body rule**

Edit `src/index.css:42-47`:

```css
  body {
    @apply bg-ivory text-espresso antialiased;
    letter-spacing: 0;
    overflow-x: clip;
    background-color: var(--color-ivory);
  }
```

- [ ] **Step 3: Verify visually**

Run `npm run dev -- --port 5199`. Navigate to `http://localhost:5199`. Confirm: page background `#fbf6ec`, text `#2a0e06`, hero still dark (migrated later), all layout identical to before (only body bg + text color changed). Screenshot at 1280×900 and 390×844, compare with pre-change screenshot. Check every section: same positions, same paddings, same fonts.

- [ ] **Step 4: Lint + build**

```bash
npx eslint src/
npm run build
```

Expected: clean lint, build success.

- [ ] **Step 5: Commit**

```bash
git add src/index.css
git commit -m "feat(theme): flip palette tokens + body base to light ivory/espresso"
```

---

### Task 2: Grain/weave utilities + Preloader + site-header/nav shell (colors first, no layout change)

**Files:**
- Modify: `src/index.css` lines 61-316 (base globals: `em`, reduced-motion, `.weave`, `.weave-espresso`, `.site-header`, `.logo-link`, `.desktop-nav`, `.header-actions`, `.menu-toggle`, `.mobile-menu*`, `.socials`, `.preloader-grain`, `.preloader-brand`)
- Test: `src/App.jsx` + `src/components/Preloader.jsx` visual at 1280×900 & 390×844.

**Interfaces:**
- Consumes: Task 1 token set.
- Produces: light header/mobile-menu/grain. Establishes the class→utility mapping pattern ALL later tasks copy (listed in Steps 3-4).

- [ ] **Step 1: Keep-only base rules**

In `src/index.css:22-61` keep: `*{font-family}` block, `.font-display*`, `.font-subhead*`, `html`, `body` (already light), `em`, and the full `prefers-reduced-motion: reduce` block (lines 53-73). These stay in CSS permanently.

- [ ] **Step 2: Keep grain + weave (CSS-only, no Tailwind equivalent)**

Keep `.grain` (line 178), `.grain::before` (182-192), `.grain-overlay` (194-215), `@keyframes grain-shift` (205-215), `.preloader-grain` (226-235), `.weave` (275-287), `.weave-espresso` (289-301). These are background-image/overscroll utilities without Tailwind equivalents — they STAY. Delete any rule among 61-316 not listed in steps 3-4.

- [ ] **Step 3: Migrate `.site-header` to utilities in App.jsx**

Find `<header className="site-header">` in `src/App.jsx` (~line 118). Replace the class with the exact utility string (values from CSS lines 303-316):

```jsx
<header className="sticky top-0 z-40 grid grid-cols-[1fr_auto_1fr] items-center min-h-[62px] px-[6vw] border-b border-brass/30 bg-ivory/90 text-champagne backdrop-blur-[16px] max-lg:grid-cols-[1fr_auto] max-lg:min-h-[58px] max-lg:px-5">
```

Then delete the `.site-header` block (lines 303-316) from index.css.

- [ ] **Step 4: Migrate logo-link + nav + header-actions + menu-toggle**

In `App.jsx`:
- `.logo-link` (CSS 318-339: flex, gap-12px, color champagne, no underline; img 40×40): → `className="flex items-center gap-3 text-champagne no-underline"`; inner `<img>` gets `className="w-10 h-10"`. (Logo span `hidden`.)
- `.desktop-nav` (341-346: flex, gap 34px, center, full width): → `className="flex items-center justify-center w-full gap-[34px] max-lg:hidden"`. Note `max-lg:hidden` replaces the `@media (max-width:1023px){.desktop-nav{display:none}}` rule (CSS 1990-1992).
- `.desktop-nav a` (348-367): → `className="relative inline-flex items-baseline px-0 py-1 text-[11px] tracking-[0.18em] uppercase no-underline transition-colors duration-200"`. The `::after` brass underline (369-386) STAYS in CSS — remove the generic `a` color rule but keep `.desktop-nav a::after` + hover rules, restyled for light: underline `background: var(--color-brass)` (unchanged).
- `.desktop-nav a:hover` (396-399): → `hover:text-brass` on the same element. `.footer a` hover stays as CSS or `hover:text-brass` on footer links.
- `.desktop-nav .nav-index` (365-367, 388-394): `hidden` on desktop — the CSS hides it via `display:none` (365-367). Keep that rule OR add `hidden` class; simplest: keep `hidden` utility: `className="hidden"` — but it's shown in mobile menu (518-523: font-sans 11px 600). Mobile menu nav-index: `className="font-sans text-[11px] font-semibold align-super"`.
- `.header-actions` (401-403): → `className="flex items-center justify-end max-lg:hidden"` (hidden with CTA on mobile per CSS 1990-1992).
- `.header-actions button, .mobile-menu button` (405-413): `grid place-items-center border-0 bg-transparent text-inherit cursor-pointer` → apply `className="grid place-items-center border-0 bg-transparent text-inherit cursor-pointer"` to the menu-toggle button.
- `.menu-toggle` (415-417): hidden on desktop, `display:none !important`; shown mobile (1995-2001: 44×44, `grid !important`, `mr-[-11px]`): → `className="hidden w-11 h-11 mr-[-11px] max-lg:grid"` (drop the `!important` — Tailwind utilities beat the base `.site-header` grid because specificity is equal but utilities layer wins; verify). Add `active:scale-[0.88]` for the `:active` transform (2003-2005).

- [ ] **Step 5: Migrate mobile-menu**

`.mobile-menu` (419-436) fixed inset-0 z-80 flex-col, safe-area padding, `bg-oxblood` → **light** `bg-ivory`, text `text-espresso` (was champagne), opacity/visibility transition stays in CSS (keep `.mobile-menu`, `.mobile-menu.is-open`, transitions in index.css — they are state classes driven by `is-open`; just change colors in CSS):

```css
.mobile-menu {
  position: fixed; inset: 0; z-index: 80; display: flex; flex-direction: column;
  padding: max(28px, env(safe-area-inset-top, 0px)) 6vw max(40px, env(safe-area-inset-bottom, 0px));
  background: var(--color-ivory); color: var(--color-espresso);
  opacity: 0; visibility: hidden; overscroll-behavior: contain;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}
```

Keep `.mobile-menu-top` (444-465), `.mobile-menu nav` (472-476), `.mobile-menu nav a` (478-516: font-display, clamp(44px,11vw,64px), `color` — change hover color to `var(--color-heritage)` since brass-on-ivory is low contrast; active same), `.mobile-menu nav .nav-index` (518-523), `.mobile-menu-foot` (525-542), `.mobile-menu-foot p` (544-550: `color: rgba(42,14,6,0.62)`). These stay in CSS (transition-driven state classes) — only the palette values change. Add the `max-sm:` padding variant (2205-2209): `padding: max(22px, env(safe-area-inset-top)) 24px max(36px, env(safe-area-inset-bottom))`.

- [ ] **Step 6: Preloader**

`.preloader` component classes are in `Preloader.jsx`. Inspect it (`src/components/Preloader.jsx`): its custom classes (preloader-brand, preloader-grain, etc.) — keep CSS where it's animation/state; convert colors dark→light. The preloader is a full-screen brand intro: **dark is acceptable to KEEP for the preloader** only if it looks intentional — BUT constraint 3 says everything light. Convert its bg to `bg-ivory`, text `text-espresso`, brand colors stay. Verify the fade-out animation still works.

- [ ] **Step 7: Verify + lint + build**

Screenshot header + mobile menu (open via menu toggle) at 1280 & 390. Header: ivory translucent bar, brass border, champagne... **correction:** header text must be espresso on light — change `.site-header` text from `text-champagne` to `text-espresso`, and `.logo-link` `text-champagne` → `text-espresso`. Brass nav underline unchanged. Mobile menu opens ivory with espresso giant links, heritage hover. Then `npx eslint src/` + `npm run build`.

- [ ] **Step 8: Commit**

```bash
git add src/index.css src/App.jsx src/components/Preloader.jsx
git commit -m "feat(theme): migrate header/nav/mobile-menu + preloader to light + Tailwind"
```

---

### Task 3: CTA component (shared by every section)

**Files:**
- Modify: `src/index.css:552-677` (`.cta`, `.cta-lg`, `.cta-sm`, `.cta-sheen`, `.cta-label`, `.cta-text`, `.cta-text--ghost`, `.cta-char` + hover/active) + `@media (max-width:640px)` `.cta` sizes (2211-2229)
- Modify: `src/App.jsx` `Cta` component (~line 80-111)

**Interfaces:**
- Produces: the final `.cta` utility set used in every later task's CTA elements.

- [ ] **Step 1: Decide the light CTA fill**

In the dark theme CTA was `--cta-fill: champagne` with `--cta-fg: oxblood` (553-556). On a light page, keep the same inverted-ink look: **CTA = espresso fill, ivory text** (strongest contrast on light bg). Update the component + CSS:

```css
.cta {
  --cta-fg: var(--color-ivory);
  --cta-border: var(--color-espresso);
  --cta-fill: var(--color-espresso);
  --cta-fill-fg: var(--color-ivory);
  ...rest unchanged...
}
```

- [ ] **Step 2: Convert `.cta` to utilities in the `Cta` component**

Replace `className={`cta cta-${size}`}` in `App.jsx` with the utility string (CSS 552-580 + size variants 582-594 + 640px variants 2211-2229):

```jsx
const sizeClass = {
  md: 'min-h-[44px] px-[26px] text-[14px] tracking-[0.14em] gap-3',
  lg: 'min-h-[56px] px-[36px] text-[16px] tracking-[0.16em] max-sm:min-h-[48px] max-sm:px-[26px] max-sm:text-[14px]',
  sm: 'min-h-[36px] px-[18px] text-[12px] tracking-[0.12em] max-sm:min-h-[34px] max-sm:px-[14px] max-sm:text-[11px]',
}
const inner = (
  <>
    <span className="cta-sheen" aria-hidden="true" />
    <span className="cta-label">
      <span className="cta-text">{chars}</span>
      <span className="cta-text cta-text--ghost" aria-hidden="true">{chars}</span>
    </span>
  </>
)
```

Then the anchor/button gets:

```jsx
className={`cta ${sizeClass[size]} relative inline-flex items-center justify-center border border-[var(--cta-border)] rounded-[1px] bg-[var(--cta-fill)] text-[var(--cta-fg)] font-display font-semibold tracking-[0.14em] uppercase whitespace-nowrap cursor-pointer overflow-hidden will-change-transform active:translate-y-px transition-transform duration-100 max-sm:min-h-[40px] max-sm:px-5 max-sm:gap-2.5 max-sm:text-[12px] max-sm:tracking-[0.12em]`}
```

- [ ] **Step 3: Keep CTA animation classes in CSS**

`.cta-sheen` (597-615), `.cta-label` (618-623), `.cta-text` (625-629), `.cta-text--ghost` (631-640), `.cta-char` (642-673), hover/active sheen sweep + ghost rise + `:active` translate — **all stay in CSS** (they are hover-state animations with pseudo/child selectors Tailwind can't express). Keep `.cta:active` transform in CSS too. Only the base `.cta` layout/color utilities moved to JSX. Keep `.cta` base class ON the element (as `cta` in the string above) so the sheen/char CSS still targets it.

- [ ] **Step 4: Verify every CTA on home + sub-pages**

At 1280 & 390: all CTA buttons (hero "Discover Rangvanat", heritage "Read the Story", header "Explore", footer "Join the Journey", lookbook "Enquire", product CTA) render espresso fill / ivory text, sheen sweep on hover works, letter-roll works, active press shifts 1px. `npx eslint src/` + `npm run build`.

- [ ] **Step 5: Commit**

```bash
git add src/index.css src/App.jsx
git commit -m "feat(theme): migrate CTA to espresso fill + Tailwind utilities"
```

---

### Task 4: Hero + hero-content/hero-panel + asset-frame base

**Files:**
- Modify: `src/index.css:679-894` (`.hero`, `.hero-video`, `.hero::before`, `.hero-content`, `.hero-content .eyebrow`, `.hero-content h1`, `.hero-content p`, `.hero-content > *`, `.hero.is-live ...`, `.hero-image`, `.hero-image::after`, `.hero-copy`, `.hero-panel`, responsive 2007-2054 & 2243-2253) + `.asset-frame` (763-776)
- Modify: `src/App.jsx` Hero component (~183-230) + Asset component

- [ ] **Step 1: Convert `.hero` to utilities**

`App.jsx` Hero: `<section id="top" className={`hero grain${entered ? ' is-live' : ''}`}>` →

```jsx
<section
  id="top"
  className={`hero grain${entered ? ' is-live' : ''} relative grid place-items-stretch min-h-[100svh] mt-[-62px] overflow-hidden max-lg:grid-cols-1 max-lg:min-h-[100svh] max-lg:mt-[-58px]`}
>
```

Keep `hero`, `grain`, `is-live` classes (JS-driven animation hooks). Delete `.hero` from CSS (679-690).

- [ ] **Step 2: Light hero background**

`.hero` had a dark radial+linear gradient (685-688). New light version (keep in CSS — it's a multi-stop gradient, unwieldy as utilities):

```css
.hero {
  background:
    radial-gradient(120% 90% at 78% 8%, rgba(179, 74, 26, 0.10), transparent 55%),
    radial-gradient(100% 80% at 12% 100%, rgba(207, 161, 88, 0.16), transparent 60%),
    linear-gradient(180deg, var(--color-parchment) 0%, var(--color-ivory) 55%, var(--color-champagne) 100%);
}
```

- [ ] **Step 3: Hero overlay + content**

`.hero::before` (701-711) dark gradients over video → light/soft: keep as CSS, change to a subtle ivory veil so white-on-video text still reads — BUT hero text was ivory on dark video; on a light overlay, hero text must become espresso. Change `.hero::before` to:

```css
.hero::before {
  content: ""; position: absolute; inset: 0; z-index: 1;
  background:
    linear-gradient(180deg, rgba(251, 246, 236, 0.72) 0%, rgba(251, 246, 236, 0.25) 35%, transparent 62%),
    linear-gradient(90deg, rgba(251, 246, 236, 0.68) 0%, rgba(251, 246, 236, 0.28) 45%, transparent 80%),
    linear-gradient(0deg, rgba(251, 246, 236, 0.55) 0%, transparent 48%);
  pointer-events: none;
}
```

`.hero-content` (713-725): keep positioning/padding as CSS (absolute inset-0 flex column end, gap 22px, padding `0 5vw max(84px,9vh)`, `max-lg:px-6 max-lg:pb-[max(56px,8vh)]` (2026-2028), `max-sm:px-5 max-sm:pb-10` (2247-2249)). Change `color: var(--color-ivory)` → `color: var(--color-espresso)`. Keep in CSS (positioning + JS `is-live` transition rules 745-761 stay).

`.hero-content h1` (731-736): font-size clamp → `text-[clamp(58px,9vw,104px)] leading-[0.9] tracking-[0.012em]` in JSX; keep `margin:0` via `m-0`. `.hero-content p` (738-743): `max-w-[480px] text-[16px] opacity-90` — but on light, text is espresso; opacity 90 fine.

- [ ] **Step 4: asset-frame base**

`.asset-frame` (763-776) — the layered weave placeholder background stays as CSS (background-image stack of gradients can't be utilities), but the palette inside changes: replace oxblood tints with light parchment/brass tints:

```css
.asset-frame {
  position: relative; overflow: hidden; min-height: 280px;
  background-image:
    linear-gradient(135deg, rgba(94, 27, 16, 0.10), rgba(42, 14, 6, 0.05)),
    var(--asset),
    repeating-linear-gradient(90deg, rgba(94, 27, 16, 0.06) 0 1px, transparent 1px 8px),
    repeating-linear-gradient(0deg, rgba(207, 161, 88, 0.12) 0 1px, transparent 1px 12px),
    linear-gradient(135deg, var(--color-parchment), var(--color-champagne));
  background-position: center; background-size: cover;
  box-shadow: inset 0 0 0 1px rgba(207, 161, 88, 0.22);
}
```

- [ ] **Step 5: hero-image / hero-copy / hero-panel**

`.hero-image::after` (782-788) dark bottom fade → light: `linear-gradient(180deg, transparent 35%, rgba(42,14,6,0.18))`.
`.hero-copy` (790-797): `color: var(--color-ivory)` → `color: var(--color-espresso)`; keep positioning (left 5vw, bottom 48px, z-2, max-w-[620px], responsive 799-807 center on ≤1023px). Convert to utilities where simple: `absolute left-[5vw] bottom-12 z-[2] max-w-[620px] max-lg:left-0 max-lg:right-0 max-lg:max-w-full max-lg:text-center max-lg:bottom-[calc(48px+env(safe-area-inset-bottom))]` (text color via CSS class `.hero-copy{color:...}`). `.hero-copy p` (871-874): `max-w-[430px] text-ivory/85` → `text-espresso/85`.
`.hero-panel` (876-893): `bg-oxblood` → **light** `bg-parchment`, `color` → `text-espresso`, padding `px-[5vw] py-[72px]`, responsive `max-lg:px-6 max-lg:py-[38px] max-lg:pb-12` (2044-2046), inner h2/p `text-inherit`, p `opacity-80 mb-[30px]`. Convert to JSX utilities.

- [ ] **Step 6: Verify**

Hero at 1280 & 390: parchment→ivory gradient bg, espresso headline over video with soft ivory veil, grain subtle, CTA espresso pill, hero-panel parchment, image-fade light. Video still autoplays. `npx eslint src/` + `npm run build`.

- [ ] **Step 7: Commit**

```bash
git add src/index.css src/App.jsx
git commit -m "feat(theme): migrate hero + asset-frame to light + Tailwind"
```

---

### Task 5: Story, Heritage, Founder (quote) sections

**Files:**
- Modify: `src/index.css:895-1170` (`.section` shared padding, `.story-section*`, `.heritage-section*`, `.framed-image`, `.heritage-detail`, `.quote-section*`, `.founder*`) + responsive 2048-2054, 2111-2160, 2255-2280
- Modify: `src/App.jsx` Story (~232-249), Heritage (~251-290), FounderNote (~292+)

- [ ] **Step 1: Shared `.section` padding + border**

CSS 895-901 (`padding: 120px 5vw; border-bottom: 1px solid rgba(207,161,88,0.14)`) applies to `.section`, `.quote-section`, `.dark-section`, `.closing-section`. Convert each section element in JSX to:

```jsx
className="px-[5vw] py-[120px] border-b border-brass/15 max-lg:px-6 max-lg:py-[72px]"
```

(`border-brass/15` = brass at 15% ≈ 0.14.) Add `max-sm:` padding only where the 640px block differs. Keep `section[id]{scroll-margin-top:78px}` in CSS (constraint 12).

- [ ] **Step 2: Story section**

`.story-section` (911-919): was `bg-espresso` dark → **light** `bg-parchment text-espresso`; grid `grid-cols-[0.9fr_1.1fr] gap-[9vw] items-start min-h-[360px]`, responsive single column `max-lg:grid-cols-1 max-lg:gap-10 max-lg:gap-7` (2056-2062, 2146-2148). h2 (925-930): `max-w-[420px] text-[clamp(58px,6.5vw,92px)] leading-[0.92]`. p (932-940): `max-w-[520px]`.

JSX (`<section id="story" className="section story-section">`):

```jsx
<section id="story" className="section story-section bg-parchment text-espresso grid grid-cols-[0.9fr_1.1fr] gap-[9vw] items-start min-h-[360px] px-[5vw] py-[120px] border-b border-brass/15 max-lg:grid-cols-1 max-lg:gap-10 max-lg:gap-7 max-lg:px-6 max-lg:py-[72px]">
```

Then delete `.story-section` + children from CSS (911-940). Keep `h2`/`p` global rules (820-869) — but note h2 color is `champagne` (848) — on light that's invisible. Global `h2 { color: var(--color-champagne) }` must become `color: var(--color-espresso)`. **Same for `h3` (857), `p` (866: rgba champagne → espresso/75), `blockquote` font.** Update the global type rules (820-869) once in this task — every section depends on it:

```css
h2 { color: var(--color-espresso); ... }
h3 { color: var(--color-espresso); ... }
p { max-width: 62ch; color: rgba(42, 14, 6, 0.75); font-size: 15px; line-height: 1.6; }
```

- [ ] **Step 3: Heritage section**

`.heritage-section` (1014-1016): `bg-oxblood` → light `bg-ivory`. `.heritage-body` (1018-1023): `grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)] gap-[8vw] items-center`, responsive `max-lg:grid-cols-1 max-lg:gap-10 max-lg:gap-9`. `.heritage-text` (1025-1029): flex col gap-9. `.heritage-head h2` (1035-1037). `.heritage-copy p` (1039-1042): `max-w-[520px]`. `.heritage-copy .cta` (1044-1046): `mt-3`. `.heritage-media` (1048-1051): `relative pb-16 pl-12` responsive `max-lg:pb-12 max-lg:pl-7 max-sm:pb-10 max-sm:pl-5` (2083-2085, 2439-2441). `.framed-image` (1053-1055): `min-h-[460px]` responsive `max-lg:min-h-[360px] max-sm:min-h-[320px]`. `.heritage-detail` (1057-1066): `absolute left-0 bottom-0 w-[42%] min-h-[200px] rotate-2 origin-bottom-left shadow-[0_18px_40px_rgba(0,0,0,0.35)]` responsive `max-lg:w-[46%] max-lg:min-h-[150px] max-sm:w-1/2 max-sm:min-h-[120px]` (2087-2090, 2447-2450).

JSX: convert each. Delete migrated rules from CSS.

- [ ] **Step 4: Founder/quote section (THE reference theme)**

`.quote-section` (1076-1087) is already light (parchment bg, espresso text) — it's the model. Convert to utilities:

```jsx
<section id="founder" className="quote-section relative grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-center gap-[clamp(48px,6vw,96px)] min-h-[560px] px-[6vw] py-[120px] bg-parchment text-espresso overflow-clip border-b border-brass/15 max-lg:grid-cols-1 max-lg:place-items-center max-lg:text-center max-lg:gap-11 max-lg:min-h-0 max-lg:px-6 max-lg:py-[72px] max-sm:px-5 max-sm:py-14 max-sm:gap-9">
```

`.founder-panel` (1089-1096): `justify-self-end w-[min(420px,100%)] pt-6 px-6 bg-terracotta rounded-t-[210px]` responsive `max-lg:justify-self-center max-lg:w-[min(320px,100%)] max-sm:w-[min(260px,100%)] max-sm:p-[18px_18px_0] max-sm:rounded-t-[150px]`. `.founder-arch .asset-frame` (1098-1106): `w-full h-[440px] min-h-0 rounded-t-[190px] shadow-none` responsive 340/280px + radius 135px. `.founder-quote` (1108-1112): `relative z-[1] p-0`. `.founder-eyebrow` (1114-1122): `mb-[18px] text-heritage font-subhead text-[12px] font-bold tracking-[0.22em] uppercase`. `blockquote` (1124-1134): `max-w-[660px] m-0 text-oxblood font-subhead text-[34px] leading-[1.28] tracking-[0.01em]` responsive `max-lg:text-[30px] max-sm:text-[26px] max-sm:leading-[1.3]` (2134-2136, 2271-2274). `.founder` (1136-1142): `flex items-center justify-start gap-[18px] mt-[34px]` responsive center + `max-sm:mt-7`. `.founder strong` (1154-1161): `text-oxblood font-subhead text-[13px] font-bold tracking-[0.14em] uppercase`. `.founder span` (1163-1166): `text-espresso/70 text-[12px]`. `.quote-section .cta` (1168-1170): `mt-9` responsive `max-lg:mt-8`.

Convert in JSX; delete migrated CSS.

- [ ] **Step 5: Verify + lint + build + commit**

Screenshot Story/Heritage/Founder at 1280 & 390: parchment/ivory alternating, espresso type, terracotta arch, brass accents, no dark bg. `npx eslint src/` + `npm run build`.

```bash
git add src/index.css src/App.jsx
git commit -m "feat(theme): migrate story/heritage/founder sections to light + Tailwind"
```

---

### Task 6: Timeline marquee + Craft/Process + Artisans

**Files:**
- Modify: `src/index.css:1172-1356` (`.timeline-marquee`, `.marquee-row*`, `.marquee-track`, `.marquee-item`, `.marquee-text`, `.marquee-star`, `.timeline-strip--static*`, `.process-section`, `.process-head`, `.process-grid`, `.process-card*`, `.value-blocks`, `.artisans-section`, `.dark-section`, `.counters`, `.artisan-collage*`) + responsive 2162-2177, 2309-2321, 2452-2473
- Modify: `src/App.jsx` Timeline (~386+), Craft (~483+), Artisans (~529+)

- [ ] **Step 1: Timeline marquee**

`.timeline-marquee` (1172-1180): `bg-espresso` dark → light `bg-ivory text-espresso`; `relative grid gap-2 py-12 overflow-clip` responsive `max-lg:gap-1 max-lg:py-10` (2162-2165). `.marquee-row` (1182-1187): keep mask in CSS (mask-image utility exists but webkit prefix needed — keep CSS). `.marquee-track` (1189-1195): keep (animation-driven) — the marquee is CSS-keyframe or gsap? **Check**: if gsap animates the track, the class is a hook; keep `display:inline-flex` etc. in CSS. `.marquee-text` (1204-1212): `font-display text-[clamp(56px,8vw,128px)] leading-none tracking-[0.02em] uppercase text-champagne` → on light: `text-espresso`. `.marquee-star` (1214-1218): `text-brass`. `.marquee-row--ghost` (1220-1227): opacity .55, text transparent with `-webkit-text-stroke: 1.5px` → stroke `var(--color-espresso)` on light. Keep ghost text-stroke in CSS (no Tailwind utility for text-stroke; `[-webkit-text-stroke:...]` arbitrary works but keep CSS for cleanliness).

- [ ] **Step 2: Timeline strip static**

`.timeline-strip--static` (1229-1238): `bg-espresso` → light `bg-champagne/40` (subtle) or `bg-parchment`; flex `items-center gap-[6vw] min-h-[110px] px-[12vw] overflow-x-auto text-espresso`, responsive `max-lg:grid max-lg:gap-6 max-lg:px-6 max-lg:py-11` (2167-2172). Keep dots (`div::before`, `is-large::before` — pseudo, keep in CSS, brass border unchanged). `.timeline-strip--static span` (1266-1272): `text-brass font-display text-[22px]`. `p` (1274-1278): `text-espresso/70 text-[12px] mt-1`.

- [ ] **Step 3: Craft/Process section**

`.process-section` (942-944, 1280-1282): `bg-oxblood` → light `bg-parchment`. `.process-head` (946-949): `max-w-[680px] mb-16` responsive `max-lg:mb-11 max-sm:mb-9` (2075-2077, 2457-2459). `.process-grid` (959-963): `grid grid-cols-4 gap-7` responsive `max-lg:grid-cols-2 max-lg:gap-5 max-sm:grid-cols-1 max-sm:gap-7` (2064-2067, 2452-2455). `.process-card-media` (965-967): `relative`; `.process-card-media .asset-frame` (969-973): `min-h-[340px]` responsive `max-sm:min-h-[260px]` (2461-2463). `.process-card-num` (975-985): `absolute top-[14px] left-[14px] z-[2] font-display text-[46px] leading-[0.8] text-ivory drop-shadow-[0_2px_8px_rgba(42,14,6,0.45)]` — on light, number must contrast against the image: keep `text-ivory` + stronger shadow (text-shadow stays CSS or `[text-shadow:...]` arbitrary). `.process-card h3` (987-990): `mt-[18px] mb-2 text-[23px]`. `.process-card p` (992-995): `text-[14px] mb-0`. `.value-blocks` (997-1002): `grid grid-cols-3 gap-9 mt-[72px]` responsive `max-lg:grid-cols-1 max-lg:gap-7 max-lg:mt-14 max-sm:mt-12` (2069-2073, 2469-2473). `.value-block h3` (1004-1008): `mb-1.5 text-[21px] italic`. `.value-block p` (1010-1012): `text-[14px]`.

- [ ] **Step 4: Artisans + dark-section + counters**

`.dark-section` (1284-1287): `bg-oxblood text-champagne` → **light** `bg-ivory text-espresso`. `.dark-section h2,h3,p` inherit (1296-1300); p opacity 0.78 (1302-1304). `.artisans-section` (1289-1294): `grid grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] gap-[clamp(48px,7vw,110px)] items-center` responsive `max-lg:grid-cols-1 max-lg:gap-10` (2056-2062). `.counters` (1306-1312): `grid grid-cols-3 gap-7 mt-[46px] text-brass` responsive `max-lg:gap-5` (2103-2105). `.counters strong` (1314-1319): `font-display text-[56px] leading-[0.95]` responsive `max-lg:text-[48px]`. `.counters span` (1321-1330): `block max-w-[130px] mt-2.5 text-espresso/80 font-sans text-[11px] font-semibold leading-[1.3]`. `.artisan-collage` (1332-1336): `relative w-[min(460px,100%)] justify-self-center` responsive `max-lg:w-[min(440px,86%)] max-lg:mx-auto max-sm:w-full` (2092-2095, 2309-2311). `.artisan-portrait` (1343-1346): `aspect-[2/3] min-h-0`. `.artisan-landscape` (1348-1356): `absolute -right-[12%] -bottom-[9%] w-[62%] aspect-[4/3] min-h-0 shadow-[0_24px_48px_rgba(0,0,0,0.35)]` responsive (2097-2101, 2317-2321).

- [ ] **Step 5: Verify + lint + build + commit**

Screenshots at 1280 & 390: marquee ivory with espresso text + brass stars; static timeline parchment; craft parchment grid; artisans ivory with collage. `npx eslint src/` + `npm run build`.

```bash
git add src/index.css src/App.jsx
git commit -m "feat(theme): migrate timeline/process/artisans to light + Tailwind"
```

---

### Task 7: Why + Collections (home) + Questions + FAQ + Closing + Footer

**Files:**
- Modify: `src/index.css:1358-1497` (`.section-title`, `.collection-grid*`, `.collection-card*`, `.collection-meta*`, `.collection-num`, `.pillars*`), `src/index.css:2481-2660` (`.why-section*`, `.collection-grid--lookbook`, `.collection-card-link*`, `.collection-num-overlay`, `.collection-piece-count`, `.asset-placeholder-tag`), `src/index.css:1833-1964` (`.collections-intro`, `.questions-section*`, `.faq-section*`), `src/index.css:1498-1831` (`.closing-*`, `.form-*`, `.footer*`, `.care-*`), responsive 2182-2202, 2282-2335, 2337-2433, 3319-3418
- Modify: `src/App.jsx` Collections (~662+), Questions (~746+), Faq (~874+), Closing (~1015+), Footer (~1072+), WhyRangvanaat (~589+)

- [ ] **Step 1: Why section**

`.why-section` (2481-2484): `bg-espresso` → light `bg-parchment`. `.why-head` (2486-2489): `max-w-[860px] mb-10`. `.why-head h2` (2491-2495): `text-[clamp(44px,5.4vw,78px)] leading-[1.02] mb-0`. `.why-body` (2497-2500): `max-w-[620px] mb-14`. `.why-intro` (2502-2506): `text-[17px] leading-[1.7] m-0`. `.why-grid` (2508-2514): `grid grid-cols-2 gap-px bg-brass/20 border border-brass/20` responsive `max-sm:grid-cols-1` (3397-3399). `.why-block` (2516-2519): `p-[44px_40px] bg-parchment` responsive `max-sm:p-[32px_26px]` (3401-3403). `.why-block--union` (2521-2527): `col-span-2 p-[52px_40px]` + subtle heritage gradient (keep gradient as CSS bg or `bg-[linear-gradient(135deg,rgba(179,74,26,0.10),transparent_55%)]`), responsive `max-sm:p-[40px_26px]` (3405-3408). `.why-word` (2529-2537): `block mb-3 text-brass font-display text-[42px] leading-none tracking-[0.04em]`. `.why-block p` (2539-2542): `text-[15px] m-0`. `.why-union` (2544-2549): `font-display text-[clamp(24px,2.6vw,34px)] leading-[1.25] text-espresso`. `.why-bottom` (2551-2556): `grid grid-cols-[1fr_1fr_1.2fr] gap-12 mt-16` responsive `max-lg:grid-cols-1 max-lg:gap-9` (3309-3312). `.why-mission h3,.why-crafts h3` (2558-2565): `mb-3 text-[16px] tracking-[0.12em] uppercase text-brass`. `.why-mission p` (2567-2570): `text-[14px] m-0`. `.why-crafts ul` (2572-2579): `flex flex-wrap gap-2.5 m-0 p-0 list-none`. `.why-crafts li` (2581-2589): `p-[8px_14px] border border-brass/30 rounded-full text-[12px] tracking-[0.08em] uppercase text-espresso`.

- [ ] **Step 2: Home collections**

`.section-title` (1358-1364): `flex items-end justify-between gap-7 mb-[46px]` responsive `max-sm:flex-col max-sm:items-start max-sm:gap-[18px]` (2323-2326); `.section-title .cta` `w-fit` (2328-2330). `.collection-grid` (1366-1371): `grid grid-cols-3 gap-6 items-start` responsive `max-lg:grid-cols-1` (2182-2184). `.collection-card` (1373-1376): `flex flex-col`. nth-child(2) `mt-14` responsive `max-lg:mt-0` (2186-2188). `.collection-card .asset-frame` (1382-1392): `aspect-[3/4] cursor-pointer transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.025]`. `.collection-meta` (1394-1396): `pt-[18px]`. `.collection-num` (1398-1406): `block mb-2 text-brass font-display text-[30px] leading-none`. `.collection-meta h3` (1408-1412): `mb-2 text-[23px]`. `.collection-meta p` (1414-1419): `max-w-[380px] m-0 text-espresso/70 text-[13px]`.

`.collection-grid--lookbook` (2594-2597): `grid-cols-3 gap-y-14` responsive `max-lg:grid-cols-2 max-sm:grid-cols-1` (3314-3316, 3410-3412). `.collection-card-link` (2599-2604): `flex flex-col no-underline text-inherit`. `.collection-card-media` (2606-2612): `aspect-[4/5] min-h-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.02]`. `.collection-num-overlay` (2618-2628): `absolute top-4 left-4 z-[2] font-display text-[42px] leading-[0.8] text-ivory [text-shadow:0_2px_10px_rgba(42,14,6,0.5)]`. `.collection-piece-count` (2630-2643): `absolute right-[14px] bottom-[14px] z-[2] p-[6px_10px] bg-espresso/70 border border-brass/40 rounded-[2px] text-champagne text-[10px] tracking-[0.14em] uppercase` — on light this stays dark chip (espresso/70 bg + champagne text = readable). `.collection-card:nth-child(3n+2)` (2645-2647): `mt-14` responsive `max-sm:mt-0` (3414-3417). `.asset-placeholder-tag` (2650-2660): `absolute inset-0 grid place-items-center text-espresso/55 text-[11px] italic tracking-[0.1em] uppercase`.

- [ ] **Step 3: Questions + FAQ**

`.questions-section` (1838-1845): already light (`bg-parchment text-espresso`) — convert: `grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-[clamp(48px,7vw,110px)] items-start bg-parchment text-espresso` responsive `max-lg:grid-cols-1 max-lg:gap-10` (1967-1971). `.questions-section h2` (1847-1849): `text-oxblood`. `.questions-head` (1851-1855): `max-w-[460px] sticky top-24` responsive `max-lg:static` (1977-1980). `.questions-intro` (1857-1862): `max-w-[380px] mt-[22px] text-espresso/60 text-[14px]`. `.questions-list` (1864-1866): `grid`. `.question-item` (1868-1875): `py-[30px] border-t border-brass/35` + last-child border-b. `.question-body h3` (1877-1883): `mb-2.5 text-[clamp(18px,1.8vw,20px)] font-semibold leading-[1.45] text-oxblood` responsive `max-sm:text-[16px]` (2295-2297). `.question-body p` (1885-1891): `max-w-[560px] m-0 text-[14px] leading-[1.7] text-espresso/70`.

`.faq-section` (1893-1899): `bg-oxblood` → light `bg-ivory`; grid same as questions, responsive (1972-1975). `.faq-head` (1901-1906): sticky, `max-lg:static`. `.faq-list` (1908-1910): `max-w-[860px]`. `.faq-item` (1912-1914): `border-b border-brass/35`. `.faq-item button` (1916-1932): `flex items-center justify-between gap-[18px] w-full p-5 bg-transparent border-0 text-espresso font-subhead text-[18px] font-semibold tracking-[0.01em] cursor-pointer text-left` responsive `max-sm:text-[15px] max-sm:p-4` (2299-2302). `.faq-plus` (1934-1944): `shrink-0 text-brass text-[24px] leading-none transition-transform duration-300` + `.faq-item.is-open .faq-plus { transform: rotate(45deg) }` — **keep state rules in CSS** (is-open driven). `.faq-answer` (1946-1959): keep open/close height animation in CSS (state-driven), p `max-w-[640px] mb-5 text-[14px]` responsive `max-sm:text-[13px] max-sm:mb-4` (2304-2307).

- [ ] **Step 4: Closing (newsletter) + footer**

`.closing-section` (1498-1505): `bg-oxblood` → light `bg-parchment text-espresso`; grid `grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-[clamp(48px,7vw,110px)] items-start` responsive `max-lg:grid-cols-1 max-lg:gap-10` (2194-2197). `.closing-head` (1507-1509): `max-w-[460px]`. `.closing-section h2` (1511-1515): `text-[clamp(52px,6.5vw,68px)] leading-[0.98]` responsive `max-lg:text-[50px]` (2199-2201). `.closing-intro` (1517-1523): `max-w-[380px] mt-[22px] text-espresso/80 text-[14px] leading-[1.7]`. `.closing-form-wrap` (1525-1527): `max-w-[560px]`. `.closing-form` (1529-1534): `flex flex-col gap-[22px] mt-2`. `.closing-form label` (1536-1543): `text-brass font-subhead text-[11px] font-bold tracking-[0.18em] uppercase`. `.closing-field` (1545-1548): `relative border-b border-espresso/40` — keep `.closing-underline` (1564-1573) + focus/error states (1575-1585) in CSS (pseudo/focus-driven, brass scaleX). `.closing-form input` (1550-1558): `w-full py-3 border-0 bg-transparent text-espresso text-[17px] outline-0` + placeholder `text-espresso/60` (as `placeholder:text-espresso/60`); responsive `max-sm:min-h-12` (2427-2429). `.closing-form .cta` (1587-1590): `self-start min-h-12` responsive `max-sm:w-full` (2431-2433). `.form-status` (1597-1612): keep in CSS (state classes), colors: `text-espresso` base, `.is-success span` brass, `.is-error` terracotta. `.form-helper` (1961-1964): `mt-[14px] text-[12px]`.

`.footer` (907-909, 1614-1622): `bg-espresso` → light `bg-ivory text-espresso`; `grid grid-cols-1 gap-[34px] overflow-hidden` padding `px-[5vw] pt-[104px] pb-16` responsive `max-lg:px-6 max-lg:py-[72px]` (2048-2054). `.care-label` (1624-1629): `relative border-[1.5px] border-dashed border-brass/50 rounded-lg p-[48px_clamp(28px,4vw,56px)_44px]` responsive `max-sm:p-[40px_20px_34px]` (2337-2339). `.care-tag` (1631-1643): `absolute -top-px -right-px p-[8px_16px] bg-brass text-espresso text-[9px] font-bold tracking-[0.14em] uppercase rounded-[0_7px_0_6px]` responsive `max-sm:text-[8px] max-sm:p-[7px_12px]` (2422-2425). `.care-brand` (1645-1650): `block w-[clamp(140px,15vw,190px)] h-auto` — drop `filter:brightness(1.15)` (was for dark bg) or keep subtle. responsive `max-sm:w-[115px]` (2345-2347). `.care-tag-full` (1652-1654): `inline`; `max-sm:hidden` (2341-2343). `.care-origin` (1656-1662): `mt-2 text-brass text-[13px] tracking-[0.14em] uppercase`. `.care-promise` (1664-1669): `mt-[14px] max-w-[420px] text-espresso/65 text-[13px]`. `.care-grid` (1671-1676): `grid grid-cols-2 gap-[clamp(32px,5vw,72px)] mt-10` responsive `max-sm:grid-cols-1 max-sm:gap-[30px] max-sm:mt-7` (2349-2353). `.care-label h3` (1678-1684): `mb-[18px] text-espresso text-[12px] tracking-[0.2em] uppercase`. `.care-label nav` (1686-1690): `grid gap-3 content-start` responsive `max-sm:gap-0` (2355-2357). `.care-label nav a` (1692-1694, 1700-1707): `w-fit text-espresso/70 text-[13px] no-underline` responsive `max-sm:flex max-sm:items-center max-sm:justify-between max-sm:w-full max-sm:p-[14px_0] max-sm:border-b max-sm:border-brass/15 max-sm:text-[14px]` (2359-2367); underline `::after` keep in CSS (brass scaleX, 1709-1736); hover `hover:text-brass`. `.care-link-arrow` (1696-1698): `hidden`; `max-sm:inline-block text-brass text-[14px]` (2369-2378). `.care-info` (1738-1742): `grid gap-7 content-start` responsive `max-sm:gap-6` (2391-2393). `.care-info a:not(.socials a)` (1744-1748, 2380-2384): `block w-fit mb-2 text-espresso/70 text-[13px]` mobile inline-flex. `.care-info p` (1750-1754): `text-espresso/70 text-[13px] mb-2.5`. `.care-info .socials` (1756-1758): `gap-3`. `.care-info .socials a` (1760-1778): `grid place-items-center w-9 h-9 border border-brass/50 text-espresso hover:bg-brass hover:border-brass hover:text-espresso` — on light, hover text must be ivory for contrast: `hover:text-ivory`; responsive `max-sm:w-11 max-sm:h-11` (2386-2389). `.care-wash` (1780-1798): `flex justify-between gap-4 flex-wrap mt-10 pt-4 border-t border-brass/35 text-espresso/50 text-[10px] tracking-[0.2em] uppercase` responsive `max-sm:grid max-sm:grid-cols-3 max-sm:gap-1 max-sm:mt-[26px] max-sm:text-[8px] max-sm:tracking-[0.1em] max-sm:text-center max-sm:border-t-[1.5px] max-sm:border-dashed max-sm:border-brass/40` (2395-2420). `.care-thread` (1803-1822): keep in CSS (animation + pseudo dot). `.care-legal` (1824-1831): `flex justify-between gap-6 flex-wrap text-espresso/50 text-[12px]` responsive `max-sm:grid max-sm:gap-2` (2332-2335).

- [ ] **Step 5: Verify + lint + build + commit**

Full home page scroll at 1280 & 390: every section light, alternating ivory/parchment, brass dividers, espresso type, terracotta accents, footer light with brass dashed border + tag. Newsletter focus/error states work. `npx eslint src/` + `npm run build`.

```bash
git add src/index.css src/App.jsx
git commit -m "feat(theme): migrate why/collections/questions/faq/closing/footer to light + Tailwind"
```

---

### Task 8: CollectionsPage — toolbar, search, filters

**Files:**
- Modify: `src/index.css:2665-3018` (`.lookbook-page`, `.lookbook-hero*`, `.lookbook-toolbar`, `.lookbook-fab*`, `.lookbook-toolbar-row`, `.lookbook-search*`, `.lookbook-layout-toggle*`, `.lookbook-mobile-filters-toggle`, `.lookbook-filter-dot`, `.lookbook-filters`, `.lookbook-filter-group`, `.lookbook-filter-label`, `.filter-chips`, `.filter-chip*`, `.lookbook-clear`, `.lookbook-results-meta`, `.lookbook-results-collection`) + responsive 3272-3360
- Modify: `src/components/CollectionsPage.jsx`

- [ ] **Step 1: Page + hero**

`.lookbook-page` (2665-2668): `min-h-[100svh] p-[64px_5vw_96px]` responsive `max-lg:p-[48px_24px_72px]` (3273-3275) `max-sm:p-[40px_20px_72px]` (3381-3383 applies to product-page; lookbook 640 block only has hero margin). `.lookbook-hero` (2670-2673): `max-w-[760px] mb-12` responsive `max-sm:mb-9` (3320-3322). `.lookbook-hero h1` (2675-2679): `m-0 mb-[22px] text-[clamp(56px,7.5vw,96px)] leading-[0.92]`. `.lookbook-hero-intro` (2681-2684): `m-0 max-w-[540px]`.

- [ ] **Step 2: Toolbar**

`.lookbook-toolbar` (2686-2694): `sticky top-[62px] z-30 m-0-[-5vw] p-[16px_5vw_14px] bg-oxblood border-b border-brass/20` → **light** `bg-ivory/90 backdrop-blur` + `text-espresso`; responsive `max-lg:top-[58px] max-lg:mx-[-24px] max-lg:px-6 max-lg:py-3` (3277-3281) `max-sm:top-[58px]` (3331-3333). Since page padding is `5vw` and toolbar uses negative margins to bleed, keep exact: `m-0-[-5vw]` is invalid — use `mx-[-5vw] px-[5vw]` responsive `max-lg:mx-[-24px] max-lg:px-6`. `.lookbook-toolbar-row` (2739-2743): `flex items-center gap-4` responsive `max-sm:flex-wrap` (3335-3337).

- [ ] **Step 3: Search**

`.lookbook-search` (2745-2752): `relative flex items-center flex-1 max-w-[420px] text-espresso/55` responsive `max-sm:max-w-none max-sm:flex-[1_1_100%] max-sm:order-1` (3339-3343). `.lookbook-search > svg` (2754-2758): `absolute left-[14px] pointer-events-none`. `.lookbook-search input` (2760-2771): `w-full min-h-[42px] p-[0_38px_0_42px] border border-brass/30 rounded-[2px] bg-ivory text-espresso text-[14px] outline-none transition-colors duration-200` — **light input**: `bg-ivory`, border `border-brass/40`, focus `focus:border-brass` (2773-2775), placeholder `placeholder:text-espresso/45` (2777-2779), hide webkit cancel (2781-2783: keep `[&::-webkit-search-cancel-button]:hidden` arbitrary variant). `.lookbook-search button` (2785-2801): `absolute right-[10px] grid place-items-center w-[26px] h-[26px] border-0 bg-none text-espresso cursor-pointer rounded-full hover:bg-brass/20`.

- [ ] **Step 4: Layout toggle + mobile filters toggle + filter dot**

`.lookbook-layout-toggle` (2803-2810): `flex gap-1 ml-auto border border-brass/30 rounded-[2px] p-[3px]` responsive `max-sm:order-2` (3345-3347). `.lookbook-layout-toggle button` (2812-2823): `grid place-items-center w-[34px] h-[34px] border-0 bg-none text-espresso/55 cursor-pointer rounded-[1px] transition-colors duration-200`. `.is-active` (2825-2828): `bg-champagne text-oxblood` — on light: `bg-espresso text-ivory` (active = dark pill, strongest contrast). `.lookbook-mobile-filters-toggle` (2830-2845): `hidden` desktop, `max-sm:inline-flex items-center gap-2 min-h-[42px] p-0-14px border border-brass/30 rounded-[2px] bg-none text-espresso text-[12px] tracking-[0.1em] uppercase cursor-pointer relative max-sm:order-3` (3349-3352). `.lookbook-filter-dot` (2847-2855): `absolute -top-1 -right-1 w-[9px] h-[9px] rounded-full bg-brass`.

- [ ] **Step 5: Filter panel + chips**

`.lookbook-filters` (2857-2861): `grid gap-[18px] mt-[14px]` responsive `max-sm:hidden max-sm:is-open:grid` (3354-3360: `display:none` default, `.is-open{display:grid}` — keep these two state rules in CSS). `.lookbook-filter-group` (2863-2868): `grid grid-cols-[110px_1fr] gap-4 items-start` responsive `max-sm:grid-cols-1 max-sm:gap-2.5` (3362-3365). `.lookbook-filter-label` (2870-2876): `pt-[9px] text-[10px] tracking-[0.22em] uppercase text-brass`. `.filter-chips` (2878-2882): `flex flex-wrap gap-2`. `.filter-chip` (2884-2901): `inline-flex items-center gap-[7px] min-h-[34px] px-[14px] border border-brass/30 rounded-full bg-none text-espresso/70 text-[12px] tracking-[0.06em] cursor-pointer transition-colors duration-200 hover:border-brass hover:text-espresso`. `.is-active` (2908-2912): `bg-espresso border-espresso text-ivory`. `.filter-chip-count` (2914-2917): `text-[10px] opacity-70`. `.lookbook-clear` (2919-2934): `justify-self-end border-0 bg-none text-brass text-[12px] tracking-[0.08em] uppercase underline underline-offset-4 cursor-pointer hover:text-heritage`.

- [ ] **Step 6: Results meta**

`.lookbook-results-meta` (2936-2947): `flex items-baseline justify-between gap-4 flex-wrap p-[22px_0_8px] text-[11px] tracking-[0.18em] uppercase text-espresso/55`. `.lookbook-results-collection` (2949-2954): `text-brass text-[12px] tracking-[0.04em] normal-case`.

- [ ] **Step 7: Verify + lint + build + commit**

Collections page at 1280 & 390: ivory toolbar sticky under 62/58px header, search with brass focus, chips espresso-active, filters grid/mobile toggle, FAB espresso pill with brass dot. Search typing still scrolls to results. `npx eslint src/` + `npm run build`.

```bash
git add src/index.css src/components/CollectionsPage.jsx
git commit -m "feat(theme): migrate lookbook toolbar/search/filters to light + Tailwind"
```

---

### Task 9: CollectionsPage — results grid + cards + list + empty

**Files:**
- Modify: `src/index.css:2956-3101` (`.lookbook-results`, `.lookbook-layout-grid`, `.lookbook-card*`, `.lookbook-card-asset`, `.lookbook-card-code`, `.lookbook-card-body`, `.lookbook-card-cat`, `.lookbook-card-col`, `.lookbook-card h3`, `.lookbook-card-body p`, `.lookbook-card-enquire`, `.lookbook-layout-list*`, `.lookbook-empty*`) + responsive 3283-3285, 3367-3379
- Modify: `src/components/CollectionsPage.jsx`

- [ ] **Step 1: Results container**

`.lookbook-results` (2956-2960): `grid gap-7 mt-3`. `.lookbook-layout-grid` (2962-2965): `grid-cols-3 items-start` responsive `max-lg:grid-cols-2 max-sm:grid-cols-1` (3283-3285, 3367-3369). `.lookbook-layout-list` (3045-3048): `grid-cols-1 gap-5`.

- [ ] **Step 2: Grid card**

`.lookbook-card` (2967-2971): `flex flex-col cursor-pointer`. `.lookbook-card-asset` (2973-2979): `aspect-[3/4] min-h-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.02]` (hover via `group` on card: `group` + `group-hover:scale-[1.02]`). `.lookbook-card-code` (2985-2997): `absolute top-[14px] left-[14px] z-[2] p-[5px_9px] bg-espresso/70 border border-brass/40 rounded-[2px] text-champagne text-[10px] tracking-[0.14em]` (dark chip stays, readable on images). `.lookbook-card-body` (2999-3001): `pt-4`. `.lookbook-card-cat` (3011-3014): `text-brass mr-2.5`. `.lookbook-card-col` (3016-3018): `text-espresso/50`. both `inline-block text-[10px] tracking-[0.16em] uppercase` (3003-3009). `.lookbook-card h3` (3020-3023): `mt-2.5 mb-1.5 text-[22px]`. `.lookbook-card-body p` (3025-3030): `m-0 mb-2.5 text-[13px] italic text-espresso/60`. `.lookbook-card-enquire` (3032-3042): `text-[11px] tracking-[0.14em] uppercase text-brass transition-[letter-spacing] duration-200 group-hover:tracking-[0.2em]`.

- [ ] **Step 3: List card**

`.lookbook-layout-list .lookbook-card` (3050-3059): `grid grid-cols-[220px_1fr] gap-7 items-center p-5 border border-brass/20 bg-ivory transition-colors duration-200 hover:border-brass/50` responsive `max-sm:grid-cols-1 max-sm:gap-4 max-sm:p-[14px]` (3371-3375). `.lookbook-layout-list .lookbook-card-asset` (3066-3068): `aspect-[4/5]` responsive `max-sm:aspect-[4/3]` (3377-3379). `.lookbook-layout-list .lookbook-card-body` (3070-3072): `p-0`. `.lookbook-layout-list .lookbook-card h3` (3074-3077): `text-[28px] mt-2.5 mb-2`. `.lookbook-layout-list .lookbook-card-body p` (3079-3082): `max-w-[520px] text-[14px]`.

- [ ] **Step 4: Empty state**

`.lookbook-empty` (3085-3090): `grid justify-items-start gap-[14px] py-[72px]`. `.lookbook-empty h2` (3092-3095): `m-0 text-[clamp(40px,4.5vw,60px)]`. `.lookbook-empty p:not(.eyebrow)` (3097-3100): `max-w-[460px] m-0 mb-3`.

- [ ] **Step 5: Verify + lint + build + commit**

Grid + list layouts at 1280 & 390, hover states (scale on asset, tracking on enquire, border on list card), empty state after no-result search. `npx eslint src/` + `npm run build`.

```bash
git add src/index.css src/components/CollectionsPage.jsx
git commit -m "feat(theme): migrate lookbook cards/list/empty to light + Tailwind"
```

---

### Task 10: ProductPage

**Files:**
- Modify: `src/index.css:3102-3267` (`.product-page`, `.product-back`, `.product-grid`, `.product-media`, `.product-asset`, `.product-body`, `.lookbook-modal-kicker*`, `.lookbook-code`, `.product-body h2`, `.lookbook-tagline`, `.lookbook-description`, `.lookbook-specs*`, `.lookbook-modal-cta`, `.product-related*`, `.product-related-grid`) + responsive 3287-3316, 3381-3395
- Modify: `src/components/ProductPage.jsx`

- [ ] **Step 1: Page shell**

`.product-page` (3105-3108): `min-h-[100svh] p-[64px_5vw_96px]` responsive `max-sm:p-[40px_20px_72px]` (3381-3383). `.product-back` (3110-3126): `inline-flex items-center gap-2 mb-10 text-[12px] tracking-[0.12em] uppercase text-brass no-underline transition-colors duration-200 hover:text-heritage hover:tracking-[0.16em]` responsive `max-sm:mb-7` (3385-3387).

- [ ] **Step 2: Product grid + media**

`.product-grid` (3128-3133): `grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-14 items-start` responsive `max-lg:grid-cols-1 max-lg:gap-10` (3287-3290). `.product-media` (3135-3138): `sticky top-24` responsive `max-lg:static` (3292-3294). `.product-asset` (3140-3148): `aspect-[3/4] min-h-0` + background contain/center (keep as CSS utility-less background — but this was already migrated earlier in the session: **keep the current `background-size: contain; background-repeat: no-repeat; background-position: center` in CSS** — it's `--asset` background, not a utility). `.product-body` (3150-3152): `pt-2` responsive `max-lg:pt-0` (3296-3298).

- [ ] **Step 3: Product body**

`.lookbook-modal-kicker` (3154-3163): `flex flex-wrap items-center gap-2.5 mb-5 text-[10px] tracking-[0.16em] uppercase`. `span` (3165-3169): `p-[5px_10px] border border-brass/35 rounded-full`. `.lookbook-code` (3171-3174): `text-brass border-brass`. `.product-body h2` (3176-3179): `m-0 mb-2.5 text-[clamp(36px,4vw,52px)]`. `.lookbook-tagline` (3181-3187): `m-0 mb-5 font-display text-[22px] tracking-[0.02em] text-brass`. `.lookbook-description` (3189-3193): `m-0 mb-7 text-[15px] leading-[1.75]`. `.lookbook-specs` (3195-3201): `grid grid-cols-2 gap-8 pt-6 border-t border-brass/20` responsive `max-lg:grid-cols-1 max-lg:gap-6` (3304-3307). `.lookbook-spec-group h4` (3203-3209): `m-0 mb-3 text-[11px] tracking-[0.22em] uppercase text-brass`. `.lookbook-spec-group ul` (3211-3217): `grid gap-2 m-0 p-0 list-none`. `.lookbook-spec-group li` (3219-3225): `relative pl-4 text-[13px] leading-[1.5] text-espresso/80`; `li::before` (3227-3235) brass dash — keep in CSS (pseudo). `.lookbook-modal-cta` (3237-3243): `mt-8`. `.product-related` (3246-3250): `mt-24 pt-12 border-t border-brass/20` responsive `max-sm:mt-[72px]` (3389-3391). `.product-related h3` (3252-3258): `m-0 mb-8 text-[13px] tracking-[0.22em] uppercase text-brass`. `.product-related-grid` (3260-3262): `grid-cols-3` responsive `max-lg:grid-cols-2 max-sm:grid-cols-1` (3300-3302, 3393-3395). `.product-related-grid .lookbook-card` (3264-3267): `no-underline text-inherit`.

- [ ] **Step 4: Verify + lint + build + commit**

Product page at 1280 & 390: full image (contain) on parchment, espresso type, brass kicker/specs, related grid light. `npx eslint src/` + `npm run build`.

```bash
git add src/index.css src/components/ProductPage.jsx
git commit -m "feat(theme): migrate product page to light + Tailwind"
```

---

### Task 11: Preloader + final CSS purge + full QA

**Files:**
- Modify: `src/components/Preloader.jsx`, `src/index.css` (remaining non-migrated rules)
- Test: full-site QA

- [ ] **Step 1: Preloader colors**

`Preloader.jsx` custom classes (preloader, preloader-grain, preloader-brand, etc.) — check each; convert dark bg to `bg-ivory`/`bg-parchment`, brand text espresso; keep grain + animation in CSS. Verify fade-out.

- [ ] **Step 2: Sweep index.css for leftover dark colors**

`grep -n "oxblood\|espresso\|champagne\|rgba(42\|rgba(94\|rgba(232\|rgba(233\|rgba(251\|rgba(94" src/index.css` — every remaining hit must be either (a) an intended light-role usage (oxblood as ink accent, espresso as ink, brass borders, ivory chips on images) or (b) a miss. Fix all misses. Target: NO rule paints a full-section background dark.

- [ ] **Step 3: Delete migrated dead CSS**

Search for selectors whose classes are no longer in JSX (`grep -o 'className="[^"]*"' src/App.jsx src/components/*.jsx | ...` against `@layer components` selectors). Any rule whose class is gone from JSX and not in the keep-list (constraint 4) gets deleted. Verify build still passes after each deletion batch. Target end-state: `wc -l src/index.css` ≈ 600-800.

- [ ] **Step 4: Full QA pass**

Dev server up. Verify at 1280×900 AND 390×844:
- Home: header, hero (video + text contrast), story, heritage, founder arch, timeline marquee (motion), craft grid, artisans collage, why grid, collections cards, questions, faq (open/close), closing form (focus/error/success), footer care-label (thread draw on scroll), mobile menu open/close.
- Collections: search (type → results at top), chips filter, collection pills, layout toggle grid/list, FAB, mobile filters toggle, empty state, product open from card.
- Product: image full (contain), specs, related, back link.
- Back/forward scroll restore = 0; anchor nav (#story etc.) works from collections page.
- Grain overlay subtle on light; CTA sheen/ghost hover everywhere; reduced-motion (emulate in devtools) has no animation.
- No horizontal scrollbar; no text/box overflow at either width.

- [ ] **Step 5: Final lint + build**

```bash
npx eslint src/
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/index.css src/components/Preloader.jsx
git commit -m "feat(theme): preloader light + final CSS purge + full QA"
```

---

## Self-Review

**Spec coverage:**
- Palette re-map → Task 1 ✓
- Everything light (no dark blocks) → Tasks 2-11, each converts every dark bg ✓ (mobile menu T2, hero T4, timeline T6, artisans T6, footer T7, FAQ T7, why T7, lookbook T8)
- Full Tailwind migration, CSS only when needed → Tasks 2-11 with keep-list (constraint 4) enforced in Task 11 ✓
- Spacing/layout preserved → constraint 5 + per-task screenshot verification ✓
- Ivory body + parchment panels → Task 1 + per-section bg choices ✓
- 9-phase order from spec → tasks follow spec order (tokens → header/hero → sections → sub-pages → purge → QA) ✓

**Placeholder scan:** all steps contain concrete selectors, exact utility strings, and values copied from the CSS inventory. No TBD/TODO.

**Type consistency:** token names unchanged throughout; utility strings reference `brass`, `espresso`, `ivory`, `parchment`, `champagne`, `heritage`, `terracotta` which are all defined in `@theme`. Breakpoint names `max-lg`/`max-sm` used consistently. CTA size map (`md`/`lg`/`sm`) matches the `Cta` component's existing `size` prop.

**Known risk (flagged):** `.desktop-nav a::after`, `.care-label nav a::after`, `.cta-*` animations, `.faq-item.is-open`, `.closing-underline`, `.lookbook-filters.is-open`, `.marquee` mask/stroke, grain/weave — all intentionally kept in CSS per constraint 4. If any kept rule renders wrong on light, adjust colors in CSS only (never delete the animation).