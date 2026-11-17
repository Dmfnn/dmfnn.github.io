/*
 * The registry: projects and their pages. Content files call Docs.project() once per project and Docs.page() per page;
 * nothing else in the site needs to know what exists.
 *
 *   Docs.project({ id, name, tagline, icon, version, sections: [{ id, title, icon }] })
 *   Docs.page({ project, section, id, title, summary, order, since, blocks: [ ...D.* blocks... ] })
 */
(function (global) {
  'use strict';

  const projects = new Map();
  const pages = new Map();          // "project/id" -> page
  const listeners = [];

  const Docs = {
    /** Files that have been announced in content/manifest.js. */
    files: [],
    /** Per-project file lists, announced in content/manifest.js. */
    manifests: [],

    project(def) {
      if (!def || !def.id) throw new Error('Docs.project: id is required');
      projects.set(def.id, Object.assign({ sections: [], icon: 'book', tagline: '', version: '' }, def));
    },

    page(def) {
      if (!def || !def.project || !def.id) throw new Error('Docs.page: project and id are required (' + JSON.stringify(def && def.title) + ')');
      pages.set(def.project + '/' + def.id, Object.assign({ order: 100, summary: '', blocks: [] }, def));
    },

    projects() { return Array.from(projects.values()); },
    project_(id) { return projects.get(id) || null; },
    getProject(id) { return projects.get(id) || null; },
    getPage(project, id) { return pages.get(project + '/' + id) || null; },

    /** The pages of a project in reading order: by section (as the project lists them), then order, then title. */
    pagesOf(projectId) {
      const project = projects.get(projectId);
      if (!project) return [];
      const rank = new Map(project.sections.map((s, i) => [s.id, i]));
      return Array.from(pages.values())
        .filter(p => p.project === projectId)
        .sort((a, b) =>
          (rank.has(a.section) ? rank.get(a.section) : 999) - (rank.has(b.section) ? rank.get(b.section) : 999) ||
          a.order - b.order || a.title.localeCompare(b.title));
    },

    /** [{ section, pages }] for the navigation. Sections without pages are left out. */
    outline(projectId) {
      const project = projects.get(projectId);
      if (!project) return [];
      const all = Docs.pagesOf(projectId);
      const result = [];
      for (const section of project.sections) {
        const own = all.filter(p => p.section === section.id);
        if (own.length) result.push({ section, pages: own });
      }
      const known = new Set(project.sections.map(s => s.id));
      const rest = all.filter(p => !known.has(p.section));
      if (rest.length) result.push({ section: { id: 'other', title: 'Other', icon: 'file' }, pages: rest });
      return result;
    },

    allPages() { return Array.from(pages.values()); },
    onReady(fn) { listeners.push(fn); },
    _ready() { listeners.splice(0).forEach(fn => fn()); }
  };

  global.Docs = Docs;
})(window);
