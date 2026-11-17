/*
 * Turns the blocks of a page into HTML. render(page, { plain: true }) skips syntax highlighting (used to build the
 * search index) and always returns { html, toc, text, members }.
 */
(function (global) {
  'use strict';

  const types = new Map();   // block type -> { render(block, r), text(block, r) }

  const Render = {
    /** Adds (or replaces) a block type. */
    register(type, impl) { types.set(type, impl); },

    page(page, options) {
      const opts = options || {};
      const previousProject = Inline.project;
      Inline.project = page.project;
      const project = Docs.getProject(page.project);
      const r = {
        page, opts,
        lang: page.lang || (project && project.codeLang) || 'hasm',
        toc: [], text: [], members: [], ids: new Set(),
        inline: Inline.html,
        slug(text, wanted) {
          const base = wanted || String(Inline.plain(text)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
          let id = base, n = 2;
          while (r.ids.has(id)) id = base + '-' + (n++);
          r.ids.add(id);
          return id;
        },
        blocks(list) { return D.flat(list).map(b => r.block(b)).join(''); },
        block(b) {
          const impl = types.get(b.t);
          if (!impl) return '<div class="note note-danger"><p>Unknown block type: <code>' + Inline.escape(String(b.t)) + '</code></p></div>';
          if (impl.text) { const t = impl.text(b, r); if (t) r.text.push(t); }
          return impl.render(b, r);
        },
        code(lang, source) { return opts.plain ? Highlight.escape(source) : Highlight.html(lang, source); }
      };
      const html = r.blocks(page.blocks);
      Inline.project = previousProject;
      return { html, toc: r.toc, text: r.text.join(' \n'), members: r.members };
    }
  };

  const T = Inline.plain;
  const heads = (r, level, text, id) => {
    const anchor = r.slug(text, id);
    if (level <= 2) r.toc.push({ id: anchor, text: T(text), level });
    return anchor;
  };

  // ── text ────────────────────────────────────────────────────────────────────
  Render.register('heading', {
    render(b, r) {
      const id = heads(r, b.level, b.text, b.id);
      return '<h' + b.level + ' id="' + id + '" class="anchor-h">' + r.inline(b.text) +
        '<a class="anchor" href="#/' + r.page.project + '/' + r.page.id + '/' + id + '" aria-label="Link to this section">' + icon('hash', 16) + '</a></h' + b.level + '>';
    },
    text: (b) => T(b.text)
  });
  Render.register('p', { render: (b, r) => '<p>' + r.inline(b.text) + '</p>', text: (b) => T(b.text) });
  Render.register('lead', { render: (b, r) => '<p class="lead">' + r.inline(b.text) + '</p>', text: (b) => T(b.text) });
  Render.register('hr', { render: () => '<hr>' });
  Render.register('html', { render: (b) => b.raw });
  Render.register('list', {
    render(b, r) {
      const tag = b.ordered ? 'ol' : 'ul';
      const item = (i) => Array.isArray(i)
        ? '<li>' + r.inline(i[0]) + '<' + tag + '>' + i[1].map(item).join('') + '</' + tag + '></li>'
        : '<li>' + r.inline(i) + '</li>';
      return '<' + tag + '>' + b.items.map(item).join('') + '</' + tag + '>';
    },
    text: (b) => b.items.flat(3).map(T).join(' ')
  });
  Render.register('dl', {
    render: (b, r) => '<dl>' + b.items.map(([t, d]) => '<dt>' + r.inline(t) + '</dt><dd>' + r.inline(d) + '</dd>').join('') + '</dl>',
    text: (b) => b.items.map(([t, d]) => T(t) + ' ' + T(d)).join(' ')
  });

  // ── code ────────────────────────────────────────────────────────────────────
  function codeBlock(r, lang, source, title) {
    const label = title || (lang && lang !== 'text' ? lang : '');
    return '<figure class="code">' +
      '<figcaption><span class="code-title">' + Inline.escape(label) + '</span>' +
      '<button class="copy" type="button" data-copy aria-label="Copy code">' + icon('copy', 16) + '<span>Copy</span></button></figcaption>' +
      '<pre><code class="lang-' + Inline.escape(lang || 'text') + '">' + r.code(lang, source) + '</code></pre></figure>';
  }
  Render.register('code', { render: (b, r) => codeBlock(r, b.lang, b.source, b.title), text: (b) => b.source });

  // ── callouts ────────────────────────────────────────────────────────────────
  const noteIcons = { note: 'info', tip: 'bulb', warning: 'warning', danger: 'danger' };
  const noteTitles = { note: 'Note', tip: 'Tip', warning: 'Warning', danger: 'Caution' };
  Render.register('note', {
    render(b, r) {
      const body = Array.isArray(b.text) ? r.blocks(b.text) : '<p>' + r.inline(b.text) + '</p>';
      return '<aside class="note note-' + b.kind + '"><div class="note-icon">' + icon(noteIcons[b.kind] || 'info', 20) + '</div>' +
        '<div class="note-body"><strong class="note-title">' + Inline.escape(b.title || noteTitles[b.kind] || 'Note') + '</strong>' + body + '</div></aside>';
    },
    text: (b) => Array.isArray(b.text) ? '' : T(b.text)
  });

  // ── structure ───────────────────────────────────────────────────────────────
  Render.register('table', {
    render(b, r) {
      const align = b.opts.align || [];
      const cell = (tag, c, i) => '<' + tag + (align[i] ? ' class="a-' + align[i] + '"' : '') + '>' + r.inline(c) + '</' + tag + '>';
      return '<div class="table-wrap"><table>' +
        (b.head ? '<thead><tr>' + b.head.map((c, i) => cell('th', c, i)).join('') + '</tr></thead>' : '') +
        '<tbody>' + b.rows.map(row => '<tr>' + row.map((c, i) => cell('td', c, i)).join('') + '</tr>').join('') + '</tbody></table></div>';
    },
    text: (b) => b.rows.map(row => row.map(T).join(' ')).join(' ')
  });
  Render.register('cards', {
    render(b, r) {
      return '<div class="cards" style="--cols:' + (b.opts.cols || 3) + '">' + b.items.map(c => {
        const href = c.href ? Inline.href(c.href) : null;
        const tag = href ? 'a' : 'div';
        return '<' + tag + ' class="card glass card-hover"' + (href ? ' href="' + Inline.escape(href) + '"' : '') + '>' +
          (c.icon ? '<span class="card-icon">' + icon(c.icon, 22) + '</span>' : '') +
          '<strong>' + r.inline(c.title) + '</strong>' + (c.text ? '<span>' + r.inline(c.text) + '</span>' : '') + '</' + tag + '>';
      }).join('') + '</div>';
    },
    text: (b) => b.items.map(c => T(c.title) + ' ' + T(c.text || '')).join(' ')
  });
  Render.register('steps', {
    render(b, r) {
      return '<ol class="steps">' + b.items.map(s =>
        '<li><div class="step-body"><strong>' + r.inline(s.title) + '</strong>' + (s.blocks ? r.blocks(s.blocks) : (s.text ? '<p>' + r.inline(s.text) + '</p>' : '')) + '</div></li>').join('') + '</ol>';
    },
    text: (b) => b.items.map(s => T(s.title) + ' ' + T(s.text || '')).join(' ')
  });
  let tabCounter = 0;
  Render.register('tabs', {
    render(b, r) {
      const id = 'tabs' + (tabCounter++);
      return '<div class="tabs" data-tabs>' +
        '<div class="tab-list" role="tablist">' + b.items.map((t, i) =>
          '<button type="button" role="tab" class="tab' + (i === 0 ? ' on' : '') + '" data-tab="' + id + '-' + i + '">' + Inline.escape(t.label) + '</button>').join('') + '</div>' +
        b.items.map((t, i) => '<div class="tab-panel' + (i === 0 ? ' on' : '') + '" data-panel="' + id + '-' + i + '">' + r.blocks(t.blocks) + '</div>').join('') + '</div>';
    },
    text: (b) => b.items.map(t => t.label).join(' ')
  });

  // ── API reference ───────────────────────────────────────────────────────────
  const firstSentence = (s) => { const t = T(s || ''); const m = t.match(/^.*?[.!?](?=\s|$)/); return m ? m[0] : t; };
  const chip = (cls, text) => '<span class="chip ' + cls + '">' + Inline.escape(text) + '</span>';

  function memberHtml(m, r, lang) {
    const sig = '<pre class="sig"><code>' + r.code(lang, m.sig || m.name) + '</code></pre>';
    const params = m.params && m.params.length
      ? '<h5>Parameters</h5><dl class="params">' + m.params.map(([n, t, d]) => '<dt><code>' + Inline.escape(n) + '</code>' + (t ? ' <span class="ptype">' + Inline.escape(t) + '</span>' : '') + '</dt><dd>' + r.inline(d || '') + '</dd>').join('') + '</dl>' : '';
    let returns = '';
    if (m.returns) {
      const [t, d] = Array.isArray(m.returns) ? m.returns : [null, m.returns];
      returns = '<h5>Returns</h5><p>' + (t ? '<span class="ptype">' + Inline.escape(t) + '</span> ' : '') + r.inline(d || '') + '</p>';
    }
    const throws = m.throws && m.throws.length
      ? '<h5>Throws</h5><dl class="params">' + m.throws.map(([t, d]) => '<dt><span class="ptype">' + Inline.escape(t) + '</span></dt><dd>' + r.inline(d || '') + '</dd>').join('') + '</dl>' : '';
    let example = '';
    if (m.example) {
      const ex = typeof m.example === 'string' ? { lang, source: m.example } : m.example;
      example = '<h5>Example</h5>' + codeBlock(r, ex.lang || lang, D.dedent(ex.source), '');
    }
    const see = m.see && m.see.length ? '<p class="see"><strong>See also:</strong> ' + m.see.map(s => r.inline('[' + s.replace(/^doc:/, '').replace(/^[^/]*\//, '').replace(/#/, ' · ') + '](' + s + ')')).join(', ') + '</p>' : '';
    const flags = (m.since ? chip('chip-since', 'Since API ' + m.since) : '') + (m.deprecated ? chip('chip-deprecated', 'Deprecated') : '');
    return '<article class="member" id="' + m.id + '">' +
      '<div class="member-head">' + sig + (flags ? '<div class="chips">' + flags + '</div>' : '') + '</div>' +
      (m.desc ? '<div class="member-desc">' + (Array.isArray(m.desc) ? r.blocks(m.desc) : '<p>' + r.inline(m.desc) + '</p>') + '</div>' : '') +
      params + returns + throws + example + see + '</article>';
  }

  Render.register('api', {
    render(b, r) {
      const lang = b.lang || r.lang;
      const typeId = r.slug(b.name, b.id);
      r.toc.push({ id: typeId, text: b.name, level: 2 });
      let html = '<section class="api-type" id="' + typeId + '">';
      html += '<header class="api-head glass"><div class="chips">' + chip('chip-kind', b.kind) +
        (b.since ? chip('chip-since', 'Since API ' + b.since) : '') + (b.deprecated ? chip('chip-deprecated', 'Deprecated') : '') + '</div>' +
        '<h2 class="api-title anchor-h">' + Inline.escape(b.name) + '<a class="anchor" href="#/' + r.page.project + '/' + r.page.id + '/' + typeId + '" aria-label="Link">' + icon('hash', 16) + '</a></h2>' +
        (b.pkg ? '<p class="api-pkg"><span>Package</span><code>' + Inline.escape(b.pkg) + '</code></p>' : '') +
        (b.extends ? '<p class="api-pkg"><span>Extends</span><code>' + Inline.escape(b.extends) + '</code></p>' : '') +
        (b.implements && b.implements.length ? '<p class="api-pkg"><span>Implements</span>' + b.implements.map(i => '<code>' + Inline.escape(i) + '</code>').join(' ') + '</p>' : '') +
        (b.summary ? '<p class="api-summary-text">' + r.inline(b.summary) + '</p>' : '') + '</header>';
      if (b.description && b.description.length) html += '<div class="api-desc">' + r.blocks(b.description) + '</div>';
      r.text.push(b.name + ' ' + T(b.summary || '') + ' ' + (b.pkg || ''));
      r.members.push({ id: typeId, name: b.name, sig: b.kind + ' ' + b.name, summary: firstSentence(b.summary), type: true });

      for (const g of b.groups) {
        if (!g.items.length) continue;
        r.ids.add(g.id);
        r.toc.push({ id: g.id, text: g.title, level: 2, sub: b.name });
        html += '<h3 class="group-title anchor-h" id="' + g.id + '">' + Inline.escape(g.title) + '</h3>';
        html += '<div class="table-wrap"><table class="api-summary"><tbody>' + g.items.map(m =>
          '<tr><td><a href="#/' + r.page.project + '/' + r.page.id + '/' + m.id + '"><code>' + Inline.escape(m.name || m.sig) + '</code></a></td>' +
          '<td>' + r.inline(firstSentence(m.desc)) + '</td></tr>').join('') + '</tbody></table></div>';
        html += g.items.map(m => {
          r.text.push((m.name || '') + ' ' + (m.sig || '') + ' ' + T(Array.isArray(m.desc) ? '' : m.desc || ''));
          r.members.push({ id: m.id, name: b.name + '.' + (m.name || m.sig), sig: m.sig || m.name, summary: firstSentence(m.desc), group: g.title });
          return memberHtml(m, r, lang);
        }).join('');
      }
      return html + '</section>';
    }
  });

  // ── screenshots ─────────────────────────────────────────────────────────────
  // D.custom('screens', { items: [{ src, alt, caption }] }): the first image is shown large, the rest in a row below.
  Render.register('screens', {
    render(b, r) {
      const E = Inline.escape;
      const fig = (it, cls) => '<figure class="shot ' + cls + '"><div class="shot-frame"><img src="' + E(it.src) + '" alt="' + E(it.alt || '') +
        '" loading="lazy" decoding="async"></div>' + (it.caption ? '<figcaption>' + r.inline(it.caption) + '</figcaption>' : '') + '</figure>';
      const [first, ...rest] = b.items;
      return '<div class="shots">' + fig(first, 'shot-main') +
        (rest.length ? '<div class="shot-row" style="--n:' + rest.length + '">' + rest.map(i => fig(i, 'shot-sub')).join('') + '</div>' : '') + '</div>';
    },
    text: (b) => b.items.map(i => T(i.caption || i.alt || '')).join(' ')
  });

  global.Render = Render;
})(window);
