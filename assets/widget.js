(function(){
  function parseQuery() {
    const p = new URLSearchParams(window.location.search);
    // Zabbix dashboard uses typical 'from'/'to' parameters when you change time range
    // (observed in UI; not guaranteed as stable API).
    const from = p.get('from');
    const to   = p.get('to');
    return { from, to };
  }

  function fmtLabel({from, to}) {
    // Show raw values (e.g., now-1h, now) and also a computed absolute time preview
    // We avoid server calls; Zabbix doesn’t provide a public JS API here.
    const abs = (label) => {
      if (!label) return '';
      if (/^now(?:-[0-9]+[smhdwMy])?$/i.test(label)) {
        // Quick client-side approximation for now-1h style
        let d = new Date();
        const m = label.match(/now-([0-9]+)([smhdwMy])/i);
        if (m) {
          const n = parseInt(m[1],10), u = m[2];
          const ms = {s:1e3, m:6e4, h:36e5, d:864e5, w:6048e5, M:26298e5, y:315576e5}[u] || 0;
          d = new Date(Date.now() - n*ms);
        }
        return d.toLocaleString();
      }
      // Fallback: if it's an absolute timestamp like 20241106T101500Z or unix sec, just echo
      return label;
    };

    const l1 = `${from || 'n/a'} → ${to || 'n/a'}`;
    const l2 = `${abs(from)} → ${abs(to)}`;
    return (l2.trim() && !/n\/a/.test(l2)) ? `${l1}\n(${l2})` : l1;
  }

  function render(containerId, cfg) {
    const root = document.getElementById(containerId);
    if (!root) return;
    const line = root.querySelector('.time-period-line');

    const q = parseQuery();
    let from = null, to = null;

    if (cfg.follow_dashboard_time && (q.from || q.to)) {
      from = q.from || cfg.fallback_from;
      to   = q.to   || cfg.fallback_to;
      root.classList.add('following-dashboard');
    } else {
      from = cfg.fallback_from;
      to   = cfg.fallback_to;
      root.classList.add('using-fallback');
    }

    line.textContent = fmtLabel({from, to});
  }

  function init() {
    if (!window.ZBX_TIMEPERIOD_WIDGET) return;
    Object.entries(window.ZBX_TIMEPERIOD_WIDGET).forEach(([id, cfg]) => render(id, cfg));
  }

  document.addEventListener('DOMContentLoaded', init);
  // If user adjusts time on-the-fly, Zabbix reloads dashboard; a MutationObserver fallback could be added if needed.
})();