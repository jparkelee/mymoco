
const DATA = window.DATA;
const AS_OF = new Date(DATA.as_of + 'T00:00:00Z');
const TYPES = ['Building permit', 'Demolition', 'Restaurant inspection', 'Liquor license', 'Housing code'];
const PLURAL = { 'Building permit': 'building permits', 'Demolition': 'demolitions', 'Restaurant inspection': 'inspections', 'Liquor license': 'liquor license requests', 'Housing code': 'housing code cases' };
const STORE_KEY = 'moco-alerts-watched';
const state = { area: 'Silver Spring', street: '', days: 7, types: new Set(TYPES), shown: 40 };
const $ = (id) => document.getElementById(id);
const fmtDay = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'UTC' });
const fmtShort = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

const loadWatched = () => { try { const v = JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
const saveWatched = (list) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (e) { /* storage unavailable: keep going */ } };

const areas = [...new Set(DATA.events.map((e) => e.area))].sort((a, b) => a.localeCompare(b));
$('area').replaceChildren(...areas.map((a) => new Option(a, a)));
$('area').value = state.area;
$('types').replaceChildren(...TYPES.map((t) => {
  const b = document.createElement('button');
  b.type = 'button'; b.textContent = t; b.dataset.type = t; b.setAttribute('aria-pressed', 'true');
  return b;
}));

const matches = () => {
  const from = new Date(AS_OF.getTime() - (state.days - 1) * 864e5);
  const street = state.street.trim().toLowerCase();
  return DATA.events.filter((e) => e.area === state.area && state.types.has(e.type)
    && new Date(e.date + 'T00:00:00Z') >= from && (!street || e.block.toLowerCase().includes(street)));
};

const render = () => {
  const list = matches();
  const from = new Date(AS_OF.getTime() - (state.days - 1) * 864e5);
  $('notice-range').textContent = `${fmtShort.format(from)} to ${fmtShort.format(AS_OF)}`;
  const where = state.street.trim() ? `${state.street.trim()} in ${state.area}` : state.area;
  $('notice-head').textContent = list.length === 1 ? `1 change near ${where}` : `${list.length.toLocaleString('en-US')} changes near ${where}`;
  const counts = TYPES.filter((t) => state.types.has(t)).map((t) => {
    const rows = list.filter((e) => e.type === t);
    const bad = rows.filter((e) => e.level === 'bad').length;
    const li = document.createElement('li');
    if (bad) li.className = 'is-bad';
    const strong = document.createElement('strong');
    strong.textContent = rows.length.toLocaleString('en-US');
    li.append(strong, PLURAL[t] + (bad ? ` (${bad} flagged)` : ''));
    return li;
  });
  $('counts').replaceChildren(...counts);
  const top = list.filter((e) => e.level !== 'info').slice(0, 3);
  $('highlights').replaceChildren(...(top.length ? top : list.slice(0, 2)).map((e) => {
    const li = document.createElement('li');
    li.textContent = `${e.title}, ${e.block} (${fmtShort.format(new Date(e.date + 'T00:00:00Z'))})`;
    return li;
  }));
  const watched = loadWatched();
  const isWatched = watched.includes(state.area);
  $('watch').setAttribute('aria-pressed', String(isWatched));
  $('watch').textContent = isWatched ? `Watching ${state.area}` : 'Watch this area';
  $('watching').textContent = watched.length ? `You’re watching: ${watched.join(', ')}` : '';

  const feed = $('feed');
  if (!list.length) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = 'Nothing matches yet. Try “Last 30 days,” clear the street, or turn on more kinds of change.';
    feed.replaceChildren(p);
  } else {
    const byDay = d3group(list.slice(0, state.shown), (e) => e.date);
    feed.replaceChildren(...[...byDay.entries()].map(([day, rows]) => {
      const sec = document.createElement('div');
      sec.className = 'day';
      const h = document.createElement('h3');
      h.textContent = fmtDay.format(new Date(day + 'T00:00:00Z'));
      sec.append(h, ...rows.map((e) => {
        const item = document.createElement('article');
        item.className = 'item' + (e.level === 'bad' ? ' is-bad' : e.level === 'notice' ? ' is-notice' : '');
        const bar = document.createElement('span'); bar.className = 'bar';
        const body = document.createElement('div');
        const title = document.createElement('p'); title.className = 'item-title'; title.textContent = e.title;
        const meta = document.createElement('p'); meta.className = 'item-meta';
        const type = document.createElement('span'); type.className = 'item-type'; type.textContent = e.type;
        meta.append(type, `  ${e.block}, ${e.zip}`);
        body.append(title, meta);
        item.append(bar, body);
        return item;
      }));
      return sec;
    }));
  }
  $('feed-count').textContent = list.length ? `Showing ${Math.min(state.shown, list.length).toLocaleString('en-US')} of ${list.length.toLocaleString('en-US')}` : '';
  $('more').hidden = list.length <= state.shown;
};
function d3group(rows, key) { const m = new Map(); for (const r of rows) { const k = key(r); if (!m.has(k)) m.set(k, []); m.get(k).push(r); } return m; }

$('area').addEventListener('change', (e) => { state.area = e.target.value; state.shown = 40; render(); });
$('street').addEventListener('input', (e) => { state.street = e.target.value; state.shown = 40; render(); });
document.querySelectorAll('.seg button').forEach((b) => b.addEventListener('click', () => {
  state.days = Number(b.dataset.days); state.shown = 40;
  document.querySelectorAll('.seg button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  render();
}));
$('types').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-type]');
  if (!b) return;
  const t = b.dataset.type;
  if (state.types.has(t) && state.types.size > 1) state.types.delete(t); else state.types.add(t);
  b.setAttribute('aria-pressed', String(state.types.has(t)));
  render();
});
$('watch').addEventListener('click', () => {
  const list = loadWatched();
  const next = list.includes(state.area) ? list.filter((a) => a !== state.area) : [...list, state.area];
  saveWatched(next);
  const n = $('notice'); n.classList.remove('flash'); void n.offsetWidth; n.classList.add('flash');
  render();
});
$('more').addEventListener('click', () => { state.shown += 40; render(); });
render();
