(function () {
  'use strict';
  const java = 'abstract assert break case catch class continue default do else enum extends final finally for if implements import instanceof interface native new package private protected public return static super switch synchronized this throw throws try void volatile while var record';
  const javaTypes = 'boolean byte char double float int long short String Object List Map Set Optional';
  const cpp = 'auto break case catch class const constexpr continue default delete do else enum explicit extern for friend if inline namespace new noexcept nullptr operator private protected public return sizeof static struct switch template this throw try typedef typename union using virtual void volatile while';
  const cppTypes = 'bool char double float int long short signed unsigned size_t int8_t int16_t int32_t int64_t uint8_t uint16_t uint32_t uint64_t std string vector';
  function make(kw, types, extra) {
    return [
      [/\/\/[^\n]*/, 'comment'],
      [/\/\*[\s\S]*?\*\//, 'comment'],
      [/"(?:\\.|[^"\\\n])*"/, 'string'],
      [/'(?:\\.|[^'\\\n])*'/, 'string'],
      [/@[A-Za-z_]\w*/, 'meta'],
      [/#\s*\w+[^\n]*/, extra],
      [/\b(?:true|false|null|nullptr|NULL)\b/, 'const'],
      [new RegExp('\\b(?:' + kw.split(' ').join('|') + ')\\b'), 'keyword'],
      [new RegExp('\\b(?:' + types.split(' ').join('|') + ')\\b'), 'type'],
      [/\b0x[0-9a-fA-F_]+[uUlL]*\b|\b\d[\d_]*(?:\.\d+)?[fFlLuU]*\b/, 'number'],
      [/\b[A-Z][A-Za-z0-9_]*\b/, 'type'],
      [/\b[a-zA-Z_]\w*(?=\()/, 'fn'],
      [/[{}()\[\];,.:<>=!&|+\-*\/%?~^]+/, 'punct']
    ];
  }
  Highlight.define('java', { aliases: ['kotlin'], rules: make(java, javaTypes, 'meta') });
  Highlight.define('cpp', { aliases: ['c', 'c++', 'h'], rules: make(cpp, cppTypes, 'meta') });
  Highlight.define('gradle', { aliases: ['groovy'], rules: make(java + ' def plugins apply', javaTypes, 'meta') });
})();
