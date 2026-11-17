/*
 * Hash routing:  #/                       the home page
 *                #/<project>              the first page of a project
 *                #/<project>/<page>       a page
 *                #/<project>/<page>/<id>  a place on a page
 */
(function (global) {
  'use strict';

  function parse(hash) {
    const parts = (hash || '').replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    return { project: parts[0] || null, page: parts[1] || null, anchor: parts[2] || null };
  }

  const Router = {
    current: { project: null, page: null, anchor: null },
    handlers: [],
    parse,
    onChange(fn) { Router.handlers.push(fn); },
    go(project, page, anchor) {
      location.hash = '#/' + [project, page, anchor].filter(Boolean).map(encodeURIComponent).join('/');
    },
    start() {
      const run = () => {
        Router.current = parse(location.hash);
        Router.handlers.forEach(fn => fn(Router.current));
      };
      window.addEventListener('hashchange', run);
      run();
    }
  };

  global.Router = Router;
})(window);
