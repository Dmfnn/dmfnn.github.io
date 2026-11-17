/* Motion helpers: animated show/hide for overlays and a pointer-driven ripple for interactive elements.
   Add a selector to Motion.rippleTargets to give a new kind of control a ripple. */
(function (global) {
  'use strict';

  const EXIT_MS = 300;

  const Motion = {
    /** Selectors of the elements that get a ripple. */
    rippleTargets: [
      '.icon-btn', '.ptab', '.tab', '.copy', '.search-btn', '.side-title', '.side-links a',
      '.toc a', '.result', '.card', '.project-card', '.pager-link', '.btn', '.crumbs a'
    ],

    /** Unhides an element and lets it transition in (the element's CSS reacts to the `shown` class). */
    show(el) {
      clearTimeout(el._motionTimer);
      el.hidden = false;
      void el.offsetWidth;                       // commit the hidden state so the transition has a start
      el.classList.add('shown');
    },

    /** Transitions an element out and hides it when the exit is done. */
    hide(el) {
      if (el.hidden) return;
      el.classList.remove('shown');
      clearTimeout(el._motionTimer);
      el._motionTimer = setTimeout(() => { if (!el.classList.contains('shown')) el.hidden = true; }, EXIT_MS);
    },

    ripple(host, x, y) {
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      let layer = host.querySelector(':scope > .rpl');
      if (!layer) { layer = document.createElement('span'); layer.className = 'rpl'; layer.setAttribute('aria-hidden', 'true'); host.appendChild(layer); }
      const box = host.getBoundingClientRect();
      const cx = x - box.left, cy = y - box.top;
      const radius = Math.hypot(Math.max(cx, box.width - cx), Math.max(cy, box.height - cy));
      const dot = document.createElement('i');
      dot.style.cssText = 'width:' + radius * 2 + 'px;height:' + radius * 2 + 'px;left:' + (cx - radius) + 'px;top:' + (cy - radius) + 'px';
      layer.appendChild(dot);
      dot.addEventListener('animationend', () => dot.remove(), { once: true });
    },

    install() {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      document.addEventListener('pointerdown', e => {
        if (e.button > 0 || !e.target.closest) return;
        const host = e.target.closest(Motion.rippleTargets.join(','));
        if (host) Motion.ripple(host, e.clientX, e.clientY);
      }, { passive: true });
    }
  };

  global.Motion = Motion;
})(window);
