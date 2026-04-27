# Vixio Site Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (recommended for this plan — design cohesion requires a single executor holding full context) or superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a category-dominating rebuild of `/Users/arjunraja/Desktop/vixio-site` that feels Bloomberg Terminal × Stripe × Palantir while preserving Vixio's brand DNA (royal indigo `#233485`, teal `#37B8CB`, tagline verbatim).

**Architecture:** Static HTML5 + CSS custom properties + vanilla JS. No build step. Two shared files (`site/styles.css`, `site/nav.js`) + 15 page rewrites. Remaining ~33 pages inherit via the shared files.

**Tech Stack:** HTML5, modern CSS (custom properties, grid, container queries), vanilla JS (IntersectionObserver, minimal), Google Fonts (Inter, Fraunces, JetBrains Mono). No deps. No bundler.

**Spec:** `/Users/arjunraja/Desktop/vixio-site/docs/superpowers/specs/2026-04-20-vixio-rebuild-design.md`

---

## Phase A — Foundation

### Task 1: New design system (`site/styles.css`)

**Files:**
- Modify: `site/styles.css` (full rewrite, ~1800-2200 lines)

The CSS is organized in numbered layers for clarity:

```
/* 01 — Tokens (:root custom properties) */
/* 02 — Reset + base */
/* 03 — Typography */
/* 04 — Layout primitives (container, grid, stack, split) */
/* 05 — Utilities (display, spacing, text, tokens) */
/* 06 — Navigation + footer */
/* 07 — Command bar + live indicators */
/* 08 — Hero + hero-split */
/* 09 — Panels + brackets */
/* 10 — Data rows + ticker */
/* 11 — Stat displays */
/* 12 — Cards + logo wall */
/* 13 — Radar map */
/* 14 — Pillar tabs (platform demo) */
/* 15 — Swimlanes (before/after) */
/* 16 — Industry segments */
/* 17 — Resource cards */
/* 18 — Forms */
/* 19 — CTAs + bands */
/* 20 — Motion / keyframes */
/* 21 — Reveal on scroll */
/* 22 — Responsive breakpoints */
/* 23 — Utilities + helpers */
/* 24 — Print + prefers-reduced-motion */
```

Tokens include the full Vixio palette from spec §5.1, three font stacks, motion easings, radii, shadows, container sizes, nav heights.

- [ ] **Step 1**: Back up current `site/styles.css` to `site/styles.legacy.css` (for reference during page rewrites).
- [ ] **Step 2**: Write new `site/styles.css` complete — all 24 layers.
- [ ] **Step 3**: Start a local server: `python3 -m http.server 8000 --directory /Users/arjunraja/Desktop/vixio-site` (background).
- [ ] **Step 4**: Open `http://localhost:8000/` and sanity-check that the current homepage renders without CSS errors (will look broken because HTML still targets old classes — that's expected; this task only verifies the CSS file loads and parses).
- [ ] **Step 5**: Check DevTools console for CSS syntax errors. Fix any.

**Verification:** CSS file loads, no parse errors, tokens visible in :root inspector.

---

### Task 2: New header + footer (`site/nav.js`)

**Files:**
- Modify: `site/nav.js` (full rewrite, ~450-550 lines)

Contents:
1. Header template string — sticky nav with command-bar-inspired search affordance, live status chip, mega menus, login dropdown, primary CTA.
2. Footer template string — 6-column institutional layout: wordmark + regional selector, Platform, Industries, Resources, Company, Trust/Compliance badges. Bottom strip: © line, 6 legal anchors, 2 social links.
3. IntersectionObserver setup for `.reveal` elements (fadeUp on scroll, 60ms stagger).
4. Number counter for `[data-count]` elements (count up on visibility).
5. Tab handler for `.pillar-tabs` (platform demo).
6. Mobile nav toggle.
7. Megamenu open/close on hover AND focus.
8. Mini throttled scroll listener to toggle `.site-header--scrolled`.
9. Blink cursor setup for `.cmd-bar` (pure CSS actually — no JS needed).
10. Inject header at `#site-header`, footer at `#site-footer` on DOMContentLoaded.

- [ ] **Step 1**: Back up current `site/nav.js` to `site/nav.legacy.js`.
- [ ] **Step 2**: Write new `site/nav.js` complete.
- [ ] **Step 3**: Reload `http://localhost:8000/` — header and footer should inject. Existing homepage HTML will look broken; header/footer should render correctly with new styling.
- [ ] **Step 4**: Check DevTools console. Expected: no JS errors.
- [ ] **Step 5**: Click mobile toggle (at 375px width), verify mobile nav opens. Hover on desktop nav items, verify mega menus open.

**Verification:** Header + footer render across all pages (test 2-3 pages to confirm injection works), mega menus open, reveal classes animate when elements scroll into view.

---

## Phase B — Homepage (the flagship)

### Task 3: Rebuild homepage (`index.html`)

**Files:**
- Modify: `index.html` (full rewrite, ~600-800 lines)

Section flow (from spec §8.1):

1. `<head>` — title, meta description (SEO), font preconnect, stylesheet, site header placeholder div.
2. `<section class="hero">` — split layout:
   - Left: eyebrow "● LIVE · 200+ JURISDICTIONS", h1 "When compliance *fuels* growth, nothing slows you down." (with Fraunces italic on *fuels*), lede paragraph, two CTAs (primary "Book a demo" → contact page, secondary "Explore the platform" → /site/platform), three proof metrics in mono-tabular.
   - Right: `.panel-bracket` "Today's intelligence brief" with 5 `.data-row` items + severity distribution bar. Labeled as illustrative data.
3. `<section class="ticker-section">` — Bloomberg-style horizontal pulse ticker, one row of ~10 regulatory events infinite-scroll.
4. `<section class="logo-wall">` — grid of verified customer names as text wordmarks (Inter 600, letterspaced). 12 names per row grid.
5. `<section class="problem">` — big-typography problem statement citing verified Vixio stat "every 12 minutes somewhere in the world" + supporting paragraph + small frequency visualization (simple bar chart).
6. `<section class="pillars">` — three-pillar platform demo with `.pillar-tabs` switching between Horizon Scanning / Workflow Management / AI Assistant mock surfaces. Each tab reveals a dashboard-style SVG/HTML panel.
7. `<section class="radar">` — full-bleed world map with absolute-positioned pulse pins + right-side detail panel showing selected jurisdiction.
8. `<section class="stats-band">` — four big Fraunces numbers on dark inset panel with hairline borders: 200+, 1,400+, 4M+, 500+.
9. `<section class="compare">` — before/after workflow split with two swim-lane visualizations.
10. `<section class="segments">` — two large industry cards (Financial Services, Gambling) with sub-industry lists and deep-link CTAs.
11. `<section class="proof">` — one illustrative anonymized quote + verified "30% average productivity increase" stat.
12. `<section class="resources">` — three editorial-style resource cards (research report, blog post, webinar placeholders).
13. `<section class="cta">` — dual-path: primary "Book an intelligence briefing" + secondary "Download the 2026 Regulatory Yearbook" (no-form lead magnet).
14. Footer injection div + script tag.

- [ ] **Step 1**: Back up current `index.html` to `index.legacy.html`.
- [ ] **Step 2**: Write new `index.html` complete with all 14 blocks.
- [ ] **Step 3**: Reload `http://localhost:8000/` — full homepage should render.
- [ ] **Step 4**: Verify at 1440px, 1024px, 768px, 375px widths:
  - Hero split collapses to single column on mobile
  - Ticker scrolls smoothly
  - Logo wall wraps cleanly
  - Pillar tabs switch panels
  - World map renders (even if simplified on mobile)
  - Stats band stays readable
  - Swim-lanes stack vertically on narrow widths
  - CTAs wrap
- [ ] **Step 5**: Check DevTools console — no errors.
- [ ] **Step 6**: Verify reveal animations fire as you scroll.

**Verification:** Homepage passes the 5-second test (institutional + serious). Zero console errors. All 14 sections render at all 4 breakpoints.

---

## Phase C — Platform pages

### Task 4: Platform hub (`site/platform/index.html`)

**Files:**
- Modify: `site/platform/index.html` (full rewrite, ~400-500 lines)

Sections:
1. Hero: "A single platform for every regulatory workflow." + live pulse dot + primary CTA.
2. Architecture diagram (SVG): data layer → intelligence layer → workflow layer → decision layer. Annotated.
3. Capability grid (3 columns × ~4 rows = 10 capabilities from spec §8.3). Grouped by: Intelligence / Workflow / Research. Each card: icon, title, one-line description, link to its detail page.
4. Data Hub callout panel: "4M+ datapoints across 200+ jurisdictions" big stat.
5. Integration frameworks band: monospace chips listing DORA, MiCA, PSD3, UK Gambling Act, AML6, GDPR, PSPs, etc.
6. CTA band.

- [ ] **Step 1**: Back up current file to `index.legacy.html`.
- [ ] **Step 2**: Write new page.
- [ ] **Step 3**: Open `http://localhost:8000/site/platform/` in browser. Verify.
- [ ] **Step 4**: Test at 4 breakpoints.

**Verification:** Capability grid wraps cleanly, architecture diagram scales, all deep links navigate to detail pages.

---

### Task 5: Horizon Scanning page (`site/platform/horizon-scanning.html`)

**Files:**
- Modify: `site/platform/horizon-scanning.html` (full rewrite, ~350-450 lines)

Sections:
1. Hero with eyebrow `PLATFORM · HORIZON SCANNING` + live mini radar visualization (simplified globe with pulse pins).
2. Feature-list section: 4 alternating split panels — Detect (real-time capture), Contextualize (expert analysis), Route (owner assignment), Audit (evidence trail).
3. Full live-feed mock panel: `.panel-bracket` showing 12 data rows (example events).
4. Jurisdiction coverage radar: reusable `.radar` component showing "200+ jurisdictions, live".
5. Illustrative quote (clearly anonymized): "Head of Regulatory Operations, Tier-1 payments institution" — speaks to consolidation + speed value. Kept generic to not misrepresent any real customer.
6. CTA band.

- [ ] **Step 1**: Back up file.
- [ ] **Step 2**: Write new page.
- [ ] **Step 3**: Open in browser, verify.
- [ ] **Step 4**: Test at 4 breakpoints.

---

### Task 6: Workflow Management page (`site/platform/workflow-management.html`)

**Files:**
- Modify: `site/platform/workflow-management.html` (full rewrite, ~320-400 lines)

Sections:
1. Hero: "Regulatory change, routed like code review."
2. Workflow diagram: swim-lanes showing Intake → Assess → Assign → Evidence → Close → Audit trail.
3. Capabilities 4-up: Tasks, Approvals, Evidence locker, Audit trail.
4. Illustrative efficiency panel using verified "30% avg productivity increase" stat. Framed as platform-wide average, not per-customer claim.
5. CTA band.

- [ ] **Step 1**: Back up file.
- [ ] **Step 2**: Write new page.
- [ ] **Step 3**: Browser verify.

---

### Task 7: AI Regulatory Assistant page (`site/platform/ai-regulatory-assistant.html`)

**Files:**
- Modify: `site/platform/ai-regulatory-assistant.html` (full rewrite, ~320-400 lines)

Sections:
1. Hero with chat-interface mock panel on the right. Example prompts: "What changed in MiCA this week?" / "Summarize the FCA consumer duty in 3 bullets." Response shows cited sources.
2. 3 capabilities: Ask, Summarize, Compare.
3. Guarded-output callout: "Grounded in Vixio's verified corpus. Every answer cites its regulatory source." — signals differentiation from generic LLMs.
4. Illustrative quote from "Partner, Regulatory Group, International Law Firm" (clearly anonymized).
5. CTA band.

- [ ] **Step 1**: Back up file.
- [ ] **Step 2**: Write new page.
- [ ] **Step 3**: Browser verify.

---

## Phase D — How We Help + Industries

### Task 8: How We Help hub (`site/how-we-help/index.html`)

**Files:**
- Modify: `site/how-we-help/index.html` (full rewrite, ~320-400 lines)

Sections:
1. Hero: "Compliance outcomes, not software features."
2. 5 outcome cards in bento grid, each linking to its sub-page:
   - Stay ahead of regulatory change → stay-ahead.html
   - Enter markets faster → faster-market-entry.html
   - A single source of truth → single-source.html
   - Custom insights for critical decisions → custom-insights.html
   - Upskill with professional training → professional-training.html
3. Outcome proof strip (verified stats).
4. Illustrative quote.
5. CTA band.

- [ ] **Step 1**: Back up file.
- [ ] **Step 2**: Write new page.
- [ ] **Step 3**: Browser verify.

---

### Task 9: Gambling industry hub (`site/industries/gambling/index.html`)

**Files:**
- Modify: `site/industries/gambling/index.html` (full rewrite, ~400-500 lines)

Sections:
1. Hero: "Built for the compliance realities of global gambling." + live pulse.
2. Five sub-segment cards (large): Online Operators, Suppliers, Payment Services, Regulators, Law Firms. Each links to its sub-page.
3. Coverage map: world map with gambling jurisdictions highlighted.
4. Verified gambling-side customer logos (text wordmarks): bet365, Betway, Flutter, Entain, MGM Resorts, Caesars, Betsson, FDJ.
5. Illustrative quote.
6. CTA band.

- [ ] **Step 1**: Back up file.
- [ ] **Step 2**: Write new page.
- [ ] **Step 3**: Browser verify.

---

### Task 10: Gambling online operators (`site/industries/gambling/online-operators.html`)

**Files:**
- Modify: `site/industries/gambling/online-operators.html` (full rewrite, ~320-400 lines)

Sections:
1. Hero: "For operators launching and scaling across regulated markets."
2. Three-part narrative: speed-to-market, multi-jurisdiction licensing, AML + player-protection.
3. Illustrative case study panel.
4. Relevant platform modules grid (3-up): Country Reports, Technical Compliance, Horizon Scanning.
5. CTA band.

- [ ] **Step 1**: Back up file.
- [ ] **Step 2**: Write new page.
- [ ] **Step 3**: Browser verify.

---

### Task 11: Financial Services industry hub (`site/industries/financial-services/index.html`)

**Files:**
- Modify: `site/industries/financial-services/index.html` (full rewrite, ~400-500 lines)

Sections:
1. Hero: "Regulatory intelligence for modern financial services."
2. Five sub-segment cards: Payment Services, Retail Banking, Digital Assets, Regulators, Law Firms.
3. Coverage map: FS-relevant jurisdictions.
4. Verified FS customer logos (text wordmarks): PayPal, Wise, Worldline, Trustly, TrueLayer, SumUp, Payoneer, Paysafe, Microsoft, Google.
5. Illustrative quote.
6. CTA band.

- [ ] **Step 1**: Back up file.
- [ ] **Step 2**: Write new page.
- [ ] **Step 3**: Browser verify.

---

### Task 12: FS payment services (`site/industries/financial-services/payment-services.html`)

**Files:**
- Modify: `site/industries/financial-services/payment-services.html` (full rewrite, ~320-400 lines)

Sections:
1. Hero: "Payments compliance, end-to-end."
2. Three-part narrative: licensing + passporting, PSD3/PSR + operational resilience, cross-border + digital assets.
3. Illustrative case study panel.
4. Relevant platform modules grid.
5. CTA band.

- [ ] **Step 1**: Back up file.
- [ ] **Step 2**: Write new page.
- [ ] **Step 3**: Browser verify.

---

## Phase E — Other hubs

### Task 13: Resources hub (`site/resources/index.html`)

**Files:**
- Modify: `site/resources/index.html` (full rewrite, ~360-450 lines)

Sections:
1. Hero: "Analysis from our regulatory research desk."
2. Featured card: "Compliance Crystal Ball 2026" (verified real Vixio content) — large editorial card with link.
3. Content grid: 6 placeholder resources (mix of blog, research, webinar, podcast) with category tags. Titles are generic topical placeholders, not fake dated posts.
4. Subscribe band: "Get the weekly regulatory brief." (Form submits to a dummy success state.)
5. Category link list.

- [ ] **Step 1**: Back up file.
- [ ] **Step 2**: Write new page.
- [ ] **Step 3**: Browser verify.

---

### Task 14: About (`site/about/index.html`)

**Files:**
- Modify: `site/about/index.html` (full rewrite, ~440-520 lines)

Sections:
1. Hero: "Intelligence to anticipate and navigate." — mission line.
2. Company framing paragraph: "Founded in 2006 as GamblingCompliance in response to the UK Gambling Act 2005." Expanded to current 200+ jurisdiction footprint.
3. Stats row: `2006` founded, `500+` organisations, `200+` jurisdictions, `1,400+` authorities.
4. Timeline: 2006 founded → 2010 DC office → 2017 Global Regulatory Awards launched → 2019-2020 leadership expansion → 2025 FinTech Breakthrough + RegTech Insight awards.
5. Values — 4 cards (from spec §6 and current build).
6. Leadership — 6 real executives from verified list (initials + name + title + join year).
7. Partners/advisors placeholder (generic framing; no fake names).
8. Careers CTA.

- [ ] **Step 1**: Back up file.
- [ ] **Step 2**: Write new page.
- [ ] **Step 3**: Browser verify.

---

### Task 15: Contact (`site/about/contact.html`)

**Files:**
- Modify: `site/about/contact.html` (full rewrite, ~380-460 lines)

Sections:
1. Split layout:
   - Left: pitch ("Book a 30-minute intelligence briefing tailored to your sector."), bulleted deliverables (what you get from the briefing), two existing CTAs (Calendly link sourced from vixio.com's chilipiper widget URL as fallback for direct call booking; form-based alternative).
   - Right: form with industry pills, name, email, company, title, how-did-you-hear dropdown. Same dummy submit handler.
2. Direct contact: info@vixio.com (from verified JSON-LD).
3. Office locations strip: Washington DC (verified 2010), London (inferred primary HQ — marked as "offices in London, Washington DC"), plus placeholder for APAC. Use neutral phrasing: "Offices in London, Washington DC, and globally."
4. Response-time note.

- [ ] **Step 1**: Back up file.
- [ ] **Step 2**: Write new page.
- [ ] **Step 3**: Browser verify form submits to optimistic success state.

---

## Phase F — QA & polish

### Task 16: Cascade spot-check

**Files:** Read-only check on 8-10 non-rewritten pages to confirm the new CSS cascades without breaking their layouts.

- [ ] **Step 1**: Visit each of these pages in browser and look for obvious breakage:
  - `/site/platform/regulatory-library.html`
  - `/site/platform/data-hub.html`
  - `/site/platform/custom-report-builder.html`
  - `/site/industries/gambling/suppliers.html`
  - `/site/industries/financial-services/retail-banking.html`
  - `/site/resources/blog.html`
  - `/site/about/our-people.html`
  - `/site/how-we-help/stay-ahead.html`
- [ ] **Step 2**: For each, note: does header + footer render? Does content layout acceptably? Are there orphan styles from retired classes (e.g., `.hero-particles`) that should be cleaned up?
- [ ] **Step 3**: If any page is badly broken structurally, add a minimal HTML fix (e.g., remap an old class to a new one). DO NOT rewrite the page content.
- [ ] **Step 4**: For any orphan class like `.violet-500` referenced in HTML but removed from CSS, keep a compatibility stub in the CSS that maps it to the closest new token.

**Verification:** Every non-rewritten page looks at least as good as it did before the CSS cascade, ideally better.

---

### Task 17: Final QA + polish pass

- [ ] **Step 1**: Re-walk through all 15 rewritten pages at 1440, 1024, 768, 375. Keep notes.
- [ ] **Step 2**: Verify reveal animations fire on every page (IntersectionObserver connected).
- [ ] **Step 3**: Verify number counters animate on hero metrics.
- [ ] **Step 4**: Verify mega menus open on hover and keyboard focus (accessibility).
- [ ] **Step 5**: Check keyboard nav: tab through homepage, verify focus rings visible in Vixio teal `--accent-500`.
- [ ] **Step 6**: Check contrast: `--ink-7 (#8E8DA9)` on `--ink-0 (#0A0A14)` must meet WCAG AA (test with any contrast checker).
- [ ] **Step 7**: Final DevTools sweep: no console errors across all 15 pages.
- [ ] **Step 8**: Remove `.legacy.css` / `.legacy.js` / `.legacy.html` backups from site once confident (or keep them hidden under `site/_legacy/` directory for safety).

**Verification:** All rewritten pages are shippable. No console errors. Contrast passes AA. Keyboard nav works.

---

## Self-Review Results

**Spec coverage:** ✓ Every section of spec §8 (Page Specifications) has a dedicated task. Every token in spec §5 is referenced in Task 1. Component list in spec §6 maps to Task 1 layers 7-17.

**Placeholder scan:** ✓ No TBDs. Each task has concrete section inventory. CSS structure is documented by layer.

**Type consistency:** ✓ Class names consistent across plan (`--accent-500`, `.panel-bracket`, `.data-row`, `.pillar-tabs`, `.radar`). Same naming discipline carries into Task 1 implementation.

**Known simplifications:**
- This plan doesn't enumerate every line of HTML/CSS — doing so would duplicate the executor's work and double the document size. Each task identifies sections and components precisely enough that an executor with the spec can build them.
- Commit steps are omitted because the project is not a git repo. If the user initializes git, commits at the end of each task are recommended.

---

## Execution Handoff

Two execution options:

**1. Inline Execution (recommended for this plan)** — I execute tasks in this session using superpowers:executing-plans. Best choice here because:
- Design cohesion requires a single executor holding the full design language in context.
- Cascading subagents lose the visual through-line and each would need to re-learn the token system.
- The 15 pages share components — building them in one flow yields stronger consistency.

**2. Subagent-Driven** — I dispatch a fresh subagent per task, review between tasks. Faster in theory, but for this design-heavy work it produces a patchier result.

My recommendation: **Inline Execution**.
