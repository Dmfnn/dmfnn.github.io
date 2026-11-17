/*
 * The projects of the site. Each is documented on its own: pages never assume another project exists unless they
 * link to it on purpose. `accent` is the gradient trio of the project (--a, --b, --c).
 */
Docs.project({
  id: 'hasm', name: 'HASM', icon: 'code', version: 'Hybrid Assembly',
  tagline: 'An embeddable, statically typed language that compiles to compact bytecode and runs on a small virtual machine.',
  accent: ['#8b5cf6', '#22d3ee', '#e879f9'], codeLang: 'hasm',
  sections: [
    { id: 'start',    title: 'Getting started', icon: 'rocket' },
    { id: 'language', title: 'The language',    icon: 'braces' },
    { id: 'build',    title: 'Building',        icon: 'wand' },
    { id: 'stdlib',   title: 'Standard library', icon: 'layers' },
    { id: 'host',     title: 'Embedding',       icon: 'puzzle' },
    { id: 'internals', title: 'Internals',      icon: 'cpu' }
  ]
});

Docs.project({
  id: 'bellyos', name: 'BellyOS', icon: 'phone', version: 'Developer guide',
  tagline: 'A small operating system with applications, services and a window manager, written entirely in HASM.',
  accent: ['#fb923c', '#f43f5e', '#fbbf24'], codeLang: 'hasm',
  sections: [
    { id: 'start',   title: 'Getting started',  icon: 'rocket' },
    { id: 'apps',    title: 'Applications',     icon: 'grid' },
    { id: 'ui',      title: 'User interface',   icon: 'window' },
    { id: 'api',     title: 'Framework API',    icon: 'cube' },
    { id: 'system',  title: 'The system',       icon: 'shield' },
    { id: 'tools',   title: 'Tools',            icon: 'terminal' }
  ]
});

Docs.project({
  id: 'hemu', name: 'HEMU', icon: 'chip', version: 'Hybrid Emulator',
  tagline: 'A virtual device for Android: screen, storage, input and firmware for operating systems you write yourself.',
  accent: ['#38bdf8', '#2dd4bf', '#818cf8'], codeLang: 'java',
  sections: [
    { id: 'start',    title: 'Getting started', icon: 'rocket' },
    { id: 'concepts', title: 'Concepts',        icon: 'layers' },
    { id: 'storage',  title: 'Storage',         icon: 'database' },
    { id: 'firmware', title: 'Firmware',        icon: 'lock' },
    { id: 'hal',      title: 'Device API',      icon: 'cpu' },
    { id: 'host',     title: 'The host',        icon: 'screen' }
  ]
});
