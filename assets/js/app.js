/*
 * Start-up: load every content file named in content/manifest.js (plain script tags, so the site also works from
 * file://), then mount the interface and start routing.
 */
(function () {
  'use strict';

  function load(src) {
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve(null);
      s.onerror = () => resolve(src);
      document.head.appendChild(s);
    });
  }

  // Chromium renders SVG-filter refraction behind glass; elsewhere the plain blur is used.
  if (window.chrome && !/Mobi|Android/i.test(navigator.userAgent)) document.documentElement.classList.add('refract-ok');
  else if (window.chrome) document.documentElement.classList.add('refract-lite');

  // Two phases: the manifest names one list per project (content/<project>/files.js), each list names its pages.
  Promise.all(Docs.manifests.map(f => load('content/' + f)))
    .then(() => Promise.all(Docs.files.map(f => load('content/' + f))))
    .then((failed) => {
    Shell.mount();
    Motion.install();
    const missing = failed.filter(Boolean);
    if (missing.length) console.warn('Content files that did not load:', missing);
    Router.onChange(Shell.onRoute);
    Router.start();
  });
})();
