(function () {
  'use strict';
  const kw = 'func return if else elseif then for while break continue switch case default try catch throw new static super extends class interface implement override async await yield pkg import as usingapi include global struct enum self';
  const types = 'int float double long bool string bytes list map any void';
  Highlight.define('hasm', {
    aliases: ['hs'],
    rules: [
      [/\/\/[^\n]*/, 'comment'],
      [/\/\*[\s\S]*?\*\//, 'comment'],
      [/"(?:\\.|[^"\\\n])*"/, 'string'],
      [/'(?:\\.|[^'\\\n])*'/, 'string'],
      [/@[A-Za-z_]\w*/, 'meta'],
      [/\b(?:true|false|null)\b/, 'const'],
      [new RegExp('\\b(?:' + kw.split(' ').join('|') + ')\\b'), 'keyword'],
      [new RegExp('\\b(?:' + types.split(' ').join('|') + ')\\b'), 'type'],
      [/\b0x[0-9a-fA-F_]+\b|\b\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?[lLfFdD]?\b/, 'number'],
      [/\b[A-Z][A-Za-z0-9_]*\b/, 'type'],
      [/\b[a-z_][A-Za-z0-9_]*(?=\()/, 'fn'],
      [/[{}()\[\];,.:<>=!&|+\-*\/%?~^]+/, 'punct']
    ]
  });
})();
