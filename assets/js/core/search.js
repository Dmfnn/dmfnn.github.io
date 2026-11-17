/*
 * Full text search over every page and every API member. The index is built on first use by rendering all pages
 * without highlighting, so whatever a page contains is searchable without extra work from its author.
 */
(function (global) {
  'use strict';

  let index = null;

  const tokens = (q) => q.toLowerCase().split(/[^a-z0-9_.#]+/).filter(Boolean);

  function build() {
    const entries = [];
    for (const page of Docs.allPages()) {
      const project = Docs.getProject(page.project);
      if (!project) continue;
      const out = Render.page(page, { plain: true });
      const where = project.name + ' · ' + (sectionTitle(project, page.section));
      entries.push({
        project: page.project, page: page.id, anchor: '', title: page.title, where, kind: 'page',
        hay: { title: page.title.toLowerCase(), summary: (page.summary || '').toLowerCase(), body: out.text.toLowerCase() },
        snippetSource: (page.summary || '') + ' ' + out.text, summary: page.summary || ''
      });
      for (const h of out.toc) {
        entries.push({
          project: page.project, page: page.id, anchor: h.id, title: h.text, where: where + ' · ' + page.title, kind: 'heading',
          hay: { title: h.text.toLowerCase(), summary: '', body: '' }, snippetSource: '', summary: ''
        });
      }
      for (const m of out.members) {
        entries.push({
          project: page.project, page: page.id, anchor: m.id, title: m.name, where: where + ' · ' + page.title, kind: m.type ? 'type' : 'member',
          hay: { title: m.name.toLowerCase() + ' ' + (m.sig || '').toLowerCase(), summary: (m.summary || '').toLowerCase(), body: '' },
          snippetSource: m.summary || '', summary: m.summary || '', sig: m.sig
        });
      }
    }
    return entries;
  }

  function sectionTitle(project, id) {
    const s = project.sections.find(x => x.id === id);
    return s ? s.title : 'Other';
  }

  function score(entry, qs, whole) {
    let total = 0;
    for (const q of qs) {
      let s = 0;
      const t = entry.hay.title;
      if (t === q) s += 40;
      else if (t.startsWith(q)) s += 24;
      else if (t.includes('.' + q) || t.includes(' ' + q)) s += 16;
      else if (t.includes(q)) s += 12;
      if (entry.hay.summary.includes(q)) s += 4;
      if (entry.hay.body.includes(q)) s += 1.5;
      if (!s) return 0;
      total += s;
    }
    if (entry.hay.title.includes(whole)) total += 10;
    if (entry.kind === 'type') total += 6;
    if (entry.kind === 'page') total += 3;
    return total;
  }

  function snippet(entry, qs) {
    const src = entry.snippetSource;
    if (!src) return entry.summary;
    const lower = src.toLowerCase();
    let at = -1;
    for (const q of qs) { at = lower.indexOf(q); if (at >= 0) break; }
    if (at < 0) return entry.summary || src.slice(0, 120);
    const start = Math.max(0, at - 50);
    return (start ? '…' : '') + src.slice(start, start + 150).replace(/\s+/g, ' ') + '…';
  }

  global.Search = {
    run(query, limit) {
      const qs = tokens(query);
      if (!qs.length) return [];
      if (!index) index = build();
      const whole = query.trim().toLowerCase();
      return index
        .map(e => ({ e, s: score(e, qs, whole) }))
        .filter(x => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, limit || 30)
        .map(x => ({ project: x.e.project, page: x.e.page, anchor: x.e.anchor, title: x.e.title, where: x.e.where, kind: x.e.kind, snippet: snippet(x.e, qs), sig: x.e.sig }));
    },
    reset() { index = null; }
  };
})(window);
