/*
 * The interface around the pages: top bar, navigation, table of contents, search dialog and the home page.
 * It only talks to Docs (what exists), Render (page -> HTML), Router and Search.
 */
(function (global) {
  'use strict';

  const esc = Inline.escape;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const href = (project, page, anchor) => '#/' + [project, page, anchor].filter(Boolean).join('/');

  const logo = '<svg class="logo" viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--a)"/><stop offset=".55" stop-color="var(--b)"/><stop offset="1" stop-color="var(--c)"/></linearGradient><linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect x="2" y="2" width="28" height="28" rx="9" fill="url(#lg1)"/><path d="M9.5 21.5v-11l6.5 4.2 6.5-4.2v11" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><rect x="2" y="2" width="28" height="14" rx="9" fill="url(#lg2)" opacity=".5"/></svg>';

  let state = { project: null, page: null };
  let els = {};

  function setAccent(project) {
    const root = document.documentElement;
    const a = (project && project.accent) || ['#7c5cff', '#38bdf8', '#f472b6'];
    root.style.setProperty('--a', a[0]);
    root.style.setProperty('--b', a[1]);
    root.style.setProperty('--c', a[2] || a[1]);
    root.setAttribute('data-project', project ? project.id : 'home');
  }

  // ── structure ───────────────────────────────────────────────────────────────
  function mount() {
    const app = $('#app');
    app.innerHTML =
      '<div class="shell">' +
      '<header class="topbar glass refract">' +
        '<button class="icon-btn menu-btn" type="button" aria-label="Open navigation">' + icon('menu', 22) + '</button>' +
        '<a class="brand" href="#/">' + logo + '<span>Docs</span></a>' +
        '<nav class="project-tabs" aria-label="Projects"></nav>' +
        '<span class="spacer"></span>' +
        '<button class="search-btn" type="button" aria-label="Search"><span class="si">' + icon('search', 18) + '</span><span class="st">Search</span><kbd>/</kbd></button>' +
        '<button class="icon-btn theme-btn" type="button" aria-label="Theme"></button>' +
      '</header>' +
      '<div class="body">' +
        '<aside class="sidebar glass" id="sidebar" aria-label="Navigation"></aside>' +
        '<main class="content" id="content"></main>' +
      '</div>' +
      '<div class="scrim" hidden></div>' +
      '<div class="search-modal" hidden role="dialog" aria-modal="true" aria-label="Search">' +
        '<div class="search-panel glass refract">' +
          '<div class="search-input"><span class="si">' + icon('search', 20) + '</span><input type="text" placeholder="Search classes, functions, guides…" autocomplete="off" spellcheck="false"><button class="icon-btn sm" type="button" data-close aria-label="Close">' + icon('close', 18) + '</button></div>' +
          '<div class="search-results" role="listbox"></div>' +
        '</div>' +
      '</div>' +
      '</div>';
    els = {
      shell: $('.shell'), tabs: $('.project-tabs'), sidebar: $('#sidebar'), content: $('#content'),
      scrim: $('.scrim'), modal: $('.search-modal'), input: $('.search-input input'), results: $('.search-results'),
      themeBtn: $('.theme-btn')
    };
    renderTabs(null);
    updateThemeButton();
    bindGlobal();
  }

  function renderTabs(active) {
    els.tabs.innerHTML = Docs.projects().map(p =>
      '<a class="ptab' + (p.id === active ? ' on' : '') + '" href="#/' + p.id + '" style="--a:' + p.accent[0] + ';--b:' + p.accent[1] + '">' + icon(p.icon, 18) + '<span>' + esc(p.name) + '</span></a>').join('');
  }

  function updateThemeButton() {
    const m = Theme.mode;
    els.themeBtn.innerHTML = icon(m === 'dark' ? 'moon' : m === 'light' ? 'sun' : 'auto', 22);
    els.themeBtn.title = 'Theme: ' + m;
  }

  // ── navigation ──────────────────────────────────────────────────────────────
  function renderSidebar(project, activePage) {
    els.sidebar.classList.toggle('blank', !project);
    const outline = project ? Docs.outline(project.id) : [];
    const switcher = '<div class="drawer-projects">' + Docs.projects().map(p =>
      '<a class="ptab' + (project && p.id === project.id ? ' on' : '') + '" href="#/' + p.id + '" style="--a:' + p.accent[0] + ';--b:' + p.accent[1] + '">' + icon(p.icon, 18) + '<span>' + esc(p.name) + '</span></a>').join('') + '</div>';
    if (!project) { els.sidebar.innerHTML = '<div class="side-scroll">' + switcher + '</div>'; return; }
    els.sidebar.innerHTML = '<div class="side-scroll">' + switcher +
      '<div class="side-head"><span class="side-icon">' + icon(project.icon, 22) + '</span><div><strong>' + esc(project.name) + '</strong>' +
      (project.version ? '<small>' + esc(project.version) + '</small>' : '') + '</div></div>' +
      '<nav class="side-nav">' + outline.map(({ section, pages }) => {
        const open = pages.some(p => p.id === activePage) || !pages.length;
        return '<section class="side-section' + (open ? ' open' : '') + '" data-section="' + esc(section.id) + '">' +
          '<button class="side-title" type="button"><span class="st-icon">' + icon(section.icon || 'file', 17) + '</span><span>' + esc(section.title) + '</span><span class="chev">' + icon('chevronDown', 16) + '</span></button>' +
          '<div class="side-links">' + pages.map(p =>
            '<a href="' + href(project.id, p.id) + '" class="' + (p.id === activePage ? 'on' : '') + '" data-page="' + esc(p.id) + '">' + esc(p.title) + '</a>').join('') + '</div></section>';
      }).join('') + '</nav></div>';
    const on = $('.side-links a.on', els.sidebar);
    if (on) on.scrollIntoView({ block: 'center' });
  }

  function openDrawer(open) {
    els.shell.classList.toggle('drawer-open', open);
    if (open) Motion.show(els.scrim); else Motion.hide(els.scrim);
    document.body.classList.toggle('no-scroll', open);
  }

  // ── pages ───────────────────────────────────────────────────────────────────
  function renderPage(project, page, anchor) {
    const out = Render.page(page);
    const list = Docs.pagesOf(project.id);
    const i = list.findIndex(p => p.id === page.id);
    const prev = list[i - 1], next = list[i + 1];
    const section = project.sections.find(s => s.id === page.section);
    const toc = out.toc.filter(t => t.level === 2);

    els.content.innerHTML =
      '<div class="doc-wrap">' +
      '<article class="doc">' +
        '<nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Docs</a><span>' + icon('chevronRight', 14) + '</span><a href="#/' + project.id + '">' + esc(project.name) + '</a>' +
          (section ? '<span>' + icon('chevronRight', 14) + '</span><em>' + esc(section.title) + '</em>' : '') + '</nav>' +
        '<h1 class="doc-title">' + esc(page.title) + '</h1>' +
        (page.since ? '<div class="chips"><span class="chip chip-since">Since API ' + esc(String(page.since)) + '</span></div>' : '') +
        (page.summary ? '<p class="doc-summary">' + Inline.html(page.summary) + '</p>' : '') +
        '<div class="doc-body">' + out.html + '</div>' +
        '<nav class="pager">' +
          (prev ? '<a class="pager-link prev glass card-hover" href="' + href(project.id, prev.id) + '"><span class="pl-dir">' + icon('arrowLeft', 16) + ' Previous</span><strong>' + esc(prev.title) + '</strong></a>' : '<span></span>') +
          (next ? '<a class="pager-link next glass card-hover" href="' + href(project.id, next.id) + '"><span class="pl-dir">Next ' + icon('arrowRight', 16) + '</span><strong>' + esc(next.title) + '</strong></a>' : '<span></span>') +
        '</nav>' +
      '</article>' +
      (toc.length > 1 ? '<aside class="toc" aria-label="On this page"><div class="toc-inner"><strong>On this page</strong>' +
        toc.map(t => '<a href="' + href(project.id, page.id, t.id) + '" data-toc="' + t.id + '">' + esc(t.text) + '</a>').join('') + '</div></aside>' : '') +
      '</div>';
    document.title = page.title + ' · ' + project.name;
    observeToc();
    scrollToAnchor(anchor);
  }

  function renderHome() {
    const projects = Docs.projects();
    els.content.innerHTML =
      '<div class="home">' +
        '<section class="hero">' +
          '<h1><span class="grad-text">Build, run and understand</span> the whole stack.</h1>' +
          '<p>Reference documentation and developer guides for three independent projects: an embeddable language, an operating system written in it and an emulator that runs it.</p>' +
        '</section>' +
        '<div class="project-cards">' + projects.map(p =>
          '<a class="project-card glass card-hover" href="#/' + p.id + '" style="--a:' + p.accent[0] + ';--b:' + p.accent[1] + ';--c:' + (p.accent[2] || p.accent[1]) + '">' +
            '<span class="pc-icon">' + icon(p.icon, 30) + '</span>' +
            '<strong>' + esc(p.name) + '</strong><span class="pc-tag">' + esc(p.tagline) + '</span>' +
            '<span class="pc-meta">' + Docs.pagesOf(p.id).length + (Docs.pagesOf(p.id).length === 1 ? ' page' : ' pages') + (p.version ? ' · ' + esc(p.version) : '') + '</span>' +
            '<span class="pc-go">' + icon('arrowRight', 18) + '</span></a>').join('') + '</div>' +
      '</div>';
    document.title = 'Documentation';
  }

  function renderMissing(project, id) {
    els.content.innerHTML = '<div class="doc-wrap"><article class="doc"><h1 class="doc-title">Page not found</h1>' +
      '<p class="doc-summary">There is no page <code>' + esc(id || '') + '</code>' + (project ? ' in ' + esc(project.name) : '') + '.</p>' +
      '<p><a class="btn" href="#/' + (project ? project.id : '') + '">Go back</a></p></article></div>';
  }

  function scrollToAnchor(anchor) {
    if (anchor) {
      const el = document.getElementById(anchor);
      if (el) { el.scrollIntoView({ block: 'start' }); el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); return; }
    }
    window.scrollTo(0, 0);
  }

  let tocObserver = null;
  function observeToc() {
    if (tocObserver) tocObserver.disconnect();
    const links = $$('.toc a');
    if (!links.length) return;
    const byId = new Map(links.map(a => [a.dataset.toc, a]));
    tocObserver = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) { links.forEach(l => l.classList.remove('on')); const a = byId.get(e.target.id); if (a) a.classList.add('on'); }
      }
    }, { rootMargin: '-72px 0px -70% 0px' });
    byId.forEach((_, id) => { const el = document.getElementById(id); if (el) tocObserver.observe(el); });
  }

  // ── route handling ──────────────────────────────────────────────────────────
  function onRoute(route) {
    openDrawer(false);
    if (!route.project) {
      state = { project: null, page: null };
      setAccent(null); renderTabs(null); renderSidebar(null); renderHome(); window.scrollTo(0, 0);
      return;
    }
    const project = Docs.getProject(route.project);
    if (!project) { setAccent(null); renderTabs(null); renderSidebar(null); renderMissing(null, route.project); return; }
    setAccent(project); renderTabs(project.id);
    const list = Docs.pagesOf(project.id);
    let page = route.page ? Docs.getPage(project.id, route.page) : (Docs.getPage(project.id, 'overview') || list[0]);
    if (!page) { renderSidebar(project, null); renderMissing(project, route.page); return; }
    const same = state.project === project.id && state.page === page.id;
    if (!same) { renderSidebar(project, page.id); renderPage(project, page, route.anchor); }
    else scrollToAnchor(route.anchor);
    state = { project: project.id, page: page.id };
  }

  // ── search dialog ───────────────────────────────────────────────────────────
  let results = [], active = 0;
  function openSearch() {
    Motion.show(els.modal);
    document.body.classList.add('no-scroll');
    els.input.value = '';
    renderResults('');
    requestAnimationFrame(() => els.input.focus());
  }
  function closeSearch() {
    Motion.hide(els.modal);
    document.body.classList.toggle('no-scroll', els.shell.classList.contains('drawer-open'));
  }
  function renderResults(q) {
    results = q.trim() ? Search.run(q, 40) : [];
    active = 0;
    if (!q.trim()) { els.results.innerHTML = '<p class="search-hint">Type a class, function or topic. Use <kbd>↑</kbd> <kbd>↓</kbd> and <kbd>Enter</kbd>.</p>'; return; }
    if (!results.length) { els.results.innerHTML = '<p class="search-hint">Nothing found for “' + esc(q) + '”.</p>'; return; }
    els.results.innerHTML = results.map((r, i) => {
      const p = Docs.getProject(r.project);
      return '<a class="result' + (i === 0 ? ' on' : '') + '" role="option" href="' + href(r.project, r.page, r.anchor) + '" data-i="' + i + '" style="--a:' + p.accent[0] + ';--b:' + p.accent[1] + '">' +
        '<span class="r-icon">' + icon(r.kind === 'page' ? 'file' : r.kind === 'heading' ? 'hash' : r.kind === 'type' ? 'cube' : 'function', 18) + '</span>' +
        '<span class="r-main"><strong>' + esc(r.title) + '</strong>' + (r.sig && r.sig !== r.title ? '<code>' + esc(r.sig) + '</code>' : '') +
        '<small>' + esc(r.where) + '</small>' + (r.snippet ? '<em>' + esc(r.snippet) + '</em>' : '') + '</span></a>';
    }).join('');
  }
  function moveActive(delta) {
    const items = $$('.result', els.results);
    if (!items.length) return;
    items[active].classList.remove('on');
    active = (active + delta + items.length) % items.length;
    items[active].classList.add('on');
    items[active].scrollIntoView({ block: 'nearest' });
  }

  // ── global behaviour ────────────────────────────────────────────────────────
  function bindGlobal() {
    document.addEventListener('click', (e) => {
      const t = e.target;
      if (t.closest('.menu-btn')) return openDrawer(true);
      if (t.closest('.scrim')) return openDrawer(false);
      if (t.closest('.theme-btn')) { Theme.cycle(); return updateThemeButton(); }
      if (t.closest('.search-btn')) return openSearch();
      if (t.closest('[data-close]') || t === els.modal) return closeSearch();
      const result = t.closest('.result');
      if (result) return closeSearch();
      const title = t.closest('.side-title');
      if (title) return title.parentElement.classList.toggle('open');
      const copy = t.closest('[data-copy]');
      if (copy) {
        const code = $('code', copy.closest('figure'));
        const done = () => { copy.classList.add('done'); $('span', copy).textContent = 'Copied'; setTimeout(() => { copy.classList.remove('done'); $('span', copy).textContent = 'Copy'; }, 1400); };
        const text = code.textContent;
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
        else fallbackCopy(text, done);
        return;
      }
      const tab = t.closest('[data-tab]');
      if (tab) {
        const root = tab.closest('[data-tabs]');
        $$('.tab', root).forEach(x => x.classList.toggle('on', x === tab));
        $$('.tab-panel', root).forEach(x => x.classList.toggle('on', x.dataset.panel === tab.dataset.tab));
      }
    });
    els.input.addEventListener('input', () => renderResults(els.input.value));
    els.input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1); }
      else if (e.key === 'Enter' && results[active]) { const r = results[active]; closeSearch(); Router.go(r.project, r.page, r.anchor); }
    });
    document.addEventListener('keydown', (e) => {
      const typing = /^(input|textarea|select)$/i.test((e.target.tagName || ''));
      if ((e.key === '/' && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); openSearch(); }
      else if (e.key === 'Escape') { if (!els.modal.hidden) closeSearch(); else openDrawer(false); }
    });
    // light that follows the pointer over glass cards
    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest && e.target.closest('.card-hover');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* nothing more to try */ }
    document.body.removeChild(ta);
  }

  global.Shell = { mount, onRoute };
})(window);
