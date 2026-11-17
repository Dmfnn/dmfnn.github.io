(function () {
  'use strict';
  Highlight.define('xml', {
    aliases: ['html', 'svg'],
    rules: [
      [/<!--[\s\S]*?-->/, 'comment'],
      [/<\?[\s\S]*?\?>/, 'meta'],
      [/<\/?[A-Za-z_][\w:.-]*/, 'tag'],
      [/\/?>/, 'tag'],
      [/"[^"]*"|'[^']*'/, 'string'],
      [/[A-Za-z_][\w:.-]*(?==)/, 'attr'],
      [/&[#\w]+;/, 'const']
    ]
  });
  Highlight.define('json', {
    rules: [
      [/"(?:\\.|[^"\\\n])*"(?=\s*:)/, 'attr'],
      [/"(?:\\.|[^"\\\n])*"/, 'string'],
      [/\b(?:true|false|null)\b/, 'const'],
      [/-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/, 'number'],
      [/[{}\[\],:]/, 'punct']
    ]
  });
  Highlight.define('bash', {
    aliases: ['sh', 'shell', 'console'],
    rules: [
      [/#[^\n]*/, 'comment'],
      [/"(?:\\.|[^"\\])*"|'[^']*'/, 'string'],
      [/\$[A-Za-z_]\w*|\$\{[^}]*\}/, 'const'],
      [/(?:^|(?<=\s))--?[A-Za-z][\w-]*/, 'attr'],
      [/\b(?:if|then|else|fi|for|do|done|while|case|esac|export|cd|echo|set|source)\b/, 'keyword'],
      [/\b\d+\b/, 'number'],
      [/[|&;<>()=]+/, 'punct']
    ]
  });
  Highlight.define('text', { aliases: ['plain', 'txt', 'output'], rules: [] });
})();
