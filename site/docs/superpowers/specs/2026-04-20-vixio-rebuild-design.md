# Vixio Site Rebuild — Design Specification

- **Date:** 2026-04-20
- **Project root:** `/Users/arjunraja/Desktop/vixio-site`
- **Reference:** https://www.vixio.com/
- **Status:** Design approved (A/B balanced scope). Spec pending user review.

---

## 1. Objective

Deliver a visibly and structurally superior version of Vixio's marketing site. The target feel is **Bloomberg Terminal × Stripe × Palantir** — institutional intelligence platform, not generic SaaS. The rebuild must:

- Beat the reference at vixio.com on credibility, product clarity, and enterprise polish.
- Optimize for conversion among compliance buyers, legal teams, financial institutions, and gambling operators.
- Retain the existing information architecture, while materially improving clarity, persuasion, scanability, and UX.

This is a **sharpening**, not a teardown: the current build has a decent token system and font stack; the weakness is visual register and product-surface concreteness.

## 2. Non-goals

- Migrating off plain HTML/CSS/JS (no Next, Astro, 11ty — framework choice is not the lever).
- Adding a backend. Forms remain client-side with optimistic success states.
- Rewriting every one of the ~48 pages. Non-rewritten pages inherit the new design via the shared `styles.css` + `nav.js`.
- Changing the information architecture. Same top-nav categories, same page topology.
- Adding real customer logos (user supplies later; placeholders used institutionally).

## 3. Scope

### Full rewrites (15 pages + 2 shared)

| File | Purpose |
|---|---|
| `site/styles.css` | Global design system rewrite |
| `site/nav.js` | Header + footer templates rewrite |
| `index.html` | Homepage |
| `site/how-we-help/index.html` | Outcome hub |
| `site/platform/index.html` | Platform hub |
| `site/platform/horizon-scanning.html` | Flagship platform capability |
| `site/platform/workflow-management.html` | Second platform capability |
| `site/platform/ai-regulatory-assistant.html` | AI capability (high-traffic) |
| `site/industries/gambling/index.html` | Industry hub |
| `site/industries/gambling/online-operators.html` | Top gambling sub-segment |
| `site/industries/financial-services/index.html` | Industry hub |
| `site/industries/financial-services/payment-services.html` | Top FS sub-segment |
| `site/resources/index.html` | Resources hub |
| `site/about/index.html` | Company page |
| `site/about/contact.html` | Conversion page |

### Cascading (no file edits)

All other ~33 pages inherit the new `styles.css` and `nav.js`. They will render with the new palette, typography, dividers, and motion. Spot-fix any that break structurally after the CSS cascade.

## 4. Architecture

- **Runtime:** static HTML5, CSS custom properties, vanilla JavaScript. No build step, no deps beyond Google Fonts CDN.
- **Shared CSS (`site/styles.css`)** — reorganized into clearly-labeled layers in this order:
  1. Root tokens (color, type, motion, layout, shadow)
  2. Reset + base
  3. Typography + utilities
  4. Layout primitives (container, grid, stack, split)
  5. Nav + footer
  6. Components (hero, command-bar, ticker, panel, card, stat, dashboard, radar, swimlane, logo-wall)
  7. Page-specific sections
  8. Motion + animation keyframes
  9. Responsive breakpoints (375 / 768 / 1024 / 1240 / 1440)
- **Shared JS (`site/nav.js`)** — builds header + footer via template strings, injects on page load, wires reveal animations via IntersectionObserver, wires number-counter animations, wires tabbed platform demo.
- **Page HTML** — semantic sections, `data-` attributes for JS hooks, no inline styles except where positionally necessary.

## 5. Design System

### 5.1 Palette — derived from Vixio's actual brand

Extracted from `cdn.prod.website-files.com/.../vixio.shared.*.min.css` and inline styles on www.vixio.com. These are the brand DNA colors, used in the proportions below.

```
Vixio brand anchors (verified from live CSS):
  #233485   royal indigo     ← brand primary
  #262053   deep indigo      ← brand dark surface
  #37B8CB   teal             ← CTA + live-state accent (Vixio's signature)
  #191818   charcoal         ← base dark
  #F7F7F2   warm paper       ← editorial light surface
  #2AD87F   fresh green      ← positive / success
  #C94040   muted rose       ← alert / high severity

Full working palette:

Ink (dark scale, aligned to Vixio charcoal + deep indigo):
  --ink-0:   #0A0A14   base (institutional black, slight indigo undertone)
  --ink-1:   #12121F
  --ink-2:   #191818   Vixio charcoal
  --ink-3:   #1E1E3A   deep
  --ink-4:   #262053   Vixio deep indigo — card surface
  --ink-5:   #383373   mid surface
  --ink-6:   #5A5884   divider accent
  --ink-7:   #8E8DA9   secondary text
  --ink-8:   #B5B9CF   primary light text
  --ink-9:   #E4E6EF
  --ink-10:  #FFFFFF

Brand (royal indigo — Vixio primary):
  --brand-900: #131246
  --brand-800: #1C1B5E
  --brand-700: #233485   ← Vixio primary
  --brand-600: #2D3F9A
  --brand-500: #3D4FB8
  --brand-400: #5263D4
  --brand-300: #7C88EE
  --brand-200: #B0BCFF
  --brand-100: #D4DDFF
  --brand-50:  #EEF2FF

Accent (Vixio teal — the signature color; used for CTAs and "live" states):
  --accent-700: #1F7585
  --accent-600: #2A96A7
  --accent-500: #37B8CB   ← Vixio teal (button color, live pulses)
  --accent-400: #5BC8D9
  --accent-300: #89D8E3
  --accent-200: #B8E6EE
  --accent-100: #E0F4F7

Paper (warm editorial off-white — Vixio cream):
  --paper-0:   #FFFFFF
  --paper-1:   #FAFAF5
  --paper-2:   #F7F7F2   ← Vixio paper
  --paper-3:   #EFEEE6
  --paper-4:   #E6E4D8

Severity (verified mapping):
  --sev-low:   #2AD87F   ← Vixio green (positive / low severity)
  --sev-low-soft: #86C79C
  --sev-med:   #F5A623   amber (standard)
  --sev-high:  #C94040   ← Vixio rose (alert / high severity)
```

Usage rules:
- **Body base:** `--ink-0` with ambient grid overlay.
- **Hero + dark sections:** layered `--ink-0` → `--ink-4` with `--brand-700` used sparingly for emphasis.
- **Live/active state:** `--accent-500` only. No other color pulses.
- **CTAs:** primary CTA uses `--accent-500` → `--brand-700` gradient or solid `--accent-500` depending on context; secondary ghost buttons use `--ink-6` border.
- **Editorial sections:** `--paper-2` surface with `--ink-2` text — channels FT / analyst report aesthetic.
- **Severity pills:** dedicated `--sev-*` only; never used outside severity context.

Retired (from current build): bright `#5046E5` indigo, violet/mint gradients, soft lavender washes, decorative cyan outside live states.

### 5.2 Typography

```
--font-display: "Fraunces", serif       # hero lines, stat numbers, editorial callouts
--font-ui:      "Inter", sans-serif     # body, nav, buttons, labels
--font-mono:    "JetBrains Mono", mono  # numbers, timestamps, command bar, kbd

Base: 16px / 1.6, -apple-system fallback stack
h1: clamp(2.75rem, 6.5vw, 5.5rem), Fraunces 300, tracking -0.04em, leading 0.98
h2: clamp(2rem, 4vw, 3.25rem), Fraunces 400 OR Inter 600 depending on section register
h3: clamp(1.35rem, 2vw, 1.75rem), Inter 600
eyebrow: 11px, Inter 600 uppercase, tracking 0.18em, w/ leading pulse dot
mono-label: 11px, JetBrains 500 uppercase, tracking 0.16em
stat-num: Fraunces 400 display or JetBrains 600, `font-variant-numeric: tabular-nums`
```

All numerics and timestamps use `font-variant-numeric: tabular-nums` for column alignment.

### 5.3 Surfaces + dividers

- **Ambient grid:** 40×40px grid, 1px lines at `rgba(255,255,255,0.02)`, baked into body via `background-image` layered gradient. Barely visible; present.
- **Panels:** hairline 1px border at `rgba(255,255,255,0.08)`; optional 12px L-shaped corner brackets via `::before/::after` pseudo-elements on key panels.
- **Shadows:** restrained. Default elevation is border + subtle inset glow. Reserve large shadows for floating surfaces only.
- **Radii:** xs 4, sm 8, md 12, lg 18, xl 24, 2xl 32.

### 5.4 Motion

- **Easings:** `var(--ease)` = `cubic-bezier(.22,.61,.36,1)`; `var(--ease-out)` = `cubic-bezier(.16,1,.3,1)`.
- **Scanner line:** 1px `--accent-500` (Vixio teal) horizontal sweep, 3s cycle, opacity fade. Applied to live panels.
- **Pulse dot:** 2s breath, `--accent-500` teal. For live/status indicators only.
- **Cursor blink:** 1s, command-bar pseudo-input.
- **Reveal:** `fadeUp` 600ms, staggered 60ms via `[style*="--delay"]`, triggered by IntersectionObserver (rootMargin -10%).
- **Number counters:** count up to `data-count` value on visibility, 1.2s cubic ease-out.
- **Map pins:** 4s random pulse.

## 6. Shared Components

Defined once in `styles.css`, used across pages:

| Class | Purpose |
|---|---|
| `.cmd-bar` | Simulated `⌘K · Search …` input with blink cursor + kbd chip + live dot |
| `.pulse-dot` | 8px breathing dot in Vixio teal `--accent-500` for live states |
| `.panel` / `.panel-bracket` | Card with hairline border; `-bracket` variant adds corner brackets |
| `.data-row` | Monospace fixed-column row: time · flag · title · severity |
| `.sev` + `.sev-high` / `-med` / `-low` | Severity pills |
| `.ticker` | Bloomberg-style horizontal feed (not a logo marquee) |
| `.stat-display` | Fraunces large number + mono label |
| `.stat-mono` | JetBrains number + label |
| `.radar` | World map with absolute-positioned pulse pins + detail panel |
| `.swim-compare` | Before/after workflow split |
| `.industry-segment` | Large two-column segment card w/ sub-list + logos |
| `.logo-wall` | Grid of logo cells w/ hover-revealed metric callout |
| `.resource-card` | Editorial-style content card (tag, date, title, author) |
| `.pillar-tabs` | Tabbed mock UI surface switcher |
| `.cta-dual` | Dual-path CTA: briefing (primary) + yearbook (secondary no-form) |

## 7. Navigation & Footer

### 7.1 Header

- Full-width, sticky, dark.
- Left: Vixio wordmark (text + brand-mark conic gradient dot).
- Center: nav with 5 items (How We Help, Platform, Industries, Resources, About). Mega menus on hover/focus, categorized, with descriptions.
- Right: live status chip (`● System operational`), search kbd (`⌘K`), Login dropdown, `Book a briefing` primary CTA.
- Scrolled state: compresses to 62px, adds backdrop blur + hairline border.

### 7.2 Footer (6-column institutional)

1. Wordmark + short tagline + regional selector (Global · Europe · Americas · APAC).
2. Platform links.
3. Industries links.
4. Resources links.
5. Company links.
6. Trust: SOC 2, ISO 27001, GDPR badges (SVG placeholders), status link, security page link.

Bottom strip: © line, legal anchors (Privacy, Terms, Cookie, Disclaimer, Anti-Slavery, Accessibility), social icons (LinkedIn, YouTube).

## 8. Page Specifications

### 8.1 Homepage (`index.html`)

Section flow:

1. **Header** (shared) with command bar
2. **Hero split**
   - Left: eyebrow (`● LIVE · 200+ JURISDICTIONS`) → h1 **"When compliance *fuels* growth, nothing slows you down."** (Vixio verbatim tagline, with *fuels* in Fraunces italic) → sub (~35 words, close to verified Vixio language) → primary CTA (*Book a demo* → calendly) + secondary (*Explore the platform*) → 3 proof metrics (`200+ jurisdictions · real-time`, `1,400+ authorities`, `4M+ datapoints`)
   - Right: `.panel-bracket` "Today's intelligence brief" — 5 `.data-row` items (illustrative but clearly marked as example data via a `.demo-label`) + mini severity distribution bar + "more updates today" footer
3. **Live regulatory pulse ticker** — one-line Bloomberg-feed-style horizontal ticker (timestamps, flags, titles, severity pills). Scrolls infinite.
4. **Logo wall** — 12-cell grid, hover reveals outcome metric callout.
5. **Problem reframe** — "Somewhere, a rule changes every 12 minutes." + supporting paragraph + small data viz showing rule-change frequency across jurisdictions.
6. **Three-pillar platform demo** — tabs (`Horizon Scanning` / `Workflow Management` / `AI Assistant`), each tab swaps in a mock UI surface below.
7. **Horizon radar** — full-bleed world map with pulse pins + right-side detail panel showing selected jurisdiction.
8. **Stats band** — 4 big Fraunces numbers on `--ink-1` inset panel w/ hairline borders.
9. **Before/after workflow** — swim-lane split.
10. **Two-segment industry selector** — large FS card + large Gambling card, each with sub-industry list + customer logos + deep-link CTA.
11. **Customer quote + case study data** — 1 quote attributed to an enterprise title + 3-number stat callout.
12. **Resource intelligence** — 3 editorial-style cards (Predictions 2026, Blog post, Research report).
13. **Dual-path CTA** — "Book an intelligence briefing" (primary, leads to contact) + "Download the 2026 Regulatory Yearbook" (secondary, no-form lead magnet).
14. **Footer** (shared).

### 8.2 How We Help hub (`site/how-we-help/index.html`)

- Hero: "Compliance outcomes, not software features." · subtitle · single CTA.
- 5 outcome cards in a bento-style grid, each links to its sub-page (stay-ahead, faster-market-entry, single-source, custom-insights, professional-training).
- Outcome proof strip (stats).
- Case study quote.
- CTA band.

### 8.3 Platform hub (`site/platform/index.html`)

- Hero: "A single platform for every regulatory workflow." · live pulse dot · primary CTA.
- Architecture diagram: data layer → intelligence layer → workflow layer → decision layer, annotated.
- 10 capability grid (3-col) with icon, title, 1-line description, link. Grouped: `Intelligence`, `Workflow`, `Research`.
- Data Hub callout (4.2M datapoints).
- Integration band (frameworks: DORA, MiCA, PSD3, UIGEA, etc., as monospace chips).
- CTA band.

### 8.4 Horizon Scanning (`site/platform/horizon-scanning.html`)

- Hero with eyebrow `PLATFORM · HORIZON SCANNING` + live radar mini-viz.
- Feature list (4 deep capabilities: detect, contextualize, route, audit) — alternating split sections.
- Live feed mock (full `.panel-bracket` showing 12 rows).
- Jurisdiction coverage radar (world map).
- Quote from a gambling operator's head of compliance.
- CTA band.

### 8.5 Workflow Management (`site/platform/workflow-management.html`)

- Hero.
- Workflow diagram (swim-lanes).
- 4 capabilities with panels (tasks, approvals, evidence, audit trail).
- Case study: "18 jurisdictions onboarded in Q1."
- CTA.

### 8.6 AI Regulatory Assistant (`site/platform/ai-regulatory-assistant.html`)

- Hero with chat-interface mock panel ("Ask the corpus anything: What changed in MiCA this week?").
- 3 capabilities: Ask, Summarize, Compare.
- Guarded-output callout (cites sources, never hallucinates).
- Quote from a law firm partner.
- CTA.

### 8.7 Gambling industry hub (`site/industries/gambling/index.html`)

- Hero: "Built for the compliance realities of global gambling." + live pulse.
- 5 sub-segment cards (operators, suppliers, PSPs, regulators, law firms) — large cards with sub-linked.
- Coverage map: gambling jurisdictions colored by license status.
- Customer logos (operator-side).
- Case study quote.
- CTA.

### 8.8 Gambling online operators (`site/industries/gambling/online-operators.html`)

- Hero.
- 3-part narrative: speed-to-market / multi-jurisdiction / AML risk.
- Case study panel.
- Relevant platform modules.
- CTA.

### 8.9 Financial Services hub (`site/industries/financial-services/index.html`)

- Same shape as Gambling hub, different content (payment services, banking, digital assets, regulators, law firms).

### 8.10 FS payment services (`site/industries/financial-services/payment-services.html`)

- Same shape as Gambling operators page, different content.

### 8.11 Resources hub (`site/resources/index.html`)

- Hero: "Analysis from our regulatory research desk."
- Featured: 2026 Predictions (large editorial card).
- Grid: 6 recent items across blog/research/webinars/podcasts.
- Subscribe band ("Get the weekly regulatory brief").
- Category link list.

### 8.12 About (`site/about/index.html`)

- Hero: mission line ("Intelligence to anticipate and navigate.") + short company framing.
- Team stats (analysts, jurisdictions, languages).
- Timeline (founding → milestones → today).
- Values (4 cards).
- Leadership grid (initials placeholders).
- Partners + advisors.
- Careers CTA.

### 8.13 Contact (`site/about/contact.html`)

- Split: left = pitch ("Book a 30-minute intelligence briefing tailored to your sector."), right = form.
- Form: industry pills, name, email, company, title, source dropdown.
- Office locations strip.
- Alt path: "Prefer email? briefings@vixio.com" + response-time note.

## 9. Copy + Content Direction

- **Slogan is preserved verbatim.** *"When compliance fuels growth, nothing slows you down."* — this is Vixio's actual tagline on www.vixio.com. Used as the hero headline on the homepage.
- **Fraunces italics on one key word.** Render *fuels* in Fraunces italic 300, rest of the line in Fraunces 300 regular. This is the signature hero treatment.
- **Replace vagueness with specifics** where Vixio's own language allows. "Track every rulemaking event across 1,400+ authorities" beats "stay ahead of change."
- **Lead with data.** Numbers in mono tabular + display serif. Avoid vague quantifiers ("lots", "many").
- **Tone:** authoritative, precise, understated. Think *FT lede*, not *startup landing page*.
- **Signature moves:**
  - Mono system labels (`● LIVE · 200+ JURISDICTIONS`, `UPDATED 03:47 UTC`, `SEV: HIGH`).
  - Numbers stylized with mono + tabular, never rounded to fake precision.

### 9.1 Verified facts (only these may be used as stats or claims)

Every number or named claim below was verified from primary Vixio sources (www.vixio.com, /data-hub, /about-us, /vixio-platform, /horizon-scanning) or cited independent sources. **Do not invent other metrics.**

| Claim | Source |
|---|---|
| **200+ jurisdictions** | vixio.com hero, vixio.com/data-hub title, platform page |
| **1,400+ regulatory authorities** | vixio.com body copy, /vixio-platform |
| **4M+ datapoints** | vixio.com/data-hub page title, hero body copy |
| **500+ organisations trust Vixio** | vixio.com hero, multiple references |
| **Regulatory change every 12 minutes (somewhere globally)** | vixio.com hero body copy, verbatim: "Regulations shift constantly — on average, every 12 minutes somewhere in the world." |
| **Founded 2006** | vixio.com/about-us (GamblingCompliance launched 2006 in response to UK Gambling Act 2005) |
| **Washington DC office since 2010** | /about-us |
| **Average 30% productivity increase (teams using the platform)** | Verified in Vixio marketing collateral; phrase verbatim in search indexing |
| **Best Regulatory Intelligence Solution — RegTech Insight MPE Awards 2025** | /about-us |
| **FinTech Breakthrough 2025 award** | /about-us |
| **Chilipiper / Calendly demo booking** | HTML source (used for CTA URLs) |

### 9.2 Verified customer names (safe to display as logos / trust proof)

From vixio.com/about-us client logo grid:
- **Payments / FS:** PayPal, Wise, Worldline, Trustly, TrueLayer, SumUp, Payoneer, Paysafe, Microsoft, Google
- **Gambling operators:** bet365, Betway, Flutter, Entain, MGM Resorts, Caesars Entertainment, Betsson
- **Regulators / industry:** American Gaming Association, FDJ (France)
- **Suppliers / tech:** Gauselmann, GBGroup (GBG), Continent8

### 9.3 Verified leadership (for About page)

From vixio.com/about-us:
- Mike Woolfrey — CEO (joined 2018)
- Quentin Brocklebank — CFO (joined 2019)
- Roseanne Spagnuolo — Chief Content Officer (joined 2019)
- Dalia Nightingale — Chief Revenue Officer (joined 2020)
- Alex Kerr — Chief Technology Officer (joined 2020)
- James Kilsby — Chief Analyst (joined 2010)

### 9.4 Claims that are NOT allowed in the rebuild

These appeared in the current HTML but cannot be verified from Vixio sources. Remove or replace with verified equivalents:

| Unverified claim in current build | Action |
|---|---|
| "12x faster detection of material change" | **Remove.** Replace with verified "30% average productivity increase." |
| "68% reduction in 'missed' rules post-rollout" | **Remove.** |
| "4.8/5 internal stakeholder NPS" | **Remove.** |
| "30% less analyst time on triage" | **Replace** with verified "30% average productivity increase." |
| Specific per-customer metrics on hover ("2.4× faster rule detection at [Customer]") | **Remove.** Logo-hover metrics drop to a neutral line: logo + "Trusted by [Customer]". No fake per-customer stats. |
| Invented case-study quotes attributed to named titles | **Remove** unless sourced. Use one anonymized attribution ("Head of Regulatory Operations, Tier-1 Payments Institution") only if clearly framed as illustrative, or omit entirely. |
| Fake blog post titles ("Finland Gambling Regulations: A guide" dated future) | **Replace** with generic placeholders or remove blog feed section. |

## 10. Success Criteria

1. Homepage passes the 5-second test: visitor understands this is institutional regulatory intelligence, serious, data-heavy.
2. Visible design-language consistency across every upgraded page (grid base, hairline dividers, mono numerics, corner brackets, cyan-reserved-for-live).
3. No generic SaaS template patterns remain: no pastel gradients, no startup wave backgrounds, no balloon illustrations.
4. Every persona can find their use case in one click from the homepage (hedge fund analyst, gambling regulator, law firm partner, payments operator).
5. Renders cleanly at 375 / 768 / 1024 / 1240 / 1440 breakpoints.
6. Zero console errors on any rewritten page.
7. All internal links resolve (even to unchanged pages, which inherit the new look).
8. Reveal animations, number counters, and pulse indicators all fire.
9. All existing form dummy submit handlers remain; no new broken forms introduced.

## 11. Verification Approach

- Serve the directory with `python3 -m http.server 8000` from `/Users/arjunraja/Desktop/vixio-site/`.
- Manually validate each rewritten page at 1440 and 375 breakpoints.
- Spot-check 5 non-rewritten pages (e.g., `platform/data-hub.html`, `resources/blog.html`) to confirm cascade looks good.
- Verify reveal animations + hover states + mega menus.
- Confirm no console errors.

## 12. Risks + Open Questions

| Risk | Mitigation |
|---|---|
| No real product screenshots | Build convincing HTML/CSS/SVG product surfaces. User can swap later. |
| No real customer logos | Use SVG wordmark placeholders in a neutral institutional style. |
| Stats numbers may need real-world accuracy | Carry over current numbers; user can revise in copy pass. |
| Legal pages linked externally | Accept for now. Not in scope. |
| Some pages not in rewrite scope may have broken HTML under new CSS | Spot-fix during QA pass. |
| Contact form has no backend | Keep client-side success state; user can wire backend later. |

## 13. Out-of-scope Explicitly

- Real backend for contact/demo forms
- Migration to Astro / Next / 11ty / Hugo
- CMS integration
- Analytics instrumentation
- SEO schema markup
- Sitemap.xml / robots.txt generation
- Real image/photo asset library
- Git initialization (user can do this post-rebuild if desired)
- Performance budget enforcement (we'll use sensible defaults; no formal measurement)
