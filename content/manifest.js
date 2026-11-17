/*
 * The entry point of the content. Projects are documented independently: each one keeps its pages under
 * content/<project>/ and lists them in content/<project>/files.js (Docs.files.push('<project>/page.js', ...)).
 * To document something new, add a page file and one line to the project's files.js. Order does not matter:
 * pages are sorted by section, `order` and title.
 */
Docs.files.push('projects.js');
Docs.manifests.push('hasm/files.js', 'bellyos/files.js', 'hemu/files.js');
