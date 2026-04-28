/* =========================================================================
   VIXIO — Shared Nav + Footer Injector & Interactions
   Rebuild 2026-04-20
   ========================================================================= */
(function () {
  'use strict';

  // -----------------------------------------------------------------------
  // PATH RESOLUTION: nav/footer links must work from any depth in the tree.
  // -----------------------------------------------------------------------
  const scriptEl =
    document.currentScript ||
    Array.from(document.scripts).find(s => /nav\.js(\?|$)/.test(s.src));
  const siteRoot = (function () {
    if (!scriptEl) return '/';
    const src = scriptEl.getAttribute('src') || '';
    try {
      const u = new URL(src, window.location.href);
      // styles.css lives at <siteRoot>/styles.css, nav.js at <siteRoot>/nav.js
      return u.href.replace(/nav\.js.*$/, '');
    } catch (e) {
      return '/site/';
    }
  })();
  const rootUp = (function () {
    // compute parent of siteRoot (i.e. the directory one level above /site/)
    return siteRoot.replace(/\/site\/?$/, '/').replace(/\/site\/$/, '/');
  })();
  const animatedAssetQuery = (function () {
    if (!scriptEl) return '';
    try {
      const u = new URL(scriptEl.getAttribute('src') || '', window.location.href);
      return u.search || '';
    } catch (e) {
      return '';
    }
  })();

  // -----------------------------------------------------------------------
  // ANIMATED ASSET LOADER — injects animated.css + GSAP + motion.js + dashboard.js
  // (so every page picks up the upgrade automatically)
  // -----------------------------------------------------------------------
  (function injectAnimatedAssets() {
    function injectStyle(href) {
      if (document.querySelector('link[data-vxa="' + href + '"]')) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute('data-vxa', href);
      document.head.appendChild(link);
    }
    function injectScript(src) {
      return new Promise(function (resolve, reject) {
        if (document.querySelector('script[data-vxa="' + src + '"]')) {
          resolve();
          return;
        }
        const s = document.createElement('script');
        s.src = src;
        s.defer = false;
        s.async = false;
        s.setAttribute('data-vxa', src);
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    injectStyle(siteRoot + 'animated.css' + animatedAssetQuery);

    // Load GSAP stack, then motion.js. SplitText is optional — if its CDN copy is
    // unavailable (some CDNs block the redistribution), motion.js falls back to a
    // simple reveal for headlines.
    const GSAP_BASE = 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/';
    injectScript(GSAP_BASE + 'gsap.min.js')
      .then(function () { return injectScript(GSAP_BASE + 'ScrollTrigger.min.js'); })
      .then(function () {
        // Try SplitText, but don't block on failure
        return injectScript(GSAP_BASE + 'SplitText.min.js').catch(function () {
          // fallback: try unpkg
          return injectScript('https://unpkg.com/gsap@3.13.0/dist/SplitText.min.js').catch(function () {
            // give up; motion.js handles missing SplitText gracefully
          });
        });
      })
      .then(function () { return injectScript(siteRoot + 'motion.js' + animatedAssetQuery); })
      .catch(function (err) { console.warn('[Vixio] motion script load failed', err); });

    // Lazy-load D3 + dashboard.js when the page actually uses a map widget
    function shouldLoadDashboard() {
      return document.querySelector('[data-mini-map], [data-live-intel-map], [data-dashboard]');
    }
    function tryLoadDashboard() {
      if (!shouldLoadDashboard()) return;
      injectScript('https://cdn.jsdelivr.net/npm/d3@7')
        .then(function () { return injectScript('https://cdn.jsdelivr.net/npm/topojson-client@3'); })
        .then(function () { return injectScript(siteRoot + 'dashboard.js'); })
        .catch(function (err) { console.warn('[Vixio] dashboard script load failed', err); });
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', tryLoadDashboard);
    } else {
      tryLoadDashboard();
    }
  })();

  // Directory prefixes (end in `/`) — used as bases for sub-page concatenation (e.g. P.gambling + 'online-operators.html')
  const P = {
    root:        rootUp,
    platform:    rootUp + 'site/platform/',
    howwehelp:   rootUp + 'site/how-we-help/',
    industries:  rootUp + 'site/industries/',
    gambling:    rootUp + 'site/industries/gambling/',
    fs:          rootUp + 'site/industries/financial-services/',
    resources:   rootUp + 'site/resources/',
    about:       rootUp + 'site/about/',
    contact:     rootUp + 'site/about/contact.html',
  };
  // Explicit hub-index links — used anywhere a directory URL would otherwise be used,
  // so file:// browsers don't fall through to a directory listing.
  const H = {
    home:        P.root + 'index.html',
    platform:    P.platform + 'index.html',
    howwehelp:   P.howwehelp + 'index.html',
    industries:  P.industries + 'index.html',
    gambling:    P.gambling + 'index.html',
    fs:          P.fs + 'index.html',
    resources:   P.resources + 'index.html',
    about:       P.about + 'index.html',
  };

  // -----------------------------------------------------------------------
  // ICON LIBRARY (inline SVG templates)
  // -----------------------------------------------------------------------
  const icon = (d, opts) => {
    opts = opts || {};
    const sw = opts.sw || 1.75;
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  };
  const ICO = {
    radar:    icon('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v4M3 12h4M12 21v-4M21 12h-4"/>'),
    library:  icon('<path d="M4 19.5A2.5 2.5 0 016.5 17H20V4a2 2 0 00-2-2H6.5A2.5 2.5 0 004 4.5v15z"/><path d="M8 6h10M8 10h10M8 14h6"/>'),
    workflow: icon('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M8 4v16"/>'),
    data:     icon('<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"/>'),
    report:   icon('<path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6M9 14l2 2 4-4"/>'),
    map:      icon('<path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/><path d="M8 2v16M16 6v16"/>'),
    ai:       icon('<path d="M12 8a4 4 0 014 4v5M4 15h8M4 10h12"/><circle cx="18" cy="18" r="3"/>'),
    scale:    icon('<path d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4M3 12h18"/>'),
    shield:   icon('<path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/>'),
    globe:    icon('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>'),
    lock:     icon('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>'),
    spark:    icon('<path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/>'),
    compass:  icon('<circle cx="12" cy="12" r="9"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>'),
    users:    icon('<circle cx="9" cy="8" r="4"/><path d="M1 21v-1a7 7 0 0114 0v1"/><circle cx="17" cy="6" r="3"/><path d="M17 13a5 5 0 015 5v3"/>'),
    book:     icon('<path d="M4 19.5A2.5 2.5 0 016.5 17H20V2H6.5A2.5 2.5 0 004 4.5v15z"/>'),
    award:    icon('<circle cx="12" cy="9" r="6"/><path d="M8.21 13.89L6 22l5-3 5 3-2.21-8.12"/>'),
    chev:     icon('<path d="M6 9l6 6 6-6"/>', { sw: 2 }),
    arr:      icon('<path d="M5 12h14M13 6l6 6-6 6"/>', { sw: 2 }),
    menu:     icon('<path d="M3 6h18M3 12h18M3 18h18"/>', { sw: 2 }),
    close:    icon('<path d="M6 6l12 12M18 6L6 18"/>', { sw: 2 }),
    building: icon('<rect x="3" y="4" width="18" height="17" rx="1"/><path d="M9 9h1M14 9h1M9 13h1M14 13h1M9 17h1M14 17h1M12 4v17"/>'),
    coins:    icon('<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1110.34 18M7 6h1.5A1.5 1.5 0 0110 7.5v0A1.5 1.5 0 018.5 9H7V6zM7 9h2a1.5 1.5 0 110 3H7V9z"/>'),
    chip:     icon('<rect x="6" y="6" width="12" height="12" rx="1"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4M10 10h4v4h-4z"/>'),
    news:     icon('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/>'),
    mic:      icon('<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0014 0M12 17v4M8 21h8"/>'),
    play:     icon('<polygon points="5 3 21 12 5 21 5 3"/>'),
    cal:      icon('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>'),
    search:   icon('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>'),
    // Social
    linkedin: icon('<path d="M16 8a6 6 0 016 6v6h-4v-6a2 2 0 10-4 0v6h-4v-10h4v1.57"/><rect x="2" y="9" width="4" height="11"/><circle cx="4" cy="4" r="2"/>'),
    youtube:  icon('<path d="M22 8.5a2.5 2.5 0 00-1.76-1.77C18.67 6.25 12 6.25 12 6.25s-6.67 0-8.24.48A2.5 2.5 0 002 8.5v7a2.5 2.5 0 001.76 1.77c1.57.48 8.24.48 8.24.48s6.67 0 8.24-.48A2.5 2.5 0 0022 15.5v-7z"/><polygon points="10 9.5 15 12 10 14.5 10 9.5"/>'),
    twitter:  icon('<path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3V8a10.66 10.66 0 01-9-4.56s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>')
  };

  // -----------------------------------------------------------------------
  // HEADER
  // -----------------------------------------------------------------------
  function headerHTML() {
    return `
<header class="site-header" id="siteHeaderEl">
  <div class="nav-wrap">
    <a class="nav-brand" href="${H.home}" aria-label="Vixio home">
      <span class="mark" aria-hidden="true"></span>
      <span class="wordmark">VIXIO</span>
    </a>

    <nav aria-label="Primary">
      <ul class="nav-menu">
        <li class="nav-item">
          <a class="nav-link" href="${H.howwehelp}" aria-haspopup="true" aria-expanded="false">
            How We Help <span class="caret">${ICO.chev}</span>
          </a>
          <div class="mega">
            <div class="mega-col-head">Outcomes</div>
            <a class="mega-link" href="${P.howwehelp}stay-ahead.html">
              Stay ahead of regulatory change
              <small>Real-time monitoring across every jurisdiction you operate in</small>
            </a>
            <a class="mega-link" href="${P.howwehelp}faster-market-entry.html">
              Enter markets faster
              <small>Assess, license, and launch with confidence</small>
            </a>
            <a class="mega-link" href="${P.howwehelp}single-source.html">
              A single source of truth
              <small>Every rule, task, and sign-off auditable in one place</small>
            </a>
            <a class="mega-link" href="${P.howwehelp}custom-insights.html">
              Custom insights for critical decisions
              <small>Bespoke research from our regulatory desk</small>
            </a>
            <a class="mega-link" href="${P.howwehelp}professional-training.html">
              Upskill with professional training
              <small>Certified courses for compliance teams</small>
            </a>
          </div>
        </li>

        <li class="nav-item">
          <a class="nav-link" href="${H.platform}" aria-haspopup="true" aria-expanded="false">
            Platform <span class="caret">${ICO.chev}</span>
          </a>
          <div class="mega mega--3col">
            <div class="mega-col-head">Intelligence</div>
            <a class="mega-link" href="${P.platform}horizon-scanning.html">Horizon Scanning<small>Live regulatory radar</small></a>
            <a class="mega-link" href="${P.platform}regulatory-library.html">Regulatory Library<small>Curated rules and guidance</small></a>
            <a class="mega-link" href="${P.platform}data-hub.html">Data Hub<small>4M+ structured datapoints</small></a>
            <div class="mega-col-head">Workflow</div>
            <a class="mega-link" href="${P.platform}workflow-management.html">Workflow Management<small>End-to-end change orchestration</small></a>
            <a class="mega-link" href="${P.platform}technical-compliance.html">Technical Compliance<small>Control mapping &amp; testing</small></a>
            <a class="mega-link" href="${P.platform}gambling-compliance-tools.html">Gambling Compliance Tools<small>Purpose-built for operators</small></a>
            <div class="mega-col-head">Research &amp; AI</div>
            <a class="mega-link" href="${P.platform}ai-regulatory-assistant.html">AI Regulatory Assistant<small>Ask the corpus anything</small></a>
            <a class="mega-link" href="${P.platform}market-assessments.html">Market Assessments<small>Country-by-country analysis</small></a>
            <a class="mega-link" href="${P.platform}custom-report-builder.html">Custom Report Builder<small>Build briefs on demand</small></a>
          </div>
        </li>

        <li class="nav-item">
          <a class="nav-link" href="${H.industries}" aria-haspopup="true" aria-expanded="false">
            Industries <span class="caret">${ICO.chev}</span>
          </a>
          <div class="mega mega--industries">
            <div class="mega-col-head mega-col-head--single">Gambling</div>
            <div class="mega-col-head mega-col-head--single">Financial services</div>
            <a class="mega-link" href="${P.gambling}online-operators.html">Online Operators<small>Launch and scale across markets</small></a>
            <a class="mega-link" href="${P.fs}payment-services.html">Payment Services<small>PSD3, PSR, cross-border</small></a>
            <a class="mega-link" href="${P.gambling}suppliers.html">Suppliers<small>Tech, platforms, integrity</small></a>
            <a class="mega-link" href="${P.fs}retail-banking.html">Retail Banking<small>Conduct and consumer duty</small></a>
            <a class="mega-link" href="${P.gambling}payment-service-providers.html">Payment Providers<small>Gambling payments</small></a>
            <a class="mega-link" href="${P.fs}digital-assets.html">Digital Assets<small>MiCA, crypto, stablecoins</small></a>
            <a class="mega-link" href="${P.gambling}regulators.html">Regulators<small>Policy, licensing, enforcement</small></a>
            <a class="mega-link" href="${P.fs}regulators.html">Regulators<small>Financial authority support</small></a>
            <a class="mega-link" href="${P.gambling}law-firms.html">Law Firms<small>Gambling practice</small></a>
            <a class="mega-link" href="${P.fs}law-firms.html">Law Firms<small>FS regulatory practice</small></a>
          </div>
        </li>

        <li class="nav-item">
          <a class="nav-link" href="${H.resources}" aria-haspopup="true" aria-expanded="false">
            Resources <span class="caret">${ICO.chev}</span>
          </a>
          <div class="mega">
            <div class="mega-col-head">Editorial</div>
            <a class="mega-link" href="${P.resources}2026-predictions.html">Compliance Crystal Ball 2026<small>Expert-led predictions for the year</small></a>
            <a class="mega-link" href="${P.resources}research.html">Research &amp; Guides<small>Long-form market analysis</small></a>
            <a class="mega-link" href="${P.resources}blog.html">Blog<small>Analysis from our regulatory desk</small></a>
            <div class="mega-col-head">Live</div>
            <a class="mega-link" href="${P.resources}regulatory-news.html">Regulatory News<small>Today's most important updates</small></a>
            <a class="mega-link" href="${P.resources}webinars.html">Webinars<small>Deep dives with experts</small></a>
            <a class="mega-link" href="${P.resources}podcasts.html">Podcasts<small>Conversations that move markets</small></a>
            <a class="mega-link" href="${P.resources}events.html">Events<small>Industry gatherings</small></a>
            <a class="mega-link" href="${P.resources}customer-stories.html">Customer Stories<small>How leading brands use Vixio</small></a>
          </div>
        </li>

        <li class="nav-item">
          <a class="nav-link" href="${H.about}" aria-haspopup="true" aria-expanded="false">
            About <span class="caret">${ICO.chev}</span>
          </a>
          <div class="mega">
            <div class="mega-col-head">Company</div>
            <a class="mega-link" href="${H.about}">Our story<small>Founded 2006. Built for regulated industries.</small></a>
            <a class="mega-link" href="${P.about}our-people.html">Leadership &amp; people<small>The team behind the platform</small></a>
            <a class="mega-link" href="${P.about}advisory-board.html">Advisory board<small>Industry veterans</small></a>
            <a class="mega-link" href="${P.about}partners.html">Partners<small>Integration and referral network</small></a>
            <div class="mega-col-head">Connect</div>
            <a class="mega-link" href="${P.about}newsroom.html">Newsroom<small>Press and announcements</small></a>
            <a class="mega-link" href="${P.about}awards.html">Awards<small>Industry recognition</small></a>
            <a class="mega-link" href="${P.about}careers.html">Careers<small>Open roles</small></a>
            <a class="mega-link" href="${P.contact}">Contact us<small>Book a briefing or get in touch</small></a>
          </div>
        </li>
      </ul>
    </nav>

    <div class="nav-right">
      <button type="button" class="nav-search-kbd" aria-label="Open search" data-search-open>
        <span>${ICO.search.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="14" height="14"')}</span>
        <span>Search</span>
        <span class="kbd">⌘K</span>
      </button>
      <div class="nav-login-wrap">
        <button type="button" class="nav-login" aria-haspopup="menu" aria-expanded="false">Login <span class="caret" style="display:inline-block;width:10px;height:10px">${ICO.chev}</span></button>
        <div class="nav-login-menu" role="menu">
          <a class="nav-login-item" href="https://gc.vixio.com/login" target="_blank" rel="noopener" role="menuitem">
            <strong>GamblingCompliance</strong>
            <small>Gambling platform login</small>
          </a>
          <a class="nav-login-item" href="https://pc.vixio.com/login" target="_blank" rel="noopener" role="menuitem">
            <strong>PaymentsCompliance</strong>
            <small>Payments platform login</small>
          </a>
          <div class="nav-login-foot">
            <span>Don't have an account?</span>
            <a href="https://www.vixio.com/contact-us" target="_blank" rel="noopener">Contact us <span class="arr">→</span></a>
          </div>
        </div>
      </div>
      <a class="nav-cta" href="https://calendly.com/vixio-demonstration/vixio-regulatory-intelligence-discovery-call" target="_blank" rel="noopener" data-cta="book-demo-nav">Book a demo</a>
      <button type="button" class="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobileNav">${ICO.menu}</button>
    </div>
  </div>
</header>

<div class="mobile-nav" id="mobileNav" hidden>
  ${mobileNavHTML()}
</div>

<div class="search-overlay" id="searchOverlay" hidden aria-hidden="true">
  <div class="search-overlay-backdrop" data-search-close></div>
  <div class="search-modal" role="dialog" aria-modal="true" aria-label="Search Vixio">
    <div class="search-modal-head">
      <div class="pulse-dot"></div>
      <span class="mono-label" style="color: var(--accent-400);">Vixio · Search</span>
      <button type="button" class="search-close" data-search-close aria-label="Close search"><span class="kbd">ESC</span></button>
    </div>
    <form class="search-form" action="https://www.vixio.com/search" method="get" target="_blank" rel="noopener">
      <span class="search-icon">${ICO.search}</span>
      <input type="search" name="query" class="search-input" placeholder="Search 4M+ datapoints across 200+ jurisdictions…" autocomplete="off" autocapitalize="off" spellcheck="false" required>
      <input type="hidden" name="utm_source" value="">
      <input type="hidden" name="utm_medium" value="">
      <input type="hidden" name="utm_campaign" value="">
      <input type="hidden" name="utm_content" value="">
      <input type="hidden" name="utm_term" value="">
      <input type="hidden" name="heeet_data" value="">
      <input type="hidden" name="heeet_content" value="">
      <button type="submit" class="btn btn-primary btn-sm">Search <span class="kbd">↵</span></button>
    </form>
    <div class="search-hints">
      <span class="mono-label">Jump to</span>
      <a class="search-hint" href="${P.platform}horizon-scanning.html">Horizon Scanning</a>
      <a class="search-hint" href="${P.platform}workflow-management.html">Workflow</a>
      <a class="search-hint" href="${P.platform}ai-regulatory-assistant.html">AI Assistant</a>
      <a class="search-hint" href="${P.platform}data-hub.html">Data Hub</a>
      <a class="search-hint" href="${H.gambling}">Gambling</a>
      <a class="search-hint" href="${H.fs}">Financial services</a>
      <a class="search-hint" href="${P.resources}2026-predictions.html">2026 Yearbook</a>
      <a class="search-hint" href="${P.contact}">Book a briefing</a>
    </div>
  </div>
</div>
`;
  }

  function mobileNavHTML() {
    return `
<div class="mobile-nav-group">
  <div class="mobile-nav-group-head">How We Help</div>
  <a class="mobile-nav-link" href="${P.howwehelp}stay-ahead.html">Stay ahead of regulatory change</a>
  <a class="mobile-nav-link" href="${P.howwehelp}faster-market-entry.html">Enter markets faster</a>
  <a class="mobile-nav-link" href="${P.howwehelp}single-source.html">A single source of truth</a>
  <a class="mobile-nav-link" href="${P.howwehelp}custom-insights.html">Custom insights</a>
  <a class="mobile-nav-link" href="${P.howwehelp}professional-training.html">Professional training</a>
</div>
<div class="mobile-nav-group">
  <div class="mobile-nav-group-head">Platform</div>
  <a class="mobile-nav-link" href="${P.platform}horizon-scanning.html">Horizon Scanning</a>
  <a class="mobile-nav-link" href="${P.platform}workflow-management.html">Workflow Management</a>
  <a class="mobile-nav-link" href="${P.platform}ai-regulatory-assistant.html">AI Regulatory Assistant</a>
  <a class="mobile-nav-link" href="${P.platform}data-hub.html">Data Hub</a>
  <a class="mobile-nav-link" href="${P.platform}regulatory-library.html">Regulatory Library</a>
  <a class="mobile-nav-link" href="${H.platform}">All platform capabilities →</a>
</div>
<div class="mobile-nav-group">
  <div class="mobile-nav-group-head">Industries</div>
  <a class="mobile-nav-link" href="${H.gambling}">Gambling</a>
  <a class="mobile-nav-link" href="${H.fs}">Financial Services</a>
</div>
<div class="mobile-nav-group">
  <div class="mobile-nav-group-head">Resources</div>
  <a class="mobile-nav-link" href="${P.resources}2026-predictions.html">2026 Predictions</a>
  <a class="mobile-nav-link" href="${P.resources}blog.html">Blog</a>
  <a class="mobile-nav-link" href="${P.resources}research.html">Research</a>
  <a class="mobile-nav-link" href="${P.resources}regulatory-news.html">Regulatory News</a>
</div>
<div class="mobile-nav-group">
  <div class="mobile-nav-group-head">About</div>
  <a class="mobile-nav-link" href="${H.about}">Our story</a>
  <a class="mobile-nav-link" href="${P.about}our-people.html">Our people</a>
  <a class="mobile-nav-link" href="${P.about}careers.html">Careers</a>
  <a class="mobile-nav-link" href="${P.contact}">Contact</a>
</div>
<div style="padding: 20px 0;">
  <a class="btn btn-primary" href="https://calendly.com/vixio-demonstration/vixio-regulatory-intelligence-discovery-call" target="_blank" rel="noopener" data-cta="book-demo-mobile" style="width:100%;justify-content:center">Book a demo ${ICO.arr.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="14" height="14"')}</a>
</div>
`;
  }

  // -----------------------------------------------------------------------
  // FOOTER
  // -----------------------------------------------------------------------
  function footerHTML() {
    const year = new Date().getFullYear();
    return `
<footer class="site-footer">
  <div class="container-wide">
    <div class="footer-grid">
      <div class="footer-brand-col">
        <a class="nav-brand" href="${H.home}" aria-label="Vixio home">
          <span class="mark" aria-hidden="true"></span>
          <span class="wordmark">VIXIO</span>
        </a>
        <p class="footer-tagline">Regulatory intelligence for gambling, payments, and financial services — live across 200+ jurisdictions.</p>
        <button class="footer-region" type="button">
          ${ICO.globe.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="14" height="14"')}
          <span>Region · Global (EN)</span>
        </button>
      </div>

      <div>
        <div class="footer-col-head">Platform</div>
        <ul class="footer-links">
          <li><a href="${P.platform}horizon-scanning.html">Horizon Scanning</a></li>
          <li><a href="${P.platform}workflow-management.html">Workflow Management</a></li>
          <li><a href="${P.platform}ai-regulatory-assistant.html">AI Regulatory Assistant</a></li>
          <li><a href="${P.platform}data-hub.html">Data Hub</a></li>
          <li><a href="${P.platform}regulatory-library.html">Regulatory Library</a></li>
          <li><a href="${P.platform}technical-compliance.html">Technical Compliance</a></li>
          <li><a href="${H.platform}">All capabilities</a></li>
        </ul>
      </div>

      <div>
        <div class="footer-col-head">Industries</div>
        <ul class="footer-links">
          <li><a href="${H.gambling}">Gambling</a></li>
          <li><a href="${P.gambling}online-operators.html">Online Operators</a></li>
          <li><a href="${P.gambling}suppliers.html">Suppliers</a></li>
          <li><a href="${H.fs}">Financial Services</a></li>
          <li><a href="${P.fs}payment-services.html">Payments</a></li>
          <li><a href="${P.fs}retail-banking.html">Retail Banking</a></li>
          <li><a href="${P.fs}digital-assets.html">Digital Assets</a></li>
        </ul>
      </div>

      <div>
        <div class="footer-col-head">Resources</div>
        <ul class="footer-links">
          <li><a href="${P.resources}2026-predictions.html">2026 Predictions</a></li>
          <li><a href="${P.resources}blog.html">Blog</a></li>
          <li><a href="${P.resources}research.html">Research &amp; Guides</a></li>
          <li><a href="${P.resources}regulatory-news.html">Regulatory News</a></li>
          <li><a href="${P.resources}webinars.html">Webinars</a></li>
          <li><a href="${P.resources}podcasts.html">Podcasts</a></li>
          <li><a href="${P.resources}customer-stories.html">Customer Stories</a></li>
        </ul>
      </div>

      <div>
        <div class="footer-col-head">Company</div>
        <ul class="footer-links">
          <li><a href="${H.about}">About</a></li>
          <li><a href="${P.about}our-people.html">Our people</a></li>
          <li><a href="${P.about}advisory-board.html">Advisory board</a></li>
          <li><a href="${P.about}partners.html">Partners</a></li>
          <li><a href="${P.about}awards.html">Awards</a></li>
          <li><a href="${P.about}newsroom.html">Newsroom</a></li>
          <li><a href="${P.about}careers.html">Careers</a></li>
          <li><a href="${P.contact}">Contact</a></li>
        </ul>
      </div>

      <div>
        <div class="footer-col-head">Trust</div>
        <div class="footer-trust">
          <div class="footer-badge">
            <span class="footer-badge-label">Uptime</span>
            <span class="footer-badge-value">99.98%</span>
          </div>
          <div class="footer-badge">
            <span class="footer-badge-label">Security</span>
            <span class="footer-badge-value">Enterprise-grade</span>
          </div>
          <div class="footer-badge">
            <span class="footer-badge-label">Awards</span>
            <span class="footer-badge-value">RegTech Insight 2025</span>
          </div>
          <a class="footer-badge" href="https://www.vixio.com/" target="_blank" rel="noopener" aria-label="System status">
            <span class="pulse-dot pulse-dot--green"></span>
            <span class="footer-badge-value" style="font-size:12px">Systems operational</span>
          </a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="footer-copy">© ${year} Vixio Regulatory Intelligence · All rights reserved.</div>
      <ul class="footer-legal">
        <li><a href="https://www.vixio.com/privacy-policy" target="_blank" rel="noopener">Privacy</a></li>
        <li><a href="https://www.vixio.com/terms-and-conditions" target="_blank" rel="noopener">Terms</a></li>
        <li><a href="https://www.vixio.com/cookie-policy" target="_blank" rel="noopener">Cookies</a></li>
        <li><a href="https://www.vixio.com/disclaimer" target="_blank" rel="noopener">Disclaimer</a></li>
        <li><a href="https://www.vixio.com/anti-slavery-statement" target="_blank" rel="noopener">Anti-slavery</a></li>
        <li><a href="https://www.vixio.com/accessibility-statement" target="_blank" rel="noopener">Accessibility</a></li>
      </ul>
      <div class="footer-social">
        <a href="https://www.linkedin.com/company/vixio-regulatory-intelligence" target="_blank" rel="noopener" aria-label="LinkedIn">${ICO.linkedin}</a>
        <a href="https://www.youtube.com/@vixioregulatoryintelligence" target="_blank" rel="noopener" aria-label="YouTube">${ICO.youtube}</a>
        <a href="https://twitter.com/vixio_regintel" target="_blank" rel="noopener" aria-label="Twitter">${ICO.twitter}</a>
      </div>
    </div>
  </div>
</footer>
`;
  }

  // -----------------------------------------------------------------------
  // INJECTION
  // -----------------------------------------------------------------------
  function injectHeaderFooter() {
    const headerMount = document.getElementById('site-header');
    const footerMount = document.getElementById('site-footer');
    if (headerMount) headerMount.outerHTML = headerHTML();
    if (footerMount) footerMount.outerHTML = footerHTML();
  }

  // -----------------------------------------------------------------------
  // INTERACTIONS
  // -----------------------------------------------------------------------
  function setupScrolledHeader() {
    const header = document.getElementById('siteHeaderEl');
    if (!header) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      if (window.scrollY > 24) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    };
    window.addEventListener('scroll', () => {
      if (!raf) raf = requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  function setupMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const panel = document.getElementById('mobileNav');
    if (!toggle || !panel) return;
    const open = (is) => {
      panel.hidden = !is;
      panel.classList.toggle('is-open', is);
      toggle.setAttribute('aria-expanded', is ? 'true' : 'false');
      toggle.innerHTML = is ? ICO.close : ICO.menu;
      document.body.style.overflow = is ? 'hidden' : '';
    };
    toggle.addEventListener('click', () => {
      const willOpen = panel.hidden || !panel.classList.contains('is-open');
      open(willOpen);
    });
    panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => open(false)));
  }

  function setupMegaMenus() {
    // Accessibility: on hover, set aria-expanded. Esc closes open mega.
    const items = document.querySelectorAll('.nav-item');
    items.forEach(it => {
      const link = it.querySelector('.nav-link');
      if (!link) return;
      it.addEventListener('mouseenter', () => link.setAttribute('aria-expanded', 'true'));
      it.addEventListener('mouseleave', () => link.setAttribute('aria-expanded', 'false'));
      it.addEventListener('focusin',  () => link.setAttribute('aria-expanded', 'true'));
      it.addEventListener('focusout', (e) => {
        if (!it.contains(e.relatedTarget)) link.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.activeElement && document.activeElement.blur();
        document.querySelectorAll('.nav-link[aria-expanded="true"]').forEach(l => l.setAttribute('aria-expanded', 'false'));
      }
    });
  }

  function setupReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach((el, i) => {
      // If a parent has .reveal-stagger, set --i on its children
      if (el.parentElement && el.parentElement.classList.contains('reveal-stagger')) {
        el.style.setProperty('--i', [...el.parentElement.children].indexOf(el));
      }
      io.observe(el);
    });
  }

  function setupCounters() {
    const els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const end = parseFloat(el.getAttribute('data-count')) || 0;
        const suffix = el.getAttribute('data-suffix') || '';
        const prefix = el.getAttribute('data-prefix') || '';
        const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        const dur = parseInt(el.getAttribute('data-duration') || '1400', 10);
        const t0 = performance.now();
        const step = (t) => {
          const k = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - k, 3);
          const v = end * eased;
          let txt = (decimals > 0) ? v.toFixed(decimals) : Math.round(v).toString();
          // Nice commas for large integers
          if (decimals === 0 && Math.abs(end) >= 1000) {
            txt = Math.round(v).toLocaleString('en-US');
          }
          el.textContent = prefix + txt + suffix;
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.3 });
    els.forEach(el => io.observe(el));
  }

  function setupPillarTabs() {
    const groups = document.querySelectorAll('[data-pillar-group]');
    groups.forEach(group => {
      const tabs = group.querySelectorAll('.pillar-tab');
      const panels = group.querySelectorAll('.pillar-panel');
      if (!tabs.length) return;
      tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
          panels.forEach(p => p.hidden = true);
          tab.setAttribute('aria-selected', 'true');
          const target = tab.getAttribute('data-target');
          const panel = group.querySelector('#' + target);
          if (panel) panel.hidden = false;
        });
        // Keyboard: left/right arrows move between tabs
        tab.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const dir = e.key === 'ArrowRight' ? 1 : -1;
            const next = tabs[(i + dir + tabs.length) % tabs.length];
            next.click();
            next.focus();
          }
        });
      });
    });
  }

  function setupIndustryPills() {
    document.querySelectorAll('.industry-pills').forEach(group => {
      const btns = group.querySelectorAll('button');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); });
          btn.classList.add('on');
          btn.setAttribute('aria-pressed', 'true');
        });
      });
    });
  }

  function setupSearch() {
    const overlay = document.getElementById('searchOverlay');
    if (!overlay) return;
    const input = overlay.querySelector('.search-input');

    const open = () => {
      overlay.hidden = false;
      overlay.setAttribute('aria-hidden', 'false');
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      // focus after paint so the transition plays
      requestAnimationFrame(() => setTimeout(() => input && input.focus(), 50));
    };
    const close = () => {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (input) input.value = '';
      // wait for fade then hide
      setTimeout(() => { overlay.hidden = true; }, 180);
    };

    // Any trigger button (header or elsewhere) tagged data-search-open
    document.addEventListener('click', (e) => {
      const opener = e.target.closest('[data-search-open]');
      if (opener) { e.preventDefault(); open(); return; }
      const closer = e.target.closest('[data-search-close]');
      if (closer && overlay.contains(closer)) { e.preventDefault(); close(); return; }
    });

    // Cmd/Ctrl+K toggles the overlay
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (overlay.classList.contains('is-open')) close(); else open();
      } else if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
        close();
      }
    });

    // Clicking a hint closes the overlay (the browser follows the link itself)
    overlay.querySelectorAll('.search-hint').forEach(a => {
      a.addEventListener('click', () => close());
    });
  }

  // -----------------------------------------------------------------------
  // CUSTOMER LOGO MARQUEE — verified Vixio customers, monochrome SVG marks
  // Sourced inline (no CDN) so they render offline and can be recolored via CSS.
  // -----------------------------------------------------------------------
  // Real brand marks. For brands with a Simple Icons entry, we inline their
  // monochrome 24x24 glyph (CC0). For brands not in Simple Icons (most
  // gambling operators), we render a distinctly-styled wordmark so each logo
  // reads as a unique identity, not uniform Inter text.
  const LOGO_MARKS = [
    { name: 'PayPal',    svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15.607 4.653H8.941L6.645 19.251H1.82L4.862 0h7.995c3.754 0 6.375 2.294 6.473 5.513-.648-.478-2.105-.86-3.722-.86m6.57 5.546c0 3.41-3.01 6.853-6.958 6.853h-2.493L11.595 24H6.74l1.845-11.538h3.592c4.208 0 7.346-3.634 7.153-6.949a5.24 5.24 0 0 1 2.848 4.686M9.653 5.546h6.408c.907 0 1.942.222 2.363.541-.195 2.741-2.655 5.483-6.441 5.483H8.714Z"/></svg>' },
    { name: 'Microsoft', svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0v11.408h11.408V0zm12.594 0v11.408H24V0zM0 12.594V24h11.408V12.594zm12.594 0V24H24V12.594z"/></svg>' },
    { name: 'Google',    svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>' },
    { name: 'Visa',      svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z"/></svg>' },
    { name: 'Mastercard',svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.343 18.031c.058.049.12.098.181.146-1.177.783-2.59 1.238-4.107 1.238C3.32 19.416 0 16.096 0 12c0-4.095 3.32-7.416 7.416-7.416 1.518 0 2.931.456 4.105 1.238-.06.051-.12.098-.165.15C9.6 7.489 8.595 9.688 8.595 12c0 2.311 1.001 4.51 2.748 6.031zm5.241-13.447c-1.52 0-2.931.456-4.105 1.238.06.051.12.098.165.15C14.4 7.489 15.405 9.688 15.405 12c0 2.31-1.001 4.507-2.748 6.031-.058.049-.12.098-.181.146 1.177.783 2.588 1.238 4.107 1.238C20.68 19.416 24 16.096 24 12c0-4.094-3.32-7.416-7.416-7.416zM12 6.174c-.096.075-.189.15-.28.231C10.156 7.764 9.169 9.765 9.169 12c0 2.236.987 4.236 2.551 5.595.09.08.185.158.28.232.096-.074.189-.152.28-.232 1.563-1.359 2.551-3.359 2.551-5.595 0-2.235-.987-4.236-2.551-5.595-.09-.08-.184-.156-.28-.231z"/></svg>' },
    { name: 'Stripe',    svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/></svg>' },
    { name: 'Adyen',     svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.64703 9.88245v2.93377c0 .13405.10867.24271.24272.24271h.46316V9.88245h1.76474v5.1503c0 .46916-.38033.8495-.8495.8495H9.94303v-1.23507h2.40991v-.52942h-1.62108c-.46917 0-.8495-.38033-.8495-.8495V9.88245h1.76467Zm-8.26124.00001c.46917 0 .8495.38034.8495.8495v3.3858H.8495c-.46916 0-.8495-.38033-.8495-.8495v-.94805c0-.46917.38034-.8495.8495-.8495h.91521v1.3455c0 .13406.10867.24272.24272.24272h.46316V11.184c0-.13405-.10867-.24271-.24272-.24271l-2.16719-.00002V9.88246Zm5.79068-1.76471v6.00001H5.79068c-.46917 0-.8495-.38033-.8495-.8495v-2.53631c0-.46917.38033-.8495.8495-.8495h.91515v2.93377c0 .13405.10867.24271.24272.24271h.46316l.00005-4.94118h1.76471Zm9.03286 1.76471a.8495.8495 0 0 1 .8495.8495v.94805c0 .46917-.38033.8495-.8495.8495h-.9152v-1.3455c0-.13404-.10868-.2427-.24272-.2427h-.46317v1.8749c0 .13406.10867.24272.24272.24272h2.16719v1.05883h-3.32511c-.46917 0-.8495-.38033-.8495-.8495v-3.3858Zm4.94117 0c.46916 0 .8495.38034.8495.8495v3.3858h-1.7647V11.184c-.0004-.13388-.10884-.24232-.24272-.24272h-.46316v3.1765H19.7647V9.88245Z"/></svg>' },
    { name: 'Wise',      svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.488 7.469 0 15.05h11.585l1.301-3.576H7.922l3.033-3.507.01-.092L8.993 4.48h8.873l-6.878 18.925h4.706L24 .595H2.543l3.945 6.874Z"/></svg>' },
    { name: 'Payoneer',  svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M1.474 3.31c.234 1.802 1.035 5.642 1.398 7.263.095.459.201.853.298 1.013.501.865.907-.287.907-.287C5.644 6.616 3.17 3.597 2.38 2.787c-.139-.15-.384-.332-.608-.396-.32-.095-.374.086-.374.236.01.148.065.565.075.682zm21.835-1.463c.31.224 1.386 1.355 0 1.526-1.984.234-5.76.373-12.022 5.61C8.92 10.968 3.607 16.311.76 22.957a.181.181 0 01-.216.106c-.255-.074-.714-.352-.48-1.418.32-1.44 3.201-8.938 10.817-15.552 2.485-2.155 8.416-7.232 12.426-4.245z"/></svg>' },
    { name: 'Paysafe',   svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m23.905 12.233-7.672 7.673a.16.16 0 0 1-.115.047h-.048a.162.162 0 0 1-.162-.161v-7.787a.324.324 0 0 1-.094.228L8.188 19.86a.332.332 0 0 1-.466 0L.095 12.235a.332.332 0 0 1 0-.466L7.72 4.142a.334.334 0 0 1 .467 0l7.625 7.625c.06.06.094.143.094.23V4.208c0-.089.073-.162.162-.162h.048c.043 0 .084.018.115.048l7.672 7.672a.333.333 0 0 1 .002.467z"/></svg>' },
    { name: 'Betfair',   svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.218 3.14h-7.083v3.6H9.352l7.359 8.582L24 6.67h-3.782zM0 17.26h3.782v3.6h7.083v-3.6h3.783l-7.29-8.583z"/></svg>' },
    { name: 'bet365',    svg: '<svg viewBox="0 0 120 28" xmlns="http://www.w3.org/2000/svg"><text x="0" y="22" font-family="Inter,sans-serif" font-weight="900" font-size="24" letter-spacing="-0.035em" fill="currentColor">bet</text><circle cx="52" cy="14" r="4" fill="currentColor"/><text x="60" y="22" font-family="Inter,sans-serif" font-weight="900" font-size="24" letter-spacing="-0.035em" fill="currentColor">365</text></svg>' },
    { name: 'Flutter Entertainment', svg: '<svg viewBox="0 0 150 28" xmlns="http://www.w3.org/2000/svg"><text x="0" y="22" font-family="Fraunces,Georgia,serif" font-weight="400" font-style="italic" font-size="24" letter-spacing="-0.015em" fill="currentColor">Flutter</text></svg>' },
    { name: 'Entain',    svg: '<svg viewBox="0 0 130 28" xmlns="http://www.w3.org/2000/svg"><text x="0" y="20" font-family="Inter,sans-serif" font-weight="300" font-size="17" letter-spacing="0.32em" fill="currentColor">ENTAIN</text></svg>' },
    { name: 'MGM Resorts', svg: '<svg viewBox="0 0 160 28" xmlns="http://www.w3.org/2000/svg"><text x="0" y="22" font-family="Fraunces,Georgia,serif" font-weight="500" font-size="24" letter-spacing="0.08em" fill="currentColor">MGM</text><text x="64" y="19" font-family="Inter,sans-serif" font-weight="300" font-size="11" letter-spacing="0.26em" fill="currentColor">RESORTS</text></svg>' },
    { name: 'Caesars',   svg: '<svg viewBox="0 0 140 28" xmlns="http://www.w3.org/2000/svg"><text x="0" y="22" font-family="Fraunces,Georgia,serif" font-weight="400" font-size="22" letter-spacing="0.22em" fill="currentColor">CAESARS</text></svg>' },
    { name: 'Betway',    svg: '<svg viewBox="0 0 120 28" xmlns="http://www.w3.org/2000/svg"><text x="0" y="22" font-family="Inter,sans-serif" font-weight="900" font-size="24" letter-spacing="-0.04em" fill="currentColor">betway</text></svg>' },
    { name: 'Betsson',   svg: '<svg viewBox="0 0 120 28" xmlns="http://www.w3.org/2000/svg"><text x="0" y="22" font-family="Inter,sans-serif" font-weight="900" font-style="italic" font-size="24" letter-spacing="-0.035em" fill="currentColor">Betsson</text></svg>' },
    { name: 'FDJ',       svg: '<svg viewBox="0 0 70 28" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="4" width="70" height="20" rx="2" fill="currentColor"/><text x="35" y="20" text-anchor="middle" font-family="Inter,sans-serif" font-weight="900" font-size="16" letter-spacing="0.22em" fill="#F7F7F2">FDJ</text></svg>' },
    { name: 'Worldline', svg: '<svg viewBox="0 0 160 28" xmlns="http://www.w3.org/2000/svg"><text x="0" y="22" font-family="Inter,sans-serif" font-weight="500" font-size="22" letter-spacing="-0.025em" fill="currentColor">worldline</text><circle cx="136" cy="22" r="3" fill="currentColor"/></svg>' },
    { name: 'Trustly',   svg: '<svg viewBox="0 0 120 28" xmlns="http://www.w3.org/2000/svg"><text x="0" y="22" font-family="Inter,sans-serif" font-weight="700" font-size="24" letter-spacing="-0.04em" fill="currentColor">trustly</text><circle cx="88" cy="22" r="2.6" fill="currentColor"/></svg>' },
    { name: 'TrueLayer', svg: '<svg viewBox="0 0 140 28" xmlns="http://www.w3.org/2000/svg"><text x="0" y="22" font-family="Inter,sans-serif" font-weight="600" font-size="22" letter-spacing="-0.035em" fill="currentColor">truelayer</text></svg>' },
    { name: 'SumUp',     svg: '<svg viewBox="0 0 110 28" xmlns="http://www.w3.org/2000/svg"><text x="0" y="22" font-family="Inter,sans-serif" font-weight="900" font-style="italic" font-size="24" letter-spacing="-0.04em" fill="currentColor">SumUp</text></svg>' }
  ];

  function buildLogoMarquee() {
    const root = document.querySelector('[data-logo-marquee]');
    if (!root) return;
    const track = root.querySelector('.logo-marquee-track');
    if (!track) return;
    const renderOne = (mark, ariaHidden) => {
      const el = document.createElement('span');
      el.className = 'logo-chip';
      el.setAttribute('aria-label', mark.name);
      if (ariaHidden) el.setAttribute('aria-hidden', 'true');
      el.innerHTML = mark.svg;
      return el;
    };
    LOGO_MARKS.forEach(m => track.appendChild(renderOne(m, false)));
    // Duplicate for seamless loop
    LOGO_MARKS.forEach(m => track.appendChild(renderOne(m, true)));
  }

  // -----------------------------------------------------------------------
  // HEAD INJECTION: SEO, OG, Twitter, JSON-LD, favicons, preconnects
  // -----------------------------------------------------------------------
  const CANONICAL_ORIGIN = 'https://www.vixio.com';

  function ensureMeta(attr, key, content) {
    if (!content) return;
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }
  function ensureLink(rel, attrs) {
    let sel = `link[rel="${rel}"]`;
    if (attrs && attrs.sizes) sel += `[sizes="${attrs.sizes}"]`;
    let el = document.head.querySelector(sel);
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      document.head.appendChild(el);
    }
    Object.entries(attrs || {}).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }

  function injectHead() {
    const title = document.title || 'Vixio — Regulatory intelligence';
    const descEl = document.head.querySelector('meta[name="description"]');
    const description = (descEl && descEl.getAttribute('content')) ||
      'Live regulatory intelligence across 200+ jurisdictions and 1,400+ authorities.';

    // Compute canonical path — strip local host + /site/ prefix to match production
    let path = window.location.pathname;
    path = path.replace(/\/site\//, '/').replace(/index\.html$/, '');
    const canonical = CANONICAL_ORIGIN + path;
    ensureLink('canonical', { href: canonical });

    // Favicons — SVG primary, PNG fallback not needed (all modern browsers support SVG icons)
    ensureLink('icon', { type: 'image/svg+xml', href: siteRoot + 'assets/favicon.svg' });
    ensureLink('apple-touch-icon', { href: siteRoot + 'assets/favicon.svg' });
    ensureLink('mask-icon', { href: siteRoot + 'assets/favicon.svg', color: '#262053' });

    // PWA manifest — now lives under /site/
    ensureLink('manifest', { href: siteRoot + 'site.webmanifest' });

    // Resource hints — preconnect Calendly + GTM before user interacts
    ensureLink('preconnect', { href: 'https://assets.calendly.com', crossorigin: '' });
    ensureLink('dns-prefetch', { href: 'https://calendly.com' });

    // Open Graph
    ensureMeta('property', 'og:site_name', 'Vixio');
    ensureMeta('property', 'og:type', 'website');
    ensureMeta('property', 'og:locale', 'en_GB');
    ensureMeta('property', 'og:url', canonical);
    ensureMeta('property', 'og:title', title);
    ensureMeta('property', 'og:description', description);
    ensureMeta('property', 'og:image', CANONICAL_ORIGIN + '/site/og-default.png');
    ensureMeta('property', 'og:image:width', '1200');
    ensureMeta('property', 'og:image:height', '630');

    // Twitter
    ensureMeta('name', 'twitter:card', 'summary_large_image');
    ensureMeta('name', 'twitter:site', '@VixioIntel');
    ensureMeta('name', 'twitter:title', title);
    ensureMeta('name', 'twitter:description', description);
    ensureMeta('name', 'twitter:image', CANONICAL_ORIGIN + '/site/og-default.png');

    // Robots + viewport (safety)
    ensureMeta('name', 'robots', 'index,follow,max-image-preview:large');
    ensureMeta('name', 'theme-color', '#262053');

    // JSON-LD Organization schema (once per page)
    if (!document.head.querySelector('script[data-schema="org"]')) {
      const org = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': CANONICAL_ORIGIN + '/#organization',
        'name': 'Vixio',
        'legalName': 'Vixio Regulatory Intelligence',
        'url': CANONICAL_ORIGIN + '/',
        'logo': CANONICAL_ORIGIN + '/site/assets/vixio-logo-white.svg',
        'foundingDate': '2006',
        'description': 'Regulatory intelligence platform covering 200+ jurisdictions and 1,400+ authorities across gambling, payments, banking, and digital assets.',
        'sameAs': [
          'https://www.linkedin.com/company/vixio',
          'https://www.youtube.com/@vixio'
        ],
        'contactPoint': {
          '@type': 'ContactPoint',
          'contactType': 'sales',
          'email': 'briefings@vixio.com',
          'areaServed': ['GB', 'EU', 'US', 'APAC']
        }
      };
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.dataset.schema = 'org';
      s.textContent = JSON.stringify(org);
      document.head.appendChild(s);
    }

    // WebSite + SearchAction schema (once per page)
    if (!document.head.querySelector('script[data-schema="website"]')) {
      const website = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': CANONICAL_ORIGIN + '/#website',
        'url': CANONICAL_ORIGIN + '/',
        'name': 'Vixio',
        'publisher': { '@id': CANONICAL_ORIGIN + '/#organization' },
        'potentialAction': {
          '@type': 'SearchAction',
          'target': CANONICAL_ORIGIN + '/search?query={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      };
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.dataset.schema = 'website';
      s.textContent = JSON.stringify(website);
      document.head.appendChild(s);
    }

    // BreadcrumbList schema from .breadcrumb element if present
    const bc = document.querySelector('.breadcrumb');
    if (bc && !document.head.querySelector('script[data-schema="breadcrumb"]')) {
      const nodes = Array.from(bc.querySelectorAll('a, span'));
      const items = nodes.filter(n => {
        const t = n.textContent.trim();
        if (!t) return false;
        if (n.classList.contains('sep')) return false;
        // Exclude bare punctuation separators ("/", "·", "•", etc.)
        if (/^[\/·•\|>›→\-]+$/.test(t)) return false;
        return true;
      });
      if (items.length > 1) {
        const list = items.map((n, i) => {
          const href = n.tagName === 'A' ? new URL(n.getAttribute('href'), window.location.href).href : canonical;
          return {
            '@type': 'ListItem',
            'position': i + 1,
            'name': n.textContent.trim(),
            'item': href.replace(/^https?:\/\/localhost(:\d+)?/, CANONICAL_ORIGIN).replace(/\/site\//, '/').replace(/index\.html$/, '')
          };
        });
        const schema = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': list };
        const s = document.createElement('script');
        s.type = 'application/ld+json';
        s.dataset.schema = 'breadcrumb';
        s.textContent = JSON.stringify(schema);
        document.head.appendChild(s);
      }
    }
  }

  // -----------------------------------------------------------------------
  // COOKIE CONSENT — GDPR-minimal banner, gates analytics
  // -----------------------------------------------------------------------
  const CONSENT_KEY = 'vixio_consent_v1';

  function getConsent() {
    try { return JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null'); }
    catch (e) { return null; }
  }
  function setConsent(state) {
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ state, ts: Date.now() })); } catch (e) {}
    if (state === 'all') loadAnalytics();
    const el = document.getElementById('cookie-banner');
    if (el) el.remove();
  }

  function buildCookieBanner() {
    if (getConsent()) { if (getConsent().state === 'all') loadAnalytics(); return; }
    const el = document.createElement('div');
    el.id = 'cookie-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Cookie preferences');
    el.innerHTML = `
      <div class="cookie-banner-inner">
        <div class="cookie-banner-body">
          <strong>We use cookies.</strong>
          <span>Essential cookies keep the site working. Optional analytics help us improve. Read our <a href="${rootUp}site/about/contact.html#privacy">privacy notice</a>.</span>
        </div>
        <div class="cookie-banner-actions">
          <button type="button" class="btn btn-sm btn-ghost" data-consent="essential">Essential only</button>
          <button type="button" class="btn btn-sm btn-primary" data-consent="all">Accept all</button>
        </div>
      </div>`;
    document.body.appendChild(el);
    el.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-consent]');
      if (!btn) return;
      setConsent(btn.dataset.consent);
    });
    requestAnimationFrame(() => el.classList.add('is-visible'));
  }

  // -----------------------------------------------------------------------
  // ANALYTICS — GA4 loader, gated behind cookie consent
  // -----------------------------------------------------------------------
  const GA_ID = 'G-VIXIO00000'; // Placeholder — replace with real property ID
  let _analyticsLoaded = false;
  function loadAnalytics() {
    if (_analyticsLoaded) return;
    _analyticsLoaded = true;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, {
      anonymize_ip: true,
      send_page_view: true,
      page_path: window.location.pathname.replace(/\/site\//, '/')
    });
    // Track outbound clicks to real vixio.com links
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="https://www.vixio.com"],a[href^="https://gc.vixio.com"],a[href^="https://pc.vixio.com"]');
      if (a && window.gtag) window.gtag('event', 'outbound_click', { url: a.href });
    });
    // Track search submissions
    document.addEventListener('submit', (e) => {
      const f = e.target.closest('.search-form');
      if (f && window.gtag) {
        const q = (f.querySelector('.search-input') || {}).value || '';
        window.gtag('event', 'site_search', { search_term: q });
      }
    });
  }

  // -----------------------------------------------------------------------
  // BOOT
  // -----------------------------------------------------------------------
  function injectSkipLink() {
    if (document.querySelector('.skip-to-content')) return;
    const a = document.createElement('a');
    a.href = '#main-content';
    a.className = 'skip-to-content';
    a.textContent = 'Skip to main content';
    document.body.prepend(a);
    // Ensure there is a #main-content target — use the first <section> after the header
    if (!document.getElementById('main-content')) {
      const first = document.querySelector('main, body > section, body > div:not(#site-header):not(.mobile-nav):not(.search-overlay):not(#cookie-banner)');
      if (first && first.id !== 'main-content' && !first.closest('#site-header')) {
        first.id = 'main-content';
        first.tabIndex = -1;
      }
    }
  }

  function boot() {
    injectHead();
    injectHeaderFooter();
    injectSkipLink();
    buildLogoMarquee();
    setupScrolledHeader();
    setupMobileNav();
    setupMegaMenus();
    setupReveal();
    setupCounters();
    setupPillarTabs();
    setupIndustryPills();
    setupSearch();
    buildCookieBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
