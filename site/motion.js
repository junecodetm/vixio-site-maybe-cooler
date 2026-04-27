/* =========================================================================
   VIXIO — Motion System (GSAP + ScrollTrigger + SplitText)
   Build 2026-04-26
   Reads data attributes:
     [data-reveal]            entrance fade/slide
     [data-reveal="cascade"]  staggered reveal of children
     [data-cascade]           staggered reveal of children (alias)
     [data-counter]           number tick-up to data-target
     [data-magnet]            cursor-magnetic button
     [data-split]             SplitText character entrance
     [data-mini-map]          hero mini-map (rendered by dashboard.js)
     [data-mini-ticker]       hero alert ticker
     [data-typing]            typing-effect text
     [data-live-intel-map]    homepage Live Intelligence map (dashboard.js)
     [data-swim-stagger]      swim-lane progressive reveal
     [data-draw-line]         underline draw-in
   Honors prefers-reduced-motion.
   ========================================================================= */
(function () {
  'use strict';

  function whenReady(check, fn, retries) {
    retries = retries == null ? 80 : retries;
    if (check()) { fn(); return; }
    if (retries <= 0) return;
    setTimeout(function () { whenReady(check, fn, retries - 1); }, 60);
  }

  whenReady(
    function () { return window.gsap && window.ScrollTrigger; },
    init
  );

  function init() {
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(SplitText);

    gsap.defaults({ ease: 'power3.out', duration: 0.85, overwrite: 'auto' });

    if (reduceMotion) {
      document.querySelectorAll('[data-reveal], [data-cascade]').forEach(function (el) {
        el.classList.add('is-revealed');
      });
      runCounters(true);
      runDashboardHooks(true);
      return;
    }

    runReveals();
    runCascades();
    runCounters(false);
    runMagnets();
    runSplitHeadlines();
    runDrawLines();
    runDashboardHooks(false);
    runTickerLoop();
    runTypingDemos();
    setupHeroPanelLoop();
    runMegaDropdowns();
    runBarFills();
    runLiveDashboards(reduceMotion);
    runPlatformDashboardAnims(reduceMotion);

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  function runReveals() {
    var els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    els.forEach(function (el) {
      if (el.getAttribute('data-reveal') === 'cascade') return;
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: function () {
          el.classList.add('is-revealed');
          gsap.to(el, { opacity: 1, y: 0, x: 0, scale: 1, duration: 0.85, ease: 'power3.out' });
        }
      });
    });
  }

  function runCascades() {
    var nodes = document.querySelectorAll('[data-cascade], [data-reveal="cascade"]');
    nodes.forEach(function (parent) {
      var kids = parent.children;
      if (!kids.length) return;
      gsap.set(kids, { opacity: 0, y: 28 });
      ScrollTrigger.create({
        trigger: parent,
        start: 'top 86%',
        once: true,
        onEnter: function () {
          parent.classList.add('is-revealed');
          gsap.to(kids, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            stagger: { each: 0.08, from: 'start' }
          });
        }
      });
    });

    document.querySelectorAll('.reveal:not([data-reveal])').forEach(function (el) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: function () { el.classList.add('is-visible'); }
      });
    });
  }

  function runCounters(reduce) {
    // Support both [data-counter] (new convention) and legacy [data-count] used by some inner pages.
    var nodes = document.querySelectorAll('[data-counter], [data-count]');
    nodes.forEach(function (el) {
      var rawTarget = el.getAttribute('data-target')
                   || el.getAttribute('data-count')
                   || el.textContent
                   || '0';
      var target = parseFloat(rawTarget);
      // [data-counter-suffix] is rendered by CSS via ::after (animated.css). Do NOT also
      // append it in textContent — that produced "200++" / "4M+M+" duplication. Legacy
      // [data-suffix] has no CSS rule, so JS still appends it.
      var cssSuffix = el.getAttribute('data-counter-suffix');
      var jsSuffix = el.getAttribute('data-suffix') || '';
      var prefix = el.getAttribute('data-counter-prefix') || el.getAttribute('data-prefix') || '';
      var format = el.getAttribute('data-counter-format') || 'int';
      var decimals = el.getAttribute('data-decimals');
      if (decimals != null) {
        format = 'fixed';
        decimals = parseInt(decimals, 10) || 1;
      }

      function setDisplay(val) {
        var rendered;
        if (format === 'comma') rendered = Math.round(val).toLocaleString();
        else if (format === 'decimal') rendered = val.toFixed(1);
        else if (format === 'fixed') rendered = val.toFixed(decimals);
        else rendered = Math.round(val).toString();
        el.textContent = prefix + rendered + jsSuffix;
      }

      if (reduce) {
        setDisplay(target);
        if (cssSuffix) el.classList.add('counted');
        return;
      }

      var obj = { v: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: 'top 92%',
        once: true,
        onEnter: function () {
          gsap.to(obj, {
            v: target,
            duration: 1.6,
            ease: 'expo.out',
            onUpdate: function () { setDisplay(obj.v); },
            onComplete: function () {
              setDisplay(target);
              if (cssSuffix) el.classList.add('counted');
            }
          });
        }
      });
    });
  }

  function runMagnets() {
    document.querySelectorAll('[data-magnet]').forEach(function (btn) {
      var bounds;
      var qX = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' });
      var qY = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' });
      var radius = 80;

      function onMove(e) {
        var rect = bounds || btn.getBoundingClientRect();
        var dx = e.clientX - (rect.left + rect.width / 2);
        var dy = e.clientY - (rect.top + rect.height / 2);
        var dist = Math.hypot(dx, dy);
        if (dist > radius) { qX(0); qY(0); return; }
        qX(dx * 0.18);
        qY(dy * 0.18);
      }
      function onLeave() { qX(0); qY(0); }
      btn.addEventListener('mouseenter', function () { bounds = btn.getBoundingClientRect(); });
      btn.addEventListener('mousemove', onMove);
      btn.addEventListener('mouseleave', onLeave);
    });
  }

  function runSplitHeadlines() {
    var nodes = document.querySelectorAll('[data-split]');
    if (!nodes.length) return;
    if (!window.SplitText) {
      nodes.forEach(function (el) { el.classList.add('is-split-ready', 'is-revealed'); gsap.set(el, { opacity: 1 }); });
      return;
    }
    nodes.forEach(function (el) {
      function go() {
        var split = new SplitText(el, { type: 'lines, words, chars', linesClass: 'line-x', charsClass: 'char-x' });
        gsap.set(el, { opacity: 1 });
        gsap.from(split.chars, {
          opacity: 0,
          y: 36,
          rotation: 4,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.012
        });
        el.classList.add('is-split-ready');
      }
      if (document.fonts && document.fonts.ready) { document.fonts.ready.then(go); }
      else { go(); }
    });
  }

  function runDrawLines() {
    document.querySelectorAll('[data-draw-line], .draw-line').forEach(function (el) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: function () { el.classList.add('is-revealed'); }
      });
    });
  }

  function runDashboardHooks(reduce) {
    if (!window.VixioDashboard) {
      var tries = 60;
      var iv = setInterval(function () {
        if (window.VixioDashboard) { clearInterval(iv); doInit(); }
        else if (--tries <= 0) { clearInterval(iv); }
      }, 100);
    } else {
      doInit();
    }
    function doInit() {
      try {
        if (document.querySelector('[data-mini-map]')) window.VixioDashboard.miniMap('[data-mini-map]', { reduce: reduce });
        if (document.querySelector('[data-live-intel-map]')) window.VixioDashboard.liveIntelMap('[data-live-intel-map]', { reduce: reduce });
        if (document.querySelector('[data-dashboard]')) window.VixioDashboard.fullDashboard('[data-dashboard]', { reduce: reduce });
      } catch (err) {
        if (window.console) console.warn('[Vixio] dashboard init issue', err);
      }
    }
  }

  // Build a ticker row using safe DOM methods (no innerHTML)
  function buildTickerRow(r) {
    var row = document.createElement('div');
    row.className = 'hero-v2-ticker-row';
    var t = document.createElement('span'); t.className = 't'; t.textContent = r.t;
    var f = document.createElement('span'); f.className = 'f'; f.textContent = r.f;
    var body = document.createElement('div'); body.className = 'body';
    var reg = document.createElement('span'); reg.className = 'reg'; reg.textContent = r.reg;
    body.appendChild(reg);
    body.appendChild(document.createTextNode(r.body));
    var sev = document.createElement('span'); sev.className = 'sev ' + r.sev; sev.textContent = r.sev;
    row.appendChild(t); row.appendChild(f); row.appendChild(body); row.appendChild(sev);
    return row;
  }

  function runTickerLoop() {
    var ticker = document.querySelector('[data-mini-ticker]');
    if (!ticker) return;
    var rows = [
      { t: '04:12', f: '🇬🇧', reg: 'FCA', body: 'Consumer Duty · Phase 2 review', sev: 'high' },
      { t: '03:47', f: '🇪🇺', reg: 'EBA', body: 'MiCA · stablecoin reserves RTS', sev: 'med' },
      { t: '02:51', f: '🇦🇺', reg: 'ACMA', body: 'Gambling · ad code revisions', sev: 'high' },
      { t: '01:15', f: '🇸🇬', reg: 'MAS', body: 'Payment services · scope notice', sev: 'med' },
      { t: '00:42', f: '🇺🇸', reg: 'CFTC', body: 'Swap data reporting · update', sev: 'low' },
      { t: '23:18', f: '🇨🇦', reg: 'OSFI', body: 'Capital adequacy · technical bulletin', sev: 'med' },
      { t: '22:55', f: '🇩🇪', reg: 'BaFin', body: 'AML circular · effective Q3', sev: 'high' }
    ];

    var idx = 0;
    function paintBatch() {
      while (ticker.firstChild) ticker.removeChild(ticker.firstChild);
      for (var i = 0; i < 3; i++) {
        var r = rows[(idx + i) % rows.length];
        var row = buildTickerRow(r);
        ticker.appendChild(row);
        (function (rowEl, delay) {
          setTimeout(function () { rowEl.classList.add('show'); }, 120 + delay * 110);
        })(row, i);
      }
      idx = (idx + 1) % rows.length;
    }
    paintBatch();
    setInterval(paintBatch, 6500);
  }

  function runTypingDemos() {
    document.querySelectorAll('[data-typing]').forEach(function (el) {
      var text = el.getAttribute('data-typing') || el.textContent || '';
      el._typingFullText = text;
      el.textContent = '';
      el.classList.add('typing-cursor');
      var i = 0;
      var speed = parseFloat(el.getAttribute('data-typing-speed') || '40');
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: function () {
          var iv = setInterval(function () {
            el.textContent = text.substring(0, i++);
            if (i > text.length) {
              clearInterval(iv);
              setTimeout(function () { el.classList.remove('typing-cursor'); }, 1200);
            }
          }, speed);
        }
      });
    });
  }

  /* ----------------------------------------------------------------------
     MEGA DROPDOWNS — refined open/close, single-open enforcement, per-link
     nudge. nav.js still toggles aria-expanded (caret rotation). GSAP drives
     opacity, a small lift, and child stagger. Only ONE dropdown can be
     visible at a time — when the cursor moves to a new nav-item, the
     previous panel snaps shut instantly so the two never overlap mid-flight.
     ---------------------------------------------------------------------- */
  /* ----------------------------------------------------------------------
     MEGA DROPDOWNS — full rewrite (v3).

     Design choices that fix the "hovering doesn't work" + cross-tab overlap
     bugs in v2:

     1. ONE bidirectional timeline per entry. play() to open, reverse() to
        close. No more two-timeline state-machine where invalidate/restart
        could leave panels stuck mid-state.

     2. Explicit progress(0) + pause() for snap-close. This is bulletproof
        because GSAP records the timeline's start values at FIRST play, and
        progress(0) always returns to those exact recorded values — no
        matter where the panel is in any animation.

     3. Pointer-events on the panel are managed via timeline lifecycle
        callbacks, not gsap.set in the middle of event handlers. This
        eliminates a class of races where pointer-events could end up
        out-of-sync with the panel's visibility.

     4. The hovered nav-item gets data-mega-open="true" so CSS can flip
        any necessary "active" affordances on the link itself, while the
        panel visibility is fully driven by GSAP inline styles.

     5. Cross-tab handoff: when ANY entry opens, ALL other entries snap-
        close instantly (progress(0)), regardless of their current state.
        This is the single source of truth for "only one open at a time".

     6. "Hover-grace" delay (60ms) before close starts — gives the cursor
        time to cross the small gap between nav-items without the panel
        reversing and re-playing every transit. */
  function runMegaDropdowns() {
    var entries = [];
    var openEntry = null;
    var leaveTimer = null;

    var tries = 60;
    function attach() {
      var items = document.querySelectorAll('.nav-item');
      if (!items.length) {
        if (--tries > 0) setTimeout(attach, 80);
        return;
      }
      items.forEach(wireOne);
    }

    function wireOne(item) {
      var mega = item.querySelector(':scope > .mega');
      if (!mega || mega.__vxoMega) return;
      mega.__vxoMega = true;
      mega.setAttribute('data-mega-js', 'true');

      var children = Array.prototype.slice.call(mega.children);
      var links = mega.querySelectorAll('.mega-link');
      var navLink = item.querySelector('.nav-link');

      // Pin the closed state so CSS doesn't fight us. xPercent: -50 reproduces
      // the legacy CSS `transform: translateX(-50%)` centering, but inline
      // (so GSAP keeps composing transforms cleanly across tweens).
      gsap.set(mega, {
        opacity: 0,
        xPercent: -50,
        y: -6,
        pointerEvents: 'none',
        transformOrigin: '50% 0%'
      });
      gsap.set(children, { opacity: 0, y: 8 });

      // ---- ONE bidirectional timeline ----
      // Forward = open, reverse = close. We never restart it, just play /
      // reverse / progress. This is the most reliable GSAP pattern for a
      // two-state UI element.
      var tl = gsap.timeline({
        paused: true,
        // Lock the start values now so progress(0) is stable forever
        onStart:           function () { gsap.set(mega, { pointerEvents: 'auto' }); },
        onReverseComplete: function () { gsap.set(mega, { pointerEvents: 'none' }); }
      });
      tl.fromTo(mega,
        { opacity: 0, y: -6 },
        { opacity: 1, y: 0, duration: 0.22, ease: 'power3.out' });
      tl.fromTo(children,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.32, stagger: 0.022, ease: 'power3.out' },
        '-=0.14');

      function snap() {
        // Force-close instantly. progress(0) always returns to the recorded
        // start values; pause() halts any direction. This is what cross-tab
        // hover calls on every OTHER entry — no overlap is possible.
        tl.pause();
        tl.progress(0);
        gsap.set(mega, { pointerEvents: 'none' });
        item.removeAttribute('data-mega-open');
        if (navLink) navLink.setAttribute('aria-expanded', 'false');
      }

      function open() {
        // Cancel any pending close-grace timer (cursor came back in time).
        if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; }

        // Idempotent: if we're already open or opening, do nothing.
        if (openEntry === entry && tl.progress() === 1) return;

        // SNAP-close every other entry — including ones currently animating.
        // This is the cross-tab handoff that eliminates overlap.
        for (var k = 0; k < entries.length; k++) {
          if (entries[k] !== entry) entries[k].snap();
        }
        openEntry = entry;
        item.setAttribute('data-mega-open', 'true');
        if (navLink) navLink.setAttribute('aria-expanded', 'true');
        tl.play();
      }

      function close(immediate) {
        // Idempotent: if already fully closed, do nothing.
        if (openEntry !== entry && tl.progress() === 0) return;

        if (immediate) {
          snap();
          if (openEntry === entry) openEntry = null;
          return;
        }
        // Hover-grace: small delay so a cursor crossing the gap between
        // nav-items doesn't trigger a full close+reopen cycle.
        if (leaveTimer) clearTimeout(leaveTimer);
        leaveTimer = setTimeout(function () {
          leaveTimer = null;
          if (openEntry === entry) openEntry = null;
          item.removeAttribute('data-mega-open');
          if (navLink) navLink.setAttribute('aria-expanded', 'false');
          tl.reverse();
        }, 60);
      }

      var entry = { item: item, mega: mega, snap: snap, open: open, close: close };
      entries.push(entry);

      item.addEventListener('mouseenter', open);
      item.addEventListener('mouseleave', function () { close(false); });
      item.addEventListener('focusin',  open);
      item.addEventListener('focusout', function (e) {
        if (!item.contains(e.relatedTarget)) close(true);
      });

      // Per-link nudge — subtle X-translate so the cursor's destination feels alive.
      links.forEach(function (link) {
        var qX = gsap.quickTo(link, 'x', { duration: 0.24, ease: 'power3.out' });
        link.addEventListener('mouseenter', function () { qX(6); });
        link.addEventListener('mouseleave', function () { qX(0); });
      });
    }

    // Belt-and-suspenders: any pointer movement clearly outside the nav-menu
    // closes whatever's currently open. Catches edge cases where mouseleave
    // didn't fire (e.g. cursor exits through dev-tools, scrollbar, etc.).
    document.addEventListener('mousemove', function (e) {
      if (!openEntry) return;
      var navMenu = openEntry.item.closest('.nav-menu');
      var rect = navMenu ? navMenu.getBoundingClientRect() : null;
      if (!rect) return;
      var megaRect = openEntry.mega.getBoundingClientRect();
      var inNav = e.clientX >= rect.left && e.clientX <= rect.right
               && e.clientY >= rect.top && e.clientY <= rect.bottom + 12;
      var inMega = e.clientX >= megaRect.left && e.clientX <= megaRect.right
                && e.clientY >= megaRect.top - 6 && e.clientY <= megaRect.bottom + 8;
      if (!inNav && !inMega) openEntry.close(false);
    }, { passive: true });

    // Escape key closes any open dropdown.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && openEntry) openEntry.close(true);
    });

    attach();
  }

  /* ----------------------------------------------------------------------
     BAR FILLS — animate score-bar groups (e.g. market-assessments rows)
     by scaling each child bar from 0 → 1 along its bottom edge.
     Use [data-bar-fill] on the flex container that holds the bars.
     ---------------------------------------------------------------------- */
  function runBarFills() {
    // On market-assessments.html, animMarketBars manually orchestrates the
    // bar fills AFTER the counters complete + then pops the recommendation.
    // Skip auto-firing for bars inside .dashboard-inner on that page so the
    // two systems don't fight over the same target.
    var skipManual = /market-assessments\.html$/.test(location.pathname);
    document.querySelectorAll('[data-bar-fill]').forEach(function (group) {
      if (skipManual && group.closest('.dashboard-inner')) return;
      var bars = group.children;
      if (!bars.length) return;
      gsap.set(bars, { scaleY: 0, transformOrigin: '50% 100%' });
      ScrollTrigger.create({
        trigger: group,
        start: 'top 92%',
        once: true,
        onEnter: function () {
          gsap.to(bars, {
            scaleY: 1,
            duration: 0.5,
            ease: 'back.out(1.6)',
            stagger: 0.06
          });
        }
      });
    });
  }

  /* ----------------------------------------------------------------------
     LIVE DASHBOARDS — auto-applied to every .dashboard-inner widget.
     - Stagger entrance for visible rows (so the panel "loads in")
     - Random row-ping every 4–8s (signals "this just refreshed")
     - Subtle scanner sweep across the chrome top-bar
     - Live flicker on text containing "now", "live", "new"
     Pauses when the widget is off-screen to save cycles.
     ---------------------------------------------------------------------- */
  /* ----------------------------------------------------------------------
     LIVE DASHBOARDS — clean rebuild (Apr 2026).

     Removed entirely from the previous version:
       - Chrome scanner sweep (caused glitchy mid-animation pauses; the
         injected .dash-sweep div sometimes ended up in the wrong
         positioning context and rendered outside its panel)
       - Row-ping random-flash (timing was unpredictable, conflicted with
         CSS row hover states)
       - Bar-fill shimmer glint (compounded paint cost)

     What we keep — three small, GPU-cheap, contained effects applied
     declaratively (no JS-injected DOM, no rAF loops, no ScrollTrigger
     lifecycle for the effect itself):

       1. .dash-pulse-radar on every .pulse-dot (CSS box-shadow pulse)
       2. .dash-live-flicker on .chip.live / .chip.mint / [data-live-tag]
          and on text reading "live"/"now"/"new"/"updated · now"
       3. .dash-counter-tick — one-shot scale + glow when a counter lands
          (hooked via MutationObserver on runCounters' .counted class)

     Plus the existing data-cascade row entrance keeps each panel feeling
     like it "loads in" without any infinite animation that could glitch. */
  function runLiveDashboards(reduce) {
    if (reduce) return;

    // 1. Pulse-radar on every .pulse-dot — box-shadow only, GPU-cheap.
    document.querySelectorAll('.pulse-dot').forEach(function (el) {
      if (!el.classList.contains('dash-pulse-radar')) el.classList.add('dash-pulse-radar');
    });

    // 2. Live-flicker on chips and text reading live/now/new/updated.
    document.querySelectorAll('.chip.mint, .chip.live, [data-live-tag]').forEach(function (el) {
      if (!el.classList.contains('dash-live-flicker')) el.classList.add('dash-live-flicker');
    });
    document.querySelectorAll('.panel-head-meta span, .data-row .sub, .swim-row .sub, .dashboard-inner span').forEach(function (el) {
      if (el.children.length !== 0) return;
      var t = (el.textContent || '').trim().toLowerCase();
      if (t === 'new' || t === 'now' || t === 'live' || t === 'updated · now') {
        if (!el.classList.contains('dash-live-flicker')) el.classList.add('dash-live-flicker');
      }
    });

    // 3. "Fresh row" accent — subtle cyan left-border pulse on the FIRST
    //    data-row of each .panel-bracket panel. Static target = no
    //    surprises. The first row is the "most recent" in feed-style
    //    panels, so a persistent gentle highlight reads as "this is the
    //    live row" without any movement that could glitch.
    document.querySelectorAll('.panel-bracket .panel-body > .data-row:first-child, .panel-bracket .panel-body > .swim-row:first-child').forEach(function (el) {
      if (!el.classList.contains('dash-fresh-row')) el.classList.add('dash-fresh-row');
    });

    // 4. Hover lift on dashboard panel containers. CSS transition only —
    //    nothing animates when idle, lift triggers on pointer hover.
    document.querySelectorAll('.panel-bracket, .dashboard-inner').forEach(function (el) {
      if (!el.classList.contains('dash-hover-lift')) el.classList.add('dash-hover-lift');
    });

    // 5. Counter tick — one-shot scale + glow when a data-counter lands.
    var counters = document.querySelectorAll('[data-counter]');
    if (counters.length) {
      var seen = new WeakSet();
      var mo = new MutationObserver(function (records) {
        for (var r = 0; r < records.length; r++) {
          var el = records[r].target;
          if (!el.classList.contains('counted')) continue;
          if (seen.has(el)) continue;
          seen.add(el);
          el.classList.add('dash-counter-tick');
          setTimeout(function (e) { return function () { e.classList.remove('dash-counter-tick'); }; }(el), 900);
        }
      });
      counters.forEach(function (c) {
        mo.observe(c, { attributes: true, attributeFilter: ['class'] });
      });
    }
  }

  // wireLivePanel was removed in the Apr 2026 audit. Nothing here injects
  // DOM into dashboard chromes anymore — the entrance animation comes from
  // data-cascade (see runCascades) and the live feel from runLiveDashboards
  // above (which only adds CSS classes, never injects elements).

  /* ----------------------------------------------------------------------
     PER-PAGE PLATFORM DASHBOARD ANIMATIONS (Apr 2026 v3)

     Each platform-page hero gets a small, contained, predictable
     animation that brings its dashboard mock to life. Hard rules:
       1. NO DOM injection into chrome elements
       2. CSS class adds/removes only (no inline-style transform mutation)
       3. ScrollTrigger gate — pause when off-screen
       4. One predictable cycle, never random timing inside a cycle
       5. Transform + opacity + box-shadow only — no mix-blend, no filter

     Page → animation:
       horizon-scanning, gambling-compliance-tools  → row scanner
       regulatory-library    → type query, results pop in
       data-hub              → filters click in, rows filter down
       workflow-management   → swim items check off
       technical-compliance  → matrix cells light up green→yellow→red
       ai-regulatory-assistant → answer reveals after question types
       market-assessments    → bars fill, recommendation pops in
       custom-report-builder → chips click, sections build, download glows
     ---------------------------------------------------------------------- */
  /* fireWhenInView — robust replacement for `ScrollTrigger onEnter`.
     ScrollTrigger fires onEnter only on a scroll CROSSING. Elements that
     are already past the start position when the page loads (which is
     true for every platform-page hero dashboard above the fold) never
     receive onEnter. This helper:
       1. Tries an immediate viewport check; if the trigger is in view,
          fires the callback after `delay` ms.
       2. Otherwise installs a one-shot ScrollTrigger as a fallback.
     This pattern is what fixed data-hub + custom-report-builder hero
     animations not firing on initial load. */
  function fireWhenInView(trigger, fn, delay) {
    if (!trigger) return;
    delay = (delay == null) ? 400 : delay;
    function inView() {
      var r = trigger.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    }
    if (inView()) {
      setTimeout(fn, delay);
      return;
    }
    ScrollTrigger.create({
      trigger: trigger, start: 'top 92%', once: true,
      onEnter: function () { setTimeout(fn, 200); }
    });
  }

  function runPlatformDashboardAnims(reduce) {
    if (reduce) return;
    var p = location.pathname;
    if (/horizon-scanning\.html$/.test(p) || /gambling-compliance-tools\.html$/.test(p)) {
      animScanRowCycler();
    } else if (/regulatory-library\.html$/.test(p)) {
      animLibrarySearch();
    } else if (/data-hub\.html$/.test(p)) {
      animDataHubFilter();
    } else if (/workflow-management\.html$/.test(p)) {
      animWorkflowCheckoff();
    } else if (/technical-compliance\.html$/.test(p)) {
      animMatrixLightup();
    } else if (/ai-regulatory-assistant\.html$/.test(p)) {
      animAIAnswer();
    } else if (/market-assessments\.html$/.test(p)) {
      animMarketBars();
    } else if (/custom-report-builder\.html$/.test(p)) {
      animReportBuilder();
    }
  }

  // Helper — find rows in either .panel-bracket .panel-body OR the inline-
  // styled grid inside .dashboard-inner (used by gambling-compliance-tools).
  function findFeedRows() {
    var pb = document.querySelector('.panel-bracket .panel-body');
    if (pb) {
      var direct = pb.querySelectorAll(':scope > .data-row, :scope > .swim-row');
      if (direct.length) return Array.prototype.slice.call(direct);
      // Some panel-body uses a deeper wrapper (e.g. swim-side)
      var nested = pb.querySelectorAll('.data-row, .swim-row');
      return Array.prototype.slice.call(nested);
    }
    // Fallback: gambling-compliance-tools layout — first inline-grid with
    // 3+ children inside .dashboard-inner.
    var dash = document.querySelector('.dashboard-inner');
    if (!dash) return [];
    var grids = dash.querySelectorAll('div[style*="display:grid"], div[style*="display: grid"]');
    for (var i = 0; i < grids.length; i++) {
      var g = grids[i];
      // Skip the chrome and the small grid wrappers
      if (g.children.length >= 3 && g.children[0].tagName === 'DIV' &&
          g.children[0].getAttribute('style') &&
          g.children[0].getAttribute('style').indexOf('grid-template-columns') >= 0) {
        return Array.prototype.slice.call(g.children);
      }
    }
    return [];
  }

  // 1. SCAN ROW CYCLER — horizon-scanning + gambling-compliance-tools
  function animScanRowCycler() {
    var rows = findFeedRows();
    if (!rows.length) return;
    rows.forEach(function (r) { r.classList.remove('dash-fresh-row'); });

    var lastIdx = -1;
    var iv = null;
    function nextScan() {
      rows.forEach(function (r) { r.classList.remove('dash-scan-active'); });
      var idx;
      do { idx = Math.floor(Math.random() * rows.length); }
      while (idx === lastIdx && rows.length > 1);
      lastIdx = idx;
      var t = rows[idx];
      // Reflow to restart the animation cleanly
      void t.offsetWidth;
      t.classList.add('dash-scan-active');
    }
    function start() {
      if (iv) return;
      nextScan();
      iv = setInterval(nextScan, 5000);
    }
    function stop() {
      if (!iv) return;
      clearInterval(iv); iv = null;
    }
    var trigger = rows[0].closest('.panel-bracket, .dashboard-inner');
    if (!trigger) return;
    // Start immediately if already in viewport on load
    fireWhenInView(trigger, start, 600);
    // Pause/resume on scroll boundaries
    ScrollTrigger.create({
      trigger: trigger, start: 'top 88%', end: 'bottom 12%',
      onLeave: stop, onLeaveBack: stop,
      onEnterBack: start
    });
  }

  // 2. LIBRARY SEARCH — type "stablecoin reserve requirements", results pop in
  function animLibrarySearch() {
    var dash = document.querySelector('.dashboard-inner');
    if (!dash) return;
    // Search bar text is the second <span> inside the search-pill div
    var searchPill = dash.querySelector('div[style*="background:rgba(255,255,255,.04)"]') ||
                     dash.querySelector('div[style*="background: rgba(255, 255, 255, 0.04)"]');
    if (!searchPill) return;
    var queryText = searchPill.querySelectorAll('span')[0];
    if (!queryText) return;
    var fullQuery = queryText.textContent || 'stablecoin reserve requirements';
    queryText.textContent = '';

    // Find result cards (the 3 result divs in the results grid)
    var resultsGrid = dash.querySelector('div[style*="display:grid; gap:10px"], div[style*="display: grid; gap: 10px"]');
    if (!resultsGrid) {
      // Try matching the inline style we saw
      var allGrids = dash.querySelectorAll('div[style*="display:grid"]');
      for (var i = 0; i < allGrids.length; i++) {
        if (allGrids[i].children.length === 3 &&
            allGrids[i] !== searchPill &&
            !allGrids[i].closest('.dashboard-chrome')) {
          resultsGrid = allGrids[i]; break;
        }
      }
    }
    var results = resultsGrid ? Array.prototype.slice.call(resultsGrid.children) : [];
    results.forEach(function (r) { gsap.set(r, { opacity: 0, y: 10 }); });

    var iv = null, isPlaying = false;
    function play() {
      if (isPlaying) return;
      isPlaying = true;
      queryText.textContent = '';
      results.forEach(function (r) { gsap.set(r, { opacity: 0, y: 10 }); });
      queryText.classList.add('dash-typing-cursor');
      var i = 0;
      var typing = setInterval(function () {
        queryText.textContent = fullQuery.substring(0, ++i);
        if (i >= fullQuery.length) {
          clearInterval(typing);
          setTimeout(function () {
            queryText.classList.remove('dash-typing-cursor');
            results.forEach(function (r, idx) {
              gsap.to(r, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', delay: idx * 0.18, overwrite: false });
            });
            // Restart loop after 7s
            setTimeout(function () { isPlaying = false; play(); }, 7000 + results.length * 180);
          }, 600);
        }
      }, 55);
    }
    fireWhenInView(dash.closest('.dashboard') || dash, play, 600);
  }

  // 3. DATA HUB FILTER — chips click in, result count ticks down
  function animDataHubFilter() {
    var dash = document.querySelector('.dashboard-inner');
    if (!dash) return;
    var chipRow = dash.querySelector('div[style*="flex-wrap:wrap"], div[style*="flex-wrap: wrap"]');
    if (!chipRow) return;
    var chips = Array.prototype.slice.call(chipRow.querySelectorAll('.chip'));
    var addChip = chips[chips.length - 1]; // "+ add filter"
    var filterChips = chips.slice(0, -1);
    // Find the row table and its rows + the result count text
    var allInner = dash.querySelectorAll('div');
    var resultCountEl = null;
    allInner.forEach(function (el) {
      if (el.children.length === 0) {
        var t = (el.textContent || '').trim();
        if (/^\d{1,3}(,\d{3})*\s*results?$/i.test(t)) resultCountEl = el;
      }
    });
    var tableRows = dash.querySelectorAll('div[style*="grid-template-columns:1.4fr 1fr 1fr 1fr"], div[style*="grid-template-columns: 1.4fr 1fr 1fr 1fr"]');
    var dataRows = Array.prototype.slice.call(tableRows).slice(1); // skip header

    // Hide chips + rows initially; show "1,247 results"
    filterChips.forEach(function (c) { gsap.set(c, { opacity: 0, scale: .8 }); });
    dataRows.forEach(function (r) { gsap.set(r, { opacity: 0, y: 6 }); });
    if (resultCountEl) resultCountEl.textContent = '1,247 results';

    var counts = [437, 92, 6];
    // Build a paused master timeline so fromTo values are explicit and
    // restart() reliably resets state on each loop.
    function buildTimeline() {
      var tl = gsap.timeline({ paused: true });
      // Reset result count via a callback at t=0
      tl.call(function () {
        if (resultCountEl) resultCountEl.textContent = '1,247 results';
      }, null, 0);
      // Chips click in (scaleX/scaleY for transform-matrix safety)
      filterChips.forEach(function (chip, i) {
        tl.fromTo(chip,
          { opacity: 0, scaleX: .8, scaleY: .8 },
          {
            opacity: 1, scaleX: 1, scaleY: 1, duration: 0.32, ease: 'back.out(2)',
            onStart: function () {
              chip.classList.add('dash-chip-click');
              setTimeout(function () { chip.classList.remove('dash-chip-click'); }, 500);
              if (resultCountEl && counts[i] !== undefined) {
                setTimeout(function () { resultCountEl.textContent = counts[i].toLocaleString() + ' results'; }, 220);
              }
            }
          },
          0.6 + i * 0.9);
      });
      // After all chips clicked, fade in data rows
      var rowDelay = 0.6 + filterChips.length * 0.9 + 0.3;
      dataRows.forEach(function (r, i) {
        tl.fromTo(r,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' },
          rowDelay + i * 0.08);
      });
      return tl;
    }
    var tl = buildTimeline();
    function play() {
      tl.restart();
      setTimeout(play, (tl.duration() + 6) * 1000);
    }
    fireWhenInView(dash.closest('.dashboard') || dash, play, 500);
  }

  // 4. WORKFLOW CHECKOFF — swim items get checked off in sequence
  function animWorkflowCheckoff() {
    var pb = document.querySelector('.panel-bracket .panel-body');
    if (!pb) return;
    var items = Array.prototype.slice.call(pb.querySelectorAll('.swim-item'));
    if (!items.length) return;

    // Save original state class for each item, then strip done/active
    items.forEach(function (it) {
      var hadDone = it.classList.contains('done');
      var hadActive = it.classList.contains('active');
      it.dataset.origState = hadDone ? 'done' : (hadActive ? 'active' : '');
      it.classList.remove('done', 'active');
    });

    function play() {
      items.forEach(function (it) { it.classList.remove('done', 'active', 'dash-check-pulse'); });
      items.forEach(function (it, i) {
        setTimeout(function () {
          var orig = it.dataset.origState;
          if (orig === 'done') {
            // Only .done items get a checkmark + green pulse — they're the
            // ones literally being "checked off". 7 of 14 collected (active)
            // gets cyan styling but no check-pulse, since it's IN PROGRESS.
            it.classList.add('done');
            it.classList.add('dash-check-pulse');
            setTimeout(function () { it.classList.remove('dash-check-pulse'); }, 600);
          } else if (orig === 'active') {
            it.classList.add('active');
            // No pulse, no checkmark — semantically "in progress, not done"
          }
        }, 700 + i * 380);
      });
      var total = 700 + items.length * 380 + 4000;
      setTimeout(play, total);
    }
    fireWhenInView(pb.closest('.panel-bracket'), play, 600);
  }

  // 5. MATRIX LIGHTUP — green wave → yellow → red, then Gap callout
  function animMatrixLightup() {
    var dash = document.querySelector('.dashboard-inner');
    if (!dash) return;
    // Find the 12-col matrix grid by searching every div with the grid-template-columns rule
    var grid = null;
    var allDivs = dash.querySelectorAll('div');
    for (var d = 0; d < allDivs.length; d++) {
      var s = allDivs[d].getAttribute('style') || '';
      if (s.indexOf('repeat(12') >= 0) { grid = allDivs[d]; break; }
    }
    if (!grid) return;
    var cells = Array.prototype.slice.call(grid.children);
    if (!cells.length) return;

    // Find the "Gap · Art. 28(5)" callout — last styled div in dashboard
    // that mentions "Gap" + has the rose/red background tint.
    var gapCallout = null;
    for (var dx = allDivs.length - 1; dx >= 0; dx--) {
      var txt = (allDivs[dx].textContent || '').trim();
      if (txt.indexOf('Gap · Art.') === 0 || /^Gap\s*·/.test(txt)) {
        gapCallout = allDivs[dx];
        break;
      }
    }
    // Hide it initially via inline style (don't rely on GSAP — pure CSS so
    // it can't get stuck mid-tween if the timeline is interrupted)
    if (gapCallout) gapCallout.classList.add('dash-tile-hidden');

    // Read each cell's inline color via getAttribute (style.background normalisation
    // can drop the hex). Store on dataset.
    cells.forEach(function (c) {
      var rawStyle = c.getAttribute('style') || '';
      var color = '';
      if (/#10B981/i.test(rawStyle)) color = 'green';
      else if (/#F59E0B/i.test(rawStyle)) color = 'yellow';
      else if (/#F43F5E/i.test(rawStyle)) color = 'red';
      c.dataset.cellColor = color;
      c.dataset.origStyle = rawStyle;
      // Replace background with neutral dim; preserve aspect-ratio + border-radius
      c.setAttribute('style', rawStyle.replace(/background\s*:\s*#[0-9A-Fa-f]+\s*;?/, 'background: rgba(255,255,255,.05);'));
    });

    function paintWave(color, baseDelay, perCellStagger) {
      var matched = cells.filter(function (c) { return c.dataset.cellColor === color; });
      matched.forEach(function (c, i) {
        setTimeout(function () {
          c.setAttribute('style', c.dataset.origStyle);
          c.classList.add('dash-cell-pop');
          setTimeout(function () { c.classList.remove('dash-cell-pop'); }, 400);
        }, baseDelay + i * perCellStagger);
      });
      return baseDelay + matched.length * perCellStagger;
    }

    function play() {
      cells.forEach(function (c) {
        c.setAttribute('style', (c.dataset.origStyle || '').replace(/background\s*:\s*#[0-9A-Fa-f]+\s*;?/, 'background: rgba(255,255,255,.05);'));
        c.classList.remove('dash-cell-pop');
      });
      // Hide gap callout for new cycle
      if (gapCallout) {
        gapCallout.classList.add('dash-tile-hidden');
        gapCallout.classList.remove('dash-tile-popin');
      }
      var t = 0;
      t = paintWave('green',  500, 30);
      t = paintWave('yellow', t + 350, 110);
      t = paintWave('red',    t + 350, 160);
      // Reveal Gap callout 400ms after the last red cell pops
      if (gapCallout) {
        setTimeout(function () {
          gapCallout.classList.remove('dash-tile-hidden');
          gapCallout.classList.add('dash-tile-popin');
        }, t + 400);
      }
      // Hold then loop (cells stay lit, callout stays visible, then reset)
      setTimeout(play, t + 6500);
    }
    fireWhenInView(dash.closest('.dashboard') || dash, play, 400);
  }

  // 6. AI ANSWER REVEAL — single-slot replacement (no stacking):
  //    1. Question types fully
  //    2. Synth pill shows for ~1s (occupies the answer slot)
  //    3. Synth pill is REMOVED FROM LAYOUT FLOW (display:none); answer
  //       card fades in IN THE SAME SLOT directly under the question.
  //
  //    The HTML now has [data-ai-answer] containing two siblings:
  //    [data-ai-synth] (the pill) and [data-ai-card] (the full answer).
  //    They occupy the same flow position; toggling display:none ↔ block
  //    on each is what produces the "answer replaces synth" effect.
  function animAIAnswer() {
    var pb = document.querySelector('.panel-bracket .panel-body');
    if (!pb) return;
    var typingEl = pb.querySelector('[data-typing]');
    var synthEl  = pb.querySelector('[data-ai-synth]');
    var cardEl   = pb.querySelector('[data-ai-card]');
    if (!typingEl || !synthEl || !cardEl) return;

    // Capture every text node inside the answer card so we can replay it
    // character-by-character later. Done up front (before any reveal) so
    // there's no FOUC of the full text before typing starts.
    var answerNodes = (function () {
      var out = [];
      var walker = document.createTreeWalker(cardEl, NodeFilter.SHOW_TEXT, null, false);
      var n;
      while ((n = walker.nextNode())) {
        if (n.nodeValue && n.nodeValue.length) {
          out.push({ node: n, text: n.nodeValue });
          n.nodeValue = '';
        }
      }
      return out;
    })();

    function typeAnswer(speed, onComplete) {
      var idx = 0;
      function nextNode() {
        if (idx >= answerNodes.length) {
          if (onComplete) onComplete();
          return;
        }
        var entry = answerNodes[idx++];
        // Pure-whitespace nodes (between elements) restore instantly.
        if (!entry.text.trim()) {
          entry.node.nodeValue = entry.text;
          nextNode();
          return;
        }
        var i = 0;
        var iv = setInterval(function () {
          entry.node.nodeValue = entry.text.substring(0, i++);
          if (i > entry.text.length) {
            clearInterval(iv);
            nextNode();
          }
        }, speed);
      }
      nextNode();
    }

    function play() {
      gsap.killTweensOf([synthEl, cardEl]);
      synthEl.style.display = 'none';
      cardEl.style.display = 'none';
      cardEl.style.opacity = '0';
      cardEl.style.transform = 'translateY(4px)';

      var fullText = (typingEl._typingFullText || typingEl.getAttribute('data-typing') || '').trim();
      var pollMs = 20;
      var maxWait = 10000;
      var waited = 0;

      function afterTypingComplete() {
        // 500ms beat → Thinking pill (~800ms) → answer card types out at
        // the same 14ms/char rhythm as the question.
        setTimeout(function () {
          synthEl.style.display = 'block';
          gsap.to(synthEl, {
            opacity: 1, y: 0, duration: 0.12, ease: 'power2.out', overwrite: true
          });
          setTimeout(function () {
            synthEl.style.display = 'none';
            cardEl.style.display = 'block';
            gsap.set(cardEl, { opacity: 1, y: 0 });
            typeAnswer(14);
          }, 800);
        }, 500);
      }

      function tick() {
        waited += pollMs;
        var current = (typingEl.textContent || '').trim();
        // Check ONLY that text is fully typed — don't wait for the
        // typing-cursor class (runTypingDemos lingers it 1.2s after
        // completion which made the sequence feel slow).
        if (current === fullText) {
          typingEl.classList.remove('typing-cursor');
          afterTypingComplete();
          return;
        }
        if (waited > maxWait) { afterTypingComplete(); return; }
        setTimeout(tick, pollMs);
      }
      tick();
    }
    fireWhenInView(pb.closest('.panel-bracket'), play, 0);
  }

  // 7. MARKET BARS — counters tick → opportunity bars fill row by row →
  //    recommendation pops in. The recommendation is targeted via the
  //    [data-market-rec] attribute and pre-hidden in HTML via inline
  //    style="opacity: 0" — no FOUC, no cascade interference.
  function animMarketBars() {
    var dash = document.querySelector('.dashboard-inner');
    if (!dash) return;

    var rec = dash.querySelector('[data-market-rec]');
    var barGroups = Array.prototype.slice.call(dash.querySelectorAll('[data-bar-fill]'));
    barGroups.forEach(function (g) {
      gsap.set(g.children, { scaleY: 0, transformOrigin: '50% 100%' });
    });

    // Hide rec immediately (kills any rogue tweens; inline style already
    // handles initial state but this guards against repeated play()).
    if (rec) {
      gsap.killTweensOf(rec);
      gsap.set(rec, { opacity: 0, y: 8 });
    }

    function play() {
      barGroups.forEach(function (g) {
        gsap.set(g.children, { scaleY: 0, transformOrigin: '50% 100%' });
      });
      if (rec) {
        gsap.killTweensOf(rec);
        gsap.set(rec, { opacity: 0, y: 8 });
      }

      // Phase 1: bars fill row by row, starting at 1.4s (after counters tick)
      barGroups.forEach(function (g, rowIdx) {
        gsap.to(g.children, {
          scaleY: 1,
          duration: 0.45,
          ease: 'back.out(1.6)',
          stagger: 0.07,
          delay: 1.4 + rowIdx * 0.35,
          overwrite: false
        });
      });

      // Phase 2: recommendation reveals AFTER the last bar finishes.
      var lastBarChildCount = barGroups[0] ? barGroups[0].children.length : 5;
      var lastBarFinishMs = (1.4 + (barGroups.length - 1) * 0.35 + (lastBarChildCount - 1) * 0.07 + 0.45) * 1000;
      var revealAtMs = lastBarFinishMs + 400;

      if (rec) {
        setTimeout(function () {
          gsap.to(rec, {
            opacity: 1, y: 0,
            duration: 0.55, ease: 'back.out(1.6)',
            overwrite: true
          });
        }, revealAtMs);
      }
    }
    fireWhenInView(dash.closest('.dashboard') || dash, play, 400);
  }

  // 8. REPORT BUILDER — "user building a custom report" narrative.
  //    A visible cursor pointer moves between targets, clicks each one,
  //    and a DIFFERENT section appears for each tab:
  //      1. Click "Exec summary"  → exec summary text appears
  //      2. Click "KPIs"          → 3 KPI tiles appear
  //      3. Click "Regs map"      → jurisdiction chips appear
  //      4. Click "Incidents"     → 3 risk-register rows appear
  //    Then click "Download report" button → progress bar fills →
  //    file output pill (Q2-Board-Pack.pdf ✓) pops into view. Loop.
  //
  //    No FOUC: the .builder-section / .builder-progress-bar / .builder-file
  //    elements are pre-hidden via inline <style> in the HTML head, so the
  //    user never sees a flash of complete report before the animation.
  function animReportBuilder() {
    var dash = document.querySelector('.dashboard-inner');
    if (!dash) return;
    var tabs = Array.prototype.slice.call(dash.querySelectorAll('[data-tab]'));
    var sections = Array.prototype.slice.call(dash.querySelectorAll('.builder-section'));
    var downloadBtn = dash.querySelector('.builder-download-btn');
    var fileOutput  = dash.querySelector('.builder-file');

    if (tabs.length < 4 || sections.length < 4 || !downloadBtn || !fileOutput) return;

    if (window.getComputedStyle(dash).position === 'static') dash.style.position = 'relative';

    function rectInDash(el) {
      var r = el.getBoundingClientRect();
      var dr = dash.getBoundingClientRect();
      return { cx: r.left + r.width / 2 - dr.left, cy: r.top + r.height / 2 - dr.top };
    }

    // Spawn a click ripple at a target's center — visible "click" feedback
    // without showing a cursor pointer. The ripple expands + fades.
    function rippleAt(target) {
      var p = rectInDash(target);
      var rip = document.createElement('div');
      rip.className = 'dash-cursor-ripple';
      rip.style.left = p.cx + 'px';
      rip.style.top  = p.cy + 'px';
      dash.appendChild(rip);
      setTimeout(function () { if (rip.parentNode) rip.remove(); }, 700);
    }

    var pending = [];
    function later(fn, ms) { var id = setTimeout(fn, ms); pending.push(id); return id; }
    function clearPending() {
      pending.forEach(function (id) { clearTimeout(id); });
      pending = [];
    }

    // Cumulative tab "click" — each new section appears BELOW the previous
    // ones (sections accumulate). Tabs that have been clicked stay branded
    // active. The user sees the report being built up piece by piece.
    function clickTab(tabName) {
      var tab = tabs.filter(function (t) { return t.getAttribute('data-tab') === tabName; })[0];
      var section = sections.filter(function (s) { return s.getAttribute('data-section') === tabName; })[0];
      if (tab) {
        rippleAt(tab);
        // Tiny delay so the ripple is visible BEFORE the tab + section change
        setTimeout(function () {
          tab.classList.add('brand', 'dash-chip-activate');
          setTimeout(function () { tab.classList.remove('dash-chip-activate'); }, 550);
          if (section) section.classList.add('is-revealed');
        }, 180);
      }
    }

    function reset() {
      tabs.forEach(function (t) { t.classList.remove('brand', 'dash-chip-activate'); });
      sections.forEach(function (s) { s.classList.remove('is-revealed'); });
      downloadBtn.classList.remove('is-active', 'is-loading');
      fileOutput.classList.remove('is-shown');
      // Remove any leftover ripples (from interrupted cycles)
      var ripples = dash.querySelectorAll('.dash-cursor-ripple');
      Array.prototype.forEach.call(ripples, function (r) { r.remove(); });
    }

    function play() {
      clearPending();
      reset();

      // Click each of the 4 tabs in sequence — each reveals a NEW section
      // BELOW the previous one (cumulative). The user sees the report grow.
      var tabSequence = [
        { name: 'exec',      delayMs: 700 },
        { name: 'kpis',      delayMs: 2000 },
        { name: 'regs',      delayMs: 3300 },
        { name: 'incidents', delayMs: 4600 }
      ];
      tabSequence.forEach(function (step) {
        later(function () { clickTab(step.name); }, step.delayMs);
      });

      // Click Download → button enters "loading" glow state → file pops in.
      // No visible progress bar — the loading feedback is the button's own
      // pulsing glow + a brief delay before the file appears.
      var downloadClickAtMs = 6300;
      later(function () {
        rippleAt(downloadBtn);
        setTimeout(function () {
          downloadBtn.classList.add('is-active', 'is-loading');
          // ~900ms loading state, then file pops in.
          setTimeout(function () {
            downloadBtn.classList.remove('is-active', 'is-loading');
            fileOutput.classList.add('is-shown');
          }, 900);
        }, 180);
      }, downloadClickAtMs);

      // Loop after the file has been visible for ~4.5s.
      var totalCycleMs = downloadClickAtMs + 180 + 900 + 4500;
      later(play, totalCycleMs);
    }
    fireWhenInView(dash.closest('.dashboard') || dash, play, 600);
  }

  function setupHeroPanelLoop() {
    var clock = document.querySelector('[data-time-utc]');
    if (!clock) return;
    function tick() {
      var now = new Date();
      var hh = String(now.getUTCHours()).padStart(2, '0');
      var mm = String(now.getUTCMinutes()).padStart(2, '0');
      clock.textContent = hh + ':' + mm + ' UTC';
    }
    tick();
    setInterval(tick, 30000);
  }

})();
