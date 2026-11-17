Docs.page({
  project: 'hasm', section: 'language', id: 'lexical', order: 1, title: 'Lexical structure',
  summary: 'Comments, identifiers, literals, separators and the reserved words.',
  blocks: [
    D.h2('Comments'),
    D.code('hasm', `
      // a line comment
      /* a block comment
         over several lines */`),
    D.h2('Statements and separators'),
    D.p('Statements are separated by line breaks or simply by whitespace; semicolons are not used. Several statements can share a line: `self.name = name  self.legs = 4`. Blocks use braces, and conditions are written without parentheses.'),
    D.h2('Literals'),
    D.table(['Kind', 'Examples', 'Type'], [
      ['Integer', '`42`  `0xFF`  `0b101`', '`int`'],
      ['Long integer', '`5000000000L`  `9223372036854775807L`', '`long`'],
      ['Float', '`1.5f`', '`float`'],
      ['Double', '`2.25`  `0.5`', '`double`'],
      ['Boolean', '`true`  `false`', '`bool`'],
      ['String', '`"hello"`  `"line\\n"`', '`string`'],
      ['Null', '`null`', 'any reference type'],
      ['List', '`[1, 2, 3]`  `[]`', '`list<T>`'],
      ['Map', '`{"a": 1, "b": 2}`  `{}`', '`map<K,V>`']
    ]),
    D.p('Strings use double quotes and understand the usual backslash escapes. Strings are sequences of Unicode characters: `"héllo"[1]` is `"é"`.'),
    D.h2('Identifiers'),
    D.p('Letters, digits and underscores, not starting with a digit. Identifiers are case sensitive. By convention classes, interfaces and enums use `PascalCase`; functions, variables and fields use `camelCase`.'),
    D.h2('Reserved words'),
    D.code('text', `
      int float double long bool string bytes list map any
      func return if else elseif then for while break continue switch case default
      try catch throw new static super extends class interface implement override
      async await yield enum global true false null
      pkg import as usingapi self`, 'keywords'),
    D.note('`elseif` is accepted as a spelling of `else if`, and an optional `then` may follow an `if` condition. The words `struct` and `include` are reserved but no longer valid: use `class` and `import`.', 'Compatibility'),
    D.warn('`list` and `map` are type keywords, so they cannot be used as variable names. Name a list variable `items` or `rows` instead.')
  ]
});

Docs.page({
  project: 'hasm', section: 'language', id: 'types', order: 2, title: 'Types and conversions',
  summary: 'The built-in types, null, collections and how values convert.',
  blocks: [
    D.h2('Built-in types'),
    D.table(['Type', 'Description'], [
      ['`int`', '32-bit signed integer.'],
      ['`long`', '64-bit signed integer. Literals end with `L`.'],
      ['`float`', '32-bit floating point. Literals end with `f`.'],
      ['`double`', '64-bit floating point; the type of a literal such as `2.5`.'],
      ['`bool`', '`true` or `false`. Conditions must be `bool`.'],
      ['`string`', 'Immutable text. `+` concatenates, `s[i]` yields the one-character string at an index.'],
      ['`bytes`', 'Fixed-size mutable byte buffer; `b[i]` reads and writes values `0..255`. See [Bytes](doc:std-bytes).'],
      ['`list<T>`', 'Growable ordered collection.'],
      ['`map<K,V>`', 'Insertion-ordered hash map.'],
      ['`any`', 'Holds a value of any type; assigning it to a typed variable converts implicitly.'],
      ['`void`', 'Return type of functions that return nothing.']
    ]),
    D.h2('Declaring variables'),
    D.code('hasm', `
      int count = 0
      float ratio = 0.5f
      string title = "demo"
      list<int> xs = [5, 3, 9]
      map<string,int> ages = {"ann": 30, "bob": 25}
      list<list<int>> grid = [[1, 2], [3, 4]]`),
    D.h2('Numeric widening and narrowing'),
    D.p('Smaller numeric types widen implicitly: an `int` can be used where a `long`, `float` or `double` is expected, and a `float` where a `double` is expected. Going the other way loses information and must be written as a cast.'),
    D.code('hasm', `
      float f = 3          // int widens to float
      long l = 7
      int i = (int) 3.9    // 3: narrowing needs a cast
      double d = (double) i`),
    D.note('The compiler rejects `int n = someDouble` with: "narrowing needs an explicit cast: (int) value".'),
    D.h2('Casts'),
    D.p('`(type) expression` converts between numbers, and between strings and numbers. A cast that cannot succeed throws a catchable runtime error.'),
    D.code('hasm', `
      (int) 3.9        // 3
      (float) 3        // 3.0
      (int) "42"       // 42
      (string) 7       // "7"
      (long) 5
      (int) "abc"      // runtime error: see Errors`),
    D.h2('null'),
    D.p('Every reference type (string, bytes, list, map, class and interface types) can be `null`. Calling a method or reading a field through `null` raises a runtime error you can catch. Reading a missing map key yields `null`.'),
    D.h2('Equality'),
    D.p('`==` and `!=` compare numbers by value across numeric types (`1 == 1.0` is `true`), strings by content and `bytes` by content. Objects compare by identity.'),
    D.h2('Typed collections'),
    D.p('`list<T>` and `map<K,V>` carry their element types, so `xs[i]` has type `T` and `for int x : xs` is checked. Functions that accept any collection take `list<any>` or `map<any,any>`.')
  ]
});

Docs.page({
  project: 'hasm', section: 'language', id: 'operators', order: 3, title: 'Expressions and operators',
  summary: 'Arithmetic, comparison, logic, bitwise operators, assignment and the conditional expression.',
  blocks: [
    D.table(['Group', 'Operators', 'Notes'], [
      ['Arithmetic', '`+ - * / %`', '`+` also joins strings and converts the other operand: `"n=" + 5`.'],
      ['Unary', '`-x  !b`', 'Negation and logical not.'],
      ['Comparison', '`== != < <= > >=`', 'Result is `bool`.'],
      ['Logical', '`&&  ||`', 'Short-circuit; operands must be `bool`.'],
      ['Bitwise', '`&  |  ^  <<  >>`', 'On integers.'],
      ['Conditional', '`cond ? a : b`', 'Right associative; branches must have compatible types.'],
      ['Assignment', '`=  +=  -=  *=  /=  %=`', 'Targets are variables, fields and indexed elements.'],
      ['Step', '`i++  i--`', 'Statement form for integers.'],
      ['Cast', '`(type) value`', 'See [Types](doc:types).']
    ]),
    D.code('hasm', `
      int a = 0xFF
      a += 5  a -= 1  a *= 2  a /= 4  a %= 100
      int bits = (6 & 3) + (6 | 3) + (6 ^ 3) + (1 << 4) + (256 >> 2)
      string sign = a < 0 ? "negative" : (a == 0 ? "zero" : "positive")`),
    D.h2('Mixed arithmetic'),
    D.p('When the operands differ, the result takes the wider type: `int + long` is `long`, `int * float` is `float`, `float + double` is `double`. Integer division truncates (`7 / 2` is `3`); an integer division by zero is a catchable runtime error.'),
    D.h2('Indexing'),
    D.p('`xs[i]` on lists, strings and bytes; `m[key]` on maps. Assigning through an index changes the collection: `ages["cy"] = 41`, `grid[1][0] = 9`. An index outside a list is a runtime error.'),
    D.h2('Calling and members'),
    D.p('`f(x)` calls a function, `obj.method(x)` a method, `Type.method(x)` a static method, `Module.func(x)` a function of an imported module and `Api.method(x)` a method of a Java API class declared with `usingapi`. Fields are read and written with `obj.field`.')
  ]
});

Docs.page({
  project: 'hasm', section: 'language', id: 'control-flow', order: 4, title: 'Control flow',
  summary: 'Conditions, loops, switch, break and continue.',
  blocks: [
    D.h2('if'),
    D.code('hasm', `
      int a = 42
      if a > 1000 { Stdio.println("big") }
      else if a > 5 { Stdio.println("medium") }
      else { Stdio.println("small") }`),
    D.p('The condition must be of type `bool`; otherwise the compiler reports "\'if\' condition must be a \'bool\'". There are no parentheses around the condition, and the braces are required.'),
    D.h2('while and for'),
    D.code('hasm', `
      int i = 0
      while i < 3 { i++ }

      for int j = 0; j < 5; j++ {
          if j == 2 { continue }
          if j == 4 { break }
      }`),
    D.h2('for-each'),
    D.p('`for T x : collection` iterates a list, the characters of a string, the keys of a map (insertion order) or the elements of a `bytes` buffer.'),
    D.code('hasm', `
      map<string, int> ages = {"ann": 31, "bob": 27}
      bytes buffer = Bytes.alloc(4)
      int total = 0

      for string name : ["ann", "bob"] { Stdio.println(name) }
      for string ch : "abc" { Stdio.print(ch + ",") }
      for string key : ages { Stdio.println(key + " -> " + ages[key]) }
      for int byte : buffer { total += byte }`),
    D.h2('switch'),
    D.p('`switch` compares one value against several `case` values. A case may list several values separated by commas; `default` handles the rest. Cases do not fall through, and a repeated case value is a compile error.'),
    D.code('hasm', `
      enum Color { RED, GREEN, BLUE }

      @entry
      func void main() {
          string cmd = "go"
          Color color = Color.GREEN

          switch cmd {
              case "go"   { Stdio.println("going") }
              case "stop" { Stdio.println("stopping") }
              default     { Stdio.println("unknown") }
          }

          switch color {
              case Color.RED { Stdio.println("red") }
              case Color.GREEN, Color.BLUE { Stdio.println("green or blue") }
          }
      }`),
    D.h2('break and continue'),
    D.p('Both apply to the innermost loop. Using `break` or `continue` outside a loop is a compile error. They also work from inside a `try` block: the handler is removed correctly.')
  ]
});
