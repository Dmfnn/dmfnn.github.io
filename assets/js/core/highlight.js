/*
 * A small syntax highlighter driven by language definitions.
 *
 *   Highlight.define('name', { aliases: ['x'], rules: [ [/regex/, 'token-class'], ... ] })
 *
 * Rules are tried in order at every position (first match wins), so put comments and strings first. Token classes are
 * styled in assets/css/code.css (tok-comment, tok-string, tok-keyword, tok-type, tok-number, tok-fn, tok-punct, tok-attr,
 * tok-tag, tok-const, tok-meta).
 */
(function (global) {
  'use strict';

  const languages = new Map();

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  const Highlight = {
    define(name, def) {
      const compiled = def.rules.map(([re, cls]) => [new RegExp(re.source, (re.flags.replace(/[gy]/g, '')) + 'y'), cls]);
      const lang = { rules: compiled };
      languages.set(name, lang);
      (def.aliases || []).forEach(a => languages.set(a, lang));
    },

    has(name) { return languages.has(name); },

    /** Returns highlighted HTML for the source. Unknown languages are only escaped. */
    html(name, source) {
      const lang = languages.get(name);
      if (!lang) return escapeHtml(source);
      let out = '';
      let plain = '';
      const flush = () => { if (plain) { out += escapeHtml(plain); plain = ''; } };
      let i = 0;
      while (i < source.length) {
        let matched = false;
        for (const [re, cls] of lang.rules) {
          re.lastIndex = i;
          const m = re.exec(source);
          if (m && m[0].length > 0) {
            flush();
            out += cls ? '<span class="tok-' + cls + '">' + escapeHtml(m[0]) + '</span>' : escapeHtml(m[0]);
            i += m[0].length;
            matched = true;
            break;
          }
        }
        if (!matched) { plain += source[i]; i++; }
      }
      flush();
      return out;
    },

    escape: escapeHtml
  };

  global.Highlight = Highlight;
})(window);
