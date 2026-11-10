const DATA = window.DATA;
const AS_OF = new Date(DATA.as_of + 'T00:00:00Z');
const KEY = 'my-moco-answers';
const LINKS = {
  forms: 'https://montgomerycountymd.gov/DOT-highway/ServiceRequestOnline/index.html',
  tree: 'https://www.montgomerycountymd.gov/DOT-Highway/Tree',
  mc311: 'https://www.montgomerycountymd.gov/mc311/',
  tax: 'https://www.mymcmedia.org/montgomery-county-tax-bills-reaction/',
  permitGuide: 'https://www.montgomerycountymd.gov/DPS/Resources/Files/RCI/Permits%20Required%20No%20Permits%20Required_2024.pdf',
  permit: 'permit-clock.html',
  fair: 'fairness-check.html',
  alerts: 'alerts.html',
};
const $ = (id) => document.getElementById(id);

// ---------- Every word on the page, in both languages. Spanish is a draft awaiting native-speaker review.
const L = {
  en: {
    locale: 'en-US',
    note: 'Tell it about you, and it shows only what matters to you. Change any underlined choice, or describe things in your own words below.',
    projectsShort: { '': 'Nothing planned', 'Deck or porch': 'A deck or porch', 'Addition': 'An addition', 'Remodel': 'A remodel', 'Repair': 'A repair', 'Shed or garage': 'A shed or garage', 'Pool': 'A pool', 'Accessory apartment': 'An accessory apartment', 'New home': 'A new home' },
    waitsShort: { '': 'Nothing right now', tree: 'A county tree removal', 'Pothole': 'A pothole fix', 'Streetlight out': 'A streetlight repair', 'Sidewalk repair': 'A sidewalk repair', 'Storm drain clog': 'A storm drain cleanout', 'Tree down or hazard': 'A fallen-tree cleanup', 'Abandoned vehicle': 'An abandoned car removed' },
    change_sit: 'Change your situation',
    f_address: 'Your address', addr_ph: 'Example: 8400 Georgia Ave, 20910', f_area_auto: 'Area',
    nav_brief: 'Your briefing', nav_alerts: 'Changes near you', nav_permits: 'Permit wait times', nav_fix: 'How fast fixes happen',
    hero_title: 'What’s happening on your street',
    hero_sub: 'Enter your address to see county requests, permit waits, tax and rent rules, and changes nearby, explained in plain English. It’s free, and your address never leaves this device.',
    addr_go: 'Show my briefing',
    how1_t: 'Enter your address', how1_d: 'Or just pick your area. We use it to find your street and neighborhood.',
    how2_t: 'Tell us what you’re dealing with', how2_d: 'A tree removal, a deck permit, a pothole. This step is optional.',
    how3_t: 'Get your briefing', how3_d: 'What to expect, how long it takes, and exactly what to do next.',
    tailor_title: 'Make it fit you', tailor_hint: 'Pick what applies. Your briefing updates right away.', f_role_q: 'I…',
    tools_title: 'More tools', tool_alerts_d: 'Every new permit, demolition, inspection and license request near you.', tool_permits_d: 'How long building permits really take, by project type and area.', tool_fix_d: 'How fast the county closes 311 requests in each part of the county.', tool_open: 'Open',
    feedback_link: 'Something wrong or missing? Tell us', top_link: 'Change address',
    cta_tree: 'Open the MC311 tree request', cta_req: 'Check my request on MC311', cta_check: 'Read the county’s permit guide', cta_permit: 'See permit wait times', cta_tax: 'Ask MC311 about tax credits', cta_rent: 'Contact MC311', cta_near: 'See every change near me', cta_fix: 'Compare fix times', cta_biz: 'See inspections near me',
    addr_ok: (area, zip, street) => `Matched to ${area}${zip ? ` (${zip})` : ''}${street ? `, near ${street}` : ''}.`,
    addr_none: 'We couldn’t find a ZIP code or town in that address. Pick your area below.',
    addr_private: 'Your address stays on this device and is never sent anywhere.',
    near_street_answer: (k, street) => ['', `${k} ${k === '1' ? 'change' : 'changes'}`, ` on ${street} near you this week.`],
    near_street_sub: (m, area) => `${m} in all of ${area}.`, near_street_none: (street) => `Nothing on ${street} near you this week.`,
    glance_street: (k) => (k === '1' ? 'change on your street this week' : 'changes on your street this week'), mast_near: (street) => `Near ${street}`,
    place: (where, date) => `${where}, ${date}`, county_name: 'Montgomery County', sample_note: 'Sample number, not a county record.', county_note: 'From the county’s open data.',
    updated_line: (d) => `County data updated ${d}.`, stale_line: (d) => `County data last updated ${d}. Today’s update didn’t run yet.`, sample_line: 'Sample data until the first nightly update runs.',
    fig_permits: (k) => (k === '1' ? 'needs a permit' : 'need permits'), fig_credit: 'credit ended', fig_cap: 'rent cap', fig_inspections: 'inspections and license requests', fig_changes: (k) => (k === '1' ? 'change' : 'changes'),
    week_title: 'What matters to you this week', ask_summary: 'Or describe it in your own words',
    kicker: 'Your Montgomery County briefing', situation: 'Your situation', situation_hint: 'Change anything and your briefing updates.',
    f_area: 'Area', f_role: 'Who I am', f_project: 'Building plans', f_wait: 'Waiting on the county',
    glance_tree: 'county tree removal', glance_req: (l) => `typical ${l}`, glance_permit: 'typical permit review', glance_near: (k) => (k === '1' ? 'change near you this week' : 'changes near you this week'), glance_fix: 'typical pothole fix here', glance_rent: 'cap on rent increases',
    unit_months: 'months', unit_days: 'days', sample_word: 'sample',
    tl: ['Today', 'Arborist inspects', 'Crew visit window'],
    email_title: 'Get this every Monday', email_text: 'A free weekly email with only your cards, in English or Spanish. Sign-up opens soon; nothing is collected yet.', email_preview: 'Preview the email', email_hide: 'Hide preview', email_subject: (a) => `Your week in ${a}`,
    pro_line: 'For contractors, architects and agents: MoCo Pro alerts are in the works.',
    roles: { homeowner: 'I own my home', renter: 'I rent my home', business: 'I run a small business' },
    projects: { '': 'not planning a building project', 'Deck or porch': 'planning a deck or porch', 'Addition': 'planning an addition', 'Remodel': 'planning a remodel', 'Repair': 'planning a repair', 'Shed or garage': 'planning a shed or garage', 'Pool': 'planning a pool', 'Accessory apartment': 'planning an accessory apartment', 'New home': 'building a new home' },
    projectNames: { 'Deck or porch': 'deck or porch', 'Addition': 'addition', 'Remodel': 'remodel', 'Repair': 'repair', 'Shed or garage': 'shed or garage', 'Pool': 'pool', 'Accessory apartment': 'accessory apartment', 'New home': 'new home' },
    waits: { '': 'not waiting on the county', tree: 'waiting on a county tree removal', 'Pothole': 'waiting on a pothole fix', 'Streetlight out': 'waiting on a streetlight repair', 'Sidewalk repair': 'waiting on a sidewalk repair', 'Storm drain clog': 'waiting on a storm drain cleanout', 'Tree down or hazard': 'waiting on a fallen-tree cleanup', 'Abandoned vehicle': 'waiting on an abandoned car' },
    waitNames: { 'Pothole': 'pothole fix', 'Streetlight out': 'streetlight repair', 'Sidewalk repair': 'sidewalk repair', 'Storm drain clog': 'storm drain cleanout', 'Tree down or hazard': 'fallen-tree cleanup', 'Abandoned vehicle': 'abandoned-car removal' },
    ask_label: 'Or describe your situation in your own words',
    ask_placeholder: 'For example: I want to replace my backyard fence and put in a small shed. Also, the county tree out front is leaning.',
    ask_go: 'Show what applies to me', ask_clear: 'Clear',
    ask_empty: 'Type a sentence or two about your project or problem first.',
    ask_reading: 'Reading your description…',
    ask_denied: 'Claude wasn’t allowed, so this used simple keyword matching.',
    ask_unavailable: 'Claude was unavailable, so this used simple keyword matching.',
    understood_ai: 'Understood as:', understood_kw: 'Matched by keywords:',
    understood_none: 'nothing from the county’s lists. Try naming the project, like “fence” or “shed”.',
    privacy: 'What you type isn’t saved. If you allow Claude when asked, your words go to Claude only to match them to the county’s lists.',
    badge_real: 'County information', badge_sample: 'Sample data',
    legend_real: 'taken from county pages', legend_sample: 'made-up numbers for this prototype',
    brief_title: 'Your briefing',
    brief_sum: (n) => (n === 1 ? '1 thing for you' : `${n} things for you, most important first`),
    more_sum: (n) => `${n} more for you`,
    live: (n) => `Your briefing updated: ${n} ${n === 1 ? 'item' : 'items'}.`,
    print: 'Print or save as PDF', reset: 'Start over',
    saved_note: 'Your answers and address are saved only in this browser. Nothing is sent anywhere.',
    go_deeper: 'Go deeper:',
    why: 'Why you’re seeing this: ', details: 'Details', source: 'Source: ',
    useful: 'Was this useful?', yes: 'Yes', no: 'No', thanks: 'Thanks for letting us know.',
    missing: 'Thanks. What was missing or confusing?', note_btn: 'Leave a note', note_off: 'Notes can’t be left from this view. Thanks for the feedback.',
    days: (v) => `${v} days`,
    tree: {
      tag: 'Your request',
      answer: ['Expect a county tree removal to take ', '15 to 18 months', '.'],
      sub: (a, b) => `If you file this month, the crew will most likely come between ${a} and ${b}.`,
      todo: [['File “Request to Inspect, Remove or Prune County Tree” on ', 'MC311', ', or call 311 ((240) 777-0311 from outside the county). Keep your request number.'],
        'If the tree gets worse, such as a cracked limb or more lean, call 311, give your number and say it’s a hazard.',
        'If it falls or touches power lines, stay clear and call 911.',
        'Don’t cut it yourself: a street tree needs both a county and a state permit, and a replacement tree.'],
      why: 'you said you’re waiting on a county tree removal.',
      detail: 'Any tree growing in the street right-of-way, usually the strip between the sidewalk and the curb, belongs to the county. An arborist inspects first. Stumps are sometimes left when grinding would harm other roots or utility lines.',
      source: ['Montgomery County DOT tree maintenance page', ', checked Nov. 2026'],
    },
    req: {
      tag: 'Your request',
      answer: (label, where) => [`A ${label} ${where} usually takes about `, null, '.'],
      inArea: (a) => `in ${a}`, county: 'countywide',
      compare: (word, c, p90) => `That’s ${word} the county’s typical ${c} days. One in ten takes longer than ${p90} days.`,
      words: { slower: 'slower than', faster: 'faster than', same: 'about the same as' },
      only90: (p90) => `One in ten takes longer than ${p90} days.`,
      countyLabel: 'County',
      todo: (p90) => [['Check your request’s status on ', 'MC311', ' with your request number.'], `If it’s still open after ${p90} days, call 311, give your number and ask what’s holding it up.`],
      why: (label) => `you said you’re waiting on a ${label}.`,
      d1: 'Usually means the typical case: half of requests closed faster and half took longer.',
      d2: (n) => `Based on ${n} sample requests closed in the last 12 months. Compare every area in the `,
    },
    permit: {
      tag: 'Your project',
      answer: (type, where) => [`A ${type} permit ${where} usually takes about `, null, ' once it needs review.'],
      sub: (pct) => `“Needs review” means a county reviewer checks your plans before approving them. About ${pct}% of these permits skip that step and are approved the same day.`,
      range: (lo, mid, hi) => [`1 in 4 within ${lo} days`, `typical ${mid}`, `1 in 10 over ${hi}`],
      rangeAria: (lo, mid, hi) => `A quarter take ${lo} days or less, typical ${mid}, one in ten take over ${hi}.`,
      todo: (weeks) => [`Apply at least ${weeks} weeks before you want to start. That covers 9 out of 10 cases.`, 'Have complete plans ready. Days spent fixing plans count on the clock.', ['See how waits are changing in the ', 'Permit Clock', '.']],
      why: (type) => `you said you’re planning a ${type}.`,
      d1: 'Typical means the middle case: half of permits took less time and half took more. The shaded bar shows the range most permits fall in.',
      d2: (n, area) => `Based on ${n} sample permits issued in ${area} in the last 12 months.`,
      d3: (n, area) => `Too few sample permits in ${area}, so this uses the county-wide figure from ${n} permits.`,
    },
    check: {
      tag: 'Do I need a permit?', yes: 'Permit likely', no: 'Likely no permit',
      answerSome: (one) => [one ? 'This work ' : 'Some of this work ', 'likely needs a county permit', '.'],
      answerNone: ['This work ', 'likely doesn’t need a county permit', '.'],
      todo: ['Not sure? Call 311 ((240) 777-0311) or visit Permitting Services at 2425 Reedie Drive, 7th Floor, Wheaton, 7:30 a.m. to 4 p.m. on weekdays. No appointment needed.',
        'Cities, towns and homeowner associations can have their own rules. Check them too.',
        'Work that skips a permit still has to meet the building code.'],
      whyText: 'you described this work in your own words.',
      whyProject: (p) => `you said you’re ${p}.`,
      detail: 'This is a guide built from the county’s list, not an official ruling. The county decides, based on your exact plans.',
      source: ['DPS, A Guide to Building Permits and Home Improvements', ', 2024'],
    },
    tax: {
      tag: 'Your tax bill', answer: ['Your property tax bill may have risen even though the rate ', 'didn’t change', '.'],
      sub: 'The county ended the $692 Income Tax Offset Credit this year, and rising assessments added to many bills.',
      todo: ['Check which other tax credits you can claim. Some need a new application every year: one is due Oct. 1, another April 1.', ['Ask about credits through ', 'MC311', ' or by calling 311.']],
      why: 'you said you own your home.', source: ['Montgomery Community Media', ', July 2026'],
    },
    rent: {
      tag: 'Your rent', answer: ['If your building was built in 2003 or earlier, rent increases starting July 1, 2026 are capped at ', '5.2%', '.'],
      sub: 'Buildings on the county’s Troubled or At-Risk list can’t raise rent at all until they’re taken off it.',
      todo: ['Check your building’s age and the date your increase takes effect.', ['If an increase looks too high, ask for the Office of Landlord-Tenant Affairs through ', 'MC311', ' or 311.']],
      why: 'you said you rent your home.', source: ['Montgomery County rent stabilization rules for July 2026'],
    },
    biz: {
      tag: 'Near your business', answer: (area, n) => [`${area} had `, `${n} inspections and liquor license requests`, ' in the last 30 days.'],
      failed: (n) => `${n} of them were failed inspections or closures.`, none: 'None were failed inspections.',
      todo: [['Follow new liquor license requests and inspections near you in ', 'Neighborhood Alerts', '.']], why: 'you said you run a small business.',
    },
    near: {
      tag: 'Near you this week', answer: (n, area) => ['', `${n} changes`, ` near ${area} in the past 7 days.`],
      todo: [['See every change and watch your area in ', 'Neighborhood Alerts', '.']], why: (area) => `you live in ${area}.`,
    },
    fix: {
      tag: 'How fast fixes happen here', answer: (area, c) => [`Pothole fixes in ${area} take about `, null, ` against ${c} countywide.`],
      todo: [['Compare every area and request type in the ', 'Fairness Check', '.']], why: (area) => `you live in ${area}.`,
    },
  },
  es: {
    locale: 'es-US',
    note: 'Cuéntenos sobre usted y le mostraremos solo lo que le importa. Cambie cualquier opción subrayada o describa su situación con sus propias palabras más abajo.',
    projectsShort: { '': 'Ninguna por ahora', 'Deck or porch': 'Una terraza o porche', 'Addition': 'Una ampliación', 'Remodel': 'Una remodelación', 'Repair': 'Una reparación', 'Shed or garage': 'Un cobertizo o garaje', 'Pool': 'Una piscina', 'Accessory apartment': 'Un apartamento accesorio', 'New home': 'Una casa nueva' },
    waitsShort: { '': 'Nada por ahora', tree: 'Quitar un árbol del condado', 'Pothole': 'Reparar un bache', 'Streetlight out': 'Reparar un farol', 'Sidewalk repair': 'Reparar una acera', 'Storm drain clog': 'Limpiar un desagüe', 'Tree down or hazard': 'Retirar un árbol caído', 'Abandoned vehicle': 'Retirar un carro abandonado' },
    change_sit: 'Cambiar su situación',
    f_address: 'Su dirección', addr_ph: 'Ejemplo: 8400 Georgia Ave, 20910', f_area_auto: 'Zona',
    nav_brief: 'Su resumen', nav_alerts: 'Cambios cerca', nav_permits: 'Tiempos de permisos', nav_fix: 'Rapidez de reparaciones',
    hero_title: 'Qué está pasando en su calle',
    hero_sub: 'Escriba su dirección para ver solicitudes al condado, tiempos de permisos, reglas de impuestos y alquiler, y cambios cercanos, explicados en palabras sencillas. Es gratis, y su dirección nunca sale de este dispositivo.',
    addr_go: 'Ver mi resumen',
    how1_t: 'Escriba su dirección', how1_d: 'O simplemente elija su zona. La usamos para encontrar su calle y su vecindario.',
    how2_t: 'Cuéntenos su situación', how2_d: 'Quitar un árbol, un permiso para una terraza, un bache. Este paso es opcional.',
    how3_t: 'Reciba su resumen', how3_d: 'Qué esperar, cuánto tarda y exactamente qué hacer después.',
    tailor_title: 'Ajústelo a usted', tailor_hint: 'Elija lo que le aplica. Su resumen se actualiza enseguida.', f_role_q: 'Yo…',
    tools_title: 'Más herramientas', tool_alerts_d: 'Cada nuevo permiso, demolición, inspección y solicitud de licencia cerca de usted.', tool_permits_d: 'Cuánto tardan de verdad los permisos de construcción, por tipo de obra y zona.', tool_fix_d: 'Qué tan rápido cierra el condado las solicitudes al 311 en cada zona.', tool_open: 'Abrir',
    feedback_link: '¿Algo está mal o falta? Díganos', top_link: 'Cambiar dirección',
    cta_tree: 'Abrir la solicitud de árbol en MC311', cta_req: 'Revisar mi solicitud en MC311', cta_check: 'Leer la guía de permisos del condado', cta_permit: 'Ver tiempos de permisos', cta_tax: 'Preguntar a MC311 por créditos', cta_rent: 'Contactar a MC311', cta_near: 'Ver todos los cambios cerca', cta_fix: 'Comparar tiempos de reparación', cta_biz: 'Ver inspecciones cerca',
    addr_ok: (area, zip, street) => `Encontramos ${area}${zip ? ` (${zip})` : ''}${street ? `, cerca de ${street}` : ''}.`,
    addr_none: 'No encontramos un código postal ni un pueblo en esa dirección. Elija su zona abajo.',
    addr_private: 'Su dirección se queda en este dispositivo y nunca se envía.',
    near_street_answer: (k, street) => ['', `${k} ${k === '1' ? 'cambio' : 'cambios'}`, ` en ${street} cerca de usted esta semana.`],
    near_street_sub: (m, area) => `${m} en todo ${area}.`, near_street_none: (street) => `Nada en ${street} cerca de usted esta semana.`,
    glance_street: (k) => (k === '1' ? 'cambio en su calle esta semana' : 'cambios en su calle esta semana'), mast_near: (street) => `Cerca de ${street}`,
    place: (where, date) => `${where}, ${date}`, county_name: 'Condado de Montgomery', sample_note: 'Cifra de muestra, no es un dato del condado.', county_note: 'De los datos abiertos del condado.',
    updated_line: (d) => `Datos del condado actualizados el ${d}.`, stale_line: (d) => `Datos del condado actualizados por última vez el ${d}. La actualización de hoy todavía no corrió.`, sample_line: 'Datos de muestra hasta que corra la primera actualización nocturna.',
    fig_permits: (k) => (k === '1' ? 'necesita permiso' : 'necesitan permiso'), fig_credit: 'crédito eliminado', fig_cap: 'tope de alquiler', fig_inspections: 'inspecciones y solicitudes', fig_changes: (k) => (k === '1' ? 'cambio' : 'cambios'),
    week_title: 'Lo que le importa esta semana', ask_summary: 'O descríbalo con sus propias palabras',
    kicker: 'Su resumen del condado de Montgomery', situation: 'Su situación', situation_hint: 'Cambie cualquier cosa y su resumen se actualiza.',
    f_area: 'Zona', f_role: 'Quién soy', f_project: 'Obras', f_wait: 'Lo que espero del condado',
    glance_tree: 'para quitar un árbol del condado', glance_req: (l) => `lo típico: ${l}`, glance_permit: 'revisión típica de un permiso', glance_near: (k) => (k === '1' ? 'cambio cerca esta semana' : 'cambios cerca esta semana'), glance_fix: 'para reparar un bache aquí', glance_rent: 'tope a los aumentos de alquiler',
    unit_months: 'meses', unit_days: 'días', sample_word: 'muestra',
    tl: ['Hoy', 'Inspección del arborista', 'Visita de la cuadrilla'],
    email_title: 'Recíbalo cada lunes', email_text: 'Un correo semanal gratis solo con sus tarjetas, en inglés o español. La inscripción abrirá pronto; todavía no se recoge ningún dato.', email_preview: 'Ver el correo de ejemplo', email_hide: 'Ocultar el ejemplo', email_subject: (a) => `Su semana en ${a}`,
    pro_line: 'Para contratistas, arquitectos y agentes: estamos preparando las alertas MoCo Pro.',
    roles: { homeowner: 'Tengo casa propia', renter: 'Alquilo mi vivienda', business: 'Tengo un pequeño negocio' },
    projects: { '': 'no planeo ninguna obra', 'Deck or porch': 'estoy planeando una terraza o porche', 'Addition': 'estoy planeando una ampliación', 'Remodel': 'estoy planeando una remodelación', 'Repair': 'estoy planeando una reparación', 'Shed or garage': 'estoy planeando un cobertizo o garaje', 'Pool': 'estoy planeando una piscina', 'Accessory apartment': 'estoy planeando un apartamento accesorio', 'New home': 'estoy construyendo una casa nueva' },
    projectNames: { 'Deck or porch': 'terraza o porche', 'Addition': 'ampliación', 'Remodel': 'remodelación', 'Repair': 'reparación', 'Shed or garage': 'cobertizo o garaje', 'Pool': 'piscina', 'Accessory apartment': 'apartamento accesorio', 'New home': 'casa nueva' },
    waits: { '': 'no espero nada del condado', tree: 'espero que el condado quite un árbol', 'Pothole': 'espero que reparen un bache', 'Streetlight out': 'espero que reparen un farol', 'Sidewalk repair': 'espero que reparen una acera', 'Storm drain clog': 'espero que limpien un desagüe pluvial', 'Tree down or hazard': 'espero que retiren un árbol caído', 'Abandoned vehicle': 'espero que retiren un carro abandonado' },
    waitNames: { 'Pothole': 'reparación de un bache', 'Streetlight out': 'reparación de un farol', 'Sidewalk repair': 'reparación de una acera', 'Storm drain clog': 'limpieza de un desagüe pluvial', 'Tree down or hazard': 'remoción de un árbol caído', 'Abandoned vehicle': 'remoción de un carro abandonado' },
    ask_label: 'O describa su situación con sus propias palabras',
    ask_placeholder: 'Por ejemplo: Quiero cambiar la cerca del patio y poner un cobertizo pequeño. Además, el árbol del condado frente a mi casa está inclinado.',
    ask_go: 'Mostrar lo que me aplica', ask_clear: 'Borrar',
    ask_empty: 'Primero escriba una o dos oraciones sobre su proyecto o problema.',
    ask_reading: 'Leyendo su descripción…',
    ask_denied: 'No se le dio permiso a Claude, así que se buscaron palabras clave.',
    ask_unavailable: 'Claude no estaba disponible, así que se buscaron palabras clave.',
    understood_ai: 'Entendimos:', understood_kw: 'Encontramos por palabras clave:',
    understood_none: 'nada de las listas del condado. Pruebe a nombrar el proyecto, como “cerca” o “cobertizo”.',
    privacy: 'Lo que escriba no se guarda. Si le da permiso a Claude cuando se lo pida, sus palabras se envían a Claude solo para compararlas con las listas del condado.',
    badge_real: 'Información del condado', badge_sample: 'Datos de muestra',
    legend_real: 'tomada de páginas del condado', legend_sample: 'cifras inventadas para este prototipo',
    brief_title: 'Su resumen',
    brief_sum: (n) => (n === 1 ? '1 cosa para usted' : `${n} cosas para usted, lo más importante primero`),
    more_sum: (n) => `${n} más para usted`,
    live: (n) => `Su resumen se actualizó: ${n} ${n === 1 ? 'elemento' : 'elementos'}.`,
    print: 'Imprimir o guardar como PDF', reset: 'Empezar de nuevo',
    saved_note: 'Sus respuestas y su dirección se guardan solo en este navegador. No se envía nada.',
    go_deeper: 'Más detalles:',
    why: 'Por qué ve esto: ', details: 'Detalles', source: 'Fuente: ',
    useful: '¿Le fue útil?', yes: 'Sí', no: 'No', thanks: 'Gracias por avisarnos.',
    missing: 'Gracias. ¿Qué faltó o qué no se entendió?', note_btn: 'Dejar una nota', note_off: 'No se pueden dejar notas desde esta vista. Gracias por su opinión.',
    days: (v) => `${v} días`,
    tree: {
      tag: 'Su solicitud',
      answer: ['Cuente con que el condado tarde ', 'de 15 a 18 meses', ' en quitar el árbol.'],
      sub: (a, b) => `Si hace la solicitud este mes, lo más probable es que la cuadrilla venga entre ${a} y ${b}.`,
      todo: [['Llene la solicitud “Request to Inspect, Remove or Prune County Tree” en ', 'MC311', ', o llame al 311 (al (240) 777-0311 desde fuera del condado). Guarde su número de solicitud.'],
        'Si el árbol empeora, por ejemplo una rama rajada o más inclinación, llame al 311, dé su número y diga que es un peligro.',
        'Si se cae o toca cables eléctricos, aléjese y llame al 911.',
        'No lo corte usted: un árbol de la calle requiere un permiso del condado y otro del estado, además de plantar un árbol de reemplazo.'],
      why: 'usted dijo que espera que el condado quite un árbol.',
      detail: 'Todo árbol que crece en la servidumbre de la calle, normalmente la franja entre la acera y el bordillo, pertenece al condado. Primero lo inspecciona un arborista. A veces se deja el tocón si molerlo dañaría otras raíces o líneas de servicios.',
      source: ['Página de mantenimiento de árboles del DOT del condado', ', consultada en nov. de 2026'],
    },
    req: {
      tag: 'Su solicitud',
      answer: (label, where) => [`La ${label} ${where} suele tardar unos `, null, '.'],
      inArea: (a) => `en ${a}`, county: 'en el condado',
      compare: (word, c, p90) => `Eso es ${word} lo típico del condado, ${c} días. Una de cada diez tarda más de ${p90} días.`,
      words: { slower: 'más lento que', faster: 'más rápido que', same: 'más o menos igual que' },
      only90: (p90) => `Una de cada diez tarda más de ${p90} días.`,
      countyLabel: 'Condado',
      todo: (p90) => [['Revise el estado de su solicitud en ', 'MC311', ' con su número de solicitud.'], `Si sigue abierta después de ${p90} días, llame al 311, dé su número y pregunte qué la está retrasando.`],
      why: (label) => `usted dijo que espera la ${label}.`,
      d1: '“Suele” se refiere al caso típico: la mitad de las solicitudes se cerró más rápido y la otra mitad tardó más.',
      d2: (n) => `Basado en ${n} solicitudes de muestra cerradas en los últimos 12 meses. Compare todas las zonas en `,
    },
    permit: {
      tag: 'Su proyecto',
      answer: (type, where) => [`Un permiso de ${type} ${where} suele tardar unos `, null, ' cuando necesita revisión.'],
      sub: (pct) => `“Necesita revisión” quiere decir que un revisor del condado examina sus planos antes de aprobarlos. Alrededor del ${pct}% de estos permisos se salta ese paso y se aprueba el mismo día.`,
      range: (lo, mid, hi) => [`1 de cada 4 en ${lo} días o menos`, `típico ${mid}`, `1 de cada 10 más de ${hi}`],
      rangeAria: (lo, mid, hi) => `Una cuarta parte tarda ${lo} días o menos, lo típico es ${mid} y uno de cada diez tarda más de ${hi}.`,
      todo: (weeks) => [`Haga la solicitud al menos ${weeks} semanas antes de querer empezar. Eso cubre 9 de cada 10 casos.`, 'Tenga los planos completos. Los días que se usan para corregir planos cuentan en el reloj.', ['Vea cómo cambian los tiempos en el ', 'Permit Clock', '.']],
      why: (type) => `usted dijo que está planeando: ${type}.`,
      d1: 'Lo típico es el caso del medio: la mitad de los permisos tardó menos y la otra mitad más. La barra sombreada muestra el rango en que caen la mayoría.',
      d2: (n, area) => `Basado en ${n} permisos de muestra emitidos en ${area} en los últimos 12 meses.`,
      d3: (n, area) => `Hay muy pocos permisos de muestra en ${area}, así que se usa la cifra del condado, de ${n} permisos.`,
    },
    check: {
      tag: '¿Necesito un permiso?', yes: 'Probablemente sí', no: 'Probablemente no',
      answerSome: (one) => [one ? 'Este trabajo ' : 'Parte de este trabajo ', 'probablemente necesita un permiso del condado', '.'],
      answerNone: ['Este trabajo ', 'probablemente no necesita un permiso del condado', '.'],
      todo: ['¿No está seguro? Llame al 311 ((240) 777-0311) o visite Permitting Services en 2425 Reedie Drive, 7.º piso, Wheaton, de 7:30 a. m. a 4 p. m., de lunes a viernes. No hace falta cita.',
        'Las ciudades, los pueblos y las asociaciones de propietarios pueden tener sus propias reglas. Revíselas también.',
        'Aunque un trabajo no necesite permiso, igual debe cumplir el código de construcción.'],
      whyText: 'usted describió este trabajo con sus propias palabras.',
      whyProject: (p) => `usted dijo: ${p}.`,
      detail: 'Esta es una guía basada en la lista del condado, no una decisión oficial. El condado decide según sus planos exactos.',
      source: ['DPS, A Guide to Building Permits and Home Improvements', ', 2024 (en inglés)'],
    },
    tax: {
      tag: 'Su factura de impuestos', answer: ['Su factura de impuestos a la propiedad pudo subir aunque la tasa ', 'no cambió', '.'],
      sub: 'Este año el condado eliminó el crédito de $692 llamado Income Tax Offset Credit, y el aumento de los avalúos subió muchas facturas.',
      todo: ['Revise qué otros créditos fiscales puede pedir. Algunos requieren una solicitud nueva cada año: una vence el 1 de octubre y otra el 1 de abril.', ['Pregunte por los créditos a través de ', 'MC311', ' o llamando al 311.']],
      why: 'usted dijo que tiene casa propia.', source: ['Montgomery Community Media', ', julio de 2026 (en inglés)'],
    },
    rent: {
      tag: 'Su alquiler', answer: ['Si su edificio se construyó en 2003 o antes, los aumentos de alquiler desde el 1 de julio de 2026 tienen un tope de ', '5.2%', '.'],
      sub: 'Los edificios en la lista del condado de propiedades con problemas o en riesgo no pueden subir el alquiler hasta que salgan de esa lista.',
      todo: ['Revise la antigüedad de su edificio y la fecha en que empieza el aumento.', ['Si un aumento le parece demasiado alto, pida la Oficina de Asuntos entre Propietarios e Inquilinos (Office of Landlord-Tenant Affairs) a través de ', 'MC311', ' o del 311.']],
      why: 'usted dijo que alquila su vivienda.', source: ['Reglas de estabilización de alquileres del condado, julio de 2026'],
    },
    biz: {
      tag: 'Cerca de su negocio', answer: (area, n) => [`En ${area} hubo `, `${n} inspecciones y solicitudes de licencia de licor`, ' en los últimos 30 días.'],
      failed: (n) => `${n} fueron inspecciones reprobadas o cierres.`, none: 'Ninguna fue una inspección reprobada.',
      todo: [['Siga las nuevas solicitudes de licencia de licor y las inspecciones cerca de usted en ', 'Neighborhood Alerts', '.']], why: 'usted dijo que tiene un pequeño negocio.',
    },
    near: {
      tag: 'Cerca de usted esta semana', answer: (n, area) => ['', `${n} cambios`, ` cerca de ${area} en los últimos 7 días.`],
      todo: [['Vea todos los cambios y vigile su zona en ', 'Neighborhood Alerts', '.']], why: (area) => `usted vive en ${area}.`,
    },
    fix: {
      tag: 'Qué tan rápido se arregla aquí', answer: (area, c) => [`Reparar un bache en ${area} tarda unos `, null, `, frente a ${c} en el condado.`],
      todo: [['Compare todas las zonas y tipos de solicitud en el ', 'Fairness Check', '.']], why: (area) => `usted vive en ${area}.`,
    },
  },
};
// Sample event titles and types, translated
const EVENT_ES = {
  'Code violation cited at a house': 'Infracción de código en una casa', 'Code violation cited at an apartment building': 'Infracción de código en un edificio de apartamentos',
  'Code violation closed at an apartment building': 'Infracción cerrada en un edificio de apartamentos', 'Demolition permit filed for a garage': 'Solicitud de permiso para demoler un garaje',
  'Demolition permit filed for a house': 'Solicitud de permiso para demoler una casa', 'Food store passed inspection': 'Tienda de alimentos aprobó la inspección',
  'Liquor license transfer requested': 'Pidieron transferir una licencia de licor', 'New liquor license application for a restaurant': 'Nueva solicitud de licencia de licor para un restaurante',
  'Permit filed for a new deck': 'Solicitud de permiso para una terraza nueva', 'Permit filed for a new single-family home': 'Solicitud de permiso para una casa unifamiliar nueva',
  'Permit filed for an accessory apartment': 'Solicitud de permiso para un apartamento accesorio', 'Permit filed for an addition': 'Solicitud de permiso para una ampliación',
  'Permit issued for a kitchen remodel': 'Permiso emitido para remodelar una cocina', 'Permit issued for solar panels': 'Permiso emitido para paneles solares',
  'Restaurant closed by inspectors until fixed': 'Inspectores cerraron un restaurante hasta que corrija fallas', 'Restaurant failed inspection: critical violations': 'Restaurante reprobó la inspección: infracciones graves',
  'Restaurant passed inspection': 'Restaurante aprobó la inspección',
};
const eventTitle = (e) => (lang === 'es' ? EVENT_ES[e.title] || e.title : e.title);
const blockText = (b) => (lang === 'es' ? b.replace(/^(\d+) block of /, 'cuadra $1 de ') : b);

// The county's permit list (DPS guide, 2024) in both languages. Claude only picks ids; every answer comes from here.
const PERMIT_ITEMS = {
  accessory_structure: { en: ['Accessory structure, like a gazebo or carport', ''], es: ['Estructura accesoria, como una glorieta o cochera', ''] },
  addition: { en: ['Addition', ''], es: ['Ampliación', ''] },
  deck: { en: ['Deck', 'Needed for every deck, whatever its height. Lighting, outlets or a hot tub can also need an electrical permit.'], es: ['Terraza (deck)', 'Se necesita para toda terraza, sin importar la altura. La iluminación, los enchufes o un jacuzzi pueden requerir además un permiso eléctrico.'] },
  driveway_apron: { en: ['Driveway apron, where the driveway meets the street', ''], es: ['Entrada de la calle a la cochera (apron)', ''] },
  electrical: { en: ['Electrical work', 'Repairing or replacing an outlet in the same spot usually doesn’t need one.'], es: ['Trabajo eléctrico', 'Reparar o cambiar un enchufe en el mismo lugar normalmente no lo necesita.'] },
  historic_exterior: { en: ['Exterior work on a historic property', ''], es: ['Trabajo exterior en una propiedad histórica', ''] },
  fence: { en: ['New fence', 'Not needed if you’re replacing a fence that had a permit, in the same spot, at the same height.'], es: ['Cerca nueva', 'No se necesita si reemplaza una cerca que tuvo permiso, en el mismo lugar y a la misma altura.'] },
  garage: { en: ['Garage', ''], es: ['Garaje', ''] },
  hot_tub: { en: ['Hot tub', ''], es: ['Jacuzzi', ''] },
  hvac: { en: ['Replacing your heating system', ''], es: ['Cambiar el sistema de calefacción', ''] },
  interior_alteration: { en: ['Interior alteration, like moving walls or a major remodel', 'Cabinets, flooring and painting on their own don’t need one.'], es: ['Cambios interiores, como mover paredes o una remodelación grande', 'Los gabinetes, los pisos y la pintura por sí solos no lo necesitan.'] },
  land_disturbance: { en: ['Moving a lot of earth', 'Needed above 5,000 square feet disturbed or 100 cubic yards of earth moved.'], es: ['Mover mucha tierra', 'Se necesita si se alteran más de 5,000 pies cuadrados o se mueven 100 yardas cúbicas de tierra.'] },
  plumbing: { en: ['Plumbing', 'Plumbing permits come from WSSC Water, not the county.'], es: ['Plomería', 'Los permisos de plomería los da WSSC Water, no el condado.'] },
  retaining_wall: { en: ['Retaining wall', 'Walls 48 inches or shorter, from the bottom of the footing to the top, usually don’t need one unless they hold back extra weight.'], es: ['Muro de contención', 'Los muros de 48 pulgadas o menos, desde la base de la zapata hasta arriba, normalmente no lo necesitan, salvo que sostengan peso adicional.'] },
  septic: { en: ['Septic system', ''], es: ['Sistema séptico', ''] },
  shed: { en: ['Shed', 'Needed for any shed, any size, including moving one.'], es: ['Cobertizo', 'Se necesita para cualquier cobertizo, de cualquier tamaño, incluso para moverlo.'] },
  signs: { en: ['Sign', ''], es: ['Letrero', ''] },
  pool: { en: ['Swimming pool', 'Prefabricated pools less than 18 inches deep don’t need one.'], es: ['Piscina', 'Las piscinas prefabricadas de menos de 18 pulgadas de profundidad no lo necesitan.'] },
  well: { en: ['Well', ''], es: ['Pozo', ''] },
};
const NO_PERMIT_ITEMS = {
  caulking: { en: 'Bathroom caulking', es: 'Sellar con silicona en el baño' }, cabinets: { en: 'Installing, repairing or replacing cabinets', es: 'Instalar, reparar o cambiar gabinetes' },
  driveway_on_property: { en: 'A driveway on your own property', es: 'Una entrada para autos dentro de su propiedad' }, outlets_same: { en: 'Repairing or replacing outlets in the same spot', es: 'Reparar o cambiar enchufes en el mismo lugar' },
  fence_same: { en: 'Repairing or replacing a permitted fence in the same spot and height', es: 'Reparar o cambiar una cerca con permiso en el mismo lugar y altura' },
  flooring: { en: 'Floor coverings', es: 'Pisos y alfombras' }, gutters: { en: 'Gutters and downspouts', es: 'Canaletas y bajantes' }, patio: { en: 'Patios', es: 'Patios' },
  small_pool: { en: 'Prefabricated pools less than 18 inches deep', es: 'Piscinas prefabricadas de menos de 18 pulgadas de profundidad' }, walkway: { en: 'Private walkways', es: 'Senderos privados' },
  low_wall: { en: 'Retaining walls 48 inches or shorter', es: 'Muros de contención de 48 pulgadas o menos' }, awning: { en: 'Retractable awnings and canopies', es: 'Toldos retráctiles' },
  roof_covering: { en: 'Roof covering only', es: 'Solo la cubierta del techo' }, siding: { en: 'Siding', es: 'Revestimiento exterior (siding)' },
  storm_windows: { en: 'Storm windows replaced in kind', es: 'Contraventanas cambiadas por otras iguales' }, play: { en: 'Swings, playhouses, treehouses and similar', es: 'Columpios, casitas de juego, casas en árboles y similares' },
  walls_paint: { en: 'Repairing or painting walls', es: 'Reparar o pintar paredes' }, windows_doors: { en: 'Windows and doors that keep the same opening size', es: 'Ventanas y puertas del mismo tamaño de abertura' },
  screens: { en: 'Window screens', es: 'Mosquiteros de ventana' },
};
const PROJECT_DEFAULTS = { 'Deck or porch': ['deck'], 'Addition': ['addition'], 'Remodel': ['interior_alteration'], 'Shed or garage': ['shed', 'garage'], 'Pool': ['pool', 'hot_tub'], 'Accessory apartment': ['interior_alteration', 'electrical', 'plumbing'] };
const KEYWORDS = [
  [/deck|porch|terraza|porche/, 'deck'], [/(repair(ing)?|replac\w*|fix\w*) (the |my |a )?(old )?fence|same fence|(reparar|cambiar) (la )?(misma )?(cerca|valla)/, 'fence_same'], [/fence|cerca|valla/, 'fence'], [/shed|cobertizo/, 'shed'], [/garage|carport|garaje|cochera/, 'garage'],
  [/gazebo|pergola|glorieta|pérgola|accessory structure/, 'accessory_structure'], [/hot ?tub|spa\b|jacuzzi/, 'hot_tub'], [/pool|piscina|alberca/, 'pool'], [/addition|add (a|an) (room|bedroom|bathroom)|expand|ampliaci/, 'addition'],
  [/remodel|renovat|move (a )?wall|knock (down|out)|basement|sótano|mover (una )?pared/, 'interior_alteration'], [/wiring|electric|panel|new outlet|ev charger|cableado|eléctric/, 'electrical'],
  [/furnace|heat pump|hvac|heating|air condition|calefacc|calentador de aire|aire acondicionado/, 'hvac'], [/plumb|water heater|toilet|sink|pipe|plomer|tuber|inodoro|lavabo/, 'plumbing'], [/retaining wall|muro de contenci/, 'retaining_wall'],
  [/apron|curb cut/, 'driveway_apron'], [/driveway|entrada para (autos|carros)/, 'driveway_on_property'], [/patio|pavers|adoquin/, 'patio'], [/paint|wallpaper|pintar|pintura|empapel/, 'walls_paint'],
  [/floor|carpet|tile|hardwood|piso|alfombra|baldosa/, 'flooring'], [/roof|shingle|techo|tejas/, 'roof_covering'], [/siding|revestimiento/, 'siding'], [/gutter|downspout|canaleta|bajante/, 'gutters'],
  [/cabinet|gabinete/, 'cabinets'], [/caulk|silicona/, 'caulking'], [/window|door|ventana|puerta/, 'windows_doors'], [/screen|mosquitero/, 'screens'], [/treehouse|playhouse|swing set|playset|columpio|casita/, 'play'],
  [/awning|canopy|toldo/, 'awning'], [/walkway|path\b|sendero|caminito/, 'walkway'], [/sign\b|letrero/, 'signs'], [/grading|excavat|dig|excavar|nivelar/, 'land_disturbance'], [/septic|séptico/, 'septic'], [/\bwell\b|\bpozo\b/, 'well'], [/historic|históric/, 'historic_exterior'],
];
const WAIT_WORDS = [[/pothole|bache/, 'Pothole'], [/streetlight|street light|farol|alumbrado/, 'Streetlight out'], [/sidewalk|acera/, 'Sidewalk repair'], [/storm drain|drain|desagüe|alcantarill/, 'Storm drain clog'], [/abandoned (car|vehicle)|carro abandonado|auto abandonado/, 'Abandoned vehicle']];
const PROJECT_WORDS = [[/deck|porch|terraza|porche/, 'Deck or porch'], [/addition|ampliaci/, 'Addition'], [/remodel|renovat|kitchen|bathroom|cocina|baño/, 'Remodel'], [/shed|garage|cobertizo|garaje/, 'Shed or garage'], [/pool|piscina/, 'Pool'], [/accessory apartment|in-law|adu\b|apartamento accesorio/, 'Accessory apartment'], [/new home|build a house|casa nueva/, 'New home']];

// ---------- State and language
let lang = 'en';
let matched = null;
const areas = [...new Set(DATA.events.map((e) => e.area))].sort((a, b) => a.localeCompare(b));
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
const save = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* not saved: still works */ } };
const T = () => L[lang];
const n = (v) => Number(v).toLocaleString(T().locale);
const fmtMonth = () => new Intl.DateTimeFormat(T().locale, { month: 'long', year: 'numeric', timeZone: 'UTC' });
const fmtDay = () => new Intl.DateTimeFormat(T().locale, { month: 'short', day: 'numeric', timeZone: 'UTC' });

function fillSelect(sel, entries, value) {
  sel.replaceChildren(...entries.map(([v, label]) => new Option(label, v)));
  sel.value = value;
}
function drawRoleButtons() {
  const box = $('role-btns');
  box.replaceChildren(...Object.entries(T().roles).map(([v, label]) => {
    const b = el('button', 'choice', label); b.type = 'button'; b.dataset.role = v;
    b.setAttribute('aria-pressed', String($('q-role').value === v));
    b.addEventListener('click', () => { $('q-role').value = v; render(true); });
    return b;
  }));
}
function applyLanguage() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((node) => { const v = T()[node.dataset.i18n]; if (typeof v === 'string') node.textContent = v; });
  $('ask-text').placeholder = T().ask_placeholder;
  $('q-address').placeholder = T().addr_ph;
  drawRoleButtons();
  if (addr) applyAddress($('q-address').value, true);
  $('draft').hidden = lang !== 'es';
  document.querySelectorAll('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  const cur = { area: $('q-area').value || answers.area, role: $('q-role').value || answers.role, project: $('q-project').value, wait: $('q-wait').value };
  fillSelect($('q-area'), areas.map((a) => [a, a]), cur.area);
  fillSelect($('q-role'), Object.entries(T().roles), cur.role || 'homeowner');
  fillSelect($('q-project'), Object.entries(T().projectsShort), cur.project || '');
  fillSelect($('q-wait'), Object.entries(T().waitsShort), cur.wait || '');
  if (!$('understood').hidden && lastSort) showUnderstood(lastSort.r, lastSort.how);
}

// ---------- Card builders: the answer first, then what to do, then why and where it came from
const el = (tag, cls, text) => { const x = document.createElement(tag); if (cls) x.className = cls; if (text !== undefined) x.textContent = text; return x; };
const link = (href, text) => { const a = el('a', '', text); a.href = href; if (/^https?:/.test(href)) { a.target = '_blank'; a.rel = 'noopener'; } return a; };
const LINK_FOR = { MC311: LINKS.mc311, 'Permit Clock': LINKS.permit, 'Fairness Check': LINKS.fair, 'Neighborhood Alerts': LINKS.alerts };
const rich = (parts, href) => parts.map((p, i) => (i === 1 && Array.isArray(parts) && parts.length === 3 ? link(href || LINK_FOR[p] || LINKS.mc311, p) : p));
const answerLine = (parts, num, bad) => {
  const p = el('h3', 'answer');
  parts.forEach((part, i) => { if (i === 1) p.append(el('span', 'num' + (bad ? ' is-bad' : ''), part === null ? num : part)); else if (part) p.append(part); });
  return p;
};
const todo = (items, hrefs) => {
  const ul = el('ul', 'todo');
  items.forEach((it, i) => { const li = el('li'); li.append(...(Array.isArray(it) ? rich(it, hrefs && hrefs[i]) : [it])); ul.append(li); });
  return ul;
};
const ICONS = {
  tree: '<path d="M12 22v-5"/><path d="M12 2l5.5 7H14l4.5 6h-13L10 9H6.5z"/>',
  request: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  check: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9z"/><path d="M8.5 13.5l2.5 2.5 4.5-5"/>',
  permit: '<path d="M3 21h18"/><path d="M5 21V9l7-5 7 5v12"/><path d="M10 21v-6h4v6"/>',
  tax: '<path d="M6 2.5h12v19l-3-2-3 2-3-2-3 2z"/><path d="M9 7.5h6M9 11h6M9 14.5h3.5"/>',
  rent: '<circle cx="8" cy="15" r="4.5"/><path d="M11.2 11.8L20 3M16.5 6.5l3 3"/>',
  biz: '<path d="M3.5 9L5.5 4h13l2 5"/><path d="M4.5 9v11h15V9"/><path d="M9.5 20v-5.5h5V20"/>',
  near: '<path d="M12 21.5s-7-6.2-7-11.5a7 7 0 1 1 14 0c0 5.3-7 11.5-7 11.5z"/><circle cx="12" cy="10" r="2.6"/>',
  fix: '<path d="M14.8 6.2a4.2 4.2 0 0 0-5.6 5.6L3 18l3 3 6.2-6.2a4.2 4.2 0 0 0 5.6-5.6l-2.6 2.6-2.5-.6-.6-2.5z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>',
};
const icon = (name) => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true'); s.innerHTML = ICONS[name]; return s; };
const commentsReady = (async () => { try { return window.claude ? await window.claude.use('comments') : null; } catch (e) { return null; } })();
function feedbackRow(cardEl) {
  const row = el('div', 'feedback');
  const yes = el('button', '', T().yes), no = el('button', '', T().no);
  yes.type = no.type = 'button';
  row.append(el('span', '', T().useful), yes, no);
  yes.addEventListener('click', () => { row.replaceChildren(el('span', '', T().thanks)); });
  no.addEventListener('click', async () => {
    const comments = await commentsReady;
    row.replaceChildren(el('span', '', T().missing));
    if (!comments) return;
    const note = el('button', '', T().note_btn); note.type = 'button';
    note.addEventListener('click', async () => {
      try { await comments.openComposer({ element: cardEl }); } catch (e) { row.replaceChildren(el('span', '', T().note_off)); }
    });
    row.append(note);
  });
  return row;
}
const card = ({ kind, fig, real, answer, sub, visual, actions, why, details, source, cta }) => {
  const c = el('article', 'item');
  c.dataset.kind = kind;
  const f = el('div', 'fig');
  if (fig) { f.append(el('span', 'fig-num', fig.v)); if (fig.u) f.append(el('span', 'fig-unit', fig.u)); }
  const b = el('div', 'item-body');
  b.append(answer);
  if (sub) b.append(el('p', 'sub', sub));
  if (visual) b.append(visual);
  if (actions) b.append(actions);
  if (cta) { const a = link(cta[0], cta[1]); a.className = 'btn-cta'; b.append(a); }
  if (details) { const d = el('details'); d.append(el('summary', '', T().details), ...details); b.append(d); }
  const meta = el('p', 'meta');
  if (source) meta.append(T().source, ...source, '. ');
  else if (!real) meta.append((DATA.kind === 'county' ? T().county_note : T().sample_note) + ' ');
  if (why) meta.append(T().why + why);
  b.append(meta);
  c.append(f, b);
  return c;
};
const rangeBar = (lo, mid, hi) => {
  const max = hi * 1.1, box = el('div', 'range'), track = el('div', 'range-track');
  const span = el('div', 'range-span'); span.style.left = (lo / max * 100) + '%'; span.style.width = ((hi - lo) / max * 100) + '%';
  const dot = el('div', 'range-dot'); dot.style.left = (mid / max * 100) + '%';
  track.append(span, dot);
  const labels = el('div', 'range-labels');
  labels.append(...T().permit.range(n(lo), n(mid), n(hi)).map((x) => el('span', '', x)));
  box.append(track, labels);
  box.setAttribute('role', 'img'); box.setAttribute('aria-label', T().permit.rangeAria(lo, mid, hi));
  return box;
};
const compareBars = (rows) => {
  const box = el('div', 'compare'), max = Math.max(...rows.map((r) => r.v)) || 1;
  for (const r of rows) {
    const row = el('div', 'compare-row' + (r.county ? ' is-county' : ''));
    const bar = el('div', 'compare-bar'); bar.style.width = Math.max(4, r.v / max * 100) + '%';
    const holder = el('div'); holder.append(bar);
    row.append(el('span', '', r.label), holder, el('span', '', T().days(n(r.v))));
    box.append(row);
  }
  return box;
};
function timeline() {
  const [a, b, c] = T().tl;
  const box = el('ol', 'timeline');
  const from = fmtMonth().format(addMonths(TODAY, 15)), to = fmtMonth().format(addMonths(TODAY, 18));
  [[a, fmtDay().format(TODAY)], [b, ''], [c, `${from} – ${to}`]].forEach(([label, when], i) => {
    const li = el('li', i === 0 ? 'is-now' : i === 2 ? 'is-goal' : '');
    li.append(el('span', 'tl-dot'), el('strong', '', label));
    if (when) li.append(el('small', '', when));
    box.append(li);
  });
  return box;
}
const TODAY = new Date();
const addMonths = (d, m) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + m, 1));

function treeCard() {
  const x = T().tree;
  return card({
    kind: 'tree', cta: [LINKS.forms, T().cta_tree], fig: { v: '15–18', u: T().unit_months }, real: true, answer: answerLine(x.answer),
    visual: timeline(),
    sub: x.sub(fmtMonth().format(addMonths(TODAY, 15)), fmtMonth().format(addMonths(TODAY, 18))),
    actions: todo(x.todo, [LINKS.forms]), why: x.why, details: [el('p', '', x.detail)],
    source: [link(LINKS.tree, x.source[0]), x.source[1]],
  });
}
function requestCard(cat, area) {
  const x = T().req, mine = DATA.requests[`${cat}|${area}`], county = DATA.requests[`${cat}|All`];
  const r = mine || county, label = T().waitNames[cat];
  const slower = mine && county && mine.p50 > county.p50 * 1.15, faster = mine && county && mine.p50 < county.p50 * 0.87;
  const word = x.words[slower ? 'slower' : faster ? 'faster' : 'same'];
  return card({
    kind: 'request', cta: [LINKS.mc311, T().cta_req], fig: { v: n(r.p50), u: T().unit_days }, real: false,
    answer: answerLine(x.answer(label, mine ? x.inArea(area) : x.county), T().days(n(r.p50)), slower),
    sub: mine && county ? x.compare(word, n(county.p50), n(r.p90)) : x.only90(n(r.p90)),
    visual: mine && county ? compareBars([{ label: area, v: mine.p50 }, { label: x.countyLabel, v: county.p50, county: true }]) : null,
    actions: todo(x.todo(n(r.p90))), why: x.why(label),
    details: [el('p', '', x.d1), (() => { const p = el('p', '', x.d2(n(r.n))); p.append(link(LINKS.fair, 'Fairness Check'), '.'); return p; })()],
  });
}
function permitCard(type, area) {
  const x = T().permit, mine = DATA.permits[`${type}|${area}`], county = DATA.permits[`${type}|All`];
  const r = mine || county;
  if (!r) return null;
  const name = T().projectNames[type];
  return card({
    kind: 'permit', cta: [LINKS.permit, T().cta_permit], fig: { v: n(r.p50), u: T().unit_days }, real: false,
    answer: answerLine(x.answer(name, mine ? T().req.inArea(area) : T().req.county), T().days(n(r.p50))),
    sub: x.sub(Math.round(r.same_day * 100)), visual: rangeBar(r.p25, r.p50, r.p90),
    actions: todo(x.todo(Math.ceil(r.p90 / 7))), why: x.why(name),
    details: [el('p', '', x.d1), el('p', '', mine ? x.d2(n(r.n), area) : x.d3(n(r.n), area))],
  });
}
function permitCheckCard(project) {
  const x = T().check;
  const permit = matched ? matched.permit : (PROJECT_DEFAULTS[project] || []);
  const none = matched ? matched.none : [];
  if (!permit.length && !none.length) return null;
  const list = el('ul', 'verdicts');
  for (const id of permit) { const [label, note] = PERMIT_ITEMS[id][lang]; const li = el('li'), body = el('div'); body.append(el('strong', '', label)); if (note) body.append(el('small', '', note)); li.append(el('span', 'verdict is-yes', x.yes), body); list.append(li); }
  for (const id of none) { const li = el('li'), body = el('div'); body.append(el('strong', '', NO_PERMIT_ITEMS[id][lang])); li.append(el('span', 'verdict is-no', x.no), body); list.append(li); }
  return card({
    kind: 'check', cta: [LINKS.permitGuide, T().cta_check], fig: { v: n(permit.length), u: T().fig_permits(n(permit.length)) }, real: true, answer: answerLine(permit.length ? x.answerSome(permit.length === 1) : x.answerNone),
    visual: list, actions: todo(x.todo),
    why: matched ? x.whyText : x.whyProject(T().projects[project]),
    details: [el('p', '', x.detail)], source: [link(LINKS.permitGuide, x.source[0]), x.source[1]],
  });
}
function roleCard(role, area) {
  if (role === 'homeowner' || role === 'renter') {
    const x = role === 'homeowner' ? T().tax : T().rent;
    return card({ kind: role === 'homeowner' ? 'tax' : 'rent', cta: [LINKS.mc311, role === 'homeowner' ? T().cta_tax : T().cta_rent], fig: role === 'homeowner' ? { v: '$692', u: T().fig_credit } : { v: '5.2%', u: T().fig_cap }, real: true, answer: answerLine(x.answer), sub: x.sub, actions: todo(x.todo), why: x.why,
      source: role === 'homeowner' ? [link(LINKS.tax, x.source[0]), x.source[1]] : [x.source[0]] });
  }
  const x = T().biz;
  const recent = DATA.events.filter((e) => e.area === area && (e.type === 'Restaurant inspection' || e.type === 'Liquor license') && new Date(e.date + 'T00:00:00Z') > new Date(AS_OF.getTime() - 30 * 864e5));
  const failed = recent.filter((e) => e.level === 'bad').length;
  return card({ kind: 'biz', cta: [LINKS.alerts, T().cta_biz], fig: { v: n(recent.length), u: T().fig_inspections }, real: false, answer: answerLine(x.answer(area, n(recent.length))), sub: failed ? x.failed(n(failed)) : x.none, actions: todo(x.todo), why: x.why });
}
function nearCard(area) {
  const x = T().near;
  const week = DATA.events.filter((e) => e.area === area && new Date(e.date + 'T00:00:00Z') > new Date(AS_OF.getTime() - 7 * 864e5));
  const onStreet = addr && addr.street && addr.area === area ? streetMatches(addr, week) : null;
  const pool = onStreet && onStreet.near.length ? [...onStreet.near, ...week.filter((e) => !onStreet.near.includes(e))] : week;
  const top = [...pool.filter((e) => e.level === 'bad'), ...pool.filter((e) => e.level === 'notice'), ...pool.filter((e) => e.level === 'info')].slice(0, 3);
  if (onStreet) {
    const list = el('ul', 'items');
    for (const e of (onStreet.near.length ? onStreet.near.slice(0, 3) : top)) { const li = el('li', e.level === 'bad' ? 'is-bad' : ''); li.append(eventTitle(e), el('small', '', `${blockText(e.block)}, ${fmtDay().format(new Date(e.date + 'T00:00:00Z'))}`)); list.append(li); }
    const cnt = n(onStreet.near.length ? onStreet.near.length : week.length);
    return card({ kind: 'near', cta: [LINKS.alerts, T().cta_near], fig: { v: cnt, u: T().fig_changes(cnt) }, real: false,
      answer: onStreet.near.length ? answerLine(T().near_street_answer(n(onStreet.near.length), onStreet.label)) : answerLine(x.answer(n(week.length), area)),
      sub: onStreet.near.length ? T().near_street_sub(n(week.length), area) : T().near_street_none(onStreet.label),
      visual: list, actions: todo(x.todo), why: x.why(area) });
  }
  const list = el('ul', 'items');
  for (const e of top) { const li = el('li', e.level === 'bad' ? 'is-bad' : ''); li.append(eventTitle(e), el('small', '', `${blockText(e.block)}, ${fmtDay().format(new Date(e.date + 'T00:00:00Z'))}`)); list.append(li); }
  return card({ kind: 'near', cta: [LINKS.alerts, T().cta_near], fig: { v: n(week.length), u: T().fig_changes(n(week.length)) }, real: false, answer: answerLine(x.answer(n(week.length), area)), visual: top.length ? list : null, actions: todo(x.todo), why: x.why(area) });
}
function fixCard(area) {
  const x = T().fix, mine = DATA.requests[`Pothole|${area}`], county = DATA.requests['Pothole|All'];
  if (!mine || !county) return null;
  return card({ kind: 'fix', cta: [LINKS.fair, T().cta_fix], fig: { v: n(mine.p50), u: T().unit_days }, real: false, answer: answerLine(x.answer(area, T().days(n(county.p50))), T().days(n(mine.p50)), mine.p50 > county.p50 * 1.15),
    visual: compareBars([{ label: area, v: mine.p50 }, { label: T().req.countyLabel, v: county.p50, county: true }]), actions: todo(x.todo), why: x.why(area) });
}

// ---------- Free text: Claude sorts words into the county's ids; keywords as the fallback
function keywordSort(text) {
  const t = text.toLowerCase(), permit = new Set(), none = new Set();
  for (const [re, id] of KEYWORDS) if (re.test(t)) (PERMIT_ITEMS[id] ? permit : none).add(id);
  if (none.has('fence_same')) permit.delete('fence');
  if (permit.has('retaining_wall') && /(short|low|small|under 4|3 ?(ft|feet)|bajo|pequeño)/.test(t)) { permit.delete('retaining_wall'); none.add('low_wall'); }
  const find = (pairs) => (pairs.find(([re]) => re.test(t)) || [])[1] || null;
  const tree = /county tree|street tree|tree (out front|in front)|tree.*(sidewalk|curb)|árbol del condado|árbol (de la calle|frente)|árbol.*acera/.test(t);
  return { permit: [...permit], none: [...none], project: find(PROJECT_WORDS), wait: tree ? 'tree' : find(WAIT_WORDS),
    role: /\brent(ing|er)?\b|landlord|alquil|inquilin|arrend/.test(t) ? 'renter' : /my (shop|store|restaurant|business)|mi (tienda|negocio|restaurante)/.test(t) ? 'business' : null,
    area: areas.find((a) => t.includes(a.toLowerCase())) || null };
}
const sampleReady = (async () => { try { return window.claude ? await window.claude.use('sample') : null; } catch (e) { return null; } })();
async function claudeSort(text) {
  const sample = await sampleReady;
  if (!sample) return null;
  const list = (o, f) => Object.entries(o).map(([k, v]) => `${k}: ${f(v)}`).join('\n');
  const prompt = `Sort a Montgomery County, Maryland resident's description into fixed ids. The description may be in English or Spanish. Use only ids listed below; leave out anything not mentioned. Answer with JSON only, shaped:
{"permit_items":[...],"no_permit_items":[...],"project":id or null,"wait":id or null,"role":id or null,"area":name or null}

PERMIT ids (work that usually needs a county permit):
${list(PERMIT_ITEMS, (v) => v.en[0])}

NO-PERMIT ids (work that usually doesn't):
${list(NO_PERMIT_ITEMS, (v) => v.en)}

If they replace or repair an existing permitted fence in the same place and height, use fence_same, not fence. A retaining wall 48 inches or shorter is low_wall.
project ids: ${Object.keys(L.en.projects).filter(Boolean).join(', ')}
wait ids (something they already reported to the county): tree (a county street tree), Pothole, Streetlight out, Sidewalk repair, Storm drain clog, Tree down or hazard, Abandoned vehicle
role ids: homeowner, renter, business
area names: ${areas.join(', ')}

Description:
"""${text.slice(0, 1200)}"""`;
  const out = await sample.json(prompt, { modelTier: 'quick' });
  const ok = (arr, dict) => (Array.isArray(arr) ? arr.filter((id) => dict[id]) : []);
  const pick = (v, allowed) => (allowed.includes(v) ? v : null);
  return { permit: ok(out.permit_items, PERMIT_ITEMS), none: ok(out.no_permit_items, NO_PERMIT_ITEMS),
    project: pick(out.project, Object.keys(L.en.projects).filter(Boolean)), wait: pick(out.wait, Object.keys(L.en.waits).filter(Boolean)),
    role: pick(out.role, ['homeowner', 'renter', 'business']), area: pick(out.area, areas) };
}
let lastSort = null;
function showUnderstood(r, how) {
  const chips = [...r.permit.map((id) => PERMIT_ITEMS[id][lang][0]), ...r.none.map((id) => NO_PERMIT_ITEMS[id][lang])];
  if (r.wait) chips.push(T().waits[r.wait]);
  $('understood').replaceChildren(el('span', '', T()[how]), ...(chips.length ? chips.map((c) => el('span', 'chip', c)) : [el('span', '', T().understood_none)]));
}
function applySort(r, how) {
  matched = { permit: r.permit, none: r.none };
  lastSort = { r, how };
  if (r.area) $('q-area').value = r.area;
  if (r.role) $('q-role').value = r.role;
  if (r.project) $('q-project').value = r.project;
  if (r.wait) $('q-wait').value = r.wait;
  showUnderstood(r, how);
  $('understood').hidden = false;
  $('ask-clear').hidden = false;
  render(true);
  $('brief-title').focus();
  $('brief-title').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

// ---------- Address: read on this device only. ZIP or town picks the area; street and number find nearby changes.
const ABBR = { avenue: 'ave', road: 'rd', street: 'st', boulevard: 'blvd', drive: 'dr', lane: 'ln', court: 'ct', place: 'pl', parkway: 'pkwy', terrace: 'ter', circle: 'cir', highway: 'hwy', way: 'way', pike: 'pike' };
const normStreet = (x) => (x || '').toLowerCase().replace(/[.#]/g, '').replace(/\b(north|south|east|west)\b/g, (m) => m[0]).split(/\s+/).filter(Boolean).map((w) => ABBR[w] || w).join(' ');
const ZIP_AREA = (() => { const tally = new Map(); for (const e of DATA.events) { const k = e.zip + '|' + e.area; tally.set(k, (tally.get(k) || 0) + 1); } const best = new Map(); for (const [k, c] of tally) { const [z, a] = k.split('|'); if (!best.has(z) || best.get(z).c < c) best.set(z, { a, c }); } return new Map([...best].map(([z, v]) => [z, v.a])); })();
function parseAddress(text) {
  const t = (text || '').trim();
  if (!t) return null;
  const zip = (t.match(/\b(2[01]\d{3})(?:-\d{4})?\b/) || [])[1] || null;
  const num = Number((t.match(/^\s*(\d{1,6})[a-z]?\b/i) || [])[1]) || null;
  const lower = t.toLowerCase();
  const town = [...areas].sort((a, b) => b.length - a.length).find((a) => lower.includes(a.toLowerCase())) || null;
  let streetRaw = t.replace(/^\s*\d{1,6}[a-z]?\s+/i, '').split(',')[0];
  if (town) streetRaw = streetRaw.replace(new RegExp('\\s+' + town + '.*$', 'i'), '');
  streetRaw = streetRaw.replace(/\b(apt|unit|suite|ste)\b.*$/i, '').replace(/\b2[01]\d{3}\b.*$/, '').replace(/\bmd\b.*$/i, '').trim();
  const street = num && streetRaw ? normStreet(streetRaw) : null;
  return { num, street, zip, area: town || (zip && ZIP_AREA.get(zip)) || null, streetRaw };
}
const blockOf = (e) => { const m = e.block.match(/^(\d+) block of (.+)$/); return m ? { num: Number(m[1]), street: normStreet(m[2]), label: m[2] } : null; };
function streetMatches(addr, list) {
  if (!addr || !addr.street) return { near: [], label: null };
  const mine = Math.floor(addr.num / 100) * 100;
  let label = null;
  const near = list.filter((e) => { const b = blockOf(e); if (!b || b.street !== addr.street || Math.abs(b.num - mine) > 500) return false; label = label || b.label; return true; });
  return { near, label: label || addr.streetRaw.replace(/\b\w/g, (c) => c.toUpperCase()) };
}
let addr = null;
function applyAddress(text, quiet) {
  addr = parseAddress(text);
  const status = $('addr-status');
  if (!addr) { status.textContent = ''; return; }
  if (addr.area) { $('q-area').value = addr.area; status.textContent = T().addr_ok(addr.area, addr.zip, addr.street ? streetMatches(addr, DATA.events).label : null); status.classList.remove('is-warn'); }
  else { status.textContent = T().addr_none; status.classList.add('is-warn'); }
  if (!quiet) render(true);
}

// ---------- Masthead, glance strip and email preview
function glanceItems(a) {
  const x = T(), items = [];
  if (a.wait === 'tree') items.push({ v: '15–18', u: x.unit_months, l: x.glance_tree, real: true, kind: 'tree' });
  else if (a.wait) { const r = DATA.requests[`${a.wait}|${a.area}`] || DATA.requests[`${a.wait}|All`]; if (r) items.push({ v: n(r.p50), u: x.unit_days, l: x.glance_req(x.waitNames[a.wait]), real: false, kind: 'request' }); }
  if (a.project) { const r = DATA.permits[`${a.project}|${a.area}`] || DATA.permits[`${a.project}|All`]; if (r) items.push({ v: n(r.p50), u: x.unit_days, l: x.glance_permit, real: false, kind: 'permit' }); }
  if (a.role === 'renter') items.push({ v: '5.2%', u: '', l: x.glance_rent, real: true, kind: 'rent' });
  const week = DATA.events.filter((e) => e.area === a.area && new Date(e.date + 'T00:00:00Z') > new Date(AS_OF.getTime() - 7 * 864e5)).length;
  const weekList = DATA.events.filter((e) => e.area === a.area && new Date(e.date + 'T00:00:00Z') > new Date(AS_OF.getTime() - 7 * 864e5));
  const st = addr && addr.street && addr.area === a.area ? streetMatches(addr, weekList) : null;
  items.push(st ? { v: n(st.near.length), u: '', l: x.glance_street(n(st.near.length)), real: false, kind: 'near' } : { v: n(week), u: '', l: x.glance_near(n(week)), real: false, kind: 'near' });
  const fix = DATA.requests[`Pothole|${a.area}`];
  if (fix) items.push({ v: n(fix.p50), u: x.unit_days, l: x.glance_fix, real: false, kind: 'fix' });
  return items.slice(0, 3);
}
function renderMasthead(a) {
  const st = addr && addr.street && addr.area === a.area ? streetMatches(addr, DATA.events).label : null;
  const blk = st && addr.num ? String(Math.floor(addr.num / 100) * 100) : '';
  $('sign-name').textContent = st || a.area;
  $('sign-num').textContent = blk;
  $('sign-num').hidden = !blk;
  const date = new Intl.DateTimeFormat(T().locale, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
  $('place').textContent = T().place(st ? a.area : T().county_name, date);
  const upd = DATA.kind === 'county' && DATA.updated ? new Date(DATA.updated) : null;
  const stale = upd && Date.now() - upd.getTime() > 2 * 864e5;
  $('updated').textContent = upd ? (stale ? T().stale_line : T().updated_line)(new Intl.DateTimeFormat(T().locale, { weekday: 'long', month: 'long', day: 'numeric' }).format(upd)) : T().sample_line;
  $('updated').classList.toggle('is-stale', Boolean(stale));
}
function renderEmail(a, list) {
  const x = T(), box = $('email-card');
  const btn = el('button', 'link-btn', x.email_preview); btn.type = 'button'; btn.setAttribute('aria-expanded', 'false');
  const preview = el('div', 'email-preview'); preview.hidden = true;
  const ul = el('ul', 'email-lines');
  list.forEach((c) => { const t = c.querySelector('.answer'); if (t) ul.append(el('li', '', t.textContent)); });
  preview.append(el('p', 'email-subject', x.email_subject(a.area)), ul);
  btn.addEventListener('click', () => { preview.hidden = !preview.hidden; btn.textContent = preview.hidden ? x.email_preview : x.email_hide; btn.setAttribute('aria-expanded', String(!preview.hidden)); });
  box.replaceChildren(el('h2', '', x.email_title), el('p', 'sub', x.email_text), btn, preview);
}

// ---------- Render
function render(animate) {
  const a = { area: $('q-area').value, role: $('q-role').value, project: $('q-project').value, wait: $('q-wait').value, lang, address: $('q-address').value };
  save(a);
  const cards = [];
  if (a.wait === 'tree') cards.push(treeCard()); else if (a.wait) cards.push(requestCard(a.wait, a.area));
  cards.push(permitCheckCard(a.project));
  if (a.project) cards.push(permitCard(a.project, a.area));
  cards.push(roleCard(a.role, a.area), nearCard(a.area));
  if (a.wait !== 'Pothole') cards.push(fixCard(a.area));
  const list = cards.filter(Boolean), top = list.slice(0, 3), rest = list.slice(3);
  const box = $('cards');
  box.classList.remove('enter'); if (animate) { void box.offsetWidth; box.classList.add('enter'); }
  box.replaceChildren(...top);
  $('more-cards').replaceChildren(...rest);
  $('more-box').hidden = !rest.length;
  $('more-sum').textContent = T().more_sum(rest.length);
  $('brief-sum').textContent = T().brief_sum(list.length);
  $('live').textContent = T().live(list.length);
  renderMasthead(a);
  renderEmail(a, list);
  document.querySelectorAll('#role-btns .choice').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.role === a.role)));
  $('how').hidden = Boolean(addr && addr.area);
}

const answers = Object.assign({ area: 'Silver Spring', role: 'homeowner', project: '', wait: 'tree', lang: (navigator.language || '').startsWith('es') ? 'es' : 'en' }, load() || {});
lang = answers.lang === 'es' ? 'es' : 'en';
applyLanguage();
$('q-area').value = answers.area; $('q-role').value = answers.role; $('q-project').value = answers.project; $('q-wait').value = answers.wait;
if (answers.address) { $('q-address').value = answers.address; applyAddress(answers.address, true); }

let addrTimer = null;
$('q-address').addEventListener('input', () => { clearTimeout(addrTimer); addrTimer = setTimeout(() => applyAddress($('q-address').value), 450); });
$('q-area').addEventListener('change', () => { if (addr && addr.area && addr.area !== $('q-area').value) { addr = null; $('addr-status').textContent = ''; } });
$('situation').addEventListener('change', (ev) => { if (ev.target.id !== 'q-address') render(true); });
const smooth = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
$('addr-form').addEventListener('submit', (ev) => {
  ev.preventDefault();
  clearTimeout(addrTimer);
  applyAddress($('q-address').value);
  if (addr && addr.area) $('briefing').scrollIntoView({ behavior: smooth(), block: 'start' });
});
$('top-link').addEventListener('click', () => { window.scrollTo({ top: 0, behavior: smooth() }); $('q-address').focus({ preventScroll: true }); });
document.querySelectorAll('.lang button').forEach((b) => b.addEventListener('click', () => { lang = b.dataset.lang; applyLanguage(); render(false); }));
$('ask-go').addEventListener('click', async () => {
  const text = $('ask-text').value.trim();
  if (!text) { $('ask-status').textContent = T().ask_empty; return; }
  const btn = $('ask-go'); btn.disabled = true;
  $('ask-status').textContent = T().ask_reading;
  try {
    const r = await claudeSort(text);
    applySort(r || keywordSort(text), r ? 'understood_ai' : 'understood_kw');
    $('ask-status').textContent = '';
  } catch (e) {
    applySort(keywordSort(text), 'understood_kw');
    $('ask-status').textContent = e && e.code === 'not_granted' ? T().ask_denied : T().ask_unavailable;
  } finally { btn.disabled = false; }
});
$('ask-clear').addEventListener('click', () => { matched = null; lastSort = null; $('ask-text').value = ''; $('understood').hidden = true; $('ask-clear').hidden = true; $('ask-status').textContent = ''; render(true); });
$('print').addEventListener('click', () => {
  const closed = [...document.querySelectorAll('details:not([open])')];
  closed.forEach((d) => { d.open = true; });
  window.print();
  closed.forEach((d) => { d.open = false; });
});
$('reset').addEventListener('click', () => {
  try { localStorage.removeItem(KEY); } catch (e) { /* nothing saved */ }
  $('q-role').value = 'homeowner'; $('q-project').value = ''; $('q-wait').value = '';
  $('q-address').value = ''; addr = null; $('addr-status').textContent = '';
  matched = null; lastSort = null; $('ask-text').value = ''; $('understood').hidden = true; $('ask-clear').hidden = true; $('ask-status').textContent = '';
  render(true);
  $('q-area').focus();
});
render(true);
