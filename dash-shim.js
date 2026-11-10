// A small stand-in for the dashboard runtime the Permit Clock and Fairness Check were first built on,
// so the same chart code runs on any static site. It loads CSV files, runs calculations once,
// keeps filter choices, and redraws every element marked data-draw when data, filters or width change.
(function () {
  const cfg = window.DASH_CONFIG;
  const store = {};
  const calcs = {};
  const draws = {};
  const listeners = [];
  const cache = {};
  let params = Object.assign({}, cfg.params);

  function data(id) {
    if (store[id]) return store[id];
    const c = calcs[id];
    if (!c) return { status: 'error', data: [] };
    const inputs = c.inputs.map(data);
    if (inputs.some((s) => s.status === 'error')) return { status: 'error', data: [] };
    if (inputs.some((s) => s.status !== 'ok')) return { status: 'loading', data: [] };
    if (!cache[id]) {
      try { cache[id] = { status: 'ok', data: c.fn(...inputs.map((s) => s.data)) }; }
      catch (e) { console.error(id, e); cache[id] = { status: 'error', data: [] }; }
    }
    return cache[id];
  }
  function runDraw(el) {
    const fn = draws[el.dataset.draw];
    if (!fn || el.closest('[hidden]')) return;
    try { fn(el); } catch (e) { console.error(el.dataset.draw, e); }
  }
  function redraw() {
    listeners.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
    document.querySelectorAll('[data-draw]').forEach(runDraw);
  }
  window.dash = {
    calc(id, spec) { calcs[id] = spec; },
    data,
    draw(name, fn) {
      if (fn) { draws[name] = fn; return; }
      document.querySelectorAll(`[data-draw="${name}"]`).forEach(runDraw);
    },
    params() { return Object.assign({}, params); },
    setParams(p) { Object.assign(params, p); redraw(); },
    resetParams() { params = Object.assign({}, cfg.params); redraw(); },
    onData(fn) { listeners.push(fn); },
    colors: ['#0B6B47', '#E8B000', '#2F6FB5', '#B3121D', '#7A4FB5', '#C2410C', '#1F8A8A', '#6A6A66'],
    start() {
      Object.keys(cfg.datasets).forEach((id) => { store[id] = { status: 'loading', data: [] }; });
      redraw();
      Object.entries(cfg.datasets).forEach(([id, url]) => {
        fetch(url, { cache: 'no-store' })
          .then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); })
          .then((t) => { store[id] = { status: 'ok', data: d3.csvParse(t) }; })
          .catch(() => { store[id] = { status: 'error', data: [] }; })
          .then(redraw);
      });
      fetch('meta.json', { cache: 'no-store' }).then((r) => r.json()).then((m) => {
        if (m.kind !== 'county' || !m.updated) return;
        document.querySelectorAll('[data-sample-note]').forEach((n) => { n.hidden = true; });
        const when = new Date(m.updated);
        const stale = Date.now() - when.getTime() > 2 * 864e5;
        const line = document.getElementById('site-updated');
        if (line) {
          const d = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(when);
          line.textContent = stale ? `County data last updated ${d}. Today’s update didn’t run yet.` : `County data updated ${d}.`;
          line.classList.toggle('is-stale', stale);
        }
      }).catch(() => {});
      let t;
      window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(redraw, 150); });
    },
  };
})();
