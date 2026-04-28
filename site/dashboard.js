/* =========================================================================
   VIXIO — Lightweight Dashboard Widgets (D3 + topojson)
   Provides:
     window.VixioDashboard.miniMap(selector)         — hero panel mini-map
     window.VixioDashboard.liveIntelMap(selector)    — homepage Live Intel section
   The full dashboard on /platform/live-intelligence.html ships its own inline JS.
   ========================================================================= */
(function () {
  'use strict';

  function ready(fn) {
    if (window.d3 && window.topojson) { fn(); return; }
    var tries = 60;
    var iv = setInterval(function () {
      if (window.d3 && window.topojson) { clearInterval(iv); fn(); }
      else if (--tries <= 0) { clearInterval(iv); }
    }, 100);
  }

  // -----------------------------------------------------------------
  // Tracked jurisdictions — 36 ISO numeric codes
  // -----------------------------------------------------------------
  var TRACKED_ISO = {
    '840': { name: 'United States',  flag: '🇺🇸', sev: 8.2  },
    '124': { name: 'Canada',         flag: '🇨🇦', sev: 6.0  },
    '076': { name: 'Brazil',         flag: '🇧🇷', sev: 5.5  },
    '484': { name: 'Mexico',         flag: '🇲🇽', sev: 5.0  },
    '826': { name: 'United Kingdom', flag: '🇬🇧', sev: 8.3  },
    '276': { name: 'Germany',        flag: '🇩🇪', sev: 7.4  },
    '250': { name: 'France',         flag: '🇫🇷', sev: 7.0  },
    '380': { name: 'Italy',          flag: '🇮🇹', sev: 6.5  },
    '724': { name: 'Spain',          flag: '🇪🇸', sev: 6.6  },
    '528': { name: 'Netherlands',    flag: '🇳🇱', sev: 6.8  },
    '372': { name: 'Ireland',        flag: '🇮🇪', sev: 6.4  },
    '756': { name: 'Switzerland',    flag: '🇨🇭', sev: 7.1  },
    '578': { name: 'Norway',         flag: '🇳🇴', sev: 5.4  },
    '752': { name: 'Sweden',         flag: '🇸🇪', sev: 5.5  },
    '208': { name: 'Denmark',        flag: '🇩🇰', sev: 5.3  },
    '246': { name: 'Finland',        flag: '🇫🇮', sev: 5.2  },
    '470': { name: 'Malta',          flag: '🇲🇹', sev: 6.0  },
    '233': { name: 'Estonia',        flag: '🇪🇪', sev: 5.0  },
    '643': { name: 'Russia',         flag: '🇷🇺', sev: 4.8  },
    '792': { name: 'Türkiye',        flag: '🇹🇷', sev: 5.6  },
    '784': { name: 'United Arab Emirates', flag: '🇦🇪', sev: 7.0 },
    '682': { name: 'Saudi Arabia',   flag: '🇸🇦', sev: 6.0  },
    '376': { name: 'Israel',         flag: '🇮🇱', sev: 6.2  },
    '710': { name: 'South Africa',   flag: '🇿🇦', sev: 5.0  },
    '156': { name: 'China',          flag: '🇨🇳', sev: 5.8  },
    '344': { name: 'Hong Kong',      flag: '🇭🇰', sev: 7.75 },
    '392': { name: 'Japan',          flag: '🇯🇵', sev: 6.5  },
    '410': { name: 'South Korea',    flag: '🇰🇷', sev: 6.3  },
    '702': { name: 'Singapore',      flag: '🇸🇬', sev: 7.6  },
    '458': { name: 'Malaysia',       flag: '🇲🇾', sev: 5.5  },
    '764': { name: 'Thailand',       flag: '🇹🇭', sev: 5.3  },
    '608': { name: 'Philippines',    flag: '🇵🇭', sev: 5.0  },
    '356': { name: 'India',          flag: '🇮🇳', sev: 5.8  },
    '036': { name: 'Australia',      flag: '🇦🇺', sev: 6.0  },
    '554': { name: 'New Zealand',    flag: '🇳🇿', sev: 5.4  }
  };

  var TOPO_URLS = [
    'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json',
    'https://unpkg.com/world-atlas@2/countries-110m.json'
  ];

  var topoPromise = null;
  function loadTopo() {
    if (topoPromise) return topoPromise;
    topoPromise = (async function () {
      for (var i = 0; i < TOPO_URLS.length; i++) {
        try { return await d3.json(TOPO_URLS[i]); } catch (e) { /* try next */ }
      }
      throw new Error('Could not load world topojson');
    })();
    return topoPromise;
  }

  // severity color scale
  var sevColor = null;
  function getSevColor() {
    if (sevColor) return sevColor;
    sevColor = d3.scaleLinear()
      .domain([4.5, 8.5])
      .range(['#93c5fd', '#7f1d1d'])
      .interpolate(d3.interpolateHcl)
      .clamp(true);
    return sevColor;
  }

  // -----------------------------------------------------------------
  // MINI MAP — hero panel
  // -----------------------------------------------------------------
  function miniMap(selector, opts) {
    var hostNode = document.querySelector(selector);
    if (!hostNode) return;
    opts = opts || {};

    ready(function () { renderMini(hostNode, opts); });
  }

  function renderMini(host, opts) {
    var W = host.clientWidth || 420;
    var H = host.clientHeight || 220;
    var svg = d3.select(host).append('svg')
      .attr('viewBox', '0 0 ' + W + ' ' + H)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('width', '100%').attr('height', '100%');

    var g = svg.append('g');

    loadTopo().then(function (topo) {
      var countries = topojson.feature(topo, topo.objects.countries).features;
      var projection = d3.geoNaturalEarth1().fitSize([W, H * 0.96], { type: 'Sphere' });
      var path = d3.geoPath(projection);

      g.append('path')
        .attr('d', path({ type: 'Sphere' }))
        .attr('fill', 'none')
        .attr('stroke', 'rgba(255,255,255,0.04)')
        .attr('stroke-width', 0.5);

      g.selectAll('path.country')
        .data(countries)
        .join('path')
        .attr('d', path)
        .attr('class', function (d) {
          var iso = String(+d.id).padStart(3, '0');
          return TRACKED_ISO[iso] ? 'country-tracked' : 'country-base';
        })
        .attr('data-iso', function (d) { return String(+d.id).padStart(3, '0'); });

      // Pulse rings layer
      var pulseLayer = g.append('g').attr('class', 'pulse-layer');

      // Tracked country centroids
      var trackedFeatures = countries.filter(function (d) {
        return TRACKED_ISO[String(+d.id).padStart(3, '0')];
      });

      if (opts.reduce) return;

      // Periodically flash a tracked country + emit a ping ring at its centroid
      function flashRandom() {
        if (!trackedFeatures.length) return;
        var feat = trackedFeatures[Math.floor(Math.random() * trackedFeatures.length)];
        var iso = String(+feat.id).padStart(3, '0');
        var node = host.querySelector('[data-iso="' + iso + '"]');
        if (node) {
          node.classList.add('flash');
          setTimeout(function () { node.classList.remove('flash'); }, 1100);
        }
        var c = path.centroid(feat);
        if (!isFinite(c[0])) return;
        var ring = pulseLayer.append('circle')
          .attr('class', 'ping')
          .attr('cx', c[0]).attr('cy', c[1])
          .attr('r', 2)
          .attr('opacity', 0.85);
        ring.transition().duration(1600).ease(d3.easeCubicOut)
          .attr('r', 22).attr('opacity', 0).remove();
      }
      flashRandom();
    }).catch(function (err) {
      if (window.console) console.warn('[Vixio] miniMap topo load failed', err);
    });
  }

  // -----------------------------------------------------------------
  // LIVE INTELLIGENCE MAP — homepage section
  // -----------------------------------------------------------------
  function liveIntelMap(selector, opts) {
    var hostNode = document.querySelector(selector);
    if (!hostNode) return;
    opts = opts || {};

    ready(function () { renderLiveIntel(hostNode, opts); });
  }

  function renderLiveIntel(host, opts) {
    var W = host.clientWidth || 800;
    var H = host.clientHeight || 420;
    var svg = d3.select(host).append('svg')
      .attr('viewBox', '0 0 ' + W + ' ' + H)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('width', '100%').attr('height', '100%');

    var g = svg.append('g');

    var tooltip = document.createElement('div');
    tooltip.className = 'dash-tt';
    document.body.appendChild(tooltip);

    function positionTip(evt) {
      var pad = 14, w = tooltip.offsetWidth || 220, h = tooltip.offsetHeight || 100;
      var x = evt.clientX + pad, y = evt.clientY + pad;
      if (x + w + 8 > window.innerWidth) x = evt.clientX - w - pad;
      if (y + h + 8 > window.innerHeight) y = evt.clientY - h - pad;
      tooltip.style.left = x + 'px';
      tooltip.style.top  = y + 'px';
    }

    function showTip(content, evt) {
      while (tooltip.firstChild) tooltip.removeChild(tooltip.firstChild);
      tooltip.appendChild(content);
      tooltip.classList.add('show');
      positionTip(evt);
    }
    function hideTip() { tooltip.classList.remove('show'); }

    function buildTip(meta) {
      var frag = document.createDocumentFragment();
      var title = document.createElement('div'); title.className = 'tt-title';
      var dot = document.createElement('span'); dot.className = 'tt-dot';
      var color = getSevColor()(meta.sev);
      dot.style.background = color; dot.style.color = color;
      title.appendChild(dot);
      title.appendChild(document.createTextNode(meta.flag + ' ' + meta.name));
      frag.appendChild(title);
      var rows = [
        ['Severity', meta.sev.toFixed(2) + ' / 10', 'high'],
        ['Status', 'Live coverage', '']
      ];
      rows.forEach(function (r) {
        var row = document.createElement('div'); row.className = 'tt-row';
        var l = document.createElement('span'); l.className = 'l'; l.textContent = r[0];
        var v = document.createElement('span'); v.className = 'v' + (r[2] ? ' ' + r[2] : ''); v.textContent = r[1];
        row.appendChild(l); row.appendChild(v); frag.appendChild(row);
      });
      return frag;
    }

    loadTopo().then(function (topo) {
      var countries = topojson.feature(topo, topo.objects.countries).features;
      var projection = d3.geoEqualEarth().fitSize([W, H * 0.96], { type: 'Sphere' });
      var path = d3.geoPath(projection);

      g.append('path')
        .attr('d', path({ type: 'Sphere' }))
        .attr('fill', 'none')
        .attr('stroke', 'rgba(15,23,42,0.16)')
        .attr('stroke-width', 0.6);

      g.append('path')
        .attr('d', path(d3.geoGraticule10()))
        .attr('fill', 'none')
        .attr('stroke', 'rgba(15,23,42,0.10)')
        .attr('stroke-width', 0.5);

      g.selectAll('path.country')
        .data(countries)
        .join('path')
        .attr('d', path)
        .attr('class', function (d) {
          var iso = String(+d.id).padStart(3, '0');
          return TRACKED_ISO[iso] ? 'country-tracked' : 'country-base';
        })
        .attr('fill', function (d) {
          var iso = String(+d.id).padStart(3, '0');
          var meta = TRACKED_ISO[iso];
          return meta ? getSevColor()(meta.sev) : null;
        })
        .on('mouseenter', function (evt, d) {
          var iso = String(+d.id).padStart(3, '0');
          var meta = TRACKED_ISO[iso];
          if (!meta) return;
          showTip(buildTip(meta), evt);
        })
        .on('mousemove', function (evt) {
          if (tooltip.classList.contains('show')) positionTip(evt);
        })
        .on('mouseleave', hideTip);
    }).catch(function (err) {
      if (window.console) console.warn('[Vixio] liveIntelMap topo load failed', err);
    });
  }

  // -----------------------------------------------------------------
  // EXPORT
  // -----------------------------------------------------------------
  window.VixioDashboard = {
    miniMap: miniMap,
    liveIntelMap: liveIntelMap,
    fullDashboard: function () { /* implemented inline on live-intelligence.html */ }
  };

})();
