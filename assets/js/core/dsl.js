/*
 * D: the vocabulary pages are written in. Every function returns a plain block object; a page's `blocks` array may
 * contain blocks, arrays of blocks (flattened) and null/false (skipped), so pages can be composed with ordinary code.
 *
 *   Text:        D.h2(text[, id])  D.h3  D.h4  D.p(text)  D.lead(text)  D.ul([...])  D.ol([...])  D.dl([[term, text], ...])
 *   Code:        D.code(lang, source[, title])     lang: hasm java cpp xml json bash gradle text
 *   Callouts:    D.note(text[, title])  D.tip  D.warn  D.danger  (text may be a string or an array of blocks)
 *   Structure:   D.table(head, rows[, {align}])  D.cards([{title, text, icon, href}][, {cols}])  D.steps([{title, text|blocks}])
 *                D.tabs([{label, blocks}])  D.hr()  D.html(raw)
 *   Reference:   D.api({...})  -- a class, interface, enum, module or group of functions; see the shape below.
 *
 * D.api({
 *   name, kind: 'class'|'interface'|'enum'|'module'|'service'|'api'|'type', pkg, since, deprecated,
 *   extends, implements: [...], summary, description: [blocks], lang,
 *   groups: [{ title: 'Methods', items: [ member, ... ] }]
 * })
 * member = { name, sig, desc, params: [[name, type, text], ...], returns: [type, text] | text, throws: [[type, text], ...],
 *            since, deprecated, example: { lang, source } | source, see: ['doc:...'] }
 *
 * New kinds of block: Render.register('myBlock', { render(block, r) -> html, text(block) -> string }) and D.custom('myBlock', data).
 */
(function (global) {
  'use strict';

  /** Removes the common indentation and the empty lines around a code sample. */
  function dedent(src) {
    const lines = String(src).replace(/\t/g, '    ').split('\n');
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    const indent = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length), Infinity);
    return lines.map(l => l.slice(Number.isFinite(indent) ? indent : 0)).join('\n');
  }

  const heading = (level) => (text, id) => ({ t: 'heading', level, text, id });
  const callout = (kind) => (text, title) => ({ t: 'note', kind, text, title });

  function normalizeApi(def) {
    const used = new Map();
    const unique = (base) => {
      const n = (used.get(base) || 0) + 1;
      used.set(base, n);
      return n === 1 ? base : base + '-' + n;
    };
    const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const out = Object.assign({ t: 'api', kind: 'class', groups: [], description: [], implements: [] }, def);
    out.id = slug(def.name);
    out.groups = (def.groups || []).map(g => Object.assign({}, g, {
      id: slug(def.name + '-' + g.title),
      items: (g.items || []).map(m => Object.assign({}, m, { id: unique(slug(def.name + '.' + (m.name || m.sig))) }))
    }));
    return out;
  }

  const D = {
    h2: heading(2), h3: heading(3), h4: heading(4),
    p: (text) => ({ t: 'p', text }),
    lead: (text) => ({ t: 'lead', text }),
    ul: (items) => ({ t: 'list', ordered: false, items }),
    ol: (items) => ({ t: 'list', ordered: true, items }),
    dl: (items) => ({ t: 'dl', items }),
    code: (lang, source, title) => ({ t: 'code', lang, source: dedent(source), title }),
    note: callout('note'), tip: callout('tip'), warn: callout('warning'), danger: callout('danger'),
    table: (head, rows, opts) => ({ t: 'table', head, rows, opts: opts || {} }),
    cards: (items, opts) => ({ t: 'cards', items, opts: opts || {} }),
    steps: (items) => ({ t: 'steps', items }),
    tabs: (items) => ({ t: 'tabs', items }),
    hr: () => ({ t: 'hr' }),
    html: (raw) => ({ t: 'html', raw }),
    api: (def) => normalizeApi(def),
    custom: (type, data) => Object.assign({ t: type }, data),
    dedent
  };

  /** Splits a parameter list at top-level commas (generic types contain commas too). */
  function splitParams(text) {
    const out = []; let depth = 0, cur = '';
    for (const ch of text) {
      if (ch === '<' || ch === '(') depth++;
      if (ch === '>' || ch === ')') depth--;
      if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; } else cur += ch;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }

  /**
   * A function member written as its signature, parsed for the parameter table:
   *   D.fn('func int indexOf(string s, string part)', 'Position of the first match, or -1.',
   *        { p: { s: 'The text.', part: 'What to look for.' }, returns: 'The index.', throws: [['string', 'when ...']], example: '...', since: 2 })
   * Also understands `static func` and constructors written as `new Name(type a, ...)` (no return type).
   */
  D.fn = function (sig, desc, opts) {
    const o = opts || {};
    const m = /^(?:static\s+)?(?:func\s+(.+?)\s+)?([A-Za-z_~][\w.~]*)\((.*)\)\s*$/.exec(sig.replace(/^new\s+/, ''));
    const member = { name: m ? m[2] : sig, sig, desc };
    if (m) {
      member.params = splitParams(m[3]).map(p => {
        const i = p.lastIndexOf(' ');
        const type = i < 0 ? '' : p.slice(0, i).trim(), name = i < 0 ? p : p.slice(i + 1);
        return [name, type, (o.p && o.p[name]) || ''];
      });
      if (m[1] && m[1] !== 'void') member.returns = [m[1], o.returns || ''];
    }
    if (o.throws) member.throws = o.throws;
    if (o.example) member.example = o.example;
    if (o.since) member.since = o.since;
    if (o.deprecated) member.deprecated = true;
    if (o.see) member.see = o.see;
    return member;
  };

  /** A module / class / interface page body built from D.fn lines: groups: [{ title, fns: [[sig, desc, opts], ...] }] */
  D.module = function (def) {
    const groups = (def.groups || []).map(g => ({ title: g.title, items: (g.fns || []).map(f => D.fn(f[0], f[1], f[2])) }));
    return normalizeApi(Object.assign({ kind: 'module' }, def, { groups }));
  };

  /** Flattens nested arrays and drops empty values. */
  D.flat = function flat(blocks) {
    const out = [];
    (function walk(list) {
      for (const b of list || []) {
        if (Array.isArray(b)) walk(b);
        else if (b) out.push(b);
      }
    })(blocks);
    return out;
  };

  global.D = D;
})(window);
