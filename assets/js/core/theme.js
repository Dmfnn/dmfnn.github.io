/* Light / dark / automatic theme, remembered when the browser allows it. */
(function (global) {
  'use strict';
  const KEY = 'docs-theme';
  const order = ['auto', 'dark', 'light'];
  let mode = 'auto';
  try { mode = localStorage.getItem(KEY) || 'auto'; } catch (e) { /* storage may be unavailable */ }
  if (!order.includes(mode)) mode = 'auto';

  const Theme = {
    get mode() { return mode; },
    apply() { document.documentElement.setAttribute('data-theme', mode); },
    cycle() {
      mode = order[(order.indexOf(mode) + 1) % order.length];
      try { localStorage.setItem(KEY, mode); } catch (e) { /* ignore */ }
      Theme.apply();
      return mode;
    }
  };
  Theme.apply();
  global.Theme = Theme;
})(window);
