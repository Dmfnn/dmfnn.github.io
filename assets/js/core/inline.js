/*
 * Inline markup for every text in the content: `code`, **bold**, *italic* and [links](target).
 * Everything else is escaped, so plain text may contain < and & freely. Raw HTML needs D.html().
 *
 * Link targets:  doc:page                 a page of the current project
 *                doc:project/page         a page of another project
 *                doc:page#anchor          a place on a page (the id of a heading or of an API member)
 *                #anchor                  a place on this page
 *                https://...              an external site (opens in a new tab)
 */
(function (global) {
  'use strict';

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const Inline = {
    /** The project relative doc: links are resolved against; set by the renderer. */
    project: null,

    href(target) {
      if (target.startsWith('doc:')) {
        let [path, anchor] = target.slice(4).split('#');
        if (!path.includes('/')) path = (Inline.project || '') + '/' + path;
        return '#/' + path + (anchor ? '/' + anchor : '');
      }
      return target;
    },

    html(text) {
      if (text == null) return '';
      const spans = [];
      let s = String(text).replace(/`([^`]+)`/g, (_, code) => { spans.push('<code>' + esc(code) + '</code>'); return '\u0000' + (spans.length - 1) + '\u0000'; });
      s = esc(s);
      s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, target) => {
        const external = /^https?:/.test(target);
        const href = esc(Inline.href(target.replace(/&amp;/g, '&')));
        return '<a href="' + href + '"' + (external ? ' target="_blank" rel="noopener noreferrer" class="ext"' : '') + '>' + label + '</a>';
      });
      s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      s = s.replace(/(^|[\s(])\*([^\s*][^*]*?)\*(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>');
      return s.replace(/\u0000(\d+)\u0000/g, (_, i) => spans[+i]);
    },

    /** The text without markup (for search and summaries). */
    plain(text) {
      return String(text == null ? '' : text)
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[`*]/g, '');
    },

    escape: esc
  };

  global.Inline = Inline;
})(window);
